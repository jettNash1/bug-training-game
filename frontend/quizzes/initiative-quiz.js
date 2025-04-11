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

    shouldEndGame() {
        // Only end the game when all 15 questions are answered
        return (this.player?.questionHistory?.length || 0) >= 15;
    }

    async saveProgress() {
        // First determine the status based on completion criteria only
        let status = 'in-progress';
        
        // Check for completion (all 15 questions answered)
        if (this.player.questionHistory.length >= 15) {
            // Calculate pass/fail based on correct answers
            const correctAnswers = this.player.questionHistory.filter(q => 
                q.selectedAnswer && (q.selectedAnswer.isCorrect || q.selectedAnswer.experience > 0)
            ).length;
            const scorePercentage = Math.round((correctAnswers / 15) * 100);
            status = scorePercentage >= 70 ? 'passed' : 'failed';
        }

        const progress = {
            data: {
                experience: this.player.experience,
                tools: this.player.tools,
                currentScenario: this.player.currentScenario,
                questionHistory: this.player.questionHistory,
                lastUpdated: new Date().toISOString(),
                questionsAnswered: this.player.questionHistory.length,
                status: status,
                scorePercentage: Math.round((this.player.questionHistory.filter(q => 
                    q.selectedAnswer && (q.selectedAnswer.isCorrect || q.selectedAnswer.experience > 0)
                ).length / 15) * 100)
            }
        };

        console.log('Saving progress:', progress);

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
        try {
            // Check if player and currentScenario are properly initialized
            if (!this.player || typeof this.player.currentScenario !== 'number') {
                console.error('Player or currentScenario not properly initialized');
                return;
            }
            
            // Check if we've answered all 15 questions
            if (this.player.questionHistory.length >= 15) {
                console.log('All 15 questions answered, ending game');
                this.endGame(false);
                return;
            }
            
            const currentScenarios = this.getCurrentScenarios();
            if (!currentScenarios || !Array.isArray(currentScenarios)) {
                console.error('Could not get current scenarios', currentScenarios);
                return;
            }
            
            const scenario = currentScenarios[this.player.currentScenario];
            
            // Check if the current scenario exists
            if (!scenario) {
                console.log('No more scenarios in this level, transitioning to next level');
                
                // Reset currentScenario for the next level
                this.player.currentScenario = 0;
                
                // Get the next level scenarios
                const updatedScenarios = this.getCurrentScenarios();
                if (!updatedScenarios || !updatedScenarios[0]) {
                    console.error('Could not find scenarios for next level');
                    this.endGame(false);
                    return;
                }
                
                // Display the first scenario of the next level
                const nextScenario = updatedScenarios[0];
                this.displayScenarioContent(nextScenario);
                return;
            }
            
            // Display the current scenario
            this.displayScenarioContent(scenario);
        } catch (error) {
            console.error('Error displaying scenario:', error);
            this.showError('An error occurred displaying the scenario. Please try reloading the page.');
        }
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
            if (!selectedOption) {
                console.warn('No option selected');
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }

            const currentScenarios = this.getCurrentScenarios();
            if (!currentScenarios || !this.player || this.player.currentScenario === undefined) {
                console.error('Invalid scenario or player state');
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }
            
            const scenario = currentScenarios[this.player.currentScenario];
            if (!scenario || !scenario.options) {
                console.error('Invalid scenario structure:', scenario);
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }
            
            const originalIndex = parseInt(selectedOption.value);
            if (isNaN(originalIndex) || originalIndex < 0 || originalIndex >= scenario.options.length) {
                console.error('Invalid option index:', originalIndex);
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }
            
            const selectedAnswer = scenario.options[originalIndex];
            if (!selectedAnswer) {
                console.error('Selected answer not found');
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }

            // Find the correct answer (option with highest experience)
            const correctAnswer = scenario.options.reduce((prev, current) => 
                (prev.experience > current.experience) ? prev : current
            );

            // Mark selected answer as correct or incorrect
            selectedAnswer.isCorrect = selectedAnswer === correctAnswer;

            // Update player state
            if (typeof this.player.experience === 'number') {
                this.player.experience = Math.max(0, Math.min(this.maxXP || 300, this.player.experience + (selectedAnswer.experience || 0)));
            }
            
            // Add to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience || 0))
            });

            // Save progress 
            try {
                await this.saveProgress();
            } catch (error) {
                console.error('Failed to save progress:', error);
                this.showError('Warning: Progress may not have saved correctly');
            }

            // Save quiz result
            const username = localStorage.getItem('username');
            if (username) {
                try {
                    const quizUser = new QuizUser(username);
                    const score = {
                        score: Math.round((this.player.experience / (this.maxXP || 300)) * 100),
                        experience: this.player.experience || 0,
                        questionHistory: this.player.questionHistory || [],
                        questionsAnswered: this.player.questionHistory.length
                    };
                    
                    await quizUser.updateQuizScore(
                        this.quizName,
                        score.score,
                        score.experience,
                        this.player.tools || [],
                        score.questionHistory,
                        score.questionsAnswered
                    );
                } catch (error) {
                    console.error('Failed to save quiz result:', error);
                }
            }

            // Show outcome screen and update display with answer outcome
            this.displayOutcome(selectedAnswer);
            
            // Update progress display
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
        try {
            console.log('Moving to next scenario');
            
            // Increment current scenario if not done in handleAnswer
            if (this.player && typeof this.player.currentScenario === 'number') {
                this.player.currentScenario++;
                console.log('Incremented to scenario:', this.player.currentScenario);
            }
            
            // Hide outcome screen and show game screen - try both class and style approaches
            const outcomeScreen = document.getElementById('outcome-screen');
            const gameScreen = document.getElementById('game-screen');
            
            if (outcomeScreen) {
                // Try both methods
                outcomeScreen.classList.add('hidden');
                outcomeScreen.style.display = 'none';
                console.log('Hidden outcome screen');
            }
            
            if (gameScreen) {
                // Try both methods
                gameScreen.classList.remove('hidden');
                gameScreen.style.display = 'block';
                console.log('Shown game screen');
            }
            
            // Display next scenario
            this.displayScenario();
            
            // Reinitialize event listeners for the new question
            this.initializeEventListeners();
            
        } catch (error) {
            console.error('Error in nextScenario:', error);
            this.showError('An error occurred. Please try again.');
        }
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
            questionInfoElement.textContent = `Question: ${questionNumber}/15`;
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
            questionProgress.textContent = `Question: ${questionNumber}/${this.totalQuestions || 15}`;
        }
        
        if (progressFill) {
            const progressPercentage = (totalAnswered / (this.totalQuestions || 15)) * 100;
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
        try {
            const totalAnswered = this.player?.questionHistory?.length || 0;
            
            // Simple progression logic based solely on question count, no threshold checks
            if (totalAnswered >= 10) {
                return this.advancedScenarios;
            } else if (totalAnswered >= 5) {
                return this.intermediateScenarios;
            }
            return this.basicScenarios;
        } catch (error) {
            console.error('Error in getCurrentScenarios:', error);
            return this.basicScenarios; // Default to basic if there's an error
        }
    }

    getCurrentLevel() {
        try {
            const totalAnswered = this.player?.questionHistory?.length || 0;
            
            // Simple level determination based solely on question count, no threshold checks
            if (totalAnswered >= 10) {
                return 'Advanced';
            } else if (totalAnswered >= 5) {
                return 'Intermediate';
            }
            return 'Basic';
        } catch (error) {
            console.error('Error in getCurrentLevel:', error);
            return 'Basic'; // Default to basic if there's an error
        }
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
        // Calculate final score based on correct answers
        const correctAnswers = this.player.questionHistory.filter(q => q.selectedAnswer && q.selectedAnswer.isCorrect).length;
        const scorePercentage = Math.round((correctAnswers / 15) * 100);
        
        // Create the final progress object
        const progress = {
            questionsAnswered: this.player.questionHistory.length,
            questionHistory: this.player.questionHistory,
            currentScenario: this.player.currentScenario,
            status: scorePercentage >= 70 ? 'passed' : 'failed',
            scorePercentage: scorePercentage,
            lastUpdated: new Date().toISOString()
        };

        try {
            // Save progress to API
            const username = localStorage.getItem('username');
            if (!username) {
                throw new Error('No username found');
            }

            // Save to API
            await this.apiService.saveQuizProgress(this.quizName, progress);
            console.log('Final progress saved:', progress);

            // Update quiz score in user's record
            const quizUser = new QuizUser(username);
            await quizUser.updateQuizScore(
                this.quizName, 
                scorePercentage, 
                0, // no experience
                this.player.tools,
                this.player.questionHistory,
                this.player.questionHistory.length,
                scorePercentage >= 70 ? 'completed' : 'failed'
            );
            
            // Show the end screen
            this.gameScreen.classList.add('hidden');
            this.outcomeScreen.classList.add('hidden');
            if (this.endScreen) {
                this.endScreen.classList.remove('hidden');
            }
            
            // Update display elements
            const finalScoreElement = document.getElementById('final-score');
            if (finalScoreElement) {
                finalScoreElement.textContent = `Final Score: ${scorePercentage}%`;
            }
            
            // Generate question review list
            const reviewList = document.getElementById('question-review');
            if (reviewList) {
                reviewList.innerHTML = ''; // Clear existing content
                
                this.player.questionHistory.forEach((record, index) => {
                    const reviewItem = document.createElement('div');
                    reviewItem.className = 'review-item';
                    
                    const isCorrect = record.selectedAnswer && record.selectedAnswer.isCorrect;
                    reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
                    
                    reviewItem.innerHTML = `
                        <h4>Question ${index + 1}</h4>
                        <p class="scenario">${record.scenario ? record.scenario.description : 'No description available'}</p>
                        <p class="answer"><strong>Your Answer:</strong> ${record.selectedAnswer ? record.selectedAnswer.text : 'No answer selected'}</p>
                        <p class="outcome"><strong>Outcome:</strong> ${record.selectedAnswer ? record.selectedAnswer.outcome : 'No outcome'}</p>
                        <p class="result"><strong>Result:</strong> ${isCorrect ? 'Correct' : 'Incorrect'}</p>
                    `;
                    
                    reviewList.appendChild(reviewItem);
                });
            }

            // Clear local storage for this quiz
            this.clearQuizLocalStorage(username, this.quizName);

            // Display recommendations if we're not redirecting
            this.generateRecommendations();

        } catch (error) {
            console.error('Failed to save final progress:', error);
            this.showError('Failed to save your results. Please try again.');
        }
    }

    displayOutcome(selectedAnswer) {
        if (!selectedAnswer) {
            console.error('No answer selected');
            return;
        }

        try {
            const currentScenarios = this.getCurrentScenarios();
            if (!currentScenarios || !currentScenarios[this.player.currentScenario]) {
                console.error('No current scenario found');
                return;
            }
            
            const currentScenario = currentScenarios[this.player.currentScenario];
            const earnedXP = selectedAnswer.experience || 0;
            
            // Find the max possible XP for this scenario
            const maxXP = Math.max(...currentScenario.options.map(o => o.experience || 0));
            const isCorrect = selectedAnswer.isCorrect || (earnedXP === maxXP);
            
            console.log('Displaying outcome:', { 
                isCorrect, 
                selectedAnswer,
                currentScenario: this.player.currentScenario
            });
            
            // Update UI - safely access elements
            const outcomeScreen = document.getElementById('outcome-screen');
            const gameScreen = document.getElementById('game-screen');
            
            // Show outcome screen if elements exist
            if (gameScreen) {
                gameScreen.classList.add('hidden');
                gameScreen.style.display = 'none';
            }
            
            if (outcomeScreen) {
                outcomeScreen.classList.remove('hidden');
                outcomeScreen.style.display = 'block';
            }
            
            // Set content directly in the outcome screen
            const outcomeContent = outcomeScreen.querySelector('.outcome-content');
            if (outcomeContent) {
                outcomeContent.innerHTML = `
                    <h3>${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                    <p>${selectedAnswer.outcome || ''}</p>
                    <p class="result">${isCorrect ? 'Correct answer!' : 'Try again next time.'}</p>
                    <button id="continue-btn" class="submit-button">Continue</button>
                `;
                
                // Add event listener to the continue button
                const continueBtn = outcomeContent.querySelector('#continue-btn');
                if (continueBtn) {
                    continueBtn.addEventListener('click', () => this.nextScenario());
                }
            } else {
                console.error('Could not find outcome content element');
            }
            
            // Update progress
            this.updateProgress();
        } catch (error) {
            console.error('Error in displayOutcome:', error);
            this.showError('An error occurred. Please try again.');
        }
    }

    // Helper method to display scenario content
    displayScenarioContent(scenario) {
        // Update UI with current scenario
        const titleElement = document.getElementById('scenario-title');
        const descriptionElement = document.getElementById('scenario-description');
        const optionsContainer = document.getElementById('options-container');
        
        if (titleElement && scenario.title) {
            titleElement.textContent = scenario.title;
        }
        
        if (descriptionElement && scenario.description) {
            descriptionElement.textContent = scenario.description;
        }
        
        if (optionsContainer && scenario.options && Array.isArray(scenario.options)) {
            optionsContainer.innerHTML = '';
            
            scenario.options.forEach((option, index) => {
                if (!option || !option.text) {
                    console.error('Invalid option at index', index, option);
                    return;
                }
                
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.innerHTML = `
                    <input type="radio" 
                        name="option" 
                        value="${index}" 
                        id="option${index}"
                        tabindex="0"
                        aria-label="${option.text}">
                    <label for="option${index}">${option.text}</label>
                `;
                optionsContainer.appendChild(optionDiv);
            });
        }
        
        // Record start time for this question
        this.questionStartTime = Date.now();
        
        // Initialize timer for the new question
        this.initializeTimer();
        
        // Update progress display
        this.updateProgress();
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new InitiativeQuiz();
    quiz.startGame();
}); 