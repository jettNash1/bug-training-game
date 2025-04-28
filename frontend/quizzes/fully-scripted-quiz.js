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

        // Check if timer is disabled
        if (this.timePerQuestion === 0 || this.timerDisabled) {
            console.log('[FullyScriptedQuiz] Timer is disabled, hiding timer container');
            const timerContainer = document.getElementById('timer-container');
            if (timerContainer) {
                timerContainer.style.display = 'none';
            }
        } else {
            // Initialize timer for the new question only if timer is not disabled
            this.initializeTimer();
        }
            
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
        
        // Check if timer is disabled
        if (this.timePerQuestion === 0 || this.timerDisabled) {
            console.log('[FullyScriptedQuiz] Timer is disabled, not initializing timer');
            const timerContainer = document.getElementById('timer-container');
            if (timerContainer) {
                timerContainer.style.display = 'none';
            }
            return;
        }

        // Reset remaining time
        this.remainingTime = this.timePerQuestion;
        this.questionStartTime = Date.now();

        // Update timer display
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = `${this.remainingTime}`;
        }

        // Start the countdown
        this.questionTimer = setInterval(() => {
            this.remainingTime--;
            
            // Update timer display
            if (timerDisplay) {
                timerDisplay.textContent = `${this.remainingTime}`;
            }

            // Check if time is up
            if (this.remainingTime <= 0) {
                clearInterval(this.questionTimer);
                this.handleTimeUp();
            }
        }, 1000);
    }

    handleTimeUp() {
        // If timer is disabled, don't process time up events
        if (this.timePerQuestion === 0 || this.timerDisabled) {
            console.log('[FullyScriptedQuiz] Timer is disabled, ignoring time up event');
            return;
        }
        
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
    const quiz = new FullyScriptedQuiz();
    quiz.startGame();
}); 