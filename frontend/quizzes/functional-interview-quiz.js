import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class FunctionalInterviewQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a functional interview expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong functional interview skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing functional interview best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'functional-interview',
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
                title: 'Project Context',
                description: "You're starting a new testing project. What's your first priority?",
                options: [
                    {
                        text: 'Review all the requirements for the project provided by the client',
                        outcome: 'Excellent! Understanding context is crucial for effective testing.',
                        experience: 15,
                        tool: 'Context Analysis Framework'
                    },
                    {
                        text: 'Begin extensive exploratory testing sessions to identify potential issues and document findings for immediate stakeholder review',
                        outcome: 'Without understanding context first, testing straight away may miss critical issues.',
                        experience: -5
                    },
                    {
                        text: 'Create comprehensive test cases based on industry best practices and previous project experience',
                        outcome: 'Test cases should be based on project context and requirements.',
                        experience: -5
                    },
                    {
                        text: 'Analyse historical test results of older releases of the same project',
                        outcome: 'While helpful, previous results don\'t replace understanding of current project context.',
                        experience: 5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Project Knowledge',
                description: 'You\'re leaving a project tomorrow and new testers are joining. How do you show the best initiative?',
                options: [
                    {
                        text: 'Create comprehensive handover notes and context documentation',
                        outcome: 'Perfect! Proactive knowledge transfer shows excellent initiative.',
                        experience: 20,
                        tool: 'Knowledge Transfer'
                    },
                    {
                        text: 'Answer any questions the testers might have on processes or outstanding tasks',
                        outcome: 'Initiative means preparing resources before they\'re needed.',
                        experience: -15
                    },
                    {
                        text: 'Leave basic notes about current and outstanding tasks for the project',
                        outcome: 'While helpful, this doesn\'t provide full context needed for a handover.',
                        experience: 5
                    },
                    {
                        text: 'Tell them to check existing documentation to familiarise themselves with the project',
                        outcome: 'This doesn\'t help bridge potential knowledge gaps effectively.',
                        experience: -10
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Remote Communication',
                description: 'You\'re working remotely and need to collaborate on a complex task. How do you ensure effective communication?',
                options: [
                    {
                        text: 'Set up regular video calls, use screen sharing, and maintain detailed documentation',
                        outcome: 'Perfect! This maintains clear communication channels.',
                        experience: 20,
                        tool: 'Remote Collaboration'
                    },
                    {
                        text: 'Use email as your source of communication and copy everyone in that\'s involved in the project',
                        outcome: 'Multiple communication channels are often needed for different teams related to the project.',
                        experience: -15
                    },
                    {
                        text: 'Wait for others to initiate communication to establish their preferred channels',
                        outcome: 'Being proactive in remote communication creates a professional approach.',
                        experience: -10
                    },
                    {
                        text: 'Handle everything through chat channels for quick responses',
                        outcome: 'Complex tasks often need richer communication and extensive detail that chat channels cant provide.',
                        experience: -5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Understanding Ticket Types',
                description: 'What are the main types of tickets that should be raised?',
                options: [
                    {
                        text: 'Bugs, Queries, Suggestions/Improvements, and Reference tickets',
                        outcome: 'Perfect! These are the main ticket types used for different purposes.',
                        experience: 15,
                        tool: 'Ticket Classification'
                    },
                    {
                        text: 'Bug reports should be raised as this is the primary objective of quality assurance',
                        outcome: 'Multiple ticket types are required including queries and suggestions as they serve different purposes.',
                        experience: -5
                    },
                    {
                        text: 'Tasks should be raised by the tester for clients to assign to developers',
                        outcome: 'Whilst this is a valid ticket type in some but tracking systems, tasks are generally entered by developers or client project managers themselves.',
                        experience: -10
                    },
                    {
                        text: 'User stories should be raised by the tester for full feature coverage',
                        outcome: 'Whilst this is a valid ticket type. User stories are generally entered by developers or client project managers themselves.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Bug Reproduction Rate',
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
            }
        ];

        // Intermediate Scenarios (IDs 6-10)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Issue Risk Calculation',
                description: 'How do you calculate the overall risk level?',
                options: [
                    {
                        text: 'Multiply severity by likelihood ratings',
                        outcome: 'Excellent! This calculation provides accurate risk levels.',
                        experience: 15,
                        tool: 'Risk Calculator'
                    },
                    {
                        text: 'Consider the severity of the issue and base the overall risk on this',
                        outcome: 'Both severity and likelihood should be taken into consideration. If the severity of a risk is high but the likelihood of this occurring is extremely low. Then overall severity would be reduced',
                        experience: -10
                    },
                    {
                        text: 'Consider the likelihood of the issue occurring and base overall risk on this',
                        outcome: 'Severity of the risk must also be factored in. If the likelihood of a risk is high but the severity of this risk is extremely low. Then overall severity would be reduced',
                        experience: -5
                    },
                    {
                        text: 'Add severity and likelihood ratings to gain the overall risk calculation',
                        outcome: 'Multiplication of severity and likelihood is the formula used for overall risk level.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Risk Identification',
                description: 'What is the most effective way to identify potential risks?',
                options: [
                    {
                        text: 'Conduct comprehensive analysis of historical project data and previous risk assessments to establish patterns',
                        outcome: 'Historical data alone may miss new risks.',
                        experience: -5
                    },
                    {
                        text: 'Review documentation to determine scope, user and system impact',
                        outcome: 'Perfect! Documentation review is key to identifying risks.',
                        experience: 15,
                        tool: 'Risk Assessment Template'
                    },
                    {
                        text: 'Implement extensive monitoring systems to track all possible system behaviours and performance metrics',
                        outcome: 'Monitoring comes after risk identification.',
                        experience: -10
                    },
                    {
                        text: 'Establish detailed risk tracking protocols across multiple project phases',
                        outcome: 'Tracking comes after identification.',
                        experience: 5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
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
                id: 9,
                level: 'Intermediate',
                title: 'Understanding Exploratory Testing',
                description: 'What is the primary objective of exploratory-based testing?',
                options: [
                    {
                        text: 'To discover defects while dynamically exploring the application under test',
                        outcome: 'Correct! Exploratory testing is primarily aimed at discovering defects through dynamic investigation of the software without following predefined test cases.',
                        experience: 15,
                        tool: 'Exploratory testing Framework'
                    },
                    {
                        text: 'To create detailed test cases within a test script before execution',
                        outcome: 'Exploratory testing specifically does not rely on detailed test case documentation created in advance.',
                        experience: -5
                    },
                    {
                        text: 'To focus on cosmetic issues within the application under test',
                        outcome: 'While cosmetic issues may be identified, exploratory testing focuses broadly on functionality, user experience, and behaviour, not exclusively on cosmetic issues.',
                        experience: -10
                    },
                    {
                        text: 'To replace all other forms of test approach for the application under test',
                        outcome: 'While exploratory testing is valuable, it complements rather than replaces other testing approaches, as it has both advantages and disadvantages.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Exploratory Testing Risks',
                description: 'What is a risk of relying solely on exploratory testing?',
                options: [
                    {
                        text: 'It may lead to incomplete test coverage due to time constraints',
                        outcome: 'Correct! A disadvantage of exploratory testing is potentially incomplete test coverage. As a time-based approach, testing might uncover numerous issues in one area, but time constraints may prevent discovering all bugs comprehensively.',
                        experience: 20,
                        tool: 'Exploratory Risk Check'
                    },
                    {
                        text: 'Solely focusing on exploratory testing can make test activities too rigid',
                        outcome: 'Exploratory testing is flexible in nature, not rigid like other scripted test approaches.',
                        experience: -15
                    },
                    {
                        text: 'This type of approach can require too much documentation',
                        outcome: 'Exploratory testing requires less documentation than scripted testing.',
                        experience: -10
                    },
                    {
                        text: 'This type of approach always takes longer than scripted testing',
                        outcome: 'While time management can be a challenge, exploratory testing doesn\'t always take longer than scripted testing; in fact, it can be more time-efficient by eliminating the need for extensive test case preparation.',
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
                title: 'Functional and Non-Functional Differences',
                description: 'What is the main difference between functional and non-functional testing?',
                options: [
                    {
                        text: 'Functional testing is based on customer requirements while non-functional testing is based on customer expectations',
                        outcome: 'Perfect! Functional testing verifies if the system works according to specified requirements, while non-functional testing addresses expectations about how well the system performs.',
                        experience: 15,
                        tool: 'Non-Functional and Functional Testing Tool'
                    },
                    {
                        text: 'Functional testing is automated while non-functional testing is always manual',
                        outcome: 'Both functional and non-functional testing can be performed using either manual or automated approaches, depending on the specific requirements and context.', 
                        experience: -10
                    },
                    {
                        text: 'Functional testing is important while non-functional testing is optional',
                        outcome: 'While non-functional features aren\'t mandatory for a system to operate, this type of testing is just as important as functional testing for ensuring overall quality.',
                        experience: -5
                    },
                    {
                        text: 'Functional testing is performed by users while non-functional testing is performed by developers',
                        outcome: 'Both types of testing are typically performed by testers or QA professionals, not necessarily developers or end users.',
                        experience: 0
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Verification Priority',
                description: 'You have limited time for issue verification. How do you prioritise tickets?',
                options: [
                    {
                        text: 'Start with highest priority and severity issues, ensuring critical fixes are verified first',
                        outcome: 'Perfect! This ensures most important issues are verified.',
                        experience: 15,
                        tool: 'Prioritisation'
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
                id: 13,
                level: 'Advanced',
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
                        outcome: 'Regression tests should focus on high-risk areas, recent changes and core functionality.',
                        experience: 0
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'CRUD Testing Basics',
                description: 'What are the essential components of CRUD testing in a content management system?',
                options: [
                    {
                        text: 'Create, read, update, and delete functionality checks for content management',
                        outcome: 'Excellent! These are the fundamental CRUD operations.',
                        experience: 15,
                        tool: 'CRUD Testing'
                    },
                    {
                        text: 'Content creation and content update functionality',
                        outcome: 'All CRUD operations need testing, not just the creation function.',
                        experience: -5
                    },
                    {
                        text: 'The detail component within the content management system functionality',
                        outcome: 'There is no specific \'Detail Component\' to test, although detail would fall under Creation and Update testing.',
                        experience: -10
                    },
                    {
                        text: 'Review component within the content management system functionality',
                        outcome: 'There is no specific \'Review Component\' to test, although detail would fall under Creation, Update and Read testing.',
                        experience: 0
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Primary objective',
                description: 'What is the primary focus of copy proofing?',
                options: [
                    {
                        text: 'Testing the functionality of the software',
                        outcome: 'Functionality testing is explicitly out of scope for copy proofing.',
                        experience: -10
                    },
                    {
                        text: 'Checking grammar, spelling, and typos in content',
                        outcome: 'Correct! This is the core purpose of copy proofing.',
                        experience: 15,
                        tool: 'Content Quality Verification'
                    },
                    {
                        text: 'Verifying user interface design matches submitted documentation',
                        outcome: 'While content proofing includes some UI elements, copy proofing specifically focuses on text content.',
                        experience: 5
                    },
                    {
                        text: 'Testing cross-browser compatibility with supported environments',
                        outcome: 'This is a functional testing concern, not related to copy proofing.',
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in functional testing interview topics. Your understanding of testing concepts and methodologies is excellent and you are well-prepared for testing interviews!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your functional testing interview skills are very strong. To achieve complete mastery, consider focusing on:</p>';
            recommendationsHTML += '<ul>';
            if (weakAreas.length > 0) {
                weakAreas.forEach(area => {
                    recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
                });
            }
            recommendationsHTML += '</ul>';
        } else if (score >= 60) {
            recommendationsHTML = '<p>👍 Good effort! Here are some areas to focus on for your next testing interview:</p>';
            recommendationsHTML += '<ul>';
            weakAreas.forEach(area => {
                recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
            });
            recommendationsHTML += '</ul>';
        } else {
            recommendationsHTML = '<p>📚 Here are key areas for improvement before your next testing interview:</p>';
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

        if (title.includes('project context') || title.includes('project knowledge')) {
            return 'Project Management';
        } else if (title.includes('communication') || description.includes('communicate')) {
            return 'Communication Skills';
        } else if (title.includes('ticket') || description.includes('ticket')) {
            return 'Issue Tracking';
        } else if (title.includes('bug') || description.includes('bug')) {
            return 'Bug Management';
        } else if (title.includes('risk') || description.includes('risk')) {
            return 'Risk Assessment';
        } else if (title.includes('test') && (title.includes('sanity') || title.includes('smoke'))) {
            return 'Test Strategy';
        } else if (title.includes('exploratory')) {
            return 'Exploratory Testing';
        } else if (title.includes('functional') || title.includes('non-functional')) {
            return 'Testing Classification';
        } else if (title.includes('verification') || title.includes('regression')) {
            return 'Testing Verification';
        } else if (title.includes('crud')) {
            return 'CRUD Testing';
        } else if (title.includes('copy proofing')) {
            return 'Content Validation';
        } else {
            return 'General Interview Skills';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Project Management': 'Enhance your understanding of project contexts and knowledge transfer practices to improve project initialization and transitions.',
            'Communication Skills': 'Develop better remote communication strategies using appropriate channels for different types of information sharing.',
            'Issue Tracking': 'Improve knowledge of different ticket types and when to use each for maximum clarity and team effectiveness.',
            'Bug Management': 'Focus on proper bug reproduction processes and documentation to ensure defects can be efficiently addressed.',
            'Risk Assessment': 'Strengthen your ability to identify and assess risks through thorough documentation analysis and severity/likelihood calculations.',
            'Test Strategy': 'Review the differences between sanity and smoke testing to ensure efficient verification of critical functionality.',
            'Exploratory Testing': 'Understand exploratory testing\'s benefits and limitations, including strategies to mitigate test coverage concerns.',
            'Testing Classification': 'Develop clearer understanding of functional vs. non-functional testing approaches and their respective purposes.',
            'Testing Verification': 'Improve prioritization of verification efforts and regression testing strategies to maximize testing effectiveness.',
            'CRUD Testing': 'Enhance knowledge of complete CRUD operations testing for content management systems.',
            'Content Validation': 'Focus on the specific objectives of copy proofing and its differentiation from functional testing.',
            'General Interview Skills': 'Continue developing your understanding of functional testing concepts and interview question responses.'
        };

        return recommendations[area] || 'Continue practicing functional testing interview skills.';
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
    const quiz = new FunctionalInterviewQuiz();
    quiz.startGame();
}); 