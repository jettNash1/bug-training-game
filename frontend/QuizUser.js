import config from './config.js';
import { APIService } from './api-service.js';

export class QuizUser {
    constructor(username) {
        this.username = username;
        this.quizResults = [];
        this.apiService = new APIService();
        this.baseUrl = `${config.apiUrl}/users`;
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    async saveQuizResult(quizName, score, answers = []) {
        console.log(`Attempting to save quiz result for ${quizName} with score ${score}`);
        let attempts = 0;
        
        while (attempts < this.retryAttempts) {
            try {
                const token = await this.getValidToken();
                if (!token) {
                    throw new Error('No valid authentication token found');
                }

                const quizData = {
                    quizName,
                    score: Math.round(score),
                    experience: Math.round(score),
                    tools: [],
                    questionHistory: answers,
                    completedAt: new Date().toISOString()
                };

                const response = await fetch(`${this.baseUrl}/quiz-results`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(quizData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    if (response.status === 401) {
                        // Token might be expired, clear it and retry
                        localStorage.removeItem('token');
                        throw new Error('Token expired');
                    }
                    throw new Error(errorData.message || 'Failed to save quiz result');
                }

                const data = await response.json();
                if (data.success) {
                    this.quizResults = Array.isArray(data.data) ? data.data : [quizData];
                    // Only use localStorage as temporary cache
                    this.saveToLocalStorage();
                    await this.loadAndDisplayProgress();
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to save quiz result');
                }
            } catch (error) {
                console.error(`Attempt ${attempts + 1} failed:`, error);
                if (attempts === this.retryAttempts - 1) {
                    // Only fall back to localStorage on final attempt
                    console.warn('All API attempts failed, falling back to localStorage');
                    this.fallbackToLocalStorage(quizName, score, answers);
                    // Schedule a background sync attempt
                    this.scheduleSync();
                    throw error;
                }
                attempts++;
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempts));
            }
        }
    }

