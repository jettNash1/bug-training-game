import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class RaisingTicketsQuiz extends BaseQuiz {
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
                { threshold: 90, message: '🏆 Outstanding! You\'re a ticket management expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong ticket handling skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing ticket management best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'raising-tickets',
            writable: false,
            configurable: false
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

        // Basic Scenarios (IDs 1-5, 75 XP total)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Understanding Ticket Types',
                description: 'What are the main types of tickets that should be raised?',
                options: [
                    {
                        text: 'Bugs, Queries, Suggestions/Improvements, and Reference tickets',
                        outcome: 'Perfect! These are the main ticket types used for different purposes.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Ticket Classification'
                    },
                    {
                        text: 'Bug reports should be raised as this is the primary objective of quality assurance',
                        outcome: 'Multiple ticket types are required including queries and suggestions as they serve different purposes.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Tasks should be raised by the tester for clients to assign to developers',
                        outcome: 'Whilst this is a valid ticket type in some but tracking systems, tasks are generally entered by developers or client project managers themselves.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'User stories should be raised by the tester for full feature coverage',
                        outcome: 'Whilst this is a valid ticket type. User stories are generally entered by developers or client project managers themselves.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Ticket Title Creation',
                description: 'How should you format a ticket title?',
                options: [
                    {
                        text: 'Concise, clear, and specific with environment prefix if applicable',
                        outcome: 'Excellent! Clear titles help identify issues quickly.',
                        experience: 15,
                        tool: 'Title Formatting'
                    },
                    {
                        text: 'A full sentence to give all details of the issue raised',
                        outcome: 'Ticket titles should be concise and specific. Full details can be included in the ticket description and steps.',
                        experience: -5
                    },
                    {
                        text: 'A clear and specific description along with bug severity',
                        outcome: 'Whilst a clear and specific description is required. The bug severity should be included in its own field in the ticket and in the severity field of the bug tracking system',
                        experience: -10
                    },
                    {
                        text: 'Observed and expected outcomes should be included.',
                        outcome: 'Whilst titles should describe the issue clearly, they need to be concise. Full information can be included in the description and steps of the ticket',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Issue Description',
                description: 'What should be included in the issue description?',
                options: [
                    {
                        text: 'Observed behaviour, expected behaviour, and reference to specifications if available',
                        outcome: 'Perfect! This provides clear context for the client and developer to debug the issue.',
                        experience: 15,
                        tool: 'Description Template'
                    },
                    {
                        text: 'Only the error message should be included in the issue description',
                        outcome: 'More context is needed in descriptions including observed and expected behaviour.',
                        experience: -10
                    },
                    {
                        text: 'The testers opinion on how the behaviour of the feature or process should perform',
                        outcome: 'Whilst in some cases this may be of benefit, any behaviour of the expected outcome should come from client documentation.',
                        experience: -5
                    },
                    {
                        text: 'Technical information should be included in the ticket description',
                        outcome: 'Technical information should be avoided if possible, as clear, accessible language is required for ease of understanding to all stakeholders.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Steps to Recreate',
                description: 'How should you document steps to recreate an issue?',
                options: [
                    {
                        text: 'Clear, numbered steps with specific actions and component names in order',
                        outcome: 'Excellent! This helps others reproduce the issue reliably.',
                        experience: 15,
                        tool: 'Steps Documentation'
                    },
                    {
                        text: 'A general description on the area in question for developers to investigate and debug',
                        outcome: 'Specific numbered steps are required for bug reproduction.',
                        experience: -10
                    },
                    {
                        text: 'Steps are not needed as long as the description has enough detail for reproduction',
                        outcome: 'Steps are essential for issue verification and should accompany a bug description.',
                        experience: -5
                    },
                    {
                        text: 'Steps should written in first person format when documenting an issue',
                        outcome: 'Steps should always be documented in an instructional manner, as first person format can suggest a one only type issue.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Environment Documentation',
                description: 'What should you include in the environment section?',
                options: [
                    {
                        text: 'Primary environment details and any additional environments where the issue occurs',
                        outcome: 'Perfect! This helps identify environment-specific issues.',
                        experience: 15,
                        tool: 'Environment Tracking'
                    },
                    {
                        text: 'Details of the environment the issue was initially found on',
                        outcome: 'Details of all environments the issue occurs on should be listed here.',
                        experience: -10
                    },
                    {
                        text: 'Hardware details of all environments the issue occurs on',
                        outcome: 'Whilst the hardware details are needed, operating system and browser version details are also required.',
                        experience: -5
                    },
                    {
                        text: 'Browser specific version numbers should be included in the environment section',
                        outcome: 'Whilst the browser version details are needed, operating system and hardware version details are also required.',
                        experience: 0
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10, 125 XP total)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Reproduction Rate',
                description: 'How do you determine and document reproduction rate?',
                options: [
                    {
                        text: 'Test multiple times and calculate percentage based on successful reproductions',
                        outcome: 'Excellent! This provides accurate reproduction statistics.',
                        experience: 20,
                        tool: 'Reproduction Calculator'
                    },
                    {
                        text: 'Test multiple times on one environment to ensure accurate reproduction rate',
                        outcome: 'To ensure accurate reproduction rates, tests should be carried out on multiple environments.',
                        experience: -15
                    },
                    {
                        text: 'Test with one set of data to ensure conditions do not affect outcome',
                        outcome: 'Whilst this is initially important, testing under different conditions contribute to the reproduction rate, for example, using different types of data for a mailing list form.',
                        experience: -10
                    },
                    {
                        text: 'Test once on each supported environment',
                        outcome: 'While testing other environments is important, multiple attempts of recreating the issue is required for accuracy.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Supporting Material',
                description: 'What supporting material should you include with tickets?',
                options: [
                    {
                        text: 'Clear videos and images showing the issue, crash logs, and highlighted problem areas',
                        outcome: 'Perfect! Visual evidence helps stakeholders and developers understand issues.',
                        experience: 20,
                        tool: 'Evidence Collection'
                    },
                    {
                        text: 'Supporting material can be omitted if the description has enough detail',
                        outcome: 'Evidence should always be included, if possible, as this helps demonstrate issues for developers and subsequent issue verification.',
                        experience: -15
                    },
                    {
                        text: 'Low resolution unlabelled screenshots should be included as supported evidence',
                        outcome: 'Screenshots should be clear and legible to promote clarity and instruction on issues.',
                        experience: -10
                    },
                    {
                        text: 'Steps to reproduce with URL links to affected pages and areas',
                        outcome: 'While steps to reproduce can help pinpoint an issue. Visual evidence often helps with clarity even more so.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Version Information',
                description: 'How should you document version information?',
                options: [
                    {
                        text: 'Include environment URL, build version and date for accurate tracking',
                        outcome: 'Excellent! Version information is essential for traceability helps track issue timeline.',
                        experience: 20,
                        tool: 'Version Tracker'
                    },
                    {
                        text: 'Include build version and date the issue was raised on for documentation',
                        outcome: 'Version information and date are essential. However, in the case of website testing the URL provided by the client must also be included.',
                        experience: -15
                    },
                    {
                        text: 'Use versioning in descending numerical order relating to the number of days under test',
                        outcome: 'The specific version of the release under test as supplied by the client or the URL and date needs to be stated.',
                        experience: -10
                    },
                    {
                        text: 'State the version number as \'latest\' with the date that issue was raised on',
                        outcome: 'Exact version numbers must be specified for traceability.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Severity Assessment',
                description: 'How do you determine ticket severity?',
                options: [
                    {
                        text: 'Assess impact on functionality, user experience, and business requirements',
                        outcome: 'Perfect! This ensures appropriate prioritisation.',
                        experience: 20,
                        tool: 'Severity Matrix'
                    },
                    {
                        text: 'Mark issue severity as high, as all bugs require addressing and fixing',
                        outcome: 'Accurate severity assessment needed for clients to prioritise issues that need fixing and ones that can be left in the code for release.',
                        experience: -15
                    },
                    {
                        text: 'Prioritise multiple minor cosmetic issues over bugs in system functionality detailed in business requirements',
                        outcome: 'Minor cosmetic issues need to be addressed, although anything detailed in the business requirements must take a higher severity status.',
                        experience: -10
                    },
                    {
                        text: 'Raise the issues with the intention of developers adding their own severity status, as they understand the system under test',
                        outcome: 'Severity must match impact on functionality, user experience, and business requirements.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Client Communication',
                description: 'How should you handle client-specific ticket requirements?',
                options: [
                    {
                        text: 'Follow client instructions from operational project details and maintain clear communication',
                        outcome: 'Excellent! Client preferences are important for their established work flow.',
                        experience: 20,
                        tool: 'Client Requirements'
                    },
                    {
                        text: 'Make sure client ticket assigning requirements only are followed',
                        outcome: 'While this is important, all client ticket requirements must be followed, for example how to update statuses and which lanes to move tickets into for a kanban style bug tracker.',
                        experience: -15
                    },
                    {
                        text: 'Use the standard ticket reporting format to keep consistency throughout all projects',
                        outcome: 'Client-specific needs should always be adhered to and cross referenced with the project manager if need be.',
                        experience: -10
                    },
                    {
                        text: 'Follow some of the client requirements in accordance with tester preference and experience',
                        outcome: 'All client requirements should be followed and on the occasion that a potential improvement can be utilised, this should be communicated with the client first as a suggestion.',
                        experience: -5
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15, 100 XP total)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Stakeholder Impact',
                description: 'How do you communicate ticket impact to stakeholders?',
                options: [
                    {
                        text: 'Provide clear, factual information about business impact and user experience effects',
                        outcome: 'Perfect! This helps stakeholders make informed decisions.',
                        experience: 25,
                        tool: 'Impact Assessment'
                    },
                    {
                        text: 'Use technical terms where possible along with a description of how the issue behaves',
                        outcome: 'Technical terms should be avoided if possible, as clear, accessible language is required for stakeholders of all technical ability.',
                        experience: -15
                    },
                    {
                        text: 'Give a brief description of the issue and how to recreate it',
                        outcome: 'When dealing with bug impact, stakeholders will generally require the actual impact the issue has on the user or the system under test and not how to recreate the issue.',
                        experience: -10
                    },
                    {
                        text: 'Emphasise the impact severity as high, as all bugs should be addressed and fixed',
                        outcome: 'Accurate impact assessment is required for stakeholders to form the correct strategy.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Quality Assurance',
                description: 'How do you ensure ticket quality before submission?',
                options: [
                    {
                        text: 'Double-check all information, verify steps, and ensure clear documentation',
                        outcome: 'Excellent! Quality checks prevent confusion.',
                        experience: 25,
                        tool: 'Quality Checklist'
                    },
                    {
                        text: 'Review the title and description fields of the ticket before submission',
                        outcome: 'All information with a ticket requires a review before submission.',
                        experience: -15
                    },
                    {
                        text: 'Run a spell checker program on the ticket before submission',
                        outcome: 'While spelling and grammar is important, all elements of the ticket are equally essential.',
                        experience: -10
                    },
                    {
                        text: 'Ensure all environment information is correct by double checking devices under test',
                        outcome: 'Whilst an important factor in bug submission for traceability, all elements of the ticket need to be reviewed and not just environment information.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Time Management',
                description: 'When should tickets be raised during testing?',
                options: [
                    {
                        text: 'Tickets should be raise immediately when issues are observed to maintain accuracy',
                        outcome: 'Perfect! Immediate reporting ensures accuracy.',
                        experience: 25,
                        tool: 'Issue Tracker'
                    },
                    {
                        text: 'Raise tickets in parallel with daily reports for familiarity when writing the report',
                        outcome: 'Immediate reporting is the best approach, as raising all tickets towards the end of the day can potentially lead to issues not being reported due to time constraints.',
                        experience: -15
                    },
                    {
                        text: 'Batch multiple issues together to make sure testing coverage is not affected',
                        outcome: 'Issues should be reported as soon as they are discovered as this gives the client visibility of project status.',
                        experience: -10
                    },
                    {
                        text: 'During stand up meetings to get the opinion of everyone involved in the project',
                        outcome: 'Any major issues can be highlighted in stand up meetings, but full tickets should not be written whilst in those meetings at the risk of taking work time away from colleagues.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Evidence Quality',
                description: 'How do you ensure high-quality supporting evidence?',
                options: [
                    {
                        text: 'Capture clear videos and images, repeat issues in recordings, and highlight key areas',
                        outcome: 'Excellent! Quality evidence aids understanding.',
                        experience: 25,
                        tool: 'Evidence Tools'
                    },
                    {
                        text: 'Use a device to record video evidence of the issue occurring on another device',
                        outcome: 'This approach should only be utilised with older devices that don\'t have the capability of native recording functionailty.',
                        experience: -15
                    },
                    {
                        text: 'Ensure bug description and steps to reproduce have sufficient and concise information',
                        outcome: 'While these are important areas to include when raising a bug. Evidence provides even more clarity',
                        experience: -10
                    },
                    {
                        text: 'Use evidence from previous releases if the issue still occurs on the current release.',
                        outcome: 'Evidence from the current release version of a system or application under test is always required for product accuracy.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Consistency Management',
                description: 'How do you maintain consistency across multiple tickets?',
                options: [
                    {
                        text: 'Use templates, follow standards, and maintain consistent formatting across all tickets',
                        outcome: 'Perfect! Consistency helps track and resolve issues.',
                        experience: 25,
                        tool: 'Template System'
                    },
                    {
                        text: 'Use a format based on what type of issue is being raised',
                        outcome: 'A consistent format is required as it represents professionalism and good business standard.',
                        experience: -15
                    },
                    {
                        text: 'Ensure bug description and steps to reproduce are always stated in the same format and same place',
                        outcome: 'While keeping this consistent is the correct approach, all other details and positioning of information within tickets should also be kept the same.',
                        experience: -10
                    },
                    {
                        text: 'Use templates and follow standards to maintain consistency',
                        outcome: 'This is a good approach. However, formatting also needs to be consistent through all tickets submitted to maintain professionalism.',
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

    shouldEndGame() {
        // End game if we've answered all questions
        return this.player.questionHistory.length >= this.totalQuestions;
    }

    calculateScorePercentage() {
        // Calculate percentage based on correct answers
        const correctAnswers = this.player.questionHistory.filter(q => {
            return q.selectedAnswer && q.selectedAnswer.isCorrect === true;
        }).length;
        
        // Cap the questions answered at total questions
        const questionsAnswered = Math.min(this.player.questionHistory.length, this.totalQuestions);
        
        return questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
    }

    async saveProgress() {
        // First determine the status based on clear conditions
        let status = 'in-progress';
        
        // Check for completion (all questions answered)
        if (this.player.questionHistory.length >= this.totalQuestions) {
            // Calculate percentage score based on correct answers
            const scorePercentage = this.calculateScorePercentage();
            status = scorePercentage >= this.passPercentage ? 'passed' : 'failed';
        }

        const progress = {
            experience: this.player.experience,
            tools: this.player.tools,
            currentScenario: this.player.currentScenario,
            questionHistory: this.player.questionHistory,
            lastUpdated: new Date().toISOString(),
            questionsAnswered: this.player.questionHistory.length,
            scorePercentage: this.calculateScorePercentage(),
            status: status
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
            
            console.log('Saving progress with status:', status, 'scorePercentage:', progress.scorePercentage);
            await this.apiService.saveQuizProgress(this.quizName, progress);
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
                    scorePercentage: savedProgress.data.scorePercentage || 0
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
        if (this.shouldEndGame()) {
            this.endGame(false);
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

            // Update player experience with bounds
            this.player.experience = Math.max(0, Math.min(this.config.maxXP, this.player.experience + selectedAnswer.experience));

            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: selectedAnswer.isCorrect === true,
                timeSpent: timeSpent,
                timedOut: false
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();

            // Also save quiz result and update display
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                const scorePercentage = this.calculateScorePercentage();
                
                await quizUser.updateQuizScore(
                    this.quizName,
                    scorePercentage,
                    this.player.experience,
                    this.player.tools,
                    this.player.questionHistory,
                    this.player.questionHistory.length
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
            
            // Update result display
            const resultElement = document.getElementById('result-text');
            if (resultElement) {
                resultElement.textContent = selectedAnswer.isCorrect ? 'Correct!' : 'Incorrect';
                resultElement.className = selectedAnswer.isCorrect ? 'correct' : 'incorrect';
            }
            
            if (selectedAnswer.tool) {
                document.getElementById('tool-gained').textContent = `Tool acquired: ${selectedAnswer.tool}`;
                if (!this.player.tools.includes(selectedAnswer.tool)) {
                    this.player.tools.push(selectedAnswer.tool);
                }
            } else {
                document.getElementById('tool-gained').textContent = '';
            }

            this.updateProgress();
            
            // Check if game should end after this answer
            if (this.shouldEndGame()) {
                // If we've answered all questions, end the game
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of raising tickets. You clearly understand the nuances of raising tickets and are well-equipped to handle any raising tickets challenges!</p>';
        } else if (scorePercentage >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your raising tickets skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('type') || description.includes('type')) {
            return 'Ticket Classification';
        } else if (title.includes('title') || description.includes('title')) {
            return 'Title Creation';
        } else if (title.includes('version') || description.includes('version')) {
            return 'Version Documentation';
        } else if (title.includes('severity') || description.includes('severity')) {
            return 'Severity Assessment';
        } else if (title.includes('quality') || description.includes('quality')) {
            return 'Quality Assurance';
        } else if (title.includes('evidence') || description.includes('evidence')) {
            return 'Evidence Management';
        } else if (title.includes('consistency') || description.includes('consistency')) {
            return 'Consistency Standards';
        } else {
            return 'General Ticket Management';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Ticket Classification': 'Focus on understanding different ticket types and when to use each category appropriately.',
            'Title Creation': 'Practice writing clear, concise titles that effectively communicate the issue at hand.',
            'Version Documentation': 'Improve accuracy in documenting environment details and version information.',
            'Severity Assessment': 'Enhance ability to evaluate and assign appropriate severity levels based on impact.',
            'Quality Assurance': 'Strengthen pre-submission quality checks and verification processes.',
            'Evidence Management': 'Work on capturing and organizing clear, relevant supporting evidence.',
            'Consistency Standards': 'Focus on maintaining consistent formatting and following documentation standards.',
            'General Ticket Management': 'Continue developing fundamental ticket creation and management skills.'
        };

        return recommendations[area] || 'Continue practicing core ticket management principles.';
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

        // Calculate score based on correct answers
        const scorePercentage = this.calculateScorePercentage();
        const isPassed = scorePercentage >= this.passPercentage;
        
        // Determine final status
        const finalStatus = failed ? 'failed' : (isPassed ? 'passed' : 'failed');
        
        // Save the final quiz result with pass/fail status
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                console.log('Setting final quiz status:', { status: finalStatus, score: scorePercentage });
                
                const result = {
                    score: scorePercentage,
                    scorePercentage: scorePercentage,
                    status: finalStatus,
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory,
                    questionsAnswered: this.player.questionHistory.length,
                    lastUpdated: new Date().toISOString()
                };

                // Save to QuizUser
                await user.updateQuizScore(
                    this.quizName,
                    result.scorePercentage,
                    result.experience,
                    this.player.tools,
                    result.questionHistory,
                    result.questionsAnswered,
                    finalStatus
                );

                // Save directly via API
                console.log('Saving final progress to API:', result);
                await this.apiService.saveQuizProgress(this.quizName, result);
                
                // Clear quiz local storage
                this.clearQuizLocalStorage(username, this.quizName);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${scorePercentage}%`;
       
        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = isPassed ? 'Quiz Complete!' : 'Quiz Failed!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (!isPassed) {
            performanceSummary.textContent = `Quiz failed. You scored ${scorePercentage}% but needed at least ${this.passPercentage}% to pass.`;
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
            const threshold = this.config.performanceThresholds.find(t => t.threshold <= scorePercentage);
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
                
                const isCorrect = record.isCorrect;
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

        variations.forEach(variant => {
            localStorage.removeItem(`quiz_progress_${username}_${variant}`);
            localStorage.removeItem(`quizResults_${username}_${variant}`);
        });
    }
}

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Clear any existing quiz instances before starting this quiz
    BaseQuiz.clearQuizInstances('raising-tickets');
    
    const quiz = new RaisingTicketsQuiz();
    quiz.startGame();
}); 