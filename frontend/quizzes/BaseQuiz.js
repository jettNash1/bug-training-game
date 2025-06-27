import { APIService } from '../api-service.js';
import { QuizProgressService } from '../services/QuizProgressService.js';

export class BaseQuiz {
    constructor(config) {
        this.config = config || {};
        this.apiService = new APIService();
        
        // Use global QuizProgressService if available, otherwise create a new one
        this.quizProgressService = window.quizProgressService || new QuizProgressService();
        
        this.player = {
            name: '',
            experience: 0,
            questionHistory: [],
            currentScenario: 0,
        };
        
        this.quizName = this.config.quizName || 'unnamed-quiz';
        this.maxXP = 100;
        this.isLoading = false;
        
        // Initialize timer settings - start with reasonable default, will be overridden by admin settings
        this.timePerQuestion = 30;
        this.timerDisabled = false;
        
        // Initialize components
        this.initializeComponents();
        
        // Initialize timer settings from API
        this.initializeTimerSettings();
    }
    
    /**
     * Initialize timer settings by fetching from API
     */
    async initializeTimerSettings() {
        try {
            console.log(`[BaseQuiz] Initializing timer settings for: ${this.quizName}`);
            
            // Get timer settings from API
            const timerValue = await this.apiService.getQuizTimerValue(this.quizName);
            
            if (typeof timerValue === 'number') {
                this.timePerQuestion = timerValue;
                this.timerDisabled = (timerValue === 0);
                
                console.log(`[BaseQuiz] Timer settings loaded: ${this.timePerQuestion}s for ${this.quizName}${this.timerDisabled ? ' (disabled)' : ''}`);
            } else {
                console.warn(`[BaseQuiz] Invalid timer value received: ${timerValue}, using default 30s`);
                this.timePerQuestion = 30;
                this.timerDisabled = false;
            }
        } catch (error) {
            console.error(`[BaseQuiz] Error loading timer settings:`, error);
            // Keep default values on error
            this.timePerQuestion = 30;
            this.timerDisabled = false;
        }
    }
    
