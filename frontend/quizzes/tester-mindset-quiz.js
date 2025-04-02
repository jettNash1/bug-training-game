import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class TesterMindsetQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a testing mindset expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong testing instincts!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing testing mindset best practices and try again!' }
            ]
        };
        
        super(config);

        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'tester-mindset',
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

        // Basic Scenarios (Focus on Fundamental Mindset Concepts)
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
                title: 'Understanding the Audience',
                description: 'How do you approach understanding the target audience for a new project?',
                options: [
                    {
                        text: 'Research user needs to gather information on target audiences',
                        outcome: 'Perfect! User-centric thinking is essential for effective testing.',
                        experience: 15,
                        tool: 'User Persona Template'
                    },
                    {
                        text: 'Apply personal usage patterns and preferences to determine the most likely user behaviours and testing scenarios',
                        outcome: 'Users have diverse needs and characteristics that must be considered and not just that of a testers own usage pattern.',
                        experience: -5
                    },
                    {
                        text: 'Conduct detailed technical analysis of system architecture and performance metrics to establish testing priorities',
                        outcome: 'Technical aspects are important but user needs are crucial for understanding of a target audience.',
                        experience: -5
                    },
                    {
                        text: 'Wait for post-release feedback to gather user trends and behaviour',
                        outcome: 'Understanding users before testing begins, can help prevent issues in the testing process.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Test Environment Setup',
                description: "The test environment is different from production. What's your approach?",
                options: [
                    {
                        text: 'Document the environment differences to be taken into consideration for test results',
                        outcome: 'Excellent! Understanding environment differences is crucial for testing and can be factored into any results.',
                        experience: 15,
                        tool: 'Environment Comparison Tool'
                    },
                    {
                        text: 'Proceed with testing while monitoring for any potential environmental impact on test results.',
                        outcome: 'Environment differences can affect testing activities and result in missed issues if not documented for reference first.',
                        experience: -5
                    },
                    {
                        text: 'Execute test cases in the production environment to ensure accurate results',
                        outcome: 'Testing in production without correct user control can lead to unwarranted risks within the system.',
                        experience: -10
                    },
                    {
                        text: 'Request environment replication to safely conduct testing activities.',
                        outcome: 'Good thinking, but first, the current differences must be documented.',
                        experience: 10
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Test Documentation',
                description: "You've found several issues. How do you document them?",
                options: [
                    {
                        text: 'Document the issues with steps and results for ease of replication',
                        outcome: 'Perfect! Clear documentation helps developers fix issues efficiently.',
                        experience: 15,
                        tool: 'Issue Documentation Template'
                    },
                    {
                        text: 'Initiate multiple communication channels including chat messages, emails, and verbal discussions for each discovered issue.',
                        outcome: 'Informal communication isn\'t sufficient for tracking issues, as important information can become lost.',
                        experience: -5
                    },
                    {
                        text: 'Capture and archive comprehensive visual documentation through multiple screenshot angles and screen recordings',
                        outcome: 'Screenshots alone don\'t provide enough context and more detail is required such as steps and results.',
                        experience: -10
                    },
                    {
                        text: 'Create brief descriptions for all the issues raised to make sure project time management can be met.',
                        outcome: 'More detail would help developers understand and fix issues.',
                        experience: 5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Test Planning',
                description: 'How do you prepare for a new testing project?',
                options: [
                    {
                        text: 'Review requirements, create test strategy, and identify risks',
                        outcome: 'Excellent! Thorough preparation leads to effective testing.',
                        experience: 15,
                        tool: 'Test Planning Framework'
                    },
                    {
                        text: 'Start testing straight away to meet project timeline and deliverables',
                        outcome: 'A lack of planning can lead to inefficient testing.',
                        experience: -5
                    },
                    {
                        text: 'Copy a test plan from previous project for efficiency',
                        outcome: 'Each project needs its own test approach and the need for specific testing tailored to each project is essential.',
                        experience: -5
                    },
                    {
                        text: 'Ask developers what and which areas to test within the project',
                        outcome: 'Developer input helps but thorough planning is required as a developer mindset is not always the same as an end user.',
                        experience: 5
                    }
                ]
            }
        ];

        // Intermediate Scenarios (Different Testing Approaches)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Exploratory Testing',
                description: "You're conducting exploratory testing. What's your mindset?",
                options: [
                    {
                        text: 'Be curious, investigative, and think outside the box',
                        outcome: 'Perfect! Exploratory testing requires creative thinking.',
                        experience: 20,
                        tool: 'Exploratory Testing Guide'
                    },
                    {
                        text: 'Follow a strictly set out test script to gain the best coverage',
                        outcome: 'Exploratory testing requires flexibility and creativity to think outside the box of a specified testing route.',
                        experience: -10
                    },
                    {
                        text: 'Test only happy paths to check the desired outcome',
                        outcome: 'Exploratory testing should cover various scenarios, including unhappy paths.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on finding bugs within the required scope of the project',
                        outcome: 'Understanding the system and user journey paths are also important in exploratory testing.',
                        experience: 5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Scripted Testing',
                description: 'During scripted testing, you notice an issue outside the test cases. What do you do?',
                options: [
                    {
                        text: 'Document the issue for client consideration and continue with test cases',
                        outcome: 'Excellent! Balance following scripts while noting other issues.',
                        experience: 20,
                        tool: 'Test Case Management'
                    },
                    {
                        text: 'Continue with testing as the particular focus is not documented to be covered within the test cases',
                        outcome: 'All issues should be documented, even if outside of stated test cases.',
                        experience: -15
                    },
                    {
                        text: 'Stop scripted testing to investigate and find the root cause',
                        outcome: 'The issue should be documented although, planned testing should be continued with.',
                        experience: 0
                    },
                    {
                        text: 'Add new test cases immediately to address the areas that return the issue',
                        outcome: 'Whilst adding new test cases is required as testing evolves on a project. The issues should be document first and test case updates can be performed after the current execution.',
                        experience: 10
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Test Support Approach',
                description: 'You\'re providing ongoing test support. How do you maintain effectiveness?',
                options: [
                    {
                        text: 'Stay adaptable and maintain clear communication with the team',
                        outcome: 'Perfect! Flexibility and communication are key for support.',
                        experience: 20,
                        tool: 'Support Communication Template'
                    },
                    {
                        text: 'Stick to the initial test plan throughout test activities only',
                        outcome: 'Test support requires adapting to clients changing needs.',
                        experience: -10
                    },
                    {
                        text: 'Wait for the client to assign you tasks to stay within scope of the project',
                        outcome: 'Proactive support is more valuable than reactive support.',
                        experience: -5
                    },
                    {
                        text: 'Focus only on new features within a release to keep testing activities current',
                        outcome: 'Support should include both new and existing functionality testing.',
                        experience: 5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Risk Assessment',
                description: 'You identify a potential risk in the project. How do you handle it?',
                options: [
                    {
                        text: 'Document the risk and communicate it to stakeholders promptly',
                        outcome: 'Excellent! Early risk communication allows better mitigation.',
                        experience: 20,
                        tool: 'Risk Assessment Matrix'
                    },
                    {
                        text: 'Wait to see the risk identified becomes an issue that could affect the system under test',
                        outcome: 'Early risk identification helps prevent issues with test activities further along into the process.',
                        experience: -15
                    },
                    {
                        text: 'Research a solution for the risk yourself and present this to developers',
                        outcome: 'Risks should be communicated to appropriate stakeholders for an appropriate outcome to be confirmed.',
                        experience: -5
                    },
                    {
                        text: 'Mention the identified risk in the next meeting or stand up for the project',
                        outcome: 'Risks need prompt communication to mitigate an issue early, rather than having delayed reporting.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Test Coverage',
                description: 'How do you ensure adequate test coverage for a feature?',
                options: [
                    {
                        text: 'Implement comprehensive testing methodologies across all possible test scenarios and edge cases with detailed documentation',
                        outcome: 'This is too broad an approach and can be an inefficient way of testing.',
                        experience: -5
                    },
                    {
                        text: 'Use risk-based testing to prioritise areas that are of the most importance to the user and client',
                        outcome: 'Perfect! Prioritising tests based on risk is one of the most efficient approaches.',
                        experience: 20,
                        tool: 'Risk Assessment Matrix'
                    },
                    {
                        text: 'Execute extensive regression testing protocols while maintaining detailed coverage metrics and trend analysis',
                        outcome: 'Regression testing alone doesn\'t ensure the most sufficient coverage.',
                        experience: -10
                    },
                    {
                        text: 'Conduct thorough analysis of all system components and their interconnected dependencies',
                        outcome: 'System analysis is important but should be guided by risk assessment.',
                        experience: 5
                    }
                ]
            }
        ];

        // Advanced Scenarios (Complex situations)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Critical Production Issue',
                description: 'A critical bug is reported in production affecting user data. What\'s your immediate response?',
                options: [
                    {
                        text: 'Alert the incident team with evidence and begin systematic investigation',
                        outcome: 'Excellent! Quick escalation and a systematic approach is crucial.',
                        experience: 25,
                        tool: 'Incident Response Protocol'
                    },
                    {
                        text: 'Start researching a fix for the bug immediately',
                        outcome: 'Incident response process should be followed before attempting to find a route cause for developers to investigate and fix.',
                        experience: -15
                    },
                    {
                        text: 'Document the issue to be included in the next sprint for developer attention',
                        outcome: 'Critical issues within the production environment require immediate attention.',
                        experience: -15
                    },
                    {
                        text: 'Start investigating the root cause of the bug immediately',
                        outcome: 'Incident response process should be followed before attempting to find the cause so all interested parties are aware of the issue.',
                        experience: 5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Test Strategy Evolution',
                description: 'The project scope has significantly changed mid-way. How do you adapt your test strategy?',
                options: [
                    {
                        text: 'Review changes, update strategy, and communicate any impact on the project',
                        outcome: 'Perfect! Systematic adaptation ensures continued effectiveness.',
                        experience: 25,
                        tool: 'Strategy Adaptation Framework'
                    },
                    {
                        text: 'Continue the testing activities outlined in the original strategy to stay in line with initial client expectation',
                        outcome: 'The strategy must evolve with project changes as important features could missed.',
                        experience: -20
                    },
                    {
                        text: 'Create an entirely new strategy to come into line with the new requirements',
                        outcome: 'Modifying the existing strategy is the preferred approach to time management and constraints.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on the new requirements set out in the updated scope',
                        outcome: 'Both new and existing requirements need to be taken into consideration as issues could be missed if existing requirements are ignored.',
                        experience: 0
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Resource Constraints',
                description: 'You have limited time and resources for testing. How do you proceed?',
                options: [
                    {
                        text: 'Prioritise critical functionality and communicate constraints',
                        outcome: 'Excellent! Risk-based prioritisation maximizes testing value.',
                        experience: 25,
                        tool: 'Test Prioritization Matrix'
                    },
                    {
                        text: 'Test everything as quick as possible to meet project timeframe deliverables',
                        outcome: 'Rushed testing may miss critical issues.',
                        experience: -20
                    },
                    {
                        text: 'Leave lower priority items to meet project timeframe deliverables',
                        outcome: 'Scope reduction needs to be communicated and agreed upon with stakeholders first.',
                        experience: -10
                    },
                    {
                        text: 'Request a deadline extension to achieve the required test coverage',
                        outcome: 'Test case and scope prioritisation is required first, even with an extended deadline.',
                        experience: 0
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Team Collaboration',
                description: 'Different team members have conflicting test approaches. How do you handle this?',
                options: [
                    {
                        text: 'Facilitate discussion to align on best practices and document any agreements',
                        outcome: 'Perfect! Collaborative alignment improves team effectiveness.',
                        experience: 25,
                        tool: 'Test Approach Alignment Guide'
                    },
                    {
                        text: 'Let each person use their preferred approach to aid in meeting deliverables',
                        outcome: 'Inconsistent approaches can affect testing quality.',
                        experience: -20
                    },
                    {
                        text: 'Enforce your preferred approach to be able to manage progress more efficiently',
                        outcome: 'Collaboration is better than enforcement as each colleague brings a different skill set.',
                        experience: -15
                    },
                    {
                        text: 'Escalate to management immediately so they can set a company wide approach',
                        outcome: 'It is preferred to initiate a team discussion first to potentially come to a collaborative agreement before escalation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Quality Advocacy',
                description: 'The team is pressured to reduce testing time. How do you respond?',
                options: [
                    {
                        text: 'Present data-driven analysis of risks and quality impacts',
                        outcome: 'Excellent! Data-driven advocacy helps maintain quality.',
                        experience: 25,
                        tool: 'Quality Impact Analysis'
                    },
                    {
                        text: 'Accept the reduced timeline and continue with testing activities',
                        outcome: 'Quality concerns should be raised professionally as issues could be missed with reduced coverage.',
                        experience: -30
                    },
                    {
                        text: 'Refuse to reduce the testing time as this will affect testing coverage and quality',
                        outcome: 'It is preferred and professional to collaborate with stakeholders to find balanced solutions.',
                        experience: -20
                    },
                    {
                        text: 'Reduce test coverage without any risk analysis',
                        outcome: 'Impact analysis is required and should be communicated with stakeholders before reducing coverage.',
                        experience: -15
                    }
                ]
            }
        ];

        // Initialize UI and event listeners
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

            // Update player state
            this.player.experience = Math.max(0, Math.min(this.maxXP, newExperience));

            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Record the answer
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

            // Show outcome screen and update display with answer outcome
            BaseQuiz.prototype.displayOutcome.call(this, selectedAnswer);

            this.updateProgress();
        } catch (error) {
            console.error('Failed to handle answer:', error);
            this.showError('Failed to process your answer. Please try again.');
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of tester mindset. You clearly understand the nuances of tester mindset and are well-equipped to handle any tester mindset challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your tester mindset skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('context') || description.includes('context')) {
            return 'Project Context Understanding';
        } else if (title.includes('environment') || description.includes('environment')) {
            return 'Test Environment Management';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Test Documentation';
        } else if (title.includes('planning') || description.includes('planning')) {
            return 'Test Planning';
        } else if (title.includes('risk') || description.includes('risk')) {
            return 'Risk Assessment';
        } else if (title.includes('coverage') || description.includes('coverage')) {
            return 'Test Coverage';
        } else if (title.includes('collaboration') || description.includes('collaboration')) {
            return 'Team Collaboration';
        } else {
            return 'General Testing Approach';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Project Context Understanding': 'Focus on improving requirement analysis and understanding business context before testing.',
            'Test Environment Management': 'Enhance your ability to identify and document environment differences and their impact on testing.',
            'Test Documentation': 'Practice creating clear, detailed test documentation that helps track issues and communicate effectively.',
            'Test Planning': 'Work on developing comprehensive test strategies that consider project scope and risks.',
            'Risk Assessment': 'Strengthen your ability to identify, prioritize, and communicate potential risks in testing.',
            'Test Coverage': 'Improve your approach to ensuring adequate test coverage across different testing types and scenarios.',
            'Team Collaboration': 'Enhance communication with team members and stakeholders during the testing process.',
            'General Testing Approach': 'Continue developing fundamental testing principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core testing mindset principles.';
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

    displayOutcome(selectedAnswer) {
        // Show outcome screen and update display with answer outcome
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.remove('hidden');
        
        let outcomeText = selectedAnswer.outcome;
        document.getElementById('outcome-text').textContent = outcomeText;
        
        // Remove XP display - no longer showing experience points
        document.getElementById('xp-gained').textContent = '';
        
        if (selectedAnswer.tool) {
            document.getElementById('tool-gained').textContent = `Tool acquired: ${selectedAnswer.tool}`;
            if (!this.player.tools.includes(selectedAnswer.tool)) {
                this.player.tools.push(selectedAnswer.tool);
            }
        } else {
            document.getElementById('tool-gained').textContent = '';
        }
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new TesterMindsetQuiz();
    quiz.startGame();
}); 
