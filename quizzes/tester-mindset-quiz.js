class TesterMindsetQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 350, message: '🏆 Outstanding! You have an excellent tester mindset!' },
                { threshold: 250, message: '👏 Great job! You show strong testing instincts!' },
                { threshold: 150, message: '👍 Good work! Keep developing your tester mindset.' },
                { threshold: 0, message: '📚 Review the tester mindset guide and try again!' }
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

        // Basic Scenarios (Focus on fundamental mindset concepts)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Project Context',
                description: 'You\'re starting a new testing project. What\'s your first priority?',
                options: [
                    {
                        text: 'Review project context and requirements documentation',
                        outcome: 'Excellent! Understanding context is crucial for effective testing.',
                        experience: 15,
                        tool: 'Context Analysis Framework'
                    },
                    {
                        text: 'Start testing immediately to find bugs quickly',
                        outcome: 'Without understanding context, testing may miss critical issues.',
                        experience: -5
                    },
                    {
                        text: 'Create test cases without reviewing documentation',
                        outcome: 'Test cases should be based on project context and requirements.',
                        experience: -5
                    },
                    {
                        text: 'Ask for previous test results only',
                        outcome: 'While helpful, previous results don\'t replace understanding current context.',
                        experience: 5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Understanding Audience',
                description: 'How do you approach understanding the target audience for a new project?',
                options: [
                    {
                        text: 'Consider user characteristics, needs, and potential barriers',
                        outcome: 'Perfect! User-centric thinking is essential for effective testing.',
                        experience: 15,
                        tool: 'User Persona Template'
                    },
                    {
                        text: 'Assume all users are like you',
                        outcome: 'Users have diverse needs and characteristics that must be considered.',
                        experience: -5
                    },
                    {
                        text: 'Focus only on technical requirements',
                        outcome: 'Technical aspects are important but user needs are crucial.',
                        experience: -5
                    },
                    {
                        text: 'Wait for user feedback after release',
                        outcome: 'Understanding users before testing helps prevent issues.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Test Environment',
                description: 'The test environment is different from production. What\'s your approach?',
                options: [
                    {
                        text: 'Compare environment configurations and document differences',
                        outcome: 'Excellent! Understanding environment differences is crucial for testing.',
                        experience: 15,
                        tool: 'Environment Comparison Tool'
                    },
                    {
                        text: 'Ignore the differences and continue testing',
                        outcome: 'Environment differences can affect test results and miss issues.',
                        experience: -5
                    },
                    {
                        text: 'Test only in production',
                        outcome: 'Testing in production without proper controls is risky.',
                        experience: -10
                    },
                    {
                        text: 'Request a production clone',
                        outcome: 'Good thinking, but first document current differences.',
                        experience: 10
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Test Documentation',
                description: 'You\'ve found several issues. How do you document them?',
                options: [
                    {
                        text: 'Create detailed reports with steps, expected vs actual results',
                        outcome: 'Perfect! Clear documentation helps developers fix issues efficiently.',
                        experience: 15,
                        tool: 'Issue Documentation Template'
                    },
                    {
                        text: 'Send quick chat messages about each issue',
                        outcome: 'Informal communication isn\'t sufficient for tracking issues.',
                        experience: -5
                    },
                    {
                        text: 'Take screenshots without explanation',
                        outcome: 'Screenshots alone don\'t provide enough context.',
                        experience: -10
                    },
                    {
                        text: 'Create brief descriptions only',
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
                        text: 'Start testing without planning',
                        outcome: 'Lack of planning can lead to inefficient testing.',
                        experience: -5
                    },
                    {
                        text: 'Copy test plan from previous project',
                        outcome: 'Each project needs its own tailored test approach.',
                        experience: -5
                    },
                    {
                        text: 'Ask developers what to test',
                        outcome: 'Developer input helps but proper planning is needed.',
                        experience: 5
                    }
                ]
            }
        ];

        // Intermediate Scenarios (Different testing approaches)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Exploratory Testing',
                description: 'You\'re conducting exploratory testing. What\'s your mindset?',
                options: [
                    {
                        text: 'Be curious, investigative, and think outside the box',
                        outcome: 'Perfect! Exploratory testing requires creative thinking.',
                        experience: 25,
                        tool: 'Exploratory Testing Guide'
                    },
                    {
                        text: 'Follow a strict test script',
                        outcome: 'Exploratory testing needs flexibility and creativity.',
                        experience: -10
                    },
                    {
                        text: 'Test only happy paths',
                        outcome: 'Exploratory testing should cover various scenarios.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on finding bugs',
                        outcome: 'Understanding the system is also important.',
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
                        text: 'Document the issue and continue with test cases',
                        outcome: 'Excellent! Balance following scripts while noting other issues.',
                        experience: 25,
                        tool: 'Test Case Management'
                    },
                    {
                        text: 'Ignore it as it\'s not in the test cases',
                        outcome: 'All issues should be documented, even if outside scope.',
                        experience: -15
                    },
                    {
                        text: 'Stop scripted testing to investigate',
                        outcome: 'Document the issue but complete planned testing first.',
                        experience: 0
                    },
                    {
                        text: 'Add new test cases immediately',
                        outcome: 'Document first, update test cases after current execution.',
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
                        experience: 25,
                        tool: 'Support Communication Template'
                    },
                    {
                        text: 'Stick to initial test plan only',
                        outcome: 'Support requires adapting to changing needs.',
                        experience: -10
                    },
                    {
                        text: 'Wait for tasks to be assigned',
                        outcome: 'Proactive support is more valuable than reactive.',
                        experience: -5
                    },
                    {
                        text: 'Focus only on new features',
                        outcome: 'Support includes both new and existing functionality.',
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
                        experience: 25,
                        tool: 'Risk Assessment Matrix'
                    },
                    {
                        text: 'Wait to see if it becomes an issue',
                        outcome: 'Early risk identification helps prevent issues.',
                        experience: -15
                    },
                    {
                        text: 'Try to fix it yourself',
                        outcome: 'Risks should be communicated to appropriate stakeholders.',
                        experience: -5
                    },
                    {
                        text: 'Mention it in the next meeting',
                        outcome: 'Risks need prompt communication, not delayed reporting.',
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
                        text: 'Create coverage matrix mapping requirements to test cases',
                        outcome: 'Perfect! Systematic approach ensures comprehensive coverage.',
                        experience: 25,
                        tool: 'Coverage Mapping Tool'
                    },
                    {
                        text: 'Test until no more bugs are found',
                        outcome: 'Coverage should be requirement-based, not time-based.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on main functionality',
                        outcome: 'Complete coverage includes edge cases and alternatives.',
                        experience: -5
                    },
                    {
                        text: 'Follow previous test patterns',
                        outcome: 'Each feature needs its own coverage analysis.',
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
                        text: 'Alert incident team with evidence and begin systematic investigation',
                        outcome: 'Excellent! Quick escalation and systematic approach is crucial.',
                        experience: 20,
                        tool: 'Incident Response Protocol'
                    },
                    {
                        text: 'Start fixing the bug immediately',
                        outcome: 'Follow incident response process before attempting fixes.',
                        experience: -15
                    },
                    {
                        text: 'Document the issue for next sprint',
                        outcome: 'Critical issues need immediate attention.',
                        experience: -15
                    },
                    {
                        text: 'Investigate root cause before alerting anyone',
                        outcome: 'Alert team first, then investigate systematically.',
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
                        text: 'Review changes, update strategy, and communicate impacts',
                        outcome: 'Perfect! Systematic adaptation ensures continued effectiveness.',
                        experience: 20,
                        tool: 'Strategy Adaptation Framework'
                    },
                    {
                        text: 'Continue with original strategy',
                        outcome: 'Strategy must evolve with project changes.',
                        experience: -20
                    },
                    {
                        text: 'Create entirely new strategy',
                        outcome: 'Modify existing strategy rather than starting over.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on new requirements',
                        outcome: 'Consider both new and existing requirements.',
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
                        text: 'Prioritize critical functionality and communicate constraints',
                        outcome: 'Excellent! Risk-based prioritization maximizes value.',
                        experience: 20,
                        tool: 'Test Prioritization Matrix'
                    },
                    {
                        text: 'Try to test everything quickly',
                        outcome: 'Rushed testing may miss critical issues.',
                        experience: -20
                    },
                    {
                        text: 'Skip testing lower priority items',
                        outcome: 'Communicate and agree on scope reduction.',
                        experience: -10
                    },
                    {
                        text: 'Request deadline extension only',
                        outcome: 'Prioritization needed even with extended deadline.',
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
                        text: 'Facilitate discussion to align on best practices and document agreement',
                        outcome: 'Perfect! Collaborative alignment improves team effectiveness.',
                        experience: 20,
                        tool: 'Test Approach Alignment Guide'
                    },
                    {
                        text: 'Let each person use their preferred approach',
                        outcome: 'Inconsistent approaches can affect quality.',
                        experience: -20
                    },
                    {
                        text: 'Enforce your preferred approach',
                        outcome: 'Collaboration is better than enforcement.',
                        experience: -15
                    },
                    {
                        text: 'Escalate to management immediately',
                        outcome: 'Try team discussion before escalation.',
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
                        experience: 20,
                        tool: 'Quality Impact Analysis'
                    },
                    {
                        text: 'Accept the reduced timeline without discussion',
                        outcome: 'Quality concerns should be raised professionally.',
                        experience: -30
                    },
                    {
                        text: 'Refuse to reduce testing time',
                        outcome: 'Collaborate to find balanced solutions.',
                        experience: -20
                    },
                    {
                        text: 'Reduce test coverage without analysis',
                        outcome: 'Impact analysis needed before reducing coverage.',
                        experience: -15
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
    const quiz = new TesterMindsetQuiz();
    quiz.startGame();
}); 
