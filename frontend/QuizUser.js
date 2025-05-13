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
            'test-types-tricks', 'exploratory', 'automation-interview', 'sanity-smoke'
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
        // Null check for safety
        if (!quizName) return '';
        
        // Always return 'tester-mindset' for any variant
        if (typeof quizName === 'string' && quizName.toLowerCase().replace(/[_\s]/g, '-').includes('tester')) {
            return 'tester-mindset';
        }
        
        // Ensure we're handling the communication quiz consistently
        if (typeof quizName === 'string' && 
            (quizName.toLowerCase().includes('communic') || quizName.toLowerCase().includes('communi'))) {
            return 'communication';
        }
        
        // For script-metrics, ensure consistent name
        if (typeof quizName === 'string' && 
            quizName.toLowerCase().includes('script') && 
            quizName.toLowerCase().includes('metric')) {
            return 'script-metrics-troubleshooting';
        }
        
        // For all other quizzes, use the existing camelCase conversion
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
        quizName = this.normalizeQuizName(quizName);
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

            // fetchWithAuth now returns the parsed JSON directly
            const data = response;
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
        quizName = this.normalizeQuizName(quizName);
        const result = this.quizResults.find(result => 
            result.quizName === quizName || 
            result.quizName === this.normalizeQuizName(quizName)
        );
        console.log('Getting quiz result for', quizName, ':', result);
        return result || null;
    }

    async saveQuizProgress(quizName, progress) {
        quizName = this.normalizeQuizName(quizName);
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
        quizName = this.normalizeQuizName(quizName);
        try {
            this.quizProgress[quizName] = progress;
            localStorage.setItem(`quizProgress_${this.username}`, JSON.stringify(this.quizProgress));
        } catch (error) {
            console.error('Failed to save progress to localStorage:', error);
        }
    }

    async getQuizProgress(quizName) {
        // Always normalize the quiz name for consistency
        const normalizedQuizName = this.normalizeQuizName(quizName);
        console.log(`[QuizUser] Getting progress for quiz: ${quizName} → ${normalizedQuizName}`);
        
        try {
            // Use the apiService method instead of direct fetch to benefit from all token handling and error management
            const response = await this.api.getQuizProgress(normalizedQuizName);
            
            if (!response || !response.success) {
                console.warn(`[QuizUser] Quiz progress API returned unsuccessful response for ${normalizedQuizName}:`, response);
                
                // Try the local cached progress as a fallback
                if (this.quizProgress && this.quizProgress[normalizedQuizName]) {
                    console.log(`[QuizUser] Using cached progress for ${normalizedQuizName} after API failure`);
                    return this.quizProgress[normalizedQuizName];
                }
                
                // If nothing found in cache, check localStorage directly
                try {
                    const username = localStorage.getItem('username');
                    if (username) {
                        const storageKey = `quiz_progress_${username}_${normalizedQuizName}`;
                        const localData = localStorage.getItem(storageKey);
                        
                        if (localData) {
                            const parsed = JSON.parse(localData);
                            if (parsed && parsed.data) {
                                console.log(`[QuizUser] Using direct localStorage data for ${normalizedQuizName}`);
                                
                                // Cache this data in memory for future use
                                this.quizProgress[normalizedQuizName] = parsed.data;
                                
                                return parsed.data;
                            }
                        }
                    }
                } catch (localError) {
                    console.error(`[QuizUser] Error accessing localStorage:`, localError);
                }
                
                return null;
            }
            
            // Make sure we have actual data and it's in a valid format
            if (!response.data) {
                console.warn(`[QuizUser] API returned success but no data for ${normalizedQuizName}`);
                return null;
            }
            
            // Data validation and cleaning
            const progressData = response.data;
            
            // Critical: Ensure the experience value is a valid number and never becomes NaN
            if (progressData.experience === undefined || progressData.experience === null || isNaN(progressData.experience)) {
                console.warn(`[QuizUser] Quiz progress has invalid experience value: ${progressData.experience}, fixing to 0`);
                progressData.experience = 0;
            } else if (typeof progressData.experience === 'string') {
                progressData.experience = parseFloat(progressData.experience) || 0;
            }
            
            // Log retrieved progress for debugging
            console.log(`[QuizUser] Successfully retrieved quiz progress for ${normalizedQuizName}:`, {
                experience: progressData.experience,
                questionsAnswered: progressData.questionsAnswered,
                status: progressData.status
            });
            
            // Cache the progress data in memory for future use
            this.quizProgress[normalizedQuizName] = progressData;
            
            // Also update our localStorage cache (this is redundant with API's cache but serves as extra insurance)
            try {
                const username = localStorage.getItem('username');
                if (username) {
                    localStorage.setItem(`quizProgress_${this.username}`, JSON.stringify(this.quizProgress));
                }
            } catch (e) {
                console.error(`[QuizUser] Failed to update localStorage cache:`, e);
            }
            
            return progressData;
        } catch (error) {
            console.error(`[QuizUser] Failed to get quiz progress for ${normalizedQuizName}:`, error);
            
            // Try the local cached progress as a fallback
            if (this.quizProgress && this.quizProgress[normalizedQuizName]) {
                console.log(`[QuizUser] Using cached progress for ${normalizedQuizName} after error`);
                return this.quizProgress[normalizedQuizName];
            }
            
            return null;
        }
    }

    async updateQuizScore(quizName, score, experience = 0, tools = [], questionHistory = [], questionsAnswered = null, status = 'in-progress') {
        quizName = this.normalizeQuizName(quizName);
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
                scorePercentage: Math.round(score), // Ensure scorePercentage is included
                experience: Math.round(experience || score),
                tools: tools || [],
                questionHistory: questionHistory || [],
                questionsAnswered: questionsAnswered !== null ? questionsAnswered : (questionHistory ? questionHistory.length : 0),
                completedAt: new Date().toISOString(),
                status: status // Include status in quiz data
            };

            // Use the apiService to save quiz results
            try {
                // Save to server using the appropriate API method
                const response = await this.api.fetchWithAuth(`${config.apiUrl}/users/quiz-results`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(quizData)
                });
                
                // Process response (fetchWithAuth now returns parsed JSON directly)
                const data = response;
                if (data.success) {
                    this.quizResults = data.data;
                    
                    // Also update the quiz progress
                    const progressData = {
                        experience: quizData.experience,
                        tools: quizData.tools,
                        questionHistory: quizData.questionHistory,
                        questionsAnswered: quizData.questionsAnswered,
                        currentScenario: quizData.questionsAnswered % 5,
                        lastUpdated: quizData.completedAt,
                        status: status, // Include status in progress data
                        scorePercentage: Math.round(score) // Ensure scorePercentage is included
                    };
                    
                    // Save progress using the API service
                    await this.api.saveQuizProgress(quizName, progressData);
                    return true;
                }
                
                // If we get here, saving failed
                console.warn('Failed to save quiz result to server. Success = false');
                return false;
            } catch (apiError) {
                console.error('API error when saving quiz result:', apiError);
                
                // Fall back to local storage
                this.saveToLocalStorage(quizData);
                
                // Still return false to indicate API save failed
                return false;
            }
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
            
            // fetchWithAuth now returns parsed JSON directly
            const data = response;

            if (!data.success) {
                throw new Error(data.message || 'Failed to load progress');
            }

            this.quizResults = data.quizResults || [];
            
            // Debug: Log all quiz results
            console.log("All quiz results:", JSON.stringify(this.quizResults, null, 2));
            
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
            
            this.updateCategoryProgress('Interview Preparation', [
                'automation-interview',
                'functional-interview'
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
        console.log("Applying quiz styles based on results");
        
        // Get all quiz items
        const quizItems = document.querySelectorAll('.quiz-item');
        
        quizItems.forEach(item => {
            const quizId = item.getAttribute('data-quiz-id');
            const progressElement = item.querySelector('.progress-indicator');
            
            if (!quizId) {
                console.log("No quiz ID found for item:", item);
                return;
            }
            
            console.log(`Checking quiz: ${quizId}`);
            
            // Find the quiz result
            const quizResult = this.quizResults.find(result => this.normalizeQuizName(result.quizName) === this.normalizeQuizName(quizId));
            
            if (!quizResult) {
                console.log(`No result found for quiz: ${quizId}, applying not started style`);
                
                // Not started - White/cream with thicker, darker border
                item.setAttribute('style', 'background-color: #FFF8E7 !important; border: 2px solid #EEE8D7 !important; color: #000000 !important; border-radius: 12px !important;');
                
                if (progressElement) {
                    progressElement.setAttribute('style', 'display: none !important;');
                    progressElement.textContent = '';
                }
                return;
            }
            
            console.log(`Quiz result for ${quizId}:`, quizResult);
            
            const questionsAnswered = quizResult.questionsAnswered || 0;
            const isPerfectScore = questionsAnswered === 15 && quizResult.experience >= 300;
            
            if (quizResult.status === 'failed' && questionsAnswered < 15) {
                // Failed - Light pink/salmon with thicker, darker border
                console.log(`Failed quiz: ${quizId}`);
                
                item.setAttribute('style', 'background-color: #FFCCCB !important; border: 2px solid #FFB6B6 !important; color: #000000 !important; pointer-events: none !important; border-radius: 12px !important;');
                item.setAttribute('aria-disabled', 'true');
                
                if (progressElement) {
                    progressElement.setAttribute('style', 'background-color: #FFCCCB !important; color: #000000 !important; display: block !important;');
                    progressElement.textContent = `${questionsAnswered}/15`;
                }
            } else if (questionsAnswered === 15) {
                if (isPerfectScore) {
                    // Perfect score - Light Green with thicker, darker border
                    console.log(`Perfect score in QuizUser.js: experience=${quizResult.experience} >= 300`);
                    
                    item.setAttribute('style', 'background-color: #90EE90 !important; border: 2px solid #70CF70 !important; color: #000000 !important; border-radius: 12px !important;');
                    
                    if (progressElement) {
                        progressElement.setAttribute('style', 'background-color: #90EE90 !important; color: #000000 !important; display: block !important;');
                    }
                } else {
                    // Not perfect - More faded Dark Yellow with thicker, darker border
                    console.log(`Not perfect score in QuizUser.js: experience=${quizResult.experience} < 300`);
                    
                    item.setAttribute('style', 'background-color: #F0D080 !important; border: 2px solid #E0B060 !important; color: #000000 !important; border-radius: 12px !important;');
                    
                    if (progressElement) {
                        progressElement.setAttribute('style', 'background-color: #F0D080 !important; color: #000000 !important; display: block !important;');
                    }
                }
                
                if (progressElement) {
                    progressElement.textContent = '15/15';
                }
            } else if (questionsAnswered > 0) {
                // In progress - Light Yellow with thicker, darker border
                console.log(`In progress in QuizUser.js: questions=${questionsAnswered}`);
                
                item.setAttribute('style', 'background-color: #FFFFCC !important; border: 2px solid #EEEEAA !important; color: #000000 !important; border-radius: 12px !important;');
                
                if (progressElement) {
                    progressElement.setAttribute('style', 'background-color: #FFFFCC !important; color: #000000 !important; display: block !important;');
                    progressElement.textContent = `${questionsAnswered}/15`;
                }
            } else {
                // Not started - White/cream with thicker, darker border
                console.log(`Not started in QuizUser.js: questions=${questionsAnswered}`);
                
                item.setAttribute('style', 'background-color: #FFF8E7 !important; border: 2px solid #EEE8D7 !important; color: #000000 !important; border-radius: 12px !important;');
                
                if (progressElement) {
                    progressElement.setAttribute('style', 'display: none !important;');
                    progressElement.textContent = '';
                }
            }
        });
    }

    /**
     * Sync all quiz progress to backend after login (for legacy users and badge accuracy)
     */
    async syncAllQuizProgressOnLogin() {
        try {
            // Load from localStorage (if any)
            this.loadFromLocalStorage();
            const quizProgress = this.quizProgress || {};
            const quizNames = Object.keys(quizProgress);
            if (quizNames.length === 0) {
                console.log('[Sync] No local quiz progress to sync.');
                return;
            }
            console.log('[Sync] Syncing quiz progress for quizzes:', quizNames);
            for (const quizName of quizNames) {
                const progress = quizProgress[quizName];
                if (progress) {
                    await this.api.saveQuizProgress(quizName, progress);
                }
            }
            console.log('[Sync] Quiz progress sync complete.');
        } catch (error) {
            console.error('[Sync] Error syncing quiz progress on login:', error);
        }
    }
}

// Make QuizUser available globally for legacy support
window.QuizUser = QuizUser; 