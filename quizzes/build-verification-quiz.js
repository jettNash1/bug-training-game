class BuildVerificationQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a BVT expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong understanding of BVT!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing BVT best practices and try again!' }
            ]
        };
        
        super(config);
        
        Object.defineProperty(this, 'quizName', {
            value: 'build-verification',
            writable: false,
            configurable: false,
            enumerable: true
        });
        
        this.player = {
            name: '',
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: []
        };

        // Basic Scenarios
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'BVT Purpose',
                description: 'What is the primary purpose of Build Verification Testing?',
                options: [
                    {
                        text: 'To validate core functionality and stability of each new build before further testing',
                        outcome: 'Correct! BVT ensures basic functionality works before deeper testing.',
                        experience: 15,
                        tool: 'BVT Fundamentals'
                    },
                    {
                        text: 'To find all possible bugs in the software',
                        outcome: 'BVT focuses on core functionality, not exhaustive testing.',
                        experience: -10
                    },
                    {
                        text: 'To replace other forms of testing',
                        outcome: 'BVT complements other testing types, not replaces them.',
                        experience: -5
                    },
                    {
                        text: 'To test only new features',
                        outcome: 'BVT checks core functionality, including existing features.',
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Test Case Priority',
                description: 'When writing BVT test cases, what should be your main focus?',
                options: [
                    {
                        text: 'Critical functionality and core features that must work for basic operation',
                        outcome: 'Perfect! BVT prioritizes critical functionality.',
                        experience: 15,
                        tool: 'Test Case Prioritization'
                    },
                    {
                        text: 'Minor UI improvements',
                        outcome: 'BVT focuses on critical functionality, not minor improvements.',
                        experience: -10
                    },
                    {
                        text: 'Edge cases only',
                        outcome: 'Core functionality takes priority in BVT.',
                        experience: -5
                    },
                    {
                        text: 'Documentation updates',
                        outcome: 'BVT verifies functionality, not documentation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'BVT Scope',
                description: 'What should be the focus of Build Verification Testing?',
                options: [
                    {
                        text: 'Critical functionality and core features that must work for basic operation',
                        outcome: 'Correct! BVT focuses on core functionality.',
                        experience: 15,
                        tool: 'Scope Management'
                    },
                    {
                        text: 'All possible bugs in the system',
                        outcome: 'BVT is not meant to be exhaustive testing.',
                        experience: -10
                    },
                    {
                        text: 'Only UI improvements',
                        outcome: 'Core functionality is more important for BVT.',
                        experience: -5
                    },
                    {
                        text: 'Only new features',
                        outcome: 'BVT should cover core functionality, both new and existing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'BVT Timing',
                description: 'When should Build Verification Testing be performed?',
                options: [
                    {
                        text: 'After each new build, before further testing or integration',
                        outcome: 'Correct! Early verification prevents downstream issues.',
                        experience: 15,
                        tool: 'Test Timing'
                    },
                    {
                        text: 'Only at the end of development',
                        outcome: 'BVT should be done early to catch issues.',
                        experience: -10
                    },
                    {
                        text: 'Only during final release',
                        outcome: 'Early verification is crucial.',
                        experience: -5
                    },
                    {
                        text: 'When bugs are reported',
                        outcome: 'BVT is preventive, not reactive.',
                        experience: -5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'BVT Documentation',
                description: 'What is essential for BVT test cases?',
                options: [
                    {
                        text: 'Well-defined expected results and clear steps',
                        outcome: 'Perfect! Clear documentation ensures consistent execution.',
                        experience: 15,
                        tool: 'Documentation Standards'
                    },
                    {
                        text: 'Minimal documentation',
                        outcome: 'Clear documentation is crucial for BVT.',
                        experience: -10
                    },
                    {
                        text: 'Only pass/fail results',
                        outcome: 'Steps and expected results are needed.',
                        experience: -5
                    },
                    {
                        text: 'Just test titles',
                        outcome: 'Detailed documentation is required.',
                        experience: -5
                    }
                ]
            }
        ];

        // Intermediate Scenarios
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Test Environment Setup',
                description: 'How should you organize BVT test suites?',
                options: [
                    {
                        text: 'Break down by environment type rather than focus areas',
                        outcome: 'Excellent! This allows for consistent testing across environments.',
                        experience: 20,
                        tool: 'Environment Management'
                    },
                    {
                        text: 'Mix different environment tests together',
                        outcome: 'Keeping environments separate improves organization.',
                        experience: -15
                    },
                    {
                        text: 'Only test in one environment',
                        outcome: 'Multiple environments need verification.',
                        experience: -10
                    },
                    {
                        text: 'Skip environment organization',
                        outcome: 'Proper organization is crucial for BVT.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Test Case Maintenance',
                description: 'How should BVT test cases be maintained throughout development?',
                options: [
                    {
                        text: 'Regularly update to include new core features and maintain accuracy',
                        outcome: 'Perfect! Test cases must stay current and accurate.',
                        experience: 20,
                        tool: 'Test Case Management'
                    },
                    {
                        text: 'Leave test cases unchanged',
                        outcome: 'Test cases need updates as software evolves.',
                        experience: -15
                    },
                    {
                        text: 'Only update when tests fail',
                        outcome: 'Proactive updates are better than reactive.',
                        experience: -10
                    },
                    {
                        text: 'Remove outdated tests without replacement',
                        outcome: 'Replace outdated tests with updated versions.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Defect Handling',
                description: 'How should defects found during BVT be handled?',
                options: [
                    {
                        text: 'Report immediately as blocking issues for quick resolution',
                        outcome: 'Excellent! BVT failures need immediate attention.',
                        experience: 20,
                        tool: 'Defect Management'
                    },
                    {
                        text: 'Continue testing and report later',
                        outcome: 'BVT failures need immediate attention.',
                        experience: -15
                    },
                    {
                        text: 'Fix without reporting',
                        outcome: 'Proper documentation is needed.',
                        experience: -10
                    },
                    {
                        text: 'Treat as low priority',
                        outcome: 'BVT issues are typically high priority.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Test Coverage',
                description: 'What should BVT test coverage focus on?',
                options: [
                    {
                        text: 'Core functionality and critical paths across all environments',
                        outcome: 'Perfect! Focus on what\'s most important.',
                        experience: 20,
                        tool: 'Coverage Analysis'
                    },
                    {
                        text: 'Every possible scenario',
                        outcome: 'BVT should focus on core functionality.',
                        experience: -15
                    },
                    {
                        text: 'Random features',
                        outcome: 'Coverage should be strategic.',
                        experience: -10
                    },
                    {
                        text: 'Only new features',
                        outcome: 'Core functionality needs coverage.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Resource Allocation',
                description: 'How should resources be allocated for BVT?',
                options: [
                    {
                        text: 'Dedicated time and team members for quick execution',
                        outcome: 'Correct! Dedicated resources ensure timely BVT.',
                        experience: 20,
                        tool: 'Resource Planning'
                    },
                    {
                        text: 'When resources are available',
                        outcome: 'BVT needs dedicated resources.',
                        experience: -15
                    },
                    {
                        text: 'No specific allocation',
                        outcome: 'Resource planning is important.',
                        experience: -10
                    },
                    {
                        text: 'Only junior testers',
                        outcome: 'BVT needs experienced resources.',
                        experience: -5
                    }
                ]
            }
        ];

        // Advanced Scenarios
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'BVT Automation Decision',
                description: 'When considering BVT automation, what\'s the most important factor?',
                options: [
                    {
                        text: 'Frequency of test execution and resource availability',
                        outcome: 'Correct! These factors determine automation value.',
                        experience: 25,
                        tool: 'Automation Strategy'
                    },
                    {
                        text: 'Always automate everything',
                        outcome: 'Automation decisions need careful consideration.',
                        experience: -20
                    },
                    {
                        text: 'Never automate BVT',
                        outcome: 'Automation can be valuable for frequent BVT.',
                        experience: -15
                    },
                    {
                        text: 'Base decision on team size only',
                        outcome: 'Multiple factors affect automation decisions.',
                        experience: -10
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'BVT Evolution',
                description: 'How should BVT evolve during project lifecycle?',
                options: [
                    {
                        text: 'Continuously update based on new features and lessons learned',
                        outcome: 'Perfect! BVT should evolve with the project.',
                        experience: 25,
                        tool: 'Process Improvement'
                    },
                    {
                        text: 'Keep unchanged throughout',
                        outcome: 'BVT needs to adapt to changes.',
                        experience: -20
                    },
                    {
                        text: 'Remove old tests only',
                        outcome: 'Updates should be comprehensive.',
                        experience: -15
                    },
                    {
                        text: 'Change only when failed',
                        outcome: 'Proactive updates are better.',
                        experience: -10
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Communication Strategy',
                description: 'How should BVT results be communicated?',
                options: [
                    {
                        text: 'Clear, immediate reporting to all stakeholders with impact assessment',
                        outcome: 'Excellent! Effective communication is crucial.',
                        experience: 25,
                        tool: 'Communication Management'
                    },
                    {
                        text: 'Only report failures',
                        outcome: 'All results need reporting.',
                        experience: -20
                    },
                    {
                        text: 'Wait for questions',
                        outcome: 'Proactive communication needed.',
                        experience: -15
                    },
                    {
                        text: 'Technical team only',
                        outcome: 'All stakeholders need updates.',
                        experience: -10
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'BVT Metrics',
                description: 'What metrics are most important for BVT?',
                options: [
                    {
                        text: 'Pass/fail rate, execution time, and blocking issues found',
                        outcome: 'Perfect! These metrics help improve BVT process.',
                        experience: 25,
                        tool: 'Metrics Analysis'
                    },
                    {
                        text: 'Number of tests only',
                        outcome: 'Multiple metrics needed.',
                        experience: -20
                    },
                    {
                        text: 'Test execution time only',
                        outcome: 'More metrics are important.',
                        experience: -15
                    },
                    {
                        text: 'Random statistics',
                        outcome: 'Metrics should be meaningful.',
                        experience: -10
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'BVT Integration',
                description: 'How should BVT integrate with development workflow?',
                options: [
                    {
                        text: 'Seamlessly as part of CI/CD with clear pass/fail gates',
                        outcome: 'Excellent! Integration ensures consistent verification.',
                        experience: 25,
                        tool: 'CI/CD Integration'
                    },
                    {
                        text: 'As a separate process',
                        outcome: 'Integration with workflow is important.',
                        experience: -20
                    },
                    {
                        text: 'Only when requested',
                        outcome: 'Regular integration needed.',
                        experience: -15
                    },
                    {
                        text: 'After deployment only',
                        outcome: 'Earlier integration is better.',
                        experience: -10
                    }
                ]
            }
        ];

        // Initialize event listeners
        this.initializeEventListeners();
    }

    async startGame() {
        try {
            this.player.experience = 0;
            this.player.tools = [];
            this.player.currentScenario = 0;
            this.player.questionHistory = [];
            
            // Clear any existing transition messages
            const transitionContainer = document.getElementById('level-transition-container');
            transitionContainer.innerHTML = '';
            transitionContainer.classList.remove('active');
            
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
    const quiz = new BuildVerificationQuiz();
    quiz.startGame();
}); 