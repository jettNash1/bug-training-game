export const issueVerificationScenarios = {
        // Basic Scenarios (IDs 1-5)
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Verification Priority',
                description: 'You have limited time for issue verification. How do you prioritize tickets?',
                options: [
                    {
                        text: 'Start with highest priority and severity issues, ensuring critical fixes are verified first',
                        outcome: 'Perfect! This ensures most important issues are verified.',
                        experience: 15,
                        isCorrect: true,
                    },
                    {
                        text: 'Verify tickets in chronological order to address the most current issues first',
                        outcome: 'Priority and severity should guide verification order.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Start with easiest tickets to gain the most coverage of open tickets',
                        outcome: 'Critical issues need verification first.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Verify issues based on your familiarity with specific tickets',
                        outcome: 'Structured prioritisation is required to address the most critical issues first.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Environment Matching',
                description: 'You need to verify a device-specific issue. What\'s the correct approach?',
                options: [
                    {
                        text: 'Verify on the original environment where possible, or clearly document any environment differences',
                        outcome: 'Excellent! This maintains testing consistency.',
                        experience: 15,
                    },
                    {
                        text: 'Test on any available device to verify the issue has been resolved',
                        outcome: 'The original environment should be prioritised as this is where the issue was raised and has been addressed.',
                        experience: -10
                    },
                    {
                        text: 'Verify on an older device before moving onto the specified device',
                        outcome: 'Device-specific issues require verification as users will operate many different devices.',
                        experience: -5
                    },
                    {
                        text: 'This can be marked as verified without testing as long as functionality on the primary environment behaves as intended',
                        outcome: 'Verification is required on specific devices the issue was raised on.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Verification Comments',
                description: 'How should you document your verification findings?',
                options: [
                    {
                        text: 'Use template format with status, date, observations, version, environments, and evidence',
                        outcome: 'Perfect! This provides comprehensive verification documentation.',
                        experience: 15,
                    },
                    {
                        text: 'Update the ticket status, as this ensures proper traceability of the issue',
                        outcome: 'More details are required for traceability.',
                        experience: -10
                    },
                    {
                        text: 'Update the ticket by stating "fixed" or "not fixed" as further details are not required',
                        outcome: 'More detailed documentation is required for developer and stakeholder information.',
                        experience: -5
                    },
                    {
                        text: 'Add screenshots as visual representation of issues is vital for developers to debug issues',
                        outcome: 'Written documentation is also required to accompany evidence.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Evidence Capture',
                description: 'What\'s the best practice for capturing verification evidence?',
                options: [
                    {
                        text: 'Use appropriate tools, highlight issues clearly, repeat demonstrations in videos',
                        outcome: 'Excellent! This provides clear verification evidence.',
                        experience: 15,
                    },
                    {
                        text: 'Included screenshots don\'t need labelling as attachment should provide enough detail',
                        outcome: 'Any submitted evidence requires clear highlighting.',
                        experience: -10
                    },
                    {
                        text: 'Evidence capture is generally not needed as steps and description should provide enough detail',
                        outcome: 'Visual evidence is essential for verification.',
                        experience: -5
                    },
                    {
                        text: 'A video capture in low resolution should be sufficient evidence',
                        outcome: 'While a video capture is good evidence, the resolution should be up to a legible standard.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Status Updates',
                description: 'An issue is partially fixed. How do you update its status?',
                options: [
                    {
                        text: 'Mark as partially fixed with a detailed explanation of the remaining issues',
                        outcome: 'Perfect! This accurately reflects partial fixes.',
                        experience: 15,
                    },
                    {
                        text: 'Change the status to fixed, adding a note to re-open once fully fixed',
                        outcome: 'Partial fixes should not be closed unless instructed by the client.',
                        experience: -10
                    },
                    {
                        text: 'Update the status to not fixed without adding a comment, as the status itself indicates the ticket requires a revisit',
                        outcome: 'Partial fix tickets require a partial fix status with full details included.',
                        experience: -5
                    },
                    {
                        text: 'Keep the status unchanged, as the open ticket reflects the current situation',
                        outcome: 'This type of ticket requires the correct status update with the relevant verification details.',
                        experience: 0
                    }
                ]
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Issue Status',
                description: 'What term describes an issue that shows some improvements but still has unresolved aspects?',
                options: [
                    {
                        text: 'Partially Fixed',
                        outcome: 'Correct! This is an issue that has been noted as partly showing expected behaviour or improvements, but part of the issue remains unresolved.',
                        experience: 15,
                        isCorrect: true,
                    },
                    {
                        text: 'Won\'t Fix',
                        outcome: 'Won\'t Fix means the client has decided not to address the issue.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Not Reproducible',
                        outcome: 'Not Reproducible means the issue cannot be recreated during testing.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Out of Scope',
                        outcome: 'Out of Scope indicates the issue is beyond the project requirements.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Issue Verification & Additional Testing',
                description: 'What is a crucial component of issue verification that should be performed alongside retesting specific issues?',
                options: [
                    {
                        text: 'Creating detailed test cases for future test cycles',
                        outcome: 'Creating test cases is part of planning activities and not generally part of issue verification',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Interviewing developers about their implementation methods',
                        outcome: 'Whilst comments can be added to tickets about findings and queries. Interviewing developers is not part of issue verification.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Regression testing in areas where fixes have been made',
                        outcome: 'Correct! It is critical you ensure time for regression testing to identify new issues that may have been introduced as a result of fixes.',
                        experience: 15,
                        isCorrect: true,
                    },
                    {
                        text: 'Redesigning the user interface to prevent future issues',
                        outcome: 'User Interface redesign is not part of the tester\'s responsibility during issue verification',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Issue Verification Characteristics',
                description: 'What is a key characteristic of issue verification compared to exploratory testing?',
                options: [
                    {
                        text: 'Issue verification requires less attention to detail than exploratory testing',
                        outcome: 'Issue verification requires being Observant, Detail oriented and aware of change, so it doesn\'t require less attention to detail.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Issue verification is always performed by a different tester than the original test execution',
                        outcome: 'The same tester that performed the original test execution on the system can perform the regression tests as well as different testers.', 
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Issue verification focuses more on reporting than on detailing destructive test methods',
                        outcome: 'Correct! The reporting process differs from, exploratory testing which is focused on detailing destructive/edge case methods and reporting the issues found. Instead, it is centred around verifying and building a picture of product quality.',
                        experience: 15,
                        isCorrect: true,
                    },
                    {
                        text: 'Issue verification allows for more creative test approaches than exploratory testing',
                        outcome: 'Issue verification generally relies on following a set of steps for each ticket raised rather than a more creative approach that exploratory testing employs.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Issue Verification Terms',
                description: 'What does the term "Global" mean in the context of issue verification?',
                options: [
                    {
                        text: 'The issue is present on all environments and all operating systems based on tested samples',
                        outcome: 'Correct! Stating global is making a calculated assumption based on observations that the issue is present on all environments and all operating systems.',
                        experience: 15,
                        isCorrect: true,
                    },
                    {
                        text: 'The issue affects all users in all countries worldwide',
                        outcome: 'While this might seem logical, global is defined in terms of environments and operating systems, not geographic regions.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'The issue requires approval from global management.',
                        outcome: 'This is incorrect, and management should not be involved in ticket raising criteria.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'The issue can only be verified by international teams.',
                        outcome: 'This is incorrect as global issues should require the testers experience and knowledge',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Unresolved Issues',
                description: 'What should a tester do if they discover that clients have not addressed issues in time for the issue verification session?',
                options: [
                    {
                        text: 'Identify unresolved issues as lower priority for retesting',
                        outcome: 'Correct! Where possible, confirm with the project manager which & how many issues the client has been able to work on ahead of the issue verification session. If there are known unresolved issues, identify them as lower priority for retest.',
                        experience: 15,
                        isCorrect: true,
                    },
                    {
                        text: 'Cancel the session and reschedule for a later date',
                        outcome: 'This should not be the process. Any unresolved issues should be identified as low priority for re-test.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Test only the fixed issues and ignore all others',
                        outcome: 'Prioritising of all issues should be the process, rather than ignoring any tickets that have any other status.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Automatically mark all untested issues as \'Not Fixed\'',
                        outcome: 'Automatically marking issues as Not Fixed without testing would be inaccurate and contradicts the purpose of verification.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            }
        ],

        // Intermediate Scenarios (IDs 6-10)
        intermediate: [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Regression Testing',
                description: 'After verifying fixes, how do you approach regression testing?',
                options: [
                    {
                        text: 'Focus on areas where fixes were implemented, while also checking surrounding functionality',
                        outcome: 'Perfect! This ensures thorough regression coverage.',
                        experience: 20,     
                    },
                    {
                        text: 'Check all of the fixed issues as confirmed by the client',
                        outcome: 'Regression testing should cover areas that have been recently modified. This may include new features or bug fixes.',
                        experience: -15
                    },
                    {
                        text: 'Stick to minimal regression testing as previous issues have been fixed and tested during the current release',
                        outcome: 'Regression testing reduces the risk of introducing new bugs into the system, which can be costly and time-consuming to fix later.',
                        experience: -10
                    },
                    {
                        text: 'Focus regression testing on tester preference using experience gained during initial testing',
                        outcome: 'Regression tests should focus on high risk areas, recent changes and core functionality.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Time Management',
                description: 'How do you manage time during a verification session?',
                options: [
                    {
                        text: 'Set goals for ticket verification numbers based on priority and severity, then allocate specific time for regression',
                        outcome: 'Excellent! This ensures balanced coverage.',
                        experience: 20,
                    },
                    {
                        text: 'Work through verification of all tickets to completion',
                        outcome: 'Time needs to be allocated for both issue verification and regression testing on a priority basis.',
                        experience: -15
                    },
                    {
                        text: 'Focus time management on regression testing',
                        outcome: 'Issue verification requires time allocation for both ticket verification and regression testing.',
                        experience: -10
                    },
                    {
                        text: 'Focus time management and planning on issue verification',
                        outcome: 'Issue verification requires time allocation for both ticket verification and regression testing.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'New Issues Discovery',
                description: 'You find new issues during verification. How do you handle them?',
                options: [
                    {
                        text: 'Raise new tickets and note if they\'re related to recent fixes',
                        outcome: 'Perfect! This tracks new issues properly.',
                        experience: 20,
                    },
                    {
                        text: 'Add any new issues to existing tickets within the project',
                        outcome: 'Any new issues found require separate tickets.',
                        experience: -15
                    },
                    {
                        text: 'Leave new issues for a further round of testing as issue verification should focus on current tickets',
                        outcome: 'All issues require documentation as and when they are found.',
                        experience: -10
                    },
                    {
                        text: 'Raise any new issue found during issue verification in the report summary',
                        outcome: 'While new issue can be stated in a report summary, they also require tickets to be raised.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Device Availability',
                description: 'An original test device isn\'t available. How do you proceed?',
                options: [
                    {
                        text: 'Contact the device owner early, check device lists and consider BrowserStack with PM approval',
                        outcome: 'Excellent! This shows correct device management.',
                        experience: 20,
                    },
                    {
                        text: 'Test on any available device to verify the issue has been resolved',
                        outcome: 'The original environment should be prioritised, even if this is tested on BrowserStack as this is where the issue was raised and has been addressed.',
                        experience: -15
                    },
                    {
                        text: 'Test on a similar device and document test outcome',
                        outcome: 'Using a different device for verification should be confirmed by the project manager and all environment differences require documentation.',
                        experience: -10
                    },
                    {
                        text: 'Mark the ticket as cannot test due to lack of device resources',
                        outcome: 'Alternative testing options must be explored including a similar device and BrowserStack.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Client Communication',
                description: 'The client hasn\'t updated ticket statuses. How do you proceed?',
                options: [
                    {
                        text: 'Contact the Project Manager to confirm which issues have been worked on and prioritise known fixed issues',
                        outcome: 'Perfect! This ensures efficient verification.',
                        experience: 20,
                    },
                    {
                        text: 'Test all tickets that have previously been raised within the project',
                        outcome: 'Prioritisation is required as some tickets may not have been worked on by the client.',
                        experience: -15
                    },
                    {
                        text: 'Continue with issue verification whilst awaiting updates to tickets from the client',
                        outcome: 'Proactive communication with the Project Manager and client is required in this instance as they may not intend to work on specific tickets.',
                        experience: -10
                    },
                    {
                        text: 'Leave the tickets that don\'t have any status update and include the information in the summary report.',
                        outcome: 'It is best practice to confirm with the client which that has tickets are intended for verification.',
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
                title: 'Complex Issue Verification',
                description: 'A complex issue involves multiple interconnected features. How do you verify it?',
                options: [
                    {
                        text: 'Test all connected features, document dependencies, verify full workflow',
                        outcome: 'Perfect! This ensures thorough verification.',
                        experience: 25,
                    },
                    {
                        text: 'Test the main feature and document the outcome',
                        outcome: 'All connected features require verification and regression testing.',
                        experience: -15
                    },
                    {
                        text: 'Test the features that are connected to the main feature as this ensures all issues have been addressed',
                        outcome: 'Complex issues need thorough testing and all affected features require attention.',
                        experience: -10
                    },
                    {
                        text: 'Test the specific issues that have been addressed by the client without the full feature workflow',
                        outcome: 'All issues require verification as well as the full workflow of interconnected features.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Multiple Environment Issues',
                description: 'An issue affects multiple environments differently. How do you verify it?',
                options: [
                    {
                        text: 'Test each environment, document specific behaviours, note any variations',
                        outcome: 'Excellent! This provides complete environment coverage.',
                        experience: 25,
                    },
                    {
                        text: 'Test any of the affected environments to verify the issue has been addressed by the client',
                        outcome: 'All affected environments require testing as behaviour has been stated as environment specific.',
                        experience: -15
                    },
                    {
                        text: 'Test the majority of environments, ascertain an average outcome and document results',
                        outcome: 'All stated environment variations are required for verification.',
                        experience: -10
                    },
                    {
                        text: 'Test all stated environments and document the outcome of the primary device',
                        outcome: 'Environment differences require full documentation for traceability.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Regression Impact Analysis',
                description: 'Multiple fixes have been implemented. How do you assess regression impact?',
                options: [
                    {
                        text: 'Research fix relationships, test impacted areas, document any cascading effects',
                        outcome: 'Perfect! This ensures comprehensive regression analysis.',
                        experience: 25,
                    },
                    {
                        text: 'Verify any client stated fixes specifically',
                        outcome: 'Potential related impacts from specific bug fixes also require assessment.',
                        experience: -15
                    },
                    {
                        text: 'Use a basic regression process to ascertain focus feature fixes',
                        outcome: 'Thorough impact analysis is required for regression testing to explore any other areas that might be affected by a specific bug fix.',
                        experience: -10
                    },
                    {
                        text: 'Impact analysis can be left until all specific fixes have been verified',
                        outcome: 'Fix impacts require assessment systematically throughout verification as blocking issues could be direct impact of a current fix.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Verification Report Creation',
                description: 'How do you create a comprehensive verification report?',
                options: [
                    {
                        text: 'Document verified issues, regression findings, new issues, and quality assessment',
                        outcome: 'Excellent! This provides complete verification coverage.',
                        experience: 25,
                    },
                    {
                        text: 'List all issues fixed by the client within the application release',
                        outcome: 'All aspects need reporting not just fixed issues.',
                        experience: -15
                    },
                    {
                        text: 'Document a basic status update of each existing issue within the release',
                        outcome: 'Comprehensive reporting needed is required including new issues and regression details.',
                        experience: -10
                    },
                    {
                        text: 'Document all details surrounding regression testing of the new release',
                        outcome: 'Verification needs full documentation not just regression test reporting.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Quality Assessment',
                description: 'How do you assess if additional testing is needed after verification?',
                options: [
                    {
                        text: 'Analyse fix impact, regression findings, and new issues to recommend next steps',
                        outcome: 'Perfect! This provides informed testing recommendations.',
                        experience: 25,
                    },
                    {
                        text: 'Check that all open issues within the release have been fixed',
                        outcome: 'Other factors also need to be taken into consideration like regression findings and new issues raised.',
                        experience: -15
                    },
                    {
                        text: 'Rely on client feedback so they can make a decision on additional testing',
                        outcome: 'Proactive assessment required and additional testing can be judged on regression findings and new issues raised.',
                        experience: -10
                    },
                    {
                        text: 'Await feedback from the project manager on issue verification findings to decide on additional testing',
                        outcome: 'Quality assessment is crucial and initiative should be taken on additional testing as well as informing the project manager of the outcome.',
                        experience: -5
                    }
                ]
            }
        ]
}