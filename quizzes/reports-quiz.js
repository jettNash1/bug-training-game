class ReportsQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a reporting expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong reporting skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing reporting best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name as a non-configurable, non-writable property
        Object.defineProperty(this, 'quizName', {
            value: 'reports',
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

        // Basic Scenarios (IDs 1-5, 75 XP total)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Report Timing',
                description: 'When should you start writing a daily report?',
                options: [
                    {
                        text: 'Start at 16:45 for standard reports, 16:30 if peer review needed, deliver by 17:00',
                        outcome: 'Perfect! This ensures timely delivery with review time.',
                        experience: 15,
                        tool: 'Time Management'
                    },
                    {
                        text: 'Start at end of day',
                        outcome: 'Reports need time for review and revisions.',
                        experience: -10
                    },
                    {
                        text: 'Write throughout day',
                        outcome: 'Final report needs latest information.',
                        experience: -5
                    },
                    {
                        text: 'Start after 17:00',
                        outcome: 'Reports must be delivered by end of day.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Writing Style',
                description: 'How should you write the report summary?',
                options: [
                    {
                        text: 'Use third person, present tense, objective language without technical jargon',
                        outcome: 'Excellent! This maintains professional tone.',
                        experience: 15,
                        tool: 'Writing Standards'
                    },
                    {
                        text: 'Use first person',
                        outcome: 'Third person keeps tone objective.',
                        experience: -10
                    },
                    {
                        text: 'Use technical jargon',
                        outcome: 'Keep language accessible to all stakeholders.',
                        experience: -5
                    },
                    {
                        text: 'Use past tense',
                        outcome: 'Present tense shows current state.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Summary Structure',
                description: 'What are the four main sections of a report summary?',
                options: [
                    {
                        text: 'Introduction, What went well, What could be better, Conclusion',
                        outcome: 'Perfect! This covers all key aspects.',
                        experience: 15,
                        tool: 'Report Structure'
                    },
                    {
                        text: 'Only issues found',
                        outcome: 'Need balanced coverage of all aspects.',
                        experience: -10
                    },
                    {
                        text: 'Technical details only',
                        outcome: 'Need comprehensive summary structure.',
                        experience: -5
                    },
                    {
                        text: 'Random observations',
                        outcome: 'Structured approach needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Metrics Inclusion',
                description: 'What metrics should be included in the report?',
                options: [
                    {
                        text: 'New issues, closed issues, outstanding issues, and relevant progress tables',
                        outcome: 'Excellent! This provides comprehensive metrics.',
                        experience: 15,
                        tool: 'Metrics Documentation'
                    },
                    {
                        text: 'Only new issues',
                        outcome: 'All relevant metrics needed.',
                        experience: -10
                    },
                    {
                        text: 'Random numbers',
                        outcome: 'Specific metrics needed from script.',
                        experience: -5
                    },
                    {
                        text: 'Skip metrics',
                        outcome: 'Metrics are crucial for reports.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Graph Presentation',
                description: 'How should graphs be presented in the report?',
                options: [
                    {
                        text: 'Consistent width, visible labels, appropriate legends, and alt text',
                        outcome: 'Perfect! This ensures accessible presentation.',
                        experience: 15,
                        tool: 'Visual Documentation'
                    },
                    {
                        text: 'Any size graphs',
                        outcome: 'Consistency needed in presentation.',
                        experience: -10
                    },
                    {
                        text: 'Skip labels',
                        outcome: 'Labels needed for clarity.',
                        experience: -5
                    },
                    {
                        text: 'Random placement',
                        outcome: 'Organized presentation needed.',
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
                title: 'Peer Review Process',
                description: 'How should you handle peer review feedback?',
                options: [
                    {
                        text: 'Review all comments, address each point, resolve comments after fixing, discuss if clarification needed',
                        outcome: 'Perfect! This ensures thorough review process.',
                        experience: 25,
                        tool: 'Peer Review'
                    },
                    {
                        text: 'Ignore feedback',
                        outcome: 'All feedback needs consideration.',
                        experience: -15
                    },
                    {
                        text: 'Delete comments without fixing',
                        outcome: 'Comments need proper resolution.',
                        experience: -10
                    },
                    {
                        text: 'Fix without marking resolved',
                        outcome: 'Comment resolution needed for tracking.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Environment Documentation',
                description: 'How do you document test environments in the report?',
                options: [
                    {
                        text: 'Include matrix with accurate versions, consistent formatting, and relevant environment details',
                        outcome: 'Excellent! This provides clear environment context.',
                        experience: 25,
                        tool: 'Environment Documentation'
                    },
                    {
                        text: 'List device names only',
                        outcome: 'Version details needed.',
                        experience: -15
                    },
                    {
                        text: 'Skip environment details',
                        outcome: 'Environment documentation required.',
                        experience: -10
                    },
                    {
                        text: 'Use outdated versions',
                        outcome: 'Current versions needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Issue Summary Presentation',
                description: 'How should you present the top issues in the report?',
                options: [
                    {
                        text: 'List most functionally impactive issues, include blocking issues separately, hyperlink all references',
                        outcome: 'Perfect! This provides organized issue overview.',
                        experience: 25,
                        tool: 'Issue Documentation'
                    },
                    {
                        text: 'List random issues',
                        outcome: 'Prioritize by impact.',
                        experience: -15
                    },
                    {
                        text: 'Skip hyperlinks',
                        outcome: 'References need proper linking.',
                        experience: -10
                    },
                    {
                        text: 'Mix blocking with regular issues',
                        outcome: 'Separate blocking issues needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Weekly Report Management',
                description: 'How do you manage content for a weekly report?',
                options: [
                    {
                        text: 'Set up template first day, add draft notes daily, compile and refine at week end',
                        outcome: 'Excellent! This ensures comprehensive coverage.',
                        experience: 25,
                        tool: 'Report Management'
                    },
                    {
                        text: 'Write everything last day',
                        outcome: 'Progressive documentation needed.',
                        experience: -15
                    },
                    {
                        text: 'Copy daily reports only',
                        outcome: 'Need proper weekly summary.',
                        experience: -10
                    },
                    {
                        text: 'Skip earlier days',
                        outcome: 'Full week coverage needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Stakeholder Communication',
                description: 'How do you adapt report content for different stakeholders?',
                options: [
                    {
                        text: 'Use clear language, avoid jargon, focus on business impact, maintain professional tone',
                        outcome: 'Perfect! This ensures wide accessibility.',
                        experience: 25,
                        tool: 'Stakeholder Management'
                    },
                    {
                        text: 'Use technical terms only',
                        outcome: 'Language needs to be accessible.',
                        experience: -15
                    },
                    {
                        text: 'Ignore audience needs',
                        outcome: 'Consider all stakeholders.',
                        experience: -10
                    },
                    {
                        text: 'Use casual language',
                        outcome: 'Maintain professional tone.',
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
                title: 'Report Format Adaptation',
                description: 'Client requests different report format mid-project. How do you handle it?',
                options: [
                    {
                        text: 'Discuss with PM, adapt template while maintaining key information, ensure consistent transition',
                        outcome: 'Perfect! This ensures proper format adaptation.',
                        experience: 20,
                        tool: 'Format Management'
                    },
                    {
                        text: 'Continue old format',
                        outcome: 'Client requirements need consideration.',
                        experience: -15
                    },
                    {
                        text: 'Create new format without consultation',
                        outcome: 'PM coordination needed.',
                        experience: -10
                    },
                    {
                        text: 'Mix formats',
                        outcome: 'Consistency needed in transition.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Complex Metrics Analysis',
                description: 'How do you handle conflicting metrics in the report?',
                options: [
                    {
                        text: 'Verify source data, cross-reference scripts, document discrepancies, consult PM if needed',
                        outcome: 'Excellent! This ensures accurate reporting.',
                        experience: 20,
                        tool: 'Data Analysis'
                    },
                    {
                        text: 'Use first numbers found',
                        outcome: 'Verification needed for accuracy.',
                        experience: -15
                    },
                    {
                        text: 'Skip conflicting metrics',
                        outcome: 'All metrics need resolution.',
                        experience: -10
                    },
                    {
                        text: 'Average the numbers',
                        outcome: 'Accurate data needed.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Multi-Environment Reporting',
                description: 'How do you report on testing across multiple complex environments?',
                options: [
                    {
                        text: 'Create clear environment matrix, document specific behaviors, highlight key differences',
                        outcome: 'Perfect! This provides comprehensive environment coverage.',
                        experience: 20,
                        tool: 'Environment Analysis'
                    },
                    {
                        text: 'Group all environments',
                        outcome: 'Specific details needed per environment.',
                        experience: -15
                    },
                    {
                        text: 'Report on primary only',
                        outcome: 'All environments need coverage.',
                        experience: -10
                    },
                    {
                        text: 'Skip environment details',
                        outcome: 'Environment documentation crucial.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Critical Issue Reporting',
                description: 'How do you report multiple critical issues found late in the day?',
                options: [
                    {
                        text: 'Immediately notify PM, document thoroughly in report, highlight business impact',
                        outcome: 'Excellent! This ensures proper critical issue handling.',
                        experience: 20,
                        tool: 'Critical Issue Management'
                    },
                    {
                        text: 'Wait for report',
                        outcome: 'Immediate notification needed.',
                        experience: -15
                    },
                    {
                        text: 'Minimize issue severity',
                        outcome: 'Accurate severity needed.',
                        experience: -10
                    },
                    {
                        text: 'Skip detailed documentation',
                        outcome: 'Thorough documentation required.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Report Quality Assurance',
                description: 'How do you ensure report quality before submission?',
                options: [
                    {
                        text: 'Review content, verify metrics, check formatting, validate links, run spell check, read aloud',
                        outcome: 'Perfect! This ensures comprehensive quality check.',
                        experience: 20,
                        tool: 'Quality Assurance'
                    },
                    {
                        text: 'Quick scan only',
                        outcome: 'Thorough review needed.',
                        experience: -15
                    },
                    {
                        text: 'Skip final review',
                        outcome: 'Quality check crucial.',
                        experience: -10
                    },
                    {
                        text: 'Check spelling only',
                        outcome: 'Multiple aspects need review.',
                        experience: -5
                    }
                ]
            }
        ];

        // Initialize UI elements
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');
        this.levelTransitionContainer = document.getElementById('level-transition-container');

        // Initialize event listeners
        this.initializeEventListeners();

        this.isLoading = false;
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
        
        // Show level transition message at the start of each level
        const previousLevel = this.player.questionHistory.length > 0 ? 
            this.player.questionHistory[this.player.questionHistory.length - 1].scenario.level : null;
            
        if (this.player.currentScenario === 0 || previousLevel !== scenario.level) {
            this.levelTransitionContainer.innerHTML = '';
            const levelMessage = document.createElement('div');
            levelMessage.className = 'level-transition';
            levelMessage.setAttribute('role', 'alert');
            levelMessage.textContent = `Starting ${scenario.level} Questions`;
            
            this.levelTransitionContainer.appendChild(levelMessage);
            this.levelTransitionContainer.classList.add('active');
            
            // Update the level indicator
            document.getElementById('level-indicator').textContent = `Level: ${scenario.level}`;
            
            setTimeout(() => {
                this.levelTransitionContainer.classList.remove('active');
                setTimeout(() => {
                    this.levelTransitionContainer.innerHTML = '';
                }, 300);
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
        const originalScenario = currentScenarios[this.player.currentScenario];
        const choice = parseInt(selectedOption.value);
        
        // Get the selected answer text from the shuffled options
        const selectedText = document.querySelector(`label[for="option${choice}"]`).textContent;
        
        // Find the matching original option to get the correct outcome and experience
        const selectedAnswer = originalScenario.options.find(option => option.text === selectedText);

        this.player.questionHistory.push({
            scenario: originalScenario,
            selectedAnswer: selectedAnswer,
            maxPossibleXP: Math.max(...originalScenario.options.map(o => o.experience))
        }); 

        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.remove('hidden');
        
        document.getElementById('outcome-text').textContent = selectedAnswer.outcome;
        document.getElementById('xp-gained').textContent = `Experience gained: ${selectedAnswer.experience}`;
        
        if (selectedAnswer.tool) {
            document.getElementById('tool-gained').textContent = `Tool acquired: ${selectedAnswer.tool}`;
            this.player.tools.push(selectedAnswer.tool);
        } else {
            document.getElementById('tool-gained').textContent = '';
        }

        this.player.experience += selectedAnswer.experience;
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

    // In endGame method:
    if (currentUsername) {
        try {
            const user = new QuizUser(currentUsername);
            user.updateQuizScore('reports', scorePercentage);
            console.log('Quiz score saved successfully:', scorePercentage);
        } catch (error) {
            console.error('Error saving quiz score:', error);
        }
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new ReportsQuiz();
    quiz.startGame();
}); 