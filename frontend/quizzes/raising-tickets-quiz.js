import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class RaisingTicketsQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of raising tickets. You clearly understand the nuances of raising tickets and are well-equipped to handle any raising tickets challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your raising tickets skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('type') || description.includes('type')) {
            return 'Ticket Classification';
        } else if (title.includes('title') || description.includes('title')) {
            return 'Title Creation';
        } else if (title.includes('version') || description.includes('version')) {
            return 'Version Documentation';
        } else if (title.includes('severity') || description.includes('severity')) {
            return 'Severity Assessment';
        } else if (title.includes('quality') || description.includes('quality')) {
            return 'Quality Assurance';
        } else if (title.includes('evidence') || description.includes('evidence')) {
            return 'Evidence Management';
        } else if (title.includes('consistency') || description.includes('consistency')) {
            return 'Consistency Standards';
        } else {
            return 'General Ticket Management';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Ticket Classification': 'Focus on understanding different ticket types and when to use each category appropriately.',
            'Title Creation': 'Practice writing clear, concise titles that effectively communicate the issue at hand.',
            'Version Documentation': 'Improve accuracy in documenting environment details and version information.',
            'Severity Assessment': 'Enhance ability to evaluate and assign appropriate severity levels based on impact.',
            'Quality Assurance': 'Strengthen pre-submission quality checks and verification processes.',
            'Evidence Management': 'Work on capturing and organizing clear, relevant supporting evidence.',
            'Consistency Standards': 'Focus on maintaining consistent formatting and following documentation standards.',
            'General Ticket Management': 'Continue developing fundamental ticket creation and management skills.'
        };

        return recommendations[area] || 'Continue practicing core ticket management principles.';
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

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new RaisingTicketsQuiz();
    quiz.startGame();
}); 