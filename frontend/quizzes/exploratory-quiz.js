import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class ExploratoryQuiz extends BaseQuiz {
    constructor() {
        try {
            console.log('Initializing Exploratory Quiz');
            
            const config = {
                maxXP: 300,
                totalQuestions: 15,
                passPercentage: 70,
                performanceThresholds: [
                    { threshold: 90, message: '🏆 Outstanding! You\'re an exploratory testing expert!' },
                    { threshold: 80, message: '👏 Great job! You\'ve shown strong exploratory testing skills!' },
                    { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                    { threshold: 0, message: '�� Consider reviewing exploratory testing best practices and try again!' }
                ]
            };
            
            super(config);
            
            console.log('Base quiz initialized');
            
            // Set the quiz name
            Object.defineProperty(this, 'quizName', {
                value: 'exploratory',
                writable: false,
                configurable: false,
                enumerable: true
            });
            
            // Initialize randomized scenarios at the class level
            this.randomizedScenarios = {
                basic: null,
                intermediate: null,
                advanced: null
            };
            
            // Initialize player state
            this.player = {
                experience: 0,
                tools: [],
                questionHistory: [],
                currentScenario: 0,
                level: 'basic'
            };
            
            // Store current state
            this.scenarioStartTime = null;
            this.questionTimer = null;
            this.currentOutcome = null;
            this.isGameEnded = false;
            this.currentScenario = null; // Add a reference to the current scenario at the class level
            
            console.log('Player state initialized');
            
            // Store UI elements - will be populated in initializeUI
            this.gameContainer = null;
            this.gameScreen = null;
            this.outcomeScreen = null;
            this.endScreen = null;
            
            // Store scenario data
            // First ensure these arrays exist and are initialized
            console.log('Setting up basic scenarios array');
            this.basicScenarios = this.basicScenarios || [
                // ... existing code for basic scenarios ...
            ];
            
            console.log('Setting up intermediate scenarios array');
            this.intermediateScenarios = this.intermediateScenarios || [
                // ... existing code for intermediate scenarios ...
            ];
            
            console.log('Setting up advanced scenarios array');
            this.advancedScenarios = this.advancedScenarios || [
                // ... existing code for advanced scenarios ...
            ];
            
            console.log('Scenario arrays initialized');
            console.log(`Basic scenarios: ${this.basicScenarios.length}, Intermediate: ${this.intermediateScenarios.length}, Advanced: ${this.advancedScenarios.length}`);
            
            // Initialize UI and add event listeners
            this.initializeUI();

            this.isLoading = false;
        } catch (error) {
            console.error('Error in constructor:', error);
            this.showError('An error occurred while initializing the quiz.');
        }
    }

    initializeUI() {
        try {
            console.log('Initializing UI');
            
            // Get main container elements
            this.gameContainer = document.querySelector('.quiz-container');
            this.gameScreen = document.getElementById('game-screen');
            this.outcomeScreen = document.getElementById('outcome-screen');
            this.endScreen = document.getElementById('end-screen');
            
            // Create a less strict check - allow the quiz to continue if at least gameScreen exists
            if (!this.gameScreen) {
                console.warn('Game screen element not found - quiz may not function correctly');
            }
            
            // Create scenario elements if they don't exist
            this.ensureRequiredElementsExist();
            
            // Get progress elements - don't fail if they're missing
            this.progressBar = document.getElementById('progress-fill');
            this.levelIndicator = document.getElementById('level-indicator');
            this.questionCounter = document.getElementById('question-progress');
            
            // Update initial progress display
            this.updateProgressDisplay();
            
            console.log('UI initialization complete');
        } catch (error) {
            console.error('Error in initializeUI:', error);
            this.showError('An error occurred while initializing the UI.');
        }
    }
    
    ensureRequiredElementsExist() {
        try {
            console.log('Ensuring required elements exist');
            
            // First make sure we have access to gameScreen
            if (!this.gameScreen) {
                console.error('Cannot create elements without gameScreen');
                return false;
            }
            
            // Check for question section and create if missing
            let questionSection = this.gameScreen.querySelector('.question-section');
            if (!questionSection) {
                console.log('Creating missing question section');
                questionSection = document.createElement('div');
                questionSection.className = 'question-section';
                
                // Find a good place to insert it (before options-section if possible)
                const optionsSection = this.gameScreen.querySelector('.options-section');
                if (optionsSection) {
                    this.gameScreen.insertBefore(questionSection, optionsSection);
                } else {
                    this.gameScreen.appendChild(questionSection);
                }
            }
            
            // Check for scenario title and create if missing
            let titleElement = document.getElementById('scenario-title');
            if (!titleElement) {
                console.log('Creating missing scenario title element');
                titleElement = document.createElement('h2');
                titleElement.id = 'scenario-title';
                titleElement.setAttribute('tabindex', '0');
                questionSection.appendChild(titleElement);
            }
            
            // Check for scenario description and create if missing
            let descriptionElement = document.getElementById('scenario-description');
            if (!descriptionElement) {
                console.log('Creating missing scenario description element');
                descriptionElement = document.createElement('p');
                descriptionElement.id = 'scenario-description';
                descriptionElement.setAttribute('tabindex', '0');
                questionSection.appendChild(descriptionElement);
            }
            
            // Check for options form and create if missing
            let optionsForm = document.getElementById('options-form');
            if (!optionsForm) {
                console.log('Creating missing options form');
                optionsForm = document.createElement('form');
                optionsForm.id = 'options-form';
                optionsForm.className = 'options-section';
                this.gameScreen.appendChild(optionsForm);
            }
            
            // Check for options container and create if missing
            let optionsContainer = document.getElementById('options-container');
            if (!optionsContainer) {
                console.log('Creating missing options container');
                optionsContainer = document.createElement('div');
                optionsContainer.id = 'options-container';
                optionsForm.appendChild(optionsContainer);
            }
            
            // Check for submit button and create if missing
            let submitButton = document.getElementById('submit-btn');
            if (!submitButton) {
                console.log('Creating missing submit button');
                submitButton = document.createElement('button');
                submitButton.type = 'submit';
                submitButton.id = 'submit-btn';
                submitButton.className = 'submit-button';
                submitButton.textContent = 'Submit Answer';
                optionsForm.appendChild(submitButton);
            }
            
            console.log('All required elements checked and created if needed');
            return true;
        } catch (error) {
            console.error('Error in ensureRequiredElementsExist:', error);
            return false;
        }
    }

    updateProgressDisplay() {
        try {
            const totalAnswered = this.player?.questionHistory?.length || 0;
            const totalQuestions = 15; // Total questions for the entire quiz
            
            // Update progress bar if it exists
            if (this.progressBar) {
                const progressPercentage = Math.min((totalAnswered / totalQuestions) * 100, 100);
                this.progressBar.style.width = `${progressPercentage}%`;
            }
            
            // Update level indicator if it exists
            if (this.levelIndicator) {
                const level = this.player?.level || 'basic';
                this.levelIndicator.textContent = level.charAt(0).toUpperCase() + level.slice(1);
            }
            
            // Update question counter if it exists
            if (this.questionCounter) {
                this.questionCounter.textContent = `${totalAnswered} of ${totalQuestions}`;
            }
            
            console.log(`Progress updated: ${totalAnswered}/${totalQuestions} questions answered`);
        } catch (error) {
            console.error('Error in updateProgressDisplay:', error);
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

    shouldEndGame() {
        // End game if we've answered all questions
        return this.player.questionHistory.length >= 15;
    }

    async saveProgress() {
        try {
            if (!this.player) {
                console.error('No player data to save');
                return;
            }

            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No username found. Please login first.');
                return;
            }

            // Calculate score
            const correctAnswers = this.player.questionHistory.filter(q => this.isCorrectAnswer(q.selectedAnswer)).length;
            const score = Math.round((correctAnswers / Math.max(this.player.questionHistory.length, 1)) * 100);

            // Determine if quiz is complete
            const isComplete = this.player.questionHistory.length >= 15;
            const status = isComplete ? (score >= this.passPercentage ? 'passed' : 'failed') : 'in-progress';

            // Create progress object
            const progress = {
                experience: this.player.experience,
                tools: this.player.tools,
                currentScenario: this.player.currentScenario,
                questionHistory: this.player.questionHistory,
                randomizedScenarios: this.randomizedScenarios,
                status: status,
                scorePercentage: score,
                questionsAnswered: this.player.questionHistory.length
            };

            // Save progress
            const quizUser = new QuizUser(username);
            await quizUser.saveQuizProgress(this.quizName, progress);
            console.log('Progress saved successfully');
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    async loadProgress() {
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No username found. Please login first.');
                return false;
            }

            const quizUser = new QuizUser(username);
            const progress = await quizUser.getQuizProgress(this.quizName);

            if (!progress) {
                console.log('No saved progress found. Starting new game.');
                return false;
            }

            // Restore player state
            this.player = {
                name: username,
                experience: progress.experience || 0,
                tools: progress.tools || [],
                currentScenario: progress.currentScenario || 0,
                questionHistory: progress.questionHistory || [],
                level: 'basic',
                // Store randomized scenarios for each level to maintain consistent question order
                randomScenarios: {
                    basic: progress.randomizedScenarios?.basic || null,
                    intermediate: progress.randomizedScenarios?.intermediate || null,
                    advanced: progress.randomizedScenarios?.advanced || null
                }
            };

            // Restore randomized scenarios if available
            if (progress.randomizedScenarios) {
                this.randomizedScenarios = progress.randomizedScenarios;
                console.log('Restored randomized scenarios:', this.randomizedScenarios);
            }

            // Check if all questions have been answered
            if (this.player.questionHistory.length >= 15) {
                console.log('All questions have been answered. Ending game.');
                this.endGame();
                return true;
            }

            // Calculate which level we're on and the scenario index within that level
            const totalAnswered = this.player.questionHistory.length;
            const levelIndex = Math.floor(totalAnswered / 5); // 0, 1, or 2
            const scenarioIndex = totalAnswered % 5; // 0 to 4
            
            // Update current scenario based on progress
            this.player.currentScenario = scenarioIndex;
            
            console.log(`Restored progress: ${totalAnswered} questions answered, level ${levelIndex}, scenario ${scenarioIndex}`);
            
            // Update UI
            this.updateProgressDisplay();
            
            return true;
        } catch (error) {
            console.error('Error loading progress:', error);
            return false;
        }
    }

    async startGame() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            console.log('Starting exploratory quiz game');
            
            // Show loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.remove('hidden');
            }

            // Set player name from localStorage
            this.player.name = localStorage.getItem('username');
            if (!this.player.name) {
                console.warn('No username found, redirecting to login');
                window.location.href = '/login.html';
                return;
            }

            // Initialize event listeners
            this.initializeEventListeners();
            console.log('Event listeners initialized');

            // Load previous progress
            const hasProgress = await this.loadProgress();
            console.log('Progress loaded:', hasProgress);
            
            if (!hasProgress) {
                // Reset player state if no valid progress exists
                this.player.experience = 0;
                this.player.tools = [];
                this.player.currentScenario = 0;
                this.player.questionHistory = [];
            }
            
            // Clear any existing transition messages
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = '';
                transitionContainer.classList.remove('active');
            }

            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
            }
            
            // Pre-initialize randomized scenarios
            try {
                // Force initialization of randomized scenarios
                if (!this.randomizedScenarios || 
                    !this.randomizedScenarios.basic || 
                    this.randomizedScenarios.basic.length === 0) {
                    console.log('Pre-initializing scenarios in startGame');
                    this.getCurrentScenarios();
                }
            } catch (scenarioError) {
                console.error('Failed to initialize scenarios:', scenarioError);
                this.showError('Failed to initialize quiz scenarios. Please try refreshing the page.');
                this.isLoading = false;
                if (loadingIndicator) {
                    loadingIndicator.classList.add('hidden');
                }
                return;
            }
            
            // Display the first scenario and start the timer
            const scenarioDisplayed = await this.displayScenario();
            if (!scenarioDisplayed) {
                console.error('Failed to display initial scenario');
                this.showError('Failed to start the quiz. Please try refreshing the page.');
            }
        } catch (error) {
            console.error('Failed to start game:', error);
            this.showError('Failed to start the quiz. Please try refreshing the page.');
        } finally {
            this.isLoading = false;
            // Hide loading state
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
        }
    }

    initializeEventListeners() {
        try {            
        // Add event listeners for the continue and restart buttons
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) {
                // Remove any existing listeners by cloning and replacing
                const newBtn = continueBtn.cloneNode(true);
                continueBtn.parentNode.replaceChild(newBtn, continueBtn);
                
                // Add fresh event listener
                newBtn.addEventListener('click', () => {
                    this.nextScenario();
                });
            }
            
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => this.restartGame());
            }

        // Add form submission handler
            const optionsForm = document.getElementById('options-form');
            if (optionsForm) {
                optionsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAnswer();
        });
            }
            
            // Add submit button click handler
            const submitButton = document.querySelector('.submit-button');
            if (submitButton) {
                submitButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleAnswer();
                });
            }

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.type === 'radio') {
                this.handleAnswer();
            }
        });
        } catch (error) {
            console.error('Error initializing event listeners:', error);
        }
    }

    displayScenario() {
        try {
            console.log('Displaying scenario');
            
            // Ensure required UI elements exist first
            if (!this.ensureRequiredElementsExist()) {
                throw new Error('Required UI elements could not be created');
            }
            
            // Get total answered questions
            const totalAnswered = this.player?.questionHistory?.length || 0;
            console.log(`Total answered questions: ${totalAnswered}`);
            
            // Force initialization of randomized scenarios if needed
            if (!this.randomizedScenarios || 
                !this.randomizedScenarios.basic || 
                this.randomizedScenarios.basic.length === 0) {
                console.log('Scenarios not initialized, initializing now');
                this.getCurrentScenarios();
            }
            
            // Get the appropriate scenarios based on progress
            const scenarios = this.getCurrentScenarios();
            console.log(`Scenarios for current level: ${scenarios?.length || 0}`);
            
            if (!scenarios || scenarios.length === 0) {
                throw new Error('No scenarios available for the current level');
            }
            
            // Calculate current scenario index within the level
            const scenarioIndex = totalAnswered % 5;
            console.log(`Current scenario index: ${scenarioIndex}`);
            
            // Get current scenario
            this.currentScenario = scenarios[scenarioIndex];
            
            if (!this.currentScenario) {
                console.error(`Scenario not found at index ${scenarioIndex}. Available indexes: 0-${scenarios.length - 1}`);
                
                // Fall back to first scenario if available
                if (scenarios.length > 0) {
                    console.log('Falling back to first scenario in the level');
                    this.currentScenario = scenarios[0];
                } else {
                    throw new Error(`No scenarios available to display`);
                }
            }
            
            console.log(`Selected scenario: ${this.currentScenario.id}, title: ${this.currentScenario.title}`);
            
            // Update UI with current scenario
            this.updateScenarioUI(this.currentScenario);
            
            // Update progress display
            this.updateProgressDisplay();
            
            console.log(`Displaying scenario: ${this.currentScenario.id} (${totalAnswered + 1}/15)`);
            return true;
        } catch (error) {
            console.error('Error in displayScenario:', error);
            this.showError('An error occurred while loading the scenario. Please refresh and try again.');
            return false;
        }
    }
    
    updateScenarioUI(scenario) {
        try {
            if (!scenario) {
                throw new Error('Cannot update UI: No scenario provided');
            }
            
            // Update scenario title
            const titleElement = document.getElementById('scenario-title');
            if (!titleElement) {
                throw new Error('Scenario title element not found in the DOM');
            }
            titleElement.textContent = scenario.title || 'Untitled Scenario';
            
            // Update scenario description
            const descriptionElement = document.getElementById('scenario-description');
            if (!descriptionElement) {
                throw new Error('Scenario description element not found in the DOM');
            }
            descriptionElement.textContent = scenario.description || 'No description available.';
            
            // Update options
            const optionsContainer = document.getElementById('options-container');
            if (!optionsContainer) {
                throw new Error('Options container not found in the DOM');
            }
            optionsContainer.innerHTML = '';
            
            // Add options
            if (scenario.options && scenario.options.length > 0) {
                scenario.options.forEach((option, index) => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    
                    const radioInput = document.createElement('input');
                    radioInput.type = 'radio';
                    radioInput.name = 'option';
                    radioInput.value = index;
                    radioInput.id = `option${index}`;
                    radioInput.setAttribute('tabindex', '0');
                    radioInput.setAttribute('aria-label', option.text || `Option ${index + 1}`);
                    
                    const label = document.createElement('label');
                    label.setAttribute('for', `option${index}`);
                    label.textContent = option.text || `Option ${index + 1}`;
                    
                    optionDiv.appendChild(radioInput);
                    optionDiv.appendChild(label);
                    optionsContainer.appendChild(optionDiv);
                });
            } else {
                const noOptionsMessage = document.createElement('p');
                noOptionsMessage.textContent = 'No options available for this scenario.';
                noOptionsMessage.classList.add('no-options-message');
                optionsContainer.appendChild(noOptionsMessage);
            }
            
            console.log('Scenario UI updated successfully');
        } catch (error) {
            console.error('Error in updateScenarioUI:', error);
            this.showError('An error occurred while updating the scenario display.');
        }
    }

    isCorrectAnswer(answer) {
        // Helper method to consistently determine if an answer is correct
        if (!answer) return false;
        
        // Handle different structures of answer data
        if (typeof answer === 'object') {
            // If it's an option object with isCorrect property
            if (answer.isCorrect !== undefined) {
                return answer.isCorrect === true;
            }
            
            // If it has experience property (positive exp = correct)
            if (answer.experience !== undefined) {
                return answer.experience > 0;
            }
            
            // If it's a history record with selectedOption
            if (answer.selectedOption !== undefined && answer.scenario && answer.scenario.options) {
                const option = answer.scenario.options[answer.selectedOption];
                return option && (option.isCorrect === true || option.experience > 0);
            }
        }
        
        // Default to false if we can't determine
        return false;
    }

    handleAnswer(optionIndex) {
        try {
            console.log(`Handle answer called with option index: ${optionIndex}`);
            
            // If optionIndex is not provided, try to get it from the selected radio button
            if (optionIndex === undefined || optionIndex === null) {
                const selectedOption = document.querySelector('input[name="option"]:checked');
                if (!selectedOption) {
                    throw new Error('No option selected');
                }
                optionIndex = parseInt(selectedOption.value);
            }
            
            // Validate current scenario
            if (!this.currentScenario) {
                console.error('Current scenario not found. This might indicate an issue with scenario loading.');
                
                // Try to recover by attempting to load the current scenario again
                const totalAnswered = this.player?.questionHistory?.length || 0;
                const scenarios = this.getCurrentScenarios();
                if (!scenarios || scenarios.length === 0) {
                    throw new Error('No scenarios available for the current level');
                }
                
                const scenarioIndex = totalAnswered % 5;
                this.currentScenario = scenarios[scenarioIndex];
                
                if (!this.currentScenario) {
                    throw new Error(`Failed to recover. Scenario not found at index ${scenarioIndex}`);
                }
                
                console.log('Successfully recovered current scenario:', this.currentScenario);
            }
            
            // Get selected option
            const selectedOption = this.currentScenario.options[optionIndex];
            if (!selectedOption) {
                throw new Error(`Invalid option index: ${optionIndex}`);
            }
            
            // Record the answer
            const answer = {
                scenario: this.currentScenario, // Store the entire scenario for later review
                scenarioId: this.currentScenario.id,
                selectedAnswer: selectedOption, // Store the entire selected option
                selectedOption: optionIndex,
                timestamp: new Date().toISOString(),
                experienceGained: selectedOption.experience || 0
            };
            
            // Add to question history
            if (!this.player.questionHistory) {
                this.player.questionHistory = [];
            }
            this.player.questionHistory.push(answer);
            
            // Update player experience
            this.player.experience += answer.experienceGained;
            
            // Save progress
            this.saveProgress();
            
            // Show outcome of the selected answer
            this.displayOutcome(selectedOption);
            
            // Check if we should move to the next level or end the game
            const totalAnswered = this.player.questionHistory.length;
            
            if (totalAnswered >= 15) {
                // All questions answered, end the game
                console.log('All 15 questions answered, ending game');
                setTimeout(() => this.endGame(), 2000);
                return;
            }
            
            // Prepare for next question
            console.log(`Total questions answered: ${totalAnswered}`);
            setTimeout(() => this.displayScenario(), 2000);
            
        } catch (error) {
            console.error('Error in handleAnswer:', error);
            this.showError('An error occurred while processing your answer. Please try selecting an option again.');
        }
    }
    
    displayOutcome(option) {
        try {
            if (!option) {
                throw new Error('Cannot display outcome: No option provided');
            }
            
            const outcomeScreen = document.getElementById('outcome-screen');
            const outcomeMessage = document.getElementById('outcome-text');
            const experienceGained = document.getElementById('xp-gained');
            const toolGained = document.getElementById('tool-gained');
            const continueButton = document.getElementById('continue-btn');
            
            if (!outcomeScreen || !outcomeMessage || !experienceGained || !toolGained || !continueButton) {
                throw new Error('Outcome screen elements not found in the DOM');
            }
            
            // Set outcome message
            outcomeMessage.textContent = option.outcome || 'You selected an option.';
            
            // Set experience gained
            const expGained = option.experience || 0;
            experienceGained.textContent = `Experience gained: ${expGained}`;
            
            // Highlight gained experience based on amount
            if (expGained > 10) {
                experienceGained.classList.add('high-experience');
            } else if (expGained > 5) {
                experienceGained.classList.add('medium-experience');
            } else {
                experienceGained.classList.add('low-experience');
            }
            
            // Set tool gained
            toolGained.textContent = `Tool gained: ${option.tool || 'None'}`;
            
            // Show outcome screen
            outcomeScreen.classList.remove('hidden');
            document.getElementById('game-screen').classList.add('hidden');
            
            // Set continue button action
            continueButton.onclick = () => {
                outcomeScreen.classList.add('hidden');
                document.getElementById('game-screen').classList.remove('hidden');
                
                // Remove experience highlight classes
                experienceGained.classList.remove('high-experience', 'medium-experience', 'low-experience');
                
                // Display next scenario (this will be called by handleAnswer after timeout)
            };
            
            console.log('Outcome displayed successfully');
        } catch (error) {
            console.error('Error in displayOutcome:', error);
            this.showError('An error occurred while displaying the outcome.');
            
            // Try to recover by showing the next scenario
            setTimeout(() => this.displayScenario(), 2000);
        }
    }

    initializeTimer() {
            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
        }

        // Set default timer value if not set
        if (!this.timePerQuestion) {
            this.timePerQuestion = 30;
            console.log('[Quiz] Using default timer value:', this.timePerQuestion);
        }

        // Reset remaining time
        this.remainingTime = this.timePerQuestion;
        this.questionStartTime = Date.now();

        // Update timer display
        const timerContainer = document.getElementById('timer-container');
        if (timerContainer) {
            timerContainer.textContent = `Time remaining: ${this.remainingTime}s`;
        }

        // Start the countdown
        this.questionTimer = setInterval(() => {
            this.remainingTime--;
            
            // Update timer display
            if (timerContainer) {
                timerContainer.textContent = `Time remaining: ${this.remainingTime}s`;
                
                // Add warning class when time is running low
                if (this.remainingTime <= 5) {
                    timerContainer.classList.add('timer-warning');
                } else {
                    timerContainer.classList.remove('timer-warning');
                }
            }

            // Check if time is up
            if (this.remainingTime <= 0) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
                this.handleTimeUp();
            }
        }, 1000);
    }

    // Handle time up situation
    handleTimeUp() {
        console.log('Time up! Auto-submitting answer');
        
        try {
            // Get current scenario
            const currentScenarios = this.getCurrentScenarios();
            if (!currentScenarios || !this.player) {
                console.error('Invalid state in handleTimeUp');
                return;
            }
            
            const scenario = currentScenarios[this.player.currentScenario];
            if (!scenario) {
                console.error('No current scenario found in handleTimeUp');
                return;
            }
            
            // Create a timeout answer
            const timeoutAnswer = {
                text: 'Time ran out!',
                experience: 0,
                isCorrect: false,
                isTimeout: true,
                outcome: 'You did not answer in time.'
            };
            
            // Update player state
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: timeoutAnswer,
                isCorrect: false,
                isTimeout: true
            });
            
            // Save progress
            this.saveProgress().catch(error => {
                console.error('Failed to save timeout progress:', error);
            });
            
            // Display the timeout outcome
            this.displayOutcome(timeoutAnswer);
        } catch (error) {
            console.error('Error handling time up:', error);
        }
    }

    restartGame() {
        // Reset player state
        this.player = {
            name: localStorage.getItem('username'),
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: [],
            level: 'basic',
            // Store randomized scenarios for each level to maintain consistent question order
            randomScenarios: {
                basic: null,
                intermediate: null,
                advanced: null
            }
        };

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

        // Update progress display
        this.updateProgressDisplay();

        // Start from first scenario
        this.displayScenario();
    }

    getCurrentScenarios() {
        try {
            const totalAnswered = this.player?.questionHistory?.length || 0;
            
            console.log(`Getting scenarios for total answered: ${totalAnswered}`);
            console.log(`Basic scenarios count: ${this.basicScenarios?.length}`);
            console.log(`Intermediate scenarios count: ${this.intermediateScenarios?.length}`);
            console.log(`Advanced scenarios count: ${this.advancedScenarios?.length}`);
            
            // Ensure scenario arrays exist and have content
            if (!Array.isArray(this.basicScenarios) || this.basicScenarios.length === 0) {
                console.error('Basic scenarios array is empty or undefined');
                throw new Error('Basic scenarios not properly initialized');
            }
            
            if (!Array.isArray(this.intermediateScenarios) || this.intermediateScenarios.length === 0) {
                console.error('Intermediate scenarios array is empty or undefined');
                throw new Error('Intermediate scenarios not properly initialized');
            }
            
            if (!Array.isArray(this.advancedScenarios) || this.advancedScenarios.length === 0) {
                console.error('Advanced scenarios array is empty or undefined');
                throw new Error('Advanced scenarios not properly initialized');
            }
            
            // If we don't have the randomized sets yet, create them
            if (!this.randomizedScenarios || 
                !this.randomizedScenarios.basic || 
                this.randomizedScenarios.basic.length === 0) {
                
                console.log('Initializing randomized scenarios');
                
                // Function to safely get randomized scenarios
                const getRandomScenarios = (scenarios, count) => {
                    // Make a copy of the scenarios array
                    const copy = [...scenarios];
                    
                    // Shuffle the array
                    for (let i = copy.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [copy[i], copy[j]] = [copy[j], copy[i]];
                    }
                    
                    // Return the first 'count' elements or all if fewer
                    return copy.slice(0, Math.min(count, copy.length));
                };
                
                // Create randomized scenario sets
                this.randomizedScenarios = {
                    basic: getRandomScenarios(this.basicScenarios, 5),
                    intermediate: getRandomScenarios(this.intermediateScenarios, 5),
                    advanced: getRandomScenarios(this.advancedScenarios, 5)
                };
                
                console.log('Randomized scenarios created successfully');
                console.log(`Basic: ${this.randomizedScenarios.basic.length}, Intermediate: ${this.randomizedScenarios.intermediate.length}, Advanced: ${this.randomizedScenarios.advanced.length}`);
            }
            
            // Return the appropriate scenario set based on progress
            if (totalAnswered >= 10) {
                console.log('Returning advanced scenarios');
                return this.randomizedScenarios.advanced;
            } else if (totalAnswered >= 5) {
                console.log('Returning intermediate scenarios');
                return this.randomizedScenarios.intermediate;
            } else {
                console.log('Returning basic scenarios');
                return this.randomizedScenarios.basic;
            }
        } catch (error) {
            console.error('Error in getCurrentScenarios:', error);
            // Emergency fallback - return at least something
            return this.basicScenarios && this.basicScenarios.length > 0 ? 
                   this.basicScenarios.slice(0, 5) : 
                   [{
                       id: 'fallback',
                       title: 'Emergency Fallback Scenario',
                       description: 'There was an error loading the proper scenarios. Please refresh the page and try again.',
                       options: [
                           {
                               text: 'Continue',
                               outcome: 'This is a fallback option.',
                               experience: 5
                           },
                           {
                               text: 'Try again',
                               outcome: 'Please refresh the page.',
                               experience: 5
                           }
                       ]
                   }];
        }
    }

    getCurrentLevel() {
        try {
            const totalAnswered = this.player?.questionHistory?.length || 0;
        
            // Determine level based solely on question count
            if (totalAnswered >= 10) {
            return 'Advanced';
            } else if (totalAnswered >= 5) {
            return 'Intermediate';
        }
        return 'Basic';
        } catch (error) {
            console.error('Error in getCurrentLevel:', error);
            return 'Basic'; // Default to basic if there's an error
        }
    }

    generateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations');
        if (!recommendationsContainer) return;

        // Calculate score based on correct answers, not XP
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && this.isCorrectAnswer(q.selectedAnswer)
        ).length;
        const score = Math.round((correctAnswers / 15) * 100);
        
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            // Determine if answer was correct based on positive experience value
            const isCorrect = record.selectedAnswer && this.isCorrectAnswer(record.selectedAnswer);

            // Categorize the question based on its content
            const questionType = this.categorizeQuestion(record.scenario);
            
            if (isCorrect) {
                if (!strongAreas.includes(questionType)) {
                    strongAreas.push(questionType);
                }
            } else {
                if (!weakAreas.includes(questionType)) {
                    weakAreas.push(questionType);
                }
            }
        });

        // Generate recommendations HTML
        let recommendationsHTML = '';

        if (score >= 95 && weakAreas.length === 0) {
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of exploratory testing. You clearly understand the principles and practices of exploratory testing and are well-equipped to handle any exploratory testing challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your exploratory testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
            recommendationsHTML += '<ul>';
            if (weakAreas.length > 0) {
                weakAreas.forEach(area => {
                    recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
                });
            }
            recommendationsHTML += '</ul>';
        } else if (score >= 60) {
            recommendationsHTML = '<p>👍 Good effort! Here are some areas to focus on:</p>';
            recommendationsHTML += '<ul>';
            weakAreas.forEach(area => {
                recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
            });
            recommendationsHTML += '</ul>';
        } else {
            recommendationsHTML = '<p>📚 Here are key areas for improvement:</p>';
            recommendationsHTML += '<ul>';
            weakAreas.forEach(area => {
                recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
            });
            recommendationsHTML += '</ul>';
        }

        recommendationsContainer.innerHTML = recommendationsHTML;
    }

    categorizeQuestion(scenario) {
        // Categorize questions based on their content
        const title = scenario.title.toLowerCase();
        const description = scenario.description.toLowerCase();

        if (title.includes('focus') || description.includes('focus area')) {
            return 'Focus Area Management';
        } else if (title.includes('time') || description.includes('time')) {
            return 'Time Management';
        } else if (title.includes('documentation') || description.includes('document')) {
            return 'Documentation';
        } else if (title.includes('test skills') || description.includes('skills')) {
            return 'Testing Skills';
        } else if (title.includes('compatibility') || description.includes('environment')) {
            return 'Environment Testing';
        } else if (title.includes('non-functional') || description.includes('non-functional')) {
            return 'Non-Functional Testing';
        } else if (title.includes('risk') || description.includes('risk')) {
            return 'Risk Management';
        } else {
            return 'General Exploratory Testing';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Focus Area Management': 'Improve understanding of how to identify and prioritize focus areas based on user needs and functionality importance.',
            'Time Management': 'Strengthen time-boxed testing approach and prioritization of testing activities based on functionality importance.',
            'Documentation': 'Enhance documentation practices for issues, test details, and observations while maintaining exploratory testing flexibility.',
            'Testing Skills': 'Develop expertise in dynamic testing approaches and improve ability to discover defects through creative exploration.',
            'Environment Testing': 'Improve cross-environment testing strategies and documentation of global versus environment-specific issues.',
            'Non-Functional Testing': 'Strengthen understanding of executing predefined non-functional test cases within exploratory scripts.',
            'Risk Management': 'Better understand and manage the risks associated with exploratory testing, particularly regarding test coverage.',
            'General Exploratory Testing': 'Continue developing fundamental exploratory testing principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core exploratory testing principles.';
    }

    // Helper method to shuffle an array using Fisher-Yates algorithm
    shuffleArray(array) {
        // Fisher-Yates shuffle algorithm for randomizing scenario order
        const shuffled = [...array]; // Create a copy to avoid modifying the original array
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
        }
        return shuffled;
    }

    // Implement the endGame method that was missing
    async endGame(failed = false) {
        console.log('End game called with failed =', failed);
        
        try {
            // Clear any timers
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
            }
            
            // Show the end screen and hide others
            if (this.gameScreen) this.gameScreen.classList.add('hidden');
            if (this.outcomeScreen) this.outcomeScreen.classList.add('hidden');
            if (this.endScreen) {
                this.endScreen.classList.remove('hidden');
                console.log('End screen shown');
            } else {
                console.error('End screen element not found');
            }
            
            // Calculate score percentage
            const correctAnswers = this.player.questionHistory.filter(q => this.isCorrectAnswer(q.selectedAnswer)).length;
            const scorePercentage = Math.round((correctAnswers / 15) * 100);
            const isPassed = scorePercentage >= (this.passPercentage || 70);
            
            // Determine final status
            const finalStatus = failed ? 'failed' : (isPassed ? 'passed' : 'failed');
            
            // Update final score display
            const finalScoreElement = document.getElementById('final-score');
            if (finalScoreElement) {
                finalScoreElement.textContent = `Final Score: ${scorePercentage}%`;
            }
            
            // Update performance summary based on thresholds
            const performanceSummary = document.getElementById('performance-summary');
            if (performanceSummary) {
                const thresholds = this.performanceThresholds || [
                    { threshold: 90, message: '🏆 Outstanding! You\'re a testing mindset expert!' },
                    { threshold: 80, message: '👏 Great job! You\'ve shown strong testing instincts!' },
                    { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                    { threshold: 0, message: '📚 Consider reviewing testing mindset best practices and try again!' }
                ];
                
                const threshold = thresholds.find(t => scorePercentage >= t.threshold) || thresholds[thresholds.length - 1];
                performanceSummary.textContent = threshold.message;
            }
            
            // Generate question review
            this.displayQuestionReview();
            
            // Generate personalized recommendations
        this.generateRecommendations();

            // Save final progress
            try {
                const username = localStorage.getItem('username');
                if (username) {
                    const quizUser = new QuizUser(username);
                    await quizUser.updateQuizScore(
                        this.quizName,
                        scorePercentage,
                        this.player.experience,
                        this.player.tools,
                        this.player.questionHistory,
                        15, // Always 15 questions completed
                        finalStatus
                    );
                    console.log('Final quiz score saved:', scorePercentage, 'status:', finalStatus);
                }
        } catch (error) {
                console.error('Failed to save final quiz score:', error);
            }
        } catch (error) {
            console.error('Error in endGame:', error);
            this.showError('An error occurred showing the results. Please try again.');
        }
    }
    
    // Helper method to display question review in the end screen
    displayQuestionReview() {
        const reviewList = document.getElementById('question-review');
        if (!reviewList) return;
        
        let reviewHTML = '';
        this.player.questionHistory.forEach((record, index) => {
            const isCorrect = this.isCorrectAnswer(record.selectedAnswer);
            const scenario = record.scenario;
            
            reviewHTML += `
                <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-header">
                        <span class="review-number">${index + 1}</span>
                        <span class="review-title">${scenario.title || 'Question'}</span>
                        <span class="review-result">${isCorrect ? '✓' : '✗'}</span>
                    </div>
                    <div class="review-detail">
                        <p><strong>Scenario:</strong> ${scenario.description || ''}</p>
                        <p><strong>Your Answer:</strong> ${record.selectedAnswer.text || ''}</p>
                        <p><strong>Outcome:</strong> ${record.selectedAnswer.outcome || ''}</p>
                    </div>
                </div>
            `;
        });
        
        reviewList.innerHTML = reviewHTML;
    }

    checkLevelTransition() {
        try {
            // Get total number of answered questions
            const totalAnswered = this.player?.questionHistory?.length || 0;
            
            // Check if we need to transition to the next level
            if (totalAnswered === 5) {
                console.log('Transitioning to intermediate level');
                this.displayScenario(); // This will load intermediate scenarios
            } else if (totalAnswered === 10) {
                console.log('Transitioning to advanced level');
                this.displayScenario(); // This will load advanced scenarios
            } else if (totalAnswered === 15) {
                console.log('Quiz completed');
                this.endGame();
            } else if (totalAnswered < 15) {
                // Continue with next question in current level
                this.displayScenario();
            }
        } catch (error) {
            console.error('Error in checkLevelTransition:', error);
        }
    }

    endGame() {
        try {
            // Clear any existing timers
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            
            // Update UI to show completion
            const quizContainer = document.getElementById('quiz-container');
            if (quizContainer) {
                quizContainer.innerHTML = `
                    <div class="quiz-complete">
                        <h2>Congratulations!</h2>
                        <p>You have completed all scenarios in the exploratory testing quiz.</p>
                        <p>Total experience gained: ${this.player?.experience || 0}</p>
                        <button id="restart-quiz" class="quiz-button">Restart Quiz</button>
                    </div>
                `;
                
                // Add event listener for restart button
                const restartButton = document.getElementById('restart-quiz');
                if (restartButton) {
                    restartButton.addEventListener('click', () => this.resetQuiz());
                }
            }
            
            // Save final progress
            this.saveProgress();
            console.log('Quiz completed successfully');
        } catch (error) {
            console.error('Error ending game:', error);
        }
    }
    
    resetQuiz() {
        try {
            // Reset player progress
            this.player = {
                experience: 0,
                level: 'basic',
                questionHistory: [],
                // Store randomized scenarios for each level to maintain consistent question order
                randomScenarios: {
                    basic: null,
                    intermediate: null,
                    advanced: null
                }
            };
            
            // Save reset progress
            this.saveProgress();
            
            // Start quiz again
            this.init();
            console.log('Quiz has been reset');
        } catch (error) {
            console.error('Error resetting quiz:', error);
        }
    }
}

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new ExploratoryQuiz();
    quiz.startGame();
}); 