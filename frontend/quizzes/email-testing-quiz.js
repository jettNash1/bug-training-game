import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';

class EmailTestingQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a email testing expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong email testing skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing email testing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'email-testing',
            writable: false,
            configurable: false,
            enumerable: true
        });
        
         // Initialize player state
         this.player = {
            name: '',
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: []
        };

        // Initialize API service
        this.apiService = new APIService();

        // Initialize all screen elements
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');
        
        // Verify all required elements exist
        if (!this.gameScreen) {
            console.error('Game screen element not found');
            this.showError('Quiz initialization failed. Please refresh the page.');
            return;
        }
        
        if (!this.outcomeScreen) {
            console.error('Outcome screen element not found');
            this.showError('Quiz initialization failed. Please refresh the page.');
            return;
        }
        
        if (!this.endScreen) {
            console.error('End screen element not found');
            this.showError('Quiz initialization failed. Please refresh the page.');
            return;
        }

        // Basic Scenarios (IDs 1-5, 75 XP total)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Primary objective',
                description: "What is the primary purpose of email testing?",
                options: [
                    {
                        text: 'To increase email open rates',
                        outcome: "This relates to marketing metrics, not testing",
                        experience: -10
                    },
                    {
                        text: "To preview, validate and evaluate an email's coding, content, formatting, readability and visual appeal before sending",
                        outcome: 'This is the purpose of email testing.',
                        experience: 15
                    },
                    {
                        text: "To check if emails reach spam folders",
                        outcome: "While spam prevention is a benefit, it's not the primary purpose.",
                        experience: 5
                    },
                    {
                        text: "To test different subject lines for marketing effectiveness",
                        outcome: "The subject line is just one small component of an email.",
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Email clients',
                description: 'Which email clients are typically included in testing scope?',
                options: [
                    {
                        text: 'Only Gmail and Outlook',
                        outcome: 'While these are important clients, the scope should be broader.',
                        experience: 5
                    },
                    {
                        text: 'Gmail, Outlook, Yahoo Mail, and Apple Mail',
                        outcome: 'These are the main email clients, however, the client may request additional email clients.',
                        experience: 15
                    },
                    {
                        text: 'All possible email clients globally',
                        outcome: 'Testing all global email clients would be impractical.',
                        experience: -5
                    },
                    {
                        text: 'Only mobile email clients',
                        outcome: 'Testing should not be limited to mobile clients.',
                        experience: -10
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'UTM understanding',
                description: 'What does UTM stand for in email testing?',
                options: [
                    {
                        text: 'Universal Testing Module',
                        outcome: 'While it is a module for testing, "Universal" is incorrect',
                        experience: 5
                    },
                    {
                        text: 'Unified Tracking Method',
                        outcome: 'This is a made-up term.',
                        experience: -10
                    },
                    {
                        text: 'Urchin Tracking Module',
                        outcome: 'This is a made-up term.',
                        experience: -5
                    },
                    {
                        text: 'UTM stands for Urchin Tracking Module',
                        outcome: 'This is the correct statement',
                        experience: 15
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Dark Mode',
                description: 'When should you check dark mode rendering?',
                options: [
                    {
                        text: 'Only on mobile devices',
                        outcome: 'Testing only mobile would miss desktop issues.',
                        experience: -10
                    },
                    {
                        text: 'Only on desktop clients',
                        outcome: 'Testing only desktop would miss mobile issues.',
                        experience: -5
                    },
                    {
                        text: 'Across all supported email clients and devices',
                        outcome: 'Dark mode should be tested across all supported platforms',
                        experience: 15
                    },
                    {
                        text: 'Only when specifically requested',
                        outcome: 'While client requests matter, dark mode testing is standard',
                        experience: 5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Email testing process',
                description: 'What is the first step in email testing?',
                options: [
                    {
                        text: 'Check all links in the email',
                        outcome: 'Link checking comes later in the process.',
                        experience: -5
                    },
                    {
                        text: 'Familiarise yourself with project documentation',
                        outcome: 'This should be the first step in the testing process.',
                        experience: 15
                    },
                    {
                        text: 'Set up test environments',
                        outcome: 'While important, this comes after reviewing documentation',
                        experience: 5
                    },
                    {
                        text: 'Create test accounts',
                        outcome: 'This would not come before reviewing documentation',
                        experience: -10
                    }
                ]
            },
        ];


        // Intermediate Scenarios (IDs 6-10, 125 XP total)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Bug reporting',
                description: 'What should you do when you discover a bug in one environment?',
                options: [
                    {
                        text: 'Immediately report it',
                        outcome: 'While reporting is important, checking other environments first is more efficient.',
                        experience: 5
                    },
                    {
                        text: 'Check if the issue exists across other environments before reporting',
                        outcome: 'Other environments must be checked to determine if the issue is global.',
                        experience: 20
                    },
                    {
                        text: 'Only report it if it affects functionality',
                        outcome: 'All issues should be reported regardless of type',
                        experience: -10
                    },
                    {
                        text: 'Wait for client confirmation',
                        outcome: 'Client confirmation isn\'t needed to report bugs',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Test script reporting',
                description: 'How should test results be marked in the test script?',
                options: [
                    {
                        text: 'Only pass or fail',
                        outcome: 'While pass/fail is included, more detailed options should be available and stated.',
                        experience: 5
                    },
                    {
                        text: 'Using the Result Key options',
                        outcome: 'This is the recommended way of reporting issues.',
                        experience: 20
                    },
                    {
                        text: 'With detailed written descriptions',
                        outcome: 'Written descriptions supplement but don\'t replace the Result Key',
                        experience: -5
                    },
                    {
                        text: 'Only marking critical issues',
                        outcome: 'All issues should be marked, not just critical ones',
                        experience: -10
                    }
                ]
            },
            {   
                id: 8,
                level: 'Intermediate',
                title: 'Reviewing images',
                description: 'What should be checked regarding email images?',
                options: [
                    {
                        text: 'Just image quality and resolution',
                        outcome: 'While quality is important, other aspects must also be checked',
                        experience: 5
                    },
                    {
                        text: 'Image placement, alignment, quality, label, and display in both light/dark modes',
                        outcome: 'These are all necessary checks for images.',
                        experience: 20
                    },
                    {
                        text: 'Only whether images load properly',
                        outcome: 'Loading is just one aspect of image testing',
                        experience: -10
                    },
                    {
                        text: 'Just image size and format',
                        outcome: 'Size and format are just basic aspects',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'How should company details be verified in emails?',
                description: 'Check against Wikipedia',
                options: [
                    {
                        text: 'Check against Wikipedia',
                        outcome: 'Wikipedia isn\'t a reliable source for verification.',
                        experience: -15
                    },
                    {
                        text: 'Verify against the company website',
                        outcome: 'While the website can help, target market specificity is key.',
                        experience: 5
                    },
                    {
                        text: 'Match details to the target market (e.g., UK address for UK market)',
                        outcome: 'Details should be checked against target market',
                        experience: 20
                    },
                    {
                        text: 'Use generic company information',
                        outcome: 'Generic information may not be accurate',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Project Metrics',
                description: 'What should be included in the project metrics after testing?',
                options: [
                    {
                        text: 'Only number of bugs',
                        outcome: 'Bug count alone is insufficient.',
                        experience: -5
                    },
                    {
                        text: 'Session totals, ticket resolution totals, and project burndown',
                        outcome: 'All these metrics should be included unless otherwise specified.',
                        experience: 20
                    },
                    {
                        text: 'Just test completion percentage',
                        outcome: 'While completion is tracked, more metrics are needed',
                        experience: 5
                    },
                    {
                        text: 'Only critical issues',
                        outcome: 'All issues, not just critical ones, should be tracked',
                        experience: -10
                    }
                ]
            },
        ];


        // Advanced Scenarios (IDs 11-15, 100 XP total)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Resource calculator',
                description: 'How should the resource calculator be used in email testing?',
                options: [
                    {
                        text: 'Only for estimating total project time',
                        outcome: 'While it helps with timing, it\'s more comprehensive.',
                        experience: 5
                    },
                    {
                        text: 'To calculate exact testing hours needed',
                        outcome: 'It provides guidance rather than exact calculations.',
                        experience: -5
                    },
                    {
                        text: 'For guided timeframe planning with adjustable fields for setup, copy check, link check, rendering check, and reporting',
                        outcome: 'Correct as this is used for multiple adjustable testing activities',
                        experience: 25
                    },
                    {
                        text: 'Only for billing purposes',
                        outcome: "It's used for planning, not billing",
                        experience: -10
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Unsubscribe links',
                description: 'What is the correct approach when handling unsubscribe links during testing?',
                options: [
                    {
                        text: 'Report all non-functioning unsubscribe links as critical bugs',
                        outcome: 'These may not necessarily be bugs in the test environment.',
                        experience: -5
                    },
                    {
                        text: 'Ignore all unsubscribe link issues',
                        outcome: 'Issues should still be documented appropriately.',
                        experience: -10
                    },
                    {
                        text: 'Understand that unsubscribe links may error due to test distribution differences from live',
                        outcome: 'This is potentially expected behaviour in test environment as live environment may yet not be set up of which details should be provided by the client',
                        experience: 25
                    },
                    {
                        text: 'Test unsubscribe functionality in production',
                        outcome: 'While production testing may work, it\'s not the recommended approach',
                        experience: 5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Text wrap evaluation',
                description: 'How should text wrapping issues be evaluated?',
                options: [
                    {
                        text: 'Only check on mobile devices',
                        outcome: 'While mobile is important, all devices need checking specified by the client.',
                        experience: 5
                    },
                    {
                        text: 'Compare against design specifications for consistent text flow across all devices',
                        outcome: 'Checking consistency with design across all platforms is recommended.',
                        experience: 25
                    },
                    {
                        text: 'Only check headlines',
                        outcome: 'All text needs checking, not just headlines',
                        experience: -10
                    },
                    {
                        text: 'Ignore minor wrapping differences',
                        outcome: 'All wrapping issues should be noted',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Results tables within scripts',
                description: 'When updating the Overall Results table, what must be considered?',
                options: [
                    {
                        text: 'Only failed tests',
                        outcome: 'While failures are important, all results must be included.',
                        experience: 5
                    },
                    {
                        text: 'Just critical issues',
                        outcome: 'All issues, not just critical ones, must be included.',
                        experience: -10
                    },
                    {
                        text: 'Only passed tests',
                        outcome: 'Both passes and failures must be included',
                        experience: -5
                    },
                    {
                        text: 'The entire range of tests including any newly added environments',
                        outcome: 'All test ranges should be updated including updating formulas to include any new environments',
                        experience: 25
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Light & Dark mode testing priority',
                description: 'How should light/dark mode testing be coordinated across devices?',
                options: [
                    {
                        text: 'Test only system-level changes',
                        outcome: 'Client-specific settings must also be tested.',
                        experience: -10
                    },
                    {
                        text: 'Check each email client independently',
                        outcome: 'While individual testing is needed, system settings must be considered.',
                        experience: 5
                    },
                    {
                        text: 'Coordinate system settings and individual app preferences, understanding that some clients follow system settings while others need manual configuration',
                        outcome: 'The relationship between system and app-specific settings should be tested',
                        experience: 25
                    },
                    {
                        text: 'Use only default settings',
                        outcome: 'Testing default settings alone is insufficient',
                        experience: -5
                    }
                ]
            },
        ];


        // Initialize UI and add event listeners
        this.initializeEventListeners();

        this.isLoading = false;
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

    async saveProgress() {
        const progress = {
            experience: this.player.experience,
            tools: this.player.tools,
            currentScenario: this.player.currentScenario,
            questionHistory: this.player.questionHistory,
            lastUpdated: new Date().toISOString()
        };

        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot save progress');
                return;
            }
            
            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify({ progress }));
            
            await this.apiService.saveQuizProgress(this.quizName, progress);
        } catch (error) {
            console.error('Failed to save progress:', error);
            // Continue without saving - don't interrupt the user experience
        }
    }

    async loadProgress() {
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot load progress');
                return false;
            }

            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            const savedProgress = await this.apiService.getQuizProgress(this.quizName);
            let progress = null;
            
            if (savedProgress && savedProgress.data) {
                progress = savedProgress.data;
            } else {
                // Try loading from localStorage
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (parsed.progress) {
                        progress = parsed.progress;
                    }
                }
            }

            if (progress) {
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                
                // Fixed: Set current scenario to the next unanswered question
                this.player.currentScenario = this.player.questionHistory.length;

                // Update UI
                this.updateProgress();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to load progress:', error);
            return false;
        }
    }

    async startGame() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            // Show loading state
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.remove('hidden');
            }
            // Set player name from localStorage
            this.player.name = localStorage.getItem('username');
            if (!this.player.name) {
                window.location.href = '/login.html';
                return;
            }
            const hasProgress = await this.loadProgress();
            
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
            
            await this.displayScenario();
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
        // Add event listeners for the continue and restart buttons
        document.getElementById('continue-btn')?.addEventListener('click', () => this.nextScenario());
        document.getElementById('restart-btn')?.addEventListener('click', () => this.restartGame());

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

    displayScenario() {
        const currentScenarios = this.getCurrentScenarios();
        
        // Check if quiz should end
        if (this.player.questionHistory.length >= 15) {
            this.endGame();
            return;
        }
        
        if (this.player.currentScenario >= currentScenarios.length) {
            const totalQuestionsAnswered = this.player.questionHistory.length;
            
            if (this.shouldEndGame(totalQuestionsAnswered, this.player.experience)) {
                this.endGame();
                return;
            }
            
            this.player.currentScenario = 0;
            this.displayScenario();
            return;
        }

        const scenario = currentScenarios[this.player.currentScenario];
        if (!scenario) {
            console.error('No scenario found for index:', this.player.currentScenario);
            console.log('Current scenarios:', currentScenarios);
            console.log('Current state:', {
                totalAnswered: this.player.questionHistory.length,
                currentXP: this.player.experience,
                currentScenario: this.player.currentScenario
            });
            return;
        }
        
        // Show level transition message at the start of each level
        const previousLevel = this.player.questionHistory.length > 0 ? 
            this.player.questionHistory[this.player.questionHistory.length - 1].scenario.level : null;
            
        if (this.player.currentScenario === 0 || previousLevel !== scenario.level) {
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = ''; // Clear any existing messages
                
                const levelMessage = document.createElement('div');
                levelMessage.className = 'level-transition';
                levelMessage.setAttribute('role', 'alert');
                levelMessage.textContent = `Starting ${scenario.level} Questions`;
                
                transitionContainer.appendChild(levelMessage);
                transitionContainer.classList.add('active');
                
                // Update the level indicator
                const levelIndicator = document.getElementById('level-indicator');
                if (levelIndicator) {
                    levelIndicator.textContent = `Level: ${scenario.level}`;
                }
                
                // Remove the message and container height after animation
                setTimeout(() => {
                    transitionContainer.classList.remove('active');
                    setTimeout(() => {
                        transitionContainer.innerHTML = '';
                    }, 300); // Wait for height transition to complete
                }, 3000);
            }
        }

        // Update scenario display
        const titleElement = document.getElementById('scenario-title');
        const descriptionElement = document.getElementById('scenario-description');
        const optionsContainer = document.getElementById('options-container');

        if (!titleElement || !descriptionElement || !optionsContainer) {
            console.error('Required elements not found');
            return;
        }

        titleElement.textContent = scenario.title;
        descriptionElement.textContent = scenario.description;
        
        // Create a copy of options with their original indices
        const shuffledOptions = scenario.options.map((option, index) => ({
            ...option,
            originalIndex: index
        }));
        
        // Shuffle the options
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }

        optionsContainer.innerHTML = '';
        
        shuffledOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <input type="radio" 
                    name="option" 
                    value="${option.originalIndex}" 
                    id="option${index}"
                    tabindex="0"
                    aria-label="${option.text}"
                    role="radio">
                <label for="option${index}">${option.text}</label>
            `;
            optionsContainer.appendChild(optionElement);
        });

        this.updateProgress();
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

            // Update player state
            this.player.experience = Math.max(0, Math.min(this.maxXP, this.player.experience + selectedAnswer.experience));
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience))
            });

            // Save progress with current scenario (before incrementing)
            await this.saveProgress();

            // Also save quiz result and update display
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                const score = Math.round((this.player.experience / this.maxXP) * 100);
                await quizUser.updateQuizScore(this.quizName, score);
                
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
            
            // Update outcome display
            document.getElementById('outcome-text').textContent = selectedAnswer.outcome;
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

    nextScenario() {
        // Increment scenario counter
        this.player.currentScenario++;
        
        // Hide outcome screen and show game screen
        if (this.outcomeScreen && this.gameScreen) {
            this.outcomeScreen.classList.add('hidden');
            this.gameScreen.classList.remove('hidden');
        }
        
        // Display next scenario
        this.displayScenario();
    }

    updateProgress() {
        // Update experience display
        const experienceDisplay = document.getElementById('experience-display');
        if (experienceDisplay) {
            experienceDisplay.textContent = `XP: ${this.player.experience}/${this.maxXP}`;
        }

        // Update question progress
        const questionProgress = document.getElementById('question-progress');
        const progressFill = document.getElementById('progress-fill');
        if (questionProgress && progressFill) {
            const totalQuestions = 15;
            const completedQuestions = this.player.questionHistory.length;
            const currentQuestion = completedQuestions + 1;
            
            // Update question counter
            questionProgress.textContent = `Question: ${currentQuestion}/${totalQuestions}`;
            
            // Update progress bar
            const progressPercentage = (completedQuestions / totalQuestions) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }

        // Update level indicator
        const levelIndicator = document.getElementById('level-indicator');
        if (levelIndicator) {
            const currentLevel = this.getCurrentLevel();
            levelIndicator.textContent = `Level: ${currentLevel}`;
        }
    }

    restartGame() {
        // Reset player state
        this.player = {
            name: localStorage.getItem('username'),
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: []
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
        this.updateProgress();

        // Start from first scenario
        this.displayScenario();
    }

    getCurrentScenarios() {
        const totalAnswered = this.player.questionHistory.length;
        const currentXP = this.player.experience;
        
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

    generateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations');
        if (!recommendationsContainer) return;

        const score = Math.round((this.player.experience / this.maxXP) * 100);
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            const maxXP = record.maxPossibleXP;
            const earnedXP = record.selectedAnswer.experience;
            const isCorrect = earnedXP === maxXP;

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

        if (score >= 80) {
            recommendationsHTML += '<p>🏆 Outstanding email testing expertise! Here are some ways to further enhance your skills:</p>';
        } else if (score >= 60) {
            recommendationsHTML += '<p>📧 Good understanding of email testing! Here are areas to focus on:</p>';
        } else {
            recommendationsHTML += '<p>🎯 Here are key email testing areas for improvement:</p>';
        }

        recommendationsHTML += '<ul>';

        // Add recommendations for weak areas
        weakAreas.forEach(area => {
            recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
        });

        // If there are strong areas but still room for improvement
        if (strongAreas.length > 0 && score < 100) {
            recommendationsHTML += '<li>Continue leveraging your strengths in: ' + 
                strongAreas.join(', ') + '</li>';
        }

        // Add general recommendations based on score
        if (score < 70) {
            recommendationsHTML += `
                <li>Review email testing best practices documentation</li>
                <li>Practice testing across different email clients and devices</li>
                <li>Focus on systematic testing approaches and documentation</li>
            `;
        }

        recommendationsHTML += '</ul>';
        recommendationsContainer.innerHTML = recommendationsHTML;
    }

    categorizeQuestion(scenario) {
        // Categorize questions based on their content
        const title = scenario.title.toLowerCase();
        const description = scenario.description.toLowerCase();

        if (title.includes('bug') || description.includes('bug')) {
            return 'Bug Reporting';
        } else if (title.includes('image') || description.includes('image')) {
            return 'Visual Testing';
        } else if (title.includes('dark mode') || description.includes('dark mode')) {
            return 'Dark Mode Testing';
        } else if (title.includes('link') || description.includes('link')) {
            return 'Link Testing';
        } else if (title.includes('test script') || description.includes('test script')) {
            return 'Test Documentation';
        } else if (title.includes('resource') || description.includes('resource')) {
            return 'Resource Management';
        } else if (title.includes('metrics') || description.includes('metrics')) {
            return 'Testing Metrics';
        } else {
            return 'General Email Testing';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Bug Reporting': 'Focus on thorough cross-environment testing and detailed bug documentation before reporting issues.',
            'Visual Testing': 'Practice systematic image testing across different email clients, checking alignment, quality, and dark mode compatibility.',
            'Dark Mode Testing': 'Enhance understanding of dark mode behavior across different email clients and system settings.',
            'Link Testing': 'Develop a comprehensive approach to testing all types of links, including unsubscribe mechanisms and UTM parameters.',
            'Test Documentation': 'Improve test script documentation with clear result keys and detailed environment specifications.',
            'Resource Management': 'Master the resource calculator for better project planning and time estimation.',
            'Testing Metrics': 'Focus on comprehensive metrics tracking including session totals, resolution times, and burndown charts.',
            'General Email Testing': 'Review core email testing principles and cross-client compatibility requirements.'
        };

        return recommendations[area] || 'Continue developing your email testing expertise through practical experience.';
    }

    endGame() {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        const finalScore = Math.min(this.player.experience, this.maxXP);
        const scorePercentage = Math.round((finalScore / this.maxXP) * 100);
        
        // Save the final quiz result
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                user.updateQuizScore(this.quizName, scorePercentage);
                console.log('Final quiz score saved:', scorePercentage);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

        const performanceSummary = document.getElementById('performance-summary');
        const threshold = this.performanceThresholds.find(t => finalScore >= t.threshold);
        performanceSummary.textContent = threshold.message;

        // Display question review
        const reviewList = document.getElementById('question-review');
        reviewList.innerHTML = '';
        
        this.player.questionHistory.forEach((record, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            const maxXP = record.maxPossibleXP;
            const earnedXP = record.selectedAnswer.experience;
            const isCorrect = earnedXP === maxXP;
            
            reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
            
            reviewItem.innerHTML = `
                <h4>Question ${index + 1}</h4>
                <p>${record.scenario.description}</p>
                <p><strong>Your Answer:</strong> ${record.selectedAnswer.text}</p>
                <p><strong>Outcome:</strong> ${record.selectedAnswer.outcome}</p>
                <p><strong>Experience Earned:</strong> ${earnedXP}/${maxXP}</p>
            `;
            
            reviewList.appendChild(reviewItem);
        });

        this.generateRecommendations();
    }
}

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new EmailTestingQuiz();
    quiz.startGame();
}); 