import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class TesterMindsetQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
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
                        text: 'Review requirements',
                        outcome: 'Excellent! Understanding context is crucial for effective testing.',
                        experience: 15,
                        tool: 'Context Analysis Framework'
                    },
                    {
                        text: 'Begin extensive exploratory testing sessions to identify potential issues and document findings for immediate stakeholder review',
                        outcome: 'Without understanding context, testing may miss critical issues.',
                        experience: -5
                    },
                    {
                        text: 'Create comprehensive test cases based on industry best practices and previous project experience',
                        outcome: 'Test cases should be based on project context and requirements.',
                        experience: -5
                    },
                    {
                        text: 'Analyze historical test results',
                        outcome: 'While helpful, previous results don\'t replace understanding current context.',
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
                        text: 'Research user needs',
                        outcome: 'Perfect! User-centric thinking is essential for effective testing.',
                        experience: 15,
                        tool: 'User Persona Template'
                    },
                    {
                        text: 'Apply personal usage patterns and preferences to determine the most likely user behaviors and testing scenarios',
                        outcome: 'Users have diverse needs and characteristics that must be considered.',
                        experience: -5
                    },
                    {
                        text: 'Conduct detailed technical analysis of system architecture and performance metrics to establish testing priorities',
                        outcome: 'Technical aspects are important but user needs are crucial.',
                        experience: -5
                    },
                    {
                        text: 'Wait for post-release feedback',
                        outcome: 'Understanding users before testing helps prevent issues.',
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
                        text: 'Document environment differences',
                        outcome: 'Excellent! Understanding environment differences is crucial for testing.',
                        experience: 15,
                        tool: 'Environment Comparison Tool'
                    },
                    {
                        text: 'Proceed with testing while monitoring for any potential environmental impact on test results',
                        outcome: 'Environment differences can affect test results and miss issues.',
                        experience: -5
                    },
                    {
                        text: 'Execute test cases in the production environment to ensure accurate results',
                        outcome: 'Testing in production without proper controls is risky.',
                        experience: -10
                    },
                    {
                        text: 'Request environment replication',
                        outcome: 'Good thinking, but first document current differences.',
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
                        text: 'Document with steps and results',
                        outcome: 'Perfect! Clear documentation helps developers fix issues efficiently.',
                        experience: 15,
                        tool: 'Issue Documentation Template'
                    },
                    {
                        text: 'Initiate multiple communication channels including chat messages, emails, and verbal discussions for each discovered issue',
                        outcome: 'Informal communication isn\'t sufficient for tracking issues.',
                        experience: -5
                    },
                    {
                        text: 'Capture and archive comprehensive visual documentation through multiple screenshot angles and screen recordings',
                        outcome: 'Screenshots alone don\'t provide enough context.',
                        experience: -10
                    },
                    {
                        text: 'Create brief descriptions only',
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
                        text: 'Start testing without planning',
                        outcome: 'Lack of planning can lead to inefficient testing.',
                        experience: -5
                    },
                    {
                        text: 'Copy test plan from previous project',
                        outcome: 'Each project needs its own tailored test approach.',
                        experience: -5
                    },
                    {
                        text: 'Ask developers what to test',
                        outcome: 'Developer input helps but proper planning is needed.',
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
                        text: 'Follow a strict test script',
                        outcome: 'Exploratory testing needs flexibility and creativity.',
                        experience: -10
                    },
                    {
                        text: 'Test only happy paths',
                        outcome: 'Exploratory testing should cover various scenarios.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on finding bugs',
                        outcome: 'Understanding the system is also important.',
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
                        text: 'Document the issue and continue with test cases',
                        outcome: 'Excellent! Balance following scripts while noting other issues.',
                        experience: 20,
                        tool: 'Test Case Management'
                    },
                    {
                        text: 'Ignore it as it\'s not in the test cases',
                        outcome: 'All issues should be documented, even if outside scope.',
                        experience: -15
                    },
                    {
                        text: 'Stop scripted testing to investigate',
                        outcome: 'Document the issue but complete planned testing first.',
                        experience: 0
                    },
                    {
                        text: 'Add new test cases immediately',
                        outcome: 'Document first, update test cases after current execution.',
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
                        text: 'Stick to initial test plan only',
                        outcome: 'Support requires adapting to changing needs.',
                        experience: -10
                    },
                    {
                        text: 'Wait for tasks to be assigned',
                        outcome: 'Proactive support is more valuable than reactive.',
                        experience: -5
                    },
                    {
                        text: 'Focus only on new features',
                        outcome: 'Support includes both new and existing functionality.',
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
                        text: 'Wait to see if it becomes an issue',
                        outcome: 'Early risk identification helps prevent issues.',
                        experience: -15
                    },
                    {
                        text: 'Try to fix it yourself',
                        outcome: 'Risks should be communicated to appropriate stakeholders.',
                        experience: -5
                    },
                    {
                        text: 'Mention it in the next meeting',
                        outcome: 'Risks need prompt communication, not delayed reporting.',
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
                        outcome: 'Too broad an approach can be inefficient.',
                        experience: -5
                    },
                    {
                        text: 'Use risk-based testing',
                        outcome: 'Perfect! Prioritizing based on risk is efficient.',
                        experience: 20,
                        tool: 'Risk Assessment Matrix'
                    },
                    {
                        text: 'Execute extensive regression testing protocols while maintaining detailed coverage metrics and trend analysis',
                        outcome: 'Regression testing alone doesn\'t ensure complete coverage.',
                        experience: -10
                    },
                    {
                        text: 'Conduct thorough analysis of all system components and their interconnected dependencies',
                        outcome: 'System analysis should be guided by risk assessment.',
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
                        text: 'Alert incident team with evidence and begin systematic investigation',
                        outcome: 'Excellent! Quick escalation and systematic approach is crucial.',
                        experience: 25,
                        tool: 'Incident Response Protocol'
                    },
                    {
                        text: 'Start fixing the bug immediately',
                        outcome: 'Follow incident response process before attempting fixes.',
                        experience: -15
                    },
                    {
                        text: 'Document the issue for next sprint',
                        outcome: 'Critical issues need immediate attention.',
                        experience: -15
                    },
                    {
                        text: 'Investigate root cause before alerting anyone',
                        outcome: 'Alert team first, then investigate systematically.',
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
                        text: 'Review changes, update strategy, and communicate impacts',
                        outcome: 'Perfect! Systematic adaptation ensures continued effectiveness.',
                        experience: 25,
                        tool: 'Strategy Adaptation Framework'
                    },
                    {
                        text: 'Continue with original strategy',
                        outcome: 'Strategy must evolve with project changes.',
                        experience: -20
                    },
                    {
                        text: 'Create entirely new strategy',
                        outcome: 'Modify existing strategy rather than starting over.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on new requirements',
                        outcome: 'Consider both new and existing requirements.',
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
                        text: 'Prioritize critical functionality and communicate constraints',
                        outcome: 'Excellent! Risk-based prioritization maximizes value.',
                        experience: 25,
                        tool: 'Test Prioritization Matrix'
                    },
                    {
                        text: 'Try to test everything quickly',
                        outcome: 'Rushed testing may miss critical issues.',
                        experience: -20
                    },
                    {
                        text: 'Skip testing lower priority items',
                        outcome: 'Communicate and agree on scope reduction.',
                        experience: -10
                    },
                    {
                        text: 'Request deadline extension only',
                        outcome: 'Prioritization needed even with extended deadline.',
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
                        text: 'Facilitate discussion to align on best practices and document agreement',
                        outcome: 'Perfect! Collaborative alignment improves team effectiveness.',
                        experience: 25,
                        tool: 'Test Approach Alignment Guide'
                    },
                    {
                        text: 'Let each person use their preferred approach',
                        outcome: 'Inconsistent approaches can affect quality.',
                        experience: -20
                    },
                    {
                        text: 'Enforce your preferred approach',
                        outcome: 'Collaboration is better than enforcement.',
                        experience: -15
                    },
                    {
                        text: 'Escalate to management immediately',
                        outcome: 'Try team discussion before escalation.',
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
                        text: 'Accept the reduced timeline without discussion',
                        outcome: 'Quality concerns should be raised professionally.',
                        experience: -30
                    },
                    {
                        text: 'Refuse to reduce testing time',
                        outcome: 'Collaborate to find balanced solutions.',
                        experience: -20
                    },
                    {
                        text: 'Reduce test coverage without analysis',
                        outcome: 'Impact analysis needed before reducing coverage.',
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
        const progress = {
            experience: this.player.experience,
            tools: this.player.tools,
            currentScenario: this.player.currentScenario,
            questionHistory: this.player.questionHistory,
            lastUpdated: new Date().toISOString()
        };

        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot save progress');
                return;
            }
            
            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify({ progress }));
            
            await this.apiService.saveQuizProgress(this.quizName, progress);
            console.log('Progress saved successfully:', progress);
        } catch (error) {
            console.error('Failed to save progress:', error);
            // Continue without saving - don't interrupt the user experience
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
                progress = savedProgress.data;
                console.log('Loaded progress from API:', progress);
            } else {
                // Try loading from localStorage
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (parsed.progress) {
                        progress = parsed.progress;
                        console.log('Loaded progress from localStorage:', progress);
                    }
                }
            }

            if (progress) {
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                
                // Set the current scenario to the actual value from progress
                this.player.currentScenario = progress.currentScenario || 0;

                // Update UI
                this.updateProgress();

                // Update the questions progress display
                const questionsProgress = document.getElementById('questions-progress');
                if (questionsProgress) {
                    questionsProgress.textContent = `${this.player.questionHistory.length}/15`;
                }

                // Update the current scenario display
                const currentScenarioDisplay = document.getElementById('current-scenario');
                if (currentScenarioDisplay) {
                    currentScenarioDisplay.textContent = `${this.player.currentScenario}`;
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

            // Update player state
            this.player.experience = Math.max(0, Math.min(this.maxXP, this.player.experience + selectedAnswer.experience));
                     
            // Add status to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                status: selectedAnswer.experience > 0 ? 'passed' : 'failed',
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience))
            });;

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
            document.getElementById('outcome-text').textContent = selectedAnswer.outcome;
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

    endGame(failed = false) {
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
                const result = {
                    score: scorePercentage,
                    status: failed ? 'failed' : 'passed',
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory,
                    questionsAnswered: this.player.questionHistory.length,
                    lastActive: new Date().toISOString()
                };
                user.updateQuizScore(this.quizName, result);
                console.log('Final quiz score saved:', result);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

        const performanceSummary = document.getElementById('performance-summary');
        if (failed) {
            performanceSummary.textContent = 'Quiz failed. You did not meet the minimum XP requirement to progress. Please reset your progress to try again.';
            // Hide restart button if failed
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.style.display = 'none';
            }
        } else {
            const threshold = this.performanceThresholds.find(t => finalScore >= t.threshold);
            performanceSummary.textContent = threshold.message;
        }

        // Display question review
        const reviewList = document.getElementById('question-review');
        reviewList.innerHTML = '';
        
        this.player.questionHistory.forEach((record, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            const maxXP = record.maxPossibleXP;
            const earnedXP = record.selectedAnswer.experience;
            const isCorrect = earnedXP === maxXP;
            
            reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
            
            reviewItem.innerHTML = `
                <h4>Question ${index + 1}</h4>
                <p>${record.scenario.description}</p>
                <p><strong>Your Answer:</strong> ${record.selectedAnswer.text}</p>
                <p><strong>Outcome:</strong> ${record.selectedAnswer.outcome}</p>
                <p><strong>Experience Earned:</strong> ${earnedXP}/${maxXP}</p>
            `;
            
            reviewList.appendChild(reviewItem);
        });

        this.generateRecommendations();
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new TesterMindsetQuiz();
    quiz.startGame();
}); 
