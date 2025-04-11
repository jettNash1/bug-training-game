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
        
        // Log screen elements for debugging
        console.log('Game screen element:', this.gameScreen);
        console.log('Outcome screen element:', this.outcomeScreen);
        console.log('End screen element:', this.endScreen);
        
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
        try {
            console.log('Initializing event listeners');
            
        // Add event listeners for the continue and restart buttons
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) {
                // Remove any existing listeners by cloning and replacing
                const newBtn = continueBtn.cloneNode(true);
                continueBtn.parentNode.replaceChild(newBtn, continueBtn);
                
                // Add fresh event listener
                newBtn.addEventListener('click', () => {
                    console.log('Continue button clicked from event listener');
                    this.nextScenario();
                });
                console.log('Added event listener to continue button');
            }
            
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => this.restartGame());
                console.log('Added event listener to restart button');
            }

        // Add form submission handler
            const optionsForm = document.getElementById('options-form');
            if (optionsForm) {
                optionsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAnswer();
        });
                console.log('Added event listener to options form');
            }
            
            // Add submit button click handler
            const submitButton = document.querySelector('.submit-button');
            if (submitButton) {
                submitButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleAnswer();
                });
                console.log('Added event listener to submit button');
            }

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.type === 'radio') {
                this.handleAnswer();
            }
        });
            console.log('Added keyboard navigation event listeners');
            
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
                
                scenario.options.forEach((option, index) => {
                    if (!option || !option.text) {
                        console.error('Invalid option at index', index, option);
                        return;
                    }
                    
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    optionDiv.innerHTML = `
                <input type="radio" 
                    name="option" 
                            value="${index}" 
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

        // Initialize timer for the new question
        this.initializeTimer();
            
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

        // Set default timer value if not set
        if (!this.timePerQuestion) {
            this.timePerQuestion = 30;
            console.log('[Quiz] Using default timer value:', this.timePerQuestion);
        }

        // Reset remaining time
        this.remainingTime = this.timePerQuestion;
        this.questionStartTime = Date.now();

        // Update timer display
        const timerContainer = document.getElementById('timer-container');
        if (timerContainer) {
            timerContainer.textContent = `Time remaining: ${this.remainingTime}s`;
        }

        // Start the countdown
        this.questionTimer = setInterval(() => {
            this.remainingTime--;
            
            // Update timer display
            if (timerContainer) {
                timerContainer.textContent = `Time remaining: ${this.remainingTime}s`;
                
                // Add warning class when time is running low
                if (this.remainingTime <= 5) {
                    timerContainer.classList.add('timer-warning');
                } else {
                    timerContainer.classList.remove('timer-warning');
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
        
            // Simple progression logic based solely on question count, no threshold checks
            if (totalAnswered >= 10) {
            return this.advancedScenarios;
            } else if (totalAnswered >= 5) {
            return this.intermediateScenarios;
        }
        return this.basicScenarios;
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
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new TesterMindsetQuiz();
    quiz.startGame();
}); 
