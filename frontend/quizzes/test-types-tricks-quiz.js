import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class TestTypesTricksQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a test types and tricks expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong test types and tricks skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing test types and tricks best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'test-types-tricks',
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
                title: 'API Understanding',
                description: 'What does API stand for?',
                options: [
                    {
                        text: 'Advanced Programming Interface',
                        outcome: 'Close but technically incorrect terminology',
                        experience: 5
                    },
                    {
                        text: 'Application Programming Interface',
                        outcome: 'Correct! Accurate technical definition of describing how software components communicate',
                        experience: 15
                    },
                    {
                        text: 'Automated Programming Interface',
                        outcome: 'This is a fabricated term',
                        experience: -10
                    },
                    {
                        text: 'Advanced Process Integration',
                        outcome: 'This is a fabricated term',
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Augmented Reality Testing',
                description: 'In AR (Augmented Reality) testing, what unique aspect might testers need to consider?',
                options: [
                    {
                        text: 'This should only be tested on desktop browsers',
                        outcome: 'This shows awareness of testing platforms but misses Augmented Reality specifics.',
                        experience: 5
                    },
                    {
                        text: 'Checking application performance in different lighting conditions',
                        outcome: 'Correct! This demonstrates understanding of Augmented Reality\'s unique environmental interactions.',
                        experience: 15
                    },
                    {
                        text: 'Testing for issues with colour schemes within the application only',
                        outcome: 'Focussing only on this functionality could miss issues in other areas.',
                        experience: -5
                    },
                    {
                        text: 'Verifying icons within the application under test only',
                        outcome: 'This is not a specific requirement of an Augmented Reality testing.',
                        experience: -10
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Test Email Address',
                description: 'What is the recommended email domain for test email addresses?',
                options: [
                    {
                        text: '@testing.com',
                        outcome: 'This is a generic testing domain but not the recommended one',
                        experience: 5
                    },
                    {
                        text: '@zoonou.com',
                        outcome: 'This is the company email address for employees',
                        experience: -5
                    },
                    {
                        text: '@teztr.com',
                        outcome: 'Correct! This is the address that should be used for testing purposes.',
                        experience: 15
                    },
                    {
                        text: '@example.com',
                        outcome: 'This is incorrect and unrelated',
                        experience: -10
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Application Ticket Writing',
                description: 'When testing applications, what is crucial to include in bug tickets?',
                options: [
                    {
                        text: 'The date should be included in the raised ticket',
                        outcome: 'This is partially relevant, but the information is incomplete.',
                        experience: 5
                    },
                    {
                        text: 'The application version number should be included within the ticket',
                        outcome: 'Correct! The application version number is crucial to diagnosing defects.',
                        experience: 15
                    },
                    {
                        text: 'The platform only should be included in the raised ticket',
                        outcome: 'While this is important, if it\'s the only information given, diagnosing the issue would be difficult',
                        experience: -10
                    },
                    {
                        text: 'The tester\'s name should be included in the raised ticket',
                        outcome: 'This important but not as crucial as some other information required and wouldn\'t aid the developer in debugging the issue',
                        experience: -5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Virtual Private Network Usage',
                description: 'What is a Virtual Private Network primarily used for in testing?',
                options: [
                    {
                        text: 'This is used for generating fake data',
                        outcome: 'This is related to testing, but not specific to Virtual Private Network functionality.',
                        experience: 5
                    },
                    {
                        text: 'This is used for simulating different locations',
                        outcome: 'Correct! This accurately describes Virtual Private Network usage for testing purposes.',
                        experience: 15
                    },
                    {
                        text: 'This is used for creating screenshots',
                        outcome: 'This is unrelated to Virtual Private Network usage',
                        experience: -10
                    },
                    {
                        text: 'This is used for storing test results',
                        outcome: 'This is unrelated to Virtual Private Network usage',
                        experience: -5
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10, 100 XP total, 20 XP each)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Artificial Intelligence Classifications',
                description: 'What are three classifications of Artificial Intelligence?',
                options: [
                    {
                        text: 'Basic, Advanced, Expert',
                        outcome: 'Whilst this shows an understanding of progression, the terminology is incorrect.',
                        experience: 5
                    },
                    {
                        text: 'Narrow, General, Super AI',
                        outcome: 'Correct! Classifications are described as Narrow AI (specific tasks), General AI (multiple tasks), and Super AI (unlimited capabilities)',
                        experience: 15
                    },
                    {
                        text: 'Simple, Complex, Intelligent',
                        outcome: 'These are generic categorisations',
                        experience: -5
                    },
                    {
                        text: 'Beginner, Intermediate, Advanced',
                        outcome: 'These are generic categorisations',
                        experience: -10
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Voice Skills Testing',
                description: 'When testing voice skills, what device type is most commonly used?',
                options: [
                    {
                        text: 'Laptops should be used for voice skill testing only',
                        outcome: 'This is a less suitable device for voice skill testing.',
                        experience: -10
                    },
                    {
                        text: 'Smartphones should be used for voice skill testing only',
                        outcome: 'Mobile devices can be used, but they\'re not the primary recommendation.',
                        experience: 5
                    },
                    {
                        text: 'Smart home devices should be used for voice skill testing',
                        outcome: 'Correct! Voice skill testing typically involves smart home devices like Amazon Echo, which use voice interaction',
                        experience: 15
                    },
                    {
                        text: 'Tablets should be used for voice skill testing only',
                        outcome: 'This is a less suitable device for voice skill testing',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Storage Issues',
                description: 'What should be disabled on Android devices to prevent storage issues?',
                options: [
                    {
                        text: 'Bluetooth should be disabled to prevent storage issues',
                        outcome: 'This is related to device settings, but an incorrect solution as this does not prevent frequent back ups',
                        experience: 5
                    },
                    {
                        text: 'Location services should be disabled to prevent storage issues',
                        outcome: 'This is an unrelated device management setting.',
                        experience: -5
                    },
                    {
                        text: 'Google Backup should be disabled to prevent storage issues',
                        outcome: 'Correct! Turning off Google Backup prevents frequent backups filling up the zoonoutesting Google account storage',
                        experience: 15
                    },
                    {
                        text: 'Automatic updates should be disabled to prevent storage issues',
                        outcome: 'This is an unrelated device management setting.',
                        experience: -10
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Accessibility Extensions',
                description: 'Which Chrome extension is recommended for accessibility testing?',
                options: [
                    {
                        text: 'GoFullPage is a recommended accessibility extension',
                        outcome: 'This is a screen capture tool, but not generally used for accessibility.',
                        experience: 5
                    },
                    {
                        text: 'Accessibility Insights for Web is a recommended accessibility extension',
                        outcome: 'Correct! This is useful for accessibility testing, particularly for tab stops.',
                        experience: 15
                    },
                    {
                        text: 'Viewport Dimensions is a recommended accessibility extension',
                        outcome: 'This is an unrelated browser extension.',
                        experience: -5
                    },
                    {
                        text: 'Broken Link Checker is a recommended accessibility extension',
                        outcome: 'This is an unrelated browser extension.',
                        experience: -10
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Bug Report Evidence',
                description: 'What is recommended when capturing evidence for bug tickets?',
                options: [
                    {
                        text: 'Screenshots that include the whole screen and any projects being worked on',
                        outcome: 'This could compromise confidentiality if any other client work was captured.',
                        experience: -10
                    },
                    {
                        text: 'All audio should be kept when capturing video evidence',
                        outcome: 'Only audio specific to the actual issue should be captured as this could compromise professional standards set by Zoonou.',
                        experience: -5
                    },
                    {
                        text: 'Hide bookmarks bar and avoid showing other client work',
                        outcome: 'Correct! This protects client confidentiality and practices professionalism when capturing evidence.',
                        experience: 15
                    },
                    {
                        text: 'Use maximum resolution always when capturing evidence',
                        outcome: 'Whilst important, this is not always essential.',
                        experience: 5
                    }
                ]
            }
        ];
        // Advanced Scenarios (IDs 11-15, 125 XP total, 25 XP each)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Application Program Interface Testing Preparation',
                description: 'In Application Program Interface testing, what is most important before beginning?',
                options: [
                    {
                        text: 'Having access to complete documentation from the client',
                        outcome: 'While important, other details are also required outside of documentation like contact information for developers for testing recommendations',
                        experience: 5
                    },
                    {
                        text: 'Understanding endpoints and access methods is important',
                        outcome: 'Correct! Knowing URLs, access methods, and having a point of contact with developers before Application Program Interface testing is recommended',
                        experience: 25
                    },
                    {
                        text: 'Knowing all possible user interactions is most important',
                        outcome: 'This does not cover the most essential aspects needed for preparation like correct URL\'s and access methods.',
                        experience: -5
                    },
                    {
                        text: 'Having the latest testing tools is most important',
                        outcome: 'This is not an essential requirement and many tools can be utilised for different purposes',
                        experience: -10
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Intelligent Systems',
                description: 'What quality characteristics are considered when testing intelligent systems?',
                options: [
                    {
                        text: 'Speed and colour should be considered for intelligent system testing',
                        outcome: 'This recognises some technical considerations but not all characteristics.',
                        experience: 5
                    },
                    {
                        text: 'Flexibility, autonomy, ethics and safety should be considered for intelligent system testing',
                        outcome: 'Correct! Characteristics like Flexibility, Autonomy, Evolution, Bias, Ethics, Transparency, and Safety for AI testing are recommended practices',
                        experience: 25
                    },
                    {
                        text: 'Memory and processing power should be considered for intelligent system testing',
                        outcome: 'These are not characteristics to be considered',
                        experience: -5
                    },
                    {
                        text: 'User interface design should be considered for intelligent system testing',
                        outcome: 'This is not characteristic to be considered',
                        experience: -10
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Windows Commands',
                description: 'When testing file uploads, what Windows command can generate large files?',
                options: [
                    {
                        text: 'mkdir',
                        outcome: 'This is related to file manipulation, but incorrect',
                        experience: 5
                    },
                    {
                        text: 'fsutil file createnew',
                        outcome: 'Correct! The fsutil command is used to generate large test files of specific sizes.',
                        experience: 25
                    },
                    {
                        text: 'touch',
                        outcome: 'This is not a windows command.',
                        experience: -10
                    },
                    {
                        text: 'create file',
                        outcome: 'This is an unrelated command.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Samsung Device Testing',
                description: 'What should be checked on Samsung devices during testing?',
                options: [
                    {
                        text: 'Battery percentage should be checked during application or website testing',
                        outcome: 'This is related to device settings but would not be essential focus for testing',
                        experience: 5
                    },
                    {
                        text: 'Default font size setting should be checked during application or website testing',
                        outcome: 'Correct! Checking that font size is set to default on Samsung devices can expose rendering issues.',
                        experience: 25
                    },
                    {
                        text: 'Accounts & Back Up should be checked during application or website testing',
                        outcome: 'This would not directly affect general testing activities',
                        experience: -10
                    },
                    {
                        text: 'Safety & Emergency should be checked during application or website testing',
                        outcome: 'This would not directly affect general testing activities',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Screen Recording Size Limitations',
                description: 'What is recommended for capturing large screen recording files with size limitations?',
                options: [
                    {
                        text: 'Use higher resolution when capturing large screen recordings',
                        outcome: 'This suggests quality modification but may be ineffective in reducing a file size.',
                        experience: -5
                    },
                    {
                        text: 'Compress using tools like HandBrake or convert to GIF when capturing large screen recordings',
                        outcome: 'Correct! Using tools like HandBrake or converting to a lower-fps GIF to reduce file size for ticket uploads is recommended.',
                        experience: 25
                    },
                    {
                        text: 'Split the video manually when capturing large screen recordings',
                        outcome: 'While this may help it is time consuming and an ineffective use of time management.',
                        experience: 5
                    },
                    {
                        text: 'Use external storage when capturing large screen recordings',
                        outcome: 'This doesn\'t address the file size if limitations are in place for uploads.',
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
        
        // Check for completion (all 15 questions answered)
        if (this.player.questionHistory.length >= 15) {
            // Check if they met the advanced XP requirement
            if (this.player.experience >= this.levelThresholds.advanced.minXP) {
                status = 'completed';
            } else {
                status = 'failed';
            }
        } 
        // Check for early failure conditions
        else if (
            (this.player.questionHistory.length >= 10 && this.player.experience < this.levelThresholds.intermediate.minXP) ||
            (this.player.questionHistory.length >= 5 && this.player.experience < this.levelThresholds.basic.minXP)
        ) {
            status = 'failed';
        }

        const progress = {
            data: {
                experience: this.player.experience,
                tools: this.player.tools,
                currentScenario: this.player.currentScenario,
                questionHistory: this.player.questionHistory,
                lastUpdated: new Date().toISOString(),
                questionsAnswered: this.player.questionHistory.length,
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
            this.endGame(true);
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

        // Clear any existing timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }
        
        try {
            this.isLoading = true;
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) return;

            const currentScenarios = this.getCurrentScenarios();
            const scenario = currentScenarios[this.player.currentScenario];
            const originalIndex = parseInt(selectedOption.value);
            
            const selectedAnswer = scenario.options[originalIndex];

            // Calculate new experience with level-based minimum thresholds
            let newExperience = this.player.experience + selectedAnswer.experience;
            
            // Apply minimum thresholds based on current level
            const questionCount = this.player.questionHistory.length;
            if (questionCount >= 5) { // Intermediate level
                newExperience = Math.max(this.levelThresholds.basic.minXP, newExperience);
            }
            if (questionCount >= 10) { // Advanced level
                newExperience = Math.max(this.levelThresholds.intermediate.minXP, newExperience);
            }

            // Update player experience with bounds
            this.player.experience = Math.max(0, Math.min(this.maxXP, newExperience));

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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in test types and tricks. You clearly understand the various testing methodologies and best practices!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your testing knowledge is very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('api') || description.includes('api')) {
            return 'API Testing';
        } else if (title.includes('accessibility') || description.includes('accessibility')) {
            return 'Accessibility Testing';
        } else if (title.includes('ar') || description.includes('augmented reality')) {
            return 'AR Testing';
        } else if (title.includes('voice') || description.includes('voice')) {
            return 'Voice Testing';
        } else if (title.includes('storage') || description.includes('storage')) {
            return 'Storage Management';
        } else if (title.includes('bug') || description.includes('bug')) {
            return 'Bug Reporting';
        } else if (title.includes('intelligent') || description.includes('ai')) {
            return 'AI Testing';
        } else if (title.includes('vpn') || description.includes('vpn')) {
            return 'Location Testing';
        } else {
            return 'General Testing';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'API Testing': 'Review API testing fundamentals and ensure you understand endpoints, access methods, and documentation requirements.',
            'Accessibility Testing': 'Focus on learning accessibility tools like Accessibility Insights and understanding WCAG guidelines.',
            'AR Testing': 'Study environmental considerations for AR testing, including lighting conditions and spatial awareness.',
            'Voice Testing': 'Practice with voice interaction testing on smart home devices and understand voice command patterns.',
            'Storage Management': 'Learn about storage optimization techniques and device-specific storage management.',
            'Bug Reporting': 'Improve bug documentation skills with clear reproduction steps and evidence capture.',
            'AI Testing': 'Study AI testing characteristics including flexibility, autonomy, ethics, and safety considerations.',
            'Location Testing': 'Practice with VPN tools and understand location-based testing requirements.',
            'General Testing': 'Review fundamental testing principles and best practices for various test types.'
        };

        return recommendations[area] || 'Continue practicing general testing skills and methodologies.';
    }

    async endGame(failed = false) {
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
                const status = failed ? 'failed' : 'completed';
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

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = failed ? 'Quiz Failed!' : 'Quiz Complete!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (failed) {
            performanceSummary.textContent = 'Quiz failed. You did not meet the minimum XP requirement to progress. You cannot retry this quiz.';
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
            const threshold = this.performanceThresholds.find(t => t.threshold <= finalScore);
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
    const quiz = new TestTypesTricksQuiz();
    quiz.startGame();
}); 