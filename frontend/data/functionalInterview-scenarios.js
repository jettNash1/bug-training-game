export const functionalInterviewScenarios = {
         // Basic Scenarios (IDs 1-5)
         basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Project Context',
                description: "You're starting a new testing project. What's your first priority?",
                options: [
                    {
                        text: 'Review all the requirements for the project provided by the client',
                        outcome: 'Excellent! Understanding context is crucial for effective testing.',
                        experience: 15,
                        isCorrect: true
                    },
                    {
                        text: 'Begin extensive exploratory testing sessions to identify potential issues and document findings for immediate stakeholder review',
                        outcome: 'Without understanding context first, testing straight away may miss critical issues.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Create comprehensive test cases based on industry best practices and previous project experience',
                        outcome: 'Test cases should be based on project context and requirements.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Analyse historical test results of older releases of the same project',
                        outcome: 'While helpful, previous results don\'t replace understanding of current project context.',
                        experience: 5,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Project Knowledge',
                description: 'You\'re leaving a project tomorrow and new testers are joining. How do you show the best initiative?',
                options: [
                    {
                        text: 'Create comprehensive handover notes and context documentation',
                        outcome: 'Perfect! Proactive knowledge transfer shows excellent initiative.',
                        experience: 20,
                        isCorrect: true
                    },
                    {
                        text: 'Answer any questions the testers might have on processes or outstanding tasks',
                        outcome: 'Initiative means preparing resources before they\'re needed.',
                        experience: -15,
                        isCorrect: false
                    },
                    {
                        text: 'Leave basic notes about current and outstanding tasks for the project',
                        outcome: 'While helpful, this doesn\'t provide full context needed for a handover.',
                        experience: 5,
                        isCorrect: false
                    },
                    {
                        text: 'Tell them to check existing documentation to familiarise themselves with the project',
                        outcome: 'This doesn\'t help bridge potential knowledge gaps effectively.',
                        experience: -10,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Remote Communication',
                description: 'You\'re working remotely and need to collaborate on a complex task. How do you ensure effective communication?',
                options: [
                    {
                        text: 'Set up regular video calls, use screen sharing, and maintain detailed documentation',
                        outcome: 'Perfect! This maintains clear communication channels.',
                        experience: 20,
                        isCorrect: true
                    },
                    {
                        text: 'Use email as your source of communication and copy everyone in that\'s involved in the project',
                        outcome: 'Multiple communication channels are often needed for different teams related to the project.',
                        experience: -15,
                        isCorrect: false
                    },
                    {
                        text: 'Wait for others to initiate communication to establish their preferred channels',
                        outcome: 'Being proactive in remote communication creates a professional approach.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Handle everything through chat channels for quick responses',
                        outcome: 'Complex tasks often need richer communication and extensive detail that chat channels cant provide.',
                        experience: -5,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Understanding Ticket Types',
                description: 'What are the main types of tickets that should be raised?',
                options: [
                    {
                        text: 'Bugs, Queries, Suggestions/Improvements, and Reference tickets',
                        outcome: 'Perfect! These are the main ticket types used for different purposes.',
                        experience: 15,
                        isCorrect: true
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
                id: 5,
                level: 'Basic',
                title: 'Bug Reproduction Rate',
                description: 'How do you determine and document reproduction rate?',
                options: [
                    {
                        text: 'Test multiple times and calculate percentage based on successful reproductions',
                        outcome: 'Excellent! This provides accurate reproduction statistics.',
                        experience: 20,
                        isCorrect: true
                    },
                    {
                        text: 'Test multiple times on one environment to ensure accurate reproduction rate',
                        outcome: 'To ensure accurate reproduction rates, tests should be carried out on multiple environments.',
                        experience: -15,
                        isCorrect: false
                    },
                    {
                        text: 'Test with one set of data to ensure conditions do not affect outcome',
                        outcome: 'Whilst this is initially important, testing under different conditions contribute to the reproduction rate, for example, using different types of data for a mailing list form.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Test once on each supported environment',
                        outcome: 'While testing other environments is important, multiple attempts of recreating the issue is required for accuracy.',
                        experience: -5,
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
                title: 'Issue Risk Calculation',
                description: 'How do you calculate the overall risk level?',
                options: [
                    {
                        text: 'Multiply severity by likelihood ratings',
                        outcome: 'Excellent! This calculation provides accurate risk levels.',
                        experience: 15,
                        isCorrect: true
                    },
                    {
                        text: 'Consider the severity of the issue and base the overall risk on this',
                        outcome: 'Both severity and likelihood should be taken into consideration. If the severity of a risk is high but the likelihood of this occurring is extremely low. Then overall severity would be reduced',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Consider the likelihood of the issue occurring and base overall risk on this',
                        outcome: 'Severity of the risk must also be factored in. If the likelihood of a risk is high but the severity of this risk is extremely low. Then overall severity would be reduced',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Add severity and likelihood ratings to gain the overall risk calculation',
                        outcome: 'Multiplication of severity and likelihood is the formula used for overall risk level.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Risk Identification',
                description: 'What is the most effective way to identify potential risks?',
                options: [
                    {
                        text: 'Conduct comprehensive analysis of historical project data and previous risk assessments to establish patterns',
                        outcome: 'Historical data alone may miss new risks.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Review documentation to determine scope, user and system impact',
                        outcome: 'Perfect! Documentation review is key to identifying risks.',
                        experience: 15,
                        isCorrect: true
                    },
                    {
                        text: 'Implement extensive monitoring systems to track all possible system behaviours and performance metrics',
                        outcome: 'Monitoring comes after risk identification.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Establish detailed risk tracking protocols across multiple project phases',
                        outcome: 'Tracking comes after identification.',
                        experience: 5,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Sanity And Smoke Testing',
                description: 'How does Sanity Testing differ from Smoke Testing?',
                options: [
                    {
                        text: 'Sanity testing is performed after smoke testing to verify specific code changes',
                        outcome: 'Perfect! Sanity testing focuses on verifying a specific code change/critical bug fix and its intended functionality. Smoke testing is performed at the beginning of every new release and focus is on all critical functionality.',
                        experience: 25,
                        isCorrect: true
                    },
                    {
                        text: 'Both sanity and smoke testing employ exactly the same testing methodology',
                        outcome: 'They are distinct testing methodologies with different purposes.',
                        experience: -15,
                        isCorrect: false
                    },
                    {
                        text: 'Smoke testing is more detailed and covers all system functionalities',
                        outcome: 'Smoke testing is actually less detailed compared to sanity testing.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Sanity testing requires more resources and time than smoke testing does',
                        outcome: 'Sanity testing is less resource-intensive compared to other testing methods.',
                        experience: -5,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Understanding Exploratory Testing',
                description: 'What is the primary objective of exploratory-based testing?',
                options: [
                    {
                        text: 'To discover defects while dynamically exploring the application under test',
                        outcome: 'Correct! Exploratory testing is primarily aimed at discovering defects through dynamic investigation of the software without following predefined test cases.',
                        experience: 15,
                        isCorrect: true
                    },
                    {
                        text: 'To create detailed test cases within a test script before execution',
                        outcome: 'Exploratory testing specifically does not rely on detailed test case documentation created in advance.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'To focus on cosmetic issues within the application under test',
                        outcome: 'While cosmetic issues may be identified, exploratory testing focuses broadly on functionality, user experience, and behaviour, not exclusively on cosmetic issues.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'To replace all other forms of test approach for the application under test',
                        outcome: 'While exploratory testing is valuable, it complements rather than replaces other testing approaches, as it has both advantages and disadvantages.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Exploratory Testing Risks',
                description: 'What is a risk of relying solely on exploratory testing?',
                options: [
                    {
                        text: 'It may lead to incomplete test coverage due to time constraints',
                        outcome: 'Correct! A disadvantage of exploratory testing is potentially incomplete test coverage. As a time-based approach, testing might uncover numerous issues in one area, but time constraints may prevent discovering all bugs comprehensively.',
                        experience: 20,
                        isCorrect: true
                    },
                    {
                        text: 'Solely focusing on exploratory testing can make test activities too rigid',
                        outcome: 'Exploratory testing is flexible in nature, not rigid like other scripted test approaches.',
                        experience: -15,
                        isCorrect: false
                    },
                    {
                        text: 'This type of approach can require too much documentation',
                        outcome: 'Exploratory testing requires less documentation than scripted testing.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'This type of approach always takes longer than scripted testing',
                        outcome: 'While time management can be a challenge, exploratory testing doesn\'t always take longer than scripted testing; in fact, it can be more time-efficient by eliminating the need for extensive test case preparation.',
                        experience: -5,
                        isCorrect: false
                    }
                ]
            }
        ],

        // Advanced Scenarios (IDs 11-15)
        advanced: [
            {
                id: 11,
                level: 'Advanced',
                title: 'Functional and Non-Functional Differences',
                description: 'What is the main difference between functional and non-functional testing?',
                options: [
                    {
                        text: 'Functional testing is based on customer requirements while non-functional testing is based on customer expectations',
                        outcome: 'Perfect! Functional testing verifies if the system works according to specified requirements, while non-functional testing addresses expectations about how well the system performs.',
                        experience: 15, 
                        isCorrect: true
                    },
                    {
                        text: 'Functional testing is automated while non-functional testing is always manual',
                        outcome: 'Both functional and non-functional testing can be performed using either manual or automated approaches, depending on the specific requirements and context.', 
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Functional testing is important while non-functional testing is optional',
                        outcome: 'While non-functional features aren\'t mandatory for a system to operate, this type of testing is just as important as functional testing for ensuring overall quality.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Functional testing is performed by users while non-functional testing is performed by developers',
                        outcome: 'Both types of testing are typically performed by testers or QA professionals, not necessarily developers or end users.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Verification Priority',
                description: 'You have limited time for issue verification. How do you prioritise tickets?',
                options: [
                    {
                        text: 'Start with highest priority and severity issues, ensuring critical fixes are verified first',
                        outcome: 'Perfect! This ensures most important issues are verified.',
                        experience: 15,
                        isCorrect: true
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
                id: 13,
                level: 'Advanced',
                title: 'Regression Testing',
                description: 'After verifying fixes, how do you approach regression testing?',
                options: [
                    {
                        text: 'Focus on areas where fixes were implemented, while also checking surrounding functionality',
                        outcome: 'Perfect! This ensures thorough regression coverage.',
                        experience: 20,
                        isCorrect: true
                    },
                    {
                        text: 'Check all of the fixed issues as confirmed by the client',
                        outcome: 'Regression testing should cover areas that have been recently modified. This may include new features or bug fixes.',
                        experience: -15,
                        isCorrect: false
                    },
                    {
                        text: 'Stick to minimal regression testing as previous issues have been fixed and tested during the current release',
                        outcome: 'Regression testing reduces the risk of introducing new bugs into the system, which can be costly and time-consuming to fix later.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Focus regression testing on tester preference using experience gained during initial testing',
                        outcome: 'Regression tests should focus on high-risk areas, recent changes and core functionality.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'CRUD Testing Basics',
                description: 'What are the essential components of CRUD testing in a content management system?',
                options: [
                    {
                        text: 'Create, read, update, and delete functionality checks for content management',
                        outcome: 'Excellent! These are the fundamental CRUD operations.',
                        experience: 15,
                        isCorrect: true
                    },
                    {
                        text: 'Content creation and content update functionality',
                        outcome: 'All CRUD operations need testing, not just the creation function.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'The detail component within the content management system functionality',
                        outcome: 'There is no specific \'Detail Component\' to test, although detail would fall under Creation and Update testing.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Review component within the content management system functionality',
                        outcome: 'There is no specific \'Review Component\' to test, although detail would fall under Creation, Update and Read testing.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Primary objective',
                description: 'What is the primary focus of copy proofing?',
                options: [
                    {
                        text: 'Testing the functionality of the software',
                        outcome: 'Functionality testing is explicitly out of scope for copy proofing.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Checking grammar, spelling, and typos in content',
                        outcome: 'Correct! This is the core purpose of copy proofing.',
                        experience: 15,
                        isCorrect: true
                    },
                    {
                        text: 'Verifying user interface design matches submitted documentation',
                        outcome: 'While content proofing includes some UI elements, copy proofing specifically focuses on text content.',
                        experience: 5,
                        isCorrect: false
                    },
                    {
                        text: 'Testing cross-browser compatibility with supported environments',
                        outcome: 'This is a functional testing concern, not related to copy proofing.',
                        experience: -5,
                        isCorrect: false
                    }
                ]
            }
        ]
}