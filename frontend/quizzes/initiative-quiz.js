import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';

class InitiativeQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re an initiative expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong initiative skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing initiative best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'initiative',
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

        // Initialize screens
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
                title: 'New Team Member Support',
                description: 'You notice a new team member looking uncertain about their tasks. What\'s the best initiative to take?',
                options: [
                    {
                        text: 'Proactively offer help and support before they ask',
                        outcome: 'Perfect! Taking initiative to help others shows great team spirit.',
                        experience: 15,
                        tool: 'Team Support'
                    },
                    {
                        text: 'Wait for them to ask for help',
                        outcome: 'Initiative means offering support before being asked.',
                        experience: -5
                    },
                    {
                        text: 'Tell their manager they seem to be struggling',
                        outcome: 'Direct support is better than escalating immediately.',
                        experience: -10
                    },
                    {
                        text: 'Send them documentation links without context',
                        outcome: 'Personal support is more effective than just sharing resources.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Office Cleanup',
                description: 'After a work social event, the office space is messy and people are leaving. What shows the best initiative?',
                options: [
                    {
                        text: 'Start cleaning up and organizing without being asked',
                        outcome: 'Excellent! Taking responsibility for shared spaces shows great initiative.',
                        experience: 15,
                        tool: 'Workplace Responsibility'
                    },
                    {
                        text: 'Leave it for the cleaning staff',
                        outcome: 'This misses an opportunity to show initiative and responsibility.',
                        experience: -10
                    },
                    {
                        text: 'Ask who is responsible for cleanup',
                        outcome: 'Initiative means taking action without seeking assignment.',
                        experience: -5
                    },
                    {
                        text: 'Clean up only your own space',
                        outcome: 'While helpful, this doesn\'t show full initiative for team needs.',
                        experience: 5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Common Queries',
                description: 'You notice certain questions keep coming up in your team. What\'s the most initiative-driven response?',
                options: [
                    {
                        text: 'Create a FAQ or cheat sheet for the team',
                        outcome: 'Great! Creating resources proactively helps the whole team.',
                        experience: 15,
                        tool: 'Knowledge Sharing'
                    },
                    {
                        text: 'Keep answering questions as they come',
                        outcome: 'This misses an opportunity to create a lasting solution.',
                        experience: -5
                    },
                    {
                        text: 'Suggest others should create documentation',
                        outcome: 'Taking initiative means acting on opportunities yourself.',
                        experience: -10
                    },
                    {
                        text: 'Only document your own frequently asked questions',
                        outcome: 'While helpful, this doesn\'t address team-wide needs.',
                        experience: 5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Project Documentation',
                description: 'You\'re starting a new project and notice the documentation is outdated. What shows the best initiative?',
                options: [
                    {
                        text: 'Update the documentation and add missing information',
                        outcome: 'Perfect! Proactively improving documentation helps everyone.',
                        experience: 15,
                        tool: 'Documentation Management'
                    },
                    {
                        text: 'Wait for someone else to update it',
                        outcome: 'Initiative means addressing issues when you spot them.',
                        experience: -10
                    },
                    {
                        text: 'Report the outdated documentation to management',
                        outcome: 'Taking action directly is better than just reporting.',
                        experience: -5
                    },
                    {
                        text: 'Work around the outdated information',
                        outcome: 'This doesn\'t help solve the underlying issue.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Spare Time Usage',
                description: 'You have some spare time during your workday. What shows the best initiative?',
                options: [
                    {
                        text: 'Identify and work on valuable tasks that benefit the team or project',
                        outcome: 'Excellent! Using spare time productively shows great initiative.',
                        experience: 15,
                        tool: 'Time Management'
                    },
                    {
                        text: 'Wait for new tasks to be assigned',
                        outcome: 'Initiative means finding valuable work without being prompted.',
                        experience: -10
                    },
                    {
                        text: 'Ask colleagues if they need help',
                        outcome: 'While helpful, proactively identifying tasks shows more initiative.',
                        experience: 5
                    },
                    {
                        text: 'Use the time for personal tasks',
                        outcome: 'This misses an opportunity to add value to the team.',
                        experience: -5
                    }
                ]
            },
        ];
        // Intermediate Scenarios (IDs 6-10, 125 XP total)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Project Handover',
                description: 'You\'re leaving a project tomorrow and new testers are joining. How do you show the best initiative?',
                options: [
                    {
                        text: 'Create comprehensive handover notes and context documentation',
                        outcome: 'Perfect! Proactive knowledge transfer shows excellent initiative.',
                        experience: 20,
                        tool: 'Knowledge Transfer'
                    },
                    {
                        text: 'Wait for the new testers to ask questions',
                        outcome: 'Initiative means preparing resources before they\'re needed.',
                        experience: -15
                    },
                    {
                        text: 'Leave basic notes about current tasks',
                        outcome: 'While helpful, this doesn\'t provide full context needed.',
                        experience: 5
                    },
                    {
                        text: 'Tell them to check existing documentation',
                        outcome: 'This doesn\'t help bridge knowledge gaps effectively.',
                        experience: -10
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Test Environment Access',
                description: 'You realize you don\'t have access to a required device for testing. What shows the best initiative?',
                options: [
                    {
                        text: 'Proactively identify who has access and arrange coverage early',
                        outcome: 'Excellent! Taking early action to solve access issues shows great initiative.',
                        experience: 20,
                        tool: 'Resource Management'
                    },
                    {
                        text: 'Wait for the PM to sort out access',
                        outcome: 'Initiative means addressing potential blockers early.',
                        experience: -15
                    },
                    {
                        text: 'Skip testing on that device',
                        outcome: 'This avoids rather than solves the problem.',
                        experience: -10
                    },
                    {
                        text: 'Report the access issue and wait',
                        outcome: 'While reporting is good, taking action to solve is better.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Project Information Needs',
                description: 'You need information from the client and have access to client communications. What shows the best initiative?',
                options: [
                    {
                        text: 'Contact the client directly with clear, professional questions',
                        outcome: 'Perfect! Taking initiative to gather needed information directly.',
                        experience: 20,
                        tool: 'Client Communication'
                    },
                    {
                        text: 'Ask the PM to get the information',
                        outcome: 'This creates unnecessary delays when you have direct access.',
                        experience: -15
                    },
                    {
                        text: 'Work around the missing information',
                        outcome: 'This could lead to incorrect assumptions and issues.',
                        experience: -10
                    },
                    {
                        text: 'Wait for the next scheduled client meeting',
                        outcome: 'Proactive communication is better than waiting.',
                        experience: 5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Project Coverage Completion',
                description: 'You\'ve finished main project coverage with time remaining. How do you show the best initiative?',
                options: [
                    {
                        text: 'Review less-tested areas and enhance documentation',
                        outcome: 'Excellent! Using extra time to improve coverage shows great initiative.',
                        experience: 20,
                        tool: 'Quality Assurance'
                    },
                    {
                        text: 'Report that you\'re done and wait',
                        outcome: 'This misses opportunities to add value.',
                        experience: -15
                    },
                    {
                        text: 'Start on personal tasks',
                        outcome: 'Project time should be used for project improvement.',
                        experience: -10
                    },
                    {
                        text: 'Only help if someone asks',
                        outcome: 'Initiative means identifying opportunities without being asked.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'New Project Preparation',
                description: 'You\'re unsold today but have a new project tomorrow. What shows the best initiative?',
                options: [
                    {
                        text: 'Review available project materials and prepare testing environment',
                        outcome: 'Perfect! Preparing ahead shows excellent initiative.',
                        experience: 20,
                        tool: 'Project Preparation'
                    },
                    {
                        text: 'Wait until tomorrow to start preparation',
                        outcome: 'Using available time to prepare shows better initiative.',
                        experience: -15
                    },
                    {
                        text: 'Only check if you have project access',
                        outcome: 'While helpful, this misses opportunities for fuller preparation.',
                        experience: 5
                    },
                    {
                        text: 'Ask others what the project is about',
                        outcome: 'Direct research shows more initiative than just asking others.',
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
                title: 'Post-Release Issue Management',
                description: 'Issues have been found after release during test support. How do you show the highest level of initiative?',
                options: [
                    {
                        text: 'Investigate root cause, document findings, and propose prevention measures',
                        outcome: 'Excellent! Comprehensive problem-solving shows advanced initiative.',
                        experience: 25,
                        tool: 'Issue Resolution'
                    },
                    {
                        text: 'Only fix the immediate issues',
                        outcome: 'Initiative includes preventing future problems.',
                        experience: -15
                    },
                    {
                        text: 'Wait for instructions from the team lead',
                        outcome: 'Advanced initiative means taking leadership in problem-solving.',
                        experience: -10
                    },
                    {
                        text: 'Document the issues for others to investigate',
                        outcome: 'While documentation is important, taking action is better.',
                        experience: 0
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Project Process Improvement',
                description: 'You\'ve noticed inefficiencies in the current testing process. What shows the highest initiative?',
                options: [
                    {
                        text: 'Document issues, research solutions, and present improvement proposals',
                        outcome: 'Perfect! Taking leadership in process improvement shows advanced initiative.',
                        experience: 25,
                        tool: 'Process Improvement'
                    },
                    {
                        text: 'Mention the issues in team meetings',
                        outcome: 'Advanced initiative requires more than just highlighting problems.',
                        experience: -10
                    },
                    {
                        text: 'Work around the inefficiencies',
                        outcome: 'This doesn\'t address the underlying issues.',
                        experience: -15
                    },
                    {
                        text: 'Ask others if they\'ve noticed the issues',
                        outcome: 'While gathering input is good, taking action is better.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Cross-Team Collaboration',
                description: 'You identify an issue that affects multiple teams. How do you show the most initiative?',
                options: [
                    {
                        text: 'Coordinate with all affected teams and lead resolution efforts',
                        outcome: 'Excellent! Taking leadership in cross-team issues shows advanced initiative.',
                        experience: 25,
                        tool: 'Collaboration Management'
                    },
                    {
                        text: 'Report the issue to each team separately',
                        outcome: 'This misses opportunity for coordinated resolution.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on your team\'s portion',
                        outcome: 'Advanced initiative means addressing the broader impact.',
                        experience: -15
                    },
                    {
                        text: 'Wait for someone else to coordinate',
                        outcome: 'Leadership opportunity missed.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Knowledge Sharing Leadership',
                description: 'You\'ve developed efficient testing methods over time. How do you best show initiative in sharing this knowledge?',
                options: [
                    {
                        text: 'Create comprehensive guides and organize training sessions',
                        outcome: 'Perfect! Proactively sharing knowledge shows advanced initiative.',
                        experience: 25,
                        tool: 'Knowledge Management'
                    },
                    {
                        text: 'Share tips only when asked',
                        outcome: 'Advanced initiative means proactively sharing expertise.',
                        experience: -15
                    },
                    {
                        text: 'Keep the methods to yourself',
                        outcome: 'Knowledge hoarding doesn\'t help team growth.',
                        experience: -10
                    },
                    {
                        text: 'Mention them casually in meetings',
                        outcome: 'Structured knowledge sharing is more effective.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Strategic Project Planning',
                description: 'You notice potential future challenges in a long-term project. How do you show the highest initiative?',
                options: [
                    {
                        text: 'Develop and present a strategic plan to address future challenges',
                        outcome: 'Excellent! Strategic thinking and planning shows advanced initiative.',
                        experience: 25,
                        tool: 'Strategic Planning'
                    },
                    {
                        text: 'Wait until the challenges become actual problems',
                        outcome: 'Advanced initiative means addressing issues before they occur.',
                        experience: -15
                    },
                    {
                        text: 'Mention concerns without solutions',
                        outcome: 'Initiative includes proposing solutions, not just identifying problems.',
                        experience: -10
                    },
                    {
                        text: 'Add it to the risk register only',
                        outcome: 'While documentation is good, taking action is better.',
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
            console.log('Progress saved successfully:', progress);
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
                console.log('Loaded progress from API:', progress);
            } else {
                // Try loading from localStorage
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (parsed.progress) {
                        progress = parsed.progress;
                        console.log('Loaded progress from localStorage:', progress);
                    }
                }
            }

            if (progress) {
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                
                // Set the current scenario to the actual value from progress
                this.player.currentScenario = progress.currentScenario || 0;

                // Update UI
                this.updateProgress();

                // Update the questions progress display
                const questionsProgress = document.getElementById('questions-progress');
                if (questionsProgress) {
                    questionsProgress.textContent = `${this.player.questionHistory.length}/15`;
                }

                // Update the current scenario display
                const currentScenarioDisplay = document.getElementById('current-scenario');
                if (currentScenarioDisplay) {
                    currentScenarioDisplay.textContent = `${this.player.currentScenario}`;
                }

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
            // Show loading indicator
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

            // Initialize event listeners
            this.initializeEventListeners();

            // Load previous progress
            const hasProgress = await this.loadProgress();
            console.log('Previous progress loaded:', hasProgress);
            
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
        
        // Check basic level completion
        if (this.player.questionHistory.length >= 5) {
            if (this.player.experience < this.levelThresholds.basic.minXP) {
                this.endGame(true); // End with failure state
                return;
            }
        }

        // Check intermediate level completion
        if (this.player.questionHistory.length >= 10) {
            if (this.player.experience < this.levelThresholds.intermediate.minXP) {
                this.endGame(true); // End with failure state
                return;
            }
        }

        // Check Advanced level completion
        if (this.player.questionHistory.length >= 15) {
            if (this.player.experience < this.levelThresholds.advanced.minXP) {
                this.endGame(true); // End with failure state
                return;
            } else {
                this.endGame(false); // Completed successfully
                return;
            }
        }

        // Get the next scenario based on current progress
        let scenario;
        const questionCount = this.player.questionHistory.length;
        
        if (questionCount < 5) {
            // Basic questions (0-4)
            scenario = this.basicScenarios[questionCount];
        } else if (questionCount < 10) {
            // Intermediate questions (5-9)
            scenario = this.intermediateScenarios[questionCount - 5];
        } else if (questionCount < 15) {
            // Advanced questions (10-14)
            scenario = this.advancedScenarios[questionCount - 10];
        }

        if (!scenario) {
            console.error('No scenario found for current progress. Question count:', questionCount);
            this.endGame(true);
            return;
        }

        // Store current question number for consistency
        this.currentQuestionNumber = questionCount + 1;
        
        // Show level transition message at the start of each level or when level changes
        const currentLevel = this.getCurrentLevel();
        const previousLevel = this.player.questionHistory.length > 0 ? 
            this.getCurrentLevel() : null;
            
        if (this.player.questionHistory.length === 0 || previousLevel !== currentLevel) {
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = ''; // Clear any existing messages
                
                const levelMessage = document.createElement('div');
                levelMessage.className = 'level-transition';
                levelMessage.setAttribute('role', 'alert');
                levelMessage.textContent = `Starting ${currentLevel} Questions`;
                
                transitionContainer.appendChild(levelMessage);
                transitionContainer.classList.add('active');
                
                // Update the level indicator
                const levelIndicator = document.getElementById('level-indicator');
                if (levelIndicator) {
                    levelIndicator.textContent = `Level: ${currentLevel}`;
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

        // Update question counter immediately
        const questionProgress = document.getElementById('question-progress');
        if (questionProgress) {
            questionProgress.textContent = `Question: ${this.currentQuestionNumber}/15`;
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

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();

            // Calculate the score and experience
            const totalQuestions = 15;
            const completedQuestions = this.player.questionHistory.length;
            const percentComplete = Math.round((completedQuestions / totalQuestions) * 100);
            
            const score = {
                quizName: this.quizName,
                score: percentComplete,
                experience: this.player.experience,
                questionHistory: this.player.questionHistory,
                questionsAnswered: completedQuestions,
                lastActive: new Date().toISOString()
            };
            
            // Save quiz result
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                await quizUser.updateQuizScore(
                    this.quizName,
                    score.score,
                    score.experience,
                    this.player.tools,
                    score.questionHistory,
                    score.questionsAnswered
                );
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
            const completedQuestions = Math.min(this.player.questionHistory.length, totalQuestions);
            
            // Use stored question number for consistency
            questionProgress.textContent = `Question: ${this.currentQuestionNumber || completedQuestions}/15`;
            
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

        if (score >= 95 && weakAreas.length === 0) {
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of using your initiative. You clearly understand the nuances of using your initiative and are well-equipped to handle any using your initiative challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your initiative skills are very strong. To achieve complete mastery, consider focusing on:</p>';
            recommendationsHTML += '<ul>';
            if (weakAreas.length > 0) {
                weakAreas.forEach(area => {
                    recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
                });
            }
            recommendationsHTML += '</ul>';
        } else if (score >= 60) {
            recommendationsHTML = '<p>👍 Good effort! Here are some areas to focus on:</p>';
            recommendationsHTML += '<ul>';
            weakAreas.forEach(area => {
                recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
            });
            recommendationsHTML += '</ul>';
        } else {
            recommendationsHTML = '<p>📚 Here are key areas for improvement:</p>';
            recommendationsHTML += '<ul>';
            weakAreas.forEach(area => {
                recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
            });
            recommendationsHTML += '</ul>';
        }

        recommendationsContainer.innerHTML = recommendationsHTML;
    }

    categorizeQuestion(scenario) {
        // Categorize questions based on their content
        const title = scenario.title.toLowerCase();
        const description = scenario.description.toLowerCase();

        if (title.includes('knowledge') || description.includes('knowledge')) {
            return 'Knowledge Management';
        } else if (title.includes('process') || description.includes('process')) {
            return 'Process Improvement';
        } else if (title.includes('strategic') || description.includes('future')) {
            return 'Strategic Planning';
        } else if (title.includes('handover') || description.includes('handover')) {
            return 'Knowledge Transfer';
        } else if (title.includes('coverage') || description.includes('coverage')) {
            return 'Quality Assurance';
        } else if (title.includes('cleanup') || description.includes('responsibility')) {
            return 'Workplace Responsibility';
        } else if (title.includes('queries') || description.includes('questions')) {
            return 'Team Support';
        } else {
            return 'General Initiative';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Knowledge Management': 'Focus on proactively creating and sharing documentation and best practices.',
            'Process Improvement': 'Develop skills in identifying inefficiencies and proposing structured solutions.',
            'Strategic Planning': 'Enhance ability to anticipate challenges and create preventive action plans.',
            'Knowledge Transfer': 'Strengthen comprehensive handover documentation and knowledge sharing practices.',
            'Quality Assurance': 'Work on identifying opportunities for additional testing and coverage improvements.',
            'Workplace Responsibility': 'Continue taking ownership of shared responsibilities without being asked.',
            'Team Support': 'Focus on creating lasting solutions that benefit the entire team.',
            'General Initiative': 'Continue developing proactive problem-solving and leadership skills.'
        };

        return recommendations[area] || 'Continue practicing core initiative-taking principles.';
    }

    endGame(failed = false) {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        const finalScore = Math.min(this.player.experience, this.maxXP);
        const scorePercentage = Math.round((finalScore / this.maxXP) * 100);
        
        // Save the final quiz result with pass/fail status
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                const result = {
                    score: scorePercentage,
                    status: failed ? 'failed' : 'passed',
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory,
                    questionsAnswered: this.player.questionHistory.length,
                    lastActive: new Date().toISOString()
                };
                user.updateQuizScore(
                    this.quizName,
                    result.score,
                    result.experience,
                    this.player.tools,
                    result.questionHistory,
                    result.questionsAnswered,
                    result.status
                );
                console.log('Final quiz score saved:', result);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

        const performanceSummary = document.getElementById('performance-summary');
        if (failed) {
            performanceSummary.textContent = 'Quiz failed. You did not meet the minimum XP requirement to progress. Please reset your progress to try again.';
            // Hide restart button if failed
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.style.display = 'none';
            }
        } else {
            const threshold = this.performanceThresholds.find(t => finalScore >= t.threshold);
            performanceSummary.textContent = threshold.message;
        }

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
    const quiz = new InitiativeQuiz();
    quiz.startGame();
}); 