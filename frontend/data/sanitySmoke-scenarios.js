export const sanitySmokeScenarios = {
    // Basic Scenarios (IDs 1-10, expanded from 1-5)
    basic: [
        {
            id: 1,
            level: 'Basic',
            title: 'Understanding Sanity Testing',
            description: 'What is Sanity Testing?',
            options: [
                {
                    text: 'Sanity testing is a subset of regression testing that validates specific code changes',
                    outcome: 'Correct! Sanity testing is a subset of regression testing that focuses on verifying specific code changes and their intended functionality.',
                    experience: 15,
                },
                {
                    text: 'A comprehensive testing method that checks all system functionality',
                    outcome: 'While it checks functionality, it\'s not comprehensive and focus remains on major functionality.',
                    experience: -5
                },
                {
                    text: 'A testing approach that requires extensive documentation on the application under test',
                    outcome: 'Sanity testing is typically undocumented as it is generally performed on a build where the production deployment is required immediately.',
                    experience: -10
                },
                {
                    text: 'Sanity testing is a method to completely replace smoke testing',
                    outcome: 'Sanity testing is performed after smoke testing, not as a replacement, as smoke testing confirms that the QA team can continue with further testing.',
                    experience: 0
                }
            ]
        },
        {
            id: 2,
            level: 'Basic',
            title: 'Sanity Test Execution',
            description: 'When is Sanity Testing typically performed?',
            options: [
                {
                    text: 'At the beginning of the software development lifecycle.',
                    outcome: 'It occurs during the development process, but not at the very beginning.',
                    experience: -5
                },
                {
                    text: 'During the final user acceptance testing stage of an application',
                    outcome: 'This type of testing would be performed before user acceptance testing as all critical functional bugs should be resolved before that stage.',
                    experience: -10
                },
                {
                    text: 'After smoke testing, typically to check critical bug fixes',
                    outcome: 'Correct! Sanity testing is performed after smoke tests, usually for critical bug fixes or before immediate production deployment.',
                    experience: 15,
                },
                {
                    text: 'Sanity testing should be performed during the initial design phase of the project',
                    outcome: 'This should occur during implementation, not during initial design as functionality of the system cannot be tested during the design stage.',
                    experience: 0
                }
            ]
        },
        {
            id: 3,
            level: 'Basic',
            title: 'Understanding Smoke Testing',
            description: 'What is the primary purpose of Smoke Testing?',
            options: [
                {
                    text: 'To verify that critical features are working and there are no blocking issues that prevent further testing',
                    outcome: 'Perfect! Smoke testing is a minimal set of tests run on each build to confirm the critical features of a system are working and there are no blocking issues that would prevent further testing.',
                    experience: 15,
                },
                {
                    text: 'To completely test all software functionality within the system under test',
                    outcome: 'Smoke testing is not comprehensive and does not aim to test all functionality in depth.',
                    experience: -10
                },
                {
                    text: 'To replace functional testing within the system under test entirely',
                    outcome: 'Smoke testing is a preliminary step that precedes functional testing to identify critical issues in core functionality, not a replacement for it.',
                    experience: -5
                },
                {
                    text: 'To add additional steps to the detailed test scenarios already set out in the planning process',
                    outcome: 'While some might view it as an additional step, smoke testing is actually a crucial method to quickly identify critical issues early in the development process',
                    experience: 0
                }
            ]
        },
        {
            id: 4,
            level: 'Basic',
            title: 'Smoke Testing Execution',
            description: 'When is Smoke Testing typically performed?',
            options: [
                {
                    text: 'At the start of every new software release or when new functionality is developed and integrated',
                    outcome: 'Excellent! Smoke Testing is completed at the start of every new software release to ensure that all critical functionalities are working correctly or not.',
                    experience: 15,
                },
                {
                    text: 'Smoke testing is typically carried out during final software release',
                    outcome: 'This misunderstands the purpose of smoke testing. Waiting until the final release would defeat the purpose of early issue detection.',
                    experience: -10
                },
                {
                    text: 'At random points throughout the development process and software releases',
                    outcome: 'Smoke testing is not random but systematically performed at specific points in the development cycle, typically at the beginning of testing a new software release.',
                    experience: -5
                },
                {
                    text: 'At the preference of the tester, depending on past experience of similar projects.',
                    outcome: 'Smoke testing is not based on preference but on a structured process of verifying build stability after changes.',
                    experience: 0
                }
            ]
        },
        {
            id: 5,
            level: 'Basic',
            title: 'Performing Smoke Tests',
            description: 'Who typically performs Smoke Testing?',
            options: [
                {
                    text: 'Both development and QA teams should perform smoke testing',
                    outcome: 'Perfect! Smoke testing is normally completed by both the development team and the quality assurance team, with each playing a specific roles in identifying issues',
                    experience: 15,
                },
                {
                    text: 'Only developers should perform smoke tests',
                    outcome: 'While developers play a role, smoke testing is not exclusively their responsibility and QA teams should also perform these type of tests.',
                    experience: -10
                },
                {
                    text: 'Only quality assurance (QA) team should perform smoke tests',
                    outcome: 'QA is involved, but they are not the sole performers of smoke testing and developers should also be involved.',
                    experience: -5
                },
                {
                    text: 'External consultants should perform smoke tests',
                    outcome: 'External consultants are typically not involved in routine smoke testing processes.',
                    experience: 0
                }
            ]
        },
        {
            id: 16,
            level: 'Basic',
            title: 'Sanity Test Performance',
            description: 'Under which circumstances is sanity testing generally performed?',
            options: [
                {
                    text: 'On builds where production deployment is required immediately',
                    outcome: 'Correct! Sanity testing is a subset of regression testing and focus is on changes to specific functionality and critical surrounding areas.',
                    experience: 15,
                },
                {
                    text: 'During the initial development phase by the development team',
                    outcome: 'Sanity testing should not be restricted to the initial development phase; it can be performed whenever needed for quick validation of changes.',
                    experience: -5
                },
                {
                    text: 'After complete regression testing is finished for the release.',
                    outcome: 'Sanity testing as a subset of regression testing, not something that happens after it.',
                    experience: -10
                },
                {
                    text: 'When there is enough time for extensive testing on the release.',
                    outcome: 'Sanity testing is appropriate when time is limited, it helps in the scenario when the time for testing of the product is limited.',
                    experience: 0
                }
            ]
        },
        {
            id: 17,
            level: 'Basic',
            title: 'Sanity Test Failure',
            description: 'What happens if a sanity test fails?',
            options: [
                {
                    text: 'Any minor issue failures are documented and fixed later',
                    outcome: 'Failure should result in rejection of the software product.',
                    experience: -5
                },
                {
                    text: 'All failed components are retested by the development team',
                    outcome: 'If any components are failed they will be rejected by the test team and subsequently fixed for another round of testing for the test team.',
                    experience: -10
                },
                {
                    text: 'The software product is rejected by the testing team.',
                    outcome: 'Correct! If the sanity test fails, the software product is rejected by the testing team to save on time and money.',
                    experience: 15,
                },
                {
                    text: 'The development team performs regression testing',
                    outcome: 'The development team doesn\'t perform regression testing upon sanity test failure. The test team will perform sanity tests a subset of regression testing.',
                    experience: 0
                }
            ]
        },
        {
            id: 18,
            level: 'Basic',
            title: 'Sanity Test Scenarios',
            description: 'Why is sanity testing particularly useful in certain development scenarios?',
            options: [
                {
                    text: 'It provides comprehensive documentation for all test cases',
                    outcome: 'Sanity testing is usually undocumented, so comprehensive documentation is not a feature.',
                    experience: -5
                },
                {
                    text: 'It thoroughly tests all aspects of the application',
                    outcome: 'Sanity testing covers only a few areas in the system application rather than testing all aspects thoroughly.',
                    experience: -10
                },
                {
                    text: 'It can be carried out quickly when testing time is limited.',
                    outcome: 'Correct! Sanity tests help in the scenario when the time for testing of the product is limited.',
                    experience: 15,
                },
                {
                    text: 'It focuses primarily on design structure issues',
                    outcome: 'Emphasis should be on detailed documentation, not minimal detail that requires interpretation.',
                    experience: 0
                }
            ]
        },
        {
            id: 19,
            level: 'Basic',
            title: 'Smoke Test Advantage',
            description: 'What is the main advantage of smoke testing?',
            options: [
                {
                    text: 'It reduces the risk of major bugs not being identified in software',
                    outcome: 'Correct! It reduces the risk of major bugs not being identified in software, as it focusses is on functionality critical to the system under test.',
                    experience: 15,
                },
                {
                    text: 'It eliminates the need for functional testing for the system under test',
                    outcome: 'Smoke testing is a precursor to functional testing, not a replacement',
                    experience: -10
                },
                {
                    text: 'It ensures the software will be free of defects when released.',
                    outcome: 'While smoke testing improves quality, it doesn\'t guarantee the software will be completely free of defects.',
                    experience: -5
                },
                {
                    text: 'It identifies all possible bugs in the system under test.',
                    outcome: 'Smoke testing focuses on critical functionality rather than attempting to find all possible bugs.',
                    experience: 0
                }
            ]
        },
        {
            id: 20,
            level: 'Basic',
            title: 'Smoke Test Failures',
            description: 'What should happen to all smoke test failures',
            options: [
                {
                    text: 'Smoke test failures should be raised as critical issues',
                    outcome: 'Correct! They should be raised as critical issues as they focus on functionality critical to the system under test.',
                    experience: 15,
                },
                {
                    text: 'They should be documented and fixed in the next sprint',
                    outcome: 'Smoke tests should halt testing for any related area and be addressed immediately.',
                    experience: -10
                },
                {
                    text: 'They should be prioritised based on severity',
                    outcome: 'All smoke test failures should be deemed critical to functionality.',
                    experience: -5
                },
                {
                    text: 'They should be ignored if they don\'t affect core functionality',
                    outcome: 'Smoke tests specifically check core functionality, so failures should never be ignored.',
                    experience: 0
                }
            ]
        }
    ],
    // Intermediate Scenarios (IDs 6-10, 100 XP total, 20 XP each)
    intermediate: [
        {
            id: 6,
            level: 'Intermediate',
            title: 'Sanity Test Features',
            description: 'What are the key features of Sanity Testing?',
            options: [
                {
                    text: 'A narrow and deep approach with limited, in-depth functionality testing',
                    outcome: 'Excellent! Sanity testing is characterised by a narrow and deep approach, focusing on limited functionality in depth.',
                    experience: 20,     
                },
                {
                    text: 'Sanity testing is characterised by a scripted and extensively documented approach',
                    outcome: 'Sanity testing is typically unscripted and undocumented as it is generally performed on a build where the production deployment is required immediately.',
                    experience: -15
                },
                {
                    text: 'Sanity testing is characterised by comprehensive coverage of all system functionality',
                    outcome: 'While it checks functionality, it\'s not comprehensive and focus remains on major functionality.',
                    experience: -10
                },
                {
                    text: 'Sanity testing is characterised as being designed to replace full regression testing',
                    outcome: 'This is generally a subset of regression testing that focus on critical areas of the system and not a replacement.',
                    experience: -5
                }
            ]
        },
        {
            id: 7,
            level: 'Intermediate',
            title: 'Sanity Check Risks',
            description: 'What is a key disadvantage of Sanity Testing?',
            options: [
                {
                    text: 'It covers only a few areas and can miss issues in unchecked system functionality',
                    outcome: 'Sanity testing focuses on a narrow range of functionalities, which means potential issues in unchecked areas might go undetected.',
                    experience: 20,
                },
                {
                    text: 'It can be too time-consuming and expensive to execute the tests',
                    outcome: 'It\'s actually less time-consuming and less expensive as it only focus\' on limited functionality.',
                    experience: -15
                },
                {
                    text: 'This type of approach can require too much documentation',
                    outcome: 'Exploratory testing requires less documentation than scripted testing.',
                    experience: -10
                },
                {
                    text: 'Sanity testing requires extensive documentation during planning',
                    outcome: 'Sanity testing is typically undocumented as it is generally performed on a build where the production deployment is required immediately.',
                    experience: -5
                }
            ]
        },
        {
            id: 8,
            level: 'Intermediate',
            title: 'Failed Smoke Test Process',
            description: 'What is the general process if a Smoke Test fails?',
            options: [
                {
                    text: 'Testing is halted for that area of functionality, and the build is returned to development',
                    outcome: 'If a smoke test fails, it typically results in testing being halted for that area of functionality. The system would be handed back to the development team for correction, whilst functional testing on other areas can still be performed.',
                    experience: 20,
                },
                {
                    text: 'The software can be released as smoke tests generally don\'t detect issues in critical functionality',
                    outcome: 'A failed smoke test prevents the software from proceeding to further testing or release as an issue in this area would relate to critical functionality.',
                    experience: -15
                },
                {
                    text: 'Testing can continue as normal if a smoke test has failed as critical functionality will remain unaffected',
                    outcome: 'Testing cannot continue normally if critical functionalities are not working and smoke tests are designed to be carried out on critical functionality.',
                    experience: -10
                },
                {
                    text: 'Smoke test failures can be left out of documentation if they are only minor issues',
                    outcome: 'All failures must be documented if they are related to critical functionality.',
                    experience: -5
                }
            ]
        },
        {
            id: 9,
            level: 'Intermediate',
            title: 'Smoke Testing Benefits',
            description: 'How does Smoke Testing benefit the software development process?',
            options: [
                {
                    text: 'It helps identify critical bugs early and aligns teams on the software\'s current state',
                    outcome: 'Perfect! Smoke testing plays a crucial role by capturing the state of the software early, saving test effort, and bringing teams to a known state.',
                    experience: 20,
                },
                {
                    text: 'It increases development time, therefore decreasing testing activity time',
                    outcome: 'While smoke testing takes some time, it actually helps prevent longer delays by catching critical issues early in the process.',
                    experience: -15
                },
                {
                    text: 'It has no significant impact on the software cycle development process',
                    outcome: 'Smoke testing plays a crucial role in identifying and preventing potential issues early in the development process.',
                    experience: -10
                },
                {
                    text: 'It completely eliminates the need for other testing methods within the software development lifecycle process',
                    outcome: 'While valuable, smoke testing does not replace other testing methods but is an important preliminary step.',
                    experience: -5
                }
            ]
        },
        {
            id: 10,
            level: 'Intermediate',
            title: 'Smoke And Functional Testing',
            description: 'What is the relationship between Smoke Testing and Functional Testing?',
            options: [
                {
                    text: 'Smoke testing is a prerequisite for comprehensive functional testing',
                    outcome: 'Excellent! Smoke testing is a confirmation for the QA team to proceed with further software testing. Only after smoke tests pass can the team move on to comprehensive functional testing.',
                    experience: 20,
                },
                {
                    text: 'Smoke testing and functional testing are completely unrelated testing methods',
                    outcome: 'Smoke testing and functional testing are closely related in the software testing process and share many of the same approaches.',
                    experience: -15
                },
                {
                    text: 'Functional testing always replaces smoke testing within the system under test',
                    outcome: 'Functional testing builds upon smoke testing and doesn\'t replace it.',
                    experience: -10
                },
                {
                    text: 'These terms can be used interchangeably for a testing approach to a system under test',
                    outcome: 'While related, these are distinct testing methodologies with different purposes and scopes.',
                    experience: -5
                }
            ]
        }
    ],

    // Advanced Scenarios (IDs 11-15, 125 XP total, 25 XP each)
    advanced: [
        {
            id: 11,
            level: 'Advanced',
            title: 'Sanity And Smoke Testing',
            description: 'How does Sanity Testing differ from Smoke Testing?',
            options: [
                {
                    text: 'Sanity testing is performed after smoke testing to verify specific code changes',
                    outcome: 'Perfect! Sanity testing focuses on verifying a specific code change/critical bug fix and its intended functionality. Smoke testing is performed at the beginning of every new release and focus is on all critical functionality.',
                    experience: 25,
                },
                {
                    text: 'Both sanity and smoke testing employ exactly the same testing methodology',
                    outcome: 'They are distinct testing methodologies with different purposes.',
                    experience: -15
                },
                {
                    text: 'Smoke testing is more detailed and covers all system functionalities',
                    outcome: 'Smoke testing is actually less detailed compared to sanity testing.',
                    experience: -10
                },
                {
                    text: 'Sanity testing requires more resources and time than smoke testing does',
                    outcome: 'Sanity testing is less resource-intensive compared to other testing methods.',
                    experience: -5
                }
            ]
        },
        {
            id: 12,
            level: 'Advanced',
            title: 'Sanity Check Primary Goal',
            description: 'In the context of software development, what is the primary goal of Sanity Testing?',
            options: [
                {
                    text: 'Sanity testing is a stoppage to check whether testing for the build can proceed or not',
                    outcome: 'Excellent! The primary goal is to quickly identify critical defects in core functionalities, helping teams decide whether further testing is worthwhile',
                    experience: 25,
                },
                {
                    text: 'To completely eliminate all software bugs within the system under test',
                    outcome: 'Testing can help identify defects but it does noy eliminate all bugs',
                    experience: -15
                },
                {
                    text: 'To help to create comprehensive test documentation for the system under test',
                    outcome: 'Sanity testing is typically undocumented as it is generally performed on a build where the production deployment is required immediately.',
                    experience: -10
                },
                {
                    text: 'Sanity testing helps to replace the need for developer fixes through thorough testing',
                    outcome: 'Sanity testing complements developer efforts, not replaces them, as testers do not fix defects and only report on them.',
                    experience: -5
                }
            ]
        },
        {
            id: 13,
            level: 'Advanced',
            title: 'Smoke Test Characteristics',
            description: 'What are the key characteristics of an effective smoke test?',
            options: [
                {
                    text: 'A minimal set of tests focusing on critical functionality within the system under test',
                    outcome: 'Perfect! Effective smoke tests are characterised by being a minimal set of tests that focus on critical functionalities.',
                    experience: 25,
                },
                {
                    text: 'Long and detailed test cases that focus on critical functionality within the system under test',
                    outcome: 'Effective smoke tests are minimal and focused, not exhaustive.',
                    experience: -15
                },
                {
                    text: 'Tests that cover every possible user scenario within the system under test',
                    outcome: 'Comprehensive scenario testing is part of functional testing, not smoke testing.',
                    experience: -10
                },
                {
                    text: 'Random testing areas without a specific focus to gain the most coverage within the project time frame',
                    outcome: 'While not completely random, smoke tests do require strategic selection of critical test cases.',
                    experience: -5
                }
            ]
        },
        {
            id: 14,
            level: 'Advanced',
            title: 'Smoke Test Team Approach',
            description: 'How do development and QA teams typically approach smoke testing differently?',
            options: [
                {
                    text: 'Development teams conduct initial sanity checks, while QA teams determine major functionality to verify the build\'s stability',
                    outcome: 'Excellent! Developers use smoke tests to verify basic functionality (sanity checks) during the development phase, while QA teams determine and test the major functionalities to ensure the build\'s overall stability before proceeding with further testing.',
                    experience: 25,
                },
                {
                    text: 'Developers use smoke tests for basic sanity checks during code development',
                    outcome: 'While developers do perform initial sanity checks, this is just a part of their smoke testing approach when verifying basic functionality before submitting the build.',
                    experience: -15
                },
                {
                    text: 'A QA teams smoke test is comprehensive and covers all possible scenarios whilst developers only use minimal sanity checks',
                    outcome: 'QA smoke testing focuses on critical functionalities, not exhaustive testing. This approach would defeat the purpose of a quick, preliminary test.',
                    experience: -10
                },
                {
                    text: 'Developers perform detailed functional testing before QA involvement',
                    outcome: 'Developers focus on basic functionality verification, not comprehensive functional testing. This misunderstands the roles of development and QA teams in the testing process.',
                    experience: -5
                }
            ]
        },
        {
            id: 15,
            level: 'Advanced',
            title: 'Smoke Test Inclusion',
            description: 'What are the potential consequences of skipping smoke testing in the software development process?',
            options: [
                {
                    text: 'Major defects may be encountered in later stages, affecting project timelines and resource allocation',
                    outcome: 'Perfect! Without smoke testing, critical issues might only be discovered during later stages of development or testing, which can substantially impact project timelines, resource allocation, and overall project efficiency.',
                    experience: 25,
                },
                {
                    text: 'There should be no significant impact on the software development timeline',
                    outcome: 'Skipping smoke testing can lead to major defects being discovered late in the development process, potentially causing significant delays and increased costs.',
                    experience: -15
                },
                {
                    text: 'Project timelines are kept on schedule and deliverables can be met ahead of time',
                    outcome: 'While this approach could reduce testing time, it could also prolong them if critical issues are missed earlier in testing activites',
                    experience: -10
                },
                {
                    text: 'Other testing methodologies become more efficient in detecting critical issues',
                    outcome: 'Alternative testing methods might catch some issues, but not with the same efficiency and early-stage intervention.',
                    experience: -5
                }
            ]
        }
    ]
}