export const buildVerificationScenarios = {
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Understanding BVT',
                description: 'What is the primary purpose of Build Verification Testing?',
                options: [
                    {
                        text: 'To ensure core functionality and stability remain intact in each new build before further testing',
                        outcome: 'Perfect! BVT validates build stability and readiness.',
                        experience: 15,
                        tool: 'Build Verification Framework'
                    },
                    {
                        text: 'To find all possible bugs related to the release',
                        outcome: 'BVT focuses on core functionality, not exhaustive testing.',
                        experience: -5
                    },
                    {
                        text: 'To test new features for upcoming sprints',
                        outcome: 'BVT checks existing core functionality.',
                        experience: -10
                    },
                    {
                        text: 'To document all issues relating to functionality',
                        outcome: 'BVT primarily validates build stability.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Test Case Development',
                description: 'How should you develop BVT test cases?',
                options: [
                    {
                        text: 'Create repeatable tests focusing on critical functionality with well-defined expected results',
                        outcome: 'Excellent! Well-defined test cases ensure consistent verification.',
                        experience: 15,
                        tool: 'Test Case Template'
                    },
                    {
                        text: 'Test everything possible for each release',
                        outcome: 'BVT needs focused, critical test cases and exhaustive testing is generally not possible.',
                        experience: -5
                    },
                    {
                        text: 'Create test cases based on tester experience and preference',
                        outcome: 'Test cases must be structured and repeatable.',
                        experience: -10
                    },
                    {
                        text: 'Leave test case documentation in favour of test execution',
                        outcome: 'Documentation is crucial for consistency.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Core Functionality',
                description: 'What should you verify first in BVT?',
                options: [
                    {
                        text: 'Key areas like installation, login, and main navigation that are critical to basic operation',
                        outcome: 'Perfect! Core functionality must be verified first.',
                        experience: 15,
                        tool: 'Core Function Checklist'
                    },
                    {
                        text: 'Multiple minor visual issues should be reported thoroughly',
                        outcome: 'Focus on critical functionality must be the first priority.',
                        experience: -10
                    },
                    {
                        text: 'New features should be the focus of any new release',
                        outcome: 'Core functionality needs verification as focusing on just new features can miss issues in other areas.',
                        experience: -5
                    },
                    {
                        text: 'Documentation errors should take priority, as this can lead to blocking issues with testing activities',
                        outcome: 'Critical operations should take priority as testing can be carried out if core functionality of the application behaves as intended.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Environment Setup',
                description: 'How do you prepare for BVT across different environments?',
                options: [
                    {
                        text: 'Include test suites for each environment type with appropriate environment-specific checks',
                        outcome: 'Excellent! Environment-specific testing ensures comprehensive coverage.',
                        experience: 15,
                        tool: 'Environment Matrix'
                    },
                    {
                        text: 'Test one primary environment as all other environments should follow the same functionality',
                        outcome: 'All relevant supported environments need verification.',
                        experience: -10
                    },
                    {
                        text: 'Leave environment planning until all other priority documentation and execution has been completed',
                        outcome: 'Environment planning is crucial for coverage within set out time constraints.',
                        experience: -5
                    },
                    {
                        text: 'Use the same tests for all environments that are supported for the project',
                        outcome: 'Environment-specific tests are required as not all perform the same functionality.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Issue Handling',
                description: 'How should you handle issues found during BVT?',
                options: [
                    {
                        text: 'Report major functional issues immediately and request a new build for critical failures',
                        outcome: 'Perfect! Quick reporting of critical issues is essential.',
                        experience: 15,
                        tool: 'Issue Tracker'
                    },
                    {
                        text: 'Continue with the tests set out in project planning',
                        outcome: 'Critical issues need immediate attention and documenting.',
                        experience: -10
                    },
                    {
                        text: 'Attempt to look for a fix resolution to the issues yourself',
                        outcome: 'Issues must be reported for full and proper resolution so the tester can continue with testing activities.',
                        experience: -5
                    },
                    {
                        text: 'Document all minor issues found during build verification testing',
                        outcome: 'While minor issues need documenting, major issues need priority attention.',
                        experience: 0
                    }
                ]
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Build Verification Test Suites',
                description: 'How are test suites typically organised in Build Verification Testing at Zoonou?',
                options: [
                    {
                        text: 'Test suites are organised by environment type',
                        outcome: 'Correct! Build Verification Test suites are broken down by environment, rather than focus areas. This means the same or a very similar set of tests can be executed for each suite, aside from any key areas that may differ between environments.',
                        experience: 15,
                        tool: 'Build Verification Test Suites'
                    },
                    {
                        text: 'Test suites are organised by feature complexity',
                        outcome: 'Test suites are organised by environment type and not feature complexity.',
                        experience: -5
                    },
                    {
                        text: 'Test suites are organised by the development team',
                        outcome: 'Test suites are organised by environment type and not by the development team.',
                        experience: -10
                    },
                    {
                        text: 'Test suites are organised by the expected execution time',
                        outcome: 'Test suites are organised by environment type and not by expected execution time.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Build Verification Characteristics',
                description: 'Which of the following is not considered a characteristic of Build Verification Testing according to the guide?',
                options: [
                    {
                        text: 'Acceptance is a characteristic of build verification testing',
                        outcome: 'Acceptance is a characteristic and is defined as establishing approval that the software has met specifications.',
                        experience: -5
                    },
                    {
                        text: 'Validation is a characteristic of build verification testing',
                        outcome: 'Validation is a characteristic and is defined as checking software integrity ahead of further testing.',
                        experience: -10
                    },
                    {
                        text: 'Customisation is a characteristic of build verification testing',
                        outcome: 'Correct! this is not a characteristic of build verification testing such as Acceptance, Validation, Regression, and Efficiency.',
                        experience: 15,
                        tool: 'Build Verification Characteristics'
                    },
                    {
                        text: 'Regression is a characteristic of build verification testing',
                        outcome: 'Regression is a characteristic and is defined as developing a set of test cases to check critical functionality and that no new bugs have been introduced as a result of development activities.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Build Verification Issue Types',
                description: 'What type of issues are primarily focused on during Build Verification Testing?',
                options: [
                    {
                        text: 'Minor visual inconsistencies should be the main focus.',
                        outcome: 'Minor visual inconsistencies would fall under less severe issues which are not the focus of BVT.',
                        experience: -5
                    },
                    {
                        text: 'Documentation errors should be the main focus',
                        outcome: 'Documentation errors would fall under less severe issues which are not the focus of BVT.', 
                        experience: -10
                    },
                    {
                        text: 'Critical functionality issues should be the main focus',
                        outcome: 'Correct! Build Verification Testing does not focus on the less severe issues that may be present and looks mostly at critical functionality.',
                        experience: 15,
                        tool: 'Build Verification Issue Types'
                    },
                    {
                        text: 'Performance under heavy load should be the main focus',
                        outcome: 'While performance could be considered important, the focus of BVT should be on core functionality rather than performance testing specifically.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Build Verification Risks',
                description: 'What is one of the risks associated with Build Verification Testing?',
                options: [
                    {
                        text: 'Test cases need to be kept up to date throughout development',
                        outcome: 'Correct! Build Verification Testing test cases must be kept up to date throughout the development process, to include any new features developed. Failing to keep tests updated may lead to under-tested areas or bugs going undetected.',
                        experience: 15,
                        tool: 'Build Verification Risks'
                    },
                    {
                        text: 'It takes too long to execute compared to other testing methods',
                        outcome: 'BVT is efficient and can save time by identifying issues early, not that the testing takes too long.',
                        experience: -10
                    },
                    {
                        text: 'It requires too many testing resources to be practical',
                        outcome: 'Build verification testing can actually save time & money by finding bugs early.',
                        experience: -5
                    },
                    {
                        text: 'Build verification testing cannot be automated',
                        outcome: 'Build verification testing may be automated even though Zoonou currently conducts it manually.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Build Verification Advantages',
                description: 'Which of the following is not mentioned as an advantage of Build Verification Testing?',
                options: [
                    {
                        text: 'Eliminating the need for further testing is an advantage of build verification testing',
                        outcome: 'Correct! BVT does not eliminate the need for further testing. On the contrary, it emphasises that BVT ensures the software is ready for further testing and integration.',
                        experience: 15,
                        tool: 'Build Verification Advantages'
                    },
                    {
                        text: 'Increasing confidence in builds is an advantage of build verification testing',
                        outcome: 'Build verification testing increases confidence in builds, resolving bugs early in the development lifecycle, therefore is an advantage.',
                        experience: -10
                    },
                    {
                        text: 'Saving time and money by finding bugs early is an advantage of build verification testing',
                        outcome: 'Build verification testing can save time & money, picking up bugs early, before they potentially become more costly or time consuming to fix, therefore is an advantage.',
                        experience: -5
                    },
                    {
                        text: 'Helping establish software stability is an advantage of build verification testing',
                        outcome: 'Build verification testing establishes the stability of the software, therefore is an advantage.',
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
                title: 'Test Case Maintenance',
                description: 'How do you maintain BVT test cases over time?',
                options: [
                    {
                        text: 'Regularly update test cases to include new core features and maintain accuracy',
                        outcome: 'Excellent! Test case maintenance ensures continued effectiveness.',
                        experience: 20,
                        tool: 'Test Case Manager'
                    },
                    {
                        text: 'Keep and execute original test cases only',
                        outcome: 'Test cases need regular updates as there are constant changes to build process and features.',
                        experience: -15
                    },
                    {
                        text: 'Remove old test cases from the test script as new features should be the sole focus',
                        outcome: 'Updating existing test cases is required, as the removal of old test cases can result in missed feature processes.',
                        experience: -10
                    },
                    {
                        text: 'Reduce new feature update test cases to save on time management for new releases',
                        outcome: 'New core features are essential and require coverage.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Regression Prevention',
                description: 'How does BVT help prevent regression issues?',
                options: [
                    {
                        text: 'It verifies critical functionality in each build to catch issues before they affect other modules',
                        outcome: 'Perfect! Early detection prevents regression spread.',
                        experience: 20,
                        tool: 'Regression Checker'
                    },
                    {
                        text: 'It focuses on testing new code only',
                        outcome: 'Existing functionality also needs verification through existing test cases.',
                        experience: -15
                    },
                    {
                        text: 'It can be a factor in skipping more regular testing activities',
                        outcome: 'Consistent testing does not skip the need for regular testing activities, although can help to prevent the need for full regression testing.',
                        experience: -10
                    },
                    {
                        text: 'It can be a factor in preventing verification testing of previous issues',
                        outcome: 'This is untrue as all previous fixes need verification testing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Resource Management',
                description: 'How do you manage resources efficiently during BVT?',
                options: [
                    {
                        text: 'Allocate appropriate time and testers based on build scope and complexity',
                        outcome: 'Excellent! Proper resource allocation ensures thorough verification.',
                        experience: 20,
                        tool: 'Resource Planner'
                    },
                    {
                        text: 'Use minimal resources regardless of project size',
                        outcome: 'Adequate resources are needed for coverage.',
                        experience: -15
                    },
                    {
                        text: 'Over allocate resources to complete build verification testing under the agreed time frame',
                        outcome: 'While over allocation can help in complex projects, efficient resource usage is most important for BVT testing.',
                        experience: -10
                    },
                    {
                        text: 'Spend the least time regarding testing activities on resource planning',
                        outcome: 'Resource planning ensures efficiency and mistakes in this area can have a knock-on effect further on into the testing process.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Build Acceptance',
                description: 'When should a build be accepted for further testing?',
                options: [
                    {
                        text: 'When all critical functionality passes testing and no blocking issues are found',
                        outcome: 'Perfect! Build stability is crucial for further testing.',
                        experience: 20,
                        tool: 'Acceptance Criteria'
                    },
                    {
                        text: 'All builds should be accepted for further testing activities',
                        outcome: 'Builds must meet stability criteria before being submitted.',
                        experience: -15
                    },
                    {
                        text: 'Builds should be accepted if any minor issues are still present',
                        outcome: 'Critical functionality must work and this includes minor issues if they affect functionality.',
                        experience: -10
                    },
                    {
                        text: 'When build verification is 80% complete according to what set out in the planning stages',
                        outcome: 'Verification ensures build quality and any missed areas can result in major issues.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Documentation Review',
                description: 'How should you handle BVT documentation?',
                options: [
                    {
                        text: 'Maintain clear test cases, expected results, and execution records for each build',
                        outcome: 'Excellent! Documentation ensures consistency and traceability.',
                        experience: 20,
                        tool: 'Documentation Template'
                    },
                    {
                        text: 'Minimal documentation is required to be able to focus on test execution',
                        outcome: 'Documentation is crucial for BVT to maintain consistency and traceability.',
                        experience: -15
                    },
                    {
                        text: 'Document failures only as this is the main concern of build verification testing',
                        outcome: 'All results require documentation for traceability.',
                        experience: -10
                    },
                    {
                        text: 'Use informal notes and submit these regularly to speed up the process',
                        outcome: 'Structured documentation is always required for consistency.',
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
                title: 'Process Improvement',
                description: 'How do you improve BVT processes over time?',
                options: [
                    {
                        text: 'Analyse effectiveness, gather feedback, and update processes based on project needs',
                        outcome: 'Perfect! Continuous improvement enhances BVT effectiveness.',
                        experience: 25,
                        tool: 'Process Analyser'
                    },
                    {
                        text: 'Keep the existing processes as this will promote familiarity and speed up the process',
                        outcome: 'Processes need regular updates to keep up to date with new features and requirements changes.',
                        experience: -15
                    },
                    {
                        text: 'Change processes on tester experience and preference basis',
                        outcome: 'Changes need proper analysis and not by tester preference.',
                        experience: -10
                    },
                    {
                        text: 'Take into consideration feedback on a minimal basis',
                        outcome: 'Feedback is essential and drives improvement.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Integration Planning',
                description: 'How do you plan BVT for module integration?',
                options: [
                    {
                        text: 'Verify individual modules and their interactions with comprehensive integration tests',
                        outcome: 'Excellent! Integration testing ensures module compatibility.',
                        experience: 25,
                        tool: 'Integration Planner'
                    },
                    {
                        text: 'Test one module for integration, as once one is verified other connected modules should follow suit',
                        outcome: 'All modules need verification at the risk of missing major issues.',
                        experience: -15
                    },
                    {
                        text: 'Leave integration testing in favour of making up time for functionality testing',
                        outcome: 'Integration testing is crucial to the BVT process and if missed can cause major issues with compatibility.',
                        experience: -10
                    },
                    {
                        text: 'Assume compatibility for all modules once one interaction is completed successfully',
                        outcome: 'All module interaction tests require completing for optimal coverage.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Team Communication',
                description: 'How do you manage communication during BVT?',
                options: [
                    {
                        text: 'Maintain clear channels with development team and stakeholders for quick issue resolution',
                        outcome: 'Perfect! Effective communication ensures quick resolution.',
                        experience: 25,
                        tool: 'Communication Plan'
                    },
                    {
                        text: 'Work in isolation until build verification is complete and a test report can be submitted',
                        outcome: 'Team communication is essential for quick resolution to potential issues.',
                        experience: -15
                    },
                    {
                        text: 'Delay issue reporting in favour test coverage',
                        outcome: 'Quick communication is needed and issues can sometimes be mitigated quickly.',
                        experience: -10
                    },
                    {
                        text: 'Report to one person within the project development team',
                        outcome: 'All stakeholders require updates on progress and issues to form action plans going forward.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Risk Management',
                description: 'How do you manage risks in BVT?',
                options: [
                    {
                        text: 'Identify potential risks, prioritise critical areas, and maintain contingency plans',
                        outcome: 'Excellent! Risk management ensures BVT effectiveness.',
                        experience: 25,
                        tool: 'Risk Assessment'
                    },
                    {
                        text: 'Attention to risk management should only be pursued when all functional tasks have been completed',
                        outcome: 'Risk management is crucial and should be set out in the planning stages.',
                        experience: -15
                    },
                    {
                        text: 'Handle issues as they occur throughout the functional build verification process',
                        outcome: 'Proactive risk management is required in planning stages to mitigate any potential project risks.',
                        experience: -10
                    },
                    {
                        text: 'Focus on multiple minor risks during the testing process',
                        outcome: 'Critical risks should be prioritised first and decisions can be made by stakeholders on minor risks taking time constraints and user impact into consideration.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Quality Metrics',
                description: 'How do you measure BVT effectiveness?',
                options: [
                    {
                        text: 'Track pass rates, issue detection, and prevention of critical defects in later testing',
                        outcome: 'Perfect! Metrics help evaluate and improve BVT.',
                        experience: 25,
                        tool: 'Quality Dashboard'
                    },
                    {
                        text: 'Count total test completion only for test coverage reporting',
                        outcome: 'Multiple metrics are required for a measured outcome. Including pass and failure rates.',
                        experience: -15
                    },
                    {
                        text: 'By minimal tracking of measurements, as functional testing takes priority',
                        outcome: 'Metrics and measurements are equally as important as they guide future improvement.',
                        experience: -10
                    },
                    {
                        text: 'Track time only to make sure project time lines are met',
                        outcome: 'Quality metrics are also crucial for a measured and affective outcome on improvement.',
                        experience: -5
                    }
                ]
            }
    ]
};