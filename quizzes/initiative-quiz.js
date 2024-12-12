class CommunicationQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a initiative expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong initiative skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing initiative best practices and try again!' }
            ]
        };
        
        super(config);
        
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
                title: 'New Team Member Support',
                description: 'You notice a new team member looking uncertain about their tasks. What\'s the best initiative to take?',
                options: [
                    {
                        text: 'Proactively offer help and support before they ask',
                        outcome: 'Perfect! Taking initiative to help others shows great team spirit.',
                        experience: 15,
                        tool: 'Team Support'
                    },
                    {
                        text: 'Wait for them to ask for help',
                        outcome: 'Initiative means offering support before being asked.',
                        experience: -5
                    },
                    {
                        text: 'Tell their manager they seem to be struggling',
                        outcome: 'Direct support is better than escalating immediately.',
                        experience: -10
                    },
                    {
                        text: 'Send them documentation links without context',
                        outcome: 'Personal support is more effective than just sharing resources.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Office Cleanup',
                description: 'After a work social event, the office space is messy and people are leaving. What shows the best initiative?',
                options: [
                    {
                        text: 'Start cleaning up and organizing without being asked',
                        outcome: 'Excellent! Taking responsibility for shared spaces shows great initiative.',
                        experience: 15,
                        tool: 'Workplace Responsibility'
                    },
                    {
                        text: 'Leave it for the cleaning staff',
                        outcome: 'This misses an opportunity to show initiative and responsibility.',
                        experience: -10
                    },
                    {
                        text: 'Ask who is responsible for cleanup',
                        outcome: 'Initiative means taking action without seeking assignment.',
                        experience: -5
                    },
                    {
                        text: 'Clean up only your own space',
                        outcome: 'While helpful, this doesn\'t show full initiative for team needs.',
                        experience: 5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Common Queries',
                description: 'You notice certain questions keep coming up in your team. What\'s the most initiative-driven response?',
                options: [
                    {
                        text: 'Create a FAQ or cheat sheet for the team',
                        outcome: 'Great! Creating resources proactively helps the whole team.',
                        experience: 15,
                        tool: 'Knowledge Sharing'
                    },
                    {
                        text: 'Keep answering questions as they come',
                        outcome: 'This misses an opportunity to create a lasting solution.',
                        experience: -5
                    },
                    {
                        text: 'Suggest others should create documentation',
                        outcome: 'Taking initiative means acting on opportunities yourself.',
                        experience: -10
                    },
                    {
                        text: 'Only document your own frequently asked questions',
                        outcome: 'While helpful, this doesn\'t address team-wide needs.',
                        experience: 5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Project Documentation',
                description: 'You\'re starting a new project and notice the documentation is outdated. What shows the best initiative?',
                options: [
                    {
                        text: 'Update the documentation and add missing information',
                        outcome: 'Perfect! Proactively improving documentation helps everyone.',
                        experience: 15,
                        tool: 'Documentation Management'
                    },
                    {
                        text: 'Wait for someone else to update it',
                        outcome: 'Initiative means addressing issues when you spot them.',
                        experience: -10
                    },
                    {
                        text: 'Report the outdated documentation to management',
                        outcome: 'Taking action directly is better than just reporting.',
                        experience: -5
                    },
                    {
                        text: 'Work around the outdated information',
                        outcome: 'This doesn\'t help solve the underlying issue.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Spare Time Usage',
                description: 'You have some spare time during your workday. What shows the best initiative?',
                options: [
                    {
                        text: 'Identify and work on valuable tasks that benefit the team or project',
                        outcome: 'Excellent! Using spare time productively shows great initiative.',
                        experience: 15,
                        tool: 'Time Management'
                    },
                    {
                        text: 'Wait for new tasks to be assigned',
                        outcome: 'Initiative means finding valuable work without being prompted.',
                        experience: -10
                    },
                    {
                        text: 'Ask colleagues if they need help',
                        outcome: 'While helpful, proactively identifying tasks shows more initiative.',
                        experience: 5
                    },
                    {
                        text: 'Use the time for personal tasks',
                        outcome: 'This misses an opportunity to add value to the team.',
                        experience: -5
                    }
                ]
            },
        ];
            // Intermediate Scenarios (IDs 6-10, 125 XP total)
            this.intermediateScenarios = [
                {
                    id: 6,
                    level: 'Intermediate',
                    title: 'Project Handover',
                    description: 'You\'re leaving a project tomorrow and new testers are joining. How do you show the best initiative?',
                    options: [
                        {
                            text: 'Create comprehensive handover notes and context documentation',
                            outcome: 'Perfect! Proactive knowledge transfer shows excellent initiative.',
                            experience: 25,
                            tool: 'Knowledge Transfer'
                        },
                        {
                            text: 'Wait for the new testers to ask questions',
                            outcome: 'Initiative means preparing resources before they\'re needed.',
                            experience: -15
                        },
                        {
                            text: 'Leave basic notes about current tasks',
                            outcome: 'While helpful, this doesn\'t provide full context needed.',
                            experience: 5
                        },
                        {
                            text: 'Tell them to check existing documentation',
                            outcome: 'This doesn\'t help bridge knowledge gaps effectively.',
                            experience: -10
                        }
                    ]
                },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Test Environment Access',
                description: 'You realize you don\'t have access to a required device for testing. What shows the best initiative?',
                options: [
                    {
                        text: 'Proactively identify who has access and arrange coverage early',
                        outcome: 'Excellent! Taking early action to solve access issues shows great initiative.',
                        experience: 25,
                        tool: 'Resource Management'
                    },
                    {
                        text: 'Wait for the PM to sort out access',
                        outcome: 'Initiative means addressing potential blockers early.',
                        experience: -15
                    },
                    {
                        text: 'Skip testing on that device',
                        outcome: 'This avoids rather than solves the problem.',
                        experience: -10
                    },
                    {
                        text: 'Report the access issue and wait',
                        outcome: 'While reporting is good, taking action to solve is better.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Project Information Needs',
                description: 'You need information from the client and have access to client communications. What shows the best initiative?',
                options: [
                    {
                        text: 'Contact the client directly with clear, professional questions',
                        outcome: 'Perfect! Taking initiative to gather needed information directly.',
                        experience: 25,
                        tool: 'Client Communication'
                    },
                    {
                        text: 'Ask the PM to get the information',
                        outcome: 'This creates unnecessary delays when you have direct access.',
                        experience: -15
                    },
                    {
                        text: 'Work around the missing information',
                        outcome: 'This could lead to incorrect assumptions and issues.',
                        experience: -10
                    },
                    {
                        text: 'Wait for the next scheduled client meeting',
                        outcome: 'Proactive communication is better than waiting.',
                        experience: 5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Project Coverage Completion',
                description: 'You\'ve finished main project coverage with time remaining. How do you show the best initiative?',
                options: [
                    {
                        text: 'Review less-tested areas and enhance documentation',
                        outcome: 'Excellent! Using extra time to improve coverage shows great initiative.',
                        experience: 25,
                        tool: 'Quality Assurance'
                    },
                    {
                        text: 'Report that you\'re done and wait',
                        outcome: 'This misses opportunities to add value.',
                        experience: -15
                    },
                    {
                        text: 'Start on personal tasks',
                        outcome: 'Project time should be used for project improvement.',
                        experience: -10
                    },
                    {
                        text: 'Only help if someone asks',
                        outcome: 'Initiative means identifying opportunities without being asked.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'New Project Preparation',
                description: 'You\'re unsold today but have a new project tomorrow. What shows the best initiative?',
                options: [
                    {
                        text: 'Review available project materials and prepare testing environment',
                        outcome: 'Perfect! Preparing ahead shows excellent initiative.',
                        experience: 25,
                        tool: 'Project Preparation'
                    },
                    {
                        text: 'Wait until tomorrow to start preparation',
                        outcome: 'Using available time to prepare shows better initiative.',
                        experience: -15
                    },
                    {
                        text: 'Only check if you have project access',
                        outcome: 'While helpful, this misses opportunities for fuller preparation.',
                        experience: 5
                    },
                    {
                        text: 'Ask others what the project is about',
                        outcome: 'Direct research shows more initiative than just asking others.',
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
                title: 'Post-Release Issue Management',
                description: 'Issues have been found after release during test support. How do you show the highest level of initiative?',
                options: [
                    {
                        text: 'Investigate root cause, document findings, and propose prevention measures',
                        outcome: 'Excellent! Comprehensive problem-solving shows advanced initiative.',
                        experience: 20,
                        tool: 'Issue Resolution'
                    },
                    {
                        text: 'Only fix the immediate issues',
                        outcome: 'Initiative includes preventing future problems.',
                        experience: -15
                    },
                    {
                        text: 'Wait for instructions from the team lead',
                        outcome: 'Advanced initiative means taking leadership in problem-solving.',
                        experience: -10
                    },
                    {
                        text: 'Document the issues for others to investigate',
                        outcome: 'While documentation is important, taking action is better.',
                        experience: 0
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Project Process Improvement',
                description: 'You\'ve noticed inefficiencies in the current testing process. What shows the highest initiative?',
                options: [
                    {
                        text: 'Document issues, research solutions, and present improvement proposals',
                        outcome: 'Perfect! Taking leadership in process improvement shows advanced initiative.',
                        experience: 20,
                        tool: 'Process Improvement'
                    },
                    {
                        text: 'Mention the issues in team meetings',
                        outcome: 'Advanced initiative requires more than just highlighting problems.',
                        experience: -10
                    },
                    {
                        text: 'Work around the inefficiencies',
                        outcome: 'This doesn\'t address the underlying issues.',
                        experience: -15
                    },
                    {
                        text: 'Ask others if they\'ve noticed the issues',
                        outcome: 'While gathering input is good, taking action is better.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Cross-Team Collaboration',
                description: 'You identify an issue that affects multiple teams. How do you show the most initiative?',
                options: [
                    {
                        text: 'Coordinate with all affected teams and lead resolution efforts',
                        outcome: 'Excellent! Taking leadership in cross-team issues shows advanced initiative.',
                        experience: 20,
                        tool: 'Collaboration Management'
                    },
                    {
                        text: 'Report the issue to each team separately',
                        outcome: 'This misses opportunity for coordinated resolution.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on your team\'s portion',
                        outcome: 'Advanced initiative means addressing the broader impact.',
                        experience: -15
                    },
                    {
                        text: 'Wait for someone else to coordinate',
                        outcome: 'Leadership opportunity missed.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Knowledge Sharing Leadership',
                description: 'You\'ve developed efficient testing methods over time. How do you best show initiative in sharing this knowledge?',
                options: [
                    {
                        text: 'Create comprehensive guides and organize training sessions',
                        outcome: 'Perfect! Proactively sharing knowledge shows advanced initiative.',
                        experience: 20,
                        tool: 'Knowledge Management'
                    },
                    {
                        text: 'Share tips only when asked',
                        outcome: 'Advanced initiative means proactively sharing expertise.',
                        experience: -15
                    },
                    {
                        text: 'Keep the methods to yourself',
                        outcome: 'Knowledge hoarding doesn\'t help team growth.',
                        experience: -10
                    },
                    {
                        text: 'Mention them casually in meetings',
                        outcome: 'Structured knowledge sharing is more effective.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Strategic Project Planning',
                description: 'You notice potential future challenges in a long-term project. How do you show the highest initiative?',
                options: [
                    {
                        text: 'Develop and present a strategic plan to address future challenges',
                        outcome: 'Excellent! Strategic thinking and planning shows advanced initiative.',
                        experience: 20,
                        tool: 'Strategic Planning'
                    },
                    {
                        text: 'Wait until the challenges become actual problems',
                        outcome: 'Advanced initiative means addressing issues before they occur.',
                        experience: -15
                    },
                    {
                        text: 'Mention concerns without solutions',
                        outcome: 'Initiative includes proposing solutions, not just identifying problems.',
                        experience: -10
                    },
                    {
                        text: 'Add it to the risk register only',
                        outcome: 'While documentation is good, taking action is better.',
                        experience: -5
                    }
                ]
            }
        ];

        this.initializeUI();

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.type === 'radio') {
                this.handleAnswer();
            }
        });

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

        const scenario = this.shuffleScenarioOptions(currentScenarios[this.player.currentScenario]);
        
        if (this.player.currentScenario === 0) {
            const levelMessage = document.createElement('div');
            levelMessage.className = 'level-transition';
            levelMessage.textContent = `Starting ${scenario.level} Questions`;
            this.gameScreen.insertBefore(levelMessage, this.gameScreen.firstChild);
            
            setTimeout(() => levelMessage.remove(), 3000);
            
            document.getElementById('level-indicator').textContent = `Level: ${scenario.level}`;
        }

        // Update UI with scenario details
        document.getElementById('scenario-title').textContent = scenario.title;
        document.getElementById('scenario-description').textContent = scenario.description;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        scenario.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <input type="radio" 
                    name="option" 
                    value="${index}" 
                    id="option${index}"
                    tabindex="0"
                    aria-label="${option.text}"
                    role="radio">
                <label for="option${index}">${option.text}</label>
            `;
            optionsContainer.appendChild(optionElement);
        });

        // Focus on first option for keyboard navigation
        const firstOption = optionsContainer.querySelector('input[type="radio"]');
        if (firstOption) {
            firstOption.focus();
        }

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

    endGame() {
        try {
            this.gameScreen.classList.add('hidden');
            this.outcomeScreen.classList.add('hidden');
            this.endScreen.classList.remove('hidden');

            const finalScore = Math.min(this.player.experience, this.maxXP);
            const scorePercentage = Math.round((finalScore / this.maxXP) * 100);
            
            // Save the quiz result for the current user
            const currentUsername = localStorage.getItem('currentUser');
            if (currentUsername) {
                try {
                    const user = new QuizUser(currentUsername);
                    user.updateQuizScore('communication', scorePercentage);
                    console.log('Quiz score saved successfully:', scorePercentage);
                } catch (error) {
                    console.error('Error saving quiz score:', error);
                }
            } else {
                console.log('No user logged in, score not saved');
            }

            document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

            const performanceSummary = document.getElementById('performance-summary');
            const threshold = this.performanceThresholds.find(t => finalScore >= t.threshold);
            performanceSummary.textContent = threshold.message;

            this.displayQuestionReview();
            this.generateRecommendations();
        } catch (error) {
            console.error('Error in endGame:', error);
        }
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new CommunicationQuiz();
    quiz.startGame();
}); 