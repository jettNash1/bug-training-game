import { QuizUser } from './QuizUser.js';
import { APIService } from './api-service.js';

export class BaseQuiz {
    constructor(config) {
        this.config = config;
        this.maxXP = config.maxXP;
        this.levelThresholds = config.levelThresholds;
        this.performanceThresholds = config.performanceThresholds;
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.isLoading = false;
        this.questionTimer = null;
        this.apiService = new APIService();
        this.guideUrl = null;
        this.showGuideButton = false;
        
        // Attempt to get quiz name from config, URL, or data attributes
        this.quizName = config.quizName || this.detectQuizNameFromPage();
        console.log('[Quiz] Detected quiz name:', this.quizName);
        
        // Initialize timer value with a temporary default
        // The actual value will be set by loadTimerSettings
        this.timePerQuestion = null;
        this.remainingTime = null;
        this.questionStartTime = null; // Track when each question starts
        
        // Load timer settings from API immediately
        this.initializeTimerSettings();
        
        // For guide settings, we'll wait until the quiz starts
        // or load them after a short delay to ensure quiz name is set
        if (this.quizName) {
            this.initializeGuideSettings();
        } else {
            // Delay guide initialization to allow derived classes to set quizName
            setTimeout(() => {
                if (!this.quizName) {
                    this.quizName = this.detectQuizNameFromPage();
                    console.log('[Quiz] Delayed detection of quiz name:', this.quizName);
                }
                if (this.quizName) {
                    this.initializeGuideSettings();
                }
            }, 500);
        }
    }

    // Helper method to detect quiz name from URL or document
    detectQuizNameFromPage() {
        try {
            // Try to get from URL first
            const urlParams = new URLSearchParams(window.location.search);
            const quizParam = urlParams.get('quiz') || urlParams.get('quizName');
            if (quizParam) {
                return quizParam.toLowerCase();
            }
            
            // Try to get from path
            const pathMatch = window.location.pathname.match(/\/([^\/]+)-quiz\.html$/);
            if (pathMatch && pathMatch[1]) {
                return pathMatch[1].toLowerCase();
            }
            
            // Try to get from page elements
            const quizTitle = document.querySelector('h1, .quiz-title');
            if (quizTitle && quizTitle.textContent) {
                // Convert title to likely quiz name: "Communication Quiz" -> "communication"
                return quizTitle.textContent.replace(/\s+quiz$/i, '').trim().toLowerCase();
            }
            
            // Try to get from data attribute
            const quizContainer = document.querySelector('[data-quiz-name], [data-quiz-id], [data-quiz]');
            if (quizContainer) {
                return (quizContainer.dataset.quizName || 
                        quizContainer.dataset.quizId || 
                        quizContainer.dataset.quiz || '').toLowerCase();
            }
            
            // Last resort: try to detect from page title
            if (document.title && document.title.includes('Quiz')) {
                return document.title.replace(/\s+quiz$/i, '').trim().toLowerCase();
            }
            
            return null;
        } catch (e) {
            console.error('[Quiz] Error detecting quiz name:', e);
            return null;
        }
    }

    async initializeTimerSettings() {
        try {
            // Wait for timer settings to be loaded before proceeding
            await this.loadTimerSettings();
            console.log('Timer settings initialized:', this.timePerQuestion / 1000, 'seconds');
        } catch (error) {
            console.error('Failed to initialize timer settings:', error);
            // Set default values only if loading fails
            this.timePerQuestion = 60000; // Default 60 seconds
            this.remainingTime = this.timePerQuestion;
        }
    }

    async loadTimerSettings() {
        try {
            // Get quiz-specific timer value
            const timerValue = await this.apiService.getQuizTimerValue(this.quizName);
            console.log('Loaded timer value for quiz:', this.quizName, timerValue, 'seconds');
            
            // Convert to milliseconds and update timer settings
            this.timePerQuestion = timerValue * 1000;
            this.remainingTime = this.timePerQuestion;
            
            // Update timer display if it exists
            const timerContainer = document.getElementById('timer-container');
            if (timerContainer) {
                this.updateTimerDisplay();
            }
        } catch (error) {
            console.error('Failed to load timer settings:', error);
            throw error; // Let the caller handle the error
        }
    }

