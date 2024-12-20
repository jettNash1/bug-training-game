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
        path: window.location.pathname,
        tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
    });
    
    // If we're on the login page and user is authenticated, redirect to index
    if (window.location.pathname.includes('login.html') && token && username) {
        console.log('On login page with valid credentials, redirecting to index');
        window.location.href = '/';
        return;
    }
    
    // If we're on any other page and user is not authenticated, redirect to login
    if (!window.location.pathname.includes('login.html') && (!token || !username)) {
        console.log('Not authenticated, redirecting to login');
        window.location.href = '/login.html';
        return;
    }

    // Verify token validity
    if (token && username) {
        try {
            console.log('Verifying token at:', `${config.apiUrl}/users/verify-token`);
            const response = await fetch(`${config.apiUrl}/users/verify-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Verification response:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            const text = await response.text();
            console.log('Token verification response text:', text);

            let data;
            try {
                data = JSON.parse(text);
                console.log('Parsed verification data:', data);
            } catch (e) {
                console.error('Failed to parse token verification response:', e);
                handleLogout();
                return;
            }

            if (!response.ok || !data.valid) {
                console.log('Token invalid or expired, attempting refresh...');
                const refreshToken = getRefreshToken();
                if (refreshToken) {
                    console.log('Attempting token refresh...');
                    const refreshResponse = await fetch(`${config.apiUrl}/users/refresh-token`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ refreshToken })
                    });
                    
                    console.log('Refresh response:', {
                        status: refreshResponse.status,
                        statusText: refreshResponse.statusText
                    });

                    const refreshText = await refreshResponse.text();
                    console.log('Token refresh response text:', refreshText);

                    let refreshData;
                    try {
                        refreshData = JSON.parse(refreshText);
                        console.log('Parsed refresh data:', refreshData);
                    } catch (e) {
                        console.error('Failed to parse token refresh response:', e);
                        handleLogout();
                        return;
                    }

                    if (refreshResponse.ok && refreshData.token) {
                        console.log('Token refreshed successfully');
                        setAuthToken(refreshData.token);
                        // Don't redirect, just update the token
                        return true;
                    } else {
                        console.log('Token refresh failed');
                        handleLogout();
                        return false;
                    }
                } else {
                    console.log('No refresh token available');
                    handleLogout();
                    return false;
                }
            }
            
            // If we get here, token is valid
            console.log('Auth check successful');
            updateHeader(username);
            return true;
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
document.addEventListener('DOMContentLoaded', async () => {
    // Only check auth if we're not already on the login page to prevent loops
    if (!window.location.pathname.includes('login.html')) {
        console.log('Checking auth on page load');
        try {
            const isAuthenticated = await checkAuth();
            console.log('Auth check result:', isAuthenticated);
            if (!isAuthenticated) {
                console.log('Not authenticated, redirecting to login');
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Auth check error:', error);
            window.location.href = '/login.html';
        }
    }
});
 