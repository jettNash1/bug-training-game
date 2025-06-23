export const communicationScenarios = {
        basic: [
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
                        text: 'Promptly inform your team, manager and the client, explain the cause, and provide an updated timeline',
                        outcome: 'Excellent! This maintains transparency and builds trust. It is important to keep the client informed as they may need to adjust their expectations.',
                        experience: 15,
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
            },
            // New additional scenarios from the guide
            {
                id: 21,
                level: 'Basic',
                title: 'Client Enquiry',
                description: 'How should you respond if you don\'t know the answer to a client\'s question?',
                options: [
                    {
                        text: 'Say you\'re unsure but will find out the answer',
                        outcome: 'Correct! giving incorrect information could lead to accountability issues later.',
                        experience: 15,
                    },
                    {
                        text: 'Provide your best guess to maintain credibility',
                        outcome: 'It can be worse to state an incorrect answer in the moment and then be held accountable for your answer later.',
                        experience: -5
                    },
                    {
                        text: 'Defer to a colleague who might know',
                        outcome: 'While collaboration is valuable, taking personal responsibility for finding answers is the preferred approach.',
                        experience: -10
                    },
                    {
                        text: 'Tell them it\'s outside your area of expertise',
                        outcome: 'Responding with I don\'t know with no follow-up can appear unhelpful.',
                        experience: 0
                    }
                ]
            },
            {
                id: 22,
                level: 'Basic',
                title: 'Duplicate Issue Prevention',
                description: 'What is as an appropriate response when a colleague mentions raising an issue that you know has already been raised in a previous session?',
                options: [
                    {
                        text: 'Simply paste the issue link with no accompanying commentary',
                        outcome: 'If context is missing, it could lead to misunderstandings and be perceived as abrupt',
                        experience: -5
                    },
                    {
                        text: 'Let them know privately to avoid embarrassing them',
                        outcome: 'While being tactful is important, clear communication should be performed in the appropriate channels. Moving the conversation private isn\'t suggested and might not prevent duplicates.',
                        experience: -10
                    },
                    {
                        text: 'Post a friendly reply with context and link to the existing issue',
                        outcome: 'Correct! A friendly, informative approach prevents the duplicate issue ticket from being raised.',
                        experience: 15,
                    },
                    {
                        text: 'Allow them to raise the duplicate ticket as the client will sort it out later',
                        outcome: 'In this instance we\'ve not helped our colleague and the duplicate ticket has been raised and this will likely be picked up on by the client',
                        experience: 0
                    }
                ]
            },
            {
                id: 23,
                level: 'Basic',
                title: 'Communication Characteristics',
                description: 'Which of the following is not a key characteristic of effective communication?',
                options: [
                    {
                        text: 'Being clear is a key characteristic of effective communication',
                        outcome: 'Being clear and easy to understand is a characteristic of effective communication.',
                        experience: -5
                    },
                    {
                        text: 'Being timely is a key characteristic of effective communication',
                        outcome: 'Being timely promotes professionalism and is a characteristic of effective communication.', 
                        experience: -10
                    },
                    {
                        text: 'Being persuasive is a key characteristic of effective communication',
                        outcome: 'Correct! being persuasive is not a characteristic of effective communication. The following characteristics should be observed. Being Clear, Consistent, Relevant, Timely, Honest, Open, and Approachable',
                        experience: 15,
                    },
                    {
                        text: 'Being approachable is a key characteristic of effective communication',
                        outcome: 'Being approachable and friendly, reachable promotes good relationship building and effective communication.',
                        experience: 0
                    }
                ]
            }, 
            {
                id: 24,
                level: 'Basic',
                title: 'Electronic Messaging',
                description: 'What should you do if you feel unsure about the tone of a message you\'ve drafted for a client?',
                options: [
                    {
                        text: 'Ask a peer or project manager to review and provide feedback',
                        outcome: 'Correct! ask a peer or project manager to review and provide feedback. This helps ensure communication maintains the appropriate professional tone.',
                        experience: 15,
                    },
                    {
                        text: 'Send it anyway as overthinking can delay important communications',
                        outcome: 'It is recommended to be cautious about tone, especially in electronic messaging. Sending potentially inappropriate communications could damage client relationships.',
                        experience: -10
                    },
                    {
                        text: 'Add emojis to lighten the tone and make it more friendly',
                        outcome: 'While friendliness is valued, adding emojis should be avoided as it might be seen as unprofessional in certain client communications.',
                        experience: -5
                    },
                    {
                        text: 'Rewrite it to be as formal as possible to ensure professionalism',
                        outcome: 'Communication shouldn\'t be robotic. By keeping client communication professional, this does also not mean being unfriendly or robotic.',
                        experience: 0
                    }
                ]
            },
            {
                id: 25,
                level: 'Basic',
                title: 'Communication Aspects',
                description: 'What aspect of communication is often overlooked but just as important?',
                options: [
                    {
                        text: 'Body language is an aspect of communication that is often overlooked',
                        outcome: 'Correct! this is an aspect that is often overlooked but just as important, our body language says a lot about us, before we even speak.',
                        experience: 15,
                    },
                    {
                        text: 'Email signatures are an aspect of communication that is often overlooked',
                        outcome: 'While email signatures should promote a professional outlook. They are not an integral part of communication.',
                        experience: -10
                    },
                    {
                        text: 'Document formatting is an aspect of communication that is often overlooked',
                        outcome: 'While document formatting might affect clarity, it is not an integral part of communication.',
                        experience: -5
                    },
                    {
                        text: 'Social media presence is an aspect of communication that is often overlooked',
                        outcome: 'Social media presence isn\'t a form of one to one communication.',
                        experience: 0
                    }
                ]
            }
        ],

        // Intermediate Scenarios (IDs 6-10)
        intermediate: [
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
        ],

        // Advanced Scenarios (IDs 11-15)
        advanced: [
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
        ]
} 