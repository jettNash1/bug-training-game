class RiskAnalysisQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a risk analysis expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong analytical skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
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

        // Basic Scenarios (IDs 1-5)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Morning Risk Assessment',
                description: 'You\'ve just started your workday. What\'s your first risk assessment action?',
                options: [
                    {
                        text: 'Review environment access, timeline, and device readiness',
                        outcome: 'Perfect! The morning risk routine helps identify potential blockers early.',
                        experience: 15,
                        tool: 'Morning Risk Routine'
                    },
                    {
                        text: 'Start working immediately without checks',
                        outcome: 'Skipping morning checks can lead to preventable issues.',
                        experience: -5
                    },
                    {
                        text: 'Only check emails for urgent issues',
                        outcome: 'A comprehensive morning check includes multiple risk factors.',
                        experience: -10
                    },
                    {
                        text: 'Wait for the daily standup to discuss issues',
                        outcome: 'Early risk identification shouldn\'t wait for scheduled meetings.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Risk Calculation',
                description: 'You\'ve identified a potential risk. How do you calculate its impact?',
                options: [
                    {
                        text: 'Multiply Severity (1-5) by Likelihood (1-5)',
                        outcome: 'Correct! This calculation helps prioritize risk response.',
                        experience: 15,
                        tool: 'Risk Calculator'
                    },
                    {
                        text: 'Only consider the severity',
                        outcome: 'Both severity and likelihood are crucial for risk assessment.',
                        experience: -5
                    },
                    {
                        text: 'Add severity and likelihood together',
                        outcome: 'Multiplication provides a more accurate risk score.',
                        experience: -10
                    },
                    {
                        text: 'Base it on gut feeling',
                        outcome: 'Structured risk calculation is more reliable than intuition alone.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Pre-Lunch Assessment',
                description: 'It\'s approaching lunch time. What should you check?',
                options: [
                    {
                        text: 'Review progress, device status, and any new client information',
                        outcome: 'Great! Mid-day checks help maintain project momentum.',
                        experience: 15,
                        tool: 'Pre-Lunch Risk Routine'
                    },
                    {
                        text: 'Continue working without assessment',
                        outcome: 'Regular checkpoints help identify developing issues.',
                        experience: -10
                    },
                    {
                        text: 'Only check remaining tasks',
                        outcome: 'Multiple factors should be considered in risk assessment.',
                        experience: -5
                    },
                    {
                        text: 'Wait until end of day to assess progress',
                        outcome: 'Regular checks throughout the day are more effective.',
                        experience: 5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Environment Access',
                description: 'You\'re starting a new project. What\'s your first access check?',
                options: [
                    {
                        text: 'Verify all environment access and required permissions',
                        outcome: 'Excellent! Access verification prevents testing delays.',
                        experience: 15,
                        tool: 'Access Checklist'
                    },
                    {
                        text: 'Start testing and check access as needed',
                        outcome: 'Proactive access verification is more efficient.',
                        experience: -10
                    },
                    {
                        text: 'Ask colleague to check access',
                        outcome: 'Personal verification ensures your specific access works.',
                        experience: -5
                    },
                    {
                        text: 'Assume access is already set up',
                        outcome: 'Never assume access is configured correctly.',
                        experience: 5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Documentation Review',
                description: 'You receive project documentation. What\'s your first risk consideration?',
                options: [
                    {
                        text: 'Check for conflicting information and unclear requirements',
                        outcome: 'Perfect! Early documentation review prevents later confusion.',
                        experience: 15,
                        tool: 'Documentation Review'
                    },
                    {
                        text: 'Start testing without review',
                        outcome: 'Documentation should be reviewed before testing begins.',
                        experience: -10
                    },
                    {
                        text: 'Only scan for test cases',
                        outcome: 'Complete documentation review is necessary for context.',
                        experience: -5
                    },
                    {
                        text: 'Wait for team meeting to discuss',
                        outcome: 'Individual review should happen before team discussion.',
                        experience: 5
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Test Environment Changes',
                description: 'The test environment suddenly changes during execution. How do you respond?',
                options: [
                    {
                        text: 'Document changes, assess impact, and notify project manager immediately',
                        outcome: 'Excellent! Quick response to environment changes minimizes impact.',
                        experience: 25,
                        tool: 'Change Impact Assessment'
                    },
                    {
                        text: 'Continue testing without reporting',
                        outcome: 'Environment changes need immediate attention and documentation.',
                        experience: -15
                    },
                    {
                        text: 'Pause testing without notification',
                        outcome: 'Changes should be communicated while pausing affected testing.',
                        experience: -10
                    },
                    {
                        text: 'Switch to different test areas',
                        outcome: 'Environment changes need assessment before continuing.',
                        experience: 5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Timeline Risk',
                description: 'You notice the project timeline might be insufficient. What\'s your action?',
                options: [
                    {
                        text: 'Calculate risk impact and escalate with specific concerns',
                        outcome: 'Perfect! Quantified timeline risks need prompt escalation.',
                        experience: 25,
                        tool: 'Timeline Risk Assessment'
                    },
                    {
                        text: 'Try to work faster to meet deadline',
                        outcome: 'Timeline risks should be addressed, not compressed.',
                        experience: -15
                    },
                    {
                        text: 'Wait to see if it becomes an issue',
                        outcome: 'Early timeline risk identification allows for adjustment.',
                        experience: -10
                    },
                    {
                        text: 'Only mention in status report',
                        outcome: 'Timeline risks need immediate attention.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Resource Availability',
                description: 'A critical testing resource becomes unavailable. How do you handle it?',
                options: [
                    {
                        text: 'Assess impact, identify alternatives, and update risk register',
                        outcome: 'Excellent! Resource risks need immediate mitigation planning.',
                        experience: 25,
                        tool: 'Resource Risk Management'
                    },
                    {
                        text: 'Skip tests requiring that resource',
                        outcome: 'Resource gaps need proper risk assessment and planning.',
                        experience: -15
                    },
                    {
                        text: 'Delay testing until resource returns',
                        outcome: 'Alternative solutions should be considered first.',
                        experience: -5
                    },
                    {
                        text: 'Continue without the resource',
                        outcome: 'Resource requirements should be properly addressed.',
                        experience: 5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Client Deployment Impact',
                description: 'Client announces an unexpected deployment during testing. What\'s your response?',
                options: [
                    {
                        text: 'Assess deployment impact and adjust test plan accordingly',
                        outcome: 'Perfect! Deployment changes require immediate risk assessment.',
                        experience: 25,
                        tool: 'Deployment Impact Analysis'
                    },
                    {
                        text: 'Continue testing without changes',
                        outcome: 'Deployments can significantly impact testing validity.',
                        experience: -15
                    },
                    {
                        text: 'Stop all testing immediately',
                        outcome: 'Assessment before action is more appropriate.',
                        experience: -5
                    },
                    {
                        text: 'Only test unaffected areas',
                        outcome: 'Full impact assessment is needed first.',
                        experience: 5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Issue Verification Planning',
                description: 'Multiple issues need verification but time is limited. How do you proceed?',
                options: [
                    {
                        text: 'Prioritize issues by risk impact and create verification schedule',
                        outcome: 'Excellent! Structured verification planning optimizes limited time.',
                        experience: 25,
                        tool: 'Verification Planning'
                    },
                    {
                        text: 'Verify issues in reported order',
                        outcome: 'Risk-based prioritization is more effective.',
                        experience: -15
                    },
                    {
                        text: 'Only verify critical issues',
                        outcome: 'All issues need verification with proper prioritization.',
                        experience: -5
                    },
                    {
                        text: 'Rush through all verifications',
                        outcome: 'Quality shouldn\'t be compromised for speed.',
                        experience: 0
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Complex Project Dependencies',
                description: 'You identify multiple external dependencies affecting project timeline. How do you manage this?',
                options: [
                    {
                        text: 'Create dependency map, assess risks, and develop mitigation strategies',
                        outcome: 'Perfect! Comprehensive dependency risk management is crucial.',
                        experience: 20,
                        tool: 'Dependency Risk Management'
                    },
                    {
                        text: 'Focus only on internal dependencies',
                        outcome: 'External dependencies need equal consideration.',
                        experience: -15
                    },
                    {
                        text: 'Wait for dependencies to be resolved',
                        outcome: 'Proactive dependency management is necessary.',
                        experience: -10
                    },
                    {
                        text: 'Only document the dependencies',
                        outcome: 'Active management of dependencies is required.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Stakeholder Risk Communication',
                description: 'Multiple high-severity risks are identified. How do you communicate with stakeholders?',
                options: [
                    {
                        text: 'Prepare detailed risk analysis with impact and mitigation proposals',
                        outcome: 'Excellent! Structured risk communication aids decision-making.',
                        experience: 20,
                        tool: 'Risk Communication Framework'
                    },
                    {
                        text: 'Send quick alert about all risks',
                        outcome: 'Detailed analysis helps stakeholders understand impact.',
                        experience: -15
                    },
                    {
                        text: 'Wait for next status report',
                        outcome: 'High-severity risks need immediate communication.',
                        experience: -5
                    },
                    {
                        text: 'Only communicate resolved risks',
                        outcome: 'All significant risks need proper communication.',
                        experience: -10
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Risk Pattern Analysis',
                description: 'You notice recurring risks across multiple projects. How do you address this?',
                options: [
                    {
                        text: 'Analyze patterns, document findings, and propose systematic solutions',
                        outcome: 'Perfect! Pattern analysis helps prevent recurring risks.',
                        experience: 20,
                        tool: 'Risk Pattern Analysis'
                    },
                    {
                        text: 'Handle each occurrence separately',
                        outcome: 'Systematic solutions are better for recurring risks.',
                        experience: -10
                    },
                    {
                        text: 'Only focus on current project',
                        outcome: 'Cross-project risk patterns need broader solutions.',
                        experience: -15
                    },
                    {
                        text: 'Mention in team meetings',
                        outcome: 'Formal analysis and solutions are needed.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Multi-Environment Risk',
                description: 'Testing across multiple environments reveals inconsistent behavior. What\'s your approach?',
                options: [
                    {
                        text: 'Document variations, analyze root causes, and create environment-specific risk profiles',
                        outcome: 'Excellent! Comprehensive environment risk analysis is essential.',
                        experience: 20,
                        tool: 'Environment Risk Profiling'
                    },
                    {
                        text: 'Focus on primary environment only',
                        outcome: 'All environment variations need proper analysis.',
                        experience: -15
                    },
                    {
                        text: 'Report inconsistencies without analysis',
                        outcome: 'Root cause analysis is crucial for environment issues.',
                        experience: -10
                    },
                    {
                        text: 'Assume environment-specific behavior is normal',
                        outcome: 'Inconsistencies need proper investigation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'End-of-Project Risk Review',
                description: 'Project is completing. How do you handle the final risk assessment?',
                options: [
                    {
                        text: 'Conduct comprehensive risk review, document lessons learned, and create future recommendations',
                        outcome: 'Perfect! End-project analysis improves future risk management.',
                        experience: 20,
                        tool: 'Project Risk Review'
                    },
                    {
                        text: 'Only review unresolved risks',
                        outcome: 'Complete risk review helps future projects.',
                        experience: -10
                    },
                    {
                        text: 'Skip review if project successful',
                        outcome: 'All projects need final risk review.',
                        experience: -15
                    },
                    {
                        text: 'Brief summary of major risks only',
                        outcome: 'Detailed analysis provides better future guidance.',
                        experience: -5
                    }
                ]
            }
        ];

        this.displayScenario();

        // Initialize UI and add event listeners
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Add event listeners for the continue and restart buttons
        document.getElementById('continue-btn').addEventListener('click', () => this.nextScenario());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());

        // Add form submission handler
        document.getElementById('options-form').addEventListener('submit', (e) => {
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

    async startGame() {
        try {
            this.isLoading = true;
            this.gameScreen.setAttribute('aria-busy', 'true');
            
            this.player.experience = 0;
            this.player.tools = [];
            this.player.currentScenario = 0;
            this.player.questionHistory = [];
            
            await this.displayScenario();
        } catch (error) {
            console.error('Failed to start game:', error);
            this.showError('Failed to start the quiz. Please try refreshing the page.');
        } finally {
            this.isLoading = false;
            this.gameScreen.setAttribute('aria-busy', 'false');
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.role = 'alert';
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.gameScreen.prepend(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }

    displayScenario() {
        const currentScenarios = this.getCurrentScenarios();
        
        if (this.player.currentScenario >= currentScenarios.length) {
            const totalQuestionsAnswered = this.player.questionHistory.length;
            
            if (this.shouldEndGame(totalQuestionsAnswered, this.player.experience)) {
                this.endGame();
                return;
            }
            
            this.player.currentScenario = 0;
            this.displayScenario();
            return;
        }

        const scenario = currentScenarios[this.player.currentScenario];
        
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

        document.getElementById('scenario-title').textContent = scenario.title;
        document.getElementById('scenario-description').textContent = scenario.description;
        
        const optionsContainer = document.getElementById('options-container');
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

    getCurrentScenarios() {
        const totalAnswered = this.player.questionHistory.length;
        
        if (totalAnswered >= 10 && this.player.experience >= 150) {
            return this.advancedScenarios;
        } else if (totalAnswered >= 5 && this.player.experience >= 50) {
            return this.intermediateScenarios;
        }
        return this.basicScenarios;
    }

    handleAnswer() {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (!selectedOption) return;

        const currentScenarios = this.getCurrentScenarios();
        const scenario = currentScenarios[this.player.currentScenario];
        const originalIndex = parseInt(selectedOption.value);
        
        // Get the original option directly using the stored original index
        const selectedAnswer = scenario.options[originalIndex];

        // Update player experience and history
        this.player.experience = Math.max(0, Math.min(this.maxXP, this.player.experience + selectedAnswer.experience));
        this.player.questionHistory.push({
            scenario: scenario,
            selectedAnswer: selectedAnswer,
            maxPossibleXP: Math.max(...scenario.options.map(o => o.experience))
        });

        // Show outcome screen
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.remove('hidden');
        
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
    }

    nextScenario() {
        this.outcomeScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.player.currentScenario++;
        this.displayScenario();
    }

    restartGame() {
        this.endScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.startGame();
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new RiskAnalysisQuiz();
    quiz.startGame();
}); 