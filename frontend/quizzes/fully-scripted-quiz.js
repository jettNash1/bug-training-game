import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class FullyScriptedQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a fully scripted testing expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong fully scripted skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing fully scripted best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'fully-scripted',
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

        // Basic Scenarios (IDs 1-5, 16-20)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Primary objective',
                description: 'What is the main purpose of fully scripted testing?',
                options: [
                    {
                        text: 'To provide complete freedom in testing with minimal structure',
                        outcome: 'This describes exploratory testing and not precision based approach of a fully scripted project',
                        experience: -10
                    },
                    {
                        text: 'To ensure precision and accuracy through structured, detailed test cases',
                        outcome: 'Correct! This ensures precision and accuracy, especially for high-risk applications.',
                        experience: 15,
                        tool: 'Scripted Testing Fundamentals'
                    },
                    {
                        text: 'To reduce testing time by using minimal documentation',
                        outcome: 'This is not correct, this approach actually requires more documentation.',
                        experience: -5
                    },
                    {
                        text: 'To create a general framework approach for basic testing',
                        outcome: 'While it creates a framework, it is specifically detailed and comprehensive rather than general.',
                        experience: 5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Test case estimation',
                description: 'How many test cases should be planned per day of testing on average?',
                options: [
                    {
                        text: '10-20 test cases',
                        outcome: 'This is too few to test cases to performed in a days testing activities.',
                        experience: -5
                    },
                    {
                        text: '50-70 test cases',
                        outcome: 'Correct! This is the estimate described within the guidelines.',
                        experience: 15,
                        tool: 'Test Planning'
                    },
                    {
                        text: '30-40 test cases',
                        outcome: 'While this is a reasonable number, it\'s below the recommended range.',
                        experience: 5
                    },
                    {
                        text: '100-120 test cases',
                        outcome: 'This is too many to execute effectively in one day.',
                        experience: -10
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Writing test cases',
                description: 'What format is used for writing test cases in fully scripted testing?',
                options: [
                    {
                        text: 'Random text format',
                        outcome: 'This is not a format generally used for writing test case scenarios',
                        experience: -5
                    },
                    {
                        text: 'Gherkin language',
                        outcome: 'Correct! This is the correct format used for ease of understanding.',
                        experience: 15,
                        tool: 'Test Case Writing'
                    },
                    {
                        text: 'Basic bullet point structure',
                        outcome: 'While structured lists are used, Gherkin is the required format.',
                        experience: 5
                    },
                    {
                        text: 'Code snippets only',
                        outcome: 'Code snippets aren\'t the primary format for test cases',
                        experience: -10
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Priority Levels',
                description: 'What are the priority levels used in fully scripted testing?',
                options: [
                    {
                        text: 'Critical, Major, Minor',
                        outcome: 'These are not the levels described in the guidelines.',
                        experience: -5
                    },
                    {
                        text: 'High, Medium, Low',
                        outcome: 'Correct! These are the levels described in the fully scripted approach guidelines.',
                        experience: 15,
                        tool: 'Priority Management'
                    },
                    {
                        text: 'Urgent, Normal, Low',
                        outcome: 'While this describes three levels including low, the other terms aren\'t correct',
                        experience: 5
                    },
                    {
                        text: '1, 2, 3, 4, 5',
                        outcome: 'Numeric priorities aren\'t used in this system',
                        experience: -10
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Smoke Tests',
                description: 'Where should smoke tests be placed in the test script?',
                options: [
                    {
                        text: 'At the end of all the test suites',
                        outcome: 'This isn\'t the specified location.',
                        experience: -5
                    },
                    {
                        text: 'In the topmost suite of the primary functional tests tab',
                        outcome: 'Correct! This is where the guidelines state the smoke tests should be placed.',
                        experience: 15,
                        tool: 'Test Organization'
                    },
                    {
                        text: 'In a separate document',
                        outcome: 'They should be in the main test script for ease of use and project metrics',
                        experience: -10
                    },
                    {
                        text: 'Within each test suite in the test script',
                        outcome: 'While smoke tests are important, they should be in the topmost suite',
                        experience: 5
                    }
                ]
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Environment Metrics',
                description: 'What is the purpose of removing dashes \'-\' from the Result and Date column cells of greyed out environment sections?',
                options: [
                    {
                        text: 'To calculate the number of tests remaining or not started',
                        outcome: 'Correct! While greying out does indicate sections not in scope, removing dashes serves as to calculate the number of tests remaining or not started.',
                        experience: 15,
                        tool: 'Environment Metrics'
                    },
                    {
                        text: 'To indicate that these sections are no longer included in the test scope',
                        outcome: 'While greying out does indicate sections not in scope, removing dashes serves as to calculate the number of tests remaining or not started.',
                        experience: -5
                    },
                    {
                        text: 'To improve the visual appearance of the test script',
                        outcome: 'While it might improve visual appearance, its purpose is to calculate the number of tests remaining or not started.',
                        experience: -10
                    },
                    {
                        text: 'To prevent formula errors in the spreadsheet',
                        outcome: 'Removing the dashes calculates the number of tests remaining or not started.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Change Impact',
                description: 'What impact on a script may late changes made to the software during the scheduled test phase have?',
                options: [
                    {
                        text: 'It improves test coverage by adding new test cases',
                        outcome: 'Late changes typically complicate testing rather than improving coverage.',
                        experience: -5
                    },
                    {
                        text: 'It helps identify previously undiscovered defects',
                        outcome: 'New changes might introduce new defects, although any previous defects on critical functionality should be previously covered by initial test cases.',
                        experience: -10
                    },
                    {
                        text: 'It can lead to outdated and redundant test cases',
                        outcome: 'Correct! These decisions can impact on test execution by having outdated and redundant test cases that were developed against original designs',
                        experience: 15,
                        tool: 'Change Impact'
                    },
                    {
                        text: 'It simplifies the test execution process',
                        outcome: 'Late changes typically complicate the test execution process.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Compatibility Testing',
                description: 'What is recommended for compatibility testing in a fully scripted approach?',
                options: [
                    {
                        text: 'To run all test cases on all environments',
                        outcome: 'This would prove potentially impossible and extremely time consuming.',
                        experience: -5
                    },
                    {
                        text: 'To skip compatibility testing and focusing only on primary environments',
                        outcome: 'Compatibility testing is a fundamental part of the fully scripted approach.', 
                        experience: -10
                    },
                    {
                        text: 'To run pre-defined smoke tests on a range of environments',
                        outcome: 'Correct! Smoke tests should be performed on a wide range of environments across desktop, tablet and mobile platforms unless a certain environment type is out of scope.',
                        experience: 15,
                        tool: 'Compatibility Testing'
                    },
                    {
                        text: 'To create unique test cases for each device type',
                        outcome: 'The same smoke tests should be performed across different environments rather than creating unique test cases for each device as this could result in incomplete coverage.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Fully Scripted Scoping',
                description: 'What is the primary context in which fully scripted testing is recommended?',
                options: [
                    {
                        text: 'It is recommended larger scale or complex projects with specific scope requirements',
                        outcome: 'Correct! fully scripted testing is for larger scale or complex projects that need specific test scenarios.',
                        experience: 15,
                        tool: 'Fully Scripted Scoping'
                    },
                    {
                        text: 'It is recommended for simple projects with minimal requirements',
                        outcome: 'Fully scripted testing is for larger scale or complex projects that need specific test scenarios.',
                        experience: -10
                    },
                    {
                        text: 'It is recommended for projects where exploratory testing is the main focus.',
                        outcome: 'Fully scripted testing may limit time for exploratory testing because of its in-depth scenario based tests.',
                        experience: -5
                    },
                    {
                        text: 'It is recommended for mobile application testing only.',
                        outcome: 'Fully scripted testing is applicable across different platforms including desktop, tablet, and mobile.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Fully Scripted Testing Characteristics',
                description: 'Which of the following is a characteristic required of testers who should execute fully scripted tests?',
                options: [
                    {
                        text: 'The ability to follow detailed test steps with minimal deviation',
                        outcome: 'Correct! Testers need to have the qualities and ability to follow a sequence of detailed test steps with minimal deviation from the script.',
                        experience: 15,
                        tool: 'Fully Scripted Testing Characteristics'
                    },
                    {
                        text: 'The ability to identify software architecture flaws',
                        outcome: 'Architecture flaws are defined as technical in nature and are generally not part of a manual test script.',
                        experience: -10
                    },
                    {
                        text: 'Advanced coding skills in multiple programming languages',
                        outcome: 'Coding skills are not a requirement for testers executing fully scripted tests, as scenarios follow functional behaviour.',
                        experience: -5
                    },
                    {
                        text: 'Experience in designing user interfaces',
                        outcome: 'User Interface design experience is not required for testers as scenarios follow functional behaviour.',
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
                title: 'Script differences',
                description: 'What is the main difference between a standard test script and a fully scripted test?',
                options: [
                    {
                        text: 'The number of test cases is generally larger in a fully scripted test',
                        outcome: 'Whilst this is generally true, it isn\'t the main differentiator.',
                        experience: -5
                    },
                    {
                        text: 'The addition of \'Test Steps\' and \'Expected Behaviour\' columns in primary Environments',
                        outcome: 'Correct! This is a key difference and these columns are not included in a standard test script',
                        experience: 20,
                        tool: 'Script Management'
                    },
                    {
                        text: 'The testing environments used is only reported in one test script',
                        outcome: 'The test environments that have been covered should always be stated on both types of script',
                        experience: -10
                    },
                    {
                        text: 'The level of detail in each test case differs between the two types of script',
                        outcome: 'While this is related, \'Test Steps\' and \'Expected Behaviour\' specific columns included in a full test script are the main difference',
                        experience: 5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Test case priority',
                description: 'How should test cases be prioritised in fully scripted testing?',
                options: [
                    {
                        text: 'These should be based on tester preference and experience',
                        outcome: 'This would not be a true test of priority.',
                        experience: -10
                    },
                    {
                        text: 'These should be based on impact, frequency of use, and potential for critical defects',
                        outcome: 'Correct! This is the correct criteria used when deciding priority.',
                        experience: 20,
                        tool: 'Priority Assessment'
                    },
                    {
                        text: 'Priority of test cases should be based on system development timeline',
                        outcome: 'This Is not a main factor when taking priority into consideration',
                        experience: -5
                    },
                    {
                        text: 'These should be based on complexity',
                        outcome: 'While complexity is considered, it\'s not the only factor',
                        experience: 5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Environment Scoping',
                description: 'What should be done with non-scoped environments in the script?',
                options: [
                    {
                        text: 'These should be deleted out of the script completely',
                        outcome: 'This approach can affect metrics in a detrimental manner',
                        experience: -5
                    },
                    {
                        text: 'Grey them out and remove dashes from results/date columns',
                        outcome: 'Correct! This is the correct approach to ensure these environments are not included in the metrics.',
                        experience: 20,
                        tool: 'Environment Management'
                    },
                    {
                        text: 'Leave all out of scope environments unchanged',
                        outcome: 'They should be modified, or they will affect the overall metrics',
                        experience: -10
                    },
                    {
                        text: 'Hide the non-scoped environment from view within the script',
                        outcome: 'While removing them from view is good, greying out is the specific requirement',
                        experience: 5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Compatibility testing',
                description: 'What is the recommended approach for compatibility testing in fully scripted testing?',
                options: [
                    {
                        text: 'Leave it as a low priority feature to be tested if there is time',
                        outcome: 'Compatibility testing is required and leaving it out entirely may result in missed issues.',
                        experience: -15
                    },
                    {
                        text: 'Run it in parallel with primary environment testing',
                        outcome: 'Correct! This is an approach that can be taken and can maximise time management.',
                        experience: 20,
                        tool: 'Compatibility Testing'
                    },
                    {
                        text: 'Do it only after all other testing is completed',
                        outcome: 'This can be an ineffective time management approach and leave environment testing short',
                        experience: -10
                    },
                    {
                        text: 'Test one environment at a time after primary environments have fully tested',
                        outcome: 'While this can work, parallel testing is recommended when possible',
                        experience: 5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Document references',
                description: 'How should document references be handled in test cases?',
                options: [
                    {
                        text: 'They are not needed as functionality can generally be solved by the tester',
                        outcome: 'References are important to assist with testing activities.',
                        experience: -10
                    },
                    {
                        text: 'Include references that aid in creation and execution of tests',
                        outcome: 'Correct! This is the correct approach to help testers with execution of test cases.',
                        experience: 20,
                        tool: 'Documentation Management'
                    },
                    {
                        text: 'Only include technical references within the documentation',
                        outcome: 'All relevant documentation references should be included, not just technical references',
                        experience: -5
                    },
                    {
                        text: 'Add references after testing as a certain amount of exploratory testing helps find issues',
                        outcome: 'While references can be added later, they should ideally be included during creation',
                        experience: 5
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Test execution planning',
                description: 'What are the key considerations when planning test execution timing?',
                options: [
                    {
                        text: 'Consider the number of test cases included within the script',
                        outcome: 'Other factors have to be considered including complexity and environment coverage.',
                        experience: -5
                    },
                    {
                        text: 'Consider allocated days, test case complexity, and environment coverage',
                        outcome: 'Correct! These are all important factors when considering test execution planning',
                        experience: 25,
                        tool: 'Test Planning'
                    },
                    {
                        text: 'Environment coverage should be solely focused on as this determines resources required',
                        outcome: 'This is one factor. However, others need to be taken into consideration including test case complexity',
                        experience: -10
                    },
                    {
                        text: 'Consider the primary environment testing time',
                        outcome: 'While important, other factors must be considered including environment coverage',
                        experience: -15
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Requirements changes',
                description: 'How should changes to requirements during testing be handled?',
                options: [
                    {
                        text: 'Continue with the testing initially set out during planning',
                        outcome: 'Changes to requirements need to be addressed and factored into testing.',
                        experience: -10
                    },
                    {
                        text: 'Update test cases and document impact on timeline and coverage',
                        outcome: 'Correct! This addresses both technical and project management needs.',
                        experience: 25,
                        tool: 'Change Management'
                    },
                    {
                        text: 'Testing should be started again to compensate for the new requirements',
                        outcome: 'This is inefficient as test cases need to reflect ongoing changes',
                        experience: -5
                    },
                    {
                        text: 'Update the affected test cases only and continue with testing',
                        outcome: 'While this is needed, impact assessment and timeline updates are also required',
                        experience: 5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Edge cases',
                description: 'What is the recommended approach for handling edge cases in fully scripted testing?',
                options: [
                    {
                        text: 'All edge cases should be included in the test script for test execution',
                        outcome: 'Time constraints would make this impossible.',
                        experience: -5
                    },
                    {
                        text: 'Balance them against core objectives based on risk and time constraints',
                        outcome: 'Correct! This is a correct risk-based approach.',
                        experience: 25,
                        tool: 'Risk Assessment'
                    },
                    {
                        text: 'Leave edge case inclusion until everything else has been covered completely',
                        outcome: 'This could miss important test scenarios due to time management',
                        experience: -10
                    },
                    {
                        text: 'Test them only in primary environments',
                        outcome: 'While this is better than nothing, a balanced approach is required',
                        experience: 5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'User journey',
                description: 'How should user journey testing be integrated with functional testing?',
                options: [
                    {
                        text: 'These should be kept completely separate',
                        outcome: 'They should be integrated with functional tests as it forms parity during testing activites.',
                        experience: -5
                    },
                    {
                        text: 'Create user journeys that align with functional test suites while maintaining distinct objectives',
                        outcome: 'Correct! This is the correct approach and creates distinct parity with the associated test suites.',
                        experience: 25,
                        tool: 'Test Integration'
                    },
                    {
                        text: 'Functional tests can be replaced with user journeys',
                        outcome: 'Both scripting approaches are essential to testing activities',
                        experience: -10
                    },
                    {
                        text: 'Combine them into single test cases',
                        outcome: 'While they should be aligned, they serve different purposes',
                        experience: 5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Cross platform testing',
                description: 'What approach should be taken when dealing with cross-platform testing in fully scripted testing?',
                options: [
                    {
                        text: 'Use identical test cases for all platforms for consistency',
                        outcome: 'Platform differences need to be considered and documented as some platforms have specific features.',
                        experience: -5
                    },
                    {
                        text: 'Adapt test cases for platform-specific features while maintaining core test objectives',
                        outcome: 'Correct! This is the recommended approach and maintains core coverage.',
                        experience: 25,
                        tool: 'Platform Testing'
                    },
                    {
                        text: 'Create completely separate test suites for each platform',
                        outcome: 'This is inefficient, and test cases should be adapted to suit different platforms',
                        experience: -10
                    },
                    {
                        text: 'Test platform-specific features only as these areas require priority testing',
                        outcome: 'While platform-specific features need attention, core functionality must also be tested',
                        experience: 5
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
        // End game when all questions are answered
        return totalQuestionsAnswered >= this.totalQuestions;
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
            
            // Clear any conflicting randomized scenarios
            const username = localStorage.getItem('username');
            if (username) {
                // Clear any leftover randomized scenarios from other quizzes
                // to prevent cross-contamination
                const quizzes = ['script-metrics-troubleshooting', 'standard-script-testing'];
                quizzes.forEach(quizName => {
                    if (quizName !== this.quizName) {
                        const key = `quiz_progress_${username}_${quizName}`;
                        const data = localStorage.getItem(key);
                        if (data) {
                            try {
                                console.log(`[Quiz] Clearing potential conflicting scenarios from ${quizName}`);
                                const parsed = JSON.parse(data);
                                if (parsed && parsed.data && parsed.data.randomizedScenarios) {
                                    delete parsed.data.randomizedScenarios;
                                    localStorage.setItem(key, JSON.stringify(parsed));
                                }
                            } catch (e) {
                                console.error(`[Quiz] Error clearing scenarios from ${quizName}:`, e);
                            }
                        }
                    }
                });
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
                
                // Clear any existing randomized scenarios
                this.randomizedScenarios = {};
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
        // Check if we've answered all questions
        if (this.player.questionHistory.length >= this.totalQuestions) {
            console.log('All questions answered, ending game');
            this.endGame(false);
            return;
        }
        
        // Get the randomized scenarios for the current level
        const currentScenarios = this.getCurrentScenarios();
        
        // Get the next scenario based on current progress within level
        let scenario;
        const questionCount = this.player.questionHistory.length;
        
        // Determine which level we're in and set the correct index
        let currentLevelIndex;
        if (questionCount < 5) {
            // Basic questions (0-4)
            currentLevelIndex = questionCount;
        } else if (questionCount < 10) {
            // Intermediate questions (5-9)
            currentLevelIndex = questionCount - 5;
        } else {
            // Advanced questions (10-14)
            currentLevelIndex = questionCount - 10;
        }
        
        // Get the scenario from the current randomized scenarios
        scenario = currentScenarios[currentLevelIndex];
        
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
            (questionCount < 5 ? 'Basic' : 
             questionCount < 10 ? 'Intermediate' : 'Advanced') : null;
            
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

        // Clear any existing timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }
        
        try {
            this.isLoading = true;
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) return;

            const currentScenarios = this.getCurrentScenarios();
            
            // Determine which level we're in and set the correct index
            const questionCount = this.player.questionHistory.length;
            let currentLevelIndex;
            
            if (questionCount < 5) {
                // Basic questions (0-4)
                currentLevelIndex = questionCount;
            } else if (questionCount < 10) {
                // Intermediate questions (5-9)
                currentLevelIndex = questionCount - 5;
            } else {
                // Advanced questions (10-14)
                currentLevelIndex = questionCount - 10;
            }
            
            const scenario = currentScenarios[currentLevelIndex];
            const originalIndex = parseInt(selectedOption.value);
            
            const selectedAnswer = scenario.options[originalIndex];

            // Find the correct answer (option with highest experience)
            const correctAnswer = scenario.options.reduce((prev, current) => 
                (prev.experience > current.experience) ? prev : current
            );

            // Mark selected answer as correct or incorrect
            selectedAnswer.isCorrect = selectedAnswer === correctAnswer;

            // Update player experience with bounds
            this.player.experience = Math.max(0, Math.min(this.maxXP, this.player.experience + selectedAnswer.experience));
            
            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: selectedAnswer.isCorrect,
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
                lastUpdated: new Date().toISOString()
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
            
            // Set content directly in the outcome screen
            const outcomeContent = this.outcomeScreen.querySelector('.outcome-content');
            if (outcomeContent) {
                outcomeContent.innerHTML = `
                    <h3>${selectedAnswer.isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                    <p>${selectedAnswer.outcome || ''}</p>
                    <p class="result">${selectedAnswer.isCorrect ? 'Correct answer!' : 'Try again next time.'}</p>
                    <button id="continue-btn" class="submit-button">Continue</button>
                `;
                
                // Add event listener to the continue button
                const continueBtn = outcomeContent.querySelector('#continue-btn');
                if (continueBtn) {
                    continueBtn.addEventListener('click', () => this.nextScenario());
                }
            }

            this.updateProgress();

            // Check if all questions have been answered
            if (this.shouldEndGame(this.player.questionHistory.length, this.player.experience)) {
                await this.endGame(false);
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
        let level;
        let scenarios;
        
        if (totalAnswered >= 10) {
            level = 'advanced';
            scenarios = this.advancedScenarios;
        } else if (totalAnswered >= 5) {
            level = 'intermediate';
            scenarios = this.intermediateScenarios;
        } else {
            level = 'basic';
            scenarios = this.basicScenarios;
        }
        
        // Use the getRandomizedScenarios method to get or create random scenarios
        return this.getRandomizedScenarios(level, scenarios);
    }

    getCurrentLevel() {
        const totalAnswered = this.player.questionHistory.length;
        
        // Progress through levels based only on question count
        if (totalAnswered >= 10) {
            return 'Advanced';
        } else if (totalAnswered >= 5) {
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of the fully scripted testing approach. You clearly understand the nuances of fully scripted testing and are well-equipped to handle any testing challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your fully scripted testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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
            return 'Test Case Management';
        } else if (title.includes('environment') || description.includes('environment')) {
            return 'Environment Management';
        } else if (title.includes('script') || description.includes('script')) {
            return 'Script Organization';
        } else if (title.includes('priority') || description.includes('priority')) {
            return 'Priority Management';
        } else if (title.includes('requirement') || description.includes('requirement')) {
            return 'Requirements Management';
        } else if (title.includes('document') || description.includes('document')) {
            return 'Documentation';
        } else if (title.includes('platform') || description.includes('platform')) {
            return 'Cross-platform Testing';
        } else if (title.includes('user journey') || description.includes('user journey')) {
            return 'User Journey Testing';
        } else {
            return 'General Scripted Testing';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Test Case Management': 'Focus on writing clear, detailed test cases using Gherkin format and proper estimation techniques.',
            'Environment Management': 'Improve handling of environment scoping and compatibility testing across different platforms.',
            'Script Organization': 'Enhance understanding of test script structure, including smoke tests placement and script differences.',
            'Priority Management': 'Work on prioritizing test cases based on impact, frequency, and potential for critical defects.',
            'Requirements Management': 'Strengthen ability to handle requirement changes and maintain test coverage.',
            'Documentation': 'Develop better documentation practices with proper references and test step details.',
            'Cross-platform Testing': 'Focus on adapting test cases for platform-specific features while maintaining core objectives.',
            'User Journey Testing': 'Improve integration of user journeys with functional test suites.',
            'General Scripted Testing': 'Continue developing fundamental fully scripted testing principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core fully scripted testing principles.';
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

        // Calculate final score percentage based on correct answers
        const scorePercentage = this.calculateScorePercentage();
        const hasPassed = !failed && scorePercentage >= this.passPercentage;
        
        // Save the final quiz result with pass/fail status
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                const status = hasPassed ? 'passed' : 'failed';
                console.log('Setting final quiz status:', { status, score: scorePercentage });
                
                const result = {
                    score: scorePercentage,
                    status: status,
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory,
                    questionsAnswered: this.player.questionHistory.length,
                    lastUpdated: new Date().toISOString(),
                    scorePercentage: scorePercentage
                };

                // Save to QuizUser
                await user.updateQuizScore(
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
                
                // Clear any local storage for this quiz
                this.clearQuizLocalStorage(username, this.quizName);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${scorePercentage}%`;
        
        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = hasPassed ? 'Quiz Complete!' : 'Quiz Failed!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (!hasPassed) {
            performanceSummary.textContent = 'Quiz failed. You did not earn enough points to pass. You can retry this quiz later.';
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
            // Find the appropriate performance message
            const threshold = this.config.performanceThresholds.find(t => scorePercentage >= t.threshold);
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
                
                const isCorrect = record.selectedAnswer && (record.selectedAnswer.isCorrect || 
                    record.selectedAnswer.experience === Math.max(...record.scenario.options.map(o => o.experience || 0)));
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

    // Helper method to calculate the score percentage based on correct answers
    calculateScorePercentage() {
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && (q.selectedAnswer.isCorrect || 
            q.selectedAnswer.experience === Math.max(...q.scenario.options.map(o => o.experience || 0)))
        ).length;
        
        // Calculate percentage based on completed questions (cap at max questions)
        const totalAnswered = Math.min(this.player.questionHistory.length, this.totalQuestions);
        return totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
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

        // Add fully-scripted specific variations
        if (quizName.toLowerCase().includes('fully-scripted')) {
            variations.push(
                'fully-scripted',
                'fullyScripted',
                'fullyScriptedTest',
                'fullyScripted_',
                'fullyScripted'
            );
        }

        variations.forEach(variant => {
            localStorage.removeItem(`quiz_progress_${username}_${variant}`);
            localStorage.removeItem(`quizResults_${username}_${variant}`);
        });
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('[FullyScriptedQuiz] Initializing quiz');
    
    // Force clean any existing quiz references that might be in memory
    if (window.currentQuiz) {
        console.log('[FullyScriptedQuiz] Cleaning up existing quiz instance:', window.currentQuiz.quizName);
        // Clear any timers or other resources
        if (window.currentQuiz.questionTimer) {
            clearInterval(window.currentQuiz.questionTimer);
        }
    }
    
    // Clear any conflicting localStorage entries
    const username = localStorage.getItem('username');
    if (username) {
        // List all quiz names that might conflict
        const potentialConflicts = [
            'script-metrics-troubleshooting',
            'standard-script-testing',
            'fully-scripted',
            'exploratory'
        ];
        
        // Clean localStorage to prevent cross-contamination
        potentialConflicts.forEach(quizName => {
            const key = `quiz_progress_${username}_${quizName}`;
            const data = localStorage.getItem(key);
            if (data) {
                console.log(`[FullyScriptedQuiz] Found potential conflicting quiz data: ${quizName}`);
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.data && parsed.data.randomizedScenarios) {
                        console.log(`[FullyScriptedQuiz] Cleaning randomized scenarios from ${quizName}`);
                        delete parsed.data.randomizedScenarios;
                        localStorage.setItem(key, JSON.stringify(parsed));
                    }
                } catch (e) {
                    console.error(`[FullyScriptedQuiz] Error cleaning scenarios:`, e);
                }
            }
        });
    }
    
    // Create a new instance and keep a global reference
    const quiz = new FullyScriptedQuiz();
    window.currentQuiz = quiz;
    
    // Add a specific property to identify this quiz
    Object.defineProperty(window, 'ACTIVE_QUIZ_NAME', {
        value: 'fully-scripted',
        writable: true,
        configurable: true
    });
    
    // Force clear any unrelated randomized scenarios
    if (quiz.randomizedScenarios) {
        // Keep only keys specific to this quiz
        Object.keys(quiz.randomizedScenarios).forEach(key => {
            if (!key.startsWith('fully-scripted_')) {
                console.log(`[FullyScriptedQuiz] Removing unrelated randomized scenario: ${key}`);
                delete quiz.randomizedScenarios[key];
            }
        });
    }
    
    // Start the quiz
    console.log('[FullyScriptedQuiz] Starting quiz');
    quiz.startGame();
}); 