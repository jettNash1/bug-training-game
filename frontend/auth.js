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
            const response = await fetch(`${config.apiUrl}/users/verify-token`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Token is invalid, try to refresh
                const refreshToken = getRefreshToken();
                if (refreshToken) {
                    const refreshResponse = await fetch(`${config.apiUrl}/users/refresh-token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken })
                    });
                    
                    if (refreshResponse.ok) {
                        const { token: newToken } = await refreshResponse.json();
                        setAuthToken(newToken);
                    } else {
                        // Refresh failed, redirect to login
                        handleLogout();
                        return;
                    }
                } else {
                    // No refresh token, redirect to login
                    handleLogout();
                    return;
                }
            }
            
            // If we get here, token is valid
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
 