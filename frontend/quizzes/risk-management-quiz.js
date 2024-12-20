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
        
        // Initialize screen references
        this.gameScreen = null;
        this.outcomeScreen = null;
        this.endScreen = null;
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'issue-tracking-tools',
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

        // Initialize UI and add event listeners
        this.initializeEventListeners();
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.role = 'alert';
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.gameScreen = document.getElementById('game-screen');
        if (this.gameScreen) {
            this.gameScreen.prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }

    async startGame() {
        try {
            // Initialize game screen reference
            this.gameScreen = document.getElementById('game-screen');
            this.outcomeScreen = document.getElementById('outcome-screen');
            this.endScreen = document.getElementById('end-screen');
            
            this.player.experience = 0;
            this.player.tools = [];
            this.player.currentScenario = 0;
            this.player.questionHistory = [];
            
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
        }
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
        
        // Show level transition message at the start of each level
        const previousLevel = this.player.questionHistory.length > 0 ? 
            this.player.questionHistory[this.player.questionHistory.length - 1].scenario.level : null;
            
        if (this.player.currentScenario === 0 || previousLevel !== scenario.level) {
            const transitionContainer = document.getElementById('level-transition-container');
            transitionContainer.innerHTML = ''; // Clear any existing messages
            
            const levelMessage = document.createElement('div');
            levelMessage.className = 'level-transition';
            levelMessage.setAttribute('role', 'alert');
            levelMessage.textContent = `Starting ${scenario.level} Questions`;
            
            transitionContainer.appendChild(levelMessage);
            transitionContainer.classList.add('active');
            
            // Update the level indicator
            document.getElementById('level-indicator').textContent = `Level: ${scenario.level}`;
            
            // Remove the message and container height after animation
            setTimeout(() => {
                transitionContainer.classList.remove('active');
                setTimeout(() => {
                    transitionContainer.innerHTML = '';
                }, 300); // Wait for height transition to complete
            }, 3000);
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
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new RiskManagementQuiz();
    quiz.startGame();
}); 