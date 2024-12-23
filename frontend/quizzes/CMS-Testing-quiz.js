import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';

class CMS_Testing_Quiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a CMS Testing expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong CMS Testing skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing CMS Testing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'CMS-Testing',
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
                title: 'Understanding CMS',
                description: 'What is the primary purpose of a CMS (Content Management System)?',
                options: [
                    {
                        text: 'Allow users to create, manage, and modify digital content without specialized technical knowledge',
                        outcome: 'Perfect! This is the core purpose of a CMS.',
                        experience: 15,
                        tool: 'CMS Fundamentals'
                    },
                    {
                        text: 'Only for developers to write code',
                        outcome: 'CMS is for content management by non-technical users.',
                        experience: -5
                    },
                    {
                        text: 'Just for storing files',
                        outcome: 'CMS has broader content management capabilities.',
                        experience: -10
                    },
                    {
                        text: 'Only for website hosting',
                        outcome: 'CMS manages content across various platforms.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'CRUD Testing Basics',
                description: 'What are the essential components of CRUD testing in a CMS?',
                options: [
                    {
                        text: 'Create, Read, Update, and Delete functionality checks for content management',
                        outcome: 'Excellent! These are the fundamental CRUD operations.',
                        experience: 15,
                        tool: 'CRUD Testing'
                    },
                    {
                        text: 'Only check content creation',
                        outcome: 'All CRUD operations need testing.',
                        experience: -5
                    },
                    {
                        text: 'Skip testing deletion',
                        outcome: 'Delete operations are crucial.',
                        experience: -10
                    },
                    {
                        text: 'Just view content',
                        outcome: 'All operations need verification.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Test Planning',
                description: 'What should you do before starting CMS testing?',
                options: [
                    {
                        text: 'Review documentation, understand CMS architecture, and define testing objectives',
                        outcome: 'Perfect! Preparation ensures effective testing.',
                        experience: 15,
                        tool: 'Test Planning'
                    },
                    {
                        text: 'Start testing immediately',
                        outcome: 'Planning is crucial for effective testing.',
                        experience: -10
                    },
                    {
                        text: 'Skip documentation review',
                        outcome: 'Documentation provides crucial context.',
                        experience: -5
                    },
                    {
                        text: 'Test random features',
                        outcome: 'Structured approach needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Content Types',
                description: 'What content types should be tested in a CMS?',
                options: [
                    {
                        text: 'Text, images, videos, audio, and other media supported by the system',
                        outcome: 'Excellent! All supported content types need testing.',
                        experience: 15,
                        tool: 'Content Management'
                    },
                    {
                        text: 'Only text content',
                        outcome: 'All content types need verification.',
                        experience: -10
                    },
                    {
                        text: 'Skip media testing',
                        outcome: 'Media handling is crucial.',
                        experience: -5
                    },
                    {
                        text: 'Test one type only',
                        outcome: 'Comprehensive testing needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'User Roles',
                description: 'How should you test CMS user roles and permissions?',
                options: [
                    {
                        text: 'Verify access levels, permissions, and restrictions for different user types',
                        outcome: 'Perfect! Role-based access control is crucial.',
                        experience: 15,
                        tool: 'Permission Testing'
                    },
                    {
                        text: 'Test admin only',
                        outcome: 'All user roles need testing.',
                        experience: -10
                    },
                    {
                        text: 'Skip permission checks',
                        outcome: 'Permissions are security-critical.',
                        experience: -5
                    },
                    {
                        text: 'Use one account',
                        outcome: 'Different roles need verification.',
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
                title: 'Media Management',
                description: 'How do you test media management features?',
                options: [
                    {
                        text: 'Test upload, edit, delete functions with various file types and sizes',
                        outcome: 'Excellent! Comprehensive media testing is essential.',
                        experience: 25,
                        tool: 'Media Testing'
                    },
                    {
                        text: 'Only test uploads',
                        outcome: 'All media operations need testing.',
                        experience: -15
                    },
                    {
                        text: 'Skip file validation',
                        outcome: 'File validation is crucial.',
                        experience: -10
                    },
                    {
                        text: 'Test one file type',
                        outcome: 'Various formats need testing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Template Testing',
                description: 'How should you test CMS templates and themes?',
                options: [
                    {
                        text: 'Verify customization options, layout consistency, and content rendering',
                        outcome: 'Perfect! Template functionality is key.',
                        experience: 25,
                        tool: 'Template Validation'
                    },
                    {
                        text: 'Check default only',
                        outcome: 'All templates need testing.',
                        experience: -15
                    },
                    {
                        text: 'Skip layout checks',
                        outcome: 'Layout consistency important.',
                        experience: -10
                    },
                    {
                        text: 'Ignore customization',
                        outcome: 'Customization options crucial.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'SEO Features',
                description: 'What aspects of SEO features should be tested?',
                options: [
                    {
                        text: 'Meta tags, URLs, sitemaps, and other SEO tools provided by the CMS',
                        outcome: 'Excellent! SEO functionality is crucial.',
                        experience: 25,
                        tool: 'SEO Testing'
                    },
                    {
                        text: 'Only check titles',
                        outcome: 'All SEO features need testing.',
                        experience: -15
                    },
                    {
                        text: 'Skip meta tags',
                        outcome: 'Meta information important.',
                        experience: -10
                    },
                    {
                        text: 'Ignore sitemaps',
                        outcome: 'Sitemaps need verification.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Version Control',
                description: 'How do you test content version control?',
                options: [
                    {
                        text: 'Test save, revert, compare, and restore functionality for content changes',
                        outcome: 'Perfect! Version control ensures content safety.',
                        experience: 25,
                        tool: 'Version Testing'
                    },
                    {
                        text: 'Only test saving',
                        outcome: 'All version features needed.',
                        experience: -15
                    },
                    {
                        text: 'Skip restore tests',
                        outcome: 'Restoration crucial for recovery.',
                        experience: -10
                    },
                    {
                        text: 'Ignore comparisons',
                        outcome: 'Version comparison important.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Plugin Integration',
                description: 'How should you test CMS plugins and extensions?',
                options: [
                    {
                        text: 'Verify installation, functionality, compatibility, and interaction with core features',
                        outcome: 'Excellent! Plugin testing ensures stability.',
                        experience: 25,
                        tool: 'Plugin Testing'
                    },
                    {
                        text: 'Only test installation',
                        outcome: 'Full plugin testing needed.',
                        experience: -15
                    },
                    {
                        text: 'Skip compatibility',
                        outcome: 'Compatibility crucial.',
                        experience: -10
                    },
                    {
                        text: 'Ignore interactions',
                        outcome: 'Integration testing important.',
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
                title: 'Performance Testing',
                description: 'How do you test CMS performance?',
                options: [
                    {
                        text: 'Test load times, multiple users, heavy content, and system responsiveness',
                        outcome: 'Perfect! Performance impacts user experience.',
                        experience: 20,
                        tool: 'Performance Testing'
                    },
                    {
                        text: 'Only check speed',
                        outcome: 'Multiple aspects need testing.',
                        experience: -15
                    },
                    {
                        text: 'Skip load testing',
                        outcome: 'Load handling crucial.',
                        experience: -10
                    },
                    {
                        text: 'Ignore responsiveness',
                        outcome: 'Response time important.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Security Testing',
                description: 'What security aspects need testing in a CMS?',
                options: [
                    {
                        text: 'Test authentication, permissions, vulnerabilities, and data protection',
                        outcome: 'Excellent! Security is critical for CMS.',
                        experience: 20,
                        tool: 'Security Testing'
                    },
                    {
                        text: 'Only test login',
                        outcome: 'Comprehensive security needed.',
                        experience: -15
                    },
                    {
                        text: 'Skip vulnerability checks',
                        outcome: 'Vulnerability testing crucial.',
                        experience: -10
                    },
                    {
                        text: 'Ignore permissions',
                        outcome: 'Access control important.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Backup Testing',
                description: 'How do you test backup and recovery features?',
                options: [
                    {
                        text: 'Verify backup creation, storage, restoration, and data integrity',
                        outcome: 'Perfect! Data recovery is essential.',
                        experience: 20,
                        tool: 'Backup Testing'
                    },
                    {
                        text: 'Only test backups',
                        outcome: 'Recovery testing needed.',
                        experience: -15
                    },
                    {
                        text: 'Skip integrity checks',
                        outcome: 'Data integrity crucial.',
                        experience: -10
                    },
                    {
                        text: 'Ignore restoration',
                        outcome: 'Recovery verification important.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Multi-Environment Testing',
                description: 'How do you test CMS across different environments?',
                options: [
                    {
                        text: 'Test functionality across browsers, devices, and operating systems',
                        outcome: 'Excellent! Cross-environment testing ensures compatibility.',
                        experience: 20,
                        tool: 'Environment Testing'
                    },
                    {
                        text: 'Test one browser',
                        outcome: 'Multiple environments needed.',
                        experience: -15
                    },
                    {
                        text: 'Skip mobile testing',
                        outcome: 'Mobile compatibility crucial.',
                        experience: -10
                    },
                    {
                        text: 'Ignore OS differences',
                        outcome: 'OS compatibility important.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Integration Testing',
                description: 'How do you test CMS integration with other systems?',
                options: [
                    {
                        text: 'Test data flow, API connections, third-party services, and system interactions',
                        outcome: 'Perfect! Integration ensures system cohesion.',
                        experience: 20,
                        tool: 'Integration Testing'
                    },
                    {
                        text: 'Only test APIs',
                        outcome: 'All integrations need testing.',
                        experience: -15
                    },
                    {
                        text: 'Skip third-party tests',
                        outcome: 'External services crucial.',
                        experience: -10
                    },
                    {
                        text: 'Ignore data flow',
                        outcome: 'Data transfer important.',
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
        // End game if we've answered all questions or reached max XP
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
            } else {
                // Try loading from localStorage
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (parsed.progress) {
                        progress = parsed.progress;
                    }
                }
            }

            if (progress) {
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                
                // Fixed: Set current scenario to the next unanswered question
                this.player.currentScenario = this.player.questionHistory.length;

                // Update UI
                this.updateProgress();
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
            const hasProgress = await this.loadProgress();
            
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
        
        // Show level transition message at the start of each level
        const previousLevel = this.player.questionHistory.length > 0 ? 
            this.player.questionHistory[this.player.questionHistory.length - 1].scenario.level : null;
            
        if (this.player.currentScenario === 0 || previousLevel !== scenario.level) {
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = ''; // Clear any existing messages
                
                const levelMessage = document.createElement('div');
                levelMessage.className = 'level-transition';
                levelMessage.setAttribute('role', 'alert');
                levelMessage.textContent = `Starting ${scenario.level} Questions`;
                
                transitionContainer.appendChild(levelMessage);
                transitionContainer.classList.add('active');
                
                // Update the level indicator
                const levelIndicator = document.getElementById('level-indicator');
                if (levelIndicator) {
                    levelIndicator.textContent = `Level: ${scenario.level}`;
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

            // Save progress with current scenario (before incrementing)
            await this.saveProgress();

            // Also save quiz result and update display
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                const score = Math.round((this.player.experience / this.maxXP) * 100);
                await quizUser.updateQuizScore('communication', score);
                
                // Update progress display on index page
                const progressElement = document.querySelector('#communication-progress');
                if (progressElement) {
                    const totalQuestions = 15;
                    const completedQuestions = this.player.questionHistory.length;
                    const percentComplete = Math.round((completedQuestions / totalQuestions) * 100);
                    
                    // Only update if we're on the index page and this is the current user
                    const onIndexPage = window.location.pathname.endsWith('index.html');
                    if (onIndexPage) {
                        progressElement.textContent = `${percentComplete}% Complete`;
                        progressElement.classList.remove('hidden');
                        
                        // Update quiz item styling
                        const quizItem = document.querySelector('[data-quiz="communication"]');
                        if (quizItem) {
                            quizItem.classList.remove('completed', 'in-progress');
                            if (percentComplete === 100) {
                                quizItem.classList.add('completed');
                                progressElement.classList.add('completed');
                                progressElement.classList.remove('in-progress');
                            } else if (percentComplete > 0) {
                                quizItem.classList.add('in-progress');
                                progressElement.classList.add('in-progress');
                                progressElement.classList.remove('completed');
                            }
                        }
                    }
                }
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
            recommendationsHTML += '<p>🌟 Excellent performance! Here are some ways to further enhance your skills:</p>';
        } else if (score >= 60) {
            recommendationsHTML += '<p>👍 Good effort! Here are some areas to focus on:</p>';
        } else {
            recommendationsHTML += '<p>📚 Here are key areas for improvement:</p>';
        }

        recommendationsHTML += '<ul>';

        // Add recommendations for weak areas
        weakAreas.forEach(area => {
            recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
        });

        // If there are strong areas but still room for improvement
        if (strongAreas.length > 0 && score < 100) {
            recommendationsHTML += '<li>Continue practicing your strengths in: ' + 
                strongAreas.join(', ') + '</li>';
        }

        // Add general recommendations based on score
        if (score < 70) {
            recommendationsHTML += `
                <li>Review the communication best practices documentation</li>
                <li>Practice active listening techniques</li>
                <li>Focus on clear and concise messaging</li>
            `;
        }

        recommendationsHTML += '</ul>';
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

// Initialize quiz on page load
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new CMS_Testing_Quiz();
    quiz.startGame();
});