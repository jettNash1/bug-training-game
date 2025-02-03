import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class LocaleTestingQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a locale testing expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong locale testing skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing locale testing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'locale-testing',
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
                title: 'Primary objective',
                description: 'What is the primary purpose of locale testing?',
                options: [
                    {
                        text: 'This is the fundamental purpose of locale testing, encompassing language, rendering, and market-specific adaptations',
                        outcome: 'This describes exploratory testing',
                        experience: 15
                    },
                    {
                        text: 'To test the website\'s performance in different countries',
                        outcome: 'While location may play a role, performance testing is a separate testing discipline.',
                        experience: -5
                    },
                    {
                        text: 'To verify translations are grammatically correct',
                        outcome: 'While translation verification is part of locale testing, it\'s only one aspect of the broader scope.',
                        experience: 5
                    },
                    {
                        text: 'To ensure the website loads quickly in different regions',
                        outcome: 'Website loading speed is part of performance testing, not locale testing.',
                        experience: -10
                    }
                ]
            },

            {
                id: 2,
                level: 'Basic',
                title: 'Documentation',
                description: 'What type of documentation might clients provide for locale testing?',
                options: [
                    {
                        text: 'Server logs',
                        outcome: 'Server logs are not typically used for locale testing.',
                        experience: -5
                    },
                    {
                        text: 'Copy deck or translations matrix',
                        outcome: 'These are the primary reference documents provided by clients for verifying correct translations and content.',
                        experience: 15
                    },
                    {
                        text: 'Design specifications',
                        outcome: 'While design specs might be provided, they\'re secondary to translation documents.',
                        experience: 5
                    },
                    {
                        text: 'Network traffic data',
                        outcome: 'Network data is not relevant for locale testing.',
                        experience: -10
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Characteristics of locale testing',
                description: 'Which of the following is a key characteristic of locale testing?',
                options: [
                    {
                        text: 'Requires programming knowledge',
                        outcome: 'Programming knowledge is not a primary requirement for locale testing',
                        experience: -5
                    },
                    {
                        text: 'Requires keen eye for detail to spot minuscule variances',
                        outcome: 'Attention to detail is important, especially for diacritics and subtle differences.',
                        experience: 15
                    },
                    {
                        text: 'Requires fluency in all tested languages',
                        outcome: 'While language knowledge is helpful, testers can work with translation matrices.',
                        experience: 5
                    },
                    {
                        text: 'Requires network engineering expertise',
                        outcome: 'Network engineering is not related to locale testing',
                        experience: -10
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Locale currency testing',
                description: 'When conducting locale testing, what should testers check regarding currencies?',
                options: [
                    {
                        text: 'Currency symbol placement',
                        outcome: 'While this is part of currency localization, it\'s just one aspect of currency-related checks.',
                        experience: 5
                    },
                    {
                        text: 'Exchange rates between currencies',
                        outcome: 'Exchange rate verification is not part of locale testing.',
                        experience: -5
                    },
                    {
                        text: 'Currency updates based on selected market/locale',
                        outcome: 'Verifying that currencies update appropriately for each market is part of locale testing',
                        experience: 15
                    },
                    {
                        text: 'Currency conversion calculations',
                        outcome: 'Mathematical currency conversions are not part of locale testing',
                        experience: -10
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Locale test scripts',
                description: 'What is a recommended practice for organizing locale test scripts?',
                options: [
                    {
                        text: 'Test random sections across locales',
                        outcome: 'This unstructured approach would not ensure comprehensive coverage.',
                        experience: -5
                    },
                    {
                        text: 'Create separate scripts for each feature',
                        outcome: 'While organization is important, the document recommends organizing by locale first.',
                        experience: 5
                    },
                    {
                        text: 'Combine all locales into one test case',
                        outcome: 'This would make testing confusing and difficult to track',
                        experience: -10
                    },
                    {
                        text: 'Separate each page/section by locale',
                        outcome: 'This is the recommended this organization method',
                        experience: 15
                    }
                ]
            },
            {
                id: 6,
                level: 'Intermediate',
                title: 'Locale testing risk',
                description: 'What potential risk is associated with locale testing when the tester isn\'t bilingual?',
                options: [
                    {
                        text: 'Unable to complete any testing',
                        outcome: 'Non-bilingual testers can still perform many aspects of locale testing.',
                        experience: -5
                    },
                    {
                        text: 'Must outsource all testing',
                        outcome: 'Outsourcing is not necessary for locale testing.',
                        experience: -10
                    },
                    {
                        text: 'Can verify basic language presence',
                        outcome: 'While they can verify language presence, they may miss nuanced translation errors',
                        experience: 5
                    },
                    {
                        text: 'Certain incorrect translations may be missed even if in the correct language',
                        outcome: 'This is known risk as a tester may not know all languages under test',
                        experience: 15
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Right to Left languages',
                description: 'How should right-to-left (RTL) language testing be approached?',
                options: [
                    {
                        text: 'Verify correct text rendering and layout adaptation',
                        outcome: 'Checking rendering and layout for RTL languages is considered part of locale testing.',
                        experience: 15
                    },
                    {
                        text: 'Only test text direction',
                        outcome: 'RTL testing involves more than just text direction.',
                        experience: -5
                    },
                    {
                        text: 'Check text alignment only',
                        outcome: 'While alignment is important, RTL testing requires comprehensive layout verification',
                        experience: -5
                    },
                    {
                        text: 'Ignore formatting elements',
                        outcome: 'Formatting elements are crucial for RTL testing',
                        experience: -10
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Issue identification',
                description: 'What is the recommended approach for handling issue identification across multiple locales?',
                options: [
                    {
                        text: 'Create separate bug trackers for each locale',
                        outcome: 'This would complicate issue management unnecessarily',
                        experience: -5
                    },
                    {
                        text: 'Preface tickets with locale identifier (e.g., [FR], [ES])',
                        outcome: 'This is the correct approach for ease of identification.',
                        experience: 15
                    },
                    {
                        text: 'Report issues without locale references',
                        outcome: 'This would make it difficult to track locale-specific issues',
                        experience: -10
                    },
                    {
                        text: 'Group similar issues across locales',
                        outcome: 'While grouping can be useful, clear locale identification is primary.',
                        experience: 5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Validation messages',
                description: 'What should testers verify regarding form validation messages?',
                options: [
                    {
                        text: 'Messages are translated and display correctly in each locale',
                        outcome: 'This is a critical element for locale testing.',
                        experience: 15
                    },
                    {
                        text: 'Only check if messages appear',
                        outcome: 'Merely checking presence is insufficient.',
                        experience: -5
                    },
                    {
                        text: 'Verify message positioning',
                        outcome: 'While positioning is important, translation and correct display are primary',
                        experience: 5
                    },
                    {
                        text: 'Skip validation message testing',
                        outcome: 'Validation messages are an essential part of locale testing.',
                        experience: -10
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Time management',
                description: 'How should testers manage time when testing multiple locales?',
                options: [
                    {
                        text: 'Focus only on primary locale',
                        outcome: 'All scoped locales need appropriate coverage.',
                        experience: -10
                    },
                    {
                        text: 'Test one locale completely before moving to others',
                        outcome: 'While thorough, this might not be the most efficient approach.',
                        experience: 5
                    },
                    {
                        text: 'Random testing of locales',
                        outcome: 'Unstructured testing would not ensure proper coverage',
                        experience: -5
                    },
                    {
                        text: 'Balance testing across locales while maintaining thoroughness',
                        outcome: 'The document emphasizes the importance of time management across locales',
                        experience: 15
                    }
                ]
            },
            {
                id: 11,
                level: 'Advanced',
                title: 'Language remenants',
                description: 'What approach should be taken when testing for language remnants?',
                options: [
                    {
                        text: 'Check main navigation and headers only',
                        outcome: 'While important, this is not comprehensive enough.',
                        experience: 5
                    },
                    {
                        text: 'Check all UI elements, including hidden states and validation messages',
                        outcome: 'The document emphasizes comprehensive checking across all UI elements',
                        experience: 15
                    },
                    {
                        text: 'Only check visible text on main pages',
                        outcome: 'This would miss many potential issues',
                        experience: -5
                    },
                    {
                        text: 'Rely on automated translation detection',
                        outcome: 'Manual verification is necessary for thorough testing',
                        experience: -10
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Diacritic elements',
                description: 'How should testers handle diacritic elements during testing?',
                options: [
                    {
                        text: 'Ignore diacritical marks',
                        outcome: 'This would miss crucial linguistic elements.',
                        experience: -10
                    },
                    {
                        text: 'Only check for presence of diacritics',
                        outcome: 'Presence alone doesn\'t ensure correct usage or rendering.',
                        experience: 5
                    },
                    {
                        text: 'Verify correct rendering and meaning preservation',
                        outcome: 'Diacritics must be checked for the importance of meaning',
                        experience: 15
                    },
                    {
                        text: 'Remove diacritics for testing',
                        outcome: 'This would fundamentally alter the language',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Locale specific formatting',
                description: 'What strategy should be employed when testing locale-specific formatting?',
                options: [
                    {
                        text: 'Verify date, time, address, and phone number formats for each locale',
                        outcome: 'These are all specific elements requiring verification',
                        experience: 15
                    },
                    {
                        text: 'Use standard formats across all locales',
                        outcome: 'This defeats the purpose of localization.',
                        experience: -10
                    },
                    {
                        text: 'Check only date formats',
                        outcome: 'While important, this is only one aspect of formatting',
                        experience: 5
                    },
                    {
                        text: 'Ignore format variations',
                        outcome: 'Format verification is crucial for locale testing',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Text expansions',
                description: 'How should testers handle text expansion/contraction across different languages?',
                options: [
                    {
                        text: 'Only test with maximum length text',
                        outcome: 'This wouldn\'t catch all potential issues.',
                        experience: -5
                    },
                    {
                        text: 'Ignore text length variations',
                        outcome: 'Text length variations can cause significant issues.',
                        experience: -10
                    },
                    {
                        text: 'Check visible elements for truncation',
                        outcome: 'While important, hidden states and dynamic content also need checking',
                        experience: 5
                    },
                    {
                        text: 'Verify layout integrity and check for truncation across all elements',
                        outcome: 'The document emphasizes checking for truncation and layout issues',
                        experience: 15
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Language selectors',
                description: 'What approach should be taken when testing language toggles/selectors?',
                options: [
                    {
                        text: 'Check immediate visual changes',
                        outcome: 'While important, this doesn\'t cover all necessary aspects.',
                        experience: 5
                    },
                    {
                        text: 'Only test switching between languages',
                        outcome: 'This misses many important aspects of language switching.',
                        experience: -5
                    },
                    {
                        text: 'Assume all content updates correctly',
                        outcome: 'This would miss potential issues in content loading and updates',
                        experience: -10
                    },
                    {
                        text: 'Verify content updates, loading behaviour, and state preservation',
                        outcome: 'It is important to check all these aspects of language switching',
                        experience: 15
                    }
                ]
            },
        ];

        // Initialize UI and add event listeners
        this.initializeEventListeners();

        this.isLoading = false;
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of locale testing. You clearly understand the nuances of locale testing and are well-equipped to handle any locale testing challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your locale testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('rtl') || description.includes('right-to-left')) {
            return 'RTL Support';
        } else if (title.includes('validation') || description.includes('validation')) {
            return 'Form Validation';
        } else if (title.includes('format') || description.includes('format')) {
            return 'Locale Formatting';
        } else if (title.includes('remnant') || description.includes('remnant')) {
            return 'Language Remnants';
        } else if (title.includes('diacritic') || description.includes('diacritic')) {
            return 'Diacritic Handling';
        } else if (title.includes('expansion') || description.includes('expansion')) {
            return 'Text Expansion';
        } else if (title.includes('selector') || description.includes('toggle')) {
            return 'Language Selection';
        } else if (title.includes('time') || description.includes('time')) {
            return 'Time Management';
        } else {
            return 'General Locale Testing';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'RTL Support': 'Focus on comprehensive testing of right-to-left language layout and functionality.',
            'Form Validation': 'Strengthen verification of localized validation messages and error handling.',
            'Locale Formatting': 'Improve testing of date, time, currency, and number formatting across locales.',
            'Language Remnants': 'Enhance detection of untranslated content and mixed language occurrences.',
            'Diacritic Handling': 'Focus on proper rendering and functionality with diacritical marks.',
            'Text Expansion': 'Develop better strategies for handling text length variations across languages.',
            'Language Selection': 'Strengthen testing of language switching and content preservation.',
            'Time Management': 'Improve efficiency in testing multiple locales while maintaining thoroughness.',
            'General Locale Testing': 'Continue developing fundamental locale testing principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core locale testing principles.';
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
    const quiz = new LocaleTestingQuiz();
    quiz.startGame();
}); 