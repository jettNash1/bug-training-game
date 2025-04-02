import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class IssueVerificationQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re an issue verification expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong verification skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
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
                        tool: 'Prioritization'
                    },
                    {
                        text: 'Verify tickets in chronological order to address the most current issues first',
                        outcome: 'Priority and severity should guide verification order.',
                        experience: -10
                    },
                    {
                        text: 'Start with easiest tickets to gain the most coverage of open tickets',
                        outcome: 'Critical issues need verification first.',
                        experience: -5
                    },
                    {
                        text: 'Verify issues based on your familiarity with specific tickets',
                        outcome: 'Structured prioritisation is required to address the most critical issues first.',
                        experience: 0
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
            const progressPercentage = (totalAnswered / (this.totalQuestions || 15)) * 100;
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of issue verification. You clearly understand the nuances of issue verification and are well-equipped to handle any issue verification challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your issue verification skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

// Add DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new IssueVerificationQuiz();
    quiz.startGame();
}); 
