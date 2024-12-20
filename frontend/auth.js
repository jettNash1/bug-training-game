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
    
    console.log('Checking auth:', { hasToken: !!token, hasUsername: !!username, path: window.location.pathname });
    
    // If we're on the login page and user is authenticated, redirect to index
    if (window.location.pathname.includes('login.html') && token && username) {
        window.location.href = '/';
        return;
    }
    
    // If we're on any other page and user is not authenticated, redirect to login
    if (!window.location.pathname.includes('login.html') && (!token || !username)) {
        window.location.href = '/login.html';
        return;
    }

    // Verify token validity
    if (token && username) {
        try {
            console.log('Verifying token...');
            const response = await fetch(`${config.apiUrl}/users/verify-token`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const text = await response.text();
            console.log('Token verification response:', text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse token verification response:', e);
                handleLogout();
                return;
            }

            if (!response.ok || !data.valid) {
                console.log('Token invalid, attempting refresh...');
                // Token is invalid, try to refresh
                const refreshToken = getRefreshToken();
                if (refreshToken) {
                    const refreshResponse = await fetch(`${config.apiUrl}/users/refresh-token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken })
                    });
                    
                    const refreshText = await refreshResponse.text();
                    console.log('Token refresh response:', refreshText);

                    let refreshData;
                    try {
                        refreshData = JSON.parse(refreshText);
                    } catch (e) {
                        console.error('Failed to parse token refresh response:', e);
                        handleLogout();
                        return;
                    }

                    if (refreshResponse.ok && refreshData.token) {
                        console.log('Token refreshed successfully');
                        setAuthToken(refreshData.token);
                    } else {
                        console.log('Token refresh failed');
                        handleLogout();
                        return;
                    }
                } else {
                    console.log('No refresh token available');
                    handleLogout();
                    return;
                }
            }
            
            // If we get here, token is valid
            console.log('Auth check successful');
            updateHeader(username);
        } catch (error) {
            console.error('Auth check failed:', error);
            handleLogout();
        }
    }
}

// Logout handler
export function handleLogout() {
    clearTokens();
    window.location.href = '/login.html';
}

// Update header with user info
function updateHeader(username) {
    const headerUsername = document.getElementById('headerUsername');
    if (headerUsername) {
        headerUsername.textContent = username;
    }
}

// Add event listener to check auth status on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only check auth if we're not already on the login page to prevent loops
    if (!window.location.pathname.includes('login.html')) {
        checkAuth();
    }
});
 