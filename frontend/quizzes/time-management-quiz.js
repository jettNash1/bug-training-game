import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

class TimeManagementQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a time management expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong time management skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing time management best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'time-management',
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
                title: 'Weekly Planning',
                description: 'What\'s the first step in planning your week ahead effectively?',
                options: [
                    {
                        text: 'Review your calendar for meetings and prepare for any necessary preparation and wrap-up activities',
                        outcome: 'Perfect! Starting with a calendar review helps structure your week.',
                        experience: 15,
                        tool: 'Calendar Management'
                    },
                    {
                        text: 'Start working on the first task you see',
                        outcome: 'Planning ahead is more effective than reactive working.',
                        experience: -5
                    },
                    {
                        text: 'Wait for daily assignments',
                        outcome: 'Proactive planning is better than waiting for instructions.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on today\'s tasks',
                        outcome: 'Looking ahead helps prevent future bottlenecks.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Workspace Organization',
                description: 'How should you prepare your workspace for efficient testing?',
                options: [
                    {
                        text: 'Clean workspace, organized email inbox, pinned relevant channels, and charged devices',
                        outcome: 'Excellent! An organized workspace increases efficiency.',
                        experience: 15,
                        tool: 'Workspace Management'
                    },
                    {
                        text: 'Keep all channels and tabs open',
                        outcome: 'Too many open items can cause confusion and slow you down.',
                        experience: -5
                    },
                    {
                        text: 'Start working without preparation',
                        outcome: 'Preparation prevents delays and increases productivity.',
                        experience: -10
                    },
                    {
                        text: 'Only focus on device setup',
                        outcome: 'Complete workspace organization is important.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Project Documentation Review',
                description: 'When should you review project documentation for a new assignment?',
                options: [
                    {
                        text: 'Before the first session, using unsold time if needed',
                        outcome: 'Perfect! Early preparation ensures efficient testing.',
                        experience: 15,
                        tool: 'Documentation Review'
                    },
                    {
                        text: 'During the first test session',
                        outcome: 'Review should be done before testing begins.',
                        experience: -5
                    },
                    {
                        text: 'Only when issues arise',
                        outcome: 'Proactive review prevents issues and saves time.',
                        experience: -10
                    },
                    {
                        text: 'After the first standup',
                        outcome: 'Documentation should be reviewed before meetings.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Daily Preparation',
                description: 'What\'s the most important first step in preparing for your day?',
                options: [
                    {
                        text: 'Check the resource sheet and review any project changes',
                        outcome: 'Excellent! Resource updates are crucial for daily planning.',
                        experience: 15,
                        tool: 'Resource Management'
                    },
                    {
                        text: 'Start testing immediately',
                        outcome: 'Checking resources first prevents misdirected effort.',
                        experience: -10
                    },
                    {
                        text: 'Wait for team instructions',
                        outcome: 'Proactive preparation is better than waiting.',
                        experience: -5
                    },
                    {
                        text: 'Review yesterday\'s work only',
                        outcome: 'Current resource status is most important.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Meeting Management',
                description: 'How should you handle meetings in your schedule?',
                options: [
                    {
                        text: 'Factor in preparation and wrap-up time, not just meeting duration',
                        outcome: 'Perfect! Complete meeting time management includes preparation.',
                        experience: 15,
                        tool: 'Meeting Planning'
                    },
                    {
                        text: 'Schedule back-to-back',
                        outcome: 'Buffer time is needed for effective meetings.',
                        experience: -10
                    },
                    {
                        text: 'Join at exact start time',
                        outcome: 'Preparation time ensures productive meetings.',
                        experience: -5
                    },
                    {
                        text: 'Focus only on meeting duration',
                        outcome: 'Consider full meeting impact on schedule.',
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
                title: 'Project Timing Estimation',
                description: 'How do you determine appropriate time allocation for test activities?',
                options: [
                    {
                        text: 'Review SOW timings, environment count, software size, and core user journeys',
                        outcome: 'Excellent! A comprehensive review ensures accurate timing.',
                        experience: 20,
                        tool: 'Time Estimation'
                    },
                    {
                        text: 'Use standard timings for all projects',
                        outcome: 'Each project needs custom time estimation.',
                        experience: -15
                    },
                    {
                        text: 'Base estimates on previous similar projects only',
                        outcome: 'Current project specifics need consideration.',
                        experience: -10
                    },
                    {
                        text: 'Estimate without reviewing scope',
                        outcome: 'Scope review is crucial for timing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Team Workload Distribution',
                description: 'How do you divide test tasks among team members?',
                options: [
                    {
                        text: 'Consider experience levels, individual paces, and project familiarity',
                        outcome: 'Perfect! Fair distribution considers individual capabilities.',
                        experience: 20,
                        tool: 'Workload Management'
                    },
                    {
                        text: 'Divide equally by number',
                        outcome: 'Task division should consider experience levels.',
                        experience: -15
                    },
                    {
                        text: 'Assign randomly',
                        outcome: 'Strategic assignment ensures efficient testing.',
                        experience: -10
                    },
                    {
                        text: 'Let team members choose',
                        outcome: 'Structured distribution needed for coverage.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Test Coverage Prioritization',
                description: 'How do you prioritize different areas of testing?',
                options: [
                    {
                        text: 'Analyze client priorities, core functions, and user patterns',
                        outcome: 'Excellent! Strategic prioritization maximizes value.',
                        experience: 20,
                        tool: 'Priority Management'
                    },
                    {
                        text: 'Test in linear order',
                        outcome: 'Priority-based testing is more effective.',
                        experience: -15
                    },
                    {
                        text: 'Focus on easy areas first',
                        outcome: 'Prioritize based on importance, not ease.',
                        experience: -10
                    },
                    {
                        text: 'Follow personal preferences',
                        outcome: 'Client needs should drive priorities.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Progress Monitoring',
                description: 'How do you track testing progress throughout the day?',
                options: [
                    {
                        text: 'Regularly assess coverage, adjust timings, and communicate any concerns',
                        outcome: 'Perfect! Active monitoring enables timely adjustments.',
                        experience: 20,
                        tool: 'Progress Tracking'
                    },
                    {
                        text: 'Wait until end of day',
                        outcome: 'Regular progress checks prevent delays.',
                        experience: -15
                    },
                    {
                        text: 'Only track when asked',
                        outcome: 'Proactive monitoring is essential.',
                        experience: -10
                    },
                    {
                        text: 'Focus on speed over tracking',
                        outcome: 'Balance speed with progress monitoring.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Environment Testing Order',
                description: 'How do you manage time across multiple test environments?',
                options: [
                    {
                        text: 'Start with primary environment, then adjust timing for others based on global issues',
                        outcome: 'Excellent! Efficient environment coverage strategy.',
                        experience: 20,
                        tool: 'Environment Management'
                    },
                    {
                        text: 'Test all equally',
                        outcome: 'Adapt timing based on previous findings.',
                        experience: -15
                    },
                    {
                        text: 'Random environment order',
                        outcome: 'Strategic order maximizes efficiency.',
                        experience: -10
                    },
                    {
                        text: 'Skip secondary environments',
                        outcome: 'All environments need appropriate coverage.',
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
                title: 'Multiple Project Management',
                description: 'How do you manage time when working on multiple projects in a week?',
                options: [
                    {
                        text: 'Review all project requirements, create daily schedules, maintain clear separation',
                        outcome: 'Perfect! Structured approach to multiple projects.',
                        experience: 25,
                        tool: 'Multi-Project Management'
                    },
                    {
                        text: 'Handle projects as they come',
                        outcome: 'Advance planning needed for multiple projects.',
                        experience: -15
                    },
                    {
                        text: 'Focus on one project at a time',
                        outcome: 'Balance needed across all projects.',
                        experience: -10
                    },
                    {
                        text: 'Multitask between projects',
                        outcome: 'Clear project separation is more effective.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Risk Management',
                description: 'How do you handle potential timing risks in a project?',
                options: [
                    {
                        text: 'Identify risks early, implement mitigation steps, communicate with PM',
                        outcome: 'Excellent! Proactive risk management saves time.',
                        experience: 25,
                        tool: 'Risk Management'
                    },
                    {
                        text: 'Deal with issues as they arise',
                        outcome: 'Early risk identification prevents delays.',
                        experience: -15
                    },
                    {
                        text: 'Ignore minor risks',
                        outcome: 'All risks need appropriate attention.',
                        experience: -10
                    },
                    {
                        text: 'Handle risks without reporting',
                        outcome: 'Risk communication is essential.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Late Stage Issues',
                description: 'You discover major issues late in the testing window. How do you manage this?',
                options: [
                    {
                        text: 'Immediately notify PM, document thoroughly, reprioritize remaining time',
                        outcome: 'Perfect! Quick response and clear communication.',
                        experience: 25,
                        tool: 'Issue Management'
                    },
                    {
                        text: 'Continue with original plan',
                        outcome: 'Major issues need immediate attention.',
                        experience: -15
                    },
                    {
                        text: 'Rush through remaining tests',
                        outcome: 'Maintain quality while reprioritizing.',
                        experience: -10
                    },
                    {
                        text: 'Skip documentation for speed',
                        outcome: 'Proper documentation remains important.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Resource Changes',
                description: 'How do you handle unexpected resource sheet changes?',
                options: [
                    {
                        text: 'Review changes immediately, adjust plans, ensure smooth transitions',
                        outcome: 'Excellent! Adaptable planning maintains efficiency.',
                        experience: 25,
                        tool: 'Change Management'
                    },
                    {
                        text: 'Continue current task',
                        outcome: 'Quick adaptation to changes needed.',
                        experience: -15
                    },
                    {
                        text: 'Wait for instructions',
                        outcome: 'Proactive response to changes required.',
                        experience: -10
                    },
                    {
                        text: 'Ignore minor changes',
                        outcome: 'All resource changes need attention.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Long-Term Planning',
                description: 'How do you maintain effective time management on long-term projects?',
                options: [
                    {
                        text: 'Establish sustainable routines, regularly review efficiency, adapt processes as needed',
                        outcome: 'Perfect! Sustainable approach to long-term projects.',
                        experience: 25,
                        tool: 'Long-term Planning'
                    },
                    {
                        text: 'Keep same routine without review',
                        outcome: 'Regular process review improves efficiency.',
                        experience: -15
                    },
                    {
                        text: 'Focus only on daily tasks',
                        outcome: 'Long-term view needed for sustainability.',
                        experience: -10
                    },
                    {
                        text: 'Change processes frequently',
                        outcome: 'Balanced adaptation better than frequent changes.',
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of time management. You clearly understand the nuances of time management and are well-equipped to handle any time management challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your time management skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('planning') || description.includes('planning')) {
            return 'Planning and Organization';
        } else if (title.includes('project') || description.includes('project')) {
            return 'Project Management';
        } else if (title.includes('meeting') || description.includes('meeting')) {
            return 'Meeting Management';
        } else if (title.includes('workload') || description.includes('workload')) {
            return 'Workload Distribution';
        } else if (title.includes('progress') || description.includes('progress')) {
            return 'Progress Monitoring';
        } else if (title.includes('risk') || description.includes('risk')) {
            return 'Risk Management';
        } else if (title.includes('resource') || description.includes('resource')) {
            return 'Resource Management';
        } else {
            return 'General Time Management';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Planning and Organization': 'Focus on developing structured weekly and daily planning routines to better anticipate and manage your time.',
            'Project Management': 'Practice estimating project timelines more accurately and breaking down large tasks into manageable chunks.',
            'Meeting Management': 'Work on scheduling meetings more efficiently with proper preparation and follow-up time allocation.',
            'Workload Distribution': 'Improve prioritization skills and learn to better balance multiple tasks and deadlines.',
            'Progress Monitoring': 'Enhance your tracking methods to better monitor progress and adjust timelines when needed.',
            'Risk Management': 'Develop strategies for identifying potential time constraints and creating contingency plans.',
            'Resource Management': 'Focus on optimizing resource allocation and maintaining efficient workspace organization.',
            'General Time Management': 'Continue developing fundamental time management skills and productivity techniques.'
        };

        return recommendations[area] || 'Continue practicing core time management principles.';
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
                user.updateQuizScore(this.quizName, result);
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

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new TimeManagementQuiz();
    quiz.startGame();
}); 