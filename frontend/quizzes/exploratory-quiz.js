import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class ExploratoryQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re an exploratory testing expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong exploratory testing skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing exploratory testing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'exploratory',
            writable: false,
            configurable: false,
            enumerable: true
        });
        
        // Initialize player state
        this.player = {
            name: '',
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: []
        };

        // Initialize API service
        this.apiService = new APIService();

        // Initialize all screen elements
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');
        
        // Verify all required elements exist
        if (!this.gameScreen) {
            console.error('Game screen element not found');
            this.showError('Quiz initialization failed. Please refresh the page.');
            return;
        }
        
        if (!this.outcomeScreen) {
            console.error('Outcome screen element not found');
            this.showError('Quiz initialization failed. Please refresh the page.');
            return;
        }
        
        if (!this.endScreen) {
            console.error('End screen element not found');
            this.showError('Quiz initialization failed. Please refresh the page.');
            return;
        }

        // Basic Scenarios
        this.basicScenarios = [
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
                        tool: 'Test Planning'
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
                        tool: 'Session-Based Testing'
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
                        tool: 'Test Notes'
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
                        experience: 5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Bug Reporting',
                description: 'You found a bug during exploratory testing. What information should you include in your report?',
                options: [
                    {
                        text: 'Detailed steps to reproduce, expected vs. actual results, and context of discovery',
                        outcome: 'Excellent! Comprehensive bug reports help developers understand and fix issues.',
                        experience: 15,
                        tool: 'Bug Reporting'
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
                        tool: 'Boundary Testing'
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
                        experience: 5
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
                        tool: 'Focus Area Structure'
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
                        tool: 'Exploratory Test Time Management'
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
                        tool: 'Exploratory Test Review'
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
                        tool: 'Exploratory Smoke Tests'
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
                        tool: 'Test Time Allocation'
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
        ];

        // Intermediate Scenarios
        this.intermediateScenarios = [
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
                        tool: 'Testing Heuristics'
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
                        tool: 'Test Charter'
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
                        tool: 'Session Notes'
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
                        tool: 'Risk Assessment'
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
                        tool: 'Test Data Management'
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
                        tool: 'Exploratory Session Planning'
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
                        tool: 'Exploratory Reporting'
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
                        tool: 'Defect Investigation'
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
                        tool: 'Exploratory Regression'
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
                        tool: 'Collaborative Exploration'
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
        ];

        // Advanced Scenarios
        this.advancedScenarios = [
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
                        tool: 'Test Touring'
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
                        tool: 'Session Debriefing'
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
                        tool: 'Paired Testing'
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
                        tool: 'Automation Strategy'
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
                        tool: 'Security Testing'
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
                        tool: 'Stakeholder Reporting'
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
                        tool: 'Exploratory Metrics'
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
                        tool: 'System Modeling'
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
                        tool: 'Continuous Exploration'
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
                        tool: 'Enterprise Exploration Strategy'
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
        ];

        // Initialize UI and add event listeners
        this.initializeEventListeners();

        this.isLoading = false;
    }

    initializeUI() {
        try {
            console.log('Initializing UI for exploratory quiz');
            
            // Ensure all required elements exist
            this.ensureRequiredElementsExist();
            
            // Initialize API service
            this.apiService = new APIService();

            // Create timer display if it doesn't exist
            const timerDisplay = document.getElementById('timer-display');
            if (!timerDisplay) {
                const quizCard = document.querySelector('.quiz-card');
                if (quizCard) {
                    const timerDiv = document.createElement('div');
                    timerDiv.id = 'timer-display';
                    timerDiv.className = 'timer';
                    timerDiv.innerHTML = '<span id="timer-value">60</span>';
                    quizCard.prepend(timerDiv);
                }
            }
            
            // Create loading indicator if it doesn't exist
            const loadingIndicator = document.getElementById('loading-indicator');
            if (!loadingIndicator) {
                const loadingDiv = document.createElement('div');
                loadingDiv.id = 'loading-indicator';
                loadingDiv.className = 'loading-indicator hidden';
                loadingDiv.innerHTML = '<span>Loading...</span>';
                document.body.appendChild(loadingDiv);
            }
            
            // Create level transition container if it doesn't exist
            const transitionContainer = document.getElementById('level-transition-container');
            if (!transitionContainer) {
                const transitionDiv = document.createElement('div');
                transitionDiv.id = 'level-transition-container';
                transitionDiv.className = 'level-transition-container';
                document.body.appendChild(transitionDiv);
            }
            
            // Set up quiz progress indicator
            const progressIndicator = document.getElementById('progress-indicator');
            if (!progressIndicator) {
                const quizCard = document.querySelector('.quiz-card');
                if (quizCard) {
                    const progressDiv = document.createElement('div');
                    progressDiv.id = 'progress-indicator';
                    progressDiv.className = 'progress-indicator';
                    progressDiv.innerHTML = '<span>Question 1/15</span>';
                    quizCard.prepend(progressDiv);
                }
            }
            
            // Add CSS styles for level transition if needed
            const styleExists = document.querySelector('style#exploratory-quiz-styles');
            if (!styleExists) {
                const style = document.createElement('style');
                style.id = 'exploratory-quiz-styles';
                style.innerHTML = `
                    .level-transition-container {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.8);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000;
                        opacity: 0;
                        visibility: hidden;
                        transition: opacity 0.3s ease;
                    }
                    
                    .level-transition-container.active {
                        opacity: 1;
                        visibility: visible;
                    }
                    
                    .level-transition {
                        background-color: white;
                        padding: 30px;
                        border-radius: 10px;
                        text-align: center;
                        max-width: 90%;
                    }
                    
                    .transition-progress {
                        height: 6px;
                        background-color: #eee;
                        margin-top: 20px;
                        position: relative;
                        overflow: hidden;
                        border-radius: 3px;
                    }
                    
                    .transition-progress:after {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 0;
                        height: 100%;
                        width: 30%;
                        background-color: #4CAF50;
                        animation: progress 3s linear forwards;
                    }
                    
                    @keyframes progress {
                        0% { width: 0; }
                        100% { width: 100%; }
                    }
                    
                    .loading-indicator {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(255, 255, 255, 0.8);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 2000;
                    }
                    
                    .loading-indicator.hidden {
                        display: none;
                    }
                `;
                document.head.appendChild(style);
            }
            
            console.log('UI initialization complete');
        } catch (error) {
            console.error('Error initializing UI:', error);
        }
    }

    ensureRequiredElementsExist() {
        try {
            console.log('Ensuring required elements exist');
            
            // Check for the main container
            let quizContainer = document.querySelector('.quiz-container');
            if (!quizContainer) {
                console.log('Creating quiz container');
                quizContainer = document.createElement('div');
                quizContainer.className = 'quiz-container';
                document.body.appendChild(quizContainer);
            }
            
            // Check for game screen
            let gameScreen = document.getElementById('game-screen');
            if (!gameScreen) {
                console.log('Creating game screen');
                gameScreen = document.createElement('div');
                gameScreen.id = 'game-screen';
                gameScreen.className = 'quiz-card';
                gameScreen.setAttribute('role', 'main');
                gameScreen.setAttribute('aria-live', 'polite');
                quizContainer.appendChild(gameScreen);
            }
            
            // Check for scenario container
            let scenarioContainer = document.getElementById('scenario-container');
            if (!scenarioContainer) {
                console.log('Creating scenario container');
                scenarioContainer = document.createElement('div');
                scenarioContainer.id = 'scenario-container';
                scenarioContainer.className = 'scenario-container';
                gameScreen.appendChild(scenarioContainer);
                
                // Add basic structure to scenario container
                scenarioContainer.innerHTML = `
                    <h2 id="scenario-title" class="scenario-title">Loading Scenario...</h2>
                    <p id="scenario-description" class="scenario-description">Please wait while we load your scenario.</p>
                    <div id="options-container" class="options-container"></div>
                `;
            }
            
            // Check for outcome screen
            let outcomeScreen = document.getElementById('outcome-screen');
            if (!outcomeScreen) {
                console.log('Creating outcome screen');
                outcomeScreen = document.createElement('div');
                outcomeScreen.id = 'outcome-screen';
                outcomeScreen.className = 'quiz-card hidden';
                outcomeScreen.style.display = 'none';
                quizContainer.appendChild(outcomeScreen);
                
                // Add basic structure to outcome screen
                outcomeScreen.innerHTML = `
                    <h2 id="outcome-title">Result</h2>
                    <p id="outcome-message"></p>
                    <div id="xp-container" class="xp-container">
                        <span id="xp-amount">+0</span> XP
                    </div>
                    <button id="continue-btn" class="quiz-btn">Continue</button>
                `;
            }
            
            // Check for end screen
            let endScreen = document.getElementById('end-screen');
            if (!endScreen) {
                console.log('Creating end screen');
                endScreen = document.createElement('div');
                endScreen.id = 'end-screen';
                endScreen.className = 'quiz-card hidden';
                endScreen.style.display = 'none';
                quizContainer.appendChild(endScreen);
                
                // Add basic structure to end screen
                endScreen.innerHTML = `
                    <h2>Quiz Complete!</h2>
                    <div class="score-container">
                        <div class="score-circle">
                            <span id="final-score">0%</span>
                        </div>
                    </div>
                    <p id="performance-message"></p>
                    <div id="recommendations"></div>
                    <button id="restart-btn" class="quiz-btn">Restart Quiz</button>
                    <a href="/index.html" class="quiz-btn secondary-btn">Back to Home</a>
                `;
            }
            
            console.log('All required elements checked and created if needed');
            return true;
        } catch (error) {
            console.error('Error in ensureRequiredElementsExist:', error);
            return false;
        }
    }

    updateProgressDisplay() {
        try {
            const totalAnswered = this.player?.questionHistory?.length || 0;
            
            // Update question counter
            const progressIndicator = document.getElementById('progress-indicator');
            if (progressIndicator) {
                progressIndicator.innerHTML = `<span>Question ${totalAnswered + 1}/15</span>`;
            }
            
            // Get level based on questions answered
            const level = this.getCurrentLevel();
            
            // Update level indicator if it exists
            const levelIndicator = document.getElementById('level-indicator');
            if (levelIndicator) {
                levelIndicator.textContent = level;
            }
            
            // Update progress bar if it exists
            const progressBar = document.getElementById('progress-fill');
            if (progressBar) {
                const progressPercentage = (totalAnswered / 15) * 100;
                progressBar.style.width = `${progressPercentage}%`;
            }
            
            console.log(`Progress updated: ${totalAnswered}/15 questions, Level: ${level}`);
        } catch (error) {
            console.error('Error updating progress display:', error);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    shouldEndGame() {
        // End game if we've answered all questions
        return this.player.questionHistory.length >= 15;
    }

    async saveProgress() {
        // First determine the status based on completion criteria only
        let status = 'in-progress';
        
        // Check for completion (all 15 questions answered)
        if (this.player.questionHistory.length >= 15) {
            // Calculate pass/fail based on correct answers
            const correctAnswers = this.player.questionHistory.filter(q => 
                q.selectedAnswer && (q.selectedAnswer.isCorrect || q.selectedAnswer.experience > 0)
            ).length;
            const scorePercentage = Math.round((correctAnswers / 15) * 100);
            status = scorePercentage >= 70 ? 'passed' : 'failed';
        }

        const progress = {
            data: {
                experience: this.player.experience,
                tools: this.player.tools,
                currentScenario: this.player.currentScenario,
                questionHistory: this.player.questionHistory,
                lastUpdated: new Date().toISOString(),
                questionsAnswered: this.player.questionHistory.length,
                randomizedScenarios: this.randomizedScenarios, // Save randomized scenarios for consistent experience
                status: status,
                scorePercentage: Math.round((this.player.questionHistory.filter(q => 
                    q.selectedAnswer && (q.selectedAnswer.isCorrect || q.selectedAnswer.experience > 0)
                ).length / 15) * 100)
            }
        };

        try {
            const username = localStorage.getItem('username');
            
            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify(progress));
            
            await this.apiService.saveQuizProgress(this.quizName, progress.data);
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }

    async loadProgress() {
        try {
            const username = localStorage.getItem('username');

            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            const savedProgress = await this.apiService.getQuizProgress(this.quizName);
            let progress = null;
            
            if (savedProgress && savedProgress.data) {
                // Normalize the data structure
                progress = {
                    experience: savedProgress.data.experience || 0,
                    tools: savedProgress.data.tools || [],
                    questionHistory: savedProgress.data.questionHistory || [],
                    currentScenario: savedProgress.data.currentScenario || 0,
                    randomizedScenarios: savedProgress.data.randomizedScenarios,
                    status: savedProgress.data.status || 'in-progress'
                };
            } else {
                // Try loading from localStorage as fallback
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    progress = parsed;
                }
            }

            if (progress) {
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                this.player.currentScenario = progress.currentScenario || 0;

                // Restore randomized scenarios if they exist
                if (progress.randomizedScenarios) {
                    this.randomizedScenarios = progress.randomizedScenarios;
                }

                // Ensure we're updating the UI correctly
                this.updateProgress();
                
                // Check quiz status and show appropriate screen
                if (progress.status === 'failed' || progress.status === 'passed') {
                    this.endGame(progress.status === 'failed');
                    return true;
                }

                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to load progress:', error);
            return false;
        }
    }

    async startGame() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            // Show loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.remove('hidden');
            }

            // Set player name from localStorage
            this.player.name = localStorage.getItem('username');
            if (!this.player.name) {
                window.location.href = '/login.html';
                return;
            }

            // Initialize event listeners
            this.initializeEventListeners();
            
            // Load previous progress
            const hasProgress = await this.loadProgress();
            
            if (!hasProgress) {
                // Reset player state if no valid progress exists
                this.player.experience = 0;
                this.player.tools = [];
                this.player.currentScenario = 0;
                this.player.questionHistory = [];
            }
            
            // Clear any existing transition messages
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = '';
                transitionContainer.classList.remove('active');
            }

            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
            }
            
            await this.displayScenario();
        } finally {
            this.isLoading = false;
            // Hide loading state
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
        }
    }

    initializeEventListeners() {
        try {            
            // Add event listeners for the continue and restart buttons
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) {
                // Remove any existing listeners by cloning and replacing
                const newBtn = continueBtn.cloneNode(true);
                continueBtn.parentNode.replaceChild(newBtn, continueBtn);
                
                // Add fresh event listener
                newBtn.addEventListener('click', () => {
                    this.nextScenario();
                });
            }
            
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => this.restartGame());
            }

            // Add form submission handler
            const optionsForm = document.getElementById('options-form');
            if (optionsForm) {
                optionsForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleAnswer();
                });
            }
            
            // Add submit button click handler
            const submitButton = document.querySelector('.submit-button');
            if (submitButton) {
                submitButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleAnswer();
                });
            }

            // Add keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target.type === 'radio') {
                    this.handleAnswer();
                }
            });            
        } catch (error) {
            console.error('Error initializing event listeners:', error);
        }
    }

    displayScenario() {
        try {
            // Check if player and currentScenario are properly initialized
            if (!this.player || typeof this.player.currentScenario !== 'number') {
                return;
            }
            
            // Check if we've answered all 15 questions
            if (this.player.questionHistory.length >= 15) {
                this.endGame();
                return;
            }
            
            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
            }
            
            const currentScenarios = this.getCurrentScenarios();
            
            if (!currentScenarios || !Array.isArray(currentScenarios)) {
                return;
            }

            const scenario = currentScenarios[this.player.currentScenario];
            
            // Check if the current scenario exists
            if (!scenario) {
                // Reset currentScenario for the next level
                this.player.currentScenario = 0;
                
                // Get the next level scenarios
                const updatedScenarios = this.getCurrentScenarios();
                if (!updatedScenarios || !updatedScenarios[0]) {
                    this.endGame();
                    return;
                }
                
                // Display the first scenario of the next level
                const nextScenario = updatedScenarios[0];
                this.displayScenarioContent(nextScenario);
                return;
            }
            
            // Display the current scenario
            this.displayScenarioContent(scenario);
        } catch (error) {
            console.error('Error displaying scenario:', error);
            this.showError('An error occurred displaying the scenario. Please try reloading the page.');
        }
    }
    
    // Helper method to display scenario content
    displayScenarioContent(scenario) {
        try {
            // Update UI with current scenario
            const titleElement = document.getElementById('scenario-title');
            const descriptionElement = document.getElementById('scenario-description');
            const optionsContainer = document.getElementById('options-container');

            if (titleElement && scenario.title) {
                titleElement.textContent = scenario.title;
            }

            if (descriptionElement && scenario.description) {
                descriptionElement.textContent = scenario.description;
            }
            
            if (optionsContainer && scenario.options && Array.isArray(scenario.options)) {
                optionsContainer.innerHTML = '';
                
                // Shuffle options to randomize their order
                const shuffledOptions = this.shuffleArray(scenario.options);
                
                shuffledOptions.forEach((option, index) => {
                    if (!option || !option.text) {
                        return;
                    }
                    
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    optionDiv.innerHTML = `
                        <input type="radio" 
                            name="option" 
                            value="${scenario.options.indexOf(option)}" 
                            id="option${index}"
                            tabindex="0"
                            aria-label="${option.text}">
                        <label for="option${index}">${option.text}</label>
                    `;
                    optionsContainer.appendChild(optionDiv);
                });
            }

            // Record start time for this question
            this.questionStartTime = Date.now();

            // Initialize timer for the new question
            this.initializeTimer();
            
            // Update progress display
            this.updateProgress();
            
        } catch (error) {
            console.error('Error displaying scenario content:', error);
        }
    }

    isCorrectAnswer(answer) {
        // Helper method to consistently determine if an answer is correct
        return answer && (answer.isCorrect || answer.experience > 0);
    }

    async handleAnswer() {
        if (this.isLoading) return;
        
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
        }

        // Clear the timer when an answer is submitted
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
        
        try {
            this.isLoading = true;
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) {
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }

            const currentScenarios = this.getCurrentScenarios();
            if (!currentScenarios || !this.player || this.player.currentScenario === undefined) {
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }
            
            const scenario = currentScenarios[this.player.currentScenario];
            if (!scenario || !scenario.options) {
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }
            
            const originalIndex = parseInt(selectedOption.value);
            if (isNaN(originalIndex) || originalIndex < 0 || originalIndex >= scenario.options.length) {
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }
            
            const selectedAnswer = scenario.options[originalIndex];
            if (!selectedAnswer) {
                if (submitButton) {
                    submitButton.disabled = false;
                }
                this.isLoading = false;
                return;
            }

            // Find the correct answer (option with highest experience)
            const correctAnswer = scenario.options.reduce((prev, current) => 
                (prev.experience > current.experience) ? prev : current
            );

            // Mark selected answer as correct or incorrect
            selectedAnswer.isCorrect = selectedAnswer === correctAnswer;

            // Update player state (still track experience for backward compatibility)
            if (typeof this.player.experience === 'number') {
                this.player.experience = Math.max(0, Math.min(this.maxXP || 300, this.player.experience + (selectedAnswer.experience || 0)));
            }
            
            // Add to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: this.isCorrectAnswer(selectedAnswer)
            });

            // Save progress
            try {
                await this.saveProgress();
            } catch (error) {
                console.error('Failed to save progress:', error);
                this.showError('Warning: Progress may not have saved correctly');
            }
            
            // Save quiz result
            const username = localStorage.getItem('username');
            if (username) {
                try {
                    const quizUser = new QuizUser(username);
                    const score = {
                        score: Math.round((this.player.questionHistory.filter(q => this.isCorrectAnswer(q.selectedAnswer)).length / Math.min(this.player.questionHistory.length, 15)) * 100),
                        experience: this.player.experience || 0,
                        questionHistory: this.player.questionHistory || [],
                        questionsAnswered: this.player.questionHistory.length
                    };
                    
                    await quizUser.updateQuizScore(
                        this.quizName,
                        score.score,
                        score.experience,
                        this.player.tools || [],
                        score.questionHistory,
                        score.questionsAnswered
                    );
                } catch (error) {
                    console.error('Failed to update quiz score:', error);
                }
            }

            // Show outcome screen and update display with answer outcome
            this.displayOutcome(selectedAnswer);

            // Update progress display
            this.updateProgress();
        } catch (error) {
            console.error('Failed to process answer:', error);
            this.showError('Failed to save your answer. Please try again.');
        } finally {
            this.isLoading = false;
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    }

    initializeTimer() {
        // Clear any existing timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }

        // Reset remaining time
        this.remainingTime = this.timePerQuestion;
        this.questionStartTime = Date.now();

        // Update timer display
        const timerContainer = document.getElementById('timer-container');
        if (timerContainer) {
            timerContainer.textContent = `Time remaining: ${this.remainingTime}s`;
        }

        // Start the countdown
        this.questionTimer = setInterval(() => {
            this.remainingTime--;
            
            // Update timer display
            if (timerContainer) {
                timerContainer.textContent = `Time remaining: ${this.remainingTime}s`;
                
                // Add warning class when time is running low
                if (this.remainingTime <= 5) {
                    timerContainer.classList.add('timer-warning');
                } else {
                    timerContainer.classList.remove('timer-warning');
                }
            }

            // Check if time is up
            if (this.remainingTime <= 0) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
                this.handleTimeUp();
            }
        }, 1000);
    }

    // Handle time up situation
    handleTimeUp() {
        try {
            // Get current scenario
            const currentScenarios = this.getCurrentScenarios();
            if (!currentScenarios || !this.player) {
                return;
            }
            
            const scenario = currentScenarios[this.player.currentScenario];
            if (!scenario) {
                return;
            }
            
            // Create a timeout answer
            const timeoutAnswer = {
                text: 'Time ran out!',
                experience: 0,
                isCorrect: false,
                isTimeout: true,
                outcome: 'You did not answer in time.'
            };
            
            // Update player state
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: timeoutAnswer,
                isCorrect: false,
                isTimeout: true
            });
            
            // Save progress
            this.saveProgress().catch(error => {
                console.error('Failed to save timeout progress:', error);
            });
            
            // Display the timeout outcome
            this.displayOutcome(timeoutAnswer);
        } catch (error) {
            console.error('Error handling time up:', error);
        }
    }

    updateProgress() {
        // Get current level and question count
        const currentLevel = this.getCurrentLevel();
        const totalAnswered = this.player.questionHistory.length;
        
        // Ensure question number never exceeds 15
        const questionNumber = Math.min(totalAnswered + 1, 15);
        
        // Update the existing progress card elements
        const levelInfoElement = document.querySelector('.level-info');
        const questionInfoElement = document.querySelector('.question-info');
        
        if (levelInfoElement) {
            levelInfoElement.textContent = `Level: ${currentLevel}`;
        }
        
        if (questionInfoElement) {
            questionInfoElement.textContent = `Question: ${questionNumber}/15`;
        }
        
        // Ensure the card is visible
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'block';
        }
        
        // Update legacy progress elements if they exist
        const levelIndicator = document.getElementById('level-indicator');
        const questionProgress = document.getElementById('question-progress');
        const progressFill = document.getElementById('progress-fill');
        
        if (levelIndicator) {
            levelIndicator.textContent = `Level: ${currentLevel}`;
        }
        
        if (questionProgress) {
            questionProgress.textContent = `Question: ${questionNumber}/${this.totalQuestions || 15}`;
        }
        
        if (progressFill) {
            // Calculate progress percentage (max 100%)
            const progressPercentage = Math.min((totalAnswered / (this.totalQuestions || 15)) * 100, 100);
            progressFill.style.width = `${progressPercentage}%`;
        }
    }

    restartGame() {
        // Reset player state
        this.player = {
            name: localStorage.getItem('username'),
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: []
        };

        // Reset UI
        this.gameScreen.classList.remove('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');

        // Clear any existing transition messages
        const transitionContainer = document.getElementById('level-transition-container');
        if (transitionContainer) {
            transitionContainer.innerHTML = '';
            transitionContainer.classList.remove('active');
        }

        // Update progress display
        this.updateProgress();

        // Start from first scenario
        this.displayScenario();
    }

    getCurrentScenarios() {
        try {
            const totalAnswered = this.player?.questionHistory?.length || 0;
            
            // If we don't have the randomized sets yet, create them
            if (!this.randomizedScenarios) {
                this.randomizedScenarios = {
                    basic: this.shuffleArray([...this.basicScenarios]).slice(0, 5),
                    intermediate: this.shuffleArray([...this.intermediateScenarios]).slice(0, 5),
                    advanced: this.shuffleArray([...this.advancedScenarios]).slice(0, 5)
                };
            }
        
            // Simple progression logic based solely on question count, no threshold checks
            if (totalAnswered >= 10) {
                return this.randomizedScenarios.advanced;
            } else if (totalAnswered >= 5) {
                return this.randomizedScenarios.intermediate;
            }
            return this.randomizedScenarios.basic;
        } catch (error) {
            console.error('Error getting current scenarios:', error);
            return this.basicScenarios; // Default to basic if there's an error
        }
    }

    getCurrentLevel() {
        try {
            const totalAnswered = this.player?.questionHistory?.length || 0;
        
            // Determine level based solely on question count
            if (totalAnswered >= 10) {
                return 'Advanced';
            } else if (totalAnswered >= 5) {
                return 'Intermediate';
            }
            return 'Basic';
        } catch (error) {
            console.error('Error getting current level:', error);
            return 'Basic'; // Default to basic if there's an error
        }
    }

    generateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations');
        if (!recommendationsContainer) return;

        const score = Math.round((this.player.experience / this.maxXP) * 100);
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            const maxXP = record.maxPossibleXP;
            const earnedXP = record.selectedAnswer.experience;
            const isCorrect = earnedXP === maxXP;

            // Categorize the question based on its content
            const questionType = this.categorizeQuestion(record.scenario);
            
            if (isCorrect) {
                if (!strongAreas.includes(questionType)) {
                    strongAreas.push(questionType);
                }
            } else {
                if (!weakAreas.includes(questionType)) {
                    weakAreas.push(questionType);
                }
            }
        });

        // Generate recommendations HTML
        let recommendationsHTML = '';

        if (score >= 95 && weakAreas.length === 0) {
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of exploratory testing. You clearly understand the principles and practices of exploratory testing and are well-equipped to handle any exploratory testing challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your exploratory testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
            recommendationsHTML += '<ul>';
            if (weakAreas.length > 0) {
                weakAreas.forEach(area => {
                    recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
                });
            }
            recommendationsHTML += '</ul>';
        } else if (score >= 60) {
            recommendationsHTML = '<p>👍 Good effort! Here are some areas to focus on:</p>';
            recommendationsHTML += '<ul>';
            weakAreas.forEach(area => {
                recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
            });
            recommendationsHTML += '</ul>';
        } else {
            recommendationsHTML = '<p>📚 Here are key areas for improvement:</p>';
            recommendationsHTML += '<ul>';
            weakAreas.forEach(area => {
                recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
            });
            recommendationsHTML += '</ul>';
        }

        recommendationsContainer.innerHTML = recommendationsHTML;
    }

    categorizeQuestion(scenario) {
        // Categorize questions based on their content
        const title = scenario.title?.toLowerCase() || '';
        const description = scenario.description?.toLowerCase() || '';

        if (title.includes('planning') || description.includes('planning')) {
            return 'Test Planning';
        } else if (title.includes('time') || description.includes('time')) {
            return 'Time Management';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Documentation';
        } else if (title.includes('bug') || description.includes('bug')) {
            return 'Bug Reporting';
        } else if (title.includes('technique') || description.includes('technique')) {
            return 'Test Techniques';
        } else if (title.includes('heuristic') || description.includes('heuristic')) {
            return 'Testing Heuristics';
        } else if (title.includes('risk') || description.includes('risk')) {
            return 'Risk-Based Testing';
        } else if (title.includes('team') || description.includes('team')) {
            return 'Team Collaboration';
        } else if (title.includes('automation') || description.includes('automation')) {
            return 'Automation Integration';
        } else {
            return 'General Exploratory Testing';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Test Planning': 'Practice creating structured plans for exploratory sessions that balance freedom with focus.',
            'Time Management': 'Strengthen time-boxed testing approach and prioritization of testing activities based on functionality importance.',
            'Documentation': 'Focus on lightweight but effective documentation that captures valuable insights without hindering exploration.',
            'Bug Reporting': 'Enhance your bug reports with clear reproduction steps, expected vs. actual results, and contextual information.',
            'Test Techniques': 'Study and apply diverse testing techniques like boundary testing, state transitions, and domain testing.',
            'Testing Heuristics': 'Learn and apply testing heuristics like CRUD, FEW HICCUPPS, and SFDPOT to guide your exploration.',
            'Risk-Based Testing': 'Practice identifying and prioritizing high-risk areas for more focused exploratory testing.',
            'Team Collaboration': 'Develop skills for collaborative exploratory testing and sharing insights with team members.',
            'Automation Integration': 'Learn how to effectively combine exploratory testing with automation for a comprehensive test strategy.',
            'General Exploratory Testing': 'Study the fundamental principles and practices of structured exploratory testing.'
        };

        return recommendations[area] || 'Continue practicing general exploratory testing skills.';
    }

    // Helper method to shuffle an array using Fisher-Yates algorithm
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Implement the endGame method that was missing
    async endGame(failed = false) {
        try {
            // Clear any timers
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
            }
            
            // Show the end screen and hide others
            if (this.gameScreen) this.gameScreen.classList.add('hidden');
            if (this.outcomeScreen) this.outcomeScreen.classList.add('hidden');
            if (this.endScreen) {
                this.endScreen.classList.remove('hidden');
            } else {
                console.error('End screen element not found');
            }
            
            // Calculate score percentage
            const correctAnswers = this.player.questionHistory.filter(q => this.isCorrectAnswer(q.selectedAnswer)).length;
            const scorePercentage = Math.round((correctAnswers / 15) * 100);
            const isPassed = scorePercentage >= (this.passPercentage || 70);
            
            // Determine final status
            const finalStatus = failed ? 'failed' : (isPassed ? 'passed' : 'failed');
            
            // Update final score display
            const finalScoreElement = document.getElementById('final-score');
            if (finalScoreElement) {
                finalScoreElement.textContent = `Final Score: ${scorePercentage}%`;
            }
            
            // Update performance summary based on thresholds
            const performanceSummary = document.getElementById('performance-summary');
            if (performanceSummary) {
                const thresholds = this.performanceThresholds || [
                    { threshold: 90, message: '🏆 Outstanding! You\'re an exploratory testing expert!' },
                    { threshold: 80, message: '👏 Great job! You\'ve shown strong exploratory testing skills!' },
                    { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                    { threshold: 0, message: '📚 Consider reviewing exploratory testing best practices and try again!' }
                ];
                
                const threshold = thresholds.find(t => scorePercentage >= t.threshold) || thresholds[thresholds.length - 1];
                performanceSummary.textContent = threshold.message;
            }
            
            // Generate question review
            this.displayQuestionReview();
            
            // Generate personalized recommendations
            this.generateRecommendations();
            
            // Save final progress
            try {
                const username = localStorage.getItem('username');
                if (username) {
                    const quizUser = new QuizUser(username);
                    await quizUser.updateQuizScore(
                        this.quizName,
                        scorePercentage,
                        this.player.experience,
                        this.player.tools,
                        this.player.questionHistory,
                        15, // Always 15 questions completed
                        finalStatus
                    );
                    console.log('Final quiz score saved:', scorePercentage, 'status:', finalStatus);
                }
            } catch (error) {
                console.error('Failed to save final quiz score:', error);
            }
        } catch (error) {
            console.error('Error in endGame:', error);
            this.showError('An error occurred showing the results. Please try again.');
        }
    }
    
    // Helper method to display question review in the end screen
    displayQuestionReview() {
        const reviewList = document.getElementById('question-review');
        if (!reviewList) return;
        
        let reviewHTML = '';
        this.player.questionHistory.forEach((record, index) => {
            const isCorrect = this.isCorrectAnswer(record.selectedAnswer);
            const scenario = record.scenario;
            
            reviewHTML += `
                <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-header">
                        <span class="review-number">${index + 1}</span>
                        <span class="review-title">${scenario.title || 'Question'}</span>
                        <span class="review-result">${isCorrect ? '✓' : '✗'}</span>
                    </div>
                    <div class="review-detail">
                        <p><strong>Scenario:</strong> ${scenario.description || ''}</p>
                        <p><strong>Your Answer:</strong> ${record.selectedAnswer.text || ''}</p>
                        <p><strong>Outcome:</strong> ${record.selectedAnswer.outcome || ''}</p>
                    </div>
                </div>
            `;
        });
        
        reviewList.innerHTML = reviewHTML;
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new ExploratoryQuiz();
    quiz.startGame();
}); 