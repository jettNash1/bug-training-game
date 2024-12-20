class TestSupportQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a test support expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong support skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing test support best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name as a non-configurable, non-writable property
        Object.defineProperty(this, 'quizName', {
            value: 'test-support',
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
                title: 'Morning Communication',
                description: 'You\'re starting your first day on test support. What\'s the most professional first action?',
                options: [
                    {
                        text: 'Send a message to the client checking for specific test tasks and confirm your presence',
                        outcome: 'Perfect! This shows proactive communication and readiness to begin.',
                        experience: 15,
                        tool: 'Client Communication'
                    },
                    {
                        text: 'Start testing without checking in',
                        outcome: 'Morning check-ins are crucial for test support coordination.',
                        experience: -10
                    },
                    {
                        text: 'Wait for the client to contact you',
                        outcome: 'Proactive communication is essential in test support.',
                        experience: -5
                    },
                    {
                        text: 'Only check internal emails',
                        outcome: 'Client communication should be prioritized at start of day.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Access Verification',
                description: 'You\'re preparing for a test support session. What\'s the most thorough preparation approach?',
                options: [
                    {
                        text: 'Verify access to test URLs, designs, documentation, and tracker board',
                        outcome: 'Excellent! This ensures you\'re fully prepared for testing.',
                        experience: 15,
                        tool: 'Access Management'
                    },
                    {
                        text: 'Only check test environment access',
                        outcome: 'All resources need verification for effective testing.',
                        experience: -10
                    },
                    {
                        text: 'Wait until access is needed',
                        outcome: 'Proactive access verification prevents delays.',
                        experience: -5
                    },
                    {
                        text: 'Ask client for access during testing',
                        outcome: 'Access should be verified before starting work.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Documentation Management',
                description: 'You\'re starting on an ongoing test support project. What\'s the best documentation approach?',
                options: [
                    {
                        text: 'Create a process document noting important information and project procedures',
                        outcome: 'Perfect! This ensures knowledge retention and consistent processes.',
                        experience: 15,
                        tool: 'Process Documentation'
                    },
                    {
                        text: 'Rely on memory for processes',
                        outcome: 'Documentation is crucial for consistency and knowledge transfer.',
                        experience: -10
                    },
                    {
                        text: 'Only document major issues',
                        outcome: 'All processes and important information need documentation.',
                        experience: -5
                    },
                    {
                        text: 'Wait for someone else to document',
                        outcome: 'Proactive documentation is everyone\'s responsibility.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Client Communication Channels',
                description: 'You notice you don\'t have direct client communication access. What\'s the best approach?',
                options: [
                    {
                        text: 'Check with PM about getting added to relevant communication channels',
                        outcome: 'Excellent! This ensures proper communication setup.',
                        experience: 15,
                        tool: 'Communication Setup'
                    },
                    {
                        text: 'Work without direct communication',
                        outcome: 'Direct client communication is crucial for test support.',
                        experience: -10
                    },
                    {
                        text: 'Use personal communication methods',
                        outcome: 'Official channels should be used for client communication.',
                        experience: -5
                    },
                    {
                        text: 'Rely only on email',
                        outcome: 'Proper communication channels need to be established.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Project Board Monitoring',
                description: 'How should you approach project board management during test support?',
                options: [
                    {
                        text: 'Keep board open and regularly monitor for new tickets and progress updates',
                        outcome: 'Perfect! This ensures timely response to new testing needs.',
                        experience: 15,
                        tool: 'Project Tracking'
                    },
                    {
                        text: 'Check board once daily',
                        outcome: 'Regular monitoring throughout the day is needed.',
                        experience: -10
                    },
                    {
                        text: 'Wait for notifications',
                        outcome: 'Proactive board monitoring is essential.',
                        experience: -5
                    },
                    {
                        text: 'Only check assigned tickets',
                        outcome: 'Overall project progress needs monitoring.',
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
                title: 'Client Process Adaptation',
                description: 'You\'re working with a client who uses different terminology and processes. What\'s the best approach?',
                options: [
                    {
                        text: 'Adapt to client terminology and processes while maintaining Zoonou standards',
                        outcome: 'Excellent! This shows flexibility and professionalism.',
                        experience: 25,
                        tool: 'Process Adaptation'
                    },
                    {
                        text: 'Insist on using Zoonou terminology',
                        outcome: 'Adapting to client processes is crucial for effective collaboration.',
                        experience: -15
                    },
                    {
                        text: 'Ignore client processes',
                        outcome: 'Understanding and adapting to client processes is essential.',
                        experience: -10
                    },
                    {
                        text: 'Only use client processes when forced',
                        outcome: 'Proactive adaptation improves collaboration.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Handling Idle Time',
                description: 'You\'re booked for test support but have no tasks due to client delays. What\'s the best approach?',
                options: [
                    {
                        text: 'Inform PM and explore additional ways to add value to the project',
                        outcome: 'Excellent! This ensures productive use of time and adds value.',
                        experience: 25,
                        tool: 'Time Management'
                    },
                    {
                        text: 'Wait for tasks to be assigned',
                        outcome: 'Proactive exploration of additional tasks is beneficial.',
                        experience: -15
                    },
                    {
                        text: 'Use time for personal tasks',
                        outcome: 'Idle time should be used productively for the project.',
                        experience: -10
                    },
                    {
                        text: 'Only inform client of availability',
                        outcome: 'PM should be informed to explore additional opportunities.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Communication with Non-Responsive Clients',
                description: 'The client is slow to respond, affecting your testing. What\'s the best approach?',
                options: [
                    {
                        text: 'Maintain open communication, update PM, and suggest raising the issue in regular catch-ups',
                        outcome: 'Excellent! This ensures issues are addressed and communication remains open.',
                        experience: 25,
                        tool: 'Communication Management'
                    },
                    {
                        text: 'Stop testing until client responds',
                        outcome: 'Testing should continue with available information.',
                        experience: -15
                    },
                    {
                        text: 'Only communicate when client responds',
                        outcome: 'Proactive communication is essential.',
                        experience: -10
                    },
                    {
                        text: 'Ignore communication issues',
                        outcome: 'Communication issues need addressing for effective collaboration.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Managing Multiple Projects',
                description: 'You\'re assigned to multiple test support projects. What\'s the best approach to manage your workload?',
                options: [
                    {
                        text: 'Prioritize tasks based on deadlines and importance, communicate availability to PMs',
                        outcome: 'Excellent! This ensures effective workload management.',
                        experience: 25,
                        tool: 'Workload Management'
                    },
                    {
                        text: 'Focus on one project at a time',
                        outcome: 'Multiple projects require balanced attention.',
                        experience: -15
                    },
                    {
                        text: 'Wait for PMs to assign priorities',
                        outcome: 'Proactive prioritization is beneficial.',
                        experience: -10
                    },
                    {
                        text: 'Only work on the most interesting project',
                        outcome: 'All projects need attention based on priorities.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Building Client Relationships',
                description: 'You\'re new to a test support project. How do you build a strong relationship with the client?',
                options: [
                    {
                        text: 'Communicate regularly, provide valuable feedback, and demonstrate understanding of their needs',
                        outcome: 'Excellent! This builds trust and rapport with the client.',
                        experience: 25,
                        tool: 'Relationship Building'
                    },
                    {
                        text: 'Only communicate when necessary',
                        outcome: 'Regular communication is key to building relationships.',
                        experience: -15
                    },
                    {
                        text: 'Focus solely on testing tasks',
                        outcome: 'Building relationships requires more than task completion.',
                        experience: -10
                    },
                    {
                        text: 'Wait for client to initiate relationship building',
                        outcome: 'Proactive relationship building is beneficial.',
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
                title: 'Independent Decision Making',
                description: 'You\'ve identified a more efficient testing approach. How do you proceed?',
                options: [
                    {
                        text: 'Communicate the approach to PM and client, providing rationale and expected benefits',
                        outcome: 'Excellent! This demonstrates initiative and effective communication.',
                        experience: 20,
                        tool: 'Decision Making'
                    },
                    {
                        text: 'Implement the approach without consultation',
                        outcome: 'Consultation ensures alignment and acceptance.',
                        experience: -15
                    },
                    {
                        text: 'Ignore the new approach',
                        outcome: 'Innovative approaches should be explored.',
                        experience: -10
                    },
                    {
                        text: 'Wait for client to suggest changes',
                        outcome: 'Proactive suggestions are valuable.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Handling Client Requests',
                description: 'A client requests a change that deviates from Zoonou\'s standard processes. What\'s the best approach?',
                options: [
                    {
                        text: 'Discuss the request with your line manager for approval before responding to the client',
                        outcome: 'Excellent! This ensures proper alignment and authority.',
                        experience: 20,
                        tool: 'Request Management'
                    },
                    {
                        text: 'Agree to the request immediately',
                        outcome: 'Approval is needed for deviations from standard processes.',
                        experience: -15
                    },
                    {
                        text: 'Decline the request without discussion',
                        outcome: 'Discussion ensures understanding and potential compromise.',
                        experience: -10
                    },
                    {
                        text: 'Ignore the request',
                        outcome: 'Client requests need addressing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Knowledge Retention',
                description: 'You\'re leaving a long-term test support project. How do you ensure knowledge retention?',
                options: [
                    {
                        text: 'Create a comprehensive handover guide documenting processes and key information',
                        outcome: 'Excellent! This ensures smooth transition and knowledge retention.',
                        experience: 20,
                        tool: 'Knowledge Management'
                    },
                    {
                        text: 'Rely on verbal handover',
                        outcome: 'Written documentation ensures thorough knowledge transfer.',
                        experience: -15
                    },
                    {
                        text: 'Only document major issues',
                        outcome: 'All relevant information needs documentation.',
                        experience: -10
                    },
                    {
                        text: 'Leave without documentation',
                        outcome: 'Documentation is crucial for continuity.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Managing Client Expectations',
                description: 'A client expects more testing than the agreed scope allows. How do you manage this?',
                options: [
                    {
                        text: 'Communicate scope limitations clearly and discuss potential adjustments with PM',
                        outcome: 'Excellent! This ensures clear expectations and potential solutions.',
                        experience: 20,
                        tool: 'Expectation Management'
                    },
                    {
                        text: 'Attempt to meet expectations regardless of scope',
                        outcome: 'Scope limitations need clear communication.',
                        experience: -15
                    },
                    {
                        text: 'Ignore the client\'s expectations',
                        outcome: 'Expectations need addressing and managing.',
                        experience: -10
                    },
                    {
                        text: 'Only inform PM without client communication',
                        outcome: 'Direct client communication is essential.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Long-Term Client Engagement',
                description: 'You\'re leading a long-term test support project. How do you ensure ongoing success?',
                options: [
                    {
                        text: 'Maintain regular communication, adapt to client needs, and continuously improve processes',
                        outcome: 'Excellent! This ensures long-term success and client satisfaction.',
                        experience: 20,
                        tool: 'Project Leadership'
                    },
                    {
                        text: 'Rely on initial processes without change',
                        outcome: 'Continuous improvement is key to long-term success.',
                        experience: -15
                    },
                    {
                        text: 'Only focus on immediate tasks',
                        outcome: 'Long-term success requires strategic focus.',
                        experience: -10
                    },
                    {
                        text: 'Wait for client feedback to make changes',
                        outcome: 'Proactive improvement is beneficial.',
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
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new TestSupportQuiz();
    quiz.startGame();
}); 
