import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';
import { timeManagementScenarios } from '../data/timeManagement-scenarios.js';

export class TimeManagementQuiz extends BaseQuiz {
    constructor() {
        console.log('[TimeManagementQuiz] Initializing...');
        
        // Configure the quiz with basic settings
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a time management expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong time management instincts!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing time management best practices and try again!' }
            ],
            quizName: 'time-management',
            quizTitle: 'Time Management in Testing',
            quizDescription: 'Optimize your testing workflow and learn efficient time management techniques. Master prioritization, estimation, and planning skills to maximize your testing effectiveness while meeting deadlines and quality standards.'
        };
        
        // Call the parent constructor with our config
        super(config);

        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'time-management',
            writable: false,
            configurable: false,
            enumerable: true
        });

        // Initialize player state
        this.player = {
            name: '',
            experience: 0,
            questionHistory: [],
            currentScenario: 0,
        };

        // Load scenarios from our data file
        this.basicScenarios = timeManagementScenarios.basic;
        this.intermediateScenarios = timeManagementScenarios.intermediate;
        this.advancedScenarios = timeManagementScenarios.advanced;

        // Initialize elements
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');
        
        // Create level transition container if it doesn't exist
        if (!document.getElementById('level-transition-container')) {
            const transitionContainer = document.createElement('div');
            transitionContainer.id = 'level-transition-container';
            transitionContainer.className = 'level-transition-container';
            document.querySelector('.quiz-container').appendChild(transitionContainer);
        }
        
        // Timer-related properties
        this.questionTimer = null;
        this.questionStartTime = null;
        // Timer value is set by BaseQuiz constructor from admin settings
        this.timerStartTime = null; // When timer was started for persistence
        this.persistedTimeRemaining = null; // Restored time from localStorage
        
        this.isLoading = false;
        
        // Initialize settings (including quiz configuration)
        this.initializeSettings();

        // Initialize event listeners
        this.initializeEventListeners();

        // Start the quiz (wait for timer settings to be loaded)
        this.startGameWhenReady();
    }
    
    // Override the shouldEndGame method for our quiz
    shouldEndGame() {
        return this.player.questionHistory.length >= 15;
    }
    
    // Initialize event listeners
    initializeEventListeners() {
        // Add event listener for the restart button
        const restartButton = document.getElementById('restart-btn');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.restartQuiz());
        }
        
        // Add form submission handler
        document.getElementById('options-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAnswer();
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.type === 'radio') {
                this.handleAnswer();
            }
        });
    }
    
    // Get the current level based on question index
    getCurrentLevel() {
        const questionCount = this.player.questionHistory.length;
        
        if (questionCount < 5) {
            return 'Basic';
        } else if (questionCount < 10) {
            return 'Intermediate';
        } else {
            return 'Advanced';
        }
    }
    
    // Calculate the score percentage
    calculateScorePercentage() {
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && q.isCorrect
        ).length;
        return Math.round((correctAnswers / Math.max(1, this.player.questionHistory.length)) * 100);
    }

    // Wait for timer settings to be loaded before starting the game
    async startGameWhenReady() {
        console.log('[TimeManagementQuiz] Waiting for timer settings to be loaded...');
        
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkTimerSettings = () => {
            attempts++;
            console.log(`[TimeManagementQuiz] Check attempt ${attempts}, timePerQuestion: ${this.timePerQuestion}`);
            
            // Check if timer settings have been loaded (either from API or default)
            if (this.timePerQuestion !== undefined && this.timePerQuestion !== null) {
                console.log(`[TimeManagementQuiz] Timer settings loaded: ${this.timePerQuestion}s per question`);
                
                // Add page unload handler for timer persistence
                this.addPageUnloadHandler();
                
                this.startGame();
                return;
            }
            
            if (attempts >= maxAttempts) {
                console.warn('[TimeManagementQuiz] Timer settings not loaded after maximum attempts, using BaseQuiz value');
                
                // Add page unload handler for timer persistence
                this.addPageUnloadHandler();
                
                this.startGame();
                return;
            }
            
            // Wait and check again
            setTimeout(checkTimerSettings, 100);
        };
        
        checkTimerSettings();
    }

    // Add handler to save timer state when user leaves the page
    addPageUnloadHandler() {
        const saveTimerOnUnload = () => {
            if (this.questionTimer && this.timerStartTime) {
                this.saveCurrentTimerState();
            }
        };

        window.addEventListener('beforeunload', saveTimerOnUnload);
        
        // Also save on visibility change (when user switches tabs)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.questionTimer && this.timerStartTime) {
                this.saveCurrentTimerState();
            }
        });
    }

    // Start the quiz
    async startGame() {
        if (this.isLoading) return;
        
        console.log('[TimeManagementQuiz] Starting game...');
        
        try {
            this.isLoading = true;
            
            // Display the quiz name
            this.displayQuizName();
            
            // Show loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.remove('hidden');
            }

            // Set player name
            this.player.name = localStorage.getItem('username');
            if (!this.player.name) {
                window.location.href = '../login.html';
                return;
            }

            // Try to load previous progress
            const hasProgress = await this.loadProgress();
            console.log(`[TimeManagementQuiz] Progress loaded: ${hasProgress}`);
            
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
            
            if (!hasProgress) {
                // Reset player state if no valid progress exists
                this.player.experience = 0;
                this.player.currentScenario = 0;
                this.player.questionHistory = [];
                console.log('[TimeManagementQuiz] No previous progress, starting fresh');
            } else {
                // Verify the loaded progress contains valid question history
                if (!this.player.questionHistory || !Array.isArray(this.player.questionHistory)) {
                    console.log('[TimeManagementQuiz] Invalid question history in loaded progress, resetting');
                    this.player.questionHistory = [];
                }
                
                // CRITICAL: Ensure currentScenario is set correctly based on question history
                this.player.currentScenario = this.player.questionHistory.length;
                console.log('[TimeManagementQuiz] Set currentScenario to match question history:', this.player.currentScenario);
            }
            
            // Check if we should show the introduction page
            const introShown = await this.checkForIntroAndStart();
            if (introShown) {
                this.hideLoadingOverlay();
                this.isLoading = false;
                return; // Introduction page is shown, quiz will start when user clicks start
            }
            
            // Check if the quiz is already completed
            if (this.shouldEndGame()) {
                this.endGame(false);
                // Hide loading overlay when showing completed quiz
                this.hideLoadingOverlay();
                return;
            }
            
            // Clear any existing transition messages
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = '';
                transitionContainer.classList.remove('active');
            }

            // Display the first/next scenario
            this.displayScenario();
            
            // Hide loading overlay once quiz is ready
            this.hideLoadingOverlay();
            this.isLoading = false;
        } catch (error) {
            console.error('[TimeManagementQuiz] Error starting game:', error);
            this.isLoading = false;
            this.showError('Failed to start the quiz. Please refresh the page.');
            // Hide loading overlay even on error
            this.hideLoadingOverlay();
        }
    }
    
    // Initialize the timer for the current question
    initializeTimer() {
        console.log(`[TimeManagementQuiz] Initializing timer for question ${this.player.questionHistory.length}`);
        
        // Clear any existing timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
        
        // Reset timer display
        const timerContainer = document.getElementById('timer-container');
        const timerDisplay = document.getElementById('timer-display');
        
        if (!timerContainer || !timerDisplay) {
            console.error('[TimeManagementQuiz] Timer elements not found');
            return;
        }
        
        // Check if timer is disabled (0 seconds) or timer functionality is disabled
        if (this.timerDisabled || this.timePerQuestion === 0) {
            console.log(`[TimeManagementQuiz] Timer is disabled, hiding timer display`);
            timerContainer.classList.add('hidden');
            return;
        }
        
        // Show the timer
        timerContainer.classList.remove('hidden');
        timerContainer.classList.remove('visually-hidden');
        
        // Check for restored timer state first
        const restoredTime = this.restoreTimerState();
        let timeLeft;
        
        if (restoredTime !== null) {
            timeLeft = restoredTime;
            console.log(`[TimeManagementQuiz] Restored timer with ${timeLeft} seconds remaining`);
        } else {
            timeLeft = this.timePerQuestion;
            console.log(`[TimeManagementQuiz] Starting new timer with ${timeLeft} seconds`);
        }
        
        timerDisplay.textContent = `${timeLeft}s`;
        this.timerStartTime = Date.now();
        
        // Save timer state periodically
        const saveInterval = setInterval(() => {
            if (this.questionTimer && this.timerStartTime) {
                this.saveCurrentTimerState();
            } else {
                clearInterval(saveInterval);
            }
        }, 3000); // Save every 3 seconds
        
        this.questionStartTime = Date.now();
        this.questionTimer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(this.questionTimer);
                clearInterval(saveInterval);
                this.questionTimer = null;
                this.handleTimedOut();
            }
        }, 1000);
    }
    
    // Handle when time runs out for a question
    handleTimedOut() {
        console.log('[TimeManagementQuiz] Question timed out');
        
        // Select a random option if none selected
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (!selectedOption) {
            const options = document.querySelectorAll('input[name="option"]');
            if (options.length > 0) {
                const randomIndex = Math.floor(Math.random() * options.length);
                options[randomIndex].checked = true;
            }
        }
        
        // Submit the answer with the timed out flag
        this.handleAnswer(true);
    }
    
    // Display the current scenario
    displayScenario() {
        // Check if the quiz is already completed
        if (this.shouldEndGame()) {
            this.endGame(false);
                    // Hide loading overlay when showing completed quiz
                this.hideLoadingOverlay();
                return;
        }
        
        // Get the current scenario based on progress
        const currentScenarios = this.getCurrentScenarios();
        const scenarioIndex = this.player.questionHistory.length % 5; // Use modulo to cycle through 5 scenarios per level
        const scenario = currentScenarios[scenarioIndex]; 
        
        console.log(`[TimeManagementQuiz] Displaying scenario #${this.player.currentScenario + 1}:`, {
            title: scenario.title,
            level: this.getCurrentLevel(),
            index: scenarioIndex
        });
        
        // Show level transition message when level changes
        const currentLevel = this.getCurrentLevel();
        const questionCount = this.player.questionHistory.length;
        
        if (questionCount === 0 || 
            (questionCount === 5 && currentLevel === 'Intermediate') || 
            (questionCount === 10 && currentLevel === 'Advanced')) {
            
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = ''; // Clear any existing messages
                
                const levelMessage = document.createElement('div');
                levelMessage.className = 'level-transition';
                levelMessage.setAttribute('role', 'alert');
                levelMessage.textContent = `Starting ${currentLevel} Questions`;
                
                transitionContainer.appendChild(levelMessage);
                transitionContainer.classList.add('active');
                
                // Remove the message and container height after animation
                setTimeout(() => {
                    transitionContainer.classList.remove('active');
                    setTimeout(() => {
                        transitionContainer.innerHTML = '';
                    }, 300); // Wait for height transition to complete
                }, 3000);
            }
        }

        // Update UI for scenario
        const titleElement = document.getElementById('scenario-title');
        const descriptionElement = document.getElementById('scenario-description');
        
        if (titleElement && descriptionElement) {
            titleElement.textContent = scenario.title;
            descriptionElement.textContent = scenario.description;
        }

        // Update question progress
        const questionProgress = document.getElementById('question-progress');
        if (questionProgress) {
            questionProgress.textContent = `Question: ${questionCount + 1}/15`;
        }
        
        // Update level indicator
        const levelIndicator = document.getElementById('level-indicator');
        if (levelIndicator) {
            levelIndicator.textContent = `Level: ${currentLevel}`;
        }
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progressPercentage = (questionCount / 15) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        // Display options with enhanced shuffling from BaseQuiz
        const optionsContainer = document.getElementById('options-container');
        if (optionsContainer) {
            optionsContainer.innerHTML = '';

            // Use enhanced shuffling from BaseQuiz for better randomization
            const shuffledOptions = this.shuffleScenarioOptions(scenario);
            
            shuffledOptions.forEach((option, idx) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.innerHTML = `
                <input type="radio" 
                    name="option" 
                    value="${option.originalIndex}" 
                        id="option${idx}"
                    tabindex="0"
                    aria-label="${option.text}"
                    role="radio">
                    <label for="option${idx}">${option.text}</label>
                `;
                
                // Enhance option interactivity using the BaseQuiz helper method
                const radioInput = optionDiv.querySelector('input[type="radio"]');
                this.enhanceOptionInteractivity(optionDiv, radioInput, option.text);
                
                optionsContainer.appendChild(optionDiv);
            });
        }
        
        // Show game screen
        this.gameScreen.classList.remove('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');
        
        // Initialize timer for the question
        this.initializeTimer();
        
        // Save progress after displaying - ensures we're in a consistent state
        if (this.player.questionHistory.length > 0) {
            // Only save if we have actual progress to avoid recursive saves
            this.saveProgress('in-progress').catch(err => {
                console.warn('[TimeManagementQuiz] Save after display failed:', err);
            });
        }
    }
    
    // Handle answer submission
    async handleAnswer(timedOut = false) {
        if (this.isLoading) return;
        
        // Debouncing: prevent rapid successive submissions
        const now = Date.now();
        if (now - this.lastSubmitTime < this.SUBMIT_COOLDOWN) {
            console.log('[Quiz] Submission ignored - too soon after last attempt');
            return;
        }
        this.lastSubmitTime = now;
        
        try {
            this.isLoading = true;
        
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
        }

            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption && !timedOut) {
                this.showToast('Please select an answer before submitting.', 'warning');
                this.isLoading = false;
                if (submitButton) {
                    submitButton.disabled = false;
                }
                // Timer continues running - no need to restart
                return;
            }
            
            // Clear the timer only after validation passes
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
            }
            
            // Clear timer persistence state since question is being completed
            this.clearCurrentTimerState()
            
            // Get the selected option index
            const optionIndex = selectedOption ? parseInt(selectedOption.value) : 0;
            
            // Get the current scenario
            const currentScenarios = this.getCurrentScenarios();
            const scenarioIndex = this.player.questionHistory.length % 5;
            const scenario = currentScenarios[scenarioIndex];
            
            // Get the selected answer
            const selectedAnswer = scenario.options[optionIndex];
            
            // Add to player experience (no points if timed out)
            if (!timedOut) {
                this.player.experience += selectedAnswer.experience;
            }

            // Find the correct answer (option with highest experience)
            const correctAnswer = scenario.options.reduce((prev, current) => 
                (prev.experience > current.experience) ? prev : current
            );

            // Mark selected answer as correct or incorrect
            // If timed out, always mark as incorrect regardless of the randomly selected answer
            if (timedOut) {
                selectedAnswer.isCorrect = false;
            } else {
                selectedAnswer.isCorrect = selectedAnswer === correctAnswer;
            }
            
            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add to question history - use the LOCAL scenario variable, not this.currentScenario
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: selectedAnswer.isCorrect,
                timeSpent: timeSpent
            });

            // Update experience (already done above, but ensure consistency)
            this.player.experience = Math.min(
                this.maxXP || 300,
                this.player.experience
            );

            // Increment scenario counter
            this.player.currentScenario++;

            // CRITICAL FIX: Show outcome screen immediately
            if (this.gameScreen && this.outcomeScreen) {
                this.gameScreen.classList.add('hidden');
                this.outcomeScreen.classList.remove('hidden');
            }

            // Show outcome content
            this.showOutcome(selectedAnswer);

            // Save progress in background (non-blocking)
            this.saveProgress().catch(err => {
                console.error('[TimeManagementQuiz] Failed to save progress:', err);
            });

            this.updateProgress();
            
        } catch (error) {
            console.error('[TimeManagementQuiz] Error handling answer:', error);
            this.showError('Failed to process your answer. Please try again.');
        } finally {
            this.isLoading = false;
            const submitButton = document.querySelector('.submit-button');
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    }

    // Move to the next scenario
    nextScenario() {
        // Hide outcome screen and show game screen
        if (this.outcomeScreen && this.gameScreen) {
            this.outcomeScreen.classList.add('hidden');
            this.gameScreen.classList.remove('hidden');
        }
        
        // Display next scenario
        this.displayScenario();
    }

    // Update progress display
    updateProgress() {
        // Get current level and question count
        const currentLevel = this.getCurrentLevel();
        const totalAnswered = this.player.questionHistory.length;
        const questionNumber = Math.min(totalAnswered + 1, 15);
        
        // Update level indicator
        const levelIndicator = document.getElementById('level-indicator');
        if (levelIndicator) {
            levelIndicator.textContent = `Level: ${currentLevel}`;
        }
        
        // Update question progress
        const questionProgress = document.getElementById('question-progress');
        if (questionProgress) {
            questionProgress.textContent = `Question: ${questionNumber}/15`;
        }
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progressPercentage = (totalAnswered / 15) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
    }

    // End the quiz
    async endGame(failed = false) {
        // Use parent's endGame method which respects configuration
        await super.endGame(failed);
    }
    
    // Restart the quiz
    async restartQuiz() {
        console.log('[TimeManagementQuiz] Restarting quiz...');
        
        // Clear the timer if it exists
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
        
        // Clear timer persistence state for current question
        this.clearCurrentTimerState();
        
        // Reset player state
        this.player = {
            name: localStorage.getItem('username'),
            experience: 0,
            questionHistory: [],
            currentScenario: 0,
        };
        
        // Save reset progress
        await this.saveProgress('in-progress');
        
        // Reset UI
        this.gameScreen.classList.remove('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');
        
        // Clear any existing transition messages
        const transitionContainer = document.getElementById('level-transition-container');
        if (transitionContainer) {
            transitionContainer.innerHTML = '';
            transitionContainer.classList.remove('active');
        }
        
        // Start again
        this.displayScenario();
    }
    
    // Helper for showing errors
    showError(message) {
        console.error('[TimeManagementQuiz] Error:', message);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff4444;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-weight: bold;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    // Timer persistence methods
    getTimerStorageKey() {
        const username = localStorage.getItem('username') || 'anonymous';
        const questionIndex = this.player.questionHistory.length;
        return `time-management_timer_${username}_q${questionIndex}`;
    }
    
    saveTimerState(timeRemaining) {
        try {
            const timerData = {
                timeRemaining: timeRemaining,
                questionIndex: this.player.questionHistory.length,
                timestamp: Date.now()
            };
            localStorage.setItem(this.getTimerStorageKey(), JSON.stringify(timerData));
        } catch (error) {
            console.warn('[TimeManagementQuiz] Failed to save timer state:', error);
        }
    }
    
    restoreTimerState() {
        try {
            const storageKey = this.getTimerStorageKey();
            const savedData = localStorage.getItem(storageKey);
            
            if (!savedData) {
                return null;
            }
            
            const timerData = JSON.parse(savedData);
            const currentQuestionIndex = this.player.questionHistory.length;
            
            // Validate that this timer data is for the current question
            if (timerData.questionIndex !== currentQuestionIndex) {
                console.log('[TimeManagementQuiz] Timer data is for different question, ignoring');
                localStorage.removeItem(storageKey);
                return null;
            }
            
            // Check if the data is not too old (10 minutes max)
            const maxAge = 10 * 60 * 1000; // 10 minutes
            if (Date.now() - timerData.timestamp > maxAge) {
                console.log('[TimeManagementQuiz] Timer data is too old, ignoring');
                localStorage.removeItem(storageKey);
                return null;
            }
            
            // Validate time remaining
            if (timerData.timeRemaining <= 0) {
                localStorage.removeItem(storageKey);
                return null;
            }
            
            console.log(`[TimeManagementQuiz] Restored timer state: ${timerData.timeRemaining}s remaining`);
            return timerData.timeRemaining;
            
        } catch (error) {
            console.warn('[TimeManagementQuiz] Failed to restore timer state:', error);
            return null;
        }
    }
    
    clearCurrentTimerState() {
        try {
            const storageKey = this.getTimerStorageKey();
            localStorage.removeItem(storageKey);
            console.log('[TimeManagementQuiz] Cleared current timer state');
        } catch (error) {
            console.warn('[TimeManagementQuiz] Failed to clear timer state:', error);
        }
    }
    
    clearAllTimerStates() {
        try {
            const username = localStorage.getItem('username') || 'anonymous';
            const prefix = `time-management_timer_${username}_`;
            
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            console.log(`[TimeManagementQuiz] Cleared ${keysToRemove.length} timer states`);
        } catch (error) {
            console.warn('[TimeManagementQuiz] Failed to clear timer states:', error);
        }
    }
    
    saveCurrentTimerState() {
        if (!this.questionTimer || !this.timerStartTime) {
            return;
        }
        
        try {
            // Calculate remaining time from timer display
            const timerDisplay = document.getElementById('timer-display');
            if (timerDisplay) {
                const displayedTime = parseInt(timerDisplay.textContent);
                if (!isNaN(displayedTime) && displayedTime > 0) {
                    this.saveTimerState(displayedTime);
                }
            }
        } catch (error) {
            console.error('[TimeManagementQuiz] Error saving current timer state:', error);
        }
    }
}

// Create and initialize the quiz when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[TimeManagementQuiz] DOM loaded, initializing quiz...');
    window.timeManagementQuiz = new TimeManagementQuiz();
}); 