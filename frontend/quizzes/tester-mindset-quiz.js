class TesterMindsetQuiz extends BaseQuiz {
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
        
        // Set the quiz name
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

        // Basic Scenarios (Focus on fundamental mindset concepts)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Project Context',
                description: 'You\'re starting a new testing project. What\'s your first priority?',
                options: [
                    {
                        text: 'Review project context and requirements documentation',
                        outcome: 'Excellent! Understanding context is crucial for effective testing.',
                        experience: 15,
                        tool: 'Context Analysis Framework'
                    },
                    {
                        text: 'Start testing immediately to find bugs quickly',
                        outcome: 'Without understanding context, testing may miss critical issues.',
                        experience: -5
                    },
                    {
                        text: 'Create test cases without reviewing documentation',
                        outcome: 'Test cases should be based on project context and requirements.',
                        experience: -5
                    },
                    {
                        text: 'Ask for previous test results only',
                        outcome: 'While helpful, previous results don\'t replace understanding current context.',
                        experience: 5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Understanding Audience',
                description: 'How do you approach understanding the target audience for a new project?',
                options: [
                    {
                        text: 'Consider user characteristics, needs, and potential barriers',
                        outcome: 'Perfect! User-centric thinking is essential for effective testing.',
                        experience: 15,
                        tool: 'User Persona Template'
                    },
                    {
                        text: 'Assume all users are like you',
                        outcome: 'Users have diverse needs and characteristics that must be considered.',
                        experience: -5
                    },
                    {
                        text: 'Focus only on technical requirements',
                        outcome: 'Technical aspects are important but user needs are crucial.',
                        experience: -5
                    },
                    {
                        text: 'Wait for user feedback after release',
                        outcome: 'Understanding users before testing helps prevent issues.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Test Environment',
                description: 'The test environment is different from production. What\'s your approach?',
                options: [
                    {
                        text: 'Compare environment configurations and document differences',
                        outcome: 'Excellent! Understanding environment differences is crucial for testing.',
                        experience: 15,
                        tool: 'Environment Comparison Tool'
                    },
                    {
                        text: 'Ignore the differences and continue testing',
                        outcome: 'Environment differences can affect test results and miss issues.',
                        experience: -5
                    },
                    {
                        text: 'Test only in production',
                        outcome: 'Testing in production without proper controls is risky.',
                        experience: -10
                    },
                    {
                        text: 'Request a production clone',
                        outcome: 'Good thinking, but first document current differences.',
                        experience: 10
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Test Documentation',
                description: 'You\'ve found several issues. How do you document them?',
                options: [
                    {
                        text: 'Create detailed reports with steps, expected vs actual results',
                        outcome: 'Perfect! Clear documentation helps developers fix issues efficiently.',
                        experience: 15,
                        tool: 'Issue Documentation Template'
                    },
                    {
                        text: 'Send quick chat messages about each issue',
                        outcome: 'Informal communication isn\'t sufficient for tracking issues.',
                        experience: -5
                    },
                    {
                        text: 'Take screenshots without explanation',
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

        // Intermediate Scenarios (Different testing approaches)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Exploratory Testing',
                description: 'You\'re conducting exploratory testing. What\'s your mindset?',
                options: [
                    {
                        text: 'Be curious, investigative, and think outside the box',
                        outcome: 'Perfect! Exploratory testing requires creative thinking.',
                        experience: 25,
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
                        experience: 25,
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
                        experience: 25,
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
                        experience: 25,
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
                        text: 'Create coverage matrix mapping requirements to test cases',
                        outcome: 'Perfect! Systematic approach ensures comprehensive coverage.',
                        experience: 25,
                        tool: 'Coverage Mapping Tool'
                    },
                    {
                        text: 'Test until no more bugs are found',
                        outcome: 'Coverage should be requirement-based, not time-based.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on main functionality',
                        outcome: 'Complete coverage includes edge cases and alternatives.',
                        experience: -5
                    },
                    {
                        text: 'Follow previous test patterns',
                        outcome: 'Each feature needs its own coverage analysis.',
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
                        experience: 20,
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
                        experience: 20,
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
                        experience: 20,
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
                        experience: 20,
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
                        experience: 20,
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
        // Initialize UI and add event listeners
        this.initializeEventListeners();

        this.apiService = new APIService();

        // Add references to screens
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        
        if (!this.gameScreen || !this.outcomeScreen) {
            console.error('Required screen elements not found');
        }

        this.isLoading = false;
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
            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) {
                console.error('No user found, cannot save progress');
                return;
            }
            
            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${currentUser}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify({ progress }));
            
            await this.apiService.saveQuizProgress(this.quizName, progress);
        } catch (error) {
            console.error('Failed to save progress:', error);
            // Continue without saving - don't interrupt the user experience
        }
    }

    async loadProgress() {
        try {
            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) {
                console.error('No user found, cannot load progress');
                return false;
            }

            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${currentUser}_${this.quizName}`;
            const savedProgress = await this.apiService.getQuizProgress(this.quizName);
            let progress = null;
            
            if (savedProgress && savedProgress.data) {
                progress = savedProgress.data;
            } else {
                // Try loading from localStorage
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (parsed.progress) {
                        progress = parsed.progress;
                    }
                }
            }

            if (progress) {
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                
                // Set the current scenario based on the number of completed questions
                const completedQuestions = this.player.questionHistory.length;
                this.player.currentScenario = completedQuestions;

                // Update UI
                this.updateProgress();
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
            // Show loading state
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.remove('hidden');
            }
            
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
        document.getElementById('continue-btn').addEventListener('click', () => this.nextScenario());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());

        // Add form submission handler
        document.getElementById('options-form').addEventListener('submit', (e) => {
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
        
        // Check if quiz should end
        if (this.player.questionHistory.length >= 15) {
            this.endGame();
            return;
        }
        
        if (this.player.currentScenario >= currentScenarios.length) {
            const totalQuestionsAnswered = this.player.questionHistory.length;
            
            if (this.shouldEndGame(totalQuestionsAnswered, this.player.experience)) {
                this.endGame();
                return;
            }
            
            this.player.currentScenario = 0;
            this.displayScenario();
            return;
        }

        const scenario = currentScenarios[this.player.currentScenario];
        
        // Show level transition message at the start of each level
        const previousLevel = this.player.questionHistory.length > 0 ? 
            this.player.questionHistory[this.player.questionHistory.length - 1].scenario.level : null;
            
        if (this.player.currentScenario === 0 || previousLevel !== scenario.level) {
            const transitionContainer = document.getElementById('level-transition-container');
            transitionContainer.innerHTML = ''; // Clear any existing messages
            
            const levelMessage = document.createElement('div');
            levelMessage.className = 'level-transition';
            levelMessage.setAttribute('role', 'alert');
            levelMessage.textContent = `Starting ${scenario.level} Questions`;
            
            transitionContainer.appendChild(levelMessage);
            transitionContainer.classList.add('active');
            
            // Update the level indicator
            document.getElementById('level-indicator').textContent = `Level: ${scenario.level}`;
            
            // Remove the message and container height after animation
            setTimeout(() => {
                transitionContainer.classList.remove('active');
                setTimeout(() => {
                    transitionContainer.innerHTML = '';
                }, 300); // Wait for height transition to complete
            }, 3000);
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

        document.getElementById('scenario-title').textContent = scenario.title;
        document.getElementById('scenario-description').textContent = scenario.description;
        
        const optionsContainer = document.getElementById('options-container');
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
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience))
            });

            // Save progress with current scenario (before incrementing)
            await this.saveProgress();

            // Also save quiz result and update display
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                const quizUser = new QuizUser(currentUser);
                const score = Math.round((this.player.experience / this.maxXP) * 100);
                await quizUser.updateQuizScore(this.quizName, score);
                
                // Update progress display on index page
                const progressElement = document.querySelector(`#${this.quizName}-progress`);
                if (progressElement) {
                    const totalQuestions = 15;
                    const completedQuestions = this.player.questionHistory.length;
                    const percentComplete = Math.round((completedQuestions / totalQuestions) * 100);
                    
                    // Only update if we're on the index page and this is the current user
                    const onIndexPage = window.location.pathname.endsWith('index.html');
                    if (onIndexPage) {
                        progressElement.textContent = `${percentComplete}% Complete`;
                        progressElement.classList.remove('hidden');
                        
                        // Update quiz item styling
                        const quizItem = document.querySelector(`[data-quiz="${this.quizName}"]`);
                        if (quizItem) {
                            quizItem.classList.remove('completed', 'in-progress');
                            if (percentComplete === 100) {
                                quizItem.classList.add('completed');
                                progressElement.classList.add('completed');
                                progressElement.classList.remove('in-progress');
                            } else if (percentComplete > 0) {
                                quizItem.classList.add('in-progress');
                                progressElement.classList.add('in-progress');
                                progressElement.classList.remove('completed');
                            }
                        }
                    }
                }
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
            const completedQuestions = this.player.questionHistory.length;
            const currentQuestion = completedQuestions + 1;
            
            // Update question counter
            questionProgress.textContent = `Question: ${currentQuestion}/${totalQuestions}`;
            
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

    nextScenario() {
        // Increment scenario counter
        this.player.currentScenario++;
        
        // Hide outcome screen
        this.outcomeScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        
        // Display next scenario
        this.displayScenario();
    }

    endGame() {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        const finalScore = Math.min(this.player.experience, this.maxXP);
        const scorePercentage = Math.round((finalScore / this.maxXP) * 100);
        
        // Save the final quiz result
        const currentUsername = localStorage.getItem('currentUser');
        if (currentUsername) {
            try {
                const user = new QuizUser(currentUsername);
                user.updateQuizScore(this.quizName, scorePercentage);
                console.log('Final quiz score saved:', scorePercentage);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

        const performanceSummary = document.getElementById('performance-summary');
        const threshold = this.performanceThresholds.find(t => finalScore >= t.threshold);
        performanceSummary.textContent = threshold.message;

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