    async initializeGuideSettings() {
        console.log(`[Guide] Initializing guide settings for quiz: ${this.quizName}`);
        
        // Force the guide button to show during development - REMOVE THIS IN PRODUCTION
        // Uncomment these lines to force enable the guide button for testing
        /*
        this.guideUrl = "https://example.com/guide";
        this.showGuideButton = true;
        console.log(`[Guide] DEVELOPMENT MODE: Force enabled guide with URL ${this.guideUrl}`);
        this.updateGuideButton();
        return;
        */
        
        if (!this.quizName) {
            console.error('[Guide] Quiz name not set, cannot initialize guide settings');
            return;
        }
        
        try {
            if (!this.apiService) {
                console.error('[Guide] API service not available');
                return;
            }
            
            console.log(`[Guide] Fetching guide settings for ${this.quizName} using API service`);
            const response = await this.apiService.fetchGuideSettings(this.quizName);
            
            console.log(`[Guide] Guide settings response:`, response);
            
            if (response.success) {
                const settings = response.data;
                
                if (settings) {
                    console.log(`[Guide] Applying guide settings:`, settings);
                    // Apply the settings to the quiz
                    this.guideUrl = settings.url;
                    this.showGuideButton = settings.enabled;
                    
                    console.log(`[Guide] Settings applied - URL: ${this.guideUrl}, Enabled: ${this.showGuideButton}`);
                    
                    if (settings.source === 'localStorage') {
                        console.warn(`[Guide] Using localStorage fallback for guide settings`);
                    }
                } else {
                    console.warn(`[Guide] No settings found in response`);
                    this.guideUrl = null;
                    this.showGuideButton = false;
                }
            } else {
                console.error('[Guide] Failed to load guide settings:', response);
                this.guideUrl = null;
                this.showGuideButton = false;
            }
        } catch (error) {
            console.error(`[Guide] Error loading guide settings:`, error);
            this.guideUrl = null;
            this.showGuideButton = false;
        }
        
        // Check if we actually have valid settings
        if (this.showGuideButton && !this.guideUrl) {
            console.warn(`[Guide] Guide button enabled but URL is missing - disabling button`);
            this.showGuideButton = false;
        }
        
        // Update the UI to show or hide the button
        console.log(`[Guide] Calling updateGuideButton() with URL: ${this.guideUrl}, Enabled: ${this.showGuideButton}`);
        this.updateGuideButton();
    }

