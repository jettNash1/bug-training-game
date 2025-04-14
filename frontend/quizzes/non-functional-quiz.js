import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class NonFunctionalQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
            },
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a non-functional testing expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong non-functional testing skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing non-functional testing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
        value: 'non-functional',
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
                title: 'Understanding Non-Functional Testing',
                description: 'What is the primary focus of non-functional testing?',
                options: [
                    {
                        text: 'Testing how the system performs and operates, rather than what specific functions it does',
                        outcome: 'Perfect! Non-functional testing focuses on system characteristics and performance.',
                        experience: 15,
                        tool: 'Testing Framework',
                        isCorrect: true
                    },
                    {
                        text: 'Testing if specific user actions meet requirements criteria',
                        outcome: 'This type testing is related to functional testing. Non-functional testing examines system characteristics.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'To test if the application features meet requirements criteria',
                        outcome: 'Non-functional testing goes beyond feature testing and focus include performance and security testing.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'To test for defects in the code structure of the system under test',
                        outcome: 'Non-functional testing focuses on system behaviour and performance rather than actual code structure.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Non-functional Test Types',
                description: 'Which of the following is not a type of non-functional testing?',
                options: [
                    {
                        text: 'Performance testing',
                        outcome: 'Performance testing is a key type of non-functional testing that verifies how well the system works based on response time and throughput.',
                        experience: -5
                    },
                    {
                        text: 'Unit testing',
                        outcome: 'Correct! Unit testing is a type of functional testing that focuses on testing individual units or components of code, not the non-functional aspects of a system.',
                        experience: 15,
                        tool: 'Non-Functional Test Types'
                    },
                    {
                        text: 'Security testing',
                        outcome: 'Security testing is a type of non-functional testing, it\'s specifically focused on identifying vulnerabilities and ensuring data protection, which is one aspect of non-functional requirements.',
                        experience: -10
                    },
                    {
                        text: 'Load testing',
                        outcome: 'Load testing is a type of non-functional testing that checks how the system responds when the volume of data passing through it is increased.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Functional and Non-Functional Differences',
                description: 'What is the main difference between functional and non-functional testing?',
                options: [
                    {
                        text: 'Functional testing is based on customer requirements while non-functional testing is based on customer expectations',
                        outcome: 'Perfect! Functional testing verifies if the system works according to specified requirements, while non-functional testing addresses expectations about how well the system performs.',
                        experience: 15,
                        tool: 'Non Functional and Functional Testing Tool'
                    },
                    {
                        text: 'Functional testing is automated while non-functional testing is always manual',
                        outcome: 'Both functional and non-functional testing can be performed using either manual or automated approaches, depending on the specific requirements and context.',
                        experience: -10
                    },
                    {
                        text: 'Functional testing is important while non-functional testing is optional',
                        outcome: 'While non-functional features aren\'t mandatory for a system to operate, this type of testing is just as important as functional testing for ensuring overall quality.',
                        experience: -5
                    },
                    {
                        text: 'Functional testing is performed by users while non-functional testing is performed by developers',
                        outcome: 'Both types of testing are typically performed by testers or QA professionals, not necessarily developers or end users.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Inclusive Testing',
                description: 'Which type of non-functional testing evaluates the software\'s usability for all users, including those with disabilities?',
                options: [
                    {
                        text: 'Accessibility testing',
                        outcome: 'Excellent! Accessibility testing specifically evaluates the software\'s usability for all users, including those with visual, hearing, physical, cognitive, and developmental impairments, often against guidelines like WCAG.',
                        experience: 15,
                        tool: 'Accessibility Assessment'
                    },
                    {
                        text: 'Performance testing',
                        outcome: 'Performance testing verifies how well the system works based on response time and throughput, not accessibility for users with disabilities.',
                        experience: -10
                    },
                    {
                        text: 'Usability testing',
                        outcome: 'While usability testing does focus on the user experience and how user-friendly an application is, it doesn\'t specifically target accessibility for users with disabilities',
                        experience: -5
                    },
                    {
                        text: 'Compatibility testing',
                        outcome: 'Compatibility testing checks if the application is compatible with different hardware or software platforms, not specifically related to accessibility for users with disabilities.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Non-Functional Characteristics',
                description: 'What is a key characteristic of non-functional testing?',
                options: [
                    {
                        text: 'It should be measurable and not use subjective characterisations',
                        outcome: 'Perfect! Non-functional testing should be measurable, so there is no place for subjective characterisation, such as good, better, best, etc. Measurements provide objective evaluation criteria.',
                        experience: 15,
                        tool: 'Characteristics Non-Functional'
                    },
                    {
                        text: 'It should be subjective and based on tester opinion and experience',
                        outcome: 'While some aspects of non-functional testing (like usability) might involve user experience, non-functional testing should avoid subjective characterisation and should be measurable.',
                        experience: -10
                    },
                    {
                        text: 'This type of testing is only necessary for large-scale enterprise applications',
                        outcome: 'Non-functional testing is important for all software applications regardless of size or target audience, as it ensures qualities like performance, security, and usability.',
                        experience: -5
                    },
                    {
                        text: 'It is less important than functional testing as the system under test should focus on features first',
                        outcome: 'Non-functional testing is just as important as functional testing, as both ensure the product works as it should.',
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
                title: 'Non-Functional Testing Advantages',
                description: 'What is a key advantage of non-functional testing?',
                options: [
                    {
                        text: 'It improves user satisfaction by ensuring good usability and meeting performance expectations',
                        outcome: 'Excellent! Non-functional testing ensures the system has good usability and meets user expectations for performance and security, which increases user satisfaction.',
                        experience: 20,
                        tool: 'Usability Validator'
                    },
                    {
                        text: 'It requires fewer resources than other types of testing and can help meet project deadlines',
                        outcome: 'While there is a smaller overall time commitment compared to other testing procedures, this doesn\'t necessarily mean fewer resources, and it\'s not the key advantage of non-functional testing.',
                        experience: -15
                    },
                    {
                        text: 'It eliminates the need for functional testing and therefore can use less resources',
                        outcome: 'Non-functional testing complements functional testing; it doesn\'t replace it. Both are necessary for comprehensive quality assurance.',
                        experience: -10
                    },
                    {
                        text: 'This type of testing is faster to execute than functional testing',
                        outcome: 'The speed of execution depends on the specific tests being performed, not on whether they are functional or non-functional.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'No-Functional Limitations',
                description: 'Which of the following is a limitation or disadvantage of non-functional testing?',
                options: [
                    {
                        text: 'Non-functional requirements can be difficult to measure and test',
                        outcome: 'Perfect! Measuring and testing non-functional requirements can be challenging.',
                        experience: 20,
                        tool: 'Non-Functional Requirements'
                    },
                    {
                        text: 'Non-functional testing always requires specialised hardware',
                        outcome: 'While some types of non-functional testing (like performance or compatibility testing) might benefit from specialised hardware or environments, not all non-functional testing requires it.',
                        experience: -15
                    },
                    {
                        text: 'Non-functional testing doesn\'t find bugs critical to the system under test',
                        outcome: 'Non-functional testing can identify critical issues related to performance, security, usability, etc., which can be just as important as functional bugs.',
                        experience: -10
                    },
                    {
                        text: 'Non-functional testing can only be performed after production release',
                        outcome: 'Non-functional testing should be performed throughout the development lifecycle, not just after release. Early identification of non-functional issues can prevent costly rework later.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Non-Functional Test Case',
                description: 'In the context of the Zoonou non-functional testing approach, what action should be taken when a test case fails?',
                options: [
                    {
                        text: 'Record the failure with issue number in the tracker and add relevant notes',
                        outcome: 'When conducting non-functional tests, the tester should record the result (Pass, Fail, Blocked), and for failed tests, include the issue number from the bug tracker and add relevant notes about the failure.',
                        experience: 20,
                        tool: 'Non-Functional Test Case'
                    },
                    {
                        text: 'Immediately fix the issue in the code or request access to the code',
                        outcome: 'While fixing the issue is ultimately necessary, the tester\'s immediate responsibility is to document the failure properly so it can be addressed through the appropriate process. The tester may not be the person responsible for fixing the code.',
                        experience: -15
                    },
                    {
                        text: 'Leave the test case and continue with other, more important functionality test cases',
                        outcome: 'Failed tests should be properly documented, not skipped, as they represent real issues that need to be addressed.',
                        experience: -10
                    },
                    {
                        text: 'Repeat the test until it can be passed and documented within the test script',
                        outcome: 'Repeating a failing test without changes to the system won\'t change the outcome and wastes time. The issue should be documented and addressed through the proper development process.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Non-Functional Requirements',
                description: 'When implementing non-functional testing in a project with conflicting requirements, what\'s the most appropriate approach?',
                options: [
                    {
                        text: 'Balance and prioritise requirements based on project needs and stakeholder input',
                        outcome: 'Perfect! Conflicting requirements is a challenge, balancing and prioritising them is necessary. This would involve considering project needs and stakeholder input to determine which requirements take precedence.',
                        experience: 20,
                        tool: 'Volume Test Framework'
                    },
                    {
                        text: 'Always prioritize security requirements over performance requirements',
                        outcome: 'While security is critically important, automatically prioritising it over all other requirements isn\'t appropriate. The right balance depends on the specific project context, stakeholders\' needs, and the nature of the application.',
                        experience: -15
                    },
                    {
                        text: 'Implement all requirements regardless of any conflicts they have with each other',
                        outcome: 'When requirements conflict, it\'s typically not possible to fully implement all of them. Priorities must be established to resolve conflicts effectively.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on requirements that can be easily measured within the system under test',
                        outcome: 'While measurability is important for non-functional testing, ignoring difficult-to-measure requirements simply because they\'re challenging, isn\'t appropriate. Important requirements should be addressed even if measurement is complex.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Non-Functional Library',
                description: 'What is the primary purpose of the Zoonou non-functional library?',
                options: [
                    {
                        text: 'To provide a standardised set of non-functional tests for different testing environments',
                        outcome: 'Excellent! The Zoonou non-functional library can be accessed within the standard test script, full script and exploratory script templates. It contains an extensive set and range of non-functional tests to be used for testing.',
                        experience: 20,
                        tool: 'No-Functional Library'
                    },
                    {
                        text: 'To replace functional testing requirements in test scripts',
                        outcome: 'While the non-functional library does provide tests that are separate from functional requirements, it doesn\'t replace functional testing. Rather, complementing them.',
                        experience: -15
                    },
                    {
                        text: 'To automate the execution of all non-functional tests within the system under test',
                        outcome: 'Testers manually execute the tests and record results. The library helps organise and select tests, but doesn\'t automate their execution.',
                        experience: -10
                    },
                    {
                        text: 'To track bugs and defects found during non-functional testing',
                        outcome: 'While the test script includes a column for "Issue Number" to reference bugs in an issue tracker, the primary purpose of the library is to provide the tests themselves, not to serve as a bug tracking system.',
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
                title: 'Non-Functional Library Set',
                description: 'How are non-functional tests organised in the Zoonou library?',
                options: [
                    {
                        text: 'By testing phase (Alpha/Beta) and environment variants',
                        outcome: 'Perfect! The non-functional library is set out into Alpha and Beta phase column areas, with sub-columns for each primary environment variant.',
                        experience: 25,
                        tool: 'Installation Validator'
                    },
                    {
                        text: 'By test complexity and duration',
                        outcome: 'The organisation is primarily by phase and environment, with functional areas as categories within those.',
                        experience: -15
                    },
                    {
                        text: 'By functional area and user story',
                        outcome: 'The organisation is primarily by phase and environment, with functional areas as categories within those.',
                        experience: -10
                    },
                    {
                        text: 'By priority and severity level',
                        outcome: 'The organisation is primarily by phase and environment, with functional areas as categories within those.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Test Library Execution',
                description: 'What action should a tester take after selecting non-functional tests from the library?',
                options: [
                    {
                        text: 'Execute the tests and record results in the appropriate columns',
                        outcome: 'Excellent! After selecting tests from the library, these tests auto-populate in the Non-Functional Tests tab or section. The tester then needs to execute these tests and manually record details.',
                        experience: 25,
                        tool: 'Test Library Execution'
                    },
                    {
                        text: 'Immediately hide the non-functional library tab',
                        outcome: 'The non-functional library tab can be hidden from view in the sheet once all non-functional test case selections have been decided upon, but this is optional and not the immediate next step.',
                        experience: -15
                    },
                    {
                        text: 'Manually add each selected test to the Non-Functional Tests tab',
                        outcome: 'when a test is selected, it will auto-populate within the Non-Functional Tests tab. This happens automatically, not manually.',
                        experience: -10
                    },
                    {
                        text: 'Create new test cases based on the selected templates',
                        outcome: 'The library already contains test cases. Testers select existing tests rather than creating new ones based on templates.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'JavaScript Disable Test',
                description: 'When testing a web application by disabling JavaScript, what is the expected behaviour that would constitute a passing test?',
                options: [
                    {
                        text: 'The site should display a warning message and still render, with non-JavaScript functionality available',
                        outcome: 'Perfect! The site under test should still render and function as expected when JavaScript is disabled. Where JavaScript is necessary for certain content, a warning message should display to inform the user of this.',
                        experience: 25,
                        tool: 'JavaScript Checker'
                    },
                    {
                        text: 'The site should function exactly the same as with JavaScript enabled',
                        outcome: 'While the site should still render and function as expected, this doesn\'t mean it functions exactly the same.',
                        experience: -15
                    },
                    {
                        text: 'The site should redirect to a static HTML version automatically',
                        outcome: 'The document doesn\'t mention redirecting to a static HTML version as a requirement or expected behaviour.',
                        experience: -10
                    },
                    {
                        text: 'The page should prevent loading until JavaScript is re-enabled',
                        outcome: 'The site should still render and function when JavaScript is disabled.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Non-Functional Metrics',
                description: 'What metrics are calculated and displayed for non-functional tests in the exploratory script?',
                options: [
                    {
                        text: 'Tests complete, percentage complete, tests remaining, percentage remaining, blocked tests, percentage blocked, and total tests',
                        outcome: 'Excellent! These are the metrics that relate to the non-functional test cases.',
                        experience: 25,
                        tool: 'Non-Functional Metrics check'
                    },
                    {
                        text: 'Pass rate, fail rate, and average execution time',
                        outcome: 'While the metrics do track completion status which could be related to pass/fail rates, they don\'t specifically calculate pass and fail rates in these terms.',
                        experience: -15
                    },
                    {
                        text: 'Issue severity, priority levels, and resolution time',
                        outcome: 'These metrics relate to bug tracking but aren\'t mentioned as part of the non-functional metrics table.',
                        experience: -10
                    },
                    {
                        text: 'Test coverage, code quality, and performance indicators',
                        outcome: 'These are important software quality metrics but aren\'t listed as part of the non-functional test metrics tracked in the exploratory script.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Non-Functional Library Workflow',
                description: 'What workflow challenge might arise when a tester needs to select an extensive number of non-functional tests for a suite?',
                options: [
                    {
                        text: 'The tester needs to ensure there are enough rows available in the suite before selection',
                        outcome: 'Perfect! Each suite is made up of a total of ten rows by default. The tester can add in additional rows when more than ten non-functional tests are required to be selected for this suite.',
                        experience: 25,
                        tool: 'Non-Functional Library Suite'
                    },
                    {
                        text: 'The non-functional library might not contain enough test cases for comprehensive testing',
                        outcome: 'While it\'s possible that a very specialised project might need tests beyond what\'s in the library, the current library is "extensive" and contains many categories.',
                        experience: -15
                    },
                    {
                        text: 'Automated test execution might timeout with too many tests selected',
                        outcome: 'Non-functional test cases within the library are executed manually.',
                        experience: -10
                    },
                    {
                        text: 'The metrics calculations will become inaccurate with large test volumes',
                        outcome: 'Metrics calculations would not be affected by the volume of tests. The concern is about having enough rows to accommodate all selected tests.',
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
            q.selectedAnswer && (q.selectedAnswer.isCorrect || q.selectedAnswer.experience > 0)
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
            localStorage.setItem(storageKey, JSON.stringify({ data: progress }));
            
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
                    progress = parsed.data || parsed;
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
        
        // Check if we've answered all questions
        if (this.shouldEndGame()) {
            const scorePercentage = this.calculateScorePercentage();
            this.endGame(scorePercentage < this.passPercentage);
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
                    }, 300);
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

            // Keep track of experience for backward compatibility
            this.player.experience = Math.max(0, Math.min(this.maxXP, this.player.experience + selectedAnswer.experience));
            
            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;
            
            // Add to question history with isCorrect property
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: selectedAnswer.isCorrect || selectedAnswer.experience > 0,
                timeSpent: timeSpent,
                timedOut: false
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();

            // Calculate the score percentage
            const scorePercentage = this.calculateScorePercentage();
            
            // Save quiz result
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                await quizUser.updateQuizScore(
                    this.quizName,
                    scorePercentage,
                    this.player.experience,
                    this.player.tools,
                    this.player.questionHistory,
                    this.player.questionHistory.length
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
            
            // Check if we should end the game
            if (this.shouldEndGame()) {
                await this.endGame(scorePercentage < this.passPercentage);
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of non-functional testing. You clearly understand the nuances of non-functional testing and are well-equipped to handle any non-functional testing challenges!</p>';
        } else if (scorePercentage >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your non-functional testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('load') || description.includes('load')) {
            return 'Load Testing';
        } else if (title.includes('stress') || description.includes('stress')) {
            return 'Stress Testing';
        } else if (title.includes('compatibility') || description.includes('compatibility')) {
            return 'Compatibility Testing';
        } else if (title.includes('accessibility') || description.includes('accessibility')) {
            return 'Accessibility Testing';
        } else if (title.includes('performance') || description.includes('performance')) {
            return 'Performance Testing';
        } else if (title.includes('security') || description.includes('security')) {
            return 'Security Testing';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Documentation Testing';
        } else {
            return 'General Non-Functional Testing';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Load Testing': 'Focus on improving system load testing strategies, including varied data volumes and peak conditions.',
            'Stress Testing': 'Enhance your approach to stress testing by systematically pushing system limits and monitoring behavior.',
            'Compatibility Testing': 'Strengthen testing across different platforms, browsers, and system configurations.',
            'Accessibility Testing': 'Improve WCAG compliance testing and verification of accessibility features.',
            'Performance Testing': 'Develop better performance metrics analysis and optimization strategies.',
            'Security Testing': 'Focus on comprehensive security testing methodologies and vulnerability assessments.',
            'Documentation Testing': 'Work on thorough documentation verification and consistency checking.',
            'General Non-Functional Testing': 'Continue developing fundamental non-functional testing principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core non-functional testing principles.';
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

        // Calculate score percentage
        const scorePercentage = this.calculateScorePercentage();
        const isPassed = scorePercentage >= this.passPercentage;
        
        // Determine final status
        const finalStatus = failed ? 'failed' : (isPassed ? 'passed' : 'failed');
        
        // Save the final quiz result with pass/fail status
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                console.log('Setting final quiz status:', { status: finalStatus, score: scorePercentage });
                
                // Save to QuizUser
                await user.updateQuizScore(
                    this.quizName,
                    scorePercentage,
                    this.player.experience,
                    this.player.tools,
                    this.player.questionHistory,
                    this.player.questionHistory.length,
                    finalStatus
                );

                // Clear localStorage data for this quiz
                this.clearQuizLocalStorage(username, this.quizName);

                // Save to API with proper structure
                const progress = {
                    experience: this.player.experience,
                    tools: this.player.tools,
                    currentScenario: this.player.currentScenario,
                    questionHistory: this.player.questionHistory,
                    lastUpdated: new Date().toISOString(),
                    questionsAnswered: this.player.questionHistory.length,
                    status: finalStatus,
                    scorePercentage: scorePercentage
                };

                // Save directly via API to ensure status is updated
                console.log('Saving final progress to API:', progress);
                await this.apiService.saveQuizProgress(this.quizName, progress);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${scorePercentage}%`;

        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = failed ? 'Quiz Failed!' : 'Quiz Complete!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (failed) {
            performanceSummary.textContent = `Quiz failed. You scored ${scorePercentage}% but needed at least ${this.passPercentage}% to pass.`;
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
            // Find the appropriate threshold message
            const threshold = this.config.performanceThresholds.find(t => t.threshold <= scorePercentage);
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
                
                const isCorrect = record.isCorrect;
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

    // Utility method to clean up localStorage
    clearQuizLocalStorage(username, quizName) {
        const variations = [
            quizName,
            quizName.toLowerCase(),
            quizName.toUpperCase(),
            quizName.replace(/-/g, ''),
            quizName.replace(/([A-Z])/g, '-$1').toLowerCase(),
            quizName.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
            quizName.replace(/-/g, '_')
        ];

        variations.forEach(variant => {
            localStorage.removeItem(`quiz_progress_${username}_${variant}`);
            localStorage.removeItem(`quizResults_${username}_${variant}`);
        });
    }
}

// Add DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new NonFunctionalQuiz();
    quiz.startGame();
});