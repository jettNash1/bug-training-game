import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class SanitySmokeQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a sanity and smoke testing expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong sanity and smoke testing skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing sanity and smoke testing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'sanity-smoke',
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

        // Basic Scenarios (IDs 1-10, expanded from 1-5)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Understanding Sanity Testing',
                description: 'What is Sanity Testing?',
                options: [
                    {
                        text: 'Sanity testing is a subset of regression testing that validates specific code changes',
                        outcome: 'Correct! Sanity testing is a subset of regression testing that focuses on verifying specific code changes and their intended functionality.',
                        experience: 15,
                        tool: 'Sanity Testing Framework'
                    },
                    {
                        text: 'A comprehensive testing method that checks all system functionality',
                        outcome: 'While it checks functionality, it\'s not comprehensive and focus remains on major functionality.',
                        experience: -5
                    },
                    {
                        text: 'A testing approach that requires extensive documentation on the application under test',
                        outcome: 'Sanity testing is typically undocumented as it is generally performed on a build where the production deployment is required immediately.',
                        experience: -10
                    },
                    {
                        text: 'Sanity testing is a method to completely replace smoke testing',
                        outcome: 'Sanity testing is performed after smoke testing, not as a replacement, as smoke testing confirms that the QA team can continue with further testing.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Sanity Test Execution',
                description: 'When is Sanity Testing typically performed?',
                options: [
                    {
                        text: 'At the beginning of the software development lifecycle.',
                        outcome: 'It occurs during the development process, but not at the very beginning.',
                        experience: -5
                    },
                    {
                        text: 'During the final user acceptance testing stage of an application',
                        outcome: 'This type of testing would be performed before user acceptance testing as all critical functional bugs should be resolved before that stage.',
                        experience: -10
                    },
                    {
                        text: 'After smoke testing, typically to check critical bug fixes',
                        outcome: 'Correct! Sanity testing is performed after smoke tests, usually for critical bug fixes or before immediate production deployment.',
                        experience: 15,
                        tool: 'Sanity Test Execution'
                    },
                    {
                        text: 'Sanity testing should be performed during the initial design phase of the project',
                        outcome: 'This should occur during implementation, not during initial design as functionality of the system cannot be tested during the design stage.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Understanding Smoke Testing',
                description: 'What is the primary purpose of Smoke Testing?',
                options: [
                    {
                        text: 'To verify that critical features are working and there are no blocking issues that prevent further testing',
                        outcome: 'Perfect! Smoke testing is a minimal set of tests run on each build to confirm the critical features of a system are working and there are no blocking issues that would prevent further testing.',
                        experience: 15,
                        tool: 'Smoke Test Characteristics'
                    },
                    {
                        text: 'To completely test all software functionality within the system under test',
                        outcome: 'Smoke testing is not comprehensive and does not aim to test all functionality in depth.',
                        experience: -10
                    },
                    {
                        text: 'To replace functional testing within the system under test entirely',
                        outcome: 'Smoke testing is a preliminary step that precedes functional testing to identify critical issues in core functionality, not a replacement for it.',
                        experience: -5
                    },
                    {
                        text: 'To add additional steps to the detailed test scenarios already set out in the planning process',
                        outcome: 'While some might view it as an additional step, smoke testing is actually a crucial method to quickly identify critical issues early in the development process',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Smoke Testing Execution',
                description: 'When is Smoke Testing typically performed?',
                options: [
                    {
                        text: 'At the start of every new software release or when new functionality is developed and integrated',
                        outcome: 'Excellent! Smoke Testing is completed at the start of every new software release to ensure that all critical functionalities are working correctly or not.',
                        experience: 15,
                        tool: 'Smoke Test Execution'
                    },
                    {
                        text: 'Smoke testing is typically carried out during final software release',
                        outcome: 'This misunderstands the purpose of smoke testing. Waiting until the final release would defeat the purpose of early issue detection.',
                        experience: -10
                    },
                    {
                        text: 'At random points throughout the development process and software releases',
                        outcome: 'Smoke testing is not random but systematically performed at specific points in the development cycle, typically at the beginning of testing a new software release.',
                        experience: -5
                    },
                    {
                        text: 'At the preference of the tester, depending on past experience of similar projects.',
                        outcome: 'Smoke testing is not based on preference but on a structured process of verifying build stability after changes.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Performing Smoke Tests',
                description: 'Who typically performs Smoke Testing?',
                options: [
                    {
                        text: 'Both development and QA teams should perform smoke testing',
                        outcome: 'Perfect! Smoke testing is normally completed by both the development team and the quality assurance team, with each playing a specific roles in identifying issues',
                        experience: 15,
                        tool: 'Performing Smoke Tests'
                    },
                    {
                        text: 'Only developers should perform smoke tests',
                        outcome: 'While developers play a role, smoke testing is not exclusively their responsibility and QA teams should also perform these type of tests.',
                        experience: -10
                    },
                    {
                        text: 'Only quality assurance (QA) team should perform smoke tests',
                        outcome: 'QA is involved, but they are not the sole performers of smoke testing and developers should also be involved.',
                        experience: -5
                    },
                    {
                        text: 'External consultants should perform smoke tests',
                        outcome: 'External consultants are typically not involved in routine smoke testing processes.',
                        experience: 0
                    }
                ]
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Sanity Test Performance',
                description: 'Under which circumstances is sanity testing generally performed?',
                options: [
                    {
                        text: 'On builds where production deployment is required immediately',
                        outcome: 'Correct! Sanity testing is a subset of regression testing and focus is on changes to specific functionality and critical surrounding areas.',
                        experience: 15,
                        tool: 'Sanity Test Performance'
                    },
                    {
                        text: 'During the initial development phase by the development team',
                        outcome: 'Sanity testing should not be restricted to the initial development phase; it can be performed whenever needed for quick validation of changes.',
                        experience: -5
                    },
                    {
                        text: 'After complete regression testing is finished for the release.',
                        outcome: 'Sanity testing as a subset of regression testing, not something that happens after it.',
                        experience: -10
                    },
                    {
                        text: 'When there is enough time for extensive testing on the release.',
                        outcome: 'Sanity testing is appropriate when time is limited, it helps in the scenario when the time for testing of the product is limited.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Sanity Test Failure',
                description: 'What happens if a sanity test fails?',
                options: [
                    {
                        text: 'Any minor issue failures are documented and fixed later',
                        outcome: 'Failure should result in rejection of the software product.',
                        experience: -5
                    },
                    {
                        text: 'All failed components are retested by the development team',
                        outcome: 'If any components are failed they will be rejected by the test team and subsequently fixed for another round of testing for the test team.',
                        experience: -10
                    },
                    {
                        text: 'The software product is rejected by the testing team.',
                        outcome: 'Correct! If the sanity test fails, the software product is rejected by the testing team to save on time and money.',
                        experience: 15,
                        tool: 'Sanity Test Failure'
                    },
                    {
                        text: 'The development team performs regression testing',
                        outcome: 'The development team doesn\'t perform regression testing upon sanity test failure. The test team will perform sanity tests a subset of regression testing.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Sanity Test Scenarios',
                description: 'Why is sanity testing particularly useful in certain development scenarios?',
                options: [
                    {
                        text: 'It provides comprehensive documentation for all test cases',
                        outcome: 'Sanity testing is usually undocumented, so comprehensive documentation is not a feature.',
                        experience: -5
                    },
                    {
                        text: 'It thoroughly tests all aspects of the application',
                        outcome: 'Sanity testing covers only a few areas in the system application rather than testing all aspects thoroughly.',
                        experience: -10
                    },
                    {
                        text: 'It can be carried out quickly when testing time is limited.',
                        outcome: 'Correct! Sanity tests help in the scenario when the time for testing of the product is limited.',
                        experience: 15,
                        tool: 'Sanity Test Scenario'
                    },
                    {
                        text: 'It focuses primarily on design structure issues',
                        outcome: 'Emphasis should be on detailed documentation, not minimal detail that requires interpretation.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Smoke Test Advantage',
                description: 'What is the main advantage of smoke testing?',
                options: [
                    {
                        text: 'It reduces the risk of major bugs not being identified in software',
                        outcome: 'Correct! It reduces the risk of major bugs not being identified in software, as it focusses is on functionality critical to the system under test.',
                        experience: 15,
                        tool: 'Smoke Test Advantages'
                    },
                    {
                        text: 'It eliminates the need for functional testing for the system under test',
                        outcome: 'Smoke testing is a precursor to functional testing, not a replacement',
                        experience: -10
                    },
                    {
                        text: 'It ensures the software will be free of defects when released.',
                        outcome: 'While smoke testing improves quality, it doesn\'t guarantee the software will be completely free of defects.',
                        experience: -5
                    },
                    {
                        text: 'It identifies all possible bugs in the system under test.',
                        outcome: 'Smoke testing focuses on critical functionality rather than attempting to find all possible bugs.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Smoke Test Failures',
                description: 'What should happen to all smoke test failures',
                options: [
                    {
                        text: 'Smoke test failures should be raised as critical issues',
                        outcome: 'Correct! They should be raised as critical issues as they focus on functionality critical to the system under test.',
                        experience: 15,
                        tool: 'Smoke Test Failure'
                    },
                    {
                        text: 'They should be documented and fixed in the next sprint',
                        outcome: 'Smoke tests should halt testing for any related area and be addressed immediately.',
                        experience: -10
                    },
                    {
                        text: 'They should be prioritised based on severity',
                        outcome: 'All smoke test failures should be deemed critical to functionality.',
                        experience: -5
                    },
                    {
                        text: 'They should be ignored if they don\'t affect core functionality',
                        outcome: 'Smoke tests specifically check core functionality, so failures should never be ignored.',
                        experience: 0
                    }
                ]
            }
        ];
        // Intermediate Scenarios (IDs 6-10, 100 XP total, 20 XP each)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Sanity Test Features',
                description: 'What are the key features of Sanity Testing?',
                options: [
                    {
                        text: 'A narrow and deep approach with limited, in-depth functionality testing',
                        outcome: 'Excellent! Sanity testing is characterised by a narrow and deep approach, focusing on limited functionality in depth.',
                        experience: 20,
                        tool: 'Focus Area Validation'
                    },
                    {
                        text: 'Sanity testing is characterised by a scripted and extensively documented approach',
                        outcome: 'Sanity testing is typically unscripted and undocumented as it is generally performed on a build where the production deployment is required immediately.',
                        experience: -15
                    },
                    {
                        text: 'Sanity testing is characterised by comprehensive coverage of all system functionality',
                        outcome: 'While it checks functionality, it\'s not comprehensive and focus remains on major functionality.',
                        experience: -10
                    },
                    {
                        text: 'Sanity testing is characterised as being designed to replace full regression testing',
                        outcome: 'This is generally a subset of regression testing that focus on critical areas of the system and not a replacement.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Sanity Check Risks',
                description: 'What is a key disadvantage of Sanity Testing?',
                options: [
                    {
                        text: 'It covers only a few areas and can miss issues in unchecked system functionality',
                        outcome: 'Sanity testing focuses on a narrow range of functionalities, which means potential issues in unchecked areas might go undetected.',
                        experience: 20,
                        tool: 'Sanity Check Risk'
                    },
                    {
                        text: 'It can be too time-consuming and expensive to execute the tests',
                        outcome: 'It\'s actually less time-consuming and less expensive as it only focus\' on limited functionality.',
                        experience: -15
                    },
                    {
                        text: 'This type of approach can require too much documentation',
                        outcome: 'Exploratory testing requires less documentation than scripted testing.',
                        experience: -10
                    },
                    {
                        text: 'Sanity testing requires extensive documentation during planning',
                        outcome: 'Sanity testing is typically undocumented as it is generally performed on a build where the production deployment is required immediately.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Failed Smoke Test Process',
                description: 'What is the general process if a Smoke Test fails?',
                options: [
                    {
                        text: 'Testing is halted for that area of functionality, and the build is returned to development',
                        outcome: 'If a smoke test fails, it typically results in testing being halted for that area of functionality. The system would be handed back to the development team for correction, whilst functional testing on other areas can still be performed.',
                        experience: 20,
                        tool: 'Smoke Test Failure Process'
                    },
                    {
                        text: 'The software can be released as smoke tests generally don\'t detect issues in critical functionality',
                        outcome: 'A failed smoke test prevents the software from proceeding to further testing or release as an issue in this area would relate to critical functionality.',
                        experience: -15
                    },
                    {
                        text: 'Testing can continue as normal if a smoke test has failed as critical functionality will remain unaffected',
                        outcome: 'Testing cannot continue normally if critical functionalities are not working and smoke tests are designed to be carried out on critical functionality.',
                        experience: -10
                    },
                    {
                        text: 'Smoke test failures can be left out of documentation if they are only minor issues',
                        outcome: 'All failures must be documented if they are related to critical functionality.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Smoke Testing Benefits',
                description: 'How does Smoke Testing benefit the software development process?',
                options: [
                    {
                        text: 'It helps identify critical bugs early and aligns teams on the software\'s current state',
                        outcome: 'Perfect! Smoke testing plays a crucial role by capturing the state of the software early, saving test effort, and bringing teams to a known state.',
                        experience: 20,
                        tool: 'Smoke Test Benefit'
                    },
                    {
                        text: 'It increases development time, therefore decreasing testing activity time',
                        outcome: 'While smoke testing takes some time, it actually helps prevent longer delays by catching critical issues early in the process.',
                        experience: -15
                    },
                    {
                        text: 'It has no significant impact on the software cycle development process',
                        outcome: 'Smoke testing plays a crucial role in identifying and preventing potential issues early in the development process.',
                        experience: -10
                    },
                    {
                        text: 'It completely eliminates the need for other testing methods within the software development lifecycle process',
                        outcome: 'While valuable, smoke testing does not replace other testing methods but is an important preliminary step.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Smoke And Functional Testing',
                description: 'What is the relationship between Smoke Testing and Functional Testing?',
                options: [
                    {
                        text: 'Smoke testing is a prerequisite for comprehensive functional testing',
                        outcome: 'Excellent! Smoke testing is a confirmation for the QA team to proceed with further software testing. Only after smoke tests pass can the team move on to comprehensive functional testing.',
                        experience: 20,
                        tool: 'Smoke And Functional Test Relationship'
                    },
                    {
                        text: 'Smoke testing and functional testing are completely unrelated testing methods',
                        outcome: 'Smoke testing and functional testing are closely related in the software testing process and share many of the same approaches.',
                        experience: -15
                    },
                    {
                        text: 'Functional testing always replaces smoke testing within the system under test',
                        outcome: 'Functional testing builds upon smoke testing and doesn\'t replace it.',
                        experience: -10
                    },
                    {
                        text: 'These terms can be used interchangeably for a testing approach to a system under test',
                        outcome: 'While related, these are distinct testing methodologies with different purposes and scopes.',
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
                title: 'Sanity And Smoke Testing',
                description: 'How does Sanity Testing differ from Smoke Testing?',
                options: [
                    {
                        text: 'Sanity testing is performed after smoke testing to verify specific code changes',
                        outcome: 'Perfect! Sanity testing focuses on verifying a specific code change/critical bug fix and its intended functionality. Smoke testing is performed at the beginning of every new release and focus is on all critical functionality.',
                        experience: 25,
                        tool: 'Sanity and Smoke Test Validator'
                    },
                    {
                        text: 'Both sanity and smoke testing employ exactly the same testing methodology',
                        outcome: 'They are distinct testing methodologies with different purposes.',
                        experience: -15
                    },
                    {
                        text: 'Smoke testing is more detailed and covers all system functionalities',
                        outcome: 'Smoke testing is actually less detailed compared to sanity testing.',
                        experience: -10
                    },
                    {
                        text: 'Sanity testing requires more resources and time than smoke testing does',
                        outcome: 'Sanity testing is less resource-intensive compared to other testing methods.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Sanity Check Primary Goal',
                description: 'In the context of software development, what is the primary goal of Sanity Testing?',
                options: [
                    {
                        text: 'Sanity testing is a stoppage to check whether testing for the build can proceed or not',
                        outcome: 'Excellent! The primary goal is to quickly identify critical defects in core functionalities, helping teams decide whether further testing is worthwhile',
                        experience: 25,
                        tool: 'Exploratory Test Skills'
                    },
                    {
                        text: 'To completely eliminate all software bugs within the system under test',
                        outcome: 'Testing can help identify defects but it does noy eliminate all bugs',
                        experience: -15
                    },
                    {
                        text: 'To help to create comprehensive test documentation for the system under test',
                        outcome: 'Sanity testing is typically undocumented as it is generally performed on a build where the production deployment is required immediately.',
                        experience: -10
                    },
                    {
                        text: 'Sanity testing helps to replace the need for developer fixes through thorough testing',
                        outcome: 'Sanity testing complements developer efforts, not replaces them, as testers do not fix defects and only report on them.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Smoke Test Characteristics',
                description: 'What are the key characteristics of an effective smoke test?',
                options: [
                    {
                        text: 'A minimal set of tests focusing on critical functionality within the system under test',
                        outcome: 'Perfect! Effective smoke tests are characterised by being a minimal set of tests that focus on critical functionalities.',
                        experience: 25,
                        tool: 'JavaScript Checker'
                    },
                    {
                        text: 'Long and detailed test cases that focus on critical functionality within the system under test',
                        outcome: 'Effective smoke tests are minimal and focused, not exhaustive.',
                        experience: -15
                    },
                    {
                        text: 'Tests that cover every possible user scenario within the system under test',
                        outcome: 'Comprehensive scenario testing is part of functional testing, not smoke testing.',
                        experience: -10
                    },
                    {
                        text: 'Random testing areas without a specific focus to gain the most coverage within the project time frame',
                        outcome: 'While not completely random, smoke tests do require strategic selection of critical test cases.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Smoke Test Team Approach',
                description: 'How do development and QA teams typically approach smoke testing differently?',
                options: [
                    {
                        text: 'Development teams conduct initial sanity checks, while QA teams determine major functionality to verify the build\'s stability',
                        outcome: 'Excellent! Developers use smoke tests to verify basic functionality (sanity checks) during the development phase, while QA teams determine and test the major functionalities to ensure the build\'s overall stability before proceeding with further testing.',
                        experience: 25,
                        tool: 'Smoke test Definition'
                    },
                    {
                        text: 'Developers use smoke tests for basic sanity checks during code development',
                        outcome: 'While developers do perform initial sanity checks, this is just a part of their smoke testing approach when verifying basic functionality before submitting the build.',
                        experience: -15
                    },
                    {
                        text: 'A QA teams smoke test is comprehensive and covers all possible scenarios whilst developers only use minimal sanity checks',
                        outcome: 'QA smoke testing focuses on critical functionalities, not exhaustive testing. This approach would defeat the purpose of a quick, preliminary test.',
                        experience: -10
                    },
                    {
                        text: 'Developers perform detailed functional testing before QA involvement',
                        outcome: 'Developers focus on basic functionality verification, not comprehensive functional testing. This misunderstands the roles of development and QA teams in the testing process.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Smoke Test Inclusion',
                description: 'What are the potential consequences of skipping smoke testing in the software development process?',
                options: [
                    {
                        text: 'Major defects may be encountered in later stages, affecting project timelines and resource allocation',
                        outcome: 'Perfect! Without smoke testing, critical issues might only be discovered during later stages of development or testing, which can substantially impact project timelines, resource allocation, and overall project efficiency.',
                        experience: 25,
                        tool: 'Smoke Test Inclusion'
                    },
                    {
                        text: 'There should be no significant impact on the software development timeline',
                        outcome: 'Skipping smoke testing can lead to major defects being discovered late in the development process, potentially causing significant delays and increased costs.',
                        experience: -15
                    },
                    {
                        text: 'Project timelines are kept on schedule and deliverables can be met ahead of time',
                        outcome: 'While this approach could reduce testing time, it could also prolong them if critical issues are missed earlier in testing activites',
                        experience: -10
                    },
                    {
                        text: 'Other testing methodologies become more efficient in detecting critical issues',
                        outcome: 'Alternative testing methods might catch some issues, but not with the same efficiency and early-stage intervention.',
                        experience: -5
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

    async saveProgress() {
        // First determine the status based on quiz completion and score
        let status = 'in-progress';
        let scorePercentage = 0;
        
        // Calculate score percentage based on correct answers
        if (this.player.questionHistory.length > 0) {
            scorePercentage = this.calculateScorePercentage();
        }
        
        // Check for completion (all questions answered)
        if (this.player.questionHistory.length >= this.totalQuestions) {
            status = scorePercentage >= this.passPercentage ? 'passed' : 'failed';
        }

        const progress = {
            data: {
                experience: this.player.experience,
                tools: this.player.tools,
                currentScenario: this.player.currentScenario,
                questionHistory: this.player.questionHistory,
                lastUpdated: new Date().toISOString(),
                questionsAnswered: this.player.questionHistory.length,
                status: status,
                scorePercentage: scorePercentage,
                randomizedScenarios: this.randomizedScenarios || {} // Save the randomized scenarios
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
            
            console.log('Saving progress with status:', status, 'and score:', scorePercentage);
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
                    status: savedProgress.data.status || 'in-progress',
                    scorePercentage: savedProgress.data.scorePercentage || 0,
                    randomizedScenarios: savedProgress.data.randomizedScenarios || {}
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
                // Restore randomized scenarios if available
                if (progress.randomizedScenarios) {
                    this.randomizedScenarios = progress.randomizedScenarios;
                    console.log('Restored randomized scenarios:', this.randomizedScenarios);
                    
                    // If we have scenario IDs instead of full objects, restore full scenarios
                    for (const level in this.randomizedScenarios) {
                        if (Array.isArray(this.randomizedScenarios[level])) {
                            // Check if we have IDs instead of full scenario objects
                            if (this.randomizedScenarios[level].length > 0 && 
                                (typeof this.randomizedScenarios[level][0] === 'number' || 
                                 typeof this.randomizedScenarios[level][0] === 'string')) {
                                console.log(`Restoring full scenarios for level ${level} from IDs`);
                                
                                // Get the source scenarios for this level
                                let sourceScenarios;
                                if (level === 'basic') {
                                    sourceScenarios = this.basicScenarios;
                                } else if (level === 'intermediate') {
                                    sourceScenarios = this.intermediateScenarios;
                                } else if (level === 'advanced') {
                                    sourceScenarios = this.advancedScenarios;
                                }
                                
                                if (sourceScenarios) {
                                    // Replace IDs with full scenario objects
                                    this.randomizedScenarios[level] = this.randomizedScenarios[level].map(id => {
                                        const scenarioId = typeof id === 'string' ? parseInt(id, 10) : id;
                                        return sourceScenarios.find(s => s.id === scenarioId) || null;
                                    }).filter(Boolean);
                                    
                                    console.log(`Restored ${this.randomizedScenarios[level].length} full scenarios for level ${level}`);
                                }
                            }
                        }
                    }
                }
                
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
                } else if (progress.status === 'passed' || progress.status === 'completed') {
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of sanity and smoke testing. You clearly understand the differences between these testing approaches and are well-equipped to implement them effectively!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your sanity and smoke testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('sanity testing') || title.includes('sanity test') || title.includes('sanity check')) {
            return 'Sanity Testing Concepts';
        } else if (title.includes('smoke testing') || title.includes('smoke test')) {
            return 'Smoke Testing Concepts';
        } else if (title.includes('execution') || description.includes('performed')) {
            return 'Test Execution Timing';
        } else if (title.includes('process') || description.includes('process')) {
            return 'Testing Process';
        } else if (title.includes('features') || description.includes('features') || description.includes('characteristics')) {
            return 'Testing Characteristics';
        } else if (title.includes('risks') || description.includes('risks') || description.includes('disadvantage')) {
            return 'Testing Risks';
        } else if (title.includes('benefits') || description.includes('benefit')) {
            return 'Testing Benefits';
        } else if (title.includes('team') || description.includes('who')) {
            return 'Team Responsibilities';
        } else if (title.includes('inclusion') || description.includes('consequences')) {
            return 'Testing Strategy';
        } else {
            return 'General Testing Concepts';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Sanity Testing Concepts': 'Strengthen understanding of sanity testing as a subset of regression testing focused on specific code changes and critical bug fixes.',
            'Smoke Testing Concepts': 'Improve knowledge of smoke testing as a preliminary verification of critical functionality before proceeding with further testing.',
            'Test Execution Timing': 'Focus on the correct timing and sequence of sanity and smoke testing within the software development lifecycle.',
            'Testing Process': 'Develop a better understanding of the processes to follow when tests fail, particularly for critical functionality.',
            'Testing Characteristics': 'Enhance knowledge of the key characteristics that distinguish effective sanity and smoke tests.',
            'Testing Risks': 'Improve awareness of the limitations and potential risks associated with sanity and smoke testing approaches.',
            'Testing Benefits': 'Strengthen understanding of how sanity and smoke testing contribute to the overall software development process.',
            'Team Responsibilities': 'Clarify the distinct roles and responsibilities of development and QA teams in sanity and smoke testing.',
            'Testing Strategy': 'Focus on strategic implementation of sanity and smoke testing to maximize their effectiveness in the testing process.',
            'General Testing Concepts': 'Continue developing fundamental understanding of sanity and smoke testing principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core sanity and smoke testing principles.';
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

        // Add sanity-smoke specific variations
        if (quizName.toLowerCase().includes('sanity-smoke')) {
            variations.push(
                'Sanity-Smoke',
                'sanity-smoke',
                'sanitySmokeTest',
                'Sanity_Smoke',
                'sanity_smoke'
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
    console.log('[SanitySmokeQuiz] Initializing quiz');
    
    // Force clean any existing quiz references that might be in memory
    if (window.currentQuiz) {
        console.log('[SanitySmokeQuiz] Cleaning up existing quiz instance:', window.currentQuiz.quizName);
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
                console.log(`[SanitySmokeQuiz] Found potential conflicting quiz data: ${quizName}`);
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.data && parsed.data.randomizedScenarios) {
                        console.log(`[SanitySmokeQuiz] Cleaning randomized scenarios from ${quizName}`);
                        delete parsed.data.randomizedScenarios;
                        localStorage.setItem(key, JSON.stringify(parsed));
                    }
                } catch (e) {
                    console.error(`[SanitySmokeQuiz] Error cleaning scenarios:`, e);
                }
            }
        });
    }
    
    // Create a new instance and keep a global reference
    const quiz = new SanitySmokeQuiz();
    window.currentQuiz = quiz;
    
    // Add a specific property to identify this quiz
    Object.defineProperty(window, 'ACTIVE_QUIZ_NAME', {
        value: 'sanity-smoke',
        writable: true,
        configurable: true
    });
    
    // Force clear any unrelated randomized scenarios
    if (quiz.randomizedScenarios) {
        // Keep only keys specific to this quiz
        Object.keys(quiz.randomizedScenarios).forEach(key => {
            if (!key.startsWith('sanity-smoke_')) {
                console.log(`[SanitySmokeQuiz] Removing unrelated randomized scenario: ${key}`);
                delete quiz.randomizedScenarios[key];
            }
        });
    }
    
    // Start the quiz
    console.log('[SanitySmokeQuiz] Starting quiz');
    quiz.startGame();
}); 