import { config } from './config.js';

// Add this at the top with other imports
const ADMIN_PATHS = ['/pages/admin-login.html', '/pages/admin2.html'];

// Authentication state management
let authState = {
    checked: false,
    isAuthenticated: false,
    checkInProgress: false,
    lastCheckTime: 0,
    cacheValidDuration: 5 * 60 * 1000 // 5 minutes cache
};

// Token management functions
export const getAuthToken = () => localStorage.getItem('token');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const setRefreshToken = (token) => localStorage.setItem('refreshToken', token);
export const clearTokens = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    // Reset auth state when tokens are cleared
    resetAuthState();
};

// Add admin token management functions
export const getAdminToken = () => localStorage.getItem('adminToken');
export const setAdminToken = (token) => localStorage.setItem('adminToken', token);
export const clearAdminToken = () => localStorage.removeItem('adminToken');

// Reset authentication state
function resetAuthState() {
    authState = {
        checked: false,
        isAuthenticated: false,
        checkInProgress: false,
        lastCheckTime: 0,
        cacheValidDuration: 5 * 60 * 1000
    };
}

// Check if cached auth state is still valid
function isCacheValid() {
    const now = Date.now();
    return authState.checked && 
           authState.lastCheckTime > 0 && 
           (now - authState.lastCheckTime) < authState.cacheValidDuration;
}

// Auth check function with caching
export async function checkAuth(forceCheck = false) {
    // Return cached result if valid and not forcing a check
    if (!forceCheck && isCacheValid()) {
        // console.log('Using cached auth state:', authState.isAuthenticated);
        return authState.isAuthenticated;
    }

    // Prevent multiple simultaneous checks
    if (authState.checkInProgress) {
        // console.log('Auth check already in progress, waiting...');
        // Wait for the in-progress check to complete
        while (authState.checkInProgress) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return authState.isAuthenticated;
    }

    authState.checkInProgress = true;
    
    try {
        const currentPath = window.location.pathname;
        
        // Handle admin authentication
        if (ADMIN_PATHS.some(path => currentPath.includes(path))) {
            const result = await checkAdminAuth(currentPath);
            updateAuthState(result);
            return result;
        }

        // Handle regular user authentication
        const result = await checkUserAuth();
        updateAuthState(result);
        return result;
        
    } finally {
        authState.checkInProgress = false;
    }
}

// Update auth state cache
function updateAuthState(isAuthenticated) {
    authState.checked = true;
    authState.isAuthenticated = isAuthenticated;
    authState.lastCheckTime = Date.now();
}

// Admin authentication logic
async function checkAdminAuth(currentPath) {
    const adminToken = getAdminToken();
    
    // If on admin login page and has valid token, redirect to admin panel
    if (currentPath.includes('admin-login.html') && adminToken) {
        // Special handling for mock admin token
        if (adminToken.startsWith('admin:')) {
            const timestamp = parseInt(adminToken.split(':')[1]);
            const now = Date.now();
            // Token is valid for 24 hours
            if ((now - timestamp) < 24 * 60 * 60 * 1000) {
                window.location.replace('/pages/admin2.html');
                return true;
            }
            clearAdminToken();
            return false;
        }
        
        try {
            const response = await fetch(`${config.apiUrl}/admin/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.isAdmin) {
                    window.location.replace('/pages/admin2.html');
                    return true;
                }
            }
            
            // If verification fails, clear token and stay on login page
            clearAdminToken();
            return false;
        } catch (error) {
            console.error('Admin token verification failed:', error);
            clearAdminToken();
            return false;
        }
    }
    
    // If on admin panel and no token, redirect to admin login
    if (currentPath.includes('admin2.html') && !adminToken) {
        window.location.replace('/pages/admin-login.html');
        return false;
    }
    
    // If on admin panel, verify token
    if (currentPath.includes('admin2.html') && adminToken) {
        try {
            const response = await fetch(`${config.apiUrl}/admin/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok || !(await response.json()).isAdmin) {
                clearAdminToken();
                window.location.replace('/pages/admin-login.html');
                return false;
            }
        } catch (error) {
            console.error('Admin token verification failed:', error);
            clearAdminToken();
            window.location.replace('/pages/admin-login.html');
            return false;
        }
    }
    
    // Allow access to admin login page without token
    if (currentPath.includes('admin-login.html')) {
        // console.log('On admin login page, allowing access');
        return true;
    }
    
    return false;
}

