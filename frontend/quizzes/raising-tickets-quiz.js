import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';

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
        
        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'raising-tickets',
            writable: false,
            configurable: false
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

        // Basic Scenarios (IDs 1-5, 75 XP total)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Understanding Ticket Types',
                description: 'What are the main types of tickets that can be raised?',
                options: [
                    {
                        text: 'Bugs, Queries, Suggestions/Improvements, and Reference tickets',
                        outcome: 'Perfect! These are the main ticket types used for different purposes.',
                        experience: 15,
                        tool: 'Ticket Classification'
                    },
                    {
                        text: 'Only bug reports',
                        outcome: 'Multiple ticket types serve different purposes.',
                        experience: -5
                    },
                    {
                        text: 'Just feature requests',
                        outcome: 'Tickets cover various types of issues and requests.',
                        experience: -10
                    },
                    {
                        text: 'Development tasks only',
                        outcome: 'Tickets include various types beyond development tasks.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Ticket Title Creation',
                description: 'How should you format a ticket title?',
                options: [
                    {
                        text: 'Concise, clear, and specific with environment prefix if applicable',
                        outcome: 'Excellent! Clear titles help identify issues quickly.',
                        experience: 15,
                        tool: 'Title Formatting'
                    },
                    {
                        text: 'Write a full sentence',
                        outcome: 'Titles should be concise and specific.',
                        experience: -5
                    },
                    {
                        text: 'Use vague descriptions',
                        outcome: 'Titles need to be clear and specific.',
                        experience: -10
                    },
                    {
                        text: 'Copy error messages only',
                        outcome: 'Titles should describe the issue clearly.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Issue Description',
                description: 'What should be included in the issue description?',
                options: [
                    {
                        text: 'Observed behavior, expected behavior, and reference to specifications if available',
                        outcome: 'Perfect! This provides clear context for the issue.',
                        experience: 15,
                        tool: 'Description Template'
                    },
                    {
                        text: 'Only the error message',
                        outcome: 'More context is needed in descriptions.',
                        experience: -10
                    },
                    {
                        text: 'Just personal opinion',
                        outcome: 'Descriptions need objective information.',
                        experience: -5
                    },
                    {
                        text: 'Technical jargon only',
                        outcome: 'Clear, accessible language is needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Steps to Recreate',
                description: 'How should you document steps to recreate an issue?',
                options: [
                    {
                        text: 'Clear, numbered steps with specific actions and component names in order',
                        outcome: 'Excellent! This helps others reproduce the issue reliably.',
                        experience: 15,
                        tool: 'Steps Documentation'
                    },
                    {
                        text: 'General description only',
                        outcome: 'Specific steps are needed for reproduction.',
                        experience: -10
                    },
                    {
                        text: 'Skip steps documentation',
                        outcome: 'Steps are crucial for issue verification.',
                        experience: -5
                    },
                    {
                        text: 'Assume steps are obvious',
                        outcome: 'Clear steps help others reproduce issues.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Environment Documentation',
                description: 'What should you include in the environment section?',
                options: [
                    {
                        text: 'Primary environment details and any additional environments where issue occurs',
                        outcome: 'Perfect! This helps identify environment-specific issues.',
                        experience: 15,
                        tool: 'Environment Tracking'
                    },
                    {
                        text: 'Skip environment details',
                        outcome: 'Environment information is crucial.',
                        experience: -10
                    },
                    {
                        text: 'List all possible environments',
                        outcome: 'Only list relevant environments.',
                        experience: -5
                    },
                    {
                        text: 'Assume one environment',
                        outcome: 'Multiple environments may be affected.',
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
                title: 'Reproduction Rate',
                description: 'How do you determine and document reproduction rate?',
                options: [
                    {
                        text: 'Test multiple times and calculate percentage based on successful reproductions',
                        outcome: 'Excellent! This provides accurate reproduction statistics.',
                        experience: 20,
                        tool: 'Reproduction Calculator'
                    },
                    {
                        text: 'Assume 100% always',
                        outcome: 'Actual testing needed for rate.',
                        experience: -15
                    },
                    {
                        text: 'Skip reproduction testing',
                        outcome: 'Reproduction rate is important data.',
                        experience: -10
                    },
                    {
                        text: 'Only try once',
                        outcome: 'Multiple attempts needed for accuracy.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Supporting Material',
                description: 'What supporting material should you include with tickets?',
                options: [
                    {
                        text: 'Clear videos/images showing the issue, crash logs, and highlighted problem areas',
                        outcome: 'Perfect! Visual evidence helps understand issues.',
                        experience: 20,
                        tool: 'Evidence Collection'
                    },
                    {
                        text: 'No supporting material',
                        outcome: 'Evidence helps demonstrate issues.',
                        experience: -15
                    },
                    {
                        text: 'Quick unclear screenshots',
                        outcome: 'Clear, quality evidence needed.',
                        experience: -10
                    },
                    {
                        text: 'Text description only',
                        outcome: 'Visual evidence often helps clarity.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Version Information',
                description: 'How should you document version information?',
                options: [
                    {
                        text: 'Include environment URL/build version and date for accurate tracking',
                        outcome: 'Excellent! Version info helps track issue timeline.',
                        experience: 20,
                        tool: 'Version Tracker'
                    },
                    {
                        text: 'Skip version details',
                        outcome: 'Version information is crucial.',
                        experience: -15
                    },
                    {
                        text: 'Use generic version',
                        outcome: 'Specific version needed.',
                        experience: -10
                    },
                    {
                        text: 'Assume latest version',
                        outcome: 'Exact version must be specified.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Severity Assessment',
                description: 'How do you determine ticket severity?',
                options: [
                    {
                        text: 'Assess impact on functionality, user experience, and business requirements',
                        outcome: 'Perfect! This ensures appropriate prioritization.',
                        experience: 20,
                        tool: 'Severity Matrix'
                    },
                    {
                        text: 'Mark all as high',
                        outcome: 'Accurate severity assessment needed.',
                        experience: -15
                    },
                    {
                        text: 'Skip severity rating',
                        outcome: 'Severity helps prioritize fixes.',
                        experience: -10
                    },
                    {
                        text: 'Use random severity',
                        outcome: 'Severity must match impact.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Client Communication',
                description: 'How should you handle client-specific ticket requirements?',
                options: [
                    {
                        text: 'Follow client instructions from Operational Project Details and maintain clear communication',
                        outcome: 'Excellent! Client preferences are important.',
                        experience: 20,
                        tool: 'Client Requirements'
                    },
                    {
                        text: 'Ignore client preferences',
                        outcome: 'Client requirements must be followed.',
                        experience: -15
                    },
                    {
                        text: 'Use standard format only',
                        outcome: 'Client-specific needs matter.',
                        experience: -10
                    },
                    {
                        text: 'Assume client needs',
                        outcome: 'Check actual client requirements.',
                        experience: -5
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15, 100 XP total)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Stakeholder Impact',
                description: 'How do you communicate ticket impact to stakeholders?',
                options: [
                    {
                        text: 'Provide clear, factual information about business impact and user experience effects',
                        outcome: 'Perfect! This helps stakeholders make informed decisions.',
                        experience: 25,
                        tool: 'Impact Assessment'
                    },
                    {
                        text: 'Use technical terms only',
                        outcome: 'Clear, accessible language needed.',
                        experience: -15
                    },
                    {
                        text: 'Minimize impact details',
                        outcome: 'Full impact information needed.',
                        experience: -10
                    },
                    {
                        text: 'Exaggerate impact',
                        outcome: 'Accurate impact assessment required.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Quality Assurance',
                description: 'How do you ensure ticket quality before submission?',
                options: [
                    {
                        text: 'Double-check all information, verify steps, and ensure clear documentation',
                        outcome: 'Excellent! Quality checks prevent confusion.',
                        experience: 25,
                        tool: 'Quality Checklist'
                    },
                    {
                        text: 'Submit without review',
                        outcome: 'Quality checks are essential.',
                        experience: -15
                    },
                    {
                        text: 'Quick basic check only',
                        outcome: 'Thorough review needed.',
                        experience: -10
                    },
                    {
                        text: 'Let others check',
                        outcome: 'Personal verification required.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Time Management',
                description: 'When should tickets be raised during testing?',
                options: [
                    {
                        text: 'Raise tickets immediately when issues are observed to maintain accuracy',
                        outcome: 'Perfect! Immediate reporting ensures accuracy.',
                        experience: 25,
                        tool: 'Issue Tracker'
                    },
                    {
                        text: 'Wait until end of testing',
                        outcome: 'Immediate reporting is crucial.',
                        experience: -15
                    },
                    {
                        text: 'Batch multiple issues',
                        outcome: 'Report issues as discovered.',
                        experience: -10
                    },
                    {
                        text: 'Delegate to others',
                        outcome: 'Report your own observations.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Evidence Quality',
                description: 'How do you ensure high-quality supporting evidence?',
                options: [
                    {
                        text: 'Capture clear videos/images, repeat issues in recordings, and highlight key areas',
                        outcome: 'Excellent! Quality evidence aids understanding.',
                        experience: 25,
                        tool: 'Evidence Tools'
                    },
                    {
                        text: 'Quick unclear captures',
                        outcome: 'Clear, detailed evidence needed.',
                        experience: -15
                    },
                    {
                        text: 'Skip evidence collection',
                        outcome: 'Evidence helps demonstrate issues.',
                        experience: -10
                    },
                    {
                        text: 'Use old evidence',
                        outcome: 'Current evidence required.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Consistency Management',
                description: 'How do you maintain consistency across multiple tickets?',
                options: [
                    {
                        text: 'Use templates, follow standards, and maintain consistent formatting across all tickets',
                        outcome: 'Perfect! Consistency helps track and resolve issues.',
                        experience: 25,
                        tool: 'Template System'
                    },
                    {
                        text: 'Use different formats',
                        outcome: 'Consistent format needed.',
                        experience: -15
                    },
                    {
                        text: 'Ignore standards',
                        outcome: 'Standards ensure clarity.',
                        experience: -10
                    },
                    {
                        text: 'Random formatting',
                        outcome: 'Consistent approach required.',
                        experience: -5
                    }
                ]
            }
        ];

        // Initialize UI and add event listeners
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
        // End game if we've answered all questions or reached max XP
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
            // Set player name from localStorage
            this.player.name = localStorage.getItem('username');
            if (!this.player.name) {
                window.location.href = '/login.html';
                return;
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

    nextScenario() {
        // Increment scenario counter
        this.player.currentScenario++;
        
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

        if (score >= 80) {
            recommendationsHTML += '<p>🌟 Excellent performance! Here are some ways to further enhance your skills:</p>';
        } else if (score >= 60) {
            recommendationsHTML += '<p>👍 Good effort! Here are some areas to focus on:</p>';
        } else {
            recommendationsHTML += '<p>📚 Here are key areas for improvement:</p>';
        }

        recommendationsHTML += '<ul>';

        // Add recommendations for weak areas
        weakAreas.forEach(area => {
            recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
        });

        // If there are strong areas but still room for improvement
        if (strongAreas.length > 0 && score < 100) {
            recommendationsHTML += '<li>Continue practicing your strengths in: ' + 
                strongAreas.join(', ') + '</li>';
        }

        // Add general recommendations based on score
        if (score < 70) {
            recommendationsHTML += `
                <li>Review the communication best practices documentation</li>
                <li>Practice active listening techniques</li>
                <li>Focus on clear and concise messaging</li>
            `;
        }

        recommendationsHTML += '</ul>';
        recommendationsContainer.innerHTML = recommendationsHTML;
    }

    categorizeQuestion(scenario) {
        // Categorize questions based on their content
        const title = scenario.title.toLowerCase();
        const description = scenario.description.toLowerCase();

        if (title.includes('daily') || description.includes('daily')) {
            return 'Daily Communication';
        } else if (title.includes('team') || description.includes('team')) {
            return 'Team Collaboration';
        } else if (title.includes('stakeholder') || description.includes('stakeholder')) {
            return 'Stakeholder Management';
        } else if (title.includes('conflict') || description.includes('conflict')) {
            return 'Conflict Resolution';
        } else if (title.includes('remote') || description.includes('remote')) {
            return 'Remote Communication';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Documentation';
        } else if (title.includes('presentation') || description.includes('presentation')) {
            return 'Presentation Skills';
        } else {
            return 'General Communication';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Daily Communication': 'Practice maintaining clear status updates and regular check-ins with team members.',
            'Team Collaboration': 'Focus on active listening and providing constructive feedback in team settings.',
            'Stakeholder Management': 'Work on presenting information clearly and managing expectations effectively.',
            'Conflict Resolution': 'Study conflict resolution techniques and practice diplomatic communication.',
            'Remote Communication': 'Improve virtual communication skills and use of collaboration tools.',
            'Documentation': 'Enhance documentation skills with clear, concise, and well-structured content.',
            'Presentation Skills': 'Practice presenting technical information in a clear and engaging manner.',
            'General Communication': 'Focus on fundamental communication principles and professional etiquette.'
        };

        return recommendations[area] || 'Continue practicing general communication skills.';
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
    const quiz = new RaisingTicketsQuiz();
    quiz.startGame();
}); 