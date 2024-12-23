class IssueVerificationQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
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

        // Basic Scenarios (IDs 1-5, 75 XP total)
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
                        text: 'Verify tickets in chronological order',
                        outcome: 'Priority and severity should guide verification order.',
                        experience: -10
                    },
                    {
                        text: 'Start with easiest tickets',
                        outcome: 'Critical issues need verification first.',
                        experience: -5
                    },
                    {
                        text: 'Verify random tickets',
                        outcome: 'Structured prioritization is needed.',
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
                        text: 'Test on any available device',
                        outcome: 'Original environment should be prioritized.',
                        experience: -10
                    },
                    {
                        text: 'Skip device-specific issues',
                        outcome: 'Device-specific issues need verification.',
                        experience: -5
                    },
                    {
                        text: 'Mark as verified without testing',
                        outcome: 'Actual verification is required.',
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
                        text: 'Just update the status',
                        outcome: 'Detailed comments are required.',
                        experience: -10
                    },
                    {
                        text: 'Write "fixed" or "not fixed"',
                        outcome: 'More detailed documentation needed.',
                        experience: -5
                    },
                    {
                        text: 'Only add screenshots',
                        outcome: 'Written documentation needed with evidence.',
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
                        text: 'Quick unlabeled screenshots',
                        outcome: 'Evidence needs clear highlighting.',
                        experience: -10
                    },
                    {
                        text: 'Skip evidence capture',
                        outcome: 'Evidence is important for verification.',
                        experience: -5
                    },
                    {
                        text: 'Rushed video capture',
                        outcome: 'Clear, repeated demonstrations needed.',
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
                        text: 'Mark as Partially Fixed with detailed explanation of remaining issues',
                        outcome: 'Perfect! This accurately reflects partial fixes.',
                        experience: 15,
                        tool: 'Status Management'
                    },
                    {
                        text: 'Mark as Fixed',
                        outcome: 'Partial fixes need specific status.',
                        experience: -10
                    },
                    {
                        text: 'Mark as Not Fixed',
                        outcome: 'Acknowledge partial improvements.',
                        experience: -5
                    },
                    {
                        text: 'Leave status unchanged',
                        outcome: 'Status needs updating with verification.',
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
                title: 'Regression Testing',
                description: 'After verifying fixes, how do you approach regression testing?',
                options: [
                    {
                        text: 'Focus on areas where fixes were implemented, while also checking surrounding functionality',
                        outcome: 'Perfect! This ensures thorough regression coverage.',
                        experience: 25,
                        tool: 'Regression Testing'
                    },
                    {
                        text: 'Only check fixed issues',
                        outcome: 'Surrounding areas need testing too.',
                        experience: -15
                    },
                    {
                        text: 'Skip regression testing',
                        outcome: 'Regression is crucial after fixes.',
                        experience: -10
                    },
                    {
                        text: 'Test random areas',
                        outcome: 'Focus needed on changed areas.',
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
                        experience: 25,
                        tool: 'Time Management'
                    },
                    {
                        text: 'Verify tickets until done',
                        outcome: 'Time needs allocation for regression.',
                        experience: -15
                    },
                    {
                        text: 'Focus only on regression',
                        outcome: 'Verification needs proper time allocation.',
                        experience: -10
                    },
                    {
                        text: 'No time planning',
                        outcome: 'Structured time management needed.',
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
                        experience: 25,
                        tool: 'Issue Management'
                    },
                    {
                        text: 'Add to existing tickets',
                        outcome: 'New issues need separate tickets.',
                        experience: -15
                    },
                    {
                        text: 'Ignore new issues',
                        outcome: 'All issues need documentation.',
                        experience: -10
                    },
                    {
                        text: 'Only mention in summary',
                        outcome: 'New issues need proper tickets.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Device Availability',
                description: 'Original test device isn\'t available. How do you proceed?',
                options: [
                    {
                        text: 'Contact device owner early, check device lists, consider BrowserStack with PM approval',
                        outcome: 'Excellent! This shows proper device management.',
                        experience: 25,
                        tool: 'Resource Management'
                    },
                    {
                        text: 'Skip device-specific issues',
                        outcome: 'Alternative solutions should be explored.',
                        experience: -15
                    },
                    {
                        text: 'Test on different device without noting',
                        outcome: 'Environment differences need documentation.',
                        experience: -10
                    },
                    {
                        text: 'Mark as cannot test',
                        outcome: 'Explore alternative testing options.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Client Communication',
                description: 'Client hasn\'t updated ticket statuses. How do you proceed?',
                options: [
                    {
                        text: 'Contact PM to confirm which issues have been worked on, prioritize known fixed issues',
                        outcome: 'Perfect! This ensures efficient verification.',
                        experience: 25,
                        tool: 'Communication'
                    },
                    {
                        text: 'Test all tickets',
                        outcome: 'Prioritization needed for efficiency.',
                        experience: -15
                    },
                    {
                        text: 'Wait for updates',
                        outcome: 'Proactive communication needed.',
                        experience: -10
                    },
                    {
                        text: 'Skip verification',
                        outcome: 'Verification needed with prioritization.',
                        experience: 0
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15, 100 XP total)
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
                        experience: 20,
                        tool: 'Complex Testing'
                    },
                    {
                        text: 'Only test main feature',
                        outcome: 'Connected features need verification.',
                        experience: -15
                    },
                    {
                        text: 'Quick check only',
                        outcome: 'Complex issues need thorough testing.',
                        experience: -10
                    },
                    {
                        text: 'Mark as too complex',
                        outcome: 'All issues need proper verification.',
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
                        text: 'Test each environment, document specific behaviors, note any variations',
                        outcome: 'Excellent! This provides complete environment coverage.',
                        experience: 20,
                        tool: 'Environment Testing'
                    },
                    {
                        text: 'Test one environment only',
                        outcome: 'All affected environments need testing.',
                        experience: -15
                    },
                    {
                        text: 'Assume same behavior',
                        outcome: 'Environment variations need verification.',
                        experience: -10
                    },
                    {
                        text: 'Mark as too complex',
                        outcome: 'Environment differences need documentation.',
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
                        text: 'Map fix relationships, test impacted areas, document any cascading effects',
                        outcome: 'Perfect! This ensures comprehensive regression analysis.',
                        experience: 20,
                        tool: 'Impact Analysis'
                    },
                    {
                        text: 'Test fixes in isolation',
                        outcome: 'Related impacts need assessment.',
                        experience: -15
                    },
                    {
                        text: 'Basic regression only',
                        outcome: 'Thorough impact analysis needed.',
                        experience: -10
                    },
                    {
                        text: 'Skip impact analysis',
                        outcome: 'Fix impacts need assessment.',
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
                        experience: 20,
                        tool: 'Reporting'
                    },
                    {
                        text: 'List fixed issues only',
                        outcome: 'All aspects need reporting.',
                        experience: -15
                    },
                    {
                        text: 'Basic status update',
                        outcome: 'Comprehensive reporting needed.',
                        experience: -10
                    },
                    {
                        text: 'Skip reporting',
                        outcome: 'Verification needs proper documentation.',
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
                        text: 'Analyze fix impact, regression findings, and new issues to recommend next steps',
                        outcome: 'Perfect! This provides informed testing recommendations.',
                        experience: 20,
                        tool: 'Quality Assessment'
                    },
                    {
                        text: 'Check fix count only',
                        outcome: 'Multiple factors need consideration.',
                        experience: -15
                    },
                    {
                        text: 'Wait for client decision',
                        outcome: 'Proactive assessment needed.',
                        experience: -10
                    },
                    {
                        text: 'Skip assessment',
                        outcome: 'Quality assessment is crucial.',
                        experience: -5
                    }
                ]
            }
        ];

        // Initialize screen elements
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');
        
        if (!this.gameScreen || !this.outcomeScreen || !this.endScreen) {
            throw new Error('Required screen elements not found');
        }

        this.initializeEventListeners();
        this.isLoading = false;

        this.apiService = new APIService();
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
                // Only restore if the progress is less than 24 hours old
                const lastUpdated = new Date(progress.lastUpdated);
                const now = new Date();
                const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);
                
                if (hoursSinceUpdate < 24) {
                    // Set the player state from progress
                    this.player.experience = progress.experience || 0;
                    this.player.tools = progress.tools || [];
                    this.player.questionHistory = progress.questionHistory || [];
                    
                    // Fixed: Set current scenario to the next unanswered question
                    this.player.currentScenario = this.player.questionHistory.length;

                    // Update UI
                    this.updateProgress();
                    return true;
                }
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
        const continueBtn = document.getElementById('continue-btn');
        const restartBtn = document.getElementById('restart-btn');
        const optionsForm = document.getElementById('options-form');

        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.nextScenario());
        }
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }
        if (optionsForm) {
            optionsForm.addEventListener('submit', (e) => {
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
        if (!scenario) {
            console.error('No scenario found for index:', this.player.currentScenario);
            console.log('Current scenarios:', currentScenarios);
            console.log('Current state:', {
                totalAnswered: this.player.questionHistory.length,
                currentXP: this.player.experience,
                currentScenario: this.player.currentScenario
            });
            return;
        }
        
        // Show level transition message at the start of each level
        const previousLevel = this.player.questionHistory.length > 0 ? 
            this.player.questionHistory[this.player.questionHistory.length - 1].scenario.level : null;
            
        if (this.player.currentScenario === 0 || previousLevel !== scenario.level) {
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = ''; // Clear any existing messages
                
                const levelMessage = document.createElement('div');
                levelMessage.className = 'level-transition';
                levelMessage.setAttribute('role', 'alert');
                levelMessage.textContent = `Starting ${scenario.level} Questions`;
                
                transitionContainer.appendChild(levelMessage);
                transitionContainer.classList.add('active');
                
                // Update the level indicator
                const levelIndicator = document.getElementById('level-indicator');
                if (levelIndicator) {
                    levelIndicator.textContent = `Level: ${scenario.level}`;
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
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience))
            });

            // Save progress with current scenario (before incrementing)
            await this.saveProgress();

            // Also save quiz result and update display
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
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
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
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

    showError(message) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.classList.remove('hidden');
            setTimeout(() => {
                errorContainer.classList.add('hidden');
            }, 3000);
        }
    }

    shouldEndGame(totalQuestionsAnswered, currentXP) {
        // End if max questions reached or all XP thresholds met
        return totalQuestionsAnswered >= 15 || currentXP >= this.maxXP;
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new IssueVerificationQuiz();
    quiz.startGame();
}); 
