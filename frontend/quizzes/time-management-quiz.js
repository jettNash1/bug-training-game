import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class TimeManagementQuiz extends BaseQuiz {
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
                { threshold: 90, message: '🏆 Outstanding! You\'re a time management expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong time management skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing time management best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'time-management',
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
                title: 'Weekly Planning',
                description: 'What\'s the first step in planning your week ahead effectively?',
                options: [
                    {
                        text: 'Review your calendar for meetings and prepare for any necessary preparation and wrap-up activities',
                        outcome: 'Perfect! Starting with a calendar review helps structure your week.',
                        experience: 15,
                        tool: 'Calendar Management'
                    },
                    {
                        text: 'Start working on the first task presented to you within an assigned project',
                        outcome: 'Planning ahead and prioritising is more effective than reactive working.',
                        experience: -5
                    },
                    {
                        text: 'Wait for daily assignments to be communicated by project managers',
                        outcome: 'Proactive planning is better than waiting for instructions.',
                        experience: -10
                    },
                    {
                        text: 'Focus on immediate tasks for the days testing activities',
                        outcome: 'Looking ahead helps prevent future bottlenecks within projects.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Workspace Organisation',
                description: 'How should you prepare your workspace for efficient testing?',
                options: [
                    {
                        text: 'Clean workspace, organised email inbox, pinned relevant channels, and charged devices',
                        outcome: 'Excellent! An organised workspace increases efficiency.',
                        experience: 15,
                        tool: 'Workspace Management'
                    },
                    {
                        text: 'Keep all channels and tabs open to make sure of quick communication and easy access to everything you need',
                        outcome: 'Too many open items can cause confusion and slow you down.',
                        experience: -5
                    },
                    {
                        text: 'Start working straight away with open tabs in relation to previous projects for continuity',
                        outcome: 'Current project reparation prevents delays and increases productivity.',
                        experience: -10
                    },
                    {
                        text: 'Focus on device setup as to not encounter delays with uncharged devices',
                        outcome: 'Complete workspace organisation is more important to mitigate reduction in time management of projects.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Project Documentation Review',
                description: 'When should you review project documentation for a new assignment?',
                options: [
                    {
                        text: 'This should be done before the first session, using unsold time if needed',
                        outcome: 'Perfect! Early preparation ensures efficient testing.',
                        experience: 15,
                        tool: 'Documentation Review'
                    },
                    {
                        text: 'During the first test session to work in parallel with test execution',
                        outcome: 'Project review should ideally be done before testing begins to mitigate time constraint issues.',
                        experience: -5
                    },
                    {
                        text: 'This should be done on an individual basis when issues arise',
                        outcome: 'Proactive review can prevent project issues and save time.',
                        experience: -10
                    },
                    {
                        text: 'After the first standup meeting as initial stand ups should take minimal time',
                        outcome: 'Documentation should be reviewed before meetings and any related issues raised then.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Daily Preparation',
                description: 'What\'s the most important first step in preparing for your day?',
                options: [
                    {
                        text: 'Check the resource sheet and review any project changes',
                        outcome: 'Excellent! Resource updates are crucial for daily planning.',
                        experience: 15,
                        tool: 'Resource Management'
                    },
                    {
                        text: 'Start testing immediately to make sure project time lines are kept on track',
                        outcome: 'Checking resources first prevents misdirected effort.',
                        experience: -10
                    },
                    {
                        text: 'Wait for team instructions from project managers',
                        outcome: 'Proactive preparation is preferred to waiting for instruction as project managers may be under resourced.',
                        experience: -5
                    },
                    {
                        text: 'Review yesterday\'s work to make sure documenting is correctly followed',
                        outcome: 'Current resource status for the project and scope updates are most important when considering the forthcoming day.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Meeting Management',
                description: 'How should you handle meetings in your schedule?',
                options: [
                    {
                        text: 'Factor in preparation and wrap-up time, not just meeting duration',
                        outcome: 'Perfect! Complete meeting time management includes preparation.',
                        experience: 15,
                        tool: 'Meeting Planning'
                    },
                    {
                        text: 'Schedule back-to-back meetings to keep in the same mindset',
                        outcome: 'Buffer time between meetings is required for mop up and planning. This ensures the best effectiveness to reach meeting goals.',
                        experience: -10
                    },
                    {
                        text: 'Finish current activities and join at the exact start time of the meeting',
                        outcome: 'Preparation time is required as it ensures more productive meetings.',
                        experience: -5
                    },
                    {
                        text: 'Focus only on meeting duration when planning schedules',
                        outcome: 'Considering full meeting impact on schedule and meeting content is essential for productivity.',
                        experience: 0
                    }
                ]
            },
            // Additional Basic Scenarios from Guide - Time Management & Organisation Additional Questions
            {
                id: 16,
                level: 'Basic',
                title: 'Effective Time Management',
                description: 'Why is effective time management important for Zoonou testers?',
                options: [
                    {
                        text: 'As functional testing is sold in blocks of time and clients should get maximum value',
                        outcome: 'Correct! As testers, it is important that you manage your time effectively. This ensures our clients get the most value out of the time they have procured from us.',
                        experience: 15,
                        tool: 'Effective Time Management'
                    },
                    {
                        text: 'To ensure personal career advancement opportunities',
                        outcome: 'While good time management might help with career advancement, this isn\'t a reason in relation to project work and management.',
                        experience: -5
                    },
                    {
                        text: 'To maximize paid overtime opportunities',
                        outcome: 'This isn\'t a project goal like completing work efficiently within allocated time.',
                        experience: -10
                    },
                    {
                        text: 'To reduce the need for detailed documentation',
                        outcome: 'Time management doesn\'t reduce documentation needs, in fact, proper documentation is implied to be part of delivering quality work.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Ineffective Time Management',
                description: 'Which of the following is identified as a risk of ineffective time management?',
                options: [
                    {
                        text: 'Spending too much time on detailed documentation',
                        outcome: 'Detailed documentation is not identified as a risk.',
                        experience: -5
                    },
                    {
                        text: 'Being overly thorough in testing low-priority areas',
                        outcome: 'While this might be an issue, it\'s not specifically identified as a risk of poor time management.',
                        experience: -10
                    },
                    {
                        text: 'Having colleagues need to cover your outstanding tasks, leading to frustration',
                        outcome: 'Correct! Your colleagues may be required to cover your outstanding tasks, which could lead to frustration or resentment within the team.',
                        experience: 15,
                        tool: 'Ineffective Time Management'
                    },
                    {
                        text: 'Discovering too many bugs which delays project completion',
                        outcome: 'Discovering bugs is the purpose of testing, finding too many bugs is not a risk of poor time management.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Environment Time Management',
                description: 'What is recommend regarding testing environments and user journeys?',
                options: [
                    {
                        text: 'All environments should receive equal testing time regardless of user behaviour.',
                        outcome: 'Prioritising testing based on user behaviour and client priorities, not equal distribution is recommended.',
                        experience: -5
                    },
                    {
                        text: 'Always test desktop environments first, then mobile environments',
                        outcome: 'Prioritisation should be based on how end users will access the software.', 
                        experience: -10
                    },
                    {
                        text: 'Prioritise environments and journeys based on how end users will access the software',
                        outcome: 'Correct! for example, if a website is designed for use on tablet devices, prioritise tablet coverage, as issues found here will be of a higher value to the client.',
                        experience: 15,
                        tool: 'Environment Time Management'
                    },
                    {
                        text: 'Follow the script order exactly as written regardless of priorities',
                        outcome: 'Working in a linear fashion from top to bottom of a script or software is usually not the most appropriate approach and prioritising according to project requirements should be followed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Project Time Assessment',
                description: 'How should testers reassess timings during a test session?',
                options: [
                    {
                        text: 'Project timings should be assessed throughout the day based on progress and remaining coverage',
                        outcome: 'Correct! It is important to re-assess timings throughout the day based on progress, and keep in mind what is left to cover.',
                        experience: 15,
                        tool: 'Project Time Assessment'
                    },
                    {
                        text: 'Project time assessment should be carried out at the end of the day to avoid disrupting workflow',
                        outcome: 'Waiting until the end of the day to re-assess doesn\'t give any time to check if coverage can be met.',
                        experience: -10
                    },
                    {
                        text: 'Project time assessment should be carried out only when explicitly requested by the Project Manager',
                        outcome: 'Testers should proactively reassess timings and inform project managers in case extra resources are required.',
                        experience: -5
                    },
                    {
                        text: 'Project time assessment should be carried out according to predetermined intervals set at the beginning of the project',
                        outcome: 'While this could be true for specific projects. Testers should also apply continuous assessment based on actual progress.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Time Management Benefit',
                description: 'What is a benefit of good project time management?',
                options: [
                    {
                        text: 'Higher levels of productivity are a benefit of good time management',
                        outcome: 'Correct! Productivity levels have proven to increase when good time management of projects are applied.',
                        experience: 15,
                        tool: 'Time Management Benefit'
                    },
                    {
                        text: 'A benefit of good time management increases the ability to multitask on multiple projects simultaneously',
                        outcome: 'While this may be helpful in some cases. In general it is recommended to work on one project at a time.',
                        experience: -10
                    },
                    {
                        text: 'A benefit of good time management results in a reduced need for project documentation',
                        outcome: 'Project documentation should always be complete and full. This should be factored into the project itself.',
                        experience: -5
                    },
                    {
                        text: 'A benefit of good time management results in guaranteed salary increases',
                        outcome: 'Good project time management should always be observed and not a direct factor in salary increase.',
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
                title: 'Project Timing Estimation',
                description: 'How do you determine appropriate time allocation for test activities?',
                options: [
                    {
                        text: 'Review Statement Of Work timings, environment count, software size, and core user journeys',
                        outcome: 'Excellent! A comprehensive review ensures accurate timing.',
                        experience: 20,
                        tool: 'Time Estimation'
                    },
                    {
                        text: 'Use a standard default timing for all projects that require test activities',
                        outcome: 'Each project needs their own specific custom time estimation relating to their needs.',
                        experience: -15
                    },
                    {
                        text: 'Base estimates on previous similar projects that have been worked on',
                        outcome: 'Current project specifics always need to be taken into consideration.',
                        experience: -10
                    },
                    {
                        text: 'Leave out a scope review when estimating the project timings',
                        outcome: 'Scope review is crucial for timing as it takes into consideration what needs to be tested.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Team Workload Distribution',
                description: 'How do you divide test tasks among team members?',
                options: [
                    {
                        text: 'Consider experience levels, individual paces, and project familiarity',
                        outcome: 'Perfect! Fair distribution considers individual capabilities.',
                        experience: 20,
                        tool: 'Workload Management'
                    },
                    {
                        text: 'Divide tasks equally between the team by number',
                        outcome: 'Task division should consider experience levels as some testers may not be familiar with a certain task.',
                        experience: -15
                    },
                    {
                        text: 'Assign tasks equally taking into consideration fairness of workload',
                        outcome: 'Strategic assignment taking into consideration tester experience ensures efficient testing.',
                        experience: -10
                    },
                    {
                        text: 'Let team members choose which tasks they want to fulfil within the project',
                        outcome: 'A structured distribution is generally required for the best testing coverage.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Test Coverage Priorisation',
                description: 'How do you prioritise different areas of testing?',
                options: [
                    {
                        text: 'Analyse client priorities, core functions, and user patterns',
                        outcome: 'Excellent! Strategic prioritisation maximizes testing value.',
                        experience: 20,
                        tool: 'Priority Management'
                    },
                    {
                        text: 'Test in a linear order to gain as much coverage as possible',
                        outcome: 'Priority-based testing is a more effective use of time management as issues could be missed by testing in a sequential manner.',
                        experience: -15
                    },
                    {
                        text: 'Focus on easy areas first to gain as much coverage as possible',
                        outcome: 'Prioritisation should be based on importance to the system and client, rather than ease first.',
                        experience: -10
                    },
                    {
                        text: 'Follow personal preferences based on experience of previous similar test cases',
                        outcome: 'Client needs should drive priorities rather than individual preferences.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Progress Monitoring',
                description: 'How do you track testing progress throughout the day?',
                options: [
                    {
                        text: 'Regularly assess coverage, adjust timings, and communicate any concerns',
                        outcome: 'Perfect! Active monitoring enables timely adjustments.',
                        experience: 20,
                        tool: 'Progress Tracking'
                    },
                    {
                        text: 'Wait until end of day before reporting on any progress',
                        outcome: 'Regular progress checks can prevent delays to testing timelines.',
                        experience: -15
                    },
                    {
                        text: 'Only track project progress on request and report findings when asked',
                        outcome: 'Proactive monitoring is essential as it can ensure issues to resource or testing can be mitigated.',
                        experience: -10
                    },
                    {
                        text: 'Focus on speed over progress tracking to make sure project timelines are met',
                        outcome: 'Speed of test activities should be balanced with progress monitoring.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Environment Testing Order',
                description: 'How do you manage time across multiple test environments?',
                options: [
                    {
                        text: 'Start with primary environment, then adjust timing for others based on global issues',
                        outcome: 'Excellent! This is an efficient environment coverage strategy.',
                        experience: 20,
                        tool: 'Environment Management'
                    },
                    {
                        text: 'Test all environments equally in regards to time spent on testing activities',
                        outcome: 'Timings should be adapted based on previous findings within the project.',
                        experience: -15
                    },
                    {
                        text: 'Use random environment order approach to gain as much coverage as possible',
                        outcome: 'A strategic order approach maximizes efficiency and coverage.',
                        experience: -10
                    },
                    {
                        text: 'Leave secondary environments as long as primary environments are covered',
                        outcome: 'All requested environments need appropriate coverage according to the project needs.',
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
                title: 'Multiple Project Management',
                description: 'How do you manage time when working on multiple projects in a week?',
                options: [
                    {
                        text: 'Review all project requirements, create daily schedules, maintain clear separation',
                        outcome: 'Perfect! This is a good structured approach to multiple projects.',
                        experience: 25,
                        tool: 'Multi-Project Management'
                    },
                    {
                        text: 'Handle projects as and when they are requested',
                        outcome: 'Advance planning is preferred for multiple projects to prepare time management and resources.',
                        experience: -15
                    },
                    {
                        text: 'Focus on one project at a time until completion',
                        outcome: 'Balance is needed across all projects and priority tests.',
                        experience: -10
                    },
                    {
                        text: 'Multitask between projects simultaneously to make sure project timelines can be met',
                        outcome: 'Clear project separation is more effective.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Risk Management',
                description: 'How do you handle potential timing risks in a project?',
                options: [
                    {
                        text: 'Identify risks early, implement mitigation steps, communicate with the project manager',
                        outcome: 'Excellent! Proactive risk management saves time.',
                        experience: 25,
                        tool: 'Risk Management'
                    },
                    {
                        text: 'Deal with time risks as they arise during test activities',
                        outcome: 'Early risk identification and planning prevents delays further along in the testing process.',
                        experience: -15
                    },
                    {
                        text: 'Leave investigation of minor risks to project timings',
                        outcome: 'All risks need appropriate attention, reporting and mitigating.',
                        experience: -10
                    },
                    {
                        text: 'Handle timing risks to the project without reporting them',
                        outcome: 'Risk communication is an important and essential process to mitigate any issues that might cause project slow down.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Late Stage Issues',
                description: 'You discover major issues late in the testing window. How do you manage this?',
                options: [
                    {
                        text: 'Immediately notify the project manager, document thoroughly, reprioritise remaining time',
                        outcome: 'Perfect! A quick response and clear communication is essential to mitigating any delays.',
                        experience: 25,
                        tool: 'Issue Management'
                    },
                    {
                        text: 'Continue with the tasks within the original project plan',
                        outcome: 'Major issues need immediate attention, no matter at what point the project is up to.',
                        experience: -15
                    },
                    {
                        text: 'Rush through the remaining required tests to achieve as much coverage as possible',
                        outcome: 'Tests should not be rushed in order to maintain quality, and reprioritising should continue in relation to the issues raised.',
                        experience: -10
                    },
                    {
                        text: 'Skip documentation on project, and test script reporting for speed',
                        outcome: 'Proper documentation is essential as it give stakeholders critical information on project progress.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Resource Changes',
                description: 'How do you handle unexpected resource sheet changes?',
                options: [
                    {
                        text: 'Review changes immediately, adjust plans, ensure smooth transitions',
                        outcome: 'Excellent! Adaptable planning maintains efficiency.',
                        experience: 25,
                        tool: 'Change Management'
                    },
                    {
                        text: 'Continue with the current tasks assigned to completion',
                        outcome: 'Adaptation to changes required to reassess priorities.',
                        experience: -15
                    },
                    {
                        text: 'Wait for instructions from stakeholders as to which tasks need reprioritising',
                        outcome: 'A proactive response to changes is required to decrease the impact of major resource changes.',
                        experience: -10
                    },
                    {
                        text: 'Leave minor changes to resources and continue with priority tasks set out in previous planning',
                        outcome: 'All resource changes need attention in order to reassess priorities.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Long-Term Planning',
                description: 'How do you maintain effective time management on long-term projects?',
                options: [
                    {
                        text: 'Establish sustainable routines, regularly review efficiency, adapt processes as needed',
                        outcome: 'Perfect! This is sustainable approach to long-term projects.',
                        experience: 25,
                        tool: 'Long-term Planning'
                    },
                    {
                        text: 'Keep same routine throughout the project to maintain consistency',
                        outcome: 'Regular process reviews improve efficiency.',
                        experience: -15
                    },
                    {
                        text: 'Focus only on daily tasks and to ensure quick manageable goals',
                        outcome: 'A long-term view required for sustainability of a project.',
                        experience: -10
                    },
                    {
                        text: 'Change processes frequently to gain as much coverage as possible',
                        outcome: 'A balanced adaptation over a long period is better than frequent changes.',
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
        if (this.player.questionHistory.length >= this.totalQuestions) {
            console.log('All questions answered, ending game');
            this.endGame(false);
            return;
        }
        
        // Get the next scenario based on current progress
        let scenario;
        const questionCount = this.player.questionHistory.length;
        
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
        
        // Progress through levels based only on question count
        if (totalAnswered >= 10) {
            return this.advancedScenarios;
        } else if (totalAnswered >= 5) {
            return this.intermediateScenarios;
        }
        return this.basicScenarios;
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of time management. You clearly understand the nuances of time management and are well-equipped to handle any time management challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your time management skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('planning') || description.includes('planning')) {
            return 'Planning and Organization';
        } else if (title.includes('project') || description.includes('project')) {
            return 'Project Management';
        } else if (title.includes('meeting') || description.includes('meeting')) {
            return 'Meeting Management';
        } else if (title.includes('workload') || description.includes('workload')) {
            return 'Workload Distribution';
        } else if (title.includes('progress') || description.includes('progress')) {
            return 'Progress Monitoring';
        } else if (title.includes('risk') || description.includes('risk')) {
            return 'Risk Management';
        } else if (title.includes('resource') || description.includes('resource')) {
            return 'Resource Management';
        } else {
            return 'General Time Management';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Planning and Organization': 'Focus on developing structured weekly and daily planning routines to better anticipate and manage your time.',
            'Project Management': 'Practice estimating project timelines more accurately and breaking down large tasks into manageable chunks.',
            'Meeting Management': 'Work on scheduling meetings more efficiently with proper preparation and follow-up time allocation.',
            'Workload Distribution': 'Improve prioritization skills and learn to better balance multiple tasks and deadlines.',
            'Progress Monitoring': 'Enhance your tracking methods to better monitor progress and adjust timelines when needed.',
            'Risk Management': 'Develop strategies for identifying potential time constraints and creating contingency plans.',
            'Resource Management': 'Focus on optimizing resource allocation and maintaining efficient workspace organization.',
            'General Time Management': 'Continue developing fundamental time management skills and productivity techniques.'
        };

        return recommendations[area] || 'Continue practicing core time management principles.';
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
}

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Clear any existing quiz instances before starting this quiz
    BaseQuiz.clearQuizInstances('time-management');
    
    const quiz = new TimeManagementQuiz();
    quiz.startGame();
}); 