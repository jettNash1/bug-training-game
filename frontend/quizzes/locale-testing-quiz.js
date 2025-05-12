import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class LocaleTestingQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a locale testing expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong locale testing skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
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

        // Basic Scenarios (IDs 1-5, 16-20)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Primary objective',
                description: 'What is the primary purpose of locale testing?',
                options: [
                    {
                        text: 'To conduct copy checks to ensure that either, no English remnants are present after translation or remnants of other languages do not appear',
                        outcome: 'Correct! This is the fundamental purpose of locale testing, encompassing language, rendering, and market-specific adaptations',
                        experience: 15,
                        tool: 'Locale Testing Fundamentals'
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
                        text: 'The client will provide server logs to assist in this type of testing',
                        outcome: 'Server logs are not typically used for locale testing.',
                        experience: -5
                    },
                    {
                        text: 'Copy deck or translations matrix can be submitted by the client',
                        outcome: 'Correct! These are the primary reference documents provided by clients for verifying correct translations and content.',
                        experience: 15,
                        tool: 'Documentation Management'
                    },
                    {
                        text: 'Design specifications can be provided to assist with locale testing',
                        outcome: 'While design specifications might be provided, they\'re secondary to translation documents.',
                        experience: 5
                    },
                    {
                        text: 'Network traffic data can be submitted to assist with locale testing',
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
                        text: 'Locale testing requires programming knowledge',
                        outcome: 'Programming knowledge is not a primary requirement for locale testing.',
                        experience: -5
                    },
                    {
                        text: 'Locale testing requires a keen eye for detail to spot minuscule variances',
                        outcome: 'Correct! Attention to detail is important, especially for diacritics and subtle differences.',
                        experience: 15,
                        tool: 'Detail Analysis'
                    },
                    {
                        text: 'Locale testing requires fluency in all supported test languages',
                        outcome: 'While language knowledge is helpful, testers can work with a translation matrix.',
                        experience: 5
                    },
                    {
                        text: 'Locale testing requires network engineering expertise',
                        outcome: 'Network engineering is not related to locale testing.',
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
                        text: 'The currency symbol placement should be checked exclusively',
                        outcome: 'While this is part of currency localisation, it\'s just one aspect of currency-related checks.',
                        experience: 5
                    },
                    {
                        text: 'Exchange rates between currencies should be tested',
                        outcome: 'Exchange rate verification is not part of locale testing.',
                        experience: -5
                    },
                    {
                        text: 'Currency updates based on selected market under test',
                        outcome: 'Correct! Verifying that currencies update appropriately for each market is part of locale testing',
                        experience: 15,
                        tool: 'Currency Testing'
                    },
                    {
                        text: 'Currency conversion calculations need to be tested for accuracy',
                        outcome: 'Mathematical currency conversions are not part of locale testing',
                        experience: -10
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Locale test scripts',
                description: 'What is a recommended practice for organising locale test scripts?',
                options: [
                    {
                        text: 'Random sections across different locales can be tested to gain the most coverage possible',
                        outcome: 'This unstructured approach would not ensure comprehensive coverage.',
                        experience: -5
                    },
                    {
                        text: 'Create separate scripts for each feature to be tested in regards to locale',
                        outcome: 'While organisation is important, organising by locale first Is more efficient than organising the script on a feature basis.',
                        experience: 5
                    },
                    {
                        text: 'Organise all locales to be combined into one test case',
                        outcome: 'This would make testing confusing and difficult to track.',
                        experience: -10
                    },
                    {
                        text: 'Separate each page or section to be tested by locale',
                        outcome: 'Correct! This is the recommended organisation method and makes for easy tracking and traceability.',
                        experience: 15,
                        tool: 'Script Organization'
                    }
                ]
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Locale Testing Risks',
                description: 'What is a potential risk of locale testing mentioned in the guide?',
                options: [
                    {
                        text: 'Testing could be affected by inaccuracies in client-provided translation documentation',
                        outcome: 'Correct! Testing can be affected by the accuracy of client-provided documentation, especially translations where the tester is not a native speaker of the language under test.',
                        experience: 15,
                        tool: 'Locale Testing Risks'
                    },
                    {
                        text: 'Locale testing might expose security vulnerabilities',
                        outcome: 'Security vulnerabilities are not a risk associated with locale testing and this type of testing is out of scope for locale test activities.',
                        experience: -5
                    },
                    {
                        text: 'Testing multiple locales typically requires more resources than is available',
                        outcome: 'While time constraints need to be managed, staffing shortages are not identified as a specific risk.',
                        experience: -10
                    },
                    {
                        text: 'Locale testing often causes software to crash during language switches',
                        outcome: 'Locale testing should ensure that content loads properly when changing languages but crashes as a result of switching languages is generally not common risk.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Locale Documentation',
                description: 'What document should testers consult to determine which locales are in scope for testing?',
                options: [
                    {
                        text: 'The locale test script template should be referred to for scoping',
                        outcome: 'Test scripts don\'t define which locales are in scope, they\'re used to create the test scripts after scope is determined.',
                        experience: -5
                    },
                    {
                        text: 'The tester\'s previous notes from similar projects should be referred to for scope',
                        outcome: 'Previous notes might be helpful but should not be referred to as an authoritative source for determining which locales are in scope.',
                        experience: -10
                    },
                    {
                        text: 'The client\'s Statement of Work and Operational Details documentation should be referred to',
                        outcome: 'Correct! This documentation defines locales that are in scope and if there are any sub-areas within locale testing that are out of scope.',
                        experience: 15,
                        tool: 'Change Impact'
                    },
                    {
                        text: 'The global market trends report should be referred to for locale scope',
                        outcome: 'Market trend reports should not be referred to as resources for determining testing scope as all clients have different requirements.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Language Switch Testing',
                description: 'What issue might occur when changing locales that testers need to specifically check for?',
                options: [
                    {
                        text: 'System crashes when switching languages',
                        outcome: 'System crashes are not generally a common defect caused by locale switching.',
                        experience: -5
                    },
                    {
                        text: 'Slow page load times need to be monitored when switching languages',
                        outcome: 'Page load speed differences are generally part of performance testing.', 
                        experience: -10
                    },
                    {
                        text: 'Text truncation or overlapping content need to be monitored when switching languages',
                        outcome: 'Correct! Identifying any rendering issues caused by word length when changing locales, such as overlapping content or lack of padding between page elements should be monitored.',
                        experience: 15,
                        tool: 'Language Switch Testing'
                    },
                    {
                        text: 'Font colour changes should be monitored when switching languages',
                        outcome: 'Font colour changes should not be a specific concern, although can be raised as a query unless stated as correct by the client documentation.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Locale Test Consistency',
                description: 'What important element should testers check consistently across locale changes?',
                options: [
                    {
                        text: 'Global elements such as header, navigation and footer should be checked',
                        outcome: 'Correct! These elements should remain consistent when navigating the site on a selected locale.',
                        experience: 15,
                        tool: 'Locale Test Consistency'
                    },
                    {
                        text: 'Loading speed for each locale should be checked for consistency',
                        outcome: 'While checking for any major issues in this area are recommended, loading speed is more aligned with performance testing.',
                        experience: -10
                    },
                    {
                        text: 'The number of images displayed on each page',
                        outcome: 'Whilst any major issues here should be reported. The amount of images would generally come under content and copy proofing.',
                        experience: -5
                    },
                    {
                        text: 'Font size consistency across locales should be checked',
                        outcome: 'While visual presentation is important, font size consistency isn\'t a specific check for locale testing. However, any major issues should be flagged.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Locale Testing Advantages',
                description: 'Which of the following is an advantage of locale testing?',
                options: [
                    {
                        text: 'It improves the user experience and customer satisfaction',
                        outcome: 'Correct! Locale testing can identify issues with the presented language and therefore build confidence in the product from the user.',
                        experience: 15,
                        tool: 'Locale Testing Advantages'
                    },
                    {
                        text: 'It ensures a universal experience across all regions',
                        outcome: 'Locale testing is specifically designed to adapt software or content to different regions, not to make everything uniform.',
                        experience: -10
                    },
                    {
                        text: 'It eliminates the need for native language testers',
                        outcome: 'This would actually be considered as a limitation as not all testers will know multiple native languages.',
                        experience: -5
                    },
                    {
                        text: 'It speeds up the loading time of the website in different regions',
                        outcome: 'System performance is generally not associated with locale testing.',
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
                title: 'Locale testing risk',
                description: 'What potential risk is associated with locale testing when the tester isn\'t bilingual?',
                options: [
                    {
                        text: 'Certain incorrect translations may be missed even if in the correct language',
                        outcome: 'Correct! This is a known risk as a tester may not know all languages under test.',
                        experience: 20,
                        tool: 'Risk Assessment'
                    },
                    {
                        text: 'The tester is unable to complete any testing due to lack of specialist knowledge',
                        outcome: 'Non-bilingual testers can still perform many aspects of locale testing.',
                        experience: -15
                    },
                    {
                        text: 'All testing needs to be outsourced to businesses providing locale specialists',
                        outcome: 'Outsourcing is not necessary for locale testing as copy can be provided by the client to cross reference.',
                        experience: -10
                    },
                    {
                        text: 'Basic language presence can be tested fully to completion',
                        outcome: 'While they can verify language presence, they may miss nuanced translation errors.',
                        experience: -5
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
                        outcome: 'Correct! Checking rendering and layout for RTL languages is considered part of locale testing.',
                        experience: 20,
                        tool: 'RTL Testing'
                    },
                    {
                        text: 'Test that the text direction is correctly presented',
                        outcome: 'RTL testing involves more than just text direction like grammar and locale specific elements.',
                        experience: -15
                    },
                    {
                        text: 'Test that the text alignment is correctly presented',
                        outcome: 'While alignment is important, RTL testing requires comprehensive layout verification.',
                        experience: -10
                    },
                    {
                        text: 'Ignore formatting elements as long as the local matches the copy submitted by the client',
                        outcome: 'Formatting elements are crucial for RTL testing and include punctuation placement, number alignment and text alignment.',
                        experience: -5
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
                        text: 'Preface tickets with locale identifier (e.g., [FR], [ES])',
                        outcome: 'Correct! This is the correct approach for ease of identification.',
                        experience: 20,
                        tool: 'Issue Management'
                    },
                    {
                        text: 'Create separate bug trackers for each locale',
                        outcome: 'This would complicate issue management unnecessarily.',
                        experience: -15
                    },
                    {
                        text: 'Report all issues as standard practice without locale references',
                        outcome: 'This would make it difficult to track locale-specific issues.',
                        experience: -10
                    },
                    {
                        text: 'Group similar issues that occur across different locales',
                        outcome: 'While grouping can be useful, clear locale identification should be a primary objective.',
                        experience: -5
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
                        text: 'That messages are translated and display correctly in each locale',
                        outcome: 'Correct! This is a critical element for locale testing.',
                        experience: 20,
                        tool: 'Validation Testing'
                    },
                    {
                        text: 'Check if validation messages appear when moving through the form',
                        outcome: 'Merely checking presence is insufficient, actual correct message verification is also required.',
                        experience: -15
                    },
                    {
                        text: 'Verify all validation messages are positioned correctly',
                        outcome: 'While positioning is important, translation and correct display are primary objectives.',
                        experience: -10
                    },
                    {
                        text: 'Verify all validation messages display on one environment',
                        outcome: 'Validation messages and should be consistent across all environments.',
                        experience: -5
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
                        text: 'Balance testing across locales while maintaining thoroughness',
                        outcome: 'Correct! The importance of time management across locales can ensure equal or priority coverage is met',
                        experience: 20,
                        tool: 'Time Management'
                    },
                    {
                        text: 'Test focus should be solely worked through on a primary locale',
                        outcome: 'All scoped locales require appropriate coverage.',
                        experience: -15
                    },
                    {
                        text: 'Test one locale completely before moving to others',
                        outcome: 'While thorough, this might not be the most efficient approach relating to project timelines and deliverables.',
                        experience: -10
                    },
                    {
                        text: 'Conduct a random approach to testing of locales to gain the best coverage',
                        outcome: 'Unstructured testing would not ensure the best coverage and priority areas need to be taken into consideration',
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
                title: 'Language remnants',
                description: 'What approach should be taken when testing for language remnants?',
                options: [
                    {
                        text: 'Check all user interface elements, including hidden states and validation messages',
                        outcome: 'Correct! Comprehensive checking across all user interface elements is essential.',
                        experience: 25,
                        tool: 'Language Testing'
                    },
                    {
                        text: 'Check all main navigation features and headers throughout the system under test',
                        outcome: 'While important, this is not comprehensive enough and other crucial elements can be missed.',
                        experience: -15
                    },
                    {
                        text: 'Check all initial visible text on main pages',
                        outcome: 'This could miss many potential issues like validation messages and sub pages.',
                        experience: -10
                    },
                    {
                        text: 'Use automated translation detection for efficiency',
                        outcome: 'Manual verification is necessary for thorough testing as automation doesn\'t always detect every issue.',
                        experience: -5
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
                        text: 'Verify correct rendering and meaning preservation',
                        outcome: 'Correct! Diacritics must be checked for the importance of meaning.',
                        experience: 25,
                        tool: 'Diacritic Testing'
                    },
                    {
                        text: 'Leave diacritical mark issues out of reports as they are not critical',
                        outcome: 'This would miss crucial linguistic elements.',
                        experience: -15
                    },
                    {
                        text: 'Test for presence of diacritics within all available text',
                        outcome: 'Presence alone doesn\'t ensure correct usage or rendering.',
                        experience: -10
                    },
                    {
                        text: 'De-scope diacritics when locale testing unless specifically requested',
                        outcome: 'Diacritics can fundamentally alter the language and this should always be taken into consideration when testing locale.',
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
                        outcome: 'Correct! These are all specific elements requiring verification',
                        experience: 25,
                        tool: 'Format Testing'
                    },
                    {
                        text: 'Use standard formats when testing across all locales',
                        outcome: 'This would defeat the purpose of specific localisation testing.',
                        experience: -15
                    },
                    {
                        text: 'Check date formats when performing locale testing',
                        outcome: 'While important, this is only one aspect of formatting, other might include time or phone number formatting.',
                        experience: -10
                    },
                    {
                        text: 'Check there are format variations, but leave format confirmation for different languages',
                        outcome: 'Format verification is crucial for locale testing and should be cross referenced with copy provided by the client.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Text expansions',
                description: 'How should testers handle text expansion and contraction across different languages?',
                options: [
                    {
                        text: 'Verify layout integrity and check for truncation across all elements',
                        outcome: 'Correct! Checking for truncation and layout issues is essential to locale testing',
                        experience: 25,
                        tool: 'Text Expansion Testing'
                    },
                    {
                        text: 'Test with maximum length text to check for truncation',
                        outcome: 'This wouldn\'t catch all potential issues including layout integrity.',
                        experience: -15
                    },
                    {
                        text: 'Ignore text length variations as long as elements can be successfully navigated',
                        outcome: 'Text length variations can cause significant issues like layout integrity.',
                        experience: -10
                    },
                    {
                        text: 'Check all visible elements across the system under test for truncation',
                        outcome: 'While important, hidden states and dynamic content also need checking',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Language selectors',
                description: 'What approach should be taken when testing language toggles and selectors?',
                options: [
                    {
                        text: 'Verify content updates, loading behaviour, and state preservation',
                        outcome: 'Correct! It is important to check all these aspects of language switching.',
                        experience: 25,
                        tool: 'Language Switching'
                    },
                    {
                        text: 'Check for immediate visual changes under user input',
                        outcome: 'While important, this doesn\'t cover all necessary aspects like actual content updates.',
                        experience: -15
                    },
                    {
                        text: 'Verify that switching between languages occurs with user input',
                        outcome: 'Testing this only can miss many important aspects of language switching including actual content correctness.',
                        experience: -10
                    },
                    {
                        text: 'Ensure the system under test is responsive after switching languages',
                        outcome: 'Whilst this is important, crucial contact accuracy could be missed if responsiveness is tested only.',
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
        // Only end the game when all 15 questions are answered
        return (this.player?.questionHistory?.length || 0) >= 15;
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
            
            // Display the first scenario and start the timer
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

        // Clear the timer when an answer is submitted
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
        const questionNumber = totalAnswered >= 15 ? 15 : totalAnswered + 1;
        
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
            const progressPercentage = Math.min(100, (totalAnswered / (this.totalQuestions || 15)) * 100);
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

        // Hide the progress card on the end screen
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'none';
        }

        // Calculate final score based on correct answers
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && (q.selectedAnswer.experience === Math.max(...q.scenario.options.map(o => o.experience || 0)))
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
                
                const isCorrect = record.selectedAnswer && (record.selectedAnswer.experience === Math.max(...record.scenario.options.map(o => o.experience || 0)));
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
            q.selectedAnswer && (q.selectedAnswer.experience === Math.max(...q.scenario.options.map(o => o.experience || 0)))
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

        // Add specific variations if relevant
        if (quizName.toLowerCase().includes('locale')) {
            variations.push(
                'Locale-Testing',
                'locale-testing',
                'localeTesting',
                'Locale_Testing',
                'locale_testing'
            );
        }

        variations.forEach(variant => {
            localStorage.removeItem(`quiz_progress_${username}_${variant}`);
            localStorage.removeItem(`quizResults_${username}_${variant}`);
        });
    }
}

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Clear any existing quiz instances before starting this quiz
    BaseQuiz.clearQuizInstances('locale-testing');
    
    const quiz = new LocaleTestingQuiz();
    quiz.startGame();
}); 