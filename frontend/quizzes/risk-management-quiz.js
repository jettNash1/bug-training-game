// Add required imports
import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

class RiskManagementQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a risk management expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong risk management skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
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
        
        // Initialize core properties
        this.player = {
            name: '',
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: []
        };

        // Initialize screens
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');

        // Initialize API service
        this.apiService = new APIService();

        // Basic Scenarios (IDs 1-5, 75 XP total)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Risk Calculation',
                description: 'You discover a potential issue that could affect project completion. How do you best calculate its risk level?',
                options: [
                    {
                        text: 'Multiply severity by likelihood to determine impact',
                        outcome: 'Perfect! This is the correct formula for calculating risk impact.',
                        experience: 15,
                        tool: 'Risk Calculator'
                    },
                    {
                        text: 'Only consider the severity of the issue',
                        outcome: 'Risk calculation needs both severity and likelihood for accuracy.',
                        experience: -10
                    },
                    {
                        text: 'Add severity and likelihood together',
                        outcome: 'Multiplication, not addition, gives the correct risk impact score.',
                        experience: -5
                    },
                    {
                        text: 'Only consider how likely it is to happen',
                        outcome: 'Both factors are needed for proper risk assessment.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Test Environment Access',
                description: 'The test environment link hasn\'t been provided yet, and testing is scheduled to start today. What\'s the best risk management approach?',
                options: [
                    {
                        text: 'Proactively prepare alternative tasks and inform PM immediately',
                        outcome: 'Excellent! This shows proper risk management and proactive planning.',
                        experience: 15,
                        tool: 'Risk Mitigation'
                    },
                    {
                        text: 'Wait for someone to notice the missing link',
                        outcome: 'Proactive communication is essential in risk management.',
                        experience: -10
                    },
                    {
                        text: 'Start testing something else without telling anyone',
                        outcome: 'Changes in work should be communicated to relevant parties.',
                        experience: -5
                    },
                    {
                        text: 'Report the issue and do nothing else',
                        outcome: 'Risk management includes preparing alternatives.',
                        experience: 5
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
                        text: 'Test payments throughout the day and immediately report any outages',
                        outcome: 'Perfect! Regular testing and prompt reporting helps manage payment risks.',
                        experience: 15,
                        tool: 'Payment Testing'
                    },
                    {
                        text: 'Test payments once at the start of the day',
                        outcome: 'Payment systems need regular monitoring throughout testing.',
                        experience: -5
                    },
                    {
                        text: 'Wait for customers to report payment issues',
                        outcome: 'Proactive testing is essential for risk management.',
                        experience: -10
                    },
                    {
                        text: 'Only test payments if specifically requested',
                        outcome: 'Regular payment testing is part of proper risk management.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Device Access',
                description: 'You realize you don\'t have access to one of the scoped devices for testing. What\'s the best risk management approach?',
                options: [
                    {
                        text: 'Immediately identify who has the device and arrange access',
                        outcome: 'Excellent! Proactive device access management reduces project risks.',
                        experience: 15,
                        tool: 'Resource Management'
                    },
                    {
                        text: 'Skip testing on that device',
                        outcome: 'This creates unchecked risks in the project.',
                        experience: -10
                    },
                    {
                        text: 'Wait for someone to ask about that device\'s testing',
                        outcome: 'Proactive communication is key in risk management.',
                        experience: -5
                    },
                    {
                        text: 'Only mention it in the final report',
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
                        text: 'Document issues locally and immediately alert PM about tracker need',
                        outcome: 'Perfect! This ensures no information is lost while addressing the risk.',
                        experience: 15,
                        tool: 'Issue Management'
                    },
                    {
                        text: 'Wait for the tracker to be provided',
                        outcome: 'Issues should be documented even without a tracker.',
                        experience: -10
                    },
                    {
                        text: 'Delay testing until tracker is available',
                        outcome: 'Testing should proceed with alternative documentation methods.',
                        experience: -5
                    },
                    {
                        text: 'Only test but don\'t document issues',
                        outcome: 'Issues must be documented even without a formal tracker.',
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
                        text: 'Flag in team chat, raise highest severity ticket, tag PM, and actively monitor for changes',
                        outcome: 'Perfect! This follows proper risk management protocol for blocking issues.',
                        experience: 25,
                        tool: 'Issue Escalation'
                    },
                    {
                        text: 'Continue testing other areas without reporting',
                        outcome: 'Blocking issues need immediate communication due to resource impact.',
                        experience: -15
                    },
                    {
                        text: 'Wait for other testers to notice the issue',
                        outcome: 'Proactive communication is crucial for team-wide blocking issues.',
                        experience: -10
                    },
                    {
                        text: 'Only document the issue in your notes',
                        outcome: 'Blocking issues require immediate team communication.',
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
                        text: 'Calculate new timeline needs, communicate to PM, highlight resource constraints',
                        outcome: 'Excellent! This provides data-driven risk assessment and communication.',
                        experience: 25,
                        tool: 'Resource Planning'
                    },
                    {
                        text: 'Try to test everything in the original timeline',
                        outcome: 'This creates quality risks and unrealistic expectations.',
                        experience: -15
                    },
                    {
                        text: 'Only test the original scope',
                        outcome: 'Changes need proper communication and planning.',
                        experience: -10
                    },
                    {
                        text: 'Test what you can without raising concerns',
                        outcome: 'Resource constraints need to be communicated promptly.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'App Installation Failure',
                description: 'On the final day, a new build won\'t install on 40% of test devices. What\'s the best risk management approach?',
                options: [
                    {
                        text: 'Check all devices, raise highest severity issue, coordinate with team for coverage',
                        outcome: 'Perfect! This addresses both technical and project risks comprehensively.',
                        experience: 25,
                        tool: 'Build Management'
                    },
                    {
                        text: 'Only test on working devices',
                        outcome: 'Device coverage gaps need to be communicated and assessed.',
                        experience: -15
                    },
                    {
                        text: 'Wait for a new build without reporting',
                        outcome: 'Installation issues need immediate reporting and risk assessment.',
                        experience: -10
                    },
                    {
                        text: 'Mark devices as untested without investigation',
                        outcome: 'Technical issues need proper investigation and documentation.',
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
                        text: 'Confirm with PM, document missing coverage, suggest alternative testing approaches',
                        outcome: 'Excellent! This provides clear risk documentation and mitigation options.',
                        experience: 25,
                        tool: 'Coverage Management'
                    },
                    {
                        text: 'Mark feature as passed without testing',
                        outcome: 'Untested features must be clearly documented as risks.',
                        experience: -15
                    },
                    {
                        text: 'Only mention it in final report',
                        outcome: 'Missing features need immediate communication.',
                        experience: -10
                    },
                    {
                        text: 'Test something else without reporting',
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
                        text: 'Quick site assessment, estimate total bugs, inform PM, prioritize by severity',
                        outcome: 'Perfect! This provides structured risk assessment and prioritization.',
                        experience: 25,
                        tool: 'Bug Management'
                    },
                    {
                        text: 'Try to document every minor issue',
                        outcome: 'High bug volumes need severity-based prioritization.',
                        experience: -15
                    },
                    {
                        text: 'Skip detailed bug reports to cover more pages',
                        outcome: 'Quality of bug documentation shouldn\'t be sacrificed for speed.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on the first page',
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
                        text: 'Analyze critical paths, propose coverage priorities, document risks of reduced testing',
                        outcome: 'Excellent! This provides structured risk management for scope reduction.',
                        experience: 20,
                        tool: 'Scope Management'
                    },
                    {
                        text: 'Try to complete all testing in reduced time',
                        outcome: 'Rushed testing creates quality risks that need documentation.',
                        experience: -15
                    },
                    {
                        text: 'Continue with original plan despite timeline',
                        outcome: 'Scope changes need proper replanning and risk assessment.',
                        experience: -10
                    },
                    {
                        text: 'Randomly reduce test coverage',
                        outcome: 'Coverage reduction needs strategic planning.',
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
                        experience: 20,
                        tool: 'Resource Management'
                    },
                    {
                        text: 'Try to continue working normally',
                        outcome: 'Personal risks need proper communication for team support.',
                        experience: -15
                    },
                    {
                        text: 'Reduce work without informing anyone',
                        outcome: 'Changes in capacity need proper communication.',
                        experience: -10
                    },
                    {
                        text: 'Wait until it affects deliverables',
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
                        experience: 20,
                        tool: 'Risk Documentation'
                    },
                    {
                        text: 'Only mention resolved issues',
                        outcome: 'All risks need documentation, including unresolved ones.',
                        experience: -15
                    },
                    {
                        text: 'Use vague descriptions of risks',
                        outcome: 'Risk documentation needs specific details and impacts.',
                        experience: -10
                    },
                    {
                        text: 'Skip risks that client already knows about',
                        outcome: 'All risks need formal documentation regardless of awareness.',
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
                        text: 'Prioritize risks by impact score, create mitigation plan for each, communicate clearly',
                        outcome: 'Perfect! This provides structured management of multiple risks.',
                        experience: 20,
                        tool: 'Risk Prioritization'
                    },
                    {
                        text: 'Focus only on the most visible risk',
                        outcome: 'All risks need assessment and management plans.',
                        experience: -15
                    },
                    {
                        text: 'Handle risks as they become issues',
                        outcome: 'Proactive management of all risks is necessary.',
                        experience: -10
                    },
                    {
                        text: 'Delegate different risks to different team members',
                        outcome: 'Risks need coordinated management approach.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Client Risk Decisions',
                description: 'Client decides not to fix a serious issue before release. How do you manage this risk?',
                options: [
                    {
                        text: 'Document clear caveats, potential impacts, and maintain detailed risk records',
                        outcome: 'Excellent! This ensures proper risk documentation despite client decisions.',
                        experience: 20,
                        tool: 'Risk Documentation'
                    },
                    {
                        text: 'Accept decision without documentation',
                        outcome: 'Client decisions need proper risk documentation.',
                        experience: -15
                    },
                    {
                        text: 'Continue arguing for the fix',
                        outcome: 'Once documented, client risk decisions need to be respected.',
                        experience: -10
                    },
                    {
                        text: 'Remove issue from reports',
                        outcome: 'Risk documentation should maintain accuracy.',
                        experience: -5
                    }
                ]
            }
        ];

        // Initialize event listeners
        this.initializeEventListeners();

        this.isLoading = false;
    }

    // Core required methods
    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        }
    }

    shouldEndGame(totalQuestionsAnswered, currentXP) {
        return totalQuestionsAnswered >= 15 || currentXP >= this.maxXP;
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

    // ... existing helper methods and event handlers ...
}

// Add DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new RiskManagementQuiz();
    quiz.startGame();
}); 