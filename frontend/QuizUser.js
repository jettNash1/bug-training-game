import { config } from './config.js';
import { APIService } from './api-service.js';

export class QuizUser {
    constructor(username) {
        this.username = username;
        this.api = new APIService();
        this.quizResults = [];
        this.quizProgress = {};
    }

    async loadUserData() {
        try {
            const response = await fetch(`${config.apiUrl}/users/${this.username}/quiz-results`);
            if (!response.ok) {
                throw new Error('Failed to load user data');
            }
            const data = await response.json();
            if (data.success) {
                this.quizResults = data.data || [];
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to load user data:', error);
            // Try to load from localStorage as fallback
            this.loadFromLocalStorage();
            return false;
        }
    }

    loadFromLocalStorage() {
        try {
            // Load quiz results
            const storedResults = localStorage.getItem(`quizResults_${this.username}`);
            if (storedResults) {
                this.quizResults = JSON.parse(storedResults);
            }

            // Load quiz progress
            const storedProgress = localStorage.getItem(`quizProgress_${this.username}`);
            if (storedProgress) {
                this.quizProgress = JSON.parse(storedProgress);
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    }

    async saveQuizResult(quizName, score, experience = 0, tools = [], questionHistory = []) {
        const quizData = {
            quizName,
            score: Math.round(score),
            experience: Math.round(experience || score),
            tools: tools || [],
            questionHistory: questionHistory || [],
            completedAt: new Date().toISOString()
        };

        try {
            const response = await this.api.fetchWithAuth(`${config.apiUrl}/users/quiz-results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(quizData)
            });

            if (!response.ok) {
                throw new Error('Failed to save quiz result');
            }

            const data = await response.json();
            if (data.success) {
                this.quizResults = data.data;
                // Update localStorage as backup
                localStorage.setItem(`quizResults_${this.username}`, JSON.stringify(this.quizResults));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to save quiz result:', error);
            // Save to localStorage as fallback
            this.saveToLocalStorage(quizData);
            return false;
        }
    }

    saveToLocalStorage(quizData) {
        try {
            // Find and update or add new quiz result
            const existingIndex = this.quizResults.findIndex(r => r.quizName === quizData.quizName);
            if (existingIndex !== -1) {
                this.quizResults[existingIndex] = quizData;
            } else {
                this.quizResults.push(quizData);
            }

            // Save to localStorage
            localStorage.setItem(`quizResults_${this.username}`, JSON.stringify(this.quizResults));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    getQuizResult(quizName) {
        return this.quizResults.find(result => result.quizName === quizName) || null;
    }

    async saveQuizProgress(quizName, progress) {
        try {
            const response = await this.api.fetchWithAuth(`${config.apiUrl}/users/quiz-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    quizName,
                    progress
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save quiz progress');
            }

            const data = await response.json();
            if (data.success) {
                this.quizProgress[quizName] = progress;
                // Update localStorage as backup
                localStorage.setItem(`quizProgress_${this.username}`, JSON.stringify(this.quizProgress));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to save quiz progress:', error);
            // Save to localStorage as fallback
            this.saveProgressToLocalStorage(quizName, progress);
            return false;
        }
    }

    saveProgressToLocalStorage(quizName, progress) {
        try {
            this.quizProgress[quizName] = progress;
            localStorage.setItem(`quizProgress_${this.username}`, JSON.stringify(this.quizProgress));
        } catch (error) {
            console.error('Failed to save progress to localStorage:', error);
        }
    }

    async getQuizProgress(quizName) {
        try {
            const response = await this.api.fetchWithAuth(`${config.apiUrl}/users/quiz-progress/${quizName}`);
            if (!response.ok) {
                throw new Error('Failed to get quiz progress');
            }

            const data = await response.json();
            if (data.success) {
                return data.data;
            }
            return null;
        } catch (error) {
            console.error('Failed to get quiz progress:', error);
            // Try to get from localStorage
            return this.quizProgress[quizName] || null;
        }
    }
}

// Make QuizUser available globally for legacy support
window.QuizUser = QuizUser; 