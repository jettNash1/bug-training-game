import { config } from './config.js';

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

// Auth check function
export async function checkAuth() {
    const token = getAuthToken();
    const username = localStorage.getItem('username');
    
    console.log('Checking auth:', { 
        hasToken: !!token, 
        hasUsername: !!username, 
        path: window.location.pathname
    });

    // If we're on the login page and user is authenticated, redirect to index
    if (window.location.pathname.includes('login.html') && token && username) {
        console.log('On login page with valid credentials, redirecting to index');
        window.location.href = '/';
        return true;
    }
    
    // If we're on any other page and user is not authenticated, redirect to login
    if (!window.location.pathname.includes('login.html') && (!token || !username)) {
        console.log('Not authenticated, redirecting to login');
        window.location.href = '/login.html';
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
                }
            });

            const data = await response.json();
            console.log('Token verification response:', data);

            if (response.ok && data.valid) {
                console.log('Token verified successfully');
                updateHeader(username);
                return true;
            }

            console.log('Token invalid, attempting refresh...');
            const refreshToken = getRefreshToken();
            if (refreshToken) {
                try {
                    const refreshResponse = await fetch(`${config.apiUrl}/users/refresh-token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken })
                    });

                    const refreshData = await refreshResponse.json();
                    console.log('Token refresh response:', refreshData);

                    if (refreshResponse.ok && refreshData.token) {
                        console.log('Token refreshed successfully');
                        setAuthToken(refreshData.token);
                        return true;
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                }
            }

            // If we get here, authentication failed
            console.log('Authentication failed, logging out');
            handleLogout();
            return false;
        } catch (error) {
            console.error('Auth check failed:', error);
            handleLogout();
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
    // Skip auth check on login page
    if (window.location.pathname.includes('login.html')) {
        console.log('On login page, skipping initial auth check');
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
                window.location.href = '/login.html';
            }
        })
        .catch(error => {
            console.error('Auth check error:', error);
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = '/login.html';
            }
        })
        .finally(() => {
            authCheckInProgress = false;
        });
});
 