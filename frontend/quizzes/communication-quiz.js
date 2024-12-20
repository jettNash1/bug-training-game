class CommunicationQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a communication expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong communication skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing communication best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'communication',
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

        // Basic Scenarios (5 questions)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Daily Communication',
                description: 'You\'ve just started your workday. What\'s the first thing you should do regarding your communication status?',
                options: [
                    {
                        text: 'Mark yourself as "Online" and ensure Teams status is accurate',
                        outcome: 'Perfect! Being visible and accessible is crucial for team communication.',
                        experience: 15,
                        tool: 'Status Management'
                    },
                    {
                        text: 'Wait for someone to message you first',
                        outcome: 'Being proactive with your status helps team coordination.',
                        experience: -5
                    },
                    {
                        text: 'Leave your status as is and start working',
                        outcome: 'Team members need to know your availability.',
                        experience: -10
                    },
                    {
                        text: 'Set status to "Do Not Disturb" by default',
                        outcome: 'Being accessible during work hours is important.',
                        experience: -0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Team Meeting',
                description: 'During a team meeting, you notice a potential issue with the current testing approach. What should you do?',
                options: [
                    {
                        text: 'Raise your concern professionally and suggest alternatives',
                        outcome: 'Excellent! Constructive feedback with solutions is always valuable.',
                        experience: 15,
                        tool: 'Professional Feedback'
                    },
                    {
                        text: 'Stay silent to avoid conflict',
                        outcome: 'Issues should be raised professionally to prevent problems later.',
                        experience: -5
                    },
                    {
                        text: 'Send a private message to your manager only',
                        outcome: 'Team discussions benefit from open communication.',
                        experience: -10
                    },
                    {
                        text: 'Wait until after the meeting and email everyone',
                        outcome: 'Immediate discussion in meetings is often more effective.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Email Communication',
                description: 'You need to send an important update about test results. How should you structure your email?',
                options: [
                    {
                        text: 'Clear subject line, key findings first, detailed results attached',
                        outcome: 'Excellent! This format ensures key information is immediately visible.',
                        experience: 15,
                        tool: 'Written Communication'
                    },
                    {
                        text: 'Send all details in the email body without attachments',
                        outcome: 'Long emails can be overwhelming and hard to reference later.',
                        experience: -10
                    },
                    {
                        text: 'Just attach the results without explanation',
                        outcome: 'Context is important for effective communication.',
                        experience: -5
                    },
                    {
                        text: 'Send multiple emails for different parts of the results',
                        outcome: 'Fragmented information can lead to confusion.',
                        experience: 5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Team Collaboration',
                description: 'A colleague asks for help understanding a test case you wrote. What\'s the best response?',
                options: [
                    {
                        text: 'Schedule a quick call to walk through it together',
                        outcome: 'Perfect! Real-time explanation allows for immediate clarification.',
                        experience: 15,
                        tool: 'Collaboration'
                    },
                    {
                        text: 'Tell them to read the documentation again',
                        outcome: 'This response doesn\'t promote good team collaboration.',
                        experience: -10
                    },
                    {
                        text: 'Forward them to someone else',
                        outcome: 'As the author, you\'re best positioned to explain.',
                        experience: -5
                    },
                    {
                        text: 'Send them a long email explanation',
                        outcome: 'Direct interaction is often more effective for explanations.',
                        experience: 5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Documentation Updates',
                description: 'You\'ve found outdated information in the test documentation. What should you do?',
                options: [
                    {
                        text: 'Update it and notify the team of important changes',
                        outcome: 'Excellent! Keeping documentation current and informing others is crucial.',
                        experience: 15,
                        tool: 'Documentation Management'
                    },
                    {
                        text: 'Leave it for someone else to fix',
                        outcome: 'Everyone is responsible for maintaining documentation.',
                        experience: -10
                    },
                    {
                        text: 'Only update without telling anyone',
                        outcome: 'Changes should be communicated to the team.',
                        experience: -5
                    },
                    {
                        text: 'Create a new document instead',
                        outcome: 'Multiple versions can lead to confusion.',
                        experience: 5
                    }
                ]
            }
        ];

        // Intermediate Scenarios (5 questions)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Bug Report Communication',
                description: 'You\'ve found a critical bug in production. How should you communicate this?',
                options: [
                    {
                        text: 'Document the issue thoroughly and alert relevant stakeholders immediately',
                        outcome: 'Perfect! Quick, clear communication of critical issues is essential.',
                        experience: 25,
                        tool: 'Critical Communication'
                    },
                    {
                        text: 'Fix it yourself first before telling anyone',
                        outcome: 'Critical issues should be communicated immediately.',
                        experience: -15
                    },
                    {
                        text: 'Send a general email to everyone in the company',
                        outcome: 'Target your communication to relevant stakeholders.',
                        experience: -10
                    },
                    {
                        text: 'Message only your immediate team members',
                        outcome: 'Critical issues often require broader stakeholder awareness.',
                        experience: 5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Cross-team Collaboration',
                description: 'You need information from another team to complete your testing. How do you proceed?',
                options: [
                    {
                        text: 'Schedule a meeting with clear agenda and requirements',
                        outcome: 'Excellent! Structured communication helps get results efficiently.',
                        experience: 25,
                        tool: 'Cross-team Communication'
                    },
                    {
                        text: 'Send multiple urgent messages to team members',
                        outcome: 'Scattered communication can be disruptive and ineffective.',
                        experience: -15
                    },
                    {
                        text: 'Ask your manager to intervene',
                        outcome: 'Try direct communication first before escalating.',
                        experience: -10
                    },
                    {
                        text: 'Work around the missing information',
                        outcome: 'This could lead to incomplete or incorrect testing.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Test Results Presentation',
                description: 'You need to present test results to stakeholders. How do you prepare?',
                options: [
                    {
                        text: 'Create a clear summary with data visualization and key insights',
                        outcome: 'Perfect! Visual data and key points make information accessible.',
                        experience: 25,
                        tool: 'Presentation Skills'
                    },
                    {
                        text: 'Show all raw test data',
                        outcome: 'Raw data without context can be overwhelming.',
                        experience: -15
                    },
                    {
                        text: 'Verbal presentation only',
                        outcome: 'Visual aids help reinforce important points.',
                        experience: -5
                    },
                    {
                        text: 'Send results in an email instead',
                        outcome: 'Important findings often benefit from interactive discussion.',
                        experience: 5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Conflict Resolution',
                description: 'There\'s a disagreement about test coverage between team members. How do you handle it?',
                options: [
                    {
                        text: 'Organize a discussion to understand all viewpoints and find common ground',
                        outcome: 'Excellent! Collaborative problem-solving builds team strength.',
                        experience: 25,
                        tool: 'Conflict Resolution'
                    },
                    {
                        text: 'Let them resolve it themselves',
                        outcome: 'Active mediation can prevent escalation.',
                        experience: -15
                    },
                    {
                        text: 'Take sides with one party',
                        outcome: 'This can create division in the team.',
                        experience: -5
                    },
                    {
                        text: 'Implement both approaches separately',
                        outcome: 'This could lead to inefficient use of resources.',
                        experience: 5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Remote Communication',
                description: 'Working with an offshore team, you notice communication gaps. What\'s your solution?',
                options: [
                    {
                        text: 'Establish regular sync meetings and clear documentation protocols',
                        outcome: 'Perfect! Structure and consistency improve remote collaboration.',
                        experience: 25,
                        tool: 'Remote Collaboration'
                    },
                    {
                        text: 'Increase email frequency',
                        outcome: 'More emails don\'t necessarily mean better communication.',
                        experience: -15
                    },
                    {
                        text: 'Let them figure out what they need',
                        outcome: 'Proactive communication prevents misunderstandings.',
                        experience: -5
                    },
                    {
                        text: 'Report issues to management',
                        outcome: 'Try direct solutions before escalating.',
                        experience: 0
                    }
                ]
            }
        ];

        // Advanced Scenarios (5 questions)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Stakeholder Management',
                description: 'A key stakeholder is pushing for release despite known issues. How do you handle this?',
                options: [
                    {
                        text: 'Present data-driven evidence of risks and suggest mitigation strategies',
                        outcome: 'Excellent! Using data to support your position is highly effective.',
                        experience: 20,
                        tool: 'Stakeholder Management'
                    },
                    {
                        text: 'Agree to release without discussion',
                        outcome: 'Always communicate risks professionally with evidence.',
                        experience: -15
                    },
                    {
                        text: 'Escalate to senior management immediately',
                        outcome: 'Try direct communication with stakeholders first.',
                        experience: -10
                    },
                    {
                        text: 'Refuse to sign off on the release',
                        outcome: 'Constructive dialogue is better than confrontation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Process Improvement',
                description: 'You\'ve identified ways to improve the testing process. How do you implement change?',
                options: [
                    {
                        text: 'Create a detailed proposal with data and gather team feedback',
                        outcome: 'Perfect! Collaborative approach with evidence increases buy-in.',
                        experience: 20,
                        tool: 'Change Management'
                    },
                    {
                        text: 'Implement changes without discussion',
                        outcome: 'Changes need team buy-in to be effective.',
                        experience: -15
                    },
                    {
                        text: 'Leave it to management to decide',
                        outcome: 'Taking initiative with team input is valuable.',
                        experience: -5
                    },
                    {
                        text: 'Share ideas informally in team chat',
                        outcome: 'Formal proposals are better for significant changes.',
                        experience: -10
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Crisis Communication',
                description: 'A major system outage is affecting testing environments. How do you manage communication?',
                options: [
                    {
                        text: 'Establish regular updates, clear impact assessment, and recovery timeline',
                        outcome: 'Excellent! Structured crisis communication keeps everyone informed.',
                        experience: 20,
                        tool: 'Crisis Management'
                    },
                    {
                        text: 'Wait for others to notice',
                        outcome: 'Proactive communication is crucial during crises.',
                        experience: -10
                    },
                    {
                        text: 'Send one update and wait',
                        outcome: 'Ongoing communication is important in crisis situations.',
                        experience: -15
                    },
                    {
                        text: 'Communicate only with your team',
                        outcome: 'System-wide issues need broader communication.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Knowledge Transfer',
                description: 'You\'re leading knowledge transfer for a complex testing framework. How do you approach it?',
                options: [
                    {
                        text: 'Create comprehensive documentation and conduct interactive sessions',
                        outcome: 'Perfect! Multiple learning formats support effective knowledge transfer.',
                        experience: 20,
                        tool: 'Knowledge Management'
                    },
                    {
                        text: 'Send documentation via email',
                        outcome: 'Interactive learning is important for complex topics.',
                        experience: -15
                    },
                    {
                        text: 'Give one presentation only',
                        outcome: 'Complex topics often need multiple sessions.',
                        experience: -10
                    },
                    {
                        text: 'Let team members learn by themselves',
                        outcome: 'Structured knowledge transfer is more effective.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Strategic Communication',
                description: 'You need to propose a major change in testing strategy. How do you approach this?',
                options: [
                    {
                        text: 'Prepare a comprehensive proposal with ROI analysis and implementation plan',
                        outcome: 'Excellent! Strategic changes need thorough analysis and clear communication.',
                        experience: 20,
                        tool: 'Strategic Planning'
                    },
                    {
                        text: 'Send a brief email outlining changes',
                        outcome: 'Major changes need detailed justification.',
                        experience: -10
                    },
                    {
                        text: 'Implement changes gradually without formal proposal',
                        outcome: 'Strategic changes need proper planning and approval.',
                        experience: -15
                    },
                    {
                        text: 'Discuss informally in team meetings',
                        outcome: 'Formal proposals are needed for strategic changes.',
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
                await quizUser.updateQuizScore('communication', score);
                
                // Update progress display on index page
                const progressElement = document.querySelector('#communication-progress');
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
                        const quizItem = document.querySelector('[data-quiz="communication"]');
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
    const quiz = new CommunicationQuiz();
    quiz.startGame();
}); 