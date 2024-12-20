class BuildVerificationQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a BVT expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong understanding of BVT!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing BVT best practices and try again!' }
            ]
        };
        
        super(config);
        
        Object.defineProperty(this, 'quizName', {
            value: 'build-verification',
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

        // Basic Scenarios
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'BVT Purpose',
                description: 'What is the primary purpose of Build Verification Testing?',
                options: [
                    {
                        text: 'To validate core functionality and stability of each new build before further testing',
                        outcome: 'Correct! BVT ensures basic functionality works before deeper testing.',
                        experience: 15,
                        tool: 'BVT Fundamentals'
                    },
                    {
                        text: 'To find all possible bugs in the software',
                        outcome: 'BVT focuses on core functionality, not exhaustive testing.',
                        experience: -10
                    },
                    {
                        text: 'To replace other forms of testing',
                        outcome: 'BVT complements other testing types, not replaces them.',
                        experience: -5
                    },
                    {
                        text: 'To test only new features',
                        outcome: 'BVT checks core functionality, including existing features.',
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Test Case Priority',
                description: 'When writing BVT test cases, what should be your main focus?',
                options: [
                    {
                        text: 'Critical functionality and core features that must work for basic operation',
                        outcome: 'Perfect! BVT prioritizes critical functionality.',
                        experience: 15,
                        tool: 'Test Case Prioritization'
                    },
                    {
                        text: 'Minor UI improvements',
                        outcome: 'BVT focuses on critical functionality, not minor improvements.',
                        experience: -10
                    },
                    {
                        text: 'Edge cases only',
                        outcome: 'Core functionality takes priority in BVT.',
                        experience: -5
                    },
                    {
                        text: 'Documentation updates',
                        outcome: 'BVT verifies functionality, not documentation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'BVT Scope',
                description: 'What should be the focus of Build Verification Testing?',
                options: [
                    {
                        text: 'Critical functionality and core features that must work for basic operation',
                        outcome: 'Correct! BVT focuses on core functionality.',
                        experience: 15,
                        tool: 'Scope Management'
                    },
                    {
                        text: 'All possible bugs in the system',
                        outcome: 'BVT is not meant to be exhaustive testing.',
                        experience: -10
                    },
                    {
                        text: 'Only UI improvements',
                        outcome: 'Core functionality is more important for BVT.',
                        experience: -5
                    },
                    {
                        text: 'Only new features',
                        outcome: 'BVT should cover core functionality, both new and existing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'BVT Timing',
                description: 'When should Build Verification Testing be performed?',
                options: [
                    {
                        text: 'After each new build, before further testing or integration',
                        outcome: 'Correct! Early verification prevents downstream issues.',
                        experience: 15,
                        tool: 'Test Timing'
                    },
                    {
                        text: 'Only at the end of development',
                        outcome: 'BVT should be done early to catch issues.',
                        experience: -10
                    },
                    {
                        text: 'Only during final release',
                        outcome: 'Early verification is crucial.',
                        experience: -5
                    },
                    {
                        text: 'When bugs are reported',
                        outcome: 'BVT is preventive, not reactive.',
                        experience: -5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'BVT Documentation',
                description: 'What is essential for BVT test cases?',
                options: [
                    {
                        text: 'Well-defined expected results and clear steps',
                        outcome: 'Perfect! Clear documentation ensures consistent execution.',
                        experience: 15,
                        tool: 'Documentation Standards'
                    },
                    {
                        text: 'Minimal documentation',
                        outcome: 'Clear documentation is crucial for BVT.',
                        experience: -10
                    },
                    {
                        text: 'Only pass/fail results',
                        outcome: 'Steps and expected results are needed.',
                        experience: -5
                    },
                    {
                        text: 'Just test titles',
                        outcome: 'Detailed documentation is required.',
                        experience: -5
                    }
                ]
            }
        ];

        // Intermediate Scenarios
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Test Environment Setup',
                description: 'How should you organize BVT test suites?',
                options: [
                    {
                        text: 'Break down by environment type rather than focus areas',
                        outcome: 'Excellent! This allows for consistent testing across environments.',
                        experience: 20,
                        tool: 'Environment Management'
                    },
                    {
                        text: 'Mix different environment tests together',
                        outcome: 'Keeping environments separate improves organization.',
                        experience: -15
                    },
                    {
                        text: 'Only test in one environment',
                        outcome: 'Multiple environments need verification.',
                        experience: -10
                    },
                    {
                        text: 'Skip environment organization',
                        outcome: 'Proper organization is crucial for BVT.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Test Case Maintenance',
                description: 'How should BVT test cases be maintained throughout development?',
                options: [
                    {
                        text: 'Regularly update to include new core features and maintain accuracy',
                        outcome: 'Perfect! Test cases must stay current and accurate.',
                        experience: 20,
                        tool: 'Test Case Management'
                    },
                    {
                        text: 'Leave test cases unchanged',
                        outcome: 'Test cases need updates as software evolves.',
                        experience: -15
                    },
                    {
                        text: 'Only update when tests fail',
                        outcome: 'Proactive updates are better than reactive.',
                        experience: -10
                    },
                    {
                        text: 'Remove outdated tests without replacement',
                        outcome: 'Replace outdated tests with updated versions.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Defect Handling',
                description: 'How should defects found during BVT be handled?',
                options: [
                    {
                        text: 'Report immediately as blocking issues for quick resolution',
                        outcome: 'Excellent! BVT failures need immediate attention.',
                        experience: 20,
                        tool: 'Defect Management'
                    },
                    {
                        text: 'Continue testing and report later',
                        outcome: 'BVT failures need immediate attention.',
                        experience: -15
                    },
                    {
                        text: 'Fix without reporting',
                        outcome: 'Proper documentation is needed.',
                        experience: -10
                    },
                    {
                        text: 'Treat as low priority',
                        outcome: 'BVT issues are typically high priority.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Test Coverage',
                description: 'What should BVT test coverage focus on?',
                options: [
                    {
                        text: 'Core functionality and critical paths across all environments',
                        outcome: 'Perfect! Focus on what\'s most important.',
                        experience: 20,
                        tool: 'Coverage Analysis'
                    },
                    {
                        text: 'Every possible scenario',
                        outcome: 'BVT should focus on core functionality.',
                        experience: -15
                    },
                    {
                        text: 'Random features',
                        outcome: 'Coverage should be strategic.',
                        experience: -10
                    },
                    {
                        text: 'Only new features',
                        outcome: 'Core functionality needs coverage.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Resource Allocation',
                description: 'How should resources be allocated for BVT?',
                options: [
                    {
                        text: 'Dedicated time and team members for quick execution',
                        outcome: 'Correct! Dedicated resources ensure timely BVT.',
                        experience: 20,
                        tool: 'Resource Planning'
                    },
                    {
                        text: 'When resources are available',
                        outcome: 'BVT needs dedicated resources.',
                        experience: -15
                    },
                    {
                        text: 'No specific allocation',
                        outcome: 'Resource planning is important.',
                        experience: -10
                    },
                    {
                        text: 'Only junior testers',
                        outcome: 'BVT needs experienced resources.',
                        experience: -5
                    }
                ]
            }
        ];

        // Advanced Scenarios
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'BVT Automation Decision',
                description: 'When considering BVT automation, what\'s the most important factor?',
                options: [
                    {
                        text: 'Frequency of test execution and resource availability',
                        outcome: 'Correct! These factors determine automation value.',
                        experience: 25,
                        tool: 'Automation Strategy'
                    },
                    {
                        text: 'Always automate everything',
                        outcome: 'Automation decisions need careful consideration.',
                        experience: -20
                    },
                    {
                        text: 'Never automate BVT',
                        outcome: 'Automation can be valuable for frequent BVT.',
                        experience: -15
                    },
                    {
                        text: 'Base decision on team size only',
                        outcome: 'Multiple factors affect automation decisions.',
                        experience: -10
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'BVT Evolution',
                description: 'How should BVT evolve during project lifecycle?',
                options: [
                    {
                        text: 'Continuously update based on new features and lessons learned',
                        outcome: 'Perfect! BVT should evolve with the project.',
                        experience: 25,
                        tool: 'Process Improvement'
                    },
                    {
                        text: 'Keep unchanged throughout',
                        outcome: 'BVT needs to adapt to changes.',
                        experience: -20
                    },
                    {
                        text: 'Remove old tests only',
                        outcome: 'Updates should be comprehensive.',
                        experience: -15
                    },
                    {
                        text: 'Change only when failed',
                        outcome: 'Proactive updates are better.',
                        experience: -10
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Communication Strategy',
                description: 'How should BVT results be communicated?',
                options: [
                    {
                        text: 'Clear, immediate reporting to all stakeholders with impact assessment',
                        outcome: 'Excellent! Effective communication is crucial.',
                        experience: 25,
                        tool: 'Communication Management'
                    },
                    {
                        text: 'Only report failures',
                        outcome: 'All results need reporting.',
                        experience: -20
                    },
                    {
                        text: 'Wait for questions',
                        outcome: 'Proactive communication needed.',
                        experience: -15
                    },
                    {
                        text: 'Technical team only',
                        outcome: 'All stakeholders need updates.',
                        experience: -10
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'BVT Metrics',
                description: 'What metrics are most important for BVT?',
                options: [
                    {
                        text: 'Pass/fail rate, execution time, and blocking issues found',
                        outcome: 'Perfect! These metrics help improve BVT process.',
                        experience: 25,
                        tool: 'Metrics Analysis'
                    },
                    {
                        text: 'Number of tests only',
                        outcome: 'Multiple metrics needed.',
                        experience: -20
                    },
                    {
                        text: 'Test execution time only',
                        outcome: 'More metrics are important.',
                        experience: -15
                    },
                    {
                        text: 'Random statistics',
                        outcome: 'Metrics should be meaningful.',
                        experience: -10
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'BVT Integration',
                description: 'How should BVT integrate with development workflow?',
                options: [
                    {
                        text: 'Seamlessly as part of CI/CD with clear pass/fail gates',
                        outcome: 'Excellent! Integration ensures consistent verification.',
                        experience: 25,
                        tool: 'CI/CD Integration'
                    },
                    {
                        text: 'As a separate process',
                        outcome: 'Integration with workflow is important.',
                        experience: -20
                    },
                    {
                        text: 'Only when requested',
                        outcome: 'Regular integration needed.',
                        experience: -15
                    },
                    {
                        text: 'After deployment only',
                        outcome: 'Earlier integration is better.',
                        experience: -10
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
    const quiz = new BuildVerificationQuiz();
    quiz.startGame();
}); 