    updateGuideButton() {
        // Remove existing guide button if any
        const existingButton = document.getElementById('guide-button-container');
        if (existingButton) {
            existingButton.remove();
        }

        console.log(`[Guide] updateGuideButton called - showGuideButton: ${this.showGuideButton}, guideUrl: ${this.guideUrl}`);

        // If guide is enabled and URL is set, show the button
        if (this.showGuideButton && this.guideUrl) {
            console.log(`[Guide] Creating guide button for URL: ${this.guideUrl}`);
            
            // Create button element
            const guideButton = document.createElement('button');
            guideButton.id = 'guide-button';
            guideButton.className = 'guide-button';
            guideButton.innerHTML = '<i class="fas fa-book"></i> Guide';
            guideButton.setAttribute('aria-label', 'Open quiz guide');
            guideButton.onclick = () => window.open(this.guideUrl, '_blank');
            
            // Add styles directly to ensure they are applied
            guideButton.style.backgroundColor = '#4e73df';
            guideButton.style.color = 'white';
            guideButton.style.border = 'none';
            guideButton.style.borderRadius = '4px';
            guideButton.style.padding = '8px 16px';
            guideButton.style.margin = '10px 0';
            guideButton.style.cursor = 'pointer';
            guideButton.style.display = 'flex';
            guideButton.style.alignItems = 'center';
            guideButton.style.justifyContent = 'center';
            guideButton.style.gap = '8px';
            guideButton.style.fontWeight = '500';
            guideButton.style.fontSize = '14px';
            guideButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            
            // Create container for the button
            const buttonContainer = document.createElement('div');
            buttonContainer.id = 'guide-button-container';
            buttonContainer.className = 'guide-button-container';
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'center';
            buttonContainer.style.width = '100%';
            buttonContainer.style.marginBottom = '10px';
            buttonContainer.appendChild(guideButton);
            
            // Try multiple placement approaches for robustness
            let insertionSuccessful = false;
            
            // Approach 1: Insert after timer
            const timerContainer = document.getElementById('timer-container');
            if (timerContainer && timerContainer.parentNode) {
                console.log('[Guide] Adding guide button after timer container');
                timerContainer.parentNode.insertBefore(buttonContainer, timerContainer.nextSibling);
                insertionSuccessful = true;
            } 
            
            // Approach 2: Insert at beginning of game screen
            if (!insertionSuccessful) {
                const gameScreen = document.getElementById('game-screen');
                if (gameScreen) {
                    console.log('[Guide] Adding guide button to beginning of game screen');
                    gameScreen.insertBefore(buttonContainer, gameScreen.firstChild);
                    insertionSuccessful = true;
                }
            }
            
            // Approach 3: Find a question container
            if (!insertionSuccessful) {
                const questionContainer = document.querySelector('.question-container, #question-container, #scenario-container, .scenario-container');
                if (questionContainer) {
                    console.log('[Guide] Adding guide button before question container');
                    questionContainer.parentNode.insertBefore(buttonContainer, questionContainer);
                    insertionSuccessful = true;
                }
            }
            
            // Approach 4: Try to find the title element
            if (!insertionSuccessful) {
                const titleElement = document.querySelector('h1, .quiz-title, #scenario-title, .scenario-title');
                if (titleElement) {
                    console.log('[Guide] Adding guide button after quiz title');
                    if (titleElement.parentNode) {
                        titleElement.parentNode.insertBefore(buttonContainer, titleElement.nextSibling);
                        insertionSuccessful = true;
                    }
                }
            }
            
            // Approach 5: Last resort - add to body
            if (!insertionSuccessful) {
                console.log('[Guide] Adding guide button to document body as last resort');
                document.body.insertBefore(buttonContainer, document.body.firstChild);
                insertionSuccessful = true;
            }
            
            console.log('[Guide] Guide button added successfully');
            
            // Store a reference for debugging
            window.guideButton = guideButton;
            window.quizHelper = this;
        } else {
            console.log('[Guide] Guide button not shown: showGuideButton =', this.showGuideButton, 'guideUrl =', this.guideUrl);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    shouldEndGame(totalQuestionsAnswered, currentXP) {
        // End game if we've answered all questions or reached max XP
        return totalQuestionsAnswered >= 15 || currentXP >= this.maxXP;
    }

    // Base quiz methods...
    initializeEventListeners() {
        // Add event listeners for quiz navigation and interaction
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', () => this.handleOptionSelect(option));
        });

        document.getElementById('next-button')?.addEventListener('click', () => this.nextQuestion());
        document.getElementById('finish-button')?.addEventListener('click', () => this.finishQuiz());
    }

    startGame() {
        this.player.name = localStorage.getItem('username');
        if (!this.player.name) {
            window.location.href = '/login.html';
            return;
        }
        
        // Make sure we have the quiz name set
        if (!this.quizName) {
            this.quizName = this.detectQuizNameFromPage();
            console.log('[Quiz] Setting quiz name in startGame:', this.quizName);
        }
        
        // Initialize or reinitialize guide settings
        if (this.quizName) {
            console.log('[Quiz] Initializing guide settings in startGame');
            this.initializeGuideSettings();
        }
        
        // Create a global reference for debugging
        window.quizHelper = this;
        
        this.showQuestion();
    }

    async initializeTimer() {
        // If timer is disabled (value is 0), don't create timer UI
        if (this.timePerQuestion === 0) {
            // Clear any existing timer if it exists
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
            }
            
            // Remove timer container if it exists
            const existingTimer = document.getElementById('timer-container');
            if (existingTimer) {
                existingTimer.remove();
            }
            
            return;
        }
    