// User authentication logic
async function checkUserAuth() {
    const token = getAuthToken();
    const username = localStorage.getItem('username');
    const refreshToken = getRefreshToken();
    
    // console.log('Checking user auth:', { 
    //     hasToken: !!token, 
    //     hasUsername: !!username,
    //     hasRefreshToken: !!refreshToken,
    //     path: window.location.pathname
    // });

    // If we're on the login page and user is authenticated, redirect to index
    if (window.location.pathname.includes('login.html') && token && username) {
        // console.log('On login page with valid credentials, redirecting to index');
        window.location.replace('/');
        return true;
    }
    
    // If we're on any other page and user is not authenticated, redirect to login
    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('admin-login.html') && 
        (!token || !username)) {
        // console.log('Not authenticated, redirecting to login');
        window.location.replace('/login.html');
        return false;
    }

    // Skip token verification on login page
    if (window.location.pathname.includes('login.html')) {
        // console.log('On login page, skipping token verification');
        return false;
    }

    // Verify token validity
    if (token && username) {
        try {
            // console.log('Verifying token...');
            const response = await fetch(`${config.apiUrl}/users/verify-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            // Handle network errors
            if (!response.ok) {
                // console.log('Token verification failed, status:', response.status);
                
                // Try to refresh token if available
                if (refreshToken) {
                    try {
                        const refreshResponse = await fetch(`${config.apiUrl}/users/refresh-token`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include',
                            body: JSON.stringify({ refreshToken })
                        });

                        if (refreshResponse.ok) {
                            const refreshData = await refreshResponse.json();
                            if (refreshData.token) {
                                setAuthToken(refreshData.token);
                                updateHeader(username);
                                return true;
                            }
                        }
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                    }
                }

                // If we're coming from login, give it one chance
                if (document.referrer.includes('login.html')) {
                    // console.log('Coming from login page, assuming token is valid');
                    updateHeader(username);
                    return true;
                }

                // Otherwise clear tokens and redirect
                clearTokens();
                window.location.replace('/login.html');
                return false;
            }

            const data = await response.json();
            // console.log('Token verification response:', data);

            if (data.success && data.valid) {
                // console.log('Token verified successfully');
                updateHeader(username);
                return true;
            }

            // If verification failed but we're coming from login, give it one chance
            if (document.referrer.includes('login.html')) {
                // console.log('Coming from login page, assuming token is valid');
                updateHeader(username);
                return true;
            }

            // Otherwise clear tokens and redirect
            clearTokens();
            window.location.replace('/login.html');
            return false;
        } catch (error) {
            console.error('Auth check failed:', error);
            
            // If we're coming from login, give it one chance
            if (document.referrer.includes('login.html')) {
                // console.log('Coming from login page, assuming token is valid');
                updateHeader(username);
                return true;
            }
            
            clearTokens();
            window.location.replace('/login.html');
            return false;
        }
    }
    return false;
}

// Logout handler
export function handleLogout() {
    // console.log('Handling logout...');
    // Clear tokens first
    clearTokens();
    
    // Only redirect if we're not already on the login page
    if (!window.location.pathname.includes('login.html')) {
        // console.log('Redirecting to login page...');
        // Use replace instead of href to prevent back button issues
        window.location.replace('/login.html');
    } else {
        // console.log('Already on login page, no redirect needed');
    }
}

// Update header with user info
function updateHeader(username) {
    const headerUsername = document.getElementById('headerUsername');
    if (headerUsername) {
        headerUsername.textContent = username;
    }
}

// Initialize auth check on page load (only if no other auth check is happening)
document.addEventListener('DOMContentLoaded', () => {
    // Skip auth check on login pages and admin pages - let specific pages handle their own auth
    if (window.location.pathname.includes('login.html') || 
        ADMIN_PATHS.some(path => window.location.pathname.includes(path))) {
        // console.log('On login or admin page, skipping automatic auth check');
        return;
    }

    // For regular pages, only do a quick check if we don't have basic auth info
    const token = getAuthToken();
    const username = localStorage.getItem('username');
    
    if (!token || !username) {
        // console.log('No basic auth info found, redirecting to login');
        window.location.replace('/login.html');
        return;
    }
    
    // Let the specific page (like index.js) handle the full auth check
    // This prevents duplicate auth checks
    // console.log('Basic auth info present, letting page handle detailed auth check');
});

// Export a function to force refresh auth state (useful after login)
export function refreshAuthState() {
    resetAuthState();
}
 