import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class BuildVerificationQuiz extends BaseQuiz {
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
                        experience: 20,
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
                        experience: 20,
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
                        experience: 20,
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
                        experience: 20,
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
                        experience: 20,
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
                        experience: 25,
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
                        experience: 25,
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
                        experience: 25,
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
                        experience: 25,
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
                        experience: 25,
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
        return totalQuestionsAnswered >= 15 || currentXP >= this.maxXP;
    }

    async saveProgress() {
        // First determine the status based on clear conditions
        let status = 'in-progress';
        
        // Check for completion (all 15 questions answered)
        if (this.player.questionHistory.length >= 15) {
            // Check if they met the advanced XP requirement
            if (this.player.experience >= this.levelThresholds.advanced.minXP) {
                status = 'completed';
            } else {
                status = 'failed';
            }
        } 
        // Check for early failure conditions
        else if (
            (this.player.questionHistory.length >= 10 && this.player.experience < this.levelThresholds.intermediate.minXP) ||
            (this.player.questionHistory.length >= 5 && this.player.experience < this.levelThresholds.basic.minXP)
        ) {
            status = 'failed';
        }

        const progress = {
            data: {
                experience: this.player.experience,
                tools: this.player.tools,
                currentScenario: this.player.currentScenario,
                questionHistory: this.player.questionHistory,
                lastUpdated: new Date().toISOString(),
                questionsAnswered: this.player.questionHistory.length,
                status: status
            }
        };

        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot save progress');
                return;
            }
            
            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify(progress));
            
            console.log('Saving progress with status:', status);
            await this.apiService.saveQuizProgress(this.quizName, progress.data);
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
            
            if (savedProgress && savedProgress.data && savedProgress.data.data) {
                // Access the nested data structure from the API
                progress = savedProgress.data.data;
                console.log('Loaded progress from API:', progress);
            } else {
                // Try loading from localStorage
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (parsed.data) {
                        progress = parsed.data;
                        console.log('Loaded progress from localStorage:', progress);
                    }
                }
            }

            if (progress) {
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                this.player.currentScenario = progress.currentScenario || 0;

                console.log('Setting quiz state from progress:', {
                    status: progress.status,
                    experience: progress.experience,
                    questionsAnswered: progress.questionsAnswered
                });

                // Check quiz status and show appropriate screen
                if (progress.status === 'failed') {
                    this.endGame(true); // Show failed state
                    return true;
                } else if (progress.status === 'completed') {
                    this.endGame(false); // Show completion state
                    return true;
                }

                // Update UI for in-progress state
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
        
        // Reset currentScenario based on the current level
        if (questionCount < 5) {
            // Basic questions (0-4)
            scenario = this.basicScenarios[questionCount];
            this.player.currentScenario = questionCount;
        } else if (questionCount < 10) {
            // Intermediate questions (5-9)
            scenario = this.intermediateScenarios[questionCount - 5];
            this.player.currentScenario = questionCount - 5;
        } else if (questionCount < 15) {
            // Advanced questions (10-14)
            scenario = this.advancedScenarios[questionCount - 10];
            this.player.currentScenario = questionCount - 10;
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
        const previousLevel = questionCount > 0 ? 
            (questionCount <= 5 ? 'Basic' : 
             questionCount <= 10 ? 'Intermediate' : 'Advanced') : null;
            
        if (questionCount === 0 || 
            (questionCount === 5 && currentLevel === 'Intermediate') || 
            (questionCount === 10 && currentLevel === 'Advanced')) {
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
            
            // Add status to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                status: selectedAnswer.experience > 0 ? 'passed' : 'failed',
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of build verification. You clearly understand the nuances of build verification and are well-equipped to handle any build verification challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your build verification skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('core') || description.includes('core')) {
            return 'Core Functionality';
        } else if (title.includes('regression') || description.includes('regression')) {
            return 'Regression Prevention';
        } else if (title.includes('integration') || description.includes('integration')) {
            return 'Integration Testing';
        } else if (title.includes('acceptance') || description.includes('accept')) {
            return 'Build Acceptance';
        } else if (title.includes('issue') || description.includes('issue')) {
            return 'Issue Management';
        } else if (title.includes('automation') || description.includes('automate')) {
            return 'Test Automation';
        } else if (title.includes('environment') || description.includes('environment')) {
            return 'Environment Setup';
        } else if (title.includes('performance') || description.includes('performance')) {
            return 'Performance Verification';
        } else {
            return 'General BVT Process';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Core Functionality': 'Focus on systematic verification of critical system functions like installation, login, and navigation.',
            'Regression Prevention': 'Strengthen early detection of regression issues through comprehensive core testing.',
            'Integration Testing': 'Improve verification of module interactions and dependencies during integration.',
            'Build Acceptance': 'Enhance criteria evaluation for determining build stability and readiness.',
            'Issue Management': 'Develop better strategies for prioritizing and escalating critical build issues.',
            'Test Automation': 'Focus on implementing reliable automated checks for core functionality.',
            'Environment Setup': 'Strengthen verification of build deployment and environment configuration.',
            'Performance Verification': 'Improve basic performance checks during build verification.',
            'General BVT Process': 'Continue developing fundamental build verification principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core build verification principles.';
    }

    async endGame(failed = false) {
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
                const status = failed ? 'failed' : 'completed';
                console.log('Setting final quiz status:', { status, score: scorePercentage });
                
                const result = {
                    score: scorePercentage,
                    status: status,
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory,
                    questionsAnswered: this.player.questionHistory.length,
                    lastActive: new Date().toISOString()
                };

                // Save to QuizUser
                user.updateQuizScore(
                    this.quizName,
                    result.score,
                    result.experience,
                    this.player.tools,
                    result.questionHistory,
                    result.questionsAnswered,
                    status
                );

                // Save to API with proper structure
                const apiProgress = {
                    data: {
                        ...result,
                        tools: this.player.tools,
                        currentScenario: this.player.currentScenario
                    }
                };

                // Save directly via API to ensure status is updated
                console.log('Saving final progress to API:', apiProgress);
                await this.apiService.saveQuizProgress(this.quizName, apiProgress.data);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = failed ? 'Quiz Failed!' : 'Quiz Complete!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (failed) {
            performanceSummary.textContent = 'Quiz failed. You did not meet the minimum XP requirement to progress. You cannot retry this quiz.';
            // Hide restart button if failed
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.style.display = 'none';
            }
            // Add failed class to quiz container for styling
            const quizContainer = document.getElementById('quiz-container');
            if (quizContainer) {
                quizContainer.classList.add('failed');
            }
        } else {
            const threshold = this.performanceThresholds.find(t => t.threshold <= finalScore);
            if (threshold) {
                performanceSummary.textContent = threshold.message;
            } else {
                performanceSummary.textContent = 'Quiz completed successfully!';
            }
        }

        // Generate question review list
        const reviewList = document.getElementById('question-review');
        if (reviewList) {
            reviewList.innerHTML = ''; // Clear existing content
            this.player.questionHistory.forEach((record, index) => {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                
                const maxXP = Math.max(...record.scenario.options.map(o => o.experience));
                const earnedXP = record.selectedAnswer.experience;
                const isCorrect = earnedXP === maxXP;
                
                reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
                
                reviewItem.innerHTML = `
                    <h4>Question ${index + 1}</h4>
                    <p class="scenario">${record.scenario.description}</p>
                    <p class="answer"><strong>Your Answer:</strong> ${record.selectedAnswer.text}</p>
                    <p class="outcome"><strong>Outcome:</strong> ${record.selectedAnswer.outcome}</p>
                    <p class="xp"><strong>Experience Earned:</strong> ${earnedXP}/${maxXP}</p>
                `;
                
                reviewList.appendChild(reviewItem);
            });
        }

        this.generateRecommendations();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const quiz = new BuildVerificationQuiz();
    quiz.startGame();
});