    /**
     * Initialize timer for the current question
     * This method can be called by quiz implementations to start the question timer
     */
    initializeTimer() {
        // Clear any existing timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
        
        // Reset timer display
        const timerContainer = document.getElementById('timer-container');
        const timerDisplay = document.getElementById('timer-display');
        
        if (!timerContainer || !timerDisplay) {
            console.error(`[${this.quizName}] Timer elements not found`);
            return;
        }
        
        // Check if timer is disabled (0 seconds) or timer functionality is disabled
        if (this.timerDisabled || this.timePerQuestion === 0) {
            console.log(`[${this.quizName}] Timer is disabled, hiding timer display`);
            timerContainer.classList.add('hidden');
            return;
        }
        
        // Show the timer
        timerContainer.classList.remove('hidden');
        timerContainer.classList.remove('visually-hidden');
        
        // Use the timer value from BaseQuiz
        const timeLimit = this.timePerQuestion;
        let timeLeft = timeLimit;
        timerDisplay.textContent = `${timeLeft}s`;
        
        console.log(`[${this.quizName}] Starting timer with ${timeLimit} seconds`);
        
        this.questionStartTime = Date.now();
        this.questionTimer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
                // Call the quiz-specific timeout handler if it exists
                if (typeof this.handleTimedOut === 'function') {
                    this.handleTimedOut();
                } else {
                    console.warn(`[${this.quizName}] No handleTimedOut method found`);
                }
            }
        }, 1000);
    }
    
    /**
     * Initialize any components or elements needed by the quiz
     * This is a placeholder method that can be overridden by derived classes
     */
    initializeComponents() {
        // Base initialization - can be extended by subclasses
        try {
            // Set up common elements if they exist
            this.gameScreen = document.getElementById('game-screen');
            this.outcomeScreen = document.getElementById('outcome-screen');
            this.endScreen = document.getElementById('end-screen');
            
            // Initialize quiz name from the page if not already set
            if (!this.quizName || this.quizName === 'unnamed-quiz') {
                // Try to get quiz name from URL or document
                const detectedName = this.detectQuizNameFromPage();
                if (detectedName) {
                    this.quizName = detectedName;
                    console.log(`[BaseQuiz] Detected quiz name: ${this.quizName}`);
                }
            }
            
            console.log(`[BaseQuiz] Components initialized for quiz: ${this.quizName}`);
        } catch (error) {
            console.error('[BaseQuiz] Error initializing components:', error);
        }
    }
    
    /**
     * Helper method to detect quiz name from URL or document
     * @returns {string|null} Detected quiz name or null
     */
    detectQuizNameFromPage() {
        try {
            // Try to get from URL first
            const urlParams = new URLSearchParams(window.location.search);
            const quizParam = urlParams.get('quiz') || urlParams.get('quizName');
            if (quizParam) {
                return quizParam.toLowerCase();
            }
            
            // Try to get from path
            const path = window.location.pathname;
            const pathMatch = path.match(/\/([^\/]+)-quiz\.html$/);
            if (pathMatch && pathMatch[1]) {
                return pathMatch[1].toLowerCase();
            }
            
            // Look for common quiz names in the path
            if (path.includes('communication')) {
                return 'communication';
            } else if (path.includes('tester-mindset')) {
                return 'tester-mindset';
            }
            
            // Try to get from page elements
            const quizTitle = document.querySelector('h1, .quiz-title');
            if (quizTitle && quizTitle.textContent) {
                // Convert title to likely quiz name: "Communication Quiz" -> "communication"
                return quizTitle.textContent.replace(/\s+quiz$/i, '').trim().toLowerCase();
            }
            
            return null;
        } catch (error) {
            console.error('[BaseQuiz] Error detecting quiz name:', error);
            return null;
        }
    }
        
    /**
     * Format quiz name from kebab-case to Title Case
     * @param {string} quizName - The quiz name to format
     * @returns {string} Formatted quiz name
     */
    formatQuizName(quizName) {
        if (!quizName) return '';
        return quizName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    /**
     * Display the quiz name in the UI
     * This method should be called when the quiz starts to show the quiz name to the user
     */
    displayQuizName() {
        try {
            // Create or update quiz name display element
            let quizNameElement = document.getElementById('quiz-name-display');
            
            if (!quizNameElement) {
                // Create the quiz name display element if it doesn't exist
                quizNameElement = document.createElement('div');
                quizNameElement.id = 'quiz-name-display';
                quizNameElement.className = 'quiz-name-display';
                
                // Find the quiz header to insert the name display
                const quizHeader = document.querySelector('.quiz-header');
                if (quizHeader) {
                    // Insert after the back link but before progress info
                    const backLink = quizHeader.querySelector('.back-link');
                    if (backLink && backLink.nextSibling) {
                        quizHeader.insertBefore(quizNameElement, backLink.nextSibling);
                    } else {
                        quizHeader.appendChild(quizNameElement);
                    }
                } else {
                    // Fallback: insert at the beginning of the quiz container
                    const quizContainer = document.querySelector('.quiz-container');
                    if (quizContainer) {
                        quizContainer.insertBefore(quizNameElement, quizContainer.firstChild);
                    }
                }
            }
            
            // Set the quiz name content
            const formattedName = this.formatQuizName(this.quizName);
            quizNameElement.textContent = formattedName;
            quizNameElement.setAttribute('aria-label', `Current quiz: ${formattedName}`);
            
            console.log(`[BaseQuiz] Displayed quiz name: ${formattedName}`);
        } catch (error) {
            console.error('[BaseQuiz] Error displaying quiz name:', error);
        }
    }
        
    /**
     * Loads quiz progress from the most reliable source.
     * This method uses the QuizProgressService for consistent progress handling.
     */
    async loadProgress() {
        try {
            console.log(`[${this.quizName}] Attempting to load progress...`);
            
            const username = localStorage.getItem('username');
            if (!username) {
                console.warn(`[${this.quizName}] No username found, cannot load progress`);
                return false;
            }
            
            // NEW: Check for cache invalidation before loading progress
            try {
                const cacheInvalidated = await this.apiService.checkCacheInvalidation(username, this.quizName);
                if (cacheInvalidated) {
                    console.log(`[${this.quizName}] Cache was invalidated by admin - cleared old data`);
                }
            } catch (cacheError) {
                console.warn(`[${this.quizName}] Cache invalidation check failed (continuing normally):`, cacheError);
            }
            
            // Use QuizProgressService to get progress
            const progressResult = await this.quizProgressService.getQuizProgress(this.quizName);
            
            if (!progressResult.success || !progressResult.data || 
                (progressResult.data.questionHistory && progressResult.data.questionHistory.length === 0)) {
                console.log(`[${this.quizName}] No valid progress data found`);
                return false;
            }
            
            const progressData = progressResult.data;
            console.log(`[${this.quizName}] Progress loaded:`, progressData);
            
            // Sanitize and validate data to prevent invalid values
            progressData.experience = !isNaN(parseFloat(progressData.experience)) ? parseFloat(progressData.experience) : 0;
            progressData.questionHistory = Array.isArray(progressData.questionHistory) ? 
                progressData.questionHistory : [];
            
            // CRITICAL: Ensure currentScenario is consistent with question history
            if (progressData.questionHistory.length > 0) {
                console.log(`[${this.quizName}] Setting currentScenario to match questionHistory.length:`, 
                    progressData.questionHistory.length);
                
                // ALWAYS set currentScenario to match the question history length
                // This ensures we go to the next unanswered question
                progressData.currentScenario = progressData.questionHistory.length;
            } else {
                console.log(`[${this.quizName}] No questions in history, starting from beginning`);
                progressData.currentScenario = 0;
            }
            
            // Fix inconsistent state: if quiz is marked as completed but has no progress
            if ((progressData.status === 'completed' || 
                 progressData.status === 'passed' || 
                 progressData.status === 'failed') && 
                (progressData.questionHistory.length === 0 || 
                 progressData.currentScenario === 0)) {
                console.log(`[${this.quizName}] Fixing inconsistent state: quiz marked as completed but has no progress`);
                progressData.status = 'in-progress';
            }

            // Update the player state with the loaded progress data
            this.player.experience = progressData.experience;
            this.player.questionHistory = progressData.questionHistory;
            this.player.currentScenario = progressData.currentScenario;
            
            console.log(`[${this.quizName}] Player state updated:`, {
                experience: this.player.experience,
                questionHistory: this.player.questionHistory.length,
                currentScenario: this.player.currentScenario,
                status: progressData.status
            });
            
            // Only show end screen if quiz is actually completed and has progress
            if ((progressData.status === 'completed' || 
                 progressData.status === 'passed' || 
                 progressData.status === 'failed') && 
                progressData.questionHistory.length > 0 && 
                progressData.currentScenario > 0) {
                console.log(`[${this.quizName}] Quiz is ${progressData.status} with ${progressData.questionHistory.length} questions answered`);
                this.endGame(progressData.status === 'failed');
                return true;
            }
            
            return progressData.questionHistory.length > 0;
        } catch (error) {
            console.error(`[${this.quizName}] Error loading progress:`, error);
            return false;
        }
    }
    
    /**
     * Saves quiz progress using the QuizProgressService
     */
    async saveProgress(status = 'in-progress') {
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.warn(`[${this.quizName}] No username found, cannot save progress`);
                return false;
            }
            
            // Make sure we have the correct quiz name
            const normalizedQuizName = this.quizProgressService.normalizeQuizName(this.quizName);
            
            // Build the progress data
            const progress = {
                experience: this.player.experience,
                questionsAnswered: this.player.questionHistory.length,
                currentScenario: this.player.currentScenario,
                status: status,
                scorePercentage: this.calculateScore(),
                questionHistory: this.player.questionHistory,
                lastUpdated: new Date().toISOString()
            };
            
            console.log(`[${this.quizName}] Saving progress:`, progress);
            
            // Use QuizProgressService to save progress
            const saveResult = await this.quizProgressService.saveQuizProgress(normalizedQuizName, progress);
            
            if (!saveResult.success) {
                console.error(`[${this.quizName}] Failed to save progress:`, saveResult.message);
                return false;
            }
            
            console.log(`[${this.quizName}] Progress saved successfully`);
            return true;
        } catch (error) {
            console.error(`[${this.quizName}] Error saving progress:`, error);
            return false;
        }
    }
    
    /**
     * Calculates the current score percentage for the quiz
     * @returns {number} Score percentage (0-100)
     */
    calculateScore() {
        try {
            if (!this.player.questionHistory || this.player.questionHistory.length === 0) {
                return 0;
            }
            
            // Count correctly answered questions
            const correctAnswers = this.player.questionHistory.filter(q => 
                q.selectedAnswer && (
                    q.selectedAnswer.isCorrect || 
                    (q.selectedAnswer.experience && q.scenario && q.scenario.options && 
                     q.selectedAnswer.experience === Math.max(...q.scenario.options.map(o => o.experience || 0)))
                )
            ).length;
            
            // Calculate percentage based on the total number of questions answered
            const totalAnswered = this.player.questionHistory.length;
            return Math.round((correctAnswers / Math.max(1, totalAnswered)) * 100);
        } catch (error) {
            console.error(`[${this.quizName}] Error calculating score:`, error);
            return 0;
        }
    }
    
    /**
     * Enhances option interactivity for better click handling and rapid selection
     * Call this method after creating option elements to improve user experience
     * @param {HTMLElement} optionDiv - The option div element
     * @param {HTMLInputElement} radioInput - The radio input element
     * @param {string} optionText - The option text for accessibility
     */
    enhanceOptionInteractivity(optionDiv, radioInput, optionText) {
        // Add click handler to the entire option div for better responsiveness
        optionDiv.addEventListener('click', (e) => {
            // Prevent double-clicking and ensure only one selection
            if (!radioInput.checked) {
                // Remove selected class from all other options
                document.querySelectorAll('.option.selected').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                radioInput.checked = true;
                optionDiv.classList.add('selected');
                
                // Trigger change event for consistency
                radioInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        
        // Add keyboard support for accessibility
        optionDiv.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!radioInput.checked) {
                    // Remove selected class from all other options
                    document.querySelectorAll('.option.selected').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    
                    radioInput.checked = true;
                    optionDiv.classList.add('selected');
                    radioInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });
        
        // Make the option div focusable for keyboard navigation
        optionDiv.setAttribute('tabindex', '0');
        optionDiv.setAttribute('role', 'radio');
        optionDiv.setAttribute('aria-label', optionText);
    }
} 