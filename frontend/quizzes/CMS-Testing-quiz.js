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
                        tool: 'Content Management System Fundamentals'
                    },
                    {
                        text: 'To write code to display content on the front end of a website',
                        outcome: 'content management system is for content management by non-technical users.',
                        experience: -5
                    },
                    {
                        text: 'It is used for file storage that can be accessed and downloaded for use on external websites',
                        outcome: 'content management system has broader content management capabilities including, publishing content and Search Engine Optimisation management.',
                        experience: -10
                    },
                    {
                        text: 'For website hosting through content management system features management',
                        outcome: 'Content management system manages content across different platforms.',
                        experience: 0
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

    shouldEndGame() {
        // End game if we've answered all questions
        return this.player.questionHistory.length >= 15;
    }

    async saveProgress() {
        // First determine the status based on completion criteria only
        let status = 'in-progress';
        
        // Check for completion (all 15 questions answered)
        if (this.player.questionHistory.length >= 15) {
            // Calculate pass/fail based on correct answers
            const correctAnswers = this.player.questionHistory.filter(q => 
                q.selectedAnswer && this.isCorrectAnswer(q.selectedAnswer)
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
                    q.selectedAnswer && this.isCorrectAnswer(q.selectedAnswer)
                ).length / 15) * 100)
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
        try {
            console.log('Initializing event listeners');
            
            // Add event listeners for the continue and restart buttons
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) {
                // Remove any existing listeners by cloning and replacing
                const newBtn = continueBtn.cloneNode(true);
                continueBtn.parentNode.replaceChild(newBtn, continueBtn);
                
                // Add fresh event listener
                newBtn.addEventListener('click', () => {
                    console.log('Continue button clicked from event listener');
                    this.nextScenario();
                });
                console.log('Added event listener to continue button');
            }
            
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => this.restartGame());
                console.log('Added event listener to restart button');
            }
            
            // Add form submission handler
            const optionsForm = document.getElementById('options-form');
            if (optionsForm) {
                optionsForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleAnswer();
                });
                console.log('Added event listener to options form');
            }
            
            // Add submit button click handler
            const submitButton = document.querySelector('.submit-button');
            if (submitButton) {
                submitButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleAnswer();
                });
                console.log('Added event listener to submit button');
            }
            
            // Add keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target.type === 'radio') {
                    this.handleAnswer();
                }
            });
            console.log('Added keyboard navigation event listeners');
            
        } catch (error) {
            console.error('Error initializing event listeners:', error);
        }
    }

    displayScenario() {
        try {
            console.log('displayScenario called');
            
            // Check if player and currentScenario are properly initialized
            if (!this.player || typeof this.player.currentScenario !== 'number') {
                console.error('Player or currentScenario not properly initialized');
                return;
            }
            
            // Check if we've answered all 15 questions
            if (this.player.questionHistory.length >= 15) {
                console.log('All 15 questions answered, ending game');
                this.endGame();
                return;
            }
            
            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
                console.log('Timer cleared in displayScenario');
            }
            
            console.log('Getting current scenarios...');
            const currentScenarios = this.getCurrentScenarios();
            console.log('Current scenarios:', currentScenarios);
            
            if (!currentScenarios || !Array.isArray(currentScenarios)) {
                console.error('Could not get current scenarios', currentScenarios);
                return;
            }
            
            const scenario = currentScenarios[this.player.currentScenario];
            console.log('Current scenario index:', this.player.currentScenario);
            console.log('Retrieved scenario:', scenario);
            
            // Check if the current scenario exists
            if (!scenario) {
                console.log('No more scenarios in this level, transitioning to next level');
                
                // Reset currentScenario for the next level
                this.player.currentScenario = 0;
                
                // Get the next level scenarios
                const updatedScenarios = this.getCurrentScenarios();
                if (!updatedScenarios || !updatedScenarios[0]) {
                    console.error('Could not find scenarios for next level');
                    this.endGame();
                    return;
                }
                
                // Display the first scenario of the next level
                const nextScenario = updatedScenarios[0];
                this.displayScenarioContent(nextScenario);
                console.log('Displaying first scenario of next level');
                return;
            }
            
            // Display the current scenario
            console.log('Displaying current scenario:', scenario.title);
            this.displayScenarioContent(scenario);
        } catch (error) {
            console.error('Error displaying scenario:', error);
            this.showError('An error occurred displaying the scenario. Please try reloading the page.');
        }
    }
    
    // Helper method to display scenario content
    displayScenarioContent(scenario) {
        try {
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
            
            console.log('Scenario content displayed, timer initialized');
        } catch (error) {
            console.error('Error displaying scenario content:', error);
        }
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
            this.questionTimer = null;
            console.log('Timer cleared in handleAnswer');
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

            // Update player state (still track experience for backward compatibility)
            if (typeof this.player.experience === 'number') {
                this.player.experience = Math.max(0, Math.min(this.maxXP || 300, this.player.experience + (selectedAnswer.experience || 0)));
            }
            
            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;
            
            // Add to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: this.isCorrectAnswer(selectedAnswer),
                timeSpent: timeSpent
            });

            // Increment current scenario
            this.player.currentScenario++;

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
                        score: Math.round((this.player.questionHistory.filter(q => this.isCorrectAnswer(q.selectedAnswer)).length / Math.min(this.player.questionHistory.length, 15)) * 100),
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

            // Show outcome screen
            this.displayOutcome(selectedAnswer);
            
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
            
            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
                console.log('Timer cleared in nextScenario');
            }
            
            // IMPORTANT: Get actual DOM elements directly
            const outcomeScreen = document.getElementById('outcome-screen');
            const gameScreen = document.getElementById('game-screen');
            
            console.log('Game screen element:', gameScreen);
            console.log('Outcome screen element:', outcomeScreen);
            
            // Hide outcome screen using multiple approaches to ensure it works
            if (outcomeScreen) {
                outcomeScreen.classList.add('hidden');
                outcomeScreen.style.display = 'none';
                console.log('Hidden outcome screen');
            }
            
            // Show game screen using multiple approaches to ensure it works
            if (gameScreen) {
                gameScreen.classList.remove('hidden');
                gameScreen.style.display = 'block';
                console.log('Shown game screen');
            }
            
            // Display the next scenario
            this.displayScenario();
            
            // Re-initialize event listeners for the new question
            this.initializeEventListeners();
            
            // Force a layout refresh
            window.setTimeout(() => {
                if (gameScreen) {
                    gameScreen.style.display = 'none';
                    window.setTimeout(() => {
                        gameScreen.style.display = 'block';
                        console.log('Forced layout refresh');
                    }, 10);
                }
            }, 10);
        } catch (error) {
            console.error('Error in nextScenario:', error);
            this.showError('An error occurred while loading the next question.');
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
            
            // Determine level based solely on question count
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

        const correctAnswers = this.player.questionHistory.filter(q => 
            this.isCorrectAnswer(q.selectedAnswer)
        ).length;
        const score = Math.round((correctAnswers / this.player.questionHistory.length) * 100);
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            const isCorrect = this.isCorrectAnswer(record.selectedAnswer);
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of CMS Testing. You clearly understand the nuances of CMS Testing and are well-equipped to handle any CMS Testing challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your CMS Testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('crud') || description.includes('crud')) {
            return 'CRUD Operations';
        } else if (title.includes('media') || description.includes('media')) {
            return 'Media Management';
        } else if (title.includes('template') || description.includes('template')) {
            return 'Template Testing';
        } else if (title.includes('seo') || description.includes('seo')) {
            return 'SEO Features';
        } else if (title.includes('version') || description.includes('version')) {
            return 'Version Control';
        } else if (title.includes('security') || description.includes('security')) {
            return 'Security Testing';
        } else if (title.includes('backup') || description.includes('backup')) {
            return 'Backup Management';
        } else if (title.includes('environment') || description.includes('environment')) {
            return 'Multi-Environment Testing';
        } else if (title.includes('integration') || description.includes('integration')) {
            return 'Integration Testing';
        } else {
            return 'General CMS Testing';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'CRUD Operations': 'Focus on comprehensive testing of Create, Read, Update, and Delete operations for all content types.',
            'Media Management': 'Strengthen testing of media upload, storage, manipulation, and delivery across different file types.',
            'Template Testing': 'Improve validation of template customization, rendering, and consistency across different content types.',
            'SEO Features': 'Enhance testing of meta tags, URLs, sitemaps, and other SEO-related functionality.',
            'Version Control': 'Focus on thorough testing of content versioning, comparison, and restoration features.',
            'Security Testing': 'Develop comprehensive testing of authentication, permissions, and vulnerability assessments.',
            'Backup Management': 'Strengthen testing of backup creation, storage, and restoration processes.',
            'Multi-Environment Testing': 'Improve cross-browser, cross-device, and cross-platform testing strategies.',
            'Integration Testing': 'Focus on testing integrations with APIs, third-party services, and external systems.',
            'General CMS Testing': 'Continue developing fundamental CMS testing principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core CMS testing principles.';
    }

    async endGame() {
        // Calculate final score based on correct answers
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && this.isCorrectAnswer(q.selectedAnswer)
        ).length;
        const scorePercentage = Math.round((correctAnswers / 15) * 100);
        
        // Create the final progress object
        const progress = {
            questionsAnswered: 15, // Always 15 at the end
            questionHistory: this.player.questionHistory,
            currentScenario: this.player.currentScenario,
            status: scorePercentage >= 70 ? 'passed' : 'failed',
            scorePercentage: scorePercentage,
            lastUpdated: new Date().toISOString()
        };

        try {
            // Hide the timer container
            const timerContainer = document.getElementById('timer-container');
            if (timerContainer) {
                timerContainer.style.display = 'none';
            }
            
            // Hide game and outcome screens, show end screen
            if (this.gameScreen) {
                this.gameScreen.classList.add('hidden');
                this.gameScreen.style.display = 'none';
            }
            
            if (this.outcomeScreen) {
                this.outcomeScreen.classList.add('hidden');
                this.outcomeScreen.style.display = 'none';
            }
            
            if (this.endScreen) {
                this.endScreen.classList.remove('hidden');
                this.endScreen.style.display = 'block';
            }
            
            // Update progress display to show 15/15
            const questionInfoElement = document.querySelector('.question-info');
            if (questionInfoElement) {
                questionInfoElement.textContent = 'Question: 15/15';
            }
            
            // Update legacy progress elements if they exist
            const questionProgress = document.getElementById('question-progress');
            if (questionProgress) {
                questionProgress.textContent = 'Question: 15/15';
            }
            
            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
            }
            
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
                this.player.experience, // Keep experience for backward compatibility
                this.player.tools,
                this.player.questionHistory,
                15, // Always 15 questions completed
                scorePercentage >= 70 ? 'passed' : 'failed'
            );
            
            // Update display elements
            const finalScoreElement = document.getElementById('final-score');
            if (finalScoreElement) {
                finalScoreElement.textContent = `Final Score: ${scorePercentage}%`;
            }
            
            // Show the end screen
            const quizCompleteHeader = document.querySelector('#end-screen h2');
            if (quizCompleteHeader) {
                quizCompleteHeader.textContent = scorePercentage >= 70 ? 'Quiz Complete!' : 'Quiz Failed!';
            }
            
            const performanceSummary = document.getElementById('performance-summary');
            if (performanceSummary) {
                if (scorePercentage >= 70) {
                    // Find the appropriate threshold message
                    const threshold = this.performanceThresholds.find(t => t.threshold <= scorePercentage);
                    if (threshold) {
                        performanceSummary.textContent = threshold.message;
                    } else {
                        performanceSummary.textContent = 'Quiz completed successfully!';
                    }
                } else {
                    performanceSummary.textContent = 'Quiz failed. You did not meet the minimum required score. You can try this quiz again.';
                    
                    // Hide restart button if failed
                    const restartBtn = document.getElementById('restart-btn');
                    if (restartBtn) {
                        restartBtn.style.display = 'none';
                    }
                }
            }

            // Generate question review list without XP references
            const reviewList = document.getElementById('question-review');
            if (reviewList) {
                reviewList.innerHTML = ''; // Clear existing content
                
                this.player.questionHistory.forEach((record, index) => {
                    const reviewItem = document.createElement('div');
                    reviewItem.className = 'review-item';
                    
                    const isCorrect = this.isCorrectAnswer(record.selectedAnswer);
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

            // Generate recommendations
            this.generateRecommendations();
        } catch (error) {
            console.error('Failed to save final progress:', error);
            this.showError('Failed to save your results. Please try again.');
        }
    }

    isCorrectAnswer(answer) {
        // Helper method to consistently determine if an answer is correct
        return answer && (answer.isCorrect || answer.experience > 0);
    }

    displayOutcome(selectedAnswer) {
        if (!selectedAnswer) {
            console.error('No answer selected');
            return;
        }

        try {
            const currentScenarios = this.getCurrentScenarios();
            if (!currentScenarios || !this.player || this.player.currentScenario === undefined) {
                console.error('No current scenario found');
                return;
            }
            
            const scenario = currentScenarios[this.player.currentScenario - 1]; // Use the scenario we just answered
            if (!scenario) {
                console.error('Current scenario not found');
                return;
            }
            
            const earnedXP = selectedAnswer.experience || 0;
            
            // Find the max possible XP for this scenario
            const maxXP = Math.max(...scenario.options.map(o => o.experience || 0));
            const isCorrect = selectedAnswer.isCorrect || (earnedXP === maxXP);
            
            console.log('Displaying outcome:', { 
                isCorrect, 
                selectedAnswer, 
                scenario: scenario.title 
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
                // Create fresh HTML content
                outcomeContent.innerHTML = `
                    <h3>${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                    <p>${selectedAnswer.outcome || ''}</p>
                    <p class="result">${isCorrect ? 'Correct answer!' : 'Try again next time.'}</p>
                    <button id="continue-btn" class="submit-button">Continue</button>
                `;
                
                // Immediately add event listener to the new button
                const continueBtn = outcomeContent.querySelector('#continue-btn');
                if (continueBtn) {
                    console.log('Adding event listener to continue button');
                    continueBtn.addEventListener('click', () => {
                        console.log('Continue button clicked');
                        this.nextScenario();
                    });
                }
            } else {
                // If no outcomeContent found, try individual elements as fallback
                console.error('Could not find outcome content element, trying individual elements');
                
                // Update individual elements
                const outcomeText = document.getElementById('outcome-text');
                const resultText = document.getElementById('result-text');
                
                if (outcomeText) {
                    outcomeText.textContent = selectedAnswer.outcome || '';
                }
                
                if (resultText) {
                    resultText.textContent = isCorrect ? 'Correct!' : 'Incorrect';
                    resultText.className = isCorrect ? 'correct' : 'incorrect';
                }
                
                // Ensure tool display is updated if present
                const toolElement = document.getElementById('tool-gained');
                if (toolElement) {
                    if (selectedAnswer.tool) {
                        toolElement.textContent = `Tool acquired: ${selectedAnswer.tool}`;
                        if (this.player && !this.player.tools.includes(selectedAnswer.tool)) {
                            this.player.tools.push(selectedAnswer.tool);
                        }
                    } else {
                        toolElement.textContent = '';
                    }
                }
                
                // Hide XP information
                const xpGained = document.getElementById('xp-gained');
                if (xpGained) {
                    xpGained.style.display = 'none';
                }
                
                // Ensure we have a continue button and it has the right event listener
                const continueBtn = document.getElementById('continue-btn');
                if (!continueBtn) {
                    // Try to create a continue button if it doesn't exist
                    const outcomeActions = document.querySelector('.outcome-actions');
                    if (outcomeActions) {
                        outcomeActions.innerHTML = '<button id="continue-btn" class="submit-button">Continue</button>';
                    }
                }
                
                // Add event listener to the continue button (whether it existed or we created it)
                const newContinueBtn = document.getElementById('continue-btn');
                if (newContinueBtn) {
                    // Remove any existing event listeners by cloning and replacing
                    const newBtn = newContinueBtn.cloneNode(true);
                    if (newContinueBtn.parentNode) {
                        newContinueBtn.parentNode.replaceChild(newBtn, newContinueBtn);
                    }
                    
                    // Add fresh event listener
                    newBtn.addEventListener('click', () => {
                        console.log('Continue button clicked');
                        this.nextScenario();
                    });
                }
            }
            
            // Update progress
            this.updateProgress();
        } catch (error) {
            console.error('Error in displayOutcome:', error);
            this.showError('An error occurred. Please try again.');
        }
    }

    initializeTimer() {
        // Clear any existing timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }

        // Set default timer value if not set
        if (!this.timePerQuestion) {
            this.timePerQuestion = 30;
            console.log('[Quiz] Using default timer value:', this.timePerQuestion);
        }

        // Reset remaining time
        this.remainingTime = this.timePerQuestion;
        this.questionStartTime = Date.now();

        // Update timer display
        const timerContainer = document.getElementById('timer-container');
        if (timerContainer) {
            timerContainer.textContent = `Time remaining: ${this.remainingTime}s`;
        }

        // Start the countdown
        this.questionTimer = setInterval(() => {
            this.remainingTime--;
            
            // Update timer display
            if (timerContainer) {
                timerContainer.textContent = `Time remaining: ${this.remainingTime}s`;
                
                // Add warning class when time is running low
                if (this.remainingTime <= 5) {
                    timerContainer.classList.add('timer-warning');
                } else {
                    timerContainer.classList.remove('timer-warning');
                }
            }

            // Check if time is up
            if (this.remainingTime <= 0) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
                this.handleTimeUp();
            }
        }, 1000);
    }

    // Handle time up situation
    handleTimeUp() {
        console.log('Time up! Auto-submitting answer');
        
        try {
            // Get current scenario
            const currentScenarios = this.getCurrentScenarios();
            if (!currentScenarios || !this.player) {
                console.error('Invalid state in handleTimeUp');
                return;
            }
            
            const scenario = currentScenarios[this.player.currentScenario];
            if (!scenario) {
                console.error('No current scenario found in handleTimeUp');
                return;
            }
            
            // Create a timeout answer
            const timeoutAnswer = {
                text: 'Time ran out!',
                experience: 0,
                isCorrect: false,
                isTimeout: true,
                outcome: 'You did not answer in time.'
            };
            
            // Update player state
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: timeoutAnswer,
                isCorrect: false,
                isTimeout: true
            });
            
            // Increment current scenario
            this.player.currentScenario++;
            
            // Save progress
            this.saveProgress().catch(error => {
                console.error('Failed to save timeout progress:', error);
            });
            
            // Display the timeout outcome
            this.displayOutcome(timeoutAnswer);
        } catch (error) {
            console.error('Error handling time up:', error);
        }
    }
}

// Initialize quiz on page load
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new CMS_Testing_Quiz();
    quiz.startGame();
});