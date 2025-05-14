export const testerMindsetScenarios = {
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
                tool: 'Context Analysis Framework'
            },
            {
                text: 'Begin extensive exploratory testing sessions to identify potential issues and document findings for immediate stakeholder review',
                outcome: 'Without understanding context first, testing straight away may miss critical issues.',
                experience: -5
            },
            {
                text: 'Create comprehensive test cases based on industry best practices and previous project experience',
                outcome: 'Test cases should be based on project context and requirements.',
                experience: -5
            },
            {
                text: 'Analyse historical test results of older releases of the same project',
                outcome: 'While helpful, previous results don\'t replace understanding of current project context.',
                experience: 5
            }
        ]
    },
    {
        id: 2,
        level: 'Basic',
        title: 'Understanding the Audience',
        description: 'How do you approach understanding the target audience for a new project?',
        options: [
            {
                text: 'Research user needs to gather information on target audiences',
                outcome: 'Perfect! User-centric thinking is essential for effective testing.',
                experience: 15,
                tool: 'User Persona Template'
            },
            {
                text: 'Apply personal usage patterns and preferences to determine the most likely user behaviours and testing scenarios',
                outcome: 'Users have diverse needs and characteristics that must be considered and not just that of a testers own usage pattern.',
                experience: -5
            },
            {
                text: 'Conduct detailed technical analysis of system architecture and performance metrics to establish testing priorities',
                outcome: 'Technical aspects are important but user needs are crucial for understanding of a target audience.',
                experience: -5
            },
            {
                text: 'Wait for post-release feedback to gather user trends and behaviour',
                outcome: 'Understanding users before testing begins, can help prevent issues in the testing process.',
                experience: 0
            }
        ]
    },
    {
        id: 3,
        level: 'Basic',
        title: 'Test Environment Setup',
        description: "The test environment is different from production. What's your approach?",
        options: [
            {
                text: 'Document the environment differences to be taken into consideration for test results',
                outcome: 'Excellent! Understanding environment differences is crucial for testing and can be factored into any results.',
                experience: 15,
                tool: 'Environment Comparison Tool'
            },
            {
                text: 'Proceed with testing while monitoring for any potential environmental impact on test results.',
                outcome: 'Environment differences can affect testing activities and result in missed issues if not documented for reference first.',
                experience: -5
            },
            {
                text: 'Execute test cases in the production environment to ensure accurate results',
                outcome: 'Testing in production without correct user control can lead to unwarranted risks within the system.',
                experience: -10
            },
            {
                text: 'Request environment replication to safely conduct testing activities.',
                outcome: 'Good thinking, but first, the current differences must be documented.',
                experience: 10
            }
        ]
    },
    {
        id: 4,
        level: 'Basic',
        title: 'Test Documentation',
        description: "You've found several issues. How do you document them?",
        options: [
            {
                text: 'Document the issues with steps and results for ease of replication',
                outcome: 'Perfect! Clear documentation helps developers fix issues efficiently.',
                experience: 15,
                tool: 'Issue Documentation Template'
            },
            {
                text: 'Initiate multiple communication channels including chat messages, emails, and verbal discussions for each discovered issue.',
                outcome: 'Informal communication isn\'t sufficient for tracking issues, as important information can become lost.',
                experience: -5
            },
            {
                text: 'Capture and archive comprehensive visual documentation through multiple screenshot angles and screen recordings',
                outcome: 'Screenshots alone don\'t provide enough context and more detail is required such as steps and results.',
                experience: -10
            },
            {
                text: 'Create brief descriptions for all the issues raised to make sure project time management can be met.',
                outcome: 'More detail would help developers understand and fix issues.',
                experience: 5
            }
        ]
    },
    {
        id: 5,
        level: 'Basic',
        title: 'Test Planning',
        description: 'How do you prepare for a new testing project?',
        options: [
            {
                text: 'Review requirements, create test strategy, and identify risks',
                outcome: 'Excellent! Thorough preparation leads to effective testing.',
                experience: 15,
                tool: 'Test Planning Framework'
            },
            {
                text: 'Start testing straight away to meet project timeline and deliverables',
                outcome: 'A lack of planning can lead to inefficient testing.',
                experience: -5
            },
            {
                text: 'Copy a test plan from previous project for efficiency',
                outcome: 'Each project needs its own test approach and the need for specific testing tailored to each project is essential.',
                experience: -5
            },
            {
                text: 'Ask developers what and which areas to test within the project',
                outcome: 'Developer input helps but thorough planning is required as a developer mindset is not always the same as an end user.',
                experience: 5
            }
        ]
    },
    // Additional Basic Scenarios from Guide - Tester Mindset Additional Questions
    {
        id: 16,
        level: 'Basic',
        title: 'Issue Verification Mindset',
        description: 'When adopting a tester mindset for Issue Verification (IV), which is not a characteristic of the process?',
        options: [
            {
                text: 'Being competitive is not a characteristic of an Issue Verifcation tester mindset',
                outcome: 'Correct! being detailed, timely, observant, investigative, impartial, and quality-driven are all characteristics of a tester mindset during Issue Verification not being competitive.',
                experience: 15,
                tool: 'Issue Verification Mindset'
            },
            {
                text: 'Being detailed is not a characteristic of an Issue Verifcation tester mindset',
                outcome: 'Being detailed is a characteristic for Issue Verification, aiming to provide the client with valuable information to aid them in fixing outstanding issues.',
                experience: -5
            },
            {
                text: 'Being investigative is not a characteristic of an Issue Verifcation tester mindset',
                outcome: 'Being investigative is a characteristic of Issue Verifcation, actively looking for ways to discover new issues.',
                experience: -10
            },
            {
                text: 'Being impartial is not a characteristic of an Issue Verifcation tester mindset',
                outcome: 'Being impartial is a characteristic of Issue Verification, we may observe an issue differently from a client and must be objective in our feedback.',
                experience: 0
            }
        ]
    },
    {
        id: 17,
        level: 'Basic',
        title: 'Mindset Risk',
        description: 'What is a risk of applying the same mindset to every testing project?',
        options: [
            {
                text: 'It provides maximum test coverage',
                outcome: 'Tailoring the mindset to each project leads to better coverage and finding more relevant issues.',
                experience: -5
            },
            {
                text: 'It increases testing speed',
                outcome: 'While this may increase speed through familiarisation. A tailored approach makes better use of time and results as each project has its own specific requirements.',
                experience: -10
            },
            {
                text: 'It yields mediocre results and less value to clients',
                outcome: 'Correct! Applying the same mindset to every project and approaching testing in the same manner, no matter the test approach, will likely yield mediocre results and provide less value to clients.',
                experience: 15,
                tool: 'Mindset Risk'
            },
            {
                text: 'It standardizes the testing approach',
                outcome: 'While this might be true, standardisation without adaptation is a disadvantage, not an advantage.',
                experience: 0
            }
        ]
    },
    {
        id: 18,
        level: 'Basic',
        title: 'Exploratory Testing Mindset',
        description: 'For an exploratory testing approach, which is not a characteristic of a tester mindset approach',
        options: [
            {
                text: 'Being destructive is a characteristic of tester mindset towards exploratory testing',
                outcome: 'Being destructive is a characteristic of exploratory testing, aiming to break the app/site and reveal issues.',
                experience: -5
            },
            {
                text: 'Adopting a free to explore approach is a characteristic of tester mindset towards exploratory testing',
                outcome: 'Being free to explore is a characteristic of exploratory testing, as to not get held back by restrictive test cases.', 
                experience: -10
            },
            {
                text: 'Adopting process driven approach is a characteristic of tester mindset towards exploratory testing',
                outcome: 'Correct! The exploratory approach is characterised by being less process-driven and more free-form than scripted approaches.',
                experience: 15,
                tool: 'Exploratory Testing Mindset'
            },
            {
                text: 'Being risk aware is a characteristic of a tester mindset towards exploratory testing',
                outcome: 'Being risk-aware is as a characteristic of exploratory testing, being conscious of scope, timings and ability to deliver tasks on time.',
                experience: 0
            }
        ]
    },
    {
        id: 19,
        level: 'Basic',
        title: 'Project Context',
        description: 'When considering the context for a new testing project, what is not a factor to be considered?',
        options: [
            {
                text: 'The client\'s competitors is not a factor to be considered for a new project',
                outcome: 'Correct! focus should be on understanding the specific project rather than market positioning or competitive analysis.',
                experience: 15,
                tool: 'Project Context'
            },
            {
                text: 'Project scope is not a factor to be considered for a new project',
                outcome: 'Scope is a context factor to consider, including questions about unique functionalities and areas of concern.',
                experience: -10
            },
            {
                text: 'Test approach is not a factor to be considered for a new project',
                outcome: 'Test approach is a context factor to consider, including understanding why the client chose a particular approach for their project.',
                experience: -5
            },
            {
                text: 'Development life cycle is not a factor to be considered for a new project',
                outcome: 'The development life cycle is as a context factor to consider, to determine how far into development the project is.',
                experience: 0
            }
        ]
    },
    {
        id: 20,
        level: 'Basic',
        title: 'Project Mindset',
        description: 'What is recommended when a tester is unsure about what mindset might be required for a particular project?',
        options: [
            {
                text: 'The project stand up should be utilised to ask questions and discuss the project with the project manager',
                outcome: 'Correct! If you are unsure what mindset might be required for a particular project, utilise the project stand up to ask questions and discuss the mindset with the project manager and test team.',
                experience: 15,
                tool: 'Project Mindset'
            },
            {
                text: 'The last projects mindset approach should be followed',
                outcome: 'This contradicts the emphasis on tailoring a mindset to each specific project.',
                experience: -10
            },
            {
                text: 'Creating a survey for the client to complete should be the approach',
                outcome: 'This would be time consuming for both tester and client.',
                experience: -5
            },
            {
                text: 'You should always default to the exploratory approach',
                outcome: 'An appropriate mindset for each project should be undertaken rather than defaulting to any particular approach.',
                experience: 0
            }
        ]
    }
],

