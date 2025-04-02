import { QuizUser } from './QuizUser.js';
import { APIService } from './api-service.js';

export class BaseQuiz {
    constructor(config) {
        this.config = config;
        this.maxXP = config.maxXP;
        this.totalQuestions = config.totalQuestions || 15;
        this.passPercentage = config.passPercentage || 70;
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

    async initializeTimerSettings() {
        try {
            // Set a default timer value (30 seconds)
            this.timePerQuestion = 30;
            console.log('[Quiz] Using default timer value:', this.timePerQuestion);
        } catch (error) {
            console.warn('Failed to load timer settings, using default value:', error);
            this.timePerQuestion = 30;
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

    initializeTimer() {
        // Clear any existing timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }

        // Set default timer value (30 seconds) if not set
        if (!this.timePerQuestion) {
            this.timePerQuestion = 30;
            console.log('[Quiz] Using default timer value:', this.timePerQuestion);
        }

        // Reset remaining time
        this.remainingTime = this.timePerQuestion;
        this.questionStartTime = Date.now();

        // Update timer display
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = `Time remaining: ${this.remainingTime}s`;
        }

        // Start the countdown
        this.questionTimer = setInterval(() => {
            this.remainingTime--;
            
            // Update timer display
            if (timerDisplay) {
                timerDisplay.textContent = `Time remaining: ${this.remainingTime}s`;
            }

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
        let status = 'in-progress';
        const totalAnswered = this.player.questionHistory.length;
        
        // Calculate score percentage
        const correctAnswers = this.player.questionHistory.filter(q => q.wasCorrect).length;
        const scorePercentage = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
        
        // Determine status based on completion and score percentage
        if (totalAnswered >= this.totalQuestions) {
            status = scorePercentage >= 70 ? 'completed' : 'failed';
        }

        // Create progress object with all necessary data
        const progress = {
            experience: this.player.experience,
            questionsAnswered: totalAnswered,
            questionHistory: this.player.questionHistory,
            currentScenario: this.currentScenario,
            tools: this.player.tools,
            lastUpdated: new Date().toISOString(),
            status: status,
            scorePercentage: scorePercentage
        };

        // Save progress to localStorage
        localStorage.setItem('quizProgress', JSON.stringify(progress));

        // Save to API if username exists
        const username = localStorage.getItem('username');
        if (username) {
            try {
                await this.apiService.saveQuizProgress(this.quizName, progress);
                console.log('Progress saved successfully:', progress);
            } catch (error) {
                console.error('Failed to save progress:', error);
            }
        }

        return progress;
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
        const totalQuestions = this.player.questionHistory.length;
        const correctAnswers = this.player.questionHistory.filter(record => 
            record.selectedAnswer.experience > 0
        ).length;
        return Math.round((correctAnswers / totalQuestions) * 100);
    }

    getCurrentScenario() {
        const totalAnswered = this.player.questionHistory.length;
        
        // Check for level progression based on question count
        if (totalAnswered >= 10) {
            return this.advancedScenarios;
        } else if (totalAnswered >= 5) {
            return this.intermediateScenarios;
        }
        return this.basicScenarios;
    }

    getCurrentLevel() {
        const totalAnswered = this.player.questionHistory.length;
        
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