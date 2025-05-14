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
                    tool: 'Test Planning'
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
        }
    ],
    intermediate: [
        {
            id: 2,
            level: 'Intermediate',
            title: 'Bug Reporting',
            description: 'You\'ve found a complex bug that\'s difficult to reproduce. How should you report it?',
            options: [
                {
                    text: 'Document detailed steps, environment info, and include screen recordings or logs',
                    outcome: 'Perfect! Comprehensive documentation helps developers reproduce and fix the issue.',
                    experience: 20,
                    tool: 'Bug Documentation'
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
        }
    ],
    advanced: [
        {
            id: 3,
            level: 'Advanced',
            title: 'Test Automation Strategy',
            description: 'Your team is implementing test automation. What approach should you recommend?',
            options: [
                {
                    text: 'Create a balanced pyramid with more unit tests, fewer integration tests, and selective UI tests',
                    outcome: 'Excellent! The test pyramid approach ensures efficient and effective test coverage.',
                    experience: 25,
                    tool: 'Test Architecture'
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
        }
    ]
} 