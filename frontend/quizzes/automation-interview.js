import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class AutomationInterviewQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 120 },
                advanced: { questions: 15, minXP: 250 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re an automation expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong automation skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing automation best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'automation-interview',
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

        // Basic Scenarios (IDs 1-5)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Test Case Design',
                description: 'You\'re starting to automate tests for a new web application. What\'s the most effective first step?',
                options: [
                    {
                        text: 'Create a test plan with prioritized automation candidates',
                        outcome: 'Perfect! This provides a structured approach to test automation.',
                        experience: 15,
                        tool: 'Test Planning'
                    },
                    {
                        text: 'Start writing automation scripts for all existing manual test cases immediately without analysis',
                        outcome: 'Planning is crucial before implementation.',
                        experience: -5
                    },
                    {
                        text: 'Wait for the development team to complete all features before planning automation',
                        outcome: 'Test automation requires early planning.',
                        experience: -10
                    },
                    {
                        text: 'Convert all manual tests to automated tests without reviewing their suitability',
                        outcome: 'Strategic selection of test cases is important.',
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Automation Framework Selection',
                description: 'You need to choose an automation framework for a web application. How should you approach this decision?',
                options: [
                    {
                        text: 'Match framework capabilities to project needs and team expertise',
                        outcome: 'Excellent! This ensures a sustainable automation solution.',
                        experience: 15,
                        tool: 'Framework Selection'
                    },
                    {
                        text: 'Select multiple frameworks and let each team member use their preferred tool for different features',
                        outcome: 'Framework consistency is important for maintenance.',
                        experience: -10
                    },
                    {
                        text: 'Choose the newest framework with the most GitHub stars',
                        outcome: 'Framework selection should be based on project needs.',
                        experience: -5
                    },
                    {
                        text: 'Pick whatever framework the developers are using for unit tests',
                        outcome: 'Consider end-to-end testing requirements separately.',
                        experience: -5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Element Locators',
                description: 'You\'re writing a test script and need to locate elements on a web page. What\'s the best approach?',
                options: [
                    {
                        text: 'Use unique IDs and data attributes',
                        outcome: 'Perfect! This creates reliable and maintainable tests.',
                        experience: 15,
                        tool: 'Element Location'
                    },
                    {
                        text: 'Create complex CSS selectors that chain multiple classes and attributes together for maximum specificity',
                        outcome: 'Simple, unique locators are more reliable.',
                        experience: -15
                    },
                    {
                        text: 'Generate full XPath expressions from the browser\'s copy selector feature',
                        outcome: 'Absolute XPaths are fragile and hard to maintain.',
                        experience: -10
                    },
                    {
                        text: 'Locate elements by their displayed text content and position on the page',
                        outcome: 'Position and text content can change frequently.',
                        experience: -5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Test Script Organization',
                description: 'How should you structure your automated test scripts?',
                options: [
                    {
                        text: 'Use Page Object Model with clear separation of concerns',
                        outcome: 'Excellent! This promotes reusability and maintainability.',
                        experience: 15,
                        tool: 'Code Organization'
                    },
                    {
                        text: 'Write long, detailed test scripts that cover multiple scenarios in a single file',
                        outcome: 'Tests should be organized logically and modularly.',
                        experience: -10
                    },
                    {
                        text: 'Duplicate similar test code to ensure each test is independent',
                        outcome: 'Code duplication should be avoided.',
                        experience: -5
                    },
                    {
                        text: 'Place test code alongside application code for easy access',
                        outcome: 'Test code should be separate from application code.',
                        experience: -15
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Test Execution',
                description: 'Your automated tests are failing intermittently. What should you do?',
                options: [
                    {
                        text: 'Implement smart waits and proper synchronization',
                        outcome: 'Perfect! This helps create stable tests.',
                        experience: 15,
                        tool: 'Test Stability'
                    },
                    {
                        text: 'Add Thread.sleep() or fixed delays throughout the test scripts',
                        outcome: 'Fixed delays make tests slow and unreliable.',
                        experience: -5
                    },
                    {
                        text: 'Configure the CI system to automatically retry failed tests multiple times',
                        outcome: 'Root causes should be addressed.',
                        experience: -15
                    },
                    {
                        text: 'Mark flaky tests as known issues in the test report',
                        outcome: 'Intermittent failures need investigation.',
                        experience: -10
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Test Data Management',
                description: 'How should you handle test data in your automation framework?',
                options: [
                    {
                        text: 'Use external data sources with proper cleanup',
                        outcome: 'Excellent! This ensures efficient test data management.',
                        experience: 20,
                        tool: 'Data Management'
                    },
                    {
                        text: 'Create elaborate setup scripts that generate fresh test data before each test execution',
                        outcome: 'Test data should be managed efficiently.',
                        experience: -15
                    },
                    {
                        text: 'Copy and sanitize production data for testing purposes',
                        outcome: 'Test data should be controlled and secure.',
                        experience: -10
                    },
                    {
                        text: 'Maintain test data directly in the test scripts',
                        outcome: 'Test data should be externalized.',
                        experience: -20
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'CI/CD Integration',
                description: 'How do you integrate automated tests into the CI/CD pipeline?',
                options: [
                    {
                        text: 'Organize tests in stages with appropriate triggers',
                        outcome: 'Perfect! This enables continuous testing.',
                        experience: 20,
                        tool: 'CI/CD Integration'
                    },
                    {
                        text: 'Execute the complete test suite sequentially after every code change',
                        outcome: 'Tests should be organized in appropriate stages.',
                        experience: -10
                    },
                    {
                        text: 'Run tests manually before each production deployment',
                        outcome: 'Automation should be integrated into CI/CD.',
                        experience: -15
                    },
                    {
                        text: 'Configure nightly runs of all automated tests',
                        outcome: 'Tests should provide timely feedback.',
                        experience: -20
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Cross-browser Testing',
                description: 'How do you implement cross-browser testing in your automation framework?',
                options: [
                    {
                        text: 'Use browser factories with cloud testing platforms',
                        outcome: 'Excellent! This ensures comprehensive coverage.',
                        experience: 20,
                        tool: 'Browser Testing'
                    },
                    {
                        text: 'Maintain separate test suites and configurations for each supported browser version',
                        outcome: 'Framework should handle multiple browsers efficiently.',
                        experience: -10
                    },
                    {
                        text: 'Focus testing on the most popular browser only',
                        outcome: 'Multiple browsers should be tested.',
                        experience: -15
                    },
                    {
                        text: 'Test manually in different browsers',
                        outcome: 'Browser testing should be automated.',
                        experience: -20
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Error Handling',
                description: 'How do you handle errors and exceptions in your test automation framework?',
                options: [
                    {
                        text: 'Implement custom exception handlers with retry logic',
                        outcome: 'Perfect! This enables better error diagnosis.',
                        experience: 20,
                        tool: 'Error Handling'
                    },
                    {
                        text: 'Write extensive try-catch blocks around every possible point of failure in the test scripts',
                        outcome: 'Error handling should be strategic.',
                        experience: -15
                    },
                    {
                        text: 'Log all exceptions to a central error log',
                        outcome: 'Errors need proper handling, not just logging.',
                        experience: -10
                    },
                    {
                        text: 'Skip error handling in tests',
                        outcome: 'Error handling is crucial.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Test Reporting',
                description: 'What\'s the best approach to implement test reporting in your framework?',
                options: [
                    {
                        text: 'Generate detailed reports with failure analysis',
                        outcome: 'Excellent! This provides valuable insights.',
                        experience: 20,
                        tool: 'Test Reporting'
                    },
                    {
                        text: 'Create extensive custom reporting solutions that track every possible test metric and generate multiple report formats',
                        outcome: 'Reports should be focused and useful.',
                        experience: -10
                    },
                    {
                        text: 'Use basic console output',
                        outcome: 'Proper reporting tools should be used.',
                        experience: -15
                    },
                    {
                        text: 'Rely on CI/CD platform logs',
                        outcome: 'Dedicated test reporting is needed.',
                        experience: -20
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Performance Testing',
                description: 'How do you implement automated performance testing?',
                options: [
                    {
                        text: 'Monitor key metrics under various load conditions',
                        outcome: 'Perfect! This ensures comprehensive testing.',
                        experience: 25,
                        tool: 'Performance Testing'
                    },
                    {
                        text: 'Create complex performance test scenarios that simulate every possible user interaction simultaneously',
                        outcome: 'Focus on key performance indicators.',
                        experience: -20
                    },
                    {
                        text: 'Record browser timings in production',
                        outcome: 'Use proper test environments.',
                        experience: -25
                    },
                    {
                        text: 'Test with maximum concurrent users',
                        outcome: 'Various load scenarios needed.',
                        experience: -30
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'API Testing',
                description: 'How do you approach automated API testing?',
                options: [
                    {
                        text: 'Validate contracts and response schemas',
                        outcome: 'Excellent! This ensures robust API testing.',
                        experience: 25,
                        tool: 'API Testing'
                    },
                    {
                        text: 'Write exhaustive tests covering every possible combination of API parameters and headers',
                        outcome: 'Focus on meaningful test scenarios.',
                        experience: -25
                    },
                    {
                        text: 'Test only success scenarios',
                        outcome: 'Edge cases must be tested.',
                        experience: -20
                    },
                    {
                        text: 'Manual API testing only',
                        outcome: 'APIs should be automatically tested.',
                        experience: -15
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Mobile Testing',
                description: 'How do you implement mobile test automation?',
                options: [
                    {
                        text: 'Combine real devices and emulators strategically',
                        outcome: 'Perfect! This ensures comprehensive testing.',
                        experience: 25,
                        tool: 'Mobile Testing'
                    },
                    {
                        text: 'Create separate test suites for every possible device-OS combination in your target market',
                        outcome: 'Focus on representative devices.',
                        experience: -25
                    },
                    {
                        text: 'Use desktop automation tools',
                        outcome: 'Mobile-specific tools needed.',
                        experience: -15
                    },
                    {
                        text: 'Test on latest devices only',
                        outcome: 'Consider device diversity.',
                        experience: -30
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Security Testing',
                description: 'How do you incorporate security testing in your automation framework?',
                options: [
                    {
                        text: 'Integrate SAST/DAST tools with custom security checks',
                        outcome: 'Excellent! This ensures security coverage.',
                        experience: 25,
                        tool: 'Security Testing'
                    },
                    {
                        text: 'Implement extensive penetration testing scripts that attempt every known security vulnerability',
                        outcome: 'Focus on relevant security risks.',
                        experience: -20
                    },
                    {
                        text: 'Test authentication only',
                        outcome: 'Multiple aspects need testing.',
                        experience: -25
                    },
                    {
                        text: 'Skip security automation',
                        outcome: 'Security tests are essential.',
                        experience: -30
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Test Infrastructure',
                description: 'How do you manage test automation infrastructure?',
                options: [
                    {
                        text: 'Use containerization with infrastructure as code',
                        outcome: 'Perfect! This enables reliable execution.',
                        experience: 25,
                        tool: 'Infrastructure Management'
                    },
                    {
                        text: 'Set up elaborate testing environments with redundant systems for every possible configuration',
                        outcome: 'Focus on essential configurations.',
                        experience: -25
                    },
                    {
                        text: 'Use shared test environments',
                        outcome: 'Isolated environments needed.',
                        experience: -30
                    },
                    {
                        text: 'Rely on local machines',
                        outcome: 'Proper infrastructure required.',
                        experience: -20
                    }
                ]
            }
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of automation. You clearly understand the nuances of automation and are well-equipped to handle any automation challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your automation skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('daily') || description.includes('daily')) {
            return 'Daily Communication';
        } else if (title.includes('team') || description.includes('team')) {
            return 'Team Collaboration';
        } else if (title.includes('stakeholder') || description.includes('stakeholder')) {
            return 'Stakeholder Management';
        } else if (title.includes('conflict') || description.includes('conflict')) {
            return 'Conflict Resolution';
        } else if (title.includes('remote') || description.includes('remote')) {
            return 'Remote Communication';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Documentation';
        } else if (title.includes('presentation') || description.includes('presentation')) {
            return 'Presentation Skills';
        } else {
            return 'General Communication';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Daily Communication': 'Practice maintaining clear status updates and regular check-ins with team members.',
            'Team Collaboration': 'Focus on active listening and providing constructive feedback in team settings.',
            'Stakeholder Management': 'Work on presenting information clearly and managing expectations effectively.',
            'Conflict Resolution': 'Study conflict resolution techniques and practice diplomatic communication.',
            'Remote Communication': 'Improve virtual communication skills and use of collaboration tools.',
            'Documentation': 'Enhance documentation skills with clear, concise, and well-structured content.',
            'Presentation Skills': 'Practice presenting technical information in a clear and engaging manner.',
            'General Communication': 'Focus on fundamental communication principles and professional etiquette.'
        };

        return recommendations[area] || 'Continue practicing general communication skills.';
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

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new AutomationInterviewQuiz();
    quiz.startGame();
}); 