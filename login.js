class UserManager {
    static login(username) {
        if (!username.trim()) {
            throw new Error('Username cannot be empty');
        }
        
        localStorage.setItem('currentUser', username);
        const user = new QuizUser(username);
        return user;
    }

    static logout() {
        localStorage.removeItem('currentUser');
    }

    static getCurrentUser() {
        const username = localStorage.getItem('currentUser');
        return username ? new QuizUser(username) : null;
    }
} 