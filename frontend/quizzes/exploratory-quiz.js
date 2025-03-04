import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class ExploratoryQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a exploratory testing expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong exploratory testing skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing exploratory testing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'exploratory-quiz',
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
                title: 'Understanding Exploratory Testing',
                description: 'What is the primary objective of exploratory-based testing?',
                options: [
                    {
                        text: 'To discover defects while dynamically exploring the application under test',
                        outcome: 'Correct! Exploratory testing is primarily aimed at discovering defects through dynamic investigation of the software without following predefined test cases.',
                        experience: 15,
                        tool: 'Exploratory testing Framework'
                    },
                    {
                        text: 'To create detailed test cases within a test script before execution',
                        outcome: 'Exploratory testing specifically does not rely on detailed test case documentation created in advance.',
                        experience: -5
                    },
                    {
                        text: 'To focus on cosmetic issues within the application under test',
                        outcome: 'While cosmetic issues may be identified, exploratory testing focuses broadly on functionality, user experience, and behaviour, not exclusively on cosmetic issues.',
                        experience: -10
                    },
                    {
                        text: 'To replace all other forms of test approach for the application under test',
                        outcome: 'While exploratory testing is valuable, it complements rather than replaces other testing approaches, as it has both advantages and disadvantages.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Exploratory Test Execution',
                description: 'When should initial exploratory functional testing typically take place?',
                options: [
                    {
                        text: 'Exploratory testing should be performed after the application is fully developed',
                        outcome: 'Waiting until full development would defeat the purpose of early issue identification.',
                        experience: -5
                    },
                    {
                        text: 'Exploratory testing should be performed only during the final testing phase',
                        outcome: 'Initial exploratory testing is meant to be performed early to catch identification of issues earlier in the testing process, not during final testing phases.',
                        experience: -10
                    },
                    {
                        text: 'Exploratory testing should be performed in the early stages of development',
                        outcome: 'Correct! Initial exploratory testing usually takes place early in development when full functionality may not be in place and styling may not have been applied. It aims to raise issues early enough that fundamental changes can still be considered.',
                        experience: 15,
                        tool: 'Exploratory Test Execution'
                    },
                    {
                        text: 'Exploratory testing should be performed when all styling has been applied',
                        outcome: 'Styling may not have been applied during initial exploratory testing and the client can communicate this by relaying what is out of scope.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Exploratory Characteristics',
                description: 'Which of the following is a key characteristic of exploratory testing?',
                options: [
                    {
                        text: 'Test cases are executed without prior in depth preparation',
                        outcome: 'Perfect! Exploratory testing involves executing tests without prior in depth preparation. Testers actively think of scenarios as they interact with the software, using creativity and intuition rather than following predefined steps.',
                        experience: 15,
                        tool: 'Exploratory Characteristics'
                    },
                    {
                        text: 'Complete test coverage of the application under test is guaranteed',
                        outcome: 'Incomplete test coverage is a potential risk of exploratory testing.',
                        experience: -10
                    },
                    {
                        text: 'Exploratory testing follows a rigid, predetermined path',
                        outcome: 'Exploratory testing is dynamic and flexible, not rigid or predetermined.',
                        experience: -5
                    },
                    {
                        text: 'Detailed test case documentation is required in advance for exploratory testing',
                        outcome: 'Unlike traditional scripted testing, exploratory testing does not require detailed test case documentation in advance.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Exploratory Prioritisation',
                description: 'What should testers prioritise during initial exploratory functional testing?',
                options: [
                    {
                        text: 'Key functionality and expected behaviours should be prioritised during exploratory testing',
                        outcome: 'Excellent! Initial exploratory testing generally focuses on key functionality and current expected behaviours, rather than minor or cosmetic issues. It provides a baseline of where the software stands and raises critical functional issues early.',
                        experience: 15,
                        tool: 'Exploratory Testing Assessment'
                    },
                    {
                        text: 'Detailed cosmetic issues should be prioritised during exploratory testing',
                        outcome: 'Whilst important, initial exploratory testing should not focus on minor or cosmetic issues and rather key functional behaviour.',
                        experience: -10
                    },
                    {
                        text: 'All possible defects regardless of severity should have equal priority and focus',
                        outcome: 'While identifying defects is important, initial exploratory testing prioritises key functionality, rather than capturing all possible issues regardless of severity.',
                        experience: -5
                    },
                    {
                        text: 'Testing every feature thoroughly should be prioritised during exploratory testing',
                        outcome: 'Initial exploratory testing is high-level and not meant to test every feature thoroughly, especially since parts of the application may still be in development.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Exploratory Test Details Table',
                description: 'What information should be entered in the "Test Details" section of an exploratory script?',
                options: [
                    {
                        text: 'Test details should include document owner, project manager, testers, and final reviewer',
                        outcome: 'Perfect! When setting up an exploratory script, the Test Details table should include the Document Owner (person who created the script), Project Manager (Test Delivery Manager), Testers (all involved in the project), and Final Review by (person who reviewed and signed off on the script).',
                        experience: 15,
                        tool: 'Test Details Table'
                    },
                    {
                        text: 'All test cases to be executed should be included in the test details section of the script',
                        outcome: 'Test cases are not predefined in exploratory testing except in the non-functional tests section.',
                        experience: -10
                    },
                    {
                        text: 'The project manager\'s information should be entered into the test details section of the script',
                        outcome: 'The test details should include multiple people involved, not just the project manager.',
                        experience: -5
                    },
                    {
                        text: 'Bug severity ratings should be included in the test details section of the exploratory script',
                        outcome: 'Bug severity ratings are not part of the test details section but would be documented separately in the issues tab.',
                        experience: 0
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10, 100 XP total, 20 XP each)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Exploratory Focus Areas',
                description: 'How should "Focus Areas" be determined when setting up an exploratory script?',
                options: [
                    {
                        text: 'By identifying what users need to achieve and what\'s vital to functionality',
                        outcome: 'Excellent! Focus areas should be determined by identifying what the user is looking to achieve and what is vital to the functionality of the project. This helps structure the testing approach while maintaining flexibility.',
                        experience: 20,
                        tool: 'Focus Area Validation'
                    },
                    {
                        text: 'Focus areas should be determined by listing every possible feature of the software',
                        outcome: 'While focus areas should cover key functionality, listing every possible feature would make the approach too rigid and closer to scripted testing.',
                        experience: -15
                    },
                    {
                        text: 'Focus areas can be determined by copying from previous similar projects',
                        outcome: 'Focus areas should be tailored to the specific project rather than copied from previous work.',
                        experience: -10
                    },
                    {
                        text: 'Focus areas should be detailed as a priority on cosmetic elements',
                        outcome: 'Focus areas should prioritise functionality rather than focusing on cosmetic elements.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Exploratory Testing Risks',
                description: 'What is a risk of relying solely on exploratory testing?',
                options: [
                    {
                        text: 'It may lead to incomplete test coverage due to time constraints',
                        outcome: 'A disadvantage of exploratory testing is potentially incomplete test coverage. As a time-based approach, testing might uncover numerous issues in one area, but time constraints may prevent discovering all bugs comprehensively.',
                        experience: 20,
                        tool: 'Exploratory Risk Check'
                    },
                    {
                        text: 'Solely focusing on exploratory testing can makes test activities too rigid',
                        outcome: 'Exploratory testing is flexible in nature, not rigid like other scripted test approaches.',
                        experience: -15
                    },
                    {
                        text: 'This type of approach can require too much documentation',
                        outcome: 'Exploratory testing requires less documentation than scripted testing.',
                        experience: -10
                    },
                    {
                        text: 'This type of approach always takes longer than scripted testing',
                        outcome: 'While time management can be a challenge, exploratory testing doesn\'t always take longer than scripted testing; in fact, it can be more time-efficient by eliminating the need for extensive test case preparation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Non-Functional Test Cases',
                description: 'When executing non-functional tests in an exploratory script, what is different compared to focus area testing?',
                options: [
                    {
                        text: 'Non-functional tests involve executing clearly defined test cases',
                        outcome: 'Executing non-functional tests is different from focus area testing because it involves executing clearly defined test cases rather than exploring. These are the only areas within an exploratory script that contain pre-defined test cases.',
                        experience: 20,
                        tool: 'Non-Functional Test Case'
                    },
                    {
                        text: 'Non-functional tests don\'t require notes or observations within the documentation',
                        outcome: 'Non-functional tests still require notes and observations to be recorded for traceability.',
                        experience: -15
                    },
                    {
                        text: 'Non-functional tests can be left if time constraints do not allow them and all functional tests have been completed',
                        outcome: 'Non-functional tests are an important part of the testing process and shouldn\'t be skipped due to time constraints.',
                        experience: -10
                    },
                    {
                        text: 'Non-functional tests don\'t need to be selected for each primary environment',
                        outcome: 'Non-functional tests should be selected based on relevance to the specific primary environment being tested, not applied universally without consideration.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Compatibility Testing',
                description: 'How should bugs be documented when testing compatibility environments?',
                options: [
                    {
                        text: 'List global issues as "#Global issues observed" and add newly discovered issues to notes',
                        outcome: 'Perfect! When documenting bugs in compatibility environments, testers should list global issues as "#Global issues observed". Newly discovered issues should be added to the notes, making it easier to identify environment-specific problems.',
                        experience: 20,
                        tool: 'Exploratory Compatibility Framework'
                    },
                    {
                        text: 'Every issue must be documented in full detail for each environment',
                        outcome: 'It is not the preferred approach to list every known issue for each device, if the ticket isn\'t device-specific. This could cause make this section difficult to follow and all issues should also be raised in the issues tab already',
                        experience: -15
                    },
                    {
                        text: 'Only issues specific to that environment should be noted in the compatibility environments section',
                        outcome: 'While newly discovered issues should be noted, the approach should also acknowledge previously discovered issues that are present in the current environment.',
                        experience: -10
                    },
                    {
                        text: 'Issues should only be documented for the primary environment',
                        outcome: 'Issues should be documented for all environments, not just the primary one',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Exploratory Time Management',
                description: 'What should happen if a tester believes there are more defects in an area but has run out of allotted time?',
                options: [
                    {
                        text: 'Note that more defects are apparent, and additional time may be required',
                        outcome: 'Excellent! If an area still has defects and time has run out, the tester should leave a note indicating they believe more defects are apparent and additional time may be required. They should also inform the Test Delivery Manager so this can be communicated to the client if necessary.',
                        experience: 20,
                        tool: 'Exploratory Test Management'
                    },
                    {
                        text: 'Leave these potential defects if they are believed to be minor and move on',
                        outcome: 'Ignoring potential defects contradicts the purpose of exploratory testing, which is to discover issues.',
                        experience: -15
                    },
                    {
                        text: 'Extend testing time to address all potential issues without informing the project manager',
                        outcome: 'Extending testing time without authorisation would affect project timelines and potentially impact other scheduled work.',
                        experience: -10
                    },
                    {
                        text: 'Mark the area as fully tested to be able to adhere to project timelines and deliverables',
                        outcome: 'Falsely marking an area as fully tested when there are suspected undiscovered issues would be misleading.',
                        experience: -5
                    }
                ]
            }
        ];
        
        // Advanced Scenarios (IDs 11-15, 125 XP total, 25 XP each)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Exploratory Testing Scenario',
                description: 'When should exploratory testing be considered more appropriate than scripted testing?',
                options: [
                    {
                        text: 'When exploring user behaviour, functionality, and experience in a dynamic manner',
                        outcome: 'Perfect! This allows testers to use creativity and intuition to discover defects organically while taking a user-centric approach.',
                        experience: 25,
                        tool: 'Installation Validator'
                    },
                    {
                        text: 'When the application requires thorough regression testing',
                        outcome: 'Regression testing typically benefits from scripted tests to ensure consistent verification of previously working functionality.',
                        experience: -15
                    },
                    {
                        text: 'When preparing for a full release of the application under test to a production environment',
                        outcome: 'While exploratory testing can be valuable before a production release, a combination of approaches is typically best for ensuring comprehensive coverage including non-functional tests.',
                        experience: -10
                    },
                    {
                        text: 'When documenting every step of the testing process is critical to the project',
                        outcome: 'Exploratory testing deliberately does not document every step, focusing instead on observations and findings.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Exploratory Test Skills',
                description: 'How does the effectiveness of exploratory testing relate to tester skills?',
                options: [
                    {
                        text: 'Exploratory testing effectiveness heavily depends on tester skills, experience, and knowledge',
                        outcome: 'Excellent! Less experienced testers might overlook important defects or fail to identify critical areas to test, making tester expertise a significant factor.',
                        experience: 25,
                        tool: 'Exploratory Test Skills'
                    },
                    {
                        text: 'Tester skills have minimal impact on exploratory testing effectiveness',
                        outcome: 'Tester skills have a substantial impact on exploratory testing effectiveness.',
                        experience: -15
                    },
                    {
                        text: 'Only testers with formal certification should perform exploratory testing',
                        outcome: 'Formal certification is not a requirement for exploratory testing; skills, experience, and knowledge are, however, factors.',
                        experience: -10
                    },
                    {
                        text: 'All testers will discover the same defects regardless of experience',
                        outcome: 'Different testers will likely discover different defects based on their experience, approach, and expertise.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Exploratory Focus Time',
                description: 'In an exploratory testing approach, how should time be allocated across different focus areas?',
                options: [
                    {
                        text: 'More time should be allocated to areas with important functionality',
                        outcome: 'Perfect! When setting up an exploratory script, time should be allocated appropriately to each focus area, with more time assigned to areas containing important functionality. For example, a simple footer would have less time allocated compared to a checkout process.',
                        experience: 25,
                        tool: 'JavaScript Checker'
                    },
                    {
                        text: 'Equal time should be given to all focus areas stated in the test script',
                        outcome: 'Equal time allocation doesn\'t account for the varying complexity and importance of different areas.',
                        experience: -15
                    },
                    {
                        text: 'Focus areas with known issues should be avoided and addressed if possible, when all other areas have been covered to save time',
                        outcome: 'Focus areas with known issues should still be tested, not avoided.',
                        experience: -10
                    },
                    {
                        text: 'Time allocation should follow a fixed percentage for each type of functionality',
                        outcome: 'While different types of functionality may warrant different time allocations, using fixed percentages would be too rigid and might not reflect the specific needs of the project.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Issue Documentation',
                description: 'When documenting issues in an exploratory script, what information is required in the Issues tab?',
                options: [
                    {
                        text: 'Issue title (with number and hyperlink), issue number, severity, ticket type, environment, status, reporter, date raised, and optional notes',
                        outcome: 'Excellent! When adding issues to the Issues tab, all of these details should be included.',
                        experience: 25,
                        tool: 'Issue Documentation'
                    },
                    {
                        text: 'Pass rate, fail rate, and average execution time',
                        outcome: 'These are metrics and not issue details to be documented in the issues tab.',
                        experience: -15
                    },
                    {
                        text: 'A detailed reproduction path for each issue should be included in the issue tab',
                        outcome: 'While reproduction steps are important in the actual issue ticket, the Issues tab in the exploratory script doesn\'t specifically require detailed reproduction paths to be duplicated there.',
                        experience: -10
                    },
                    {
                        text: 'Issues that affect the primary environment should be included in the issue tab',
                        outcome: 'Issues affecting all environments should be documented, not just the primary environment.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Exploratory Time Management',
                description: 'How should an exploratory tester balance time management with thorough investigation?',
                options: [
                    {
                        text: 'By using a time-boxed approach for each focus area while prioritising based on functionality importance',
                        outcome: 'Perfect! Time management in exploratory testing is best approached by using time-boxed sessions for each focus area, sticking to the allotted time as closely as possible, and prioritising areas with important functionality. This ensures expected test coverage can be completed while focusing on the most critical aspects.',
                        experience: 25,
                        tool: 'Exploratory Time Management'
                    },
                    {
                        text: 'By exploring areas that are likely to have defects within the application under test',
                        outcome: 'While focusing on areas likely to have defects can be efficient, it might miss issues in unexpected places, and all focus areas still need some level of coverage.',
                        experience: -15
                    },
                    {
                        text: 'By strictly adhering to predefined test cases within the test script',
                        outcome: 'Exploratory testing deliberately avoids predefined test cases (except for non-functional tests).',
                        experience: -10
                    },
                    {
                        text: 'By extending testing time whenever necessary to make sure thorough coverage is performed',
                        outcome: 'Extending testing time could affect project timelines and potentially impact other scheduled work.',
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
            if (selectedAnswer.experience < correctAnswer.experience) {
                outcomeText += `\n\n\nThe correct answer was: "${correctAnswer.text}"\n${correctAnswer.outcome}`;
            }
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of exploratory testing. You clearly understand the principles and practices of exploratory testing and are well-equipped to handle any exploratory testing challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your exploratory testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('focus') || description.includes('focus area')) {
            return 'Focus Area Management';
        } else if (title.includes('time') || description.includes('time')) {
            return 'Time Management';
        } else if (title.includes('documentation') || description.includes('document')) {
            return 'Documentation';
        } else if (title.includes('test skills') || description.includes('skills')) {
            return 'Testing Skills';
        } else if (title.includes('compatibility') || description.includes('environment')) {
            return 'Environment Testing';
        } else if (title.includes('non-functional') || description.includes('non-functional')) {
            return 'Non-Functional Testing';
        } else if (title.includes('risk') || description.includes('risk')) {
            return 'Risk Management';
        } else {
            return 'General Exploratory Testing';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Focus Area Management': 'Improve understanding of how to identify and prioritize focus areas based on user needs and functionality importance.',
            'Time Management': 'Strengthen time-boxed testing approach and prioritization of testing activities based on functionality importance.',
            'Documentation': 'Enhance documentation practices for issues, test details, and observations while maintaining exploratory testing flexibility.',
            'Testing Skills': 'Develop expertise in dynamic testing approaches and improve ability to discover defects through creative exploration.',
            'Environment Testing': 'Improve cross-environment testing strategies and documentation of global versus environment-specific issues.',
            'Non-Functional Testing': 'Strengthen understanding of executing predefined non-functional test cases within exploratory scripts.',
            'Risk Management': 'Better understand and manage the risks associated with exploratory testing, particularly regarding test coverage.',
            'General Exploratory Testing': 'Continue developing fundamental exploratory testing principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core exploratory testing principles.';
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

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new ExploratoryQuiz();
    quiz.startGame();
}); 