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
            // First try to load from server
            const response = await fetch(`${config.apiUrl}/users/${this.username}/quiz-results`);
            if (!response.ok) {
                throw new Error('Failed to load user data from server');
            }
            const data = await response.json();
            
            if (data.success) {
                this.quizResults = data.data || [];
                console.log('Loaded quiz results:', this.quizResults);
                
                // Load quiz progress for each quiz
                for (const result of this.quizResults) {
                    try {
                        const progressResponse = await this.api.getQuizProgress(result.quizName);
                        if (progressResponse && progressResponse.data) {
                            this.quizProgress[result.quizName] = progressResponse.data;
                        }
                    } catch (error) {
                        console.error(`Failed to load progress for ${result.quizName}:`, error);
                    }
                }
                
                // Update progress display for each quiz
                this.quizResults.forEach(result => {
                    const progressElement = document.querySelector(`#${result.quizName}-progress`);
                    if (progressElement) {
                        const totalQuestions = 15;
                        const progress = this.quizProgress[result.quizName];
                        
                        // Get the most up-to-date question count
                        const completedQuestions = progress?.questionHistory?.length || 
                                                result.questionHistory?.length || 
                                                result.questionsAnswered || 0;
                        
                        const percentComplete = Math.round((completedQuestions / totalQuestions) * 100);
                        
                        console.log(`Updating progress for ${result.quizName}:`, {
                            completedQuestions,
                            percentComplete,
                            progress,
                            result
                        });
                        
                        // Remove "No progress" message if it exists
                        if (progressElement.textContent.includes('No progress')) {
                            progressElement.textContent = '';
                        }
                        
                        progressElement.textContent = `${percentComplete}% Complete`;
                        progressElement.classList.remove('hidden');
                        
                        // Update quiz item styling
                        const quizItem = document.querySelector(`[data-quiz="${result.quizName}"]`);
                        if (quizItem) {
                            quizItem.classList.remove('completed', 'in-progress');
                            if (percentComplete === 100) {
                                quizItem.classList.add('completed');
                                progressElement.classList.add('completed');
                                progressElement.classList.remove('in-progress');
                            } else if (percentComplete > 0) {
                                quizItem.classList.add('in-progress');
                                progressElement.classList.add('in-progress');
                                progressElement.classList.remove('completed');
                            }
                        }
                    }
                });
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to load user data:', error);
            return false;
        }
    }

    clearLocalStorageData() {
        // Clear all quiz-related data for this user
        const quizTypes = [
            'communication',
            'initiative', 
            'time-management',
            'tester-mindset',
            'risk-analysis',
            'risk-management',
            'non-functional',
            'test-support',
            'issue-verification',
            'build-verification',
            'issue-tracking-tools',
            'raising-tickets',
            'reports',
            'CMS-Testing'
        ];

        quizTypes.forEach(quizName => {
            // Clear both hyphenated and camelCase versions
            localStorage.removeItem(`quiz_progress_${this.username}_${quizName}`);
            localStorage.removeItem(`quiz_progress_${this.username}_${this.normalizeQuizName(quizName)}`);
            localStorage.removeItem(`quizResults_${this.username}_${quizName}`);
            localStorage.removeItem(`quizResults_${this.username}_${this.normalizeQuizName(quizName)}`);
        });

        // Clear general user data
        localStorage.removeItem(`quizResults_${this.username}`);
        localStorage.removeItem(`quizProgress_${this.username}`);
    }

    normalizeQuizName(quizName) {
        return quizName.replace(/-([a-z])/g, g => g[1].toUpperCase());
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

    async saveQuizResult(quizName, data) {
        // If data is passed as separate arguments for backward compatibility
        let quizData;
        if (typeof data === 'number' || typeof data === 'string') {
            quizData = {
                quizName,
                score: Math.round(data),
                experience: Math.round(arguments[2] || data),
                tools: arguments[3] || [],
                questionHistory: arguments[4] || [],
                questionsAnswered: arguments[5] !== null ? arguments[5] : (arguments[4] ? arguments[4].length : 0),
                status: 'completed',
                completedAt: new Date().toISOString()
            };
        } else {
            quizData = {
                quizName,
                score: Math.round(data.score),
                experience: Math.round(data.experience || data.score),
                tools: data.tools || [],
                questionHistory: data.questionHistory || [],
                questionsAnswered: data.questionsAnswered !== null ? data.questionsAnswered : (data.questionHistory ? data.questionHistory.length : 0),
                status: data.status || 'completed',
                completedAt: new Date().toISOString()
            };
        }

        try {
            // Save to server
            const response = await this.api.fetchWithAuth(`${config.apiUrl}/users/quiz-results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(quizData)
            });

            if (!response.ok) {
                throw new Error('Failed to save quiz result to server');
            }

            const data = await response.json();
            if (data.success) {
                this.quizResults = data.data;
                
                // Also update the quiz progress
                const progressData = {
                    experience: quizData.experience,
                    tools: quizData.tools,
                    questionHistory: quizData.questionHistory,
                    questionsAnswered: quizData.questionsAnswered,
                    currentScenario: quizData.questionsAnswered % 5,
                    status: quizData.status,
                    lastUpdated: quizData.completedAt
                };
                
                await this.api.saveQuizProgress(quizName, progressData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to save quiz result:', error);
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
        const result = this.quizResults.find(result => 
            result.quizName === quizName || 
            result.quizName === this.normalizeQuizName(quizName)
        );
        console.log('Getting quiz result for', quizName, ':', result);
        return result || null;
    }

    async saveQuizProgress(quizName, progress) {
        try {
            const result = await this.api.saveQuizProgress(quizName, progress);
            if (result) {
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
            console.log('Got quiz progress:', data);
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Failed to get quiz progress:', error);
            return null;
        }
    }

    async updateQuizScore(quizName, data) {
        try {
            // Handle both object and primitive score input
            const scoreData = typeof data === 'object' ? data : { score: data };
            
            // Update server
            const response = await this.api.updateQuizScore(quizName, {
                ...scoreData,
                status: scoreData.status || 'in_progress'
            });
            
            if (response && response.success) {
                // Update local data
                const existingIndex = this.quizResults.findIndex(r => r.quizName === quizName);
                if (existingIndex !== -1) {
                    this.quizResults[existingIndex] = {
                        ...this.quizResults[existingIndex],
                        ...scoreData,
                        updatedAt: new Date().toISOString()
                    };
                } else {
                    this.quizResults.push({
                        quizName,
                        ...scoreData,
                        completedAt: new Date().toISOString()
                    });
                }

                // Save to localStorage
                this.saveToLocalStorage({
                    quizName,
                    ...scoreData,
                    updatedAt: new Date().toISOString()
                });

                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update quiz score:', error);
            return false;
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    async loadAndDisplayProgress() {
        try {
            // Fetch user's quiz results from the server
            const response = await this.api.fetchWithAuth(`${config.apiUrl}/users/progress`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to load progress');
            }

            this.quizResults = data.quizResults || [];
            
            // Update progress bars for each category
            this.updateCategoryProgress('Personal Organisation', ['communication', 'initiative', 'tester-mindset', 'time-management']);
            this.updateCategoryProgress('Risk Management', ['risk-analysis', 'risk-management']);
            this.updateCategoryProgress('Test Execution', ['non-functional', 'test-support', 'issue-verification', 'build-verification']);
            this.updateCategoryProgress('Tickets and Tracking', ['issue-tracking-tools', 'raising-tickets', 'reports', 'CMS-Testing']);

            // Update individual quiz progress indicators
            document.querySelectorAll('.quiz-item').forEach(quizItem => {
                const quizName = quizItem.dataset.quiz;
                if (!quizName) return;

                const progressElement = document.getElementById(`${quizName}-progress`);
                if (!progressElement) return;

                const result = this.quizResults.find(r => r.quizName === quizName);
                
                // Remove any existing classes
                progressElement.classList.remove('hidden', 'completed', 'in-progress');
                quizItem.classList.remove('completed', 'in-progress');

                if (result) {
                    const score = result.score || 0;
                    progressElement.textContent = `${score}%`;
                    
                    if (score === 100) {
                        progressElement.classList.add('completed');
                        quizItem.classList.add('completed');
                    } else {
                        progressElement.classList.add('in-progress');
                        quizItem.classList.add('in-progress');
                    }
                } else {
                    // Not started
                    progressElement.textContent = '0%';
                }
            });

        } catch (error) {
            console.error('Failed to load user progress:', error);
            this.showError('Failed to load progress. Please try refreshing the page.');
        }
    }

    updateCategoryProgress(categoryName, quizIds) {
        const categoryCard = Array.from(document.querySelectorAll('.category-card'))
            .find(card => card.querySelector('.category-header').textContent.trim() === categoryName);
        
        if (!categoryCard) return;

        const completedQuizzes = this.quizResults.filter(result => 
            quizIds.includes(result.quizName) && result.score >= 70
        ).length;

        const progressText = categoryCard.querySelector('.progress-text');
        const progressBar = categoryCard.querySelector('.progress-fill');
        
        if (progressText) {
            progressText.textContent = `Progress: ${completedQuizzes}/${quizIds.length} Complete`;
        }
        
        if (progressBar) {
            const percentage = (completedQuizzes / quizIds.length) * 100;
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute('aria-valuenow', percentage);
        }
    }
}

// Make QuizUser available globally for legacy support
window.QuizUser = QuizUser; 