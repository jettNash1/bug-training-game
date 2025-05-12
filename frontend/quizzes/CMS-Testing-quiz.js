import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class CMS_Testing_Quiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a CMS Testing expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong CMS Testing skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing CMS Testing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'cms-testing',
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
                title: 'Understanding content management systems',
                description: 'What is the primary purpose of a CMS (Content Management System)?',
                options: [
                    {
                        text: 'It allows users to create, manage, and modify digital content without specialised technical knowledge',
                        outcome: 'Perfect! This is the core purpose of a content management system.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Content Management System Fundamentals'
                    },
                    {
                        text: 'To write code to display content on the front end of a website',
                        outcome: 'content management system is for content management by non-technical users.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'It is used for file storage that can be accessed and downloaded for use on external websites',
                        outcome: 'content management system has broader content management capabilities including, publishing content and Search Engine Optimisation management.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'For website hosting through content management system features management',
                        outcome: 'Content management system manages content across different platforms.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'CRUD Testing Basics',
                description: 'What are the essential components of CRUD testing in a content management system?',
                options: [
                    {
                        text: 'Create, read, update, and delete functionality checks for content management',
                        outcome: 'Excellent! These are the fundamental CRUD operations.',
                        experience: 15,
                        tool: 'CRUD Testing'
                    },
                    {
                        text: 'Content creation and content update functionality',
                        outcome: 'All CRUD operations need testing, not just the creation function.',
                        experience: -5
                    },
                    {
                        text: 'The detail component within the content management system functionality',
                        outcome: 'There is no specific "Detail Component" to test, although detail would fall under Creation and Update testing.',
                        experience: -10
                    },
                    {
                        text: 'Review component within the content management system functionality',
                        outcome: 'There is no specific "Review Component" to test, although review would fall under Creation, Update and Read testing.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Test Planning',
                description: 'What should you do before starting content management system testing?',
                options: [
                    {
                        text: 'Review documentation, understand content management system architecture, and define testing objectives',
                        outcome: 'Perfect! Preparation ensures effective testing.',
                        experience: 15,
                        tool: 'Test Planning'
                    },
                    {
                        text: 'Begin testing straight away to make sure timeline management is kept on course',
                        outcome: 'Planning is crucial for effective testing as required scope could be missed.',
                        experience: -10
                    },
                    {
                        text: 'Skim read submitted documentation submitted by the client to keep in line with any time constraints',
                        outcome: 'Documentation must be carefully reviewed as this provides crucial context to the project.',
                        experience: -5
                    },
                    {
                        text: 'Test all features with an approach based on tester preference.',
                        outcome: 'A structured approach is required as some areas and functionality may yet not be in a "Development Complete" state.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Content Types',
                description: 'What content types should be tested in a content management system?',
                options: [
                    {
                        text: 'Text, images, videos, audio, and other media supported by the system',
                        outcome: 'Excellent! All supported content types need testing.',
                        experience: 15,
                        tool: 'Content Management'
                    },
                    {
                        text: 'Text, images, videos must be tested and verified',
                        outcome: 'All content types need verification including audio and any other supported media.',
                        experience: -10
                    },
                    {
                        text: 'Media testing can be deemed as low priority as long as text is displayed correctly on the front end',
                        outcome: 'Media handling is a crucial component of a content management system.',
                        experience: -5
                    },
                    {
                        text: 'Testing two types of content is sufficient coverage as content management system functionality will generally perform the same across all content',
                        outcome: 'Comprehensive testing of all supported content types is required as functionality is different for different types of content.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'User Roles',
                description: 'How should you test content management system user roles and permissions?',
                options: [
                    {
                        text: 'Verify access levels, permissions, and restrictions for different user types',
                        outcome: 'Perfect! Role-based access control is crucial.',
                        experience: 15,
                        tool: 'Permission Testing'
                    },
                    {
                        text: 'As long as admin permissions behave as intended, other access levels can be left out of testing activities',
                        outcome: 'All user roles need testing as user access level is critical.',
                        experience: -10
                    },
                    {
                        text: 'Permission checks do not need testing once user access level testing is confirmed',
                        outcome: 'While user access level is closely linked to permission levels. These still need thoroughly testing for each user as they are security critical.',
                        experience: -5
                    },
                    {
                        text: 'Use one account with one access permission',
                        outcome: 'Different roles need verification and can be achieved by granting access to one user or using multiple users with different access.',
                        experience: 0
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10)
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
                        experience: 20,
                        tool: 'Media Testing'
                    },
                    {
                        text: 'Test media uploads as this is sufficient for general media management',
                        outcome: 'All media operations need testing.',
                        experience: -15
                    },
                    {
                        text: 'By not including file validation as this does not need to be tested as long as one file type can be uploaded to the content management system',
                        outcome: 'Validation of all supported file types is crucial as all file types have different properties.',
                        experience: -10
                    },
                    {
                        text: 'Test one media type as the content management system will perform the same functionality for all media types',
                        outcome: 'Validation of all supported media is essential as all media types have different properties.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Template Testing',
                description: 'How should you test content management system templates and themes?',
                options: [
                    {
                        text: 'Verify customisation options, layout consistency, and content rendering',
                        outcome: 'Perfect! Template functionality is key.',
                        experience: 20,
                        tool: 'Template Validation'
                    },
                    {
                        text: 'Check the default settings for templates within the content management system',
                        outcome: 'All templates require extensive layout and setting testing.',
                        experience: -15
                    },
                    {
                        text: "Don't check layout consistency as long as the default settings for one template is displayed correctly",
                        outcome: 'Layout consistency is crucial for all templates and settings.',
                        experience: -10
                    },
                    {
                        text: 'Leave customisation testing as this is not deemed critical if the default settings are correctly displayed',
                        outcome: 'Customisation option testing is essential for any type of template testing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'SEO Features',
                description: 'What aspects of the Search Engine Optimisation features should be tested?',
                options: [
                    {
                        text: 'Meta tags, URLs, sitemaps, and other SEO tools provided by the content management system',
                        outcome: 'Excellent! SEO functionality is crucial.',
                        experience: 20,
                        tool: 'SEO Testing'
                    },
                    {
                        text: 'URLs and Meta tags should be tested',
                        outcome: 'All SEO features need testing not just a select few as critical issues could be missed.',
                        experience: -15
                    },
                    {
                        text: 'Do not test meta tags as long as URLs are picked up correctly',
                        outcome: 'Meta information is an essential part of gathering information for SEO.',
                        experience: -10
                    },
                    {
                        text: 'Sitemaps can be left out of test plans as long as general site navigation does not return any functional issues',
                        outcome: 'Sitemaps are an essential part of gathering information for SEO and require validation.',
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
                        experience: 20,
                        tool: 'Version Testing'
                    },
                    {
                        text: 'Test the save functionality of content within the content management system',
                        outcome: 'All features related to a version of the system are required.',
                        experience: -15
                    },
                    {
                        text: "Don't test restore functionality as this not needed if the save functionality is correct",
                        outcome: 'Restoration is crucial between versions of the content management system as some saved content may not display on updated versions.',
                        experience: -10
                    },
                    {
                        text: 'Version comparison is not required if the save functionality is correctly updated on the current version',
                        outcome: 'Comparison is essential between versions of the content management system when manipulating content.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Plugin Integration',
                description: 'How should you test content management system plugins and extensions?',
                options: [
                    {
                        text: 'Verify installation, functionality, compatibility, and interaction with core features',
                        outcome: 'Excellent! Plugin testing ensures stability.',
                        experience: 20,
                        tool: 'Plugin Testing'
                    },
                    {
                        text: 'Test installation verification as this is sufficient for plug in testing',
                        outcome: 'Full plugin testing including all features it provides is required.',
                        experience: -15
                    },
                    {
                        text: 'Test compatibility of the plugin across different content management system versions is not essential as long as installation can be achieved',
                        outcome: 'Compatibility is crucial as users may be using different versions of the content management system.',
                        experience: -10
                    },
                    {
                        text: 'By employing minimal testing of functional interaction',
                        outcome: 'Interaction testing is important and should be thoroughly tested relating to priority and user impact.',
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
                title: 'Performance Testing',
                description: 'How do you test content management system performance?',
                options: [
                    {
                        text: 'Test load times, multiple users, heavy content, and system responsiveness',
                        outcome: 'Perfect! Performance impacts user experience.',
                        experience: 25,
                        tool: 'Performance Testing'
                    },
                    {
                        text: 'Check response time for newly updated content',
                        outcome: 'All aspects of performance testing are essential and require testing.',
                        experience: -15
                    },
                    {
                        text: 'By not including load testing if the content management system is not to be used extensively',
                        outcome: 'Load handling is crucial regardless of initial known usage as this can fluctuate.',
                        experience: -10
                    },
                    {
                        text: 'By minimizing responsiveness testing as long as the functionality eventually updates as required',
                        outcome: 'Response time is crucial, as users can attempt to perform other functions whilst the initial request is still yet to respond, in turn causing issues.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Security Testing',
                description: 'What security aspects need testing in a content management system?',
                options: [
                    {
                        text: 'Test authentication, permissions, vulnerabilities, and data protection',
                        outcome: 'Excellent! Security is critical for content management systems.',
                        experience: 25,
                        tool: 'Security Testing'
                    },
                    {
                        text: 'The user credential login function as is sufficient for security testing',
                        outcome: 'Login testing is just one aspect of content management system security.',
                        experience: -15
                    },
                    {
                        text: 'Vulnerability testing requires testing, although this is of low priority and can be left out of planning',
                        outcome: 'Vulnerability testing crucial for content management system testing as this exposes weaknesses in the system.',
                        experience: -10
                    },
                    {
                        text: 'Minimal permissions testing as long as admin users have the correct access',
                        outcome: 'Access controls are important for all user permission levels.',
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
                        experience: 25,
                        tool: 'Backup Testing'
                    },
                    {
                        text: 'Test that backups are stored correctly and in order',
                        outcome: 'Other aspects of back up testing are required including restoration of a back up.',
                        experience: -15
                    },
                    {
                        text: 'Leave integrity checks in accordance with time constraints as these are of a low priority as long as restoration can be performed',
                        outcome: 'Data integrity is a crucial part of back up, as data needs to remain consistent throughout the process.',
                        experience: -10
                    },
                    {
                        text: "Don't test restoration as long as the back up is stored correctly",
                        outcome: 'Recovery verification is essential to the back up process.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Multi-Environment Testing',
                description: 'How do you test a content management system across different environments?',
                options: [
                    {
                        text: 'Test functionality across browsers, devices, and operating systems',
                        outcome: 'Excellent! Cross-environment testing ensures compatibility.',
                        experience: 25,
                        tool: 'Environment Testing'
                    },
                    {
                        text: 'Test one browser across multiple devices as this is sufficient',
                        outcome: 'Multiple environments are required including different browsers and devices.',
                        experience: -15
                    },
                    {
                        text: 'Test on desktop environments only as content management systems are generally not used on mobile devices',
                        outcome: 'Mobile compatibility is supported by content management systems and is also a crucial element in environment checks.',
                        experience: -10
                    },
                    {
                        text: 'Ignore operating system differences as long as browser and device tests have been performed',
                        outcome: 'Operating system compatibility is important regardless of browser and device checks.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Integration Testing',
                description: 'How do you test a content management system integration with other systems?',
                options: [
                    {
                        text: 'Test data flow, API connections, third-party services, and system interactions',
                        outcome: 'Perfect! Integration ensures system cohesion.',
                        experience: 25,
                        tool: 'Integration Testing'
                    },
                    {
                        text: 'Test Application Programme Interface connection features',
                        outcome: 'All supported integration functionality require thorough testing.',
                        experience: -15
                    },
                    {
                        text: 'Third-party tests are not needed as they have not directly been developed by the content management system provider',
                        outcome: 'External services are a crucial part to content management system testing and any supported integrations within scope mist be tested.',
                        experience: -10
                    },
                    {
                        text: 'Data flow testing is of low priority and can be left out of planning and execution',
                        outcome: 'Data transfer essential and must be tested as it directly affects the integrity of the content within the content management system.',
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

        const scorePercentage = this.calculateScorePercentage();
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

        if (scorePercentage >= 90 && weakAreas.length === 0) {
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of CMS Testing. You clearly understand the nuances of CMS Testing and are well-equipped to handle any CMS Testing challenges!</p>';
        } else if (scorePercentage >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your CMS Testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
            recommendationsHTML += '<ul>';
            if (weakAreas.length > 0) {
                weakAreas.forEach(area => {
                    recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
                });
            }
            recommendationsHTML += '</ul>';
        } else if (scorePercentage >= 70) {
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

        if (title.includes('cms testing') || description.includes('cms testing')) {
            return 'CMS Testing Fundamentals';
        } else if (title.includes('content management') || description.includes('content management')) {
            return 'Content Management Concepts'; 
        } else if (title.includes('workflow') || description.includes('workflow')) {
            return 'CMS Workflow Testing';
        } else if (title.includes('integration') || description.includes('integration')) {
            return 'CMS Integration Testing';
        } else if (title.includes('performance') || description.includes('performance')) {
            return 'CMS Performance Testing';
        } else if (title.includes('security') || description.includes('security')) {
            return 'CMS Security Testing';
        } else if (title.includes('usability') || description.includes('usability')) {
            return 'CMS Usability Testing';
        } else if (title.includes('migration') || description.includes('migration')) {
            return 'Content Migration Testing';
        } else if (title.includes('plugins') || description.includes('plugins')) {
            return 'Plugin Testing';
        } else {
            return 'General CMS Concepts';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'CMS Testing Fundamentals': 'Review core CMS testing principles and methodologies specific to content management systems.',
            'Content Management Concepts': 'Strengthen understanding of content workflows, versioning, and publishing mechanisms.',
            'CMS Workflow Testing': 'Focus on testing content creation, approval, and publishing workflows in CMS systems.',
            'CMS Integration Testing': 'Improve knowledge of testing CMS integrations with other systems and third-party services.',
            'CMS Performance Testing': 'Develop better understanding of performance testing for content delivery and system responsiveness.',
            'CMS Security Testing': 'Enhance knowledge of security testing practices specific to content management systems.',
            'CMS Usability Testing': 'Focus on testing user experience and content editor interfaces in CMS platforms.',
            'Content Migration Testing': 'Strengthen understanding of content migration testing between different CMS systems.',
            'Plugin Testing': 'Improve knowledge of testing CMS plugins and extensions for compatibility and functionality.',
            'General CMS Concepts': 'Continue developing fundamental understanding of CMS architecture and functionality.'
        };

        return recommendations[area] || 'Continue practicing core CMS testing principles and methodologies.';
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
        const variations = [
            quizName,                                              // original
            quizName.toLowerCase(),                               // lowercase
            quizName.toUpperCase(),                               // uppercase
            quizName.replace(/-/g, ''),                           // no hyphens
            quizName.replace(/([A-Z])/g, '-$1').toLowerCase(),    // kebab-case
            quizName.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), // camelCase
            quizName.replace(/-/g, '_'),                          // snake_case
        ];

        // Add CMS-Testing specific variations
        if (quizName.toLowerCase().includes('cms-testing')) {
            variations.push(
                'CMS-Testing',
                'cms-testing',
                'cmsTestingTest',
                'CMS_Testing',
                'cms_testing'
            );
        }

        variations.forEach(variant => {
            localStorage.removeItem(`quiz_progress_${username}_${variant}`);
            localStorage.removeItem(`quizResults_${username}_${variant}`);
        });
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('[CMS-TestingQuiz] Initializing quiz');
    
    // Force clean any existing quiz references that might be in memory
    if (window.currentQuiz) {
        console.log('[CMS-TestingQuiz] Cleaning up existing quiz instance:', window.currentQuiz.quizName);
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
                console.log(`[CMS-TestingQuiz] Found potential conflicting quiz data: ${quizName}`);
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.data && parsed.data.randomizedScenarios) {
                        console.log(`[CMS-TestingQuiz] Cleaning randomized scenarios from ${quizName}`);
                        delete parsed.data.randomizedScenarios;
                        localStorage.setItem(key, JSON.stringify(parsed));
                    }
                } catch (e) {
                    console.error(`[CMS-TestingQuiz] Error cleaning scenarios:`, e);
                }
            }
        });
    }
    
    // Create a new instance and keep a global reference
    const quiz = new CMS_Testing_Quiz();
    window.currentQuiz = quiz;
    
    // Add a specific property to identify this quiz
    Object.defineProperty(window, 'ACTIVE_QUIZ_NAME', {
        value: 'cms-testing',
        writable: true,
        configurable: true
    });
    
    // Force clear any unrelated randomized scenarios
    if (quiz.randomizedScenarios) {
        // Keep only keys specific to this quiz
        Object.keys(quiz.randomizedScenarios).forEach(key => {
            if (!key.startsWith('cms-testing_')) {
                console.log(`[CMS-TestingQuiz] Removing unrelated randomized scenario: ${key}`);
                delete quiz.randomizedScenarios[key];
            }
        });
    }
    
    // Start the quiz
    console.log('[CMS-TestingQuiz] Starting quiz');
    quiz.startGame();
}); 