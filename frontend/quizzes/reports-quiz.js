import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class ReportsQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
            },
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a reporting expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong reporting skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing reporting best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'reports',
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

        // Basic Scenarios (IDs 1-5)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Report Timing',
                description: 'When should you start writing a daily report?',
                options: [
                    {
                        text: 'Start at 16:45 for standard reports, 16:30 if peer review needed, deliver by 17:00',
                        outcome: 'Perfect! This ensures timely delivery with review time.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Time Management'
                    },
                    {
                        text: 'Start writing the report at end of the working day',
                        outcome: 'Reports need time for review from the project manager and any revisions needed.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Write the report throughout day and submit what has been observed at the time of documenting',
                        outcome: 'A final report requires the latest updated information at the point of submitting.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Start after 17:00',
                        outcome: 'Reports must be delivered before the end of day and starting too late may potentially not leave enough time for reviews and revisions.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Writing Style',
                description: 'How should you write the report summary?',
                options: [
                    {
                        text: 'Use third person, present tense, objective language without technical jargon',
                        outcome: 'Excellent! This maintains a professional tone.',
                        experience: 15,
                        tool: 'Writing Standards'
                    },
                    {
                        text: 'Use a first person approach to keep the report to a personal level',
                        outcome: 'Reports require a third person approach to keep to keep the tone objective.',
                        experience: -10
                    },
                    {
                        text: 'Include technical references so developers can identify issues quickly',
                        outcome: 'The language used should be accessible to all stakeholders and technical references should not be included unless absolutely required.',
                        experience: -5
                    },
                    {
                        text: 'Use a past tense approach when writing the summary section',
                        outcome: 'Present tense writing should be used as it shows the current state of a project.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Summary Structure',
                description: 'What are the four main sections of a report summary?',
                options: [
                    {
                        text: 'Introduction, what went well, what could be better, conclusion',
                        outcome: 'Perfect! This covers all key aspects.',
                        experience: 15,
                        tool: 'Report Structure'
                    },
                    {
                        text: 'Issues found, blocking issues, resolved issues and queries',
                        outcome: 'This approach only refers to issues and balanced coverage of all aspects is required.',
                        experience: -10
                    },
                    {
                        text: 'Introduction, technical details, what went well, conclusion',
                        outcome: 'Technical details should not be included in the summary as it should be accessible to all stakeholders.',
                        experience: -5
                    },
                    {
                        text: 'Sections related to observations from the days testing activities based on the testers preference',
                        outcome: 'A structured approach is required to maintain consistency across all reports.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Metrics Inclusion',
                description: 'What metrics should be included in the report?',
                options: [
                    {
                        text: 'New issues, closed issues, outstanding issues, and relevant progress tables',
                        outcome: 'Excellent! This provides comprehensive metrics.',
                        experience: 15,
                        tool: 'Metrics Documentation'
                    },
                    {
                        text: 'New issue metrics, as this is the current relevant information for the client',
                        outcome: 'All relevant metrics including progress, closed and outstanding issues are required for traceability purposes.',
                        experience: -10
                    },
                    {
                        text: 'Project progress as this is crucial for the project manger to gauge resources for the agreed test time frame',
                        outcome: 'Whilst this is an important metric, other metrics are also required for full project understanding.',
                        experience: -5
                    },
                    {
                        text: 'Closed ticket metrics as this informs the client on developer performance',
                        outcome: 'All metrics are crucial for reports, including new, closed, outstanding issues, and relevant progress.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Graph Presentation',
                description: 'How should graphs be presented in the report?',
                options: [
                    {
                        text: 'Consistent width, visible labels, appropriate legends, and alt text',
                        outcome: 'Perfect! This ensures accessible presentation.',
                        experience: 15,
                        tool: 'Visual Documentation'
                    },
                    {
                        text: 'With emphasis focused on each specific data element related to the graph and sized to fit the data',
                        outcome: 'Consistency is required in size throughout the report.',
                        experience: -10
                    },
                    {
                        text: 'Without labels as the graphs themselves provide enough data and information',
                        outcome: 'Labels for graphs and data are required for clarity.',
                        experience: -5
                    },
                    {
                        text: 'With placement preference based on experience of the tester',
                        outcome: 'Organized and structured presentation is required for all reports for consistency throughout.',
                        experience: 0
                    }
                ]
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Summary Numbering Reference',
                description: 'How should numbers be represented in the report summary?',
                options: [
                    {
                        text: 'All numbers should be written in words (e.g., seven)',
                        outcome: 'Correct! All references to numbers within the summary should be spelled out.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Summary Numbering Reference'
                    },
                    {
                        text: 'Numbers one through nine should be spelled out, numbers 10 and above should be written as numerals',
                        outcome: 'All references to numbers within the summary should be spelled out.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'All numbers should be written as numerals (e.g., 7)',
                        outcome: 'All references to numbers within the summary should be spelled out.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Only important metrics should be written as numerals, all other numbers should be spelled out',
                        outcome: 'All references to numbers within the summary should be spelled out.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Report Communication',
                description: 'What tense should be consistently used throughout a report?',
                options: [
                    {
                        text: 'Past tense should be used for the summary section within the report',
                        outcome: 'This is incorrect as past tense may imply defects are no longer present',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Future tense should be used throughout the report',
                        outcome: 'Present tense should be used throughout the report as it clearly defines where the project is up to progress wise.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Present tense should be used throughout the report',
                        outcome: 'Correct! Present tense should be used throughout the report as it clearly defines where the project is up to progress wise.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Report Communication'
                    },
                    {
                        text: 'A mix of past and present tense depending on the section should be used',
                        outcome: 'Present tense should be used consistently throughout the report as it clearly defines where the project is up to progress wise',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Report Blocking Issues',
                description: 'What should happen with blocking issues in the report?',
                options: [
                    {
                        text: 'They should be included in the Top 5 issues section',
                        outcome: 'Blocking issues should be reported in their own section.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'These should only be stated in the summary section',
                        outcome: 'While blocking issues may be mentioned in the summary, they should be listed in their own section as well.', 
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'They should be listed separately from the Top 5 issues',
                        outcome: 'Correct! Blocking issues should be separate from the top 5 issues and should be listed directly above in the Blocking issue(s) found section.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Report Blocking Issues'
                    },
                    {
                        text: 'They should only be listed if they cannot be resolved quickly',
                        outcome: 'All blocking issues should be listed regardless of resolution time.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Top 5 Issues of Concern',
                description: 'What should be done if there are fewer than 5 open issues remaining?',
                options: [
                    {
                        text: 'Remove the excess rows and rename the table to top issues of concern',
                        outcome: 'Correct! If there are less than 5 issues remaining open, we can remove the excess rows in the Top 5 table and amend the table\'s title to, top issues of concern.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Top 5 Issues of Concern'
                    },
                    {
                        text: 'Make up additional issues to complete the list',
                        outcome: 'Creating fictional issues would be unethical and misleading.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Leave the remaining rows blank in the table.',
                        outcome: 'Leaving blank rows would make the report look incomplete',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Include previously fixed issues to reach 5 total issues.',
                        outcome: 'Including fixed issues in the current open issues list would be misleading and inaccurate',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Test Environment Matrix',
                description: 'What is the appropriate formatting for the Test Environment Matrix in the report?',
                options: [
                    {
                        text: 'Keep all text for each row contained within one line where possible',
                        outcome: 'Correct! It\'s ideal to see if you can get all text for each row contained within one line and to select the AutoFit to Window option to extend the table to the full width of the page.',
                        experience: 15,
                        isCorrect: true,
                        tool: 'Test Environment Matrix'
                    },
                    {
                        text: 'Allow text to overflow to multiple lines to ensure readability',
                        outcome: 'Text overflow should be avoided where possible as it can become unreadable and display an unprofessional approach.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Use a smaller font size to fit all text on one line',
                        outcome: 'Whilst this could potentially correct any overflow issues. Font size should be kept consistent where possible.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Split the environment matrix across multiple pages',
                        outcome: 'Whilst this could potentially solve any issues with size. It could reduce readability.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Peer Review Process',
                description: 'How should you handle peer review feedback?',
                options: [
                    {
                        text: 'Review all comments, address each point, resolve comments after fixing and discuss if clarification needed',
                        outcome: 'Perfect! This ensures thorough review process.',
                        experience: 20,
                        tool: 'Peer Review'
                    },
                    {
                        text: 'Respond to feedback that is considered an improvement on what is currently stated',
                        outcome: 'All feedback requires consideration and a response stating the authors views.',
                        experience: -15
                    },
                    {
                        text: 'Delete any comments without fixing potential changes if they are not deemed to improve the report',
                        outcome: 'Comments correct resolution with feedback and documented information.',
                        experience: -10
                    },
                    {
                        text: 'Update any areas suggested from the review without marking comments as resolved',
                        outcome: 'Comment resolution is required for tracking purposes.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Environment Documentation',
                description: 'How do you document test environments in the report?',
                options: [
                    {
                        text: 'Include a matrix with accurate versions, consistent formatting, and relevant environment details',
                        outcome: 'Excellent! This provides clear environment context.',
                        experience: 20,
                        tool: 'Environment Documentation'
                    },
                    {
                        text: 'Incorporate a matrix with device names listed for each environment',
                        outcome: 'Other information is required for an environment matrix such as version details.',
                        experience: -15
                    },
                    {
                        text: 'Include a matrix with primary environment details stated',
                        outcome: 'Environment documentation for all environments tested are required for traceability.',
                        experience: -10
                    },
                    {
                        text: 'Use the summary to outline environment coverage',
                        outcome: 'Whilst some environment coverage can be stated in the summary, a more detailed approach is required in the form of an environment matrix for full traceability.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Issue Summary Presentation',
                description: 'How should you present the top issues in the report?',
                options: [
                    {
                        text: 'List most functionally impactive issues, include blocking issues separately, hyperlink all references',
                        outcome: 'Perfect! This provides organized issue overview.',
                        experience: 20,
                        tool: 'Issue Documentation'
                    },
                    {
                        text: 'List issues by tester preference based on experience of the project',
                        outcome: 'Issue need to be prioritised by impact on the system under test.',
                        experience: -15
                    },
                    {
                        text: 'List issues in standard text format in priority order',
                        outcome: 'Tickets in the top issues section require hyperlinks that direct to the correct bug tracker.',
                        experience: -10
                    },
                    {
                        text: 'State the top issues in priority order with any blockers stated first',
                        outcome: 'Blocking issues should be kept separate and documented in their own section in the report.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Weekly Report Management',
                description: 'How do you manage content for a weekly report?',
                options: [
                    {
                        text: 'Set up template first day, add draft notes daily, compile and refine at week end',
                        outcome: 'Excellent! This ensures comprehensive coverage.',
                        experience: 20,
                        tool: 'Report Management'
                    },
                    {
                        text: 'Document everything from the week on the last working day',
                        outcome: 'Progressive documentation is the best approach as its difficult to retain all information from the weeks testing activities.',
                        experience: -15
                    },
                    {
                        text: 'Use daily reports collated from weekly testing activities and include them into the weekly report',
                        outcome: 'A dedicated weekly report is required for consistency and ease of use for the client.',
                        experience: -10
                    },
                    {
                        text: 'Include information from later in the week to keep in line with more current activities',
                        outcome: 'A full week approach is required to specify all coverage attained from testing.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Stakeholder Communication',
                description: 'How do you adapt report content for different stakeholders?',
                options: [
                    {
                        text: 'Use clear language, avoid jargon, focus on business impact, maintain professional tone',
                        outcome: 'Perfect! This ensures wide accessibility.',
                        experience: 20,
                        tool: 'Stakeholder Management'
                    },
                    {
                        text: 'Use technical terms so developers can pinpoint and debug root causes',
                        outcome: 'Language used in reports needs to be accessible and understandable for all stakeholders involved in a project.',
                        experience: -15
                    },
                    {
                        text: 'Use language that focuses on Quality Assurance terminology',
                        outcome: 'All stakeholders must be considered, and language must be simple and fully inclusive.',
                        experience: -10
                    },
                    {
                        text: 'Use informal language to keep a friendly tone and maintain a good personal relationship',
                        outcome: 'A professional tone must be used throughout reports to keep a level of consistency and good business standard.',
                        experience: 0
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Report Format Adaptation',
                description: 'The client requests a different report format mid-project. How do you handle it?',
                options: [
                    {
                        text: 'Discuss the change with the Project Manager, adapt templates while maintaining key information and ensure consistent transition',
                        outcome: 'Perfect! This ensures proper format adaptation.',
                        experience: 25,
                        tool: 'Format Management'
                    },
                    {
                        text: 'Use both the current format and the new requested format on data you see fit for purpose',
                        outcome: 'The client requirements require consideration, clarification with the project manager and consistency.',
                        experience: -15
                    },
                    {
                        text: 'Create the new report format straight away and submit this at the usual time to the Project Manager',
                        outcome: 'Project Manager coordination required before making any changes to report formats to ensure consistency and clarity.',
                        experience: -10
                    },
                    {
                        text: 'Inform the client that the business use a structured guideline that needs to be followed for consistency',
                        outcome: 'While consistency is important, the client can essentially request how they receive the data they require and the way they want the data to be reported.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Complex Metrics Analysis',
                description: 'How do you handle conflicting metrics in the report?',
                options: [
                    {
                        text: 'Verify source data, cross-reference scripts, document discrepancies, consult the project manager if needed',
                        outcome: 'Excellent! This ensures accurate reporting.',
                        experience: 25,
                        tool: 'Data Analysis'
                    },
                    {
                        text: 'Adjust the formulas within the script to fit the numbers stated in the report',
                        outcome: 'Formulas should not be updated as this can return inconsistent results.',
                        experience: -15
                    },
                    {
                        text: 'Conflicting metrics should be reported to the project manager straight away',
                        outcome: 'In this instance other avenues should be visited first, such as source data and troubleshooting guides. Project managers have multiple reports to review at the end of the working day.',
                        experience: -10
                    },
                    {
                        text: 'Take an average of the numbers stated in the test script and which have been stated in the report',
                        outcome: 'Accurate data is required for reporting and verifying source data should be performed first.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Multi-Environment Reporting',
                description: 'How do you report on testing across multiple complex environments?',
                options: [
                    {
                        text: 'Create clear environment matrix, document specific behaviours, highlight key differences',
                        outcome: 'Perfect! This provides comprehensive environment coverage.',
                        experience: 25,
                        tool: 'Environment Analysis'
                    },
                    {
                        text: 'Group all environment data together and report as one metric',
                        outcome: 'Specific details required per environment for traceability.',
                        experience: -15
                    },
                    {
                        text: 'Ensure the report includes primary environment testing data',
                        outcome: 'Data for testing activities across all environments are required for coverage reporting.',
                        experience: -10
                    },
                    {
                        text: 'Specify the hardware used for each environment that has been tested',
                        outcome: 'Full environment documentation including, device, operating system and browser version details is essential.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Critical Issue Reporting',
                description: 'How do you report different multiple critical issues found late in the day?',
                options: [
                    {
                        text: 'Immediately notify project manager, document thoroughly in report, highlight business impact',
                        outcome: 'Excellent! This ensures proper critical issue handling.',
                        experience: 25,
                        tool: 'Critical Issue Management'
                    },
                    {
                        text: 'Include the issues within the report and submit this at the agreed time',
                        outcome: 'Immediate notification to the project manager is the best approach in this instance so clients are aware of any alternative planning that may be required.',
                        experience: -15
                    },
                    {
                        text: 'Collate all critical issues into one ticket for ease and speed of client delegation',
                        outcome: 'If issues are not related they require individual tickets raising regardless of time of working day.',
                        experience: -10
                    },
                    {
                        text: 'Leave the detail out of the report and communicate the issues with the project manager',
                        outcome: 'Thorough documentation as well as communication with the project manager on these critical issues required.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Report Quality Assurance',
                description: 'How do you ensure report quality before submission?',
                options: [
                    {
                        text: 'Review content, verify metrics, check formatting, validate links, run spell check, read aloud',
                        outcome: 'Perfect! This ensures comprehensive quality check.',
                        experience: 25,
                        tool: 'Quality Assurance'
                    },
                    {
                        text: 'Run the report through a spellchecker to make sure a professional standard is maintained',
                        outcome: 'Whilst good grammar is important, a thorough review of all data and formatting is required.',
                        experience: -15
                    },
                    {
                        text: 'Once all information has been collated a review is only required by the project manager',
                        outcome: 'A quality check is crucial before submitting to the project manager as they should not have to change anything or only make minimal changes.',
                        experience: -10
                    },
                    {
                        text: 'Thoroughly check all metrics data adds up correctly and is representative of testing activities carried out',
                        outcome: 'While metrics data is important, all aspects of reporting need thorough review.',
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
        return this.player.questionHistory.length >= this.totalQuestions;
    }

    calculateScorePercentage() {
        // Calculate percentage based on correct answers
        const correctAnswers = this.player.questionHistory.filter(q => {
            return q.selectedAnswer && q.selectedAnswer.isCorrect === true;
        }).length;
        
        // Always use total questions as denominator to get accurate percentage
        return Math.round((correctAnswers / this.totalQuestions) * 100);
    }

    async saveProgress() {
        // First determine the status based on clear conditions
        let status = 'in-progress';
        
        // Check for completion (all questions answered)
        if (this.player.questionHistory.length >= this.totalQuestions) {
            // Calculate percentage score based on correct answers
            const scorePercentage = this.calculateScorePercentage();
            status = scorePercentage >= this.passPercentage ? 'passed' : 'failed';
        }

        const progress = {
            experience: this.player.experience,
            tools: this.player.tools,
            currentScenario: this.player.currentScenario,
            questionHistory: this.player.questionHistory,
            lastUpdated: new Date().toISOString(),
            questionsAnswered: this.player.questionHistory.length,
            scorePercentage: this.calculateScorePercentage(),
            status: status
        };

        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot save progress');
                return;
            }
            
            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify(progress));
            
            console.log('Saving progress with status:', status, 'scorePercentage:', progress.scorePercentage);
            await this.apiService.saveQuizProgress(this.quizName, progress);
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

            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            const savedProgress = await this.apiService.getQuizProgress(this.quizName);
            console.log('Raw API Response:', savedProgress);
            let progress = null;
            
            if (savedProgress && savedProgress.data) {
                // Normalize the data structure
                progress = {
                    experience: savedProgress.data.experience || 0,
                    tools: savedProgress.data.tools || [],
                    questionHistory: savedProgress.data.questionHistory || [],
                    currentScenario: savedProgress.data.currentScenario || 0,
                    status: savedProgress.data.status || 'in-progress',
                    scorePercentage: savedProgress.data.scorePercentage || 0
                };
                console.log('Normalized progress data:', progress);
            } else {
                // Try loading from localStorage as fallback
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    progress = parsed;
                    console.log('Loaded progress from localStorage:', progress);
                }
            }

            if (progress) {
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                this.player.currentScenario = progress.currentScenario || 0;

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

    getCurrentScenarios() {
        // Determine the current scenarios based on how many questions have been answered
        const questionCount = this.player.questionHistory.length;
        
        if (questionCount < 5) {
            return this.basicScenarios;
        } else if (questionCount < 10) {
            return this.intermediateScenarios;
        } else {
            return this.advancedScenarios;
        }
    }

    getCurrentLevel() {
        // Determine current level based on questions answered
        const questionCount = this.player.questionHistory.length;
        
        if (questionCount < 5) {
            return 'basic';
        } else if (questionCount < 10) {
            return 'intermediate';
        } else {
            return 'advanced';
        }
    }

    displayScenario() {
        const currentScenarios = this.getCurrentScenarios();
        const questionCount = this.player.questionHistory.length;
        
        // Check if we've answered all questions
        if (this.shouldEndGame()) {
            this.endGame(false);
            return;
        }

        // Get the next scenario based on current progress
        let scenario;
        
        // Reset currentScenario based on the current level
        if (questionCount < 5) {
            // Basic questions (0-4)
            scenario = this.basicScenarios[questionCount];
            this.player.currentScenario = questionCount;
        } else if (questionCount < 10) {
            // Intermediate questions (5-9)
            scenario = this.intermediateScenarios[questionCount - 5];
            this.player.currentScenario = questionCount - 5;
        } else {
            // Advanced questions (10-14)
            scenario = this.advancedScenarios[questionCount - 10];
            this.player.currentScenario = questionCount - 10;
        }

        if (!scenario) {
            console.error('No scenario found for current progress. Question count:', questionCount);
            this.endGame(true);
            return;
        }

        // Store current question number for consistency
        this.currentQuestionNumber = questionCount + 1;
        
        // Show level transition message at the start of each level or when level changes
        const currentLevel = this.getCurrentLevel();
        const previousLevel = questionCount > 0 ? 
            (questionCount <= 5 ? 'Basic' : 
             questionCount <= 10 ? 'Intermediate' : 'Advanced') : null;
            
        if (questionCount === 0 || 
            (questionCount === 5 && currentLevel === 'intermediate') || 
            (questionCount === 10 && currentLevel === 'advanced')) {
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = ''; // Clear any existing messages
                
                const levelMessage = document.createElement('div');
                levelMessage.className = 'level-transition';
                levelMessage.setAttribute('role', 'alert');
                levelMessage.textContent = `Starting ${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)} Questions`;
                
                transitionContainer.appendChild(levelMessage);
                transitionContainer.classList.add('active');
                
                // Update the level indicator
                const levelIndicator = document.getElementById('level-indicator');
                if (levelIndicator) {
                    levelIndicator.textContent = `Level: ${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}`;
                }
                
                // Remove the message and container height after animation
                setTimeout(() => {
                    transitionContainer.classList.remove('active');
                    setTimeout(() => {
                        transitionContainer.innerHTML = '';
                    }, 300); // Wait for height transition to complete
                }, 3000);
            }
        }

        // Update scenario display
        const titleElement = document.getElementById('scenario-title');
        const descriptionElement = document.getElementById('scenario-description');
        const optionsContainer = document.getElementById('options-container');

        if (!titleElement || !descriptionElement || !optionsContainer) {
            console.error('Required elements not found');
            return;
        }

        titleElement.textContent = scenario.title;
        descriptionElement.textContent = scenario.description;

        // Update question counter immediately
        const questionProgress = document.getElementById('question-progress');
        if (questionProgress) {
            questionProgress.textContent = `Question: ${this.currentQuestionNumber}/${this.totalQuestions}`;
        }

        // Create a copy of options with their original indices
        const shuffledOptions = scenario.options.map((option, index) => ({
            ...option,
            originalIndex: index
        }));

        // Shuffle the options
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }

        optionsContainer.innerHTML = '';

        shuffledOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <input type="radio" 
                    name="option" 
                    value="${option.originalIndex}" 
                    id="option${index}"
                    tabindex="0"
                    aria-label="${option.text}"
                    role="radio">
                <label for="option${index}">${option.text}</label>
            `;
            optionsContainer.appendChild(optionElement);
        });

        this.updateProgress();

        // Initialize timer for the new question
        this.initializeTimer();
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
        }
        
        try {
            this.isLoading = true;
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) return;

            const currentScenarios = this.getCurrentScenarios();
            const scenario = currentScenarios[this.player.currentScenario];
            const originalIndex = parseInt(selectedOption.value);
            
            const selectedAnswer = scenario.options[originalIndex];

            // Update player experience with bounds
            this.player.experience = Math.max(0, Math.min(this.config.maxXP, this.player.experience + selectedAnswer.experience));

            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: selectedAnswer.isCorrect === true,
                timeSpent: timeSpent,
                timedOut: false
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();

            // Also save quiz result and update display
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                const scorePercentage = this.calculateScorePercentage();
                
                await quizUser.updateQuizScore(
                    this.quizName,
                    scorePercentage,
                    this.player.experience,
                    this.player.tools,
                    this.player.questionHistory,
                    this.player.questionHistory.length
                );
            }

            // Show outcome screen
            if (this.gameScreen && this.outcomeScreen) {
                this.gameScreen.classList.add('hidden');
                this.outcomeScreen.classList.remove('hidden');
            }
            
            // Update outcome display
            let outcomeText = selectedAnswer.outcome;
            document.getElementById('outcome-text').textContent = outcomeText;
            
            // Update result display
            const resultElement = document.getElementById('result-text');
            if (resultElement) {
                resultElement.textContent = selectedAnswer.isCorrect ? 'Correct!' : 'Incorrect';
                resultElement.className = selectedAnswer.isCorrect ? 'correct' : 'incorrect';
            }
            
            if (selectedAnswer.tool) {
                document.getElementById('tool-gained').textContent = `Tool acquired: ${selectedAnswer.tool}`;
                if (!this.player.tools.includes(selectedAnswer.tool)) {
                    this.player.tools.push(selectedAnswer.tool);
                }
            } else {
                document.getElementById('tool-gained').textContent = '';
            }

            this.updateProgress();
            
            // Check if game should end after this answer
            if (this.shouldEndGame()) {
                // If we've answered all questions, end the game
                await this.endGame(false);
            }
        } catch (error) {
            console.error('Failed to handle answer:', error);
            this.showError('Failed to save your answer. Please try again.');
        } finally {
            this.isLoading = false;
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    }

    updateProgress() {
        // Get current level and question count
        const currentLevel = this.getCurrentLevel();
        const totalAnswered = this.player.questionHistory.length;
        const questionNumber = totalAnswered + 1;
        
        // Update the existing progress card elements
        const levelInfoElement = document.querySelector('.level-info');
        const questionInfoElement = document.querySelector('.question-info');
        
        if (levelInfoElement) {
            levelInfoElement.textContent = `Level: ${currentLevel}`;
        }
        
        if (questionInfoElement) {
            questionInfoElement.textContent = `Question: ${questionNumber}/${this.totalQuestions}`;
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
            questionProgress.textContent = `Question: ${questionNumber}/${this.totalQuestions}`;
        }
        
        if (progressFill) {
            const progressPercentage = (totalAnswered / this.totalQuestions) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
    }

    generateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations');
        if (!recommendationsContainer) return;

        const scorePercentage = this.calculateScorePercentage();
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            const isCorrect = record.isCorrect;

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

        if (scorePercentage >= 90 && weakAreas.length === 0) {
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of reports. You clearly understand the nuances of reports and are well-equipped to handle any reports challenges!</p>';
        } else if (scorePercentage >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your reports skills are very strong. To achieve complete mastery, consider focusing on:</p>';
            recommendationsHTML += '<ul>';
            if (weakAreas.length > 0) {
                weakAreas.forEach(area => {
                    recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
                });
            }
            recommendationsHTML += '</ul>';
        } else if (scorePercentage >= 70) {
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

    async endGame(failed = false) {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        // Hide the progress card on the end screen
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'none';
        }

        // Calculate score based on correct answers
        const scorePercentage = this.calculateScorePercentage();
        const isPassed = scorePercentage >= this.passPercentage;
        
        // Determine final status
        const finalStatus = failed ? 'failed' : (isPassed ? 'passed' : 'failed');
        
        // Save the final quiz result with pass/fail status
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                console.log('Setting final quiz status:', { status: finalStatus, score: scorePercentage });
                
                const result = {
                    score: scorePercentage,
                    scorePercentage: scorePercentage,
                    status: finalStatus,
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory,
                    questionsAnswered: this.player.questionHistory.length,
                    lastUpdated: new Date().toISOString()
                };

                // Save to QuizUser
                await user.updateQuizScore(
                    this.quizName,
                    result.scorePercentage,
                    result.experience,
                    this.player.tools,
                    result.questionHistory,
                    result.questionsAnswered,
                    finalStatus
                );

                // Save directly via API
                console.log('Saving final progress to API:', result);
                await this.apiService.saveQuizProgress(this.quizName, result);
                
                // Clear quiz local storage
                this.clearQuizLocalStorage(username, this.quizName);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${scorePercentage}%`;
        
        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = isPassed ? 'Quiz Complete!' : 'Quiz Failed!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (performanceSummary) {
            performanceSummary.textContent = isPassed ? 'Congratulations! You passed the quiz.' : 'Sorry, you did not pass the quiz. Please review the recommendations and try again.';
        }
    }
}

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Clear any existing quiz instances before starting this quiz
    BaseQuiz.clearQuizInstances('reports');
    
    const quiz = new ReportsQuiz();
    quiz.startGame();
});