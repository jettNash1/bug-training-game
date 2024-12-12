class APIService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('token');
    }

    async saveQuizResult(quizData) {
        try {
            const response = await fetch(`${this.baseURL}/users/quiz-results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(quizData)
            });

            if (!response.ok) {
                throw new Error('Failed to save quiz results');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Fallback to localStorage
            return this.saveToLocalStorage(quizData);
        }
    }

    saveToLocalStorage(quizData) {
        const key = `quizUser_${quizData.username}_${quizData.quizName}`;
        localStorage.setItem(key, JSON.stringify(quizData));
        return { success: true, data: quizData };
    }
}

window.apiService = new APIService(); 