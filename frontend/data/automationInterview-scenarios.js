export const automationInterviewScenarios = {
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Team Mentoring',
                description: 'How do you mentor and guide a team in automation testing?',
                    options: [
                        {
                            text: 'Introduce standard practices, encourage collaboration, and provide workshops on different automation topics',
                            outcome: 'Perfect! This provides a comprehensive approach to team development.',
                            experience: 15,
                        },
                        {
                            text: 'Take an unguided approach and allow them to do their own research',
                            outcome: 'Teams need structured guidance and support for effective learning.',
                            experience: -10,
                        },
                        {
                            text: 'Ensure team members only learn a specific framework/set of technologies',
                            outcome: 'Teams benefit from broader knowledge across different automation tools and approaches.',
                            experience: -5,
                        },
                        {
                            text: 'Prioritise team members that show a greater understanding of automation',
                            outcome: 'All team members should receive equal opportunity for growth and development.',
                            experience: -10,
                        }
                    ]
                },
                {
                    id: 2,
                    level: 'Basic',
                    title: 'Documentation Handover',
                    description: 'What kind of documentation would you record once an automation project had been passed over to a client to maintain?',
                    options: [
                        {
                            text: 'Handover document/read me file containing set up details',
                            outcome: 'Excellent! This ensures the client has all necessary information for maintenance.',
                            experience: 15,
                        },
                        {
                            text: 'Hand them the code and a run command',
                            outcome: 'Proper documentation is essential for successful project handover.',
                            experience: -10
                        },
                        {
                            text: 'Only provide the client with the reports from previous testing/tests',
                            outcome: 'Setup and maintenance documentation is crucial for project continuity.',
                            experience: -5
                        },
                        {
                            text: 'Provide a call/presentation of how to maintain the project',
                            outcome: 'Written documentation is necessary for future reference.',
                            experience: -10
                        }
                    ]
                },
                {
                    id: 3,
                    level: 'Basic',
                    title: 'Element Locators',
                    description: 'You\'re writing a test script and need to locate elements on a web page. What\'s the best approach?',
                    options: [
                        {
                            text: 'The approach should include the use unique IDs and data attributes',
                            outcome: 'Perfect! This creates reliable and maintainable tests.',
                            experience: 15,
                        },
                        {
                            text: 'Create complex CSS selectors that chain multiple classes and attributes together for maximum specificity',
                            outcome: 'Simple, unique locators are more reliable and usable.',
                            experience: -10
                        },
                        {
                            text: 'Generate full XPath expressions from the browser\'s copy selector feature',
                            outcome: 'Absolute XPaths can be fragile and hard to maintain.',
                            experience: -10
                        },
                        {
                            text: 'Locate elements by their displayed text content and position on the page',
                            outcome: 'Position and text content can change frequently and make it difficult locate elements.',
                            experience: -5
                        }
                    ]
                },
                {
                    id: 4,
                    level: 'Basic',
                    title: 'Test Script Organisation',
                    description: 'How should you structure your automated test scripts?',
                    options: [
                        {
                            text: 'Use page object model with clear separation of concerns',
                            outcome: 'Excellent! This promotes reusability and maintainability.',
                            experience: 15,
                        },
                        {
                            text: 'Write long, detailed test scripts that cover multiple scenarios in a single file',
                            outcome: 'Tests should be organised logically and modularly for ease of use.',
                            experience: -10
                        },
                        {
                            text: 'Duplicate similar test code to ensure each test is independent',
                            outcome: 'Code duplication should be avoided if possible as it makes it harder to update tests when the underlying system changes.',
                            experience: -5
                        },
                        {
                            text: 'Place test code alongside application code for easy access',
                            outcome: 'Test code should be separate from application code to provide flexibility on maintenance.',
                            experience: -10
                        }
                    ]
                },
                {
                    id: 5,
                    level: 'Basic',
                    title: 'Test Execution',
                    description: 'Your automated tests are failing intermittently. What should you do?',
                    options: [
                        {
                            text: 'Identify the root cause of the issue',
                            outcome: 'Intermittent failures often occur simply because the website occasionally behaves unexpectedly or inconsistently. Waits are not a catch all solution for this kind of issue. Identification of a false positive or validating the quality of your results is.',
                            experience: 15,
                        },
                        {
                            text: 'Add Thread.sleep() or fixed delays throughout the test scripts',
                            outcome: 'Fixed delays can make tests slow and unreliable.',
                            experience: -5
                        },
                        {
                            text: 'Configure the CI system to automatically retry failed tests multiple times',
                            outcome: 'Root causes should be addressed instead of retrying failed tests.',
                            experience: -10
                        },
                        {
                            text: 'Mark intermittent tests as known issues in the test report',
                            outcome: 'Intermittent failures require thorough investigation.',
                            experience: -10
                        }
                    ]
                }
            ],

            // Intermediate Scenarios (IDs 6-10)
            intermediate: [
                {
                    id: 6,
                    level: 'Intermediate',
                    title: 'Test Data Management',
                    description: 'How should you handle test data in your automation framework?',
                    options: [
                        {
                            text: 'Use external data sources with proper cleanup',
                            outcome: 'Excellent! This ensures efficient test data management.',
                            experience: 20,
                        },
                        {
                            text: 'Create elaborate setup scripts that generate fresh test data before each test execution',
                            outcome: 'Test data should be managed efficiently.',
                            experience: -5
                        },
                        {
                            text: 'Copy and sanitise production data for testing purposes',
                            outcome: 'Test data should be controlled and secure.',
                            experience: -10
                        },
                        {
                            text: 'Maintain test data directly in the test scripts',
                            outcome: 'Test data should be externalised.',
                            experience: -15
                        }
                    ]
                },
                {
                    id: 7,
                    level: 'Intermediate',
                    title: 'CI/CD Integration',
                    description: 'How do you integrate automated tests into the CI/CD pipeline?',
                    options: [
                        {
                            text: 'Organise tests in stages with appropriate triggers',
                            outcome: 'Perfect! This enables continuous testing.',
                            experience: 20,
                        },
                        {
                            text: 'Execute the complete test suite sequentially after every code change',
                            outcome: 'Tests should be organised in appropriate stages.',
                            experience: -10
                        },
                        {
                            text: 'Run tests manually before each production deployment',
                            outcome: 'Automation should be integrated into CI/CD.',
                            experience: -5
                        },
                        {
                            text: 'Configure nightly runs of all automated tests',
                            outcome: 'Tests should provide timely feedback.',
                            experience: -15
                        }
                    ]
                },
                {
                    id: 8,
                    level: 'Intermediate',
                    title: 'Version Control Approach',
                    description: 'What is an effective version control approach for adding new features to an automation project?',
                    options: [
                        {
                            text: 'Create branches for each new test feature',
                            outcome: 'Perfect! This enables organized and controlled development.',
                            experience: 20,
                        },
                        {
                            text: 'Keep a single, main branch, and push all changes',
                            outcome: 'Feature branches help manage changes more effectively.',
                            experience: -10
                        },
                        {
                            text: 'Avoid using version control, it slows down development',
                            outcome: 'Version control is essential for managing test code effectively.',
                            experience: -15
                        },
                        {
                            text: 'Skip reviews of pull requests to increase test development speed',
                            outcome: 'Code reviews are crucial for maintaining quality.',
                            experience: -10
                        }
                    ]
                },
                {
                    id: 9,
                    level: 'Intermediate',
                    title: 'Version Control Importance',
                    description: 'Why is proper use of version control important for an automation project?',
                    options: [
                        {
                            text: 'Allows for efficient collaboration and auditability',
                            outcome: 'Excellent! Version control is crucial for team collaboration.',
                            experience: 20,
                        },
                        {
                            text: 'Usage should be avoided, as this slows down the development and coverage of tests',
                            outcome: 'Version control is essential for managing changes effectively.',
                            experience: -15
                        },
                        {
                            text: 'Its only useful for historical changes',
                            outcome: 'Version control provides many benefits beyond history tracking.',
                            experience: -10
                        },
                        {
                            text: 'Avoids conflicts in code',
                            outcome: 'While true, version control offers many more benefits.',
                            experience: -5
                        }
                    ]
                },
                {
                    id: 10,
                    level: 'Intermediate',
                    title: 'Error Handling',
                    description: 'How do you handle errors and exceptions in your test automation framework?',
                    options: [
                        {
                            text: 'Implement custom exception handlers with retry logic',
                            outcome: 'Perfect! This enables good error diagnosis.',
                            experience: 20,
                        },
                        {
                            text: 'Write extensive try-catch blocks around every possible point of failure in the test scripts',
                            outcome: 'Error handling should be strategic and efficient.',
                            experience: -15
                        },
                        {
                            text: 'Log all exceptions to a central error log',
                            outcome: 'Errors need proper handling, not just logging.',
                            experience: -10
                        },
                        {
                            text: 'Skip error handling within automation tests',
                            outcome: 'Error handling is crucial for prompt identification of issues.',
                            experience: -5
                        }
                    ]
                }
            ],

            // Advanced Scenarios (IDs 11-15)
            advanced: [
                {
                    id: 11,
                    level: 'Advanced',
                    title: 'Performance Testing',
                    description: 'How do you implement automated performance testing?',
                    options: [
                        {
                            text: 'Monitor key metrics under various load conditions',
                            outcome: 'Perfect! This ensures comprehensive testing.',
                            experience: 25,
                        },
                        {
                            text: 'Create complex performance test scenarios that simulate every possible user interaction simultaneously',
                            outcome: 'Focus should be on key performance indicators.',
                            experience: -10
                        },
                        {
                            text: 'Record browser timings in production',
                            outcome: 'Use proper test environments.',
                            experience: -15
                        },
                        {
                            text: 'Test with maximum concurrent users',
                            outcome: 'Various load scenarios needed.',
                            experience: -20
                        }
                    ]
                },
                {
                    id: 12,
                    level: 'Advanced',
                    title: 'API Testing',
                    description: 'How do you approach automated API testing?',
                    options: [
                        {
                            text: 'Validate contracts and response schemas',
                            outcome: 'Excellent! This ensures robust API testing.',
                            experience: 25,
                        },
                        {
                            text: 'Write exhaustive tests covering every possible combination of API parameters and headers',
                            outcome: 'Focus should be on meaningful test scenarios.',
                            experience: -20
                        },
                        {
                            text: 'Focus tests only on success scenarios to ensure the application under test meets requirements',
                            outcome: 'Edge cases must also be tested for comprehensive coverage.',
                            experience: -10
                        },
                        {
                            text: 'The testing approach for API should be manual in nature',
                            outcome: 'APIs should be automatically tested as this improves efficiency in faster testing cycles.',
                            experience: -15
                        }
                    ]
                },
                {
                    id: 13,
                    level: 'Advanced',
                    title: 'Framework Selection Discussion',
                    description: 'A potential client is wanting to ensure use of a particular testing framework. But you believe they could benefit from using something else. How would you handle this?',
                    options: [
                        {
                            text: 'Outlining the advantages of the recommended framework',
                            outcome: 'Perfect! This promotes informed decision-making.',
                            experience: 25,
                        },
                        {
                            text: 'Agree with their requirement and use their framework of choice',
                            outcome: 'Professional recommendations should be made when beneficial.',
                            experience: -10
                        },
                        {
                            text: 'Disregard their choice and implement your own testing framework',
                            outcome: 'Client requirements should be respected and discussed professionally.',
                            experience: -20
                        },
                        {
                            text: 'Refuse to work with the client unless they agree to use your suggestions',
                            outcome: 'Collaboration and professional discussion is essential.',
                            experience: -15
                        }
                    ]
                },
                {
                    id: 14,
                    level: 'Advanced',
                    title: 'Automation Project Candidacy',
                    description: 'What is a poor candidate for an automation project?',
                    options: [
                        {
                            text: 'A client whose budget is limited, and the project\'s scope is small',
                            outcome: 'Excellent! Automation should be cost-effective.',
                            experience: 25,
                        },
                        {
                            text: 'A client with repetitive and time-consuming manual tests',
                            outcome: 'This is actually a good candidate for automation.',
                            experience: -20
                        },
                        {
                            text: 'When implementing automation would be more cost-effective than a manual approach',
                            outcome: 'This would be an ideal candidate for automation.',
                            experience: -15
                        },
                        {
                            text: 'Client whose project features numerous forms and fields',
                            outcome: 'Form testing is often a good candidate for automation.',
                            experience: -10
                        }
                    ]
                },
                {
                    id: 15,
                    level: 'Advanced',
                    title: 'Critical Bug Handling',
                    description: 'A critical bug slipped into production despite automation coverage. How do you handle it?',
                    options: [
                        {
                            text: 'Investigate the root cause to improve the automation for the next run',
                            outcome: 'Perfect! This ensures continuous improvement.',
                            experience: 25,
                        },
                        {
                            text: 'Ignore the error as it\'s not part of the original scope',
                            outcome: 'Critical bugs require immediate attention and investigation.',
                            experience: -20
                        },
                        {
                            text: 'Get the client to roll back all changes without finding the root cause',
                            outcome: 'Understanding the root cause is crucial for prevention.',
                            experience: -15
                        },
                        {
                            text: 'See if the automation team are responsible for the code not being robust',
                            outcome: 'Focus should be on solution and prevention rather than blame.',
                            experience: -10
                        }
                    ]
                }
            ]
}