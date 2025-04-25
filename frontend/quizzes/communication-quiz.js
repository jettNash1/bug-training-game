import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class CommunicationQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a communication expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong communication skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'communication',
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
                title: 'Daily Stand-up',
                description: 'You\'re attending a daily stand-up meeting. What\'s the most effective way to communicate your progress?',
                options: [
                    {
                        text: 'Clearly state what you completed yesterday, what you\'re working on today, and any blockers',
                        outcome: 'Perfect! This provides a clear and structured update.',
                        experience: 15,
                        tool: 'Meeting Communication'
                    },
                    {
                        text: 'Give a detailed explanation of every task you worked on',
                        outcome: 'Stand-ups should be concise and focused.',
                        experience: 0
                    },
                    {
                        text: 'State that everything is fine and you progressing well',
                        outcome: 'Updates should be specific and informative as stakeholders need to factor in project resources and time management.',
                        experience: -10
                    },
                    {
                        text: 'Wait for people to ask you questions about specific areas of the project during the meeting',
                        outcome: 'Being proactive in providing updates is a more productive use of meeting time.',
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Email Communication',
                description: 'You need to send an important update to the team. How should you structure your email?',
                options: [
                    {
                        text: 'Use a clear subject line, organize content with headings, and highlight key points',
                        outcome: 'Excellent! This makes the email easy to read and understand.',
                        experience: 15,
                        tool: 'Email Etiquette'
                    },
                    {
                        text: 'Write a paragraph which includes all possible information that might be required',
                        outcome: 'Emails should be well-organized and easy to pinpoint priority areas.',
                        experience: -10
                    },
                    {
                        text: 'Send multiple short emails targeting different areas of the project that require an update',
                        outcome: 'Important updates should be consolidated when possible to avoid losing important information.',
                        experience: 0
                    },
                    {
                        text: 'Use informal language and emojis to keep a friendly approach',
                        outcome: 'Professional communication requires an appropriate tone.',
                        experience: -5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Team Chat',
                description: 'A colleague asks a technical question in the team chat. What\'s the best response?',
                options: [
                    {
                        text: 'Provide a clear answer with relevant documentation links',
                        outcome: 'Perfect! This helps both now and in the future.',
                        experience: 15,
                        tool: 'Documentation Reference'
                    },
                    {
                        text: 'Advise them to search for suggestions online and give general direction',
                        outcome: 'This may not be helpful or collaborative and can slow down testing processes.',
                        experience: -10
                    },
                    {
                        text: 'Wait for someone else to respond to the question',
                        outcome: 'Team communication requires active participation.',
                        experience: -5
                    },
                    {
                        text: 'Give a vague answer to their queries if you are not sure',
                        outcome: 'Clear and specific responses are more helpful and if the answer is not known, direct to someone who might be able to help.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Status Updates',
                description: 'You\'ve encountered a delay in your work. How should you communicate this?',
                options: [
                    {
                        text: 'Promptly inform stakeholders, explain the cause, and provide an updated timeline',
                        outcome: 'Excellent! This maintains transparency and builds trust.',
                        experience: 15,
                        tool: 'Status Reporting'
                    },
                    {
                        text: 'Wait until someone else affected asks about the delay in the project',
                        outcome: 'Delays should be communicated proactively as to redistribute working resources effectively.',
                        experience: -5
                    },
                    {
                        text: 'Mention the delay in the next scheduled meeting',
                        outcome: 'Important updates shouldn\'t wait for scheduled meetings as it could cause bottlenecks further into the project.',
                        experience: 0
                    },
                    {
                        text: 'Find solutions to delay yourself without telling anyone',
                        outcome: 'Transparency is important in team communication and in this instance may be helped with extra resources to mitigate the delay.',
                        experience: -10
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Documentation',
                description: 'You\'ve completed a new feature. How should you document it?',
                options: [
                    {
                        text: 'Write clear, organised documentation with examples and update relevant guides',
                        outcome: 'Perfect! This helps the team understand and maintain the feature.',
                        experience: 15,
                        tool: 'Technical Documentation'
                    },
                    {
                        text: 'Leave comments in the specific code that you have access to',
                        outcome: 'Documentation should be more comprehensive and accessible to all interested parties.',
                        experience: 0
                    },
                    {
                        text: 'Leave guides and documentation as this is not needed since the code itself is self-explanatory',
                        outcome: 'Documentation is crucial for diverse teams with different skill sets to understand the feature.',
                        experience: -10
                    },
                    {
                        text: 'Create quick notes in your personal files to lean on should any questions arise',
                        outcome: 'Documentation should be accessible to the full team.',
                        experience: -5
                    }
                ]
            },
            // Additional Basic Scenarios (IDs 16-20)
            {
                id: 16,
                level: 'Basic',
                title: 'Meeting Preparation',
                description: 'You need to attend a project kickoff meeting. How should you prepare?',
                options: [
                    {
                        text: 'Review project documents, prepare questions, and understand your role in the project',
                        outcome: 'Excellent! Being prepared shows professionalism and helps make meetings productive.',
                        experience: 15,
                        tool: 'Meeting Preparation'
                    },
                    {
                        text: 'Just attend the meeting and catch up as things progress',
                        outcome: 'Preparation is key to effective meeting participation and contributes to project success.',
                        experience: -10
                    },
                    {
                        text: 'Skim through the meeting invite to get a basic overview',
                        outcome: 'While better than no preparation, a thorough review of materials is more effective.',
                        experience: 0
                    },
                    {
                        text: 'Ask a colleague for a quick summary before the meeting',
                        outcome: 'Personal preparation ensures you form your own understanding and questions.',
                        experience: -5
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Asking Questions',
                description: 'You\'re unclear about the requirements for a task. What\'s the best way to seek clarification?',
                options: [
                    {
                        text: 'Research what you can, then ask specific, well-formulated questions about remaining uncertainties',
                        outcome: 'Perfect! This shows initiative while seeking necessary clarification.',
                        experience: 15,
                        tool: 'Effective Questioning'
                    },
                    {
                        text: 'Ask the project manager to explain everything about the task again',
                        outcome: 'Broad requests for explanation don\'t demonstrate your effort to understand.',
                        experience: -5
                    },
                    {
                        text: 'Proceed with your best guess of what\'s required',
                        outcome: 'Working with unclear requirements can lead to wasted effort and rework.',
                        experience: -10
                    },
                    {
                        text: 'Wait until the next team meeting to bring up all your questions',
                        outcome: 'Waiting too long for clarification can delay progress unnecessarily.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Note Taking',
                description: 'During an important client call, what\'s the best approach to note-taking?',
                options: [
                    {
                        text: 'Take concise notes of key points, decisions, and action items with clear ownership',
                        outcome: 'Excellent! This creates a useful record that can be shared and referenced.',
                        experience: 15,
                        tool: 'Note Taking'
                    },
                    {
                        text: 'Record every detail of the conversation word for word',
                        outcome: 'Excessive detail can make notes difficult to review and use later.',
                        experience: -5
                    },
                    {
                        text: 'Rely on memory and write notes after the call',
                        outcome: 'Important details may be forgotten without real-time note-taking.',
                        experience: -10
                    },
                    {
                        text: 'Let someone else take notes since you need to focus on the discussion',
                        outcome: 'While delegation can work, personal notes help with your understanding and recall.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Providing Feedback',
                description: 'A team member has shared their work for review. How should you approach giving feedback?',
                options: [
                    {
                        text: 'Provide specific, constructive comments with a balance of positive points and areas for improvement',
                        outcome: 'Perfect! This approach is helpful and motivating.',
                        experience: 15,
                        tool: 'Constructive Feedback'
                    },
                    {
                        text: 'Focus only on what needs to be fixed',
                        outcome: 'Balanced feedback that includes positives is more motivating and effective.',
                        experience: -5
                    },
                    {
                        text: 'Give general praise to avoid hurting their feelings',
                        outcome: 'Vague positive feedback doesn\'t help with improvement.',
                        experience: -10
                    },
                    {
                        text: 'Suggest they look at a similar completed project for guidance',
                        outcome: 'While examples can be helpful, specific feedback on their work is more valuable.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Introduction Email',
                description: 'You\'re joining a new project team. How should you introduce yourself in an email?',
                options: [
                    {
                        text: 'Write a concise email with your role, relevant experience, and enthusiasm for contributing to the project',
                        outcome: 'Excellent! This provides helpful context and establishes a positive first impression.',
                        experience: 15,
                        tool: 'Professional Introduction'
                    },
                    {
                        text: 'Share detailed information about your entire work history and all your skills',
                        outcome: 'Excessively long introductions may not be read carefully and could seem unfocused.',
                        experience: -5
                    },
                    {
                        text: 'Just state your name and that you\'ve joined the team',
                        outcome: 'A minimalist introduction misses the opportunity to establish rapport.',
                        experience: -10
                    },
                    {
                        text: 'Wait for the team lead to introduce you to everyone',
                        outcome: 'Taking initiative in introducing yourself shows professionalism and engagement.',
                        experience: 0
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Stakeholder Communication',
                description: 'You need to explain a technical issue to non-technical stakeholders. How should you approach this?',
                options: [
                    {
                        text: 'Use clear analogies and visual aids, avoid jargon, and focus on business impact',
                        outcome: 'Excellent! This makes technical concepts accessible.',
                        experience: 20,
                        tool: 'Stakeholder Communication'
                    },
                    {
                        text: 'Use technical terms to maintain a professional approach',
                        outcome: 'Technical jargon can confuse non-technical stakeholders.',
                        experience: -10
                    },
                    {
                        text: 'Keep it very brief to avoid any confusion around processes',
                        outcome: 'Although keeping the explanation brief is a good approach. Thorough and clear wording is needed for good understanding.',
                        experience: -5
                    },
                    {
                        text: 'Let someone else who has been on the project longer handle it',
                        outcome: 'Technical communication at all levels is an important skillset and will have to be utilised at points throughout project based work.',
                        experience: -15
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Conflict Resolution',
                description: 'There\'s a disagreement in the team about a technical approach. How do you handle it?',
                options: [
                    {
                        text: 'Facilitate a discussion, document different viewpoints, and work toward consensus',
                        outcome: 'Perfect! This promotes constructive resolution.',
                        experience: 20,
                        tool: 'Conflict Resolution'
                    },
                    {
                        text: 'The most senior person within the team should decide the outcome',
                        outcome: 'All round team input and consensus is valuable as different observations can bring about solutions.',
                        experience: -5
                    },
                    {
                        text: 'Avoid the conflict as matters of these type generally resolve themselves',
                        outcome: 'Conflicts should be addressed professionally and solutions sought as to move forward with a good working relationship.',
                        experience: -10
                    },
                    {
                        text: 'Push for your preferred solution to quickly resolve the matter before it escalates',
                        outcome: 'All viewpoints should be considered in technical discussions as everyone has valuable experience.',
                        experience: -15
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Code Review Communication',
                description: 'You\'re reviewing a colleague\'s documentation and find several issues. How do you communicate this?',
                options: [
                    {
                        text: 'Provide specific, constructive feedback with examples and suggestions for improvement',
                        outcome: 'Excellent! This helps learning and improvement.',
                        experience: 20,
                        tool: 'Code Review'
                    },
                    {
                        text: 'List all the problems found in document and send these to be addressed',
                        outcome: 'Feedback should be constructive and helpful and not just point out issues.',
                        experience: -5
                    },
                    {
                        text: 'Tell them they need to review it again and update it',
                        outcome: 'Specific feedback is more valuable and helps move towards solutions.',
                        experience: -10
                    },
                    {
                        text: 'Approve it to avoid any type of confrontation and to move forward with the project quickly',
                        outcome: 'Honest, constructive feedback is important, as team and personal progress may not be achieved moving forward.',
                        experience: -15
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Remote Communication',
                description: 'You\'re working remotely and need to collaborate on a complex task. How do you ensure effective communication?',
                options: [
                    {
                        text: 'Set up regular video calls, use screen sharing, and maintain detailed documentation',
                        outcome: 'Perfect! This maintains clear communication channels.',
                        experience: 20,
                        tool: 'Remote Collaboration'
                    },
                    {
                        text: 'Use email as your source of communication and copy everyone in that\'s involved in the project',
                        outcome: 'Multiple communication channels are often needed for different teams related to the project.',
                        experience: -15
                    },
                    {
                        text: 'Wait for others to initiate communication to establish their preferred channels',
                        outcome: 'Being proactive in remote communication creates a professional approach.',
                        experience: -10
                    },
                    {
                        text: 'Handle everything through chat channels for quick responses',
                        outcome: 'Complex tasks often need richer communication and extensive detail that chat channels cant provide.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Project Updates',
                description: 'You\'re leading a project and need to communicate progress to multiple teams. What\'s the best approach?',
                options: [
                    {
                        text: 'Create a structured report with key metrics, milestones, and risks, and schedule a presentation',
                        outcome: 'Excellent! This provides comprehensive project visibility.',
                        experience: 20,
                        tool: 'Project Communication'
                    },
                    {
                        text: 'Send quick updates on the fly as changes to projects or issue occur',
                        outcome: 'Project updates should be organised and regular.',
                        experience: -5
                    },
                    {
                        text: 'Update your immediate team members within the appropriate channel',
                        outcome: 'All stakeholders need appropriate updates to form project progress plans going forward.',
                        experience: -10
                    },
                    {
                        text: 'Wait for official review meetings and report all project updates at that time',
                        outcome: 'Regular project communication is important for stakeholder prioritisation and project progress.',
                        experience: -15
                    }
                ]
            },
            // Additional Intermediate Scenarios (IDs 21-25)
            {
                id: 21,
                level: 'Intermediate',
                title: 'Cross-team Collaboration',
                description: 'You need to collaborate with another team on a feature. How do you establish an effective working relationship?',
                options: [
                    {
                        text: 'Set up an initial meeting to align on goals, establish communication channels, and define roles and responsibilities',
                        outcome: 'Perfect! This creates clear expectations and structures for collaboration.',
                        experience: 20,
                        tool: 'Cross-team Coordination'
                    },
                    {
                        text: 'Send a detailed email explaining what you need them to do',
                        outcome: 'One-way communication doesn\'t foster true collaboration or shared ownership.',
                        experience: -10
                    },
                    {
                        text: 'Let your team lead handle the collaboration details',
                        outcome: 'Being proactive in cross-team relationships is a valuable professional skill.',
                        experience: -15
                    },
                    {
                        text: 'Work independently as much as possible to minimize the need for collaboration',
                        outcome: 'Avoiding necessary collaboration can lead to misalignment and integration issues.',
                        experience: -5
                    }
                ]
            },
            {
                id: 22,
                level: 'Intermediate',
                title: 'Presenting Technical Data',
                description: 'You need to present test results to a mixed audience of technical and non-technical stakeholders. How do you approach this?',
                options: [
                    {
                        text: 'Create a layered presentation with executive summary, business impacts, and technical details as supporting information',
                        outcome: 'Excellent! This serves various audience needs while keeping everyone engaged.',
                        experience: 20,
                        tool: 'Data Presentation'
                    },
                    {
                        text: 'Focus entirely on the technical details as they\'re the most important part',
                        outcome: 'This approach may lose the attention of non-technical stakeholders who need business context.',
                        experience: -10
                    },
                    {
                        text: 'Skip the technical details entirely to keep things simple',
                        outcome: 'Technical stakeholders need the detailed information to make informed decisions.',
                        experience: -15
                    },
                    {
                        text: 'Create separate presentations for technical and non-technical audiences',
                        outcome: 'While this can work, it may lead to information silos and inconsistent messaging.',
                        experience: -5
                    }
                ]
            },
            {
                id: 23,
                level: 'Intermediate',
                title: 'Process Improvement Suggestion',
                description: 'You\'ve identified a way to improve the testing process. How should you communicate this to the team?',
                options: [
                    {
                        text: 'Document the current pain points, your proposed solution with benefits, and request a meeting to discuss implementation',
                        outcome: 'Perfect! This provides context, a solution, and opens a collaborative discussion.',
                        experience: 20,
                        tool: 'Process Improvement'
                    },
                    {
                        text: 'Implement the changes yourself to demonstrate their effectiveness',
                        outcome: 'Process changes should involve stakeholder input and agreement before implementation.',
                        experience: -15
                    },
                    {
                        text: 'Mention your idea casually in a team meeting to gauge interest',
                        outcome: 'While getting initial feedback is good, a more structured approach would be more effective.',
                        experience: -5
                    },
                    {
                        text: 'Send a detailed email outlining all the problems with the current process',
                        outcome: 'Focusing only on problems without solutions can seem like complaining rather than constructive feedback.',
                        experience: -10
                    }
                ]
            },
            {
                id: 24,
                level: 'Intermediate',
                title: 'Client Communication',
                description: 'A client is frustrated about some delayed features. How do you handle the communication?',
                options: [
                    {
                        text: 'Acknowledge their concerns, explain the situation transparently, provide a revised timeline with confidence, and offer regular updates',
                        outcome: 'Excellent! This addresses the frustration while rebuilding trust.',
                        experience: 20,
                        tool: 'Client Management'
                    },
                    {
                        text: 'Explain all the technical challenges that led to the delay in detail',
                        outcome: 'Too much technical detail may not address the client\'s primary concern about project impact.',
                        experience: -10
                    },
                    {
                        text: 'Promise to deliver everything faster to make up for the delay',
                        outcome: 'Making promises that may be difficult to keep could further damage trust if not fulfilled.',
                        experience: -15
                    },
                    {
                        text: 'Let your project manager handle the client communication',
                        outcome: 'While escalation is sometimes appropriate, being able to handle client communication is a valuable skill.',
                        experience: -5
                    }
                ]
            },
            {
                id: 25,
                level: 'Intermediate',
                title: 'Technical Requirements Gathering',
                description: 'You need to gather technical requirements from different stakeholders. What\'s your approach?',
                options: [
                    {
                        text: 'Prepare a structured template, conduct focused individual interviews, and follow up with a collaborative session to resolve conflicts',
                        outcome: 'Perfect! This ensures comprehensive input while managing different perspectives.',
                        experience: 20,
                        tool: 'Requirements Gathering'
                    },
                    {
                        text: 'Send an email asking everyone to list their requirements',
                        outcome: 'This passive approach may lead to incomplete information and misunderstandings.',
                        experience: -10
                    },
                    {
                        text: 'Call a meeting with all stakeholders to discuss requirements',
                        outcome: 'While meetings are useful, some preparation and structure would make this more effective.',
                        experience: -5
                    },
                    {
                        text: 'Work from existing documentation and make assumptions where information is missing',
                        outcome: 'Assumptions without validation can lead to misaligned expectations and rework.',
                        experience: -15
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Crisis Communication',
                description: 'A critical system issue is affecting multiple teams. How do you manage communication?',
                options: [
                    {
                        text: 'Establish a clear communication channel, provide regular updates, and document the resolution process',
                        outcome: 'Perfect! This ensures effective crisis management.',
                        experience: 25,
                        tool: 'Crisis Management'
                    },
                    {
                        text: 'Send an email about the issue and copy everyone in that\'s involved in the project',
                        outcome: 'Critical issues need ongoing communication with the people who are dealing with the solution and interested parties.',
                        experience: -10
                    },
                    {
                        text: 'Let each team handle their own communications',
                        outcome: 'Coordinated communication is crucial in crises so all interested parties can be updated on progress.',
                        experience: -15
                    },
                    {
                        text: 'Wait until the issue is resolved to communicate with any interested party',
                        outcome: 'Proactive communication is essential in crises and interested parties should be kept up to date with progress.',
                        experience: -20
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Cross-cultural Communication',
                description: 'You\'re working with a global team across different time zones and cultures. How do you ensure effective communication?',
                options: [
                    {
                        text: 'Use clear, inclusive language, provide written follow-ups, and be mindful of cultural differences',
                        outcome: 'Excellent! This promotes inclusive global collaboration.',
                        experience: 25,
                        tool: 'Global Communication'
                    },
                    {
                        text: 'Use your preferred communication style',
                        outcome: 'Adaptive communication for different cultures needs to be addressed in these situations to maintain a professional standard.',
                        experience: -20
                    },
                    {
                        text: 'Communicate with all teams during your normal working hours',
                        outcome: 'Time zones must be considered in global team projects and working hours can sometimes be amended to suite all parties.',
                        experience: -15
                    },
                    {
                        text: 'Use informal language to set a friendly tone and promote trust',
                        outcome: 'A professional tone is important across different cultures to respect a good business standard.',
                        experience: -10
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Technical Presentation',
                description: 'You need to present a complex technical solution to a diverse audience. How do you prepare?',
                options: [
                    {
                        text: 'Create multiple versions of the presentation with appropriate technical depth for different audiences',
                        outcome: 'Perfect! This ensures understanding at all levels.',
                        experience: 25,
                        tool: 'Technical Presentation'
                    },
                    {
                        text: 'Focus on the technical details as these should be understood to move forward',
                        outcome: 'The diverse audience needs to be considered and some may not have a technical background.',
                        experience: -15
                    },
                    {
                        text: 'Keep it very high-level for everyone involved in the presentation',
                        outcome: 'Balanced technical depth is a preferred approach for different audiences.',
                        experience: -10
                    },
                    {
                        text: 'Have someone else take the demonstration that has more experience with presenting',
                        outcome: 'Presentation skills are essential in a testers skill set and practice will develop these skills.',
                        experience: -20
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Knowledge Transfer',
                description: 'You\'re leaving a project and need to ensure knowledge transfer. How do you handle this?',
                options: [
                    {
                        text: 'Create comprehensive documentation, conduct training sessions, and have overlap period with new team',
                        outcome: 'Excellent! This ensures smooth transition.',
                        experience: 25,
                        tool: 'Knowledge Management'
                    },
                    {
                        text: 'Leave detailed comments relating to the code of the system under test within the project',
                        outcome: 'Knowledge transfer needs multiple approaches targeting specific expertise for different team members.',
                        experience: -10
                    },
                    {
                        text: 'Take one handoff meeting for everyone involved in the project',
                        outcome: 'Thorough knowledge transfer takes time and planning different avenues to share this knowledge is required.',
                        experience: -15
                    },
                    {
                        text: 'Let the new team work from previous project communication and emails',
                        outcome: 'A full handoff is crucial for continuity throughout the project.',
                        experience: -20
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Strategic Communication',
                description: 'You need to propose a major technical change that will impact multiple departments. How do you approach this?',
                options: [
                    {
                        text: 'Prepare a detailed proposal with impact analysis, gather feedback from stakeholders, and present a phased implementation plan',
                        outcome: 'Perfect! This demonstrates strategic thinking and stakeholder management.',
                        experience: 25,
                        tool: 'Change Management'
                    },
                    {
                        text: 'Send the proposal by email so everyone can digest the information when they have time',
                        outcome: 'Major changes need comprehensive communication and in most cases meetings to gain sign off from all interested parties.',
                        experience: -15
                    },
                    {
                        text: 'Start implementing the change and inform others at a later date when happy with progress',
                        outcome: 'Any major proposed changes should be communicated and signed off beforehand.',
                        experience: -20
                    },
                    {
                        text: 'Let management handle the communication with all parties',
                        outcome: 'Change proposals and meetings should be driven by the implementors of those proposal.',
                        experience: -10
                    }
                ]
            },
            // Additional Advanced Scenarios (IDs 26-30)
            {
                id: 26,
                level: 'Advanced',
                title: 'Executive Communication',
                description: 'You need to present test results and quality metrics to executive leadership. How do you approach this?',
                options: [
                    {
                        text: 'Focus on business impact, provide clear visualizations, highlight key risks and mitigation plans, and prepare concise answers to potential questions',
                        outcome: 'Excellent! This aligns technical information with executive concerns.',
                        experience: 25,
                        tool: 'Executive Communication'
                    },
                    {
                        text: 'Present detailed test reports showing all the tests conducted and their results',
                        outcome: 'Executives typically need higher-level information focused on business outcomes rather than technical details.',
                        experience: -15
                    },
                    {
                        text: 'Delegate the presentation to your manager who has more experience with leadership',
                        outcome: 'While sometimes appropriate, developing executive communication skills is valuable for career growth.',
                        experience: -20
                    },
                    {
                        text: 'Focus primarily on the challenges and risks to ensure leadership is aware of all potential issues',
                        outcome: 'A balanced approach that includes both successes and challenges provides better context for decision-making.',
                        experience: -10
                    }
                ]
            },
            {
                id: 27,
                level: 'Advanced',
                title: 'Communication Strategy',
                description: 'You\'re leading a major quality initiative that will span 12 months. How do you develop a communication strategy?',
                options: [
                    {
                        text: 'Map stakeholders with their information needs, create a multi-channel approach with regular touchpoints, and plan for both push and pull communication methods',
                        outcome: 'Perfect! This creates a comprehensive approach tailored to different stakeholders.',
                        experience: 25,
                        tool: 'Communication Planning'
                    },
                    {
                        text: 'Create a monthly newsletter that will update everyone on progress',
                        outcome: 'While regular updates are good, a one-size-fits-all approach may not meet all stakeholder needs.',
                        experience: -10
                    },
                    {
                        text: 'Plan to communicate major milestones as they are achieved',
                        outcome: 'Strategic communication should be proactive and regular, not just milestone-driven.',
                        experience: -15
                    },
                    {
                        text: 'Let each team member communicate with their respective departments',
                        outcome: 'Without coordination, messaging may become inconsistent and fragmented.',
                        experience: -20
                    }
                ]
            },
            {
                id: 28,
                level: 'Advanced',
                title: 'Negotiating Resources',
                description: 'Your team needs additional resources to maintain quality standards. How do you make the case to leadership?',
                options: [
                    {
                        text: 'Present data showing current constraints, business impact of quality issues, cost-benefit analysis of additional resources, and a phased implementation plan',
                        outcome: 'Excellent! This provides a compelling business case for the resources.',
                        experience: 25,
                        tool: 'Resource Negotiation'
                    },
                    {
                        text: 'Explain that the team is overworked and needs more help to get everything done',
                        outcome: 'Emotional appeals without data are less effective for resource allocation decisions.',
                        experience: -15
                    },
                    {
                        text: 'Point out that other similar teams have more resources allocated to them',
                        outcome: 'Comparisons without context may not address the specific business need for your team\'s resources.',
                        experience: -20
                    },
                    {
                        text: 'Wait until a major quality issue occurs to demonstrate the need for more resources',
                        outcome: 'Proactive planning is better than reactive responses after problems occur.',
                        experience: -10
                    }
                ]
            },
            {
                id: 29,
                level: 'Advanced',
                title: 'Interdepartmental Conflict',
                description: 'There\'s an ongoing conflict between the QA and development teams about quality processes. How do you address this?',
                options: [
                    {
                        text: 'Facilitate a structured workshop to identify root causes, establish shared goals, and develop collaborative solutions that meet both teams\' needs',
                        outcome: 'Perfect! This addresses the underlying issues and builds collaboration.',
                        experience: 25,
                        tool: 'Conflict Mediation'
                    },
                    {
                        text: 'Escalate the issue to senior management to make a final decision',
                        outcome: 'Escalation before attempting resolution may create additional tensions and doesn\'t build team relationships.',
                        experience: -15
                    },
                    {
                        text: 'Create stricter processes that clearly define each team\'s responsibilities',
                        outcome: 'Adding more rigid processes without addressing the underlying conflict may increase tensions.',
                        experience: -20
                    },
                    {
                        text: 'Have separate meetings with each team to hear their concerns',
                        outcome: 'While understanding perspectives is important, ultimately the teams need to work together toward a solution.',
                        experience: -10
                    }
                ]
            },
            {
                id: 30,
                level: 'Advanced',
                title: 'Communicating Test Strategy',
                description: 'You\'ve developed a new risk-based testing strategy. How do you communicate it to ensure adoption across the organization?',
                options: [
                    {
                        text: 'Develop tailored presentations for different audiences, create practical guidelines with examples, offer training sessions, and identify champions in each team',
                        outcome: 'Excellent! This multi-faceted approach drives understanding and adoption.',
                        experience: 25,
                        tool: 'Change Implementation'
                    },
                    {
                        text: 'Send a comprehensive document explaining the new strategy in detail',
                        outcome: 'Documentation alone rarely drives significant change in practices.',
                        experience: -15
                    },
                    {
                        text: 'Announce the new strategy in a company-wide meeting',
                        outcome: 'A single announcement without follow-up support is unlikely to lead to meaningful adoption.',
                        experience: -20
                    },
                    {
                        text: 'Implement the strategy in your team first and let others adopt it when they see the benefits',
                        outcome: 'While demonstration can help, a more active approach to organizational change is typically needed.',
                        experience: -10
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
                }
            }

            // Show outcome screen and update display with answer outcome
            this.displayOutcome(selectedAnswer);

            // Update progress display
            this.updateProgress();
        } catch (error) {
            this.showError('Failed to save your answer. Please try again.');
        } finally {
            this.isLoading = false;
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    }

    nextScenario() {
        try {
            
            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
            }
            
            // Increment current scenario if not done in handleAnswer
            if (this.player && typeof this.player.currentScenario === 'number') {
                this.player.currentScenario++;
            }
            
            // IMPORTANT: Get actual DOM elements directly
            const outcomeScreen = document.getElementById('outcome-screen');
            const gameScreen = document.getElementById('game-screen');
            
            // Hide outcome screen using multiple approaches to ensure it works
            if (outcomeScreen) {
                outcomeScreen.classList.add('hidden');
                outcomeScreen.style.display = 'none';
            }
            
            // Show game screen using multiple approaches to ensure it works
            if (gameScreen) {
                gameScreen.classList.remove('hidden');
                gameScreen.style.display = 'block';
            }
            
            // Display the next scenario
        this.displayScenario();
            
            // Re-initialize event listeners for the new question
            this.initializeEventListeners();
            
            // Force a layout refresh
            window.setTimeout(() => {
                if (gameScreen) {
                    gameScreen.style.display = 'none';
                    window.setTimeout(() => {
                        gameScreen.style.display = 'block';
                    }, 10);
                }
            }, 10);
        } catch (error) {
            this.showError('An error occurred while loading the next question.');
        }
    }

    displayOutcome(selectedAnswer) {
        if (!selectedAnswer) {
            return;
        }

        try {
            const currentScenarios = this.getCurrentScenarios();
            if (!currentScenarios || !this.player || this.player.currentScenario === undefined) {
                return;
            }
            
            const scenario = currentScenarios[this.player.currentScenario];
            if (!scenario) {
                return;
            }
            
            const earnedXP = selectedAnswer.experience || 0;
            
            // Find the max possible XP for this scenario
            const maxXP = Math.max(...scenario.options.map(o => o.experience || 0));
            const isCorrect = selectedAnswer.isCorrect || (earnedXP === maxXP);
            
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
            
            // Clear any existing button event listeners by recreating the content
            const outcomeContent = outcomeScreen.querySelector('.outcome-content');
            if (outcomeContent) {
                // Create fresh HTML content
                outcomeContent.innerHTML = `
                    <h3>${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                    <p>${selectedAnswer.outcome || ''}</p>
                    <p class="result">${isCorrect ? 'Correct answer!' : 'Try again next time.'}</p>
                    <button id="continue-btn" class="submit-button">Continue</button>
                `;
                
                // Immediately add event listener to the new button
                const continueBtn = outcomeContent.querySelector('#continue-btn');
                if (continueBtn) {
                    continueBtn.addEventListener('click', () => {
                        this.nextScenario();
                    });
                }
            } else {
                // If no outcomeContent found, try individual elements as fallback
                
                // Update individual elements
                const outcomeText = document.getElementById('outcome-text');
                const resultText = document.getElementById('result-text');
                
                if (outcomeText) {
                    outcomeText.textContent = selectedAnswer.outcome || '';
                }
                
                if (resultText) {
                    resultText.textContent = isCorrect ? 'Correct!' : 'Incorrect';
                    resultText.className = isCorrect ? 'correct' : 'incorrect';
                }
                
                // Ensure we have a continue button and it has the right event listener
                const continueBtn = document.getElementById('continue-btn');
                if (!continueBtn) {
                    // Try to create a continue button if it doesn't exist
                    const outcomeActions = document.querySelector('.outcome-actions');
                    if (outcomeActions) {
                        outcomeActions.innerHTML = '<button id="continue-btn" class="submit-button">Continue</button>';
                    }
                }
                
                // Add event listener to the continue button (whether it existed or we created it)
                const newContinueBtn = document.getElementById('continue-btn');
                if (newContinueBtn) {
                    // Remove any existing event listeners by cloning and replacing
                    const newBtn = newContinueBtn.cloneNode(true);
                    if (newContinueBtn.parentNode) {
                        newContinueBtn.parentNode.replaceChild(newBtn, newContinueBtn);
                    }
                    
                    // Add fresh event listener
                    newBtn.addEventListener('click', () => {
                        this.nextScenario();
                    });
                }
            }
            
            // Update progress
            this.updateProgress();
        } catch (error) {
            this.showError('An error occurred. Please try again.');
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
            });
            
            // Display the timeout outcome
            this.displayOutcome(timeoutAnswer);
        } catch (error) {
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of communication. You clearly understand the nuances of professional communication and are well-equipped to handle any communication challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your communication skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('daily') || description.includes('daily')) {
            return 'Daily Communication';
        } else if (title.includes('team') || description.includes('team')) {
            return 'Team Collaboration';
        } else if (title.includes('stakeholder') || description.includes('stakeholder')) {
            return 'Stakeholder Management';
        } else if (title.includes('conflict') || description.includes('conflict')) {
            return 'Conflict Resolution';
        } else if (title.includes('remote') || description.includes('remote')) {
            return 'Remote Communication';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Documentation';
        } else if (title.includes('presentation') || description.includes('presentation')) {
            return 'Presentation Skills';
        } else {
            return 'General Communication';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Daily Communication': 'Practice maintaining clear status updates and regular check-ins with team members.',
            'Team Collaboration': 'Focus on active listening and providing constructive feedback in team settings.',
            'Stakeholder Management': 'Work on presenting information clearly and managing expectations effectively.',
            'Conflict Resolution': 'Study conflict resolution techniques and practice diplomatic communication.',
            'Remote Communication': 'Improve virtual communication skills and use of collaboration tools.',
            'Documentation': 'Enhance documentation skills with clear, concise, and well-structured content.',
            'Presentation Skills': 'Practice presenting technical information in a clear and engaging manner.',
            'General Communication': 'Focus on fundamental communication principles and professional etiquette.'
        };

        return recommendations[area] || 'Continue practicing general communication skills.';
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
                }
            } catch (error) {
            }
        } catch (error) {
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
    const quiz = new CommunicationQuiz();
    quiz.startGame();
}); 