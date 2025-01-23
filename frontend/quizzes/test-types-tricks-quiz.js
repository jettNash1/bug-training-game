import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class TestTypesTricksQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
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
                        outcome: 'Correct - Accurate technical definition describing how software components communicate',
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
                        text: 'Only testing on desktop browsers',
                        outcome: 'This shows awareness of testing platforms but misses AR specifics.',
                        experience: 5
                    },
                    {
                        text: 'Checking app performance in different lighting conditions',
                        outcome: 'Correct – This demonstrates understanding of AR\'s unique environmental interactions.',
                        experience: 15
                    },
                    {
                        text: 'Testing only colour schemes',
                        outcome: 'This could miss issues in other areas.',
                        experience: -5
                    },
                    {
                        text: 'Verifying app icons',
                        outcome: 'This is not a specific requirement of an AR test.',
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
                        outcome: 'Correct – This is the address that should be used for testing puposes.',
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
                description: 'When testing apps, what is crucial to include in bug tickets?',
                options: [
                    {
                        text: 'Only the date',
                        outcome: 'Partially relevant but incomplete information.',
                        experience: 5
                    },
                    {
                        text: 'App version number',
                        outcome: 'Correct – The application version number is crucial to diagnosing issues.',
                        experience: 15
                    },
                    {
                        text: 'Only the platform',
                        outcome: 'While this is important, if it’s the only information diagnosing the issue would be difficult',
                        experience: -10
                    },
                    {
                        text: 'Tester\'s name',
                        outcome: 'This important but not as crucial as some other information required and wouldn\'t aid the developer in debugging the issue',
                        experience: -5
                    }
                ]
            },

            {
                id: 5,
                level: 'Basic',
                title: 'VPN Usage',
                description: 'What is a VPN primarily used for in testing?',
                options: [
                    {
                        text: 'Generating fake data',
                        outcome: 'This is related to testing but not specific to VPN functionality.',
                        experience: 5
                    },
                    {
                        text: 'Simulating different locations',
                        outcome: 'Correct – This accurately describes VPN usage for testing purposes.',
                        experience: 15
                    },
                    {
                        text: 'Creating screenshots',
                        outcome: 'This is unrelated to VPN usage',
                        experience: -10
                    },
                    {
                        text: 'Storing test results',
                        outcome: 'This is unrelated to VPN usage',
                        experience: -5
                    }
                ]
            },

            {
                id: 6,
                level: 'Intermediate',
                title: 'Artificial Intelligence Classifications',
                description: 'What are three classifications of AI?',
                options: [
                    {
                        text: 'Basic, Advanced, Expert',
                        outcome: 'Whilst this shows an understanding of progression, the terminology is incorrect.',
                        experience: 5
                    },
                    {
                        text: 'Narrow, General, Super AI',
                        outcome: 'Correct - Classifications are described as Narrow AI (specific tasks), General AI (multiple tasks), and Super AI (unlimited capabilities)',
                        experience: 10
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
                        text: 'Laptops',
                        outcome: 'This is less suitable device for voice skill testing',
                        experience: -10
                    },
                    {
                        text: 'Smartphones',
                        outcome: 'Mobile devices can be used but not primary recommendation.',
                        experience: 5
                    },
                    {
                        text: 'Smart home devices',
                        outcome: 'Correct - Voice skill testing typically involves smart home devices like Amazon Echo, which use voice interaction',
                        experience: 15
                    },
                    {
                        text: 'Tablets',
                        outcome: 'This is less suitable device for voice skill testing',
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
                        text: 'Bluetooth',
                        outcome: 'Related to device settings but incorrect solution',
                        experience: 5
                    },
                    {
                        text: 'Location services',
                        outcome: 'This is an unrelated device management setting.',
                        experience: -5
                    },
                    {
                        text: 'Google Backup',
                        outcome: 'Correct - Turning off Google Backup prevents frequent backups filling up the zoonoutesting Google account storage',
                        experience: 15
                    },
                    {
                        text: 'Automatic updates',
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
                        text: 'GoFullPage',
                        outcome: 'This is a screen capture tool, but not generally used for accessibility.',
                        experience: 5
                    },
                    {
                        text: 'Accessibility Insights for Web',
                        outcome: 'Correct – This is useful for accessibility testing, particularly for tab stops.',
                        experience: 15
                    },
                    {
                        text: 'Viewport Dimensions',
                        outcome: 'This is an unrelated browser extension',
                        experience: -5
                    },
                    {
                        text: 'Broken Link Checker',
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
                        text: 'Include other client work',
                        outcome: 'This would compromise confidentiality.',
                        experience: -10
                    },
                    {
                        text: 'Keep background noise',
                        outcome: 'This compromises a professional standard.',
                        experience: 15
                    },
                    {
                        text: 'Hide bookmarks bar and avoid showing other client work',
                        outcome: 'Correct – This protects client confidentiality and practices professionalism when capturing evidence',
                        experience: 15
                    },
                    {
                        text: 'Use maximum resolution always',
                        outcome: 'Whilst important, this is not always essential',
                        experience: 5
                    }
                ]
            },

            {
                id: 11,
                level: 'Advanced',
                title: 'Application Program Interface Testing Preparation',
                description: 'In API testing, what is most important before beginning?',
                options: [
                    {
                        text: 'Having complete documentation',
                        outcome: 'While important, other details are also required outside of documentation',
                        experience: 5
                    },
                    {
                        text: 'Understanding endpoints and access methods',
                        outcome: 'Correct - Knowing URLs, access methods, and having a point of contact with developers before API testing is recommended.',
                        experience: 15
                    },
                    {
                        text: 'Knowing all possible user interactions',
                        outcome: 'This does not cover the most essential aspects needed for preparation',
                        experience: -5
                    },
                    {
                        text: 'Having the latest testing tools',
                        outcome: 'This is not an essential requirement',
                        experience: -5
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
                        text: 'Speed and colour',
                        outcome: 'This recognizes some technical considerations but not all characteristics.',
                        experience: 5
                    },
                    {
                        text: 'Flexibility, Autonomy, Ethics, Safety',
                        outcome: 'Correct - Characteristics like Flexibility, Autonomy, Evolution, Bias, Ethics, Transparency, and Safety for AI testing are recommended practices',
                        experience: 15
                    },
                    {
                        text: 'Memory and processing power',
                        outcome: 'These are not characteristics to be considered',
                        experience: -5
                    },
                    {
                        text: 'User interface design',
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
                        outcome: 'Related to file manipulation but incorrect',
                        experience: 5
                    },
                    {
                        text: 'fsutil file createnew',
                        outcome: 'Correct – The fsutil command is used to generate large test files of specific sizes.',
                        experience: 15
                    },
                    {
                        text: 'touch',
                        outcome: 'This is not a windows command',
                        experience: -10
                    },
                    {
                        text: 'create file',
                        outcome: 'This is an unrelated command',
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
                        text: 'Battery percentage',
                        outcome: 'Related to device settings but would not be essential focus for testing',
                        experience: 5
                    },
                    {
                        text: 'Default font size setting',
                        outcome: 'Correct - Checking that font size is set to default on Samsung devices can expose rendering issues.',
                        experience: 15
                    },
                    {
                        text: 'Accounts & Back Up',
                        outcome: 'This would not directly affect general testing activities',
                        experience: -10
                    },
                    {
                        text: 'Safety & Emergency',
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
                        text: 'Use higher resolution',
                        outcome: 'This suggests quality modification but may be ineffective in reducing a file size.',
                        experience: -5
                    },
                    {
                        text: 'Compress using tools like HandBrake or convert to GIF',
                        outcome: 'Correct – Using tools like HandBrake or converting to a lower-fps GIF to reduce file size for ticket uploads is recommended',
                        experience: 15
                    },
                    {
                        text: 'Split the video manually',
                        outcome: 'While this may help it is time consuming and ineffective use of time management',
                        experience: 5
                    },
                    {
                        text: 'Use external storage',
                        outcome: 'This doesn’t address the file size if limitations are set for upload',
                        experience: -10
                    }
                ]
            },
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

            const currentScenarios = this.getCurrentScenarios();
            const scenario = currentScenarios[this.player.currentScenario];
            const originalIndex = parseInt(selectedOption.value);
            
            const selectedAnswer = scenario.options[originalIndex];

            // Update player state
            this.player.experience = Math.max(0, Math.min(this.maxXP, this.player.experience + selectedAnswer.experience));
            
            // Add status to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                status: selectedAnswer.experience > 0 ? 'passed' : 'failed',
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

    endGame(failed = false) {
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
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

        const performanceSummary = document.getElementById('performance-summary');
        if (failed) {
            performanceSummary.textContent = 'Quiz failed. You did not meet the minimum XP requirement to progress. Please reset your progress to try again.';
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
    const quiz = new TestTypesTricksQuiz();
    quiz.startGame();
}); 