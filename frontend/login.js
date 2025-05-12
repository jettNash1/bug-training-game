import { APIService } from './api-service.js';
import { setAuthToken, setRefreshToken } from './auth.js';

const api = new APIService();

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

// Constants for validation
const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 6;

// Only run initialization if we're on the login page
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the login page
    if (!window.location.pathname.includes('login.html')) {
        return;
    }

    /* Tab switching
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
    });*/

    // Add password visibility toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const icon = toggle.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Handle login
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', async () => {
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            if (!username || !password) {
                showError('Please enter both username and password');
                return;
            }

            // Add length validation
            if (username.length < MIN_USERNAME_LENGTH) {
                showError(`Username must be at least ${MIN_USERNAME_LENGTH} characters long`);
                return;
            }

            if (password.length < MIN_PASSWORD_LENGTH) {
                showError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
                return;
            }

            try {
                const response = await api.login(username, password);
                console.log('Login response:', response);
                
                if (response.success && response.token) {
                    console.log('Login successful, storing tokens...');
                    // Store tokens first
                    setAuthToken(response.token);
                    setRefreshToken(response.refreshToken);
                    localStorage.setItem('username', username);
                    
                    // Small delay to ensure tokens are stored
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // Sync all quiz progress for legacy users (badges)
                    try {
                        const { QuizUser } = await import('./QuizUser.js');
                        const user = new QuizUser(username);
                        await user.syncAllQuizProgressOnLogin();
                    } catch (syncError) {
                        console.warn('Progress sync on login failed:', syncError);
                    }
                    
                    // Then redirect
                    console.log('Tokens stored, redirecting to index...');
                    window.location.replace('/');
                } else {
                    console.log('Login failed:', response);
                    showError(response.message || 'Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login failed:', error);
                showError('Login failed. Please check your credentials and try again.');
            }
        });
    }

    /* Handle registration
    const registerButton = document.getElementById('registerButton');
    if (registerButton) {
        registerButton.addEventListener('click', async () => {
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;

            if (!username || !password) {
                showError('Please enter both username and password');
                return;
            }

            // Add length validation
            if (username.length < MIN_USERNAME_LENGTH) {
                showError(`Username must be at least ${MIN_USERNAME_LENGTH} characters long`);
                return;
            }

            if (password.length < MIN_PASSWORD_LENGTH) {
                showError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
                return;
            }

            try {
                const response = await api.register(username, password);
                console.log('Registration response:', response);
                
                if (response.success && response.token) {
                    console.log('Registration successful, storing tokens...');
                    // Store tokens first
                    setAuthToken(response.token);
                    setRefreshToken(response.refreshToken);
                    localStorage.setItem('username', username);
                    
                    // Small delay to ensure tokens are stored
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // Then redirect
                    console.log('Tokens stored, redirecting to index...');
                    window.location.replace('/');
                } else {
                    console.log('Registration failed:', response);
                    showError(response.message || 'Registration failed. Please try a different username.');
                }
            } catch (error) {
                console.error('Registration failed:', error);
                showError('Registration failed. Please try a different username.');
            }
        });
    }*/

    // Add enter key support for both forms
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('loginButton').click();
        }
    });

    /*document.getElementById('registerPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('registerButton').click();
        }
    });*/
}); 