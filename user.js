class QuizUser {
    constructor(username) {
        this.username = username;
        this.quizResults = {};
        this.loadUserData();
        console.log('QuizUser initialized:', this);
    }

    loadUserData() {
        const savedData = localStorage.getItem(`quizUser_${this.username}`);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            this.quizResults = parsedData.quizResults;
        }
        console.log('Loaded user data:', this.quizResults);
    }

    saveUserData() {
        const userData = {
            username: this.username,
            quizResults: this.quizResults,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(`quizUser_${this.username}`, JSON.stringify(userData));
        console.log('Saved user data:', userData);
    }

    updateQuizScore(quizName, score) {
        this.quizResults[quizName] = {
            completed: true,
            score: score,
            completedAt: new Date().toISOString()
        };
        this.saveUserData();
        console.log('Updated quiz score:', quizName, score);
    }

    getQuizScore(quizName) {
        return this.quizResults[quizName] || null;
    }

    getAllQuizResults() {
        return this.quizResults;
    }

    getCompletedQuizzes() {
        return Object.keys(this.quizResults);
    }

    getAverageScore() {
        const scores = Object.values(this.quizResults).map(result => result.score);
        if (scores.length === 0) return 0;
        return scores.reduce((a, b) => a + b, 0) / scores.length;
    }
} 