    async getValidToken() {
        let token = localStorage.getItem('token');
        if (!token) return null;

        try {
            // Verify token is still valid
            const response = await fetch(`${this.baseUrl}/verify-token`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                // Token is invalid, try to refresh
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const refreshResponse = await fetch(`${this.baseUrl}/refresh-token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken })
                    });
                    
                    if (refreshResponse.ok) {
                        const { token: newToken } = await refreshResponse.json();
                        localStorage.setItem('token', newToken);
                        return newToken;
                    }
                }
                return null;
            }
            
            return token;
        } catch (error) {
            console.error('Error verifying token:', error);
            return null;
        }
    }

    async loadUserData() {
        let attempts = 0;
        
        while (attempts < this.retryAttempts) {
            try {
                const token = await this.getValidToken();
                if (!token) {
                    throw new Error('No valid token available');
                }

                console.log('Loading user data for:', this.username);
                this.clearProgressDisplays();

                const response = await fetch(`${this.baseUrl}/${this.username}/quiz-results`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('token');
                        throw new Error('Token expired');
                    }
                    throw new Error('Failed to load user data');
                }

                const data = await response.json();
                this.quizResults = data.data || [];
                
                // Update localStorage cache
                this.saveToLocalStorage();
                
                return this.quizResults;
            } catch (error) {
                console.error(`Attempt ${attempts + 1} failed:`, error);
                if (attempts === this.retryAttempts - 1) {
                    // Only use localStorage on final attempt
                    console.warn('All API attempts failed, loading from localStorage');
                    this.loadFromLocalStorage();
                    // Schedule a background sync
                    this.scheduleSync();
                    return this.quizResults;
                }
                attempts++;
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempts));
            }
        }
    }

    scheduleSync() {
        // Add to sync queue
        const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
        const pendingData = {
            username: this.username,
            quizResults: this.quizResults,
            timestamp: new Date().toISOString()
        };
        syncQueue.push(pendingData);
        localStorage.setItem('syncQueue', JSON.stringify(syncQueue));

        // Attempt background sync if available
        if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready.then(registration => {
                if ('sync' in registration) {
                    registration.sync.register('sync-quiz-data')
                        .catch(error => {
                            console.warn('Background sync failed:', error);
                            this.attemptSync();
                        });
                } else {
                    this.attemptSync();
                }
            });
        } else {
            // Fallback for browsers without service worker support
            this.attemptSync();
        }
    }

    async attemptSync() {
        const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
        if (syncQueue.length === 0) return;

        const token = await this.getValidToken();
        if (!token) return;

        for (let i = syncQueue.length - 1; i >= 0; i--) {
            try {
                const pendingData = syncQueue[i];
                await fetch(`${this.baseUrl}/sync`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(pendingData)
                });
                syncQueue.splice(i, 1);
            } catch (error) {
                console.error('Sync failed for item:', error);
            }
        }

        localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
    }

    fallbackToLocalStorage(quizName, score, answers) {
        console.log(`Falling back to localStorage for ${quizName} with score ${score}`);
        try {
            // Load existing data first
            this.loadFromLocalStorage();
            
            // Ensure quizResults is an array
            if (!Array.isArray(this.quizResults)) {
                console.log('Initializing quizResults as empty array');
                this.quizResults = [];
            }
            
            console.log('Current quiz results before update:', this.quizResults);
            
            // Remove any existing results for this quiz
            this.quizResults = this.quizResults.filter(result => {
                const keep = result.quizName !== quizName;
                if (!keep) {
                    console.log(`Removing previous result for ${quizName}`);
                }
                return keep;
            });
            
            // Add the new result
            const newResult = {
                quizName,
                score,
                completedAt: new Date().toISOString(),
                answers
            };
            this.quizResults.push(newResult);
            console.log('New quiz result added:', newResult);
            
            // Save to localStorage
            this.saveToLocalStorage();
            console.log('Updated quiz results:', this.quizResults);
        } catch (error) {
            console.error('Error in fallbackToLocalStorage:', error);
            throw error;
        }
    }

    async updateQuizScore(quizName, score) {
        try {
            await this.saveQuizResult(quizName, score, []);
            console.log(`Quiz score updated for ${quizName}: ${score}`);
        } catch (error) {
            console.error('Error updating quiz score:', error);
            // No need for additional fallback as saveQuizResult already handles it
        }
    }

    saveToLocalStorage() {
        try {
            const dataToSave = {
                username: this.username,
                quizResults: this.quizResults
            };
            console.log('Saving to localStorage:', dataToSave);
            localStorage.setItem(`user_${this.username}`, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            throw error;
        }
    }

    loadFromLocalStorage() {
        try {
            const userData = localStorage.getItem(`user_${this.username}`);
            console.log('Loaded from localStorage:', userData);
            if (userData) {
                const parsed = JSON.parse(userData);
                this.quizResults = Array.isArray(parsed.quizResults) ? parsed.quizResults : [];
            } else {
                this.quizResults = [];
            }
            console.log('Parsed quiz results:', this.quizResults);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.quizResults = [];
            throw error;
        }
    }

    async loadAndDisplayProgress() {
        try {
            const quizResults = await this.loadUserData();
            if (!quizResults || !Array.isArray(quizResults)) return;

            // Clear existing progress first
            this.clearProgressDisplays();

            // Update individual quiz progress
            quizResults.forEach(result => {
                const { quizName, score } = result;
                console.log(`Updating progress for ${quizName}: ${score}%`);
                
                const progressElement = document.querySelector(`#${quizName}-progress`);
                if (progressElement) {
                    progressElement.textContent = `${score}% Complete`;
                    progressElement.style.display = 'block'; // Show the element
                    progressElement.classList.remove('hidden');

                    // Update quiz item styling
                    const quizItem = document.querySelector(`[data-quiz="${quizName}"]`);
                    if (quizItem) {
                        quizItem.classList.remove('completed', 'in-progress');
                        if (score === 100) {
                            quizItem.classList.add('completed');
                            progressElement.classList.add('completed');
                            progressElement.classList.remove('in-progress');
                        } else if (score > 0) {
                            quizItem.classList.add('in-progress');
                            progressElement.classList.add('in-progress');
                            progressElement.classList.remove('completed');
                        }
                    }
                }
            });

            // Update category progress
            this.updateCategoryProgress('Personal Organisation', ['communication', 'initiative', 'tester-mindset', 'time-management']);
            this.updateCategoryProgress('Risk Management', ['risk-analysis', 'risk-management']);
            this.updateCategoryProgress('Test Execution', ['non-functional', 'test-support', 'issue-verification', 'build-verification']);
            this.updateCategoryProgress('Tickets and Tracking', ['issue-tracking', 'raising-tickets', 'reports', 'CMS-Testing']);

        } catch (error) {
            console.error('Failed to load and display progress:', error);
        }
    }

