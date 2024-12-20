class TimeManagementQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a time management expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong time management skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing time management best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Initialize screen references
        this.gameScreen = null;
        this.outcomeScreen = null;
        this.endScreen = null;
        
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

        // Basic Scenarios (15 XP per correct answer)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Weekly Planning',
                description: 'You\'re planning your work week ahead. What\'s your first priority?',
                options: [
                    {
                        text: 'Review calendar, upcoming meetings, and resource schedule',
                        outcome: 'Perfect! Comprehensive planning helps prepare for the week ahead.',
                        experience: 15,
                        tool: 'Weekly Planning Template'
                    },
                    {
                        text: 'Wait for daily assignments',
                        outcome: 'Proactive planning is better than reactive working.',
                        experience: -5
                    },
                    {
                        text: 'Focus only on immediate tasks',
                        outcome: 'Looking ahead helps prevent scheduling conflicts.',
                        experience: -5
                    },
                    {
                        text: 'Plan only meeting times',
                        outcome: 'Consider all activities, not just meetings.',
                        experience: 5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Workspace Organization',
                description: 'How do you prepare your workspace for efficient testing?',
                options: [
                    {
                        text: 'Clean workspace, organize tools, and ensure devices are charged',
                        outcome: 'Excellent! An organized workspace increases efficiency.',
                        experience: 15,
                        tool: 'Workspace Checklist'
                    },
                    {
                        text: 'Keep everything open from previous day',
                        outcome: 'A cluttered workspace can lead to confusion and inefficiency.',
                        experience: -5
                    },
                    {
                        text: 'Organize only when needed',
                        outcome: 'Regular organization prevents time waste during testing.',
                        experience: -5
                    },
                    {
                        text: 'Focus only on computer setup',
                        outcome: 'Consider both physical and digital workspace organization.',
                        experience: 5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Daily Preparation',
                description: 'You\'re starting your workday. What\'s your first step?',
                options: [
                    {
                        text: 'Review resource sheet and prepare for assigned projects',
                        outcome: 'Perfect! Early preparation ensures productive testing.',
                        experience: 15,
                        tool: 'Daily Planning Guide'
                    },
                    {
                        text: 'Start testing immediately',
                        outcome: 'Preparation time is crucial for effective testing.',
                        experience: -5
                    },
                    {
                        text: 'Wait for team standup',
                        outcome: 'Being prepared before standup is more efficient.',
                        experience: -5
                    },
                    {
                        text: 'Check emails only',
                        outcome: 'Consider all aspects of daily preparation.',
                        experience: 5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Meeting Management',
                description: 'You have multiple meetings scheduled. How do you manage them?',
                options: [
                    {
                        text: 'Plan for preparation and follow-up time around meetings',
                        outcome: 'Excellent! Consider the full impact of meetings on your schedule.',
                        experience: 15,
                        tool: 'Meeting Time Management'
                    },
                    {
                        text: 'Attend meetings without preparation',
                        outcome: 'Preparation ensures meetings are productive.',
                        experience: -5
                    },
                    {
                        text: 'Skip meetings to focus on testing',
                        outcome: 'Meetings are important for project coordination.',
                        experience: -5
                    },
                    {
                        text: 'Multitask during meetings',
                        outcome: 'Focus on one task at a time for better efficiency.',
                        experience: -5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Email Organization',
                description: 'How do you manage your project communications?',
                options: [
                    {
                        text: 'Create folders and organize by project, pin important channels',
                        outcome: 'Perfect! Organized communications improve efficiency.',
                        experience: 15,
                        tool: 'Communication Organization System'
                    },
                    {
                        text: 'Keep all emails in inbox',
                        outcome: 'Organized folders help find information quickly.',
                        experience: -5
                    },
                    {
                        text: 'Delete old messages',
                        outcome: 'Important information should be organized, not deleted.',
                        experience: -5
                    },
                    {
                        text: 'Mark as read without organizing',
                        outcome: 'Proper organization saves time later.',
                        experience: -5
                    }
                ]
            }
        ];

        // Intermediate Scenarios (25 XP per correct answer)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Project Documentation Review',
                description: 'You\'re assigned to a new project. How do you approach the documentation review?',
                options: [
                    {
                        text: 'Review SoW and all available documentation before starting',
                        outcome: 'Excellent! Understanding project scope is crucial for time management.',
                        experience: 25,
                        tool: 'Project Review Checklist'
                    },
                    {
                        text: 'Start testing and review docs as needed',
                        outcome: 'Prior review prevents wasted time during testing.',
                        experience: -10
                    },
                    {
                        text: 'Ask colleagues for a quick summary',
                        outcome: 'Direct document review provides better understanding.',
                        experience: -10
                    },
                    {
                        text: 'Wait for project manager to explain',
                        outcome: 'Proactive review allows better questions in briefings.',
                        experience: 5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Time Allocation',
                description: 'How do you determine time allocation for different test areas?',
                options: [
                    {
                        text: 'Analyze SoW timings and adjust based on complexity and priorities',
                        outcome: 'Perfect! Strategic time allocation ensures comprehensive coverage.',
                        experience: 25,
                        tool: 'Time Allocation Matrix'
                    },
                    {
                        text: 'Split time equally between all areas',
                        outcome: 'Different areas need different time allocations based on complexity.',
                        experience: -10
                    },
                    {
                        text: 'Focus on areas you\'re familiar with',
                        outcome: 'Time allocation should be based on project needs, not familiarity.',
                        experience: -10
                    },
                    {
                        text: 'Follow previous project timings',
                        outcome: 'Each project needs its own time analysis.',
                        experience: 5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Risk Identification',
                description: 'You identify potential timing risks in a project. What\'s your approach?',
                options: [
                    {
                        text: 'Document risks and communicate with project manager promptly',
                        outcome: 'Excellent! Early risk communication allows for mitigation.',
                        experience: 25,
                        tool: 'Risk Assessment Template'
                    },
                    {
                        text: 'Try to handle risks yourself',
                        outcome: 'Risks should be communicated to project management.',
                        experience: -10
                    },
                    {
                        text: 'Wait to see if risks materialize',
                        outcome: 'Early risk identification prevents project delays.',
                        experience: -10
                    },
                    {
                        text: 'Mention risks in daily standup',
                        outcome: 'Risks need prompt, formal communication.',
                        experience: 5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Progress Monitoring',
                description: 'How do you track testing progress against allocated time?',
                options: [
                    {
                        text: 'Regularly assess progress and adjust plans as needed',
                        outcome: 'Perfect! Regular monitoring allows timely adjustments.',
                        experience: 25,
                        tool: 'Progress Tracking System'
                    },
                    {
                        text: 'Check progress at end of day',
                        outcome: 'Regular checks throughout the day enable better control.',
                        experience: 5
                    },
                    {
                        text: 'Wait for project manager to ask',
                        outcome: 'Proactive progress monitoring prevents delays.',
                        experience: -10
                    },
                    {
                        text: 'Focus on testing without tracking',
                        outcome: 'Progress tracking is essential for time management.',
                        experience: -10
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Team Coordination',
                description: 'You\'re testing with a team. How do you manage shared time and resources?',
                options: [
                    {
                        text: 'Coordinate coverage and communicate progress regularly',
                        outcome: 'Excellent! Team coordination maximizes efficiency.',
                        experience: 25,
                        tool: 'Team Coordination Framework'
                    },
                    {
                        text: 'Work independently on separate areas',
                        outcome: 'Team coordination prevents duplication and gaps.',
                        experience: -10
                    },
                    {
                        text: 'Let project manager assign all tasks',
                        outcome: 'Team should actively coordinate while keeping PM informed.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on your assigned tasks',
                        outcome: 'Consider team context while working on assignments.',
                        experience: 5
                    }
                ]
            }
        ];

        // Advanced Scenarios (20 XP per correct answer)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Complex Project Prioritization',
                description: 'You\'re managing multiple high-priority test areas with limited time. How do you proceed?',
                options: [
                    {
                        text: 'Analyze core user journeys and business impact to prioritize coverage',
                        outcome: 'Excellent! Strategic prioritization maximizes test value.',
                        experience: 20,
                        tool: 'Priority Analysis Framework'
                    },
                    {
                        text: 'Test everything briefly',
                        outcome: 'Shallow coverage may miss critical issues.',
                        experience: -15
                    },
                    {
                        text: 'Focus on easiest areas first',
                        outcome: 'Prioritization should be based on importance, not ease.',
                        experience: -15
                    },
                    {
                        text: 'Request more time without analysis',
                        outcome: 'Analyze and prioritize before requesting extensions.',
                        experience: 5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Resource Constraints',
                description: 'Your project faces unexpected resource limitations. How do you adapt?',
                options: [
                    {
                        text: 'Reassess priorities and communicate impact on deliverables',
                        outcome: 'Perfect! Clear communication helps manage expectations.',
                        experience: 20,
                        tool: 'Resource Management Plan'
                    },
                    {
                        text: 'Continue as planned with fewer resources',
                        outcome: 'Resource changes require strategy adjustment.',
                        experience: -15
                    },
                    {
                        text: 'Reduce test coverage without discussion',
                        outcome: 'Coverage changes need stakeholder agreement.',
                        experience: -15
                    },
                    {
                        text: 'Focus only on new features',
                        outcome: 'Consider all testing needs when adapting plans.',
                        experience: -15
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Deadline Pressure',
                description: 'The project deadline is approaching but testing is behind schedule. What\'s your approach?',
                options: [
                    {
                        text: 'Evaluate progress, adjust priorities, and communicate status clearly',
                        outcome: 'Excellent! Transparent communication enables better decisions.',
                        experience: 20,
                        tool: 'Deadline Management Protocol'
                    },
                    {
                        text: 'Work overtime without updating stakeholders',
                        outcome: 'Status should be communicated to manage expectations.',
                        experience: -15
                    },
                    {
                        text: 'Rush through remaining tests',
                        outcome: 'Rushed testing compromises quality.',
                        experience: -15
                    },
                    {
                        text: 'Skip remaining tests',
                        outcome: 'Coverage changes need proper communication.',
                        experience: -15
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Quality vs Time Balance',
                description: 'You\'re pressured to reduce testing time without compromising quality. How do you handle this?',
                options: [
                    {
                        text: 'Present data-driven analysis of risks and propose focused testing strategy',
                        outcome: 'Perfect! Data-driven decisions help balance constraints.',
                        experience: 20,
                        tool: 'Quality-Time Analysis Tool'
                    },
                    {
                        text: 'Accept reduced time without discussion',
                        outcome: 'Impact analysis needed before accepting changes.',
                        experience: -15
                    },
                    {
                        text: 'Refuse to reduce testing time',
                        outcome: 'Propose solutions rather than refusing changes.',
                        experience: -15
                    },
                    {
                        text: 'Reduce documentation time only',
                        outcome: 'Documentation is crucial for project success.',
                        experience: -15
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Project Delivery Optimization',
                description: 'How do you ensure efficient project delivery while maintaining quality?',
                options: [
                    {
                        text: 'Balance priorities, monitor progress, and adjust strategy proactively',
                        outcome: 'Excellent! Dynamic management ensures efficient delivery.',
                        experience: 20,
                        tool: 'Delivery Optimization Framework'
                    },
                    {
                        text: 'Focus solely on speed of delivery',
                        outcome: 'Quality should not be sacrificed for speed.',
                        experience: -15
                    },
                    {
                        text: 'Maintain rigid plans despite changes',
                        outcome: 'Flexibility helps optimize delivery.',
                        experience: -15
                    },
                    {
                        text: 'Delegate all decisions to project manager',
                        outcome: 'Active participation improves delivery efficiency.',
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
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                const score = Math.round((this.player.experience / this.maxXP) * 100);
                await quizUser.updateQuizScore('time-management', score);
                
                // Update progress display on index page
                const progressElement = document.querySelector('#time-management-progress');
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
                        const quizItem = document.querySelector('[data-quiz="time-management"]');
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
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new TimeManagementQuiz();
    quiz.startGame();
}); 