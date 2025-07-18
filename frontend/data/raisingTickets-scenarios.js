export const raisingTicketsScenarios = {
        // Basic Scenarios (IDs 1-5, 75 XP total)
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Understanding Ticket Types',
                description: 'What are the main types of tickets that should be raised?',
                options: [
                    {
                        text: 'Bugs, Queries, Suggestions/Improvements, and Reference tickets',
                        outcome: 'Perfect! These are the main ticket types used for different purposes.',
                        experience: 15,
                        isCorrect: true,
                    },
                    {
                        text: 'Bug reports should be raised as this is the primary objective of quality assurance',
                        outcome: 'Multiple ticket types are required including queries and suggestions as they serve different purposes.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Tasks should be raised by the tester for clients to assign to developers',
                        outcome: 'Whilst this is a valid ticket type in some but tracking systems, tasks are generally entered by developers or client project managers themselves.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'User stories should be raised by the tester for full feature coverage',
                        outcome: 'Whilst this is a valid ticket type. User stories are generally entered by developers or client project managers themselves.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Ticket Title Creation',
                description: 'How should you format a ticket title?',
                options: [
                    {
                        text: 'Concise, clear, and specific with environment prefix if applicable',
                        outcome: 'Excellent! Clear titles help identify issues quickly.',
                        experience: 15,
                    },
                    {
                        text: 'A full sentence to give all details of the issue raised',
                        outcome: 'Ticket titles should be concise and specific. Full details can be included in the ticket description and steps.',
                        experience: -5
                    },
                    {
                        text: 'A clear and specific description along with bug severity',
                        outcome: 'Whilst a clear and specific description is required. The bug severity should be included in its own field in the ticket and in the severity field of the bug tracking system',
                        experience: -10
                    },
                    {
                        text: 'Observed and expected outcomes should be included.',
                        outcome: 'Whilst titles should describe the issue clearly, they need to be concise. Full information can be included in the description and steps of the ticket',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Issue Description',
                description: 'What should be included in the issue description?',
                options: [
                    {
                        text: 'Observed behaviour, expected behaviour, and reference to specifications if available',
                        outcome: 'Perfect! This provides clear context for the client and developer to debug the issue.',
                        experience: 15,
                    },
                    {
                        text: 'Only the error message should be included in the issue description',
                        outcome: 'More context is needed in descriptions including observed and expected behaviour.',
                        experience: -10
                    },
                    {
                        text: 'The testers opinion on how the behaviour of the feature or process should perform',
                        outcome: 'Whilst in some cases this may be of benefit, any behaviour of the expected outcome should come from client documentation.',
                        experience: -5
                    },
                    {
                        text: 'Technical information should be included in the ticket description',
                        outcome: 'Technical information should be avoided if possible, as clear, accessible language is required for ease of understanding to all stakeholders.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Steps to Recreate',
                description: 'How should you document steps to recreate an issue?',
                options: [
                    {
                        text: 'Clear, numbered steps with specific actions and component names in order',
                        outcome: 'Excellent! This helps others reproduce the issue reliably.',
                        experience: 15,
                    },
                    {
                        text: 'A general description on the area in question for developers to investigate and debug',
                        outcome: 'Specific numbered steps are required for bug reproduction.',
                        experience: -10
                    },
                    {
                        text: 'Steps are not needed as long as the description has enough detail for reproduction',
                        outcome: 'Steps are essential for issue verification and should accompany a bug description.',
                        experience: -5
                    },
                    {
                        text: 'Steps should written in first person format when documenting an issue',
                        outcome: 'Steps should always be documented in an instructional manner, as first person format can suggest a one only type issue.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Environment Documentation',
                description: 'What should you include in the environment section?',
                options: [
                    {
                        text: 'Primary environment details and any additional environments where the issue occurs',
                        outcome: 'Perfect! This helps identify environment-specific issues.',
                        experience: 15,
                    },
                    {
                        text: 'Details of the environment the issue was initially found on',
                        outcome: 'Details of all environments the issue occurs on should be listed here.',
                        experience: -10
                    },
                    {
                        text: 'Hardware details of all environments the issue occurs on',
                        outcome: 'Whilst the hardware details are needed, operating system and browser version details are also required.',
                        experience: -5
                    },
                    {
                        text: 'Browser specific version numbers should be included in the environment section',
                        outcome: 'Whilst the browser version details are needed, operating system and hardware version details are also required.',
                        experience: 0
                    }
                ]
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Issue Reproduction Rates',
                description: 'Which of the following is the appropriate reproduction rate to indicate for an issue that can be recreated in 3 out of 4 attempts?',
                options: [
                    {
                        text: '75% - Mostly reproducible',
                        outcome: 'Correct! The guide specifically states that 75% means in 3 out of 4 attempts we were able to recreate the issue with minimal difficulty.',
                        experience: 15,
                    },
                    {
                        text: '99% - Consistently reproducible',
                        outcome: '99% means the tester can reproduce the issue every time it is attempted.',
                        experience: -5
                    },
                    {
                        text: '25% - Sporadic issue',
                        outcome: 'This type of issue has only been able to be reproduced 1 in every 4 attempts.',
                        experience: -10
                    },
                    {
                        text: '0% - Not reproducible',
                        outcome: 'This rating is for issues that have been observed once but cannot be recreated at all.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Issue Severity',
                description: 'Which severity level should be assigned to an issue that prevents you from testing an entire section of the application?',
                options: [
                    {
                        text: 'Major Impact on Functionality',
                        outcome: 'While this is a serious severity level, it\'s defined as issues that have a significant impact on the user but generally is not so critical as to prevent any further testing.',
                        experience: -5
                    },
                    {
                        text: 'Minor Impact on Functionality',
                        outcome: 'This severity is for issues with a minor impact on the user, generally only indicating a small inconvenience.',
                        experience: -10
                    },
                    {
                        text: 'Blocking Issue/Crash',
                        outcome: 'Correct! a blocking Issue/Crash would likely prevent further testing completely or prevent testing of an area of the site or application.',
                        experience: 15,
                    },
                    {
                        text: 'Feature Enhancement/Suggestion/Query',
                        outcome: 'This severity is for constructive feedback on efficiency or user-friendliness, or for queries about possible requirement discrepancies.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Supporting Material',
                description: 'What is the most appropriate supporting material to include for an issue with a low reproduction rate?',
                options: [
                    {
                        text: 'A brief textual description should be included only.',
                        outcome: 'Evidence should be included for defects with low reproducibility rates as it allows the developer to clearly see what the defect is.',
                        experience: -5
                    },
                    {
                        text: 'A step-by-step guide should be included without visual evidence',
                        outcome: 'While steps to reproduce are important, for issues that are difficult to reproduce visual evidence is crucial.', 
                        experience: -10
                    },
                    {
                        text: 'A video or screenshot showing the issue occurring should be included',
                        outcome: 'Correct! adding evidence can assist with identifying the root cause of the defect. For defects with low replicability rates, it allows the developer to clearly see what the defect is.',
                        experience: 15,
                    },
                    {
                        text: 'A detailed technical analysis of the code causing the issue should be included',
                        outcome: 'Testers typically don\'t provide code analysis in tickets. Tickets should use clear and non-technical language and be focused on the observed behaviour rather than technical diagnoses.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Ticket Characteristics',
                description: 'Which of the following is a key characteristic of well-written tickets?',
                options: [
                    {
                        text: 'Tickets should be factual, neutral, and helpful information and are key characteristics',
                        outcome: 'Correct! these are all characteristics of a well-written ticket.',
                        experience: 15,
                    },
                    {
                        text: 'Detailed technical jargon for developers are key characteristics',
                        outcome: 'Tickets should be written in a clear and non-technical language and be jargon-free so all stakeholders can understand them.',
                        experience: -10
                    },
                    {
                        text: 'Subjective opinions about the severity of the issue should be included and are key characteristics',
                        outcome: 'Tickets should be factual and we should avoid inserting our opinion or being overly critical.',
                        experience: -5
                    },
                    {
                        text: 'Exhaustive details regardless of relevance should be included and are key characteristics',
                        outcome: 'Tickets should be concise and should not include any unnecessary details.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Ticket Raising',
                description: 'What should you do before raising a ticket?',
                options: [
                    {
                        text: 'You should check if there are specific client requests for raising issues',
                        outcome: 'Correct! consider if there are any specific requests from the client on how they would like issues to be raised to the tracker. You can generally find this information out by looking at the Operational Project Details document.',
                        experience: 15,
                    },
                    {
                        text: 'You should wait for another tester to confirm the issue',
                        outcome: 'While issues are posted within the channel to increase team awareness, tickets must be raised as they are observed and shouldn\'t be delayed.',
                        experience: -10
                    },
                    {
                        text: 'You should discuss with the development team how to fix the issue',
                        outcome: 'Testers are responsible for reporting issues, not determining how they should be fixed.',
                        experience: -5
                    },
                    {
                        text: 'You should attempt to fix the issue yourself first',
                        outcome: 'This would be outside the scope of a tester\'s responsibilities.',
                        experience: 0
                    }
                ]
            }
        ],

        // Intermediate Scenarios (IDs 6-10, 125 XP total)
        intermediate: [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Reproduction Rate',
                description: 'How do you determine and document reproduction rate?',
                options: [
                    {
                        text: 'Test multiple times and calculate percentage based on successful reproductions',
                        outcome: 'Excellent! This provides accurate reproduction statistics.',
                        experience: 20, 
                    },
                    {
                        text: 'Test multiple times on one environment to ensure accurate reproduction rate',
                        outcome: 'To ensure accurate reproduction rates, tests should be carried out on multiple environments.',
                        experience: -15
                    },
                    {
                        text: 'Test with one set of data to ensure conditions do not affect outcome',
                        outcome: 'Whilst this is initially important, testing under different conditions contribute to the reproduction rate, for example, using different types of data for a mailing list form.',
                        experience: -10
                    },
                    {
                        text: 'Test once on each supported environment',
                        outcome: 'While testing other environments is important, multiple attempts of recreating the issue is required for accuracy.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Supporting Material',
                description: 'What supporting material should you include with tickets?',
                options: [
                    {
                        text: 'Clear videos and images showing the issue, crash logs, and highlighted problem areas',
                        outcome: 'Perfect! Visual evidence helps stakeholders and developers understand issues.',
                        experience: 20, 
                    },
                    {
                        text: 'Supporting material can be omitted if the description has enough detail',
                        outcome: 'Evidence should always be included, if possible, as this helps demonstrate issues for developers and subsequent issue verification.',
                        experience: -15
                    },
                    {
                        text: 'Low resolution unlabelled screenshots should be included as supported evidence',
                        outcome: 'Screenshots should be clear and legible to promote clarity and instruction on issues.',
                        experience: -10
                    },
                    {
                        text: 'Steps to reproduce with URL links to affected pages and areas',
                        outcome: 'While steps to reproduce can help pinpoint an issue. Visual evidence often helps with clarity even more so.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Version Information',
                description: 'How should you document version information?',
                options: [
                    {
                        text: 'Include environment URL, build version and date for accurate tracking',
                        outcome: 'Excellent! Version information is essential for traceability helps track issue timeline.',
                        experience: 20, 
                    },
                    {
                        text: 'Include build version and date the issue was raised on for documentation',
                        outcome: 'Version information and date are essential. However, in the case of website testing the URL provided by the client must also be included.',
                        experience: -15
                    },
                    {
                        text: 'Use versioning in descending numerical order relating to the number of days under test',
                        outcome: 'The specific version of the release under test as supplied by the client or the URL and date needs to be stated.',
                        experience: -10
                    },
                    {
                        text: 'State the version number as \'latest\' with the date that issue was raised on',
                        outcome: 'Exact version numbers must be specified for traceability.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Severity Assessment',
                description: 'How do you determine ticket severity?',
                options: [
                    {
                        text: 'Assess impact on functionality, user experience, and business requirements',
                        outcome: 'Perfect! This ensures appropriate prioritisation.',
                        experience: 20, 
                    },
                    {
                        text: 'Mark issue severity as high, as all bugs require addressing and fixing',
                        outcome: 'Accurate severity assessment needed for clients to prioritise issues that need fixing and ones that can be left in the code for release.',
                        experience: -15
                    },
                    {
                        text: 'Prioritise multiple minor cosmetic issues over bugs in system functionality detailed in business requirements',
                        outcome: 'Minor cosmetic issues need to be addressed, although anything detailed in the business requirements must take a higher severity status.',
                        experience: -10
                    },
                    {
                        text: 'Raise the issues with the intention of developers adding their own severity status, as they understand the system under test',
                        outcome: 'Severity must match impact on functionality, user experience, and business requirements.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Client Communication',
                description: 'How should you handle client-specific ticket requirements?',
                options: [
                    {
                        text: 'Follow client instructions from operational project details and maintain clear communication',
                        outcome: 'Excellent! Client preferences are important for their established work flow.',
                        experience: 20, 
                    },
                    {
                        text: 'Make sure client ticket assigning requirements only are followed',
                        outcome: 'While this is important, all client ticket requirements must be followed, for example how to update statuses and which lanes to move tickets into for a kanban style bug tracker.',
                        experience: -15
                    },
                    {
                        text: 'Use the standard ticket reporting format to keep consistency throughout all projects',
                        outcome: 'Client-specific needs should always be adhered to and cross referenced with the project manager if need be.',
                        experience: -10
                    },
                    {
                        text: 'Follow some of the client requirements in accordance with tester preference and experience',
                        outcome: 'All client requirements should be followed and on the occasion that a potential improvement can be utilised, this should be communicated with the client first as a suggestion.',
                        experience: -5
                    }
                ]
            }
        ],

        // Advanced Scenarios (IDs 11-15, 100 XP total)
        advanced: [
            {
                id: 11,
                level: 'Advanced',
                title: 'Stakeholder Impact',
                description: 'How do you communicate ticket impact to stakeholders?',
                options: [
                    {
                        text: 'Provide clear, factual information about business impact and user experience effects',
                        outcome: 'Perfect! This helps stakeholders make informed decisions.',
                        experience: 25, 
                    },
                    {
                        text: 'Use technical terms where possible along with a description of how the issue behaves',
                        outcome: 'Technical terms should be avoided if possible, as clear, accessible language is required for stakeholders of all technical ability.',
                        experience: -15
                    },
                    {
                        text: 'Give a brief description of the issue and how to recreate it',
                        outcome: 'When dealing with bug impact, stakeholders will generally require the actual impact the issue has on the user or the system under test and not how to recreate the issue.',
                        experience: -10
                    },
                    {
                        text: 'Emphasise the impact severity as high, as all bugs should be addressed and fixed',
                        outcome: 'Accurate impact assessment is required for stakeholders to form the correct strategy.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Quality Assurance',
                description: 'How do you ensure ticket quality before submission?',
                options: [
                    {
                        text: 'Double-check all information, verify steps, and ensure clear documentation',
                        outcome: 'Excellent! Quality checks prevent confusion.',
                        experience: 25, 
                    },
                    {
                        text: 'Review the title and description fields of the ticket before submission',
                        outcome: 'All information with a ticket requires a review before submission.',
                        experience: -15
                    },
                    {
                        text: 'Run a spell checker program on the ticket before submission',
                        outcome: 'While spelling and grammar is important, all elements of the ticket are equally essential.',
                        experience: -10
                    },
                    {
                        text: 'Ensure all environment information is correct by double checking devices under test',
                        outcome: 'Whilst an important factor in bug submission for traceability, all elements of the ticket need to be reviewed and not just environment information.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Time Management',
                description: 'When should tickets be raised during testing?',
                options: [
                    {
                        text: 'Tickets should be raise immediately when issues are observed to maintain accuracy',
                        outcome: 'Perfect! Immediate reporting ensures accuracy.',
                        experience: 25, 
                    },
                    {
                        text: 'Raise tickets in parallel with daily reports for familiarity when writing the report',
                        outcome: 'Immediate reporting is the best approach, as raising all tickets towards the end of the day can potentially lead to issues not being reported due to time constraints.',
                        experience: -15
                    },
                    {
                        text: 'Batch multiple issues together to make sure testing coverage is not affected',
                        outcome: 'Issues should be reported as soon as they are discovered as this gives the client visibility of project status.',
                        experience: -10
                    },
                    {
                        text: 'During stand up meetings to get the opinion of everyone involved in the project',
                        outcome: 'Any major issues can be highlighted in stand up meetings, but full tickets should not be written whilst in those meetings at the risk of taking work time away from colleagues.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Evidence Quality',
                description: 'How do you ensure high-quality supporting evidence?',
                options: [
                    {
                        text: 'Capture clear videos and images, repeat issues in recordings, and highlight key areas',
                        outcome: 'Excellent! Quality evidence aids understanding.',
                        experience: 25, 
                    },
                    {
                        text: 'Use a device to record video evidence of the issue occurring on another device',
                        outcome: 'This approach should only be utilised with older devices that don\'t have the capability of native recording functionailty.',
                        experience: -15
                    },
                    {
                        text: 'Ensure bug description and steps to reproduce have sufficient and concise information',
                        outcome: 'While these are important areas to include when raising a bug. Evidence provides even more clarity',
                        experience: -10
                    },
                    {
                        text: 'Use evidence from previous releases if the issue still occurs on the current release.',
                        outcome: 'Evidence from the current release version of a system or application under test is always required for product accuracy.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Consistency Management',
                description: 'How do you maintain consistency across multiple tickets?',
                options: [
                    {
                        text: 'Use templates, follow standards, and maintain consistent formatting across all tickets',
                        outcome: 'Perfect! Consistency helps track and resolve issues.',
                        experience: 25, 
                    },
                    {
                        text: 'Use a format based on what type of issue is being raised',
                        outcome: 'A consistent format is required as it represents professionalism and good business standard.',
                        experience: -15
                    },
                    {
                        text: 'Ensure bug description and steps to reproduce are always stated in the same format and same place',
                        outcome: 'While keeping this consistent is the correct approach, all other details and positioning of information within tickets should also be kept the same.',
                        experience: -10
                    },
                    {
                        text: 'Use templates and follow standards to maintain consistency',
                        outcome: 'This is a good approach. However, formatting also needs to be consistent through all tickets submitted to maintain professionalism.',
                        experience: -5
                    }
                ]
            }
        ]
}