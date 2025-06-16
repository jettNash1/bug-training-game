export const riskAnalysisScenarios = {
        // Basic Scenarios (IDs 1-5)
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Risk Severity Assessment',
                description: 'How do you determine the severity of a risk?',
                options: [
                    {
                        text: 'Consider number of affected parties, duration of effect, likelihood, and impact',
                        outcome: 'Perfect! Comprehensive risk severity assessment considers multiple factors.',
                        experience: 15,
                        isCorrect: true,
                    },
                    {
                        text: 'Consider immediate impact on the system under test',
                        outcome: 'Whilst impact is important risk severity needs to take in broader consideration, like risk likelihood and impact on the user.',
                        experience: -5,
                        isCorrect: false
                    },
                    {
                        text: 'Consider the developers feedback and base severity on their expertise on the system under test',
                        outcome: 'Whilst a developers input can be important, the severity of a risk requires a more measured approach taking into consideration a range of factors.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Consider number of affected parties, duration of effect and impact',
                        outcome: 'While all these factors will form a structured assessment of the severity of a risk. Likelihood of the issue occurring is also a main factor that can\'t be left out.',
                        experience: 0,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Risk Likelihood Evaluation',
                description: 'What factors should you consider when evaluating the likelihood of a risk?',
                options: [
                    {
                        text: 'Historical occurrence, interaction frequency, known triggers, and prior experience',
                        outcome: 'Excellent! Multiple factors help determine likelihood accurately.',
                        experience: 15,
                    },
                    {
                        text: 'Check prior occurrences of the same type of issue being raised',
                        outcome: 'All factors that affect risk likelihood which include frequency and triggers should be taken into consideration.',
                        experience: -5
                    },
                    {
                        text: 'Factor into the risk analysis report that all risks are equally likely',
                        outcome: 'Different risks have different likelihoods. Therefore, they require different overall risk level and prioritisation',
                        experience: -10
                    },
                    {
                        text: 'Take into consideration the current environment conditions',
                        outcome: 'Historical data should also be considered when determining risk likelihood. This type of data from supported environment types helps to evaluate the accuracy of a risk.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Morning Risk Assessment',
                description: 'What\'s the first step in your morning risk routine?',
                options: [
                    {
                        text: 'Review time availability, device readiness, and project understanding',
                        outcome: 'Perfect! Morning assessment prevents day-long issues.',
                        experience: 15,
                    },
                    {
                        text: 'Commence functional testing activates straight away to make sure coverage within time constraints are sufficiently met',
                        outcome: 'Risk assessment should always precede work on the system under test as there could be potential risks that may block testing activities. These risks would need communicating and resolving',
                        experience: -10
                    },
                    {
                        text: 'Wait for the morning project meeting so that the project manager can relay any project risks',
                        outcome: 'Proactive morning checks are recommended to potentially prevent problems in project readiness and to convey potential risk to project managers or clients that may block testing activities.',
                        experience: -5
                    },
                    {
                        text: 'Check emails for any information regarding the project and the system under test',
                        outcome: 'Whilst important, a comprehensive morning review of any supported client documentation including the operational project details is required.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Risk Calculation',
                description: 'How do you calculate the overall risk level?',
                options: [
                    {
                        text: 'Multiply severity by likelihood ratings',
                        outcome: 'Excellent! This calculation provides accurate risk levels.',
                        experience: 15,
                    },
                    {
                        text: 'Consider the severity of the issue and base the overall risk on this',
                        outcome: 'Both severity and likelihood should be taken into consideration. If the severity of a risk is high but the likelihood of this occurring is extremely low. Then overall severity would be reduced',
                        experience: -10
                    },
                    {
                        text: 'Consider the likelihood of the issue occurring and base overall risk on this',
                        outcome: 'Severity of the risk must also be factored in. If the likelihood of a risk is high but the severity of this risk is extremely low. Then overall severity would be reduced',
                        experience: -5
                    },
                    {
                        text: 'Add severity and likelihood ratings to gain the overall risk calculation',
                        outcome: 'Multiplication of severity and likelihood is the formula used for overall risk level.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Pre-Lunch Risk Check',
                description: 'What should you assess in your pre-lunch risk routine?',
                options: [
                    {
                        text: 'Progress rate, device status, new client information, and blocking issues',
                        outcome: 'Perfect! Mid-day check helps maintain progress.',
                        experience: 15,
                    },
                    {
                        text: 'Check the time remaining in the day for testing activities to factor in test coverage',
                        outcome: 'Whilst this is important to keep test coverage on track. Multiple factors need to be taken into consideration including device status and any new project information.',
                        experience: -5
                    },
                    {
                        text: 'Conduct a thorough risk assessment at the beginning of the day so updated assessments are not required',
                        outcome: 'Regular checks maintain efficiency as progress may be hindered for a number of factors including blocking issues or client requests.',
                        experience: -10
                    },
                    {
                        text: 'Report an updated risk assessment to the project manager towards the end of the days testing',
                        outcome: 'Mid-day assessments are essential as they allow for adjustments within the days testing activities.',
                        experience: 0
                    }
                ]
            },
            // Additional Basic Scenarios from Guide - Risk Analysis Additional Questions
            {
                id: 16,
                level: 'Basic',
                title: 'Risk Identification Focus',
                description: 'What is the primary focus of risk identification?',
                options: [
                    {
                        text: 'Questions should be the primary focus of risk identification',
                        outcome: 'Correct! Questioning the who, what, why, and where of activities to identify potential issues ahead of time should be the primary focus.',
                        experience: 15,
                    },
                    {
                        text: 'Documentation should be the primary focus of risk identification',
                        outcome: 'While documentation is important throughout the process, it\'s not identified as the primary focus of risk identification.',
                        experience: -5
                    },
                    {
                        text: 'Solutions should be the primary focus of risk identification',
                        outcome: 'Solutions are part of risk management rather than risk identification.',
                        experience: -10
                    },
                    {
                        text: 'Budgeting should be the primary focus of risk identification',
                        outcome: 'While budget considerations may appear in risk analysis, this is not the primary focus of risk identification.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Risk Severity Estimation',
                description: 'Which of the following is not a factor to consider when estimating the severity of a risk?',
                options: [
                    {
                        text: 'How many people or parties will be affected by the risk',
                        outcome: 'This is a factor for severity assessment.',
                        experience: -5
                    },
                    {
                        text: 'How long the effect of the risk lasts',
                        outcome: 'The duration of impact is specifically considered as a severity consideration.',
                        experience: -10
                    },
                    {
                        text: 'The history of the risk occurring',
                        outcome: 'Correct! The history of the risk occurring is a factor to consider when estimating the likelihood of a risk, not the severity.',
                        experience: 15,
                    },
                    {
                        text: 'The impact when the risk occurs',
                        outcome: 'This is directly related to severity assessment.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Likelihood Scale',
                description: 'What is the highest level on the Likelihood Scale according to the guide?',
                options: [
                    {
                        text: 'Extremely Likely.',
                        outcome: 'This term doesn\'t appear on the scale in the guide.',
                        experience: -5
                    },
                    {
                        text: 'Almost Certain',
                        outcome: 'This is level 4 on the scale, not the highest level.', 
                        experience: -10
                    },
                    {
                        text: 'Certain',
                        outcome: 'Correct! according to the Likelihood Scale in the guide, the highest level (5) is defined as Certain. This represents risks that are guaranteed to occur.',
                        experience: 15,
                    },
                    {
                        text: 'Inevitable',
                        outcome: 'This term doesn\'t appear on the scale in the guide.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Risk Assessment Checkpoint',
                description: 'What is one of the key checkpoints for risk assessment during a tester\'s daily routine?',
                options: [
                    {
                        text: 'The start of the workday should be determined as key checkpoint for risk assessment',
                        outcome: 'Correct! The start of each day is a great time to start assessing project risk as this is a primary operation that allow for greater success throughout a day.',
                        experience: 15,
                    },
                    {
                        text: 'The end of each test case should be determined as key checkpoint for risk assessment',
                        outcome: 'While ongoing assessment is important, a specific checkpoint at every test case could prove too time consuming.',
                        experience: -10
                    },
                    {
                        text: 'After client meetings should be determined as key checkpoint for risk assessment',
                        outcome: 'While client interactions may trigger risk assessments. This is not a standard checkpoint for ongoing projects',
                        experience: -5
                    },
                    {
                        text: 'After each deployment should be determined as key checkpoint for risk assessment',
                        outcome: 'Deployments may trigger risk assessments. This is not a standard checkpoint for ongoing projects.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Project Scoping Risk Assessment',
                description: 'During the Scoping/Presale stage, who has responsibility for risk assessment according to the guide?',
                options: [
                    {
                        text: 'Delivery Manager, Head of Service or Project Manager if involving in scoping should be responsible for the risk assessment',
                        outcome: 'Correct! If involved in scoping the responsibility belongs to Delivery Manager, Head of Service or Project Manager.',
                        experience: 15,
                    },
                    {
                        text: 'Test analysts only should be responsible for the risk assessment',
                        outcome: 'While a test analyst may be asked for information about risk assessments. They should not be the only person responsible.',
                        experience: -10
                    },
                    {
                        text: 'The project manager only should be responsible for the risk assessment',
                        outcome: 'While project managers might be involved, they\'re not the only responsible parties.',
                        experience: -5
                    },
                    {
                        text: 'The client representative and delivery manager should be responsible for the risk assessment',
                        outcome: 'The client representative should not be responsible for this stage in the process.',
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
                title: 'Project Timeline Risk',
                description: 'How do you assess timeline-related risks during project scoping?',
                options: [
                    {
                        text: 'Evaluate resource availability, information gathering time, fix windows, and timeline flexibility',
                        outcome: 'Excellent! Comprehensive timeline risk assessment.',
                        experience: 20,     
                    },
                    {
                        text: 'Check the duration of time allocated for functional test activities on the system under test',
                        outcome: 'Multiple timeline factors need to be taken into consideration including planning and resource availability.',
                        experience: -15
                    },
                    {
                        text: 'Assume timelines are in a set format as delivered by the client and all activities are to be planned in relation to this',
                        outcome: 'Timeline flexibility requires assessment for potential deviations and additional coverage if required.',
                        experience: -10
                    },
                    {
                        text: 'Take resource availability into consideration to help with a set project timeline',
                        outcome: 'While this is important other factors should be taken into consideration including flexibility and planning time.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Documentation Risk',
                description: 'What documentation risks should be assessed before testing?',
                options: [
                    {
                        text: 'Check documentation availability, detail level, business rules, and acceptance criteria',
                        outcome: 'Perfect! Documentation completeness is crucial.',
                        experience: 20, 
                    },
                    {
                        text: 'Check if documentation has been supplied by the client to form operational project details',
                        outcome: 'Documentation content also needs reviewing to determine quality and potential issues that may prevent testing activities.',
                        experience: -15
                    },
                    {
                        text: 'Commence testing activities without documentation presented by the client',
                        outcome: 'Whilst in some respects this can be achieved including exploratory testing to a certain degree. Documentation reviews prevent potential blocking issues to testing activities.',
                        experience: -10
                    },
                    {
                        text: 'Ensure front end URL\'s have been supplied by the client and can be accessed',
                        outcome: 'Whilst this is important, there are many other factors that need to be taken into consideration. Including, bug tracking details and access credentials or any areas out of scope.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Environment Access Risk',
                description: 'How do you assess risks related to test environment access?',
                options: [
                    {
                        text: 'Verify access methods, specific requirements, user permissions, and environment stability',
                        outcome: 'Excellent! Complete access risk assessment.',
                        experience: 20, 
                    },
                    {
                        text: 'Check a user can login can login to the environment specified by the URL or application provided by the client',
                        outcome: 'This behaviour is important. However, other factors need to be taken into consideration including permissions for multiple users.',
                        experience: -15
                    },
                    {
                        text: 'Assess access methods, specific requirements and user permissions',
                        outcome: 'Whilst all these factors are essential, environment stability needs to be taken into consideration. This could include actual environment completeness and any server downtime for development activities.',
                        experience: -10
                    },
                    {
                        text: 'Assess access methods, user permissions, and environment stability',
                        outcome: 'Whilst all these factors are essential, specific client requirements also needs to be taken into consideration. This could include version control and which versions/URL\'s should be under test',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Multi-User Impact',
                description: 'How do you assess risks of multiple users testing simultaneously?',
                options: [
                    {
                        text: 'Evaluate platform performance impact, potential conflicts, and workflow interruptions',
                        outcome: 'Perfect! Multi-user impact needs thorough assessment.',
                        experience: 20, 
                    },
                    {
                        text: 'Assess the impact of logging into the environment sequentially with different users',
                        outcome: 'This type of test should be carried out with multiple users simultaneously to evaluate potential performance issues.',
                        experience: -15
                    },
                    {
                        text: 'Assess the impact of logging into an environment with the same user on different tabs on the same browser type',
                        outcome: 'Whilst this is a valid test, logging into the environment with the same user on multiple devices should be taken into consideration.',
                        experience: -10
                    },
                    {
                        text: 'Assess the impact of logging in and out with the same user on multiple occasions',
                        outcome: 'Whilst this is a valid test, it doesn\'t assess the impact of multiple users access the system under test at the same time.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Client Communication Risk',
                description: 'How do you assess risks in client communication channels?',
                options: [
                    {
                        text: 'Establish urgent contact methods, verify response times, and ensure clear escalation paths',
                        outcome: 'Excellent! Communication channel assessment.',
                        experience: 20, 
                    },
                    {
                        text: 'Promote email as the one communication channel',
                        outcome: 'Multiple client supported communication channels may be required. Also, response times need to be assessed to realise the best and quickest form of communication.',
                        experience: -15
                    },
                    {
                        text: 'Address communication issues when they arise during testing activities',
                        outcome: 'Proactive planning is required to maintain effective communication with the client throughout testing activities.',
                        experience: -10
                    },
                    {
                        text: 'Establish contact methods and verify response times with the client and project manager',
                        outcome: 'While these factors are important, escalation paths for any urgent issues also need to be verified for clarity and resolution of any points of failure.',
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
                title: 'High-Bug Environment',
                description: 'How do you assess risks when encountering a bug-heavy environment?',
                options: [
                    {
                        text: 'Evaluate impact on testing time, triage requirements, and need for additional verification',
                        outcome: 'Perfect! Comprehensive bug impact assessment.',
                        experience: 25, 
                    },
                    {
                        text: 'Continue following the planned test script and report findings at the end of the day to the project manager',
                        outcome: 'A high bug count generally needs a strategy adjustment involving certain coverage areas or resource availability which should also be relayed to the project manager.',
                        experience: -15
                    },
                    {
                        text: 'Reduce coverage of all areas to meet time constraints',
                        outcome: 'All areas need appropriate coverage. Any potential reduction in agreed coverage should be reported and agreed with the project manager.',
                        experience: -10
                    },
                    {
                        text: 'Document major bugs and build a backlog of notes for any minor issues',
                        outcome: 'All issues found need proper documentation and reporting. Progress should also be reported to the project manager for assessment of additional resources',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Resource Change Risk',
                description: 'How do you handle risks from unexpected resource changes?',
                options: [
                    {
                        text: 'Assess impact on timeline, coverage, and team capability, then adjust plans accordingly',
                        outcome: 'Excellent! Resource change impact analysis.',
                        experience: 25, 
                    },
                    {
                        text: 'Continue with the original testing activities set out in planning and inform the project manager of progress at the end of the day',
                        outcome: 'Any resource changes need plan adjustment and project managers should be informed on potential impact so those adjustments can be made.',
                        experience: -15
                    },
                    {
                        text: 'Remove some areas under test from planning to meet agreed project timelines.',
                        outcome: 'Coverage areas should not necessarily be removed. Although a reduction in test coverage of non-priority areas could potentially be adjusted. This would need confirmation from the project manager and the client',
                        experience: -10
                    },
                    {
                        text: 'Assess the impact on timeline and report this information to the project manager',
                        outcome: 'Whilst this is an important factor, the impact on coverage should also be taken into consideration and reported to stakeholders involved in the project.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Late Stage Risks',
                description: 'How do you assess risks when major issues are found late in testing?',
                options: [
                    {
                        text: 'Evaluate fix timeline, regression impact, and remaining test time, then reprioritize',
                        outcome: 'Perfect! Late-stage issue impact assessment.',
                        experience: 25, 
                    },
                    {
                        text: 'Reduce the remaining test areas to meet the project timeline set out in planning',
                        outcome: 'Reprioritising test areas rather than reducing them is better approach to deal with major issues. This should also be agreed with the project manager.',
                        experience: -15
                    },
                    {
                        text: 'Remove outstanding regression testing from planning as bug fixes and new features take priority',
                        outcome: 'Regression testing remains important area of issue verification. Instead of removing this completely, reprioritisation of regression areas should be taken into consideration and agreed with the project manager.',
                        experience: -10
                    },
                    {
                        text: 'Assess a route cause analysis for the client and developers to better understand a fix timeline',
                        outcome: 'Whilst this will help going forward for a new release. It doesn\'t help with reprioritisation of the current system under tests activities.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Client Requirement Changes',
                description: 'How do you assess risks when client requirements change during testing?',
                options: [
                    {
                        text: 'Analyse impact on timeline, coverage, and existing tests, then adjust strategy',
                        outcome: 'Excellent! Change impact analysis.',
                        experience: 25, 
                    },
                    {
                        text: 'Continue with the original testing activities set out in planning',
                        outcome: 'Requirement changes require reassessment and plan updates.',
                        experience: -15
                    },
                    {
                        text: 'Test the new requirement areas as these are the most current set out by the client',
                        outcome: 'All requirements need coverage relating to priority and any set out in planning that are still relevant need testing.',
                        experience: -10
                    },
                    {
                        text: 'Analyse impact on test coverage and report this to the project manager',
                        outcome: 'Whilst coverage is important. Other factors need to be taken into consideration including impact on project time line and existing tests.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'End of Project Risk Review',
                description: 'How do you assess risks at project completion?',
                options: [
                    {
                        text: 'Review project challenges, identify process improvements, and document lessons learned',
                        outcome: 'Perfect! Comprehensive project review.',
                        experience: 25, 
                    },
                    {
                        text: 'Document all major issues in a project review',
                        outcome: 'While important all aspects need to be included for review including project challenges. These can then be reviewed for improvement moving forward.',
                        experience: -15
                    },
                    {
                        text: 'Document lessons learned in the project review',
                        outcome: 'Whilst this is an important factor in the review. It may not target exact areas where processes can be improved.',
                        experience: -10
                    },
                    {
                        text: 'Focus on successes achieved throughout the project and document them in the project review',
                        outcome: 'Both successes and challenges are essential to the project review. This promotes a way of carrying forward good process and highlights the need for process improvement',
                        experience: -5
                    }
                ]
            }
        ]
}