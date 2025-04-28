import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class TesterMindsetQuiz extends BaseQuiz {
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

        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'tester-mindset',
            writable: false,
            configurable: false,
            enumerable: true
        });
        
        // Initialize randomized scenarios at the class level
        this.randomizedScenarios = {
            basic: null,
            intermediate: null,
            advanced: null
        };
        
        // Store current scenario
        this.currentScenario = null;

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

    shouldEndGame() {
        // End game if we've answered all questions
        return this.player.questionHistory.length >= 15;
    }

    /**
     * Saves the current progress of the player
     * @returns {Promise<void>}
     */
    async saveProgress() {
        try {
            if (!this.player) {
                console.warn('No player data to save');
                return;
            }
            
            // Optimize the question history by removing unnecessary data
            // This helps prevent the progress object from becoming too large
            const optimizedHistory = this.player.questionHistory.map(item => ({
                scenarioId: item.scenarioId,
                questionId: item.questionId, 
                selectedOption: item.selectedOption,
                correct: item.correct,
                pointsEarned: item.pointsEarned || 0
            }));
            
            // Create a slimmed-down progress object
            const progress = {
                experience: this.player.experience || 0,
                tools: this.player.tools || [],
                currentScenario: this.player.currentScenario,
                questionHistory: optimizedHistory,
                lastUpdated: new Date().toISOString(),
                questionsAnswered: this.player.questionHistory?.length || 0,
                randomizedScenarios: this.randomizedScenarios || null,
                status: this.gameStatus || 'in-progress',
                scorePercentage: this.calculateScore() || 0
            };

            console.log('[Quiz] Saving tester-mindset progress - optimized size:', 
                JSON.stringify(progress).length, 'bytes');
            
            // Display message to user if progress is large
            if (JSON.stringify(progress).length > 50000) {
                console.warn('[Quiz] Warning: Large progress data may cause slow saving');
            }
            
            // Save to API service
            const result = await this.apiService.saveQuizProgress('tester-mindset', progress);
            
            if (result.success) {
                console.log('[Quiz] Progress saved successfully');
            } else {
                console.error('[Quiz] Failed to save progress:', result.message);
            }
        } catch (error) {
            console.error('[Quiz] Error saving progress:', error);
        }
    }

    /**
     * Loads the player's progress from the API
     * @returns {Promise<boolean>} - Whether loading was successful
     */
    async loadProgress() {
        try {
            // Log the start of progress loading
            console.log('[Quiz] Loading tester-mindset progress...');
            
            const result = await this.apiService.getQuizProgress('tester-mindset');
            
            if (!result.success) {
                console.error('[Quiz] Failed to load progress:', result.error);
                return false;
            }
            
            const progress = result.data;
            
            // Ensure we have a valid progress object
            if (!progress) {
                console.warn('[Quiz] No progress data available, starting fresh');
                return false;
            }
            
            console.log('[Quiz] Retrieved progress data:', progress);
            
            // Restore the player's state
            this.player = {
                experience: progress.experience || 0,
                tools: progress.tools || [],
                currentScenario: progress.currentScenario || null,
                questionHistory: progress.questionHistory || []
            };
            
            // Restore randomized scenarios if available
            if (progress.randomizedScenarios) {
                this.randomizedScenarios = progress.randomizedScenarios;
                console.log('[Quiz] Restored randomized scenarios from saved progress');
            } else {
                // Initialize randomized scenarios if not available
                this.getCurrentScenarios();
                console.log('[Quiz] Initialized new randomized scenarios');
            }
            
            // Restore game status
            this.gameStatus = progress.status || 'in-progress';
            
            // Update UI based on loaded progress
            this.updateProgressDisplay();
            
            // Check if we need to display the end screen
            if (this.gameStatus === 'completed') {
                console.log('[Quiz] Game was previously completed, showing end screen');
                this.endGame();
                return true;
            }
            
            // Display the current scenario
            if (this.player.questionHistory.length > 0 && this.player.questionHistory.length < 15) {
                this.displayScenario();
                return true;
            } else if (this.player.questionHistory.length === 0) {
                // First time playing
                this.displayScenario();
                return true;
            } else {
                // Should have ended but didn't
                console.warn('[Quiz] Player answered all questions but game not marked as complete');
                this.endGame();
                return true;
            }
        } catch (error) {
            console.error('[Quiz] Error loading progress:', error);
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
            
            // Ensure timer settings are properly initialized before displaying the first scenario
            console.log('[TesterMindsetQuiz] Initializing timer settings before starting the quiz...');
            await this.initializeTimerSettings();
            console.log('[TesterMindsetQuiz] Timer initialized with value:', this.timePerQuestion);
            
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

    /**
     * Displays the current scenario to the player
     */
    displayScenario() {
        try {
            console.log('Displaying scenario');
            
            // Ensure required UI elements exist first
            if (!this.ensureRequiredElementsExist()) {
                throw new Error('Required UI elements could not be created');
            }
            
            // Get total answered questions
            const totalAnswered = this.player?.questionHistory?.length || 0;
            console.log(`Total answered questions: ${totalAnswered}`);
            
            // Force initialization of randomized scenarios if needed
            if (!this.randomizedScenarios || 
                !this.randomizedScenarios.basic || 
                this.randomizedScenarios.basic.length === 0) {
                console.log('Scenarios not initialized, initializing now');
                this.getCurrentScenarios();
            }
            
            // Get the appropriate scenarios based on progress
            const scenarios = this.getCurrentScenarios();
            console.log(`Scenarios for current level: ${scenarios?.length || 0}`);
            
            if (!scenarios || scenarios.length === 0) {
                throw new Error('No scenarios available for the current level');
            }
            
            // Calculate current scenario index within the level
            const scenarioIndex = totalAnswered % 5;
            console.log(`Current scenario index: ${scenarioIndex}`);
            
            // Get current scenario
            this.currentScenario = scenarios[scenarioIndex];
            
            if (!this.currentScenario) {
                console.error(`Scenario not found at index ${scenarioIndex}. Available indexes: 0-${scenarios.length - 1}`);
                
                // Fall back to first scenario if available
                if (scenarios.length > 0) {
                    console.log('Falling back to first scenario in the level');
                    this.currentScenario = scenarios[0];
                } else {
                    throw new Error(`No scenarios available to display`);
                }
            }
            
            console.log(`Selected scenario: ${this.currentScenario.id}, title: ${this.currentScenario.title}`);
            
            // Update UI with current scenario
            this.updateScenarioUI(this.currentScenario);
            
            // Update progress display
            this.updateProgressDisplay();
            
            console.log(`Displaying scenario: ${this.currentScenario.id} (${totalAnswered + 1}/15)`);
            return true;
        } catch (error) {
            console.error('Error in displayScenario:', error);
            this.showError('An error occurred while loading the scenario. Please refresh and try again.');
            return false;
        }
    }
    
    /**
     * Updates the UI with the scenario content
     * @param {Object} scenario - The scenario to display
     */
    updateScenarioUI(scenario) {
        try {
            if (!scenario) {
                throw new Error('Cannot update UI: No scenario provided');
            }
            
            // Ensure required elements exist
            this.ensureRequiredElementsExist();
            
            // Update scenario title
            const titleElement = document.getElementById('scenario-title');
            if (!titleElement) {
                throw new Error('Scenario title element not found in the DOM');
            }
            titleElement.textContent = scenario.title || 'Untitled Scenario';
            
            // Update scenario description
            const descriptionElement = document.getElementById('scenario-description');
            if (!descriptionElement) {
                throw new Error('Scenario description element not found in the DOM');
            }
            descriptionElement.textContent = scenario.description || 'No description available.';
            
            // Update options
            const optionsContainer = document.getElementById('options-container');
            if (!optionsContainer) {
                throw new Error('Options container not found in the DOM');
            }
            optionsContainer.innerHTML = '';
            
            // Add options
            if (scenario.options && scenario.options.length > 0) {
                scenario.options.forEach((option, index) => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    
                    const radioInput = document.createElement('input');
                    radioInput.type = 'radio';
                    radioInput.name = 'option';
                    radioInput.value = index;
                    radioInput.id = `option${index}`;
                    radioInput.setAttribute('tabindex', '0');
                    radioInput.setAttribute('aria-label', option.text || `Option ${index + 1}`);
                    
                    const label = document.createElement('label');
                    label.setAttribute('for', `option${index}`);
                    label.textContent = option.text || `Option ${index + 1}`;
                    
                    optionDiv.appendChild(radioInput);
                    optionDiv.appendChild(label);
                    optionsContainer.appendChild(optionDiv);
                });
            } else {
                const noOptionsMessage = document.createElement('p');
                noOptionsMessage.textContent = 'No options available for this scenario.';
                noOptionsMessage.classList.add('no-options-message');
                optionsContainer.appendChild(noOptionsMessage);
            }
            
            // Record start time for this question
            this.questionStartTime = Date.now();

            // Initialize timer for the new question
            this.initializeTimer();
            
            console.log('Scenario UI updated successfully');
        } catch (error) {
            console.error('Error in updateScenarioUI:', error);
            this.showError('An error occurred while updating the scenario display.');
        }
    }
    
    /**
     * Updates the progress display in the UI
     */
    updateProgressDisplay() {
        try {
            // Get current level and question count
            const currentLevel = this.getCurrentLevel();
            const totalAnswered = this.player?.questionHistory?.length || 0;
            
            // Ensure question number never exceeds 15
            const questionNumber = Math.min(totalAnswered + 1, 15);
            
            // Update the progress card elements
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
        } catch (error) {
            console.error('[Quiz] Error updating progress display:', error);
        }
    }
    
    /**
     * Calculate the current score percentage
     * @returns {number} Score as a percentage
     */
    calculateScore() {
        try {
            if (!this.player?.questionHistory?.length) return 0;
            
            const correctAnswers = this.player.questionHistory.filter(q => 
                this.isCorrectAnswer(q.selectedAnswer)
            ).length;
            
            return Math.round((correctAnswers / Math.min(this.player.questionHistory.length, 15)) * 100);
        } catch (error) {
            console.error('[Quiz] Error calculating score:', error);
            return 0;
        }
    }

    isCorrectAnswer(answer) {
        // Helper method to consistently determine if an answer is correct
        return answer && (answer.isCorrect || answer.experience > 0);
    }

    /**
     * Handle player's answer selection
     * @param {Event} event - The click event
     */
    handleAnswer(event) {
        try {
            if (event) {
                event.preventDefault();
            }
            
            console.log('Handle answer called');
            
            // Get selected option
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) {
                this.showError('Please select an option');
                return;
            }
            
            const optionIndex = parseInt(selectedOption.value);
            
            // Validate current scenario
            if (!this.currentScenario) {
                console.error('Current scenario not found. This might indicate an issue with scenario loading.');
                
                // Try to recover by attempting to load the current scenario again
                const totalAnswered = this.player?.questionHistory?.length || 0;
                const scenarios = this.getCurrentScenarios();
                if (!scenarios || scenarios.length === 0) {
                    throw new Error('No scenarios available for the current level');
                }
                
                const scenarioIndex = totalAnswered % 5;
                this.currentScenario = scenarios[scenarioIndex];
                
                if (!this.currentScenario) {
                    throw new Error(`Failed to recover. Scenario not found at index ${scenarioIndex}`);
                }
                
                console.log('Successfully recovered current scenario:', this.currentScenario);
            }
            
            // Get selected answer from the scenario
            const selectedAnswer = this.currentScenario.options[optionIndex];
            if (!selectedAnswer) {
                throw new Error('Selected answer not found in current scenario');
            }
            
            // Record the answer in player history
            const historyRecord = {
                scenario: this.currentScenario,
                scenarioId: this.currentScenario.id,
                selectedAnswer: selectedAnswer,
                timestamp: new Date().toISOString()
            };
            this.player.questionHistory.push(historyRecord);
            
            // Update player experience
            this.player.experience += selectedAnswer.experience || 0;
            
            // Check if player got a new tool
            if (selectedAnswer.tool && !this.player.tools.includes(selectedAnswer.tool)) {
                this.player.tools.push(selectedAnswer.tool);
            }
            
            // Save progress
            this.saveProgress();
            
            // Display the outcome
            this.displayOutcome(selectedAnswer);
            
            // Disable submit button while showing outcome
            const submitButton = document.querySelector('.submit-button');
            if (submitButton) {
                submitButton.disabled = true;
                
                // Re-enable after the outcome is shown
                setTimeout(() => {
                    submitButton.disabled = false;
                }, 2000);
            }
            
        } catch (error) {
            console.error('Error in handleAnswer:', error);
            this.showError('An error occurred while processing your answer. Please try again.');
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
        try {
            console.log('Displaying outcome:', JSON.stringify({
                isCorrect: this.isCorrectAnswer(selectedAnswer),
                selectedAnswer: selectedAnswer,
                scenario: this.currentScenario?.title || 'Unknown'
            }));
            
            // Get outcome screen elements
            const outcomeScreen = document.getElementById('outcome-screen');
            const outcomeContent = outcomeScreen.querySelector('.outcome-content');
            const outcomeText = document.getElementById('outcome-text');
            const continueButton = document.getElementById('continue-btn');
            
            if (!outcomeScreen || !outcomeContent || !outcomeText || !continueButton) {
                throw new Error('Outcome screen elements not found');
            }
            
            // Show the outcome screen
            document.getElementById('game-screen').classList.add('hidden');
            outcomeScreen.classList.remove('hidden');
            
            // Display the outcome text
            outcomeText.textContent = selectedAnswer.outcome || 'No outcome provided.';
            
            // Add experience gained display if element exists
            const xpGained = document.getElementById('xp-gained');
            if (xpGained) {
                xpGained.textContent = `Experience: ${selectedAnswer.experience || 0}`;
            }
            
            // Add tool gained display if element exists and there's a tool
            const toolGained = document.getElementById('tool-gained');
            if (toolGained) {
                toolGained.textContent = selectedAnswer.tool ? `Tool acquired: ${selectedAnswer.tool}` : '';
            }
            
            // Add continue button event listener
            console.log('Adding event listener to continue button');
            continueButton.onclick = () => {
                // Hide outcome screen
                outcomeScreen.classList.add('hidden');
                
                // Show game screen
                document.getElementById('game-screen').classList.remove('hidden');
                
                // Check if we need to end the game
                if (this.player.questionHistory.length >= 15) {
                    this.endGame();
                    return;
                }
                
                // Update progress display - use the correct method name
                this.updateProgressDisplay();
                
                // Display next scenario
                this.displayScenario();
            };
        } catch (error) {
            console.error('Error in displayOutcome:', error);
            
            // If there's an error, try to move to the next scenario anyway
            setTimeout(() => {
                try {
                    // Reset screens
                    const outcomeScreen = document.getElementById('outcome-screen');
                    if (outcomeScreen) {
                        outcomeScreen.classList.add('hidden');
                    }
                    
                    const gameScreen = document.getElementById('game-screen');
                    if (gameScreen) {
                        gameScreen.classList.remove('hidden');
                    }
                    
                    // Display next scenario
                    this.displayScenario();
                } catch (recoveryError) {
                    console.error('Failed to recover from display outcome error:', recoveryError);
                    this.showError('An error occurred. Please try refreshing the page.');
                }
            }, 2000);
        }
    }

    initializeTimer() {
        // Clear any existing timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }

        // No need to set default timer value here - use the value from BaseQuiz
        // which is either the admin-set value or 60 seconds default

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
                
                // Add warning class when time is running low
                const timerContainer = document.getElementById('timer-container');
                if (timerContainer) {
                    if (this.remainingTime <= 5) {
                        timerContainer.classList.add('timer-warning');
                    } else {
                        timerContainer.classList.remove('timer-warning');
                    }
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
            if (!this.randomizedScenarios || !this.randomizedScenarios.basic) {
                // Get list of already answered question IDs to avoid repeats
                const answeredIds = new Set(
                    this.player?.questionHistory
                        ?.map(q => q.scenario?.id)
                        .filter(id => id !== undefined)
                );
                
                // Function to generate a set of scenarios ensuring no repeats
                const getUniqueScenarios = (allScenarios, numNeeded) => {
                    // Filter out scenarios that have already been answered
                    const availableScenarios = allScenarios.filter(s => !answeredIds.has(s.id));
                    
                    // If we don't have enough scenarios left, include already seen ones as a fallback
                    if (availableScenarios.length < numNeeded) {
                        console.log(`Not enough unique scenarios left in pool. Using some repeats.`);
                        return this.shuffleArray([...allScenarios]).slice(0, numNeeded);
                    }
                    
                    // Shuffle and take the number needed
                    return this.shuffleArray(availableScenarios).slice(0, numNeeded);
                };
                
                // Create randomized sets of unique scenarios for each level
                this.randomizedScenarios = {
                    basic: getUniqueScenarios(this.basicScenarios, 5),
                    intermediate: getUniqueScenarios(this.intermediateScenarios, 5),
                    advanced: getUniqueScenarios(this.advancedScenarios, 5)
                };
                
                console.log('Created randomized scenarios:', {
                    basic: this.randomizedScenarios.basic.map(s => s.id),
                    intermediate: this.randomizedScenarios.intermediate.map(s => s.id),
                    advanced: this.randomizedScenarios.advanced.map(s => s.id)
                });
            }
        
            // Simple progression logic based solely on question count
            if (totalAnswered >= 10) {
                return this.randomizedScenarios.advanced;
            } else if (totalAnswered >= 5) {
                return this.randomizedScenarios.intermediate;
            }
            return this.randomizedScenarios.basic;
        } catch (error) {
            console.error('Error in getCurrentLevel:', error);
            return 'Basic'; // Default to basic if there's an error
        }
    }

    generateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations');
        if (!recommendationsContainer) return;

        const correctAnswers = this.player.questionHistory.filter(q => this.isCorrectAnswer(q.selectedAnswer)).length;
        const score = Math.round((correctAnswers / this.player.questionHistory.length) * 100);
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            const isCorrect = this.isCorrectAnswer(record.selectedAnswer);
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
        if (!scenario) return 'General Testing Approach';
        
        const title = scenario.title?.toLowerCase() || '';
        const description = scenario.description?.toLowerCase() || '';

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

    ensureRequiredElementsExist() {
        try {
            console.log('Ensuring required elements exist');
            
            // First make sure we have access to gameScreen
            if (!this.gameScreen) {
                console.error('Cannot create elements without gameScreen');
                return false;
            }
            
            // Check for question section and create if missing
            let questionSection = this.gameScreen.querySelector('.question-section');
            if (!questionSection) {
                console.log('Creating missing question section');
                questionSection = document.createElement('div');
                questionSection.className = 'question-section';
                
                // Find a good place to insert it (before options-section if possible)
                const optionsSection = this.gameScreen.querySelector('.options-section');
                if (optionsSection) {
                    this.gameScreen.insertBefore(questionSection, optionsSection);
                } else {
                    this.gameScreen.appendChild(questionSection);
                }
            }
            
            // Check for scenario title and create if missing
            let titleElement = document.getElementById('scenario-title');
            if (!titleElement) {
                console.log('Creating missing scenario title element');
                titleElement = document.createElement('h2');
                titleElement.id = 'scenario-title';
                titleElement.setAttribute('tabindex', '0');
                questionSection.appendChild(titleElement);
            }
            
            // Check for scenario description and create if missing
            let descriptionElement = document.getElementById('scenario-description');
            if (!descriptionElement) {
                console.log('Creating missing scenario description element');
                descriptionElement = document.createElement('p');
                descriptionElement.id = 'scenario-description';
                descriptionElement.setAttribute('tabindex', '0');
                questionSection.appendChild(descriptionElement);
            }
            
            // Check for options form and create if missing
            let optionsForm = document.getElementById('options-form');
            if (!optionsForm) {
                console.log('Creating missing options form');
                optionsForm = document.createElement('form');
                optionsForm.id = 'options-form';
                optionsForm.className = 'options-section';
                this.gameScreen.appendChild(optionsForm);
            }
            
            // Check for options container and create if missing
            let optionsContainer = document.getElementById('options-container');
            if (!optionsContainer) {
                console.log('Creating missing options container');
                optionsContainer = document.createElement('div');
                optionsContainer.id = 'options-container';
                optionsForm.appendChild(optionsContainer);
            }
            
            // Check for submit button and create if missing
            let submitButton = document.getElementById('submit-btn');
            if (!submitButton) {
                console.log('Creating missing submit button');
                submitButton = document.createElement('button');
                submitButton.type = 'submit';
                submitButton.id = 'submit-btn';
                submitButton.className = 'submit-button';
                submitButton.textContent = 'Submit Answer';
                optionsForm.appendChild(submitButton);
            }
            
            console.log('All required elements checked and created if needed');
            return true;
        } catch (error) {
            console.error('Error in ensureRequiredElementsExist:', error);
            return false;
        }
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new TesterMindsetQuiz();
    quiz.startGame();
}); 
