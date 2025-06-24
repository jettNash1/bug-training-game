export const fullyScriptedScenarios = {
        // Basic Scenarios (IDs 1-5, 16-20)
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Primary objective',
                description: 'What is the main purpose of fully scripted testing?',
                options: [
                    {
                        text: 'To provide complete freedom in testing with minimal structure',
                        outcome: 'This describes exploratory testing and not precision based approach of a fully scripted project',
                        experience: -10
                    },
                    {
                        text: 'To ensure precision and accuracy through structured, detailed test cases',
                        outcome: 'Correct! This ensures precision and accuracy, especially for high-risk applications.',
                        experience: 15,
                    },
                    {
                        text: 'To reduce testing time by using minimal documentation',
                        outcome: 'This is not correct, this approach actually requires more documentation.',
                        experience: -5
                    },
                    {
                        text: 'To create a general framework approach for basic testing',
                        outcome: 'While it creates a framework, it is specifically detailed and comprehensive rather than general.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Test case estimation',
                description: 'How many test cases should be planned per day of testing on average?',
                options: [
                    {
                        text: '10-20 test cases',
                        outcome: 'This is too few to test cases to performed in a days testing activities.',
                        experience: -5
                    },
                    {
                        text: '50-70 test cases',
                        outcome: 'Correct! This is the estimate described within the guidelines.',
                        experience: 15,
                    },
                    {
                        text: '30-40 test cases',
                        outcome: 'While this is a reasonable number, it\'s below the recommended range.',
                        experience: 0
                    },
                    {
                        text: '100-120 test cases',
                        outcome: 'This is too many to execute effectively in one day.',
                        experience: -10
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Writing test cases',
                description: 'What format is used for writing test cases in fully scripted testing?',
                options: [
                    {
                        text: 'Random text format',
                        outcome: 'This is not a format generally used for writing test case scenarios',
                        experience: -5
                    },
                    {
                        text: 'Gherkin language',
                        outcome: 'Correct! This is the correct format used for ease of understanding.',
                        experience: 15,
                    },
                    {
                        text: 'Basic bullet point structure',
                        outcome: 'While structured lists are used, Gherkin is the required format.',
                        experience: 0
                    },
                    {
                        text: 'Code snippets only',
                        outcome: 'Code snippets aren\'t the primary format for test cases',
                        experience: -10
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Priority Levels',
                description: 'What are the priority levels used in fully scripted testing?',
                options: [
                    {
                        text: 'Critical, Major, Minor',
                        outcome: 'These are not the levels described in the guidelines.',
                        experience: -5
                    },
                    {
                        text: 'High, Medium, Low',
                        outcome: 'Correct! These are the levels described in the fully scripted approach guidelines.',
                        experience: 15,
                    },
                    {
                        text: 'Urgent, Normal, Low',
                        outcome: 'While this describes three levels including low, the other terms aren\'t correct',
                        experience: 0
                    },
                    {
                        text: '1, 2, 3, 4, 5',
                        outcome: 'Numeric priorities aren\'t used in this system',
                        experience: -10
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Smoke Tests',
                description: 'Where should smoke tests be placed in the test script?',
                options: [
                    {
                        text: 'At the end of all the test suites',
                        outcome: 'This isn\'t the specified location.',
                        experience: -5
                    },
                    {
                        text: 'In the topmost suite of the primary functional tests tab',
                        outcome: 'Correct! This is where the guidelines state the smoke tests should be placed.',
                        experience: 15,
                    },
                    {
                        text: 'In a separate document',
                        outcome: 'They should be in the main test script for ease of use and project metrics',
                        experience: -10
                    },
                    {
                        text: 'Within each test suite in the test script',
                        outcome: 'While smoke tests are important, they should be in the topmost suite',
                        experience: 0
                    }
                ]
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Environment Metrics',
                description: 'What is the purpose of removing dashes \'-\' from the Result and Date column cells of greyed out environment sections?',
                options: [
                    {
                        text: 'To calculate the number of tests remaining or not started',
                        outcome: 'Correct! While greying out does indicate sections not in scope, removing dashes serves as to calculate the number of tests remaining or not started.',
                        experience: 15,
                    },
                    {
                        text: 'To indicate that these sections are no longer included in the test scope',
                        outcome: 'While greying out does indicate sections not in scope, removing dashes serves as to calculate the number of tests remaining or not started.',
                        experience: -5
                    },
                    {
                        text: 'To improve the visual appearance of the test script',
                        outcome: 'While it might improve visual appearance, its purpose is to calculate the number of tests remaining or not started.',
                        experience: -10
                    },
                    {
                        text: 'To prevent formula errors in the spreadsheet',
                        outcome: 'Removing the dashes calculates the number of tests remaining or not started.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Change Impact',
                description: 'What impact on a script may late changes made to the software during the scheduled test phase have?',
                options: [
                    {
                        text: 'It improves test coverage by adding new test cases',
                        outcome: 'Late changes typically complicate testing rather than improving coverage.',
                        experience: -5
                    },
                    {
                        text: 'It helps identify previously undiscovered defects',
                        outcome: 'New changes might introduce new defects, although any previous defects on critical functionality should be previously covered by initial test cases.',
                        experience: -10
                    },
                    {
                        text: 'It can lead to outdated and redundant test cases',
                        outcome: 'Correct! These decisions can impact on test execution by having outdated and redundant test cases that were developed against original designs',
                        experience: 15,
                    },
                    {
                        text: 'It simplifies the test execution process',
                        outcome: 'Late changes typically complicate the test execution process.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Compatibility Testing',
                description: 'What is recommended for compatibility testing in a fully scripted approach?',
                options: [
                    {
                        text: 'To run all test cases on all environments',
                        outcome: 'This would prove potentially impossible and extremely time consuming.',
                        experience: -5
                    },
                    {
                        text: 'To skip compatibility testing and focusing only on primary environments',
                        outcome: 'Compatibility testing is a fundamental part of the fully scripted approach.', 
                        experience: -10
                    },
                    {
                        text: 'To run pre-defined smoke tests on a range of environments',
                        outcome: 'Correct! Smoke tests should be performed on a wide range of environments across desktop, tablet and mobile platforms unless a certain environment type is out of scope.',
                        experience: 15,
                    },
                    {
                        text: 'To create unique test cases for each device type',
                        outcome: 'The same smoke tests should be performed across different environments rather than creating unique test cases for each device as this could result in incomplete coverage.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Fully Scripted Scoping',
                description: 'What is the primary context in which fully scripted testing is recommended?',
                options: [
                    {
                        text: 'It is recommended larger scale or complex projects with specific scope requirements',
                        outcome: 'Correct! fully scripted testing is for larger scale or complex projects that need specific test scenarios.',
                        experience: 15,
                    },
                    {
                        text: 'It is recommended for simple projects with minimal requirements',
                        outcome: 'Fully scripted testing is for larger scale or complex projects that need specific test scenarios.',
                        experience: -10
                    },
                    {
                        text: 'It is recommended for projects where exploratory testing is the main focus.',
                        outcome: 'Fully scripted testing may limit time for exploratory testing because of its in-depth scenario based tests.',
                        experience: -5
                    },
                    {
                        text: 'It is recommended for mobile application testing only.',
                        outcome: 'Fully scripted testing is applicable across different platforms including desktop, tablet, and mobile.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Fully Scripted Testing Characteristics',
                description: 'Which of the following is a characteristic required of testers who should execute fully scripted tests?',
                options: [
                    {
                        text: 'The ability to follow detailed test steps with minimal deviation',
                        outcome: 'Correct! Testers need to have the qualities and ability to follow a sequence of detailed test steps with minimal deviation from the script.',
                        experience: 15,
                    },
                    {
                        text: 'The ability to identify software architecture flaws',
                        outcome: 'Architecture flaws are defined as technical in nature and are generally not part of a manual test script.',
                        experience: -10
                    },
                    {
                        text: 'Advanced coding skills in multiple programming languages',
                        outcome: 'Coding skills are not a requirement for testers executing fully scripted tests, as scenarios follow functional behaviour.',
                        experience: -5
                    },
                    {
                        text: 'Experience in designing user interfaces',
                        outcome: 'User Interface design experience is not required for testers as scenarios follow functional behaviour.',
                        experience: 0
                    }
                ]
            }
        ],

        // Intermediate Scenarios (IDs 6-10)
        intermediate: [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Script differences',
                description: 'What is the main difference between a standard test script and a fully scripted test?',
                options: [
                    {
                        text: 'The number of test cases is generally larger in a fully scripted test',
                        outcome: 'Whilst this is generally true, it isn\'t the main differentiator.',
                        experience: -5
                    },
                    {
                        text: 'The addition of \'Test Steps\' and \'Expected Behaviour\' columns in primary Environments',
                        outcome: 'Correct! This is a key difference and these columns are not included in a standard test script',
                        experience: 20, 
                    },
                    {
                        text: 'The testing environments used is only reported in one test script',
                        outcome: 'The test environments that have been covered should always be stated on both types of script',
                        experience: -10
                    },
                    {
                        text: 'The level of detail in each test case differs between the two types of script',
                        outcome: 'While this is related, \'Test Steps\' and \'Expected Behaviour\' specific columns included in a full test script are the main difference',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Test case priority',
                description: 'How should test cases be prioritised in fully scripted testing?',
                options: [
                    {
                        text: 'These should be based on tester preference and experience',
                        outcome: 'This would not be a true test of priority.',
                        experience: -10
                    },
                    {
                        text: 'These should be based on impact, frequency of use, and potential for critical defects',
                        outcome: 'Correct! This is the correct criteria used when deciding priority.',
                        experience: 20,
                    },
                    {
                        text: 'Priority of test cases should be based on system development timeline',
                        outcome: 'This Is not a main factor when taking priority into consideration',
                        experience: -5
                    },
                    {
                        text: 'These should be based on complexity',
                        outcome: 'While complexity is considered, it\'s not the only factor',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Environment Scoping',
                description: 'What should be done with non-scoped environments in the script?',
                options: [
                    {
                        text: 'These should be deleted out of the script completely',
                        outcome: 'This approach can affect metrics in a detrimental manner',
                        experience: -5
                    },
                    {
                        text: 'Grey them out and remove dashes from results/date columns',
                        outcome: 'Correct! This is the correct approach to ensure these environments are not included in the metrics.',
                        experience: 20,
                    },
                    {
                        text: 'Leave all out of scope environments unchanged',
                        outcome: 'They should be modified, or they will affect the overall metrics',
                        experience: -10
                    },
                    {
                        text: 'Hide the non-scoped environment from view within the script',
                        outcome: 'While removing them from view is good, greying out is the specific requirement',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Compatibility testing',
                description: 'What is the recommended approach for compatibility testing in fully scripted testing?',
                options: [
                    {
                        text: 'Leave it as a low priority feature to be tested if there is time',
                        outcome: 'Compatibility testing is required and leaving it out entirely may result in missed issues.',
                        experience: -15
                    },
                    {
                        text: 'Run it in parallel with primary environment testing',
                        outcome: 'Correct! This is an approach that can be taken and can maximise time management.',
                        experience: 20,
                    },
                    {
                        text: 'Do it only after all other testing is completed',
                        outcome: 'This can be an ineffective time management approach and leave environment testing short',
                        experience: -10
                    },
                    {
                        text: 'Test one environment at a time after primary environments have fully tested',
                        outcome: 'While this can work, parallel testing is recommended when possible',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Document references',
                description: 'How should document references be handled in test cases?',
                options: [
                    {
                        text: 'They are not needed as functionality can generally be solved by the tester',
                        outcome: 'References are important to assist with testing activities.',
                        experience: -10
                    },
                    {
                        text: 'Include references that aid in creation and execution of tests',
                        outcome: 'Correct! This is the correct approach to help testers with execution of test cases.',
                        experience: 20,
                    },
                    {
                        text: 'Only include technical references within the documentation',
                        outcome: 'All relevant documentation references should be included, not just technical references',
                        experience: -5
                    },
                    {
                        text: 'Add references after testing as a certain amount of exploratory testing helps find issues',
                        outcome: 'While references can be added later, they should ideally be included during creation',
                        experience: 0
                    }
                ]
            }
        ],

        // Advanced Scenarios (IDs 11-15)
        advanced: [
            {
                id: 11,
                level: 'Advanced',
                title: 'Test execution planning',
                description: 'What are the key considerations when planning test execution timing?',
                options: [
                    {
                        text: 'Consider the number of test cases included within the script',
                        outcome: 'Other factors have to be considered including complexity and environment coverage.',
                        experience: -5
                    },
                    {
                        text: 'Consider allocated days, test case complexity, and environment coverage',
                        outcome: 'Correct! These are all important factors when considering test execution planning',
                        experience: 25,
                    },
                    {
                        text: 'Environment coverage should be solely focused on as this determines resources required',
                        outcome: 'This is one factor. However, others need to be taken into consideration including test case complexity',
                        experience: -10
                    },
                    {
                        text: 'Consider the primary environment testing time',
                        outcome: 'While important, other factors must be considered including environment coverage',
                        experience: -15
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Requirements changes',
                description: 'How should changes to requirements during testing be handled?',
                options: [
                    {
                        text: 'Continue with the testing initially set out during planning',
                        outcome: 'Changes to requirements need to be addressed and factored into testing.',
                        experience: -10
                    },
                    {
                        text: 'Update test cases and document impact on timeline and coverage',
                        outcome: 'Correct! This addresses both technical and project management needs.',
                        experience: 25,
                    },
                    {
                        text: 'Testing should be started again to compensate for the new requirements',
                        outcome: 'This is inefficient as test cases need to reflect ongoing changes',
                        experience: -5
                    },
                    {
                        text: 'Update the affected test cases only and continue with testing',
                        outcome: 'While this is needed, impact assessment and timeline updates are also required',
                        experience: 0
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Edge cases',
                description: 'What is the recommended approach for handling edge cases in fully scripted testing?',
                options: [
                    {
                        text: 'All edge cases should be included in the test script for test execution',
                        outcome: 'Time constraints would make this impossible.',
                        experience: -5
                    },
                    {
                        text: 'Balance them against core objectives based on risk and time constraints',
                        outcome: 'Correct! This is a correct risk-based approach.',
                        experience: 25,
                    },
                    {
                        text: 'Leave edge case inclusion until everything else has been covered completely',
                        outcome: 'This could miss important test scenarios due to time management',
                        experience: -10
                    },
                    {
                        text: 'Test them only in primary environments',
                        outcome: 'While this is better than nothing, a balanced approach is required',
                        experience: 0
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'User journey',
                description: 'How should user journey testing be integrated with functional testing?',
                options: [
                    {
                        text: 'These should be kept completely separate',
                        outcome: 'They should be integrated with functional tests as it forms parity during testing activites.',
                        experience: -5
                    },
                    {
                        text: 'Create user journeys that align with functional test suites while maintaining distinct objectives',
                        outcome: 'Correct! This is the correct approach and creates distinct parity with the associated test suites.',
                        experience: 25,
                    },
                    {
                        text: 'Functional tests can be replaced with user journeys',
                        outcome: 'Both scripting approaches are essential to testing activities',
                        experience: -10
                    },
                    {
                        text: 'Combine them into single test cases',
                        outcome: 'While they should be aligned, they serve different purposes',
                        experience: 0
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Cross platform testing',
                description: 'What approach should be taken when dealing with cross-platform testing in fully scripted testing?',
                options: [
                    {
                        text: 'Use identical test cases for all platforms for consistency',
                        outcome: 'Platform differences need to be considered and documented as some platforms have specific features.',
                        experience: -5
                    },
                    {
                        text: 'Adapt test cases for platform-specific features while maintaining core test objectives',
                        outcome: 'Correct! This is the recommended approach and maintains core coverage.',
                        experience: 25,
                    },
                    {
                        text: 'Create completely separate test suites for each platform',
                        outcome: 'This is inefficient, and test cases should be adapted to suit different platforms',
                        experience: -10
                    },
                    {
                        text: 'Test platform-specific features only as these areas require priority testing',
                        outcome: 'While platform-specific features need attention, core functionality must also be tested',
                        experience: 0
                    }
                ]
            }
        ]
}