class IssueVerificationQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 350, message: '🏆 Outstanding! You have an excellent understanding of issue verification!' },
                { threshold: 250, message: '👏 Great job! You show strong knowledge of issue verification!' },
                { threshold: 150, message: '👍 Good work! Keep developing your understanding of issue verification.' },
                { threshold: 0, message: '📚 Review the issue verification guide and try again!' }
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
                title: 'Verification Priority',
                description: 'You have limited time for issue verification. How do you prioritize tickets?',
                options: [
                    {
                        text: 'Start with highest priority and severity issues, ensuring critical fixes are verified first',
                        outcome: 'Perfect! This ensures most important issues are verified.',
                        experience: 15,
                        tool: 'Prioritization'
                    },
                    {
                        text: 'Verify tickets in chronological order',
                        outcome: 'Priority and severity should guide verification order.',
                        experience: -10
                    },
                    {
                        text: 'Start with easiest tickets',
                        outcome: 'Critical issues need verification first.',
                        experience: -5
                    },
                    {
                        text: 'Verify random tickets',
                        outcome: 'Structured prioritization is needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Environment Matching',
                description: 'You need to verify a device-specific issue. What\'s the correct approach?',
                options: [
                    {
                        text: 'Verify on the original environment where possible, or clearly document any environment differences',
                        outcome: 'Excellent! This maintains testing consistency.',
                        experience: 15,
                        tool: 'Environment Management'
                    },
                    {
                        text: 'Test on any available device',
                        outcome: 'Original environment should be prioritized.',
                        experience: -10
                    },
                    {
                        text: 'Skip device-specific issues',
                        outcome: 'Device-specific issues need verification.',
                        experience: -5
                    },
                    {
                        text: 'Mark as verified without testing',
                        outcome: 'Actual verification is required.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Verification Comments',
                description: 'How should you document your verification findings?',
                options: [
                    {
                        text: 'Use template format with status, date, observations, version, environments, and evidence',
                        outcome: 'Perfect! This provides comprehensive verification documentation.',
                        experience: 15,
                        tool: 'Documentation'
                    },
                    {
                        text: 'Just update the status',
                        outcome: 'Detailed comments are required.',
                        experience: -10
                    },
                    {
                        text: 'Write "fixed" or "not fixed"',
                        outcome: 'More detailed documentation needed.',
                        experience: -5
                    },
                    {
                        text: 'Only add screenshots',
                        outcome: 'Written documentation needed with evidence.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Evidence Capture',
                description: 'What\'s the best practice for capturing verification evidence?',
                options: [
                    {
                        text: 'Use appropriate tools, highlight issues clearly, repeat demonstrations in videos',
                        outcome: 'Excellent! This provides clear verification evidence.',
                        experience: 15,
                        tool: 'Evidence Capture'
                    },
                    {
                        text: 'Quick unlabeled screenshots',
                        outcome: 'Evidence needs clear highlighting.',
                        experience: -10
                    },
                    {
                        text: 'Skip evidence capture',
                        outcome: 'Evidence is important for verification.',
                        experience: -5
                    },
                    {
                        text: 'Rushed video capture',
                        outcome: 'Clear, repeated demonstrations needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Status Updates',
                description: 'An issue is partially fixed. How do you update its status?',
                options: [
                    {
                        text: 'Mark as Partially Fixed with detailed explanation of remaining issues',
                        outcome: 'Perfect! This accurately reflects partial fixes.',
                        experience: 15,
                        tool: 'Status Management'
                    },
                    {
                        text: 'Mark as Fixed',
                        outcome: 'Partial fixes need specific status.',
                        experience: -10
                    },
                    {
                        text: 'Mark as Not Fixed',
                        outcome: 'Acknowledge partial improvements.',
                        experience: -5
                    },
                    {
                        text: 'Leave status unchanged',
                        outcome: 'Status needs updating with verification.',
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
                title: 'Regression Testing',
                description: 'After verifying fixes, how do you approach regression testing?',
                options: [
                    {
                        text: 'Focus on areas where fixes were implemented, while also checking surrounding functionality',
                        outcome: 'Perfect! This ensures thorough regression coverage.',
                        experience: 25,
                        tool: 'Regression Testing'
                    },
                    {
                        text: 'Only check fixed issues',
                        outcome: 'Surrounding areas need testing too.',
                        experience: -15
                    },
                    {
                        text: 'Skip regression testing',
                        outcome: 'Regression is crucial after fixes.',
                        experience: -10
                    },
                    {
                        text: 'Test random areas',
                        outcome: 'Focus needed on changed areas.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Time Management',
                description: 'How do you manage time during a verification session?',
                options: [
                    {
                        text: 'Set goals for ticket verification numbers and allocate specific time for regression',
                        outcome: 'Excellent! This ensures balanced coverage.',
                        experience: 25,
                        tool: 'Time Management'
                    },
                    {
                        text: 'Verify tickets until done',
                        outcome: 'Time needs allocation for regression.',
                        experience: -15
                    },
                    {
                        text: 'Focus only on regression',
                        outcome: 'Verification needs proper time allocation.',
                        experience: -10
                    },
                    {
                        text: 'No time planning',
                        outcome: 'Structured time management needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'New Issues Discovery',
                description: 'You find new issues during verification. How do you handle them?',
                options: [
                    {
                        text: 'Raise new tickets and note if they\'re related to recent fixes',
                        outcome: 'Perfect! This tracks new issues properly.',
                        experience: 25,
                        tool: 'Issue Management'
                    },
                    {
                        text: 'Add to existing tickets',
                        outcome: 'New issues need separate tickets.',
                        experience: -15
                    },
                    {
                        text: 'Ignore new issues',
                        outcome: 'All issues need documentation.',
                        experience: -10
                    },
                    {
                        text: 'Only mention in summary',
                        outcome: 'New issues need proper tickets.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Device Availability',
                description: 'Original test device isn\'t available. How do you proceed?',
                options: [
                    {
                        text: 'Contact device owner early, check device lists, consider BrowserStack with PM approval',
                        outcome: 'Excellent! This shows proper device management.',
                        experience: 25,
                        tool: 'Resource Management'
                    },
                    {
                        text: 'Skip device-specific issues',
                        outcome: 'Alternative solutions should be explored.',
                        experience: -15
                    },
                    {
                        text: 'Test on different device without noting',
                        outcome: 'Environment differences need documentation.',
                        experience: -10
                    },
                    {
                        text: 'Mark as cannot test',
                        outcome: 'Explore alternative testing options.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Client Communication',
                description: 'Client hasn\'t updated ticket statuses. How do you proceed?',
                options: [
                    {
                        text: 'Contact PM to confirm which issues have been worked on, prioritize known fixed issues',
                        outcome: 'Perfect! This ensures efficient verification.',
                        experience: 25,
                        tool: 'Communication'
                    },
                    {
                        text: 'Test all tickets',
                        outcome: 'Prioritization needed for efficiency.',
                        experience: -15
                    },
                    {
                        text: 'Wait for updates',
                        outcome: 'Proactive communication needed.',
                        experience: -10
                    },
                    {
                        text: 'Skip verification',
                        outcome: 'Verification needed with prioritization.',
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
                title: 'Complex Issue Verification',
                description: 'A complex issue involves multiple interconnected features. How do you verify it?',
                options: [
                    {
                        text: 'Test all connected features, document dependencies, verify full workflow',
                        outcome: 'Perfect! This ensures thorough verification.',
                        experience: 20,
                        tool: 'Complex Testing'
                    },
                    {
                        text: 'Only test main feature',
                        outcome: 'Connected features need verification.',
                        experience: -15
                    },
                    {
                        text: 'Quick check only',
                        outcome: 'Complex issues need thorough testing.',
                        experience: -10
                    },
                    {
                        text: 'Mark as too complex',
                        outcome: 'All issues need proper verification.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Multiple Environment Issues',
                description: 'An issue affects multiple environments differently. How do you verify it?',
                options: [
                    {
                        text: 'Test each environment, document specific behaviors, note any variations',
                        outcome: 'Excellent! This provides complete environment coverage.',
                        experience: 20,
                        tool: 'Environment Testing'
                    },
                    {
                        text: 'Test one environment only',
                        outcome: 'All affected environments need testing.',
                        experience: -15
                    },
                    {
                        text: 'Assume same behavior',
                        outcome: 'Environment variations need verification.',
                        experience: -10
                    },
                    {
                        text: 'Mark as too complex',
                        outcome: 'Environment differences need documentation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Regression Impact Analysis',
                description: 'Multiple fixes have been implemented. How do you assess regression impact?',
                options: [
                    {
                        text: 'Map fix relationships, test impacted areas, document any cascading effects',
                        outcome: 'Perfect! This ensures comprehensive regression analysis.',
                        experience: 20,
                        tool: 'Impact Analysis'
                    },
                    {
                        text: 'Test fixes in isolation',
                        outcome: 'Related impacts need assessment.',
                        experience: -15
                    },
                    {
                        text: 'Basic regression only',
                        outcome: 'Thorough impact analysis needed.',
                        experience: -10
                    },
                    {
                        text: 'Skip impact analysis',
                        outcome: 'Fix impacts need assessment.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Verification Report Creation',
                description: 'How do you create a comprehensive verification report?',
                options: [
                    {
                        text: 'Document verified issues, regression findings, new issues, and quality assessment',
                        outcome: 'Excellent! This provides complete verification coverage.',
                        experience: 20,
                        tool: 'Reporting'
                    },
                    {
                        text: 'List fixed issues only',
                        outcome: 'All aspects need reporting.',
                        experience: -15
                    },
                    {
                        text: 'Basic status update',
                        outcome: 'Comprehensive reporting needed.',
                        experience: -10
                    },
                    {
                        text: 'Skip reporting',
                        outcome: 'Verification needs proper documentation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Quality Assessment',
                description: 'How do you assess if additional testing is needed after verification?',
                options: [
                    {
                        text: 'Analyze fix impact, regression findings, and new issues to recommend next steps',
                        outcome: 'Perfect! This provides informed testing recommendations.',
                        experience: 20,
                        tool: 'Quality Assessment'
                    },
                    {
                        text: 'Check fix count only',
                        outcome: 'Multiple factors need consideration.',
                        experience: -15
                    },
                    {
                        text: 'Wait for client decision',
                        outcome: 'Proactive assessment needed.',
                        experience: -10
                    },
                    {
                        text: 'Skip assessment',
                        outcome: 'Quality assessment is crucial.',
                        experience: -5
                    }
                ]
            }
        ];

        this.initializeUI();
        
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

    nextScenario() {
        this.outcomeScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.player.currentScenario++;
        this.displayScenario();
    }

    displayScenario() {
        const currentScenarios = this.getCurrentScenarios();
        
        // Check if we've completed all questions
        if (this.player.questionHistory.length >= 15) {
            this.endGame();
            return;
        }
        
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
                    user.updateQuizScore('tester-mindset', scorePercentage);
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
    const quiz = new IssueVerificationQuiz();
    quiz.startGame();
}); 
