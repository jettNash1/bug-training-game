import { APIService } from './api-service.js';
import { setAuthToken, setRefreshToken } from './auth.js';

const api = new APIService();

document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
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

    // Handle login
    document.getElementById('loginButton').addEventListener('click', async () => {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await api.login(username, password);
            if (response.success !== false) {
                setAuthToken(response.token);
                setRefreshToken(response.refreshToken);
                localStorage.setItem('username', username);
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please check your credentials and try again.');
        }
    });

    // Handle registration
    document.getElementById('registerButton').addEventListener('click', async () => {
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await api.register(username, password);
            if (response.success !== false) {
                setAuthToken(response.token);
                setRefreshToken(response.refreshToken);
                localStorage.setItem('username', username);
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Registration failed. Please try a different username.');
        }
    });
}); 