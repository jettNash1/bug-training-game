import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class AutomationInterviewQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            levelThresholds: {
                basic: { questions: 5, minXP: 0 }, //35
                intermediate: { questions: 10, minXP: 0 }, //110
                advanced: { questions: 15, minXP: 0 } //235
            },
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re an automation expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong automation skills!' },
                { threshold: 70, message: '👍 Good work! Keep practicing to improve further.' },
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
                title: 'Team Mentoring',
                description: 'How do you mentor and guide a team in automation testing?',
                options: [
                    {
                        text: 'Introduce standard practices, encourage collaboration, and provide workshops on different automation topics',
                        outcome: 'Perfect! This provides a comprehensive approach to team development.',
                        experience: 15,
                        tool: 'Team Development',
                        isCorrect: true
                    },
                    {
                        text: 'Take an unguided approach and allow them to do their own research',
                        outcome: 'Teams need structured guidance and support for effective learning.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Ensure team members only learn a specific framework/set of technologies',
                        outcome: 'Teams benefit from broader knowledge across different automation tools and approaches.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Prioritise team members that show a greater understanding of automation',
                        outcome: 'All team members should receive equal opportunity for growth and development.',
                        experience: -10,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Documentation Handover',
                description: 'What kind of documentation would you record once an automation project had been passed over to a client to maintain?',
                options: [
                    {
                        text: 'Handover document/read me file containing set up details',
                        outcome: 'Excellent! This ensures the client has all necessary information for maintenance.',
                        experience: 15,
                        tool: 'Documentation'
                    },
                    {
                        text: 'Hand them the code and a run command',
                        outcome: 'Proper documentation is essential for successful project handover.',
                        experience: -10
                    },
                    {
                        text: 'Only provide the client with the reports from previous testing/tests',
                        outcome: 'Setup and maintenance documentation is crucial for project continuity.',
                        experience: -5
                    },
                    {
                        text: 'Provide a call/presentation of how to maintain the project',
                        outcome: 'Written documentation is necessary for future reference.',
                        experience: -10
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
                        text: 'The approach should include the use unique IDs and data attributes',
                        outcome: 'Perfect! This creates reliable and maintainable tests.',
                        experience: 15,
                        tool: 'Element Location'
                    },
                    {
                        text: 'Create complex CSS selectors that chain multiple classes and attributes together for maximum specificity',
                        outcome: 'Simple, unique locators are more reliable and usable.',
                        experience: -10
                    },
                    {
                        text: 'Generate full XPath expressions from the browser\'s copy selector feature',
                        outcome: 'Absolute XPaths can be fragile and hard to maintain.',
                        experience: -10
                    },
                    {
                        text: 'Locate elements by their displayed text content and position on the page',
                        outcome: 'Position and text content can change frequently and make it difficult locate elements.',
                        experience: -5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Test Script Organisation',
                description: 'How should you structure your automated test scripts?',
                options: [
                    {
                        text: 'Use page object model with clear separation of concerns',
                        outcome: 'Excellent! This promotes reusability and maintainability.',
                        experience: 15,
                        tool: 'Code Organization'
                    },
                    {
                        text: 'Write long, detailed test scripts that cover multiple scenarios in a single file',
                        outcome: 'Tests should be organised logically and modularly for ease of use.',
                        experience: -10
                    },
                    {
                        text: 'Duplicate similar test code to ensure each test is independent',
                        outcome: 'Code duplication should be avoided if possible as it makes it harder to update tests when the underlying system changes.',
                        experience: -5
                    },
                    {
                        text: 'Place test code alongside application code for easy access',
                        outcome: 'Test code should be separate from application code to provide flexibility on maintenance.',
                        experience: -10
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
                        outcome: 'Fixed delays can make tests slow and unreliable.',
                        experience: -5
                    },
                    {
                        text: 'Configure the CI system to automatically retry failed tests multiple times',
                        outcome: 'Root causes should be addressed instead of retrying failed tests.',
                        experience: -10
                    },
                    {
                        text: 'Mark intermittent tests as known issues in the test report',
                        outcome: 'Intermittent failures require thorough investigation.',
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
                        experience: -5
                    },
                    {
                        text: 'Copy and sanitise production data for testing purposes',
                        outcome: 'Test data should be controlled and secure.',
                        experience: -10
                    },
                    {
                        text: 'Maintain test data directly in the test scripts',
                        outcome: 'Test data should be externalised.',
                        experience: -15
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
                        text: 'Organise tests in stages with appropriate triggers',
                        outcome: 'Perfect! This enables continuous testing.',
                        experience: 20,
                        tool: 'CI/CD Integration'
                    },
                    {
                        text: 'Execute the complete test suite sequentially after every code change',
                        outcome: 'Tests should be organised in appropriate stages.',
                        experience: -10
                    },
                    {
                        text: 'Run tests manually before each production deployment',
                        outcome: 'Automation should be integrated into CI/CD.',
                        experience: -5
                    },
                    {
                        text: 'Configure nightly runs of all automated tests',
                        outcome: 'Tests should provide timely feedback.',
                        experience: -15
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Version Control Approach',
                description: 'What is an effective version control approach for adding new features to an automation project?',
                options: [
                    {
                        text: 'Create branches for each new test feature',
                        outcome: 'Perfect! This enables organized and controlled development.',
                        experience: 20,
                        tool: 'Version Control'
                    },
                    {
                        text: 'Keep a single, main branch, and push all changes',
                        outcome: 'Feature branches help manage changes more effectively.',
                        experience: -10
                    },
                    {
                        text: 'Avoid using version control, it slows down development',
                        outcome: 'Version control is essential for managing test code effectively.',
                        experience: -15
                    },
                    {
                        text: 'Skip reviews of pull requests to increase test development speed',
                        outcome: 'Code reviews are crucial for maintaining quality.',
                        experience: -10
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Version Control Importance',
                description: 'Why is proper use of version control important for an automation project?',
                options: [
                    {
                        text: 'Allows for efficient collaboration and auditability',
                        outcome: 'Excellent! Version control is crucial for team collaboration.',
                        experience: 20,
                        tool: 'Collaboration'
                    },
                    {
                        text: 'Usage should be avoided, as this slows down the development and coverage of tests',
                        outcome: 'Version control is essential for managing changes effectively.',
                        experience: -15
                    },
                    {
                        text: 'Its only useful for historical changes',
                        outcome: 'Version control provides many benefits beyond history tracking.',
                        experience: -10
                    },
                    {
                        text: 'Avoids conflicts in code',
                        outcome: 'While true, version control offers many more benefits.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Error Handling',
                description: 'How do you handle errors and exceptions in your test automation framework?',
                options: [
                    {
                        text: 'Implement custom exception handlers with retry logic',
                        outcome: 'Perfect! This enables good error diagnosis.',
                        experience: 20,
                        tool: 'Error Handling'
                    },
                    {
                        text: 'Write extensive try-catch blocks around every possible point of failure in the test scripts',
                        outcome: 'Error handling should be strategic and efficient.',
                        experience: -15
                    },
                    {
                        text: 'Log all exceptions to a central error log',
                        outcome: 'Errors need proper handling, not just logging.',
                        experience: -10
                    },
                    {
                        text: 'Skip error handling within automation tests',
                        outcome: 'Error handling is crucial for prompt identification of issues.',
                        experience: -5
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
                        outcome: 'Focus should be on key performance indicators.',
                        experience: -10
                    },
                    {
                        text: 'Record browser timings in production',
                        outcome: 'Use proper test environments.',
                        experience: -15
                    },
                    {
                        text: 'Test with maximum concurrent users',
                        outcome: 'Various load scenarios needed.',
                        experience: -20
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
                        outcome: 'Focus should be on meaningful test scenarios.',
                        experience: -20
                    },
                    {
                        text: 'Focus tests only on success scenarios to ensure the application under test meets requirements',
                        outcome: 'Edge cases must also be tested for comprehensive coverage.',
                        experience: -10
                    },
                    {
                        text: 'The testing approach for API should be manual in nature',
                        outcome: 'APIs should be automatically tested as this improves efficiency in faster testing cycles.',
                        experience: -15
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Framework Selection Discussion',
                description: 'A potential client is wanting to ensure use of a particular testing framework. But you believe they could benefit from using something else. How would you handle this?',
                options: [
                    {
                        text: 'Outlining the advantages of the recommended framework',
                        outcome: 'Perfect! This promotes informed decision-making.',
                        experience: 25,
                        tool: 'Framework Analysis'
                    },
                    {
                        text: 'Agree with their requirement and use their framework of choice',
                        outcome: 'Professional recommendations should be made when beneficial.',
                        experience: -10
                    },
                    {
                        text: 'Disregard their choice and implement your own testing framework',
                        outcome: 'Client requirements should be respected and discussed professionally.',
                        experience: -20
                    },
                    {
                        text: 'Refuse to work with the client unless they agree to use your suggestions',
                        outcome: 'Collaboration and professional discussion is essential.',
                        experience: -15
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Automation Project Candidacy',
                description: 'What is a poor candidate for an automation project?',
                options: [
                    {
                        text: 'A client whose budget is limited, and the project\'s scope is small',
                        outcome: 'Excellent! Automation should be cost-effective.',
                        experience: 25,
                        tool: 'Project Assessment'
                    },
                    {
                        text: 'A client with repetitive and time-consuming manual tests',
                        outcome: 'This is actually a good candidate for automation.',
                        experience: -20
                    },
                    {
                        text: 'When implementing automation would be more cost-effective than a manual approach',
                        outcome: 'This would be an ideal candidate for automation.',
                        experience: -15
                    },
                    {
                        text: 'Client whose project features numerous forms and fields',
                        outcome: 'Form testing is often a good candidate for automation.',
                        experience: -10
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Critical Bug Handling',
                description: 'A critical bug slipped into production despite automation coverage. How do you handle it?',
                options: [
                    {
                        text: 'Investigate the root cause to improve the automation for the next run',
                        outcome: 'Perfect! This ensures continuous improvement.',
                        experience: 25,
                        tool: 'Root Cause Analysis'
                    },
                    {
                        text: 'Ignore the error as it\'s not part of the original scope',
                        outcome: 'Critical bugs require immediate attention and investigation.',
                        experience: -20
                    },
                    {
                        text: 'Get the client to roll back all changes without finding the root cause',
                        outcome: 'Understanding the root cause is crucial for prevention.',
                        experience: -15
                    },
                    {
                        text: 'See if the automation team are responsible for the code not being robust',
                        outcome: 'Focus should be on solution and prevention rather than blame.',
                        experience: -10
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
        return totalQuestionsAnswered >= this.totalQuestions;
    }

    calculateScorePercentage() {
        const answered = this.player.questionHistory.length;
        if (answered === 0) return 0;
        
        const correctAnswers = this.player.questionHistory.filter(q => q.selectedAnswer.isCorrect).length;
        return Math.round((correctAnswers / answered) * 100);
    }

    async saveProgress() {
        // Calculate score percentage
        const scorePercentage = this.calculateScorePercentage();
        
        // First determine the status based on clear conditions
        let status = 'in-progress';
        
        // Check for completion (all questions answered)
        if (this.player.questionHistory.length >= this.totalQuestions) {
            status = scorePercentage >= this.passPercentage ? 'completed' : 'failed';
        }

        const progress = {
            data: {
                experience: this.player.experience,
                tools: this.player.tools,
                currentScenario: this.player.currentScenario,
                questionHistory: this.player.questionHistory,
                lastUpdated: new Date().toISOString(),
                questionsAnswered: this.player.questionHistory.length,
                scorePercentage: scorePercentage,
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
                    scorePercentage: savedProgress.data.scorePercentage || 0,
                    status: savedProgress.data.status || 'in-progress'
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
        
        // Check if we should end the game
        if (this.shouldEndGame(this.player.questionHistory.length, this.player.experience)) {
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
            
            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add status to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                status: selectedAnswer.isCorrect ? 'correct' : 'incorrect',
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience)),
                timeSpent: timeSpent,
                timedOut: false
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();

            // Calculate the score percentage
            const scorePercentage = this.calculateScorePercentage();
            
            const score = {
                quizName: this.quizName,
                score: scorePercentage,
                experience: this.player.experience,
                questionHistory: this.player.questionHistory,
                questionsAnswered: this.player.questionHistory.length,
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
            let outcomeText = selectedAnswer.outcome;
            document.getElementById('outcome-text').textContent = outcomeText;
            
            const resultText = selectedAnswer.isCorrect ? 'Correct!' : 'Incorrect!';
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

            // Check if we should end the game after answering
            if (this.shouldEndGame(this.player.questionHistory.length, this.player.experience)) {
                setTimeout(() => this.endGame(scorePercentage < this.passPercentage), 2000);
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

        const score = this.calculateScorePercentage();
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            const isCorrect = record.selectedAnswer.isCorrect;

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

        // Hide the progress card on the end screen
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'none';
        }

        const scorePercentage = this.calculateScorePercentage();
        
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
                    lastActive: new Date().toISOString(),
                    scorePercentage: scorePercentage
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
                
                // Clear local storage once final score is saved
                this.clearQuizLocalStorage();
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
            performanceSummary.textContent = `Quiz failed. You scored ${scorePercentage}%, but needed at least ${this.passPercentage}% to pass. You cannot retry this quiz.`;
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
            const threshold = this.performanceThresholds.find(t => t.threshold <= scorePercentage);
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
                
                const isCorrect = record.selectedAnswer.isCorrect;
                
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

    clearQuizLocalStorage() {
        try {
            const username = localStorage.getItem('username');
            if (username) {
                const storageKey = `quiz_progress_${username}_${this.quizName}`;
                localStorage.removeItem(storageKey);
                console.log('Cleared quiz local storage');
            }
        } catch (error) {
            console.error('Failed to clear quiz local storage:', error);
        }
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new AutomationInterviewQuiz();
    quiz.startGame();
}); 