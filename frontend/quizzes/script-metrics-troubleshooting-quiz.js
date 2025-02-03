import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class ScriptMetricsTroubleshootingQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a script metrics troubleshooting expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong script metrics troubleshooting skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing script metrics troubleshooting best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'script-metrics-troubleshooting',
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
                title: 'Primary objective',
                description: 'What is the primary purpose of script metrics?',
                options: [
                    {
                        text: 'To create visual presentations for clients only',
                        outcome: 'While metrics may be shared with clients, this is not their primary purpose',
                        experience: -5
                    },
                    {
                        text: 'To gauge project progress and inform report writing',
                        outcome: 'Correct - Metrics are used to track progress and help with daily reporting',
                        experience: 15
                    },
                    {
                        text: 'To track employee performance',
                        outcome: 'Metrics are about project progress, not individual performance',
                        experience: -10
                    },
                    {
                        text: 'To gauge project progress only',
                        outcome: 'This is true but incomplete as it misses the reporting aspect.',
                        experience: 5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Environment Tables',
                description: 'Where should you add new rows to environment tables?',
                options: [
                    {
                        text: 'At the very bottom of the table',
                        outcome: 'Adding rows at the bottom can break formulas.',
                        experience: -5
                    },
                    {
                        text: 'Within the existing table, above the final row',
                        outcome: 'Correct - This ensures formulas remain intact and metrics update properly.',
                        experience: 15
                    },
                    {
                        text: 'In a new separate table',
                        outcome: 'This would not maintain connection with existing metrics.',
                        experience: -10
                    },
                    {
                        text: 'Above the table header',
                        outcome: 'While this keeps data within the table, it\'s not the optimal location.',
                        experience: 5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Metrics Pie Chart Labels',
                description: 'What causes missing pie chart labels in the Metrics tab?',
                options: [
                    {
                        text: 'Software bugs only',
                        outcome: 'Missing labels are usually due to chart size or data arrangement',
                        experience: -10
                    },
                    {
                        text: 'Corrupted data',
                        outcome: 'This is not typically the cause of missing labels.',
                        experience: -5
                    },
                    {
                        text: 'Chart size and data arrangement',
                        outcome: 'Correct - Labels may be missing due to chart size or how data is arranged in the table.',
                        experience: 15
                    },
                    {
                        text: 'Chart size only',
                        outcome: 'While chart size is a factor, data arrangement also matters',
                        experience: 5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Environment Rows',
                description: 'How should you handle empty environment rows?',
                options: [
                    {
                        text: 'Delete them completely',
                        outcome: 'Deleting rows can break formulas.',
                        experience: -10
                    },
                    {
                        text: 'Copy formulas from existing rows and update environment details',
                        outcome: 'Correct - This maintains formula integrity while allowing new environment details.',
                        experience: 15
                    },
                    {
                        text: 'Hide them',
                        outcome: 'Hiding rows doesn\'t properly address the issue',
                        experience: -5
                    },
                    {
                        text: 'Keep original formulas but clear content',
                        outcome: 'While maintaining formulas is good, they need to be properly copied',
                        experience: 5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: '#REF! Errors',
                description: 'What causes #REF! errors in the Session Totals table?',
                options: [
                    {
                        text: 'Insufficient lines for all dates',
                        outcome: 'Correct - The error appears when there aren\'t enough lines for all testing date.',
                        experience: 15
                    },
                    {
                        text: 'Corrupt spreadsheet',
                        outcome: 'This is rarely the cause of #REF! errors in this context.',
                        experience: -5
                    },
                    {
                        text: 'Wrong date format',
                        outcome: 'Date formatting is not the cause of #REF! errors',
                        experience: -10
                    },
                    {
                        text: 'Too many dates entered',
                        outcome: 'While related to dates, it\'s specifically about line availability',
                        experience: 5
                    }
                ]
            }
        ];

         // Intermediate Scenarios (IDs 6-10, 125 XP total)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Environment Check Tabs',
                description: 'How should you handle multiple Environment Checks tabs?',
                options: [

                    {
                        text: 'Create new independent metrics',
                        outcome: 'This would not maintain proper tracking across tabs.',
                        experience: -5
                    },
                    {
                        text: 'Copy and update existing table with new tab references',
                        outcome: 'Correct - This maintains consistency while incorporating new data.',
                        experience: 15
                    },
                    {
                        text: 'Merge all data into one tab',
                        outcome: 'This would make tracking different sessions difficult',
                        experience: -10
                    },
                    {
                        text: 'Add new columns to existing table',
                        outcome: 'While this maintains data connection, it\'s not the optimal solution',
                        experience: 5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Compatibility Environments Completed',
                description: 'What affects the Compatibility Environments Complete figure?',
                options: [
                    {
                        text: 'Primary column and environment count',
                        outcome: 'While Primary is important, Checked is also needed.',
                        experience: 5
                    },
                    {
                        text: 'Only the Primary Column',
                        outcome: 'Multiple columns affect this figure.',
                        experience: -5
                    },
                    {
                        text: 'Only the Checked Column',
                        outcome: 'This alone doesn\'t determine compatibility status',
                        experience: -10
                    },
                    {
                        text: 'Both Primary and Checked Columns',
                        outcome: 'Correct - Both columns together determine the completion status',
                        experience: 15
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Environment Lists',
                description: 'How should you modify environment lists across multiple tickets?',
                options: [
                    {
                        text: 'Update each ticket individually',
                        outcome: 'This is inefficient and prone to inconsistency',
                        experience: -5
                    },
                    {
                        text: 'Update Environment List tab and remove excess rows',
                        outcome: 'Correct - This ensures consistent updates across all linked tickets.',
                        experience: 15
                    },
                    {
                        text: 'Create new environment lists',
                        outcome: 'This breaks the connection with existing metrics',
                        experience: -10
                    },
                    {
                        text: 'Update the main tab only',
                        outcome: 'While updating the main tab is important, excess rows still need handling.',
                        experience: 5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'New Row Formulas',
                description: 'What should you do when formulas don\'t encompass new rows?',
                options: [
                    {
                        text: 'Extend the formula manually',
                        outcome: 'While this works, double-clicking is more efficient.',
                        experience: 5
                    },
                    {
                        text: 'Copy from another sheet',
                        outcome: 'This might not match the specific needs of your sheet.',
                        experience: -5
                    },
                    {
                        text: 'Create new formulas',
                        outcome: 'Creating new formulas may lead to inconsistencies',
                        experience: -10
                    },
                    {
                        text: 'Double-click and update cell ranges',
                        outcome: 'Correct - This allows proper adjustment of formula ranges.',
                        experience: 15
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Environment Coverage',
                description: 'How should you handle environment-specific coverage?',
                options: [
                    {
                        text: 'Create separate sheets',
                        outcome: 'This creates unnecessary complexity.',
                        experience: -10
                    },
                    {
                        text: 'Combine global and specific environments as needed',
                        outcome: 'Correct - This allows flexibility while maintaining consistency.',
                        experience: 15
                    },
                    {
                        text: 'Use only global environments',
                        outcome: 'This doesn\'t account for ticket-specific needs',
                        experience: -5
                    },
                    {
                        text: 'Use specific environments only',
                        outcome: 'While this works for some cases, it\'s not flexible enough',
                        experience: 5
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15, 150 XP total)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Duplicated Environment Checks',
                description: 'When updating duplicated Environment Checks tabs, what\'s crucial?',
                options: [

                    {
                        text: 'Only update cell references',
                        outcome: 'Multiple aspects need attention',
                        experience: -5
                    },
                    {
                        text: 'Update all references and verify formula accuracy',
                        outcome: 'Correct - This ensures complete and accurate metric tracking',
                        experience: 15
                    },
                    {
                        text: 'Copy all formulas exactly',
                        outcome: 'Formulas need adjustment for the new context',
                        experience: -5
                    },
                    {
                        text: 'Update table structure only',
                        outcome: 'While structure matters, formula updates are also crucial',
                        experience: -10
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Environment Table Metrics',
                description: 'How should you handle complex environment table metrics?',
                options: [
                    {
                        text: 'Simplify the metrics',
                        outcome: 'This could lose important tracking details.',
                        experience: -10
                    },
                    {
                        text: 'Use basic counting only',
                        outcome: 'This wouldn\'t capture all necessary metrics.',
                        experience: -5
                    },
                    {
                        text: 'Verify all formula chains and dependencies',
                        outcome: 'Correct - This ensures accurate tracking across all dependencies',
                        experience: 15
                    },
                    {
                        text: 'Check individual formulas',
                        outcome: 'While important, it misses the broader dependencies',
                        experience: 5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Cross Tab Metrics',
                description: 'What\'s the correct approach for updating cross-tab metrics?',
                options: [
                    {
                        text: 'Maintain formula relationships while updating references',
                        outcome: 'Correct - This preserves metric integrity across tabs',
                        experience: 15
                    },
                    {
                        text: 'Update each tab independently',
                        outcome: 'This breaks cross-tab relationships.',
                        experience: -10
                    },
                    {
                        text: 'Update primary metrics only',
                        outcome: 'While important, secondary metrics also need attention',
                        experience: 5
                    },
                    {
                        text: 'Create new metrics',
                        outcome: 'This loses historical tracking',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Un-displayed Metrics',
                description: 'How should you handle metric discrepancies across multiple tabs?',
                options: [
                    {
                        text: 'Check individual tab metrics',
                        outcome: 'While important, cross-tab relationships also matter.',
                        experience: 5
                    },
                    {
                        text: 'Average the differences',
                        outcome: 'This doesn\'t address the root cause.',
                        experience: -5
                    },
                    {
                        text: 'Use the highest values',
                        outcome: 'This could hide actual issues',
                        experience: -10
                    },
                    {
                        text: 'Trace formula chains and verify all connections',
                        outcome: 'Correct - This identifies and resolves the source of discrepancies',
                        experience: 15
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Metrics Updates',
                description: 'What\'s the best approach for maintaining metric integrity during major updates?',
                options: [
                    {
                        text: 'Start with fresh metrics',
                        outcome: 'This loses valuable historical data.',
                        experience: -10
                    },
                    {
                        text: 'Copy existing metrics',
                        outcome: 'This could perpetuate existing issues.',
                        experience: -5
                    },
                    {
                        text: 'Verify all dependencies and update systematically',
                        outcome: 'Correct - This maintains accuracy while allowing updates',
                        experience: 15
                    },
                    {
                        text: 'Update primary metrics first',
                        outcome: 'While a good start, it needs more comprehensive attention',
                        experience: 5
                    }
                ]
            },
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of troubleshooting script metrics. You clearly understand the nuances of script metrics and are well-equipped to handle any script metrics challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your script metrics skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('formula') || description.includes('formula')) {
            return 'Formula Management';
        } else if (title.includes('environment') || description.includes('environment')) {
            return 'Environment Coverage';
        } else if (title.includes('table') || description.includes('table')) {
            return 'Table Structure';
        } else if (title.includes('metric') || description.includes('metric')) {
            return 'Metric Accuracy';
        } else if (title.includes('reference') || description.includes('reference')) {
            return 'Data References';
        } else if (title.includes('compatibility') || description.includes('compatibility')) {
            return 'Compatibility Tracking';
        } else if (title.includes('list') || description.includes('list')) {
            return 'List Management';
        } else if (title.includes('update') || description.includes('update')) {
            return 'Update Handling';
        } else {
            return 'General Script Metrics';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Formula Management': 'Focus on maintaining accurate formula chains and proper cell references.',
            'Environment Coverage': 'Strengthen tracking of environment-specific metrics and coverage data.',
            'Table Structure': 'Improve organization and maintenance of data table structures.',
            'Metric Accuracy': 'Enhance verification of metric calculations and dependencies.',
            'Data References': 'Develop better strategies for managing cross-sheet data references.',
            'Compatibility Tracking': 'Focus on accurate tracking of compatibility status across environments.',
            'List Management': 'Strengthen maintenance and updates of environment lists.',
            'Update Handling': 'Improve handling of metric updates while maintaining data integrity.',
            'General Script Metrics': 'Continue developing fundamental script metrics principles.'
        };

        return recommendations[area] || 'Continue practicing core script metrics principles.';
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
    const quiz = new ScriptMetricsTroubleshootingQuiz();
    quiz.startGame();
}); 