        // Create timer UI if it doesn't exist
        let timerContainer = document.getElementById('timer-container');
        if (!timerContainer) {
            timerContainer = document.createElement('div');
            timerContainer.id = 'timer-container';
            timerContainer.setAttribute('role', 'timer');
            timerContainer.setAttribute('aria-label', 'Question timer');
            this.gameScreen.insertBefore(timerContainer, this.gameScreen.firstChild);
        }

        // Ensure timer value is up to date by checking API
        try {
            const timerValue = await this.apiService.getQuizTimerValue(this.quizName);
            this.timePerQuestion = timerValue * 1000; // convert to milliseconds
        } catch (error) {
            console.error('Failed to refresh timer settings:', error);
            // Keep using current timer value if API call fails
        }

        // Reset and start timer
        this.remainingTime = this.timePerQuestion;
        this.updateTimerDisplay();
        
        // Clear any existing timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }

        // Start new timer
        this.questionTimer = setInterval(() => {
            this.remainingTime -= 1000;
            this.updateTimerDisplay();

            if (this.remainingTime <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        // If timer is disabled, don't update display
        if (this.timePerQuestion === 0) {
            return;
        }
        
        const timerContainer = document.getElementById('timer-container');
        if (!timerContainer) return;
        
        const seconds = Math.ceil(this.remainingTime / 1000);
        timerContainer.textContent = `Time remaining: ${seconds}s`;
        
        // Add warning class when time is running low (less than 5 seconds)
        if (seconds <= 5) {
            timerContainer.classList.add('timer-warning');
        } else {
            timerContainer.classList.remove('timer-warning');
        }
    }

    handleTimeUp() {
        // If timer is disabled, don't handle time up
        if (this.timePerQuestion === 0) {
            return;
        }
        
        clearInterval(this.questionTimer);
        
        // Get current scenario
        const currentScenario = this.getCurrentScenario();
        
        // Find the correct answer (option with highest experience)
        const correctOption = currentScenario.options.reduce((prev, current) => 
            (prev.experience > current.experience) ? prev : current
        );
        
        // Create a time-up option with 0 experience and include correct answer
        const timeUpOption = {
            text: "Time's up - No answer selected",
            outcome: "You did not answer in time.",
            experience: 0,
            isTimeout: true  // Add a flag to identify this as a timeout option
        };

        // Record the choice with timing information
        const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : this.timePerQuestion;
        this.player.questionHistory.push({
            scenario: currentScenario,
            selectedAnswer: timeUpOption,
            status: 'failed',
            timeSpent: timeSpent,
            timedOut: true
        });

        // Increment current scenario
        this.player.currentScenario++;
        
        // Save progress to ensure timeout is recorded
        this.saveProgress().catch(error => {
            console.error('Failed to save progress after timeout:', error);
        });
        
        // Calculate score data for quiz result
        const totalQuestions = 15;
        const completedQuestions = this.player.questionHistory.length;
        const percentComplete = Math.round((completedQuestions / totalQuestions) * 100);
        
        const score = {
            quizName: this.quizName,
            score: percentComplete,
            experience: this.player.experience,
            questionHistory: this.player.questionHistory,
            questionsAnswered: completedQuestions,
            lastActive: new Date().toISOString()
        };
        
        // Save quiz result
        const username = localStorage.getItem('username');
        if (username) {
            const quizUser = new QuizUser(username);
            quizUser.updateQuizScore(
                this.quizName,
                score.score, 
                score.experience,
                this.player.tools,
                score.questionHistory,
                score.questionsAnswered
            ).catch(error => {
                console.error('Failed to update quiz score after timeout:', error);
            });
        }

        // Show outcome
        this.showOutcome(timeUpOption);
    }

    // Default saveProgress method that will be called by handleTimeUp
    // if the quiz implementation doesn't override it
    async saveProgress() {
        // Determine status based on progress
        let status = 'in-progress';
        
        // Check for completion (all 15 questions answered)
        if (this.player.questionHistory.length >= 15) {
            // Set completed status if all questions are answered
            status = 'completed';
        }

        const progress = {
            data: {
                experience: this.player.experience || 0,
                tools: this.player.tools || [],
                currentScenario: this.player.currentScenario || 0,
                questionHistory: this.player.questionHistory || [],
                lastUpdated: new Date().toISOString(),
                questionsAnswered: this.player.questionHistory?.length || 0,
                status: status
            }
        };

        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot save progress');
                return;
            }
            
            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify(progress));
            
            console.log('Saving progress (BaseQuiz) with status:', status);
            
            // If apiService is available, use it to save progress to the server
            if (this.apiService && typeof this.apiService.saveQuizProgress === 'function') {
                await this.apiService.saveQuizProgress(this.quizName, progress.data);
            } else {
                console.warn('No apiService available to save progress to server');
            }
        } catch (error) {
            console.error('Failed to save progress in BaseQuiz:', error);
            throw error;
        }
    }

    showQuestion() {
        if (this.isLoading) return;

        const currentScenario = this.getCurrentScenario();
        if (!currentScenario) {
            this.finishQuiz();
            return;
        }

        // Record start time for this question
        this.questionStartTime = Date.now();

        // Update UI with current scenario
        document.getElementById('scenario-title').textContent = currentScenario.title;
        document.getElementById('scenario-description').textContent = currentScenario.description;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        currentScenario.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'quiz-option';
            button.textContent = option.text;
            button.dataset.index = index;
            optionsContainer.appendChild(button);
        });

        // Re-attach event listeners
        this.initializeEventListeners();
        
        // Initialize timer for the new question
        this.initializeTimer();
    }

    handleOptionSelect(optionElement) {
        // Clear the timer when an option is selected
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }

        const currentScenario = this.getCurrentScenario();
        const selectedOption = currentScenario.options[optionElement.dataset.index];
        
        // Calculate time spent on this question
        const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;
        
        // Record the choice
        this.player.questionHistory.push({
            scenarioId: currentScenario.id,
            selectedOption: selectedOption.text,
            outcome: selectedOption.outcome,
            experience: selectedOption.experience,
            timeSpent: timeSpent,
            timedOut: false
        });

        // Update experience
        this.player.experience += selectedOption.experience;
        if (selectedOption.tool && !this.player.tools.includes(selectedOption.tool)) {
            this.player.tools.push(selectedOption.tool);
        }

        // Show outcome
        this.showOutcome(selectedOption);
    }

    showOutcome(option) {
        // Hide game screen and show outcome screen
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.remove('hidden');

        // Get current scenario and find correct answer
        const currentScenario = this.getCurrentScenario();
        const correctAnswer = currentScenario.options.reduce((prev, current) => 
            (prev.experience > current.experience) ? prev : current
        );

        // Update outcome text
        const outcomeText = document.getElementById('outcome-text');
        if (outcomeText) {
            // Check if this is a timeout scenario using the isTimeout flag
            if (option.isTimeout) {
                // Only show the timeout message without the correct answer
                outcomeText.textContent = `You did not answer in time.`;
            } else {
                // Normal scenario - user selected an answer
                // Only show the user's selected answer outcome, not the correct answer
                outcomeText.textContent = option.outcome;
            }
        }

        // Get the rewards container
        const rewardsDiv = document.getElementById('rewards');
        
        // Handle rewards visibility
        if (option.isTimeout) {
            // Hide the rewards div completely for timeout scenarios
            if (rewardsDiv) rewardsDiv.style.display = 'none';
        } else {
            // Show rewards for normal scenarios
            if (rewardsDiv) rewardsDiv.style.display = '';
            
            // Update XP display
            const xpGained = document.getElementById('xp-gained');
            if (xpGained) {
                xpGained.textContent = option.experience >= 0 ? 
                    `Experience gained: +${option.experience}` : 
                    `Experience: ${option.experience}`;
            }
            
            // Update tool display if applicable
            const toolGained = document.getElementById('tool-gained');
            if (toolGained) {
                toolGained.textContent = option.tool ? `Tool acquired: ${option.tool}` : '';
            }
        }

        // Update progress display
        this.updateProgress();
    }

    nextQuestion() {
        // Increment current scenario
        this.player.currentScenario++;

        // Hide outcome screen and show game screen
        this.outcomeScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');

        // Display next scenario
        this.displayScenario();
    }

    displayScenario() {
        const currentScenarios = this.getCurrentScenarios();
        const scenario = currentScenarios[this.player.currentScenario];

        if (!scenario) {
            this.endGame(false);
            return;
        }

        // Update UI with current scenario
        const titleElement = document.getElementById('scenario-title');
        const descriptionElement = document.getElementById('scenario-description');
        const optionsContainer = document.getElementById('options-container');

        if (titleElement) titleElement.textContent = scenario.title;
        if (descriptionElement) descriptionElement.textContent = scenario.description;
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            scenario.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.innerHTML = `
                    <input type="radio" 
                        name="option" 
                        value="${index}" 
                        id="option${index}"
                        tabindex="0"
                        aria-label="${option.text}">
                    <label for="option${index}">${option.text}</label>
                `;
                optionsContainer.appendChild(optionDiv);
            });
        }

        // Record start time for this question
        this.questionStartTime = Date.now();

        // Initialize timer for the new question
        this.initializeTimer();

        // Update progress display
        this.updateProgress();
    }

    async finishQuiz() {
        // Clear any running timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }

        this.isLoading = true;
        try {
            if (!this.player.name) {
                throw new Error('No user found, cannot save progress');
            }

            const user = new QuizUser(this.player.name);
            const score = this.calculateScore();
            
            // First save the quiz result
            const saveResult = await user.saveQuizResult(
                this.quizName,
                score,
                this.player.experience,
                this.player.tools,
                this.player.questionHistory
            );

            if (!saveResult) {
                throw new Error('Failed to save quiz results');
            }

            // Then update the quiz score
            const updateResult = await user.updateQuizScore(this.quizName, score);
            if (!updateResult) {
                throw new Error('Failed to update quiz score');
            }

            // Clear any local storage data for this quiz
            this.clearQuizLocalStorage(user.username, this.quizName);
            
            // Redirect to home page
            window.location.href = '/';
        } catch (error) {
            console.error('Failed to save quiz results:', error);
            this.showError(error.message || 'Failed to save results. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    clearQuizLocalStorage(username, quizName) {
        const variations = [
            quizName,                                              // original
            quizName.toLowerCase(),                               // lowercase
            quizName.toUpperCase(),                               // uppercase
            quizName.replace(/-/g, ''),                           // no hyphens
            quizName.replace(/([A-Z])/g, '-$1').toLowerCase(),    // kebab-case
            quizName.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), // camelCase
            quizName.replace(/-/g, '_'),                          // snake_case
        ];

        // Add CMS-specific variations if relevant
        if (quizName.toLowerCase().includes('cms')) {
            variations.push(
                'CMS-Testing',
                'cms-testing',
                'cmsTesting',
                'CMS_Testing',
                'cms_testing'
            );
        }

        variations.forEach(variant => {
            localStorage.removeItem(`quiz_progress_${username}_${variant}`);
            localStorage.removeItem(`quizResults_${username}_${variant}`);
        });
    }

    normalizeQuizName(quizName) {
        return quizName.replace(/-([a-z])/g, g => g[1].toUpperCase());
    }

    calculateScore() {
        const maxPossibleXP = this.maxXP;
        const currentXP = Math.max(0, this.player.experience);
        return Math.round((currentXP / maxPossibleXP) * 100);
    }

    getCurrentScenario() {
        const currentScenarios = this.getCurrentScenarios();
        return currentScenarios[this.player.currentScenario];
    }

    getCurrentScenarios() {
        const totalAnswered = this.player.questionHistory.length;
        const currentXP = this.player.experience;
        
        // Save progress before level transition
        if ((totalAnswered === 5 && currentXP >= this.levelThresholds.basic.minXP) ||
            (totalAnswered === 10 && currentXP >= this.levelThresholds.intermediate.minXP)) {
            this.saveProgress().catch(error => {
                console.error('Failed to save progress during level transition:', error);
                this.showError('Failed to save your progress. Please try refreshing the page.');
            });
        }
        
        // Check for level progression
        if (totalAnswered >= 10 && currentXP >= this.levelThresholds.intermediate.minXP) {
            return this.advancedScenarios;
        } else if (totalAnswered >= 5 && currentXP >= this.levelThresholds.basic.minXP) {
            return this.intermediateScenarios;
        }
        return this.basicScenarios;
    }

    getCurrentLevel() {
        const totalAnswered = this.player.questionHistory.length;
        const currentXP = this.player.experience;
        
        if (totalAnswered >= 10 && currentXP >= this.levelThresholds.intermediate.minXP) {
            return 'Advanced';
        } else if (totalAnswered >= 5 && currentXP >= this.levelThresholds.basic.minXP) {
            return 'Intermediate';
        }
        return 'Basic';
    }

    async handleAnswer() {
        if (this.isLoading) return;
        
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
        }
        
        try {
            this.isLoading = true;
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) return;

            const currentScenarios = this.getCurrentScenarios();
            const scenario = currentScenarios[this.player.currentScenario];
            const originalIndex = parseInt(selectedOption.value);
            
            const selectedAnswer = scenario.options[originalIndex];

            // Find the correct answer (option with highest experience)
            const correctAnswer = scenario.options.reduce((prev, current) => 
                (prev.experience > current.experience) ? prev : current
            );

            // Update player state
            this.player.experience = Math.max(0, Math.min(this.maxXP, this.player.experience + selectedAnswer.experience));
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience))
            });

            // Check if we're at a level transition point (question 5 or 10)
            const totalAnswered = this.player.questionHistory.length;
            const isTransitionPoint = totalAnswered === 5 || totalAnswered === 10;
            const currentXP = this.player.experience;
            
            // Only treat it as a transition point if we meet the XP requirements
            const isValidTransition = (totalAnswered === 5 && currentXP >= this.levelThresholds.basic.minXP) ||
                                    (totalAnswered === 10 && currentXP >= this.levelThresholds.intermediate.minXP);

            // Save progress with current scenario (before incrementing)
            try {
                await this.saveProgress();
                
                // If this is a valid transition point, ensure the save was successful
                if (isValidTransition) {
                    // Double-check the save by trying to load it back
                    const username = localStorage.getItem('username');
                    if (username) {
                        const quizUser = new QuizUser(username);
                        const progress = await quizUser.getQuizProgress(this.quizName);
                        
                        if (!progress || progress.questionHistory.length !== totalAnswered) {
                            throw new Error('Progress verification failed');
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to save progress:', error);
                if (isValidTransition) {
                    // At transition points, we must ensure progress is saved
                    this.showError('Failed to save your progress. Please try again.');
                    submitButton.disabled = false;
                    this.isLoading = false;
                    return;
                }
                // For non-transition points, continue but show warning
                this.showError('Warning: Progress may not have saved correctly');
            }

            // Also save quiz result and update display
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                const score = Math.round((this.player.experience / this.maxXP) * 100);
                
                try {
                    // Save both score and question history
                    await quizUser.saveQuizResult(
                        this.quizName,
                        score,
                        this.player.experience,
                        this.player.tools,
                        this.player.questionHistory
                    );
                    
                    // For transition points, verify the save
                    if (isValidTransition) {
                        const savedResult = await quizUser.getQuizResult(this.quizName);
                        if (!savedResult || savedResult.questionHistory.length !== totalAnswered) {
                            throw new Error('Result verification failed');
                        }
                    }
                } catch (error) {
                    console.error('Failed to save quiz result:', error);
                    if (isValidTransition) {
                        this.showError('Failed to save your answer. Please try again.');
                        submitButton.disabled = false;
                        this.isLoading = false;
                        return;
                    }
                    this.showError('Warning: Your progress may not have saved correctly');
                }
                
                // Update progress display on index page
                const progressElement = document.querySelector(`#${this.quizName}-progress`);
                if (progressElement) {
                    const totalQuestions = 15;
                    const completedQuestions = this.player.questionHistory.length;
                    const percentComplete = Math.round((completedQuestions / totalQuestions) * 100);
                    
                    // Only update if we're on the index page and this is the current user
                    const onIndexPage = window.location.pathname.endsWith('index.html');
                    if (onIndexPage) {
                        progressElement.textContent = `${percentComplete}% Complete`;
                        progressElement.classList.remove('hidden');
                        
                        // Update quiz item styling
                        const quizItem = document.querySelector(`.quiz-item[data-quiz-id="${this.quizName}"]`);
                        const progressElement = quizItem?.querySelector('.progress-indicator');
                        
                        if (quizItem) {
                            console.log(`Updating quiz item style for ${this.quizName}`);
                            console.log(`Player experience: ${this.player.experience}, isPerfectScore: ${this.player.experience >= 300}`);
                            
                            if (this.player.experience >= 300) {
                                // Perfect score - Light Green with thicker, darker border
                                console.log(`Perfect score in quiz-helper.js: experience=${this.player.experience} >= 300`);
                                
                                quizItem.setAttribute('style', 'background-color: #90EE90 !important; border: 2px solid #70CF70 !important; color: #000000 !important; border-radius: 12px !important;');
                                
                                if (progressElement) {
                                    progressElement.setAttribute('style', 'background-color: #90EE90 !important; color: #000000 !important; display: block !important;');
                                    progressElement.textContent = '15/15';
                                }
                            } else {
                                // Not perfect - More faded Dark Yellow with thicker, darker border
                                console.log(`Not perfect score in quiz-helper.js: experience=${this.player.experience} < 300`);
                                
                                quizItem.setAttribute('style', 'background-color: #F0D080 !important; border: 2px solid #E0B060 !important; color: #000000 !important; border-radius: 12px !important;');
                                
                                if (progressElement) {
                                    progressElement.setAttribute('style', 'background-color: #F0D080 !important; color: #000000 !important; display: block !important;');
                                    progressElement.textContent = '15/15';
                                }
                            }
                        }
                    }
                }
            }

            // Show outcome screen
            if (this.gameScreen && this.outcomeScreen) {
                this.gameScreen.classList.add('hidden');
                this.outcomeScreen.classList.remove('hidden');
            }
            
            // Update outcome display with only the selected answer outcome
            let outcomeText = selectedAnswer.outcome;
            // No longer showing the correct answer text
            document.getElementById('outcome-text').textContent = outcomeText;
            
            const xpText = selectedAnswer.experience >= 0 ? 
                `Experience gained: +${selectedAnswer.experience}` : 
                `Experience: ${selectedAnswer.experience}`;
            document.getElementById('xp-gained').textContent = xpText;
            
            if (selectedAnswer.tool) {
                document.getElementById('tool-gained').textContent = `Tool acquired: ${selectedAnswer.tool}`;
                if (!this.player.tools.includes(selectedAnswer.tool)) {
                    this.player.tools.push(selectedAnswer.tool);
                }
            } else {
                document.getElementById('tool-gained').textContent = '';
            }

            this.updateProgress();
        } catch (error) {
            console.error('Failed to handle answer:', error);
            this.showError('Failed to save your answer. Please try again.');
        } finally {
            this.isLoading = false;
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    }

    forceShowGuideButton(url = "https://example.com/guide") {
        console.log(`[Guide] Forcing guide button to show with URL: ${url}`);
        this.guideUrl = url;
        this.showGuideButton = true;
        this.updateGuideButton();
        
        // Just in case there are timing issues, try again after a delay
        setTimeout(() => {
            console.log('[Guide] Retry adding guide button after 500ms delay');
            this.updateGuideButton();
        }, 500);
        
        // Add a global reference for console access
        window.quizHelper = this;
        console.log('[Guide] Use "window.quizHelper.forceShowGuideButton()" in console to trigger again');
    }
} 