import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class EmailTestingQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
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
                title: 'Primary Objective',
                description: 'What is the primary purpose of email testing?',
                options: [
                    {
                        text: 'To increase email open rates',

                        outcome: 'This relates to marketing metrics, not testing',
                        experience: -10

                    },
                    {
                        text: 'To verify email functionality and appearance',
                        outcome: 'Correct! This is the purpose of email testing.',
                        experience: 15
                    },

                    {
                        text: 'To check if emails reach spam folders',
                        outcome: 'While spam prevention is a benefit, it\'s not the primary purpose.',
                        experience: 5
                    },


                    {
                        text: 'To test different subject lines for marketing effectiveness',
                        outcome: 'The subject line is just one small component of an email.',
                        experience: -5
                    }

                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Email Clients',
                description: 'Which email clients are typically included in testing scope?',

                options: [
                    {
                        text: 'Only Gmail and Outlook',
                        outcome: 'While these are important clients, the scope should be broader.',
                        experience: 5
                    },

                    {
                        text: 'Gmail, Outlook, Yahoo Mail, and Apple Mail',
                        outcome: 'Correct! These are the main email clients, however, the client may request additional email clients.',
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
                title: 'UTM Understanding',
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
                        text: 'Urchin Trace Module',
                        outcome: 'This is a made-up term.',
                        experience: -5
                    },

                    {
                        text: 'Urchin Tracking Module',
                        outcome: 'Correct! This is the correct statement',
                        experience: 15
                    }

                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Dark Mode',
                description: 'Where or when should you check dark mode rendering?',

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
                        outcome: 'Correct! Dark mode should be tested across all supported platforms',
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
                title: 'Email Testing Process',
                description: 'What is the first step in email testing?',
                options: [

                    {
                        text: 'Check all links in the email',
                        outcome: 'Link checking comes later in the process.',
                        experience: -5
                    },

                    {
                        text: 'Familiarise yourself with project documentation',
                        outcome: 'Correct! This should be the first step in the testing process.',
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
            }
        ];

        // Intermediate Scenarios (IDs 6-10, 100 XP total, 20 XP each)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Bug Reporting',
                description: 'What should you do when you discover a bug in one environment?',

                options: [
                    {
                        text: 'Immediately report it',
                        outcome: 'While reporting is important, checking other environments first is more efficient.',
                        experience: 5
                    },

                    {
                        text: 'Correct! Check if the issue exists across other environments before reporting',
                        outcome: 'Correct! Other environments must be checked to determine if the issue is global.',
                        experience: 20
                    },

                    {
                        text: 'Only report it if it affects functionality',
                        outcome: 'All issues should be reported regardless of type',
                        experience: -10
                    },

                    {
                        text: 'Wait for client confirmation',
                        outcome: "Client confirmation isn't needed to report bugs",
                        experience: -5
                    }


                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Test Script Reporting',
                description: 'How should test results be marked in the test script?',

                options: [
                    {
                        text: 'Only pass or fail',
                        outcome: 'While pass/fail is included, more detailed options should be available and stated.',
                        experience: 5

                    },
                    {
                        text: 'Using the Result Key options',
                        outcome: 'Correct! This is the recommended way of reporting issues.',
                        experience: 20
                    },

                    {
                        text: 'With detailed written descriptions',
                        outcome: "Written descriptions supplement but don't replace the Result Key",
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
                title: 'Reviewing Images',
                description: 'What should be checked regarding email images?',
                options: [

                    {
                        text: 'Just image quality and resolution',
                        outcome: 'While quality is important, other aspects must also be checked',
                        experience: 5
                    },

                    {
                        text: 'Image placement, alignment, quality, label, and display in both light/dark modes',
                        outcome: 'Correct! These are all necessary checks for images.',
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

                title: 'Company Details Signitures',
                description: 'How should company details be verified in emails?',

                options: [
                    {
                        text: 'Check against Wikipedia',
                        outcome: "Wikipedia isn't a reliable source for verification.",
                        experience: -10

                    },
                    {
                        text: 'Verify against the company website',
                        outcome: "While the website can help, target market specificity is key.",
                        experience: 5
                    },

                    {
                        text: 'Match details to the target market (e.g., UK address for UK market)',
                        outcome: 'Correct! Details should be checked against target market',
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
                        outcome: 'Correct! All these metrics should be included unless otherwise specified.',
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
            }
        ];
        
        // Advanced Scenarios (IDs 11-15, 125 XP total, 25 XP each)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Resource Calculator',
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
                        outcome: 'Correct! This is used for multiple adjustable testing activities',
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

                title: 'Unsubscribe Links',
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
                        text: 'Understand that unsubscribe links may error due to test distribution differences from live environment',
                        outcome: 'Correct! This is potentially expected behaviour in test environment as live environment may yet not be set up of which details should be provided by the client',
                        experience: 25
                    },

                    {
                        text: 'Test unsubscribe functionality in production',
                        outcome: "While production testing may work, it's not the recommended approach",
                        experience: 5
                    }

                ]
            },
            {
                id: 13,
                level: 'Advanced',

                title: 'Text Wrap Evaluation',
                description: 'How should text wrapping issues be evaluated?',

                options: [
                    {
                        text: 'Only check on mobile devices',
                        outcome: 'While mobile is important, all devices need checking specified by the client.',
                        experience: 5

                    },
                    {
                        text: 'Compare against design specifications for consistent text flow across all devices',
                        outcome: 'Correct! Checking consistency with design across all platforms is recommended.',
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

                title: 'Results Tables Within Scripts',
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
                        outcome: 'Correct! All test ranges should be updated including updating formulas to include any new environments',
                        experience: 25
                    }

                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Light & Dark Mode Testing Priority',
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
                        outcome: 'Correct! The relationship between system and app-specific settings should be tested',
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
        return totalQuestionsAnswered >= 15 || currentXP >= this.maxXP;
    }

    async saveProgress() {
        // First determine the status based on clear conditions
        let status = 'in-progress';
        
        // Check for completion (all 15 questions answered)
        if (this.player.questionHistory.length >= 15) {
            // Check if they met the advanced XP requirement
            if (this.player.experience >= this.levelThresholds.advanced.minXP) {
                status = 'completed';
            } else {
                status = 'failed';
            }
        } 
        // Check for early failure conditions
        else if (
            (this.player.questionHistory.length >= 10 && this.player.experience < this.levelThresholds.intermediate.minXP) ||
            (this.player.questionHistory.length >= 5 && this.player.experience < this.levelThresholds.basic.minXP)
        ) {
            status = 'failed';
        }

        const progress = {
            data: {
                experience: this.player.experience,
                tools: this.player.tools,
                currentScenario: this.player.currentScenario,
                questionHistory: this.player.questionHistory,
                lastUpdated: new Date().toISOString(),
                questionsAnswered: this.player.questionHistory.length,
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
            
            console.log('Saving progress with status:', status);
            await this.apiService.saveQuizProgress(this.quizName, progress.data);
        } catch (error) {
            console.error('Failed to save progress:', error);
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
            console.log('Raw API Response:', savedProgress);
            let progress = null;
            
            if (savedProgress && savedProgress.data) {
                // Normalize the data structure
                progress = {
                    experience: savedProgress.data.experience || 0,
                    tools: savedProgress.data.tools || [],
                    questionHistory: savedProgress.data.questionHistory || [],
                    currentScenario: savedProgress.data.currentScenario || 0,
                    status: savedProgress.data.status || 'in-progress'
                };
                console.log('Normalized progress data:', progress);
            } else {
                // Try loading from localStorage as fallback
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    progress = parsed;
                    console.log('Loaded progress from localStorage:', progress);
                }
            }

            if (progress) {
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
                } else if (progress.status === 'completed') {
                    this.endGame(false);
                    return true;
                }

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
            // Show loading indicator
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

            // Initialize event listeners
            this.initializeEventListeners();

            // Load previous progress
            const hasProgress = await this.loadProgress();
            console.log('Previous progress loaded:', hasProgress);
            
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
        
        // Check basic level completion
        if (this.player.questionHistory.length >= 5) {
            if (this.player.experience < this.levelThresholds.basic.minXP) {
                this.endGame(true); // End with failure state
                return;
            }
        }

        // Check intermediate level completion
        if (this.player.questionHistory.length >= 10) {
            if (this.player.experience < this.levelThresholds.intermediate.minXP) {
                this.endGame(true); // End with failure state
                return;
            }
        }

        // Check Advanced level completion
        if (this.player.questionHistory.length >= 15) {
            if (this.player.experience < this.levelThresholds.advanced.minXP) {
                this.endGame(true); // End with failure state
                return;
            } else {
                this.endGame(false); // Completed successfully
                return;
            }
        }

        // Get the next scenario based on current progress
        let scenario;
        const questionCount = this.player.questionHistory.length;
        
        // Reset currentScenario based on the current level
        if (questionCount < 5) {
            // Basic questions (0-4)
            scenario = this.basicScenarios[questionCount];
            this.player.currentScenario = questionCount;
        } else if (questionCount < 10) {
            // Intermediate questions (5-9)
            scenario = this.intermediateScenarios[questionCount - 5];
            this.player.currentScenario = questionCount - 5;
        } else if (questionCount < 15) {
            // Advanced questions (10-14)
            scenario = this.advancedScenarios[questionCount - 10];
            this.player.currentScenario = questionCount - 10;
        }

        if (!scenario) {
            console.error('No scenario found for current progress. Question count:', questionCount);
            this.endGame(true);
            return;
        }

        // Store current question number for consistency
        this.currentQuestionNumber = questionCount + 1;
        
        // Show level transition message at the start of each level or when level changes
        const currentLevel = this.getCurrentLevel();
        const previousLevel = questionCount > 0 ? 
            (questionCount <= 5 ? 'Basic' : 
             questionCount <= 10 ? 'Intermediate' : 'Advanced') : null;
            
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
                
                // Update the level indicator
                const levelIndicator = document.getElementById('level-indicator');
                if (levelIndicator) {
                    levelIndicator.textContent = `Level: ${currentLevel}`;
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

        // Update question counter immediately
        const questionProgress = document.getElementById('question-progress');
        if (questionProgress) {
            questionProgress.textContent = `Question: ${this.currentQuestionNumber}/15`;
        }

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

            // Calculate new experience with level-based minimum thresholds
            let newExperience = this.player.experience + selectedAnswer.experience;
            
            // Apply minimum thresholds based on current level
            const questionCount = this.player.questionHistory.length;
            if (questionCount >= 5) { // Intermediate level
                newExperience = Math.max(this.levelThresholds.basic.minXP, newExperience);
            }
            if (questionCount >= 10) { // Advanced level
                newExperience = Math.max(this.levelThresholds.intermediate.minXP, newExperience);
            }

            // Update player experience with bounds
            this.player.experience = Math.max(0, Math.min(this.maxXP, newExperience));
            
            // Add status to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                status: selectedAnswer.experience > 0 ? 'passed' : 'failed',
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience))
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();

            // Calculate the score and experience
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
                await quizUser.updateQuizScore(
                    this.quizName,
                    score.score,
                    score.experience,
                    this.player.tools,
                    score.questionHistory,
                    score.questionsAnswered
                );
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
            const completedQuestions = Math.min(this.player.questionHistory.length, totalQuestions);
            
            // Use stored question number for consistency
            questionProgress.textContent = `Question: ${this.currentQuestionNumber || completedQuestions}/15`;
            
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

        if (score >= 95 && weakAreas.length === 0) {
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of email testing. You clearly understand the nuances of email testing and are well-equipped to handle any email testing challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your email testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('dark mode') || description.includes('dark mode')) {
            return 'Dark Mode Testing';
        } else if (title.includes('utm') || description.includes('utm')) {
            return 'Tracking Implementation';
        } else if (title.includes('bug') || description.includes('bug')) {
            return 'Bug Management';
        } else if (title.includes('process') || description.includes('process')) {
            return 'Testing Process';
        } else if (title.includes('results') || description.includes('results')) {
            return 'Results Documentation';
        } else if (title.includes('environment') || description.includes('environment')) {
            return 'Environment Testing';
        } else if (title.includes('light') || description.includes('device')) {
            return 'Cross-platform Testing';
        } else {
            return 'General Email Testing';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Dark Mode Testing': 'Focus on comprehensive dark mode testing across different email clients and system settings.',
            'Tracking Implementation': 'Improve understanding of UTM parameters and tracking mechanisms in email campaigns.',
            'Bug Management': 'Enhance cross-environment verification and documentation of email-related issues.',
            'Testing Process': 'Strengthen systematic approach to email testing, starting with documentation review.',
            'Results Documentation': 'Work on maintaining comprehensive test results including all environments and scenarios.',
            'Environment Testing': 'Develop thorough testing strategies across different email clients and configurations.',
            'Cross-platform Testing': 'Focus on coordinated testing across devices, system settings, and client preferences.',
            'General Email Testing': 'Continue developing fundamental email testing principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core email testing principles.';
    }

    async endGame(failed = false) {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        const finalScore = Math.min(this.player.experience, this.maxXP);
        const scorePercentage = Math.round((finalScore / this.maxXP) * 100);
        
        // Save the final quiz result with pass/fail status
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                const status = failed ? 'failed' : 'completed';
                console.log('Setting final quiz status:', { status, score: scorePercentage });
                
                const result = {
                    score: scorePercentage,
                    status: status,
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory,
                    questionsAnswered: this.player.questionHistory.length,
                    lastActive: new Date().toISOString()
                };

                // Save to QuizUser
                user.updateQuizScore(
                    this.quizName,
                    result.score,
                    result.experience,
                    this.player.tools,
                    result.questionHistory,
                    result.questionsAnswered,
                    status
                );

                // Save to API with proper structure
                const apiProgress = {
                    data: {
                        ...result,
                        tools: this.player.tools,
                        currentScenario: this.player.currentScenario
                    }
                };

                // Save directly via API to ensure status is updated
                console.log('Saving final progress to API:', apiProgress);
                await this.apiService.saveQuizProgress(this.quizName, apiProgress.data);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = failed ? 'Quiz Failed!' : 'Quiz Complete!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (failed) {
            performanceSummary.textContent = 'Quiz failed. You did not meet the minimum XP requirement to progress. You cannot retry this quiz.';
            // Hide restart button if failed
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.style.display = 'none';
            }
            // Add failed class to quiz container for styling
            const quizContainer = document.getElementById('quiz-container');
            if (quizContainer) {
                quizContainer.classList.add('failed');
            }
        } else {
            const threshold = this.performanceThresholds.find(t => t.threshold <= finalScore);
            if (threshold) {
                performanceSummary.textContent = threshold.message;
            } else {
                performanceSummary.textContent = 'Quiz completed successfully!';
            }
        }

        // Generate question review list
        const reviewList = document.getElementById('question-review');
        if (reviewList) {
            reviewList.innerHTML = ''; // Clear existing content
            this.player.questionHistory.forEach((record, index) => {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                
                const maxXP = Math.max(...record.scenario.options.map(o => o.experience));
                const earnedXP = record.selectedAnswer.experience;
                const isCorrect = earnedXP === maxXP;
                
                reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
                
                reviewItem.innerHTML = `
                    <h4>Question ${index + 1}</h4>
                    <p class="scenario">${record.scenario.description}</p>
                    <p class="answer"><strong>Your Answer:</strong> ${record.selectedAnswer.text}</p>
                    <p class="outcome"><strong>Outcome:</strong> ${record.selectedAnswer.outcome}</p>
                    <p class="xp"><strong>Experience Earned:</strong> ${earnedXP}/${maxXP}</p>
                `;
                
                reviewList.appendChild(reviewItem);
            });
        }

        this.generateRecommendations();
    }
}

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new EmailTestingQuiz();
    quiz.startGame();
}); 