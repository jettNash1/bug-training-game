import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class TestTypesTricksQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a test types and tricks expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong test types and tricks skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
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
        // Only end the game when all 15 questions are answered
        return (this.player?.questionHistory?.length || 0) >= 15;
    }

    async saveProgress() {
        // First determine the status based on clear conditions
        let status = 'in-progress';
        
        // Check for completion (all 15 questions answered)
        if (this.player.questionHistory.length >= 15) {
            // Calculate pass/fail based on correct answers
            const correctAnswers = this.player.questionHistory.filter(q => 
                q.selectedAnswer && (q.selectedAnswer.isCorrect || 
                q.selectedAnswer.experience === Math.max(...q.scenario.options.map(o => o.experience || 0)))
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
                scorePercentage: this.calculateScorePercentage()
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
        
        // Check if we've answered all 15 questions
        if (this.player.questionHistory.length >= 15) {
            console.log('All 15 questions answered, ending game');
            this.endGame(false);
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
        const totalAnswered = this.player.questionHistory.length;
        
        // Progress through levels based only on question count
        if (totalAnswered >= 10) {
            return this.advancedScenarios;
        } else if (totalAnswered >= 5) {
            return this.intermediateScenarios;
        }
        return this.basicScenarios;
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

        // Hide the progress card on the end screen
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'none';
        }

        // Calculate final score based on correct answers
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && (q.selectedAnswer.isCorrect || 
            q.selectedAnswer.experience === Math.max(...q.scenario.options.map(o => o.experience || 0)))
        ).length;
        const scorePercentage = Math.round((correctAnswers / 15) * 100);
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
        return Math.round((correctAnswers / Math.max(1, Math.min(this.player.questionHistory.length, 15))) * 100);
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

        // Add test-types-tricks specific variations
        if (quizName.toLowerCase().includes('test-types')) {
            variations.push(
                'Test-Types-Tricks',
                'test-types-tricks',
                'testTypesTricks',
                'Test_Types_Tricks',
                'test_types_tricks'
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
    const quiz = new TestTypesTricksQuiz();
    quiz.startGame();
}); 