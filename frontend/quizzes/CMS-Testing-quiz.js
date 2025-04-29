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

    shouldEndGame() {
        // End game if we've answered all questions
        return this.player.questionHistory.length >= this.totalQuestions;
    }

    calculateScorePercentage() {
        // Calculate percentage based on correct answers
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && q.isCorrect === true
        ).length;
        
        // Cap the questions answered at total questions
        const questionsAnswered = Math.min(this.player.questionHistory.length, this.totalQuestions);
        
        return questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
    }

    async saveProgress() {
        // Determine the status based on clear conditions
        let status = 'in-progress';
        
        // Check for completion (all questions answered)
        if (this.player.questionHistory.length >= this.totalQuestions) {
            // Calculate percentage score
            const scorePercentage = this.calculateScorePercentage();
            status = scorePercentage >= this.passPercentage ? 'passed' : 'failed';
        }

        const progress = {
            experience: this.player.experience,
            tools: this.player.tools,
            currentScenario: this.player.currentScenario,
            questionHistory: this.player.questionHistory,
            lastUpdated: new Date().toISOString(),
            questionsAnswered: this.player.questionHistory.length,
            status: status,
            scorePercentage: this.calculateScorePercentage()
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
            
            console.log('Saving progress with status:', status, 'scorePercentage:', progress.scorePercentage);
            await this.apiService.saveQuizProgress(this.quizName, progress);
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
                    status: savedProgress.data.status || 'in-progress',
                    scorePercentage: savedProgress.data.scorePercentage || 0
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
                if (progress.status === 'failed' || progress.status === 'passed') {
                    this.endGame(progress.status === 'failed');
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

            // Determine if the answer is correct (either via isCorrect property or positive experience)
            const isCorrect = selectedAnswer.isCorrect === true || selectedAnswer.experience > 0;

            // Update player experience for backward compatibility
            this.player.experience = Math.max(0, Math.min(this.config.maxXP, this.player.experience + (selectedAnswer.experience || 0)));
            
            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: isCorrect,
                timeSpent: timeSpent
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();
            
            // Save quiz result with the percentage score
            const username = localStorage.getItem('username');
            if (username) {
                try {
                    const quizUser = new QuizUser(username);
                    const scorePercentage = this.calculateScorePercentage();
                    
                    await quizUser.updateQuizScore(
                        this.quizName,
                        scorePercentage,
                        this.player.experience,
                        this.player.tools || [],
                        this.player.questionHistory,
                        this.player.questionHistory.length
                    );
                } catch (error) {
                    console.error('Failed to save quiz result:', error);
                }
            }

            // Show outcome screen
            this.displayOutcome(selectedAnswer);
            
            // Check if we should end the game
            if (this.shouldEndGame()) {
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

    async endGame(failed = false) {
        // Calculate final score based on correct answers
        const scorePercentage = this.calculateScorePercentage();
        const isPassed = scorePercentage >= this.passPercentage;
        
        // Determine final status
        const finalStatus = failed ? 'failed' : (isPassed ? 'passed' : 'failed');
        
        // Create the final progress object
        const progress = {
            experience: this.player.experience,
            tools: this.player.tools,
            questionHistory: this.player.questionHistory,
            currentScenario: this.player.currentScenario,
            questionsAnswered: this.totalQuestions,
            status: finalStatus,
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

            // Update progress display to show completion
            const questionInfoElement = document.querySelector('.question-info');
            if (questionInfoElement) {
                questionInfoElement.textContent = `Question: ${this.totalQuestions}/${this.totalQuestions}`;
            }

            // Update legacy progress elements if they exist
            const questionProgress = document.getElementById('question-progress');
            if (questionProgress) {
                questionProgress.textContent = `Question: ${this.totalQuestions}/${this.totalQuestions}`;
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
                this.totalQuestions, 
                finalStatus
            );

            // Clear localStorage data for this quiz
            this.clearQuizLocalStorage(username, this.quizName);

            // Update display elements
            const finalScoreElement = document.getElementById('final-score');
            if (finalScoreElement) {
                finalScoreElement.textContent = `Final Score: ${scorePercentage}%`;
            }

            // Show the end screen
            const quizCompleteHeader = document.querySelector('#end-screen h2');
            if (quizCompleteHeader) {
                quizCompleteHeader.textContent = isPassed ? 'Quiz Complete!' : 'Quiz Failed!';
            }

            const performanceSummary = document.getElementById('performance-summary');
            if (performanceSummary) {
                if (isPassed) {
                    // Find the appropriate threshold message
                    const threshold = this.config.performanceThresholds.find(t => t.threshold <= scorePercentage);
                    if (threshold) {
                        performanceSummary.textContent = threshold.message;
                    } else {
                        performanceSummary.textContent = 'Quiz completed successfully!';
                    }
                } else {
                    performanceSummary.textContent = `Quiz failed. You scored ${scorePercentage}% but needed at least ${this.passPercentage}% to pass.`;
                    
                    // Hide restart button if failed
                    const restartBtn = document.getElementById('restart-btn');
                    if (restartBtn) {
                        restartBtn.style.display = 'none';
                    }
                }
            }

            // Generate question review list with consistent formatting
            const reviewList = document.getElementById('question-review');
            if (reviewList) {
                reviewList.innerHTML = ''; // Clear existing content
                    
                this.player.questionHistory.forEach((record, index) => {
                    const reviewItem = document.createElement('div');
                    reviewItem.className = 'review-item';
                    
                    reviewItem.classList.add(record.isCorrect ? 'correct' : 'incorrect');
                    
                    reviewItem.innerHTML = `
                        <h4>Question ${index + 1}</h4>
                        <p class="scenario">${record.scenario ? record.scenario.description : 'No description available'}</p>
                        <p class="answer"><strong>Your Answer:</strong> ${record.selectedAnswer ? record.selectedAnswer.text : 'No answer selected'}</p>
                        <p class="outcome"><strong>Outcome:</strong> ${record.selectedAnswer ? record.selectedAnswer.outcome : 'No outcome'}</p>
                        <p class="result"><strong>Result:</strong> ${record.isCorrect ? 'Correct' : 'Incorrect'}</p>
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

    // Utility method to clean up localStorage
    clearQuizLocalStorage(username, quizName) {
        const variations = [
            quizName,
            quizName.toLowerCase(),
            quizName.toUpperCase(),
            quizName.replace(/-/g, ''),
            quizName.replace(/([A-Z])/g, '-$1').toLowerCase(),
            quizName.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
            quizName.replace(/-/g, '_'),
            'CMS-Testing',  // Special case for this quiz
            'cmsTesting'    // Another common variation
        ];

        variations.forEach(variant => {
            localStorage.removeItem(`quiz_progress_${username}_${variant}`);
            localStorage.removeItem(`quizResults_${username}_${variant}`);
        });
    }

    // Clean up and simplify existing methods to use the isCorrect property
    isCorrectAnswer(answer) {
        return answer && (answer.isCorrect === true || answer.experience > 0);
    }
    
    generateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations');
        if (!recommendationsContainer) return;

        const scorePercentage = this.calculateScorePercentage();
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            const isCorrect = record.isCorrect;
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
            
            // Determine if the answer is correct
            const isCorrect = selectedAnswer.isCorrect === true || selectedAnswer.experience > 0;
            
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
}

// Initialize quiz on page load
document.addEventListener('DOMContentLoaded', () => {
    // Clear any existing quiz instances before starting this quiz
    BaseQuiz.clearQuizInstances('cms-testing');
    
    const quiz = new CMS_Testing_Quiz();
    quiz.startGame();
});