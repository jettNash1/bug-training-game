class RaisingTicketsQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a ticket management expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong ticket handling skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing ticket management best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name as a non-configurable, non-writable property
        Object.defineProperty(this, 'quizName', {
            value: 'raising-tickets',
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
                title: 'Ticket Title Creation',
                description: 'You need to create a title for a mobile-specific issue on the homepage. What\'s the best format?',
                options: [
                    {
                        text: '[Mobile] Homepage - User Unable to Select \'Back\' CTA',
                        outcome: 'Perfect! This follows the correct format with environment, location, and issue.',
                        experience: 15,
                        tool: 'Title Formatting'
                    },
                    {
                        text: 'The back button is not working on mobile phones',
                        outcome: 'Titles should be concise and follow the proper format.',
                        experience: -10
                    },
                    {
                        text: 'Back CTA broken',
                        outcome: 'Title needs more specific information.',
                        experience: -5
                    },
                    {
                        text: 'URGENT: Mobile issue with back button',
                        outcome: 'Avoid emotional language, use proper format.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Steps to Reproduce',
                description: 'How should you document steps to reproduce an issue?',
                options: [
                    {
                        text: 'List numbered steps with specific actions and component names',
                        outcome: 'Excellent! This provides clear reproduction steps.',
                        experience: 15,
                        tool: 'Issue Documentation'
                    },
                    {
                        text: 'Write a general description',
                        outcome: 'Specific, numbered steps are required.',
                        experience: -10
                    },
                    {
                        text: 'Just include screenshots',
                        outcome: 'Written steps are needed with screenshots.',
                        experience: -5
                    },
                    {
                        text: 'Describe the end result only',
                        outcome: 'All steps need to be documented.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Severity Classification',
                description: 'You find a spelling error on the homepage. What severity level should you assign?',
                options: [
                    {
                        text: 'Cosmetic Issue/Typo',
                        outcome: 'Perfect! Spelling errors are cosmetic issues.',
                        experience: 15,
                        tool: 'Severity Assessment'
                    },
                    {
                        text: 'Blocking Issue',
                        outcome: 'Spelling errors don\'t block functionality.',
                        experience: -10
                    },
                    {
                        text: 'Major Impact',
                        outcome: 'Spelling errors have minimal impact.',
                        experience: -5
                    },
                    {
                        text: 'Feature Enhancement',
                        outcome: 'Spelling errors are cosmetic issues.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Reproduction Rate',
                description: 'You can reproduce an issue 3 out of 4 times. What\'s the appropriate reproduction rate?',
                options: [
                    {
                        text: '75% - Mostly reproducible',
                        outcome: 'Perfect! This accurately reflects the reproduction rate.',
                        experience: 15,
                        tool: 'Issue Analysis'
                    },
                    {
                        text: '99% - Consistently reproducible',
                        outcome: '99% means reproducing every time.',
                        experience: -10
                    },
                    {
                        text: '25% - Sporadic issue',
                        outcome: '25% is too low for 3 out of 4 times.',
                        experience: -5
                    },
                    {
                        text: '0% - Not reproducible',
                        outcome: 'The issue is clearly reproducible.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Supporting Material',
                description: 'What\'s the best approach for providing evidence of an issue?',
                options: [
                    {
                        text: 'Include clear videos/screenshots showing multiple reproductions and highlight problem areas',
                        outcome: 'Perfect! This provides comprehensive evidence.',
                        experience: 15,
                        tool: 'Evidence Documentation'
                    },
                    {
                        text: 'Quick single screenshot',
                        outcome: 'Multiple examples and clear highlighting needed.',
                        experience: -10
                    },
                    {
                        text: 'Text description only',
                        outcome: 'Visual evidence is important.',
                        experience: -5
                    },
                    {
                        text: 'Brief video without highlighting',
                        outcome: 'Highlighting and multiple examples needed.',
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
                title: 'Environment Documentation',
                description: 'You find an issue on multiple devices. How do you document the environments?',
                options: [
                    {
                        text: 'List primary environment first, then detail additional affected environments with specific versions',
                        outcome: 'Perfect! This provides clear environment context.',
                        experience: 25,
                        tool: 'Environment Documentation'
                    },
                    {
                        text: 'List only one environment',
                        outcome: 'All affected environments need documentation.',
                        experience: -15
                    },
                    {
                        text: 'Write "all environments"',
                        outcome: 'Specific environment details are needed.',
                        experience: -10
                    },
                    {
                        text: 'Only mention device types',
                        outcome: 'Version information is also important.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Query vs Bug',
                description: 'You\'re unsure if behavior matches requirements. How should you raise this?',
                options: [
                    {
                        text: 'Raise as a Query ticket with clear description of uncertainty and reference to requirements',
                        outcome: 'Excellent! This properly flags uncertainty for clarification.',
                        experience: 25,
                        tool: 'Issue Classification'
                    },
                    {
                        text: 'Raise as a bug',
                        outcome: 'Uncertainty should be raised as a query.',
                        experience: -15
                    },
                    {
                        text: 'Skip raising ticket',
                        outcome: 'Queries need documentation.',
                        experience: -10
                    },
                    {
                        text: 'Wait for clarification',
                        outcome: 'Raise query to get clarification.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Blocking Issue Communication',
                description: 'You find a blocking issue. What\'s the correct process?',
                options: [
                    {
                        text: 'Raise ticket immediately, mark as blocking, and follow client\'s preferred urgent communication channel',
                        outcome: 'Perfect! This follows proper blocking issue protocol.',
                        experience: 25,
                        tool: 'Critical Issue Management'
                    },
                    {
                        text: 'Wait until end of day',
                        outcome: 'Blocking issues need immediate attention.',
                        experience: -15
                    },
                    {
                        text: 'Only raise ticket',
                        outcome: 'Additional communication needed for blocking issues.',
                        experience: -10
                    },
                    {
                        text: 'Only email client',
                        outcome: 'Ticket needs raising alongside communication.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Feature Enhancement Suggestion',
                description: 'You notice a potential UX improvement. How do you raise this?',
                options: [
                    {
                        text: 'Raise as Feature Enhancement with clear rationale and user impact explanation',
                        outcome: 'Excellent! This provides constructive feedback.',
                        experience: 25,
                        tool: 'Enhancement Suggestions'
                    },
                    {
                        text: 'Raise as a bug',
                        outcome: 'Improvements should be Feature Enhancements.',
                        experience: -15
                    },
                    {
                        text: 'Skip suggestion',
                        outcome: 'UX improvements should be documented.',
                        experience: -10
                    },
                    {
                        text: 'Send informal feedback',
                        outcome: 'Use proper ticket process for suggestions.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Sporadic Issue Documentation',
                description: 'You observe an issue that occurs inconsistently. How do you document it?',
                options: [
                    {
                        text: 'Document exact conditions observed, include video evidence, note 25% reproduction rate',
                        outcome: 'Perfect! This properly documents sporadic issues.',
                        experience: 25,
                        tool: 'Inconsistent Issue Documentation'
                    },
                    {
                        text: 'Wait for consistent reproduction',
                        outcome: 'Sporadic issues need documentation.',
                        experience: -15
                    },
                    {
                        text: 'Mark as not reproducible',
                        outcome: 'Document observed conditions even if sporadic.',
                        experience: -10
                    },
                    {
                        text: 'Only note it happened once',
                        outcome: 'Include all observed details and rate.',
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
                title: 'Complex User Journey Issues',
                description: 'You find an issue that only occurs in a complex user flow. How do you document it?',
                options: [
                    {
                        text: 'Detail exact steps, include flow diagram, video evidence, and note any prerequisites',
                        outcome: 'Excellent! This ensures clear understanding of complex issues.',
                        experience: 20,
                        tool: 'Complex Issue Documentation'
                    },
                    {
                        text: 'Simplify steps',
                        outcome: 'Complex flows need detailed documentation.',
                        experience: -15
                    },
                    {
                        text: 'Only show end result',
                        outcome: 'All steps in complex flow needed.',
                        experience: -10
                    },
                    {
                        text: 'Skip complex scenarios',
                        outcome: 'Complex issues need proper documentation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Multiple Related Issues',
                description: 'You find several related issues across different areas. How do you document them?',
                options: [
                    {
                        text: 'Create separate tickets with cross-references and note potential common cause',
                        outcome: 'Perfect! This maintains clarity while showing relationships.',
                        experience: 20,
                        tool: 'Related Issue Management'
                    },
                    {
                        text: 'Create one combined ticket',
                        outcome: 'Separate tickets needed with cross-references.',
                        experience: -15
                    },
                    {
                        text: 'Only document major issues',
                        outcome: 'All related issues need documentation.',
                        experience: -10
                    },
                    {
                        text: 'Raise without connections',
                        outcome: 'Related issues should be cross-referenced.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Version-Specific Issues',
                description: 'An issue only appears in specific software versions. How do you handle this?',
                options: [
                    {
                        text: 'Document exact versions affected, include version comparison, note environment specifics',
                        outcome: 'Excellent! This provides clear version context.',
                        experience: 20,
                        tool: 'Version Management'
                    },
                    {
                        text: 'Note current version only',
                        outcome: 'All affected versions need documentation.',
                        experience: -15
                    },
                    {
                        text: 'Assume all versions affected',
                        outcome: 'Version specifics need verification.',
                        experience: -10
                    },
                    {
                        text: 'Skip version details',
                        outcome: 'Version information is crucial.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Performance Issue Documentation',
                description: 'You notice intermittent performance issues. How do you document them?',
                options: [
                    {
                        text: 'Include metrics, reproduction conditions, system state, and performance logs',
                        outcome: 'Perfect! This provides comprehensive performance context.',
                        experience: 20,
                        tool: 'Performance Documentation'
                    },
                    {
                        text: 'Note "site is slow"',
                        outcome: 'Specific metrics and conditions needed.',
                        experience: -15
                    },
                    {
                        text: 'Only include timing',
                        outcome: 'Multiple factors need documentation.',
                        experience: -10
                    },
                    {
                        text: 'Wait for consistent issues',
                        outcome: 'Document intermittent performance issues.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Security Issue Handling',
                description: 'You discover a potential security vulnerability. How do you handle it?',
                options: [
                    {
                        text: 'Raise as blocking, follow security protocol, limit sensitive details in public ticket',
                        outcome: 'Excellent! This follows security best practices.',
                        experience: 20,
                        tool: 'Security Issue Management'
                    },
                    {
                        text: 'Raise as normal bug',
                        outcome: 'Security issues need special handling.',
                        experience: -15
                    },
                    {
                        text: 'Include all details publicly',
                        outcome: 'Sensitive details need protection.',
                        experience: -10
                    },
                    {
                        text: 'Ignore security concerns',
                        outcome: 'Security issues need proper attention.',
                        experience: -5
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
        this.endScreen = document.getElementById('end-screen');
        
        if (!this.gameScreen || !this.outcomeScreen || !this.endScreen) {
            throw new Error('Required screen elements not found');
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

            // Save quiz result and update display
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
            }, 5000);
        } else {
            console.error('Error:', message);
        }
    }

    shouldEndGame(totalQuestionsAnswered, currentXP) {
        return totalQuestionsAnswered >= 15 || 
               (totalQuestionsAnswered >= 10 && currentXP >= this.levelThresholds.advanced.minXP);
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new RaisingTicketsQuiz();
    quiz.startGame();
}); 