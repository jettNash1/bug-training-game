import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class CommunicationQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a communication expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong communication skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'communication',
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
                title: 'Daily Stand-up',
                description: 'You\'re attending a daily stand-up meeting. What\'s the most effective way to communicate your progress?',
                options: [
                    {
                        text: 'Clearly state what you completed yesterday, what you\'re working on today, and any blockers',
                        outcome: 'Perfect! This provides a clear and structured update.',
                        experience: 15,
                        tool: 'Meeting Communication'
                    },
                    {
                        text: 'Give a detailed explanation of every task you worked on',
                        outcome: 'Stand-ups should be concise and focused.',
                        experience: 0
                    },
                    {
                        text: 'State that everything is fine and you progressing well',
                        outcome: 'Updates should be specific and informative as stakeholders need to factor in project resources and time management.',
                        experience: -10
                    },
                    {
                        text: 'Wait for people to ask you questions about specific areas of the project during the meeting',
                        outcome: 'Being proactive in providing updates is a more productive use of meeting time.',
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Email Communication',
                description: 'You need to send an important update to the team. How should you structure your email?',
                options: [
                    {
                        text: 'Use a clear subject line, organize content with headings, and highlight key points',
                        outcome: 'Excellent! This makes the email easy to read and understand.',
                        experience: 15,
                        tool: 'Email Etiquette'
                    },
                    {
                        text: 'Write a paragraph which includes all possible information that might be required',
                        outcome: 'Emails should be well-organized and easy to pinpoint priority areas.',
                        experience: -10
                    },
                    {
                        text: 'Send multiple short emails targeting different areas of the project that require an update',
                        outcome: 'Important updates should be consolidated when possible to avoid losing important information.',
                        experience: 0
                    },
                    {
                        text: 'Use informal language and emojis to keep a friendly approach',
                        outcome: 'Professional communication requires an appropriate tone.',
                        experience: -5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Team Chat',
                description: 'A colleague asks a technical question in the team chat. What\'s the best response?',
                options: [
                    {
                        text: 'Provide a clear answer with relevant documentation links',
                        outcome: 'Perfect! This helps both now and in the future.',
                        experience: 15,
                        tool: 'Documentation Reference'
                    },
                    {
                        text: 'Advise them to search for suggestions online and give general direction',
                        outcome: 'This may not be helpful or collaborative and can slow down testing processes.',
                        experience: -10
                    },
                    {
                        text: 'Wait for someone else to respond to the question',
                        outcome: 'Team communication requires active participation.',
                        experience: -5
                    },
                    {
                        text: 'Give a vague answer to their queries if you are not sure',
                        outcome: 'Clear and specific responses are more helpful and if the answer is not known, direct to someone who might be able to help.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Status Updates',
                description: 'You\'ve encountered a delay in your work. How should you communicate this?',
                options: [
                    {
                        text: 'Promptly inform stakeholders, explain the cause, and provide an updated timeline',
                        outcome: 'Excellent! This maintains transparency and builds trust.',
                        experience: 15,
                        tool: 'Status Reporting'
                    },
                    {
                        text: 'Wait until someone else affected asks about the delay in the project',
                        outcome: 'Delays should be communicated proactively as to redistribute working resources effectively.',
                        experience: -5
                    },
                    {
                        text: 'Mention the delay in the next scheduled meeting',
                        outcome: 'Important updates shouldn\'t wait for scheduled meetings as it could cause bottlenecks further into the project.',
                        experience: 0
                    },
                    {
                        text: 'Find solutions to delay yourself without telling anyone',
                        outcome: 'Transparency is important in team communication and in this instance may be helped with extra resources to mitigate the delay.',
                        experience: -10
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Documentation',
                description: 'You\'ve completed a new feature. How should you document it?',
                options: [
                    {
                        text: 'Write clear, organised documentation with examples and update relevant guides',
                        outcome: 'Perfect! This helps the team understand and maintain the feature.',
                        experience: 15,
                        tool: 'Technical Documentation'
                    },
                    {
                        text: 'Leave comments in the specific code that you have access to',
                        outcome: 'Documentation should be more comprehensive and accessible to all interested parties.',
                        experience: 0
                    },
                    {
                        text: 'Leave guides and documentation as this is not needed since the code itself is self-explanatory',
                        outcome: 'Documentation is crucial for diverse teams with different skill sets to understand the feature.',
                        experience: -10
                    },
                    {
                        text: 'Create quick notes in your personal files to lean on should any questions arise',
                        outcome: 'Documentation should be accessible to the full team.',
                        experience: -5
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Stakeholder Communication',
                description: 'You need to explain a technical issue to non-technical stakeholders. How should you approach this?',
                options: [
                    {
                        text: 'Use clear analogies and visual aids, avoid jargon, and focus on business impact',
                        outcome: 'Excellent! This makes technical concepts accessible.',
                        experience: 20,
                        tool: 'Stakeholder Communication'
                    },
                    {
                        text: 'Use technical terms to maintain a professional approach',
                        outcome: 'Technical jargon can confuse non-technical stakeholders.',
                        experience: -10
                    },
                    {
                        text: 'Keep it very brief to avoid any confusion around processes',
                        outcome: 'Although keeping the explanation brief is a good approach. Thorough and clear wording is needed for good understanding.',
                        experience: -5
                    },
                    {
                        text: 'Let someone else who has been on the project longer handle it',
                        outcome: 'Technical communication at all levels is an important skillset and will have to be utilised at points throughout project based work.',
                        experience: -15
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Conflict Resolution',
                description: 'There\'s a disagreement in the team about a technical approach. How do you handle it?',
                options: [
                    {
                        text: 'Facilitate a discussion, document different viewpoints, and work toward consensus',
                        outcome: 'Perfect! This promotes constructive resolution.',
                        experience: 20,
                        tool: 'Conflict Resolution'
                    },
                    {
                        text: 'The most senior person within the team should decide the outcome',
                        outcome: 'All round team input and consensus is valuable as different observations can bring about solutions.',
                        experience: -5
                    },
                    {
                        text: 'Avoid the conflict as matters of these type generally resolve themselves',
                        outcome: 'Conflicts should be addressed professionally and solutions sought as to move forward with a good working relationship.',
                        experience: -10
                    },
                    {
                        text: 'Push for your preferred solution to quickly resolve the matter before it escalates',
                        outcome: 'All viewpoints should be considered in technical discussions as everyone has valuable experience.',
                        experience: -15
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Code Review Communication',
                description: 'You\'re reviewing a colleague\'s documentation and find several issues. How do you communicate this?',
                options: [
                    {
                        text: 'Provide specific, constructive feedback with examples and suggestions for improvement',
                        outcome: 'Excellent! This helps learning and improvement.',
                        experience: 20,
                        tool: 'Code Review'
                    },
                    {
                        text: 'List all the problems found in document and send these to be addressed',
                        outcome: 'Feedback should be constructive and helpful and not just point out issues.',
                        experience: -5
                    },
                    {
                        text: 'Tell them they need to review it again and update it',
                        outcome: 'Specific feedback is more valuable and helps move towards solutions.',
                        experience: -10
                    },
                    {
                        text: 'Approve it to avoid any type of confrontation and to move forward with the project quickly',
                        outcome: 'Honest, constructive feedback is important, as team and personal progress may not be achieved moving forward.',
                        experience: -15
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Remote Communication',
                description: 'You\'re working remotely and need to collaborate on a complex task. How do you ensure effective communication?',
                options: [
                    {
                        text: 'Set up regular video calls, use screen sharing, and maintain detailed documentation',
                        outcome: 'Perfect! This maintains clear communication channels.',
                        experience: 20,
                        tool: 'Remote Collaboration'
                    },
                    {
                        text: 'Use email as your source of communication and copy everyone in that\'s involved in the project',
                        outcome: 'Multiple communication channels are often needed for different teams related to the project.',
                        experience: -15
                    },
                    {
                        text: 'Wait for others to initiate communication to establish their preferred channels',
                        outcome: 'Being proactive in remote communication creates a professional approach.',
                        experience: -10
                    },
                    {
                        text: 'Handle everything through chat channels for quick responses',
                        outcome: 'Complex tasks often need richer communication and extensive detail that chat channels cant provide.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Project Updates',
                description: 'You\'re leading a project and need to communicate progress to multiple teams. What\'s the best approach?',
                options: [
                    {
                        text: 'Create a structured report with key metrics, milestones, and risks, and schedule a presentation',
                        outcome: 'Excellent! This provides comprehensive project visibility.',
                        experience: 20,
                        tool: 'Project Communication'
                    },
                    {
                        text: 'Send quick updates on the fly as changes to projects or issue occur',
                        outcome: 'Project updates should be organised and regular.',
                        experience: -5
                    },
                    {
                        text: 'Update your immediate team members within the appropriate channel',
                        outcome: 'All stakeholders need appropriate updates to form project progress plans going forward.',
                        experience: -10
                    },
                    {
                        text: 'Wait for official review meetings and report all project updates at that time',
                        outcome: 'Regular project communication is important for stakeholder prioritisation and project progress.',
                        experience: -15
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Crisis Communication',
                description: 'A critical system issue is affecting multiple teams. How do you manage communication?',
                options: [
                    {
                        text: 'Establish a clear communication channel, provide regular updates, and document the resolution process',
                        outcome: 'Perfect! This ensures effective crisis management.',
                        experience: 25,
                        tool: 'Crisis Management'
                    },
                    {
                        text: 'Send an email about the issue and copy everyone in that\'s involved in the project',
                        outcome: 'Critical issues need ongoing communication with the people who are dealing with the solution and interested parties.',
                        experience: -10
                    },
                    {
                        text: 'Let each team handle their own communications',
                        outcome: 'Coordinated communication is crucial in crises so all interested parties can be updated on progress.',
                        experience: -15
                    },
                    {
                        text: 'Wait until the issue is resolved to communicate with any interested party',
                        outcome: 'Proactive communication is essential in crises and interested parties should be kept up to date with progress.',
                        experience: -20
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Cross-cultural Communication',
                description: 'You\'re working with a global team across different time zones and cultures. How do you ensure effective communication?',
                options: [
                    {
                        text: 'Use clear, inclusive language, provide written follow-ups, and be mindful of cultural differences',
                        outcome: 'Excellent! This promotes inclusive global collaboration.',
                        experience: 25,
                        tool: 'Global Communication'
                    },
                    {
                        text: 'Use your preferred communication style',
                        outcome: 'Adaptive communication for different cultures needs to be addressed in these situations to maintain a professional standard.',
                        experience: -20
                    },
                    {
                        text: 'Communicate with all teams during your normal working hours',
                        outcome: 'Time zones must be considered in global team projects and working hours can sometimes be amended to suite all parties.',
                        experience: -15
                    },
                    {
                        text: 'Use informal language to set a friendly tone and promote trust',
                        outcome: 'A professional tone is important across different cultures to respect a good business standard.',
                        experience: -10
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Technical Presentation',
                description: 'You need to present a complex technical solution to a diverse audience. How do you prepare?',
                options: [
                    {
                        text: 'Create multiple versions of the presentation with appropriate technical depth for different audiences',
                        outcome: 'Perfect! This ensures understanding at all levels.',
                        experience: 25,
                        tool: 'Technical Presentation'
                    },
                    {
                        text: 'Focus on the technical details as these should be understood to move forward',
                        outcome: 'The diverse audience needs to be considered and some may not have a technical background.',
                        experience: -15
                    },
                    {
                        text: 'Keep it very high-level for everyone involved in the presentation',
                        outcome: 'Balanced technical depth is a preferred approach for different audiences.',
                        experience: -10
                    },
                    {
                        text: 'Have someone else take the demonstration that has more experience with presenting',
                        outcome: 'Presentation skills are essential in a testers skill set and practice will develop these skills.',
                        experience: -20
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Knowledge Transfer',
                description: 'You\'re leaving a project and need to ensure knowledge transfer. How do you handle this?',
                options: [
                    {
                        text: 'Create comprehensive documentation, conduct training sessions, and have overlap period with new team',
                        outcome: 'Excellent! This ensures smooth transition.',
                        experience: 25,
                        tool: 'Knowledge Management'
                    },
                    {
                        text: 'Leave detailed comments relating to the code of the system under test within the project',
                        outcome: 'Knowledge transfer needs multiple approaches targeting specific expertise for different team members.',
                        experience: -10
                    },
                    {
                        text: 'Take one handoff meeting for everyone involved in the project',
                        outcome: 'Thorough knowledge transfer takes time and planning different avenues to share this knowledge is required.',
                        experience: -15
                    },
                    {
                        text: 'Let the new team work from previous project communication and emails',
                        outcome: 'A full handoff is crucial for continuity throughout the project.',
                        experience: -20
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Strategic Communication',
                description: 'You need to propose a major technical change that will impact multiple departments. How do you approach this?',
                options: [
                    {
                        text: 'Prepare a detailed proposal with impact analysis, gather feedback from stakeholders, and present a phased implementation plan',
                        outcome: 'Perfect! This demonstrates strategic thinking and stakeholder management.',
                        experience: 25,
                        tool: 'Change Management'
                    },
                    {
                        text: 'Send the proposal by email so everyone can digest the information when they have time',
                        outcome: 'Major changes need comprehensive communication and in most cases meetings to gain sign off from all interested parties.',
                        experience: -15
                    },
                    {
                        text: 'Start implementing the change and inform others at a later date when happy with progress',
                        outcome: 'Any major proposed changes should be communicated and signed off beforehand.',
                        experience: -20
                    },
                    {
                        text: 'Let management handle the communication with all parties',
                        outcome: 'Change proposals and meetings should be driven by the implementors of those proposal.',
                        experience: -10
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
        const scorePercentage = this.calculateScore();
        
        // Check for completion (all questions answered)
        if (this.player.questionHistory.length >= this.totalQuestions) {
            status = scorePercentage >= this.passPercentage ? 'completed' : 'failed';
        }

        const progress = {
            data: {
                experience: this.player.experience || 0,
                tools: this.player.tools || [],
                currentScenario: this.player.currentScenario || 0,
                questionHistory: this.player.questionHistory || [],
                lastUpdated: new Date().toISOString(),
                questionsAnswered: this.player.questionHistory.length,
                scorePercentage: scorePercentage,
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
            
            console.log('Saving progress with status:', status, 'and score:', scorePercentage);
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

            // Get progress from API
            const savedProgress = await this.apiService.getQuizProgress(this.quizName);
            console.log('Raw API Response:', savedProgress);
            
            if (savedProgress?.success && savedProgress?.data) {
                const progress = savedProgress.data;
                
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
        const currentScenarios = this.getCurrentScenarios();
        
        // Check if all questions are completed
        if (this.player.questionHistory.length >= 15) {
            this.endGame();
            return;
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
            this.endGame();
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

        // Initialize timer for the new question
        this.initializeTimer();
    }

    async handleAnswer() {
        if (this.isLoading) return;
        
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
        }

        // Clear the timer when an answer is submitted
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }
        
        try {
            this.isLoading = true;
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) return;

            // Get the current scenario based on question count
            const questionCount = this.player.questionHistory.length;
            let scenario;
            
            if (questionCount < 5) {
                scenario = this.basicScenarios[questionCount];
            } else if (questionCount < 10) {
                scenario = this.intermediateScenarios[questionCount - 5];
            } else if (questionCount < 15) {
                scenario = this.advancedScenarios[questionCount - 10];
            }

            if (!scenario) {
                console.error('No scenario found for question count:', questionCount);
                return;
            }

            const originalIndex = parseInt(selectedOption.value);
            const selectedAnswer = scenario.options[originalIndex];

            // Update player experience
            this.player.experience = Math.max(0, Math.min(this.maxXP, this.player.experience + selectedAnswer.experience));
            
            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add status to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                status: selectedAnswer.experience > 0 ? 'passed' : 'failed',
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience)),
                timeSpent: timeSpent,
                timedOut: false
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();

            // Calculate the score and experience
            const totalQuestions = this.totalQuestions;
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
            const correctAnswer = scenario.options.reduce((prev, current) => 
                (prev.experience > current.experience) ? prev : current
            );

            let outcomeText = selectedAnswer.outcome;
            document.getElementById('outcome-text').textContent = outcomeText;
            
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
        const levelIndicator = document.getElementById('level-indicator');
        const questionCounter = document.getElementById('question-counter');
        
        if (levelIndicator) {
            const currentLevel = this.getCurrentLevel();
            levelIndicator.textContent = `Level: ${currentLevel}`;
            levelIndicator.style.backgroundColor = '#f0f0f0';
            levelIndicator.style.padding = '5px 10px';
            levelIndicator.style.borderRadius = '4px';
            levelIndicator.style.marginRight = '10px';
            levelIndicator.style.display = 'inline-block';
        }

        if (questionCounter) {
            const totalAnswered = this.player.questionHistory.length;
            questionCounter.textContent = `Question: ${totalAnswered + 1}/${this.totalQuestions}`;
            questionCounter.style.backgroundColor = '#f0f0f0';
            questionCounter.style.padding = '5px 10px';
            questionCounter.style.borderRadius = '4px';
            questionCounter.style.display = 'inline-block';
        }

        // Style the progress container
        const progressContainer = document.getElementById('progress-container');
        if (progressContainer) {
            progressContainer.style.margin = '10px 0';
            progressContainer.style.textAlign = 'center';
            progressContainer.style.backgroundColor = '#ffffff';
            progressContainer.style.padding = '10px';
            progressContainer.style.borderRadius = '8px';
            progressContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
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

    getCurrentLevel() {
        const totalAnswered = this.player.questionHistory.length;
        
        if (totalAnswered >= 10) {
            return 'Advanced';
        } else if (totalAnswered >= 5) {
            return 'Intermediate';
        }
        return 'Basic';
    }

    getCurrentScenarios() {
        const totalAnswered = this.player.questionHistory.length;
        
        if (totalAnswered >= 10) {
            return this.advancedScenarios;
        } else if (totalAnswered >= 5) {
            return this.intermediateScenarios;
        }
        return this.basicScenarios;
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of communication. You clearly understand the nuances of professional communication and are well-equipped to handle any communication challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your communication skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

    async endGame() {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        // Calculate score based on correct answers
        const totalQuestions = this.player.questionHistory.length;
        const correctAnswers = this.player.questionHistory.filter(record => 
            record.selectedAnswer.experience > 0
        ).length;
        
        const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
        const passed = scorePercentage >= 70; // Using 70% as pass threshold

        // Save the final quiz result with pass/fail status
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                const status = passed ? 'completed' : 'failed';
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

        document.getElementById('final-score').textContent = `Final Score: ${scorePercentage}%`;

        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = passed ? 'Quiz Complete!' : 'Quiz Failed!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (!passed) {
            performanceSummary.textContent = 'Quiz failed. You did not achieve the required 70% pass mark. You cannot retry this quiz.';
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
            const threshold = this.performanceThresholds.find(t => t.threshold <= scorePercentage);
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
    const quiz = new CommunicationQuiz();
    quiz.startGame();
}); 