import config from './config.js';

export class APIService {
    constructor() {
        this.baseURL = config.apiUrl;
        this.token = localStorage.getItem('token');
        this.refreshToken = localStorage.getItem('refreshToken');
        this.currentUser = localStorage.getItem('currentUser');
    }

    async refreshAuthToken() {
        if (!this.refreshToken) return false;

        try {
            const response = await fetch(`${this.baseURL}/users/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            if (response.ok) {
                const { token } = await response.json();
                localStorage.setItem('token', token);
                this.token = token;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    async makeAuthenticatedRequest(url, options = {}) {
        // Ensure we have the latest token
        this.token = localStorage.getItem('token');
        
        // Add auth headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (response.status === 401) {
                // Token might be expired, try to refresh
                const refreshed = await this.refreshAuthToken();
                if (refreshed) {
                    // Retry the request with new token
                    headers['Authorization'] = `Bearer ${this.token}`;
                    return await fetch(url, {
                        ...options,
                        headers
                    });
                }
                throw new Error('Authentication failed');
            }

            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async saveQuizResult(quizData) {
        try {
            const response = await this.makeAuthenticatedRequest(`${this.baseURL}/users/quiz-results`, {
                method: 'POST',
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

    async getQuizProgress(quizName) {
        try {
            const response = await this.makeAuthenticatedRequest(`${this.baseURL}/users/quiz-progress/${quizName}`);

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

            return await response.json();
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