class TestingRPG {
    constructor() {
        this.player = {
            name: '',
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: []
        };

        // Basic I (IDs 1-5, 50 XP total)
        this.basicScenariosI = [
            {
                id: 1,
                level: 'Basic I',
                title: 'Welcome to Web Testing Adventures',
                description: 'Welcome, new QA tester! You\'ve just joined TechCorp as a junior tester. Your first day awaits. What would you like to do first?',
                options: [
                    {
                        text: 'Review the test environment setup guide',
                        outcome: 'Great initiative, but asking a senior tester for guidance would better be able to point you in the right direction.',
                        experience: 5,
                        tool: 'Testing Environment Guide'
                    },
                    {
                        text: 'Jump straight into testing the website',
                        outcome: 'It\'s important to set up your environment first. Reviewing the setup guide would help you understand the tools and configurations needed.',
                        experience: -5
                    },
                    {
                        text: 'Ask a senior tester for guidance on where to begin',
                        outcome: 'Great job, a senior tester can guide you to the best starting point.',
                        experience: 10
                    },
                    {
                        text: 'Start writing test cases without context',
                        outcome: 'Understanding the environment through the setup guide would help you write more relevant test cases.',
                        experience: -3
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic I',
                title: 'Browser Compatibility Issue',
                description: 'A feature works in Chrome but fails in Firefox. Whats your approach?',
                options: [
                    {
                        text: 'Document the issue with screenshots and steps',
                        outcome: 'Perfect! Clear documentation helps developers reproduce and fix the issue.',
                        experience: 10,
                        tool: 'Screenshot Tool'
                    },
                    {
                        text: 'Mark it as "Works in Chrome" and move on',
                        outcome: "Cross-browser compatibility is essential! Documenting with screenshots and steps would help developers fix this issue across all browsers.",
                        experience: -5
                    },
                    {
                        text: 'Try different Firefox versions',
                        outcome: "Good thinking, but documenting with screenshots first would provide better evidence and help track the issue across versions.",
                        experience: 5
                    },
                    {
                        text: 'Ask users to use Chrome instead',
                        outcome: "We cannot dictate browser choice. Proper documentation with screenshots would help fix the issue for all users.",
                        experience: -3
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic I',
                title: "Form Validation Testing",
                description: "You're testing a registration form. Which approach do you take first?",
                options: [
                    {
                        text: "Test with valid data combinations first",
                        outcome: "Good start! Establishing baseline functionality is important.",
                        experience: 10,
                        tool: "Test Data Generator"
                    },
                    {
                        text: "Try SQL injection in all fields",
                        outcome: "Security testing is important but basic validation comes first. Testing with valid data establishes a baseline before edge cases.",
                        experience: -5
                    },
                    {
                        text: "Skip required fields and submit",
                        outcome: "Good negative testing, but starting with valid data combinations helps establish proper functionality before negative tests.",
                        experience: 5
                    },
                    {
                        text: "Test with extremely long input strings",
                        outcome: "Boundary testing is important, but verifying basic functionality with valid data should be done first to ensure the form works as intended.",
                        experience: 3
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic I',
                title: "Mobile Responsiveness",
                description: "The website looks broken on mobile devices. What's your first step?",
                options: [
                    {
                        text: "Test on multiple real devices",
                        outcome: "Excellent! Real device testing is crucial for mobile verification.",
                        experience: 10,
                        tool: "Mobile Testing Checklist"
                    },
                    {
                        text: "Use Chrome DevTools device emulation",
                        outcome: "Good start, but real device testing provides more accurate results and catches device-specific issues that emulators might miss.",
                        experience: 5
                    },
                    {
                        text: "Tell users to view on desktop",
                        outcome: "Unacceptable! Testing on real devices would reveal mobile issues that need fixing for our mobile users.",
                        experience: -10
                    },
                    {
                        text: "Check responsive breakpoints",
                        outcome: "Good technical approach, but testing on real devices would catch device-specific issues beyond just breakpoints.",
                        experience: 5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic I',
                title: "Test Documentation",
                description: "You've found a bug. How do you document it?",
                options: [
                    {
                        text: "Create detailed report with steps, expected vs actual results",
                        outcome: "Perfect! Clear documentation helps developers fix issues faster.",
                        experience: 10,
                        tool: "Bug Report Template"
                    },
                    {
                        text: "Just take a screenshot",
                        outcome: "Screenshots help but aren't enough alone. A detailed report with steps would help developers reproduce and fix the issue faster.",
                        experience: -5
                    },
                    {
                        text: "Send quick chat message to developer",
                        outcome: "Informal communication isn't sufficient. A detailed bug report would provide better tracking and documentation of the issue.",
                        experience: -3
                    },
                    {
                        text: "Record screen video with commentary",
                        outcome: "Good supporting evidence, but a detailed written report with steps would provide clearer, more referenceable documentation.",
                        experience: 5
                    }
                ]
            }
        ];

        // Basic II (IDs 6-10, 50 XP total)
        this.basicScenariosII = [
            {
                id: 6,
                level: 'Basic II',
                title: 'Test Data Management',
                description: 'You need test data for a user registration flow. What\'s your approach?',
                options: [
                    {
                        text: 'Create a test data generation strategy',
                        outcome: 'Excellent! A structured approach ensures comprehensive test coverage.',
                        experience: 10,
                        tool: 'Test Data Generator'
                    },
                    {
                        text: 'Use production data copies',
                        outcome: 'Privacy concerns! Creating test data strategies is safer and more controlled.',
                        experience: -5
                    },
                    {
                        text: 'Make up data as you go',
                        outcome: 'Unstructured approach may miss important test cases. A proper test data strategy would be better.',
                        experience: -3
                    },
                    {
                        text: 'Use static test accounts only',
                        outcome: 'Limited coverage. A test data generation strategy would provide more comprehensive testing scenarios.',
                        experience: 5
                    }
                ]
            },
            {
                id: 7,
                level: 'Basic II',
                title: 'Test Environment Issues',
                description: 'The test environment is behaving differently from production. What do you do?',
                options: [
                    {
                        text: 'Compare environment configurations',
                        outcome: 'Perfect! Configuration differences often cause environment-specific issues.',
                        experience: 10,
                        tool: 'Environment Comparison Tool'
                    },
                    {
                        text: 'Ignore the differences',
                        outcome: 'Risky! Environment differences could hide real issues.',
                        experience: -5
                    },
                    {
                        text: 'Test in production instead',
                        outcome: 'Never test in production without proper approval and safeguards!',
                        experience: -10
                    },
                    {
                        text: 'Request environment refresh',
                        outcome: 'Good thought, but first compare configurations to understand the differences.',
                        experience: 5
                    }
                ]
            },
            {
                id: 8,
                level: 'Basic II',
                title: 'Test Case Organization',
                description: 'How do you organize your test cases for a new feature?',
                options: [
                    {
                        text: 'Create a structured test plan with categories',
                        outcome: 'Excellent! Organized test cases improve coverage and maintenance.',
                        experience: 10,
                        tool: 'Test Case Management Tool'
                    },
                    {
                        text: 'Keep all tests in one list',
                        outcome: 'Unstructured approach makes maintenance and coverage tracking difficult.',
                        experience: -5
                    },
                    {
                        text: 'Only document failed tests',
                        outcome: 'All test cases should be documented, not just failures.',
                        experience: -10
                    },
                    {
                        text: 'Create tests during execution',
                        outcome: 'Ad-hoc testing without structure can miss important scenarios.',
                        experience: -3
                    }
                ]
            },
            {
                id: 9,
                level: 'Basic II',
                title: 'UI Element Changes',
                description: "A button's position changed in the latest update. What's your first step?",
                options: [
                    {
                        text: 'Update test documentation and automation scripts',
                        outcome: 'Perfect! Keeping test assets updated is crucial.',
                        experience: 10,
                        tool: 'UI Map Documentation'
                    },
                    {
                        text: 'Ignore if functionality works',
                        outcome: 'UI changes need documentation updates for future testing.',
                        experience: -5
                    },
                    {
                        text: 'Report as bug without checking requirements',
                        outcome: 'Verify against requirements before reporting UI changes as bugs.',
                        experience: -3
                    },
                    {
                        text: 'Only update automation scripts',
                        outcome: 'Documentation needs updating too, not just automation.',
                        experience: 5
                    }
                ]
            },
            {
                id: 10,
                level: 'Basic II',
                title: 'Test Coverage Analysis',
                description: 'How do you ensure adequate test coverage for a feature?',
                options: [
                    {
                        text: 'Create coverage matrix mapping requirements',
                        outcome: 'Excellent! Systematic approach ensures comprehensive coverage.',
                        experience: 10,
                        tool: 'Coverage Analysis Tool'
                    },
                    {
                        text: 'Test until no more bugs found',
                        outcome: 'No clear coverage metrics. A coverage matrix would be more systematic.',
                        experience: -5
                    },
                    {
                        text: 'Follow previous test patterns',
                        outcome: 'New features need fresh coverage analysis.',
                        experience: -3
                    },
                    {
                        text: 'Ask developer what to test',
                        outcome: 'While developer input helps, systematic coverage analysis is needed.',
                        experience: 5
                    }
                ]
            }
        ];

        // Intermediate I (IDs 11-15, 125 XP total)
        this.intermediateScenariosI = [
            {
                id: 11,
                level: 'Intermediate I',
                title: 'Performance Testing Challenge',
                description: 'The website loads slowly under heavy load. How do you investigate?',
                options: [
                    {
                        text: 'Use Chrome DevTools to analyze network waterfall',
                        outcome: 'Excellent! Network analysis can reveal bottlenecks.',
                        experience: 25,
                        tool: 'Performance Testing Suite'
                    },
                    {
                        text: 'Run a load test with concurrent users',
                        outcome: 'Good approach, but analyzing network waterfall first would help identify specific bottlenecks.',
                        experience: 15
                    },
                    {
                        text: 'Simply report "site is slow"',
                        outcome: 'Too vague. Using Chrome DevTools would provide specific metrics.',
                        experience: -10
                    },
                    {
                        text: 'Profile server-side performance',
                        outcome: 'Good thinking, but start with client-side analysis.',
                        experience: 10
                    }
                ]
            },
            {
                id: 12,
                level: 'Intermediate I',
                title: "Automated Testing Framework",
                description: "Team needs to implement automated testing. What's your first step?",
                options: [
                    {
                        text: "Create a proof of concept with critical paths",
                        outcome: "Perfect! Starting small proves value and identifies challenges.",
                        experience: 25,
                        tool: "Test Automation Framework"
                    },
                    {
                        text: "Automate all existing test cases",
                        outcome: "Too ambitious. Start with critical paths to prove value.",
                        experience: -10
                    },
                    {
                        text: "Skip automation, continue manual testing",
                        outcome: "Automation is crucial for regression and repetitive tests.",
                        experience: -15
                    },
                    {
                        text: "Create framework documentation first",
                        outcome: "Good to plan, but a working POC demonstrates value better.",
                        experience: 20
                    }
                ]
            },
            {
                id: 13,
                level: 'Intermediate I',
                title: "Cross-browser Testing Strategy",
                description: "New feature needs cross-browser testing. How do you approach it?",
                options: [
                    {
                        text: "Create browser compatibility matrix and test plan",
                        outcome: "Excellent! Structured approach ensures thorough coverage.",
                        experience: 25,
                        tool: "Browser Testing Matrix"
                    },
                    {
                        text: "Test only in Chrome",
                        outcome: "Limited coverage. Need to test across multiple browsers.",
                        experience: -20
                    },
                    {
                        text: "Use browser emulators only",
                        outcome: "Real browsers needed for accurate testing.",
                        experience: -10
                    },
                    {
                        text: "Test major browsers without a plan",
                        outcome: "Better to have a structured approach with a matrix.",
                        experience: 15
                    }
                ]
            },
            {
                id: 14,
                level: 'Intermediate I',
                title: "Regression Test Automation",
                description: "Large regression suite takes too long manually. What's your solution?",
                options: [
                    {
                        text: "Identify and automate high-priority test cases",
                        outcome: "Perfect! Focus automation on critical, repetitive tests.",
                        experience: 25,
                        tool: "Regression Automation Suite"
                    },
                    {
                        text: "Reduce regression test scope",
                        outcome: "Risky to reduce coverage. Better to automate priority cases.",
                        experience: -15
                    },
                    {
                        text: "Run regression less frequently",
                        outcome: "Could miss critical issues. Automation is better solution.",
                        experience: -20
                    },
                    {
                        text: "Hire more manual testers",
                        outcome: "Not scalable. Automation is more efficient long-term.",
                        experience: -10
                    }
                ]
            },
            {
                id: 15,
                level: 'Intermediate I',
                title: "API Performance Testing",
                description: "Need to test API performance under load. What's your approach?",
                options: [
                    {
                        text: "Create test scenarios with realistic data and concurrent users",
                        outcome: "Excellent! Realistic scenarios provide meaningful results.",
                        experience: 25,
                        tool: "API Load Testing Tool"
                    },
                    {
                        text: "Test with maximum possible load only",
                        outcome: "Need various load levels, not just maximum.",
                        experience: -10
                    },
                    {
                        text: "Test endpoints individually only",
                        outcome: "Need to test realistic user flows, not just individual endpoints.",
                        experience: -15
                    },
                    {
                        text: "Monitor response times under normal load",
                        outcome: "Good start, but need to test various load levels.",
                        experience: 20
                    }
                ]
            }
        ];

        // Intermediate II scenarios (IDs 16-20, 150 XP total)
        this.intermediateScenariosII = [
            {
                id: 16,
                level: 'Intermediate II',
                title: "Load Testing Analysis",
                description: "Load test shows performance degradation. Next steps?",
                options: [
                    {
                        text: "Analyze metrics and create performance baseline",
                        outcome: "Excellent! Data-driven approach to performance.",
                        experience: 25,
                        tool: "Performance Baseline Tool"
                    },
                    {
                        text: "Increase server resources",
                        outcome: "Throwing resources without analysis isn't efficient.",
                        experience: -15
                    },
                    {
                        text: "Reduce test load",
                        outcome: "Avoiding the problem doesn't solve it.",
                        experience: -20
                    },
                    {
                        text: "Monitor resource utilization",
                        outcome: "Good start, but need comprehensive analysis.",
                        experience: 15
                    }
                ]
            },
            {
                id: 17,
                level: 'Intermediate II',
                title: "Mobile Testing Strategy",
                description: "New mobile-responsive feature released. How to test?",
                options: [
                    {
                        text: "Create device coverage matrix with test scenarios",
                        outcome: "Perfect! Systematic approach to mobile testing.",
                        experience: 25,
                        tool: "Mobile Testing Matrix"
                    },
                    {
                        text: "Test only on your personal phone",
                        outcome: "Limited coverage. Need diverse device testing.",
                        experience: -15
                    },
                    {
                        text: "Use only emulators",
                        outcome: "Real devices needed for accurate testing.",
                        experience: -10
                    },
                    {
                        text: "Focus on popular devices only",
                        outcome: "Good start, but need broader coverage.",
                        experience: 15
                    }
                ]
            },
            {
                id: 18,
                level: 'Intermediate II',
                title: "CI/CD Pipeline Testing",
                description: "New CI/CD pipeline implemented. What to verify?",
                options: [
                    {
                        text: "Create pipeline validation test suite",
                        outcome: "Excellent! Systematic validation of deployment process.",
                        experience: 25,
                        tool: "Pipeline Test Suite"
                    },
                    {
                        text: "Manual deployment verification",
                        outcome: "Automation needed for consistent validation.",
                        experience: -10
                    },
                    {
                        text: "Trust developer testing",
                        outcome: "Independent testing needed for pipeline.",
                        experience: -20
                    },
                    {
                        text: "Test in production after deploy",
                        outcome: "Too late! Pipeline needs pre-deployment testing.",
                        experience: -15
                    }
                ]
            },
            {
                id: 19,
                level: 'Intermediate II',
                title: "API Version Migration",
                description: "API being upgraded to new version. Testing approach?",
                options: [
                    {
                        text: "Create migration test plan with compatibility checks",
                        outcome: "Perfect! Comprehensive approach to version migration.",
                        experience: 25,
                        tool: "API Migration Test Kit"
                    },
                    {
                        text: "Test new version only",
                        outcome: "Need to verify backward compatibility.",
                        experience: -15
                    },
                    {
                        text: "Manual API testing",
                        outcome: "Automated testing needed for comprehensive coverage.",
                        experience: -10
                    },
                    {
                        text: "Focus on regression testing",
                        outcome: "Good, but need specific migration tests too.",
                        experience: 15
                    }
                ]
            },
            {
                id: 20,
                level: 'Intermediate II',
                title: "Database Testing Strategy",
                description: "Database schema changes deployed. Testing priority?",
                options: [
                    {
                        text: "Data integrity and migration validation",
                        outcome: "Excellent! Critical for schema changes.",
                        experience: 25,
                        tool: "Database Test Framework"
                    },
                    {
                        text: "UI testing only",
                        outcome: "Database changes need direct validation.",
                        experience: -20
                    },
                    {
                        text: "Performance testing only",
                        outcome: "Data integrity is priority for schema changes.",
                        experience: -15
                    },
                    {
                        text: "Backup verification",
                        outcome: "Important but not sufficient alone.",
                        experience: 15
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 21-25, 150 XP total)
        this.advancedScenarios = [
            {
                id: 21,
                level: 'Advanced',
                title: "Security Vulnerability Assessment",
                description: "During testing, you notice potential SQL injection vulnerability. Handle this situation:",
                options: [
                    {
                        text: "Raise immediate P1 security ticket with evidence",
                        outcome: "Perfect! Security vulnerabilities need immediate attention.",
                        experience: 30,
                        tool: "Security Testing Framework"
                    },
                    {
                        text: "Consult security team first",
                        outcome: "Good but raise ticket first to track issue.",
                        experience: 20
                    },
                    {
                        text: "Try to exploit it to confirm",
                        outcome: "NEVER attempt exploitation without proper authorization!",
                        experience: -25
                    },
                    {
                        text: "Document for next sprint",
                        outcome: "Security issues need immediate attention.",
                        experience: -20
                    }
                ]
            },
            {
                id: 22,
                level: 'Advanced',
                title: "Production Incident Response",
                description: "Critical bug reported in production affecting user data. What's your immediate action?",
                options: [
                    {
                        text: "Alert incident response team with evidence",
                        outcome: "Perfect! Quick escalation with evidence is crucial.",
                        experience: 30,
                        tool: "Incident Response Playbook"
                    },
                    {
                        text: "Start fixing the bug",
                        outcome: "Follow incident response process first!",
                        experience: -20
                    },
                    {
                        text: "Investigate root cause",
                        outcome: "Alert team first, then investigate.",
                        experience: 15
                    },
                    {
                        text: "Document the issue",
                        outcome: "Immediate escalation needed for critical issues.",
                        experience: -10
                    }
                ]
            },
            {
                id: 23,
                level: 'Advanced',
                title: "Accessibility Compliance",
                description: "Client requires WCAG 2.1 AA compliance. How do you approach testing?",
                options: [
                    {
                        text: "Comprehensive approach: tools, manual, and expert review",
                        outcome: "Excellent! Multi-layered approach ensures thorough testing.",
                        experience: 30,
                        tool: "Accessibility Testing Suite"
                    },
                    {
                        text: "Run automated scanner only",
                        outcome: "Tools help but can't catch all issues.",
                        experience: -15
                    },
                    {
                        text: "Manual testing only",
                        outcome: "Need multiple testing methods.",
                        experience: -10
                    },
                    {
                        text: "Outsource to consultants",
                        outcome: "Team should understand accessibility testing.",
                        experience: 15
                    }
                ]
            },
            {
                id: 24,
                level: 'Advanced',
                title: "Microservices Testing Strategy",
                description: "New microservices architecture deployment. What's your testing focus?",
                options: [
                    {
                        text: "Integration testing between services",
                        outcome: "Perfect! Service interactions are critical.",
                        experience: 30,
                        tool: "Service Virtualization Tool"
                    },
                    {
                        text: "Unit tests only",
                        outcome: "Integration testing crucial for microservices.",
                        experience: -20
                    },
                    {
                        text: "End-to-end only",
                        outcome: "Need service-level testing too.",
                        experience: -15
                    },
                    {
                        text: "Contract testing",
                        outcome: "Good approach for service interfaces.",
                        experience: 20
                    }
                ]
            },
            {
                id: 25,
                level: 'Advanced',
                title: "Performance Optimization",
                description: "System shows scalability issues. Your approach?",
                options: [
                    {
                        text: "Systematic performance analysis and profiling",
                        outcome: "Excellent! Data-driven approach to optimization.",
                        experience: 30,
                        tool: "Performance Profiling Suite"
                    },
                    {
                        text: "Add more servers",
                        outcome: "Analyze first before scaling.",
                        experience: -20
                    },
                    {
                        text: "Optimize database queries",
                        outcome: "Need to identify bottleneck first.",
                        experience: -15
                    },
                    {
                        text: "Enable caching",
                        outcome: "Analysis needed before implementing solutions.",
                        experience: -10
                    }
                ]
            }
        ];

        this.initializeUI();
    }

    initializeUI() {
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');
        this.optionsForm = document.getElementById('options-form');
        
        this.optionsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAnswer();
        });

        document.getElementById('continue-btn').addEventListener('click', () => {
            this.nextScenario();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }

    startGame() {
        this.player.experience = 0;
        this.player.tools = [];
        this.player.currentScenario = 0;
        this.player.questionHistory = [];
        this.displayScenario();
    }

    displayScenario() {
        const currentScenarios = this.getCurrentScenarios();
        
        // Check if we should progress or end
        if (this.player.currentScenario >= currentScenarios.length) {
            const totalQuestionsAnswered = this.player.questionHistory.length + 1;
            
            // Basic I (Questions 1-5)
            if (totalQuestionsAnswered === 5) {
                if (this.player.experience < 25) {
                    this.endGame();
                    return;
                }
            }
            // Basic II (Questions 6-10)
            else if (totalQuestionsAnswered === 10) {
                if (this.player.experience < 75) {
                    this.endGame();
                    return;
                }
            }
            // Intermediate I (Questions 11-15)
            else if (totalQuestionsAnswered === 15) {
                if (this.player.experience < 175) {
                    this.endGame();
                    return;
                }
            }
            // Intermediate II (Questions 16-20)
            else if (totalQuestionsAnswered === 20) {
                if (this.player.experience < 350) {
                    this.endGame();
                    return;
                }
            }
            // Advanced (Questions 21-25)
            else if (totalQuestionsAnswered === 25) {
                this.endGame();
                return;
            }

            // Double-check we're getting the correct next scenarios
            const nextScenarios = this.getCurrentScenarios();
            if (!nextScenarios || nextScenarios.length === 0) {
                this.endGame();
                return;
            }
            
            // Reset counter for next section
            this.player.currentScenario = 0;
            this.displayScenario();
            return;
        }

        const scenario = currentScenarios[this.player.currentScenario];
        
        // Show level transition message if starting new section
        if (this.player.currentScenario === 0) {
            const levelMessage = document.createElement('div');
            levelMessage.className = 'level-transition';
            levelMessage.textContent = `Starting ${scenario.level} Questions`;
            this.gameScreen.insertBefore(levelMessage, this.gameScreen.firstChild);
            
            setTimeout(() => levelMessage.remove(), 3000);
            
            // Update level indicator immediately when transitioning
            document.getElementById('level-indicator').textContent = `Level: ${scenario.level}`;
        }

        document.getElementById('scenario-title').textContent = scenario.title;
        document.getElementById('scenario-description').textContent = scenario.description;
        
        const optionsContainer = document.querySelector('.options-container');
        optionsContainer.innerHTML = '';
        
        // Create a shuffled array of indices
        const shuffledIndices = scenario.options.map((_, index) => index)
            .sort(() => Math.random() - 0.5);
        
        // Store the shuffled order for answer handling
        this.currentShuffledOrder = shuffledIndices;
        
        // Display options in shuffled order
        shuffledIndices.forEach((originalIndex, shuffledIndex) => {
            const option = scenario.options[originalIndex];
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item';
            optionDiv.innerHTML = `
                <input type="radio" name="option" value="${originalIndex}" id="option${shuffledIndex}">
                <label for="option${shuffledIndex}">${option.text}</label>
            `;
            optionsContainer.appendChild(optionDiv);
        });

        this.updateProgress();
    }

    updateProgress() {
        const currentScenarios = this.getCurrentScenarios();
        const progress = this.player.currentScenario === currentScenarios.length - 1 ? 
            100 : 
            (this.player.currentScenario / currentScenarios.length) * 100;
        
        document.getElementById('progress-fill').style.width = `${progress}%`;
        
        // Cap XP display at 500
        const displayXP = Math.min(this.player.experience, 500);
        document.getElementById('experience-display').textContent = `XP: ${displayXP}/500`;
        
        document.getElementById('question-progress').textContent = 
            `Question: ${this.player.currentScenario + 1}/${currentScenarios.length}`;
        
        // Update level indicator based on current scenario level
        const currentLevel = currentScenarios[this.player.currentScenario].level;
        document.getElementById('level-indicator').textContent = `Level: ${currentLevel}`;
    }

    handleAnswer() {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (!selectedOption) return;

        const currentScenarios = this.getCurrentScenarios();
        const scenario = currentScenarios[this.player.currentScenario];
        const choice = parseInt(selectedOption.value);
        const selectedAnswer = scenario.options[choice];

        // Record question history
        this.player.questionHistory.push({
            scenario: scenario,
            selectedAnswer: selectedAnswer,
            maxPossibleXP: Math.max(...scenario.options.map(o => o.experience))
        }); 

        // Display outcome
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
    }

    nextScenario() {
        this.outcomeScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.player.currentScenario++;
        this.displayScenario();
    }

    endGame() {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        const finalScore = Math.min(this.player.experience, 500);
        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/500`;

        const performanceSummary = document.getElementById('performance-summary');
        if (finalScore >= 400) {
            performanceSummary.textContent = '🏆 Outstanding! You\'re a testing expert!';
        } else if (finalScore >= 300) {
            performanceSummary.textContent = '👏 Great job! You\'ve shown strong testing skills!';
        } else if (finalScore >= 200) {
            performanceSummary.textContent = '👍 Good work! Keep practicing to improve further.';
        } else {
            performanceSummary.textContent = '📚 Consider reviewing testing best practices and try again!';
        }

        this.displayQuestionReview();
        this.generateRecommendations();
    }

    displayQuestionReview() {
        const reviewContainer = document.getElementById('question-review');
        reviewContainer.innerHTML = '';

        this.player.questionHistory.forEach((history, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = `review-item ${history.selectedAnswer.experience === history.maxPossibleXP ? 'success' : 'warning'}`;
            
            reviewItem.innerHTML = `
                <strong>${history.scenario.level}: ${history.scenario.title}</strong><br>
                Your answer: ${history.selectedAnswer.text}<br>
                Points: ${history.selectedAnswer.experience}/${history.maxPossibleXP}
            `;
            
            reviewContainer.appendChild(reviewItem);
        });
    }

    generateRecommendations() {
        const recommendationsDiv = document.getElementById('recommendations');
        const weakAreas = this.player.questionHistory
            .filter(h => h.selectedAnswer.experience < h.maxPossibleXP)
            .map(h => h.scenario.title)
            .reduce((acc, title) => {
                acc[title] = (acc[title] || 0) + 1;
                return acc;
            }, {});

        const recommendations = Object.entries(weakAreas)
            .map(([area, count]) => `Review ${area} concepts`)
            .join('<br>');

        recommendationsDiv.innerHTML = recommendations || 'Great job! No specific areas need improvement.';
    }

    restartGame() {
        this.endScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.startGame();
    }

    getCurrentScenarios() {
        const totalAnswered = this.player.questionHistory.length;
        
        if (totalAnswered >= 20 && this.player.experience >= 350) {
            return this.advancedScenarios;
        } else if (totalAnswered >= 15 && this.player.experience >= 175) {
            return this.intermediateScenariosII;
        } else if (totalAnswered >= 10 && this.player.experience >= 75) {
            return this.intermediateScenariosI;
        } else if (totalAnswered >= 5 && this.player.experience >= 25) {
            return this.basicScenariosII;
        }
        return this.basicScenariosI;
    }
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new TestingRPG();
    game.startGame();
}); 