    clearProgressDisplays() {
        // Clear all quiz progress displays
        const progressElements = document.querySelectorAll('[id$="-progress"]');
        progressElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none'; // Use display none instead of hidden class
        });

        // Clear quiz item styling
        const quizItems = document.querySelectorAll('.quiz-item');
        quizItems.forEach(item => {
            item.classList.remove('completed', 'in-progress');
        });

        // Reset category progress bars
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            const progressText = card.querySelector('.progress-text');
            const progressFill = card.querySelector('.progress-bar .progress-fill');
            if (progressText && progressFill) {
                const totalQuizzes = card.querySelectorAll('.quiz-item').length;
                progressText.textContent = `Progress: 0/${totalQuizzes} Complete`;
                progressFill.style.width = '0%';
                progressFill.classList.remove('progress-low', 'progress-medium', 'progress-high');
                progressFill.classList.add('progress-low');
            }
        });
    }

    updateProgressDisplay(quizName, progress) {
        console.log(`Updating progress display for ${this.username}'s ${quizName}`);
        const quizItem = document.querySelector(`[data-quiz="${quizName}"]`);
        const progressElement = document.querySelector(`#${quizName}-progress`);
        
        if (!quizItem || !progressElement) {
            console.log('Quiz elements not found:', quizName);
            return;
        }

        // Only update if this is the current user's progress
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser !== this.username) {
            console.log('Skipping progress update - wrong user');
            return;
        }

            if (progress && progress.questionHistory) {
                const totalQuestions = 15;
                const completedQuestions = progress.questionHistory.length;
                const percentComplete = Math.round((completedQuestions / totalQuestions) * 100);
                
            // Update progress text and make visible
                progressElement.textContent = `${percentComplete}% Complete`;
            progressElement.style.display = 'block';
                progressElement.classList.remove('hidden');
                
                // Update quiz item styling
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
                
            console.log(`Progress updated for ${this.username}: ${percentComplete}%`);
            } else {
            progressElement.style.display = 'none';
                progressElement.classList.add('hidden');
                quizItem.classList.remove('completed', 'in-progress');
        }
    }

    updateCategoryProgress(categoryName, quizzes) {
        const categoryCard = Array.from(document.querySelectorAll('.category-card'))
            .find(card => card.querySelector('.category-header').textContent.trim() === categoryName);
        
        if (!categoryCard) {
            console.log(`Category card not found for: ${categoryName}`);
            return;
        }

        // Get progress elements
        const progressBar = categoryCard.querySelector('.progress-bar');
        const progressFill = progressBar ? progressBar.querySelector('.progress-fill') : null;
        const progressText = categoryCard.querySelector('.category-progress');
        
        if (!progressBar || !progressFill || !progressText) {
            console.log(`Progress elements not found for: ${categoryName}`);
            return;
        }

        // Count completed quizzes (100% complete)
        let completedCount = 0;
        quizzes.forEach(quizName => {
            const progressElement = document.getElementById(`${quizName}-progress`);
            if (progressElement && progressElement.textContent === '100%') {
                completedCount++;
            }
        });

        // Update progress text and bar
        const totalQuizzes = quizzes.length;
        const progressPercentage = (completedCount / totalQuizzes) * 100;
        
        progressText.textContent = `Progress: ${completedCount}/${totalQuizzes} Complete`;
        progressFill.style.width = `${progressPercentage}%`;
        progressFill.style.display = 'block';

        // Update progress bar color class
        progressFill.classList.remove('progress-low', 'progress-medium', 'progress-high');
        if (progressPercentage <= 33) {
            progressFill.classList.add('progress-low');
        } else if (progressPercentage <= 66) {
            progressFill.classList.add('progress-medium');
        } else {
            progressFill.classList.add('progress-high');
        }

        console.log(`Category progress updated for ${categoryName}:`, {
            completedCount,
            totalQuizzes,
            progressPercentage,
            progressBarWidth: progressFill.style.width
        });
    }
}

// Make QuizUser available globally for legacy support
window.QuizUser = QuizUser; 