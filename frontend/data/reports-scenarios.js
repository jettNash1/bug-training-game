export const reportsScenarios = {
        // Basic Scenarios (IDs 1-5)
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Report Timing',
                description: 'When should you start writing a daily report?',
                options: [
                    {
                        text: 'Start at 16:45 for standard reports, 16:30 if peer review needed, deliver by 17:00',
                        outcome: 'Perfect! This ensures timely delivery with review time.',
                        experience: 15,
                    },
                    {
                        text: 'Start writing the report at end of the working day',
                        outcome: 'Reports need time for review from the project manager and any revisions needed.',
                        experience: -10
                    },
                    {
                        text: 'Write the report throughout day and submit what has been observed at the time of documenting',
                        outcome: 'A final report requires the latest updated information at the point of submitting.',
                        experience: -5
                    },
                    {
                        text: 'Start after 17:00',
                        outcome: 'Reports must be delivered before the end of day and starting too late may potentially not leave enough time for reviews and revisions.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Writing Style',
                description: 'How should you write the report summary?',
                options: [
                    {
                        text: 'Use third person, present tense, objective language without technical jargon',
                        outcome: 'Excellent! This maintains a professional tone.',
                        experience: 15,
                    },
                    {
                        text: 'Use a first person approach to keep the report to a personal level',
                        outcome: 'Reports require a third person approach to keep to keep the tone objective.',
                        experience: -10
                    },
                    {
                        text: 'Include technical references so developers can identify issues quickly',
                        outcome: 'The language used should be accessible to all stakeholders and technical references should not be included unless absolutely required.',
                        experience: -5
                    },
                    {
                        text: 'Use a past tense approach when writing the summary section',
                        outcome: 'Present tense writing should be used as it shows the current state of a project.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Summary Structure',
                description: 'What are the four main sections of a report summary?',
                options: [
                    {
                        text: 'Introduction, what went well, what could be better, conclusion',
                        outcome: 'Perfect! This covers all key aspects.',
                        experience: 15,
                    },
                    {
                        text: 'Issues found, blocking issues, resolved issues and queries',
                        outcome: 'This approach only refers to issues and balanced coverage of all aspects is required.',
                        experience: -10
                    },
                    {
                        text: 'Introduction, technical details, what went well, conclusion',
                        outcome: 'Technical details should not be included in the summary as it should be accessible to all stakeholders.',
                        experience: -5
                    },
                    {
                        text: 'Sections related to observations from the days testing activities based on the testers preference', 
                        outcome: 'A structured approach is required to maintain consistency across all reports.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Metrics Inclusion',
                description: 'What metrics should be included in the report?',
                options: [
                    {
                        text: 'New issues, closed issues, outstanding issues, and relevant progress tables',
                        outcome: 'Excellent! This provides comprehensive metrics.',
                        experience: 15,
                    },
                    {
                        text: 'New issue metrics, as this is the current relevant information for the client',
                        outcome: 'All relevant metrics including progress, closed and outstanding issues are required for traceability purposes.',
                        experience: -10
                    },
                    {
                        text: 'Project progress as this is crucial for the project manger to gauge resources for the agreed test time frame',
                        outcome: 'Whilst this is an important metric, other metrics are also required for full project understanding.',
                        experience: -5
                    },
                    {
                        text: 'Closed ticket metrics as this informs the client on developer performance',
                        outcome: 'All metrics are crucial for reports, including new, closed, outstanding issues, and relevant progress.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Graph Presentation',
                description: 'How should graphs be presented in the report?',
                options: [
                    {
                        text: 'Consistent width, visible labels, appropriate legends, and alt text',
                        outcome: 'Perfect! This ensures accessible presentation.',
                        experience: 15,
                    },
                    {
                        text: 'With emphasis focused on each specific data element related to the graph and sized to fit the data',
                        outcome: 'Consistency is required in size throughout the report.',
                        experience: -10
                    },
                    {
                        text: 'Without labels as the graphs themselves provide enough data and information',
                        outcome: 'Labels for graphs and data are required for clarity.',
                        experience: -5
                    },
                    {
                        text: 'With placement preference based on experience of the tester',
                        outcome: 'Organized and structured presentation is required for all reports for consistency throughout.',
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
                title: 'Peer Review Process',
                description: 'How should you handle peer review feedback?',
                options: [
                    {
                        text: 'Review all comments, address each point, resolve comments after fixing and discuss if clarification needed',
                        outcome: 'Perfect! This ensures thorough review process.',
                        experience: 20,
                        tool: 'Peer Review'
                    },
                    {
                        text: 'Respond to feedback that is considered an improvement on what is currently stated',
                        outcome: 'All feedback requires consideration and a response stating the authors views.',
                        experience: -15
                    },
                    {
                        text: 'Delete any comments without fixing potential changes if they are not deemed to improve the report',
                        outcome: 'Comments correct resolution with feedback and documented information.',
                        experience: -10
                    },
                    {
                        text: 'Update any areas suggested from the review without marking comments as resolved',
                        outcome: 'Comment resolution is required for tracking purposes.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Environment Documentation',
                description: 'How do you document test environments in the report?',
                options: [
                    {
                        text: 'Include a matrix with accurate versions, consistent formatting, and relevant environment details',
                        outcome: 'Excellent! This provides clear environment context.',
                        experience: 20,
                        tool: 'Environment Documentation'
                    },
                    {
                        text: 'Incorporate a matrix with device names listed for each environment',
                        outcome: 'Other information is required for an environment matrix such as version details.',
                        experience: -15
                    },
                    {
                        text: 'Include a matrix with primary environment details stated',
                        outcome: 'Environment documentation for all environments tested are required for traceability.',
                        experience: -10
                    },
                    {
                        text: 'Use the summary to outline environment coverage',
                        outcome: 'Whilst some environment coverage can be stated in the summary, a more detailed approach is required in the form of an environment matrix for full traceability.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Issue Summary Presentation',
                description: 'How should you present the top issues in the report?',
                options: [
                    {
                        text: 'List most functionally impactive issues, include blocking issues separately, hyperlink all references',
                        outcome: 'Perfect! This provides organised issue overview.',
                        experience: 20,
                        tool: 'Issue Documentation'
                    },
                    {
                        text: 'List issues by tester preference based on experience of the project',
                        outcome: 'Issue need to be prioritised by impact on the system under test.',
                        experience: -15
                    },
                    {
                        text: 'List issues in standard text format in priority order',
                        outcome: 'Tickets in the top issues section require hyperlinks that direct to the correct bug tracker.',
                        experience: -10
                    },
                    {
                        text: 'State the top issues in priority order with any blockers stated first',
                        outcome: 'Blocking issues should be kept separate and documented in their own section in the report.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Weekly Report Management',
                description: 'How do you manage content for a weekly report?',
                options: [
                    {
                        text: 'Set up template first day, add draft notes daily, compile and refine at week end',
                        outcome: 'Excellent! This ensures comprehensive coverage.',
                        experience: 20,
                        tool: 'Report Management'
                    },
                    {
                        text: 'Document everything from the week on the last working day',
                        outcome: 'Progressive documentation is the best approach as its difficult to retain all information from the weeks testing activities.',
                        experience: -15
                    },
                    {
                        text: 'Use daily reports collated from weekly testing activities and include them into the weekly report',
                        outcome: 'A dedicated weekly report is required for consistency and ease of use for the client.',
                        experience: -10
                    },
                    {
                        text: 'Include information from later in the week to keep in line with more current activities',
                        outcome: 'A full week approach is required to specify all coverage attained from testing.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Stakeholder Communication',
                description: 'How do you adapt report content for different stakeholders?',
                options: [
                    {
                        text: 'Use clear language, avoid jargon, focus on business impact, maintain professional tone',
                        outcome: 'Perfect! This ensures wide accessibility.',
                        experience: 20,
                        tool: 'Stakeholder Management'
                    },
                    {
                        text: 'Use technical terms so developers can pinpoint and debug root causes',
                        outcome: 'Language used in reports needs to be accessible and understandable for all stakeholders involved in a project.',
                        experience: -15
                    },
                    {
                        text: 'Use language that focuses on Quality Assurance terminology',
                        outcome: 'All stakeholders must be considered, and language must be simple and fully inclusive.',
                        experience: -10
                    },
                    {
                        text: 'Use informal language to keep a friendly tone and maintain a good personal relationship',
                        outcome: 'A professional tone must be used throughout reports to keep a level of consistency and good business standard.',
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
                title: 'Report Format Adaptation',
                description: 'The client requests a different report format mid-project. How do you handle it?',
                options: [
                    {
                        text: 'Discuss the change with the Project Manager, adapt templates while maintaining key information and ensure consistent transition',
                        outcome: 'Perfect! This ensures proper format adaptation.',
                        experience: 25,
                        tool: 'Format Management'
                    },
                    {
                        text: 'Use both the current format and the new requested format on data you see fit for purpose',
                        outcome: 'The client requirements require consideration, clarification with the project manager and consistency.',
                        experience: -15
                    },
                    {
                        text: 'Create the new report format straight away and submit this at the usual time to the Project Manager',
                        outcome: 'Project Manager coordination required before making any changes to report formats to ensure consistency and clarity.',
                        experience: -10
                    },
                    {
                        text: 'Inform the client that the business use a structured guideline that needs to be followed for consistency',
                        outcome: 'While consistency is important, the client can essentially request how they receive the data they require and the way they want the data to be reported.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Complex Metrics Analysis',
                description: 'How do you handle conflicting metrics in the report?',
                options: [
                    {
                        text: 'Verify source data, cross-reference scripts, document discrepancies, consult the project manager if needed',
                        outcome: 'Excellent! This ensures accurate reporting.',
                        experience: 25,
                        tool: 'Data Analysis'
                    },
                    {
                        text: 'Adjust the formulas within the script to fit the numbers stated in the report',
                        outcome: 'Formulas should not be updated as this can return inconsistent results.',
                        experience: -15
                    },
                    {
                        text: 'Conflicting metrics should be reported to the project manager straight away',
                        outcome: 'In this instance other avenues should be visited first, such as source data and troubleshooting guides. Project managers have multiple reports to review at the end of the working day.',
                        experience: -10
                    },
                    {
                        text: 'Take an average of the numbers stated in the test script and which have been stated in the report',
                        outcome: 'Accurate data is required for reporting and verifying source data should be performed first.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Multi-Environment Reporting',
                description: 'How do you report on testing across multiple complex environments?',
                options: [
                    {
                        text: 'Create clear environment matrix, document specific behaviours, highlight key differences',
                        outcome: 'Perfect! This provides comprehensive environment coverage.',
                        experience: 25,
                        tool: 'Environment Analysis'
                    },
                    {
                        text: 'Group all environment data together and report as one metric',
                        outcome: 'Specific details required per environment for traceability.',
                        experience: -15
                    },
                    {
                        text: 'Ensure the report includes primary environment testing data',
                        outcome: 'Data for testing activities across all environments are required for coverage reporting.',
                        experience: -10
                    },
                    {
                        text: 'Specify the hardware used for each environment that has been tested',
                        outcome: 'Full environment documentation including, device, operating system and browser version details is essential.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Critical Issue Reporting',
                description: 'How do you report different multiple critical issues found late in the day?',
                options: [
                    {
                        text: 'Immediately notify project manager, document thoroughly in report, highlight business impact',
                        outcome: 'Excellent! This ensures proper critical issue handling.',
                        experience: 25,
                        tool: 'Critical Issue Management'
                    },
                    {
                        text: 'Include the issues within the report and submit this at the agreed time',
                        outcome: 'Immediate notification to the project manager is the best approach in this instance so clients are aware of any alternative planning that may be required.',
                        experience: -15
                    },
                    {
                        text: 'Collate all critical issues into one ticket for ease and speed of client delegation',
                        outcome: 'If issues are not related they require individual tickets raising regardless of time of working day.',
                        experience: -10
                    },
                    {
                        text: 'Leave the detail out of the report and communicate the issues with the project manager',
                        outcome: 'Thorough documentation as well as communication with the project manager on these critical issues required.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Report Quality Assurance',
                description: 'How do you ensure report quality before submission?',
                options: [
                    {
                        text: 'Review content, verify metrics, check formatting, validate links, run spell check, read aloud',
                        outcome: 'Perfect! This ensures comprehensive quality check.',
                        experience: 25,
                        tool: 'Quality Assurance'
                    },
                    {
                        text: 'Run the report through a spellchecker to make sure a professional standard is maintained',
                        outcome: 'Whilst good grammar is important, a thorough review of all data and formatting is required.',
                        experience: -15
                    },
                    {
                        text: 'Once all information has been collated a review is only required by the project manager',
                        outcome: 'A quality check is crucial before submitting to the project manager as they should not have to change anything or only make minimal changes.',
                        experience: -10
                    },
                    {
                        text: 'Thoroughly check all metrics data adds up correctly and is representative of testing activities carried out',
                        outcome: 'While metrics data is important, all aspects of reporting need thorough review.',
                        experience: -5

                    }
                ]
            }
        ]
}