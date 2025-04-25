import { config } from './config.js';

// Add this at the top with other imports
const ADMIN_PATHS = ['/pages/admin-login.html', '/pages/admin.html', '/pages/admin2.html'];

// Token management functions
export const getAuthToken = () => localStorage.getItem('token');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const setRefreshToken = (token) => localStorage.setItem('refreshToken', token);
export const clearTokens = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
};

// Add admin token management functions
export const getAdminToken = () => localStorage.getItem('adminToken');
export const setAdminToken = (token) => localStorage.setItem('adminToken', token);
export const clearAdminToken = () => localStorage.removeItem('adminToken');

// Auth check function
export async function checkAuth() {
    const currentPath = window.location.pathname;
    
    // Handle admin authentication
    if (ADMIN_PATHS.some(path => currentPath.includes(path))) {
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
        if ((currentPath.includes('admin.html') || currentPath.includes('admin2.html')) && !adminToken) {
            window.location.replace('/pages/admin-login.html');
            return false;
        }
        
        // If on admin panel, verify token
        if ((currentPath.includes('admin.html') || currentPath.includes('admin2.html')) && adminToken) {
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
        return currentPath.includes('admin-login.html');
    }

    // Handle regular user authentication
    const token = getAuthToken();
    const username = localStorage.getItem('username');
    const refreshToken = getRefreshToken();
    
    console.log('Checking auth:', { 
        hasToken: !!token, 
        hasUsername: !!username,
        hasRefreshToken: !!refreshToken,
        path: window.location.pathname
    });

    // If we're on the login page and user is authenticated, redirect to index
    if (window.location.pathname.includes('login.html') && token && username) {
        console.log('On login page with valid credentials, redirecting to index');
        window.location.replace('/');
        return true;
    }
    
    // If we're on any other page and user is not authenticated, redirect to login
    if (!window.location.pathname.includes('login.html') && (!token || !username)) {
        console.log('Not authenticated, redirecting to login');
        window.location.replace('/login.html');
        return false;
    }

    // Skip token verification on login page
    if (window.location.pathname.includes('login.html')) {
        console.log('On login page, skipping token verification');
        return false;
    }

    // Verify token validity
    if (token && username) {
        try {
            console.log('Verifying token...');
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
                console.log('Token verification failed, status:', response.status);
                
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
                    console.log('Coming from login page, assuming token is valid');
                    updateHeader(username);
                    return true;
                }

                // Otherwise clear tokens and redirect
                clearTokens();
                window.location.replace('/login.html');
                return false;
            }

            const data = await response.json();
            console.log('Token verification response:', data);

            if (data.success && data.valid) {
                console.log('Token verified successfully');
                updateHeader(username);
                return true;
            }

            // If verification failed but we're coming from login, give it one chance
            if (document.referrer.includes('login.html')) {
                console.log('Coming from login page, assuming token is valid');
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
                console.log('Coming from login page, assuming token is valid');
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
    console.log('Handling logout...');
    // Clear tokens first
    clearTokens();
    
    // Only redirect if we're not already on the login page
    if (!window.location.pathname.includes('login.html')) {
        console.log('Redirecting to login page...');
        // Use replace instead of href to prevent back button issues
        window.location.replace('/login.html');
    } else {
        console.log('Already on login page, no redirect needed');
    }
}

// Update header with user info
function updateHeader(username) {
    const headerUsername = document.getElementById('headerUsername');
    if (headerUsername) {
        headerUsername.textContent = username;
    }
}

// Add event listener to check auth status on page load
let authCheckInProgress = false;

document.addEventListener('DOMContentLoaded', () => {
    // Skip auth check on login pages and admin pages
    if (window.location.pathname.includes('login.html') || 
        ADMIN_PATHS.some(path => window.location.pathname.includes(path))) {
        console.log('On login or admin page, skipping initial auth check');
        return;
    }

    // Prevent multiple simultaneous auth checks
    if (authCheckInProgress) {
        console.log('Auth check already in progress');
        return;
    }

    authCheckInProgress = true;
    console.log('Starting auth check...');

    checkAuth()
        .then(isAuthenticated => {
            console.log('Auth check completed:', { isAuthenticated });
            if (!isAuthenticated && !window.location.pathname.includes('login.html')) {
                console.log('Not authenticated, redirecting to login');
                window.location.replace('/login.html');
            }
        })
        .catch(error => {
            console.error('Auth check error:', error);
            // On the first load after login, don't redirect
            if (!document.referrer.includes('login.html') && !window.location.pathname.includes('login.html')) {
                window.location.replace('/login.html');
            }
        })
        .finally(() => {
            authCheckInProgress = false;
        });
});
 