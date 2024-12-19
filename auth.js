// Add this function to check authentication status
function checkAuth() {
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

    // If user is authenticated, update the header
    if (token && currentUser) {
        updateHeader(currentUser);
    }
}

// Add this function to update the header with user info
function updateHeader(username) {
    const headerUsername = document.getElementById('headerUsername');
    if (headerUsername) {
        headerUsername.textContent = username;
    }
}

// Update the logout handler
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
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

// Handle login
async function handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // For demo purposes, accept any non-empty username/password
        if (username && password) {
            const user = {
                username: username,
                lastActive: new Date().toISOString(),
                quizResults: []
            };
            localStorage.setItem(`user_${username}`, JSON.stringify(user));
            localStorage.setItem('currentUser', username);
            localStorage.setItem('token', 'demo_token'); // Add a demo token
            window.location.href = 'index.html';
        } else {
            throw new Error('Please enter username and password');
        }
    } catch (error) {
        showError(error.message);
    }
}

// Handle register
async function handleRegister() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        if (username && password) {
            const user = {
                username: username,
                lastActive: new Date().toISOString(),
                quizResults: []
            };
            localStorage.setItem(`user_${username}`, JSON.stringify(user));
            localStorage.setItem('currentUser', username);
            localStorage.setItem('token', 'demo_token'); // Add a demo token
            window.location.href = 'index.html';
        } else {
            throw new Error('Please enter username and password');
        }
    } catch (error) {
        showError(error.message);
    }
}

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

// Update user's last active timestamp
function updateUserActivity(username) {
    const userKey = `user_${username}`;
    const userData = localStorage.getItem(userKey);
    if (userData) {
        const user = JSON.parse(userData);
        user.lastActive = new Date().toISOString();
        localStorage.setItem(userKey, JSON.stringify(user));
    }
}
 