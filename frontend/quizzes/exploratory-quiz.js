import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class ExploratoryQuiz extends BaseQuiz {
    constructor() {
        try {
            console.log('Initializing Exploratory Quiz');
            
            const config = {
                maxXP: 300,
                totalQuestions: 15,
                passPercentage: 70,
                performanceThresholds: [
                    { threshold: 90, message: '🏆 Outstanding! You\'re an exploratory testing expert!' },
                    { threshold: 80, message: '👏 Great job! You\'ve shown strong exploratory testing skills!' },
                    { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                    { threshold: 0, message: '�� Consider reviewing exploratory testing best practices and try again!' }
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
            
            // Initialize randomized scenarios at the class level
            this.randomizedScenarios = {
                basic: null,
                intermediate: null,
                advanced: null
            };
            
            // Initialize player state
            this.player = {
                experience: 0,
                tools: [],
                questionHistory: [],
                currentScenario: 0,
                level: 'basic',
                // Store randomized scenarios for each level to maintain consistent question order
                randomScenarios: {
                    basic: null,
                    intermediate: null,
                    advanced: null
                }
            };
            
            // Store current state
            this.scenarioStartTime = null;
            this.questionTimer = null;
            this.currentOutcome = null;
            this.isGameEnded = false;
            this.currentScenario = null; // Add a reference to the current scenario at the class level
            
            // Store UI elements
            this.gameContainer = null;
            this.gameScreen = null;
            this.outcomeScreen = null;
            this.endScreen = null;
            this.progressBar = null;
            this.levelIndicator = null;
            this.questionCounter = null;
            
            console.log('Player initialized:', this.player);
            
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

            // Basic Scenarios (IDs 1-10, 150 XP total)
            this.basicScenarios = [
                {
                    id: 1,
                    level: 'Basic',
                    title: 'Understanding Exploratory Testing',
                    description: 'What is the primary objective of exploratory-based testing?',
                    options: [
                        {
                            text: 'To discover defects while dynamically exploring the application under test',
                            outcome: 'Correct! Exploratory testing is primarily aimed at discovering defects through dynamic investigation of the software without following predefined test cases.',
                            experience: 15,
                            tool: 'Exploratory testing Framework'
                        },
                        {
                            text: 'To create detailed test cases within a test script before execution',
                            outcome: 'Exploratory testing specifically does not rely on detailed test case documentation created in advance.',
                            experience: -5
                        },
                        {
                            text: 'To focus on cosmetic issues within the application under test',
                            outcome: 'While cosmetic issues may be identified, exploratory testing focuses broadly on functionality, user experience, and behaviour, not exclusively on cosmetic issues.',
                            experience: -10
                        },
                        {
                            text: 'To replace all other forms of test approach for the application under test',
                            outcome: 'While exploratory testing is valuable, it complements rather than replaces other testing approaches, as it has both advantages and disadvantages.',
                            experience: 0
                        }
                    ]
                },
                {
                    id: 2,
                    level: 'Basic',
                    title: 'Exploratory Test Execution',
                    description: 'When should initial exploratory functional testing typically take place?',
                    options: [
                        {
                            text: 'Exploratory testing should be performed after the application is fully developed',
                            outcome: 'Waiting until full development would defeat the purpose of early issue identification.',
                            experience: -5
                        },
                        {
                            text: 'Exploratory testing should be performed only during the final testing phase',
                            outcome: 'Initial exploratory testing is meant to be performed early to catch identification of issues earlier in the testing process, not during final testing phases.',
                            experience: -10
                        },
                        {
                            text: 'Exploratory testing should be performed in the early stages of development',
                            outcome: 'Correct! Initial exploratory testing usually takes place early in development when full functionality may not be in place and styling may not have been applied. It aims to raise issues early enough that fundamental changes can still be considered.',
                            experience: 15,
                            tool: 'Exploratory Test Execution'
                        },
                        {
                            text: 'Exploratory testing should be performed when all styling has been applied',
                            outcome: 'Styling may not have been applied during initial exploratory testing and the client can communicate this by relaying what is out of scope.',
                            experience: 0
                        }
                    ]
                },
                {
                    id: 3,
                    level: 'Basic',
                    title: 'Exploratory Characteristics',
                    description: 'Which of the following is a key characteristic of exploratory testing?',
                    options: [
                        {
                            text: 'Test cases are executed without prior in depth preparation',
                            outcome: 'Perfect! Exploratory testing involves executing tests without prior in depth preparation. Testers actively think of scenarios as they interact with the software, using creativity and intuition rather than following predefined steps.',
                            experience: 15,
                            tool: 'Exploratory Characteristics'
                        },
                        {
                            text: 'Complete test coverage of the application under test is guaranteed',
                            outcome: 'Incomplete test coverage is a potential risk of exploratory testing.',
                            experience: -10
                        },
                        {
                            text: 'Exploratory testing follows a rigid, predetermined path',
                            outcome: 'Exploratory testing is dynamic and flexible, not rigid or predetermined.',
                            experience: -5
                        },
                        {
                            text: 'Detailed test case documentation is required in advance for exploratory testing',
                            outcome: 'Unlike traditional scripted testing, exploratory testing does not require detailed test case documentation in advance.',
                            experience: 0
                        }
                    ]
                },
                {
                    id: 4,
                    level: 'Basic',
                    title: 'Exploratory Prioritisation',
                    description: 'What should testers prioritise during initial exploratory functional testing?',
                    options: [
                        {
                            text: 'Key functionality and expected behaviours should be prioritised during exploratory testing',
                            outcome: 'Excellent! Initial exploratory testing generally focuses on key functionality and current expected behaviours, rather than minor or cosmetic issues. It provides a baseline of where the software stands and raises critical functional issues early.',
                            experience: 15,
                            tool: 'Exploratory Testing Assessment'
                        },
                        {
                            text: 'Detailed cosmetic issues should be prioritised during exploratory testing',
                            outcome: 'Whilst important, initial exploratory testing should not focus on minor or cosmetic issues and rather key functional behaviour.',
                            experience: -10
                        },
                        {
                            text: 'All possible defects regardless of severity should have equal priority and focus',
                            outcome: 'While identifying defects is important, initial exploratory testing prioritises key functionality, rather than capturing all possible issues regardless of severity.',
                            experience: -5
                        },
                        {
                            text: 'Testing every feature thoroughly should be prioritised during exploratory testing',
                            outcome: 'Initial exploratory testing is high-level and not meant to test every feature thoroughly, especially since parts of the application may still be in development.',
                            experience: 0
                        }
                    ]
                },
                {
                    id: 5,
                    level: 'Basic',
                    title: 'Exploratory Test Details Table',
                    description: 'What information should be entered in the "Test Details" section of an exploratory script?',
                    options: [
                        {
                            text: 'Test details should include document owner, project manager, testers, and final reviewer',
                            outcome: 'Perfect! When setting up an exploratory script, the Test Details table should include the Document Owner (person who created the script), Project Manager (Test Delivery Manager), Testers (all involved in the project), and Final Review by (person who reviewed and signed off on the script).',
                            experience: 15,
                            tool: 'Test Details Table'
                        },
                        {
                            text: 'All test cases to be executed should be included in the test details section of the script',
                            outcome: 'Test cases are not predefined in exploratory testing except in the non-functional tests section.',
                            experience: -10
                        },
                        {
                            text: 'The project manager\'s information should be entered into the test details section of the script',
                            outcome: 'The test details should include multiple people involved, not just the project manager.',
                            experience: -5
                        },
                        {
                            text: 'Bug severity ratings should be included in the test details section of the exploratory script',
                            outcome: 'Bug severity ratings are not part of the test details section but would be documented separately in the issues tab.',
                            experience: 0
                        }
                    ]
                },
                {
                    id: 6,
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
                    id: 7,
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
                    id: 8,
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
                    id: 9,
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
                            text: 'As automated test scripts that can be run across multiple environments',
                            outcome: 'Automation is not part of exploratory testing.',
                            experience: -5
                        },
                        {
                            text: 'As exact duplicates of the focus areas from the primary environment',
                            outcome: 'Smoke tests should be concise high-level journeys focused on key functionality.',
                            experience: 0
                        }
                    ]
                },
                {
                    id: 10,
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

            // Intermediate Scenarios (IDs 6-10, 100 XP total, 20 XP each)
            this.intermediateScenarios = [
                {
                    id: 6,
                    level: 'Intermediate',
                    title: 'Exploratory Focus Areas',
                    description: 'How should "Focus Areas" be determined when setting up an exploratory script?',
                    options: [
                        {
                            text: 'By identifying what users need to achieve and what\'s vital to functionality',
                            outcome: 'Excellent! Focus areas should be determined by identifying what the user is looking to achieve and what is vital to the functionality of the project. This helps structure the testing approach while maintaining flexibility.',
                            experience: 20,
                            tool: 'Focus Area Validation'
                        },
                        {
                            text: 'Focus areas should be determined by listing every possible feature of the software',
                            outcome: 'While focus areas should cover key functionality, listing every possible feature would make the approach too rigid and closer to scripted testing.',
                            experience: -15
                        },
                        {
                            text: 'Focus areas can be determined by copying from previous similar projects',
                            outcome: 'Focus areas should be tailored to the specific project rather than copied from previous work.',
                            experience: -10
                        },
                        {
                            text: 'Focus areas should be detailed as a priority on cosmetic elements',
                            outcome: 'Focus areas should prioritise functionality rather than focusing on cosmetic elements.',
                            experience: -5
                        }
                    ]
                },
                {
                    id: 7,
                    level: 'Intermediate',
                    title: 'Exploratory Testing Risks',
                    description: 'What is a risk of relying solely on exploratory testing?',
                    options: [
                        {
                            text: 'It may lead to incomplete test coverage due to time constraints',
                            outcome: 'A disadvantage of exploratory testing is potentially incomplete test coverage. As a time-based approach, testing might uncover numerous issues in one area, but time constraints may prevent discovering all bugs comprehensively.',
                            experience: 20,
                            tool: 'Exploratory Risk Check'
                        },
                        {
                            text: 'Solely focusing on exploratory testing can makes test activities too rigid',
                            outcome: 'Exploratory testing is flexible in nature, not rigid like other scripted test approaches.',
                            experience: -15
                        },
                        {
                            text: 'This type of approach can require too much documentation',
                            outcome: 'Exploratory testing requires less documentation than scripted testing.',
                            experience: -10
                        },
                        {
                            text: 'This type of approach always takes longer than scripted testing',
                            outcome: 'While time management can be a challenge, exploratory testing doesn\'t always take longer than scripted testing; in fact, it can be more time-efficient by eliminating the need for extensive test case preparation.',
                            experience: -5
                        }
                    ]
                },
                {
                    id: 8,
                    level: 'Intermediate',
                    title: 'Non-Functional Test Cases',
                    description: 'When executing non-functional tests in an exploratory script, what is different compared to focus area testing?',
                    options: [
                        {
                            text: 'Non-functional tests involve executing clearly defined test cases',
                            outcome: 'Executing non-functional tests is different from focus area testing because it involves executing clearly defined test cases rather than exploring. These are the only areas within an exploratory script that contain pre-defined test cases.',
                            experience: 20,
                            tool: 'Non-Functional Test Case'
                        },
                        {
                            text: 'Non-functional tests don\'t require notes or observations within the documentation',
                            outcome: 'Non-functional tests still require notes and observations to be recorded for traceability.',
                            experience: -15
                        },
                        {
                            text: 'Non-functional tests can be left if time constraints do not allow them and all functional tests have been completed',
                            outcome: 'Non-functional tests are an important part of the testing process and shouldn\'t be skipped due to time constraints.',
                            experience: -10
                        },
                        {
                            text: 'Non-functional tests don\'t need to be selected for each primary environment',
                            outcome: 'Non-functional tests should be selected based on relevance to the specific primary environment being tested, not applied universally without consideration.',
                            experience: -5
                        }
                    ]
                },
                {
                    id: 9,
                    level: 'Intermediate',
                    title: 'Compatibility Testing',
                    description: 'How should bugs be documented when testing compatibility environments?',
                    options: [
                        {
                            text: 'List global issues as "#Global issues observed" and add newly discovered issues to notes',
                            outcome: 'Perfect! When documenting bugs in compatibility environments, testers should list global issues as "#Global issues observed". Newly discovered issues should be added to the notes, making it easier to identify environment-specific problems.',
                            experience: 20,
                            tool: 'Exploratory Compatibility Framework'
                        },
                        {
                            text: 'Every issue must be documented in full detail for each environment',
                            outcome: 'It is not the preferred approach to list every known issue for each device, if the ticket isn\'t device-specific. This could cause make this section difficult to follow and all issues should also be raised in the issues tab already',
                            experience: -15
                        },
                        {
                            text: 'Only issues specific to that environment should be noted in the compatibility environments section',
                            outcome: 'While newly discovered issues should be noted, the approach should also acknowledge previously discovered issues that are present in the current environment.',
                            experience: -10
                        },
                        {
                            text: 'Issues should only be documented for the primary environment',
                            outcome: 'Issues should be documented for all environments, not just the primary one',
                            experience: -5
                        }
                    ]
                },
                {
                    id: 10,
                    level: 'Intermediate',
                    title: 'Exploratory Time Management',
                    description: 'What should happen if a tester believes there are more defects in an area but has run out of allotted time?',
                    options: [
                        {
                            text: 'Note that more defects are apparent, and additional time may be required',
                            outcome: 'Excellent! If an area still has defects and time has run out, the tester should leave a note indicating they believe more defects are apparent and additional time may be required. They should also inform the Test Delivery Manager so this can be communicated to the client if necessary.',
                            experience: 20,
                            tool: 'Exploratory Test Management'
                        },
                        {
                            text: 'Leave these potential defects if they are believed to be minor and move on',
                            outcome: 'Ignoring potential defects contradicts the purpose of exploratory testing, which is to discover issues.',
                            experience: -15
                        },
                        {
                            text: 'Extend testing time to address all potential issues without informing the project manager',
                            outcome: 'Extending testing time without authorisation would affect project timelines and potentially impact other scheduled work.',
                            experience: -10
                        },
                        {
                            text: 'Mark the area as fully tested to be able to adhere to project timelines and deliverables',
                            outcome: 'Falsely marking an area as fully tested when there are suspected undiscovered issues would be misleading.',
                            experience: -5
                        }
                    ]
                }
            ];
            
            // Advanced Scenarios (IDs 11-15, 125 XP total, 25 XP each)
            this.advancedScenarios = [
                {
                    id: 11,
                    level: 'Advanced',
                    title: 'Exploratory Testing Scenario',
                    description: 'When should exploratory testing be considered more appropriate than scripted testing?',
                    options: [
                        {
                            text: 'When exploring user behaviour, functionality, and experience in a dynamic manner',
                            outcome: 'Perfect! This allows testers to use creativity and intuition to discover defects organically while taking a user-centric approach.',
                            experience: 25,
                            tool: 'Installation Validator'
                        },
                        {
                            text: 'When the application requires thorough regression testing',
                            outcome: 'Regression testing typically benefits from scripted tests to ensure consistent verification of previously working functionality.',
                            experience: -15
                        },
                        {
                            text: 'When preparing for a full release of the application under test to a production environment',
                            outcome: 'While exploratory testing can be valuable before a production release, a combination of approaches is typically best for ensuring comprehensive coverage including non-functional tests.',
                            experience: -10
                        },
                        {
                            text: 'When documenting every step of the testing process is critical to the project',
                            outcome: 'Exploratory testing deliberately does not document every step, focusing instead on observations and findings.',
                            experience: -5
                        }
                    ]
                },
                {
                    id: 12,
                    level: 'Advanced',
                    title: 'Exploratory Test Skills',
                    description: 'How does the effectiveness of exploratory testing relate to tester skills?',
                    options: [
                        {
                            text: 'Exploratory testing effectiveness heavily depends on tester skills, experience, and knowledge',
                            outcome: 'Excellent! Less experienced testers might overlook important defects or fail to identify critical areas to test, making tester expertise a significant factor.',
                            experience: 25,
                            tool: 'Exploratory Test Skills'
                        },
                        {
                            text: 'Tester skills have minimal impact on exploratory testing effectiveness',
                            outcome: 'Tester skills have a substantial impact on exploratory testing effectiveness.',
                            experience: -15
                        },
                        {
                            text: 'Only testers with formal certification should perform exploratory testing',
                            outcome: 'Formal certification is not a requirement for exploratory testing; skills, experience, and knowledge are, however, factors.',
                            experience: -10
                        },
                        {
                            text: 'All testers will discover the same defects regardless of experience',
                            outcome: 'Different testers will likely discover different defects based on their experience, approach, and expertise.',
                            experience: -5
                        }
                    ]
                },
                {
                    id: 13,
                    level: 'Advanced',
                    title: 'Exploratory Focus Time',
                    description: 'In an exploratory testing approach, how should time be allocated across different focus areas?',
                    options: [
                        {
                            text: 'More time should be allocated to areas with important functionality',
                            outcome: 'Perfect! When setting up an exploratory script, time should be allocated appropriately to each focus area, with more time assigned to areas containing important functionality. For example, a simple footer would have less time allocated compared to a checkout process.',
                            experience: 25,
                            tool: 'JavaScript Checker'
                        },
                        {
                            text: 'Equal time should be given to all focus areas stated in the test script',
                            outcome: 'Equal time allocation doesn\'t account for the varying complexity and importance of different areas.',
                            experience: -15
                        },
                        {
                            text: 'Focus areas with known issues should be avoided and addressed if possible, when all other areas have been covered to save time',
                            outcome: 'Focus areas with known issues should still be tested, not avoided.',
                            experience: -10
                        },
                        {
                            text: 'Time allocation should follow a fixed percentage for each type of functionality',
                            outcome: 'While different types of functionality may warrant different time allocations, using fixed percentages would be too rigid and might not reflect the specific needs of the project.',
                            experience: -5
                        }
                    ]
                },
                {
                    id: 14,
                    level: 'Advanced',
                    title: 'Issue Documentation',
                    description: 'When documenting issues in an exploratory script, what information is required in the Issues tab?',
                    options: [
                        {
                            text: 'Issue title (with number and hyperlink), issue number, severity, ticket type, environment, status, reporter, date raised, and optional notes',
                            outcome: 'Excellent! When adding issues to the Issues tab, all of these details should be included.',
                            experience: 25,
                            tool: 'Issue Documentation'
                        },
                        {
                            text: 'Pass rate, fail rate, and average execution time',
                            outcome: 'These are metrics and not issue details to be documented in the issues tab.',
                            experience: -15
                        },
                        {
                            text: 'A detailed reproduction path for each issue should be included in the issue tab',
                            outcome: 'While reproduction steps are important in the actual issue ticket, the Issues tab in the exploratory script doesn\'t specifically require detailed reproduction paths to be duplicated there.',
                            experience: -10
                        },
                        {
                            text: 'Issues that affect the primary environment should be included in the issue tab',
                            outcome: 'Issues affecting all environments should be documented, not just the primary environment.',
                            experience: -5
                        }
                    ]
                },
                {
                    id: 15,
                    level: 'Advanced',
                    title: 'Exploratory Time Management',
                    description: 'How should an exploratory tester balance time management with thorough investigation?',
                    options: [
                        {
                            text: 'By using a time-boxed approach for each focus area while prioritising based on functionality importance',
                            outcome: 'Perfect! Time management in exploratory testing is best approached by using time-boxed sessions for each focus area, sticking to the allotted time as closely as possible, and prioritising areas with important functionality. This ensures expected test coverage can be completed while focusing on the most critical aspects.',
                            experience: 25,
                            tool: 'Exploratory Time Management'
                        },
                        {
                            text: 'By exploring areas that are likely to have defects within the application under test',
                            outcome: 'While focusing on areas likely to have defects can be efficient, it might miss issues in unexpected places, and all focus areas still need some level of coverage.',
                            experience: -15
                        },
                        {
                            text: 'By strictly adhering to predefined test cases within the test script',
                            outcome: 'Exploratory testing deliberately avoids predefined test cases (except for non-functional tests).',
                            experience: -10
                        },
                        {
                            text: 'By extending testing time whenever necessary to make sure thorough coverage is performed',
                            outcome: 'Extending testing time could affect project timelines and potentially impact other scheduled work.',
                            experience: -5
                        }
                    ]
                }
            ];

            // Initialize UI and add event listeners
            this.initializeUI();

            this.isLoading = false;
        } catch (error) {
            console.error('Error in constructor:', error);
            this.showError('An error occurred while initializing the quiz.');
        }
    }

    initializeUI() {
        try {
            console.log('Initializing UI');
            
            // Get main container elements
            this.gameContainer = document.getElementById('game-container');
            this.gameScreen = document.getElementById('game-screen');
            this.outcomeScreen = document.getElementById('outcome-screen');
            this.endScreen = document.getElementById('end-screen');
            
            if (!this.gameContainer || !this.gameScreen || !this.outcomeScreen || !this.endScreen) {
                throw new Error('Required UI elements not found');
            }
            
            // Ensure the scenario container exists
            this.ensureRequiredElementsExist();
            
            // Get progress elements
            this.progressBar = document.getElementById('progress-bar');
            this.levelIndicator = document.getElementById('current-level');
            this.questionCounter = document.getElementById('question-counter');
            
            // Update initial progress display
            this.updateProgressDisplay();
            
            console.log('UI initialization complete');
        } catch (error) {
            console.error('Error in initializeUI:', error);
            this.showError('An error occurred while initializing the UI.');
        }
    }
    
    ensureRequiredElementsExist() {
        // Check if scenario container exists, create it if not
        if (!document.getElementById('scenario-container')) {
            console.log('Creating missing scenario container');
            
            // Get the question section
            const questionSection = this.gameScreen.querySelector('.question-section');
            if (!questionSection) {
                // Create the entire question section if it doesn't exist
                const newQuestionSection = document.createElement('div');
                newQuestionSection.className = 'question-section';
                
                // Create title and description elements
                const titleElement = document.createElement('h2');
                titleElement.id = 'scenario-title';
                titleElement.setAttribute('tabindex', '0');
                
                const descriptionElement = document.createElement('p');
                descriptionElement.id = 'scenario-description';
                descriptionElement.setAttribute('tabindex', '0');
                
                // Create scenario container and add elements
                const scenarioContainer = document.createElement('div');
                scenarioContainer.id = 'scenario-container';
                scenarioContainer.appendChild(titleElement);
                scenarioContainer.appendChild(descriptionElement);
                
                // Add to question section
                newQuestionSection.appendChild(scenarioContainer);
                
                // Add question section to game screen (before options)
                const optionsSection = this.gameScreen.querySelector('.options-section');
                if (optionsSection) {
                    this.gameScreen.insertBefore(newQuestionSection, optionsSection);
                } else {
                    this.gameScreen.appendChild(newQuestionSection);
                }
            } else {
                // If question section exists but scenario container doesn't
                // Check if title and description elements exist
                let titleElement = questionSection.querySelector('#scenario-title');
                let descriptionElement = questionSection.querySelector('#scenario-description');
                
                // Create scenario container
                const scenarioContainer = document.createElement('div');
                scenarioContainer.id = 'scenario-container';
                
                // Move existing elements or create new ones
                if (titleElement) {
                    // Remove from current position
                    titleElement.parentNode.removeChild(titleElement);
                    // Add to new container
                    scenarioContainer.appendChild(titleElement);
                } else {
                    // Create new title element
                    titleElement = document.createElement('h2');
                    titleElement.id = 'scenario-title';
                    titleElement.setAttribute('tabindex', '0');
                    scenarioContainer.appendChild(titleElement);
                }
                
                if (descriptionElement) {
                    // Remove from current position
                    descriptionElement.parentNode.removeChild(descriptionElement);
                    // Add to new container
                    scenarioContainer.appendChild(descriptionElement);
                } else {
                    // Create new description element
                    descriptionElement = document.createElement('p');
                    descriptionElement.id = 'scenario-description';
                    descriptionElement.setAttribute('tabindex', '0');
                    scenarioContainer.appendChild(descriptionElement);
                }
                
                // Add container to question section
                questionSection.appendChild(scenarioContainer);
            }
            
            console.log('Scenario container created successfully');
        }
        
        // Check if options container exists, create it if not
        if (!document.getElementById('options-container')) {
            console.log('Creating missing options container');
            
            const optionsForm = document.getElementById('options-form');
            if (optionsForm) {
                const optionsContainer = document.createElement('div');
                optionsContainer.id = 'options-container';
                
                // Insert at the beginning of the form
                if (optionsForm.firstChild) {
                    optionsForm.insertBefore(optionsContainer, optionsForm.firstChild);
                } else {
                    optionsForm.appendChild(optionsContainer);
                }
                
                console.log('Options container created successfully');
            } else {
                console.error('Options form not found, cannot create options container');
            }
        }
    }

    updateProgressDisplay() {
        try {
            const totalAnswered = this.player?.questionHistory?.length || 0;
            const totalQuestions = 15; // Total questions for the entire quiz
            
            // Update progress bar if it exists
            if (this.progressBar) {
                const progressPercentage = Math.min((totalAnswered / totalQuestions) * 100, 100);
                this.progressBar.style.width = `${progressPercentage}%`;
            }
            
            // Update level indicator if it exists
            if (this.levelIndicator) {
                const level = this.player?.level || 'basic';
                this.levelIndicator.textContent = level.charAt(0).toUpperCase() + level.slice(1);
            }
            
            // Update question counter if it exists
            if (this.questionCounter) {
                this.questionCounter.textContent = `${totalAnswered} of ${totalQuestions}`;
            }
            
            console.log(`Progress updated: ${totalAnswered}/${totalQuestions} questions answered`);
        } catch (error) {
            console.error('Error in updateProgressDisplay:', error);
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
        try {
            if (!this.player) {
                console.error('No player data to save');
                return;
            }

            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No username found. Please login first.');
                return;
            }

            // Calculate score
            const correctAnswers = this.player.questionHistory.filter(q => this.isCorrectAnswer(q.selectedAnswer)).length;
            const score = Math.round((correctAnswers / Math.max(this.player.questionHistory.length, 1)) * 100);

            // Determine if quiz is complete
            const isComplete = this.player.questionHistory.length >= 15;
            const status = isComplete ? (score >= this.passPercentage ? 'passed' : 'failed') : 'in-progress';

            // Create progress object
            const progress = {
                experience: this.player.experience,
                tools: this.player.tools,
                currentScenario: this.player.currentScenario,
                questionHistory: this.player.questionHistory,
                randomizedScenarios: this.randomizedScenarios,
                status: status,
                scorePercentage: score,
                questionsAnswered: this.player.questionHistory.length
            };

            // Save progress
            const quizUser = new QuizUser(username);
            await quizUser.saveQuizProgress(this.quizName, progress);
            console.log('Progress saved successfully');
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    async loadProgress() {
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No username found. Please login first.');
                return false;
            }

            const quizUser = new QuizUser(username);
            const progress = await quizUser.getQuizProgress(this.quizName);

            if (!progress) {
                console.log('No saved progress found. Starting new game.');
                return false;
            }

            // Restore player state
            this.player = {
                name: username,
                experience: progress.experience || 0,
                tools: progress.tools || [],
                currentScenario: progress.currentScenario || 0,
                questionHistory: progress.questionHistory || [],
                level: 'basic',
                // Store randomized scenarios for each level to maintain consistent question order
                randomScenarios: {
                    basic: progress.randomizedScenarios?.basic || null,
                    intermediate: progress.randomizedScenarios?.intermediate || null,
                    advanced: progress.randomizedScenarios?.advanced || null
                }
            };

            // Restore randomized scenarios if available
            if (progress.randomizedScenarios) {
                this.randomizedScenarios = progress.randomizedScenarios;
                console.log('Restored randomized scenarios:', this.randomizedScenarios);
            }

            // Check if all questions have been answered
            if (this.player.questionHistory.length >= 15) {
                console.log('All questions have been answered. Ending game.');
                this.endGame();
                return true;
            }

            // Calculate which level we're on and the scenario index within that level
            const totalAnswered = this.player.questionHistory.length;
            const levelIndex = Math.floor(totalAnswered / 5); // 0, 1, or 2
            const scenarioIndex = totalAnswered % 5; // 0 to 4
            
            // Update current scenario based on progress
            this.player.currentScenario = scenarioIndex;
            
            console.log(`Restored progress: ${totalAnswered} questions answered, level ${levelIndex}, scenario ${scenarioIndex}`);
            
            // Update UI
            this.updateProgressDisplay();
            
            return true;
        } catch (error) {
            console.error('Error loading progress:', error);
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
            
            // Display the first scenario and start the timer
            await this.displayScenario();
        } catch (error) {
            console.error('Failed to start game:', error);
            this.showError('Failed to start the quiz. Please try refreshing the page.');
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
            console.log('Displaying scenario');
            
            // Get total answered questions
            const totalAnswered = this.player?.questionHistory?.length || 0;
            
            // Get the appropriate scenarios based on progress
            const scenarios = this.getCurrentScenarios();
            if (!scenarios || scenarios.length === 0) {
                throw new Error('No scenarios available for the current level');
            }
            
            // Calculate current scenario index within the level
            const scenarioIndex = totalAnswered % 5;
            this.currentScenario = scenarios[scenarioIndex];
            
            if (!this.currentScenario) {
                throw new Error(`Scenario not found at index ${scenarioIndex}`);
            }
            
            // Update UI with current scenario
            this.updateScenarioUI(this.currentScenario);
            
            // Update progress display
            this.updateProgressDisplay();
            
            console.log(`Displaying scenario: ${this.currentScenario.id} (${totalAnswered + 1}/15)`);
            return true;
        } catch (error) {
            console.error('Error in displayScenario:', error);
            this.showError('An error occurred while loading the scenario.');
            return false;
        }
    }
    
    updateScenarioUI(scenario) {
        try {
            if (!scenario) {
                throw new Error('Cannot update UI: No scenario provided');
            }
            
            // Update scenario title
            const titleElement = document.getElementById('scenario-title');
            if (!titleElement) {
                throw new Error('Scenario title element not found in the DOM');
            }
            titleElement.textContent = scenario.title || 'Untitled Scenario';
            
            // Update scenario description
            const descriptionElement = document.getElementById('scenario-description');
            if (!descriptionElement) {
                throw new Error('Scenario description element not found in the DOM');
            }
            descriptionElement.textContent = scenario.description || 'No description available.';
            
            // Update options
            const optionsContainer = document.getElementById('options-container');
            if (!optionsContainer) {
                throw new Error('Options container not found in the DOM');
            }
            optionsContainer.innerHTML = '';
            
            // Add options
            if (scenario.options && scenario.options.length > 0) {
                scenario.options.forEach((option, index) => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    
                    const radioInput = document.createElement('input');
                    radioInput.type = 'radio';
                    radioInput.name = 'option';
                    radioInput.value = index;
                    radioInput.id = `option${index}`;
                    radioInput.setAttribute('tabindex', '0');
                    radioInput.setAttribute('aria-label', option.text || `Option ${index + 1}`);
                    
                    const label = document.createElement('label');
                    label.setAttribute('for', `option${index}`);
                    label.textContent = option.text || `Option ${index + 1}`;
                    
                    optionDiv.appendChild(radioInput);
                    optionDiv.appendChild(label);
                    optionsContainer.appendChild(optionDiv);
                });
            } else {
                const noOptionsMessage = document.createElement('p');
                noOptionsMessage.textContent = 'No options available for this scenario.';
                noOptionsMessage.classList.add('no-options-message');
                optionsContainer.appendChild(noOptionsMessage);
            }
            
            console.log('Scenario UI updated successfully');
        } catch (error) {
            console.error('Error in updateScenarioUI:', error);
            this.showError('An error occurred while updating the scenario display.');
        }
    }

    isCorrectAnswer(answer) {
        // Helper method to consistently determine if an answer is correct
        if (!answer) return false;
        
        // Handle different structures of answer data
        if (typeof answer === 'object') {
            // If it's an option object with isCorrect property
            if (answer.isCorrect !== undefined) {
                return answer.isCorrect === true;
            }
            
            // If it has experience property (positive exp = correct)
            if (answer.experience !== undefined) {
                return answer.experience > 0;
            }
            
            // If it's a history record with selectedOption
            if (answer.selectedOption !== undefined && answer.scenario && answer.scenario.options) {
                const option = answer.scenario.options[answer.selectedOption];
                return option && (option.isCorrect === true || option.experience > 0);
            }
        }
        
        // Default to false if we can't determine
        return false;
    }

    handleAnswer(optionIndex) {
        try {
            console.log(`Handle answer called with option index: ${optionIndex}`);
            
            // If optionIndex is not provided, try to get it from the selected radio button
            if (optionIndex === undefined || optionIndex === null) {
                const selectedOption = document.querySelector('input[name="option"]:checked');
                if (!selectedOption) {
                    throw new Error('No option selected');
                }
                optionIndex = parseInt(selectedOption.value);
            }
            
            // Validate current scenario
            if (!this.currentScenario) {
                console.error('Current scenario not found. This might indicate an issue with scenario loading.');
                
                // Try to recover by attempting to load the current scenario again
                const totalAnswered = this.player?.questionHistory?.length || 0;
                const scenarios = this.getCurrentScenarios();
                if (!scenarios || scenarios.length === 0) {
                    throw new Error('No scenarios available for the current level');
                }
                
                const scenarioIndex = totalAnswered % 5;
                this.currentScenario = scenarios[scenarioIndex];
                
                if (!this.currentScenario) {
                    throw new Error(`Failed to recover. Scenario not found at index ${scenarioIndex}`);
                }
                
                console.log('Successfully recovered current scenario:', this.currentScenario);
            }
            
            // Get selected option
            const selectedOption = this.currentScenario.options[optionIndex];
            if (!selectedOption) {
                throw new Error(`Invalid option index: ${optionIndex}`);
            }
            
            // Record the answer
            const answer = {
                scenario: this.currentScenario, // Store the entire scenario for later review
                scenarioId: this.currentScenario.id,
                selectedAnswer: selectedOption, // Store the entire selected option
                selectedOption: optionIndex,
                timestamp: new Date().toISOString(),
                experienceGained: selectedOption.experience || 0
            };
            
            // Add to question history
            if (!this.player.questionHistory) {
                this.player.questionHistory = [];
            }
            this.player.questionHistory.push(answer);
            
            // Update player experience
            this.player.experience += answer.experienceGained;
            
            // Save progress
            this.saveProgress();
            
            // Show outcome of the selected answer
            this.displayOutcome(selectedOption);
            
            // Check if we should move to the next level or end the game
            const totalAnswered = this.player.questionHistory.length;
            
            if (totalAnswered >= 15) {
                // All questions answered, end the game
                console.log('All 15 questions answered, ending game');
                setTimeout(() => this.endGame(), 2000);
                return;
            }
            
            // Prepare for next question
            console.log(`Total questions answered: ${totalAnswered}`);
            setTimeout(() => this.displayScenario(), 2000);
            
        } catch (error) {
            console.error('Error in handleAnswer:', error);
            this.showError('An error occurred while processing your answer. Please try selecting an option again.');
        }
    }
    
    displayOutcome(option) {
        try {
            if (!option) {
                throw new Error('Cannot display outcome: No option provided');
            }
            
            const outcomeScreen = document.getElementById('outcome-screen');
            const outcomeMessage = document.getElementById('outcome-message');
            const experienceGained = document.getElementById('experience-gained');
            const continueButton = document.getElementById('continue-button');
            
            if (!outcomeScreen || !outcomeMessage || !experienceGained || !continueButton) {
                throw new Error('Outcome screen elements not found in the DOM');
            }
            
            // Set outcome message
            outcomeMessage.textContent = option.outcome || 'You selected an option.';
            
            // Set experience gained
            const expGained = option.experience || 0;
            experienceGained.textContent = `Experience gained: ${expGained}`;
            
            // Highlight gained experience based on amount
            if (expGained > 10) {
                experienceGained.classList.add('high-experience');
            } else if (expGained > 5) {
                experienceGained.classList.add('medium-experience');
            } else {
                experienceGained.classList.add('low-experience');
            }
            
            // Show outcome screen
            outcomeScreen.classList.remove('hidden');
            document.getElementById('game-screen').classList.add('hidden');
            
            // Set continue button action
            continueButton.onclick = () => {
                outcomeScreen.classList.add('hidden');
                document.getElementById('game-screen').classList.remove('hidden');
                
                // Remove experience highlight classes
                experienceGained.classList.remove('high-experience', 'medium-experience', 'low-experience');
                
                // Display next scenario (this will be called by handleAnswer after timeout)
            };
            
            console.log('Outcome displayed successfully');
        } catch (error) {
            console.error('Error in displayOutcome:', error);
            this.showError('An error occurred while displaying the outcome.');
            
            // Try to recover by showing the next scenario
            setTimeout(() => this.displayScenario(), 2000);
        }
    }

    initializeTimer() {
            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
        }

        // Set default timer value if not set
        if (!this.timePerQuestion) {
            this.timePerQuestion = 30;
            console.log('[Quiz] Using default timer value:', this.timePerQuestion);
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
        console.log('Time up! Auto-submitting answer');
        
        try {
            // Get current scenario
            const currentScenarios = this.getCurrentScenarios();
            if (!currentScenarios || !this.player) {
                console.error('Invalid state in handleTimeUp');
                return;
            }
            
            const scenario = currentScenarios[this.player.currentScenario];
            if (!scenario) {
                console.error('No current scenario found in handleTimeUp');
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

    restartGame() {
        // Reset player state
        this.player = {
            name: localStorage.getItem('username'),
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: [],
            level: 'basic',
            // Store randomized scenarios for each level to maintain consistent question order
            randomScenarios: {
                basic: null,
                intermediate: null,
                advanced: null
            }
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
        this.updateProgressDisplay();

        // Start from first scenario
        this.displayScenario();
    }

    getCurrentScenarios() {
        try {
            const totalAnswered = this.player?.questionHistory?.length || 0;
            
            // If we don't have the randomized sets yet, create them
            if (!this.randomizedScenarios) {
                // Get list of already answered question IDs to avoid repeats
                const answeredIds = new Set(
                    this.player?.questionHistory
                        ?.map(q => q.scenario?.id)
                        .filter(id => id !== undefined)
                );
                
                // Function to generate a set of scenarios ensuring no repeats
                const getUniqueScenarios = (allScenarios, numNeeded) => {
                    // Filter out scenarios that have already been answered
                    const availableScenarios = allScenarios.filter(s => !answeredIds.has(s.id));
                    
                    // If we don't have enough scenarios left, include already seen ones as a fallback
                    if (availableScenarios.length < numNeeded) {
                        console.log(`Not enough unique scenarios left in pool. Using some repeats.`);
                        return this.shuffleArray([...allScenarios]).slice(0, numNeeded);
                    }
                    
                    // Shuffle and take the number needed
                    return this.shuffleArray(availableScenarios).slice(0, numNeeded);
                };
                
                // Create randomized sets of unique scenarios for each level
                this.randomizedScenarios = {
                    basic: getUniqueScenarios(this.basicScenarios, 5),
                    intermediate: getUniqueScenarios(this.intermediateScenarios, 5),
                    advanced: getUniqueScenarios(this.advancedScenarios, 5)
                };
                
                console.log('Created randomized scenarios:', {
                    basic: this.randomizedScenarios.basic.map(s => s.id),
                    intermediate: this.randomizedScenarios.intermediate.map(s => s.id),
                    advanced: this.randomizedScenarios.advanced.map(s => s.id)
                });
            }
        
            // Simple progression logic based solely on question count
            if (totalAnswered >= 10) {
                return this.randomizedScenarios.advanced;
            } else if (totalAnswered >= 5) {
                return this.randomizedScenarios.intermediate;
            }
            return this.randomizedScenarios.basic;
        } catch (error) {
            console.error('Error in getCurrentScenarios:', error);
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
            console.error('Error in getCurrentLevel:', error);
            return 'Basic'; // Default to basic if there's an error
        }
    }

    generateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations');
        if (!recommendationsContainer) return;

        // Calculate score based on correct answers, not XP
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && this.isCorrectAnswer(q.selectedAnswer)
        ).length;
        const score = Math.round((correctAnswers / 15) * 100);
        
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            // Determine if answer was correct based on positive experience value
            const isCorrect = record.selectedAnswer && this.isCorrectAnswer(record.selectedAnswer);

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
        const title = scenario.title.toLowerCase();
        const description = scenario.description.toLowerCase();

        if (title.includes('focus') || description.includes('focus area')) {
            return 'Focus Area Management';
        } else if (title.includes('time') || description.includes('time')) {
            return 'Time Management';
        } else if (title.includes('documentation') || description.includes('document')) {
            return 'Documentation';
        } else if (title.includes('test skills') || description.includes('skills')) {
            return 'Testing Skills';
        } else if (title.includes('compatibility') || description.includes('environment')) {
            return 'Environment Testing';
        } else if (title.includes('non-functional') || description.includes('non-functional')) {
            return 'Non-Functional Testing';
        } else if (title.includes('risk') || description.includes('risk')) {
            return 'Risk Management';
        } else {
            return 'General Exploratory Testing';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Focus Area Management': 'Improve understanding of how to identify and prioritize focus areas based on user needs and functionality importance.',
            'Time Management': 'Strengthen time-boxed testing approach and prioritization of testing activities based on functionality importance.',
            'Documentation': 'Enhance documentation practices for issues, test details, and observations while maintaining exploratory testing flexibility.',
            'Testing Skills': 'Develop expertise in dynamic testing approaches and improve ability to discover defects through creative exploration.',
            'Environment Testing': 'Improve cross-environment testing strategies and documentation of global versus environment-specific issues.',
            'Non-Functional Testing': 'Strengthen understanding of executing predefined non-functional test cases within exploratory scripts.',
            'Risk Management': 'Better understand and manage the risks associated with exploratory testing, particularly regarding test coverage.',
            'General Exploratory Testing': 'Continue developing fundamental exploratory testing principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core exploratory testing principles.';
    }

    // Helper method to shuffle an array using Fisher-Yates algorithm
    shuffleArray(array) {
        // Fisher-Yates shuffle algorithm for randomizing scenario order
        const shuffled = [...array]; // Create a copy to avoid modifying the original array
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
        }
        return shuffled;
    }

    // Implement the endGame method that was missing
    async endGame(failed = false) {
        console.log('End game called with failed =', failed);
        
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
                console.log('End screen shown');
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
                    { threshold: 90, message: '🏆 Outstanding! You\'re a testing mindset expert!' },
                    { threshold: 80, message: '👏 Great job! You\'ve shown strong testing instincts!' },
                    { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                    { threshold: 0, message: '📚 Consider reviewing testing mindset best practices and try again!' }
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

    checkLevelTransition() {
        try {
            // Get total number of answered questions
            const totalAnswered = this.player?.questionHistory?.length || 0;
            
            // Check if we need to transition to the next level
            if (totalAnswered === 5) {
                console.log('Transitioning to intermediate level');
                this.displayScenario(); // This will load intermediate scenarios
            } else if (totalAnswered === 10) {
                console.log('Transitioning to advanced level');
                this.displayScenario(); // This will load advanced scenarios
            } else if (totalAnswered === 15) {
                console.log('Quiz completed');
                this.endGame();
            } else if (totalAnswered < 15) {
                // Continue with next question in current level
                this.displayScenario();
            }
        } catch (error) {
            console.error('Error in checkLevelTransition:', error);
        }
    }

    endGame() {
        try {
            // Clear any existing timers
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            
            // Update UI to show completion
            const quizContainer = document.getElementById('quiz-container');
            if (quizContainer) {
                quizContainer.innerHTML = `
                    <div class="quiz-complete">
                        <h2>Congratulations!</h2>
                        <p>You have completed all scenarios in the exploratory testing quiz.</p>
                        <p>Total experience gained: ${this.player?.experience || 0}</p>
                        <button id="restart-quiz" class="quiz-button">Restart Quiz</button>
                    </div>
                `;
                
                // Add event listener for restart button
                const restartButton = document.getElementById('restart-quiz');
                if (restartButton) {
                    restartButton.addEventListener('click', () => this.resetQuiz());
                }
            }
            
            // Save final progress
            this.saveProgress();
            console.log('Quiz completed successfully');
        } catch (error) {
            console.error('Error ending game:', error);
        }
    }
    
    resetQuiz() {
        try {
            // Reset player progress
            this.player = {
                experience: 0,
                level: 'basic',
                questionHistory: [],
                // Store randomized scenarios for each level to maintain consistent question order
                randomScenarios: {
                    basic: null,
                    intermediate: null,
                    advanced: null
                }
            };
            
            // Save reset progress
            this.saveProgress();
            
            // Start quiz again
            this.init();
            console.log('Quiz has been reset');
        } catch (error) {
            console.error('Error resetting quiz:', error);
        }
    }
}

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new ExploratoryQuiz();
    quiz.startGame();
}); 