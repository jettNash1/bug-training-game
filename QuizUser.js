class QuizUser {
    constructor(username) {
        this.username = username;
        this.quizResults = {};
        this.baseUrl = 'http://localhost:3000/api/users';
    }

    async saveQuizResult(quizName, score, answers = []) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${this.baseUrl}/quiz-results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    quizName,
                    score,
                    experience: score,
                    tools: [],
                    questionHistory: answers,
                    completedAt: new Date()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save quiz result');
            }

            const data = await response.json();
            if (data.success) {
                this.quizResults = data.data;
                this.saveToLocalStorage();
                return data;
            } else {
                throw new Error(data.message || 'Failed to save quiz result');
            }
        } catch (error) {
            console.error('Failed to save quiz result:', error);
            this.fallbackToLocalStorage(quizName, score, answers);
            throw error;
        }
    }

    fallbackToLocalStorage(quizName, score, answers) {
        if (!Array.isArray(this.quizResults)) {
            this.quizResults = [];
        }
        this.quizResults.push({
            quizName,
            score,
            completedAt: new Date(),
            answers
        });
        this.saveToLocalStorage();
    }

    async updateQuizScore(quizName, score) {
        try {
            await this.saveQuizResult(quizName, score, []);
            console.log(`Quiz score updated for ${quizName}: ${score}`);
        } catch (error) {
            console.error('Error updating quiz score:', error);
            // Fallback to local storage
            if (!Array.isArray(this.quizResults)) {
                this.quizResults = [];
            }
            this.quizResults.push({
                quizName,
                score,
                completedAt: new Date()
            });
            this.saveToLocalStorage();
        }
    }

    async loadUserData() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.baseUrl}/${this.username}/quiz-results`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load user data');
            }

            const data = await response.json();
            this.quizResults = data.data || [];
            return this.quizResults;
        } catch (error) {
            console.error('Failed to load user data:', error);
            this.loadFromLocalStorage();
            return this.quizResults;
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem(`user_${this.username}`, JSON.stringify({
                username: this.username,
                quizResults: this.quizResults
            }));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const userData = localStorage.getItem(`user_${this.username}`);
            if (userData) {
                const parsed = JSON.parse(userData);
                this.quizResults = parsed.quizResults || [];
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.quizResults = [];
        }
    }
}

// Ensure only one instance is defined
if (!window.QuizUser) {
    window.QuizUser = QuizUser;
} 