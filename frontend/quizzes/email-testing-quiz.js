import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class EmailTestingQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
            },
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re an email testing expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong email testing skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
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
                        text: 'To increase email open rates with subscribers',
                        outcome: 'This relates to marketing metrics, not email testing',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'To verify email functionality and appearance',
                        outcome: 'Correct! This is the purpose of email testing.',
                        experience: 15,
                        isCorrect: true
                    },
                    {
                        text: 'To check if emails reach spam folders',
                        outcome: 'While spam prevention is a benefit, it\'s not the primary purpose.',
                        experience: 5,
                        isCorrect: false
                    },
                    {
                        text: 'To test different subject lines for marketing effectiveness',
                        outcome: 'The subject line is just one small component of an email.',
                        experience: -5,
                        isCorrect: false
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
                        text: 'Gmail and Outlook should be the main focus',
                        outcome: 'While these are important clients, the scope should be broader.',
                        experience: 5
                    },
                    {
                        text: 'Gmail, Outlook, Yahoo Mail, and Apple Mail',
                        outcome: 'Correct! These are the main email clients, however, stakeholders may request additional email clients.',
                        experience: 15
                    },
                    {
                        text: 'All possible email clients globally should be tested',
                        outcome: 'Testing all global email clients would be impractical and the main clients with any specific requests from the client should be tested.',
                        experience: -5
                    },
                    {
                        text: 'Mobile only email clients on specific devices',
                        outcome: 'Testing should not be limited to mobile clients unless specifically requested by the client.',
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
                        outcome: 'Correct! This is the correct statement and it tracks the performance of a marketing campaign',
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
                        text: 'This should be carried out on mobile devices',
                        outcome: 'Testing only mobile could miss desktop related issues.',
                        experience: -10
                    },
                    {
                        text: 'This should be carried out on desktop clients',
                        outcome: 'Testing only desktop could miss mobile related issues.',
                        experience: -5
                    },
                    {
                        text: 'Across all supported email clients and envrionments',
                        outcome: 'Correct! Dark mode should be tested across all supported platforms',
                        experience: 15
                    },
                    {
                        text: 'This should be tested only when specifically requested',
                        outcome: 'While client requests matter, dark mode testing is a standard practice',
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
                        text: 'Check all links within the email can be correctly actioned',
                        outcome: 'Link checking should come later in the process after documentation has been analysed.',
                        experience: -5
                    },
                    {
                        text: 'Familiarise yourself with project documentation',
                        outcome: 'Correct! This should be the first step in the testing process as there could be areas stated as out of scope.',
                        experience: 15
                    },
                    {
                        text: 'Make sure the test environments are set up for testing activities',
                        outcome: 'While important, this comes after reviewing documentation',
                        experience: 5
                    },
                    {
                        text: 'Create test accounts for testing different outcomes to test scenarios',
                        outcome: 'This would not come before reviewing documentation as certain areas could be out of scope',
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
                        text: 'Immediately report it against the specific environment',
                        outcome: 'While reporting is important, checking other environments for the issue first is more efficient.',
                        experience: 5
                    },
                    {
                        text: 'Check if the issue exists across other environments',
                        outcome: 'Correct! Other environments must be checked to determine if the issue is global.',
                        experience: 15
                    },
                    {
                        text: 'Only report it if it affects functionality of any features relating to the email',
                        outcome: 'All issues should be reported regardless of type',
                        experience: -10
                    },
                    {
                        text: 'Wait for client confirmation on how to proceed',
                        outcome: 'Client confirmation isn\'t needed to report bugs',
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
                        text: 'Only pass or fail for the specific tests',
                        outcome: 'While pass or fail is included, more detailed options should be available and stated.',
                        experience: 5
                    },
                    {
                        text: 'Using the Result Key options against each test',
                        outcome: 'Correct! This is the recommended way of reporting issues.',
                        experience: 15
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
                title: 'Reviewing Images',
                description: 'What should be checked regarding email images?',
                options: [
                    {
                        text: 'Image quality and resolution should be checked',
                        outcome: 'While quality is important, other aspects must also be checked including alignment and image placement',
                        experience: 5
                    },
                    {
                        text: 'Image placement, alignment, quality, label, and display in both light and dark modes',
                        outcome: 'Correct! These are all necessary checks for images within emails.',
                        experience: 15
                    },
                    {
                        text: 'Whether images load and display correctly',
                        outcome: 'Other aspects of image testing are also required such placement',
                        experience: -10
                    },
                    {
                        text: 'Image size and format should be checked',
                        outcome: 'Size and format are aspects that should be checked. However, other areas are required for full test coverage',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Company Details Signatures',
                description: 'How should company details be verified in emails?',
                options: [
                    {
                        text: 'These details can be checked against Wikipedia',
                        outcome: 'Wikipedia isn\'t a reliable source for verification.',
                        experience: -10
                    },
                    {
                        text: 'Details can be verified against the client\'s company website',
                        outcome: 'While the website can help, target market specificity is key which can be obtained through client documentation',
                        experience: 5
                    },
                    {
                        text: 'Match details to the target market (e.g., UK address for UK market)',
                        outcome: 'Correct! Details should be checked against target markets',
                        experience: 15
                    },
                    {
                        text: 'Use company information as related to any project correspondence',
                        outcome: 'Company correspondence information may not be accurate as solutions providers could be working on behalf of a client',
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
                        text: 'The number of bugs raised on the project',
                        outcome: 'Bug count alone is insufficient, and other metrics should be included such as project progress and ticket resolutions.',
                        experience: -5
                    },
                    {
                        text: 'Session totals, ticket resolution totals, and project burndown',
                        outcome: 'Correct! All these metrics should be included unless otherwise specified.',
                        experience: 15
                    },
                    {
                        text: 'Test completion percentage should be stated in the metrics report',
                        outcome: 'While completion is tracked, more metrics are required including environment matrix and ticket status',
                        experience: 5
                    },
                    {
                        text: 'All critical issues should be stated in the metrics report',
                        outcome: 'All issues, not just critical ones should be tracked',
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
                        text: 'This should be used for estimating total project time',
                        outcome: 'While it helps with timing, it\'s more comprehensive and includes more adjustable testing activities.',
                        experience: 5
                    },
                    {
                        text: 'To calculate exact testing hours needed to complete a project',
                        outcome: 'This provides guidance rather than exact calculations relating to test hours.',
                        experience: -5
                    },
                    {
                        text: 'For guided timeframe planning with adjustable fields for setup, copy check, link check, rendering check, and reporting',
                        outcome: 'Correct! This is used for multiple adjustable testing activities',
                        experience: 15
                    },
                    {
                        text: 'This is used for billing purposes in relation to time frame and resources',
                        outcome: 'This is used for planning testing activities and not billing',
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
                        outcome: 'These may not necessarily be bugs in the test environment and documentation should be referenced for scope.',
                        experience: -5
                    },
                    {
                        text: 'Don\'t report unsubscribe link issues as test environments may not be set up to action this functionality',
                        outcome: 'Any potential issues should still be documented appropriately or queried with the client. Unless already stated in client documentation.',
                        experience: -10
                    },
                    {
                        text: 'Understand that unsubscribe links may error due to test distribution differences from the live environment',
                        outcome: 'Correct! This is potentially expected behaviour in a test environment, as a live environment may not yet not be set up to support this functionality. These details should be provided by the client',
                        experience: 15
                    },
                    {
                        text: 'Test unsubscribe functionality in production environments',
                        outcome: 'While production testing may work, it\'s not the recommended approach as this could disrupt on going monitoring by the client in production',
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
                        text: 'Test all text wrapping on supported mobile devices',
                        outcome: 'While mobile testing is important, all devices need checking that are specified by the client.',
                        experience: 5
                    },
                    {
                        text: 'Compare against design specifications for consistent text flow across all devices',
                        outcome: 'Correct! Checking consistency with design across all platforms is recommended.',
                        experience: 15
                    },
                    {
                        text: 'Check headings as these are generally where text wrapping issues occur',
                        outcome: 'All text needs checking, not just headings as text wrapping issues can be found anywhere within the content',
                        experience: -10
                    },
                    {
                        text: 'Minor wrapping differences can be left in favour of major issues',
                        outcome: 'All wrapping issues should be reported regardless of the severity',
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
                        text: 'Failed tests from the days test activities should be included',
                        outcome: 'While failures are important, all results must be included.',
                        experience: 5
                    },
                    {
                        text: 'Critical issues from the days test activities should be included',
                        outcome: 'All issues, not just critical ones, should be included.',
                        experience: -10
                    },
                    {
                        text: 'Passed tests from the days test activities should be included',
                        outcome: 'Both passes and failures must be included',
                        experience: -5
                    },
                    {
                        text: 'The entire range of tests including any newly added environments',
                        outcome: 'Correct! All test ranges should be updated including updating formulas to include any new environments',
                        experience: 15
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Light & Dark Mode Testing Priority',
                description: 'How should light & dark mode testing be coordinated across devices?',
                options: [
                    {
                        text: 'System-level changes only need testing in relation to light & dark mode',
                        outcome: 'Client-specific settings must also be tested.',
                        experience: -10
                    },
                    {
                        text: 'Check each email client independently in relation to light & dark mode testing',
                        outcome: 'While individual testing is needed, overall system settings must also be considered.',
                        experience: 5
                    },
                    {
                        text: 'Coordinate system settings and individual app preferences, understanding that some clients follow system settings while others need manual configuration',
                        outcome: 'Correct! The relationship between system and app-specific settings should be tested.',
                        experience: 15
                    },
                    {
                        text: 'Use only default settings when testing light & dark mode',
                        outcome: 'Testing default settings alone is insufficient and client or app specific settings should also be tested.',
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

    shouldEndGame() {
        // End game if we've answered all questions
        return this.player.questionHistory.length >= this.totalQuestions;
    }

    calculateScorePercentage() {
        // Calculate percentage based on correct answers
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && (q.selectedAnswer.isCorrect || q.selectedAnswer.experience > 0)
        ).length;
        
        // Cap the questions answered at total questions
        const questionsAnswered = Math.min(this.player.questionHistory.length, this.totalQuestions);
        
        return questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
    }

    async saveProgress() {
        // Determine the status based on clear conditions
        let status = 'in-progress';
        
        // Check for completion (all questions answered)
        if (this.player.questionHistory.length >= this.totalQuestions) {
            // Calculate percentage score
            const scorePercentage = this.calculateScorePercentage();
            status = scorePercentage >= this.passPercentage ? 'passed' : 'failed';
        }

        const progress = {
            experience: this.player.experience,
            tools: this.player.tools,
            currentScenario: this.player.currentScenario,
            questionHistory: this.player.questionHistory,
            lastUpdated: new Date().toISOString(),
            questionsAnswered: this.player.questionHistory.length,
            status: status,
            scorePercentage: this.calculateScorePercentage()
        };

        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot save progress');
                return;
            }
            
            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify({ data: progress }));
            
            console.log('Saving progress with status:', status, 'scorePercentage:', progress.scorePercentage);
            await this.apiService.saveQuizProgress(this.quizName, progress);
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
                    status: savedProgress.data.status || 'in-progress',
                    scorePercentage: savedProgress.data.scorePercentage || 0
                };
                console.log('Normalized progress data:', progress);
            } else {
                // Try loading from localStorage as fallback
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    progress = parsed.data || parsed;
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
                if (progress.status === 'failed' || progress.status === 'passed') {
                    this.endGame(progress.status === 'failed');
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

            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
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
        
        // Check if we've answered all questions
        if (this.shouldEndGame()) {
            const scorePercentage = this.calculateScorePercentage();
            this.endGame(scorePercentage < this.passPercentage);
            return;
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
            questionProgress.textContent = `Question: ${this.currentQuestionNumber}/${this.totalQuestions}`;
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

        // Initialize timer for the new question
        this.initializeTimer();
    }

    async handleAnswer() {
        if (this.isLoading) return;
        
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
        }

        // Clear the timer when an answer is submitted
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }
        
        try {
            this.isLoading = true;
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) return;

            const currentScenarios = this.getCurrentScenarios();
            const scenario = currentScenarios[this.player.currentScenario];
            const originalIndex = parseInt(selectedOption.value);
            
            const selectedAnswer = scenario.options[originalIndex];

            // Keep track of experience for backward compatibility
            this.player.experience = Math.max(0, Math.min(this.maxXP, this.player.experience + selectedAnswer.experience));
            
            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add to question history with isCorrect property
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: selectedAnswer.isCorrect || selectedAnswer.experience > 0,
                timeSpent: timeSpent,
                timedOut: false
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();

            // Calculate the score percentage
            const scorePercentage = this.calculateScorePercentage();
            
            // Save quiz result
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                await quizUser.updateQuizScore(
                    this.quizName,
                    scorePercentage,
                    this.player.experience,
                    this.player.tools,
                    this.player.questionHistory,
                    this.player.questionHistory.length
                );
            }

            // Show outcome screen
            if (this.gameScreen && this.outcomeScreen) {
                this.gameScreen.classList.add('hidden');
                this.outcomeScreen.classList.remove('hidden');
            }
            
            // Update outcome display
            let outcomeText = selectedAnswer.outcome;
            document.getElementById('outcome-text').textContent = outcomeText;
            
            // Display result instead of XP
            const resultText = selectedAnswer.isCorrect || selectedAnswer.experience > 0 ? 'Correct!' : 'Incorrect';
            document.getElementById('xp-gained').textContent = resultText;
            
            if (selectedAnswer.tool) {
                document.getElementById('tool-gained').textContent = `Tool acquired: ${selectedAnswer.tool}`;
                if (!this.player.tools.includes(selectedAnswer.tool)) {
                    this.player.tools.push(selectedAnswer.tool);
                }
            } else {
                document.getElementById('tool-gained').textContent = '';
            }

            this.updateProgress();
            
            // Check if we should end the game
            if (this.shouldEndGame()) {
                await this.endGame(scorePercentage < this.passPercentage);
            }
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
        // Get current level and question count
        const currentLevel = this.getCurrentLevel();
        const totalAnswered = this.player.questionHistory.length;
        const questionNumber = totalAnswered + 1;
        
        // Update the existing progress card elements
        const levelInfoElement = document.querySelector('.level-info');
        const questionInfoElement = document.querySelector('.question-info');
        
        if (levelInfoElement) {
            levelInfoElement.textContent = `Level: ${currentLevel}`;
        }
        
        if (questionInfoElement) {
            questionInfoElement.textContent = `Question: ${questionNumber}/${this.totalQuestions}`;
        }
        
        // Ensure the card is visible
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'block';
        }
        
        // Update legacy progress elements if they exist
        const levelIndicator = document.getElementById('level-indicator');
        const questionProgress = document.getElementById('question-progress');
        const progressFill = document.getElementById('progress-fill');
        
        if (levelIndicator) {
            levelIndicator.textContent = `Level: ${currentLevel}`;
        }
        
        if (questionProgress) {
            questionProgress.textContent = `Question: ${questionNumber}/${this.totalQuestions}`;
        }
        
        if (progressFill) {
            const progressPercentage = (totalAnswered / this.totalQuestions) * 100;
            progressFill.style.width = `${progressPercentage}%`;
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

        const scorePercentage = this.calculateScorePercentage();
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            const isCorrect = record.isCorrect;
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

        if (scorePercentage >= 90 && weakAreas.length === 0) {
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of email testing. You clearly understand the nuances of email testing and are well-equipped to handle any email testing challenges!</p>';
        } else if (scorePercentage >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your email testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
            recommendationsHTML += '<ul>';
            if (weakAreas.length > 0) {
                weakAreas.forEach(area => {
                    recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
                });
            }
            recommendationsHTML += '</ul>';
        } else if (scorePercentage >= 70) {
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

        // Hide the progress card on the end screen
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'none';
        }

        // Calculate score percentage
        const scorePercentage = this.calculateScorePercentage();
        const isPassed = scorePercentage >= this.passPercentage;
        
        // Determine final status
        const finalStatus = failed ? 'failed' : (isPassed ? 'passed' : 'failed');
        
        // Save the final quiz result with pass/fail status
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                console.log('Setting final quiz status:', { status: finalStatus, score: scorePercentage });
                
                // Save to QuizUser
                await user.updateQuizScore(
                    this.quizName,
                    scorePercentage,
                    this.player.experience,
                    this.player.tools,
                    this.player.questionHistory,
                    this.player.questionHistory.length,
                    finalStatus
                );

                // Clear localStorage data for this quiz
                this.clearQuizLocalStorage(username, this.quizName);

                // Save to API with proper structure
                const progress = {
                    experience: this.player.experience,
                    tools: this.player.tools,
                    currentScenario: this.player.currentScenario,
                    questionHistory: this.player.questionHistory,
                    lastUpdated: new Date().toISOString(),
                    questionsAnswered: this.player.questionHistory.length,
                    status: finalStatus,
                    scorePercentage: scorePercentage
                };

                // Save directly via API to ensure status is updated
                console.log('Saving final progress to API:', progress);
                await this.apiService.saveQuizProgress(this.quizName, progress);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${scorePercentage}%`;

        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = failed ? 'Quiz Failed!' : 'Quiz Complete!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (failed) {
            performanceSummary.textContent = `Quiz failed. You scored ${scorePercentage}% but needed at least ${this.passPercentage}% to pass.`;
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
            // Find the appropriate threshold message
            const threshold = this.config.performanceThresholds.find(t => t.threshold <= scorePercentage);
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
                
                const isCorrect = record.isCorrect;
                reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
                
                reviewItem.innerHTML = `
                    <h4>Question ${index + 1}</h4>
                    <p class="scenario">${record.scenario.description}</p>
                    <p class="answer"><strong>Your Answer:</strong> ${record.selectedAnswer.text}</p>
                    <p class="outcome"><strong>Outcome:</strong> ${record.selectedAnswer.outcome}</p>
                    <p class="result"><strong>Result:</strong> ${isCorrect ? 'Correct' : 'Incorrect'}</p>
                `;
                
                reviewList.appendChild(reviewItem);
            });
        }

        this.generateRecommendations();
    }

    // Utility method to clean up localStorage
    clearQuizLocalStorage(username, quizName) {
        const variations = [
            quizName,
            quizName.toLowerCase(),
            quizName.toUpperCase(),
            quizName.replace(/-/g, ''),
            quizName.replace(/([A-Z])/g, '-$1').toLowerCase(),
            quizName.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
            quizName.replace(/-/g, '_')
        ];

        variations.forEach(variant => {
            localStorage.removeItem(`quiz_progress_${username}_${variant}`);
            localStorage.removeItem(`quizResults_${username}_${variant}`);
        });
    }
}

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new EmailTestingQuiz();
    quiz.startGame();
}); 