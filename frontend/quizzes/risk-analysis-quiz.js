import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class RiskAnalysisQuiz extends BaseQuiz {
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
                { threshold: 90, message: '🏆 Outstanding! You\'re a risk analysis expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong risk analysis skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing risk analysis best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'risk-analysis',
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
                title: 'Risk Severity Assessment',
                description: 'How do you determine the severity of a risk?',
                options: [
                    {
                        text: 'Consider number of affected parties, duration of effect, likelihood, and impact',
                        outcome: 'Perfect! Comprehensive risk severity assessment considers multiple factors.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Severity Assessment Framework'
                    },
                    {
                        text: 'Consider immediate impact on the system under test',
                        outcome: 'Whilst impact is important risk severity needs to take in broader consideration, like risk likelihood and impact on the user.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Consider the developers feedback and base severity on their expertise on the system under test',
                        outcome: 'Whilst a developers input can be important, the severity of a risk requires a more measured approach taking into consideration a range of factors.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Consider number of affected parties, duration of effect and impact',
                        outcome: 'While all these factors will form a structured assessment of the severity of a risk. Likelihood of the issue occurring is also a main factor that can\'t be left out.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Risk Likelihood Evaluation',
                description: 'What factors should you consider when evaluating the likelihood of a risk?',
                options: [
                    {
                        text: 'Historical occurrence, interaction frequency, known triggers, and prior experience',
                        outcome: 'Excellent! Multiple factors help determine likelihood accurately.',
                        experience: 15,
                        tool: 'Likelihood Assessment Tool'
                    },
                    {
                        text: 'Check prior occurrences of the same type of issue being raised',
                        outcome: 'All factors that affect risk likelihood which include frequency and triggers should be taken into consideration.',
                        experience: -5
                    },
                    {
                        text: 'Factor into the risk analysis report that all risks are equally likely',
                        outcome: 'Different risks have different likelihoods. Therefore, they require different overall risk level and prioritisation',
                        experience: -10
                    },
                    {
                        text: 'Take into consideration the current environment conditions',
                        outcome: 'Historical data should also be considered when determining risk likelihood. This type of data from supported environment types helps to evaluate the accuracy of a risk.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Morning Risk Assessment',
                description: 'What\'s the first step in your morning risk routine?',
                options: [
                    {
                        text: 'Review time availability, device readiness, and project understanding',
                        outcome: 'Perfect! Morning assessment prevents day-long issues.',
                        experience: 15,
                        tool: 'Daily Risk Checklist'
                    },
                    {
                        text: 'Commence functional testing activates straight away to make sure coverage within time constraints are sufficiently met',
                        outcome: 'Risk assessment should always precede work on the system under test as there could be potential risks that may block testing activities. These risks would need communicating and resolving',
                        experience: -10
                    },
                    {
                        text: 'Wait for the morning project meeting so that the project manager can relay any project risks',
                        outcome: 'Proactive morning checks are recommended to potentially prevent problems in project readiness and to convey potential risk to project managers or clients that may block testing activities.',
                        experience: -5
                    },
                    {
                        text: 'Check emails for any information regarding the project and the system under test',
                        outcome: 'Whilst important, a comprehensive morning review of any supported client documentation including the operational project details is required.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Risk Calculation',
                description: 'How do you calculate the overall risk level?',
                options: [
                    {
                        text: 'Multiply severity by likelihood ratings',
                        outcome: 'Excellent! This calculation provides accurate risk levels.',
                        experience: 15,
                        tool: 'Risk Calculator'
                    },
                    {
                        text: 'Consider the severity of the issue and base the overall risk on this',
                        outcome: 'Both severity and likelihood should be taken into consideration. If the severity of a risk is high but the likelihood of this occurring is extremely low. Then overall severity would be reduced',
                        experience: -10
                    },
                    {
                        text: 'Consider the likelihood of the issue occurring and base overall risk on this',
                        outcome: 'Severity of the risk must also be factored in. If the likelihood of a risk is high but the severity of this risk is extremely low. Then overall severity would be reduced',
                        experience: -5
                    },
                    {
                        text: 'Add severity and likelihood ratings to gain the overall risk calculation',
                        outcome: 'Multiplication of severity and likelihood is the formula used for overall risk level.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Pre-Lunch Risk Check',
                description: 'What should you assess in your pre-lunch risk routine?',
                options: [
                    {
                        text: 'Progress rate, device status, new client information, and blocking issues',
                        outcome: 'Perfect! Mid-day check helps maintain progress.',
                        experience: 15,
                        tool: 'Progress Tracking'
                    },
                    {
                        text: 'Check the time remaining in the day for testing activities to factor in test coverage',
                        outcome: 'Whilst this is important to keep test coverage on track. Multiple factors need to be taken into consideration including device status and any new project information.',
                        experience: -5
                    },
                    {
                        text: 'Conduct a thorough risk assessment at the beginning of the day so updated assessments are not required',
                        outcome: 'Regular checks maintain efficiency as progress may be hindered for a number of factors including blocking issues or client requests.',
                        experience: -10
                    },
                    {
                        text: 'Report an updated risk assessment to the project manager towards the end of the days testing',
                        outcome: 'Mid-day assessments are essential as they allow for adjustments within the days testing activities.',
                        experience: 0
                    }
                ]
            },
            // Additional Basic Scenarios from Guide - Risk Analysis Additional Questions
            {
                id: 16,
                level: 'Basic',
                title: 'Risk Identification Focus',
                description: 'What is the primary focus of risk identification?',
                options: [
                    {
                        text: 'Questions should be the primary focus of risk identification',
                        outcome: 'Correct! Questioning the who, what, why, and where of activities to identify potential issues ahead of time should be the primary focus.',
                        experience: 15,
                        tool: 'Risk Identification Focus'
                    },
                    {
                        text: 'Documentation should be the primary focus of risk identification',
                        outcome: 'While documentation is important throughout the process, it\'s not identified as the primary focus of risk identification.',
                        experience: -5
                    },
                    {
                        text: 'Solutions should be the primary focus of risk identification',
                        outcome: 'Solutions are part of risk management rather than risk identification.',
                        experience: -10
                    },
                    {
                        text: 'Budgeting should be the primary focus of risk identification',
                        outcome: 'While budget considerations may appear in risk analysis, this is not the primary focus of risk identification.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Risk Severity Estimation',
                description: 'Which of the following is not a factor to consider when estimating the severity of a risk?',
                options: [
                    {
                        text: 'How many people or parties will be affected by the risk',
                        outcome: 'This is a factor for severity assessment.',
                        experience: -5
                    },
                    {
                        text: 'How long the effect of the risk lasts',
                        outcome: 'The duration of impact is specifically considered as a severity consideration.',
                        experience: -10
                    },
                    {
                        text: 'The history of the risk occurring',
                        outcome: 'Correct! The history of the risk occurring is a factor to consider when estimating the likelihood of a risk, not the severity.',
                        experience: 15,
                        tool: 'Risk Severity Estimation'
                    },
                    {
                        text: 'The impact when the risk occurs',
                        outcome: 'This is directly related to severity assessment.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Likelihood Scale',
                description: 'What is the highest level on the Likelihood Scale according to the guide?',
                options: [
                    {
                        text: 'Extremely Likely.',
                        outcome: 'This term doesn\'t appear on the scale in the guide.',
                        experience: -5
                    },
                    {
                        text: 'Almost Certain',
                        outcome: 'This is level 4 on the scale, not the highest level.', 
                        experience: -10
                    },
                    {
                        text: 'Certain',
                        outcome: 'Correct! according to the Likelihood Scale in the guide, the highest level (5) is defined as Certain. This represents risks that are guaranteed to occur.',
                        experience: 15,
                        tool: 'Likelihood Scale'
                    },
                    {
                        text: 'Inevitable',
                        outcome: 'This term doesn\'t appear on the scale in the guide.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Risk Assessment Checkpoint',
                description: 'What is one of the key checkpoints for risk assessment during a tester\'s daily routine?',
                options: [
                    {
                        text: 'The start of the workday should be determined as key checkpoint for risk assessment',
                        outcome: 'Correct! The start of each day is a great time to start assessing project risk as this is a primary operation that allow for greater success throughout a day.',
                        experience: 15,
                        tool: 'Risk Assessment Checkpoint'
                    },
                    {
                        text: 'The end of each test case should be determined as key checkpoint for risk assessment',
                        outcome: 'While ongoing assessment is important, a specific checkpoint at every test case could prove too time consuming.',
                        experience: -10
                    },
                    {
                        text: 'After client meetings should be determined as key checkpoint for risk assessment',
                        outcome: 'While client interactions may trigger risk assessments. This is not a standard checkpoint for ongoing projects',
                        experience: -5
                    },
                    {
                        text: 'After each deployment should be determined as key checkpoint for risk assessment',
                        outcome: 'Deployments may trigger risk assessments. This is not a standard checkpoint for ongoing projects.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Project Scoping Risk Assessment',
                description: 'During the Scoping/Presale stage, who has responsibility for risk assessment according to the guide?',
                options: [
                    {
                        text: 'Delivery Manager, Head of Service or Project Manager if involving in scoping should be responsible for the risk assessment',
                        outcome: 'Correct! If involved in scoping the responsibility belongs to Delivery Manager, Head of Service or Project Manager.',
                        experience: 15,
                        tool: 'Project Scoping Risk Assessment'
                    },
                    {
                        text: 'Test analysts only should be responsible for the risk assessment',
                        outcome: 'While a test analyst may be asked for information about risk assessments. They should not be the only person responsible.',
                        experience: -10
                    },
                    {
                        text: 'The project manager only should be responsible for the risk assessment',
                        outcome: 'While project managers might be involved, they\'re not the only responsible parties.',
                        experience: -5
                    },
                    {
                        text: 'The client representative and delivery manager should be responsible for the risk assessment',
                        outcome: 'The client representative should not be responsible for this stage in the process.',
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
                title: 'Project Timeline Risk',
                description: 'How do you assess timeline-related risks during project scoping?',
                options: [
                    {
                        text: 'Evaluate resource availability, information gathering time, fix windows, and timeline flexibility',
                        outcome: 'Excellent! Comprehensive timeline risk assessment.',
                        experience: 20,
                        tool: 'Timeline Risk Assessment'
                    },
                    {
                        text: 'Check the duration of time allocated for functional test activities on the system under test',
                        outcome: 'Multiple timeline factors need to be taken into consideration including planning and resource availability.',
                        experience: -15
                    },
                    {
                        text: 'Assume timelines are in a set format as delivered by the client and all activities are to be planned in relation to this',
                        outcome: 'Timeline flexibility requires assessment for potential deviations and additional coverage if required.',
                        experience: -10
                    },
                    {
                        text: 'Take resource availability into consideration to help with a set project timeline',
                        outcome: 'While this is important other factors should be taken into consideration including flexibility and planning time.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Documentation Risk',
                description: 'What documentation risks should be assessed before testing?',
                options: [
                    {
                        text: 'Check documentation availability, detail level, business rules, and acceptance criteria',
                        outcome: 'Perfect! Documentation completeness is crucial.',
                        experience: 20,
                        tool: 'Documentation Review'
                    },
                    {
                        text: 'Check if documentation has been supplied by the client to form operational project details',
                        outcome: 'Documentation content also needs reviewing to determine quality and potential issues that may prevent testing activities.',
                        experience: -15
                    },
                    {
                        text: 'Commence testing activities without documentation presented by the client',
                        outcome: 'Whilst in some respects this can be achieved including exploratory testing to a certain degree. Documentation reviews prevent potential blocking issues to testing activities.',
                        experience: -10
                    },
                    {
                        text: 'Ensure front end URL\'s have been supplied by the client and can be accessed',
                        outcome: 'Whilst this is important, there are many other factors that need to be taken into consideration. Including, bug tracking details and access credentials or any areas out of scope.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Environment Access Risk',
                description: 'How do you assess risks related to test environment access?',
                options: [
                    {
                        text: 'Verify access methods, specific requirements, user permissions, and environment stability',
                        outcome: 'Excellent! Complete access risk assessment.',
                        experience: 20,
                        tool: 'Access Risk Checklist'
                    },
                    {
                        text: 'Check a user can login can login to the environment specified by the URL or application provided by the client',
                        outcome: 'This behaviour is important. However, other factors need to be taken into consideration including permissions for multiple users.',
                        experience: -15
                    },
                    {
                        text: 'Assess access methods, specific requirements and user permissions',
                        outcome: 'Whilst all these factors are essential, environment stability needs to be taken into consideration. This could include actual environment completeness and any server downtime for development activities.',
                        experience: -10
                    },
                    {
                        text: 'Assess access methods, user permissions, and environment stability',
                        outcome: 'Whilst all these factors are essential, specific client requirements also needs to be taken into consideration. This could include version control and which versions/URL\'s should be under test',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Multi-User Impact',
                description: 'How do you assess risks of multiple users testing simultaneously?',
                options: [
                    {
                        text: 'Evaluate platform performance impact, potential conflicts, and workflow interruptions',
                        outcome: 'Perfect! Multi-user impact needs thorough assessment.',
                        experience: 20,
                        tool: 'Concurrent Testing Assessment'
                    },
                    {
                        text: 'Assess the impact of logging into the environment sequentially with different users',
                        outcome: 'This type of test should be carried out with multiple users simultaneously to evaluate potential performance issues.',
                        experience: -15
                    },
                    {
                        text: 'Assess the impact of logging into an environment with the same user on different tabs on the same browser type',
                        outcome: 'Whilst this is a valid test, logging into the environment with the same user on multiple devices should be taken into consideration.',
                        experience: -10
                    },
                    {
                        text: 'Assess the impact of logging in and out with the same user on multiple occasions',
                        outcome: 'Whilst this is a valid test, it doesn\'t assess the impact of multiple users access the system under test at the same time.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Client Communication Risk',
                description: 'How do you assess risks in client communication channels?',
                options: [
                    {
                        text: 'Establish urgent contact methods, verify response times, and ensure clear escalation paths',
                        outcome: 'Excellent! Communication channel assessment.',
                        experience: 20,
                        tool: 'Communication Risk Assessment'
                    },
                    {
                        text: 'Promote email as the one communication channel',
                        outcome: 'Multiple client supported communication channels may be required. Also, response times need to be assessed to realise the best and quickest form of communication.',
                        experience: -15
                    },
                    {
                        text: 'Address communication issues when they arise during testing activities',
                        outcome: 'Proactive planning is required to maintain effective communication with the client throughout testing activities.',
                        experience: -10
                    },
                    {
                        text: 'Establish contact methods and verify response times with the client and project manager',
                        outcome: 'While these factors are important, escalation paths for any urgent issues also need to be verified for clarity and resolution of any points of failure.',
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
                title: 'High-Bug Environment',
                description: 'How do you assess risks when encountering a bug-heavy environment?',
                options: [
                    {
                        text: 'Evaluate impact on testing time, triage requirements, and need for additional verification',
                        outcome: 'Perfect! Comprehensive bug impact assessment.',
                        experience: 25,
                        tool: 'Bug Impact Analysis'
                    },
                    {
                        text: 'Continue following the planned test script and report findings at the end of the day to the project manager',
                        outcome: 'A high bug count generally needs a strategy adjustment involving certain coverage areas or resource availability which should also be relayed to the project manager.',
                        experience: -15
                    },
                    {
                        text: 'Reduce coverage of all areas to meet time constraints',
                        outcome: 'All areas need appropriate coverage. Any potential reduction in agreed coverage should be reported and agreed with the project manager.',
                        experience: -10
                    },
                    {
                        text: 'Document major bugs and build a backlog of notes for any minor issues',
                        outcome: 'All issues found need proper documentation and reporting. Progress should also be reported to the project manager for assessment of additional resources',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Resource Change Risk',
                description: 'How do you handle risks from unexpected resource changes?',
                options: [
                    {
                        text: 'Assess impact on timeline, coverage, and team capability, then adjust plans accordingly',
                        outcome: 'Excellent! Resource change impact analysis.',
                        experience: 25,
                        tool: 'Resource Risk Management'
                    },
                    {
                        text: 'Continue with the original testing activities set out in planning and inform the project manager of progress at the end of the day',
                        outcome: 'Any resource changes need plan adjustment and project managers should be informed on potential impact so those adjustments can be made.',
                        experience: -15
                    },
                    {
                        text: 'Remove some areas under test from planning to meet agreed project timelines.',
                        outcome: 'Coverage areas should not necessarily be removed. Although a reduction in test coverage of non-priority areas could potentially be adjusted. This would need confirmation from the project manager and the client',
                        experience: -10
                    },
                    {
                        text: 'Assess the impact on timeline and report this information to the project manager',
                        outcome: 'Whilst this is an important factor, the impact on coverage should also be taken into consideration and reported to stakeholders involved in the project.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Late Stage Risks',
                description: 'How do you assess risks when major issues are found late in testing?',
                options: [
                    {
                        text: 'Evaluate fix timeline, regression impact, and remaining test time, then reprioritize',
                        outcome: 'Perfect! Late-stage issue impact assessment.',
                        experience: 25,
                        tool: 'Late-Stage Risk Analysis'
                    },
                    {
                        text: 'Reduce the remaining test areas to meet the project timeline set out in planning',
                        outcome: 'Reprioritising test areas rather than reducing them is better approach to deal with major issues. This should also be agreed with the project manager.',
                        experience: -15
                    },
                    {
                        text: 'Remove outstanding regression testing from planning as bug fixes and new features take priority',
                        outcome: 'Regression testing remains important area of issue verification. Instead of removing this completely, reprioritisation of regression areas should be taken into consideration and agreed with the project manager.',
                        experience: -10
                    },
                    {
                        text: 'Assess a route cause analysis for the client and developers to better understand a fix timeline',
                        outcome: 'Whilst this will help going forward for a new release. It doesn\'t help with reprioritisation of the current system under tests activities.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Client Requirement Changes',
                description: 'How do you assess risks when client requirements change during testing?',
                options: [
                    {
                        text: 'Analyse impact on timeline, coverage, and existing tests, then adjust strategy',
                        outcome: 'Excellent! Change impact analysis.',
                        experience: 25,
                        tool: 'Change Impact Assessment'
                    },
                    {
                        text: 'Continue with the original testing activities set out in planning',
                        outcome: 'Requirement changes require reassessment and plan updates.',
                        experience: -15
                    },
                    {
                        text: 'Test the new requirement areas as these are the most current set out by the client',
                        outcome: 'All requirements need coverage relating to priority and any set out in planning that are still relevant need testing.',
                        experience: -10
                    },
                    {
                        text: 'Analyse impact on test coverage and report this to the project manager',
                        outcome: 'Whilst coverage is important. Other factors need to be taken into consideration including impact on project time line and existing tests.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'End of Project Risk Review',
                description: 'How do you assess risks at project completion?',
                options: [
                    {
                        text: 'Review project challenges, identify process improvements, and document lessons learned',
                        outcome: 'Perfect! Comprehensive project review.',
                        experience: 25,
                        tool: 'Project Review Framework'
                    },
                    {
                        text: 'Document all major issues in a project review',
                        outcome: 'While important all aspects need to be included for review including project challenges. These can then be reviewed for improvement moving forward.',
                        experience: -15
                    },
                    {
                        text: 'Document lessons learned in the project review',
                        outcome: 'Whilst this is an important factor in the review. It may not target exact areas where processes can be improved.',
                        experience: -10
                    },
                    {
                        text: 'Focus on successes achieved throughout the project and document them in the project review',
                        outcome: 'Both successes and challenges are essential to the project review. This promotes a way of carrying forward good process and highlights the need for process improvement',
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
                
                // Clear any existing randomized scenarios
                this.randomizedScenarios = {};
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
        // Check if we've answered all questions
        if (this.player.questionHistory.length >= this.totalQuestions) {
            console.log('All questions answered, ending game');
            this.endGame(false);
            return;
        }
        
        // Get the randomized scenarios for the current level
        const currentScenarios = this.getCurrentScenarios();
        
        // Get the next scenario based on current progress within level
        let scenario;
        const questionCount = this.player.questionHistory.length;
        
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
        
        // Get the scenario from the current randomized scenarios
        scenario = currentScenarios[currentLevelIndex];
        
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
                    continueBtn.addEventListener('click', () => this.nextScenario());
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

        const scorePercentage = this.calculateScorePercentage();
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            const isCorrect = record.isCorrect;

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

        if (scorePercentage >= 90 && weakAreas.length === 0) {
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of risk analysis. You clearly understand the nuances of risk assessment and are well-equipped to handle any risk analysis challenges!</p>';
        } else if (scorePercentage >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your risk analysis skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('severity') || description.includes('severity')) {
            return 'Risk Severity Assessment';
        } else if (title.includes('likelihood') || description.includes('likelihood')) {
            return 'Risk Likelihood Evaluation';
        } else if (title.includes('timeline') || description.includes('timeline')) {
            return 'Project Timeline Risk';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Documentation Risk';
        } else if (title.includes('environment') || description.includes('environment')) {
            return 'Environment Risk';
        } else if (title.includes('communication') || description.includes('communication')) {
            return 'Communication Risk';
        } else if (title.includes('assessment') || description.includes('assessment')) {
            return 'Risk Assessment Process';
        } else {
            return 'General Risk Analysis';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Risk Severity Assessment': 'Focus on comprehensively evaluating risk impact by considering all affected parties, duration, and business impact.',
            'Risk Likelihood Evaluation': 'Strengthen your approach to evaluating probability based on historical data and frequency of user interaction.',
            'Project Timeline Risk': 'Develop better strategies for timeline risk management, especially regarding resource allocation and flexibility.',
            'Documentation Risk': 'Improve documentation review processes to identify potential gaps before testing begins.',
            'Environment Risk': 'Enhance your approach to environment access verification and stability assessment.',
            'Communication Risk': 'Work on establishing robust communication channels and escalation paths with clients.',
            'Risk Assessment Process': 'Develop more systematic approaches to regular risk assessment throughout the project lifecycle.',
            'General Risk Analysis': 'Continue developing foundational risk analysis principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core risk analysis principles.';
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

        // Add risk-analysis specific variations
        if (quizName.toLowerCase().includes('risk-analysis')) {
            variations.push(
                'Risk-Analysis',
                'risk-analysis',
                'riskAnalysisTest',
                'Risk_Analysis',
                'risk_analysis'
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
    console.log('[Risk-Analysis-Quiz] Initializing quiz');
    
    // Force clean any existing quiz references that might be in memory
    if (window.currentQuiz) {
        console.log('[Risk-Analysis-Quiz] Cleaning up existing quiz instance:', window.currentQuiz.quizName);
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
                console.log(`[Risk-Analysis-Quiz] Found potential conflicting quiz data: ${quizName}`);
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.data && parsed.data.randomizedScenarios) {
                        console.log(`[Risk-Analysis-Quiz] Cleaning randomized scenarios from ${quizName}`);
                        delete parsed.data.randomizedScenarios;
                        localStorage.setItem(key, JSON.stringify(parsed));
                    }
                } catch (e) {
                    console.error(`[Risk-Analysis-Quiz] Error cleaning scenarios:`, e);
                }
            }
        });
    }
    
    // Create a new instance and keep a global reference
    const quiz = new RiskAnalysisQuiz;
    window.currentQuiz = quiz;
    
    // Add a specific property to identify this quiz
    Object.defineProperty(window, 'ACTIVE_QUIZ_NAME', {
        value: 'risk-analysis',
        writable: true,
        configurable: true
    });
    
    // Force clear any unrelated randomized scenarios
    if (quiz.randomizedScenarios) {
        // Keep only keys specific to this quiz
        Object.keys(quiz.randomizedScenarios).forEach(key => {
            if (!key.startsWith('risk-analysis_')) {
                console.log(`[Risk-Analysis-Quiz] Removing unrelated randomized scenario: ${key}`);
                delete quiz.randomizedScenarios[key];
            }
        });
    }
    
    // Start the quiz
    console.log('[Risk-Analysis-Quiz] Starting quiz');
    quiz.startGame();
}); 