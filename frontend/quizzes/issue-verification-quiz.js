import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class IssueVerificationQuiz extends BaseQuiz {
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
                { threshold: 90, message: '🏆 Outstanding! You\'re an issue verification expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong verification skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing issue verification best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name as a non-configurable, non-writable property
        Object.defineProperty(this, 'quizName', {
            value: 'issue-verification',
            writable: false,
            configurable: false,
            enumerable: true
        });
        
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
                title: 'Verification Priority',
                description: 'You have limited time for issue verification. How do you prioritize tickets?',
                options: [
                    {
                        text: 'Start with highest priority and severity issues, ensuring critical fixes are verified first',
                        outcome: 'Perfect! This ensures most important issues are verified.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Prioritization'
                    },
                    {
                        text: 'Verify tickets in chronological order to address the most current issues first',
                        outcome: 'Priority and severity should guide verification order.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Start with easiest tickets to gain the most coverage of open tickets',
                        outcome: 'Critical issues need verification first.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Verify issues based on your familiarity with specific tickets',
                        outcome: 'Structured prioritisation is required to address the most critical issues first.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Environment Matching',
                description: 'You need to verify a device-specific issue. What\'s the correct approach?',
                options: [
                    {
                        text: 'Verify on the original environment where possible, or clearly document any environment differences',
                        outcome: 'Excellent! This maintains testing consistency.',
                        experience: 15,
                        tool: 'Environment Management'
                    },
                    {
                        text: 'Test on any available device to verify the issue has been resolved',
                        outcome: 'The original environment should be prioritised as this is where the issue was raised and has been addressed.',
                        experience: -10
                    },
                    {
                        text: 'Verify on an older device before moving onto the specified device',
                        outcome: 'Device-specific issues require verification as users will operate many different devices.',
                        experience: -5
                    },
                    {
                        text: 'This can be marked as verified without testing as long as functionality on the primary environment behaves as intended',
                        outcome: 'Verification is required on specific devices the issue was raised on.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Verification Comments',
                description: 'How should you document your verification findings?',
                options: [
                    {
                        text: 'Use template format with status, date, observations, version, environments, and evidence',
                        outcome: 'Perfect! This provides comprehensive verification documentation.',
                        experience: 15,
                        tool: 'Documentation'
                    },
                    {
                        text: 'Update the ticket status, as this ensures proper traceability of the issue',
                        outcome: 'More details are required for traceability.',
                        experience: -10
                    },
                    {
                        text: 'Update the ticket by stating "fixed" or "not fixed" as further details are not required',
                        outcome: 'More detailed documentation is required for developer and stakeholder information.',
                        experience: -5
                    },
                    {
                        text: 'Add screenshots as visual representation of issues is vital for developers to debug issues',
                        outcome: 'Written documentation is also required to accompany evidence.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Evidence Capture',
                description: 'What\'s the best practice for capturing verification evidence?',
                options: [
                    {
                        text: 'Use appropriate tools, highlight issues clearly, repeat demonstrations in videos',
                        outcome: 'Excellent! This provides clear verification evidence.',
                        experience: 15,
                        tool: 'Evidence Capture'
                    },
                    {
                        text: 'Included screenshots don\'t need labelling as attachment should provide enough detail',
                        outcome: 'Any submitted evidence requires clear highlighting.',
                        experience: -10
                    },
                    {
                        text: 'Evidence capture is generally not needed as steps and description should provide enough detail',
                        outcome: 'Visual evidence is essential for verification.',
                        experience: -5
                    },
                    {
                        text: 'A video capture in low resolution should be sufficient evidence',
                        outcome: 'While a video capture is good evidence, the resolution should be up to a legible standard.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Status Updates',
                description: 'An issue is partially fixed. How do you update its status?',
                options: [
                    {
                        text: 'Mark as partially fixed with a detailed explanation of the remaining issues',
                        outcome: 'Perfect! This accurately reflects partial fixes.',
                        experience: 15,
                        tool: 'Status Management'
                    },
                    {
                        text: 'Change the status to fixed, adding a note to re-open once fully fixed',
                        outcome: 'Partial fixes should not be closed unless instructed by the client.',
                        experience: -10
                    },
                    {
                        text: 'Update the status to not fixed without adding a comment, as the status itself indicates the ticket requires a revisit',
                        outcome: 'Partial fix tickets require a partial fix status with full details included.',
                        experience: -5
                    },
                    {
                        text: 'Keep the status unchanged, as the open ticket reflects the current situation',
                        outcome: 'This type of ticket requires the correct status update with the relevant verification details.',
                        experience: 0
                    }
                ]
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Issue Status',
                description: 'What term describes an issue that shows some improvements but still has unresolved aspects?',
                options: [
                    {
                        text: 'Partially Fixed',
                        outcome: 'Correct! This is an issue that has been noted as partly showing expected behaviour or improvements, but part of the issue remains unresolved.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Issue Status'
                    },
                    {
                        text: 'Won\'t Fix',
                        outcome: 'Won\'t Fix means the client has decided not to address the issue.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Not Reproducible',
                        outcome: 'Not Reproducible means the issue cannot be recreated during testing.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Out of Scope',
                        outcome: 'Out of Scope indicates the issue is beyond the project requirements.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Issue Verification & Additional Testing',
                description: 'What is a crucial component of issue verification that should be performed alongside retesting specific issues?',
                options: [
                    {
                        text: 'Creating detailed test cases for future test cycles',
                        outcome: 'Creating test cases is part of planning activities and not generally part of issue verification',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Interviewing developers about their implementation methods',
                        outcome: 'Whilst comments can be added to tickets about findings and queries. Interviewing developers is not part of issue verification.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Regression testing in areas where fixes have been made',
                        outcome: 'Correct! It is critical you ensure time for regression testing to identify new issues that may have been introduced as a result of fixes.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Issue Verification & Additional Testing'
                    },
                    {
                        text: 'Redesigning the user interface to prevent future issues',
                        outcome: 'User Interface redesign is not part of the tester\'s responsibility during issue verification',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Issue Verification Characteristics',
                description: 'What is a key characteristic of issue verification compared to exploratory testing?',
                options: [
                    {
                        text: 'Issue verification requires less attention to detail than exploratory testing',
                        outcome: 'Issue verification requires being Observant, Detail oriented and aware of change, so it doesn\'t require less attention to detail.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Issue verification is always performed by a different tester than the original test execution',
                        outcome: 'The same tester that performed the original test execution on the system can perform the regression tests as well as different testers.', 
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Issue verification focuses more on reporting than on detailing destructive test methods',
                        outcome: 'Correct! The reporting process differs from, exploratory testing which is focused on detailing destructive/edge case methods and reporting the issues found. Instead, it is centred around verifying and building a picture of product quality.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Issue Verification Characteristics'
                    },
                    {
                        text: 'Issue verification allows for more creative test approaches than exploratory testing',
                        outcome: 'Issue verification generally relies on following a set of steps for each ticket raised rather than a more creative approach that exploratory testing employs.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Issue Verification Terms',
                description: 'What does the term "Global" mean in the context of issue verification?',
                options: [
                    {
                        text: 'The issue is present on all environments and all operating systems based on tested samples',
                        outcome: 'Correct! Stating global is making a calculated assumption based on observations that the issue is present on all environments and all operating systems.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Issue Verification Terms'
                    },
                    {
                        text: 'The issue affects all users in all countries worldwide',
                        outcome: 'While this might seem logical, global is defined in terms of environments and operating systems, not geographic regions.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'The issue requires approval from global management.',
                        outcome: 'This is incorrect, and management should not be involved in ticket raising criteria.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'The issue can only be verified by international teams.',
                        outcome: 'This is incorrect as global issues should require the testers experience and knowledge',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Unresolved Issues',
                description: 'What should a tester do if they discover that clients have not addressed issues in time for the issue verification session?',
                options: [
                    {
                        text: 'Identify unresolved issues as lower priority for retesting',
                        outcome: 'Correct! Where possible, confirm with the project manager which & how many issues the client has been able to work on ahead of the issue verification session. If there are known unresolved issues, identify them as lower priority for retest.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Unresolved Issues'
                    },
                    {
                        text: 'Cancel the session and reschedule for a later date',
                        outcome: 'This should not be the process. Any unresolved issues should be identified as low priority for re-test.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Test only the fixed issues and ignore all others',
                        outcome: 'Prioritising of all issues should be the process, rather than ignoring any tickets that have any other status.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Automatically mark all untested issues as \'Not Fixed\'',
                        outcome: 'Automatically marking issues as Not Fixed without testing would be inaccurate and contradicts the purpose of verification.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Regression Testing',
                description: 'After verifying fixes, how do you approach regression testing?',
                options: [
                    {
                        text: 'Focus on areas where fixes were implemented, while also checking surrounding functionality',
                        outcome: 'Perfect! This ensures thorough regression coverage.',
                        experience: 20,
                        tool: 'Regression Testing'
                    },
                    {
                        text: 'Check all of the fixed issues as confirmed by the client',
                        outcome: 'Regression testing should cover areas that have been recently modified. This may include new features or bug fixes.',
                        experience: -15
                    },
                    {
                        text: 'Stick to minimal regression testing as previous issues have been fixed and tested during the current release',
                        outcome: 'Regression testing reduces the risk of introducing new bugs into the system, which can be costly and time-consuming to fix later.',
                        experience: -10
                    },
                    {
                        text: 'Focus regression testing on tester preference using experience gained during initial testing',
                        outcome: 'Regression tests should focus on high risk areas, recent changes and core functionality.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Time Management',
                description: 'How do you manage time during a verification session?',
                options: [
                    {
                        text: 'Set goals for ticket verification numbers and allocate specific time for regression',
                        outcome: 'Excellent! This ensures balanced coverage.',
                        experience: 20,
                        tool: 'Time Management'
                    },
                    {
                        text: 'Work through verification of all tickets to completion',
                        outcome: 'Time needs to be allocated for both issue verification and regression testing on a priority basis.',
                        experience: -15
                    },
                    {
                        text: 'Focus time management on regression testing',
                        outcome: 'Issue verification requires time allocation for both ticket verification and regression testing.',
                        experience: -10
                    },
                    {
                        text: 'Focus time management and planning on issue verification',
                        outcome: 'Issue verification requires time allocation for both ticket verification and regression testing.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'New Issues Discovery',
                description: 'You find new issues during verification. How do you handle them?',
                options: [
                    {
                        text: 'Raise new tickets and note if they\'re related to recent fixes',
                        outcome: 'Perfect! This tracks new issues properly.',
                        experience: 20,
                        tool: 'Issue Management'
                    },
                    {
                        text: 'Add any new issues to existing tickets within the project',
                        outcome: 'Any new issues found require separate tickets.',
                        experience: -15
                    },
                    {
                        text: 'Leave new issues for a further round of testing as issue verification should focus on current tickets',
                        outcome: 'All issues require documentation as and when they are found.',
                        experience: -10
                    },
                    {
                        text: 'Raise any new issue found during issue verification in the report summary',
                        outcome: 'While new issue can be stated in a report summary, they also require tickets to be raised.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Device Availability',
                description: 'An original test device isn\'t available. How do you proceed?',
                options: [
                    {
                        text: 'Contact the device owner early, check device lists and consider BrowserStack with PM approval',
                        outcome: 'Excellent! This shows correct device management.',
                        experience: 20,
                        tool: 'Resource Management'
                    },
                    {
                        text: 'Test on any available device to verify the issue has been resolved',
                        outcome: 'The original environment should be prioritised, even if this is tested on BrowserStack as this is where the issue was raised and has been addressed.',
                        experience: -15
                    },
                    {
                        text: 'Test on a similar device and document test outcome',
                        outcome: 'Using a different device for verification should be confirmed by the project manager and all environment differences require documentation.',
                        experience: -10
                    },
                    {
                        text: 'Mark the ticket as cannot test due to lack of device resources',
                        outcome: 'Alternative testing options must be explored including a similar device and BrowserStack.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Client Communication',
                description: 'The client hasn\'t updated ticket statuses. How do you proceed?',
                options: [
                    {
                        text: 'Contact the Project Manager to confirm which issues have been worked on and prioritise known fixed issues',
                        outcome: 'Perfect! This ensures efficient verification.',
                        experience: 20,
                        tool: 'Communication'
                    },
                    {
                        text: 'Test all tickets that have previously been raised within the project',
                        outcome: 'Prioritisation is required as some tickets may not have been worked on by the client.',
                        experience: -15
                    },
                    {
                        text: 'Continue with issue verification whilst awaiting updates to tickets from the client',
                        outcome: 'Proactive communication with the Project Manager and client is required in this instance as they may not intend to work on specific tickets.',
                        experience: -10
                    },
                    {
                        text: 'Leave the tickets that don\'t have any status update and include the information in the summary report.',
                        outcome: 'It is best practice to confirm with the client which that has tickets are intended for verification.',
                        experience: 0
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Complex Issue Verification',
                description: 'A complex issue involves multiple interconnected features. How do you verify it?',
                options: [
                    {
                        text: 'Test all connected features, document dependencies, verify full workflow',
                        outcome: 'Perfect! This ensures thorough verification.',
                        experience: 25,
                        tool: 'Complex Testing'
                    },
                    {
                        text: 'Test the main feature and document the outcome',
                        outcome: 'All connected features require verification and regression testing.',
                        experience: -15
                    },
                    {
                        text: 'Test the features that are connected to the main feature as this ensures all issues have been addressed',
                        outcome: 'Complex issues need thorough testing and all affected features require attention.',
                        experience: -10
                    },
                    {
                        text: 'Test the specific issues that have been addressed by the client without the full feature workflow',
                        outcome: 'All issues require verification as well as the full workflow of interconnected features.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Multiple Environment Issues',
                description: 'An issue affects multiple environments differently. How do you verify it?',
                options: [
                    {
                        text: 'Test each environment, document specific behaviours, note any variations',
                        outcome: 'Excellent! This provides complete environment coverage.',
                        experience: 25,
                        tool: 'Environment Testing'
                    },
                    {
                        text: 'Test any of the affected environments to verify the issue has been addressed by the client',
                        outcome: 'All affected environments require testing as behaviour has been stated as environment specific.',
                        experience: -15
                    },
                    {
                        text: 'Test the majority of environments, ascertain an average outcome and document results',
                        outcome: 'All stated environment variations are required for verification.',
                        experience: -10
                    },
                    {
                        text: 'Test all stated environments and document the outcome of the primary device',
                        outcome: 'Environment differences require full documentation for traceability.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Regression Impact Analysis',
                description: 'Multiple fixes have been implemented. How do you assess regression impact?',
                options: [
                    {
                        text: 'Research fix relationships, test impacted areas, document any cascading effects',
                        outcome: 'Perfect! This ensures comprehensive regression analysis.',
                        experience: 25,
                        tool: 'Impact Analysis'
                    },
                    {
                        text: 'Verify any client stated fixes specifically',
                        outcome: 'Potential related impacts from specific bug fixes also require assessment.',
                        experience: -15
                    },
                    {
                        text: 'Use a basic regression process to ascertain focus feature fixes',
                        outcome: 'Thorough impact analysis is required for regression testing to explore any other areas that might be affected by a specific bug fix.',
                        experience: -10
                    },
                    {
                        text: 'Impact analysis can be left until all specific fixes have been verified',
                        outcome: 'Fix impacts require assessment systematically throughout verification as blocking issues could be direct impact of a current fix.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Verification Report Creation',
                description: 'How do you create a comprehensive verification report?',
                options: [
                    {
                        text: 'Document verified issues, regression findings, new issues, and quality assessment',
                        outcome: 'Excellent! This provides complete verification coverage.',
                        experience: 25,
                        tool: 'Reporting'
                    },
                    {
                        text: 'List all issues fixed by the client within the application release',
                        outcome: 'All aspects need reporting not just fixed issues.',
                        experience: -15
                    },
                    {
                        text: 'Document a basic status update of each existing issue within the release',
                        outcome: 'Comprehensive reporting needed is required including new issues and regression details.',
                        experience: -10
                    },
                    {
                        text: 'Document all details surrounding regression testing of the new release',
                        outcome: 'Verification needs full documentation not just regression test reporting.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Quality Assessment',
                description: 'How do you assess if additional testing is needed after verification?',
                options: [
                    {
                        text: 'Analyse fix impact, regression findings, and new issues to recommend next steps',
                        outcome: 'Perfect! This provides informed testing recommendations.',
                        experience: 25,
                        tool: 'Quality Assessment'
                    },
                    {
                        text: 'Check that all open issues within the release have been fixed',
                        outcome: 'Other factors also need to be taken into consideration like regression findings and new issues raised.',
                        experience: -15
                    },
                    {
                        text: 'Rely on client feedback so they can make a decision on additional testing',
                        outcome: 'Proactive assessment required and additional testing can be judged on regression findings and new issues raised.',
                        experience: -10
                    },
                    {
                        text: 'Await feedback from the project manager on issue verification findings to decide on additional testing',
                        outcome: 'Quality assessment is crucial and initiative should be taken on additional testing as well as informing the project manager of the outcome.',
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

        const scorePercentage = this.calculateScorePercentage();
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            const isCorrect = record.isCorrect;

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

        if (scorePercentage >= 90 && weakAreas.length === 0) {
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of issue verification. You clearly understand the nuances of issue verification and are well-equipped to handle any issue verification challenges!</p>';
        } else if (scorePercentage >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your issue verification skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('priority') || description.includes('prioritize')) {
            return 'Verification Prioritization';
        } else if (title.includes('environment') || description.includes('environment')) {
            return 'Environment Management';
        } else if (title.includes('regression') || description.includes('regression')) {
            return 'Regression Testing';
        } else if (title.includes('new issue') || description.includes('new issue')) {
            return 'Issue Discovery';
        } else if (title.includes('complex') || description.includes('complex')) {
            return 'Complex Issue Handling';
        } else if (title.includes('quality') || description.includes('quality')) {
            return 'Quality Assessment';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Verification Documentation';
        } else {
            return 'General Verification Process';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Verification Prioritization': 'Focus on improving issue prioritization based on severity, impact, and business value.',
            'Environment Management': 'Strengthen environment matching and documentation of testing conditions.',
            'Regression Testing': 'Enhance regression testing strategies around verified fixes and impacted areas.',
            'Issue Discovery': 'Improve handling and documentation of new issues found during verification.',
            'Complex Issue Handling': 'Develop better approaches for verifying interconnected features and dependencies.',
            'Quality Assessment': 'Work on comprehensive quality evaluation and next steps recommendations.',
            'Verification Documentation': 'Focus on clear, detailed documentation of verification steps and results.',
            'General Verification Process': 'Continue developing fundamental verification principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core issue verification principles.';
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

        // Add issue-verification specific variations
        if (quizName.toLowerCase().includes('issue-verification')) {
            variations.push(
                'Issue-Verification',
                'issue-verification',
                'issueVerificationTest',
                'Issue_Verification',
                'issue_verification'
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
    console.log('[Issue-Verification-Quiz] Initializing quiz');
    
    // Force clean any existing quiz references that might be in memory
    if (window.currentQuiz) {
        console.log('[Issue-Verification-Quiz] Cleaning up existing quiz instance:', window.currentQuiz.quizName);
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
                console.log(`[Issue-Verification-Quiz] Found potential conflicting quiz data: ${quizName}`);
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.data && parsed.data.randomizedScenarios) {
                        console.log(`[Issue-Verification-Quiz] Cleaning randomized scenarios from ${quizName}`);
                        delete parsed.data.randomizedScenarios;
                        localStorage.setItem(key, JSON.stringify(parsed));
                    }
                } catch (e) {
                    console.error(`[Issue-Verification-Quiz] Error cleaning scenarios:`, e);
                }
            }
        });
    }
    
    // Create a new instance and keep a global reference
    const quiz = new IssueVerificationQuiz();
    window.currentQuiz = quiz;
    
    // Add a specific property to identify this quiz
    Object.defineProperty(window, 'ACTIVE_QUIZ_NAME', {
        value: 'issue-verification',
        writable: true,
        configurable: true
    });
    
    // Force clear any unrelated randomized scenarios
    if (quiz.randomizedScenarios) {
        // Keep only keys specific to this quiz
        Object.keys(quiz.randomizedScenarios).forEach(key => {
            if (!key.startsWith('issue-verification_')) {
                console.log(`[Issue-Verification-Quiz] Removing unrelated randomized scenario: ${key}`);
                delete quiz.randomizedScenarios[key];
            }
        });
    }
    
    // Start the quiz
    console.log('[Issue-Verification-Quiz] Starting quiz');
    quiz.startGame();
}); 