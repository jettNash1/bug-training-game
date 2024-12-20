import config from './config.js';

class UserManager {
    static async login(username, password) {
        if (!username.trim() || !password.trim()) {
            throw new Error('Username and password are required');
        }

        try {
            const response = await fetch(`${config.apiUrl}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('currentUser', username);

            const user = new QuizUser(username);
            await user.loadUserData();
            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Failed to login');
        }
    }

    static async register(username, password) {
        if (!username.trim() || !password.trim()) {
            throw new Error('Username and password are required');
        }

        try {
            const response = await fetch(`${config.apiUrl}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('currentUser', username);

            const user = new QuizUser(username);
            await user.loadUserData();
            return user;
        } catch (error) {
            console.error('Registration error:', error);
            throw new Error(error.message || 'Failed to register');
        }
    }

    static logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = 'login.html';
    }
}

window.UserManager = UserManager;

export default UserManager; 