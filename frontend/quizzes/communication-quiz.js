import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';

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

        // Basic Scenarios (IDs 1-5)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Daily Stand-up',
                description: 'You\'re attending a daily stand-up meeting. What\'s the most effective way to communicate your progress?',
                options: [
                    {
                        text: 'Clearly state what you completed yesterday, what you\'re working on today, and any blockers',
                        outcome: 'Perfect! This provides a clear and structured update.',
                        experience: 15,
                        tool: 'Meeting Communication'
                    },
                    {
                        text: 'Give a detailed explanation of every task you worked on',
                        outcome: 'Stand-ups should be concise and focused.',
                        experience: -5
                    },
                    {
                        text: 'Just say everything is fine',
                        outcome: 'Updates should be specific and informative.',
                        experience: -10
                    },
                    {
                        text: 'Wait for others to ask you questions',
                        outcome: 'Be proactive in providing updates.',
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Email Communication',
                description: 'You need to send an important update to the team. How should you structure your email?',
                options: [
                    {
                        text: 'Use a clear subject line, organize content with headings, and highlight key points',
                        outcome: 'Excellent! This makes the email easy to read and understand.',
                        experience: 15,
                        tool: 'Email Etiquette'
                    },
                    {
                        text: 'Write one long paragraph with all information',
                        outcome: 'Emails should be well-organized and easy to scan.',
                        experience: -10
                    },
                    {
                        text: 'Send multiple short emails instead',
                        outcome: 'Important updates should be consolidated when possible.',
                        experience: -5
                    },
                    {
                        text: 'Use informal language and emojis',
                        outcome: 'Professional communication requires appropriate tone.',
                        experience: -5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Team Chat',
                description: 'A colleague asks a technical question in the team chat. What\'s the best response?',
                options: [
                    {
                        text: 'Provide a clear answer with relevant documentation links',
                        outcome: 'Perfect! This helps now and in the future.',
                        experience: 15,
                        tool: 'Documentation Reference'
                    },
                    {
                        text: 'Tell them to Google it',
                        outcome: 'This isn\'t helpful or collaborative.',
                        experience: -15
                    },
                    {
                        text: 'Ignore the question',
                        outcome: 'Team communication requires active participation.',
                        experience: -10
                    },
                    {
                        text: 'Give a vague answer',
                        outcome: 'Clear and specific responses are more helpful.',
                        experience: -5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Status Updates',
                description: 'You\'ve encountered a delay in your work. How should you communicate this?',
                options: [
                    {
                        text: 'Promptly inform stakeholders, explain the cause, and provide an updated timeline',
                        outcome: 'Excellent! This maintains transparency and trust.',
                        experience: 15,
                        tool: 'Status Reporting'
                    },
                    {
                        text: 'Wait until someone asks about the delay',
                        outcome: 'Delays should be communicated proactively.',
                        experience: -10
                    },
                    {
                        text: 'Only mention it in the next scheduled meeting',
                        outcome: 'Important updates shouldn\'t wait for scheduled meetings.',
                        experience: -5
                    },
                    {
                        text: 'Try to handle it without telling anyone',
                        outcome: 'Transparency is important in team communication.',
                        experience: -15
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Documentation',
                description: 'You\'ve completed a new feature. How should you document it?',
                options: [
                    {
                        text: 'Write clear, organized documentation with examples and update relevant guides',
                        outcome: 'Perfect! This helps the team understand and maintain the feature.',
                        experience: 15,
                        tool: 'Technical Documentation'
                    },
                    {
                        text: 'Leave comments in the code only',
                        outcome: 'Proper documentation should be more comprehensive.',
                        experience: -5
                    },
                    {
                        text: 'Skip documentation since the code is self-explanatory',
                        outcome: 'Documentation is crucial for team knowledge.',
                        experience: -15
                    },
                    {
                        text: 'Create a quick note in your personal files',
                        outcome: 'Documentation should be accessible to the team.',
                        experience: -10
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Stakeholder Communication',
                description: 'You need to explain a technical issue to non-technical stakeholders. How should you approach this?',
                options: [
                    {
                        text: 'Use clear analogies and visual aids, avoid jargon, and focus on business impact',
                        outcome: 'Excellent! This makes technical concepts accessible.',
                        experience: 25,
                        tool: 'Stakeholder Communication'
                    },
                    {
                        text: 'Use technical terms to sound professional',
                        outcome: 'Technical jargon can confuse non-technical stakeholders.',
                        experience: -15
                    },
                    {
                        text: 'Keep it very brief to avoid confusion',
                        outcome: 'Clear explanation is needed for understanding.',
                        experience: -10
                    },
                    {
                        text: 'Let someone else handle it',
                        outcome: 'Technical communication is an important skill.',
                        experience: -20
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Conflict Resolution',
                description: 'There\'s a disagreement in the team about a technical approach. How do you handle it?',
                options: [
                    {
                        text: 'Facilitate a discussion, document different viewpoints, and work toward consensus',
                        outcome: 'Perfect! This promotes constructive resolution.',
                        experience: 25,
                        tool: 'Conflict Resolution'
                    },
                    {
                        text: 'Let the most senior person decide',
                        outcome: 'Team input and consensus are valuable.',
                        experience: -10
                    },
                    {
                        text: 'Avoid the conflict',
                        outcome: 'Conflicts should be addressed professionally.',
                        experience: -15
                    },
                    {
                        text: 'Push for your preferred solution',
                        outcome: 'Consider all viewpoints in technical discussions.',
                        experience: -20
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Code Review Communication',
                description: 'You\'re reviewing a colleague\'s code and find several issues. How do you communicate this?',
                options: [
                    {
                        text: 'Provide specific, constructive feedback with examples and suggestions for improvement',
                        outcome: 'Excellent! This helps learning and improvement.',
                        experience: 25,
                        tool: 'Code Review'
                    },
                    {
                        text: 'List all the problems found',
                        outcome: 'Feedback should be constructive and helpful.',
                        experience: -10
                    },
                    {
                        text: 'Just say it needs work',
                        outcome: 'Specific feedback is more valuable.',
                        experience: -15
                    },
                    {
                        text: 'Approve it to avoid confrontation',
                        outcome: 'Honest, constructive feedback is important.',
                        experience: -20
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Remote Communication',
                description: 'You\'re working remotely and need to collaborate on a complex task. How do you ensure effective communication?',
                options: [
                    {
                        text: 'Set up regular video calls, use screen sharing, and maintain detailed documentation',
                        outcome: 'Perfect! This maintains clear communication channels.',
                        experience: 25,
                        tool: 'Remote Collaboration'
                    },
                    {
                        text: 'Rely on email only',
                        outcome: 'Multiple communication channels are often needed.',
                        experience: -15
                    },
                    {
                        text: 'Wait for others to initiate communication',
                        outcome: 'Be proactive in remote communication.',
                        experience: -10
                    },
                    {
                        text: 'Handle everything through chat',
                        outcome: 'Complex tasks often need richer communication.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Project Updates',
                description: 'You\'re leading a project and need to communicate progress to multiple teams. What\'s the best approach?',
                options: [
                    {
                        text: 'Create a structured report with key metrics, milestones, and risks, and schedule a presentation',
                        outcome: 'Excellent! This provides comprehensive project visibility.',
                        experience: 25,
                        tool: 'Project Communication'
                    },
                    {
                        text: 'Send quick updates as things happen',
                        outcome: 'Project updates should be organized and regular.',
                        experience: -10
                    },
                    {
                        text: 'Update only your immediate team',
                        outcome: 'All stakeholders need appropriate updates.',
                        experience: -15
                    },
                    {
                        text: 'Wait for the next quarterly review',
                        outcome: 'Regular project communication is important.',
                        experience: -20
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Crisis Communication',
                description: 'A critical system issue is affecting multiple teams. How do you manage communication?',
                options: [
                    {
                        text: 'Establish a clear communication channel, provide regular updates, and document the resolution process',
                        outcome: 'Perfect! This ensures effective crisis management.',
                        experience: 35,
                        tool: 'Crisis Management'
                    },
                    {
                        text: 'Send one mass email about the issue',
                        outcome: 'Critical issues need ongoing communication.',
                        experience: -20
                    },
                    {
                        text: 'Let each team handle their own communications',
                        outcome: 'Coordinated communication is crucial in crises.',
                        experience: -25
                    },
                    {
                        text: 'Wait until the issue is resolved to communicate',
                        outcome: 'Proactive communication is essential in crises.',
                        experience: -30
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Cross-cultural Communication',
                description: 'You\'re working with a global team across different time zones and cultures. How do you ensure effective communication?',
                options: [
                    {
                        text: 'Use clear, inclusive language, provide written follow-ups, and be mindful of cultural differences',
                        outcome: 'Excellent! This promotes inclusive global collaboration.',
                        experience: 35,
                        tool: 'Global Communication'
                    },
                    {
                        text: 'Stick to your preferred communication style',
                        outcome: 'Adapt communication for different cultures.',
                        experience: -25
                    },
                    {
                        text: 'Only communicate during your working hours',
                        outcome: 'Consider time zones in global teams.',
                        experience: -20
                    },
                    {
                        text: 'Use informal language to seem friendly',
                        outcome: 'Professional tone is important across cultures.',
                        experience: -15
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Technical Presentation',
                description: 'You need to present a complex technical solution to a diverse audience. How do you prepare?',
                options: [
                    {
                        text: 'Create multiple versions of the presentation with appropriate technical depth for different audiences',
                        outcome: 'Perfect! This ensures understanding at all levels.',
                        experience: 35,
                        tool: 'Technical Presentation'
                    },
                    {
                        text: 'Focus only on technical details',
                        outcome: 'Consider the diverse audience needs.',
                        experience: -25
                    },
                    {
                        text: 'Keep it very high-level for everyone',
                        outcome: 'Balance technical depth for different audiences.',
                        experience: -15
                    },
                    {
                        text: 'Have someone else present',
                        outcome: 'Develop your presentation skills.',
                        experience: -30
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Knowledge Transfer',
                description: 'You\'re leaving a project and need to ensure knowledge transfer. How do you handle this?',
                options: [
                    {
                        text: 'Create comprehensive documentation, conduct training sessions, and have overlap period with new team',
                        outcome: 'Excellent! This ensures smooth transition.',
                        experience: 35,
                        tool: 'Knowledge Management'
                    },
                    {
                        text: 'Leave detailed code comments',
                        outcome: 'Knowledge transfer needs multiple approaches.',
                        experience: -20
                    },
                    {
                        text: 'Have one handoff meeting',
                        outcome: 'Thorough knowledge transfer takes time.',
                        experience: -25
                    },
                    {
                        text: 'Let the new team figure it out',
                        outcome: 'Proper handoff is crucial for continuity.',
                        experience: -30
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Strategic Communication',
                description: 'You need to propose a major technical change that will impact multiple departments. How do you approach this?',
                options: [
                    {
                        text: 'Prepare a detailed proposal with impact analysis, gather feedback from stakeholders, and present a phased implementation plan',
                        outcome: 'Perfect! This demonstrates strategic thinking and stakeholder management.',
                        experience: 35,
                        tool: 'Change Management'
                    },
                    {
                        text: 'Send a proposal by email',
                        outcome: 'Major changes need comprehensive communication.',
                        experience: -25
                    },
                    {
                        text: 'Start implementing and inform others later',
                        outcome: 'Changes should be communicated beforehand.',
                        experience: -30
                    },
                    {
                        text: 'Let management handle the communication',
                        outcome: 'Technical leads should drive technical changes.',
                        experience: -20
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
            
            // Save to server first
            const serverSaved = await this.apiService.saveQuizProgress(this.quizName, progress);
            console.log('Saved progress to server:', progress);
            
            if (serverSaved) {
                // Also update quiz results to keep everything in sync
                const quizUser = new QuizUser(username);
                const score = Math.round((this.player.experience / this.maxXP) * 100);
                await quizUser.saveQuizResult(
                    this.quizName,
                    score,
                    this.player.experience,
                    this.player.tools,
                    this.player.questionHistory,
                    this.player.questionHistory.length
                );
            } else {
                console.error('Failed to save progress to server');
            }
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

            // First load quiz results to get overall progress
            const quizUser = new QuizUser(username);
            await quizUser.loadUserData();
            const quizResult = quizUser.getQuizResult(this.quizName);

            // Then load detailed progress
            const savedProgress = await this.apiService.getQuizProgress(this.quizName);
            let progress = null;
            
            if (savedProgress && savedProgress.data) {
                progress = savedProgress.data;
                console.log('Loading quiz progress:', progress);
            } else if (quizResult) {
                // If no detailed progress but we have quiz results, use that
                progress = {
                    experience: quizResult.experience || 0,
                    tools: quizResult.tools || [],
                    questionHistory: quizResult.questionHistory || [],
                    currentScenario: (quizResult.questionHistory && quizResult.questionHistory.length) || 0,
                    lastUpdated: quizResult.completedAt
                };
            }

            if (progress) {
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                
                // Set current scenario to the next unanswered question
                // If currentScenario is saved in progress, use that, otherwise use questionHistory length
                const nextScenario = progress.currentScenario !== undefined ? 
                    progress.currentScenario : 
                    this.player.questionHistory.length;
                    
                this.player.currentScenario = nextScenario;

                console.log('Setting current scenario to:', this.player.currentScenario, {
                    progressCurrentScenario: progress.currentScenario,
                    questionHistoryLength: this.player.questionHistory.length
                });

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

            // Load existing progress
            const hasProgress = await this.loadProgress();
            console.log('Loaded progress:', {
                hasProgress,
                player: this.player
            });
            
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
            
            // Update progress display
            this.updateProgress();
            
            // Display current scenario
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

            // Increment current scenario before saving
            this.player.currentScenario = this.player.questionHistory.length;
            console.log('Updated current scenario to:', this.player.currentScenario);

            // Save progress and quiz result
            const username = localStorage.getItem('username');
            if (username) {
                // First save the quiz result
                const quizUser = new QuizUser(username);
                const score = Math.round((this.player.experience / this.maxXP) * 100);
                await quizUser.saveQuizResult(
                    this.quizName,
                    score,
                    this.player.experience,
                    this.player.tools,
                    this.player.questionHistory,
                    this.player.questionHistory.length
                );

                // Then save the detailed progress with updated currentScenario
                await this.saveProgress();

                // Update progress display on index page
                const progressElement = document.querySelector(`#${this.quizName}-progress`);
                if (progressElement) {
                    const totalQuestions = 15;
                    const completedQuestions = this.player.questionHistory.length;
                    const percentComplete = Math.round((completedQuestions / totalQuestions) * 100);
                    
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
    const quiz = new CommunicationQuiz();
    quiz.startGame();
}); 