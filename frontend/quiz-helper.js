import { QuizUser } from './QuizUser.js';

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
        this.timePerQuestion = 60000; // 60 seconds in milliseconds
        this.remainingTime = this.timePerQuestion;
        this.questionStartTime = null; // Track when each question starts
        this.currentQuestionId = null; // Track the current question ID
        
        // Add event listeners for page visibility and beforeunload
        this.setupVisibilityListeners();
        
        // Add event listeners to back links after a short delay to ensure DOM is fully loaded
        setTimeout(() => {
            this.setupBackLinkListeners();
        }, 500);
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
        this.showQuestion();
    }

    setupVisibilityListeners() {
        // Save timer state when page is hidden or unloaded
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveTimerState();
            } else if (document.visibilityState === 'visible') {
                this.restoreTimerState();
            }
        });

        // Save timer state when page is about to be unloaded
        window.addEventListener('beforeunload', () => {
            this.saveTimerState();
        });
    }

    setupBackLinkListeners() {
        // Find all back links
        const backLinks = document.querySelectorAll('a.back-link, a[href="../index.html"]');
        
        // Add click event listener to each back link
        backLinks.forEach(link => {
            // Remove any existing event listeners
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            // Add new event listener
            newLink.addEventListener('click', (e) => {
                // Save the timer state before navigating away
                this.saveQuizState();
                console.log('Back link clicked, quiz state saved');
            });
        });
    }

    saveTimerState() {
        // Only save if we're in an active question with a timer running
        if (this.questionTimer) {
            const username = localStorage.getItem('username');
            if (!username) return;

            // Use the current question number as the ID if currentQuestionId is not set
            const questionId = this.currentQuestionId || 
                               (this.currentQuestionNumber ? `question_${this.currentQuestionNumber}` : null);
            
            if (!questionId) return;

            const timerState = {
                questionId: questionId,
                remainingTime: this.remainingTime,
                timestamp: Date.now(),
                quizName: this.quizName || this.constructor.name
            };

            localStorage.setItem(`timer_state_${username}_${this.quizName || this.constructor.name}`, JSON.stringify(timerState));
            console.log('Timer state saved:', timerState);
        }
    }

    restoreTimerState() {
        // Check if there's a saved timer state
        const username = localStorage.getItem('username');
        if (!username) return;

        const quizIdentifier = this.quizName || this.constructor.name;
        const timerStateKey = `timer_state_${username}_${quizIdentifier}`;
        const savedState = localStorage.getItem(timerStateKey);
        
        if (savedState) {
            try {
                const timerState = JSON.parse(savedState);
                console.log('Attempting to restore timer state:', timerState);
                
                // Get the current question ID or number for comparison
                const currentId = this.currentQuestionId || 
                                 (this.currentQuestionNumber ? `question_${this.currentQuestionNumber}` : null);
                
                // Only restore if it's for the current quiz
                if (timerState.quizName === quizIdentifier) {
                    // Calculate how much time has passed since the state was saved
                    const elapsedSinceExit = Date.now() - timerState.timestamp;
                    
                    // Subtract elapsed time from the remaining time (don't go below 0)
                    this.remainingTime = Math.max(0, timerState.remainingTime - elapsedSinceExit);
                    console.log('Timer restored with remaining time:', this.remainingTime);
                    
                    // Update the timer display
                    this.updateTimerDisplay();
                    
                    // If timer was running and there's still time left, restart it
                    if (this.remainingTime > 0) {
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
                    } else {
                        // If time ran out while away, handle time up
                        this.handleTimeUp();
                    }
                }
                
                // Clear the saved state
                localStorage.removeItem(timerStateKey);
            } catch (error) {
                console.error('Failed to restore timer state:', error);
            }
        }
    }

    initializeTimer() {
        console.log('Initializing timer for quiz:', this.quizName || this.constructor.name);
        
        // Create timer UI if it doesn't exist
        let timerContainer = document.getElementById('timer-container');
        if (!timerContainer) {
            timerContainer = document.createElement('div');
            timerContainer.id = 'timer-container';
            timerContainer.setAttribute('role', 'timer');
            timerContainer.setAttribute('aria-label', 'Question timer');
            this.gameScreen.insertBefore(timerContainer, this.gameScreen.firstChild);
        }

        // Check if there's a saved timer state for this quiz
        const username = localStorage.getItem('username');
        if (username) {
            const quizIdentifier = this.quizName || this.constructor.name;
            const timerStateKey = `timer_state_${username}_${quizIdentifier}`;
            const savedState = localStorage.getItem(timerStateKey);
            
            console.log('Current question ID:', this.currentQuestionId);
            console.log('Looking for saved timer state with key:', timerStateKey);
            
            if (savedState) {
                try {
                    const timerState = JSON.parse(savedState);
                    console.log('Found saved timer state:', timerState);
                    
                    // Only restore if it's for the current quiz
                    if (timerState.quizName === quizIdentifier) {
                        // Calculate how much time has passed since the state was saved
                        const elapsedSinceExit = Date.now() - timerState.timestamp;
                        
                        // Subtract elapsed time from the remaining time (don't go below 0)
                        this.remainingTime = Math.max(0, timerState.remainingTime - elapsedSinceExit);
                        console.log('Initializing timer with remaining time:', this.remainingTime);
                        
                        // Clear the saved state
                        localStorage.removeItem(timerStateKey);
                    } else {
                        // Different quiz, reset timer
                        this.remainingTime = this.timePerQuestion;
                        console.log('Different quiz, resetting timer');
                    }
                } catch (error) {
                    console.error('Failed to restore timer state:', error);
                    this.remainingTime = this.timePerQuestion;
                }
            } else {
                // No saved state, reset timer
                this.remainingTime = this.timePerQuestion;
                console.log('No saved timer state found, resetting timer');
            }
        } else {
            // No user, reset timer
            this.remainingTime = this.timePerQuestion;
            console.log('No user found, resetting timer');
        }

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
        const timerContainer = document.getElementById('timer-container');
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
        clearInterval(this.questionTimer);
        
        // Clear any saved timer state
        const username = localStorage.getItem('username');
        if (username) {
            const quizIdentifier = this.quizName || this.constructor.name;
            localStorage.removeItem(`timer_state_${username}_${quizIdentifier}`);
        }
        
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
            scenarioId: currentScenario.id,
            selectedOption: timeUpOption.text,
            outcome: timeUpOption.outcome,
            experience: timeUpOption.experience,
            timeSpent: timeSpent,
            timedOut: true
        });

        // Show outcome
        this.showOutcome(timeUpOption);
    }

    showQuestion() {
        if (this.isLoading) return;

        const currentScenario = this.getCurrentScenario();
        if (!currentScenario) {
            this.finishQuiz();
            return;
        }

        // Set the current question ID
        this.currentQuestionId = currentScenario.id;

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

        // Clear any saved timer state
        const username = localStorage.getItem('username');
        if (username) {
            const quizIdentifier = this.quizName || this.constructor.name;
            localStorage.removeItem(`timer_state_${username}_${quizIdentifier}`);
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

        // Update progress display
        this.updateProgress();
    }

    nextQuestion() {
        // Clear any saved timer state
        const username = localStorage.getItem('username');
        if (username) {
            const quizIdentifier = this.quizName || this.constructor.name;
            localStorage.removeItem(`timer_state_${username}_${quizIdentifier}`);
        }

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

        // Clear any saved timer state
        const username = localStorage.getItem('username');
        if (username) {
            const quizIdentifier = this.quizName || this.constructor.name;
            localStorage.removeItem(`timer_state_${username}_${quizIdentifier}`);
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
                        const quizItem = document.querySelector(`[data-quiz="${this.quizName}"]`);
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

    // This method should be called when the user is about to leave the quiz
    saveQuizState() {
        // Save the timer state if a question is active
        if (this.questionTimer) {
            this.saveTimerState();
            console.log('Quiz state saved before navigation');
        }
    }
} 