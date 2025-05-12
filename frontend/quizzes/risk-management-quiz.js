import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class RiskManagementQuiz extends BaseQuiz {
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
                { threshold: 90, message: '🏆 Outstanding! You\'re a risk management expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong risk management skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing risk management best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'risk-management',
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
                title: 'Risk Calculation',
                description: 'You discover a potential issue that could affect project completion. How do you best calculate its risk level?',
                options: [
                    {
                        text: 'Multiply severity by likelihood to determine impact and risk level',
                        outcome: 'Perfect! This is the correct formula for calculating risk impact.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Risk Calculator'
                    },
                    {
                        text: 'Consider the severity of the issue and base the risk level of that only',
                        outcome: 'Risk calculation needs both severity and likelihood for accuracy.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Add severity and likelihood together to calculate the risk level',
                        outcome: 'Multiplication, not addition, gives the correct risk impact score.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Consider how likely the issue is to occur and base the risk level off this',
                        outcome: 'Both factors are needed for proper risk assessment.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Risk Identification',
                description: 'What is the most effective way to identify potential risks?',
                options: [
                    {
                        text: 'Conduct comprehensive analysis of historical project data and previous risk assessments to establish patterns',
                        outcome: 'Historical data alone may miss new risks.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Review documentation to determine scope, user and system impact',
                        outcome: 'Perfect! Documentation review is key to identifying risks.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Risk Assessment Template'
                    },
                    {
                        text: 'Implement extensive monitoring systems to track all possible system behaviours and performance metrics',
                        outcome: 'Monitoring comes after risk identification.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Establish detailed risk tracking protocols across multiple project phases',
                        outcome: 'Tracking comes after identification.',
                        experience: 5,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Payment Gateway Testing',
                description: 'You\'re testing an ecommerce site\'s payment system. What\'s the best risk management approach?',
                options: [
                    {
                        text: 'Monitor payments at regular intervals throughout the day',
                        outcome: 'Perfect! Regular testing and prompt reporting helps manage payment risks.',
                        experience: 15,
                        tool: 'Payment Testing'
                    },
                    {
                        text: 'Test payments once at the start of the day to check during peak hours',
                        outcome: 'Payment systems need regular monitoring throughout testing.',
                        experience: -5
                    },
                    {
                        text: 'Establish extensive customer feedback collection mechanisms for payment-related issues',
                        outcome: 'Proactive testing is essential for risk management rather than awaiting feedback.',
                        experience: -10
                    },
                    {
                        text: 'Conduct payment verification only upon explicit client request or reported issues',
                        outcome: 'Regular payment testing is part of thorough risk management.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Device Access',
                description: 'You realise you don\'t have access to one of the scoped devices for testing. What\'s the best risk management approach?',
                options: [
                    {
                        text: 'Immediately identify who has the device and arrange access',
                        outcome: 'Excellent! Proactive device access management reduces project risks.',
                        experience: 15,
                        tool: 'Resource Management'
                    },
                    {
                        text: 'Leave testing on that device and use the closest environment possible',
                        outcome: 'Whilst this may be a possible solution, it still creates unchecked risks in the project.',
                        experience: -10
                    },
                    {
                        text: 'Wait until the project manager requests testing progress on the device',
                        outcome: 'Proactive communication is key in risk management to mitigate any issues that may arise.',
                        experience: -5
                    },
                    {
                        text: 'Mention access to the device has not been possible it in the final report',
                        outcome: 'Device access issues should be addressed immediately.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Issue Tracker Access',
                description: 'Testing starts today but no issue tracker has been provided. What\'s the best risk management approach?',
                options: [
                    {
                        text: 'Document issues locally and immediately alert the project manager about the lack of tracker details',
                        outcome: 'Perfect! This ensures no information is lost while addressing the risk.',
                        experience: 15,
                        tool: 'Issue Management'
                    },
                    {
                        text: 'Continue with testing without documentation while waiting for the tracker details to be provided by the client',
                        outcome: 'Issues should be documented even without a tracker.',
                        experience: -10
                    },
                    {
                        text: 'Delay testing until issue tracker details have been provided by the client',
                        outcome: 'Testing should proceed with alternative documentation methods.',
                        experience: -5
                    },
                    {
                        text: 'Continue testing and raise brief notes for any issues found into the project channel',
                        outcome: 'Issues must be documented fully even without a formal tracker.',
                        experience: 0
                    }
                ]
            },
            // Additional Basic Scenarios from Guide - Risk Management Additional Questions
            {
                id: 16,
                level: 'Basic',
                title: 'Risk Management Characteristics',
                description: 'Which of the following is not a characteristic of risk management?',
                options: [
                    {
                        text: 'Being reactive responding to problems as they arise',
                        outcome: 'Correct! Being proactive is as a characteristic, emphasising being mindful of potential risks rather than reacting to problems. Reactive approaches are the opposite of the recommended approach.',
                        experience: 15,
                        tool: 'Risk Management Characteristics'
                    },
                    {
                        text: 'Being proactive and mindful of potential risks',
                        outcome: 'Being proactive is as a key characteristic of risk management.',
                        experience: -5
                    },
                    {
                        text: 'Good communication, sharing identified risks with your team',
                        outcome: 'Communication is a characteristic, particularly sharing identified risks with your team.',
                        experience: -10
                    },
                    {
                        text: 'Being timely to act on risks as early as possible',
                        outcome: 'Being timely is as a characteristic with emphasis on acting on risks as early as possible.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Project Feature Management',
                description: 'In a scenario where a project feature is missing during testing, what is one of the recommended actions for the project manager?',
                options: [
                    {
                        text: 'Additional payment from the client should be sought for schedule disruption',
                        outcome: 'Demanding additional payment would likely damage client relationships.',
                        experience: -5
                    },
                    {
                        text: 'Make sure to complete the project without testing the missing feature',
                        outcome: 'Testing on all scoped features should be attempted and communication with the client should be sought on clarification of those features.',
                        experience: -10
                    },
                    {
                        text: 'Offer to repurpose issue verification time to accommodate the release feature when available',
                        outcome: 'Correct! The project manager should, if within notice period offer to repurpose issue verification time to accommodate the release feature when available.',
                        experience: 15,
                        tool: 'Project Feature Management'
                    },
                    {
                        text: 'Automatically extend the project timeline without client consultation',
                        outcome: 'Consultation with the client about options is recommended rather than automatically extending timelines.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Test Duration Risk Mitigation',
                description: 'What should be a risk mitigation action when a client reduces testing days from 10 to 5?',
                options: [
                    {
                        text: 'A mitigation should be to refuse to proceed with testing until the original timeline is restored.',
                        outcome: 'Flexibility and adaptability to changing circumstances should be observed, not a refusal to proceed.',
                        experience: -5
                    },
                    {
                        text: 'A mitigation should be to automatically double the number of testers assigned to maintain complete coverage',
                        outcome: 'While resource reallocation might be considered, automatically doubling testers without discussion with all affected is not recommended.', 
                        experience: -10
                    },
                    {
                        text: 'A mitigation should be to identify further prioritisation of software to ensure critical features receive high coverage',
                        outcome: 'Correct! If the script cannot be completed, then reprioritisation of test effort to cover critical areas should be considered',
                        experience: 15,
                        tool: 'Test Duration Risk Mitigation'
                    },
                    {
                        text: 'A mitigation should be to test all features with equal depth but at a faster pace',
                        outcome: 'Test coverage will be reduced and re-prioritisation rather than maintaining equal depth for all features is recommended.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Risk Management Objectives',
                description: 'What is an of the objectives of risk management?',
                options: [
                    {
                        text: 'To understand how risks can affect our work',
                        outcome: 'Correct! This is the primary objective for risk management.',
                        experience: 15,
                        tool: 'Risk Management Objectives'
                    },
                    {
                        text: 'To eliminate the need for client communication during projects',
                        outcome: 'Client communication is essential and should not be eliminated.',
                        experience: -10
                    },
                    {
                        text: 'To avoid all potential defects in software development',
                        outcome: 'Defects will occur and focus should be on managing them, not avoiding all potential defects',
                        experience: -5
                    },
                    {
                        text: 'To guarantee project completion within original timeframes',
                        outcome: 'While effective risk management helps with timely completion, timeframes may need to change based on circumstances.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Risk Management Importance',
                description: 'Why is risk management important?',
                options: [
                    {
                        text: 'It improves delivery of projects, ensuring they are completed on time and to the best ability',
                        outcome: 'Correct! It can help identify and manage risks to prioritise risk areas and deliver projects on time.',
                        experience: 15,
                        tool: 'Risk Management Importance'
                    },
                    {
                        text: 'It eliminates the need for client involvement in project decisions',
                        outcome: 'Client communication and involvement should be sought, not eliminated. This can help build client relationships and trust.',
                        experience: -10
                    },
                    {
                        text: 'It helps justify additional project costs to clients',
                        outcome: 'Risk management should be about improving project outcomes, not justifying additional costs.',
                        experience: -5
                    },
                    {
                        text: 'It reduces the time needed for testing activities',
                        outcome: 'Risk management might actually increase testing time in certain cases to mitigate identified risks properly.',
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
                title: 'Blocking Issue Management',
                description: 'You find a blocking issue with 5 testers on day 1 of a 4-day project. What\'s the best risk management approach?',
                options: [
                    {
                        text: 'Flag the issue in the project channel, raise the highest severity ticket, assign the ticket as advised by the client, and actively monitor for changes',
                        outcome: 'Perfect! This follows proper risk management protocol for blocking issues.',
                        experience: 20,
                        tool: 'Issue Escalation'
                    },
                    {
                        text: 'Continue testing other areas that can be worked around the blocking issue',
                        outcome: 'Blocking issues need immediate communication due to resource impact.',
                        experience: -15
                    },
                    {
                        text: 'Wait for other testers to investigate the root cause and raise a ticket',
                        outcome: 'Proactive communication is crucial for team-wide blocking issues.',
                        experience: -10
                    },
                    {
                        text: 'Document the issue in your notes and continue with any testing that can be done',
                        outcome: 'Blocking issues require immediate team communication and stakeholder visibility.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Scope Change Management',
                description: 'The client adds 10 more pages to test on day 2, with Zoonou at 97% resource usage. How do you manage this risk?',
                options: [
                    {
                        text: 'Assess impact and notify project manager',
                        outcome: 'Excellent! This provides data-driven risk assessment and communication.',
                        experience: 20,
                        tool: 'Resource Planning'
                    },
                    {
                        text: 'Attempt to test everything within the original timeline',
                        outcome: 'This creates quality risks and unrealistic expectations.',
                        experience: -15
                    },
                    {
                        text: 'Only test the original scope set out in planning and documentation',
                        outcome: 'Changes to requirements need correct communication and planning.',
                        experience: -10
                    },
                    {
                        text: 'Test what you can within the agreed time line without raising concerns',
                        outcome: 'Resource constraints need to be communicated promptly as test coverage could be compromised.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Application Installation Failure',
                description: 'On the final day, a new build won\'t install on 40% of test devices. What\'s the best risk management approach?',
                options: [
                    {
                        text: 'Check all devices, raise the highest severity issue and coordinate with team for coverage',
                        outcome: 'Perfect! This addresses both technical and project risks comprehensively.',
                        experience: 20,
                        tool: 'Build Management'
                    },
                    {
                        text: 'Test the new build on devices that can install the build only',
                        outcome: 'Device coverage gaps need to be communicated and assessed for mitigation and visibility.',
                        experience: -15
                    },
                    {
                        text: 'Wait for a new build and check the same devices again',
                        outcome: 'Installation issues need immediate reporting and risk assessment.',
                        experience: -10
                    },
                    {
                        text: 'Mark devices as untested within the test report for submission to the client',
                        outcome: 'Technical issues need correct investigation and documentation.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Missing Feature Risk',
                description: 'On the final day, one of three features hasn\'t been delivered for testing. How do you manage this risk?',
                options: [
                    {
                        text: 'Confirm with project manager, document missing coverage, suggest alternative testing approaches',
                        outcome: 'Excellent! This provides clear risk documentation and mitigation options.',
                        experience: 20,
                        tool: 'Coverage Management'
                    },
                    {
                        text: 'Mark feature as passed as long as all other available features have been tested',
                        outcome: 'Untested features must be clearly documented as risks.',
                        experience: -15
                    },
                    {
                        text: 'State which feature has not been submitted or tested in final report',
                        outcome: 'Missing features need immediate communication to be resolved by delivery or deemed as out of scope.',
                        experience: -10
                    },
                    {
                        text: 'Continue testing other features and areas to gain the most coverage possible',
                        outcome: 'Coverage gaps need proper documentation and communication.',
                        experience: 5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'High Bug Volume',
                description: 'You find 8 major bugs in 90 minutes on page 1 of 7, with 6.5 hours remaining. How do you manage this risk?',
                options: [
                    {
                        text: 'Perform a quick site assessment, estimate total bugs, inform the project manager and prioritise by severity',
                        outcome: 'Perfect! This provides structured risk assessment and prioritization.',
                        experience: 20,
                        tool: 'Bug Management'
                    },
                    {
                        text: 'Try to document every issue possible regardless of severity',
                        outcome: 'High bug volumes require severity-based prioritisation.',
                        experience: -15
                    },
                    {
                        text: 'Raise basic detailed bug reports to cover more pages on the website',
                        outcome: 'Quality of bug documentation shouldn\'t be sacrificed for speed.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on the first page of the website as this is where the initial issues have been raised',
                        outcome: 'Coverage needs to be balanced with bug severity.',
                        experience: 0
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15, 100 XP total)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Script Timeline Reduction',
                description: 'A 10-day scripted project is reduced to 5 days during execution. How do you manage this significant risk?',
                options: [
                    {
                        text: 'Analyse critical paths, propose coverage priorities, document risks of reduced testing',
                        outcome: 'Excellent! This provides structured risk management for scope reduction.',
                        experience: 25,
                        tool: 'Scope Management'
                    },
                    {
                        text: 'Attempt to complete all testing in scope within the reduced time frame',
                        outcome: 'Rushed testing creates quality risks that need documentation.',
                        experience: -15
                    },
                    {
                        text: 'Continue with original plan despite the reduced project timeline',
                        outcome: 'Scope changes need proper replanning and risk assessment.',
                        experience: -10
                    },
                    {
                        text: 'Reduce coverage on tester preference and experience',
                        outcome: 'Coverage reduction needs strategic planning, communication and documentation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Personal Risk Management',
                description: 'Personal circumstances affect your work capacity. How do you best manage this risk?',
                options: [
                    {
                        text: 'Immediately inform manager with impact assessment and timeline if possible',
                        outcome: 'Perfect! This allows proper resource risk management and support.',
                        experience: 25,
                        tool: 'Resource Management'
                    },
                    {
                        text: 'Attempt to continue working normally and to the timeline set out in planning',
                        outcome: 'Personal risks need proper communication for team support.',
                        experience: -15
                    },
                    {
                        text: 'Reduce work output and continue testing activities as normal',
                        outcome: 'Changes in capacity need proper communication to potentially re-allocate resources.',
                        experience: -10
                    },
                    {
                        text: 'Report the potential risk when it starts to affects deliverables',
                        outcome: 'Early communication allows better risk management.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Risk Documentation',
                description: 'You need to document project risks in a client report. What\'s the most effective approach?',
                options: [
                    {
                        text: 'Include clear caveats, specific conditions, and potential impacts',
                        outcome: 'Excellent! This provides comprehensive risk documentation.',
                        experience: 25,
                        tool: 'Risk Documentation'
                    },
                    {
                        text: 'Document resolved issues related to all risks in the client report',
                        outcome: 'All risks need documentation, including unresolved ones.',
                        experience: -15
                    },
                    {
                        text: 'Use basic descriptions of risks to keep the report accessible and minimal',
                        outcome: 'Risk documentation needs specific details and impacts.',
                        experience: -10
                    },
                    {
                        text: 'Do not document risks that client is already aware of',
                        outcome: 'All risks need formal documentation regardless of awareness for traceability.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Multiple Risk Factors',
                description: 'A project has device access issues, tight timeline, and communication gaps. How do you manage multiple risks?',
                options: [
                    {
                        text: 'Prioritise risks by impact score, create mitigation plans for each and communicate this clearly',
                        outcome: 'Perfect! This provides structured management of multiple risks.',
                        experience: 25,
                        tool: 'Risk Prioritization'
                    },
                    {
                        text: 'Focus only on the most visible risks to the system and user',
                        outcome: 'All risks need assessment and management plans.',
                        experience: -15
                    },
                    {
                        text: 'Risks can be handled as and when they become issues',
                        outcome: 'Proactive management of all risks is necessary to avoid blocking issues further into test activities.',
                        experience: -10
                    },
                    {
                        text: 'Delegate different risks to be investigated and reported to different channels by different team members',
                        outcome: 'Multiple risks with one project require a coordinated management approach for alignment and traceability.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Client Risk Decisions',
                description: 'The client decides not to fix a serious issue before release. How do you manage this risk?',
                options: [
                    {
                        text: 'Document clear caveats, potential impacts, and maintain detailed risk records',
                        outcome: 'Excellent! This ensures proper risk documentation despite client decisions.',
                        experience: 25,
                        tool: 'Risk Documentation'
                    },
                    {
                        text: 'Accept the decision without documentation as this is a known issue to the client',
                        outcome: 'Client decisions need proper risk documentation for traceability.',
                        experience: -15
                    },
                    {
                        text: 'Continue to put the case forward for a resolution to the issue',
                        outcome: 'Once documented, client risk decisions need to be respected.',
                        experience: -10
                    },
                    {
                        text: 'Remove the issue from reports as this is already known to the client',
                        outcome: 'Risk documentation should maintain accuracy for traceability.',
                        experience: -5
                    }
                ]
            }
        ];

        // Initialize event listeners
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
        const correctAnswers = this.player.questionHistory.filter(q => {
            return q.selectedAnswer && q.selectedAnswer.isCorrect === true;
        }).length;
        
        // Cap the questions answered at total questions
        const questionsAnswered = Math.min(this.player.questionHistory.length, this.totalQuestions);
        
        return questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
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
        const questionCount = this.player.questionHistory.length;
        
        // Check if we've answered all questions
        if (this.shouldEndGame()) {
            this.endGame(false);
            return;
        }

        // Get the next scenario based on current progress
        let scenario;
        
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

            // Update player experience with bounds
            this.player.experience = Math.max(0, Math.min(this.config.maxXP, this.player.experience + selectedAnswer.experience));

            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: selectedAnswer.isCorrect === true,
                timeSpent: timeSpent,
                timedOut: false
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();

            // Also save quiz result and update display
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                const scorePercentage = this.calculateScorePercentage();
                
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
            
            // Update outcome display
            let outcomeText = selectedAnswer.outcome;
            document.getElementById('outcome-text').textContent = outcomeText;
            
            // Update result display
            const resultElement = document.getElementById('result-text');
            if (resultElement) {
                resultElement.textContent = selectedAnswer.isCorrect ? 'Correct!' : 'Incorrect';
                resultElement.className = selectedAnswer.isCorrect ? 'correct' : 'incorrect';
            }
            
            if (selectedAnswer.tool) {
                document.getElementById('tool-gained').textContent = `Tool acquired: ${selectedAnswer.tool}`;
                if (!this.player.tools.includes(selectedAnswer.tool)) {
                    this.player.tools.push(selectedAnswer.tool);
                }
            } else {
                document.getElementById('tool-gained').textContent = '';
            }

            this.updateProgress();
            
            // Check if game should end after this answer
            if (this.shouldEndGame()) {
                // If we've answered all questions, end the game
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of risk management. You clearly understand the nuances of risk management and are well-equipped to handle any risk management challenges!</p>';
        } else if (scorePercentage >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your risk management skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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
            recommendationsHTML = '<p>Here are key areas for improvement:</p>';
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

        if (title.includes('calculation') || description.includes('calculate')) {
            return 'Risk Calculation';
        } else if (title.includes('timeline') || description.includes('timeline')) {
            return 'Timeline Risk Management';
        } else if (title.includes('bug') || description.includes('bug')) {
            return 'Bug Risk Assessment';
        } else if (title.includes('client') || description.includes('client')) {
            return 'Client Risk Management';
        } else if (title.includes('personal') || description.includes('personal')) {
            return 'Resource Risk Management';
        } else if (title.includes('scope') || description.includes('scope')) {
            return 'Scope Risk Management';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Risk Documentation';
        } else {
            return 'General Risk Management';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Risk Calculation': 'Focus on improving risk impact calculations by considering both severity and likelihood factors.',
            'Timeline Risk Management': 'Enhance your ability to assess and mitigate risks related to project timeline changes.',
            'Bug Risk Assessment': 'Strengthen your approach to evaluating and prioritizing bugs based on their risk impact.',
            'Client Risk Management': 'Improve handling of client-related risks through clear documentation and communication.',
            'Resource Risk Management': 'Develop better strategies for managing personal and team resource risks.',
            'Scope Risk Management': 'Work on assessing and documenting risks associated with scope changes.',
            'Risk Documentation': 'Focus on creating comprehensive risk documentation that clearly outlines potential impacts.',
            'General Risk Management': 'Continue developing fundamental risk management principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core risk management principles.';
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

        // Calculate score based on correct answers
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
                
                const result = {
                    score: scorePercentage,
                    scorePercentage: scorePercentage,
                    status: finalStatus,
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory,
                    questionsAnswered: this.player.questionHistory.length,
                    lastUpdated: new Date().toISOString()
                };

                // Save to QuizUser
                await user.updateQuizScore(
                    this.quizName,
                    result.scorePercentage,
                    result.experience,
                    this.player.tools,
                    result.questionHistory,
                    result.questionsAnswered,
                    finalStatus
                );

                // Save directly via API
                console.log('Saving final progress to API:', result);
                await this.apiService.saveQuizProgress(this.quizName, result);
                
                // Clear quiz local storage
                this.clearQuizLocalStorage(username, this.quizName);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${scorePercentage}%`;
       
        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = isPassed ? 'Quiz Complete!' : 'Quiz Failed!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (!isPassed) {
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

        variations.forEach(variant => {
            localStorage.removeItem(`quiz_progress_${username}_${variant}`);
            localStorage.removeItem(`quizResults_${username}_${variant}`);
        });
    }
}

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Clear any existing quiz instances before starting this quiz
    BaseQuiz.clearQuizInstances('risk-management');
    
    const quiz = new RiskManagementQuiz();
    quiz.startGame();
}); 