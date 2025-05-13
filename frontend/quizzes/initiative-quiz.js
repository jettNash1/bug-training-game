import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class InitiativeQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re an initiative expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong initiative skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
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

        // Basic Scenarios (IDs 1-5)
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
                        text: 'Wait for the team member to ask for help as this encourages them to integrate into the team quicker',
                        outcome: 'Initiative means offering support before being asked.',
                        experience: -5
                    },
                    {
                        text: 'Tell their manager they seem to be struggling with their tasks',
                        outcome: 'Direct support is better than escalating immediately.',
                        experience: -10
                    },
                    {
                        text: 'Send them documentation links without context so they can explore solutions for themselves',
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
                        text: 'Start cleaning up and organising without being asked',
                        outcome: 'Excellent! Taking responsibility for shared spaces shows great initiative.',
                        experience: 15,
                        tool: 'Workplace Responsibility'
                    },
                    {
                        text: 'Leave it for the cleaning staff to fully perform a deep clean',
                        outcome: 'This misses an opportunity to show initiative and responsibility.',
                        experience: -10
                    },
                    {
                        text: 'Ask who is responsible for cleanup, suggesting instruction should be carried out',
                        outcome: 'Initiative means taking action without seeking assignment.',
                        experience: -5
                    },
                    {
                        text: 'Clean up only your own workstation and surrounding area',
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
                        text: 'Answer questions as they are queried to promote team interaction',
                        outcome: 'This misses an opportunity to create a lasting solution.',
                        experience: -5
                    },
                    {
                        text: 'Suggest others should create documentation covering the areas of concern',
                        outcome: 'Taking initiative means acting on opportunities yourself.',
                        experience: -10
                    },
                    {
                        text: 'Document solutions to your own frequently asked questions and share these with the team',
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
                        text: 'Wait for someone else to update it who has been on the project previously',
                        outcome: 'Initiative means addressing issues when you spot them.',
                        experience: -10
                    },
                    {
                        text: 'Report the outdated documentation to management so they can designate the work required on it',
                        outcome: 'Taking action directly is better than just reporting.',
                        experience: -5
                    },
                    {
                        text: 'Work around the outdated information and continue other testing activities to meet project time lines',
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
                        text: 'Wait for new tasks to be assigned by the project manager',
                        outcome: 'Initiative means finding valuable work without being prompted.',
                        experience: -10
                    },
                    {
                        text: 'Ask colleagues if they need help with any outstanding tasks they might have',
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

        // Intermediate Scenarios (IDs 6-10)
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
                        text: 'Answer any questions the testers might have on processes or outstanding tasks',
                        outcome: 'Initiative means preparing resources before they\'re needed.',
                        experience: -15
                    },
                    {
                        text: 'Leave basic notes about current and outstanding tasks for the project',
                        outcome: 'While helpful, this doesn\'t provide full context needed for a handover.',
                        experience: 5
                    },
                    {
                        text: 'Tell them to check existing documentation to familiarise themselves with the project',
                        outcome: 'This doesn\'t help bridge potential knowledge gaps effectively.',
                        experience: -10
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Test Environment Access',
                description: 'You realise you don\'t have access to a required device for testing. What shows the best initiative?',
                options: [
                    {
                        text: 'Proactively identify who has access and arrange coverage early',
                        outcome: 'Excellent! Taking early action to solve access issues shows great initiative.',
                        experience: 20,
                        tool: 'Resource Management'
                    },
                    {
                        text: 'Wait for the project manager to organise project team access',
                        outcome: 'Initiative means addressing potential blockers early.',
                        experience: -15
                    },
                    {
                        text: 'Skip testing on that device and use a device closest to the required device that you have access to',
                        outcome: 'This avoids rather than solves the problem.',
                        experience: -10
                    },
                    {
                        text: 'Report the access issue and continue with other testing activities',
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
                        text: 'Ask the project manager to contact the client with the requested questions',
                        outcome: 'This creates unnecessary delays when you have direct access.',
                        experience: -15
                    },
                    {
                        text: 'Work around the missing information to keep within project time line deliverables',
                        outcome: 'This could lead to incorrect assumptions and issues.',
                        experience: -10
                    },
                    {
                        text: 'Wait for the next scheduled client meeting to raise any questions regarding the project',
                        outcome: 'Proactive communication is more preferable than waiting as this could cause project bottle necks.',
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
                        text: 'Report that you\'ve completed the main coverage of the project and wait for instruction',
                        outcome: 'This could miss opportunities to add value to the project and enhance client relations.',
                        experience: -15
                    },
                    {
                        text: 'Start on any outstanding personal tasks or training courses',
                        outcome: 'Project time should be used for project improvement.',
                        experience: -10
                    },
                    {
                        text: 'Help on other areas of the project when someone asks for your time',
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
                        text: 'Leave preparation of the upcoming project until the start date as operational details may change',
                        outcome: 'Using available time to prepare shows better initiative regardless of any unknowns in a particular project.',
                        experience: -15
                    },
                    {
                        text: 'Check to see if you have access to the operational project details',
                        outcome: 'While helpful, this misses opportunities for fuller preparation.',
                        experience: 5
                    },
                    {
                        text: 'Ask colleagues for details on the project and what is needed for test execution',
                        outcome: 'Direct research shows more initiative than just asking others.',
                        experience: -5
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15)
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
                        text: 'Investigate the immediate issue and report findings to the project manager',
                        outcome: 'Initiative includes preventing future problems and prevention measures should also be explored.',
                        experience: -15
                    },
                    {
                        text: 'Wait for instruction from the team lead or project manager on what course of action to take',
                        outcome: 'Advanced initiative means taking leadership in problem-solving.',
                        experience: -10
                    },
                    {
                        text: 'Document the issues raised and communicate these for others to investigate',
                        outcome: 'While documentation is important, taking action on the actual issues as well is better.',
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
                        text: 'Raise the issues in the next team meeting for full team feedback',
                        outcome: 'Advanced initiative requires more than just highlighting problems.',
                        experience: -10
                    },
                    {
                        text: 'Work around the inefficiencies as project work can still be completed rather than blocked',
                        outcome: 'This doesn\'t address the underlying issues.',
                        experience: -15
                    },
                    {
                        text: 'Raise the issues with colleagues to see if they have noticed the issues too',
                        outcome: 'While gathering input is good and important, taking action is preferable.',
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
                        text: 'Report the issue through communication channels to each team separately',
                        outcome: 'This misses an opportunity for coordinated resolution.',
                        experience: -10
                    },
                    {
                        text: 'Focus your team\'s involvement relating to the issue that has been raised',
                        outcome: 'Advanced initiative means addressing the broader impact and involving all affected parties.',
                        experience: -15
                    },
                    {
                        text: 'Wait for the project manager or test lead to coordinate communication of the issue',
                        outcome: 'This could lead to time delays in the project. Showing initiative would be to address the issue with the project manager and suggest coordinating information with all affected parties.',
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
                        text: 'Create comprehensive guides and organise training sessions',
                        outcome: 'Perfect! Proactively sharing knowledge shows advanced initiative.',
                        experience: 25,
                        tool: 'Knowledge Management'
                    },
                    {
                        text: 'Share the testing methods and processes when requested to do so',
                        outcome: 'Advanced initiative requires proactively sharing expertise.',
                        experience: -15
                    },
                    {
                        text: 'Keep the methods and processes for personal usage on future projects',
                        outcome: 'Knowledge hoarding doesn\'t help team growth.',
                        experience: -10
                    },
                    {
                        text: 'Mention them in team meetings and stand ups with project needs',
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
                        text: 'Wait until the challenges become actual problems and then raise these with the project manager',
                        outcome: 'Advanced initiative requires addressing issues before they occur.',
                        experience: -15
                    },
                    {
                        text: 'Mention the concerns in team meetings without having researched solutions',
                        outcome: 'Initiative includes proposing solutions, not just identifying problems.',
                        experience: -10
                    },
                    {
                        text: 'Add all the concerns to the risk register for thorough risk management',
                        outcome: 'While documentation is good, taking action is also required.',
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
        // End game when all questions are answered
        return totalQuestionsAnswered >= this.totalQuestions;
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
            
            // Clear any conflicting randomized scenarios
            const username = localStorage.getItem('username');
            if (username) {
                // Clear any leftover randomized scenarios from other quizzes
                // to prevent cross-contamination
                const quizzes = ['script-metrics-troubleshooting', 'standard-script-testing'];
                quizzes.forEach(quizName => {
                    if (quizName !== this.quizName) {
                        const key = `quiz_progress_${username}_${quizName}`;
                        const data = localStorage.getItem(key);
                        if (data) {
                            try {
                                console.log(`[Quiz] Clearing potential conflicting scenarios from ${quizName}`);
                                const parsed = JSON.parse(data);
                                if (parsed && parsed.data && parsed.data.randomizedScenarios) {
                                    delete parsed.data.randomizedScenarios;
                                    localStorage.setItem(key, JSON.stringify(parsed));
                                }
                            } catch (e) {
                                console.error(`[Quiz] Error clearing scenarios from ${quizName}:`, e);
                            }
                        }
                    }
                });
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
                
                // Clear any existing randomized scenarios
                this.randomizedScenarios = {};
            }
            
            // Clear any existing transition messages
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = '';
                transitionContainer.classList.remove('active');
            }

            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
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
        // Check if we've answered all questions
        if (this.player.questionHistory.length >= this.totalQuestions) {
            console.log('All questions answered, ending game');
            this.endGame(false);
            return;
        }
        
        // Get the randomized scenarios for the current level
        const currentScenarios = this.getCurrentScenarios();
        
        // Get the next scenario based on current progress within level
        let scenario;
        const questionCount = this.player.questionHistory.length;
        
        // Determine which level we're in and set the correct index
        let currentLevelIndex;
        if (questionCount < 5) {
            // Basic questions (0-4)
            currentLevelIndex = questionCount;
        } else if (questionCount < 10) {
            // Intermediate questions (5-9)
            currentLevelIndex = questionCount - 5;
        } else {
            // Advanced questions (10-14)
            currentLevelIndex = questionCount - 10;
        }
        
        // Get the scenario from the current randomized scenarios
        scenario = currentScenarios[currentLevelIndex];
        
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
            (questionCount < 5 ? 'Basic' : 
             questionCount < 10 ? 'Intermediate' : 'Advanced') : null;
            
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
            questionProgress.textContent = `Question: ${this.currentQuestionNumber}/${this.totalQuestions}`;
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

        // Initialize timer for the new question
        this.initializeTimer();
    }

    async handleAnswer() {
        if (this.isLoading) return;
        
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
        }

        // Clear any existing timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }
        
        try {
            this.isLoading = true;
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) return;

            const currentScenarios = this.getCurrentScenarios();
            
            // Determine which level we're in and set the correct index
            const questionCount = this.player.questionHistory.length;
            let currentLevelIndex;
            
            if (questionCount < 5) {
                // Basic questions (0-4)
                currentLevelIndex = questionCount;
            } else if (questionCount < 10) {
                // Intermediate questions (5-9)
                currentLevelIndex = questionCount - 5;
            } else {
                // Advanced questions (10-14)
                currentLevelIndex = questionCount - 10;
            }
            
            const scenario = currentScenarios[currentLevelIndex];
            const originalIndex = parseInt(selectedOption.value);
            
            const selectedAnswer = scenario.options[originalIndex];

            // Find the correct answer (option with highest experience)
            const correctAnswer = scenario.options.reduce((prev, current) => 
                (prev.experience > current.experience) ? prev : current
            );

            // Mark selected answer as correct or incorrect
            selectedAnswer.isCorrect = selectedAnswer === correctAnswer;

            // Update player experience with bounds
            this.player.experience = Math.max(0, Math.min(this.maxXP, this.player.experience + selectedAnswer.experience));
            
            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: selectedAnswer.isCorrect,
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience)),
                timeSpent: timeSpent,
                timedOut: false
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();

            // Calculate the score percentage
            const scorePercentage = this.calculateScorePercentage();
            
            const score = {
                quizName: this.quizName,
                score: scorePercentage,
                experience: this.player.experience,
                questionHistory: this.player.questionHistory,
                questionsAnswered: this.player.questionHistory.length,
                lastUpdated: new Date().toISOString()
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
            
            // Set content directly in the outcome screen
            const outcomeContent = this.outcomeScreen.querySelector('.outcome-content');
            if (outcomeContent) {
                outcomeContent.innerHTML = `
                    <h3>${selectedAnswer.isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                    <p>${selectedAnswer.outcome || ''}</p>
                    <p class="result">${selectedAnswer.isCorrect ? 'Correct answer!' : 'Try again next time.'}</p>
                    <button id="continue-btn" class="submit-button">Continue</button>
                `;
                
                // Add event listener to the continue button
                const continueBtn = outcomeContent.querySelector('#continue-btn');
                if (continueBtn) {
                    continueBtn.addEventListener('click', () => this.nextScenario());
                }
            }

            this.updateProgress();

            // Check if all questions have been answered
            if (this.shouldEndGame(this.player.questionHistory.length, this.player.experience)) {
                await this.endGame(false);
            }
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
        // Get current level and question count
        const currentLevel = this.getCurrentLevel();
        const totalAnswered = this.player.questionHistory.length;
        const questionNumber = totalAnswered + 1;
        
        // Update the existing progress card elements
        const levelInfoElement = document.querySelector('.level-info');
        const questionInfoElement = document.querySelector('.question-info');
        
        if (levelInfoElement) {
            levelInfoElement.textContent = `Level: ${currentLevel}`;
        }
        
        if (questionInfoElement) {
            questionInfoElement.textContent = `Question: ${questionNumber}/${this.totalQuestions}`;
        }
        
        // Ensure the card is visible
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'block';
        }
        
        // Update legacy progress elements if they exist
        const levelIndicator = document.getElementById('level-indicator');
        const questionProgress = document.getElementById('question-progress');
        const progressFill = document.getElementById('progress-fill');
        
        if (levelIndicator) {
            levelIndicator.textContent = `Level: ${currentLevel}`;
        }
        
        if (questionProgress) {
            questionProgress.textContent = `Question: ${questionNumber}/${this.totalQuestions}`;
        }
        
        if (progressFill) {
            const progressPercentage = (totalAnswered / this.totalQuestions) * 100;
            progressFill.style.width = `${progressPercentage}%`;
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
        let level;
        let scenarios;
        
        if (totalAnswered >= 10) {
            level = 'advanced';
            scenarios = this.advancedScenarios;
        } else if (totalAnswered >= 5) {
            level = 'intermediate';
            scenarios = this.intermediateScenarios;
        } else {
            level = 'basic';
            scenarios = this.basicScenarios;
        }
        
        // Use the getRandomizedScenarios method to get or create random scenarios
        return this.getRandomizedScenarios(level, scenarios);
    }

    getCurrentLevel() {
        const totalAnswered = this.player.questionHistory.length;
        
        // Progress through levels based only on question count
        if (totalAnswered >= 10) {
            return 'Advanced';
        } else if (totalAnswered >= 5) {
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

    async endGame(failed = false) {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        // Hide the progress card on the end screen
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'none';
        }

        // Calculate final score percentage based on correct answers
        const scorePercentage = this.calculateScorePercentage();
        const hasPassed = !failed && scorePercentage >= this.passPercentage;
        
        // Save the final quiz result with pass/fail status
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                const status = hasPassed ? 'passed' : 'failed';
                console.log('Setting final quiz status:', { status, score: scorePercentage });
                
                const result = {
                    score: scorePercentage,
                    status: status,
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory,
                    questionsAnswered: this.player.questionHistory.length,
                    lastUpdated: new Date().toISOString(),
                    scorePercentage: scorePercentage
                };

                // Save to QuizUser
                await user.updateQuizScore(
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
                
                // Clear any local storage for this quiz
                this.clearQuizLocalStorage(username, this.quizName);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${scorePercentage}%`;
        
        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = hasPassed ? 'Quiz Complete!' : 'Quiz Failed!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (!hasPassed) {
            performanceSummary.textContent = 'Quiz failed. You did not earn enough points to pass. You can retry this quiz later.';
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
            // Find the appropriate performance message
            const threshold = this.config.performanceThresholds.find(t => scorePercentage >= t.threshold);
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
                
                const isCorrect = record.selectedAnswer && (record.selectedAnswer.isCorrect || 
                    record.selectedAnswer.experience === Math.max(...record.scenario.options.map(o => o.experience || 0)));
                reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
                
                reviewItem.innerHTML = `
                    <h4>Question ${index + 1}</h4>
                    <p class="scenario">${record.scenario.description}</p>
                    <p class="answer"><strong>Your Answer:</strong> ${record.selectedAnswer.text}</p>
                    <p class="outcome"><strong>Outcome:</strong> ${record.selectedAnswer.outcome}</p>
                    <p class="result"><strong>Result:</strong> ${isCorrect ? 'Correct' : 'Incorrect'}</p>
                `;
                
                reviewList.appendChild(reviewItem);
            });
        }

        this.generateRecommendations();
    }

    // Helper method to calculate the score percentage based on correct answers
    calculateScorePercentage() {
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && (q.selectedAnswer.isCorrect || 
            q.selectedAnswer.experience === Math.max(...q.scenario.options.map(o => o.experience || 0)))
        ).length;
        
        // Calculate percentage based on completed questions (cap at max questions)
        const totalAnswered = Math.min(this.player.questionHistory.length, this.totalQuestions);
        return totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
    }

    clearQuizLocalStorage(username, quizName) {
        // Use the API service's implementation instead of a custom one
        try {
            console.log(`[InitiativeQuiz] Clearing localStorage for quiz: ${quizName}`);
            if (this.apiService && typeof this.apiService.clearQuizLocalStorage === 'function') {
                // Call API service method which has more complete implementation
                this.apiService.clearQuizLocalStorage(username, quizName);
            } else {
                console.warn('[InitiativeQuiz] API service not available, using fallback clear method');
                
                // Fallback implementation
                const variations = [
                    quizName,                                              // original
                    quizName.toLowerCase(),                               // lowercase
                    quizName.toUpperCase(),                               // uppercase
                    quizName.replace(/-/g, ''),                           // no hyphens
                    quizName.replace(/([A-Z])/g, '-$1').toLowerCase(),    // kebab-case
                    quizName.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), // camelCase
                    quizName.replace(/-/g, '_'),                          // snake_case
                    'initiative',
                    'Initiative',
                    'initiative-quiz',
                    'initiativeQuiz',
                    'InitiativeQuiz',
                    'initiative_quiz'
                ];

                variations.forEach(variant => {
                    localStorage.removeItem(`quiz_progress_${username}_${variant}`);
                    localStorage.removeItem(`quizResults_${username}_${variant}`);
                });
            }
        } catch (error) {
            console.error('[InitiativeQuiz] Error clearing localStorage:', error);
        }
    }

    // Add debugging method to diagnose quiz progress issues
    async debugQuizProgress() {
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No username found, cannot debug quiz progress');
                return;
            }

            console.group('Initiative Quiz Progress Debugging');
            console.log('Quiz name:', this.quizName);
            
            // Check localStorage directly
            console.group('LocalStorage entries:');
            const possibleKeys = [
                `quiz_progress_${username}_initiative`,
                `quiz_progress_${username}_Initiative`,
                `quiz_progress_${username}_initiative-quiz`,
                `quiz_progress_${username}_initiativeQuiz`
            ];
            
            for (const key of possibleKeys) {
                const value = localStorage.getItem(key);
                console.log(`${key}: ${value ? 'EXISTS' : 'not found'}`);
                if (value) {
                    try {
                        const parsed = JSON.parse(value);
                        console.log('Value:', parsed);
                    } catch (e) {
                        console.log('Error parsing value:', e);
                    }
                }
            }
            console.groupEnd();
            
            // Check API data
            console.group('API quiz progress:');
            try {
                const apiProgress = await this.apiService.getQuizProgress(this.quizName);
                console.log('API Response:', apiProgress);
            } catch (e) {
                console.log('Error getting API progress:', e);
            }
            console.groupEnd();
            
            // Check normalizedQuizName
            console.group('Quiz name normalization:');
            console.log('Original quiz name:', this.quizName);
            const normalizedName = this.apiService.normalizeQuizName(this.quizName);
            console.log('Normalized quiz name:', normalizedName);
            const variations = this.apiService.getQuizNameVariations(normalizedName);
            console.log('Variations:', variations);
            console.groupEnd();
            
            console.groupEnd();
        } catch (e) {
            console.error('Error in debugQuizProgress:', e);
        }
    }

    // Replace the loadProgress method with a more robust implementation
    async loadProgress() {
        try {
            // Normalize quiz name
            let quizName = this.quizName;
            quizName = this.normalizeQuizName(quizName);
            
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('[InitiativeQuiz] No user found, cannot load progress');
                return false;
            }
            
            const storageKey = `quiz_progress_${username}_${quizName}`;
            const savedProgress = await this.apiService.getQuizProgress(quizName);
            console.log('[InitiativeQuiz] Loading from key:', storageKey, 'API Response:', savedProgress);
            
            if (savedProgress && savedProgress.data) {
                const progress = {
                    experience: savedProgress.data.experience || 0,
                    tools: savedProgress.data.tools || [],
                    questionHistory: savedProgress.data.questionHistory || [],
                    currentScenario: savedProgress.data.currentScenario || 0,
                    status: savedProgress.data.status || 'in-progress',
                    randomizedScenarios: savedProgress.data.randomizedScenarios || {}
                };
                
                // Make sure question history is valid
                if (!Array.isArray(progress.questionHistory)) {
                    progress.questionHistory = [];
                }
                
                // Critical fix: If we have question history but currentScenario is wrong, fix it
                if (progress.questionHistory.length > 0) {
                    // If currentScenario is less than question history length, sync them
                    if (progress.currentScenario < progress.questionHistory.length) {
                        console.log(`[InitiativeQuiz] Fixing inconsistent scenario count - ` +
                            `currentScenario (${progress.currentScenario}) < questionHistory.length (${progress.questionHistory.length})`);
                        progress.currentScenario = progress.questionHistory.length;
                    }
                    
                    // If zero, set to question history length
                    if (progress.currentScenario === 0) {
                        console.log(`[InitiativeQuiz] currentScenario is 0 but has question history - fixing`);
                        progress.currentScenario = progress.questionHistory.length;
                    }
                } else if (progress.currentScenario > 0) {
                    // If we somehow have currentScenario but no question history, reset it
                    console.log(`[InitiativeQuiz] Warning: currentScenario (${progress.currentScenario}) > 0 but no question history`);
                    
                    if (progress.status === 'in-progress') {
                        // Only reset if status is in-progress
                        console.log('[InitiativeQuiz] Resetting currentScenario to 0 to match empty question history');
                        progress.currentScenario = 0;
                    }
                }
                
                // Log what we're loading
                console.log(`[InitiativeQuiz] Loaded progress: ${progress.questionHistory.length} questions answered, ` + 
                           `currentScenario: ${progress.currentScenario}, status: ${progress.status}`);
                
                // Update the player state with the loaded data
                this.player.experience = progress.experience;
                this.player.tools = progress.tools;
                this.player.questionHistory = progress.questionHistory;
                this.player.currentScenario = progress.currentScenario;
                
                // Load randomized scenarios if available
                if (progress.randomizedScenarios && Object.keys(progress.randomizedScenarios).length > 0) {
                    console.log('[InitiativeQuiz] Loading randomized scenarios from progress');
                    this.randomizedScenarios = progress.randomizedScenarios;
                }

                // Check if quiz is already completed
                if (['completed', 'passed', 'failed'].includes(progress.status)) {
                    console.log(`[InitiativeQuiz] Quiz already ${progress.status}, going to end screen`);
                    this.endGame(progress.status === 'failed');
                    return true;
                }

                return true;
            }
            
            return false;
        } catch (error) {
            console.error('[InitiativeQuiz] Error loading progress:', error);
            return false;
        }
    }

    // Normalize quiz name for consistent storage and retrieval
    normalizeQuizName(quizName) {
        // Use API service if available
        if (this.apiService && typeof this.apiService.normalizeQuizName === 'function') {
            return this.apiService.normalizeQuizName(quizName);
        }
        
        // Fallback implementation
        if (!quizName) return '';
        
        // First standardize to lowercase
        const lowerName = quizName.toLowerCase();
        
        // Handle initiative quiz variants
        if (lowerName === 'initiative' || lowerName.includes('initiative-quiz')) {
            return 'initiative';
        }
        
        // Standard normalized format (kebab-case)
        const normalized = lowerName
            .replace(/([A-Z])/g, '-$1')  // Convert camelCase to kebab-case
            .replace(/_/g, '-')          // Convert snake_case to kebab-case
            .replace(/\s+/g, '-')        // Convert spaces to hyphens
            .replace(/-+/g, '-')         // Remove duplicate hyphens
            .replace(/^-|-$/g, '')       // Remove leading/trailing hyphens
            .toLowerCase();              // Ensure lowercase
            
        return normalized;
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('[InitiativeQuiz] Initializing quiz');
    
    // Force clean any existing quiz references that might be in memory
    if (window.currentQuiz) {
        console.log('[InitiativeQuiz] Cleaning up existing quiz instance:', window.currentQuiz.quizName);
        // Clear any timers or other resources
        if (window.currentQuiz.questionTimer) {
            clearInterval(window.currentQuiz.questionTimer);
        }
    }
    
    // Clear any conflicting localStorage entries
    const username = localStorage.getItem('username');
    if (username) {
        // List all quiz names that might conflict
        const potentialConflicts = [
            'script-metrics-troubleshooting',
            'standard-script-testing',
            'fully-scripted',
            'exploratory'
        ];
        
        // Clean localStorage to prevent cross-contamination
        potentialConflicts.forEach(quizName => {
            const key = `quiz_progress_${username}_${quizName}`;
            const data = localStorage.getItem(key);
            if (data) {
                console.log(`[InitiativeQuiz] Found potential conflicting quiz data: ${quizName}`);
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.data && parsed.data.randomizedScenarios) {
                        console.log(`[InitiativeQuiz] Cleaning randomized scenarios from ${quizName}`);
                        delete parsed.data.randomizedScenarios;
                        localStorage.setItem(key, JSON.stringify(parsed));
                    }
                } catch (e) {
                    console.error(`[InitiativeQuiz] Error cleaning scenarios:`, e);
                }
            }
        });
    }
    
    // Create a new instance and keep a global reference
    const quiz = new InitiativeQuiz();
    window.currentQuiz = quiz;
    
    // Add a specific property to identify this quiz
    Object.defineProperty(window, 'ACTIVE_QUIZ_NAME', {
        value: 'initiative',
        writable: true,
        configurable: true
    });
    
    // Force clear any unrelated randomized scenarios
    if (quiz.randomizedScenarios) {
        // Keep only keys specific to this quiz
        Object.keys(quiz.randomizedScenarios).forEach(key => {
            if (!key.startsWith('initiative_')) {
                console.log(`[InitiativeQuiz] Removing unrelated randomized scenario: ${key}`);
                delete quiz.randomizedScenarios[key];
            }
        });
    }
    
    // Start the quiz
    console.log('[InitiativeQuiz] Starting quiz');
    quiz.startGame();
}); 