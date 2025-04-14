import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class ExploratoryQuiz extends BaseQuiz {
    constructor() {
        super();
        console.log('Initializing ExploratoryQuiz');
        
        // Initialize base properties
        this.quizName = 'exploratory';
        this.passPercentage = 70;
        this.questionTimer = null;
        this.questionTimeLimit = 60; // 60 seconds per question
        this.timerEnabled = true;
        this.isLoading = false;
        
        // Initialize scenario data structure placeholders
        this.basicScenarios = [];
        this.intermediateScenarios = [];
        this.advancedScenarios = [];
        
        // Initialize player
        this.player = {
            name: '',
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: [],
            level: 'basic'
        };
        
        // Initialize UI
        this.initializeUI();
        
        // Load scenarios
        this.loadScenarios()
            .then(() => {
                console.log('Scenarios loaded successfully');
                // Start the game once scenarios are loaded
                this.startGame();
            })
            .catch(error => {
                console.error('Failed to load scenarios:', error);
                // Display error to user but still try to start the game
                // The startGame method has fallbacks for missing scenarios
                this.showError('There was an issue loading quiz content. Some questions may be unavailable.');
                this.startGame();
            });
    }
    
    async loadScenarios() {
        try {
            // First try to load from window object (may be pre-loaded)
            if (window.allScenarios) {
                this.basicScenarios = window.allScenarios.basic || [];
                this.intermediateScenarios = window.allScenarios.intermediate || [];
                this.advancedScenarios = window.allScenarios.advanced || [];
                console.log('Loaded scenarios from window object');
                return;
            }
            
            // If not in window object, try loading from JSON (example path, adjust as needed)
            try {
                const response = await fetch('/data/exploratory-scenarios.json');
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch scenarios: ${response.status}`);
                }
                
                const data = await response.json();
                
                this.basicScenarios = data.basic || [];
                this.intermediateScenarios = data.intermediate || [];
                this.advancedScenarios = data.advanced || [];
                
                console.log('Loaded scenarios from JSON file');
                
                // Store in window for future use
                window.allScenarios = data;
                
            } catch (fetchError) {
                console.error('Failed to fetch scenarios JSON:', fetchError);
                
                // Use fallback hardcoded scenarios
                this.useFallbackScenarios();
            }
        } catch (error) {
            console.error('Error in loadScenarios:', error);
            // Use fallback hardcoded scenarios
            this.useFallbackScenarios();
        }
    }
    
    useFallbackScenarios() {
        console.log('Using fallback scenarios');
        
        // Create basic fallback scenarios
        this.basicScenarios = [];
        for (let i = 0; i < 5; i++) {
            this.basicScenarios.push({
                id: `basic-fallback-${i}`,
                title: `Basic Exploratory Testing Scenario ${i+1}`,
                description: 'Practice basic exploratory testing techniques.',
                options: [
                    { text: 'Document your findings thoroughly', outcome: 'Good documentation is essential.', experience: 10 },
                    { text: 'Focus on finding as many bugs as possible', outcome: 'Quality over quantity is important.', experience: 5 },
                    { text: 'Skip documentation to save time', outcome: 'Documentation is crucial for exploratory testing.', experience: 0 }
                ]
            });
        }
        
        // Create intermediate fallback scenarios
        this.intermediateScenarios = [];
        for (let i = 0; i < 5; i++) {
            this.intermediateScenarios.push({
                id: `intermediate-fallback-${i}`,
                title: `Intermediate Exploratory Testing Scenario ${i+1}`,
                description: 'Apply more advanced exploratory testing concepts.',
                options: [
                    { text: 'Use a structured approach with time-boxes', outcome: 'Structured exploratory testing is effective.', experience: 10 },
                    { text: 'Test completely free-form without constraints', outcome: 'Some structure helps focus testing efforts.', experience: 5 },
                    { text: 'Focus only on high-risk areas', outcome: 'Balanced coverage is important.', experience: 0 }
                ]
            });
        }
        
        // Create advanced fallback scenarios
        this.advancedScenarios = [];
        for (let i = 0; i < 5; i++) {
            this.advancedScenarios.push({
                id: `advanced-fallback-${i}`,
                title: `Advanced Exploratory Testing Scenario ${i+1}`,
                description: 'Master complex exploratory testing strategies.',
                options: [
                    { text: 'Combine multiple testing techniques', outcome: 'A varied approach works best for complex scenarios.', experience: 10 },
                    { text: 'Focus on edge cases and boundary testing', outcome: 'This is good but a combined approach is better.', experience: 5 },
                    { text: 'Rely on past experience only', outcome: 'Be open to new approaches for each testing context.', experience: 0 }
                ]
            });
        }
    }

    initializeUI() {
        try {
            console.log('Initializing UI for exploratory quiz');
            
            // Ensure all required elements exist
            this.ensureRequiredElementsExist();
            
            // Initialize API service
            this.apiService = new APIService();

            // Create timer display if it doesn't exist
            const timerDisplay = document.getElementById('timer-display');
            if (!timerDisplay) {
                const quizCard = document.querySelector('.quiz-card');
                if (quizCard) {
                    const timerDiv = document.createElement('div');
                    timerDiv.id = 'timer-display';
                    timerDiv.className = 'timer';
                    timerDiv.innerHTML = '<span id="timer-value">60</span>';
                    quizCard.prepend(timerDiv);
                }
            }
            
            // Create loading indicator if it doesn't exist
            const loadingIndicator = document.getElementById('loading-indicator');
            if (!loadingIndicator) {
                const loadingDiv = document.createElement('div');
                loadingDiv.id = 'loading-indicator';
                loadingDiv.className = 'loading-indicator hidden';
                loadingDiv.innerHTML = '<span>Loading...</span>';
                document.body.appendChild(loadingDiv);
            }
            
            // Create level transition container if it doesn't exist
            const transitionContainer = document.getElementById('level-transition-container');
            if (!transitionContainer) {
                const transitionDiv = document.createElement('div');
                transitionDiv.id = 'level-transition-container';
                transitionDiv.className = 'level-transition-container';
                document.body.appendChild(transitionDiv);
            }
            
            // Set up quiz progress indicator
            const progressIndicator = document.getElementById('progress-indicator');
            if (!progressIndicator) {
                const quizCard = document.querySelector('.quiz-card');
                if (quizCard) {
                    const progressDiv = document.createElement('div');
                    progressDiv.id = 'progress-indicator';
                    progressDiv.className = 'progress-indicator';
                    progressDiv.innerHTML = '<span>Question 1/15</span>';
                    quizCard.prepend(progressDiv);
                }
            }
            
            // Add CSS styles for level transition if needed
            const styleExists = document.querySelector('style#exploratory-quiz-styles');
            if (!styleExists) {
                const style = document.createElement('style');
                style.id = 'exploratory-quiz-styles';
                style.innerHTML = `
                    .level-transition-container {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.8);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000;
                        opacity: 0;
                        visibility: hidden;
                        transition: opacity 0.3s ease;
                    }
                    
                    .level-transition-container.active {
                        opacity: 1;
                        visibility: visible;
                    }
                    
                    .level-transition {
                        background-color: white;
                        padding: 30px;
                        border-radius: 10px;
                        text-align: center;
                        max-width: 90%;
                    }
                    
                    .transition-progress {
                        height: 6px;
                        background-color: #eee;
                        margin-top: 20px;
                        position: relative;
                        overflow: hidden;
                        border-radius: 3px;
                    }
                    
                    .transition-progress:after {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 0;
                        height: 100%;
                        width: 30%;
                        background-color: #4CAF50;
                        animation: progress 3s linear forwards;
                    }
                    
                    @keyframes progress {
                        0% { width: 0; }
                        100% { width: 100%; }
                    }
                    
                    .loading-indicator {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(255, 255, 255, 0.8);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 2000;
                    }
                    
                    .loading-indicator.hidden {
                        display: none;
                    }
                `;
                document.head.appendChild(style);
            }
            
            console.log('UI initialization complete');
        } catch (error) {
            console.error('Error initializing UI:', error);
        }
    }

    ensureRequiredElementsExist() {
        try {
            console.log('Ensuring required elements exist');
            
            // Check for the main container
            let quizContainer = document.querySelector('.quiz-container');
            if (!quizContainer) {
                console.log('Creating quiz container');
                quizContainer = document.createElement('div');
                quizContainer.className = 'quiz-container';
                document.body.appendChild(quizContainer);
            }
            
            // Check for game screen
            let gameScreen = document.getElementById('game-screen');
            if (!gameScreen) {
                console.log('Creating game screen');
                gameScreen = document.createElement('div');
                gameScreen.id = 'game-screen';
                gameScreen.className = 'quiz-card';
                gameScreen.setAttribute('role', 'main');
                gameScreen.setAttribute('aria-live', 'polite');
                quizContainer.appendChild(gameScreen);
            }
            
            // Check for scenario container
            let scenarioContainer = document.getElementById('scenario-container');
            if (!scenarioContainer) {
                console.log('Creating scenario container');
                scenarioContainer = document.createElement('div');
                scenarioContainer.id = 'scenario-container';
                scenarioContainer.className = 'scenario-container';
                gameScreen.appendChild(scenarioContainer);
                
                // Add basic structure to scenario container
                scenarioContainer.innerHTML = `
                    <h2 id="scenario-title" class="scenario-title">Loading Scenario...</h2>
                    <p id="scenario-description" class="scenario-description">Please wait while we load your scenario.</p>
                    <div id="options-container" class="options-container"></div>
                `;
            }
            
            // Check for outcome screen
            let outcomeScreen = document.getElementById('outcome-screen');
            if (!outcomeScreen) {
                console.log('Creating outcome screen');
                outcomeScreen = document.createElement('div');
                outcomeScreen.id = 'outcome-screen';
                outcomeScreen.className = 'quiz-card hidden';
                outcomeScreen.style.display = 'none';
                quizContainer.appendChild(outcomeScreen);
                
                // Add basic structure to outcome screen
                outcomeScreen.innerHTML = `
                    <h2 id="outcome-title">Result</h2>
                    <p id="outcome-message"></p>
                    <div id="xp-container" class="xp-container">
                        <span id="xp-amount">+0</span> XP
                    </div>
                    <button id="continue-btn" class="quiz-btn">Continue</button>
                `;
            }
            
            // Check for end screen
            let endScreen = document.getElementById('end-screen');
            if (!endScreen) {
                console.log('Creating end screen');
                endScreen = document.createElement('div');
                endScreen.id = 'end-screen';
                endScreen.className = 'quiz-card hidden';
                endScreen.style.display = 'none';
                quizContainer.appendChild(endScreen);
                
                // Add basic structure to end screen
                endScreen.innerHTML = `
                    <h2>Quiz Complete!</h2>
                    <div class="score-container">
                        <div class="score-circle">
                            <span id="final-score">0%</span>
                        </div>
                    </div>
                    <p id="performance-message"></p>
                    <div id="recommendations"></div>
                    <button id="restart-btn" class="quiz-btn">Restart Quiz</button>
                    <a href="/index.html" class="quiz-btn secondary-btn">Back to Home</a>
                `;
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
            
            // Update question counter
            const progressIndicator = document.getElementById('progress-indicator');
            if (progressIndicator) {
                progressIndicator.innerHTML = `<span>Question ${totalAnswered + 1}/15</span>`;
            }
            
            // Get level based on questions answered
            const level = this.getCurrentLevel();
            
            // Update level indicator if it exists
            const levelIndicator = document.getElementById('level-indicator');
            if (levelIndicator) {
                levelIndicator.textContent = level;
            }
            
            // Update progress bar if it exists
            const progressBar = document.getElementById('progress-fill');
            if (progressBar) {
                const progressPercentage = (totalAnswered / 15) * 100;
                progressBar.style.width = `${progressPercentage}%`;
            }
            
            console.log(`Progress updated: ${totalAnswered}/15 questions, Level: ${level}`);
        } catch (error) {
            console.error('Error updating progress display:', error);
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
                questionsAnswered: this.player.questionHistory.length,
                lastUpdated: new Date().toISOString()
            };

            // Save to localStorage first as a backup
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify(progress));
            console.log('Progress saved to localStorage as backup');

            // Try saving to server
            try {
                const quizUser = new QuizUser(username);
                await quizUser.saveQuizProgress(this.quizName, progress);
                console.log('Progress saved successfully to server');
            } catch (apiError) {
                console.error('Error saving progress to server, using localStorage fallback:', apiError);
                // Already saved to localStorage above, so just log the error
            }
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

            // Try to get progress from API first
            let progress = null;
            let loadedFromAPI = false;
            
            try {
                const quizUser = new QuizUser(username);
                progress = await quizUser.getQuizProgress(this.quizName);
                
                if (progress) {
                    console.log('Progress loaded from API successfully');
                    loadedFromAPI = true;
                }
            } catch (apiError) {
                console.warn('Failed to load progress from API, trying localStorage:', apiError);
            }
            
            // If API failed, try localStorage
            if (!loadedFromAPI) {
                const storageKey = `quiz_progress_${username}_${this.quizName}`;
                const savedData = localStorage.getItem(storageKey);
                
                if (savedData) {
                    try {
                        progress = JSON.parse(savedData);
                        console.log('Progress loaded from localStorage successfully');
                    } catch (parseError) {
                        console.error('Failed to parse localStorage data:', parseError);
                    }
                }
            }

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

            // Initialize UI
            this.initializeUI();
            console.log('UI initialized');

            // Load previous progress
            try {
                const hasProgress = await this.loadProgress();
                console.log('Progress loaded:', hasProgress);
                
                if (!hasProgress) {
                    // Reset player state if no valid progress exists
                    this.player.experience = 0;
                    this.player.tools = [];
                    this.player.currentScenario = 0;
                    this.player.questionHistory = [];
                }
            } catch (progressError) {
                console.error('Error loading progress:', progressError);
                // Continue with a fresh state if loading progress fails
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
            
            // Update progress display
            this.updateProgressDisplay();
            
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

    async displayScenario() {
        try {
            // Ensure we have the scenario container
            const scenarioContainer = document.getElementById('scenario-container');
            if (!scenarioContainer) {
                console.error('Scenario container not found');
                return false;
            }

            // Get the current level scenarios
            console.log('About to get current scenarios');
            let currentScenarios;
            
            try {
                currentScenarios = this.getCurrentScenarios();
            } catch (scenarioError) {
                console.error('Failed to get current scenarios:', scenarioError);
                
                // Emergency fallback if getCurrentScenarios fails
                if (this.randomizedScenarios && 
                    this.randomizedScenarios.basic && 
                    this.randomizedScenarios.basic.length > 0) {
                    currentScenarios = this.randomizedScenarios.basic;
                } else if (this.basicScenarios && this.basicScenarios.length > 0) {
                    currentScenarios = this.basicScenarios.slice(0, 5);
                } else {
                    // Last resort fallback
                    currentScenarios = [{
                        id: 'fallback',
                        title: 'Emergency Fallback Scenario',
                        description: 'There was an error loading the scenarios. Please refresh the page.',
                        options: [
                            {
                                text: 'Continue',
                                outcome: 'Please refresh the page.',
                                experience: 0
                            }
                        ]
                    }];
                }
            }
            
            console.log(`Current level scenarios: ${currentScenarios.length}`);
            
            if (!currentScenarios || currentScenarios.length === 0) {
                console.error('No scenarios available for the current level');
                this.showError('No scenarios available. Please refresh the page.');
                return false;
            }

            // Get current scenario index
            const scenarioIndex = this.player.currentScenario || 0;
            console.log(`Current scenario index: ${scenarioIndex}`);
            
            if (scenarioIndex >= currentScenarios.length) {
                console.error(`Invalid scenario index: ${scenarioIndex} (max: ${currentScenarios.length - 1})`);
                this.player.currentScenario = 0; // Reset to first scenario if out of bounds
            }

            // Get the scenario for the current index
            const currentScenario = currentScenarios[this.player.currentScenario];
            console.log(`Selected scenario: ${currentScenario.id}, title: ${currentScenario.title}`);
            
            if (!currentScenario) {
                console.error('Current scenario is undefined');
                return false;
            }

            // Update the UI with the current scenario
            this.updateScenarioUI(currentScenario);
            
            // Start the timer
            this.initializeTimer();
            
            const totalAnswered = this.player.questionHistory.length;
            console.log(`Displaying scenario: ${currentScenario.id} (${totalAnswered + 1}/15)`);
            
            return true;
        } catch (error) {
            console.error('Error displaying scenario:', error);
            this.showError('An error occurred while displaying the scenario. Please try refreshing the page.');
            return false;
        }
    }
    
    updateScenarioUI(scenario) {
        try {
            console.log(`Updating UI with scenario: ${scenario.id}`);
            
            // Get UI elements
            const titleElement = document.getElementById('scenario-title');
            const descriptionElement = document.getElementById('scenario-description');
            const optionsContainer = document.getElementById('options-container');
            
            // Make sure elements exist
            if (!titleElement || !descriptionElement || !optionsContainer) {
                console.error('Required UI elements not found');
                this.ensureRequiredElementsExist();
                
                // Try again with newly created elements
                const retryTitle = document.getElementById('scenario-title');
                const retryDescription = document.getElementById('scenario-description');
                const retryOptions = document.getElementById('options-container');
                
                if (!retryTitle || !retryDescription || !retryOptions) {
                    throw new Error('Failed to create required UI elements');
                }
                
                // Continue with retry elements
                titleElement = retryTitle;
                descriptionElement = retryDescription;
                optionsContainer = retryOptions;
            }
            
            // Update scenario title and description
            titleElement.textContent = scenario.title || 'Untitled Scenario';
            descriptionElement.textContent = scenario.description || 'No description available';
            
            // Clear existing options
            optionsContainer.innerHTML = '';
            
            // Add scenario options
            if (scenario.options && Array.isArray(scenario.options)) {
                scenario.options.forEach((option, index) => {
                    const optionButton = document.createElement('button');
                    optionButton.className = 'option-btn';
                    optionButton.textContent = option.text || `Option ${index + 1}`;
                    optionButton.setAttribute('data-index', index);
                    optionButton.setAttribute('data-experience', option.experience || 0);
                    
                    // Add event listener
                    optionButton.addEventListener('click', () => {
                        this.handleAnswer(index);
                    });
                    
                    optionsContainer.appendChild(optionButton);
                });
            } else {
                console.warn('No options available for scenario');
                // Add a default option
                const defaultButton = document.createElement('button');
                defaultButton.className = 'option-btn';
                defaultButton.textContent = 'Continue to next question';
                defaultButton.setAttribute('data-index', 0);
                defaultButton.setAttribute('data-experience', 0);
                
                defaultButton.addEventListener('click', () => {
                    this.nextScenario();
                });
                
                optionsContainer.appendChild(defaultButton);
            }
            
            // Update progress display
            this.updateProgressDisplay();
            
            // Initialize timer
            this.initializeTimer();
            
            console.log('Scenario UI updated successfully');
            return true;
        } catch (error) {
            console.error('Error updating scenario UI:', error);
            this.showError('An error occurred while updating the scenario. Please refresh the page.');
            return false;
        }
    }

    isCorrectAnswer(answer) {
        // In exploratory quiz, answers with positive experience are considered correct
        if (!answer) return false;
        
        // If answer is an object (from question history)
        if (typeof answer === 'object') {
            return answer.experience > 0;
        }
        
        // If answer is an option index (from current scenario)
        if (typeof answer === 'number') {
            const currentScenarios = this.getCurrentScenarios();
            const currentScenario = currentScenarios[this.player.currentScenario];
            
            if (currentScenario && currentScenario.options && currentScenario.options[answer]) {
                return currentScenario.options[answer].experience > 0;
            }
        }
        
        return false;
    }

    handleAnswer(optionIndex) {
        try {
            console.log(`Answer selected: option ${optionIndex}`);
            
            // Disable all option buttons to prevent multiple selections
            const optionButtons = document.querySelectorAll('.option-btn');
            optionButtons.forEach(button => {
                button.disabled = true;
                button.classList.add('disabled');
            });
            
            // Stop the timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
            }
            
            // Get current scenario
            const currentScenarios = this.getCurrentScenarios();
            const currentScenario = currentScenarios[this.player.currentScenario];
            
            if (!currentScenario) {
                console.error('Current scenario is undefined');
                this.showError('An error occurred processing your answer. Please try refreshing the page.');
                return;
            }
            
            // Get the selected option
            const selectedOption = currentScenario.options[optionIndex];
            
            if (!selectedOption) {
                console.error(`Option ${optionIndex} not found in current scenario`);
                this.showError('An error occurred processing your answer. Please try refreshing the page.');
                return;
            }
            
            // Record the answer
            const questionRecord = {
                scenario: currentScenario,
                selectedAnswer: selectedOption,
                timestamp: new Date().toISOString()
            };
            
            // Add to question history
            this.player.questionHistory.push(questionRecord);
            
            // Update player experience
            this.player.experience += selectedOption.experience;
            
            // Save progress
            this.saveProgress();
            
            // Display outcome
            this.displayOutcome(selectedOption, currentScenario);
            
        } catch (error) {
            console.error('Error handling answer:', error);
            this.showError('An error occurred processing your answer. Please try refreshing the page.');
        }
    }
    
    displayOutcome(selectedOption, scenario) {
        try {
            console.log('Displaying outcome');
            
            // Hide game screen and show outcome screen
            const gameScreen = document.getElementById('game-screen');
            const outcomeScreen = document.getElementById('outcome-screen');
            
            if (gameScreen) gameScreen.classList.add('hidden');
            if (outcomeScreen) {
                outcomeScreen.classList.remove('hidden');
                outcomeScreen.style.display = 'block';
            }
            
            // Get outcome elements
            const outcomeTitle = document.getElementById('outcome-title');
            const outcomeMessage = document.getElementById('outcome-message');
            const xpAmount = document.getElementById('xp-amount');
            const continueBtn = document.getElementById('continue-btn');
            
            // Check if elements exist
            if (!outcomeTitle || !outcomeMessage || !xpAmount || !continueBtn) {
                console.error('Outcome screen elements not found');
                this.showError('An error occurred displaying the outcome. Please try refreshing the page.');
                this.nextScenario(); // Force continue to next scenario
                return;
            }
            
            // Set outcome content
            const isCorrect = this.isCorrectAnswer(selectedOption);
            outcomeTitle.textContent = isCorrect ? 'Good Choice!' : 'Consider This...';
            outcomeMessage.textContent = selectedOption.outcome || 'No feedback available for this choice.';
            
            // Set XP amount with color based on whether it's positive or negative
            const xp = selectedOption.experience || 0;
            xpAmount.textContent = xp >= 0 ? `+${xp}` : `${xp}`;
            xpAmount.className = xp > 0 ? 'positive-xp' : (xp < 0 ? 'negative-xp' : '');
            
            // Add event listener to continue button
            continueBtn.addEventListener('click', () => {
                this.nextScenario();
            }, { once: true }); // Use once:true to prevent multiple event bindings
            
            console.log('Outcome displayed successfully');
        } catch (error) {
            console.error('Error displaying outcome:', error);
            this.showError('An error occurred displaying the outcome. Please try refreshing the page.');
            setTimeout(() => this.nextScenario(), 2000); // Force continue after error
        }
    }

    initializeTimer() {
        try {
            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
            }
            
            // Skip if timer is disabled
            if (!this.timerEnabled) {
                console.log('Timer is disabled, skipping initialization');
                return;
            }
            
            // Get timer element
            const timerElement = document.getElementById('timer-value');
            if (!timerElement) {
                console.warn('Timer element not found, skipping timer initialization');
                return;
            }
            
            // Set initial time
            let timeLeft = this.questionTimeLimit;
            timerElement.textContent = timeLeft;
            
            // Start timer
            this.questionTimer = setInterval(() => {
                timeLeft--;
                
                // Update timer display
                if (timerElement) {
                    timerElement.textContent = timeLeft;
                    
                    // Change color when time is low
                    if (timeLeft <= 10) {
                        timerElement.classList.add('timer-warning');
                    }
                }
                
                // Handle time up
                if (timeLeft <= 0) {
                    clearInterval(this.questionTimer);
                    this.handleTimeUp();
                }
            }, 1000);
            
            console.log(`Timer initialized with ${this.questionTimeLimit} seconds`);
        } catch (error) {
            console.error('Error initializing timer:', error);
            // Continue without timer if there's an error
        }
    }
    
    handleTimeUp() {
        try {
            console.log('Time up - automatically selecting an answer');
            
            // Clear timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
            }
            
            // Get current scenario
            const currentScenarios = this.getCurrentScenarios();
            const currentScenario = currentScenarios[this.player.currentScenario];
            
            if (!currentScenario || !currentScenario.options || currentScenario.options.length === 0) {
                console.error('Cannot handle time up - invalid scenario or options');
                this.nextScenario(); // Move to next scenario
                return;
            }
            
            // Find a neutral option (experience = 0) if available
            let neutralOptionIndex = currentScenario.options.findIndex(opt => opt.experience === 0);
            
            // If no neutral option, select the first option
            if (neutralOptionIndex === -1) {
                neutralOptionIndex = 0;
            }
            
            // Handle the selected answer
            this.handleAnswer(neutralOptionIndex);
            
            // Show the time-up message
            this.showError('Time is up! An answer has been automatically selected.');
        } catch (error) {
            console.error('Error handling time up:', error);
            this.nextScenario(); // Move to next scenario to avoid getting stuck
        }
    }

    restartGame() {
        // Reset player state
        this.player = {
            name: localStorage.getItem('username'),
            experience: 0,
            tools: [],
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
            
            // Safety check and initialization for scenario arrays
            if (!this.basicScenarios || !Array.isArray(this.basicScenarios) || this.basicScenarios.length === 0) {
                console.warn('Basic scenarios not properly initialized, checking if they exist in the window object');
                // Try to get scenarios from the window object (might be initialized elsewhere)
                if (window.allScenarios && window.allScenarios.basic) {
                    this.basicScenarios = window.allScenarios.basic;
                } else {
                    // Create a minimal fallback
                    console.error('Basic scenarios not available - creating fallback');
                    this.basicScenarios = [{
                        id: 'basic-fallback',
                        title: 'Basic Exploratory Testing',
                        description: 'Fallback scenario for basic level testing.',
                        options: [
                            { text: 'Plan your exploratory testing session', outcome: 'This is a good approach.', experience: 5 },
                            { text: 'Start testing without planning', outcome: 'Planning first is usually better.', experience: 0 }
                        ]
                    }];
                }
            }
            
            if (!this.intermediateScenarios || !Array.isArray(this.intermediateScenarios) || this.intermediateScenarios.length === 0) {
                console.warn('Intermediate scenarios not properly initialized, checking if they exist in the window object');
                // Try to get scenarios from the window object
                if (window.allScenarios && window.allScenarios.intermediate) {
                    this.intermediateScenarios = window.allScenarios.intermediate;
                } else {
                    // Create a minimal fallback
                    console.error('Intermediate scenarios not available - creating fallback');
                    this.intermediateScenarios = [{
                        id: 'intermediate-fallback',
                        title: 'Intermediate Exploratory Testing',
                        description: 'Fallback scenario for intermediate level testing.',
                        options: [
                            { text: 'Document your test findings thoroughly', outcome: 'Good documentation is important.', experience: 5 },
                            { text: 'Only document major issues', outcome: 'Thorough documentation is better.', experience: 0 }
                        ]
                    }];
                }
            }
            
            if (!this.advancedScenarios || !Array.isArray(this.advancedScenarios) || this.advancedScenarios.length === 0) {
                console.warn('Advanced scenarios not properly initialized, checking if they exist in the window object');
                // Try to get scenarios from the window object
                if (window.allScenarios && window.allScenarios.advanced) {
                    this.advancedScenarios = window.allScenarios.advanced;
                } else {
                    // Create a minimal fallback
                    console.error('Advanced scenarios not available - creating fallback');
                    this.advancedScenarios = [{
                        id: 'advanced-fallback',
                        title: 'Advanced Exploratory Testing',
                        description: 'Fallback scenario for advanced level testing.',
                        options: [
                            { text: 'Combine exploratory and scripted testing', outcome: 'This balanced approach is effective.', experience: 5 },
                            { text: 'Focus only on exploratory testing', outcome: 'A combined approach is usually better.', experience: 0 }
                        ]
                    }];
                }
            }
            
            console.log(`Scenario counts - Basic: ${this.basicScenarios.length}, Intermediate: ${this.intermediateScenarios.length}, Advanced: ${this.advancedScenarios.length}`);
            
            // If we don't have the randomized sets yet, create them
            if (!this.randomizedScenarios || 
                !this.randomizedScenarios.basic || 
                this.randomizedScenarios.basic.length === 0) {
                
                console.log('Initializing randomized scenarios');
                
                // Function to safely get randomized scenarios
                const getRandomScenarios = (scenarios, count) => {
                    if (!scenarios || scenarios.length === 0) {
                        console.error('Cannot randomize empty scenario array');
                        return [];
                    }
                    
                    // Make a copy of the scenarios array
                    const copy = [...scenarios];
                    
                    // Shuffle the array
                    for (let i = copy.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [copy[i], copy[j]] = [copy[j], copy[i]];
                    }
                    
                    // Return the first 'count' elements or all if fewer
                    const selected = copy.slice(0, Math.min(count, copy.length));
                    
                    // If we don't have enough, pad with duplicates
                    if (selected.length < count) {
                        console.warn(`Not enough scenarios available (${selected.length}/${count}), padding with duplicates`);
                        const needed = count - selected.length;
                        for (let i = 0; i < needed; i++) {
                            selected.push(selected[i % selected.length]); // Repeat from beginning
                        }
                    }
                    
                    return selected;
                };
                
                // Create randomized scenario sets
                this.randomizedScenarios = {
                    basic: getRandomScenarios(this.basicScenarios, 5),
                    intermediate: getRandomScenarios(this.intermediateScenarios, 5),
                    advanced: getRandomScenarios(this.advancedScenarios, 5)
                };
                
                console.log('Created randomized scenarios:', this.randomizedScenarios);
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
            const fallbackScenarios = [];
            for (let i = 0; i < 5; i++) {
                fallbackScenarios.push({
                    id: `fallback-${i}`,
                    title: `Exploratory Testing Scenario ${i + 1}`,
                    description: 'This is a fallback scenario. The original scenarios could not be loaded.',
                    options: [
                        {
                            text: 'Choose the most thorough approach',
                            outcome: 'This is generally the best option.',
                            experience: 5
                        },
                        {
                            text: 'Choose a quicker approach',
                            outcome: 'Sometimes thoroughness is more important than speed.',
                            experience: 0
                        }
                    ]
                });
            }
            
            return fallbackScenarios;
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
        try {
            console.log(`Ending game. Failed: ${failed}`);
            
            // Clear any running timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
            }
            
            // Hide game and outcome screens
            const gameScreen = document.getElementById('game-screen');
            const outcomeScreen = document.getElementById('outcome-screen');
            const endScreen = document.getElementById('end-screen');
            
            if (gameScreen) gameScreen.classList.add('hidden');
            if (outcomeScreen) outcomeScreen.classList.add('hidden');
            if (endScreen) {
                endScreen.classList.remove('hidden');
                endScreen.style.display = 'block';
            }
            
            // Calculate score
            const answeredCount = this.player.questionHistory.length; 
            const correctCount = this.player.questionHistory.filter(q => this.isCorrectAnswer(q.selectedAnswer)).length;
            const scorePercentage = Math.round((correctCount / Math.max(answeredCount, 1)) * 100);
            
            // Update final score display
            const finalScoreElement = document.getElementById('final-score');
            if (finalScoreElement) {
                finalScoreElement.textContent = `${scorePercentage}%`;
            }
            
            // Update performance message
            const performanceMessage = document.getElementById('performance-message');
            if (performanceMessage) {
                if (scorePercentage >= 90) {
                    performanceMessage.textContent = '🏆 Outstanding! You\'re an exploratory testing expert!';
                } else if (scorePercentage >= 80) {
                    performanceMessage.textContent = '👏 Great job! You\'ve shown strong exploratory testing skills!';
                } else if (scorePercentage >= 70) {
                    performanceMessage.textContent = '👍 Good work! You\'ve passed the quiz!';
                } else {
                    performanceMessage.textContent = '📚 Consider reviewing exploratory testing best practices and try again!';
                }
            }
            
            // Generate recommendations
            this.generateRecommendations();
            
            // Add event listener to restart button
            const restartButton = document.getElementById('restart-btn');
            if (restartButton) {
                restartButton.addEventListener('click', () => {
                    this.restartQuiz();
                });
            }
            
            // Final save with completed status
            try {
                const status = scorePercentage >= this.passPercentage ? 'passed' : 'failed';
                const username = localStorage.getItem('username');
                
                if (username) {
                    const quizUser = new QuizUser(username);
                    await quizUser.updateQuizScore(this.quizName, scorePercentage, this.player.experience, this.player.tools, this.player.questionHistory, answeredCount, status);
                }
            } catch (saveError) {
                console.error('Error saving final quiz result:', saveError);
            }
            
            console.log('Game ended successfully');
        } catch (error) {
            console.error('Error ending game:', error);
            this.showError('An error occurred while finishing the quiz. Your progress has been saved, but the results may not be displayed correctly.');
        }
    }
    
    restartQuiz() {
        try {
            console.log('Restarting quiz');
            
            // Clear player data
            this.player = {
                name: localStorage.getItem('username') || '',
                experience: 0,
                tools: [],
                currentScenario: 0,
                questionHistory: [],
                level: 'basic'
            };
            
            // Clear randomized scenarios to generate new ones
            this.randomizedScenarios = null;
            
            // Reset UI
            const gameScreen = document.getElementById('game-screen');
            const outcomeScreen = document.getElementById('outcome-screen');
            const endScreen = document.getElementById('end-screen');
            
            if (endScreen) endScreen.classList.add('hidden');
            if (outcomeScreen) outcomeScreen.classList.add('hidden');
            if (gameScreen) gameScreen.classList.remove('hidden');
            
            // Start the game again
            this.startGame();
            
            console.log('Quiz restarted successfully');
        } catch (error) {
            console.error('Error restarting quiz:', error);
            this.showError('An error occurred while restarting the quiz. Please refresh the page.');
            
            // Force reload as last resort
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
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

    // Add the missing nextScenario method
    async nextScenario() {
        try {
            console.log('Moving to next scenario');
            
            // Clear the timer if it exists
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
                console.log('Timer cleared in nextScenario');
            }
            
            const totalAnswered = this.player.questionHistory.length;
            
            // Check if we should end the game (15 questions answered)
            if (totalAnswered >= 15) {
                console.log('All 15 questions answered, ending game');
                this.endGame();
                return;
            }
            
            // Check if we need to transition to a new level
            const currentLevel = Math.floor((totalAnswered - 1) / 5); // 0-based (0, 1, 2)
            const nextLevel = Math.floor(totalAnswered / 5);  // 0-based (0, 1, 2)
            
            // If we're transitioning to a new level, show transition screen
            if (currentLevel !== nextLevel && totalAnswered > 0) {
                console.log(`Transitioning from level ${currentLevel} to ${nextLevel}`);
                
                // Get level names
                const levelNames = ['Basic', 'Intermediate', 'Advanced'];
                const nextLevelName = levelNames[nextLevel] || 'Advanced';
                
                // Display transition message
                this.showLevelTransition(nextLevelName);
                
                // Set a delay before continuing to the next question
                setTimeout(() => {
                    this.hideLevelTransition();
                    this.continueToNextScenario();
                }, 3000); // 3 second delay
                
                return;
            }
            
            // If no transition needed, continue directly
            this.continueToNextScenario();
        } catch (error) {
            console.error('Error in nextScenario:', error);
            this.showError('An error occurred while loading the next scenario. Please try again.');
        }
    }
    
    showLevelTransition(levelName) {
        try {
            const transitionContainer = document.getElementById('level-transition-container');
            if (!transitionContainer) {
                console.warn('Level transition container not found');
                return;
            }
            
            transitionContainer.innerHTML = `
                <div class="level-transition">
                    <h2>Level Up!</h2>
                    <p>Moving to ${levelName} Level</p>
                    <div class="transition-progress"></div>
                </div>
            `;
            
            transitionContainer.classList.add('active');
            
            // Hide other screens
            const gameScreen = document.getElementById('game-screen');
            const outcomeScreen = document.getElementById('outcome-screen');
            if (gameScreen) gameScreen.classList.add('hidden');
            if (outcomeScreen) outcomeScreen.classList.add('hidden');
        } catch (error) {
            console.error('Error showing level transition:', error);
        }
    }
    
    hideLevelTransition() {
        try {
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.classList.remove('active');
            }
        } catch (error) {
            console.error('Error hiding level transition:', error);
        }
    }
    
    continueToNextScenario() {
        try {
            // Increment current scenario index
            // This needs to wrap around to 0 when we reach the end of a level (5 scenarios)
            const currentTotal = this.player.questionHistory.length;
            this.player.currentScenario = currentTotal % 5;
            
            console.log(`Incremented to scenario: ${this.player.currentScenario}`);
            
            // Hide outcome screen and show game screen
            const outcomeScreen = document.getElementById('outcome-screen');
            const gameScreen = document.getElementById('game-screen');
            
            if (outcomeScreen) {
                outcomeScreen.classList.add('hidden');
                outcomeScreen.style.display = 'none';
                console.log('Hidden outcome screen');
            }
            
            if (gameScreen) {
                gameScreen.classList.remove('hidden');
                gameScreen.style.display = 'block';
                console.log('Shown game screen');
            }
            
            // Display the next scenario
            this.displayScenario();
            
            console.log('Next scenario displayed');
        } catch (error) {
            console.error('Error in continueToNextScenario:', error);
            this.showError('An error occurred while loading the next scenario. Please try again.');
        }
    }
} 