class CMS_Testing_Quiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a CMS Testing expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong CMS Testing skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing CMS Testing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'CMS-Testing',
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

        // Basic Scenarios (5 questions)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Content Creation',
                description: 'You need to add new content to the CMS. What\'s the first step you should take?',
                options: [
                    {
                        text: 'Review documentation and verify content requirements before creating',
                        outcome: 'Perfect! Understanding requirements before content creation is crucial.',
                        experience: 15,
                        tool: 'Content Planning'
                    },
                    {
                        text: 'Start adding content immediately',
                        outcome: 'It\'s important to understand requirements first.',
                        experience: -5
                    },
                    {
                        text: 'Ask another team member to do it',
                        outcome: 'Taking initiative while following requirements is important.',
                        experience: -10
                    },
                    {
                        text: 'Create a draft without checking requirements',
                        outcome: 'Requirements should be reviewed before content creation.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Content Validation',
                description: 'After creating content in the CMS, what\'s the next crucial step?',
                options: [
                    {
                        text: 'Check the front-end website to verify content appears correctly',
                        outcome: 'Excellent! Validating content on the front-end is essential for CRUD testing.',
                        experience: 15,
                        tool: 'Content Verification'
                    },
                    {
                        text: 'Move on to creating more content',
                        outcome: 'Always verify content appears correctly before moving on.',
                        experience: -5
                    },
                    {
                        text: 'Assume it worked correctly',
                        outcome: 'Content should always be verified on the front-end.',
                        experience: -10
                    },
                    {
                        text: 'Only check in the CMS preview',
                        outcome: 'Front-end verification is necessary for complete testing.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Content Updates',
                description: 'You\'ve modified existing content in the CMS. What\'s the most important CRUD check to perform?',
                options: [
                    {
                        text: 'Verify the updates are reflected correctly on both CMS and front-end',
                        outcome: 'Excellent! Complete update verification is crucial for CRUD testing.',
                        experience: 15,
                        tool: 'Update Verification'
                    },
                    {
                        text: 'Only check the CMS admin panel',
                        outcome: 'Updates must be verified on both CMS and front-end.',
                        experience: -10
                    },
                    {
                        text: 'Assume updates work automatically',
                        outcome: 'Never assume updates are successful without verification.',
                        experience: -5
                    },
                    {
                        text: 'Wait for user feedback',
                        outcome: 'Proactive verification is essential for content updates.',
                        experience: 5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Content Deletion',
                description: 'After deleting content from the CMS, what\'s the essential verification step?',
                options: [
                    {
                        text: 'Check both CMS and front-end to ensure content is completely removed',
                        outcome: 'Perfect! Complete deletion verification is essential for CRUD testing.',
                        experience: 15,
                        tool: 'Deletion Verification'
                    },
                    {
                        text: 'Only verify in the CMS',
                        outcome: 'Content must be verified as deleted from all locations.',
                        experience: -10
                    },
                    {
                        text: 'Assume deletion worked',
                        outcome: 'Deletion must always be verified thoroughly.',
                        experience: -5
                    },
                    {
                        text: 'Create new content instead',
                        outcome: 'Deletion verification is crucial before moving forward.',
                        experience: 5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Media Management',
                description: 'You\'re testing image uploads in the CMS. What\'s the first aspect to verify?',
                options: [
                    {
                        text: 'Test upload functionality with various file types and sizes',
                        outcome: 'Excellent! Comprehensive media testing ensures robust functionality.',
                        experience: 15,
                        tool: 'Media Testing'
                    },
                    {
                        text: 'Only test with one image type',
                        outcome: 'Multiple file types should be tested for thorough verification.',
                        experience: -10
                    },
                    {
                        text: 'Skip media testing entirely',
                        outcome: 'Media management is a crucial CMS function.',
                        experience: -5
                    },
                    {
                        text: 'Test only small files',
                        outcome: 'Various file sizes should be tested.',
                        experience: 5
                    }
                ]
            }
        ];

        // Intermediate Scenarios (5 questions)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'User Permissions',
                description: 'You\'ve discovered that some admin pages are accessible via direct links by non-admin users. How should you handle this?',
                options: [
                    {
                        text: 'Document the security issue and immediately report it as high priority',
                        outcome: 'Perfect! Security issues need immediate attention and proper documentation.',
                        experience: 25,
                        tool: 'Security Testing'
                    },
                    {
                        text: 'Ignore it since it requires direct links',
                        outcome: 'Security vulnerabilities should never be ignored.',
                        experience: -15
                    },
                    {
                        text: 'Only test with admin accounts',
                        outcome: 'All user roles should be tested for security.',
                        experience: -10
                    },
                    {
                        text: 'Wait for someone else to find it',
                        outcome: 'Security issues should be reported immediately.',
                        experience: 5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Template Testing',
                description: 'You\'re testing CMS templates and themes. What\'s the most important aspect to verify?',
                options: [
                    {
                        text: 'Test layout rendering across different browsers and devices',
                        outcome: 'Excellent! Cross-browser compatibility is crucial for templates.',
                        experience: 25,
                        tool: 'Layout Testing'
                    },
                    {
                        text: 'Only test in one browser',
                        outcome: 'Templates must work across different browsers.',
                        experience: -15
                    },
                    {
                        text: 'Skip template testing',
                        outcome: 'Template testing is essential for CMS functionality.',
                        experience: -10
                    },
                    {
                        text: 'Test only on desktop',
                        outcome: 'Multiple devices should be tested.',
                        experience: 5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Version Control',
                description: 'Content changes need to be tracked. What\'s the best approach to test version control?',
                options: [
                    {
                        text: 'Test content revision history and ability to restore previous versions',
                        outcome: 'Perfect! Version control ensures content can be tracked and restored.',
                        experience: 25,
                        tool: 'Version Management'
                    },
                    {
                        text: 'Only test current version',
                        outcome: 'Version history is crucial for content management.',
                        experience: -15
                    },
                    {
                        text: 'Ignore version control',
                        outcome: 'Version tracking is essential for content safety.',
                        experience: -10
                    },
                    {
                        text: 'Test without saving versions',
                        outcome: 'Version saving should be verified.',
                        experience: 5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'SEO Tools',
                description: 'You\'re testing the CMS\'s SEO features. What should you prioritize?',
                options: [
                    {
                        text: 'Verify meta tags, URLs, and SEO content management tools function correctly',
                        outcome: 'Excellent! Comprehensive SEO testing ensures optimization capabilities.',
                        experience: 25,
                        tool: 'SEO Testing'
                    },
                    {
                        text: 'Skip SEO testing entirely',
                        outcome: 'SEO features are crucial for content visibility.',
                        experience: -15
                    },
                    {
                        text: 'Only test page titles',
                        outcome: 'All SEO features should be tested.',
                        experience: -10
                    },
                    {
                        text: 'Test basic meta tags only',
                        outcome: 'Complete SEO functionality should be verified.',
                        experience: 5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Media Library',
                description: 'The media library needs testing. What\'s the most comprehensive approach?',
                options: [
                    {
                        text: 'Test upload, organization, editing, and retrieval of various media types',
                        outcome: 'Perfect! Complete media library testing ensures robust functionality.',
                        experience: 25,
                        tool: 'Media Management'
                    },
                    {
                        text: 'Only test uploads',
                        outcome: 'All media library features should be tested.',
                        experience: -15
                    },
                    {
                        text: 'Skip media testing',
                        outcome: 'Media management is crucial for content.',
                        experience: -10
                    },
                    {
                        text: 'Test basic functions only',
                        outcome: 'Comprehensive testing is needed.',
                        experience: 5
                    }
                ]
            }
        ];

        // Advanced Scenarios (5 questions)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Plugin Integration',
                description: 'You\'re testing a new plugin integration in the CMS. What\'s the most comprehensive approach?',
                options: [
                    {
                        text: 'Test plugin compatibility, functionality, and interactions with other extensions',
                        outcome: 'Excellent! Comprehensive plugin testing ensures system stability.',
                        experience: 20,
                        tool: 'Integration Testing'
                    },
                    {
                        text: 'Only test the new features',
                        outcome: 'Plugin testing should include compatibility checks.',
                        experience: -15
                    },
                    {
                        text: 'Assume it works if it installs',
                        outcome: 'Installation success doesn\'t guarantee proper functionality.',
                        experience: -10
                    },
                    {
                        text: 'Test basic functionality only',
                        outcome: 'Comprehensive testing includes multiple aspects.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Backup and Recovery',
                description: 'How should you approach testing the CMS backup system?',
                options: [
                    {
                        text: 'Test backup creation, storage, and complete content restoration process',
                        outcome: 'Perfect! Complete backup testing ensures data safety.',
                        experience: 20,
                        tool: 'Backup Testing'
                    },
                    {
                        text: 'Only test backup creation',
                        outcome: 'Restoration testing is crucial for backup verification.',
                        experience: -15
                    },
                    {
                        text: 'Skip backup testing',
                        outcome: 'Backup functionality is essential for data security.',
                        experience: -10
                    },
                    {
                        text: 'Test partial backups only',
                        outcome: 'Complete backup testing is necessary.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Performance Testing',
                description: 'The CMS needs performance testing. What\'s the most important aspect?',
                options: [
                    {
                        text: 'Test load times, multiple users, and heavy content management scenarios',
                        outcome: 'Excellent! Comprehensive performance testing ensures system reliability.',
                        experience: 20,
                        tool: 'Performance Testing'
                    },
                    {
                        text: 'Only test basic loading',
                        outcome: 'Multiple aspects of performance should be tested.',
                        experience: -15
                    },
                    {
                        text: 'Skip performance testing',
                        outcome: 'Performance is crucial for system usability.',
                        experience: -10
                    },
                    {
                        text: 'Test with minimal load',
                        outcome: 'Real-world scenarios should be tested.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Security Testing',
                description: 'What\'s the most critical aspect of CMS security testing?',
                options: [
                    {
                        text: 'Test user authentication, permissions, and vulnerability scanning',
                        outcome: 'Perfect! Comprehensive security testing protects the system.',
                        experience: 20,
                        tool: 'Security Assessment'
                    },
                    {
                        text: 'Only test login',
                        outcome: 'Multiple security aspects need testing.',
                        experience: -15
                    },
                    {
                        text: 'Skip security testing',
                        outcome: 'Security testing is essential for system protection.',
                        experience: -10
                    },
                    {
                        text: 'Test basic access only',
                        outcome: 'Complete security verification is necessary.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Multi-environment Testing',
                description: 'How should you approach testing CMS deployment across different environments?',
                options: [
                    {
                        text: 'Test functionality and content migration across all environments systematically',
                        outcome: 'Excellent! Complete environment testing ensures consistent deployment.',
                        experience: 20,
                        tool: 'Environment Testing'
                    },
                    {
                        text: 'Only test in production',
                        outcome: 'All environments should be tested before production.',
                        experience: -15
                    },
                    {
                        text: 'Skip environment testing',
                        outcome: 'Environment testing is crucial for deployment.',
                        experience: -10
                    },
                    {
                        text: 'Test staging only',
                        outcome: 'All environments need verification.',
                        experience: -5
                    }
                ]
            }
        ];

        // Initialize UI and add event listeners
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
    const quiz = new CMS_Testing_Quiz();
    quiz.startGame();
}); 