import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';

class TestSupportQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a test support expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong support skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing test support best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'test-support',
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
                title: 'Morning Communication',
                description: 'You\'re starting your first day on test support. What\'s the most professional first action?',
                options: [
                    {
                        text: 'Send a message to the client checking for specific test tasks and confirm your presence',
                        outcome: 'Perfect! This shows proactive communication and readiness to begin.',
                        experience: 15,
                        tool: 'Client Communication'
                    },
                    {
                        text: 'Start testing without checking in',
                        outcome: 'Morning check-ins are crucial for test support coordination.',
                        experience: -10
                    },
                    {
                        text: 'Wait for the client to contact you',
                        outcome: 'Proactive communication is essential in test support.',
                        experience: -5
                    },
                    {
                        text: 'Only check internal emails',
                        outcome: 'Client communication should be prioritized at start of day.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Access Verification',
                description: 'You\'re preparing for a test support session. What\'s the most thorough preparation approach?',
                options: [
                    {
                        text: 'Verify access to test URLs, designs, documentation, and tracker board',
                        outcome: 'Excellent! This ensures you\'re fully prepared for testing.',
                        experience: 15,
                        tool: 'Access Management'
                    },
                    {
                        text: 'Only check test environment access',
                        outcome: 'All resources need verification for effective testing.',
                        experience: -10
                    },
                    {
                        text: 'Wait until access is needed',
                        outcome: 'Proactive access verification prevents delays.',
                        experience: -5
                    },
                    {
                        text: 'Ask client for access during testing',
                        outcome: 'Access should be verified before starting work.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Documentation Management',
                description: 'You\'re starting on an ongoing test support project. What\'s the best documentation approach?',
                options: [
                    {
                        text: 'Create a process document noting important information and project procedures',
                        outcome: 'Perfect! This ensures knowledge retention and consistent processes.',
                        experience: 15,
                        tool: 'Process Documentation'
                    },
                    {
                        text: 'Rely on memory for processes',
                        outcome: 'Documentation is crucial for consistency and knowledge transfer.',
                        experience: -10
                    },
                    {
                        text: 'Only document major issues',
                        outcome: 'All processes and important information need documentation.',
                        experience: -5
                    },
                    {
                        text: 'Wait for someone else to document',
                        outcome: 'Proactive documentation is everyone\'s responsibility.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Client Communication Channels',
                description: 'You notice you don\'t have direct client communication access. What\'s the best approach?',
                options: [
                    {
                        text: 'Check with PM about getting added to relevant communication channels',
                        outcome: 'Excellent! This ensures proper communication setup.',
                        experience: 15,
                        tool: 'Communication Setup'
                    },
                    {
                        text: 'Work without direct communication',
                        outcome: 'Direct client communication is crucial for test support.',
                        experience: -10
                    },
                    {
                        text: 'Use personal communication methods',
                        outcome: 'Official channels should be used for client communication.',
                        experience: -5
                    },
                    {
                        text: 'Rely only on email',
                        outcome: 'Proper communication channels need to be established.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Project Board Monitoring',
                description: 'How should you approach project board management during test support?',
                options: [
                    {
                        text: 'Keep board open and regularly monitor for new tickets and progress updates',
                        outcome: 'Perfect! This ensures timely response to new testing needs.',
                        experience: 15,
                        tool: 'Project Tracking'
                    },
                    {
                        text: 'Check board once daily',
                        outcome: 'Regular monitoring throughout the day is needed.',
                        experience: -10
                    },
                    {
                        text: 'Wait for notifications',
                        outcome: 'Proactive board monitoring is essential.',
                        experience: -5
                    },
                    {
                        text: 'Only check assigned tickets',
                        outcome: 'Overall project progress needs monitoring.',
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
                title: 'Client Process Adaptation',
                description: 'You\'re working with a client who uses different terminology and processes. What\'s the best approach?',
                options: [
                    {
                        text: 'Adapt to client terminology and processes while maintaining Zoonou standards',
                        outcome: 'Excellent! This shows flexibility and professionalism.',
                        experience: 20,
                        tool: 'Process Adaptation'
                    },
                    {
                        text: 'Insist on using Zoonou terminology',
                        outcome: 'Adapting to client processes is crucial for effective collaboration.',
                        experience: -15
                    },
                    {
                        text: 'Ignore client processes',
                        outcome: 'Understanding and adapting to client processes is essential.',
                        experience: -10
                    },
                    {
                        text: 'Only use client processes when forced',
                        outcome: 'Proactive adaptation improves collaboration.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Handling Idle Time',
                description: 'You\'re booked for test support but have no tasks due to client delays. What\'s the best approach?',
                options: [
                    {
                        text: 'Inform PM and explore additional ways to add value to the project',
                        outcome: 'Excellent! This ensures productive use of time and adds value.',
                        experience: 20,
                        tool: 'Time Management'
                    },
                    {
                        text: 'Wait for tasks to be assigned',
                        outcome: 'Proactive exploration of additional tasks is beneficial.',
                        experience: -15
                    },
                    {
                        text: 'Use time for personal tasks',
                        outcome: 'Idle time should be used productively for the project.',
                        experience: -10
                    },
                    {
                        text: 'Only inform client of availability',
                        outcome: 'PM should be informed to explore additional opportunities.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Communication with Non-Responsive Clients',
                description: 'The client is slow to respond, affecting your testing. What\'s the best approach?',
                options: [
                    {
                        text: 'Maintain open communication, update PM, and suggest raising the issue in regular catch-ups',
                        outcome: 'Excellent! This ensures issues are addressed and communication remains open.',
                        experience: 20,
                        tool: 'Communication Management'
                    },
                    {
                        text: 'Stop testing until client responds',
                        outcome: 'Testing should continue with available information.',
                        experience: -15
                    },
                    {
                        text: 'Only communicate when client responds',
                        outcome: 'Proactive communication is essential.',
                        experience: -10
                    },
                    {
                        text: 'Ignore communication issues',
                        outcome: 'Communication issues need addressing for effective collaboration.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Managing Multiple Projects',
                description: 'You\'re assigned to multiple test support projects. What\'s the best approach to manage your workload?',
                options: [
                    {
                        text: 'Prioritize tasks based on deadlines and importance, communicate availability to PMs',
                        outcome: 'Excellent! This ensures effective workload management.',
                        experience: 20,
                        tool: 'Workload Management'
                    },
                    {
                        text: 'Focus on one project at a time',
                        outcome: 'Multiple projects require balanced attention.',
                        experience: -15
                    },
                    {
                        text: 'Wait for PMs to assign priorities',
                        outcome: 'Proactive prioritization is beneficial.',
                        experience: -10
                    },
                    {
                        text: 'Only work on the most interesting project',
                        outcome: 'All projects need attention based on priorities.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Building Client Relationships',
                description: 'You\'re new to a test support project. How do you build a strong relationship with the client?',
                options: [
                    {
                        text: 'Communicate regularly, provide valuable feedback, and demonstrate understanding of their needs',
                        outcome: 'Excellent! This builds trust and rapport with the client.',
                        experience: 20,
                        tool: 'Relationship Building'
                    },
                    {
                        text: 'Only communicate when necessary',
                        outcome: 'Regular communication is key to building relationships.',
                        experience: -15
                    },
                    {
                        text: 'Focus solely on testing tasks',
                        outcome: 'Building relationships requires more than task completion.',
                        experience: -10
                    },
                    {
                        text: 'Wait for client to initiate relationship building',
                        outcome: 'Proactive relationship building is beneficial.',
                        experience: 0
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15, 100 XP total)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Independent Decision Making',
                description: 'You\'ve identified a more efficient testing approach. How do you proceed?',
                options: [
                    {
                        text: 'Communicate the approach to PM and client, providing rationale and expected benefits',
                        outcome: 'Excellent! This demonstrates initiative and effective communication.',
                        experience: 25,
                        tool: 'Decision Making'
                    },
                    {
                        text: 'Implement the approach without consultation',
                        outcome: 'Consultation ensures alignment and acceptance.',
                        experience: -15
                    },
                    {
                        text: 'Ignore the new approach',
                        outcome: 'Innovative approaches should be explored.',
                        experience: -10
                    },
                    {
                        text: 'Wait for client to suggest changes',
                        outcome: 'Proactive suggestions are valuable.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Handling Client Requests',
                description: 'A client requests a change that deviates from Zoonou\'s standard processes. What\'s the best approach?',
                options: [
                    {
                        text: 'Discuss the request with your line manager for approval before responding to the client',
                        outcome: 'Excellent! This ensures proper alignment and authority.',
                        experience: 25,
                        tool: 'Request Management'
                    },
                    {
                        text: 'Agree to the request immediately',
                        outcome: 'Approval is needed for deviations from standard processes.',
                        experience: -15
                    },
                    {
                        text: 'Decline the request without discussion',
                        outcome: 'Discussion ensures understanding and potential compromise.',
                        experience: -10
                    },
                    {
                        text: 'Ignore the request',
                        outcome: 'Client requests need addressing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Knowledge Retention',
                description: 'You\'re leaving a long-term test support project. How do you ensure knowledge retention?',
                options: [
                    {
                        text: 'Create a comprehensive handover guide documenting processes and key information',
                        outcome: 'Excellent! This ensures smooth transition and knowledge retention.',
                        experience: 25,
                        tool: 'Knowledge Management'
                    },
                    {
                        text: 'Rely on verbal handover',
                        outcome: 'Written documentation ensures thorough knowledge transfer.',
                        experience: -15
                    },
                    {
                        text: 'Only document major issues',
                        outcome: 'All relevant information needs documentation.',
                        experience: -10
                    },
                    {
                        text: 'Leave without documentation',
                        outcome: 'Documentation is crucial for continuity.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Managing Client Expectations',
                description: 'A client expects more testing than the agreed scope allows. How do you manage this?',
                options: [
                    {
                        text: 'Communicate scope limitations clearly and discuss potential adjustments with PM',
                        outcome: 'Excellent! This ensures clear expectations and potential solutions.',
                        experience: 25,
                        tool: 'Expectation Management'
                    },
                    {
                        text: 'Attempt to meet expectations regardless of scope',
                        outcome: 'Scope limitations need clear communication.',
                        experience: -15
                    },
                    {
                        text: 'Ignore the client\'s expectations',
                        outcome: 'Expectations need addressing and managing.',
                        experience: -10
                    },
                    {
                        text: 'Only inform PM without client communication',
                        outcome: 'Direct client communication is essential.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Long-Term Client Engagement',
                description: 'You\'re leading a long-term test support project. How do you ensure ongoing success?',
                options: [
                    {
                        text: 'Maintain regular communication, adapt to client needs, and continuously improve processes',
                        outcome: 'Excellent! This ensures long-term success and client satisfaction.',
                        experience: 25,
                        tool: 'Project Leadership'
                    },
                    {
                        text: 'Rely on initial processes without change',
                        outcome: 'Continuous improvement is key to long-term success.',
                        experience: -15
                    },
                    {
                        text: 'Only focus on immediate tasks',
                        outcome: 'Long-term success requires strategic focus.',
                        experience: -10
                    },
                    {
                        text: 'Wait for client feedback to make changes',
                        outcome: 'Proactive improvement is beneficial.',
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

            // Check if quiz was previously failed
            const username = localStorage.getItem('username');
            if (username) {
                let failed = false;
                
                // First check localStorage for immediate feedback
                const storageKey = `quiz_progress_${username}_${this.quizName}`;
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    try {
                        const parsedData = JSON.parse(localData);
                        if (parsedData.progress?.status === 'failed') {
                            failed = true;
                            this.player.experience = parsedData.progress.experience || 0;
                            this.player.questionHistory = parsedData.progress.questionHistory || [];
                        }
                    } catch (error) {
                        console.error('Error parsing local storage data:', error);
                    }
                }

                // Then check the API
                try {
                    const quizResult = await this.apiService.getQuizProgress(this.quizName);
                    if (quizResult?.data?.status === 'failed') {
                        failed = true;
                        this.player.experience = quizResult.data.experience || this.player.experience || 0;
                        this.player.questionHistory = quizResult.data.questionHistory || this.player.questionHistory || [];
                    }
                } catch (error) {
                    console.error('Error checking quiz status from API:', error);
                }

                if (failed) {
                    // If quiz was failed, show the end screen immediately
                    this.endGame(true);
                    return;
                }
            }

            // Initialize event listeners
            this.initializeEventListeners();

            // Load previous progress only if not failed
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

            // Get the correct scenario based on question count
            let scenario;
            const questionCount = this.player.questionHistory.length;
            
            if (questionCount < 5) {
                scenario = this.basicScenarios[questionCount];
            } else if (questionCount < 10) {
                scenario = this.intermediateScenarios[questionCount - 5];
            } else if (questionCount < 15) {
                scenario = this.advancedScenarios[questionCount - 10];
            }

            if (!scenario) {
                console.error('No scenario found for question count:', questionCount);
                this.endGame(true);
                return;
            }

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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of test support. You clearly understand the nuances of test support and are well-equipped to handle any test support challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your test support skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('access') || description.includes('access')) {
            return 'Access Management';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Documentation Management';
        } else if (title.includes('board') || description.includes('board')) {
            return 'Project Tracking';
        } else if (title.includes('client') || description.includes('client')) {
            return 'Client Communication';
        } else if (title.includes('idle') || description.includes('idle')) {
            return 'Time Management';
        } else if (title.includes('process') || description.includes('process')) {
            return 'Process Adherence';
        } else if (title.includes('team') || description.includes('team')) {
            return 'Team Collaboration';
        } else {
            return 'General Support Skills';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Access Management': 'Focus on proactively verifying and maintaining access to all necessary testing resources and systems.',
            'Documentation Management': 'Improve documentation practices for processes, issues, and project-specific information.',
            'Project Tracking': 'Enhance your approach to monitoring project boards and maintaining up-to-date ticket status.',
            'Client Communication': 'Strengthen professional communication skills and proper handling of client requests.',
            'Time Management': 'Work on effectively managing support time, including handling idle periods productively.',
            'Process Adherence': 'Focus on understanding and following standard processes while knowing when to escalate exceptions.',
            'Team Collaboration': 'Develop better coordination with team members and stakeholders during support activities.',
            'General Support Skills': 'Continue developing fundamental test support skills and best practices.'
        };

        return recommendations[area] || 'Continue practicing core test support principles.';
    }

    endGame(failed = false) {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        const finalScore = Math.min(this.player.experience, this.maxXP);
        const scorePercentage = Math.round((finalScore / this.maxXP) * 100);
        
        // Update the title based on pass/fail status
        const titleElement = this.endScreen.querySelector('h2');
        if (titleElement) {
            titleElement.textContent = failed ? 'Quiz Failed!' : 'Quiz Complete!';
        }

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

                // Also save to localStorage to ensure immediate persistence
                const storageKey = `quiz_progress_${username}_${this.quizName}`;
                localStorage.setItem(storageKey, JSON.stringify({ progress: result }));
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

        const performanceSummary = document.getElementById('performance-summary');
        if (failed) {
            performanceSummary.textContent = 'Quiz failed. You did not meet the minimum XP requirement to progress. Please contact your supervisor to reset your progress.';
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
    const quiz = new TestSupportQuiz();
    quiz.startGame();
}); 
