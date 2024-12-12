// admin.js
class AdminManager {
    constructor() {
        // Admin credentials - in a real app, these would be stored securely
        this.adminCredentials = {
            username: 'admin',
            password: 'admin123' // In production, use proper password hashing
        };
        console.log('AdminManager initialized'); // Debug log
    }

    login(username, password) {
        if (username === this.adminCredentials.username && 
            password === this.adminCredentials.password) {
            localStorage.setItem('adminLoggedIn', 'true');
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem('adminLoggedIn');
    }

    isLoggedIn() {
        return localStorage.getItem('adminLoggedIn') === 'true';
    }

    getAllUsers() {
        const users = [];
        console.log('Total localStorage items:', localStorage.length); // Debug log
        
        // Log all localStorage keys for debugging
        for (let i = 0; i < localStorage.length; i++) {
            console.log('localStorage key:', localStorage.key(i));
        }

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('quizUser_')) {
                try {
                    const userData = JSON.parse(localStorage.getItem(key));
                    users.push(userData);
                    console.log('Found user:', userData); // Debug log
                } catch (error) {
                    console.error('Error parsing user data for key:', key, error);
                }
            }
        }
        console.log('Retrieved users:', users); // Debug log
        return users;
    }

    getUserProgress(username) {
        const userData = localStorage.getItem(`quizUser_${username}`);
        return userData ? JSON.parse(userData) : null;
    }
}