export const emailTestingScenarios = {
        // Basic Scenarios (IDs 1-5, 75 XP total)
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Primary Objective',
                description: 'What is the primary purpose of email testing?',
                options: [
                    {
                        text: 'To increase email open rates with subscribers',
                        outcome: 'This relates to marketing metrics, not email testing',
                        experience: -10
                    },
                    {
                        text: 'To verify email functionality and appearance',
                        outcome: 'Correct! This is the purpose of email testing.',
                        experience: 15
                    },
                    {
                        text: 'To check if emails reach spam folders',
                        outcome: 'While spam prevention is a benefit, it\'s not the primary purpose.',
                        experience: 0
                    },
                    {
                        text: 'To test different subject lines for marketing effectiveness',
                        outcome: 'The subject line is just one small component of an email.',
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Email Clients',
                description: 'Which email clients are typically included in testing scope?',
                options: [
                    {
                        text: 'Gmail and Outlook should be the main focus',
                        outcome: 'While these are important clients, the scope should be broader.',
                        experience: 0
                    },
                    {
                        text: 'Gmail, Outlook, Yahoo Mail, and Apple Mail',
                        outcome: 'Correct! These are the main email clients, however, stakeholders may request additional email clients.',
                        experience: 15
                    },
                    {
                        text: 'All possible email clients globally should be tested',
                        outcome: 'Testing all global email clients would be impractical and the main clients with any specific requests from the client should be tested.',
                        experience: -5
                    },
                    {
                        text: 'Mobile only email clients on specific devices',
                        outcome: 'Testing should not be limited to mobile clients unless specifically requested by the client.',
                        experience: -10
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'UTM Understanding',
                description: 'What does UTM stand for in email testing?',
                options: [
                    {
                        text: 'Universal Testing Module',
                        outcome: 'While it is a module for testing, "Universal" is incorrect',
                        experience: 0
                    },
                    {
                        text: 'Unified Tracking Method',
                        outcome: 'This is a made-up term.',
                        experience: -10
                    },
                    {
                        text: 'Urchin Trace Module',
                        outcome: 'This is a made-up term.',
                        experience: -5
                    },
                    {
                        text: 'Urchin Tracking Module',
                        outcome: 'Correct! This is the correct statement and it tracks the performance of a marketing campaign',
                        experience: 15
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Dark Mode',
                description: 'Where or when should you check dark mode rendering?',
                options: [
                    {
                        text: 'This should be carried out on mobile devices',
                        outcome: 'Testing only mobile could miss desktop related issues.',
                        experience: -10
                    },
                    {
                        text: 'This should be carried out on desktop clients',
                        outcome: 'Testing only desktop could miss mobile related issues.',
                        experience: -5
                    },
                    {
                        text: 'Across all supported email clients and envrionments',
                        outcome: 'Correct! Dark mode should be tested across all supported platforms',
                        experience: 15
                    },
                    {
                        text: 'This should be tested only when specifically requested',
                        outcome: 'While client requests matter, dark mode testing is a standard practice',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Email Testing Process',
                description: 'What is the first step in email testing?',
                options: [
                    {
                        text: 'Check all links within the email can be correctly actioned',
                        outcome: 'Link checking should come later in the process after documentation has been analysed.',
                        experience: -5
                    },
                    {
                        text: 'Familiarise yourself with project documentation',
                        outcome: 'Correct! This should be the first step in the testing process as there could be areas stated as out of scope.',
                        experience: 15
                    },
                    {
                        text: 'Make sure the test environments are set up for testing activities',
                        outcome: 'While important, this comes after reviewing documentation',
                        experience: 0
                    },
                    {
                        text: 'Create test accounts for testing different outcomes to test scenarios',
                        outcome: 'This would not come before reviewing documentation as certain areas could be out of scope',
                        experience: -10
                    }
                ]
            }
        ],

        // Intermediate Scenarios (IDs 6-10, 100 XP total, 20 XP each)
        intermediate: [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Bug Reporting',
                description: 'What should you do when you discover a bug in one environment?',
                options: [
                    {
                        text: 'Immediately report it against the specific environment',
                        outcome: 'While reporting is important, checking other environments for the issue first is more efficient.',
                        experience: 0
                    },
                    {
                        text: 'Check if the issue exists across other environments',
                        outcome: 'Correct! Other environments must be checked to determine if the issue is global.',
                        experience: 15
                    },
                    {
                        text: 'Only report it if it affects functionality of any features relating to the email',
                        outcome: 'All issues should be reported regardless of type',
                        experience: -10
                    },
                    {
                        text: 'Wait for client confirmation on how to proceed',
                        outcome: 'Client confirmation isn\'t needed to report bugs',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Test Script Reporting',
                description: 'How should test results be marked in the test script?',
                options: [
                    {
                        text: 'Only pass or fail for the specific tests',
                        outcome: 'While pass or fail is included, more detailed options should be available and stated.',
                        experience: 0
                    },
                    {
                        text: 'Using the Result Key options against each test',
                        outcome: 'Correct! This is the recommended way of reporting issues.',
                        experience: 15
                    },
                    {
                        text: 'With detailed written descriptions',
                        outcome: 'Written descriptions supplement but don\'t replace the Result Key',
                        experience: -5
                    },
                    {
                        text: 'Only marking critical issues',
                        outcome: 'All issues should be marked, not just critical ones',
                        experience: -10
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Reviewing Images',
                description: 'What should be checked regarding email images?',
                options: [
                    {
                        text: 'Image quality and resolution should be checked',
                        outcome: 'While quality is important, other aspects must also be checked including alignment and image placement',
                        experience: 0
                    },
                    {
                        text: 'Image placement, alignment, quality, label, and display in both light and dark modes',
                        outcome: 'Correct! These are all necessary checks for images within emails.',
                        experience: 15
                    },
                    {
                        text: 'Whether images load and display correctly',
                        outcome: 'Other aspects of image testing are also required such placement',
                        experience: -10
                    },
                    {
                        text: 'Image size and format should be checked',
                        outcome: 'Size and format are aspects that should be checked. However, other areas are required for full test coverage',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Company Details Signatures',
                description: 'How should company details be verified in emails?',
                options: [
                    {
                        text: 'These details can be checked against Wikipedia',
                        outcome: 'Wikipedia isn\'t a reliable source for verification.',
                        experience: -10
                    },
                    {
                        text: 'Details can be verified against the client\'s company website',
                        outcome: 'While the website can help, target market specificity is key which can be obtained through client documentation',
                        experience: 0
                    },
                    {
                        text: 'Match details to the target market (e.g., UK address for UK market)',
                        outcome: 'Correct! Details should be checked against target markets',
                        experience: 15
                    },
                    {
                        text: 'Use company information as related to any project correspondence',
                        outcome: 'Company correspondence information may not be accurate as solutions providers could be working on behalf of a client',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Project Metrics',
                description: 'What should be included in the project metrics after testing?',
                options: [
                    {
                        text: 'The number of bugs raised on the project',
                        outcome: 'Bug count alone is insufficient, and other metrics should be included such as project progress and ticket resolutions.',
                        experience: -5
                    },
                    {
                        text: 'Session totals, ticket resolution totals, and project burndown',
                        outcome: 'Correct! All these metrics should be included unless otherwise specified.',
                        experience: 15
                    },
                    {
                        text: 'Test completion percentage should be stated in the metrics report',
                        outcome: 'While completion is tracked, more metrics are required including environment matrix and ticket status',
                        experience: 0
                    },
                    {
                        text: 'All critical issues should be stated in the metrics report',
                        outcome: 'All issues, not just critical ones should be tracked',
                        experience: -10
                    }
                ]
            }
        ],
        
        // Advanced Scenarios (IDs 11-15, 125 XP total, 25 XP each)
        advanced: [
            {
                id: 11,
                level: 'Advanced',
                title: 'Resource Calculator',
                description: 'How should the resource calculator be used in email testing?',
                options: [
                    {
                        text: 'This should be used for estimating total project time',
                        outcome: 'While it helps with timing, it\'s more comprehensive and includes more adjustable testing activities.',
                        experience: 0
                    },
                    {
                        text: 'To calculate exact testing hours needed to complete a project',
                        outcome: 'This provides guidance rather than exact calculations relating to test hours.',
                        experience: -5
                    },
                    {
                        text: 'For guided timeframe planning with adjustable fields for setup, copy check, link check, rendering check, and reporting',
                        outcome: 'Correct! This is used for multiple adjustable testing activities',
                        experience: 15
                    },
                    {
                        text: 'This is used for billing purposes in relation to time frame and resources',
                        outcome: 'This is used for planning testing activities and not billing',
                        experience: -10
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Unsubscribe Links',
                description: 'What is the correct approach when handling unsubscribe links during testing?',
                options: [
                    {
                        text: 'Report all non-functioning unsubscribe links as critical bugs',
                        outcome: 'These may not necessarily be bugs in the test environment and documentation should be referenced for scope.',
                        experience: -5
                    },
                    {
                        text: 'Don\'t report unsubscribe link issues as test environments may not be set up to action this functionality',
                        outcome: 'Any potential issues should still be documented appropriately or queried with the client. Unless already stated in client documentation.',
                        experience: -10
                    },
                    {
                        text: 'Understand that unsubscribe links may error due to test distribution differences from the live environment',
                        outcome: 'Correct! This is potentially expected behaviour in a test environment, as a live environment may not yet not be set up to support this functionality. These details should be provided by the client',
                        experience: 15
                    },
                    {
                        text: 'Test unsubscribe functionality in production environments',
                        outcome: 'While production testing may work, it\'s not the recommended approach as this could disrupt on going monitoring by the client in production',
                        experience: 0
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Text Wrap Evaluation',
                description: 'How should text wrapping issues be evaluated?',
                options: [
                    {
                        text: 'Test all text wrapping on supported mobile devices',
                        outcome: 'While mobile testing is important, all devices need checking that are specified by the client.',
                        experience: 0
                    },
                    {
                        text: 'Compare against design specifications for consistent text flow across all devices',
                        outcome: 'Correct! Checking consistency with design across all platforms is recommended.',
                        experience: 15
                    },
                    {
                        text: 'Check headings as these are generally where text wrapping issues occur',
                        outcome: 'All text needs checking, not just headings as text wrapping issues can be found anywhere within the content',
                        experience: -10
                    },
                    {
                        text: 'Minor wrapping differences can be left in favour of major issues',
                        outcome: 'All wrapping issues should be reported regardless of the severity',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Results Tables Within Scripts',
                description: 'When updating the Overall Results table, what must be considered?',
                options: [
                    {
                        text: 'Failed tests from the days test activities should be included',
                        outcome: 'While failures are important, all results must be included.',
                        experience: 0
                    },
                    {
                        text: 'Critical issues from the days test activities should be included',
                        outcome: 'All issues, not just critical ones, should be included.',
                        experience: -10
                    },
                    {
                        text: 'Passed tests from the days test activities should be included',
                        outcome: 'Both passes and failures must be included',
                        experience: -5
                    },
                    {
                        text: 'The entire range of tests including any newly added environments',
                        outcome: 'Correct! All test ranges should be updated including updating formulas to include any new environments',
                        experience: 15
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Light & Dark Mode Testing Priority',
                description: 'How should light & dark mode testing be coordinated across devices?',
                options: [
                    {
                        text: 'System-level changes only need testing in relation to light & dark mode',
                        outcome: 'Client-specific settings must also be tested.',
                        experience: -10
                    },
                    {
                        text: 'Check each email client independently in relation to light & dark mode testing',
                        outcome: 'While individual testing is needed, overall system settings must also be considered.',
                        experience: 0
                    },
                    {
                        text: 'Coordinate system settings and individual app preferences, understanding that some clients follow system settings while others need manual configuration',
                        outcome: 'Correct! The relationship between system and app-specific settings should be tested.',
                        experience: 15
                    },
                    {
                        text: 'Use only default settings when testing light & dark mode',
                        outcome: 'Testing default settings alone is insufficient and client or app specific settings should also be tested.',
                        experience: -5
                    }
                ]
            },
        ]
}