export const exploratoryTestingScenarios = {
        // Basic Scenarios
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Test Planning',
                description: 'You are starting an exploratory testing session for a new website. What should you do first?',
                options: [
                    {
                        text: 'Create a basic test plan with goals and areas to explore',
                        outcome: 'Perfect! Having a plan with clear objectives guides effective exploratory testing.',
                        experience: 15,
                    },
                    {
                        text: 'Start clicking around immediately to find issues',
                        outcome: 'Exploratory testing is most effective when it has some structure and goals.',
                        experience: 0
                    },
                    {
                        text: 'Write detailed test cases first',
                        outcome: 'Detailed test cases are contrary to the spirit of exploratory testing, which balances freedom with structure.',
                        experience: -10
                    },
                    {
                        text: 'Ask the developer what to test',
                        outcome: 'While developer input is valuable, exploratory testing requires you to think independently and explore based on your expertise.',
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Time Management',
                description: 'You have a limited time for exploratory testing. How would you structure your session?',
                options: [
                    {
                        text: 'Use timeboxed sessions with clear focus areas for each',
                        outcome: 'Excellent! Timeboxing helps maintain focus and ensures coverage of important areas.',
                        experience: 15,
                    },
                    {
                        text: 'Test continuously until time runs out',
                        outcome: 'Without structure, testing can become unfocused and miss important areas.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on the main user path',
                        outcome: 'While the main path is important, exploratory testing should cover various aspects of the system.',
                        experience: 0
                    },
                    {
                        text: 'Spend most time documenting test cases',
                        outcome: 'Exploratory testing focuses on exploration rather than detailed documentation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Documentation',
                description: 'How should you document your findings during exploratory testing?',
                options: [
                    {
                        text: 'Take notes of your actions, observations, and issues during and after testing',
                        outcome: 'Perfect! Lightweight but effective documentation captures valuable information without hindering exploration.',
                        experience: 15,
                    },
                    {
                        text: 'Don\'t document anything during testing to maintain flow',
                        outcome: 'Without documentation, valuable observations may be lost.',
                        experience: -10
                    },
                    {
                        text: 'Create detailed test cases for everything you test',
                        outcome: 'Detailed test cases aren\'t typically part of exploratory testing.',
                        experience: -5
                    },
                    {
                        text: 'Record brief notes and expand them after the session',
                        outcome: 'This is a good approach, but could be more comprehensive during testing.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Bug Reporting',
                description: 'You found a bug during exploratory testing. What information should you include in your bug report?',
                options: [
                    {
                        text: 'Detailed steps to reproduce, expected vs. actual results, and context of discovery',
                        outcome: 'Excellent! Comprehensive bug reports help developers understand and fix issues.',
                        experience: 15,
                    },
                    {
                        text: 'Just a screenshot of the error',
                        outcome: 'Screenshots alone don\'t provide enough context for effective troubleshooting.',
                        experience: -5
                    },
                    {
                        text: 'General description of the area with the problem',
                        outcome: 'Without specific steps, bugs may be difficult to reproduce and fix.',
                        experience: 0
                    },
                    {
                        text: 'Mark it as "found during exploration" and let developers investigate',
                        outcome: 'Developers need clear information to address bugs efficiently.',
                        experience: -10
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Test Techniques',
                description: 'Which technique is most valuable during basic exploratory testing?',
                options: [
                    {
                        text: 'Boundary testing - checking edge cases and limits',
                        outcome: 'Perfect! Boundary testing is highly effective at finding issues during exploration.',
                        experience: 15,
                    },
                    {
                        text: 'Following the same path each time',
                        outcome: 'Repetitive testing limits discovery of new issues.',
                        experience: -10
                    },
                    {
                        text: 'Testing only happy paths',
                        outcome: 'Many issues are found in edge cases and error conditions.',
                        experience: -5
                    },
                    {
                        text: 'Using different inputs and workflows',
                        outcome: 'This is valuable but not as focused as boundary testing for finding specific issues.',
                        experience: 0
                    }
                ]
            },
            // Additional Basic Scenarios
            {
                id: 16,
                level: 'Basic',
                title: 'Focus Area Structure',
                description: 'When setting up an exploratory script, how should focus areas be structured?',
                options: [
                    {
                        text: 'Focus areas should be kept broad with sub-focus areas that serve as prompts for core testing areas',
                        outcome: 'Correct! It is important not to break the focus areas up too much and keep them broad. Helping to prevent exploratory testing from becoming too rigid in its approach.',
                        experience: 15,
                    },
                    {
                        text: 'Focus areas should be limited to only critical functionality, without scope for rendering aspects',
                        outcome: 'Focus areas should encompass both functionality and rendering aspects, not just critical functionality.',
                        experience: -5
                    },
                    {
                        text: 'Focus areas should be extremely detailed and specific, breaking down every possible user action',
                        outcome: 'This would make test execution more like scripted testing in being more specific.',
                        experience: -10
                    },
                    {
                        text: 'Focus areas should follow a strict priority list with predefined test cases for each component',
                        outcome: 'Exploratory testing specifically avoids a strict priority list with predefined test cases.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Exploratory Test Time Management',
                description: 'What should testers do when they believe there are more defects in an area but have run out of allotted time?',
                options: [
                    {
                        text: 'Proactively extend the testing time to ensure all defects are discovered',
                        outcome: 'Testers should follow the allocated time as closely as possible and communicate openly when more time might be needed.',
                        experience: -5
                    },
                    {
                        text: 'Mark all remaining potential issues as low priority and continue with testing activities',
                        outcome: 'Testers should document their observations about remaining defects and communicate these with the project manager as soon as possible.',
                        experience: -10
                    },
                    {
                        text: 'Inform the project manager at the earliest opportunity and make notes in the test script of potential additional issues',
                        outcome: 'Correct! Documenting the areas of concern helps the client make a decision moving forward and informing the project manager of the issues may result in negotiation for additional testing.',
                        experience: 15,
                    },
                    {
                        text: 'Automatically allocate time from other focus areas to complete the current area',
                        outcome: 'Testers shouldn\'t automatically reallocate time without discussion as this could compromise coverage.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Exploratory Test Script Review',
                description: 'What should be done during the final cleanup of an exploratory script after testing has concluded?',
                options: [
                    {
                        text: 'Delete all notes and observations to maintain confidentiality',
                        outcome: 'Deleting notes and observations would eliminate the valuable testing information that needs to be preserved.',
                        experience: -5
                    },
                    {
                        text: 'Convert all exploratory notes into formal test cases for future use',
                        outcome: 'Converting exploratory notes into formal test cases contradicts the purpose of exploratory testing.', 
                        experience: -10
                    },
                    {
                        text: 'Run a spell check across all sheets and ensure all unused tabs are hidden',
                        outcome: 'Correct! This ensures professionalism and standards required if test scripts are requested by the client.',
                        experience: 15,
                    },
                    {
                        text: 'Revise time allocations for each focus area based on actual time spent',
                        outcome: 'Revising time allocations after testing is complete would serve no purpose for the current project.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Exploratory Smoke Tests',
                description: 'How should smoke tests be defined in the Environment Checks tab?',
                options: [
                    {
                        text: 'As high-level user journeys without restricting testers to specific steps',
                        outcome: 'Correct! This allows the tester to take a fresh approach per environment and doesn\'t restrict them to following the same set of steps.',
                        experience: 15,
                    },
                    {
                        text: 'As detailed step-by-step instructions with expected results for each action',
                        outcome: 'Detailed step-by-step instructions would restrict testers and contradict the exploratory approach',
                        experience: -10
                    },
                    {
                        text: 'As automated test scripts that can be run across multiple environments.',
                        outcome: 'Automation is not part of exploratory testing.',
                        experience: -5
                    },
                    {
                        text: 'As exact duplicates of the focus areas from the primary environment.',
                        outcome: 'Smoke tests should be concise high-level journeys focused on key functionality.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Exploratory Test Time Allocation',
                description: 'How should time be allocated in an exploratory script?',
                options: [
                    {
                        text: 'More time should be allocated to areas with important functionality, with less time for simpler elements',
                        outcome: 'Correct! More time should be allocated to areas with important functionality, with less time for simpler elements.',
                        experience: 15,
                    },
                    {
                        text: 'Equal time should be allocated to all focus areas to ensure balanced coverage',
                        outcome: 'Time allocation should be proportional to the importance and complexity of the specific functionality under test.',
                        experience: -10
                    },
                    {
                        text: 'Time should only be allocated to functional testing, with rendering issues addressed separately',
                        outcome: 'Both aspects should be covered within the allocated time for each focus area.',
                        experience: -5
                    },
                    {
                        text: 'Time allocation should be done dynamically during testing based on defects found',
                        outcome: 'Time allocation should be done during the script setup phase before testing begins.',
                        experience: 0
                    }
                ]
            }
        ],

        // Intermediate Scenarios
        intermediate: [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Heuristic Approach',
                description: 'Which heuristic would be most useful when testing a new e-commerce checkout process?',
                options: [
                    {
                        text: 'CRUD operations - test all Create, Read, Update, Delete operations with customer data',
                        outcome: 'Excellent! CRUD testing ensures all data operations in the checkout work correctly.',
                        experience: 20,
                    },
                    {
                        text: 'Consistency checks only',
                        outcome: 'While consistency is important, a broader approach is needed for checkout processes.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on performance testing',
                        outcome: 'Performance is just one aspect of checkout functionality.',
                        experience: -5
                    },
                    {
                        text: 'Test only with valid credit cards',
                        outcome: 'Error handling for invalid payments is crucial for checkout functionality.',
                        experience: -15
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Charter-Based Testing',
                description: 'You\'re creating a test charter for exploratory testing. What should it include?',
                options: [
                    {
                        text: 'Clear mission, scope, targeted areas, time allocation, and reporting method',
                        outcome: 'Perfect! A well-structured charter guides effective exploration.',
                        experience: 20,
                    },
                    {
                        text: 'Just the general area to test',
                        outcome: 'A vague charter provides insufficient guidance for focused testing.',
                        experience: -5
                    },
                    {
                        text: 'Detailed test cases to follow',
                        outcome: 'Test cases contradict the exploratory nature of the testing.',
                        experience: -10
                    },
                    {
                        text: 'Only defects to look for',
                        outcome: 'Predefined defects limit discovery of unexpected issues.',
                        experience: -15
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Test Note-Taking',
                description: 'What\'s the most effective way to take notes during exploratory testing?',
                options: [
                    {
                        text: 'Use a structured template capturing actions, observations, questions, and ideas',
                        outcome: 'Excellent! Structured notes enhance the value of exploratory sessions.',
                        experience: 20,
                    },
                    {
                        text: 'Random jottings of interesting observations',
                        outcome: 'Unstructured notes may miss important details and context.',
                        experience: -5
                    },
                    {
                        text: 'Record everything as formal test cases',
                        outcome: 'Formal test cases are too rigid and time-consuming for exploratory testing.',
                        experience: -10
                    },
                    {
                        text: 'Only document bugs found',
                        outcome: 'Exploratory testing produces valuable insights beyond just bugs.',
                        experience: -15
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Risk-Based Exploration',
                description: 'How should you prioritize areas during exploratory testing?',
                options: [
                    {
                        text: 'Focus on high-risk areas first based on business impact and technical complexity',
                        outcome: 'Perfect! Risk-based prioritization maximizes the value of testing time.',
                        experience: 20,
                    },
                    {
                        text: 'Test everything equally',
                        outcome: 'Equal attention doesn\'t account for varying risks and importance.',
                        experience: -15
                    },
                    {
                        text: 'Focus only on new features',
                        outcome: 'Regression issues in existing features can be equally important.',
                        experience: -10
                    },
                    {
                        text: 'Test whatever seems interesting',
                        outcome: 'While intuition is valuable, a more structured approach to risk is needed.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Test Data Management',
                description: 'What\'s the best approach to test data during exploratory testing?',
                options: [
                    {
                        text: 'Prepare diverse test data sets in advance but remain flexible to create new data during testing',
                        outcome: 'Excellent! This balances preparation with adaptability.',
                        experience: 20,
                    },
                    {
                        text: 'Only use production data',
                        outcome: 'Production data may not cover edge cases and could raise privacy concerns.',
                        experience: -5
                    },
                    {
                        text: 'Create all test data on the fly',
                        outcome: 'This may slow down testing and miss important data scenarios.',
                        experience: -10
                    },
                    {
                        text: 'Use the same test data for all tests',
                        outcome: 'Varied data is essential to uncover different types of issues.',
                        experience: -15
                    }
                ]
            },
            // Additional Intermediate Scenarios
            {
                id: 21,
                level: 'Intermediate',
                title: 'Exploratory Test Planning',
                description: 'How should a tester approach a complex site with numerous distinct functionalities during exploratory testing?',
                options: [
                    {
                        text: 'Create a detailed step-by-step test script for each functionality',
                        outcome: 'This approach contradicts the exploratory testing methodology, which emphasizes flexibility over rigid scripts.',
                        experience: -15
                    },
                    {
                        text: 'Test the entire site in a single session, cycling through each function quickly',
                        outcome: 'This approach lacks focus and may result in superficial testing of complex functionality.',
                        experience: -10
                    },
                    {
                        text: 'Focus only on the highest risk areas and ignore minor functionalities',
                        outcome: 'While prioritization is important, completely ignoring areas can leave critical gaps in testing coverage.',
                        experience: -5
                    },
                    {
                        text: 'Divide testing into time-boxed sessions with specific focus areas, moving from critical to secondary functionality',
                        outcome: 'Excellent! This structured approach maintains the exploratory nature while ensuring comprehensive coverage of a complex system.',
                        experience: 20,
                    }
                ]
            },
            {
                id: 22,
                level: 'Intermediate',
                title: 'Exploratory Test Reporting',
                description: 'What should be included in a test report following exploratory testing?',
                options: [
                    {
                        text: 'Detailed steps to reproduce each test, including timestamps and exact inputs',
                        outcome: 'This level of detail is more appropriate for scripted testing rather than exploratory testing reports.',
                        experience: -10
                    },
                    {
                        text: 'A high-level summary of what was tested and any issues found, with detailed exploration paths and observations',
                        outcome: 'Perfect! This balances the needed detail with the exploratory nature of the testing.',
                        experience: 20,
                    },
                    {
                        text: 'Only defects found, with no information about areas tested',
                        outcome: 'This would not provide sufficient context about testing coverage or the exploration process.',
                        experience: -15
                    },
                    {
                        text: 'Just mark areas as "pass" or "fail" without additional details',
                        outcome: 'This binary approach doesn\'t capture the rich insights generated during exploratory testing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 23,
                level: 'Intermediate',
                title: 'Defect Analysis During Exploration',
                description: 'During exploratory testing, you discover a behavior that seems unusual but you\'re not sure if it\'s a defect. What should you do?',
                options: [
                    {
                        text: 'Ignore it if you\'re not certain it\'s a defect and continue testing other areas',
                        outcome: 'Ignoring potential issues goes against the investigative nature of exploratory testing.',
                        experience: -15
                    },
                    {
                        text: 'Immediately report it as a defect without further investigation',
                        outcome: 'Reporting without investigation may lead to false positives and waste development time.',
                        experience: -10
                    },
                    {
                        text: 'Investigate further to understand the behavior, documenting your observations and determining if it represents a genuine issue',
                        outcome: 'Excellent! This demonstrates the exploratory mindset of investigation and discovery.',
                        experience: 20,
                    },
                    {
                        text: 'Ask a developer if this is expected behavior before proceeding with testing',
                        outcome: 'While developer input can be valuable, immediate external validation may disrupt your exploration flow and limit independent discovery.',
                        experience: -5
                    }
                ]
            },
            {
                id: 24,
                level: 'Intermediate',
                title: 'Regression Testing in Exploratory Approach',
                description: 'How should regression testing be approached within an exploratory testing framework?',
                options: [
                    {
                        text: 'Regression testing cannot be done in an exploratory context as it requires predefined test cases',
                        outcome: 'This incorrectly limits exploratory testing\'s versatility; regression can be performed exploratively.',
                        experience: -15
                    },
                    {
                        text: 'Design time-boxed sessions focused on previously defective areas, with freedom to explore related functionality',
                        outcome: 'Perfect! This combines regression goals with exploratory methods effectively.',
                        experience: 20,
                    },
                    {
                        text: 'Conduct standard scripted regression tests separately from exploratory testing',
                        outcome: 'While this can work as part of a hybrid approach, it doesn\'t integrate regression within the exploratory framework.',
                        experience: -5
                    },
                    {
                        text: 'Only check for regression issues when they\'re encountered by chance during exploration',
                        outcome: 'This reactive approach may miss critical regression issues that should be proactively investigated.',
                        experience: -10
                    }
                ]
            },
            {
                id: 25,
                level: 'Intermediate',
                title: 'Team Collaboration in Exploratory Testing',
                description: 'What\'s the most effective way for multiple testers to collaborate during exploratory testing?',
                options: [
                    {
                        text: 'Each tester should work independently to cover more ground',
                        outcome: 'While coverage is important, this misses valuable collaboration opportunities.',
                        experience: -10
                    },
                    {
                        text: 'Conduct paired testing sessions, followed by debriefings where insights are shared across the team',
                        outcome: 'Excellent! This combines the benefits of collaborative and independent exploration.',
                        experience: 20,
                    },
                    {
                        text: 'Assign specific test cases to each tester to prevent overlap',
                        outcome: 'Assigning specific test cases contradicts the exploratory approach.',
                        experience: -15
                    },
                    {
                        text: 'All testers should test the same area simultaneously to find more defects',
                        outcome: 'While this may find issues in one area, it limits overall coverage and efficiency.',
                        experience: -5
                    }
                ]
            }
        ],

        // Advanced Scenarios
        advanced: [
            {
                id: 11,
                level: 'Advanced',
                title: 'Test Touring',
                description: 'You\'re using the "tour" approach to exploratory testing. Which type of tour would best test API integration points?',
                options: [
                    {
                        text: 'Connection tour - focusing on how different components communicate',
                        outcome: 'Perfect! Connection tours specifically target integration points and data flow.',
                        experience: 25,
                    },
                    {
                        text: 'Feature tour - testing all features',
                        outcome: 'Feature tours don\'t specifically target integration concerns.',
                        experience: -10
                    },
                    {
                        text: 'Landmark tour - focusing on main functionality',
                        outcome: 'Landmark tours miss the specific integration aspects of APIs.',
                        experience: -15
                    },
                    {
                        text: 'Garbage collector tour - focusing on cleanup processes',
                        outcome: 'While important, this doesn\'t focus on API communication.',
                        experience: -20
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Session-Based Testing',
                description: 'In session-based exploratory testing, what should happen in the debriefing?',
                options: [
                    {
                        text: 'Review findings, identify blockers, refine strategies, and plan next sessions',
                        outcome: 'Excellent! Effective debriefing maximizes learning and improves future sessions.',
                        experience: 25,
                    },
                    {
                        text: 'Just list bugs found',
                        outcome: 'Debriefing should cover broader insights beyond just bugs.',
                        experience: -20
                    },
                    {
                        text: 'Assign blame for missed issues',
                        outcome: 'Blame is counterproductive to continuous improvement.',
                        experience: -15
                    },
                    {
                        text: 'Focus only on test coverage metrics',
                        outcome: 'Quantitative metrics alone miss valuable qualitative insights.',
                        experience: -10
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Team Collaboration',
                description: 'How can you best integrate exploratory testing with an Agile development team?',
                options: [
                    {
                        text: 'Conduct paired exploratory testing sessions with developers and share insights in sprint reviews',
                        outcome: 'Perfect! Collaboration enhances knowledge sharing and test effectiveness.',
                        experience: 25,
                    },
                    {
                        text: 'Test independently and report bugs',
                        outcome: 'This misses opportunities for collaboration and knowledge sharing.',
                        experience: -15
                    },
                    {
                        text: 'Wait until features are complete before testing',
                        outcome: 'Delayed testing contradicts Agile principles of early feedback.',
                        experience: -10
                    },
                    {
                        text: 'Only participate in formal test phases',
                        outcome: 'Agile teams benefit from continuous testing throughout development.',
                        experience: -20
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Automation Integration',
                description: 'How should exploratory testing relate to test automation?',
                options: [
                    {
                        text: 'Use exploratory testing to identify areas for automation and automate repetitive checks to free up exploration time',
                        outcome: 'Excellent! This creates a virtuous cycle where each approach strengthens the other.',
                        experience: 25,
                    },
                    {
                        text: 'Keep them completely separate',
                        outcome: 'Integration between manual and automated testing creates efficiencies.',
                        experience: -10
                    },
                    {
                        text: 'Replace exploratory testing with automation',
                        outcome: 'Automation cannot replace the cognitive aspects of exploratory testing.',
                        experience: -15
                    },
                    {
                        text: 'Only automate what was found during exploration',
                        outcome: 'This is too reactive; strategic automation planning is needed.',
                        experience: -20
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Advanced Techniques',
                description: 'Which advanced technique would be most effective for exploring potential security vulnerabilities?',
                options: [
                    {
                        text: 'Thinking like an attacker and using threat modeling to guide exploration',
                        outcome: 'Perfect! This mindset is critical for effective security testing.',
                        experience: 25,
                    },
                    {
                        text: 'Running standard functional tests',
                        outcome: 'Functional tests rarely uncover security issues.',
                        experience: -15
                    },
                    {
                        text: 'Using only automated security scanners',
                        outcome: 'Tools alone miss many vulnerabilities that creative exploration can find.',
                        experience: -10
                    },
                    {
                        text: 'Testing only with valid inputs',
                        outcome: 'Security testing requires invalid, unexpected, and malicious inputs.',
                        experience: -20
                    }
                ]
            },
            // Additional Advanced Scenarios
            {
                id: 26,
                level: 'Advanced',
                title: 'Stakeholder Communication',
                description: 'What\'s the most effective way to communicate exploratory testing results to senior stakeholders?',
                options: [
                    {
                        text: 'Provide detailed testing logs of every action taken during exploration',
                        outcome: 'This level of detail would overwhelm senior stakeholders who need higher-level insights.',
                        experience: -15
                    },
                    {
                        text: 'Only report critical defects found, omitting other observations',
                        outcome: 'This misses valuable insights about quality and risk that exploratory testing generates.',
                        experience: -20
                    },
                    {
                        text: 'Present a concise summary with key findings, risk assessment, coverage highlights, and strategic recommendations',
                        outcome: 'Excellent! This provides stakeholders with actionable information at the right level of detail.',
                        experience: 25, 
                    },
                    {
                        text: 'Explain your testing approach and methodology in detail',
                        outcome: 'While methodology is important, stakeholders are typically more interested in outcomes and business impact than testing processes.',
                        experience: -10
                    }
                ]
            },
            {
                id: 27,
                level: 'Advanced',
                title: 'Metrics for Exploratory Testing',
                description: 'Which metrics are most valuable for evaluating the effectiveness of exploratory testing?',
                options: [
                    {
                        text: 'Number of test cases executed and passed/failed rate',
                        outcome: 'These scripted testing metrics don\'t align with exploratory testing\'s flexible nature.',
                        experience: -20
                    },
                    {
                        text: 'Coverage against predefined requirements',
                        outcome: 'This doesn\'t capture exploratory testing\'s ability to discover unforeseen issues.',
                        experience: -15
                    },
                    {
                        text: 'Balance of session time spent on different activities and value of issues discovered',
                        outcome: 'Perfect! These metrics provide insight into exploration efficiency and effectiveness without constraining the process.',
                        experience: 25,
                    },
                    {
                        text: 'Total number of defects found compared to scripted testing',
                        outcome: 'While informative, this metric alone doesn\'t capture the qualitative insights from exploratory testing.',
                        experience: -10
                    }
                ]
            },
            {
                id: 28,
                level: 'Advanced',
                title: 'Complex System Exploration',
                description: 'What\'s the most effective approach for exploratory testing of a complex integrated system with multiple interfaces?',
                options: [
                    {
                        text: 'Focus exclusively on testing individual components separately',
                        outcome: 'This misses critical integration issues that often occur between components.',
                        experience: -20
                    },
                    {
                        text: 'Develop a model of the system architecture and design targeted tours that focus on intercomponent communication and data flow',
                        outcome: 'Excellent! This structured exploration approach helps navigate complex systems effectively.',
                        experience: 25,
                    },
                    {
                        text: 'Conduct random testing across the system without a specific focus',
                        outcome: 'Unfocused testing is inefficient for complex systems and may miss critical areas.',
                        experience: -15
                    },
                    {
                        text: 'Only test the system through its primary user interface',
                        outcome: 'This misses important backend interactions and alternative interfaces.',
                        experience: -10
                    }
                ]
            },
            {
                id: 29,
                level: 'Advanced',
                title: 'Continuous Exploration',
                description: 'How should exploratory testing be integrated into a continuous delivery pipeline?',
                options: [
                    {
                        text: 'Schedule periodic exploratory testing sprints separate from the development cycle',
                        outcome: 'This creates a disconnection from the rapid delivery cycle.',
                        experience: -10
                    },
                    {
                        text: 'Wait until features are complete before conducting exploratory testing',
                        outcome: 'This introduces delays that contradict continuous delivery principles.',
                        experience: -15
                    },
                    {
                        text: 'Replace exploratory testing with automated checks in the pipeline',
                        outcome: 'Automation cannot replace the creative, adaptive aspects of exploratory testing.',
                        experience: -20
                    },
                    {
                        text: 'Implement continuous exploration with time-boxed sessions aligned to development iterations and focused on newly delivered features',
                        outcome: 'Perfect! This aligns exploratory testing with the continuous delivery rhythm.',
                        experience: 25,
                    }
                ]
            },
            {
                id: 30,
                level: 'Advanced',
                title: 'Exploratory Testing Strategy',
                description: 'What should be the cornerstone of an enterprise-level exploratory testing strategy?',
                options: [
                    {
                        text: 'Converting all exploratory insights into scripted test cases',
                        outcome: 'This undermines the flexibility and discovery nature of exploratory testing.',
                        experience: -20
                    },
                    {
                        text: 'Trained testers with strong domain knowledge, supported by charters, debriefing processes, and knowledge sharing mechanisms',
                        outcome: 'Excellent! This combines skilled personnel with appropriate processes for maximum effectiveness.',
                        experience: 25,
                    },
                    {
                        text: 'Detailed documentation of all exploratory processes',
                        outcome: 'Over-documentation can hinder the flexibility of exploratory testing.',
                        experience: -10
                    },
                    {
                        text: 'Specialized tools for recording exploratory sessions',
                        outcome: 'While tools can be helpful, they\'re secondary to tester skills and effective processes.',
                        experience: -15
                    }
                ]
            }
        ]
}