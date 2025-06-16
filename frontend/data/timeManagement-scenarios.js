export const timeManagementScenarios = {
    // Basic Scenarios (IDs 1-5)
        basic: [
        {
            id: 1,
            level: 'Basic',
            title: 'Weekly Planning',
            description: 'What\'s the first step in planning your week ahead effectively?',
            options: [
                {
                    text: 'Review your calendar for meetings and prepare for any necessary preparation and wrap-up activities',
                    outcome: 'Perfect! Starting with a calendar review helps structure your week.',
                    experience: 15,
                },
                {
                    text: 'Start working on the first task presented to you within an assigned project',
                    outcome: 'Planning ahead and prioritising is more effective than reactive working.',
                    experience: -5
                },
                {
                    text: 'Wait for daily assignments to be communicated by project managers',
                    outcome: 'Proactive planning is better than waiting for instructions.',
                    experience: -10
                },
                {
                    text: 'Focus on immediate tasks for the days testing activities',
                    outcome: 'Looking ahead helps prevent future bottlenecks within projects.',
                    experience: 0
                }
            ]
        },
        {
            id: 2,
            level: 'Basic',
            title: 'Workspace Organisation',
            description: 'How should you prepare your workspace for efficient testing?',
            options: [
                {
                    text: 'Clean workspace, organised email inbox, pinned relevant channels, and charged devices',
                    outcome: 'Excellent! An organised workspace increases efficiency.',
                    experience: 15,
                },
                {
                    text: 'Keep all channels and tabs open to make sure of quick communication and easy access to everything you need',
                    outcome: 'Too many open items can cause confusion and slow you down.',
                    experience: -5
                },
                {
                    text: 'Start working straight away with open tabs in relation to previous projects for continuity',
                    outcome: 'Current project reparation prevents delays and increases productivity.',
                    experience: -10
                },
                {
                    text: 'Focus on device setup as to not encounter delays with uncharged devices',
                    outcome: 'Complete workspace organisation is more important to mitigate reduction in time management of projects.',
                    experience: 0
                }
            ]
        },
        {
            id: 3,
            level: 'Basic',
            title: 'Project Documentation Review',
            description: 'When should you review project documentation for a new assignment?',
            options: [
                {
                    text: 'This should be done before the first session, using unsold time if needed',
                    outcome: 'Perfect! Early preparation ensures efficient testing.',
                    experience: 15,
                },
                {
                    text: 'During the first test session to work in parallel with test execution',
                    outcome: 'Project review should ideally be done before testing begins to mitigate time constraint issues.',
                    experience: -5
                },
                {
                    text: 'This should be done on an individual basis when issues arise',
                    outcome: 'Proactive review can prevent project issues and save time.',
                    experience: -10
                },
                {
                    text: 'After the first standup meeting as initial stand ups should take minimal time',
                    outcome: 'Documentation should be reviewed before meetings and any related issues raised then.',
                    experience: 0
                }
            ]
        },
        {
            id: 4,
            level: 'Basic',
            title: 'Daily Preparation',
            description: 'What\'s the most important first step in preparing for your day?',
            options: [
                {
                    text: 'Check the resource sheet and review any project changes',
                    outcome: 'Excellent! Resource updates are crucial for daily planning.',
                    experience: 15,
                },
                {
                    text: 'Start testing immediately to make sure project time lines are kept on track',
                    outcome: 'Checking resources first prevents misdirected effort.',
                    experience: -10
                },
                {
                    text: 'Wait for team instructions from project managers',
                    outcome: 'Proactive preparation is preferred to waiting for instruction as project managers may be under resourced.',
                    experience: -5
                },
                {
                    text: 'Review yesterday\'s work to make sure documenting is correctly followed',
                    outcome: 'Current resource status for the project and scope updates are most important when considering the forthcoming day.',
                    experience: 0
                }
            ]
        },
        {
            id: 5,
            level: 'Basic',
            title: 'Meeting Management',
            description: 'How should you handle meetings in your schedule?',
            options: [
                {
                    text: 'Factor in preparation and wrap-up time, not just meeting duration',
                    outcome: 'Perfect! Complete meeting time management includes preparation.',
                    experience: 15,
                },
                {
                    text: 'Schedule back-to-back meetings to keep in the same mindset',
                    outcome: 'Buffer time between meetings is required for mop up and planning. This ensures the best effectiveness to reach meeting goals.',
                    experience: -10
                },
                {
                    text: 'Finish current activities and join at the exact start time of the meeting',
                    outcome: 'Preparation time is required as it ensures more productive meetings.',
                    experience: -5
                },
                {
                    text: 'Focus only on meeting duration when planning schedules',
                    outcome: 'Considering full meeting impact on schedule and meeting content is essential for productivity.',
                    experience: 0
                }
            ]
        },
        // Additional Basic Scenarios from Guide - Time Management & Organisation Additional Questions
        {
            id: 16,
            level: 'Basic',
            title: 'Effective Time Management',
            description: 'Why is effective time management important for Zoonou testers?',
            options: [
                {
                    text: 'As functional testing is sold in blocks of time and clients should get maximum value',
                    outcome: 'Correct! As testers, it is important that you manage your time effectively. This ensures our clients get the most value out of the time they have procured from us.',
                    experience: 15,
                },
                {
                    text: 'To ensure personal career advancement opportunities',
                    outcome: 'While good time management might help with career advancement, this isn\'t a reason in relation to project work and management.',
                    experience: -5
                },
                {
                    text: 'To maximize paid overtime opportunities',
                    outcome: 'This isn\'t a project goal like completing work efficiently within allocated time.',
                    experience: -10
                },
                {
                    text: 'To reduce the need for detailed documentation',
                    outcome: 'Time management doesn\'t reduce documentation needs, in fact, proper documentation is implied to be part of delivering quality work.',
                    experience: 0
                }
            ]
        },
        {
            id: 17,
            level: 'Basic',
            title: 'Ineffective Time Management',
            description: 'Which of the following is identified as a risk of ineffective time management?',
            options: [
                {
                    text: 'Spending too much time on detailed documentation',
                    outcome: 'Detailed documentation is not identified as a risk.',
                    experience: -5
                },
                {
                    text: 'Being overly thorough in testing low-priority areas',
                    outcome: 'While this might be an issue, it\'s not specifically identified as a risk of poor time management.',
                    experience: -10
                },
                {
                    text: 'Having colleagues need to cover your outstanding tasks, leading to frustration',
                    outcome: 'Correct! Your colleagues may be required to cover your outstanding tasks, which could lead to frustration or resentment within the team.',
                    experience: 15,
                },
                {
                    text: 'Discovering too many bugs which delays project completion',
                    outcome: 'Discovering bugs is the purpose of testing, finding too many bugs is not a risk of poor time management.',
                    experience: 0
                }
            ]
        },
        {
            id: 18,
            level: 'Basic',
            title: 'Environment Time Management',
            description: 'What is recommend regarding testing environments and user journeys?',
            options: [
                {
                    text: 'All environments should receive equal testing time regardless of user behaviour.',
                    outcome: 'Prioritising testing based on user behaviour and client priorities, not equal distribution is recommended.',
                    experience: -5
                },
                {
                    text: 'Always test desktop environments first, then mobile environments',
                    outcome: 'Prioritisation should be based on how end users will access the software.', 
                    experience: -10
                },
                {
                    text: 'Prioritise environments and journeys based on how end users will access the software',
                    outcome: 'Correct! for example, if a website is designed for use on tablet devices, prioritise tablet coverage, as issues found here will be of a higher value to the client.',
                    experience: 15,
                },
                {
                    text: 'Follow the script order exactly as written regardless of priorities',
                    outcome: 'Working in a linear fashion from top to bottom of a script or software is usually not the most appropriate approach and prioritising according to project requirements should be followed.',
                    experience: 0
                }
            ]
        },
        {
            id: 19,
            level: 'Basic',
            title: 'Project Time Assessment',
            description: 'How should testers reassess timings during a test session?',
            options: [
                {
                    text: 'Project timings should be assessed throughout the day based on progress and remaining coverage',
                    outcome: 'Correct! It is important to re-assess timings throughout the day based on progress, and keep in mind what is left to cover.',
                    experience: 15,
                },
                {
                    text: 'Project time assessment should be carried out at the end of the day to avoid disrupting workflow',
                    outcome: 'Waiting until the end of the day to re-assess doesn\'t give any time to check if coverage can be met.',
                    experience: -10
                },
                {
                    text: 'Project time assessment should be carried out only when explicitly requested by the Project Manager',
                    outcome: 'Testers should proactively reassess timings and inform project managers in case extra resources are required.',
                    experience: -5
                },
                {
                    text: 'Project time assessment should be carried out according to predetermined intervals set at the beginning of the project',
                    outcome: 'While this could be true for specific projects. Testers should also apply continuous assessment based on actual progress.',
                    experience: 0
                }
            ]
        },
        {
            id: 20,
            level: 'Basic',
            title: 'Time Management Benefit',
            description: 'What is a benefit of good project time management?',
            options: [
                {
                    text: 'Higher levels of productivity are a benefit of good time management',
                    outcome: 'Correct! Productivity levels have proven to increase when good time management of projects are applied.',
                    experience: 15,
                },
                {
                    text: 'A benefit of good time management increases the ability to multitask on multiple projects simultaneously',
                    outcome: 'While this may be helpful in some cases. In general it is recommended to work on one project at a time.',
                    experience: -10
                },
                {
                    text: 'A benefit of good time management results in a reduced need for project documentation',
                    outcome: 'Project documentation should always be complete and full. This should be factored into the project itself.',
                    experience: -5
                },
                {
                    text: 'A benefit of good time management results in guaranteed salary increases',
                    outcome: 'Good project time management should always be observed and not a direct factor in salary increase.',
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
            title: 'Project Timing Estimation',
            description: 'How do you determine appropriate time allocation for test activities?',
            options: [
                {
                    text: 'Review Statement Of Work timings, environment count, software size, and core user journeys',
                    outcome: 'Excellent! A comprehensive review ensures accurate timing.',
                    experience: 20,     
                },
                {
                    text: 'Use a standard default timing for all projects that require test activities',
                    outcome: 'Each project needs their own specific custom time estimation relating to their needs.',
                    experience: -15
                },
                {
                    text: 'Base estimates on previous similar projects that have been worked on',
                    outcome: 'Current project specifics always need to be taken into consideration.',
                    experience: -10
                },
                {
                    text: 'Leave out a scope review when estimating the project timings',
                    outcome: 'Scope review is crucial for timing as it takes into consideration what needs to be tested.',
                    experience: -5
                }
            ]
        },
        {
            id: 7,
            level: 'Intermediate',
            title: 'Team Workload Distribution',
            description: 'How do you divide test tasks among team members?',
            options: [
                {
                    text: 'Consider experience levels, individual paces, and project familiarity',
                    outcome: 'Perfect! Fair distribution considers individual capabilities.',
                    experience: 20,
                },
                {
                    text: 'Divide tasks equally between the team by number',
                    outcome: 'Task division should consider experience levels as some testers may not be familiar with a certain task.',
                    experience: -15
                },
                {
                    text: 'Assign tasks equally taking into consideration fairness of workload',
                    outcome: 'Strategic assignment taking into consideration tester experience ensures efficient testing.',
                    experience: -10
                },
                {
                    text: 'Let team members choose which tasks they want to fulfil within the project',
                    outcome: 'A structured distribution is generally required for the best testing coverage.',
                    experience: -5
                }
            ]
        },
        {
            id: 8,
            level: 'Intermediate',
            title: 'Test Coverage Priorisation',
            description: 'How do you prioritise different areas of testing?',
            options: [
                {
                    text: 'Analyse client priorities, core functions, and user patterns',
                    outcome: 'Excellent! Strategic prioritisation maximizes testing value.',
                    experience: 20,
                },
                {
                    text: 'Test in a linear order to gain as much coverage as possible',
                    outcome: 'Priority-based testing is a more effective use of time management as issues could be missed by testing in a sequential manner.',
                    experience: -15
                },
                {
                    text: 'Focus on easy areas first to gain as much coverage as possible',
                    outcome: 'Prioritisation should be based on importance to the system and client, rather than ease first.',
                    experience: -10
                },
                {
                    text: 'Follow personal preferences based on experience of previous similar test cases',
                    outcome: 'Client needs should drive priorities rather than individual preferences.',
                    experience: -5
                }
            ]
        },
        {
            id: 9,
            level: 'Intermediate',
            title: 'Progress Monitoring',
            description: 'How do you track testing progress throughout the day?',
            options: [
                {
                    text: 'Regularly assess coverage, adjust timings, and communicate any concerns',
                    outcome: 'Perfect! Active monitoring enables timely adjustments.',
                    experience: 20,
                },
                {
                    text: 'Wait until end of day before reporting on any progress',
                    outcome: 'Regular progress checks can prevent delays to testing timelines.',
                    experience: -15
                },
                {
                    text: 'Only track project progress on request and report findings when asked',
                    outcome: 'Proactive monitoring is essential as it can ensure issues to resource or testing can be mitigated.',
                    experience: -10
                },
                {
                    text: 'Focus on speed over progress tracking to make sure project timelines are met',
                    outcome: 'Speed of test activities should be balanced with progress monitoring.',
                    experience: -5
                }
            ]
        },
        {
            id: 10,
            level: 'Intermediate',
            title: 'Environment Testing Order',
            description: 'How do you manage time across multiple test environments?',
            options: [
                {
                    text: 'Start with primary environment, then adjust timing for others based on global issues',
                    outcome: 'Excellent! This is an efficient environment coverage strategy.',
                    experience: 20,
                },
                {
                    text: 'Test all environments equally in regards to time spent on testing activities',
                    outcome: 'Timings should be adapted based on previous findings within the project.',
                    experience: -15
                },
                {
                    text: 'Use random environment order approach to gain as much coverage as possible',
                    outcome: 'A strategic order approach maximizes efficiency and coverage.',
                    experience: -10
                },
                {
                    text: 'Leave secondary environments as long as primary environments are covered',
                    outcome: 'All requested environments need appropriate coverage according to the project needs.',
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
            title: 'Multiple Project Management',
            description: 'How do you manage time when working on multiple projects in a week?',
            options: [
                {
                    text: 'Review all project requirements, create daily schedules, maintain clear separation',
                    outcome: 'Perfect! This is a good structured approach to multiple projects.',
                    experience: 25,
                },
                {
                    text: 'Handle projects as and when they are requested',
                    outcome: 'Advance planning is preferred for multiple projects to prepare time management and resources.',
                    experience: -15
                },
                {
                    text: 'Focus on one project at a time until completion',
                    outcome: 'Balance is needed across all projects and priority tests.',
                    experience: -10
                },
                {
                    text: 'Multitask between projects simultaneously to make sure project timelines can be met',
                    outcome: 'Clear project separation is more effective.',
                    experience: -5
                }
            ]
        },
        {
            id: 12,
            level: 'Advanced',
            title: 'Risk Management',
            description: 'How do you handle potential timing risks in a project?',
            options: [
                {
                    text: 'Identify risks early, implement mitigation steps, communicate with the project manager',
                    outcome: 'Excellent! Proactive risk management saves time.',
                    experience: 25,
                },
                {
                    text: 'Deal with time risks as they arise during test activities',
                    outcome: 'Early risk identification and planning prevents delays further along in the testing process.',
                    experience: -15
                },
                {
                    text: 'Leave investigation of minor risks to project timings',
                    outcome: 'All risks need appropriate attention, reporting and mitigating.',
                    experience: -10
                },
                {
                    text: 'Handle timing risks to the project without reporting them',
                    outcome: 'Risk communication is an important and essential process to mitigate any issues that might cause project slow down.',
                    experience: -5
                }
            ]
        },
        {
            id: 13,
            level: 'Advanced',
            title: 'Late Stage Issues',
            description: 'You discover major issues late in the testing window. How do you manage this?',
            options: [
                {
                    text: 'Immediately notify the project manager, document thoroughly, reprioritise remaining time',
                    outcome: 'Perfect! A quick response and clear communication is essential to mitigating any delays.',
                    experience: 25,
                },
                {
                    text: 'Continue with the tasks within the original project plan',
                    outcome: 'Major issues need immediate attention, no matter at what point the project is up to.',
                    experience: -15
                },
                {
                    text: 'Rush through the remaining required tests to achieve as much coverage as possible',
                    outcome: 'Tests should not be rushed in order to maintain quality, and reprioritising should continue in relation to the issues raised.',
                    experience: -10
                },
                {
                    text: 'Skip documentation on project, and test script reporting for speed',
                    outcome: 'Proper documentation is essential as it give stakeholders critical information on project progress.',
                    experience: -5
                }
            ]
        },
        {
            id: 14,
            level: 'Advanced',
            title: 'Resource Changes',
            description: 'How do you handle unexpected resource sheet changes?',
            options: [
                {
                    text: 'Review changes immediately, adjust plans, ensure smooth transitions',
                    outcome: 'Excellent! Adaptable planning maintains efficiency.',
                    experience: 25,
                },
                {
                    text: 'Continue with the current tasks assigned to completion',
                    outcome: 'Adaptation to changes required to reassess priorities.',
                    experience: -15
                },
                {
                    text: 'Wait for instructions from stakeholders as to which tasks need reprioritising',
                    outcome: 'A proactive response to changes is required to decrease the impact of major resource changes.',
                    experience: -10
                },
                {
                    text: 'Leave minor changes to resources and continue with priority tasks set out in previous planning',
                    outcome: 'All resource changes need attention in order to reassess priorities.',
                    experience: -5
                }
            ]
        },
        {
            id: 15,
            level: 'Advanced',
            title: 'Long-Term Planning',
            description: 'How do you maintain effective time management on long-term projects?',
            options: [
                {
                    text: 'Establish sustainable routines, regularly review efficiency, adapt processes as needed',
                    outcome: 'Perfect! This is sustainable approach to long-term projects.',
                    experience: 25,
                },
                {
                    text: 'Keep same routine throughout the project to maintain consistency',
                    outcome: 'Regular process reviews improve efficiency.',
                    experience: -15
                },
                {
                    text: 'Focus only on daily tasks and to ensure quick manageable goals',
                    outcome: 'A long-term view required for sustainability of a project.',
                    experience: -10
                },
                {
                    text: 'Change processes frequently to gain as much coverage as possible',
                    outcome: 'A balanced adaptation over a long period is better than frequent changes.',
                    experience: -5
                }
            ]
        }
    ]
}