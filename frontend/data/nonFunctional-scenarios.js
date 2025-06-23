export const nonFunctionalScenarios = {
    // Basic Scenarios (IDs 1-5)
    basic: [
        {
            id: 1,
            level: 'Basic',
            title: 'Understanding Non-Functional Testing',
            description: 'What is the primary focus of non-functional testing?',
            options: [
                {
                    text: 'Testing how the system performs and operates, rather than what specific functions it does',
                    outcome: 'Perfect! Non-functional testing focuses on system characteristics and performance.',
                    experience: 15,
                },
                {
                    text: 'Testing if specific user actions meet requirements criteria',
                    outcome: 'This type testing is related to functional testing. Non-functional testing examines system characteristics.',
                    experience: -5
                },
                {
                    text: 'To test if the application features meet requirements criteria',
                    outcome: 'Non-functional testing goes beyond feature testing and focus include performance and security testing.',
                    experience: -10
                },
                {
                    text: 'To test for defects in the code structure of the system under test',
                    outcome: 'Non-functional testing focuses on system behaviour and performance rather than actual code structure.',
                    experience: 0
                }
            ]
        },
        {
            id: 2,
            level: 'Basic',
            title: 'Non-functional Test Types',
            description: 'Which of the following is not a type of non-functional testing?',
            options: [
                {
                    text: 'Performance testing',
                    outcome: 'Performance testing is a key type of non-functional testing that verifies how well the system works based on response time and throughput.',
                    experience: -5,
                },
                {
                    text: 'Unit testing',
                    outcome: 'Correct! Unit testing is a type of functional testing that focuses on testing individual units or components of code, not the non-functional aspects of a system.',
                    experience: 15
                },
                {
                    text: 'Security testing',
                    outcome: 'Security testing is a type of non-functional testing, it\'s specifically focused on identifying vulnerabilities and ensuring data protection, which is one aspect of non-functional requirements.',
                    experience: -10
                },
                {
                    text: 'Load testing',
                    outcome: 'Load testing is a type of non-functional testing that checks how the system responds when the volume of data passing through it is increased.',
                    experience: 0
                }
            ]
        },
        {
            id: 3,
            level: 'Basic',
            title: 'Functional and Non-Functional Differences',
            description: 'What is the main difference between functional and non-functional testing?',
            options: [
                {
                    text: 'Functional testing is based on customer requirements while non-functional testing is based on the software\'s performance based on external factors',
                    outcome: 'Perfect! Functional testing verifies if the system works according to specified requirements, while non-functional testing addresses expectations about how well the system performs.',
                    experience: 15,
                },
                {
                    text: 'Functional testing is automated while non-functional testing is always manual',
                    outcome: 'Both functional and non-functional testing can be performed using either manual or automated approaches, depending on the specific requirements and context.', 
                    experience: -10
                },
                {
                    text: 'Functional testing is important while non-functional testing is optional',
                    outcome: 'While non-functional features aren\'t mandatory for a system to operate, this type of testing is just as important as functional testing for ensuring overall quality.',
                    experience: -5
                },
                {
                    text: 'Functional testing is performed by users while non-functional testing is performed by developers',
                    outcome: 'Both types of testing are typically performed by testers or QA professionals, not necessarily developers or end users.',
                    experience: 0
                }
            ]
        },
        {
            id: 4,
            level: 'Basic',
            title: 'Inclusive Testing',
            description: 'Which type of non-functional testing evaluates the software\'s usability for all users, including those with disabilities?',
            options: [
                {
                    text: 'Accessibility testing',
                    outcome: 'Excellent! Accessibility testing specifically evaluates the software\'s usability for all users, including those with visual, hearing, physical, cognitive, and developmental impairments, often against guidelines like WCAG.',
                    experience: 15,
                },
                {
                    text: 'Performance testing',
                    outcome: 'Performance testing verifies how well the system works based on response time and throughput, not accessibility for users with disabilities.',
                    experience: -10
                },
                {
                    text: 'Usability testing',
                    outcome: 'While usability testing does focus on the user experience and how user-friendly an application is, it doesn\'t specifically target accessibility for users with disabilities',
                    experience: -5
                },
                {
                    text: 'Compatibility testing',
                    outcome: 'Compatibility testing checks if the application is compatible with different hardware or software platforms, not specifically related to accessibility for users with disabilities.',
                    experience: 0
                }
            ]
        },
        {
            id: 5,
            level: 'Basic',
            title: 'Non-Functional Characteristics',
            description: 'What is a key characteristic of non-functional testing?',
            options: [
                {
                    text: 'It should be measurable and not use subjective characterisations',
                    outcome: 'Perfect! Non-functional testing should be measurable, so there is no place for subjective characterisation, such as good, better, best, etc. Measurements provide objective evaluation criteria.',
                    experience: 15,
                },
                {
                    text: 'It should be subjective and based on tester opinion and experience',
                    outcome: 'While some aspects of non-functional testing (like usability) might involve user experience, non-functional testing should avoid subjective characterisation and should be measurable.',
                    experience: -10
                },
                {
                    text: 'This type of testing is only necessary for large-scale enterprise applications',
                    outcome: 'Non-functional testing is important for all software applications regardless of size or target audience, as it ensures qualities like performance, security, and usability.',
                    experience: -5
                },
                {
                    text: 'It is less important than functional testing as the system under test should focus on features first',
                    outcome: 'Non-functional testing is just as important as functional testing, as both ensure the product works as it should.',
                    experience: 0
                }
            ]
        }
    ],

    intermediate: [
        {
            id: 6,
            level: 'Intermediate',
            title: 'Non-Functional Testing Advantages',
            description: 'What is a key advantage of non-functional testing?',
            options: [
                {
                    text: 'It improves user satisfaction by ensuring good usability and meeting performance expectations',
                    outcome: 'Excellent! Non-functional testing ensures the system has good usability and meets user expectations for performance and security, which increases user satisfaction.',
                    experience: 20,
                },
                {
                    text: 'It requires fewer resources than other types of testing and can help meet project deadlines',
                    outcome: 'While there is a smaller overall time commitment compared to other testing procedures, this doesn\'t necessarily mean fewer resources, and it\'s not the key advantage of non-functional testing.', 
                    experience: -15
                },
                {
                    text: 'It eliminates the need for functional testing and therefore can use less resources',
                    outcome: 'Non-functional testing complements functional testing; it doesn\'t replace it. Both are necessary for comprehensive quality assurance.',
                    experience: -10
                },
                {
                    text: 'This type of testing is faster to execute than functional testing',
                    outcome: 'The speed of execution depends on the specific tests being performed, not on whether they are functional or non-functional.',
                    experience: -5
                }
            ]
        },
        {
            id: 7,
            level: 'Intermediate',
            title: 'No-Functional Limitations',
            description: 'Which of the following is a limitation or disadvantage of non-functional testing?',
            options: [
                {
                    text: 'Non-functional requirements can be difficult to measure and test',
                    outcome: 'Perfect! Measuring and testing non-functional requirements can be challenging.',
                    experience: 20,
                },
                {
                    text: 'Non-functional testing always requires specialised hardware',
                    outcome: ' While some types of non-functional testing (like performance or compatibility testing) might benefit from specialised hardware or environments, not all non-functional testing requires it.',
                    experience: -15
                },
                {
                    text: 'Non-functional testing doesn\'t find bugs critical to the system under test',
                    outcome: 'Non-functional testing can identify critical issues related to performance, security, usability, etc., which can be just as important as functional bugs.',
                    experience: -10
                },
                {
                    text: 'Non-functional testing can only be performed after production release',
                    outcome: ' Non-functional testing should be performed throughout the development lifecycle, not just after release. Early identification of non-functional issues can prevent costly rework later.',
                    experience: -5
                }
            ]
        },
        {
            id: 8,
            level: 'Intermediate',
            title: 'Non-Functional Test Case',
            description: 'In the context of the Zoonou non-functional testing approach, what action should be taken when a test case fails?',
            options: [
                {
                    text: 'Record the failure with issue number in the tracker and add relevant notes',
                    outcome: 'When conducting non-functional tests, the tester should record the result (Pass, Fail, Blocked), and for failed tests, include the issue number from the bug tracker and add relevant notes about the failure.',
                    experience: 20,
                },
                {
                    text: 'Immediately fix the issue in the code or request access to the code',
                    outcome: 'While fixing the issue is ultimately necessary, the tester\'s immediate responsibility is to document the failure properly so it can be addressed through the appropriate process. The tester may not be the person responsible for fixing the code.',
                    experience: -15
                },
                {
                    text: 'Leave the test case and continue with other, more important functionality test cases',
                    outcome: 'Failed tests should be properly documented, not skipped, as they represent real issues that need to be addressed.',
                    experience: -10
                },
                {
                    text: 'Repeat the test until it can be passed and documented within the test script',
                    outcome: 'Repeating a failing test without changes to the system won\'t change the outcome and wastes time. The issue should be documented and addressed through the proper development process.',
                    experience: -5
                }
            ]
        },
        {
            id: 9,
            level: 'Intermediate',
            title: 'Non-Functional Requirements',
            description: 'When implementing non-functional testing in a project with conflicting requirements, what\'s the most appropriate approach?',
            options: [
                {
                    text: 'Balance and prioritise requirements based on project needs and stakeholder input',
                    outcome: 'Perfect! Conflicting requirements is a challenge, balancing and prioritising them is necessary. This would involve considering project needs and stakeholder input to determine which requirements take precedence.',
                    experience: 20,
                },
                {
                    text: 'Always prioritize security requirements over performance requirements',
                    outcome: 'While security is critically important, automatically prioritising it over all other requirements isn\'t appropriate. The right balance depends on the specific project context, stakeholders\' needs, and the nature of the application.',
                    experience: -15
                },
                {
                    text: 'Implement all requirements regardless of any conflicts they have with each other',
                    outcome: 'When requirements conflict, it\'s typically not possible to fully implement all of them. Priorities must be established to resolve conflicts effectively.',
                    experience: -10
                },
                {
                    text: 'Focus only on requirements that can be easily measured within the system under test',
                    outcome: 'While measurability is important for non-functional testing, ignoring difficult-to-measure requirements simply because they\'re challenging, isn\'t appropriate. Important requirements should be addressed even if measurement is complex.',
                    experience: -5
                }
            ]
        },
        {
            id: 10,
            level: 'Intermediate',
            title: 'Non-Functional Library',
            description: 'What is the primary purpose of the Zoonou non-functional library?',
            options: [
                {
                    text: 'To provide a standardised set of non-functional tests for different testing environments',
                    outcome: 'Excellent! The Zoonou non-functional library can be accessed within the standard test script, full script and exploratory script templates. It contains an extensive set and range of non-functional tests to be used for testing.',
                    experience: 20,
                },
                {
                    text: 'To replace functional testing requirements in test scripts',
                    outcome: 'While the non-functional library does provide tests that are separate from functional requirements, it doesn\'t replace functional testing. Rather, complementing them.',
                    experience: -15
                },
                {
                    text: 'To automate the execution of all non-functional tests within the system under test',
                    outcome: 'Testers manually execute the tests and record results. The library helps organise and select tests, but doesn\'t automate their execution.',
                    experience: -10
                },
                {
                    text: 'To track bugs and defects found during non-functional testing',
                    outcome: 'While the test script includes a column for "Issue Number" to reference bugs in an issue tracker, the primary purpose of the library is to provide the tests themselves, not to serve as a bug tracking system.',
                    experience: -5
                }
            ]
        },
    ],

    advanced: [
        {
            id: 11,
            level: 'Advanced',
            title: 'Non-Functional Library Set',
            description: 'How are non-functional tests organised in the Zoonou library?',
            options: [
                {
                    text: 'By testing phase (Alpha/Beta) and environment variants',
                    outcome: 'Perfect! The non-functional library is set out into Alpha and Beta phase column areas, with sub-columns for each primary environment variant.',
                    experience: 25,
                },
                {
                    text: 'By test complexity and duration',
                    outcome: 'The organisation is primarily by phase and environment, with functional areas as categories within those.',
                    experience: -15
                },
                {
                    text: 'By functional area and user story',
                    outcome: 'The organisation is primarily by phase and environment, with functional areas as categories within those.',
                    experience: -10
                },
                {
                    text: 'By priority and severity level',
                    outcome: 'The organisation is primarily by phase and environment, with functional areas as categories within those.',
                    experience: -5
                }
            ]
        },
        {
            id: 12,
            level: 'Advanced',
            title: 'Test Library Execution',
            description: 'What action should a tester take after selecting non-functional tests from the library?',
            options: [
                {
                    text: 'Execute the tests and record results in the appropriate columns',
                    outcome: 'Excellent! After selecting tests from the library, these tests auto-populate in the Non-Functional Tests tab or section. The tester then needs to execute these tests and manually record details.',
                    experience: 25,
                },
                {
                    text: 'Immediately hide the non-functional library tab',
                    outcome: 'The non-functional library tab can be hidden from view in the sheet once all non-functional test case selections have been decided upon, but this is optional and not the immediate next step.',
                    experience: -15
                },
                {
                    text: 'Manually add each selected test to the Non-Functional Tests tab',
                    outcome: 'when a test is selected, it will auto-populate within the Non-Functional Tests tab. This happens automatically, not manually.',
                    experience: -10
                },
                {
                    text: 'Create new test cases based on the selected templates',
                    outcome: 'The library already contains test cases. Testers select existing tests rather than creating new ones based on templates.',
                    experience: -5
                }
            ]
        },
        {
            id: 13,
            level: 'Advanced',
            title: 'JavaScript Disable Test',
            description: 'When testing a web application by disabling JavaScript, what is the expected behaviour that would constitute a passing test? ',
            options: [
                {
                    text: 'The site should display a warning message and still render, with non-JavaScript functionality available',
                    outcome: 'Perfect! The site under test should still render and function as expected when JavaScript is disabled. Where JavaScript is necessary for certain content, a warning message should display to inform the user of this.',
                    experience: 25,
                },
                {
                    text: 'The site should function exactly the same as with JavaScript enabled',
                    outcome: 'While the site should still render and function as expected, this doesn\'t mean it functions exactly the same.',
                    experience: -15
                },
                {
                    text: 'The site should redirect to a static HTML version automatically',
                    outcome: 'The document doesn\'t mention redirecting to a static HTML version as a requirement or expected behaviour.',
                    experience: -10
                },
                {
                    text: 'The page should prevent loading until JavaScript is re-enabled',
                    outcome: 'The site should still render and function when JavaScript is disabled.',
                    experience: -5
                }
            ]
        },
        {
            id: 14,
            level: 'Advanced',
            title: 'Non-Functional Metrics',
            description: 'What metrics are calculated and displayed for non-functional tests in the exploratory script? ',
            options: [
                {
                    text: 'Tests complete, percentage complete, tests remaining, percentage remaining, blocked tests, percentage blocked, and total tests',
                    outcome: 'Excellent! These are the metrics that relate to the non-functional test cases.',
                    experience: 25,
                },
                {
                    text: 'Pass rate, fail rate, and average execution time',
                    outcome: 'While the metrics do track completion status which could be related to pass/fail rates, they don\'t specifically calculate pass and fail rates in these terms.',
                    experience: -15
                },
                {
                    text: 'Issue severity, priority levels, and resolution time',
                    outcome: 'These metrics relate to bug tracking but aren\'t mentioned as part of the non-functional metrics table.',
                    experience: -10
                },
                {
                    text: 'Test coverage, code quality, and performance indicators',
                    outcome: 'These are important software quality metrics but aren\'t listed as part of the non-functional test metrics tracked in the exploratory script.',
                    experience: -5
                }
            ]
        },
        {
            id: 15,
            level: 'Advanced',
            title: 'Non-Functional Library Workflow',
            description: 'What workflow challenge might arise when a tester needs to select an extensive number of non-functional tests for a suite? ',
            options: [
                {
                    text: 'The tester needs to ensure there are enough rows available in the suite before selection',
                    outcome: 'Perfect! Each suite is made up of a total of ten rows by default. The tester can add in additional rows when more than ten non-functional tests are required to be selected for this suite.',
                    experience: 25,
                },
                {
                    text: 'The non-functional library might not contain enough test cases for comprehensive testing',
                    outcome: 'While it\'s possible that a very specialised project might need tests beyond what\'s in the library, the current library is "extensive" and contains many categories.',
                    experience: -15
                },
                {
                    text: 'Automated test execution might timeout with too many tests selected',
                    outcome: 'Non-functional test cases within the library are executed manually.',
                    experience: -10
                },
                {
                    text: 'The metrics calculations will become inaccurate with large test volumes',
                    outcome: 'Metrics calculations would not be affected by the volume of tests. The concern is about having enough rows to accommodate all selected tests.',
                    experience: -5
                }
            ]
        }
    ]
}