// Intermediate Scenarios (Different Testing Approaches)
intermediate: [
    {
        id: 6,
        level: 'Intermediate',
        title: 'Exploratory Testing',
        description: "You're conducting exploratory testing. What's your mindset?",
        options: [
            {
                text: 'Be curious, investigative, and think outside the box',
                outcome: 'Perfect! Exploratory testing requires creative thinking.',
                experience: 20,
                tool: 'Exploratory Testing Guide'
            },
            {
                text: 'Follow a strictly set out test script to gain the best coverage',
                outcome: 'Exploratory testing requires flexibility and creativity to think outside the box of a specified testing route.',
                experience: -10
            },
            {
                text: 'Test only happy paths to check the desired outcome',
                outcome: 'Exploratory testing should cover various scenarios, including unhappy paths.',
                experience: -10
            },
            {
                text: 'Focus only on finding bugs within the required scope of the project',
                outcome: 'Understanding the system and user journey paths are also important in exploratory testing.',
                experience: 5
            }
        ]
    },
    {
        id: 7,
        level: 'Intermediate',
        title: 'Scripted Testing',
        description: 'During scripted testing, you notice an issue outside the test cases. What do you do?',
        options: [
            {
                text: 'Document the issue for client consideration and continue with test cases',
                outcome: 'Excellent! Balance following scripts while noting other issues.',
                experience: 20,
                tool: 'Test Case Management'
            },
            {
                text: 'Continue with testing as the particular focus is not documented to be covered within the test cases',
                outcome: 'All issues should be documented, even if outside of stated test cases.',
                experience: -15
            },
            {
                text: 'Stop scripted testing to investigate and find the root cause',
                outcome: 'The issue should be documented although, planned testing should be continued with.',
                experience: 0
            },
            {
                text: 'Add new test cases immediately to address the areas that return the issue',
                outcome: 'Whilst adding new test cases is required as testing evolves on a project. The issues should be document first and test case updates can be performed after the current execution.',
                experience: 10
            }
        ]
    },
    {
        id: 8,
        level: 'Intermediate',
        title: 'Test Support Approach',
        description: 'You\'re providing ongoing test support. How do you maintain effectiveness?',
        options: [
            {
                text: 'Stay adaptable and maintain clear communication with the team',
                outcome: 'Perfect! Flexibility and communication are key for support.',
                experience: 20,
                tool: 'Support Communication Template'
            },
            {
                text: 'Stick to the initial test plan throughout test activities only',
                outcome: 'Test support requires adapting to clients changing needs.',
                experience: -10
            },
            {
                text: 'Wait for the client to assign you tasks to stay within scope of the project',
                outcome: 'Proactive support is more valuable than reactive support.',
                experience: -5
            },
            {
                text: 'Focus only on new features within a release to keep testing activities current',
                outcome: 'Support should include both new and existing functionality testing.',
                experience: 5
            }
        ]
    },
    {
        id: 9,
        level: 'Intermediate',
        title: 'Risk Assessment',
        description: 'You identify a potential risk in the project. How do you handle it?',
        options: [
            {
                text: 'Document the risk and communicate it to stakeholders promptly',
                outcome: 'Excellent! Early risk communication allows better mitigation.',
                experience: 20,
                tool: 'Risk Assessment Matrix'
            },
            {
                text: 'Wait to see the risk identified becomes an issue that could affect the system under test',
                outcome: 'Early risk identification helps prevent issues with test activities further along into the process.',
                experience: -15
            },
            {
                text: 'Research a solution for the risk yourself and present this to developers',
                outcome: 'Risks should be communicated to appropriate stakeholders for an appropriate outcome to be confirmed.',
                experience: -5
            },
            {
                text: 'Mention the identified risk in the next meeting or stand up for the project',
                outcome: 'Risks need prompt communication to mitigate an issue early, rather than having delayed reporting.',
                experience: 0
            }
        ]
    },
    {
        id: 10,
        level: 'Intermediate',
        title: 'Test Coverage',
        description: 'How do you ensure adequate test coverage for a feature?',
        options: [
            {
                text: 'Implement comprehensive testing methodologies across all possible test scenarios and edge cases with detailed documentation',
                outcome: 'This is too broad an approach and can be an inefficient way of testing.',
                experience: -5
            },
            {
                text: 'Use risk-based testing to prioritise areas that are of the most importance to the user and client',
                outcome: 'Perfect! Prioritising tests based on risk is one of the most efficient approaches.',
                experience: 20,
                tool: 'Risk Assessment Matrix'
            },
            {
                text: 'Execute extensive regression testing protocols while maintaining detailed coverage metrics and trend analysis',
                outcome: 'Regression testing alone doesn\'t ensure the most sufficient coverage.',
                experience: -10
            },
            {
                text: 'Conduct thorough analysis of all system components and their interconnected dependencies',
                outcome: 'System analysis is important but should be guided by risk assessment.',
                experience: 5
            }
        ]
    }
],

