import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';

class ContentCopyQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a content copy expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong content writing skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing content writing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'content-copy',
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

        // Basic Scenarios (IDs 1-5, 75 XP total, 15 XP each)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Primary Objective',
                description: 'What is the primary focus of copy proofing?',
                options: [
                    {
                        text: 'Conduct comprehensive software functionality testing to ensure all features work as intended across different platforms and environments',
                        outcome: 'Functionality testing is explicitly out of scope for copy proofing.',
                        experience: -10
                    },
                    {
                        text: 'Review content accuracy',
                        outcome: 'This is the core purpose of copy proofing.',
                        experience: 15
                    },
                    {
                        text: 'Evaluate and optimize the user interface design elements including layout, color schemes, and interactive components',
                        outcome: 'While content proofing includes some UI elements, copy proofing specifically focuses on text content.',
                        experience: 5
                    },
                    {
                        text: 'Verify browser compatibility',
                        outcome: 'This is a functional testing concern, not related to copy proofing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Content Proofing Scope',
                description: 'When conducting content proofing, what is considered out of scope?',
                options: [
                    {
                        text: 'Detailed analysis of spelling and typographical errors throughout the content',
                        outcome: 'Spelling errors are a key focus of content proofing.',
                        experience: -10
                    },
                    {
                        text: 'Comprehensive grammar and syntax verification',
                        outcome: 'Grammar checking is a fundamental part of content proofing.',
                        experience: -5
                    },
                    {
                        text: 'Software functionality issues',
                        outcome: 'Functionality is out of scope.',
                        experience: 15
                    },
                    {
                        text: 'Review of content alignment with brand guidelines and messaging consistency',
                        outcome: 'While consistency is important, some aspects might be out of scope depending on the project.',
                        experience: 5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Main Objectives',
                description: 'What is the primary objective of content proofing?',
                options: [
                    {
                        text: 'Improving Content quality',
                        outcome: 'This is a primary objective of content proofing.',
                        experience: 15
                    },
                    {
                        text: 'Implementing and optimizing website performance metrics including page load times, server response, and resource utilization',
                        outcome: 'This is a technical performance concern, not related to content.',
                        experience: -10
                    },
                    {
                        text: 'Validating payment processing systems and transaction workflows',
                        outcome: 'This is a functional testing concern.',
                        experience: -5
                    },
                    {
                        text: 'Database optimization',
                        outcome: 'While quality-related, this is not a content proofing objective',
                        experience: 5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Attention to Detail',
                description: 'Why is attention to detail important in content proofing?',
                options: [
                    {
                        text: 'To find security vulnerabilities',
                        outcome: 'Security testing is separate from content proofing.',
                        experience: -10
                    },
                    {
                        text: 'Helps the client maintain quality',
                        outcome: 'This is within the main characteristics of content testing.',
                        experience: 15
                    },
                    {
                        text: 'To improve server performance',
                        outcome: 'This is not related to content proofing',
                        experience: -5
                    },
                    {
                        text: 'To reduce development costs',
                        outcome: 'While good quality can reduce costs, it\'s not the primary reason for attention to detail',
                        experience: 5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Changes to Content Requirements',
                description: 'What can happen if content changes occur after testing?',
                options: [
                    {
                        text: 'The testing becomes completely invalid',
                        outcome: 'Not all testing will become invalid, but some changes may make prior testing redundant.',
                        experience: 5
                    },
                    {
                        text: 'The system will crash',
                        outcome: 'Content changes should not cause system crashes.',
                        experience: -10
                    },
                    {
                        text: 'Previous testing may be partially voided',
                        outcome: 'This is a risk to content changes during the testing cycle',
                        experience: 15
                    },
                    {
                        text: 'The client must restart the project',
                        outcome: 'While content changes may affect some areas already tested, it is not considered to fully re-test all content again',
                        experience: 5
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10, 100 XP total, 20 XP each)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Operating System Content Consistency',
                description: 'When comparing Android and iOS versions of an application, what should testers look for?',
                options: [
                    {
                        text: 'Different operating system versions',
                        outcome: 'This is a technical consideration, not a content concern.',
                        experience: -10
                    },
                    {
                        text: 'Consistent user experience across platforms',
                        outcome: 'Content testing should specifically address platform consistency.',
                        experience: 20
                    },
                    {
                        text: 'Different screen sizes',
                        outcome: 'While relevant for content display, it\'s not the primary focus',
                        experience: 5
                    },
                    {
                        text: 'Battery consumption differences',
                        outcome: 'This is a technical performance concern',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Volume of Raised Content Issues',
                description: 'What is a recommended approach when dealing with a high volume of small issues?',
                options: [
                    {
                        text: 'Ignore minor issues',
                        outcome: 'All issues should be documented appropriately.',
                        experience: -10
                    },
                    {
                        text: 'Group issues by content section',
                        outcome: 'This is the recommended way of reporting issues for ease of identification.',
                        experience: 20
                    },
                    {
                        text: 'Only report critical issues',
                        outcome: 'While issues may be considered minor, some would still be considered important to the client/user',
                        experience: -5
                    },
                    {
                        text: 'Create separate tickets for each typo',
                        outcome: 'While thorough, this could be too time-consuming',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Reviewing Images',
                description: 'What should testers consider when reviewing images across environments?',
                options: [
                    {
                        text: 'Image file size only',
                        outcome: 'While important, this is too narrow a focus.',
                        experience: 5
                    },
                    {
                        text: 'Image loading speed only',
                        outcome: 'This is a performance concern.',
                        experience: -10
                    },
                    {
                        text: 'Image quality and resolution across all environments',
                        outcome: 'This is a primary factor in reviewing image content',
                        experience: 20
                    },
                    {
                        text: 'Number of images used',
                        outcome: 'This is a design decision, not a content proofing concern',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Provided Requirements',
                description: 'How does the absence of a copy deck affect testing?',
                options: [
                    {
                        text: 'Testing becomes impossible',
                        outcome: 'Testing can still proceed with limited scope.',
                        experience: -5
                    },
                    {
                        text: 'Testing becomes limited to grammar and punctuation',
                        outcome: 'This is a risk of documentation not being provided by the client.',
                        experience: 20
                    },
                    {
                        text: 'Testing requires more time',
                        outcome: 'While potentially true, it\'s not the main impact',
                        experience: 5
                    },
                    {
                        text: 'Testing must be automated',
                        outcome: 'Automation is not a method use for content testing',
                        experience: -10
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Localisation',
                description: 'What role does localization play in content proofing?',
                options: [
                    {
                        text: 'None, it\'s out of scope',
                        outcome: 'Localisation is an important part of content testing if required by the client.',
                        experience: -10
                    },
                    {
                        text: 'Only for technical terms',
                        outcome: 'While technical terms should be included, this is a risk of narrow scoping.',
                        experience: 5
                    },
                    {
                        text: 'Reviewing content appropriateness for target market',
                        outcome: 'Market considerations should be considered',
                        experience: 20
                    },
                    {
                        text: 'Checking page load times',
                        outcome: 'This is a performance concern',
                        experience: -10
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15, 125 XP total, 25 XP each)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Platform Content Inconsistencies',
                description: 'How should testers approach platform inconsistencies between mobile versions?',
                options: [
                    {
                        text: 'Ignore them as they\'re different platforms',
                        outcome: 'All inconsistencies should be documented.',
                        experience: -10
                    },
                    {
                        text: 'Document differences only if specified in requirements',
                        outcome: 'While the client may have specified areas of scope, they may not have considered all critical areas relating to customer usage.',
                        experience: 5
                    },
                    {
                        text: 'Report all differences unless variation is specified',
                        outcome: 'This is considered the correct approach',
                        experience: 25
                    },
                    {
                        text: 'Focus only on iOS issues',
                        outcome: 'All platforms need equal attention',
                        experience: -10
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Functional & Content Testing Relationship',
                description: 'What is the relationship between content proofing and functional testing in a project?',
                options: [
                    {
                        text: 'They must always be separate',
                        outcome: 'Functional & Content testing can be combined.',
                        experience: -5
                    },
                    {
                        text: 'They can be combined or separate based on project needs',
                        outcome: 'This technique can be used on most projects dependent on client needs.',
                        experience: 25
                    },
                    {
                        text: 'They must always be combined',
                        outcome: 'Only some projects may need content proofing which would be advised by the client',
                        experience: -10
                    },
                    {
                        text: 'Content proofing must come first',
                        outcome: 'While sometimes logical, it\'s not a requirement',
                        experience: 5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Content Discrepancies Within Documentation',
                description: 'How should testers handle content that differs from provided design documentation?',
                options: [
                    {
                        text: 'Automatically reject the content',
                        outcome: 'Differences should be communicated to the client.',
                        experience: -10
                    },
                    {
                        text: 'Ignore differences in older designs',
                        outcome: 'This could lead to missing important inconsistencies.',
                        experience: -5
                    },
                    {
                        text: 'Raise as a query to verify if designs are current',
                        outcome: 'This approach gives the client visibility and prompts confirmation for moving forward',
                        experience: 25
                    },
                    {
                        text: 'Only check current content',
                        outcome: 'Potential documentation issues could be missed',
                        experience: 5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Tester Documentation',
                description: 'What impact does the quality of tester documentation have on content proofing?',
                options: [
                    {
                        text: 'No impact as they\'re separate concerns',
                        outcome: 'If a tester can\'t maintain high standards in their own documentation, it raises doubts about their ability to identify content issues.',
                        experience: -10
                    },
                    {
                        text: 'Builds trust',
                        outcome: 'It creates a professional impression that reinforces the value of the testing service.',
                        experience: 25
                    },
                    {
                        text: 'Only impacts internal processes',
                        outcome: 'This is partially correct although it overlooks how documentation quality influences client relationships',
                        experience: 5
                    },
                    {
                        text: 'Reduces testing speed',
                        outcome: 'There\'s no direct correlation between documentation quality and testing speed',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Content Prioritisation',
                description: 'How should testers prioritise different types of content issues?',
                options: [
                    {
                        text: 'All issues are equally important',
                        outcome: 'Not all issues have equal impact.',
                        experience: -10
                    },
                    {
                        text: 'Only focus on spelling errors',
                        outcome: 'This is too narrow in focus and other critical content issues may be missed.',
                        experience: -5
                    },
                    {
                        text: 'Evaluate impact on user experience and brand consistency',
                        outcome: 'This is the correct approach for prioritisation of issues',
                        experience: 25
                    },
                    {
                        text: 'Prioritise based on page location',
                        outcome: 'This can be relevant to the project however, other critical issues may be missed by taking this approach',
                        experience: 5
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
            // Show loading state
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
        
        // Check if quiz should end
        if (this.player.questionHistory.length >= 15) {
            this.endGame();
            return;
        }
         
        if (this.player.currentScenario >= currentScenarios.length) {
            const totalQuestionsAnswered = this.player.questionHistory.length;
            
            if (this.shouldEndGame(totalQuestionsAnswered, this.player.experience)) {
                this.endGame();
                return;
            }
            
            this.player.currentScenario = 0;
            this.displayScenario();
            return;
        }

        const scenario = currentScenarios[this.player.currentScenario];
        if (!scenario) {
            console.error('No scenario found for index:', this.player.currentScenario);
            console.log('Current scenarios:', currentScenarios);
            console.log('Current state:', {
                totalAnswered: this.player.questionHistory.length,
                currentXP: this.player.experience,
                currentScenario: this.player.currentScenario
            });
            return;
        }
        
        // Show level transition message at the start of each level or when level changes
        const currentLevel = this.getCurrentLevel();
        const previousLevel = this.player.questionHistory.length > 0 ? 
            this.getCurrentLevel() : null;
            
        if (this.player.currentScenario === 0 || previousLevel !== currentLevel) {
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
        // Increment scenario counter
        this.player.currentScenario++;
        
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
            const completedQuestions = this.player.questionHistory.length;
            const currentQuestion = completedQuestions + 1;
            
            // Update question counter
            questionProgress.textContent = `Question: ${currentQuestion}/${totalQuestions}`;
            
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

        if (score >= 80) {
            recommendationsHTML += '<p>🏆 Outstanding content proofing expertise! Here are some ways to further enhance your skills:</p>';
        } else if (score >= 60) {
            recommendationsHTML += '<p>📝 Good understanding of content proofing! Here are areas to focus on:</p>';
        } else {
            recommendationsHTML += '<p>🎯 Here are key content proofing areas for improvement:</p>';
        }

        recommendationsHTML += '<ul>';

        // Add recommendations for weak areas
        weakAreas.forEach(area => {
            recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
        });

        // If there are strong areas but still room for improvement
        if (strongAreas.length > 0 && score < 100) {
            recommendationsHTML += '<li>Continue leveraging your strengths in: ' + 
                strongAreas.join(', ') + '</li>';
        }

        // Add general recommendations based on score
        if (score < 70) {
            recommendationsHTML += `
                <li>Review content proofing best practices and methodologies</li>
                <li>Practice identifying content inconsistencies across different platforms</li>
                <li>Focus on systematic content review approaches and documentation</li>
            `;
        }

        recommendationsHTML += '</ul>';
        recommendationsContainer.innerHTML = recommendationsHTML;
    }

    categorizeQuestion(scenario) {
        // Categorize questions based on their content
        const title = scenario.title.toLowerCase();
        const description = scenario.description.toLowerCase();

        if (title.includes('objective') || description.includes('objective')) {
            return 'Content Proofing Fundamentals';
        } else if (title.includes('scope') || description.includes('scope')) {
            return 'Scope Management';
        } else if (title.includes('platform') || description.includes('platform')) {
            return 'Platform Consistency';
        } else if (title.includes('localisation') || description.includes('localisation')) {
            return 'Localization Testing';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Documentation Quality';
        } else if (title.includes('content requirements') || description.includes('requirements')) {
            return 'Requirements Management';
        } else if (title.includes('image') || description.includes('image')) {
            return 'Visual Content Review';
        } else {
            return 'General Content Proofing';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Content Proofing Fundamentals': 'Focus on core content proofing principles: grammar, spelling, and content consistency checks.',
            'Scope Management': 'Practice identifying what is in and out of scope for content proofing vs. functional testing.',
            'Platform Consistency': 'Enhance cross-platform content verification skills, particularly between mobile and desktop versions.',
            'Localization Testing': 'Develop understanding of market-specific content requirements and cultural considerations.',
            'Documentation Quality': 'Improve documentation practices for content issues and maintain high standards in reporting.',
            'Requirements Management': 'Strengthen ability to handle content requirement changes and their impact on testing.',
            'Visual Content Review': 'Focus on systematic image and visual content review processes across environments.',
            'General Content Proofing': 'Review content proofing best practices and attention to detail techniques.'
        };

        return recommendations[area] || 'Continue developing your content proofing expertise through practical experience.';
    }

    endGame() {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        const finalScore = Math.min(this.player.experience, this.maxXP);
        const scorePercentage = Math.round((finalScore / this.maxXP) * 100);
        
        // Save the final quiz result
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                user.updateQuizScore(this.quizName, scorePercentage);
                console.log('Final quiz score saved:', scorePercentage);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

        const performanceSummary = document.getElementById('performance-summary');
        const threshold = this.performanceThresholds.find(t => finalScore >= t.threshold);
        performanceSummary.textContent = threshold.message;

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
    const quiz = new ContentCopyQuiz();
    quiz.startGame();
}); 