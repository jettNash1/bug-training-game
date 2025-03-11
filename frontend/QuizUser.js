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
            const data = await this.api.getUserData();
            
            if (data.success) {
                this.userType = data.data.userType;
                this.allowedQuizzes = data.data.allowedQuizzes || [];
                this.quizResults = data.data.quizResults || [];

                // If this is an interview account, only show allowed quizzes
                if (this.userType === 'interview_candidate') {
                    document.querySelectorAll('.quiz-item').forEach(quizItem => {
                        const quizName = quizItem.dataset.quiz;
                        if (!this.allowedQuizzes.includes(quizName.toLowerCase())) {
                            quizItem.style.display = 'none';
                        }
                    });
                }

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
            'communication', 'initiative', 'time-management', 'tester-mindset',
            'risk-analysis', 'risk-management', 'non-functional', 'test-support',
            'issue-verification', 'build-verification', 'issue-tracking-tools',
            'raising-tickets', 'reports', 'cms-testing', 'email-testing', 'content-copy',
            'locale-testing', 'script-metrics-troubleshooting','standard-script-testing',
            'test-types-tricks', 'exploratory'
        ];

        quizTypes.forEach(quizName => {
            // Clear all possible variations of the quiz name
            const variations = [
                quizName,                                              // original (hyphenated)
                this.normalizeQuizName(quizName),                     // camelCase
                quizName.replace(/-/g, ''),                           // no hyphens
                quizName.toUpperCase(),                               // uppercase
                quizName.toLowerCase(),                               // lowercase
                // Special handling for CMS-Testing variations
                quizName === 'cms-testing' ? 'CMS-Testing' : null,    // historical CMS-Testing
                quizName === 'cms-testing' ? 'cmsTesting' : null      // historical cmsTesting
            ].filter(Boolean); // Remove null values

            variations.forEach(variant => {
                localStorage.removeItem(`quiz_progress_${this.username}_${variant}`);
                localStorage.removeItem(`quizResults_${this.username}_${variant}`);
            });
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

    async saveQuizResult(quizName, score, experience = 0, tools = [], questionHistory = [], questionsAnswered = null) {
        const quizData = {
            quizName,
            score: Math.round(score),
            experience: Math.round(experience || score),
            tools: tools || [],
            questionHistory: questionHistory || [],
            questionsAnswered: questionsAnswered !== null ? questionsAnswered : (questionHistory ? questionHistory.length : 0),
            completedAt: new Date().toISOString()
        };

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
                    currentScenario: quizData.questionsAnswered % 5, // Keep track of position within current level
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
            // Add retry logic for important saves
            const maxRetries = 3;
            let lastError = null;
            
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    const result = await this.api.saveQuizProgress(quizName, progress);
                    if (result) {
                        this.quizProgress[quizName] = progress;
                        // Update localStorage as backup
                        localStorage.setItem(`quizProgress_${this.username}`, JSON.stringify(this.quizProgress));
                        return true;
                    }
                    // If result is false, try again
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
                } catch (error) {
                    lastError = error;
                    console.error(`Failed to save quiz progress (attempt ${attempt + 1}/${maxRetries}):`, error);
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
                }
            }
            
            // If we get here, all retries failed
            console.error('All attempts to save quiz progress failed:', lastError);
            
            // Save to localStorage as fallback
            this.saveProgressToLocalStorage(quizName, progress);
            
            // Re-throw the error to be handled by the caller
            throw lastError || new Error('Failed to save quiz progress after multiple attempts');
        } catch (error) {
            console.error('Failed to save quiz progress:', error);
            // Save to localStorage as fallback
            this.saveProgressToLocalStorage(quizName, progress);
            throw error; // Re-throw to be handled by the caller
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

    async updateQuizScore(quizName, score, experience = 0, tools = [], questionHistory = [], questionsAnswered = null) {
        try {
            if (!this.api) {
                throw new Error('API service not initialized');
            }
            
            // Get the current quiz progress to include question history
            const progress = await this.getQuizProgress(quizName);
            
            // Create the quiz data with all necessary fields
            const quizData = {
                quizName,
                score: Math.round(score),
                experience: Math.round(experience || score),
                tools: tools || [],
                questionHistory: questionHistory || [],
                questionsAnswered: questionsAnswered !== null ? questionsAnswered : (questionHistory ? questionHistory.length : 0),
                completedAt: new Date().toISOString()
            };

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
                    currentScenario: quizData.questionsAnswered % 5, // Keep track of position within current level
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
            this.updateCategoryProgress('Core QA Skills', [
                'tester-mindset',
                'communication',
                'initiative',
                'standard-script-testing',
                'fully-scripted',
                'exploratory'
            ]);
            
            this.updateCategoryProgress('Technical Testing', [
                'script-metrics-troubleshooting',
                'locale-testing',
                'build-verification',
                'test-types-tricks',
                'test-support',
                'sanity-smoke'
            ]);
            
            this.updateCategoryProgress('Project Management', [
                'time-management',
                'risk-analysis',
                'risk-management'
            ]);
            
            this.updateCategoryProgress('Bug Management', [
                'issue-tracking-tools',
                'raising-tickets',
                'issue-verification',
                'reports'
            ]);
            
            this.updateCategoryProgress('Specialized Testing', [
                'cms-testing',
                'email-testing',
                'non-functional',
                'content-copy'
            ]);

            // Call our new function to apply styles directly
            this.applyQuizStyles();

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

    startQuizTimer() {
        if (this.userType !== 'interview_candidate') return;

        const TIMER_DURATION = 180; // 3 minutes in seconds
        let timeLeft = TIMER_DURATION;

        // Create timer display
        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'quiz-timer';
        timerDisplay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 1.2em;
            z-index: 1000;
        `;
        document.body.appendChild(timerDisplay);

        // Update timer every second
        this.timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `Time Left: ${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 30) {
                timerDisplay.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
            }

            if (timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.handleTimeUp();
            }
        }, 1000);
    }

    handleTimeUp() {
        // Submit the quiz automatically
        const submitButton = document.querySelector('.submit-quiz-btn');
        if (submitButton) {
            submitButton.click();
        }

        // Show time up message
        alert('Time is up! Your answers have been submitted.');
    }

    clearQuizTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            const timerDisplay = document.querySelector('.quiz-timer');
            if (timerDisplay) {
                timerDisplay.remove();
            }
        }
    }

    async startQuiz(quizName) {
        try {
            // Clear any existing timer
            this.clearQuizTimer();

            // Start timer if user is an interview candidate
            if (this.userType === 'interview_candidate') {
                this.startQuizTimer();
            }

            // Rest of the quiz initialization code...
            const response = await this.api.getQuizProgress(quizName);
            if (!response || !response.success) {
                throw new Error('Failed to start quiz');
            }

            return response.data;
        } catch (error) {
            console.error('Failed to start quiz:', error);
            throw error;
        }
    }

    async finishQuiz(quizName, results) {
        try {
            // Clear the timer if it exists
            this.clearQuizTimer();

            // Rest of the quiz completion code...
            const response = await this.api.saveQuizProgress(quizName, results);
            if (!response || !response.success) {
                throw new Error('Failed to save quiz progress');
            }

            return response.data;
        } catch (error) {
            console.error('Failed to finish quiz:', error);
            throw error;
        }
    }

    // Add this new function to directly modify the HTML
    applyQuizStyles() {
        console.log("Applying quiz styles directly to HTML");
        
        document.querySelectorAll('.quiz-item').forEach(quizItem => {
            const quizName = quizItem.dataset.quiz;
            if (!quizName) return;
            
            const result = this.quizResults.find(r => r.quizName === quizName);
            const progressElement = document.getElementById(`${quizName}-progress`);
            
            if (!result) {
                // Not started - White
                quizItem.setAttribute('style', 'background-color: #FFFFFF !important; border: none !important;');
                if (progressElement) {
                    progressElement.setAttribute('style', 'display: none !important;');
                    progressElement.textContent = '';
                }
                return;
            }
            
            const questionsAnswered = result.questionsAnswered || 0;
            const experience = result.experience || 0;
            const score = result.score || 0;
            
            console.log(`Quiz ${quizName}: questions=${questionsAnswered}, score=${score}, exp=${experience}`);
            
            if (questionsAnswered === 15) {
                if (score === 100 && experience >= 300) {
                    // Perfect score - Light Green with black border
                    console.log(`${quizName} is perfect`);
                    quizItem.setAttribute('style', 'background-color: #90EE90 !important; border: 2px solid #000000 !important; color: #000000 !important;');
                    if (progressElement) {
                        progressElement.setAttribute('style', 'background-color: #90EE90 !important; color: #000000 !important; display: block !important;');
                        progressElement.textContent = '15/15';
                    }
                } else {
                    // Not perfect - Dark Yellow
                    console.log(`${quizName} is completed but not perfect`);
                    quizItem.setAttribute('style', 'background-color: #DAA520 !important; border: none !important; color: #000000 !important;');
                    if (progressElement) {
                        progressElement.setAttribute('style', 'background-color: #DAA520 !important; color: #000000 !important; display: block !important;');
                        progressElement.textContent = '15/15';
                    }
                }
            } else if (questionsAnswered > 0) {
                // In progress - Yellow
                console.log(`${quizName} is in progress`);
                quizItem.setAttribute('style', 'background-color: #FFFF99 !important; border: none !important; color: #000000 !important;');
                if (progressElement) {
                    progressElement.setAttribute('style', 'background-color: #FFFF99 !important; color: #000000 !important; display: block !important;');
                    progressElement.textContent = `${questionsAnswered}/15`;
                }
            } else {
                // Not started - White
                console.log(`${quizName} is not started`);
                quizItem.setAttribute('style', 'background-color: #FFFFFF !important; border: none !important;');
                if (progressElement) {
                    progressElement.setAttribute('style', 'display: none !important;');
                    progressElement.textContent = '';
                }
            }
        });
    }
}

// Make QuizUser available globally for legacy support
window.QuizUser = QuizUser; 