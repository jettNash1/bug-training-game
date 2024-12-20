import config from './config.js';

export class APIService {
    constructor() {
        this.baseURL = config.apiUrl;
        this.token = localStorage.getItem('token');
        this.adminToken = localStorage.getItem('adminToken');
        this.currentUser = localStorage.getItem('currentUser');
    }

    checkAuth() {
        if (!this.token) {
            throw new Error('No authentication token found. Please log in.');
        }
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
            this.checkAuth();
            console.log('Saving progress to:', `${this.baseURL}/users/quiz-progress`);
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
                // Save to localStorage with user-specific key
                const storageKey = `quiz_progress_${this.currentUser}_${quizName}`;
                localStorage.setItem(storageKey, JSON.stringify({
                    progress,
                    timestamp: new Date().toISOString()
                }));
                return { success: true, message: 'Progress saved locally' };
            }

            const data = await response.json();
            // Also save to localStorage as backup with user-specific key
            const storageKey = `quiz_progress_${this.currentUser}_${quizName}`;
            localStorage.setItem(storageKey, JSON.stringify({
                progress,
                timestamp: new Date().toISOString()
            }));
            return data;
        } catch (error) {
            console.error('Failed to save quiz progress:', error);
            // Save to localStorage with user-specific key
            const storageKey = `quiz_progress_${this.currentUser}_${quizName}`;
            localStorage.setItem(storageKey, JSON.stringify({
                progress,
                timestamp: new Date().toISOString()
            }));
            return { success: true, message: 'Progress saved locally' };
        }
    }

    async getQuizProgress(quizName) {
        try {
            this.checkAuth();
            const response = await fetch(`${this.baseURL}/users/quiz-progress/${quizName}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                // Try to get from localStorage with user-specific key
                const storageKey = `quiz_progress_${this.currentUser}_${quizName}`;
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    return { success: true, data: parsed.progress };
                }
                return { success: true, data: null };
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to get quiz progress:', error);
            // Try to get from localStorage with user-specific key
            const storageKey = `quiz_progress_${this.currentUser}_${quizName}`;
            const localData = localStorage.getItem(storageKey);
            if (localData) {
                const parsed = JSON.parse(localData);
                return { success: true, data: parsed.progress };
            }
            return { success: true, data: null };
        }
    }
} 