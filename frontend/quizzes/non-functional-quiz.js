class NonFunctionalQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a non-functional testing expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong non-functional testing skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing non-functional testing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name as a non-configurable, non-writable property
        Object.defineProperty(this, 'quizName', {
            value: 'non-functional',
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
                title: 'Performance Testing Basics',
                description: 'You need to verify the system\'s performance. Which approach shows the best understanding of non-functional testing?',
                options: [
                    {
                        text: 'Test response time, throughput, and system stability',
                        outcome: 'Perfect! These are key aspects of performance testing.',
                        experience: 15,
                        tool: 'Performance Testing'
                    },
                    {
                        text: 'Check if buttons work correctly',
                        outcome: 'This is functional testing, not performance testing.',
                        experience: -10
                    },
                    {
                        text: 'Verify the color scheme',
                        outcome: 'UI elements are part of functional testing.',
                        experience: -5
                    },
                    {
                        text: 'Only test page load times',
                        outcome: 'Performance testing should cover multiple aspects.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'JavaScript Dependency',
                description: 'You\'re testing a website\'s non-functional requirements. What\'s the best approach to JavaScript testing?',
                options: [
                    {
                        text: 'Disable JavaScript and verify graceful degradation with appropriate warning messages',
                        outcome: 'Excellent! This tests proper handling of JavaScript dependency.',
                        experience: 15,
                        tool: 'Browser Testing'
                    },
                    {
                        text: 'Skip JavaScript testing entirely',
                        outcome: 'JavaScript dependency is a crucial non-functional requirement.',
                        experience: -10
                    },
                    {
                        text: 'Only test with JavaScript enabled',
                        outcome: 'Sites should be tested both with and without JavaScript.',
                        experience: -5
                    },
                    {
                        text: 'Report JavaScript as broken if features don\'t work',
                        outcome: 'Warning messages should guide users when JavaScript is needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Installation Testing',
                description: 'You\'re testing software installation. Which approach best tests this non-functional requirement?',
                options: [
                    {
                        text: 'Verify installation process, error handling, and cleanup on failure',
                        outcome: 'Perfect! This covers key aspects of installation testing.',
                        experience: 15,
                        tool: 'Installation Testing'
                    },
                    {
                        text: 'Only test successful installation',
                        outcome: 'Installation testing should include failure scenarios.',
                        experience: -10
                    },
                    {
                        text: 'Skip installation testing',
                        outcome: 'Installation is a crucial first user interaction.',
                        experience: -5
                    },
                    {
                        text: 'Test only uninstallation',
                        outcome: 'Both installation and uninstallation need testing.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Documentation Testing',
                description: 'You\'re reviewing software documentation. What\'s the best non-functional testing approach?',
                options: [
                    {
                        text: 'Verify all technical documents exist and are consistent',
                        outcome: 'Excellent! Documentation testing ensures complete and consistent documentation.',
                        experience: 15,
                        tool: 'Documentation Review'
                    },
                    {
                        text: 'Only check user manual',
                        outcome: 'All technical documentation needs verification.',
                        experience: -10
                    },
                    {
                        text: 'Skip documentation review',
                        outcome: 'Documentation is a crucial non-functional requirement.',
                        experience: -5
                    },
                    {
                        text: 'Only verify document formatting',
                        outcome: 'Content consistency is as important as formatting.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Compatibility Testing',
                description: 'You need to test software compatibility. Which approach is most appropriate?',
                options: [
                    {
                        text: 'Test across different hardware and software platforms as specified',
                        outcome: 'Perfect! This ensures broad compatibility coverage.',
                        experience: 15,
                        tool: 'Compatibility Testing'
                    },
                    {
                        text: 'Test only on the latest versions',
                        outcome: 'All specified platforms need testing.',
                        experience: -10
                    },
                    {
                        text: 'Test on a single platform',
                        outcome: 'Compatibility requires testing across platforms.',
                        experience: -5
                    },
                    {
                        text: 'Skip compatibility testing',
                        outcome: 'Compatibility is a crucial non-functional requirement.',
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
                title: 'Load Testing Strategy',
                description: 'You need to test system behavior under increased load. What\'s the most effective approach?',
                options: [
                    {
                        text: 'Gradually increase data volume while monitoring system response and performance metrics',
                        outcome: 'Perfect! This systematically tests system behavior under load.',
                        experience: 25,
                        tool: 'Load Testing'
                    },
                    {
                        text: 'Test with normal data volume only',
                        outcome: 'Load testing requires testing with increased volumes.',
                        experience: -15
                    },
                    {
                        text: 'Immediately test with maximum load',
                        outcome: 'Gradual increase helps identify breaking points.',
                        experience: -10
                    },
                    {
                        text: 'Skip load testing entirely',
                        outcome: 'Load testing is crucial for system reliability.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Accessibility Compliance',
                description: 'You\'re testing website accessibility. Which approach best ensures WCAG compliance?',
                options: [
                    {
                        text: 'Test with screen readers, keyboard navigation, and verify WCAG guidelines compliance',
                        outcome: 'Excellent! This covers key accessibility requirements.',
                        experience: 25,
                        tool: 'Accessibility Testing'
                    },
                    {
                        text: 'Only check color contrast',
                        outcome: 'Accessibility testing needs comprehensive coverage.',
                        experience: -15
                    },
                    {
                        text: 'Skip accessibility testing',
                        outcome: 'Accessibility is a crucial non-functional requirement.',
                        experience: -10
                    },
                    {
                        text: 'Test only with mouse navigation',
                        outcome: 'Multiple input methods need testing.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Recovery Testing',
                description: 'You need to test system recovery after failures. What\'s the most thorough approach?',
                options: [
                    {
                        text: 'Force various system failures and verify data recovery and system rebound',
                        outcome: 'Perfect! This tests recovery from different failure scenarios.',
                        experience: 25,
                        tool: 'Recovery Testing'
                    },
                    {
                        text: 'Only test power failure',
                        outcome: 'Multiple failure scenarios need testing.',
                        experience: -15
                    },
                    {
                        text: 'Wait for natural failures',
                        outcome: 'Recovery testing requires proactive failure simulation.',
                        experience: -10
                    },
                    {
                        text: 'Only test data backup',
                        outcome: 'System recovery involves more than data backup.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Stress Testing Implementation',
                description: 'You need to perform stress testing. Which approach is most effective?',
                options: [
                    {
                        text: 'Push system resources to limits while monitoring breaking points and behavior',
                        outcome: 'Excellent! This properly tests system limits and behavior.',
                        experience: 25,
                        tool: 'Stress Testing'
                    },
                    {
                        text: 'Test with normal usage',
                        outcome: 'Stress testing requires pushing beyond normal limits.',
                        experience: -15
                    },
                    {
                        text: 'Only test one resource type',
                        outcome: 'Multiple resource types need stress testing.',
                        experience: -10
                    },
                    {
                        text: 'Stop at first error',
                        outcome: 'Breaking points and behavior need documentation.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Volume Testing Strategy',
                description: 'You\'re testing system behavior with large data volumes. What\'s the best approach?',
                options: [
                    {
                        text: 'Incrementally increase data volume while checking for data loss and system response',
                        outcome: 'Perfect! This systematically tests volume handling.',
                        experience: 25,
                        tool: 'Volume Testing'
                    },
                    {
                        text: 'Test with small data sets only',
                        outcome: 'Volume testing requires large data sets.',
                        experience: -15
                    },
                    {
                        text: 'Skip database testing',
                        outcome: 'Data storage is crucial in volume testing.',
                        experience: -10
                    },
                    {
                        text: 'Only test maximum volume',
                        outcome: 'Incremental testing helps identify issues.',
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
                title: 'Security Testing Framework',
                description: 'You\'re designing a security testing strategy. What\'s the most comprehensive approach?',
                options: [
                    {
                        text: 'Test authentication, authorization, data encryption, and vulnerability scanning',
                        outcome: 'Perfect! This covers key security testing aspects.',
                        experience: 20,
                        tool: 'Security Testing'
                    },
                    {
                        text: 'Only test login security',
                        outcome: 'Security testing needs comprehensive coverage.',
                        experience: -15
                    },
                    {
                        text: 'Skip encryption testing',
                        outcome: 'Data encryption is crucial for security.',
                        experience: -10
                    },
                    {
                        text: 'Test only known vulnerabilities',
                        outcome: 'New vulnerabilities need discovery testing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Usability Testing Strategy',
                description: 'You\'re leading usability testing. Which approach provides the most valuable insights?',
                options: [
                    {
                        text: 'Test user experience across different scenarios and user types, measuring satisfaction metrics',
                        outcome: 'Excellent! This provides comprehensive usability insights.',
                        experience: 20,
                        tool: 'Usability Testing'
                    },
                    {
                        text: 'Only test with expert users',
                        outcome: 'Different user types need testing.',
                        experience: -15
                    },
                    {
                        text: 'Skip user satisfaction metrics',
                        outcome: 'Metrics are crucial for usability assessment.',
                        experience: -10
                    },
                    {
                        text: 'Test only basic functions',
                        outcome: 'All user scenarios need testing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'GDPR Compliance Testing',
                description: 'You need to verify GDPR compliance. What\'s the most thorough approach?',
                options: [
                    {
                        text: 'Test data handling, user consent, data deletion, and privacy controls',
                        outcome: 'Perfect! This covers key GDPR requirements.',
                        experience: 20,
                        tool: 'Compliance Testing'
                    },
                    {
                        text: 'Only test privacy policy',
                        outcome: 'GDPR requires testing multiple aspects.',
                        experience: -15
                    },
                    {
                        text: 'Skip data deletion testing',
                        outcome: 'Right to be forgotten is crucial for GDPR.',
                        experience: -10
                    },
                    {
                        text: 'Test only data collection',
                        outcome: 'Data handling includes more than collection.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Cross-Platform Testing',
                description: 'You\'re testing a complex application across multiple platforms. What\'s the most effective strategy?',
                options: [
                    {
                        text: 'Test all features across platforms, document platform-specific behaviors, verify consistency',
                        outcome: 'Excellent! This ensures thorough cross-platform compatibility.',
                        experience: 20,
                        tool: 'Platform Testing'
                    },
                    {
                        text: 'Test on primary platform only',
                        outcome: 'All supported platforms need testing.',
                        experience: -15
                    },
                    {
                        text: 'Skip platform-specific features',
                        outcome: 'Platform differences need verification.',
                        experience: -10
                    },
                    {
                        text: 'Test basic features only',
                        outcome: 'All features need cross-platform testing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Non-Functional Test Documentation',
                description: 'You\'re documenting non-functional test results. What\'s the most professional approach?',
                options: [
                    {
                        text: 'Document measurable results, test conditions, and specific metrics for each requirement',
                        outcome: 'Perfect! This provides clear, measurable documentation.',
                        experience: 20,
                        tool: 'Test Documentation'
                    },
                    {
                        text: 'Use subjective descriptions',
                        outcome: 'Non-functional results need objective measures.',
                        experience: -15
                    },
                    {
                        text: 'Skip metrics documentation',
                        outcome: 'Metrics are crucial for non-functional testing.',
                        experience: -10
                    },
                    {
                        text: 'Only document failures',
                        outcome: 'All results need proper documentation.',
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
            this.levelTransitionContainer.innerHTML = ''; // Clear any existing messages
            
            const levelMessage = document.createElement('div');
            levelMessage.className = 'level-transition';
            levelMessage.setAttribute('role', 'alert');
            levelMessage.textContent = `Starting ${scenario.level} Questions`;
            
            this.levelTransitionContainer.appendChild(levelMessage);
            this.levelTransitionContainer.classList.add('active');
            
            // Update the level indicator
            document.getElementById('level-indicator').textContent = `Level: ${scenario.level}`;
            
            // Remove the message and container height after animation
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
                    user.updateQuizScore('non-functional', scorePercentage);
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
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new NonFunctionalQuiz();
    quiz.startGame();
}); 