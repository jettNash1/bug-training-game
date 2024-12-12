class UserManager {
    static async login(username, password) {
        if (!username.trim() || !password.trim()) {
            throw new Error('Username and password are required');
        }

        try {
            const response = await fetch('http://localhost:3000/api/users/login', {
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
            const response = await fetch('http://localhost:3000/api/users/register', {
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
        window.location.reload();
    }
} 