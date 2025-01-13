import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';

class RiskManagementQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a risk management expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong risk management skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing risk management best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'risk-management',
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

        // Basic Scenarios (IDs 1-5, 75 XP total)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Risk Calculation',
                description: 'You discover a potential issue that could affect project completion. How do you best calculate its risk level?',
                options: [
                    {
                        text: 'Multiply severity by likelihood to determine impact',
                        outcome: 'Perfect! This is the correct formula for calculating risk impact.',
                        experience: 15,
                        tool: 'Risk Calculator'
                    },
                    {
                        text: 'Only consider the severity of the issue',
                        outcome: 'Risk calculation needs both severity and likelihood for accuracy.',
                        experience: -10
                    },
                    {
                        text: 'Add severity and likelihood together',
                        outcome: 'Multiplication, not addition, gives the correct risk impact score.',
                        experience: -5
                    },
                    {
                        text: 'Only consider how likely it is to happen',
                        outcome: 'Both factors are needed for proper risk assessment.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Risk Identification',
                description: 'What is the most effective way to identify potential risks?',
                options: [
                    {
                        text: 'Conduct comprehensive analysis of historical project data and previous risk assessments to establish patterns',
                        outcome: 'Historical data alone may miss new risks.',
                        experience: -5
                    },
                    {
                        text: 'Review documentation',
                        outcome: 'Perfect! Documentation review is key to identifying risks.',
                        experience: 15,
                        tool: 'Risk Assessment Template'
                    },
                    {
                        text: 'Implement extensive monitoring systems to track all possible system behaviors and performance metrics',
                        outcome: 'Monitoring comes after risk identification.',
                        experience: -10
                    },
                    {
                        text: 'Establish detailed risk tracking protocols across multiple project phases',
                        outcome: 'Tracking comes after identification.',
                        experience: 5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Payment Gateway Testing',
                description: 'You\'re testing an ecommerce site\'s payment system. What\'s the best risk management approach?',
                options: [
                    {
                        text: 'Monitor payments hourly',
                        outcome: 'Perfect! Regular testing and prompt reporting helps manage payment risks.',
                        experience: 15,
                        tool: 'Payment Testing'
                    },
                    {
                        text: 'Test payments once at the start of the day',
                        outcome: 'Payment systems need regular monitoring throughout testing.',
                        experience: -5
                    },
                    {
                        text: 'Establish extensive customer feedback collection mechanisms for payment-related issues',
                        outcome: 'Proactive testing is essential for risk management.',
                        experience: -10
                    },
                    {
                        text: 'Conduct payment verification only upon explicit client request or reported issues',
                        outcome: 'Regular payment testing is part of proper risk management.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Device Access',
                description: 'You realize you don\'t have access to one of the scoped devices for testing. What\'s the best risk management approach?',
                options: [
                    {
                        text: 'Immediately identify who has the device and arrange access',
                        outcome: 'Excellent! Proactive device access management reduces project risks.',
                        experience: 15,
                        tool: 'Resource Management'
                    },
                    {
                        text: 'Skip testing on that device',
                        outcome: 'This creates unchecked risks in the project.',
                        experience: -10
                    },
                    {
                        text: 'Wait for someone to ask about that device\'s testing',
                        outcome: 'Proactive communication is key in risk management.',
                        experience: -5
                    },
                    {
                        text: 'Only mention it in the final report',
                        outcome: 'Device access issues should be addressed immediately.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Issue Tracker Access',
                description: 'Testing starts today but no issue tracker has been provided. What\'s the best risk management approach?',
                options: [
                    {
                        text: 'Document issues locally and immediately alert PM about tracker need',
                        outcome: 'Perfect! This ensures no information is lost while addressing the risk.',
                        experience: 15,
                        tool: 'Issue Management'
                    },
                    {
                        text: 'Wait for the tracker to be provided',
                        outcome: 'Issues should be documented even without a tracker.',
                        experience: -10
                    },
                    {
                        text: 'Delay testing until tracker is available',
                        outcome: 'Testing should proceed with alternative documentation methods.',
                        experience: -5
                    },
                    {
                        text: 'Only test but don\'t document issues',
                        outcome: 'Issues must be documented even without a formal tracker.',
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
                title: 'Blocking Issue Management',
                description: 'You find a blocking issue with 5 testers on day 1 of a 4-day project. What\'s the best risk management approach?',
                options: [
                    {
                        text: 'Flag in team chat, raise highest severity ticket, tag PM, and actively monitor for changes',
                        outcome: 'Perfect! This follows proper risk management protocol for blocking issues.',
                        experience: 20,
                        tool: 'Issue Escalation'
                    },
                    {
                        text: 'Continue testing other areas without reporting',
                        outcome: 'Blocking issues need immediate communication due to resource impact.',
                        experience: -15
                    },
                    {
                        text: 'Wait for other testers to notice the issue',
                        outcome: 'Proactive communication is crucial for team-wide blocking issues.',
                        experience: -10
                    },
                    {
                        text: 'Only document the issue in your notes',
                        outcome: 'Blocking issues require immediate team communication.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Scope Change Management',
                description: 'The client adds 10 more pages to test on day 2, with Zoonou at 97% resource usage. How do you manage this risk?',
                options: [
                    {
                        text: 'Assess impact and notify PM',
                        outcome: 'Excellent! This provides data-driven risk assessment and communication.',
                        experience: 20,
                        tool: 'Resource Planning'
                    },
                    {
                        text: 'Try to test everything in the original timeline',
                        outcome: 'This creates quality risks and unrealistic expectations.',
                        experience: -15
                    },
                    {
                        text: 'Only test the original scope',
                        outcome: 'Changes need proper communication and planning.',
                        experience: -10
                    },
                    {
                        text: 'Test what you can without raising concerns',
                        outcome: 'Resource constraints need to be communicated promptly.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'App Installation Failure',
                description: 'On the final day, a new build won\'t install on 40% of test devices. What\'s the best risk management approach?',
                options: [
                    {
                        text: 'Check all devices, raise highest severity issue, coordinate with team for coverage',
                        outcome: 'Perfect! This addresses both technical and project risks comprehensively.',
                        experience: 20,
                        tool: 'Build Management'
                    },
                    {
                        text: 'Only test on working devices',
                        outcome: 'Device coverage gaps need to be communicated and assessed.',
                        experience: -15
                    },
                    {
                        text: 'Wait for a new build without reporting',
                        outcome: 'Installation issues need immediate reporting and risk assessment.',
                        experience: -10
                    },
                    {
                        text: 'Mark devices as untested without investigation',
                        outcome: 'Technical issues need proper investigation and documentation.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Missing Feature Risk',
                description: 'On the final day, one of three features hasn\'t been delivered for testing. How do you manage this risk?',
                options: [
                    {
                        text: 'Confirm with PM, document missing coverage, suggest alternative testing approaches',
                        outcome: 'Excellent! This provides clear risk documentation and mitigation options.',
                        experience: 20,
                        tool: 'Coverage Management'
                    },
                    {
                        text: 'Mark feature as passed without testing',
                        outcome: 'Untested features must be clearly documented as risks.',
                        experience: -15
                    },
                    {
                        text: 'Only mention it in final report',
                        outcome: 'Missing features need immediate communication.',
                        experience: -10
                    },
                    {
                        text: 'Test something else without reporting',
                        outcome: 'Coverage gaps need proper documentation and communication.',
                        experience: 5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'High Bug Volume',
                description: 'You find 8 major bugs in 90 minutes on page 1 of 7, with 6.5 hours remaining. How do you manage this risk?',
                options: [
                    {
                        text: 'Quick site assessment, estimate total bugs, inform PM, prioritize by severity',
                        outcome: 'Perfect! This provides structured risk assessment and prioritization.',
                        experience: 20,
                        tool: 'Bug Management'
                    },
                    {
                        text: 'Try to document every minor issue',
                        outcome: 'High bug volumes need severity-based prioritization.',
                        experience: -15
                    },
                    {
                        text: 'Skip detailed bug reports to cover more pages',
                        outcome: 'Quality of bug documentation shouldn\'t be sacrificed for speed.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on the first page',
                        outcome: 'Coverage needs to be balanced with bug severity.',
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
                title: 'Script Timeline Reduction',
                description: 'A 10-day scripted project is reduced to 5 days during execution. How do you manage this significant risk?',
                options: [
                    {
                        text: 'Analyze critical paths, propose coverage priorities, document risks of reduced testing',
                        outcome: 'Excellent! This provides structured risk management for scope reduction.',
                        experience: 25,
                        tool: 'Scope Management'
                    },
                    {
                        text: 'Try to complete all testing in reduced time',
                        outcome: 'Rushed testing creates quality risks that need documentation.',
                        experience: -15
                    },
                    {
                        text: 'Continue with original plan despite timeline',
                        outcome: 'Scope changes need proper replanning and risk assessment.',
                        experience: -10
                    },
                    {
                        text: 'Randomly reduce test coverage',
                        outcome: 'Coverage reduction needs strategic planning.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Personal Risk Management',
                description: 'Personal circumstances affect your work capacity. How do you best manage this risk?',
                options: [
                    {
                        text: 'Immediately inform manager with impact assessment and timeline if possible',
                        outcome: 'Perfect! This allows proper resource risk management and support.',
                        experience: 25,
                        tool: 'Resource Management'
                    },
                    {
                        text: 'Try to continue working normally',
                        outcome: 'Personal risks need proper communication for team support.',
                        experience: -15
                    },
                    {
                        text: 'Reduce work without informing anyone',
                        outcome: 'Changes in capacity need proper communication.',
                        experience: -10
                    },
                    {
                        text: 'Wait until it affects deliverables',
                        outcome: 'Early communication allows better risk management.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Risk Documentation',
                description: 'You need to document project risks in a client report. What\'s the most effective approach?',
                options: [
                    {
                        text: 'Include clear caveats, specific conditions, and potential impacts',
                        outcome: 'Excellent! This provides comprehensive risk documentation.',
                        experience: 25,
                        tool: 'Risk Documentation'
                    },
                    {
                        text: 'Only mention resolved issues',
                        outcome: 'All risks need documentation, including unresolved ones.',
                        experience: -15
                    },
                    {
                        text: 'Use vague descriptions of risks',
                        outcome: 'Risk documentation needs specific details and impacts.',
                        experience: -10
                    },
                    {
                        text: 'Skip risks that client already knows about',
                        outcome: 'All risks need formal documentation regardless of awareness.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Multiple Risk Factors',
                description: 'A project has device access issues, tight timeline, and communication gaps. How do you manage multiple risks?',
                options: [
                    {
                        text: 'Prioritize risks by impact score, create mitigation plan for each, communicate clearly',
                        outcome: 'Perfect! This provides structured management of multiple risks.',
                        experience: 25,
                        tool: 'Risk Prioritization'
                    },
                    {
                        text: 'Focus only on the most visible risk',
                        outcome: 'All risks need assessment and management plans.',
                        experience: -15
                    },
                    {
                        text: 'Handle risks as they become issues',
                        outcome: 'Proactive management of all risks is necessary.',
                        experience: -10
                    },
                    {
                        text: 'Delegate different risks to different team members',
                        outcome: 'Risks need coordinated management approach.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Client Risk Decisions',
                description: 'Client decides not to fix a serious issue before release. How do you manage this risk?',
                options: [
                    {
                        text: 'Document clear caveats, potential impacts, and maintain detailed risk records',
                        outcome: 'Excellent! This ensures proper risk documentation despite client decisions.',
                        experience: 25,
                        tool: 'Risk Documentation'
                    },
                    {
                        text: 'Accept decision without documentation',
                        outcome: 'Client decisions need proper risk documentation.',
                        experience: -15
                    },
                    {
                        text: 'Continue arguing for the fix',
                        outcome: 'Once documented, client risk decisions need to be respected.',
                        experience: -10
                    },
                    {
                        text: 'Remove issue from reports',
                        outcome: 'Risk documentation should maintain accuracy.',
                        experience: -5
                    }
                ]
            }
        ];

        // Initialize event listeners
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

// Add DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new RiskManagementQuiz();
    quiz.startGame();
}); 