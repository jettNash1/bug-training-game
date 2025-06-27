export const initiativeScenarios = {
        // Basic Scenarios (IDs 1-5)
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'New Team Member Support',
                description: 'You notice a new team member looking uncertain about their tasks. What\'s the best initiative to take?',
                options: [
                    {
                        text: 'Proactively offer help and support before they ask',
                        outcome: 'Perfect! Taking initiative to help others shows great team spirit.',
                        experience: 15,
                    },
                    {
                        text: 'Wait for the team member to ask for help as this encourages them to integrate into the team quicker',
                        outcome: 'Initiative means offering support before being asked.',
                        experience: -5
                    },
                    {
                        text: 'Tell their manager they seem to be struggling with their tasks',
                        outcome: 'Direct support is better than escalating immediately.',
                        experience: -10
                    },
                    {
                        text: 'Send them documentation links without context so they can explore solutions for themselves',
                        outcome: 'Personal support is more effective than just sharing resources.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Office Cleanup',
                description: 'After a work social event, the office space is messy and people are leaving. What shows the best initiative?',
                options: [
                    {
                        text: 'Start cleaning up and organising without being asked',
                        outcome: 'Excellent! Taking responsibility for shared spaces shows great initiative.',
                        experience: 15,
                    },
                    {
                        text: 'Leave it for the cleaning staff to fully perform a deep clean',
                        outcome: 'This misses an opportunity to show initiative and responsibility.',
                        experience: -10
                    },
                    {
                        text: 'Ask who is responsible for cleanup, suggesting instruction should be carried out',
                        outcome: 'Initiative means taking action without seeking assignment.',
                        experience: -5
                    },
                    {
                        text: 'Clean up only your own workstation and surrounding area',
                        outcome: 'While helpful, this doesn\'t show full initiative for team needs.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Common Queries',
                description: 'You notice certain questions keep coming up in your team. What\'s the most initiative-driven response?',
                options: [
                    {
                        text: 'Create a FAQ or cheat sheet for the team',
                        outcome: 'Great! Creating resources proactively helps the whole team.',
                        experience: 15,
                    },
                    {
                        text: 'Answer questions as they are queried to promote team interaction',
                        outcome: 'This misses an opportunity to create a lasting solution.',
                        experience: -5
                    },
                    {
                        text: 'Suggest others should create documentation covering the areas of concern',
                        outcome: 'Taking initiative means acting on opportunities yourself.',
                        experience: -10
                    },
                    {
                        text: 'Document solutions to your own frequently asked questions and share these with the team',
                        outcome: 'While helpful, this doesn\'t address team-wide needs.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Project Documentation',
                description: 'You\'re starting a new project and notice the documentation is outdated. What shows the best initiative?',
                options: [
                    {
                        text: 'Let the TDM know that the documentation is outdated and offer to update it',
                        outcome: 'Perfect! Proactively improving documentation helps everyone.',
                        experience: 15,
                    },
                    {
                        text: 'Wait for someone else to update it who has been on the project previously',
                        outcome: 'Initiative means addressing issues when you spot them.',
                        experience: -10
                    },
                    {
                        text: 'Report the outdated documentation to management so they can designate the work required on it',
                        outcome: 'Taking action directly is better than just reporting.',
                        experience: -5
                    },
                    {
                        text: 'Work around the outdated information and continue other testing activities to meet project time lines',
                        outcome: 'This doesn\'t help solve the underlying issue.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Spare Time Usage',
                description: 'You have some spare time during your workday. What shows the best initiative?',
                options: [
                    {
                        text: 'Identify and work on valuable tasks that benefit the team or project',
                        outcome: 'Excellent! Using spare time productively shows great initiative.',
                        experience: 15,
                    },
                    {
                        text: 'Wait for new tasks to be assigned by the project manager',
                        outcome: 'Initiative means finding valuable work without being prompted.',
                        experience: -10
                    },
                    {
                        text: 'Ask colleagues if they need help with any outstanding tasks they might have',
                        outcome: 'While helpful, proactively identifying tasks shows more initiative.',
                        experience: 0
                    },
                    {
                        text: 'Use the time for personal tasks',
                        outcome: 'This misses an opportunity to add value to the team.',
                        experience: -5
                    }
                ]
            },
        ],

        // Intermediate Scenarios (IDs 6-10)
        intermediate: [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Project Handover',
                description: 'You\'re leaving a project tomorrow and new testers are joining. How do you show the best initiative?',
                options: [
                    {
                        text: 'Create comprehensive handover notes and context documentation',
                        outcome: 'Perfect! Proactive knowledge transfer shows excellent initiative.',
                        experience: 20,
                    },
                    {
                        text: 'Answer any questions the testers might have on processes or outstanding tasks',
                        outcome: 'Initiative means preparing resources before they\'re needed.',
                        experience: -15
                    },
                    {
                        text: 'Leave basic notes about current and outstanding tasks for the project',
                        outcome: 'While helpful, this doesn\'t provide full context needed for a handover.',
                        experience: 0
                    },
                    {
                        text: 'Tell them to check existing documentation to familiarise themselves with the project',
                        outcome: 'This doesn\'t help bridge potential knowledge gaps effectively.',
                        experience: -10
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Test Environment Access',
                description: 'You realise you don\'t have access to a required device for testing. What shows the best initiative?',
                options: [
                    {
                        text: 'Proactively identify who has access and arrange coverage early',
                        outcome: 'Excellent! Taking early action to solve access issues shows great initiative.',
                        experience: 20,
                    },
                    {
                        text: 'Wait for the project manager to organise project team access',
                        outcome: 'Initiative means addressing potential blockers early.',
                        experience: -15
                    },
                    {
                        text: 'Skip testing on that device and use a device closest to the required device that you have access to',
                        outcome: 'This avoids rather than solves the problem.',
                        experience: -10
                    },
                    {
                        text: 'Report the access issue and continue with other testing activities',
                        outcome: 'While reporting is good, taking action to solve is better.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Project Information Needs',
                description: 'You need information from the client and have access to client communications. What shows the best initiative?',
                options: [
                    {
                        text: 'Contact the client directly with clear, professional questions',
                        outcome: 'Perfect! Taking initiative to gather needed information directly.',
                        experience: 20,
                    },
                    {
                        text: 'Ask the project manager to contact the client with the requested questions',
                        outcome: 'This creates unnecessary delays when you have direct access.',
                        experience: -15
                    },
                    {
                        text: 'Work around the missing information to keep within project time line deliverables',
                        outcome: 'This could lead to incorrect assumptions and issues.',
                        experience: -10
                    },
                    {
                        text: 'Wait for the next scheduled client meeting to raise any questions regarding the project',
                        outcome: 'Proactive communication is more preferable than waiting as this could cause project bottle necks.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Project Coverage Completion',
                description: 'You\'ve finished main project coverage with time remaining. How do you show the best initiative?',
                options: [
                    {
                        text: 'Review less-tested areas and enhance documentation',
                        outcome: 'Excellent! Using extra time to improve coverage shows great initiative.',
                        experience: 20,
                    },
                    {
                        text: 'Report that you\'ve completed the main coverage of the project and wait for instruction',
                        outcome: 'This could miss opportunities to add value to the project and enhance client relations.',
                        experience: -15
                    },
                    {
                        text: 'Start on any outstanding personal tasks or training courses',
                        outcome: 'Project time should be used for project improvement.',
                        experience: -10
                    },
                    {
                        text: 'Help on other areas of the project when someone asks for your time',
                        outcome: 'Initiative means identifying opportunities without being asked.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'New Project Preparation',
                description: 'You\'re unsold today but have a new project tomorrow. What shows the best initiative?',
                options: [
                    {
                        text: 'Review available project materials and prepare testing environment',
                        outcome: 'Perfect! Preparing ahead shows excellent initiative.',
                        experience: 20,
                    },
                    {
                        text: 'Leave preparation of the upcoming project until the start date as operational details may change',
                        outcome: 'Using available time to prepare shows better initiative regardless of any unknowns in a particular project.',
                        experience: -15
                    },
                    {
                        text: 'Check to see if you have access to the operational project details',
                        outcome: 'While helpful, this misses opportunities for fuller preparation.',
                        experience: 0
                    },
                    {
                        text: 'Ask colleagues for details on the project and what is needed for test execution',
                        outcome: 'Direct research shows more initiative than just asking others.',
                        experience: -5
                    }
                ]
            }
        ],

        // Advanced Scenarios (IDs 11-15)
        advanced: [
            {
                id: 11,
                level: 'Advanced',
                title: 'Post-Release Issue Management',
                description: 'Issues have been found after release during test support. How do you show the highest level of initiative?',
                options: [
                    {
                        text: 'Investigate root cause, document findings, and propose prevention measures',
                        outcome: 'Excellent! Comprehensive problem-solving shows advanced initiative.',
                        experience: 25,     
                    },
                    {
                        text: 'Investigate the immediate issue and report findings to the project manager',
                        outcome: 'Initiative includes preventing future problems and prevention measures should also be explored.',
                        experience: -15
                    },
                    {
                        text: 'Wait for instruction from the team lead or project manager on what course of action to take',
                        outcome: 'Advanced initiative means taking leadership in problem-solving.',
                        experience: -10
                    },
                    {
                        text: 'Document the issues raised and communicate these for others to investigate',
                        outcome: 'While documentation is important, taking action on the actual issues as well is better.',
                        experience: 0
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Project Process Improvement',
                description: 'You\'ve noticed inefficiencies in the current testing process. What shows the highest initiative?',
                options: [
                    {
                        text: 'Document issues, research solutions, and present improvement proposals',
                        outcome: 'Perfect! Taking leadership in process improvement shows advanced initiative.',
                        experience: 25,
                    },
                    {
                        text: 'Raise the issues in the next team meeting for full team feedback',
                        outcome: 'Advanced initiative requires more than just highlighting problems.',
                        experience: -10
                    },
                    {
                        text: 'Work around the inefficiencies as project work can still be completed rather than blocked',
                        outcome: 'This doesn\'t address the underlying issues.',
                        experience: -15
                    },
                    {
                        text: 'Raise the issues with colleagues to see if they have noticed the issues too',
                        outcome: 'While gathering input is good and important, taking action is preferable.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Cross-Team Collaboration',
                description: 'You identify an issue that affects multiple teams. How do you show the most initiative?',
                options: [
                    {
                        text: 'Coordinate with all affected teams and lead resolution efforts',
                        outcome: 'Excellent! Taking leadership in cross-team issues shows advanced initiative.',
                        experience: 25,
                    },
                    {
                        text: 'Report the issue through communication channels to each team separately',
                        outcome: 'This misses an opportunity for coordinated resolution.',
                        experience: -10
                    },
                    {
                        text: 'Focus your team\'s involvement relating to the issue that has been raised',
                        outcome: 'Advanced initiative means addressing the broader impact and involving all affected parties.',
                        experience: -15
                    },
                    {
                        text: 'Wait for the project manager or test lead to coordinate communication of the issue',
                        outcome: 'This could lead to time delays in the project. Showing initiative would be to address the issue with the project manager and suggest coordinating information with all affected parties.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Knowledge Sharing Leadership',
                description: 'You\'ve developed efficient testing methods over time. How do you best show initiative in sharing this knowledge?',
                options: [
                    {
                        text: 'Create comprehensive guides and organise training sessions',
                        outcome: 'Perfect! Proactively sharing knowledge shows advanced initiative.',
                        experience: 25,
                    },
                    {
                        text: 'Share the testing methods and processes when requested to do so',
                        outcome: 'Advanced initiative requires proactively sharing expertise.',
                        experience: -15
                    },
                    {
                        text: 'Keep the methods and processes for personal usage on future projects',
                        outcome: 'Knowledge hoarding doesn\'t help team growth.',
                        experience: -10
                    },
                    {
                        text: 'Mention them in team meetings and stand ups with project needs',
                        outcome: 'Structured knowledge sharing is more effective.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Strategic Project Planning',
                description: 'You notice potential future challenges in a long-term project. How do you show the highest initiative?',
                options: [
                    {
                        text: 'Develop and present a strategic plan to address future challenges',
                        outcome: 'Excellent! Strategic thinking and planning shows advanced initiative.',
                        experience: 25,
                    },
                    {
                        text: 'Wait until the challenges become actual problems and then raise these with the project manager',
                        outcome: 'Advanced initiative requires addressing issues before they occur.',
                        experience: -15
                    },
                    {
                        text: 'Mention the concerns in team meetings without having researched solutions',
                        outcome: 'Initiative includes proposing solutions, not just identifying problems.',
                        experience: -10
                    },
                    {
                        text: 'Add all the concerns to the risk register for thorough risk management',
                        outcome: 'While documentation is good, taking action is also required.',
                        experience: -5
                    }
                ]
            }
    ]
}