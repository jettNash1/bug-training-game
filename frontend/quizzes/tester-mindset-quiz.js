import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class TesterMindsetQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a testing mindset expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong testing instincts!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing testing mindset best practices and try again!' }
            ]
        };
        
        super(config);

        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'tester-mindset',
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

        // Bind event handlers to prevent duplicates
        this.handleAnswerBound = this.handleAnswer.bind(this);

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

        // Basic Scenarios (Focus on Fundamental Mindset Concepts)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Project Context',
                description: "You're starting a new testing project. What's your first priority?",
                options: [
                    {
                        text: 'Review all the requirements for the project provided by the client',
                        outcome: 'Excellent! Understanding context is crucial for effective testing.',
                        experience: 15,
                        tool: 'Context Analysis Framework'
                    },
                    {
                        text: 'Begin extensive exploratory testing sessions to identify potential issues and document findings for immediate stakeholder review',
                        outcome: 'Without understanding context first, testing straight away may miss critical issues.',
                        experience: -5
                    },
                    {
                        text: 'Create comprehensive test cases based on industry best practices and previous project experience',
                        outcome: 'Test cases should be based on project context and requirements.',
                        experience: -5
                    },
                    {
                        text: 'Analyse historical test results of older releases of the same project',
                        outcome: 'While helpful, previous results don\'t replace understanding of current project context.',
                        experience: 5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Understanding the Audience',
                description: 'How do you approach understanding the target audience for a new project?',
                options: [
                    {
                        text: 'Research user needs to gather information on target audiences',
                        outcome: 'Perfect! User-centric thinking is essential for effective testing.',
                        experience: 15,
                        tool: 'User Persona Template'
                    },
                    {
                        text: 'Apply personal usage patterns and preferences to determine the most likely user behaviours and testing scenarios',
                        outcome: 'Users have diverse needs and characteristics that must be considered and not just that of a testers own usage pattern.',
                        experience: -5
                    },
                    {
                        text: 'Conduct detailed technical analysis of system architecture and performance metrics to establish testing priorities',
                        outcome: 'Technical aspects are important but user needs are crucial for understanding of a target audience.',
                        experience: -5
                    },
                    {
                        text: 'Wait for post-release feedback to gather user trends and behaviour',
                        outcome: 'Understanding users before testing begins, can help prevent issues in the testing process.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Test Environment Setup',
                description: "The test environment is different from production. What's your approach?",
                options: [
                    {
                        text: 'Document the environment differences to be taken into consideration for test results',
                        outcome: 'Excellent! Understanding environment differences is crucial for testing and can be factored into any results.',
                        experience: 15,
                        tool: 'Environment Comparison Tool'
                    },
                    {
                        text: 'Proceed with testing while monitoring for any potential environmental impact on test results.',
                        outcome: 'Environment differences can affect testing activities and result in missed issues if not documented for reference first.',
                        experience: -5
                    },
                    {
                        text: 'Execute test cases in the production environment to ensure accurate results',
                        outcome: 'Testing in production without correct user control can lead to unwarranted risks within the system.',
                        experience: -10
                    },
                    {
                        text: 'Request environment replication to safely conduct testing activities.',
                        outcome: 'Good thinking, but first, the current differences must be documented.',
                        experience: 10
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Test Documentation',
                description: "You've found several issues. How do you document them?",
                options: [
                    {
                        text: 'Document the issues with steps and results for ease of replication',
                        outcome: 'Perfect! Clear documentation helps developers fix issues efficiently.',
                        experience: 15,
                        tool: 'Issue Documentation Template'
                    },
                    {
                        text: 'Initiate multiple communication channels including chat messages, emails, and verbal discussions for each discovered issue.',
                        outcome: 'Informal communication isn\'t sufficient for tracking issues, as important information can become lost.',
                        experience: -5
                    },
                    {
                        text: 'Capture and archive comprehensive visual documentation through multiple screenshot angles and screen recordings',
                        outcome: 'Screenshots alone don\'t provide enough context and more detail is required such as steps and results.',
                        experience: -10
                    },
                    {
                        text: 'Create brief descriptions for all the issues raised to make sure project time management can be met.',
                        outcome: 'More detail would help developers understand and fix issues.',
                        experience: 5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Test Planning',
                description: 'How do you prepare for a new testing project?',
                options: [
                    {
                        text: 'Review requirements, create test strategy, and identify risks',
                        outcome: 'Excellent! Thorough preparation leads to effective testing.',
                        experience: 15,
                        tool: 'Test Planning Framework'
                    },
                    {
                        text: 'Start testing straight away to meet project timeline and deliverables',
                        outcome: 'A lack of planning can lead to inefficient testing.',
                        experience: -5
                    },
                    {
                        text: 'Copy a test plan from previous project for efficiency',
                        outcome: 'Each project needs its own test approach and the need for specific testing tailored to each project is essential.',
                        experience: -5
                    },
                    {
                        text: 'Ask developers what and which areas to test within the project',
                        outcome: 'Developer input helps but thorough planning is required as a developer mindset is not always the same as an end user.',
                        experience: 5
                    }
                ]
            },
            // Additional Basic Scenarios from Guide - Tester Mindset Additional Questions
            {
                id: 16,
                level: 'Basic',
                title: 'Issue Verification Mindset',
                description: 'When adopting a tester mindset for Issue Verification (IV), which is not a characteristic of the process?',
                options: [
                    {
                        text: 'Being competitive is not a characteristic of an Issue Verifcation tester mindset',
                        outcome: 'Correct! being detailed, timely, observant, investigative, impartial, and quality-driven are all characteristics of a tester mindset during Issue Verification not being competitive.',
                        experience: 15,
                        tool: 'Issue Verification Mindset'
                    },
                    {
                        text: 'Being detailed is not a characteristic of an Issue Verifcation tester mindset',
                        outcome: 'Being detailed is a characteristic for Issue Verification, aiming to provide the client with valuable information to aid them in fixing outstanding issues.',
                        experience: -5
                    },
                    {
                        text: 'Being investigative is not a characteristic of an Issue Verifcation tester mindset',
                        outcome: 'Being investigative is a characteristic of Issue Verifcation, actively looking for ways to discover new issues.',
                        experience: -10
                    },
                    {
                        text: 'Being impartial is not a characteristic of an Issue Verifcation tester mindset',
                        outcome: 'Being impartial is a characteristic of Issue Verification, we may observe an issue differently from a client and must be objective in our feedback.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Mindset Risk',
                description: 'What is a risk of applying the same mindset to every testing project?',
                options: [
                    {
                        text: 'It provides maximum test coverage',
                        outcome: 'Tailoring the mindset to each project leads to better coverage and finding more relevant issues.',
                        experience: -5
                    },
                    {
                        text: 'It increases testing speed',
                        outcome: 'While this may increase speed through familiarisation. A tailored approach makes better use of time and results as each project has its own specific requirements.',
                        experience: -10
                    },
                    {
                        text: 'It yields mediocre results and less value to clients',
                        outcome: 'Correct! Applying the same mindset to every project and approaching testing in the same manner, no matter the test approach, will likely yield mediocre results and provide less value to clients.',
                        experience: 15,
                        tool: 'Mindset Risk'
                    },
                    {
                        text: 'It standardizes the testing approach',
                        outcome: 'While this might be true, standardisation without adaptation is a disadvantage, not an advantage.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Exploratory Testing Mindset',
                description: 'For an exploratory testing approach, which is not a characteristic of a tester mindset approach',
                options: [
                    {
                        text: 'Being destructive is a characteristic of tester mindset towards exploratory testing',
                        outcome: 'Being destructive is a characteristic of exploratory testing, aiming to break the app/site and reveal issues.',
                        experience: -5
                    },
                    {
                        text: 'Adopting a free to explore approach is a characteristic of tester mindset towards exploratory testing',
                        outcome: 'Being free to explore is a characteristic of exploratory testing, as to not get held back by restrictive test cases.', 
                        experience: -10
                    },
                    {
                        text: 'Adopting process driven approach is a characteristic of tester mindset towards exploratory testing',
                        outcome: 'Correct! The exploratory approach is characterised by being less process-driven and more free-form than scripted approaches.',
                        experience: 15,
                        tool: 'Exploratory Testing Mindset'
                    },
                    {
                        text: 'Being risk aware is a characteristic of a tester mindset towards exploratory testing',
                        outcome: 'Being risk-aware is as a characteristic of exploratory testing, being conscious of scope, timings and ability to deliver tasks on time.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Project Context',
                description: 'When considering the context for a new testing project, what is not a factor to be considered?',
                options: [
                    {
                        text: 'The client\'s competitors is not a factor to be considered for a new project',
                        outcome: 'Correct! focus should be on understanding the specific project rather than market positioning or competitive analysis.',
                        experience: 15,
                        tool: 'Project Context'
                    },
                    {
                        text: 'Project scope is not a factor to be considered for a new project',
                        outcome: 'Scope is a context factor to consider, including questions about unique functionalities and areas of concern.',
                        experience: -10
                    },
                    {
                        text: 'Test approach is not a factor to be considered for a new project',
                        outcome: 'Test approach is a context factor to consider, including understanding why the client chose a particular approach for their project.',
                        experience: -5
                    },
                    {
                        text: 'Development life cycle is not a factor to be considered for a new project',
                        outcome: 'The development life cycle is as a context factor to consider, to determine how far into development the project is.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Project Mindset',
                description: 'What is recommended when a tester is unsure about what mindset might be required for a particular project?',
                options: [
                    {
                        text: 'The project stand up should be utilised to ask questions and discuss the project with the project manager',
                        outcome: 'Correct! If you are unsure what mindset might be required for a particular project, utilise the project stand up to ask questions and discuss the mindset with the project manager and test team.',
                        experience: 15,
                        tool: 'Project Mindset'
                    },
                    {
                        text: 'The last projects mindset approach should be followed',
                        outcome: 'This contradicts the emphasis on tailoring a mindset to each specific project.',
                        experience: -10
                    },
                    {
                        text: 'Creating a survey for the client to complete should be the approach',
                        outcome: 'This would be time consuming for both tester and client.',
                        experience: -5
                    },
                    {
                        text: 'You should always default to the exploratory approach',
                        outcome: 'An appropriate mindset for each project should be undertaken rather than defaulting to any particular approach.',
                        experience: 0
                    }
                ]
            }
        ];

        // Intermediate Scenarios (Different Testing Approaches)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Exploratory Testing',
                description: "You're conducting exploratory testing. What's your mindset?",
                options: [
                    {
                        text: 'Be curious, investigative, and think outside the box',
                        outcome: 'Perfect! Exploratory testing requires creative thinking.',
                        experience: 20,
                        tool: 'Exploratory Testing Guide'
                    },
                    {
                        text: 'Follow a strictly set out test script to gain the best coverage',
                        outcome: 'Exploratory testing requires flexibility and creativity to think outside the box of a specified testing route.',
                        experience: -10
                    },
                    {
                        text: 'Test only happy paths to check the desired outcome',
                        outcome: 'Exploratory testing should cover various scenarios, including unhappy paths.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on finding bugs within the required scope of the project',
                        outcome: 'Understanding the system and user journey paths are also important in exploratory testing.',
                        experience: 5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Scripted Testing',
                description: 'During scripted testing, you notice an issue outside the test cases. What do you do?',
                options: [
                    {
                        text: 'Document the issue for client consideration and continue with test cases',
                        outcome: 'Excellent! Balance following scripts while noting other issues.',
                        experience: 20,
                        tool: 'Test Case Management'
                    },
                    {
                        text: 'Continue with testing as the particular focus is not documented to be covered within the test cases',
                        outcome: 'All issues should be documented, even if outside of stated test cases.',
                        experience: -15
                    },
                    {
                        text: 'Stop scripted testing to investigate and find the root cause',
                        outcome: 'The issue should be documented although, planned testing should be continued with.',
                        experience: 0
                    },
                    {
                        text: 'Add new test cases immediately to address the areas that return the issue',
                        outcome: 'Whilst adding new test cases is required as testing evolves on a project. The issues should be document first and test case updates can be performed after the current execution.',
                        experience: 10
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Test Support Approach',
                description: 'You\'re providing ongoing test support. How do you maintain effectiveness?',
                options: [
                    {
                        text: 'Stay adaptable and maintain clear communication with the team',
                        outcome: 'Perfect! Flexibility and communication are key for support.',
                        experience: 20,
                        tool: 'Support Communication Template'
                    },
                    {
                        text: 'Stick to the initial test plan throughout test activities only',
                        outcome: 'Test support requires adapting to clients changing needs.',
                        experience: -10
                    },
                    {
                        text: 'Wait for the client to assign you tasks to stay within scope of the project',
                        outcome: 'Proactive support is more valuable than reactive support.',
                        experience: -5
                    },
                    {
                        text: 'Focus only on new features within a release to keep testing activities current',
                        outcome: 'Support should include both new and existing functionality testing.',
                        experience: 5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Risk Assessment',
                description: 'You identify a potential risk in the project. How do you handle it?',
                options: [
                    {
                        text: 'Document the risk and communicate it to stakeholders promptly',
                        outcome: 'Excellent! Early risk communication allows better mitigation.',
                        experience: 20,
                        tool: 'Risk Assessment Matrix'
                    },
                    {
                        text: 'Wait to see the risk identified becomes an issue that could affect the system under test',
                        outcome: 'Early risk identification helps prevent issues with test activities further along into the process.',
                        experience: -15
                    },
                    {
                        text: 'Research a solution for the risk yourself and present this to developers',
                        outcome: 'Risks should be communicated to appropriate stakeholders for an appropriate outcome to be confirmed.',
                        experience: -5
                    },
                    {
                        text: 'Mention the identified risk in the next meeting or stand up for the project',
                        outcome: 'Risks need prompt communication to mitigate an issue early, rather than having delayed reporting.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Test Coverage',
                description: 'How do you ensure adequate test coverage for a feature?',
                options: [
                    {
                        text: 'Implement comprehensive testing methodologies across all possible test scenarios and edge cases with detailed documentation',
                        outcome: 'This is too broad an approach and can be an inefficient way of testing.',
                        experience: -5
                    },
                    {
                        text: 'Use risk-based testing to prioritise areas that are of the most importance to the user and client',
                        outcome: 'Perfect! Prioritising tests based on risk is one of the most efficient approaches.',
                        experience: 20,
                        tool: 'Risk Assessment Matrix'
                    },
                    {
                        text: 'Execute extensive regression testing protocols while maintaining detailed coverage metrics and trend analysis',
                        outcome: 'Regression testing alone doesn\'t ensure the most sufficient coverage.',
                        experience: -10
                    },
                    {
                        text: 'Conduct thorough analysis of all system components and their interconnected dependencies',
                        outcome: 'System analysis is important but should be guided by risk assessment.',
                        experience: 5
                    }
                ]
            }
        ];

        // Advanced Scenarios (Complex situations)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Critical Production Issue',
                description: 'A critical bug is reported in production affecting user data. What\'s your immediate response?',
                options: [
                    {
                        text: 'Alert the incident team with evidence and begin systematic investigation',
                        outcome: 'Excellent! Quick escalation and a systematic approach is crucial.',
                        experience: 25,
                        tool: 'Incident Response Protocol'
                    },
                    {
                        text: 'Start researching a fix for the bug immediately',
                        outcome: 'Incident response process should be followed before attempting to find a route cause for developers to investigate and fix.',
                        experience: -15
                    },
                    {
                        text: 'Document the issue to be included in the next sprint for developer attention',
                        outcome: 'Critical issues within the production environment require immediate attention.',
                        experience: -15
                    },
                    {
                        text: 'Start investigating the root cause of the bug immediately',
                        outcome: 'Incident response process should be followed before attempting to find the cause so all interested parties are aware of the issue.',
                        experience: 5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Test Strategy Evolution',
                description: 'The project scope has significantly changed mid-way. How do you adapt your test strategy?',
                options: [
                    {
                        text: 'Review changes, update strategy, and communicate any impact on the project',
                        outcome: 'Perfect! Systematic adaptation ensures continued effectiveness.',
                        experience: 25,
                        tool: 'Strategy Adaptation Framework'
                    },
                    {
                        text: 'Continue the testing activities outlined in the original strategy to stay in line with initial client expectation',
                        outcome: 'The strategy must evolve with project changes as important features could missed.',
                        experience: -20
                    },
                    {
                        text: 'Create an entirely new strategy to come into line with the new requirements',
                        outcome: 'Modifying the existing strategy is the preferred approach to time management and constraints.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on the new requirements set out in the updated scope',
                        outcome: 'Both new and existing requirements need to be taken into consideration as issues could be missed if existing requirements are ignored.',
                        experience: 0
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Resource Constraints',
                description: 'You have limited time and resources for testing. How do you proceed?',
                options: [
                    {
                        text: 'Prioritise critical functionality and communicate constraints',
                        outcome: 'Excellent! Risk-based prioritisation maximizes testing value.',
                        experience: 25,
                        tool: 'Test Prioritization Matrix'
                    },
                    {
                        text: 'Test everything as quick as possible to meet project timeframe deliverables',
                        outcome: 'Rushed testing may miss critical issues.',
                        experience: -20
                    },
                    {
                        text: 'Leave lower priority items to meet project timeframe deliverables',
                        outcome: 'Scope reduction needs to be communicated and agreed upon with stakeholders first.',
                        experience: -10
                    },
                    {
                        text: 'Request a deadline extension to achieve the required test coverage',
                        outcome: 'Test case and scope prioritisation is required first, even with an extended deadline.',
                        experience: 0
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Team Collaboration',
                description: 'Different team members have conflicting test approaches. How do you handle this?',
                options: [
                    {
                        text: 'Facilitate discussion to align on best practices and document any agreements',
                        outcome: 'Perfect! Collaborative alignment improves team effectiveness.',
                        experience: 25,
                        tool: 'Test Approach Alignment Guide'
                    },
                    {
                        text: 'Let each person use their preferred approach to aid in meeting deliverables',
                        outcome: 'Inconsistent approaches can affect testing quality.',
                        experience: -20
                    },
                    {
                        text: 'Enforce your preferred approach to be able to manage progress more efficiently',
                        outcome: 'Collaboration is better than enforcement as each colleague brings a different skill set.',
                        experience: -15
                    },
                    {
                        text: 'Escalate to management immediately so they can set a company wide approach',
                        outcome: 'It is preferred to initiate a team discussion first to potentially come to a collaborative agreement before escalation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Quality Advocacy',
                description: 'The team is pressured to reduce testing time. How do you respond?',
                options: [
                    {
                        text: 'Present data-driven analysis of risks and quality impacts',
                        outcome: 'Excellent! Data-driven advocacy helps maintain quality.',
                        experience: 25,
                        tool: 'Quality Impact Analysis'
                    },
                    {
                        text: 'Accept the reduced timeline and continue with testing activities',
                        outcome: 'Quality concerns should be raised professionally as issues could be missed with reduced coverage.',
                        experience: -30
                    },
                    {
                        text: 'Refuse to reduce the testing time as this will affect testing coverage and quality',
                        outcome: 'It is preferred and professional to collaborate with stakeholders to find balanced solutions.',
                        experience: -20
                    },
                    {
                        text: 'Reduce test coverage without any risk analysis',
                        outcome: 'Impact analysis is required and should be communicated with stakeholders before reducing coverage.',
                        experience: -15
                    }
                ]
            }
        ];

        // Initialize UI and event listeners
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

    normalizeQuizName(quizName) {
        // Always return 'tester-mindset' for any variant
        if (typeof quizName === 'string' && quizName.toLowerCase().replace(/[_\s]/g, '-').includes('tester')) {
            return 'tester-mindset';
        }
        return quizName;
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
            
            // Get quiz name if not already set
            if (!this.quizName) {
                this.quizName = this.detectQuizNameFromPage();
                console.log('[Quiz] Setting quiz name in startGame:', this.quizName);
            }
            
            // Initialize the guideSettings (non-blocking)
            this.initializeGuideSettings().catch(error => {
                console.error('Error initializing guide settings:', error);
            });
            
            // Clear existing elements to avoid duplication
            const optionsContainer = document.getElementById('quiz-options');
            if (optionsContainer) {
                optionsContainer.innerHTML = '';
            }
            
            const explanationContainer = document.getElementById('explanation-content');
            if (explanationContainer) {
                explanationContainer.innerHTML = '';
            }
            
            // Try to load progress first
            console.log('[TesterMindsetQuiz] Attempting to load saved progress...');
            const progressLoaded = await this.loadProgress();
            console.log(`[TesterMindsetQuiz] Progress loaded: ${progressLoaded}`);
            
            // Run diagnostics to help troubleshoot any issues
            await this.logQuizProgressDiagnostics();
            
            // Initialize UI
            this.gameScreen.classList.remove('hidden');
            this.outcomeScreen.classList.add('hidden');
            this.endScreen.classList.add('hidden');
            
            // Update progress display
            this.updateProgress();
            
            // Display the correct scenario based on current progress
            console.log(`[TesterMindsetQuiz] About to display scenario. Current position: ${this.player.currentScenario}, questions answered: ${this.player.questionHistory.length}`);
            this.displayScenario();
        } catch (error) {
            console.error('[TesterMindsetQuiz] Error starting game:', error);
        } finally {
            this.isLoading = false;
            
            // Hide loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
        }
    }

    initializeEventListeners() {
        // Remove existing event listeners first
        const continueBtn = document.getElementById('continue-btn');
        const restartBtn = document.getElementById('restart-btn');
        const optionsForm = document.getElementById('options-form');
        
        if (continueBtn) {
            continueBtn.removeEventListener('click', this.nextScenarioBound);
            this.nextScenarioBound = this.nextScenario.bind(this);
            continueBtn.addEventListener('click', this.nextScenarioBound);
        }
        
        if (restartBtn) {
            restartBtn.removeEventListener('click', this.restartGameBound);
            this.restartGameBound = this.restartGame.bind(this);
            restartBtn.addEventListener('click', this.restartGameBound);
        }

        // Options form is handled separately in displayScenario
        
        // Remove global keydown handler if it exists
        document.removeEventListener('keydown', this.keydownHandlerBound);
        
        // Add keyboard navigation
        this.keydownHandlerBound = (e) => {
            if (e.key === 'Enter' && e.target.type === 'radio') {
                this.handleAnswer();
            }
        };
        
        document.addEventListener('keydown', this.keydownHandlerBound);
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
        
        // Determine which question to show based on progress
        let scenario;
        const questionCount = this.player.questionHistory.length;
        
        console.log(`[Quiz] Displaying scenario. Questions answered: ${questionCount}, currentScenario: ${this.player.currentScenario}`);
        
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
        
        console.log(`[Quiz] Level index calculated for question ${questionCount + 1}: ${currentLevelIndex}`);
        
        // Validate that we have enough scenarios in the current level
        if (!currentScenarios || currentScenarios.length <= currentLevelIndex) {
            console.error(`[Quiz] Not enough scenarios in the current level. Level has ${currentScenarios?.length || 0} scenarios, but need scenario at index ${currentLevelIndex}`);
            
            // If we have no scenarios, try regenerating them
            if (!currentScenarios || currentScenarios.length === 0) {
                console.log('[Quiz] Regenerating scenarios for current level');
                if (questionCount < 5) {
                    currentScenarios = this.getRandomizedScenarios('basic', this.basicScenarios);
                } else if (questionCount < 10) {
                    currentScenarios = this.getRandomizedScenarios('intermediate', this.intermediateScenarios);
                } else {
                    currentScenarios = this.getRandomizedScenarios('advanced', this.advancedScenarios);
                }
            }
            
            // If we still don't have enough scenarios, use the first one
            if (!currentScenarios || currentScenarios.length <= currentLevelIndex) {
                currentLevelIndex = 0;
                console.log('[Quiz] Still not enough scenarios, using first available scenario');
            }
        }
        
        // Get the scenario from the current randomized scenarios
        scenario = currentScenarios[currentLevelIndex];
        
        if (!scenario) {
            console.error('[Quiz] Critical error: No scenario found for current progress after recovery attempts');
            console.error(`[Quiz] Level: ${questionCount < 5 ? 'basic' : (questionCount < 10 ? 'intermediate' : 'advanced')}`);
            console.error(`[Quiz] Available scenarios:`, currentScenarios);
            // Last resort fallback to avoid breaking the quiz
            if (this.basicScenarios && this.basicScenarios.length > 0) {
                scenario = this.basicScenarios[0];
                console.log('[Quiz] Using emergency fallback scenario from basic scenarios');
            } else {
                this.showError('Error loading quiz question. Please refresh the page.');
                return;
            }
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

        if (titleElement) titleElement.textContent = scenario.title;
        if (descriptionElement) descriptionElement.textContent = scenario.description;
        
        if (optionsContainer) {
            // Clear any existing content to prevent duplicate form elements
            optionsContainer.innerHTML = '';
            
            // Add options directly to the options container (not creating a new form)
            scenario.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                
                const inputId = `option${index}`;
                
                // Create radio button
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'option';
                radio.value = index;
                radio.id = inputId;
                radio.setAttribute('aria-label', option.text);
                radio.tabIndex = 0;
                
                // Create label
                const label = document.createElement('label');
                label.setAttribute('for', inputId);
                label.textContent = option.text;
                
                // Add to option div
                optionDiv.appendChild(radio);
                optionDiv.appendChild(label);
                
                // Add to options container
                optionsContainer.appendChild(optionDiv);
            });
        }

        // Find the existing form and ensure event handler is attached properly
        const form = document.getElementById('options-form');
        if (form) {
            // Make sure we have a bound event handler
            if (!this.handleAnswerBound) {
                this.handleAnswerBound = this.handleAnswer.bind(this);
            }
            
            // Remove any existing handlers and attach the bound handler
            form.removeEventListener('submit', this.handleAnswerBound);
            form.addEventListener('submit', this.handleAnswerBound);
        }

        // Update progress display
        this.updateProgress();
        
        // Save progress after displaying the scenario
        // This ensures we save on initial load as well
        this.saveProgress().catch(err => {
            console.error('[Quiz] Error saving progress after displaying scenario:', err);
        });
    }

    async handleAnswer(event) {
        if (event) {
            event.preventDefault();
        }
        
        if (this.isLoading) return;
        
        const submitButton = document.getElementById('submit-btn');
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
                    continueBtn.removeEventListener('click', this.nextScenarioBound);
                    this.nextScenarioBound = this.nextScenario.bind(this);
                    continueBtn.addEventListener('click', this.nextScenarioBound);
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of sanity and smoke testing. You clearly understand the differences between these testing approaches and are well-equipped to implement them effectively!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your sanity and smoke testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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
        const title = scenario.title?.toLowerCase() || '';
        const description = scenario.description?.toLowerCase() || '';

        if (title.includes('context') || description.includes('context')) {
            return 'Project Context Understanding';
        } else if (title.includes('environment') || description.includes('environment')) {
            return 'Test Environment Management';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Test Documentation';
        } else if (title.includes('planning') || description.includes('planning')) {
            return 'Test Planning';
        } else if (title.includes('risk') || description.includes('risk')) {
            return 'Risk Assessment';
        } else if (title.includes('coverage') || description.includes('coverage')) {
            return 'Test Coverage';
        } else if (title.includes('collaboration') || description.includes('collaboration')) {
            return 'Team Collaboration';
        } else {
            return 'General Testing Approach';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Project Context Understanding': 'Focus on improving requirement analysis and understanding business context before testing.',
            'Test Environment Management': 'Enhance your ability to identify and document environment differences and their impact on testing.',
            'Test Documentation': 'Practice creating clear, detailed test documentation that helps track issues and communicate effectively.',
            'Test Planning': 'Work on developing comprehensive test strategies that consider project scope and risks.',
            'Risk Assessment': 'Strengthen your ability to identify, prioritize, and communicate potential risks in testing.',
            'Test Coverage': 'Improve your approach to ensuring adequate test coverage across different testing types and scenarios.',
            'Team Collaboration': 'Enhance communication with team members and stakeholders during the testing process.',
            'General Testing Approach': 'Continue developing fundamental testing principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core testing mindset principles.';
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

        // Add tester-mindset specific variations
        if (quizName.toLowerCase().includes('tester-mindset')) {
            variations.push(
                'Tester-Mindset',
                'tester-mindset',
                'testerMindsetTest',
                'Tester_Mindset',
                'tester_mindset'
            );
        }

        variations.forEach(variant => {
            localStorage.removeItem(`quiz_progress_${username}_${variant}`);
            localStorage.removeItem(`quizResults_${username}_${variant}`);
        });
    }

    async saveProgress() {
        // First determine the status based on clear conditions
        let status = 'in-progress';
        if (this.player.questionHistory.length >= this.totalQuestions) {
            const correctAnswers = this.player.questionHistory.filter(q => q.isCorrect).length;
            const scorePercentage = Math.round((correctAnswers / this.totalQuestions) * 100);
            status = scorePercentage >= this.passPercentage ? 'passed' : 'failed';
        }
        
        // Create a complete progress object with all necessary data
        let progressData = {
            questionsAnswered: this.player.questionHistory.length,
            questionHistory: this.player.questionHistory,
            experience: this.player.experience || 0,
            tools: this.player.tools || [],
            status: status,
            currentScenario: this.player.currentScenario,
            randomizedScenarios: this.randomizedScenarios || {},
            lastUpdated: new Date().toISOString()
        };
        
        // Calculate score percentage if we have questions answered
        if (this.player.questionHistory.length > 0) {
            const correctAnswers = this.player.questionHistory.filter(q => q.isCorrect).length;
            progressData.scorePercentage = Math.round((correctAnswers / Math.max(this.player.questionHistory.length, 1)) * 100);
        } else {
            progressData.scorePercentage = 0;
        }
        
        // Log progress data
        console.log('[TesterMindsetQuiz] Saving progress:', {
            questionCount: progressData.questionsAnswered,
            currentScenario: progressData.currentScenario,
            status: progressData.status,
            hasRandomizedScenarios: Object.keys(progressData.randomizedScenarios || {}).length > 0
        });
        
        // Save the progress to the API
        const username = localStorage.getItem('username');
        if (username) {
            try {
                // Normalize quiz name to ensure consistency
                const quizName = this.normalizeQuizName(this.quizName);
                console.log(`[TesterMindsetQuiz] Saving progress for quiz: ${quizName}`);
                
                // Save using API service
                await this.apiService.saveQuizProgress(quizName, progressData);
            } catch (error) {
                console.error('[TesterMindsetQuiz] Error saving progress:', error);
            }
        }
    }

    async loadProgress() {
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('[TesterMindsetQuiz] No username found, cannot load progress');
                return false;
            }
            
            console.log('[TesterMindsetQuiz] Loading progress for:', username);
            
            // Get progress from API service
            const quizName = this.normalizeQuizName(this.quizName);
            const progressResult = await this.apiService.getQuizProgress(quizName);
            
            if (!progressResult.success || !progressResult.data) {
                console.error('[TesterMindsetQuiz] Failed to load progress from API');
                return false;
            }
            
            const progress = progressResult.data;
            
            // Log exactly what we received
            console.log('[TesterMindsetQuiz] Loaded progress:', {
                questionsAnswered: progress.questionsAnswered,
                currentScenario: progress.currentScenario,
                hasRandomizedScenarios: !!progress.randomizedScenarios,
                source: progress.source || 'api'
            });
            
            // Make sure we have valid data
            if (!progress || !progress.questionHistory || progress.questionHistory.length === 0) {
                console.log('[TesterMindsetQuiz] No valid progress found');
                return false;
            }
            
            // Restore player state
            this.player.experience = progress.experience || 0;
            this.player.tools = progress.tools || [];
            this.player.questionHistory = Array.isArray(progress.questionHistory) ? progress.questionHistory : [];
            
            // Make sure we restore the correct current scenario
            if (typeof progress.currentScenario === 'number') {
                this.player.currentScenario = progress.currentScenario;
            } else {
                // Fall back to using question history length
                this.player.currentScenario = this.player.questionHistory.length;
            }
            
            console.log(`[TesterMindsetQuiz] Restored currentScenario to ${this.player.currentScenario}`);
            
            // Restore randomized scenarios if available
            if (progress.randomizedScenarios && Object.keys(progress.randomizedScenarios).length > 0) {
                this.randomizedScenarios = progress.randomizedScenarios;
                console.log('[TesterMindsetQuiz] Restored randomized scenarios:', Object.keys(this.randomizedScenarios));
            } else {
                // If no randomized scenarios in progress, create them
                console.log('[TesterMindsetQuiz] No randomized scenarios found, creating new ones');
                this.getRandomizedScenarios('basic', this.basicScenarios);
                this.getRandomizedScenarios('intermediate', this.intermediateScenarios);
                this.getRandomizedScenarios('advanced', this.advancedScenarios);
            }
            
            // Force save progress to ensure proper synchronization
            await this.saveProgress();
            
            return true;
        } catch (error) {
            console.error('[TesterMindsetQuiz] Error loading progress:', error);
            return false;
        }
    }

    getRandomizedScenarios(level, scenarios) {
        if (!this.randomizedScenarios) {
            this.randomizedScenarios = {};
        }
        
        // If we already have randomized scenarios for this level, reuse them
        if (this.randomizedScenarios[level]) {
            console.log(`[Quiz] Using existing randomized ${level} scenarios:`, this.randomizedScenarios[level].length);
            return this.randomizedScenarios[level];
        }
        
        console.log(`[Quiz] Generating new randomized ${level} scenarios from ${scenarios.length} scenarios`);
        
        // Create a shuffled copy of the scenarios
        const shuffledScenarios = [...scenarios];
        
        // Fisher-Yates shuffle algorithm
        for (let i = shuffledScenarios.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledScenarios[i], shuffledScenarios[j]] = [shuffledScenarios[j], shuffledScenarios[i]];
        }
        
        // Store the randomized scenarios for this level
        this.randomizedScenarios[level] = shuffledScenarios;
        
        // After generating new randomized scenarios, make sure to save progress
        // to ensure we don't lose the order if user refreshes
        setTimeout(() => this.saveProgress(), 100);
        
        return shuffledScenarios;
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('[TesterMindsetQuiz] Initializing quiz');
    
    // Force clean any existing quiz references that might be in memory
    if (window.currentQuiz) {
        console.log('[TesterMindsetQuiz] Cleaning up existing quiz instance:', window.currentQuiz.quizName);
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
                console.log(`[TesterMindsetQuiz] Found potential conflicting quiz data: ${quizName}`);
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.data && parsed.data.randomizedScenarios) {
                        console.log(`[TesterMindsetQuiz] Cleaning randomized scenarios from ${quizName}`);
                        delete parsed.data.randomizedScenarios;
                        localStorage.setItem(key, JSON.stringify(parsed));
                    }
                } catch (e) {
                    console.error(`[TesterMindsetQuiz] Error cleaning scenarios:`, e);
                }
            }
        });
    }
    
    // Create a new instance and keep a global reference
    const quiz = new TesterMindsetQuiz(); 
    window.currentQuiz = quiz;
    
    // Add a specific property to identify this quiz
    Object.defineProperty(window, 'ACTIVE_QUIZ_NAME', {
        value: 'tester-mindset',
        writable: true,
        configurable: true
    });
    
    // Force clear any unrelated randomized scenarios
    if (quiz.randomizedScenarios) {
        // Keep only keys specific to this quiz
        Object.keys(quiz.randomizedScenarios).forEach(key => {
            if (!key.startsWith('tester-mindset_')) {
                console.log(`[TesterMindsetQuiz] Removing unrelated randomized scenario: ${key}`);
                delete quiz.randomizedScenarios[key];
            }
        });
    }
    
    // Start the quiz
    console.log('[TesterMindsetQuiz] Starting quiz');
    quiz.startGame();
}); 