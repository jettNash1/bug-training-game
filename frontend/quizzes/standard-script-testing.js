import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class StandardScriptTestingQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a standard script testing expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong standard script testing skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing standard script testing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'standard-script-testing',
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
                title: 'Objective',
                description: 'What is a standard test script?',
                options: [
                    {
                        text: 'A piece of automated code that runs tests without human intervention',
                        outcome: 'While scripts can be automated, this answer misses the fundamental purpose of documenting and structuring test cases.',
                        experience: 5
                    },
                    {
                        text: 'A documented set of instructions and conditions that outline how to execute specific test cases within a software testing process',
                        outcome: 'Correct! This is the exact definition of a standard test script.',
                        experience: 15,
                        tool: 'Script Fundamentals'
                    },
                    {
                        text: 'A set of programming commands used to create software',
                        outcome: 'This describes programming code, not test scripts.',
                        experience: -10
                    },
                    {
                        text: 'A collection of test cases with a loose structure focused on user journeys',
                        outcome: 'This contradicts the organised nature of standard test scripts.',
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Script Format',
                description: 'Which format is used for writing test cases in standard test scripts?',
                options: [
                    {
                        text: 'Python code',
                        outcome: 'Python is a programming language, not a test case format.',
                        experience: -5
                    },
                    {
                        text: 'SQL queries',
                        outcome: 'SQL is for database queries, not test case writing.',
                        experience: -10
                    },
                    {
                        text: 'Gherkin language',
                        outcome: 'Correct! Gherkin language is used for writing test cases.',
                        experience: 15,
                        tool: 'Test Case Writing'
                    },
                    {
                        text: 'JSON format',
                        outcome: 'While JSON is a structured format, it\'s not the specified format for standard script test cases.',
                        experience: 5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Test Case Planning',
                description: 'How many test cases should be planned per day of testing on average?',
                options: [
                    {
                        text: '25-50 test cases',
                        outcome: 'This is well below the recommended amount',
                        experience: -10
                    },
                    {
                        text: '50-75 test cases',
                        outcome: 'While close to the correct range, this is slightly below the recommended amount.',
                        experience: 5
                    },
                    {
                        text: '75-100 test cases',
                        outcome: 'Correct! It is specifically recommended that 75-100 test cases is the average per day of testing.',
                        experience: 15,
                        tool: 'Test Planning'
                    },
                    {
                        text: '100-125 test cases',
                        outcome: 'This exceeds the recommended amount',
                        experience: -5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Executing The Script',
                description: 'What is the first step in executing a standard test script?',
                options: [
                    {
                        text: 'Start with writing new test cases to be included in the script',
                        outcome: 'Test cases should already be written during the planning phase.',
                        experience: -10
                    },
                    {
                        text: 'Begin testing immediately to complete the most coverage within the project time frame set',
                        outcome: 'While testing needs to be done, reviews must come first.',
                        experience: 5
                    },
                    {
                        text: 'Review the Operational Project Details and Statement of Work',
                        outcome: 'Correct! The is the first step before writing the test cases to ascertain any project specifics',
                        experience: 15,
                        tool: 'Script Execution'
                    },
                    {
                        text: 'Create a new test environment',
                        outcome: 'This is not part of the execution process',
                        experience: -5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Submission Data',
                description: 'What is the primary purpose of the "Submissions Data" tab in the test script?',
                options: [
                    {
                        text: 'To record test case results, focus time allocation and tester details',
                        outcome: 'While it does record data, it\'s specifically for submissions, not general test results.',
                        experience: 5
                    },
                    {
                        text: 'To store all test environment details used for the project',
                        outcome: 'Environment details are stored elsewhere in the test script.',
                        experience: -5
                    },
                    {
                        text: 'To maintain a record of submitted data for traceability',
                        outcome: 'Correct! The tab is used for recording submitted data, including user credentials for traceability',
                        experience: 15,
                        tool: 'Data Management'
                    },
                    {
                        text: 'To track bug reports raised against the system under test',
                        outcome: 'Bug tracking is handled in a separate system',
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
                title: 'Test Case Priority',
                description: 'Which of the following is a key factor in determining test case priority?',
                options: [
                    {
                        text: 'The alphabetical order of the test cases within the script',
                        outcome: 'Alphabetical order is not a factor in priority.',
                        experience: -5
                    },
                    {
                        text: 'The length of time it takes to execute the specific test',
                        outcome: 'While execution time might be considered, it\'s not a primary factor.',
                        experience: 5
                    },
                    {
                        text: 'The impact of the feature being tested and frequency of use',
                        outcome: 'Correct! These are key factors in determining priority of test cases',
                        experience: 15,
                        tool: 'Priority Management'
                    },
                    {
                        text: 'The preference and experience of the individual tester',
                        outcome: 'Individual preferences should not determine priority as this may miss critical test areas due to time management',
                        experience: -10
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Out Of Scope Environments',
                description: 'What should be done with environment sections that are not in scope?',
                options: [
                    {
                        text: 'Out of scope environments should be deleted',
                        outcome: 'Deleting sections could cause problems if they\'re needed later.',
                        experience: -10
                    },
                    {
                        text: 'Out of scope environments should be left unchanged',
                        outcome: 'Leaving them unchanged could cause confusion on what needs to be tested.',
                        experience: -5
                    },
                    {
                        text: 'The columns or rows for out of scope environments should be hidden',
                        outcome: 'While this would hide unused sections, it\'s not the recommended approach as this would still affect metrics',
                        experience: 5
                    },
                    {
                        text: 'These sections should be greyed out and the dashes removed from the result and date columns',
                        outcome: 'Correct! This is the recommended approach for environments that are not in scope for the project',
                        experience: 15,
                        tool: 'Environment Management'
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Primary Test Tab',
                description: 'How should test suites be organised in the primary functional tests tab?',
                options: [
                    {
                        text: 'The test suites should be organised alphabetically by suite name',
                        outcome: 'While this would be organised, it doesn\'t consider importance',
                        experience: 5
                    },
                    {
                        text: 'This should be organised based on tester preference',
                        outcome: 'This type of ordering could make the script difficult to follow.',
                        experience: -10
                    },
                    {
                        text: 'By complexity and risk factors using high, medium, and low priorities',
                        outcome: 'Correct! Suites should be prioritised by complexity and risk factors',
                        experience: 15,
                        tool: 'Suite Organization'
                    },
                    {
                        text: 'These should be organised by the date they were created',
                        outcome: 'Creation date is not a factor in organisation and doesn\'t take into consideration priority.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Document References',
                description: 'What should be included in the document reference for a test case?',
                options: [
                    {
                        text: 'Only the test case ID should be included in the test case reference',
                        outcome: 'While ID is important, more information is required, including documentation references that can help in executing the test.',
                        experience: 5
                    },
                    {
                        text: 'Information that aided in creating the test case and which will help during execution',
                        outcome: 'Correct! References should include anything that aided creation and that will help with execution of the test case.',
                        experience: 15,
                        tool: 'Documentation Management'
                    },
                    {
                        text: 'The tester\'s name should be included as reference',
                        outcome: 'Tester\'s name is not part of the documentation reference',
                        experience: -5
                    },
                    {
                        text: 'The current date should be included as reference',
                        outcome: 'The date is not part of the documentation reference.',
                        experience: -10
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Smoke Tests',
                description: 'When should smoke tests be executed during standard script testing?',
                options: [
                    {
                        text: 'Smoke tests should be executed at the end of all other testing',
                        outcome: 'This would be too late to catch any potential major issues.',
                        experience: -10
                    },
                    {
                        text: 'These should be performed first, before other test cases',
                        outcome: 'Correct! Smoke tests should be run first as these are devised from the highest priority test cases.',
                        experience: 15,
                        tool: 'Smoke Testing'
                    },
                    {
                        text: 'These should all be run, only when issues are found',
                        outcome: 'While issues might trigger retesting, smoke tests come first.',
                        experience: 5
                    },
                    {
                        text: 'These should be run after compatibility testing',
                        outcome: 'Compatibility testing should come after primary testing.',
                        experience: -5
                    }
                ]
            }
        ];

                        // Advanced Scenarios (IDs 11-15, 125 XP total, 25 XP each)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Multiple Primary Environments',
                description: 'What is the correct approach when dealing with multiple primary environments in a standard test script?',
                options: [
                    {
                        text: 'Create entirely new test cases for each environment',
                        outcome: 'While some new cases might be needed, copying and modifying is more efficient',
                        experience: 5
                    },
                    {
                        text: 'Copy and modify test suites as needed, adjusting for environment-specific differences',
                        outcome: 'Correct! Test suites can be copied and modified for different environments',
                        experience: 15,
                        tool: 'Environment Testing'
                    },
                    {
                        text: 'Perform test activities only on the highest priority environment',
                        outcome: 'All supported primary environments require testing',
                        experience: -10
                    },
                    {
                        text: 'Select which tests to run on each environment according to tester preference',
                        outcome: 'A random selection would not ensure comprehensive coverage',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Compatibility Testing',
                description: 'How should compatibility testing be integrated with primary environment testing?',
                options: [
                    {
                        text: 'Primary testing should always be completed first and foremost',
                        outcome: 'While primary testing is important, parallel testing is possible.',
                        experience: 5
                    },
                    {
                        text: 'Only do compatibility testing if time constraints permit it',
                        outcome: 'Compatibility testing is required, and is not optional unless stated by the client.',
                        experience: -5
                    },
                    {
                        text: 'This can be started alongside primary testing in parallel, depending on project scheduling',
                        outcome: 'Correct! Compatibility testing can be done in parallel with primary environment testing',
                        experience: 15,
                        tool: 'Compatibility Testing'
                    },
                    {
                        text: 'Compatibility testing must be done before primary testing',
                        outcome: 'This is not the correct approach as issues could be missed early on in the testing process',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Requirements Updates',
                description: 'What is the appropriate way to handle changes in requirements during the testing phase?',
                options: [
                    {
                        text: 'Continue with original test cases and test the new requirements if time constraints permit',
                        outcome: 'Leaving requirements changes would lead to invalid test results and potentially missed issues.',
                        experience: -5
                    },
                    {
                        text: 'Mark test cases where expected behaviour is in question, add comments for clarification, and remove comments once clarified',
                        outcome: 'Correct! This is the process for handling requirement changes.',
                        experience: 15,
                        tool: 'Requirements Management'
                    },
                    {
                        text: 'Pause testing until all requirements are finalised with client feedback',
                        outcome: 'While pausing might seem logical, it\'s not the recommended approach and is not good time management.',
                        experience: 5
                    },
                    {
                        text: 'Delete the affected test cases to be updated when requirements are finalised.',
                        outcome: 'Deleting cases would lose valuable information already sourced.',
                        experience: -10
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'User Journeys',
                description: 'How should user journeys be structured in comparison to functional tests?',
                options: [
                    {
                        text: 'User journeys must always use Gherkin format',
                        outcome: 'While Gherkin can be used, it\'s not required for user journeys',
                        experience: 5
                    },
                    {
                        text: 'These don\'t require Gherkin format but should contain logical step processes',
                        outcome: 'Correct! User journeys don\'t require Gherkin but should be stated in logical steps.',
                        experience: 15,
                        tool: 'Journey Testing'
                    },
                    {
                        text: 'These should be written in technical programming language',
                        outcome: 'Technical programming language is not appropriate for user journeys as these need to be in logical steps for ease of understanding',
                        experience: -10
                    },
                    {
                        text: 'These must be constructed in single-line instructions only',
                        outcome: 'Single-line instructions would be insufficient and may miss some critical information',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Test Case Structure',
                description: 'What factors should influence the structure of test case creation in the standard script?',
                options: [
                    {
                        text: 'The client\'s stated requirements should only influence the structure of the test cases',
                        outcome: 'While client requirements are important, other factors must be considered like risk assessment.',
                        experience: 5
                    },
                    {
                        text: 'A combination of target audience, project timing, risk assessment, and client requirements',
                        outcome: 'Correct! These are all factors for important considerations.',
                        experience: 15,
                        tool: 'Test Structure'
                    },
                    {
                        text: 'The tester\'s previous experience with similar projects should be the determining factor',
                        outcome: 'While experience is valuable, it shouldn\'t solely determine structure.',
                        experience: -5
                    },
                    {
                        text: 'The number of available testers required to work on the project',
                        outcome: 'Tester availability doesn\'t determine test case structure.',
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

        // Initialize timer for the new question
        this.initializeTimer();
    }

    async handleAnswer() {
        if (this.isLoading) return;
        
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
        }

        // Clear any existing timer
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
                status: selectedAnswer.experience > 0 ? 'passed' : 'failed',
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience)),
                timeSpent: timeSpent,
                timedOut: false
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
            const correctAnswer = scenario.options.reduce((prev, current) => 
                (prev.experience > current.experience) ? prev : current
            );

            let outcomeText = selectedAnswer.outcome;
            if (selectedAnswer.experience < correctAnswer.experience) {
                outcomeText += `\n\n\nThe correct answer was: "${correctAnswer.text}"\n${correctAnswer.outcome}`;
            }
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of standard scripting. You clearly understand the nuances of standard scripting and are well-equipped to handle any standard scripting challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your standard scripting skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('test case') || description.includes('test case')) {
            return 'Test Case Design';
        } else if (title.includes('coverage') || description.includes('coverage')) {
            return 'Test Coverage';
        } else if (title.includes('defect') || description.includes('bug')) {
            return 'Defect Management';
        } else if (title.includes('priority') || description.includes('priority')) {
            return 'Priority Assessment';
        } else if (title.includes('regression') || description.includes('regression')) {
            return 'Regression Testing';
        } else if (title.includes('documentation') || description.includes('document')) {
            return 'Test Documentation';
        } else if (title.includes('environment') || description.includes('environment')) {
            return 'Environment Setup';
        } else if (title.includes('execution') || description.includes('execute')) {
            return 'Test Execution';
        } else {
            return 'General Script Testing';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Test Case Design': 'Focus on creating comprehensive and reusable test cases with clear steps.',
            'Test Coverage': 'Strengthen understanding of test coverage requirements and validation.',
            'Defect Management': 'Improve defect reporting with detailed reproduction steps and evidence.',
            'Priority Assessment': 'Develop better judgment in assessing test case and defect priorities.',
            'Regression Testing': 'Enhance identification of regression risks and test scope.',
            'Test Documentation': 'Focus on maintaining clear and detailed test documentation.',
            'Environment Setup': 'Strengthen verification of test environment configurations.',
            'Test Execution': 'Improve efficiency and accuracy in test case execution.',
            'General Script Testing': 'Continue developing fundamental script testing principles.'
        };

        return recommendations[area] || 'Continue practicing core script testing principles.';
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
    const quiz = new StandardScriptTestingQuiz();
    quiz.startGame();
}); 