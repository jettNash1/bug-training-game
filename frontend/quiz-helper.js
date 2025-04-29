import { QuizUser } from './QuizUser.js';
import { APIService } from './api-service.js';

export class BaseQuiz {
    constructor(config) {
        this.config = config;
        this.totalQuestions = config.totalQuestions || 15;
        this.passPercentage = config.passPercentage || 70;
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.isLoading = false;
        this.questionTimer = null;
        this.apiService = new APIService();
        this.guideUrl = null;
        this.showGuideButton = false;
        
        // Track randomized scenarios
        this.randomizedScenarios = {};
        this.maxScenariosPerLevel = 5;
        
        // Remove level thresholds since we're not using them anymore
        this.levelThresholds = {
            basic: { minXP: 0 },
            intermediate: { minXP: 0 },
            advanced: { minXP: 0 }
        };
        
        // Attempt to get quiz name from config, URL, or data attributes
        this.quizName = config.quizName || this.detectQuizNameFromPage();
        
        // Hardcoded fallback for specific quizzes based on the URL
        if (!this.quizName) {
            const path = window.location.pathname.toLowerCase();
            if (path.includes('communication')) {
                this.quizName = 'communication';
                console.log('[Quiz] Forcing quiz name to communication based on URL path');
            } else if (path.includes('cms')) {
                this.quizName = 'cms';
                console.log('[Quiz] Forcing quiz name to cms based on URL path');
            } else if (path.includes('team-portal')) {
                this.quizName = 'team-portal';
                console.log('[Quiz] Forcing quiz name to team-portal based on URL path');
            }
        }
        
        console.log('[Quiz] Detected quiz name:', this.quizName);
        
        // Create a global reference immediately for debugging
        window.quizHelper = this;
        
        // Initialize timer value with a default of 60 seconds
        // This ensures we have a valid default even before the async API call completes
        this.timePerQuestion = 60;
        
        // Try to initialize from localStorage for immediate display
        try {
            // Check for quizTimerSettings format first (most current)
            const cachedSettings = localStorage.getItem('quizTimerSettings');
            if (cachedSettings) {
                const timerSettings = JSON.parse(cachedSettings);
                if (timerSettings && typeof timerSettings === 'object') {
                    // PRIORITY: First check for quiz-specific timer settings
                    if (this.quizName && timerSettings.quizTimers && 
                        timerSettings.quizTimers[this.quizName] !== undefined) {
                        // Ensure we treat 0 as a valid value (disabled timer)
                        this.timePerQuestion = timerSettings.quizTimers[this.quizName];
                        console.log(`[Quiz] Constructor: Using quiz-specific timer from localStorage: ${this.timePerQuestion}s`);
                        if (this.timePerQuestion === 0) {
                            console.log('[Quiz] Constructor: Timer is disabled for this quiz');
                            this.timerDisabled = true;
                        } else {
                            this.timerDisabled = false;
                        }
                    } 
                    // FALLBACK: Only use default if no quiz-specific setting exists
                    else if (timerSettings.defaultSeconds !== undefined) {
                        // Otherwise use the default
                        // Ensure we treat 0 as a valid value (disabled timer)
                        this.timePerQuestion = timerSettings.defaultSeconds;
                        console.log(`[Quiz] Constructor: Using default timer from localStorage: ${this.timePerQuestion}s`);
                        if (this.timePerQuestion === 0) {
                            console.log('[Quiz] Constructor: Timer is disabled by default');
                            this.timerDisabled = true;
                        } else {
                            this.timerDisabled = false;
                        }
                    }
                }
            } else {
                // Fall back to older storage keys
                const quizTimerValue = localStorage.getItem('quizTimerValue');
                if (quizTimerValue !== null) {
                    const defaultSeconds = parseInt(quizTimerValue, 10);
                    if (!isNaN(defaultSeconds)) {
                        this.timePerQuestion = defaultSeconds;
                        console.log(`[Quiz] Constructor: Using legacy timer value from localStorage: ${this.timePerQuestion}s`);
                        if (this.timePerQuestion === 0) {
                            console.log('[Quiz] Constructor: Timer is disabled by legacy setting');
                            this.timerDisabled = true;
                        } else {
                            this.timerDisabled = false;
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('[Quiz] Constructor: Error reading timer settings from localStorage:', e);
        }
        
        this.remainingTime = null;
        this.questionStartTime = null; // Track when each question starts
        
        // Load timer settings from API immediately to update the default if needed
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
                console.log(`[Guide] Found quiz name in URL: ${quizParam}`);
                return quizParam.toLowerCase();
            }
            
            // Try to get from path
            const path = window.location.pathname;
            const pathMatch = path.match(/\/([^\/]+)-quiz\.html$/);
            if (pathMatch && pathMatch[1]) {
                console.log(`[Guide] Extracted quiz name from path: ${pathMatch[1]}`);
                return pathMatch[1].toLowerCase();
            }
            
            // Look for common quiz names in the path
            if (path.includes('communication')) {
                console.log('[Guide] Detected communication quiz from path');
                return 'communication';
            } else if (path.includes('cms')) {
                console.log('[Guide] Detected CMS quiz from path');
                return 'cms';
            } else if (path.includes('team-portal')) {
                console.log('[Guide] Detected team portal quiz from path');
                return 'team-portal';
            }
            
            // Try to get from page elements
            const quizTitle = document.querySelector('h1, .quiz-title');
            if (quizTitle && quizTitle.textContent) {
                // Convert title to likely quiz name: "Communication Quiz" -> "communication"
                const titleText = quizTitle.textContent.replace(/\s+quiz$/i, '').trim().toLowerCase();
                console.log(`[Guide] Extracted quiz name from title: ${titleText}`);
                return titleText;
            }
            
            // Try to get from data attribute
            const quizContainer = document.querySelector('[data-quiz-name], [data-quiz-id], [data-quiz]');
            if (quizContainer) {
                const dataName = (quizContainer.dataset.quizName || 
                        quizContainer.dataset.quizId || 
                        quizContainer.dataset.quiz || '').toLowerCase();
                console.log(`[Guide] Found quiz name in data attribute: ${dataName}`);
                return dataName;
            }
            
            // Last resort: try to detect from page title
            if (document.title && document.title.includes('Quiz')) {
                const titleName = document.title.replace(/\s+quiz$/i, '').trim().toLowerCase();
                console.log(`[Guide] Extracted quiz name from document title: ${titleName}`);
                return titleName;
            }
            
            return null;
        } catch (e) {
            console.error('[Quiz] Error detecting quiz name:', e);
            return null;
        }
    }

    /**
     * Initializes the timer settings for the quiz by fetching from localStorage or API
     * Ensures the correct timer value is used for the current quiz
     * @returns {Promise} Resolves when timer settings are initialized
     */
    async initializeTimerSettings() {
        try {
            console.log('[Quiz] Initializing timer settings for:', this.quizName);
            
            // Set an initial default as fallback
            this.timePerQuestion = 30;
            
            // Try to get timer settings from localStorage first (faster)
            try {
                const cachedSettings = localStorage.getItem('quizTimerSettings');
                if (cachedSettings) {
                    const timerSettings = JSON.parse(cachedSettings);
                    console.log('[Quiz] Found timer settings in localStorage:', timerSettings);
                    
                    // Verify we have valid settings
                    if (timerSettings && typeof timerSettings === 'object') {
                        // PRIORITY: First check for quiz-specific timer settings
                        if (this.quizName && timerSettings.quizTimers && 
                            timerSettings.quizTimers[this.quizName] !== undefined) {
                            this.timePerQuestion = timerSettings.quizTimers[this.quizName];
                            console.log(`[Quiz] Using quiz-specific timer from localStorage: ${this.timePerQuestion}s for ${this.quizName}`);
                            // Check if timer is disabled
                            if (this.timePerQuestion === 0) {
                                console.log('[Quiz] Timer is disabled for this quiz');
                                this.timerDisabled = true;
                            } else {
                                this.timerDisabled = false;
                            }
                        } 
                        // FALLBACK: Only use default if no quiz-specific setting exists
                        else if (timerSettings.defaultSeconds !== undefined) {
                            this.timePerQuestion = timerSettings.defaultSeconds;
                            console.log(`[Quiz] Using default timer from localStorage: ${this.timePerQuestion}s for ${this.quizName}`);
                            // Check if timer is disabled
                            if (this.timePerQuestion === 0) {
                                console.log('[Quiz] Timer is disabled by default');
                                this.timerDisabled = true;
                            } else {
                                this.timerDisabled = false;
                            }
                        }
                    }
                }
            } catch (cacheError) {
                console.warn('[Quiz] Error reading timer settings from localStorage:', cacheError);
            }
            
            // Always fetch from API to ensure fresh values or update cache
            try {
                console.log('[Quiz] Fetching fresh timer settings from API');
                // Use APIService instead of direct fetch
                const timerSettingsResponse = await this.apiService.getQuizTimerSettings();
                
                if (timerSettingsResponse.success && timerSettingsResponse.data) {
                    const freshSettings = timerSettingsResponse.data;
                    
                    // Cache the fresh settings
                    localStorage.setItem('quizTimerSettings', JSON.stringify(freshSettings));
                    console.log('[Quiz] Updated localStorage with fresh timer settings');
                    
                    // PRIORITY: First check for quiz-specific timer settings from API
                    if (this.quizName && freshSettings.quizTimers && 
                        freshSettings.quizTimers[this.quizName] !== undefined) {
                        this.timePerQuestion = freshSettings.quizTimers[this.quizName];
                        console.log(`[Quiz] Updated from API: Using quiz-specific timer: ${this.timePerQuestion}s`);
                        // Check if timer is disabled
                        if (this.timePerQuestion === 0) {
                            console.log('[Quiz] Timer is disabled for this quiz');
                            this.timerDisabled = true;
                        } else {
                            this.timerDisabled = false;
                        }
                    } 
                    // FALLBACK: Only use default if no quiz-specific setting exists
                    else if (freshSettings.defaultSeconds !== undefined) {
                        this.timePerQuestion = freshSettings.defaultSeconds;
                        console.log(`[Quiz] Updated from API: Using default timer: ${this.timePerQuestion}s`);
                        // Check if timer is disabled
                        if (this.timePerQuestion === 0) {
                            console.log('[Quiz] Timer is disabled by default');
                            this.timerDisabled = true;
                        } else {
                            this.timerDisabled = false;
                        }
                    }
                    
                    // If timer is already running, update it with new values
                    if (this.remainingTime !== null && this.questionTimer) {
                        console.log(`[Quiz] Updating active timer with new settings: ${this.timePerQuestion}s`);
                        // Only reset timer if question just started (within 2 seconds)
                        const questionElapsed = (Date.now() - (this.questionStartTime || 0)) / 1000;
                        if (questionElapsed < 2) {
                            this.remainingTime = this.timePerQuestion;
                            this.updateTimerDisplay();
                        }
                    }
                } else {
                    console.warn(`[Quiz] API timer settings request failed or returned no data`);
                }
            } catch (apiError) {
                console.warn('[Quiz] Failed to fetch timer settings from API, using cached values', apiError);
            }
            
            // Log final timer value
            console.log(`[Quiz] Final timer value for ${this.quizName}: ${this.timePerQuestion}s`);
            return this.timePerQuestion;
        } catch (error) {
            console.error('[Quiz] Error initializing timer settings:', error);
            // Fallback to reasonable default if something goes wrong
            this.timePerQuestion = 30;
            this.timerDisabled = false;
            return this.timePerQuestion;
        }
    }

    async initializeGuideSettings() {
        console.log(`[Guide] Initializing guide settings for quiz: ${this.quizName}`);
        
        if (!this.quizName) {
            console.error('[Guide] Quiz name not set, cannot initialize guide settings');
            return;
        }
        
        try {
            if (!this.apiService) {
                console.error('[Guide] API service not available');
                return;
            }
            
            // Disable guide button functionality in quiz pages - only show on index page
            this.showGuideButton = false;
            this.guideUrl = null;
            this.updateGuideButton(); // Remove any existing guide button
            
            console.log('[Guide] Guide buttons disabled in quiz pages, they will only appear on the index page');
            
            // We still fetch the guide settings for debugging purposes, but don't display the button
            let response = null;
            try {
                response = await this.apiService.fetchGuideSettings(this.quizName);
                console.log(`[Guide] Guide settings response (for reference only):`, response);
            } catch (error) {
                console.error('[Guide] Error fetching guide settings:', error);
            }
        } catch (error) {
            console.error(`[Guide] Error loading guide settings:`, error);
            this.guideUrl = null;
            this.showGuideButton = false;
        }
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
            guideButton.innerHTML = 'Guide';
            guideButton.setAttribute('aria-label', 'Open quiz guide');
            guideButton.onclick = () => window.open(this.guideUrl, '_blank');
            
            // Apply common styles regardless of whether Back button exists
            guideButton.style.display = 'inline-block';
            guideButton.style.padding = '10px 20px';
            guideButton.style.fontSize = '16px';
            guideButton.style.fontWeight = '400';
            guideButton.style.borderRadius = '4px';
            guideButton.style.border = 'none';
            guideButton.style.backgroundColor = '#4e73df';
            guideButton.style.color = 'white';
            guideButton.style.cursor = 'pointer';
            guideButton.style.textAlign = 'center';
            guideButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)';
            guideButton.style.transition = 'all 0.2s ease';
            guideButton.style.minWidth = '100px';
            
            // Add hover effect
            guideButton.onmouseover = () => {
                guideButton.style.backgroundColor = '#3867d6';
                guideButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            };
            guideButton.onmouseout = () => {
                guideButton.style.backgroundColor = '#4e73df';
                guideButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)';
            };
            
            // Create container for the button
            const buttonContainer = document.createElement('div');
            buttonContainer.id = 'guide-button-container';
            buttonContainer.className = 'guide-button-container';
            buttonContainer.style.marginTop = '0'; // Reduced spacing
            buttonContainer.style.marginBottom = '10px';
            buttonContainer.appendChild(guideButton);
            
            // Find the "Back to Hub" button to position the guide button beneath it
            const backToHubButton = document.querySelector('a[href="/"], a[href="/index.html"], a[href="index.html"], a[href="./"], button[aria-label="Back to Hub"]');
            
            // If we couldn't find it by normal selectors, try to find by text content
            let foundBackButton = backToHubButton;
            if (!foundBackButton) {
                // Look for elements containing "Back to Hub" text
                const allButtons = document.querySelectorAll('a, button');
                for (const button of allButtons) {
                    if (button.textContent && button.textContent.trim().includes('Back to Hub')) {
                        foundBackButton = button;
                        console.log('[Guide] Found Back to Hub button by text content');
                        break;
                    }
                }
            }
            
            if (foundBackButton) {
                console.log('[Guide] Found Back to Hub button, positioning guide button below it');
                
                // Check if the Back to Hub button is inside a container
                const backButtonParent = foundBackButton.parentElement;
                
                // Get the computed style of the back button to match exactly
                const backButtonStyle = window.getComputedStyle(foundBackButton);
                
                // Apply exact same width to guide button
                guideButton.style.width = backButtonStyle.width;
                guideButton.style.minWidth = backButtonStyle.minWidth;
                guideButton.style.maxWidth = backButtonStyle.maxWidth;
                
                // Create a wrapper if it doesn't exist, to style both buttons consistently
                let buttonWrapper = document.getElementById('nav-buttons-wrapper');
                if (!buttonWrapper) {
                    buttonWrapper = document.createElement('div');
                    buttonWrapper.id = 'nav-buttons-wrapper';
                    buttonWrapper.style.display = 'flex';
                    buttonWrapper.style.flexDirection = 'column';
                    buttonWrapper.style.gap = '5px';
                    buttonWrapper.style.margin = '0';
                    buttonWrapper.style.padding = '0';
                    
                    // Replace the Back to Hub button with our wrapper
                    foundBackButton.parentNode.insertBefore(buttonWrapper, foundBackButton);
                    buttonWrapper.appendChild(foundBackButton);
                }
                
                // Add the guide button to the wrapper
                buttonWrapper.appendChild(buttonContainer);
                console.log('[Guide] Guide button positioned in nav wrapper with Back to Hub button');
                return; // Exit early as we've found our preferred position
            }
            
            // Fallback positioning approaches if Back to Hub button not found
            let insertionSuccessful = false;
            
            // Try to find the top navigation or header area first
            const navContainer = document.querySelector('nav, header, .navigation, .header, .top-bar');
            if (navContainer) {
                console.log('[Guide] Adding guide button after navigation/header');
                navContainer.insertAdjacentElement('afterend', buttonContainer);
                insertionSuccessful = true;
            }
            
            // Approach 1: Insert before timer container
            const timerContainer = document.getElementById('timer-container');
            if (!insertionSuccessful && timerContainer && timerContainer.parentNode) {
                console.log('[Guide] Adding guide button before timer container');
                timerContainer.parentNode.insertBefore(buttonContainer, timerContainer);
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
            
            // Approach 3: Last resort - add to body
            if (!insertionSuccessful) {
                console.log('[Guide] Adding guide button to document body as last resort');
                document.body.insertBefore(buttonContainer, document.body.firstChild);
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
        // End game if we've answered all questions
        return totalQuestionsAnswered >= this.totalQuestions;
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

    async startGame() {
        console.log('[Quiz] Starting game, initializing settings...');
        
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
        
        try {
        // Initialize or reinitialize guide settings
        if (this.quizName) {
            console.log('[Quiz] Initializing guide settings in startGame');
                await this.initializeGuideSettings();
        }
        
        // Create a global reference for debugging
        window.quizHelper = this;
        
            // Wait for timer settings to be initialized before showing the question
            // This ensures the correct timer value is used for the first question
            console.log('[Quiz] Initializing timer settings before starting game...');
            await this.initializeTimerSettings();
            console.log('[Quiz] Timer settings initialized in startGame, timePerQuestion:', this.timePerQuestion);
            
            // Now it's safe to start the quiz with the correct timer value
        this.showQuestion();
        } catch (error) {
            console.error('[Quiz] Error in startGame:', error);
            this.showError('Failed to start the quiz. Please refresh the page and try again.');
        }
    }

    /**
     * Debug method to print all timer-related information
     * Useful for diagnosing timer issues
     */
    debugTimerSettings() {
        console.group('[Quiz Debug] Timer Settings');
        console.log('Quiz Name:', this.quizName);
        console.log('timePerQuestion:', this.timePerQuestion);
        console.log('remainingTime:', this.remainingTime);
        console.log('questionStartTime:', this.questionStartTime);
        console.log('Active Timer:', this.questionTimer !== null);
        
        // Log localStorage values
        try {
            const quizTimerSettings = localStorage.getItem('quizTimerSettings');
            const parsedSettings = quizTimerSettings ? JSON.parse(quizTimerSettings) : null;
            console.log('localStorage quizTimerSettings:', parsedSettings);
            
            console.log('localStorage quizTimerValue:', localStorage.getItem('quizTimerValue'));
            console.log('localStorage perQuizTimerSettings:', localStorage.getItem('perQuizTimerSettings'));
        } catch (e) {
            console.error('Error parsing localStorage timer settings:', e);
        }
        console.groupEnd();
        
        return {
            quizName: this.quizName,
            timePerQuestion: this.timePerQuestion,
            remainingTime: this.remainingTime,
            activeTimer: this.questionTimer !== null
        };
    }

    initializeTimer() {
        // Clear any existing timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }

        // Always return early if timer is disabled (0 seconds) or timerDisabled flag is set
        // This is a safeguard in case this method is called incorrectly
        if (this.timePerQuestion === 0 || this.timerDisabled) {
            console.log('[Quiz] Timer initialization skipped - timer is disabled');
            // Ensure timer container is hidden
            const timerContainer = document.getElementById('timer-container');
            if (timerContainer) {
                timerContainer.style.display = 'none';
            }
            // Print debug information
            this.debugTimerSettings();
            return;
        }

        // Log current timer value for debugging
        console.log('[Quiz] Current timer value:', this.timePerQuestion);

        // Timer is enabled, ensure it's visible
        const timerContainer = document.getElementById('timer-container');
        if (timerContainer) {
            timerContainer.style.display = 'block';
            // Ensure the warning class is removed at the start of a new timer
            timerContainer.classList.remove('timer-warning');
        }

        // Ensure we have a valid timePerQuestion value
        if (this.timePerQuestion === undefined || this.timePerQuestion === null) {
            console.warn('[Quiz] timePerQuestion is undefined or null, using fallback value of 30 seconds');
            this.timePerQuestion = 30;
        }

        // Reset remaining time
        this.remainingTime = this.timePerQuestion;
        this.questionStartTime = Date.now();

        // Update timer display using the proper method
        this.updateTimerDisplay();

        // Print debug information
        this.debugTimerSettings();

        // Start the countdown
        this.questionTimer = setInterval(() => {
            this.remainingTime--;
            
            // Update timer display using the proper method
            this.updateTimerDisplay();

            // Check if time is up
            if (this.remainingTime <= 0) {
                clearInterval(this.questionTimer);
                this.handleTimeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        // If timer is disabled, don't update display
        if (this.timePerQuestion === 0) {
            return;
        }
        
        const timerDisplay = document.getElementById('timer-display');
        if (!timerDisplay) return;
        
        // Display the remaining time in seconds
        timerDisplay.textContent = `${this.remainingTime}`;
        
        // Add warning class when time is running low (less than 5 seconds)
        const timerContainer = document.getElementById('timer-container');
        if (timerContainer) {
            if (this.remainingTime <= 5) {
                timerContainer.classList.add('timer-warning');
            } else {
                timerContainer.classList.remove('timer-warning');
            }
        }
    }

    /**
     * Clears the active question timer, if any
     */
    clearTimer() {
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
            console.log('[Quiz] Timer cleared');
        }
    }

    async handleTimeUp() {
        // If timer is disabled, don't process timeUp events
        if (this.timerDisabled) {
            console.log('[Quiz] Timer is disabled, ignoring timeUp event');
            return;
        }
        
        this.clearTimer();
        
        // Check if player and current scenario are properly initialized
        if (!this.player || !this.scenarios || !this.player.currentScenario) {
            console.error('Player or scenarios not properly initialized');
            return;
        }
        
        try {
            // Get current scenario
            const currentScenario = this.scenarios[this.player.currentScenario];
            if (!currentScenario) {
                console.error('Current scenario not found');
                return;
            }
            
            // Find correct answer based on isCorrect flag or experience
            const correctAnswer = currentScenario.options.find(opt => 
                opt.isCorrect || opt.experience === Math.max(...currentScenario.options.map(o => o.experience || 0))
            );
            
            // Create timeout option
            const timeoutOption = {
                id: 'timeout',
                text: 'Time ran out!',
                experience: 0,
                isCorrect: false,
                isTimeout: true
            };
            
            // Record player's choice
            if (this.player.questionHistory) {
                this.player.questionHistory.push({
                    scenarioId: currentScenario.id,
                    selectedOption: timeoutOption,
                    correctOption: correctAnswer,
                    wasCorrect: false,
                    timeSpent: this.timeLimit || 30
                });
            }
            
            // Increment current scenario
            this.player.currentScenario++;
            
            // Save progress
            await this.saveProgress();
            
            // Handle next steps based on quiz completion
            if (this.player.currentScenario >= (this.scenarios ? this.scenarios.length : 15)) {
                // End the quiz if all scenarios are completed
                await this.endGame(false);
            } else {
                // Load next scenario
                this.displayScenario();
            }
        } catch (error) {
            console.error('Error handling time up:', error);
            this.showError('An error occurred. Please try again.');
        }
    }

    /**
     * Randomly selects scenarios for each level based on maximum per level
     * @param {string} level - The difficulty level (basic, intermediate, advanced)
     * @param {Array} availableScenarios - Array of all scenarios for this level
     * @returns {Array} - Array of randomly selected scenarios
     */
    getRandomizedScenarios(level, availableScenarios) {
        if (!this.quizName) {
            console.error('[Quiz] Quiz name not set, randomization may not be isolated between quizzes');
            // Try to detect quiz name
            this.quizName = this.detectQuizNameFromPage();
        }
        
        // Create a qualified level key that includes the quiz name to isolate scenarios between quizzes
        const quizLevelKey = `${this.quizName}_${level}`;
        
        // First check if we already have randomized scenarios for this level
        if (this.randomizedScenarios[quizLevelKey] && this.randomizedScenarios[quizLevelKey].length > 0) {
            console.log(`[Quiz] Using existing randomized scenarios for ${this.quizName} - ${level}: ${this.randomizedScenarios[quizLevelKey].length} scenarios`);
            return this.randomizedScenarios[quizLevelKey];
        }

        console.log(`[Quiz] Randomizing scenarios for ${this.quizName} - ${level}: ${availableScenarios?.length || 0} available scenarios`);
        
        // Handle case where available scenarios are undefined or empty
        if (!availableScenarios || availableScenarios.length === 0) {
            console.error(`[Quiz] No available scenarios for ${this.quizName} - ${level}`);
            this.randomizedScenarios[quizLevelKey] = [];
            return [];
        }
        
        // If we have fewer scenarios than max, use all of them
        if (availableScenarios.length <= this.maxScenariosPerLevel) {
            console.log(`[Quiz] Using all available scenarios for ${this.quizName} - ${level}: ${availableScenarios.length} scenarios`);
            this.randomizedScenarios[quizLevelKey] = [...availableScenarios];
            return this.randomizedScenarios[quizLevelKey];
        }
        
        // Create a copy of the available scenarios to avoid modifying the original
        const scenarios = [...availableScenarios];
        const selected = [];
        
        // Select random scenarios up to the maximum
        for (let i = 0; i < this.maxScenariosPerLevel; i++) {
            if (scenarios.length === 0) break;
            
            // Get a random index
            const randomIndex = Math.floor(Math.random() * scenarios.length);
            
            // Add the scenario to selected and remove it from available
            selected.push(scenarios[randomIndex]);
            scenarios.splice(randomIndex, 1);
        }
        
        // Store the selected scenarios
        this.randomizedScenarios[quizLevelKey] = selected;
        console.log(`[Quiz] Randomized ${selected.length} scenarios for ${this.quizName} - ${level}`);
        
        return selected;
    }

    /**
     * Gets current scenarios based on player progress and difficulty
     * @returns {Array} - Array of scenarios for the current level
     */
    getCurrentScenarios() {
        if (!this.player) {
            console.error('[Quiz] Player object not initialized');
            return [];
        }
        
        const totalAnswered = this.player.questionHistory ? this.player.questionHistory.length : 0;
        
        // Progress through levels based on question count
        let levelScenarios;
        let level;
        
        if (totalAnswered >= 10) {
            level = 'advanced';
            levelScenarios = this.advancedScenarios || [];
        } else if (totalAnswered >= 5) {
            level = 'intermediate';
            levelScenarios = this.intermediateScenarios || [];
        } else {
            level = 'basic';
            levelScenarios = this.basicScenarios || [];
        }
        
        // Get randomized scenarios for this level with quiz-specific key
        return this.getRandomizedScenarios(level, levelScenarios);
    }

    /**
     * Optimizes the quiz progress data to reduce its size
     * @param {Object} progressData - The original progress data
     * @returns {Object} - The optimized progress data with reduced size
     */
    optimizeProgressData(progressData) {
        try {
            // Create a deep copy to avoid modifying the original object
            const optimized = JSON.parse(JSON.stringify(progressData));
            
            // If there's question history, optimize it
            if (optimized.questionHistory && Array.isArray(optimized.questionHistory)) {
                optimized.questionHistory = optimized.questionHistory.map(item => {
                    // Extract only essential scenario data
                    const scenarioData = item.scenario ? {
                        id: item.scenario.id,
                        level: item.scenario.level,
                        title: item.scenario.title
                    } : (item.scenarioId ? { id: item.scenarioId } : { id: 0 });
                    
                    // Extract only essential answer data
                    const answerData = item.selectedAnswer ? {
                        text: item.selectedAnswer.text ? item.selectedAnswer.text.substring(0, 50) : 'Answer',
                        experience: item.selectedAnswer.experience || 0,
                        isCorrect: item.selectedAnswer.isCorrect || (item.selectedAnswer.experience > 0),
                        outcome: item.selectedAnswer.outcome ? item.selectedAnswer.outcome.substring(0, 100) : ''
                    } : { experience: 0, isCorrect: false };
                    
                    // Return a slim record with only the essential data
                    return {
                        scenarioId: scenarioData.id,
                        scenarioTitle: scenarioData.title,
                        scenarioLevel: scenarioData.level,
                        selectedAnswer: answerData,
                        timestamp: item.timestamp || item.timeSpent || new Date().toISOString(),
                        isCorrect: answerData.isCorrect,
                        timeSpent: item.timeSpent,
                        timedOut: item.timedOut || false
                    };
                });
            }
            
            // Save randomized scenarios to preserve state across sessions
            if (this.randomizedScenarios) {
                const optimizedScenarios = {};
                Object.keys(this.randomizedScenarios).forEach(level => {
                    if (Array.isArray(this.randomizedScenarios[level])) {
                        optimizedScenarios[level] = this.randomizedScenarios[level].map(s => 
                            typeof s === 'object' ? s.id : s
                        );
                    }
                });
                optimized.randomizedScenarios = optimizedScenarios;
            }
            
            console.log(`[Quiz] Optimized progress data: ${JSON.stringify(optimized).length} bytes`);
            return optimized;
        } catch (error) {
            console.error('[Quiz] Error optimizing progress data:', error);
            // Return original data if optimization fails
            return progressData;
        }
    }

    // Default saveProgress method that will be called by handleTimeUp
    // if the quiz implementation doesn't override it
    async saveProgress() {
        // First determine the status based on clear conditions
        let status = 'in-progress';
        
        // Check for completion (all questions answered)
        if (this.player.questionHistory.length >= this.totalQuestions) {
            // Calculate pass/fail based on correct answers
            const correctAnswers = this.player.questionHistory.filter(q => q.isCorrect).length;
            const scorePercentage = Math.round((correctAnswers / this.totalQuestions) * 100);
            status = scorePercentage >= this.passPercentage ? 'passed' : 'failed';
        }

        // Create the progress data object
        let progressData = {
            questionsAnswered: this.player.questionHistory.length,
            questionHistory: this.player.questionHistory,
            experience: this.player.experience || 0,
            tools: this.player.tools || [],
            currentScenario: this.player.currentScenario || 0,
            lastUpdated: new Date().toISOString(),
            status: status,
            scorePercentage: Math.round((this.player.questionHistory.filter(q => q.isCorrect).length / this.totalQuestions) * 100),
            randomizedScenarios: this.randomizedScenarios || {} // Save randomized scenarios
        };

        // Optimize the data to reduce size
        progressData = this.optimizeProgressData(progressData);

        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot save progress');
                return;
            }
            
            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify({ data: progressData }));
            
            console.log('[BaseQuiz] Saving progress with status:', status);
            const size = JSON.stringify(progressData).length;
            console.log(`[BaseQuiz] Progress data size: ${size} bytes`);
            
            // Check if data is too large (over 100KB) and warn
            if (size > 100000) {
                console.warn('[BaseQuiz] Warning: Progress data is very large (>100KB)');
            }
            
            await this.apiService.saveQuizProgress(this.quizName, progressData);
        } catch (error) {
            console.error('[BaseQuiz] Failed to save progress:', error);
            // Save minimal data to localStorage as a fallback
            try {
                const username = localStorage.getItem('username');
                if (username) {
                    const storageKey = `quiz_progress_${username}_${this.quizName}`;
                    const minimalProgress = {
                        questionsAnswered: progressData.questionsAnswered,
                        experience: progressData.experience,
                        status: progressData.status,
                        randomizedScenarios: progressData.randomizedScenarios // Include randomized scenarios even in minimal save
                    };
                    localStorage.setItem(storageKey, JSON.stringify({ data: minimalProgress }));
                    console.log('[BaseQuiz] Saved minimal progress to localStorage as fallback');
                }
            } catch (fallbackError) {
                console.error('[BaseQuiz] Failed to save fallback progress:', fallbackError);
            }
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
        
        // Only check once if timer should be disabled (using already set timerDisabled flag)
        if (this.timePerQuestion === 0 || this.timerDisabled) {
            console.log('[Quiz] Timer is disabled in showQuestion, hiding timer container');
            const timerContainer = document.getElementById('timer-container');
            if (timerContainer) {
                timerContainer.style.display = 'none';
            }
        } else {
            // Initialize timer for the new question
            this.initializeTimer();
        }
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

        // Hide the guide button after the first question
        if (this.player.currentScenario > 0) {
            console.log('[Guide] Beyond first question, hiding guide button');
            this.showGuideButton = false;
            this.updateGuideButton(); // Remove the button from the UI
        }

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

        // Only check once if timer should be disabled (using already set timerDisabled flag)
        if (this.timePerQuestion === 0 || this.timerDisabled) {
            console.log('[Quiz] Timer is disabled, hiding timer container');
            const timerContainer = document.getElementById('timer-container');
            if (timerContainer) {
                timerContainer.style.display = 'none';
            }
        } else {
            // Initialize timer for the new question
            this.initializeTimer();
        }

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

            // Check for auto-reset settings
            try {
                console.log(`[Auto-Reset] Checking auto-reset settings for quiz: ${this.quizName}`);
                const response = await this.apiService.getAutoResetSettings();
                console.log('[Auto-Reset] Got settings response:', response);
                
                if (response.success) {
                    const autoReset = response.data.find(s => s.quizName === this.quizName);
                    console.log('[Auto-Reset] Found setting for this quiz:', autoReset);
                    
                    if (autoReset && autoReset.enabled) {
                        console.log('[Auto-Reset] Setting is enabled, fetching completed users');
                        // Get all users who have completed the quiz
                        const completedUsersResponse = await this.apiService.getCompletedUsers(this.quizName);
                        console.log('[Auto-Reset] Completed users response:', completedUsersResponse);
                        
                        if (completedUsersResponse.success) {
                            const completedUsers = completedUsersResponse.data;
                            console.log(`[Auto-Reset] Found ${completedUsers.length} completed users`);
                            
                            // Calculate reset time based on completion time and reset period
                            const resetTime = new Date(Date.now() + (autoReset.resetPeriod * 60 * 1000));
                            console.log(`[Auto-Reset] Calculated reset time: ${resetTime.toISOString()}`);
                            
                            // Schedule resets for all completed users
                            for (const username of completedUsers) {
                                console.log(`[Auto-Reset] Creating scheduled reset for user: ${username}`);
                                const scheduleResponse = await this.apiService.createScheduledReset(
                                    username,
                                    this.quizName,
                                    resetTime.toISOString()
                                );
                                console.log(`[Auto-Reset] Schedule creation response:`, scheduleResponse);
                            }
                            
                            console.log(`[Auto-Reset] Scheduled auto-reset for ${this.quizName} at ${resetTime.toISOString()} for ${completedUsers.length} users`);
                        } else {
                            console.error('[Auto-Reset] Failed to get completed users:', completedUsersResponse);
                        }
                    } else {
                        console.log('[Auto-Reset] No enabled auto-reset setting found for this quiz');
                    }
                } else {
                    console.error('[Auto-Reset] Failed to get auto-reset settings:', response);
                }
            } catch (error) {
                console.error('[Auto-Reset] Error in auto-reset process:', error);
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
        return Math.round((this.player.experience / this.maxXP) * 100);
    }

    getCurrentScenario() {
        const totalAnswered = this.player.questionHistory.length;
        
        // Progress through levels based only on question count
        if (totalAnswered >= 10) {
            return this.advancedScenarios;
        } else if (totalAnswered >= 5) {
            return this.intermediateScenarios;
        }
        return this.basicScenarios;
    }

    getCurrentLevel() {
        const totalAnswered = this.player.questionHistory.length;
        
        // Progress through levels based only on question count
        if (totalAnswered >= 10) {
            return 'Advanced';
        } else if (totalAnswered >= 5) {
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

            // Clear any running timer if it exists
            this.clearTimer();

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

            // Show outcome screen and update display with answer outcome
            this.displayOutcome(selectedAnswer);

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
        console.log(`[Guide] Guide buttons have been disabled in quiz pages and only appear on the index page`);
        return false;
    }

    ensureGuideInitialized() {
        console.log('[Guide] Guide buttons have been disabled in quiz pages and only appear on the index page');
        return false;
    }

    forceEnableGuide(quizName = null, guideUrl = "https://example.com/quiz-guide") {
        console.log(`[Guide] Guide buttons have been disabled in quiz pages and only appear on the index page`);
        return {
            enabled: false,
            message: "Guide buttons only appear on the index page"
        };
    }

    enableGuideButton(guideUrl = "https://example.com/quiz-guide") {
        console.log(`[Guide] Guide buttons have been disabled in quiz pages and only appear on the index page`);
        return {
            enabled: false,
            message: "Guide buttons only appear on the index page"
        };
    }

    async endGame() {
        // Calculate final score based on correct answers
        const correctAnswers = this.player.questionHistory.filter(q => q.isCorrect).length;
        const scorePercentage = Math.round((correctAnswers / 15) * 100);
        
        // Determine status based on pass threshold
        const status = scorePercentage >= 70 ? 'passed' : 'failed';
        
        // Create the final progress object
        const progress = {
            questionsAnswered: this.totalQuestions || 15,
            questionHistory: this.player.questionHistory,
            status: status,
            scorePercentage: scorePercentage,
            lastUpdated: new Date().toISOString()
        };

        try {
            // Save progress to API
            const username = localStorage.getItem('username');
            if (!username) {
                throw new Error('No username found');
            }

            // Save to API
            await this.apiService.saveQuizProgress(this.quizName, progress);
            console.log('Final progress saved:', progress);

            // Update quiz score in user's record
            const quizUser = new QuizUser(username);
            await quizUser.updateQuizScore(this.quizName, scorePercentage);
            console.log('Quiz score updated:', scorePercentage);

            // Clear local storage for this quiz
            this.clearQuizLocalStorage(username, this.quizName);

            // Redirect to home page
            window.location.href = '/';
        } catch (error) {
            console.error('Failed to save final progress:', error);
            throw error;
        }
    }

    // Display the outcome of an answer, without showing XP
    displayOutcome(selectedAnswer) {
        if (!this.outcomeScreen) return;
        
        // Show outcome screen
        if (this.gameScreen) {
            this.gameScreen.classList.add('hidden');
            this.outcomeScreen.classList.remove('hidden');
        }
        
        // Update outcome display with only the selected answer outcome
        let outcomeText = selectedAnswer.outcome;
        const outcomeElement = document.getElementById('outcome-text');
        if (outcomeElement) {
            outcomeElement.textContent = outcomeText;
        }
        
        // Show if answer was correct
        const isCorrect = selectedAnswer.isCorrect;
        const resultElement = document.getElementById('result-text');
        if (resultElement) {
            resultElement.textContent = isCorrect ? 'Correct!' : 'Incorrect';
            resultElement.className = isCorrect ? 'correct' : 'incorrect';
        }
        
        // Show tool acquired if present
        const toolElement = document.getElementById('tool-gained');
        if (toolElement) {
            if (selectedAnswer.tool) {
                toolElement.textContent = `Tool acquired: ${selectedAnswer.tool}`;
                if (this.player && !this.player.tools.includes(selectedAnswer.tool)) {
                    this.player.tools.push(selectedAnswer.tool);
                }
            } else {
                toolElement.textContent = '';
            }
        }
    }

    /**
     * Shows and starts the timer for the current question
     */
    showTimer() {
        // Check if timer is disabled (0 seconds)
        if (this.timePerQuestion <= 0) {
            console.log('[Quiz] Timer is disabled (set to 0 seconds)');
            const timerContainer = document.getElementById('timer-container');
            if (timerContainer) {
                timerContainer.style.display = 'none';
            }
            return;
        }

        // Timer is enabled, show and start it
        const timerContainer = document.getElementById('timer-container');
        if (timerContainer) {
            timerContainer.style.display = 'block';
        }
        
        // Reset timer state
        this.timeLeft = this.timePerQuestion;
        this.timerStarted = true;
        
        // Update timer display
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = this.timeLeft;
        }
        
        console.log(`[Quiz] Starting timer with ${this.timePerQuestion} seconds`);
        
        // Clear any existing timer interval
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Start the countdown
        this.timerInterval = setInterval(() => {
            this.timeLeft -= 1;
            
            if (timerElement) {
                timerElement.textContent = this.timeLeft;
            }
            
            if (this.timeLeft <= 0) {
                console.log('[Quiz] Timer expired, moving to next question');
                clearInterval(this.timerInterval);
                this.timerInterval = null;
                this.handleTimerExpired();
            }
        }, 1000);
    }

    /**
     * Handles behavior when a quiz timer runs out
     * @param {boolean} autoAdvance - Whether to automatically advance to the next question
     */
    handleTimerExpired(autoAdvance = false) {
        console.log('[Quiz] Timer expired');
        
        this.logQuestionTimeout();
        
        if (autoAdvance) {
            console.log('[Quiz] Auto-advancing to next question');
            this.moveToNextQuestion();
        } else {
            // Disable answer buttons
            this.disableAnswerButtons();
            
            // Show timeout notification
            const notification = document.getElementById('timer-expired-notification');
            if (notification) {
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }
        }
    }
    
    /**
     * Logs when a question times out
     */
    logQuestionTimeout() {
        console.log(`[Quiz] Question ${this.currentQuestionIndex + 1} timed out after ${this.timePerQuestion} seconds`);
        
        // Add to results as timed out
        this.results.push({
            questionIndex: this.currentQuestionIndex,
            question: this.questions[this.currentQuestionIndex].question,
            userAnswer: null,
            correctAnswer: this.questions[this.currentQuestionIndex].correctAnswer,
            timedOut: true,
            timeTaken: this.timePerQuestion
        });
        
        // Mark as answered to prevent double-counting
        this.currentQuestionAnswered = true;
    }

    /**
     * Disables all answer buttons to prevent further answers
     */
    disableAnswerButtons() {
        console.log('[Quiz] Disabling answer buttons');
        
        const answerButtons = document.querySelectorAll('.answer-option');
        answerButtons.forEach(button => {
            button.disabled = true;
            button.classList.add('disabled');
        });
    }

    /**
     * Loads saved progress including randomized scenarios
     * @returns {boolean} - Whether progress was successfully loaded
     */
    async loadProgress() {
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('[Quiz] No user found, cannot load progress');
                return false;
            }

            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            const savedProgress = await this.apiService.getQuizProgress(this.quizName);
            console.log('[Quiz] Raw API Response:', savedProgress);
            let progress = null;
            
            if (savedProgress && savedProgress.data) {
                // Normalize the data structure
                progress = {
                    experience: savedProgress.data.experience || 0,
                    tools: savedProgress.data.tools || [],
                    questionHistory: savedProgress.data.questionHistory || [],
                    currentScenario: savedProgress.data.currentScenario || 0,
                    status: savedProgress.data.status || 'in-progress',
                    scorePercentage: savedProgress.data.scorePercentage || 0,
                    randomizedScenarios: savedProgress.data.randomizedScenarios || {}
                };
                console.log('[Quiz] Normalized progress data:', progress);
            } else {
                // Try loading from localStorage as fallback
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    progress = parsed.data || parsed;
                    console.log('[Quiz] Loaded progress from localStorage:', progress);
                }
            }

            if (progress) {
                // Restore randomized scenarios
                if (progress.randomizedScenarios) {
                    this.randomizedScenarios = progress.randomizedScenarios;
                    console.log('[Quiz] Restored randomized scenarios:', this.randomizedScenarios);
                    
                    // If we have scenario IDs instead of full objects, restore full scenarios
                    // This happens when the progress is optimized
                    for (const key in this.randomizedScenarios) {
                        if (Array.isArray(this.randomizedScenarios[key])) {
                            // Check if we have IDs instead of full scenario objects
                            if (this.randomizedScenarios[key].length > 0 && 
                                (typeof this.randomizedScenarios[key][0] === 'number' || 
                                 typeof this.randomizedScenarios[key][0] === 'string')) {
                                console.log(`[Quiz] Restoring full scenarios for key ${key} from IDs`);
                                
                                // Extract the level from the qualified key (e.g., 'sanity-smoke_basic' -> 'basic')
                                const levelMatch = key.match(/_([^_]+)$/);
                                const level = levelMatch ? levelMatch[1] : key;
                                
                                // Get the source scenarios for this level
                                let sourceScenarios;
                                if (level === 'basic') {
                                    sourceScenarios = this.basicScenarios;
                                } else if (level === 'intermediate') {
                                    sourceScenarios = this.intermediateScenarios;
                                } else if (level === 'advanced') {
                                    sourceScenarios = this.advancedScenarios;
                                }
                                
                                if (sourceScenarios) {
                                    // Replace IDs with full scenario objects
                                    this.randomizedScenarios[key] = this.randomizedScenarios[key].map(id => {
                                        const scenarioId = typeof id === 'string' ? parseInt(id, 10) : id;
                                        return sourceScenarios.find(s => s.id === scenarioId) || null;
                                    }).filter(Boolean);
                                    
                                    console.log(`[Quiz] Restored ${this.randomizedScenarios[key].length} full scenarios for key ${key}`);
                                }
                            }
                        }
                    }
                    
                    // Also handle the old format (without qualified keys) for backward compatibility
                    // This converts scenarios from old format to the new qualified format
                    const oldLevels = ['basic', 'intermediate', 'advanced'];
                    oldLevels.forEach(level => {
                        const oldKey = level;
                        const newKey = `${this.quizName}_${level}`;
                        
                        // If we have scenarios in the old format but not in the new format, convert them
                        if (this.randomizedScenarios[oldKey] && !this.randomizedScenarios[newKey]) {
                            console.log(`[Quiz] Converting old format scenarios from ${oldKey} to ${newKey}`);
                            this.randomizedScenarios[newKey] = this.randomizedScenarios[oldKey];
                            delete this.randomizedScenarios[oldKey];
                        }
                    });
                }
                
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                this.player.currentScenario = progress.currentScenario || 0;

                // Ensure we're updating the UI correctly
                this.updateProgress();
                
                // Check quiz status and show appropriate screen
                if (progress.status === 'failed') {
                    this.endGame(true);
                    return true;
                } else if (progress.status === 'passed' || progress.status === 'completed') {
                    this.endGame(false);
                    return true;
                }

                return true;
            }
            return false;
        } catch (error) {
            console.error('[Quiz] Failed to load progress:', error);
            return false;
        }
    }
}

// Self-executing function to initialize guide buttons
(function() {
    // Direct method to initialize guide buttons for all quizzes
    function initializeQuizGuides() {
        // Buttons were moved to the index page, no longer needed in quiz pages
        console.log('[Guide] Guide buttons have been moved to index page cards and disabled in quiz pages');
        return false;
    }

    // Wait for the DOM to load completely
    window.addEventListener('DOMContentLoaded', function() {
        console.log('[Guide] Guide buttons have been moved to index page cards and disabled in quiz pages');
    });
    
    // Also check after a longer delay for single page apps or slow-loading pages
    setTimeout(function() {
        console.log('[Guide] Guide buttons have been moved to index page cards and disabled in quiz pages');
    }, 3000);
})();

export class QuizPlayer {
    constructor(username) {
        this.username = username;
        this.questionHistory = [];
        this.tools = [];
        this.currentScenario = null;
    }

    addQuestionToHistory(question, selectedAnswer) {
        this.questionHistory.push({
            questionId: question.id,
            selectedAnswer: selectedAnswer.text,
            isCorrect: selectedAnswer.isCorrect,
            timestamp: new Date().toISOString()
        });
    }

    getCorrectAnswerCount() {
        return this.questionHistory.filter(q => q.isCorrect).length;
    }

    getScorePercentage() {
        return Math.round((this.getCorrectAnswerCount() / 15) * 100);
    }

    hasPassed() {
        return this.getScorePercentage() >= 70;
    }
} 