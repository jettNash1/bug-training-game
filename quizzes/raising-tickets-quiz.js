class RaisingTicketsQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re an expert at raising tickets!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong ticket raising skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve your ticket raising skills.' },
                { threshold: 0, message: '📚 Consider reviewing ticket raising best practices and try again!' }
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
                title: 'Ticket Title Creation',
                description: 'You need to create a title for a mobile-specific issue on the homepage. What\'s the best format?',
                options: [
                    {
                        text: '[Mobile] Homepage - User Unable to Select \'Back\' CTA',
                        outcome: 'Perfect! This follows the correct format with environment, location, and issue.',
                        experience: 15,
                        tool: 'Title Formatting'
                    },
                    {
                        text: 'The back button is not working on mobile phones',
                        outcome: 'Titles should be concise and follow the proper format.',
                        experience: -10
                    },
                    {
                        text: 'Back CTA broken',
                        outcome: 'Title needs more specific information.',
                        experience: -5
                    },
                    {
                        text: 'URGENT: Mobile issue with back button',
                        outcome: 'Avoid emotional language, use proper format.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Steps to Reproduce',
                description: 'How should you document steps to reproduce an issue?',
                options: [
                    {
                        text: 'List numbered steps with specific actions and component names',
                        outcome: 'Excellent! This provides clear reproduction steps.',
                        experience: 15,
                        tool: 'Issue Documentation'
                    },
                    {
                        text: 'Write a general description',
                        outcome: 'Specific, numbered steps are required.',
                        experience: -10
                    },
                    {
                        text: 'Just include screenshots',
                        outcome: 'Written steps are needed with screenshots.',
                        experience: -5
                    },
                    {
                        text: 'Describe the end result only',
                        outcome: 'All steps need to be documented.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Severity Classification',
                description: 'You find a spelling error on the homepage. What severity level should you assign?',
                options: [
                    {
                        text: 'Cosmetic Issue/Typo',
                        outcome: 'Perfect! Spelling errors are cosmetic issues.',
                        experience: 15,
                        tool: 'Severity Assessment'
                    },
                    {
                        text: 'Blocking Issue',
                        outcome: 'Spelling errors don\'t block functionality.',
                        experience: -10
                    },
                    {
                        text: 'Major Impact',
                        outcome: 'Spelling errors have minimal impact.',
                        experience: -5
                    },
                    {
                        text: 'Feature Enhancement',
                        outcome: 'Spelling errors are cosmetic issues.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Reproduction Rate',
                description: 'You can reproduce an issue 3 out of 4 times. What\'s the appropriate reproduction rate?',
                options: [
                    {
                        text: '75% - Mostly reproducible',
                        outcome: 'Perfect! This accurately reflects the reproduction rate.',
                        experience: 15,
                        tool: 'Issue Analysis'
                    },
                    {
                        text: '99% - Consistently reproducible',
                        outcome: '99% means reproducing every time.',
                        experience: -10
                    },
                    {
                        text: '25% - Sporadic issue',
                        outcome: '25% is too low for 3 out of 4 times.',
                        experience: -5
                    },
                    {
                        text: '0% - Not reproducible',
                        outcome: 'The issue is clearly reproducible.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Supporting Material',
                description: 'What\'s the best approach for providing evidence of an issue?',
                options: [
                    {
                        text: 'Include clear videos/screenshots showing multiple reproductions and highlight problem areas',
                        outcome: 'Perfect! This provides comprehensive evidence.',
                        experience: 15,
                        tool: 'Evidence Documentation'
                    },
                    {
                        text: 'Quick single screenshot',
                        outcome: 'Multiple examples and clear highlighting needed.',
                        experience: -10
                    },
                    {
                        text: 'Text description only',
                        outcome: 'Visual evidence is important.',
                        experience: -5
                    },
                    {
                        text: 'Brief video without highlighting',
                        outcome: 'Highlighting and multiple examples needed.',
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
                title: 'Environment Documentation',
                description: 'You find an issue on multiple devices. How do you document the environments?',
                options: [
                    {
                        text: 'List primary environment first, then detail additional affected environments with specific versions',
                        outcome: 'Perfect! This provides clear environment context.',
                        experience: 25,
                        tool: 'Environment Documentation'
                    },
                    {
                        text: 'List only one environment',
                        outcome: 'All affected environments need documentation.',
                        experience: -15
                    },
                    {
                        text: 'Write "all environments"',
                        outcome: 'Specific environment details are needed.',
                        experience: -10
                    },
                    {
                        text: 'Only mention device types',
                        outcome: 'Version information is also important.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Query vs Bug',
                description: 'You\'re unsure if behavior matches requirements. How should you raise this?',
                options: [
                    {
                        text: 'Raise as a Query ticket with clear description of uncertainty and reference to requirements',
                        outcome: 'Excellent! This properly flags uncertainty for clarification.',
                        experience: 25,
                        tool: 'Issue Classification'
                    },
                    {
                        text: 'Raise as a bug',
                        outcome: 'Uncertainty should be raised as a query.',
                        experience: -15
                    },
                    {
                        text: 'Skip raising ticket',
                        outcome: 'Queries need documentation.',
                        experience: -10
                    },
                    {
                        text: 'Wait for clarification',
                        outcome: 'Raise query to get clarification.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Blocking Issue Communication',
                description: 'You find a blocking issue. What\'s the correct process?',
                options: [
                    {
                        text: 'Raise ticket immediately, mark as blocking, and follow client\'s preferred urgent communication channel',
                        outcome: 'Perfect! This follows proper blocking issue protocol.',
                        experience: 25,
                        tool: 'Critical Issue Management'
                    },
                    {
                        text: 'Wait until end of day',
                        outcome: 'Blocking issues need immediate attention.',
                        experience: -15
                    },
                    {
                        text: 'Only raise ticket',
                        outcome: 'Additional communication needed for blocking issues.',
                        experience: -10
                    },
                    {
                        text: 'Only email client',
                        outcome: 'Ticket needs raising alongside communication.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Feature Enhancement Suggestion',
                description: 'You notice a potential UX improvement. How do you raise this?',
                options: [
                    {
                        text: 'Raise as Feature Enhancement with clear rationale and user impact explanation',
                        outcome: 'Excellent! This provides constructive feedback.',
                        experience: 25,
                        tool: 'Enhancement Suggestions'
                    },
                    {
                        text: 'Raise as a bug',
                        outcome: 'Improvements should be Feature Enhancements.',
                        experience: -15
                    },
                    {
                        text: 'Skip suggestion',
                        outcome: 'UX improvements should be documented.',
                        experience: -10
                    },
                    {
                        text: 'Send informal feedback',
                        outcome: 'Use proper ticket process for suggestions.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Sporadic Issue Documentation',
                description: 'You observe an issue that occurs inconsistently. How do you document it?',
                options: [
                    {
                        text: 'Document exact conditions observed, include video evidence, note 25% reproduction rate',
                        outcome: 'Perfect! This properly documents sporadic issues.',
                        experience: 25,
                        tool: 'Inconsistent Issue Documentation'
                    },
                    {
                        text: 'Wait for consistent reproduction',
                        outcome: 'Sporadic issues need documentation.',
                        experience: -15
                    },
                    {
                        text: 'Mark as not reproducible',
                        outcome: 'Document observed conditions even if sporadic.',
                        experience: -10
                    },
                    {
                        text: 'Only note it happened once',
                        outcome: 'Include all observed details and rate.',
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
                title: 'Complex User Journey Issues',
                description: 'You find an issue that only occurs in a complex user flow. How do you document it?',
                options: [
                    {
                        text: 'Detail exact steps, include flow diagram, video evidence, and note any prerequisites',
                        outcome: 'Excellent! This ensures clear understanding of complex issues.',
                        experience: 20,
                        tool: 'Complex Issue Documentation'
                    },
                    {
                        text: 'Simplify steps',
                        outcome: 'Complex flows need detailed documentation.',
                        experience: -15
                    },
                    {
                        text: 'Only show end result',
                        outcome: 'All steps in complex flow needed.',
                        experience: -10
                    },
                    {
                        text: 'Skip complex scenarios',
                        outcome: 'Complex issues need proper documentation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Multiple Related Issues',
                description: 'You find several related issues across different areas. How do you document them?',
                options: [
                    {
                        text: 'Create separate tickets with cross-references and note potential common cause',
                        outcome: 'Perfect! This maintains clarity while showing relationships.',
                        experience: 20,
                        tool: 'Related Issue Management'
                    },
                    {
                        text: 'Create one combined ticket',
                        outcome: 'Separate tickets needed with cross-references.',
                        experience: -15
                    },
                    {
                        text: 'Only document major issues',
                        outcome: 'All related issues need documentation.',
                        experience: -10
                    },
                    {
                        text: 'Raise without connections',
                        outcome: 'Related issues should be cross-referenced.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Version-Specific Issues',
                description: 'An issue only appears in specific software versions. How do you handle this?',
                options: [
                    {
                        text: 'Document exact versions affected, include version comparison, note environment specifics',
                        outcome: 'Excellent! This provides clear version context.',
                        experience: 20,
                        tool: 'Version Management'
                    },
                    {
                        text: 'Note current version only',
                        outcome: 'All affected versions need documentation.',
                        experience: -15
                    },
                    {
                        text: 'Assume all versions affected',
                        outcome: 'Version specifics need verification.',
                        experience: -10
                    },
                    {
                        text: 'Skip version details',
                        outcome: 'Version information is crucial.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Performance Issue Documentation',
                description: 'You notice intermittent performance issues. How do you document them?',
                options: [
                    {
                        text: 'Include metrics, reproduction conditions, system state, and performance logs',
                        outcome: 'Perfect! This provides comprehensive performance context.',
                        experience: 20,
                        tool: 'Performance Documentation'
                    },
                    {
                        text: 'Note "site is slow"',
                        outcome: 'Specific metrics and conditions needed.',
                        experience: -15
                    },
                    {
                        text: 'Only include timing',
                        outcome: 'Multiple factors need documentation.',
                        experience: -10
                    },
                    {
                        text: 'Wait for consistent issues',
                        outcome: 'Document intermittent performance issues.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Security Issue Handling',
                description: 'You discover a potential security vulnerability. How do you handle it?',
                options: [
                    {
                        text: 'Raise as blocking, follow security protocol, limit sensitive details in public ticket',
                        outcome: 'Excellent! This follows security best practices.',
                        experience: 20,
                        tool: 'Security Issue Management'
                    },
                    {
                        text: 'Raise as normal bug',
                        outcome: 'Security issues need special handling.',
                        experience: -15
                    },
                    {
                        text: 'Include all details publicly',
                        outcome: 'Sensitive details need protection.',
                        experience: -10
                    },
                    {
                        text: 'Ignore security concerns',
                        outcome: 'Security issues need proper attention.',
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
    const quiz = new RaisingTicketsQuiz();
    quiz.startGame();
}); 