// Advanced Scenarios (Complex situations)
advancedScenarios: [
    {
        id: 11,
        level: 'Advanced',
        title: 'Critical Production Issue',
        description: 'A critical bug is reported in production affecting user data. What\'s your immediate response?',
        options: [
            {
                text: 'Alert the incident team with evidence and begin systematic investigation',
                outcome: 'Excellent! Quick escalation and a systematic approach is crucial.',
                experience: 25,
                tool: 'Incident Response Protocol'
            },
            {
                text: 'Start researching a fix for the bug immediately',
                outcome: 'Incident response process should be followed before attempting to find a route cause for developers to investigate and fix.',
                experience: -15
            },
            {
                text: 'Document the issue to be included in the next sprint for developer attention',
                outcome: 'Critical issues within the production environment require immediate attention.',
                experience: -15
            },
            {
                text: 'Start investigating the root cause of the bug immediately',
                outcome: 'Incident response process should be followed before attempting to find the cause so all interested parties are aware of the issue.',
                experience: 5
            }
        ]
    },
    {
        id: 12,
        level: 'Advanced',
        title: 'Test Strategy Evolution',
        description: 'The project scope has significantly changed mid-way. How do you adapt your test strategy?',
        options: [
            {
                text: 'Review changes, update strategy, and communicate any impact on the project',
                outcome: 'Perfect! Systematic adaptation ensures continued effectiveness.',
                experience: 25,
                tool: 'Strategy Adaptation Framework'
            },
            {
                text: 'Continue the testing activities outlined in the original strategy to stay in line with initial client expectation',
                outcome: 'The strategy must evolve with project changes as important features could missed.',
                experience: -20
            },
            {
                text: 'Create an entirely new strategy to come into line with the new requirements',
                outcome: 'Modifying the existing strategy is the preferred approach to time management and constraints.',
                experience: -10
            },
            {
                text: 'Focus only on the new requirements set out in the updated scope',
                outcome: 'Both new and existing requirements need to be taken into consideration as issues could be missed if existing requirements are ignored.',
                experience: 0
            }
        ]
    },
    {
        id: 13,
        level: 'Advanced',
        title: 'Resource Constraints',
        description: 'You have limited time and resources for testing. How do you proceed?',
        options: [
            {
                text: 'Prioritise critical functionality and communicate constraints',
                outcome: 'Excellent! Risk-based prioritisation maximizes testing value.',
                experience: 25,
                tool: 'Test Prioritization Matrix'
            },
            {
                text: 'Test everything as quick as possible to meet project timeframe deliverables',
                outcome: 'Rushed testing may miss critical issues.',
                experience: -20
            },
            {
                text: 'Leave lower priority items to meet project timeframe deliverables',
                outcome: 'Scope reduction needs to be communicated and agreed upon with stakeholders first.',
                experience: -10
            },
            {
                text: 'Request a deadline extension to achieve the required test coverage',
                outcome: 'Test case and scope prioritisation is required first, even with an extended deadline.',
                experience: 0
            }
        ]
    },
    {
        id: 14,
        level: 'Advanced',
        title: 'Team Collaboration',
        description: 'Different team members have conflicting test approaches. How do you handle this?',
        options: [
            {
                text: 'Facilitate discussion to align on best practices and document any agreements',
                outcome: 'Perfect! Collaborative alignment improves team effectiveness.',
                experience: 25,
                tool: 'Test Approach Alignment Guide'
            },
            {
                text: 'Let each person use their preferred approach to aid in meeting deliverables',
                outcome: 'Inconsistent approaches can affect testing quality.',
                experience: -20
            },
            {
                text: 'Enforce your preferred approach to be able to manage progress more efficiently',
                outcome: 'Collaboration is better than enforcement as each colleague brings a different skill set.',
                experience: -15
            },
            {
                text: 'Escalate to management immediately so they can set a company wide approach',
                outcome: 'It is preferred to initiate a team discussion first to potentially come to a collaborative agreement before escalation.',
                experience: -5
            }
        ]
    },
    {
        id: 15,
        level: 'Advanced',
        title: 'Quality Advocacy',
        description: 'The team is pressured to reduce testing time. How do you respond?',
        options: [
            {
                text: 'Present data-driven analysis of risks and quality impacts',
                outcome: 'Excellent! Data-driven advocacy helps maintain quality.',
                experience: 25,
                tool: 'Quality Impact Analysis'
            },
            {
                text: 'Accept the reduced timeline and continue with testing activities',
                outcome: 'Quality concerns should be raised professionally as issues could be missed with reduced coverage.',
                experience: -30
            },
            {
                text: 'Refuse to reduce the testing time as this will affect testing coverage and quality',
                outcome: 'It is preferred and professional to collaborate with stakeholders to find balanced solutions.',
                experience: -20
            },
            {
                text: 'Reduce test coverage without any risk analysis',
                outcome: 'Impact analysis is required and should be communicated with stakeholders before reducing coverage.',
                experience: -15
            }
        ]
    }
]
}