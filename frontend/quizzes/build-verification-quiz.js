import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';

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
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'build-verification',
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
                title: 'Understanding BVT',
                description: 'What is the primary purpose of Build Verification Testing?',
                options: [
                    {
                        text: 'Ensure core functionality and stability remain intact in each new build before further testing',
                        outcome: 'Perfect! BVT validates build stability and readiness.',
                        experience: 15,
                        tool: 'Build Verification Framework'
                    },
                    {
                        text: 'Find all possible bugs',
                        outcome: 'BVT focuses on core functionality, not exhaustive testing.',
                        experience: -5
                    },
                    {
                        text: 'Test new features only',
                        outcome: 'BVT checks existing core functionality.',
                        experience: -10
                    },
                    {
                        text: 'Document all issues',
                        outcome: 'BVT primarily validates build stability.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Test Case Development',
                description: 'How should you develop BVT test cases?',
                options: [
                    {
                        text: 'Create repeatable tests focusing on critical functionality with well-defined expected results',
                        outcome: 'Excellent! Well-defined test cases ensure consistent verification.',
                        experience: 15,
                        tool: 'Test Case Template'
                    },
                    {
                        text: 'Test everything possible',
                        outcome: 'BVT needs focused, critical test cases.',
                        experience: -5
                    },
                    {
                        text: 'Create random test cases',
                        outcome: 'Test cases must be structured and repeatable.',
                        experience: -10
                    },
                    {
                        text: 'Skip test case documentation',
                        outcome: 'Documentation is crucial for consistency.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Core Functionality',
                description: 'What should you verify first in BVT?',
                options: [
                    {
                        text: 'Key areas like installation, login, and main navigation that are critical to basic operation',
                        outcome: 'Perfect! Core functionality must be verified first.',
                        experience: 15,
                        tool: 'Core Function Checklist'
                    },
                    {
                        text: 'Minor visual issues',
                        outcome: 'Focus on critical functionality first.',
                        experience: -10
                    },
                    {
                        text: 'New features only',
                        outcome: 'Core functionality needs verification.',
                        experience: -5
                    },
                    {
                        text: 'Documentation errors',
                        outcome: 'Critical operations take priority.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Environment Setup',
                description: 'How do you prepare for BVT across different environments?',
                options: [
                    {
                        text: 'Include test suites for each environment type with appropriate environment-specific checks',
                        outcome: 'Excellent! Environment-specific testing ensures comprehensive coverage.',
                        experience: 15,
                        tool: 'Environment Matrix'
                    },
                    {
                        text: 'Test one environment only',
                        outcome: 'All relevant environments need verification.',
                        experience: -10
                    },
                    {
                        text: 'Skip environment planning',
                        outcome: 'Environment planning is crucial.',
                        experience: -5
                    },
                    {
                        text: 'Use same tests for all',
                        outcome: 'Environment-specific tests needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Issue Handling',
                description: 'How should you handle issues found during BVT?',
                options: [
                    {
                        text: 'Report major functional issues immediately and request a new build for critical failures',
                        outcome: 'Perfect! Quick reporting of critical issues is essential.',
                        experience: 15,
                        tool: 'Issue Tracker'
                    },
                    {
                        text: 'Continue testing regardless',
                        outcome: 'Critical issues need immediate attention.',
                        experience: -10
                    },
                    {
                        text: 'Fix issues yourself',
                        outcome: 'Report issues for proper resolution.',
                        experience: -5
                    },
                    {
                        text: 'Document minor issues only',
                        outcome: 'Major issues need priority attention.',
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
                title: 'Test Case Maintenance',
                description: 'How do you maintain BVT test cases over time?',
                options: [
                    {
                        text: 'Regularly update test cases to include new core features and maintain accuracy',
                        outcome: 'Excellent! Test case maintenance ensures continued effectiveness.',
                        experience: 25,
                        tool: 'Test Case Manager'
                    },
                    {
                        text: 'Keep original test cases only',
                        outcome: 'Test cases need regular updates.',
                        experience: -15
                    },
                    {
                        text: 'Remove old test cases',
                        outcome: 'Update existing cases as needed.',
                        experience: -10
                    },
                    {
                        text: 'Ignore new features',
                        outcome: 'New core features need coverage.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Regression Prevention',
                description: 'How does BVT help prevent regression issues?',
                options: [
                    {
                        text: 'Verify critical functionality in each build to catch issues before they affect other modules',
                        outcome: 'Perfect! Early detection prevents regression spread.',
                        experience: 25,
                        tool: 'Regression Checker'
                    },
                    {
                        text: 'Test new code only',
                        outcome: 'Existing functionality needs verification.',
                        experience: -15
                    },
                    {
                        text: 'Skip regular testing',
                        outcome: 'Consistent testing prevents regression.',
                        experience: -10
                    },
                    {
                        text: 'Ignore previous issues',
                        outcome: 'Previous fixes need verification.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Resource Management',
                description: 'How do you manage resources efficiently during BVT?',
                options: [
                    {
                        text: 'Allocate appropriate time and testers based on build scope and complexity',
                        outcome: 'Excellent! Proper resource allocation ensures thorough verification.',
                        experience: 25,
                        tool: 'Resource Planner'
                    },
                    {
                        text: 'Use minimal resources',
                        outcome: 'Adequate resources needed for coverage.',
                        experience: -15
                    },
                    {
                        text: 'Overallocate resources',
                        outcome: 'Efficient resource use is important.',
                        experience: -10
                    },
                    {
                        text: 'Skip resource planning',
                        outcome: 'Resource planning ensures efficiency.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Build Acceptance',
                description: 'When should a build be accepted for further testing?',
                options: [
                    {
                        text: 'When all critical functionality passes and no blocking issues are found',
                        outcome: 'Perfect! Build stability is crucial for further testing.',
                        experience: 25,
                        tool: 'Acceptance Criteria'
                    },
                    {
                        text: 'Accept all builds',
                        outcome: 'Builds must meet stability criteria.',
                        experience: -15
                    },
                    {
                        text: 'Ignore minor issues',
                        outcome: 'Critical functionality must work.',
                        experience: -10
                    },
                    {
                        text: 'Skip verification',
                        outcome: 'Verification ensures build quality.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Documentation Review',
                description: 'How should you handle BVT documentation?',
                options: [
                    {
                        text: 'Maintain clear test cases, expected results, and execution records for each build',
                        outcome: 'Excellent! Documentation ensures consistency and traceability.',
                        experience: 25,
                        tool: 'Documentation Template'
                    },
                    {
                        text: 'Skip documentation',
                        outcome: 'Documentation is crucial for BVT.',
                        experience: -15
                    },
                    {
                        text: 'Document failures only',
                        outcome: 'All results need documentation.',
                        experience: -10
                    },
                    {
                        text: 'Use informal notes',
                        outcome: 'Structured documentation needed.',
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
                title: 'Process Improvement',
                description: 'How do you improve BVT processes over time?',
                options: [
                    {
                        text: 'Analyze effectiveness, gather feedback, and update processes based on project needs',
                        outcome: 'Perfect! Continuous improvement enhances BVT effectiveness.',
                        experience: 20,
                        tool: 'Process Analyzer'
                    },
                    {
                        text: 'Keep existing process',
                        outcome: 'Processes need regular updates.',
                        experience: -15
                    },
                    {
                        text: 'Change randomly',
                        outcome: 'Changes need proper analysis.',
                        experience: -10
                    },
                    {
                        text: 'Ignore feedback',
                        outcome: 'Feedback drives improvement.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Integration Planning',
                description: 'How do you plan BVT for module integration?',
                options: [
                    {
                        text: 'Verify individual modules and their interactions with comprehensive integration tests',
                        outcome: 'Excellent! Integration testing ensures module compatibility.',
                        experience: 20,
                        tool: 'Integration Planner'
                    },
                    {
                        text: 'Test one module only',
                        outcome: 'All modules need verification.',
                        experience: -15
                    },
                    {
                        text: 'Skip integration tests',
                        outcome: 'Integration testing is crucial.',
                        experience: -10
                    },
                    {
                        text: 'Assume compatibility',
                        outcome: 'Module interaction needs testing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Team Communication',
                description: 'How do you manage communication during BVT?',
                options: [
                    {
                        text: 'Maintain clear channels with development team and stakeholders for quick issue resolution',
                        outcome: 'Perfect! Effective communication ensures quick resolution.',
                        experience: 20,
                        tool: 'Communication Plan'
                    },
                    {
                        text: 'Work in isolation',
                        outcome: 'Team communication is essential.',
                        experience: -15
                    },
                    {
                        text: 'Delay issue reporting',
                        outcome: 'Quick communication needed.',
                        experience: -10
                    },
                    {
                        text: 'Report to one person',
                        outcome: 'All stakeholders need updates.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Risk Management',
                description: 'How do you manage risks in BVT?',
                options: [
                    {
                        text: 'Identify potential risks, prioritize critical areas, and maintain contingency plans',
                        outcome: 'Excellent! Risk management ensures BVT effectiveness.',
                        experience: 20,
                        tool: 'Risk Assessment'
                    },
                    {
                        text: 'Ignore risks',
                        outcome: 'Risk management is crucial.',
                        experience: -15
                    },
                    {
                        text: 'Handle issues as they occur',
                        outcome: 'Proactive risk management needed.',
                        experience: -10
                    },
                    {
                        text: 'Focus on minor risks',
                        outcome: 'Prioritize critical risks first.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Quality Metrics',
                description: 'How do you measure BVT effectiveness?',
                options: [
                    {
                        text: 'Track pass rates, issue detection, and prevention of critical defects in later testing',
                        outcome: 'Perfect! Metrics help evaluate and improve BVT.',
                        experience: 20,
                        tool: 'Quality Dashboard'
                    },
                    {
                        text: 'Count total tests only',
                        outcome: 'Multiple metrics needed.',
                        experience: -15
                    },
                    {
                        text: 'Skip measurements',
                        outcome: 'Metrics guide improvement.',
                        experience: -10
                    },
                    {
                        text: 'Track time only',
                        outcome: 'Quality metrics are crucial.',
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

document.addEventListener('DOMContentLoaded', () => {
    const quiz = new BuildVerificationQuiz();
    quiz.startGame();
});