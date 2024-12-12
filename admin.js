// admin.js
class AdminManager {
    constructor() {
        this.adminToken = localStorage.getItem('adminToken');
    }

    login(username, password) {
        // For demo purposes, hardcoded admin credentials
        if (username === 'admin' && password === 'admin123') {
            this.adminToken = 'admin_token';
            localStorage.setItem('adminToken', this.adminToken);
            return true;
        }
        return false;
    }

    logout() {
        this.adminToken = null;
        localStorage.removeItem('adminToken');
    }

    isLoggedIn() {
        return !!this.adminToken;
    }

    getAllUsers() {
        // Fetch users from localStorage for now
        const users = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('user_')) {
                try {
                    const userData = JSON.parse(localStorage.getItem(key));
                    // Ensure quizResults is always an array
                    userData.quizResults = Array.isArray(userData.quizResults) ? 
                        userData.quizResults : 
                        Object.entries(userData.quizResults || {}).map(([quizName, data]) => ({
                            quizName,
                            ...data
                        }));
                    users.push(userData);
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
        }
        return users;
    }
}