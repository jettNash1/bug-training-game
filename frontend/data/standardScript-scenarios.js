export const standardScriptScenarios = {
    // Basic Scenarios (IDs 1-10, now includes 5 additional scenarios)
    basic: [
        {
            id: 1,
            level: 'Basic',
            title: 'Objective',
            description: 'What is a standard test script?',
            options: [
                    {
                        text: 'A piece of automated code that runs tests without human intervention',
                        outcome: 'While scripts can be automated, this answer misses the fundamental purpose of documenting and structuring test cases.',
                        experience: 0
                    },
                    {
                        text: 'A documented set of instructions and conditions that outline how to execute specific test cases within a software testing process',
                        outcome: 'Correct! This is the exact definition of a standard test script.',
                        experience: 15,
                    },
                    {
                        text: 'A set of programming commands used to create software',
                        outcome: 'This describes programming code, not test scripts.',
                        experience: -10
                    },
                    {
                        text: 'A collection of test cases with a loose structure focused on user journeys',
                        outcome: 'This contradicts the organised nature of standard test scripts.',
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Script Format',
                description: 'Which format is used for writing test cases in standard test scripts?',
                options: [
                    {
                        text: 'Python code',
                        outcome: 'Python is a programming language, not a test case format.',
                        experience: -5
                    },
                    {
                        text: 'SQL queries',
                        outcome: 'SQL is for database queries, not test case writing.',
                        experience: -10
                    },
                    {
                        text: 'Gherkin language',
                        outcome: 'Correct! Gherkin language is used for writing test cases.',
                        experience: 15,
                    },
                    {
                        text: 'JSON format',
                        outcome: 'While JSON is a structured format, it\'s not the specified format for standard script test cases.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Test Case Planning',
                description: 'How many test cases should be planned per day of testing on average?',
                options: [
                    {
                        text: '25-50 test cases',
                        outcome: 'This is well below the recommended amount',
                        experience: -10
                    },
                    {
                        text: '50-75 test cases',
                        outcome: 'While close to the correct range, this is slightly below the recommended amount.',
                        experience: 0
                    },
                    {
                        text: '75-100 test cases',
                        outcome: 'Correct! It is specifically recommended that 75-100 test cases is the average per day of testing.',
                        experience: 15,
                    },
                    {
                        text: '100-125 test cases',
                        outcome: 'This exceeds the recommended amount',
                        experience: -5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Executing The Script',
                description: 'What is the first step in executing a standard test script?',
                options: [
                    {
                        text: 'Start with writing new test cases to be included in the script',
                        outcome: 'Test cases should already be written during the planning phase.',
                        experience: -10
                    },
                    {
                        text: 'Begin testing immediately to complete the most coverage within the project time frame set',
                        outcome: 'While testing needs to be done, reviews must come first.',
                        experience: 0
                    },
                    {
                        text: 'Review the Operational Project Details and Statement of Work',
                        outcome: 'Correct! The is the first step before writing the test cases to ascertain any project specifics',
                        experience: 15,
                    },
                    {
                        text: 'Create a new test environment',
                        outcome: 'This is not part of the execution process',
                        experience: -5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Submission Data',
                description: 'What is the primary purpose of the "Submissions Data" tab in the test script?',
                options: [
                    {
                        text: 'To record test case results, focus time allocation and tester details',
                        outcome: 'While it does record data, it\'s specifically for submissions, not general test results.',
                        experience: 0
                    },
                    {
                        text: 'To store all test environment details used for the project',
                        outcome: 'Environment details are stored elsewhere in the test script.',
                        experience: -5
                    },
                    {
                        text: 'To maintain a record of submitted data for traceability',
                        outcome: 'Correct! The tab is used for recording submitted data, including user credentials for traceability',
                        experience: 15,
                    },
                    {
                        text: 'To track bug reports raised against the system under test',
                        outcome: 'Bug tracking is handled in a separate system',
                        experience: -10
                    }
                ]
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Test Script Execution',
                description: 'What should be done first when executing a standard test script?',
                options: [
                    {
                        text: 'Run the set of smoke tests',
                        outcome: 'Correct! Running the smoke tests first should identify defects in functionality critical to the application under test.',
                        experience: 15,
                    },
                    {
                        text: 'Run compatibility tests',
                        outcome: 'Compatibility testing should come after or, if possible, in conjunction with primary environment coverage.',
                        experience: -5
                    },
                    {
                        text: 'Focus areas should be extremely detailed and specific, breaking down every possible user action',
                        outcome: 'This would make test execution more like scripted testing in being more specific.',
                        experience: -10
                    },
                    {
                        text: 'Begin with the user journeys',
                        outcome: 'User journeys are executed after the functional test cases have been completed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Standard Scripting Advantages',
                description: 'What is a key advantage of using standard test scripts according to the guide?',
                options: [
                    {
                        text: 'They require less documentation',
                        outcome: 'Standard scripts actually require more documentation, not less, as they need detailed test cases and steps',
                        experience: -5
                    },
                    {
                        text: 'They eliminate the need for client involvement',
                        outcome: 'If the client prefers to be closely involved in the testing process, standard test scripts provide a clear structure for review.',
                        experience: -10
                    },
                    {
                        text: 'They ensure consistency and reproducibility across the testing team',
                        outcome: 'Correct! Standard scripts ensure consistent execution of tests across the testing team, and over time. This is crucial for tracking progress.',
                        experience: 15,
                    },
                    {
                        text: 'They reduce the time required for test planning',
                        outcome: 'Standard scripts require significant planning time, as evidenced by the detailed test planning process.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Standard Scripting Approach',
                description: 'What is recommended when creating test cases for a standard script?',
                options: [
                    {
                        text: 'Jump between different areas of the page to ensure comprehensive coverage',
                        outcome: 'This approach should be avoided in order to create a logical flow when following the script.',
                        experience: -5
                    },
                    {
                        text: 'Focus only on positive test cases to improve execution speed',
                        outcome: 'both positive tests (expected behaviour) and negative tests (where potential issues or errors may lie for invalid inputs) should be considered for coverage.',
                        experience: -10
                    },
                    {
                        text: 'Follow a logical process to maintain clarity for the tester',
                        outcome: 'Correct! When writing test cases, a logical process should be observed. Avoid jumping around the page to maintain clarity for the tester.',
                        experience: 15,
                    },
                    {
                        text: 'Create test cases with minimal detail to allow for tester interpretation',
                        outcome: 'Emphasis should be on detailed documentation, not minimal detail that requires interpretation.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Test Case Accuracy',
                description: 'What should be done when there are doubts about the accuracy of a test case?',
                options: [
                    {
                        text: 'Mark the test case and add comments to highlight uncertainties',
                        outcome: 'Correct! If there are doubts around any test cases, comments can be added to the cell to highlight this and confirmed by either the author or the client.',
                        experience: 15,
                    },
                    {
                        text: 'Delete the test case from the script and continue with other test cases',
                        outcome: 'Deleting the test case can cause missed defects and reduce test coverage of the application under test',
                        experience: -10
                    },
                    {
                        text: 'Run the test anyway and record all outcomes.',
                        outcome: 'All uncertainties must be addressed as to avoid any lost testing time on areas not in scope.',
                        experience: -5
                    },
                    {
                        text: 'Always mark such cases as "failed" to be safe.',
                        outcome: 'This would be inaccurate if there is uncertainty about requirements rather than an actual failure.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Standard Script Allocation',
                description: 'What factors should be considered when determining whether to use a standard test script approach?',
                options: [
                    {
                        text: 'The complexity of the software and the client\'s preference for involvement',
                        outcome: 'Correct! If the software has critical components that must function to a high standard and If the client prefers to be closely involved in the testing process, then this is the correct approach.',
                        experience: 15,
                    },
                    {
                        text: 'Project budget and timeline should be factors when taking a standard scripting process into consideration',
                        outcome: 'While budget and timeline are factors, they aren\'t the only factors to be taken into consideration. Critical components within the system should also be considered.',
                        experience: -10
                    },
                    {
                        text: 'Whether the team prefers exploratory or scripted testing',
                        outcome: 'Team preferences should not determine the testing approach and what is best for the system under test should always be prioritised.',
                        experience: -5
                    },
                    {
                        text: 'The programming language used to develop the software should be taken into consideration',
                        outcome: 'Programming language used for development shouldn\'t be a factor for manual testing.',
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
            title: 'Test Case Priority',
            description: 'Which of the following is a key factor in determining test case priority?',
            options: [
                    {
                        text: 'The alphabetical order of the test cases within the script',
                        outcome: 'Alphabetical order is not a factor in priority.',
                        experience: -5
                    },
                    {
                        text: 'The length of time it takes to execute the specific test ',
                        outcome: 'While execution time might be considered, it\'s not a primary factor.',
                        experience: 0
                    },
                    {
                        text: 'The impact of the feature being tested and frequency of use',
                        outcome: 'Correct! These are key factors in determining priority of test cases',
                        experience: 20,     
                    },
                    {
                        text: 'The preference and experience of the individual tester',
                        outcome: 'Individual preferences should not determine priority as this may miss critical test areas due to time management',
                        experience: -10
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Out Of Scope Environments',
                description: 'What should be done with environment sections that are not in scope?',
                options: [
                    {
                        text: 'Out of scope environments should be deleted',
                        outcome: 'Deleting sections could cause problems if they\'re needed later.',
                        experience: -10
                    },
                    {
                        text: 'Out of scope environments should be left unchanged',
                        outcome: 'Leaving them unchanged could cause confusion on what needs to be tested.',
                        experience: -5
                    },
                    {
                        text: 'The columns or rows for out of scope environments should be hidden',
                        outcome: 'While this would hide unused sections, it\'s not the recommended approach as this would still affect metrics',
                        experience: 0
                    },
                    {
                        text: 'These sections should be greyed out and the dashes removed from the result and date columns',
                        outcome: 'Correct! This is the recommended approach for environments that are not in scope for the project',
                        experience: 20,
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Primary Test Tab',
                description: 'How should test suites be organised in the primary functional tests tab?',
                options: [
                    {
                        text: 'The test suites should be organised alphabetically by suite name',
                        outcome: 'While this would be organised, it doesn\'t consider importance',
                        experience: 0
                    },
                    {
                        text: 'This should be organised based on tester preference',
                        outcome: 'This type of ordering could make the script difficult to follow.',
                        experience: -10
                    },
                    {
                        text: 'By complexity and risk factors using high, medium, and low priorities',
                        outcome: 'Correct! Suites should be prioritised by complexity and risk factors',
                        experience: 20,
                    },
                    {
                        text: 'These should be organised by the date they were created',
                        outcome: 'Creation date is not a factor in organisation and doesn\'t take into consideration priority.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Document References',
                description: 'What should be included in the document reference for a test case?',
                options: [
                    {
                        text: 'Only the test case ID should be included in the test case reference',
                        outcome: 'While ID is important, more information is required, including documentation references that can help in executing the test.',
                        experience: 0
                    },
                    {
                        text: 'Information that aided in creating the test case and which will help during execution',
                        outcome: 'Correct! References should include anything that aided creation and that will help with execution of the test case.',
                        experience: 20,
                    },
                    {
                        text: 'The tester\'s name should be included as reference',
                        outcome: 'Tester\'s name is not part of the documentation reference',
                        experience: -5
                    },
                    {
                        text: 'The current date should be included as reference',
                        outcome: 'The date is not part of the documentation reference.',
                        experience: -10
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Smoke Tests',
                description: 'When should smoke tests be executed during standard script testing?',
                options: [
                    {
                        text: 'Smoke tests should be executed at the end of all other testing',
                        outcome: 'This would be too late to catch any potential major issues.',
                        experience: -10
                    },
                    {
                        text: 'These should be performed first, before other test cases',
                        outcome: 'Correct! Smoke tests should be run first as these are devised from the highest priority test cases.',
                        experience: 20,
                    },
                    {
                        text: 'These should all be run, only when issues are found',
                        outcome: 'While issues might trigger retesting, smoke tests come first.',
                        experience: 0
                    },
                    {
                        text: 'These should be run after compatibility testing',
                        outcome: 'Compatibility testing should come after primary testing.',
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
            title: 'Multiple Primary Environments',
            description: 'What is the correct approach when dealing with multiple primary environments in a standard test script?',
            options: [
                    {
                        text: 'Create entirely new test cases for each environment',
                        outcome: 'While some new cases might be needed, copying and modifying is more efficient',
                        experience: 0
                    },
                    {
                        text: 'Copy and modify test suites as needed, adjusting for environment-specific differences',
                        outcome: 'Correct! Test suites can be copied and modified for different environments',
                        experience: 25,
                    },
                    {
                        text: 'Perform test activities only on the highest priority environment',
                        outcome: 'All supported primary environments require testing',
                        experience: -10
                    },
                    {
                        text: 'Select which tests to run on each environment according to tester preference',
                        outcome: 'A random selection would not ensure comprehensive coverage',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Compatibility Testing',
                description: 'How should compatibility testing be integrated with primary environment testing?',
                options: [
                    {
                        text: 'Primary testing should always be completed first and foremost',
                        outcome: 'While primary testing is important, parallel testing is possible.',
                        experience: 0
                    },
                    {
                        text: 'Only do compatibility testing if time constraints permit it',
                        outcome: 'Compatibility testing is required, and is not optional unless stated by the client.',
                        experience: -5
                    },
                    {
                        text: 'This can be started alongside primary testing in parallel, depending on project scheduling',
                        outcome: 'Correct! Compatibility testing can be done in parallel with primary environment testing',
                        experience: 25,
                    },
                    {
                        text: 'Compatibility testing must be done before primary testing',
                        outcome: 'This is not the correct approach as issues could be missed early on in the testing process',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Requirements Updates',
                description: 'What is the appropriate way to handle changes in requirements during the testing phase?',
                options: [
                    {
                        text: 'Continue with original test cases and test the new requirements if time constraints permit',
                        outcome: 'Leaving requirements changes would lead to invalid test results and potentially missed issues.',
                        experience: -5
                    },
                    {
                        text: 'Mark test cases where expected behaviour is in question, add comments for clarification, and remove comments once clarified',
                        outcome: 'Correct! This is the process for handling requirement changes.',
                        experience: 25,
                    },
                    {
                        text: 'Pause testing until all requirements are finalised with client feedback',
                        outcome: 'While pausing might seem logical, it\'s not the recommended approach and is not good time management.',
                        experience: 0
                    },
                    {
                        text: 'Delete the affected test cases to be updated when requirements are finalised.',
                        outcome: 'Deleting cases would lose valuable information already sourced.',
                        experience: -10
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'User Journeys',
                description: 'How should user journeys be structured in comparison to functional tests?',
                options: [
                    {
                        text: 'User journeys must always use Gherkin format',
                        outcome: 'While Gherkin can be used, it\'s not required for user journeys',
                        experience: 0
                    },
                    {
                        text: 'These don\'t require Gherkin format but should contain logical step processes',
                        outcome: 'Correct! User journeys don\'t require Gherkin but should be stated in logical steps.',
                        experience: 25,
                    },
                    {
                        text: 'These should be written in technical programming language',
                        outcome: 'Technical programming language is not appropriate for user journeys as these need to be in logical steps for ease of understanding',
                        experience: -10
                    },
                    {
                        text: 'These must be constructed in single-line instructions only',
                        outcome: 'Single-line instructions would be insufficient and may miss some critical information',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Test Case Structure',
                description: 'What factors should influence the structure of test case creation in the standard script?',
                options: [
                    {
                        text: 'The client\'s stated requirements should only influence the structure of the test cases',
                        outcome: 'While client requirements are important, other factors must be considered like risk assessment.',
                        experience: 0
                    },
                    {
                        text: 'A combination of target audience, project timing, risk assessment, and client requirements',
                        outcome: 'Correct! These are all factors for important considerations.',
                        experience: 25,
                    },
                    {
                        text: 'The tester\'s previous experience with similar projects should be the determining factor',
                        outcome: 'While experience is valuable, it shouldn\'t solely determine structure.',
                        experience: -5
                    },
                    {
                        text: 'The number of available testers required to work on the project',
                        outcome: 'Tester availability doesn\'t determine test case structure.',
                        experience: -10
                    }
                ]
            }
        ]
}