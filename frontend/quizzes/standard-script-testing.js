import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class StandardScriptTestingQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a testing mindset expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong testing instincts!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing testing mindset best practices and try again!' }
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

        // Basic Scenarios (IDs 1-10, now includes 5 additional scenarios)
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
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Test Script Execution',
                description: 'What should be done first when executing a standard test script?',
                options: [
                    {
                        text: 'Run the set of smoke tests',
                        outcome: 'Correct! Running the smoke tests first should identify defects in functionality critical to the application under test.',
                        experience: 15,
                        tool: 'Test Script Execution'
                    },
                    {
                        text: 'Run compatibility tests',
                        outcome: 'Compatibility testing should come after or, if possible, in conjunction with primary environment coverage.',
                        experience: -5
                    },
                    {
                        text: 'Focus areas should be extremely detailed and specific, breaking down every possible user action',
                        outcome: 'This would make test execution more like scripted testing in being more specific.',
                        experience: -10
                    },
                    {
                        text: 'Begin with the user journeys',
                        outcome: 'User journeys are executed after the functional test cases have been completed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Standard Scripting Advantages',
                description: 'What is a key advantage of using standard test scripts according to the guide?',
                options: [
                    {
                        text: 'They require less documentation',
                        outcome: 'Standard scripts actually require more documentation, not less, as they need detailed test cases and steps',
                        experience: -5
                    },
                    {
                        text: 'They eliminate the need for client involvement',
                        outcome: 'If the client prefers to be closely involved in the testing process, standard test scripts provide a clear structure for review.',
                        experience: -10
                    },
                    {
                        text: 'They ensure consistency and reproducibility across the testing team',
                        outcome: 'Correct! Standard scripts ensure consistent execution of tests across the testing team, and over time. This is crucial for tracking progress.',
                        experience: 15,
                        tool: 'Standard Scripting Advantages'
                    },
                    {
                        text: 'They reduce the time required for test planning',
                        outcome: 'Standard scripts require significant planning time, as evidenced by the detailed test planning process.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Standard Scripting Approach',
                description: 'What is recommended when creating test cases for a standard script?',
                options: [
                    {
                        text: 'Jump between different areas of the page to ensure comprehensive coverage',
                        outcome: 'This approach should be avoided in order to create a logical flow when following the script.',
                        experience: -5
                    },
                    {
                        text: 'Focus only on positive test cases to improve execution speed',
                        outcome: 'both positive tests (expected behaviour) and negative tests (where potential issues or errors may lie for invalid inputs) should be considered for coverage.',
                        experience: -10
                    },
                    {
                        text: 'Follow a logical process to maintain clarity for the tester',
                        outcome: 'Correct! When writing test cases, a logical process should be observed. Avoid jumping around the page to maintain clarity for the tester.',
                        experience: 15,
                        tool: 'Standard Scripting Approach'
                    },
                    {
                        text: 'Create test cases with minimal detail to allow for tester interpretation',
                        outcome: 'Emphasis should be on detailed documentation, not minimal detail that requires interpretation.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Test Case Accuracy',
                description: 'What should be done when there are doubts about the accuracy of a test case?',
                options: [
                    {
                        text: 'Mark the test case and add comments to highlight uncertainties',
                        outcome: 'Correct! If there are doubts around any test cases, comments can be added to the cell to highlight this and confirmed by either the author or the client.',
                        experience: 15,
                        tool: 'Test Case Accuracy'
                    },
                    {
                        text: 'Delete the test case from the script and continue with other test cases',
                        outcome: 'Deleting the test case can cause missed defects and reduce test coverage of the application under test',
                        experience: -10
                    },
                    {
                        text: 'Run the test anyway and record all outcomes.',
                        outcome: 'All uncertainties must be addressed as to avoid any lost testing time on areas not in scope.',
                        experience: -5
                    },
                    {
                        text: 'Always mark such cases as "failed" to be safe.',
                        outcome: 'This would be inaccurate if there is uncertainty about requirements rather than an actual failure.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Standard Script Allocation',
                description: 'What factors should be considered when determining whether to use a standard test script approach?',
                options: [
                    {
                        text: 'The complexity of the software and the client\'s preference for involvement',
                        outcome: 'Correct! If the software has critical components that must function to a high standard and If the client prefers to be closely involved in the testing process, then this is the correct approach.',
                        experience: 15,
                        tool: 'Standard Script Allocation'
                    },
                    {
                        text: 'Project budget and timeline should be factors when taking a standard scripting process into consideration',
                        outcome: 'While budget and timeline are factors, they aren\'t the only factors to be taken into consideration. Critical components within the system should also be considered.',
                        experience: -10
                    },
                    {
                        text: 'Whether the team prefers exploratory or scripted testing',
                        outcome: 'Team preferences should not determine the testing approach and what is best for the system under test should always be prioritised.',
                        experience: -5
                    },
                    {
                        text: 'The programming language used to develop the software should be taken into consideration',
                        outcome: 'Programming language used for development shouldn\'t be a factor for manual testing.',
                        experience: 0
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10)
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
                        experience: 20,
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
                        experience: 20,
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
                        experience: 20,
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
                        experience: 20,
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
                        experience: 20,
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

        // Advanced Scenarios (IDs 11-15)
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
                        experience: 25,
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
                        experience: 25,
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
                        experience: 25,
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
                        experience: 25,
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
                        experience: 25,
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

    shouldEndGame() {
        // End game if we've answered all questions
        return this.player.questionHistory.length >= 15;
    }

    async saveProgress() {
        // First determine the status based on completion criteria only
        let status = 'in-progress';
        
        // Check for completion (all 15 questions answered)
        if (this.player.questionHistory.length >= 15) {
            // Calculate pass/fail based on correct answers
            const correctAnswers = this.player.questionHistory.filter(q => 
                q.selectedAnswer && (q.selectedAnswer.isCorrect || q.selectedAnswer.experience > 0)
            ).length;
            const scorePercentage = Math.round((correctAnswers / 15) * 100);
            status = scorePercentage >= 70 ? 'passed' : 'failed';
        }

        const progress = {
            data: {
                experience: this.player.experience,
                tools: this.player.tools,
                currentScenario: this.player.currentScenario,
                questionHistory: this.player.questionHistory,
                lastUpdated: new Date().toISOString(),
                questionsAnswered: this.player.questionHistory.length,
                randomizedScenarios: this.randomizedScenarios, // Save randomized scenarios for consistent experience
                status: status,
                scorePercentage: Math.round((this.player.questionHistory.filter(q => 
                    q.selectedAnswer && (q.selectedAnswer.isCorrect || q.selectedAnswer.experience > 0)
                ).length / 15) * 100)
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
            let progress = null;
            
            if (savedProgress && savedProgress.data) {
                // Normalize the data structure
                progress = {
                    experience: savedProgress.data.experience || 0,
                    tools: savedProgress.data.tools || [],
                    questionHistory: savedProgress.data.questionHistory || [],
                    currentScenario: savedProgress.data.currentScenario || 0,
                    randomizedScenarios: savedProgress.data.randomizedScenarios,
                    status: savedProgress.data.status || 'in-progress'
                };
            } else {
                // Try loading from localStorage as fallback
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    progress = parsed.data || parsed;
                }
            }

            if (progress) {
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                this.player.currentScenario = progress.currentScenario || 0;
                
                // Restore randomized scenarios if they exist
                if (progress.randomizedScenarios) {
                    this.randomizedScenarios = progress.randomizedScenarios;
                    console.log('Restored randomized scenarios:', this.randomizedScenarios);
                }

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
            
            // Display the first scenario and start the timer
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
            console.log('displayScenario called');
            
            // Check if player and currentScenario are properly initialized
            if (!this.player || typeof this.player.currentScenario !== 'number') {
                console.error('Player or currentScenario not properly initialized');
                return;
            }
            
            // Check if we've answered all 15 questions
        if (this.player.questionHistory.length >= 15) {
                console.log('All 15 questions answered, ending game');
                this.endGame();
                return;
            }
            
            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
                console.log('Timer cleared in displayScenario');
            }
            
            console.log('Getting current scenarios...');
            const currentScenarios = this.getCurrentScenarios();
            console.log('Current scenarios:', currentScenarios);
            
            if (!currentScenarios || !Array.isArray(currentScenarios)) {
                console.error('Could not get current scenarios', currentScenarios);
            return;
        }

            const scenario = currentScenarios[this.player.currentScenario];
            console.log('Current scenario index:', this.player.currentScenario);
            console.log('Retrieved scenario:', scenario);
            
            // Check if the current scenario exists
            if (!scenario) {
                console.log('No more scenarios in this level, transitioning to next level');
                
                // Reset currentScenario for the next level
                this.player.currentScenario = 0;
                
                // Get the next level scenarios
                const updatedScenarios = this.getCurrentScenarios();
                if (!updatedScenarios || !updatedScenarios[0]) {
                    console.error('Could not find scenarios for next level');
                    this.endGame();
                    return;
                }
                
                // Display the first scenario of the next level
                const nextScenario = updatedScenarios[0];
                this.displayScenarioContent(nextScenario);
                console.log('Displaying first scenario of next level');
                return;
            }
            
            // Display the current scenario
            console.log('Displaying current scenario:', scenario.title);
            this.displayScenarioContent(scenario);
        } catch (error) {
            console.error('Error displaying scenario:', error);
            this.showError('An error occurred displaying the scenario. Please try reloading the page.');
        }
    }
    
    // Helper method to display scenario content
    displayScenarioContent(scenario) {
        try {
            // Update UI with current scenario
        const titleElement = document.getElementById('scenario-title');
        const descriptionElement = document.getElementById('scenario-description');
        const optionsContainer = document.getElementById('options-container');

            if (titleElement && scenario.title) {
                titleElement.textContent = scenario.title;
        }

            if (descriptionElement && scenario.description) {
        descriptionElement.textContent = scenario.description;
            }
            
            if (optionsContainer && scenario.options && Array.isArray(scenario.options)) {
                optionsContainer.innerHTML = '';
                
                // Shuffle options to randomize their order
                const shuffledOptions = this.shuffleArray(scenario.options);
                
                shuffledOptions.forEach((option, index) => {
                    if (!option || !option.text) {
                        console.error('Invalid option at index', index, option);
                        return;
                    }
                    
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    optionDiv.innerHTML = `
                <input type="radio" 
                    name="option" 
                            value="${scenario.options.indexOf(option)}" 
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
            
            console.log('Scenario content displayed, timer initialized');
        } catch (error) {
            console.error('Error displaying scenario content:', error);
        }
    }

    isCorrectAnswer(answer) {
        // Helper method to consistently determine if an answer is correct
        return answer && (answer.isCorrect || answer.experience > 0);
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
            this.questionTimer = null;
            console.log('Timer cleared in handleAnswer');
        }
        
        try {
            this.isLoading = true;
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) {
                console.warn('No option selected');
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }

            const currentScenarios = this.getCurrentScenarios();
            if (!currentScenarios || !this.player || this.player.currentScenario === undefined) {
                console.error('Invalid scenario or player state');
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }
            
            const scenario = currentScenarios[this.player.currentScenario];
            if (!scenario || !scenario.options) {
                console.error('Invalid scenario structure:', scenario);
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }
            
            const originalIndex = parseInt(selectedOption.value);
            if (isNaN(originalIndex) || originalIndex < 0 || originalIndex >= scenario.options.length) {
                console.error('Invalid option index:', originalIndex);
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }
            
            const selectedAnswer = scenario.options[originalIndex];
            if (!selectedAnswer) {
                console.error('Selected answer not found');
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }

            // Find the correct answer (option with highest experience)
            const correctAnswer = scenario.options.reduce((prev, current) => 
                (prev.experience > current.experience) ? prev : current
            );

            // Mark selected answer as correct or incorrect
            selectedAnswer.isCorrect = selectedAnswer === correctAnswer;

            // Update player state (still track experience for backward compatibility)
            if (typeof this.player.experience === 'number') {
                this.player.experience = Math.max(0, Math.min(this.maxXP || 300, this.player.experience + (selectedAnswer.experience || 0)));
            }
            
            // Add to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: this.isCorrectAnswer(selectedAnswer)
            });

            // Save progress
            try {
            await this.saveProgress();
            } catch (error) {
                console.error('Failed to save progress:', error);
                this.showError('Warning: Progress may not have saved correctly');
            }
            
            // Save quiz result
            const username = localStorage.getItem('username');
            if (username) {
                try {
                const quizUser = new QuizUser(username);
                    const score = {
                        score: Math.round((this.player.questionHistory.filter(q => this.isCorrectAnswer(q.selectedAnswer)).length / Math.min(this.player.questionHistory.length, 15)) * 100),
                        experience: this.player.experience || 0,
                        questionHistory: this.player.questionHistory || [],
                        questionsAnswered: this.player.questionHistory.length
                    };
                    
                await quizUser.updateQuizScore(
                    this.quizName,
                    score.score,
                    score.experience,
                        this.player.tools || [],
                    score.questionHistory,
                    score.questionsAnswered
                );
                } catch (error) {
                    console.error('Failed to save quiz result:', error);
                }
            }

            // Show outcome screen and update display with answer outcome
            this.displayOutcome(selectedAnswer);

            // Update progress display
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
        try {
            console.log('Moving to next scenario');
            
            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
                console.log('Timer cleared in nextScenario');
            }
            
            // Increment current scenario if not done in handleAnswer
            if (this.player && typeof this.player.currentScenario === 'number') {
                this.player.currentScenario++;
                console.log('Incremented to scenario:', this.player.currentScenario);
            }
            
            // IMPORTANT: Get actual DOM elements directly
            const outcomeScreen = document.getElementById('outcome-screen');
            const gameScreen = document.getElementById('game-screen');
            
            console.log('Game screen element:', gameScreen);
            console.log('Outcome screen element:', outcomeScreen);
            
            // Hide outcome screen using multiple approaches to ensure it works
            if (outcomeScreen) {
                outcomeScreen.classList.add('hidden');
                outcomeScreen.style.display = 'none';
                console.log('Hidden outcome screen');
            }
            
            // Show game screen using multiple approaches to ensure it works
            if (gameScreen) {
                gameScreen.classList.remove('hidden');
                gameScreen.style.display = 'block';
                console.log('Shown game screen');
            }
            
            // Display the next scenario
        this.displayScenario();
            
            // Re-initialize event listeners for the new question
            this.initializeEventListeners();
            
            // Force a layout refresh
            window.setTimeout(() => {
                if (gameScreen) {
                    gameScreen.style.display = 'none';
                    window.setTimeout(() => {
                        gameScreen.style.display = 'block';
                        console.log('Forced layout refresh');
                    }, 10);
                }
            }, 10);
        } catch (error) {
            console.error('Error in nextScenario:', error);
            this.showError('An error occurred while loading the next question.');
        }
    }

    displayOutcome(selectedAnswer) {
        if (!selectedAnswer) {
            console.error('No answer selected');
            return;
        }

        try {
            const currentScenarios = this.getCurrentScenarios();
            if (!currentScenarios || !this.player || this.player.currentScenario === undefined) {
                console.error('No current scenario found');
                return;
            }
            
            const scenario = currentScenarios[this.player.currentScenario];
            if (!scenario) {
                console.error('Current scenario not found');
                return;
            }
            
            const earnedXP = selectedAnswer.experience || 0;
            
            // Find the max possible XP for this scenario
            const maxXP = Math.max(...scenario.options.map(o => o.experience || 0));
            const isCorrect = selectedAnswer.isCorrect || (earnedXP === maxXP);
            
            console.log('Displaying outcome:', { 
                isCorrect, 
                selectedAnswer, 
                scenario: scenario.title 
            });
            
            // Update UI - safely access elements
            const outcomeScreen = document.getElementById('outcome-screen');
            const gameScreen = document.getElementById('game-screen');
            
            // Show outcome screen if elements exist
            if (gameScreen) {
                gameScreen.classList.add('hidden');
                gameScreen.style.display = 'none';
            }
            
            if (outcomeScreen) {
                outcomeScreen.classList.remove('hidden');
                outcomeScreen.style.display = 'block';
            }
            
            // Clear any existing button event listeners by recreating the content
            const outcomeContent = outcomeScreen.querySelector('.outcome-content');
            if (outcomeContent) {
                // Create fresh HTML content
                outcomeContent.innerHTML = `
                    <h3>${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                    <p>${selectedAnswer.outcome || ''}</p>
                    <p class="result">${isCorrect ? 'Correct answer!' : 'Try again next time.'}</p>
                    <button id="continue-btn" class="submit-button">Continue</button>
                `;
                
                // Immediately add event listener to the new button
                const continueBtn = outcomeContent.querySelector('#continue-btn');
                if (continueBtn) {
                    console.log('Adding event listener to continue button');
                    continueBtn.addEventListener('click', () => {
                        console.log('Continue button clicked');
                        this.nextScenario();
                    });
                }
            } else {
                // If no outcomeContent found, try individual elements as fallback
                console.error('Could not find outcome content element, trying individual elements');
                
                // Update individual elements
                const outcomeText = document.getElementById('outcome-text');
                const resultText = document.getElementById('result-text');
                
                if (outcomeText) {
                    outcomeText.textContent = selectedAnswer.outcome || '';
                }
                
                if (resultText) {
                    resultText.textContent = isCorrect ? 'Correct!' : 'Incorrect';
                    resultText.className = isCorrect ? 'correct' : 'incorrect';
                }
                
                // Ensure we have a continue button and it has the right event listener
                const continueBtn = document.getElementById('continue-btn');
                if (!continueBtn) {
                    // Try to create a continue button if it doesn't exist
                    const outcomeActions = document.querySelector('.outcome-actions');
                    if (outcomeActions) {
                        outcomeActions.innerHTML = '<button id="continue-btn" class="submit-button">Continue</button>';
                    }
                }
                
                // Add event listener to the continue button (whether it existed or we created it)
                const newContinueBtn = document.getElementById('continue-btn');
                if (newContinueBtn) {
                    // Remove any existing event listeners by cloning and replacing
                    const newBtn = newContinueBtn.cloneNode(true);
                    if (newContinueBtn.parentNode) {
                        newContinueBtn.parentNode.replaceChild(newBtn, newContinueBtn);
                    }
                    
                    // Add fresh event listener
                    newBtn.addEventListener('click', () => {
                        console.log('Continue button clicked');
                        this.nextScenario();
                    });
                }
            }
            
            // Update progress
            this.updateProgress();
        } catch (error) {
            console.error('Error in displayOutcome:', error);
            this.showError('An error occurred. Please try again.');
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

    updateProgress() {
        // Get current level and question count
        const currentLevel = this.getCurrentLevel();
        const totalAnswered = this.player.questionHistory.length;
        
        // Ensure question number never exceeds 15
        const questionNumber = Math.min(totalAnswered + 1, 15);
        
        // Update the existing progress card elements
        const levelInfoElement = document.querySelector('.level-info');
        const questionInfoElement = document.querySelector('.question-info');
        
        if (levelInfoElement) {
            levelInfoElement.textContent = `Level: ${currentLevel}`;
        }
        
        if (questionInfoElement) {
            questionInfoElement.textContent = `Question: ${questionNumber}/15`;
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
            questionProgress.textContent = `Question: ${questionNumber}/${this.totalQuestions || 15}`;
        }
        
        if (progressFill) {
            // Calculate progress percentage (max 100%)
            const progressPercentage = Math.min((totalAnswered / (this.totalQuestions || 15)) * 100, 100);
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
        try {
            const totalAnswered = this.player?.questionHistory?.length || 0;
            
            // If we don't have the randomized sets yet, create them
            if (!this.randomizedScenarios) {
                this.randomizedScenarios = {
                    basic: this.shuffleArray([...this.basicScenarios]).slice(0, 5),
                    intermediate: this.shuffleArray([...this.intermediateScenarios]).slice(0, 5),
                    advanced: this.shuffleArray([...this.advancedScenarios]).slice(0, 5)
                };
                console.log('Created randomized scenarios:', this.randomizedScenarios);
            }
        
            // Simple progression logic based solely on question count, no threshold checks
            if (totalAnswered >= 10) {
                return this.randomizedScenarios.advanced;
            } else if (totalAnswered >= 5) {
                return this.randomizedScenarios.intermediate;
            }
            return this.randomizedScenarios.basic;
        } catch (error) {
            console.error('Error in getCurrentScenarios:', error);
            return this.basicScenarios; // Default to basic if there's an error
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

    // Helper method to shuffle an array using Fisher-Yates algorithm
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
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
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new StandardScriptTestingQuiz();
    quiz.startGame();
}); 