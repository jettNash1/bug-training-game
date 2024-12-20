import config from './config.js';
import UserManager from './login.js';

// Add this function to check authentication status
async function checkAuth() {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('currentUser');
    
    // If we're on the login page and user is authenticated, redirect to index
    if (window.location.pathname.includes('login.html') && token && currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // If we're on any other page and user is not authenticated, redirect to login
    if (!window.location.pathname.includes('login.html') && (!token || !currentUser)) {
        window.location.href = 'login.html';
        return;
    }

    // Verify token validity
    if (token && currentUser) {
        try {
            const response = await fetch(`${config.apiUrl}/users/verify-token`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Token is invalid, try to refresh
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const refreshResponse = await fetch(`${config.apiUrl}/users/refresh-token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken })
                    });
                    
                    if (refreshResponse.ok) {
                        const { token: newToken } = await refreshResponse.json();
                        localStorage.setItem('token', newToken);
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
            updateHeader(currentUser);
        } catch (error) {
            console.error('Auth check failed:', error);
            handleLogout();
        }
    }
}

// Handle login
async function handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await UserManager.login(username, password);
        window.location.href = 'index.html';
    } catch (error) {
        showError(error.message);
    }
}

// Handle register
async function handleRegister() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        await UserManager.register(username, password);
        window.location.href = 'index.html';
    } catch (error) {
        showError(error.message);
    }
}

// Update the logout handler
async function handleLogout() {
    try {
        await UserManager.logout();
    } catch (error) {
        console.error('Logout error:', error);
        // Clear everything anyway
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// Add event listener to check auth status on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only check auth if we're not already on the login page to prevent loops
    if (!window.location.pathname.includes('login.html')) {
        checkAuth();
    }

    // Tab switching (only on login page)
    if (window.location.pathname.includes('login.html')) {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetForm = tab.dataset.tab;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show correct form
                forms.forEach(form => {
                    form.classList.add('hidden');
                    if (form.id === `${targetForm}Form`) {
                        form.classList.remove('hidden');
                    }
                });
            });
        });
    }
});

// Add a nicer error notification system
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Update header with user info
function updateHeader(username) {
    const headerUsername = document.getElementById('headerUsername');
    if (headerUsername) {
        headerUsername.textContent = username;
    }
}

// Make functions available globally
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
 