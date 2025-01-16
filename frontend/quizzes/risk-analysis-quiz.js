import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';

class RiskAnalysisQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a risk analysis expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong analytical skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing risk analysis best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'risk-analysis',
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
                title: 'Risk Severity Assessment',
                description: 'How do you determine the severity of a risk?',
                options: [
                    {
                        text: 'Consider number of affected parties, duration of effect, likelihood, and impact',
                        outcome: 'Perfect! Comprehensive risk severity assessment considers multiple factors.',
                        experience: 15,
                        tool: 'Severity Assessment Framework'
                    },
                    {
                        text: 'Only consider immediate impact',
                        outcome: 'Risk severity needs broader consideration.',
                        experience: -5
                    },
                    {
                        text: 'Wait for issues to occur',
                        outcome: 'Proactive assessment prevents issues.',
                        experience: -10
                    },
                    {
                        text: 'Base it on gut feeling',
                        outcome: 'Structured assessment is more reliable.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Risk Likelihood Evaluation',
                description: 'What factors should you consider when evaluating the likelihood of a risk?',
                options: [
                    {
                        text: 'Historical occurrence, interaction frequency, known triggers, and prior experience',
                        outcome: 'Excellent! Multiple factors help determine likelihood accurately.',
                        experience: 15,
                        tool: 'Likelihood Assessment Tool'
                    },
                    {
                        text: 'Only check if it happened before',
                        outcome: 'Consider all factors that affect likelihood.',
                        experience: -5
                    },
                    {
                        text: 'Assume all risks are equally likely',
                        outcome: 'Different risks have different likelihoods.',
                        experience: -10
                    },
                    {
                        text: 'Only consider current conditions',
                        outcome: 'Historical data helps predict likelihood.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Morning Risk Assessment',
                description: 'What\'s the first step in your morning risk routine?',
                options: [
                    {
                        text: 'Review time availability, device readiness, and project understanding',
                        outcome: 'Perfect! Morning assessment prevents day-long issues.',
                        experience: 15,
                        tool: 'Daily Risk Checklist'
                    },
                    {
                        text: 'Start working immediately',
                        outcome: 'Risk assessment should precede work.',
                        experience: -10
                    },
                    {
                        text: 'Wait for issues to arise',
                        outcome: 'Proactive morning checks prevent problems.',
                        experience: -5
                    },
                    {
                        text: 'Only check emails',
                        outcome: 'Comprehensive morning review needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Risk Calculation',
                description: 'How do you calculate the overall risk level?',
                options: [
                    {
                        text: 'Multiply severity by likelihood ratings',
                        outcome: 'Excellent! This calculation provides accurate risk levels.',
                        experience: 15,
                        tool: 'Risk Calculator'
                    },
                    {
                        text: 'Only consider severity',
                        outcome: 'Both severity and likelihood matter.',
                        experience: -10
                    },
                    {
                        text: 'Only consider likelihood',
                        outcome: 'Severity must be factored in.',
                        experience: -5
                    },
                    {
                        text: 'Add severity and likelihood',
                        outcome: 'Multiplication better reflects risk level.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Pre-Lunch Risk Check',
                description: 'What should you assess in your pre-lunch risk routine?',
                options: [
                    {
                        text: 'Progress rate, device status, new client information, and blocking issues',
                        outcome: 'Perfect! Mid-day check helps maintain progress.',
                        experience: 15,
                        tool: 'Progress Tracking'
                    },
                    {
                        text: 'Only check time remaining',
                        outcome: 'Multiple factors need checking.',
                        experience: -5
                    },
                    {
                        text: 'Skip mid-day check',
                        outcome: 'Regular checks maintain efficiency.',
                        experience: -10
                    },
                    {
                        text: 'Wait for end of day',
                        outcome: 'Mid-day assessment allows adjustments.',
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
                title: 'Project Timeline Risk',
                description: 'How do you assess timeline-related risks during project scoping?',
                options: [
                    {
                        text: 'Evaluate resource availability, information gathering time, fix windows, and timeline flexibility',
                        outcome: 'Excellent! Comprehensive timeline risk assessment.',
                        experience: 20,
                        tool: 'Timeline Risk Assessment'
                    },
                    {
                        text: 'Only check total duration',
                        outcome: 'Multiple timeline factors need consideration.',
                        experience: -15
                    },
                    {
                        text: 'Assume timelines are fixed',
                        outcome: 'Timeline flexibility needs assessment.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on testing time',
                        outcome: 'Consider all timeline components.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Documentation Risk',
                description: 'What documentation risks should be assessed before testing?',
                options: [
                    {
                        text: 'Check documentation availability, detail level, business rules, and acceptance criteria',
                        outcome: 'Perfect! Documentation completeness is crucial.',
                        experience: 20,
                        tool: 'Documentation Review'
                    },
                    {
                        text: 'Only check if docs exist',
                        outcome: 'Documentation quality needs review.',
                        experience: -15
                    },
                    {
                        text: 'Start without documentation',
                        outcome: 'Documentation review prevents issues.',
                        experience: -10
                    },
                    {
                        text: 'Assume docs are complete',
                        outcome: 'Documentation assessment needed.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Environment Access Risk',
                description: 'How do you assess risks related to test environment access?',
                options: [
                    {
                        text: 'Verify access methods, specific requirements, user permissions, and environment stability',
                        outcome: 'Excellent! Complete access risk assessment.',
                        experience: 20,
                        tool: 'Access Risk Checklist'
                    },
                    {
                        text: 'Only check login works',
                        outcome: 'Multiple access factors need checking.',
                        experience: -15
                    },
                    {
                        text: 'Wait for access issues',
                        outcome: 'Proactive access verification needed.',
                        experience: -10
                    },
                    {
                        text: 'Assume access is stable',
                        outcome: 'Access stability needs verification.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Multi-User Impact',
                description: 'How do you assess risks of multiple users testing simultaneously?',
                options: [
                    {
                        text: 'Evaluate platform performance impact, potential conflicts, and workflow interruptions',
                        outcome: 'Perfect! Multi-user impact needs thorough assessment.',
                        experience: 20,
                        tool: 'Concurrent Testing Assessment'
                    },
                    {
                        text: 'Only check if login works',
                        outcome: 'Consider all multi-user impacts.',
                        experience: -15
                    },
                    {
                        text: 'Ignore other users',
                        outcome: 'User interaction effects matter.',
                        experience: -10
                    },
                    {
                        text: 'Assume no impact',
                        outcome: 'Multi-user risks need evaluation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Client Communication Risk',
                description: 'How do you assess risks in client communication channels?',
                options: [
                    {
                        text: 'Establish urgent contact methods, verify response times, and ensure clear escalation paths',
                        outcome: 'Excellent! Communication channel assessment.',
                        experience: 20,
                        tool: 'Communication Risk Assessment'
                    },
                    {
                        text: 'Only use email',
                        outcome: 'Multiple communication channels needed.',
                        experience: -15
                    },
                    {
                        text: 'Wait for communication issues',
                        outcome: 'Proactive communication planning needed.',
                        experience: -10
                    },
                    {
                        text: 'Assume client is always available',
                        outcome: 'Communication availability needs verification.',
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
                title: 'High-Bug Environment',
                description: 'How do you assess risks when encountering a bug-heavy environment?',
                options: [
                    {
                        text: 'Evaluate impact on testing time, triage requirements, and need for additional verification',
                        outcome: 'Perfect! Comprehensive bug impact assessment.',
                        experience: 25,
                        tool: 'Bug Impact Analysis'
                    },
                    {
                        text: 'Continue testing as normal',
                        outcome: 'High bug count needs strategy adjustment.',
                        experience: -15
                    },
                    {
                        text: 'Skip affected areas',
                        outcome: 'All areas need appropriate coverage.',
                        experience: -10
                    },
                    {
                        text: 'Only report major bugs',
                        outcome: 'All issues need proper documentation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Resource Change Risk',
                description: 'How do you handle risks from unexpected resource changes?',
                options: [
                    {
                        text: 'Assess impact on timeline, coverage, and team capability, then adjust plans accordingly',
                        outcome: 'Excellent! Resource change impact analysis.',
                        experience: 25,
                        tool: 'Resource Risk Management'
                    },
                    {
                        text: 'Continue with original plan',
                        outcome: 'Resource changes need plan adjustment.',
                        experience: -15
                    },
                    {
                        text: 'Reduce test coverage',
                        outcome: 'Maintain coverage with adjusted approach.',
                        experience: -10
                    },
                    {
                        text: 'Ignore resource changes',
                        outcome: 'Resource changes need addressing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Late Stage Risks',
                description: 'How do you assess risks when major issues are found late in testing?',
                options: [
                    {
                        text: 'Evaluate fix timeline, regression impact, and remaining test time, then reprioritize',
                        outcome: 'Perfect! Late-stage issue impact assessment.',
                        experience: 25,
                        tool: 'Late-Stage Risk Analysis'
                    },
                    {
                        text: 'Rush remaining testing',
                        outcome: 'Maintain quality while reprioritizing.',
                        experience: -15
                    },
                    {
                        text: 'Skip regression testing',
                        outcome: 'Regression testing remains important.',
                        experience: -10
                    },
                    {
                        text: 'Ignore new issues',
                        outcome: 'Late issues need proper handling.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Client Requirement Changes',
                description: 'How do you assess risks when client requirements change during testing?',
                options: [
                    {
                        text: 'Analyze impact on timeline, coverage, and existing tests, then adjust strategy',
                        outcome: 'Excellent! Change impact analysis.',
                        experience: 25,
                        tool: 'Change Impact Assessment'
                    },
                    {
                        text: 'Continue with original plan',
                        outcome: 'Requirement changes need plan updates.',
                        experience: -15
                    },
                    {
                        text: 'Only test new requirements',
                        outcome: 'All requirements need coverage.',
                        experience: -10
                    },
                    {
                        text: 'Ignore requirement changes',
                        outcome: 'Changes need proper assessment.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'End of Project Risk Review',
                description: 'How do you assess risks at project completion?',
                options: [
                    {
                        text: 'Review project challenges, identify process improvements, and document lessons learned',
                        outcome: 'Perfect! Comprehensive project review.',
                        experience: 25,
                        tool: 'Project Review Framework'
                    },
                    {
                        text: 'Only note major issues',
                        outcome: 'All aspects need review for improvement.',
                        experience: -15
                    },
                    {
                        text: 'Skip final review',
                        outcome: 'Project review improves future work.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on successes',
                        outcome: 'Both successes and challenges need review.',
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of risk analysis. You clearly understand the nuances of risk analysis and are well-equipped to handle any risk analysis challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your risk analysis skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('severity') || description.includes('severity')) {
            return 'Risk Severity Analysis';
        } else if (title.includes('likelihood') || description.includes('likelihood')) {
            return 'Risk Likelihood Assessment';
        } else if (title.includes('calculation') || description.includes('calculate')) {
            return 'Risk Level Calculation';
        } else if (title.includes('requirement') || description.includes('requirement')) {
            return 'Change Impact Analysis';
        } else if (title.includes('review') || description.includes('review')) {
            return 'Risk Review Process';
        } else if (title.includes('morning') || description.includes('morning')) {
            return 'Daily Risk Assessment';
        } else if (title.includes('project') || description.includes('project')) {
            return 'Project Risk Analysis';
        } else {
            return 'General Risk Analysis';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Risk Severity Analysis': 'Focus on comprehensive assessment of risk impact considering affected parties, duration, and consequences.',
            'Risk Likelihood Assessment': 'Improve evaluation of risk probability by analyzing historical data, triggers, and frequency patterns.',
            'Risk Level Calculation': 'Practice calculating overall risk levels using proper multiplication of severity and likelihood factors.',
            'Change Impact Analysis': 'Enhance ability to assess how requirement changes affect project risks and testing coverage.',
            'Risk Review Process': 'Strengthen end-of-project risk reviews by documenting both challenges and successes.',
            'Daily Risk Assessment': 'Develop better morning risk assessment routines to prevent day-long issues.',
            'Project Risk Analysis': 'Work on comprehensive project-level risk analysis considering multiple factors.',
            'General Risk Analysis': 'Continue developing fundamental risk analysis principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core risk analysis principles.';
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
    const quiz = new RiskAnalysisQuiz();
    quiz.startGame();
});