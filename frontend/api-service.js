class APIService {
    constructor() {
        this.baseURL = '/api';
        this.token = localStorage.getItem('token');
        this.adminToken = localStorage.getItem('adminToken');
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

    // Admin methods
    async post(endpoint, data) {
        try {
            console.log(`Making POST request to ${this.baseURL}${endpoint}`, { data });
            const response = await fetch(this.baseURL + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.adminToken}`
                },
                body: JSON.stringify(data)
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
            }

            if (!responseText) {
                throw new Error('Empty response from server');
            }

            try {
                return JSON.parse(responseText);
            } catch (e) {
                console.error('JSON parse error:', e);
                throw new Error(`Invalid JSON response: ${responseText}`);
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async get(endpoint) {
        try {
            const response = await fetch(this.baseURL + endpoint, {
                headers: {
                    'Authorization': `Bearer ${this.adminToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async saveQuizProgress(quizName, progress) {
        try {
            const response = await fetch(`${this.baseURL}/users/quiz-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    quizName,
                    progress
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to save quiz progress');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to save quiz progress');
            }

            return data;
        } catch (error) {
            console.error('Failed to save quiz progress:', error);
            throw error;
        }
    }

    async getQuizProgress(quizName) {
        try {
            const response = await fetch(`${this.baseURL}/users/quiz-progress/${quizName}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to get quiz progress');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to get quiz progress');
            }

            return data;
        } catch (error) {
            console.error('Failed to get quiz progress:', error);
            throw error;
        }
    }
}

// Make APIService available globally
window.APIService = APIService; 