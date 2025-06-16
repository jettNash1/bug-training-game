export const testScenarios = {
    basic: [
        {
            id: 1,
            level: 'Basic',
            title: 'Simple Testing Question',
            description: 'What is the most effective way to approach testing a new feature?',
            options: [
                {
                    text: 'Understand requirements first, then create a test plan before executing tests',
                    outcome: 'Excellent! Understanding requirements is the foundation of effective testing.',
                    experience: 15,
                },
                {
                    text: 'Start testing immediately to find bugs quickly',
                    outcome: 'Testing without understanding requirements may miss important test cases.',
                    experience: -5
                },
                {
                    text: 'Ask another tester to handle it since they may have more experience',
                    outcome: 'Taking ownership of your testing responsibilities is important.',
                    experience: -10
                },
                {
                    text: 'Focus only on the positive test cases to ensure the feature works',
                    outcome: 'Both positive and negative test cases are important for thorough testing.',
                    experience: 0
                }
            ]
        },
        {
            id: 2,
            level: 'Basic',
            title: 'Bug Description',
            description: 'You found a bug in the application. What information should you include in your bug report?',
            options: [
                {
                    text: 'Steps to reproduce, expected vs. actual results, environment details, and severity assessment',
                    outcome: 'Perfect! This provides all the essential information for developers to understand and fix the issue.',
                    experience: 15,
                },
                {
                    text: 'Just a screenshot of the error and a brief description',
                    outcome: 'Screenshots are helpful but insufficient without proper context and reproduction steps.',
                    experience: -5
                },
                {
                    text: 'A general description explaining that something doesn\'t work',
                    outcome: 'Vague descriptions make it difficult for developers to locate and fix the issue.',
                    experience: -10
                },
                {
                    text: 'Only your assessment of how serious the bug is',
                    outcome: 'Severity assessment alone doesn\'t provide the information needed to address the bug.',
                    experience: 0
                }
            ]
        },
        {
            id: 3,
            level: 'Basic',
            title: 'Test Documentation',
            description: 'What is the primary purpose of creating test documentation?',
            options: [
                {
                    text: 'To provide a record of what was tested, how it was tested, and the results for future reference',
                    outcome: 'Correct! Good documentation helps with knowledge sharing, traceability, and repeatability.',
                    experience: 15,
                },
                {
                    text: 'To satisfy management requirements for paperwork',
                    outcome: 'Documentation should provide value beyond just satisfying management requirements.',
                    experience: -10
                },
                {
                    text: 'To have something to show clients during meetings',
                    outcome: 'While client demonstrations are important, that\'s not the primary purpose of test documentation.',
                    experience: -5
                },
                {
                    text: 'To make testers look busy when they aren\'t finding bugs',
                    outcome: 'Documentation is a valuable activity, not busywork to fill time.',
                    experience: 0
                }
            ]
        }
    ],
    intermediate: [
        {
            id: 4,
            level: 'Intermediate',
            title: 'Bug Reporting',
            description: 'You\'ve found a complex bug that\'s difficult to reproduce. How should you report it?',
            options: [
                {
                    text: 'Document detailed steps, environment info, and include screen recordings or logs',
                    outcome: 'Perfect! Comprehensive documentation helps developers reproduce and fix the issue.',
                    experience: 20,
                },
                {
                    text: 'Report it verbally to the developer to save time',
                    outcome: 'Verbal reports can miss important details and lack documentation for future reference.',
                    experience: -10
                },
                {
                    text: 'Create a simple ticket stating that the feature doesn\'t work',
                    outcome: 'Vague bug reports make it difficult for developers to understand and fix issues.',
                    experience: -15
                },
                {
                    text: 'Wait to see if you can reproduce it consistently before reporting',
                    outcome: 'While reproducibility is important, reporting intermittent issues promptly is still valuable.',
                    experience: -5
                }
            ]
        },
        {
            id: 5,
            level: 'Intermediate',
            title: 'Test Case Design',
            description: 'You need to test a form with multiple fields. What testing technique would be most effective?',
            options: [
                {
                    text: 'Boundary value analysis and equivalence partitioning to efficiently cover input ranges',
                    outcome: 'Excellent! These techniques provide good coverage while minimizing the number of test cases.',
                    experience: 20,
                },
                {
                    text: 'Random testing of different inputs to see what happens',
                    outcome: 'Random testing lacks systematic coverage and may miss important edge cases.',
                    experience: -10
                },
                {
                    text: 'Testing only with valid inputs since that\'s what users should enter',
                    outcome: 'Negative testing with invalid inputs is essential for ensuring robust form validation.',
                    experience: -15
                },
                {
                    text: 'Test every possible combination of inputs to be thorough',
                    outcome: 'Testing all combinations is usually impractical; structured techniques provide better efficiency.',
                    experience: -5
                }
            ]
        },
        {
            id: 6,
            level: 'Intermediate',
            title: 'Test Environment',
            description: 'What is the best approach when setting up a test environment?',
            options: [
                {
                    text: 'Create an environment that closely matches production with isolated test data',
                    outcome: 'Perfect! A production-like environment with isolated test data provides realistic testing conditions.',
                    experience: 20,
                },
                {
                    text: 'Use the production environment to ensure accuracy',
                    outcome: 'Testing in production can affect real users and data, creating business risks.',
                    experience: -15
                },
                {
                    text: 'Use any available environment since they\'re all basically the same',
                    outcome: 'Environment differences can significantly impact test results and bug reproduction.',
                    experience: -10
                },
                {
                    text: 'Always use your local development environment for convenience',
                    outcome: 'Local environments may not capture all the conditions present in production.',
                    experience: -5
                }
            ]
        }
    ],
    advanced: [
        {
            id: 7,
            level: 'Advanced',
            title: 'Test Automation Strategy',
            description: 'Your team is implementing test automation. What approach should you recommend?',
            options: [
                {
                    text: 'Create a balanced pyramid with more unit tests, fewer integration tests, and selective UI tests',
                    outcome: 'Excellent! The test pyramid approach ensures efficient and effective test coverage.',
                    experience: 25,
                },
                {
                    text: 'Focus on automating all manual UI tests first since they\'re most visible to users',
                    outcome: 'UI tests are slower and more brittle; overreliance on them creates maintenance challenges.',
                    experience: -15
                },
                {
                    text: 'Suggest everyone learn to code and automate their own tests',
                    outcome: 'While testing skills are important, a coordinated strategy with proper architecture is essential.',
                    experience: -10
                },
                {
                    text: 'Recommend purchasing a commercial tool that promises codeless automation',
                    outcome: 'Tool selection should be based on project needs rather than promises of quick solutions.',
                    experience: -20
                }
            ]
        },
        {
            id: 8,
            level: 'Advanced',
            title: 'Performance Testing',
            description: 'You need to implement performance testing for a high-traffic web application. What approach should you take?',
            options: [
                {
                    text: 'Define clear performance requirements, identify key scenarios, simulate realistic loads, and measure against business metrics',
                    outcome: 'Perfect! This approach ensures performance testing addresses actual business needs.',
                    experience: 25,
                },
                {
                    text: 'Run the maximum possible load to see when the system breaks',
                    outcome: 'While stress testing is valuable, it should be part of a comprehensive approach based on requirements.',
                    experience: -15
                },
                {
                    text: 'Focus on measuring response times for all API endpoints',
                    outcome: 'API testing is important but should be guided by user scenarios and business priorities.',
                    experience: -10
                },
                {
                    text: 'Monitor the production system to identify performance issues',
                    outcome: 'Proactive testing before production is essential for preventing performance problems.',
                    experience: -20
                }
            ]
        },
        {
            id: 9,
            level: 'Advanced',
            title: 'Test Strategy',
            description: 'As the QA lead, you need to develop a test strategy for a complex system. What should be your primary focus?',
            options: [
                {
                    text: 'Aligning testing efforts with business risks and priorities to deliver the most value',
                    outcome: 'Excellent! Risk-based testing ensures resources focus on the most important areas.',
                    experience: 25, 
                },
                {
                    text: 'Ensuring 100% test coverage of all code',
                    outcome: 'Complete coverage is often impractical and doesn\'t necessarily focus on what matters most.',
                    experience: -15
                },
                {
                    text: 'Implementing the latest testing tools and technologies',
                    outcome: 'Tools should support the strategy, not drive it; business needs should come first.',
                    experience: -20
                },
                {
                    text: 'Creating detailed test plans for all features',
                    outcome: 'While documentation is important, not all features warrant the same level of testing.',
                    experience: -10
                }
            ]
        }
    ]
} 