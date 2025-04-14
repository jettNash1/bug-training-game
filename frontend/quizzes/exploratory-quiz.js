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
        this.initializeEventListeners();

        this.isLoading = false;
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
        const progress = {
            data: {
                experience: this.player.experience,
                tools: this.player.tools,
                questionHistory: this.player.questionHistory,
                lastUpdated: new Date().toISOString(),
                questionsAnswered: this.player.questionHistory.length,
                selectedScenarios: this.selectedScenarios, // Save the randomized sets
                status: this.player.questionHistory.length >= 15 ? 
                    (this.calculateScore() >= 70 ? 'passed' : 'failed') : 
                    'in-progress',
                scorePercentage: this.calculateScore()
            }
        };

        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot save progress');
                return;
            }
            
            // Save to localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify(progress));
            
            // Save to API
            await this.apiService.saveQuizProgress(this.quizName, progress.data);
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }

    async loadProgress() {
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot load progress');
                return false;
            }

            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            const savedProgress = await this.apiService.getQuizProgress(this.quizName);
            
            let progress = null;
            if (savedProgress && savedProgress.data) {
                progress = savedProgress.data;
            } else {
                // Try loading from localStorage as fallback
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    progress = JSON.parse(localData).data;
                }
            }

            if (progress) {
                // Restore player state
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                
                // Restore randomized scenario sets if they exist
                if (progress.selectedScenarios) {
                    this.selectedScenarios = progress.selectedScenarios;
                } else {
                    // Initialize new random sets if none saved
                    this.selectedScenarios = {
                        basic: this.getRandomScenarios(this.basicScenarios, 5),
                        intermediate: this.getRandomScenarios(this.intermediateScenarios, 5),
                        advanced: this.getRandomScenarios(this.advancedScenarios, 5)
                    };
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

            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
                console.log('Timer cleared in startGame');
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
            console.log('Previous progress loaded:', hasProgress);
            
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

            // Update progress display
            this.updateProgress();

            // Start from first scenario
            this.displayScenario();
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
        // Add event listeners for the continue and restart buttons
        document.getElementById('continue-btn')?.addEventListener('click', () => this.nextScenario());
        document.getElementById('restart-btn')?.addEventListener('click', () => this.restartGame());

        // Add form submission handler
        document.getElementById('options-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAnswer();
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.type === 'radio') {
                this.handleAnswer();
            }
        });
    }

    async displayScenario() {
        try {
            // Check if player has answered all 15 questions
            const totalAnswered = this.player?.questionHistory?.length || 0;
            if (totalAnswered >= 15) {
                await this.transitionToNextLevel();
                return;
            }
            
            const currentScenarios = this.getCurrentScenarios();
            if (!currentScenarios || currentScenarios.length === 0) {
                console.error('No scenarios available');
                return;
            }
            
            // Get the current scenario based on answered questions
            const currentScenarioIndex = totalAnswered % 5;
            const currentScenario = currentScenarios[currentScenarioIndex];

            if (!currentScenario) {
                console.error('Current scenario not found');
            return;
        }

            // Update UI with current scenario
            this.updateScenarioUI(currentScenario);

            // Update progress display
            this.updateProgressDisplay(totalAnswered);

        } catch (error) {
            console.error('Error in displayScenario:', error);
        }
    }

    updateProgressDisplay(totalAnswered) {
        const progressElement = document.getElementById('progress');
        if (progressElement) {
            progressElement.textContent = `Questions Answered: ${totalAnswered}/15`;
        }
    }

    updateScenarioUI(scenario) {
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
                
                scenario.options.forEach((option, index) => {
                    if (!option || !option.text) {
                        console.error('Invalid option at index', index, option);
                        return;
                    }
                    
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    optionDiv.innerHTML = `
                <input type="radio" 
                    name="option" 
                            value="${index}" 
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
            
            console.log('Scenario content displayed, timer initialized');
        } catch (error) {
            console.error('Error displaying scenario content:', error);
        }
    }

    isCorrectAnswer(answer) {
        // Helper method to consistently determine if an answer is correct
        return answer && (answer.isCorrect || answer.experience > 0);
    }

    async handleAnswer() {
        try {
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) {
                this.showError('Please select an answer before submitting');
                return;
            }

            const currentScenarios = this.getCurrentScenarios();
            const totalAnswered = this.player.questionHistory.length;
            const currentScenarioIndex = totalAnswered % 5;
            const currentScenario = currentScenarios[currentScenarioIndex];

            if (!currentScenario) {
                console.error('Current scenario not found');
                this.showError('An error occurred. Please try again.');
                return;
            }
            
            const selectedAnswer = currentScenario.options[parseInt(selectedOption.value)];
            
            // Record the answer
            this.player.questionHistory.push({
                scenarioId: currentScenario.id,
                selectedAnswer: selectedAnswer.text,
                isCorrect: this.isCorrectAnswer(selectedAnswer),
                experience: selectedAnswer.experience,
                timestamp: new Date().toISOString()
            });

            // Update player's experience
            this.player.experience += selectedAnswer.experience;

            // Save progress
            await this.saveProgress();

            // Display outcome
            this.displayOutcome(selectedAnswer);
            
            // Update progress display
            this.updateProgressDisplay(totalAnswered + 1);

            // Check if we should transition to next level
            if (totalAnswered + 1 >= 15) {
                await this.endGame();
            }

        } catch (error) {
            console.error('Error in handleAnswer:', error);
            this.showError('An error occurred while processing your answer. Please try again.');
        }
    }

    displayOutcome(selectedAnswer) {
        if (!selectedAnswer) {
            console.error('No answer selected');
            return;
        }

        try {
            const currentScenarios = this.getCurrentScenarios();
            if (!currentScenarios || currentScenarios[this.player.currentScenario]) {
                console.error('No current scenario found');
                return;
            }
            
            const currentScenario = currentScenarios[this.player.currentScenario];
            const isCorrect = this.isCorrectAnswer(selectedAnswer);
            
            console.log('Displaying outcome:', { 
                isCorrect, 
                selectedAnswer,
                currentScenario: this.player.currentScenario
            });
            
            // Update UI - safely access elements
            const outcomeScreen = document.getElementById('outcome-screen');
            const gameScreen = document.getElementById('game-screen');
            
            // Show outcome screen if elements exist
            if (gameScreen) {
                gameScreen.classList.add('hidden');
                gameScreen.style.display = 'none';
            }
            
            if (outcomeScreen) {
                outcomeScreen.classList.remove('hidden');
                outcomeScreen.style.display = 'block';
            }
            
            // Set content directly in the outcome screen
            const outcomeContent = outcomeScreen.querySelector('.outcome-content');
            if (outcomeContent) {
                outcomeContent.innerHTML = `
                    <h3>${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                    <p>${selectedAnswer.outcome || ''}</p>
                    <p class="result">${isCorrect ? 'Correct answer!' : 'Try again next time.'}</p>
                    <button id="continue-btn" class="submit-button">Continue</button>
                `;
                
                // Add event listener to the continue button
                const continueBtn = outcomeContent.querySelector('#continue-btn');
                if (continueBtn) {
                    continueBtn.addEventListener('click', () => this.nextScenario());
                }
            } else {
                console.error('Could not find outcome content element');
            }
            
            // Update progress
            this.updateProgress();
        } catch (error) {
            console.error('Error in displayOutcome:', error);
            this.showError('An error occurred. Please try again.');
        }
    }

    nextScenario() {
        try {
            console.log('Moving to next scenario');
            
            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
                console.log('Timer cleared in nextScenario');
            }
            
            // Increment current scenario if not done in handleAnswer
            if (this.player && typeof this.player.currentScenario === 'number') {
                this.player.currentScenario++;
                console.log('Incremented to scenario:', this.player.currentScenario);
            }
            
            // Hide outcome screen and show game screen - try both class and style approaches
            const outcomeScreen = document.getElementById('outcome-screen');
            const gameScreen = document.getElementById('game-screen');
            
            if (outcomeScreen) {
                // Try both methods
                outcomeScreen.classList.add('hidden');
                outcomeScreen.style.display = 'none';
            }
            
            if (gameScreen) {
                // Try both methods
                gameScreen.classList.remove('hidden');
                gameScreen.style.display = 'block';
        }
        
        // Display next scenario
        this.displayScenario();
            
            // Re-initialize event listeners for the new scenario
            this.initializeEventListeners();
        } catch (error) {
            console.error('Error in nextScenario:', error);
            this.showError('An error occurred while loading the next question. Please try again.');
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
            questionProgress.textContent = `Question: ${questionNumber}/15`;
        }
        
        if (progressFill) {
            const progressPercentage = Math.min((totalAnswered / 15) * 100, 100);
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

    // Helper method to randomly select scenarios from a level
    getRandomScenarios(scenarios, count) {
        if (!scenarios || scenarios.length <= count) {
            return scenarios;
        }
        
        // Create a copy of the array to avoid modifying the original
        const shuffled = [...scenarios];
        
        // Fisher-Yates shuffle algorithm
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Return the first 'count' scenarios
        return shuffled.slice(0, count);
    }

    getCurrentScenarios() {
        try {
            const totalAnswered = this.player?.questionHistory?.length || 0;
        
            // If this is the first time getting scenarios, initialize the random selection
            if (!this.selectedScenarios) {
                this.selectedScenarios = {
                    basic: this.getRandomScenarios(this.basicScenarios, 5),
                    intermediate: this.getRandomScenarios(this.intermediateScenarios, 5),
                    advanced: this.getRandomScenarios(this.advancedScenarios, 5)
                };
            }
            
            // Return the appropriate level's scenarios based on progress
            if (totalAnswered >= 10) {
                return this.selectedScenarios.advanced;
            } else if (totalAnswered >= 5) {
                return this.selectedScenarios.intermediate;
        }
            return this.selectedScenarios.basic;
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

    async endGame() {
        // Calculate final score based on correct answers
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && this.isCorrectAnswer(q.selectedAnswer)
        ).length;
        const scorePercentage = Math.round((correctAnswers / 15) * 100);
        
        // Create the final progress object
        const progress = {
            questionsAnswered: 15, // Always 15 at the end
            questionHistory: this.player.questionHistory,
            currentScenario: this.player.currentScenario,
            status: scorePercentage >= 70 ? 'passed' : 'failed',
            scorePercentage: scorePercentage,
            lastUpdated: new Date().toISOString()
        };

        try {
            // Hide the timer container
            const timerContainer = document.getElementById('timer-container');
            if (timerContainer) {
                timerContainer.style.display = 'none';
            }
            
            // Update progress display to show 15/15
            const questionInfoElement = document.querySelector('.question-info');
            if (questionInfoElement) {
                questionInfoElement.textContent = 'Question: 15/15';
            }
            
            // Update legacy progress elements if they exist
            const questionProgress = document.getElementById('question-progress');
            if (questionProgress) {
                questionProgress.textContent = 'Question: 15/15';
            }
            
            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
            }
            
            // Save progress to API
        const username = localStorage.getItem('username');
            if (!username) {
                throw new Error('No username found');
            }

            // Save to API
            await this.apiService.saveQuizProgress(this.quizName, progress);
            console.log('Final progress saved:', progress);

            // Update quiz score in user's record
            const quizUser = new QuizUser(username);
            await quizUser.updateQuizScore(
                    this.quizName,
                scorePercentage, 
                0, // no experience
                    this.player.tools,
                this.player.questionHistory,
                15, // Always 15 questions completed
                scorePercentage >= 70 ? 'completed' : 'failed'
            );
            
            // Update display elements
            const finalScoreElement = document.getElementById('final-score');
            if (finalScoreElement) {
                finalScoreElement.textContent = `Final Score: ${scorePercentage}%`;
            }
            
            // Show the end screen
            this.gameScreen.classList.add('hidden');
            this.outcomeScreen.classList.add('hidden');
            if (this.endScreen) {
                this.endScreen.classList.remove('hidden');
        }

        // Generate question review list
        const reviewList = document.getElementById('question-review');
        if (reviewList) {
            reviewList.innerHTML = ''; // Clear existing content
                
            this.player.questionHistory.forEach((record, index) => {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                
                    const isCorrect = record.selectedAnswer && this.isCorrectAnswer(record.selectedAnswer);
                reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
                
                reviewItem.innerHTML = `
                    <h4>Question ${index + 1}</h4>
                        <p class="scenario">${record.scenario ? record.scenario.description : 'No description available'}</p>
                        <p class="answer"><strong>Your Answer:</strong> ${record.selectedAnswer ? record.selectedAnswer.text : 'No answer selected'}</p>
                        <p class="outcome"><strong>Outcome:</strong> ${record.selectedAnswer ? record.selectedAnswer.outcome : 'No outcome'}</p>
                        <p class="result"><strong>Result:</strong> ${isCorrect ? 'Correct' : 'Incorrect'}</p>
                `;
                
                reviewList.appendChild(reviewItem);
            });
        }

            // Clear local storage for this quiz
            this.clearQuizLocalStorage(username, this.quizName);

            // Display recommendations
        this.generateRecommendations();

        } catch (error) {
            console.error('Failed to save final progress:', error);
            this.showError('Failed to save your results. Please try again.');
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
        
        console.log('Timer initialized with', this.remainingTime, 'seconds');
    }

    handleTimeUp() {
        console.log('Time is up!');
        try {
            // Get current scenario
            const currentScenarios = this.getCurrentScenarios();
            const scenario = currentScenarios[this.player.currentScenario];
            
            if (!scenario) {
                console.error('No scenario found for time up handling');
                return;
            }
            
            // Find the option with the highest score (correct answer)
            const correctAnswer = scenario.options.reduce((prev, current) => 
                (prev.experience > current.experience) ? prev : current
            );
            
            // Create a timeout option
            const timeoutOption = {
                text: 'Time ran out!',
                experience: 0,
                isCorrect: false,
                outcome: 'You did not answer in time.'
            };
            
            // Add to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: timeoutOption,
                isCorrect: false
            });
            
            // Save progress
            this.saveProgress();
            
            // Show timeout outcome
            this.displayOutcome(timeoutOption);
        } catch (error) {
            console.error('Error handling time up:', error);
            this.showError('An error occurred. Please try again.');
        }
    }
}

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new ExploratoryQuiz();
    quiz.startGame();
}); 