import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class NonFunctionalQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a non-functional testing expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong non-functional testing skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing non-functional testing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
        value: 'non-functional',
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
                title: 'Understanding Non-Functional Testing',
                description: 'What is the primary focus of non-functional testing?',
                options: [
                    {
                        text: 'Testing how the system performs and operates, rather than what specific functions it does',
                        outcome: 'Perfect! Non-functional testing focuses on system characteristics and performance.',
                        experience: 15,
                        tool: 'Testing Framework'
                    },
                    {
                        text: 'Testing specific user actions only',
                        outcome: 'That\'s functional testing. Non-functional testing examines system characteristics.',
                        experience: -5
                    },
                    {
                        text: 'Only testing system features',
                        outcome: 'Non-functional testing goes beyond feature testing.',
                        experience: -10
                    },
                    {
                        text: 'Testing code structure',
                        outcome: 'Non-functional testing focuses on system behavior and performance.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Performance Testing',
                description: 'What aspects should you evaluate during performance testing?',
                options: [
                    {
                        text: 'Response time, throughput, scalability, stability, and reliability',
                        outcome: 'Excellent! These are key performance testing metrics.',
                        experience: 15,
                        tool: 'Performance Analyzer'
                    },
                    {
                        text: 'Only page load times',
                        outcome: 'Performance testing covers multiple aspects.',
                        experience: -5
                    },
                    {
                        text: 'Just check if it works',
                        outcome: 'Performance requires specific metrics evaluation.',
                        experience: -10
                    },
                    {
                        text: 'User interface only',
                        outcome: 'Performance goes beyond visual elements.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Load Testing',
                description: 'How should you approach load testing?',
                options: [
                    {
                        text: 'Verify system response under increased data volume and peak conditions',
                        outcome: 'Perfect! Load testing examines system behavior under various loads.',
                        experience: 15,
                        tool: 'Load Testing Tool'
                    },
                    {
                        text: 'Test with minimal users',
                        outcome: 'Load testing requires testing with varied user loads.',
                        experience: -10
                    },
                    {
                        text: 'Only test normal conditions',
                        outcome: 'Peak conditions must be tested too.',
                        experience: -5
                    },
                    {
                        text: 'Skip load testing entirely',
                        outcome: 'Load testing is crucial for system reliability.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Usability Testing',
                description: 'What is the main focus of usability testing?',
                options: [
                    {
                        text: 'How user-friendly and intuitive the application is for all users',
                        outcome: 'Excellent! Usability testing ensures good user experience.',
                        experience: 15,
                        tool: 'Usability Assessment'
                    },
                    {
                        text: 'Only check if features work',
                        outcome: 'Usability goes beyond functionality.',
                        experience: -10
                    },
                    {
                        text: 'Test technical aspects only',
                        outcome: 'User experience is key in usability.',
                        experience: -5
                    },
                    {
                        text: 'Focus on performance speed',
                        outcome: 'Usability covers overall user experience.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Compatibility Testing',
                description: 'What should you verify during compatibility testing?',
                options: [
                    {
                        text: 'Application compatibility with different hardware and software platforms',
                        outcome: 'Perfect! Compatibility testing ensures broad platform support.',
                        experience: 15,
                        tool: 'Compatibility Checker'
                    },
                    {
                        text: 'Only test one browser',
                        outcome: 'Multiple platforms need testing.',
                        experience: -10
                    },
                    {
                        text: 'Skip older versions',
                        outcome: 'All supported versions need testing.',
                        experience: -5
                    },
                    {
                        text: 'Test latest versions only',
                        outcome: 'Consider all supported configurations.',
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
                title: 'Accessibility Testing',
                description: 'How do you ensure proper accessibility testing?',
                options: [
                    {
                        text: 'Test against WCAG guidelines, check screen readers, and verify keyboard navigation',
                        outcome: 'Excellent! Comprehensive accessibility testing approach.',
                        experience: 20,
                        tool: 'Accessibility Validator'
                    },
                    {
                        text: 'Only check color contrast',
                        outcome: 'Accessibility covers many aspects.',
                        experience: -15
                    },
                    {
                        text: 'Skip accessibility testing',
                        outcome: 'Accessibility is crucial for inclusivity.',
                        experience: -10
                    },
                    {
                        text: 'Test visual elements only',
                        outcome: 'Consider all accessibility needs.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Security Testing',
                description: 'What should security testing cover?',
                options: [
                    {
                        text: 'Identify vulnerabilities, check data protection, and verify security measures',
                        outcome: 'Perfect! Comprehensive security testing approach.',
                        experience: 20,
                        tool: 'Security Scanner'
                    },
                    {
                        text: 'Only test login page',
                        outcome: 'Security testing needs broader coverage.',
                        experience: -15
                    },
                    {
                        text: 'Skip security checks',
                        outcome: 'Security testing is essential.',
                        experience: -10
                    },
                    {
                        text: 'Test passwords only',
                        outcome: 'Multiple security aspects need testing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Stress Testing',
                description: 'How should you conduct stress testing?',
                options: [
                    {
                        text: 'Push system beyond normal capacity with resource-intensive processes until breaking point',
                        outcome: 'Excellent! This identifies system limits effectively.',
                        experience: 20,
                        tool: 'Stress Test Suite'
                    },
                    {
                        text: 'Test normal conditions only',
                        outcome: 'Stress testing requires pushing limits.',
                        experience: -15
                    },
                    {
                        text: 'Stop at first error',
                        outcome: 'Finding breaking point is important.',
                        experience: -10
                    },
                    {
                        text: 'Use minimal load',
                        outcome: 'High load testing is necessary.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Volume Testing',
                description: 'What\'s the correct approach to volume testing?',
                options: [
                    {
                        text: 'Test system with large amounts of data to check efficiency and data handling',
                        outcome: 'Perfect! Volume testing verifies data handling capabilities.',
                        experience: 20,
                        tool: 'Volume Test Framework'
                    },
                    {
                        text: 'Use minimal data sets',
                        outcome: 'Large data volumes needed for testing.',
                        experience: -15
                    },
                    {
                        text: 'Skip data validation',
                        outcome: 'Data integrity is crucial.',
                        experience: -10
                    },
                    {
                        text: 'Test small files only',
                        outcome: 'Various data sizes need testing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Recovery Testing',
                description: 'How do you approach recovery testing?',
                options: [
                    {
                        text: 'Force system failures and verify data recovery and system rebound capabilities',
                        outcome: 'Excellent! This verifies system recovery effectively.',
                        experience: 20,
                        tool: 'Recovery Test Suite'
                    },
                    {
                        text: 'Only test normal shutdowns',
                        outcome: 'Unexpected failures need testing.',
                        experience: -15
                    },
                    {
                        text: 'Skip recovery testing',
                        outcome: 'Recovery testing is essential.',
                        experience: -10
                    },
                    {
                        text: 'Test minor issues only',
                        outcome: 'Various failure scenarios needed.',
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
                title: 'Installation Testing',
                description: 'What should installation testing verify?',
                options: [
                    {
                        text: 'Installation process, requirements, configurations, and user experience',
                        outcome: 'Perfect! Comprehensive installation testing approach.',
                        experience: 25,
                        tool: 'Installation Validator'
                    },
                    {
                        text: 'Only check if it installs',
                        outcome: 'Multiple aspects need verification.',
                        experience: -15
                    },
                    {
                        text: 'Skip installation testing',
                        outcome: 'Installation is crucial first interaction.',
                        experience: -10
                    },
                    {
                        text: 'Test default settings only',
                        outcome: 'Various configurations need testing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Documentation Testing',
                description: 'How should you test documentation?',
                options: [
                    {
                        text: 'Verify all technical documents exist, are consistent, and accurately reflect the system',
                        outcome: 'Excellent! Documentation testing ensures complete and accurate resources.',
                        experience: 25,
                        tool: 'Documentation Checker'
                    },
                    {
                        text: 'Only check user manual',
                        outcome: 'All documentation needs review.',
                        experience: -15
                    },
                    {
                        text: 'Skip documentation review',
                        outcome: 'Documentation is crucial support.',
                        experience: -10
                    },
                    {
                        text: 'Check titles only',
                        outcome: 'Content accuracy needs verification.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'UI Testing',
                description: 'What aspects should UI testing cover?',
                options: [
                    {
                        text: 'Interface elements, design consistency, responsiveness, and user interaction flows',
                        outcome: 'Perfect! Comprehensive UI testing approach.',
                        experience: 25,
                        tool: 'UI Test Suite'
                    },
                    {
                        text: 'Only check colors',
                        outcome: 'UI testing covers many aspects.',
                        experience: -15
                    },
                    {
                        text: 'Skip UI testing',
                        outcome: 'UI is crucial for user experience.',
                        experience: -10
                    },
                    {
                        text: 'Test one resolution only',
                        outcome: 'Multiple displays need testing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Uninstallation Testing',
                description: 'What should uninstallation testing verify?',
                options: [
                    {
                        text: 'Complete removal of components, no errors post-uninstall, and system cleanup',
                        outcome: 'Excellent! This ensures clean system state after removal.',
                        experience: 25,
                        tool: 'Uninstall Validator'
                    },
                    {
                        text: 'Only check if it uninstalls',
                        outcome: 'Complete cleanup needs verification.',
                        experience: -15
                    },
                    {
                        text: 'Skip uninstall testing',
                        outcome: 'Uninstallation is important feature.',
                        experience: -10
                    },
                    {
                        text: 'Test basic removal only',
                        outcome: 'All components need verification.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'GDPR Compliance Testing',
                description: 'How do you test for GDPR compliance?',
                options: [
                    {
                        text: 'Verify data handling, user consent, privacy controls, and data protection measures',
                        outcome: 'Perfect! Comprehensive GDPR compliance testing.',
                        experience: 25,
                        tool: 'Compliance Checker'
                    },
                    {
                        text: 'Only check privacy policy',
                        outcome: 'Multiple compliance aspects needed.',
                        experience: -15
                    },
                    {
                        text: 'Skip compliance testing',
                        outcome: 'GDPR compliance is mandatory.',
                        experience: -10
                    },
                    {
                        text: 'Test basic consent only',
                        outcome: 'All privacy aspects need testing.',
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
            console.log('Raw API Response:', savedProgress);
            let progress = null;
            
            if (savedProgress && savedProgress.data) {
                // Normalize the data structure
                progress = {
                    experience: savedProgress.data.experience || 0,
                    tools: savedProgress.data.tools || [],
                    questionHistory: savedProgress.data.questionHistory || [],
                    currentScenario: savedProgress.data.currentScenario || 0,
                    status: savedProgress.data.status || 'in-progress'
                };
                console.log('Normalized progress data:', progress);
            } else {
                // Try loading from localStorage as fallback
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    progress = parsed;
                    console.log('Loaded progress from localStorage:', progress);
                }
            }

            if (progress) {
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                this.player.currentScenario = progress.currentScenario || 0;

                // Ensure we're updating the UI correctly
                this.updateProgress();
                
                // Check quiz status and show appropriate screen
                if (progress.status === 'failed') {
                    this.endGame(true);
                    return true;
                } else if (progress.status === 'completed') {
                    this.endGame(false);
                    return true;
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

            // Calculate new experience with level-based minimum thresholds
            let newExperience = this.player.experience + selectedAnswer.experience;
            
            // Apply minimum thresholds based on current level
            const questionCount = this.player.questionHistory.length;
            if (questionCount >= 5) { // Intermediate level
                newExperience = Math.max(this.levelThresholds.basic.minXP, newExperience);
            }
            if (questionCount >= 10) { // Advanced level
                newExperience = Math.max(this.levelThresholds.intermediate.minXP, newExperience);
            }

            // Update player experience with bounds
            this.player.experience = Math.max(0, Math.min(this.maxXP, newExperience));
            
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of non-functional testing. You clearly understand the nuances of non-functional testing and are well-equipped to handle any non-functional testing challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your non-functional testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('load') || description.includes('load')) {
            return 'Load Testing';
        } else if (title.includes('stress') || description.includes('stress')) {
            return 'Stress Testing';
        } else if (title.includes('compatibility') || description.includes('compatibility')) {
            return 'Compatibility Testing';
        } else if (title.includes('accessibility') || description.includes('accessibility')) {
            return 'Accessibility Testing';
        } else if (title.includes('performance') || description.includes('performance')) {
            return 'Performance Testing';
        } else if (title.includes('security') || description.includes('security')) {
            return 'Security Testing';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Documentation Testing';
        } else {
            return 'General Non-Functional Testing';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Load Testing': 'Focus on improving system load testing strategies, including varied data volumes and peak conditions.',
            'Stress Testing': 'Enhance your approach to stress testing by systematically pushing system limits and monitoring behavior.',
            'Compatibility Testing': 'Strengthen testing across different platforms, browsers, and system configurations.',
            'Accessibility Testing': 'Improve WCAG compliance testing and verification of accessibility features.',
            'Performance Testing': 'Develop better performance metrics analysis and optimization strategies.',
            'Security Testing': 'Focus on comprehensive security testing methodologies and vulnerability assessments.',
            'Documentation Testing': 'Work on thorough documentation verification and consistency checking.',
            'General Non-Functional Testing': 'Continue developing fundamental non-functional testing principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core non-functional testing principles.';
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

// Add DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new NonFunctionalQuiz();
    quiz.startGame();
});