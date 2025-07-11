export const riskManagementScenarios = {
    // Basic Scenarios (IDs 1-5, 75 XP total)
    basic: [
        {
            id: 1,
            level: 'Basic',
            title: 'Risk Calculation',
            description: 'You discover a potential issue that could affect project completion. How do you best calculate its risk level?',
            options: [
                {
                    text: 'Multiply severity by likelihood to determine impact and risk level',
                    outcome: 'Perfect! This is the correct formula for calculating risk impact.',
                    experience: 15
                },
                {
                    text: 'Consider the severity of the issue and base the risk level of that only',
                    outcome: 'Risk calculation needs both severity and likelihood for accuracy.',
                    experience: -10
                },
                {
                    text: 'Add severity and likelihood together to calculate the risk level',
                    outcome: 'Multiplication, not addition, gives the correct risk impact score.',
                    experience: -5
                },
                {
                    text: 'Consider how likely the issue is to occur and base the risk level off this',
                    outcome: 'Both factors are needed for proper risk assessment.',
                    experience: 0
                }
            ]
        },
        {
            id: 2,
            level: 'Basic',
            title: 'Risk Identification',
            description: 'What is the most effective way to identify potential risks?',
            options: [
                {
                    text: 'Conduct comprehensive analysis of historical project data and previous risk assessments to establish patterns',
                    outcome: 'Historical data alone may miss new risks.',
                    experience: -5
                },
                {
                    text: 'Review documentation to determine scope, user and system impact',
                    outcome: 'Perfect! Documentation review is key to identifying risks.',
                    experience: 15
                },
                {
                    text: 'Implement extensive monitoring systems to track all possible system behaviours and performance metrics',
                    outcome: 'Monitoring comes after risk identification.',
                    experience: -10
                },
                {
                    text: 'Establish detailed risk tracking protocols across multiple project phases',
                    outcome: 'Tracking comes after identification.',
                    experience: 0
                }
            ]
        },
        {
            id: 3,
            level: 'Basic',
            title: 'Payment Gateway Testing',
            description: 'You\'re testing an ecommerce site\'s payment system. What\'s the best risk management approach?',
            options: [
                {
                    text: 'Monitor payments at regular intervals throughout the day',
                    outcome: 'Perfect! Regular testing and prompt reporting helps manage payment risks.',
                    experience: 15,
                },
                {
                    text: 'Test payments once at the start of the day to check during peak hours',
                    outcome: 'Payment systems need regular monitoring throughout testing.',
                    experience: -5
                },
                {
                    text: 'Establish extensive customer feedback collection mechanisms for payment-related issues',
                    outcome: 'Proactive testing is essential for risk management rather than awaiting feedback.',
                    experience: -10
                },
                {
                    text: 'Conduct payment verification only upon explicit client request or reported issues',
                    outcome: 'Regular payment testing is part of thorough risk management.',
                    experience: 0
                }
            ]
        },
        {
            id: 4,
            level: 'Basic',
            title: 'Device Access',
            description: 'You realise you don\'t have access to one of the scoped devices for testing. What\'s the best risk management approach?',
            options: [
                {
                    text: 'Feedback to your Delivery Manager, then determine who holds the relevant device in order to arrange access.',
                    outcome: 'Excellent! Proactive device access management reduces project risks.',
                    experience: 15,
                },
                {
                    text: 'Leave testing on that device and use the closest environment possible',
                    outcome: 'Whilst this may be a possible solution, it still creates unchecked risks in the project.',
                    experience: -10
                },
                {
                    text: 'Wait until the project manager requests testing progress on the device',
                    outcome: 'Proactive communication is key in risk management to mitigate any issues that may arise.',
                    experience: -5
                },
                {
                    text: 'Mention access to the device has not been possible it in the final report',
                    outcome: 'Device access issues should be addressed immediately.',
                    experience: 0
                }
            ]
        },
        {
            id: 5,
            level: 'Basic',
            title: 'Issue Tracker Access',
            description: 'Testing starts today but no issue tracker has been provided. What\'s the best risk management approach?',
            options: [
                {
                    text: 'Document issues locally and immediately alert the project manager about the lack of tracker details',
                    outcome: 'Perfect! This ensures no information is lost while addressing the risk.',
                    experience: 15,
                },
                {
                    text: 'Continue with testing without documentation while waiting for the tracker details to be provided by the client',
                    outcome: 'Issues should be documented even without a tracker.',
                    experience: -10
                },
                {
                    text: 'Delay testing until issue tracker details have been provided by the client',
                    outcome: 'Testing should proceed with alternative documentation methods.',
                    experience: -5
                },
                {
                    text: 'Continue testing and raise brief notes for any issues found into the project channel',
                    outcome: 'Issues must be documented fully even without a formal tracker.',
                    experience: 0
                }
            ]
        },
        // Additional Basic Scenarios from Guide - Risk Management Additional Questions
        {
            id: 16,
            level: 'Basic',
            title: 'Risk Management Characteristics',
            description: 'Which of the following is not a characteristic of risk management?',
            options: [
                {
                    text: 'Being reactive responding to problems as they arise',
                    outcome: 'Correct! Being proactive is as a characteristic, emphasising being mindful of potential risks rather than reacting to problems. Reactive approaches are the opposite of the recommended approach.',
                    experience: 15,
                },
                {
                    text: 'Being proactive and mindful of potential risks',
                    outcome: 'Being proactive is as a key characteristic of risk management.',
                    experience: -5
                },
                {
                    text: 'Good communication, sharing identified risks with your team',
                    outcome: 'Communication is a characteristic, particularly sharing identified risks with your team.',
                    experience: -10
                },
                {
                    text: 'Being timely to act on risks as early as possible',
                    outcome: 'Being timely is as a characteristic with emphasis on acting on risks as early as possible.',
                    experience: 0
                }
            ]
        },
        {
            id: 17,
            level: 'Basic',
            title: 'Project Feature Management',
            description: 'In a scenario where a project feature is missing during testing, what is one of the recommended actions for the project manager?',
            options: [
                {
                    text: 'Additional payment from the client should be sought for schedule disruption',
                    outcome: 'Demanding additional payment would likely damage client relationships.',
                    experience: -5
                },
                {
                    text: 'Make sure to complete the project without testing the missing feature',
                    outcome: 'Testing on all scoped features should be attempted and communication with the client should be sought on clarification of those features.',
                    experience: -10
                },
                {
                    text: 'Offer to repurpose issue verification time to accommodate the release feature when available',
                    outcome: 'Correct! The project manager should, if within notice period offer to repurpose issue verification time to accommodate the release feature when available.',
                    experience: 15,
                },
                {
                    text: 'Automatically extend the project timeline without client consultation',
                    outcome: 'Consultation with the client about options is recommended rather than automatically extending timelines.',
                    experience: 0
                }
            ]
        },
        {
            id: 18,
            level: 'Basic',
            title: 'Test Duration Risk Mitigation',
            description: 'What should be a risk mitigation action when a client reduces testing days from 10 to 5?',
            options: [
                {
                    text: 'A mitigation should be to refuse to proceed with testing until the original timeline is restored.',
                    outcome: 'Flexibility and adaptability to changing circumstances should be observed, not a refusal to proceed.',
                    experience: -5
                },
                {
                    text: 'A mitigation should be to automatically double the number of testers assigned to maintain complete coverage',
                    outcome: 'While resource reallocation might be considered, automatically doubling testers without discussion with all affected is not recommended.', 
                    experience: -10
                },
                {
                    text: 'A mitigation should be to identify further prioritisation of software to ensure critical features receive high coverage',
                    outcome: 'Correct! If the script cannot be completed, then reprioritisation of test effort to cover critical areas should be considered',
                    experience: 15,
                },
                {
                    text: 'A mitigation should be to test all features with equal depth but at a faster pace',
                    outcome: 'Test coverage will be reduced and re-prioritisation rather than maintaining equal depth for all features is recommended.',
                    experience: 0
                }
            ]
        },
        {
            id: 19,
            level: 'Basic',
            title: 'Risk Management Objectives',
            description: 'What is an of the objectives of risk management?',
            options: [
                {
                    text: 'To understand how risks can affect our work',
                    outcome: 'Correct! This is the primary objective for risk management.',
                    experience: 15,
                },
                {
                    text: 'To eliminate the need for client communication during projects',
                    outcome: 'Client communication is essential and should not be eliminated.',
                    experience: -10
                },
                {
                    text: 'To avoid all potential defects in software development',
                    outcome: 'Defects will occur and focus should be on managing them, not avoiding all potential defects',
                    experience: -5
                },
                {
                    text: 'To guarantee project completion within original timeframes',
                    outcome: 'While effective risk management helps with timely completion, timeframes may need to change based on circumstances.',
                    experience: 0
                }
            ]
        },
        {
            id: 20,
            level: 'Basic',
            title: 'Risk Management Importance',
            description: 'Why is risk management important?',
            options: [
                {
                    text: 'It improves delivery of projects, ensuring they are completed on time and to the best ability',
                    outcome: 'Correct! It can help identify and manage risks to prioritise risk areas and deliver projects on time.',
                    experience: 15,
                },
                {
                    text: 'It eliminates the need for client involvement in project decisions',
                    outcome: 'Client communication and involvement should be sought, not eliminated. This can help build client relationships and trust.',
                    experience: -10
                },
                {
                    text: 'It helps justify additional project costs to clients',
                    outcome: 'Risk management should be about improving project outcomes, not justifying additional costs.',
                    experience: -5
                },
                {
                    text: 'It reduces the time needed for testing activities',
                    outcome: 'Risk management might actually increase testing time in certain cases to mitigate identified risks properly.',
                    experience: 0
                }
            ]
        }
    ],

    // Intermediate Scenarios (IDs 6-10, 125 XP total)
    intermediate: [
        {
            id: 6,
            level: 'Intermediate',
            title: 'Blocking Issue Management',
            description: 'You find a blocking issue with 5 testers on day 1 of a 4-day project. What\'s the best risk management approach?',
            options: [
                {
                    text: 'Flag the issue in the project channel, raise the highest severity ticket, assign the ticket as advised by the client, and actively monitor for changes',
                    outcome: 'Perfect! This follows proper risk management protocol for blocking issues.',
                    experience: 20,
                },
                {
                    text: 'Continue testing other areas that can be worked around the blocking issue',
                    outcome: 'Blocking issues need immediate communication due to resource impact.',
                    experience: -15
                },
                {
                    text: 'Wait for other testers to investigate the root cause and raise a ticket',
                    outcome: 'Proactive communication is crucial for team-wide blocking issues.',
                    experience: -10
                },
                {
                    text: 'Document the issue in your notes and continue with any testing that can be done',
                    outcome: 'Blocking issues require immediate team communication and stakeholder visibility.',
                    experience: 0
                }
            ]
        },
        {
            id: 7,
            level: 'Intermediate',
            title: 'Scope Change Management',
            description: 'The client adds 10 more pages to test on day 2, with Zoonou at 97% resource usage. How do you manage this risk?',
            options: [
                {
                    text: 'Assess impact and notify project manager',
                    outcome: 'Excellent! This provides data-driven risk assessment and communication.',
                    experience: 20,
                },
                {
                    text: 'Attempt to test everything within the original timeline',
                    outcome: 'This creates quality risks and unrealistic expectations.',
                    experience: -15
                },
                {
                    text: 'Only test the original scope set out in planning and documentation',
                    outcome: 'Changes to requirements need correct communication and planning.',
                    experience: -10
                },
                {
                    text: 'Test what you can within the agreed time line without raising concerns',
                    outcome: 'Resource constraints need to be communicated promptly as test coverage could be compromised.',
                    experience: 0
                }
            ]
        },
        {
            id: 8,
            level: 'Intermediate',
            title: 'Application Installation Failure',
            description: 'On the final day, a new build won\'t install on 40% of test devices. What\'s the best risk management approach?',
            options: [
                {
                    text: 'Check all devices, raise the highest severity issue and coordinate with team for coverage',
                    outcome: 'Perfect! This addresses both technical and project risks comprehensively.',
                    experience: 20,
                },
                {
                    text: 'Test the new build on devices that can install the build only',
                    outcome: 'Device coverage gaps need to be communicated and assessed for mitigation and visibility.',
                    experience: -15
                },
                {
                    text: 'Wait for a new build and check the same devices again',
                    outcome: 'Installation issues need immediate reporting and risk assessment.',
                    experience: -10
                },
                {
                    text: 'Mark devices as untested within the test report for submission to the client',
                    outcome: 'Technical issues need correct investigation and documentation.',
                    experience: 0
                }
            ]
        },
        {
            id: 9,
            level: 'Intermediate',
            title: 'Missing Feature Risk',
            description: 'On the final day, one of three features hasn\'t been delivered for testing. How do you manage this risk?',
            options: [
                {
                    text: 'Confirm with project manager, document missing coverage, suggest alternative testing approaches',
                    outcome: 'Excellent! This provides clear risk documentation and mitigation options.',
                    experience: 20,
                },
                {
                    text: 'Mark feature as passed as long as all other available features have been tested',
                    outcome: 'Untested features must be clearly documented as risks.',
                    experience: -15
                },
                {
                    text: 'State which feature has not been submitted or tested in final report',
                    outcome: 'Missing features need immediate communication to be resolved by delivery or deemed as out of scope.',
                    experience: -10
                },
                {
                    text: 'Continue testing other features and areas to gain the most coverage possible',
                    outcome: 'Coverage gaps need proper documentation and communication.',
                    experience: 0
                }
            ]
        },
        {
            id: 10,
            level: 'Intermediate',
            title: 'High Bug Volume',
            description: 'You find 8 major bugs in 90 minutes on page 1 of 7, with 6.5 hours remaining. How do you manage this risk?',
            options: [
                {
                    text: 'Perform a quick site assessment, estimate total bugs, inform the project manager and prioritise by severity',
                    outcome: 'Perfect! This provides structured risk assessment and prioritization.',
                    experience: 20,
                },
                {
                    text: 'Try to document every issue possible regardless of severity',
                    outcome: 'High bug volumes require severity-based prioritisation.',
                    experience: -15
                },
                {
                    text: 'Raise basic detailed bug reports to cover more pages on the website',
                    outcome: 'Quality of bug documentation shouldn\'t be sacrificed for speed.',
                    experience: -10
                },
                {
                    text: 'Focus only on the first page of the website as this is where the initial issues have been raised',
                    outcome: 'Coverage needs to be balanced with bug severity.',
                    experience: 0
                }
            ]
        }
    ],

    // Advanced Scenarios (IDs 11-15, 100 XP total)
    advanced: [
        {
            id: 11,
            level: 'Advanced',
            title: 'Script Timeline Reduction',
            description: 'A 10-day scripted project is reduced to 5 days during execution. How do you manage this significant risk?',
            options: [
                {
                    text: 'Analyse critical paths, propose coverage priorities, document risks of reduced testing',
                    outcome: 'Excellent! This provides structured risk management for scope reduction.',
                    experience: 25,
                },
                {
                    text: 'Attempt to complete all testing in scope within the reduced time frame',
                    outcome: 'Rushed testing creates quality risks that need documentation.',
                    experience: -15
                },
                {
                    text: 'Continue with original plan despite the reduced project timeline',
                    outcome: 'Scope changes need proper replanning and risk assessment.',
                    experience: -10
                },
                {
                    text: 'Reduce coverage on tester preference and experience',
                    outcome: 'Coverage reduction needs strategic planning, communication and documentation.',
                    experience: -5
                }
            ]
        },
        {
            id: 12,
            level: 'Advanced',
            title: 'Personal Risk Management',
            description: 'Personal circumstances affect your work capacity. How do you best manage this risk?',
            options: [
                {
                    text: 'Immediately inform manager with impact assessment and timeline if possible',
                    outcome: 'Perfect! This allows proper resource risk management and support.',
                    experience: 25,
                },
                {
                    text: 'Attempt to continue working normally and to the timeline set out in planning',
                    outcome: 'Personal risks need proper communication for team support.',
                    experience: -15
                },
                {
                    text: 'Reduce work output and continue testing activities as normal',
                    outcome: 'Changes in capacity need proper communication to potentially re-allocate resources.',
                    experience: -10
                },
                {
                    text: 'Report the potential risk when it starts to affects deliverables',
                    outcome: 'Early communication allows better risk management.',
                    experience: -5
                }
            ]
        },
        {
            id: 13,
            level: 'Advanced',
            title: 'Risk Documentation',
            description: 'You need to document project risks in a client report. What\'s the most effective approach?',
            options: [
                {
                    text: 'Include clear caveats, specific conditions, and potential impacts',
                    outcome: 'Excellent! This provides comprehensive risk documentation.',
                    experience: 25, 
                },
                {
                    text: 'Document resolved issues related to all risks in the client report',
                    outcome: 'All risks need documentation, including unresolved ones.',
                    experience: -15
                },
                {
                    text: 'Use basic descriptions of risks to keep the report accessible and minimal',
                    outcome: 'Risk documentation needs specific details and impacts.',
                    experience: -10
                },
                {
                    text: 'Do not document risks that client is already aware of',
                    outcome: 'All risks need formal documentation regardless of awareness for traceability.',
                    experience: -5
                }
            ]
        },
        {
            id: 14,
            level: 'Advanced',
            title: 'Multiple Risk Factors',
            description: 'A project has device access issues, tight timeline, and communication gaps. How do you manage multiple risks?',
            options: [
                {
                    text: 'Prioritise risks by impact score, create mitigation plans for each and communicate this clearly',
                    outcome: 'Perfect! This provides structured management of multiple risks.',
                    experience: 25,
                },
                {
                    text: 'Focus only on the most visible risks to the system and user',
                    outcome: 'All risks need assessment and management plans.',
                    experience: -15
                },
                {
                    text: 'Risks can be handled as and when they become issues',
                    outcome: 'Proactive management of all risks is necessary to avoid blocking issues further into test activities.',
                    experience: -10
                },
                {
                    text: 'Delegate different risks to be investigated and reported to different channels by different team members',
                    outcome: 'Multiple risks with one project require a coordinated management approach for alignment and traceability.',
                    experience: -5
                }
            ]
        },
        {
            id: 15,
            level: 'Advanced',
            title: 'Client Risk Decisions',
            description: 'The client decides not to fix a serious issue before release. How do you manage this risk?',
            options: [
                {
                    text: 'Document clear caveats, potential impacts, and maintain detailed risk records',
                    outcome: 'Excellent! This ensures proper risk documentation despite client decisions.',
                    experience: 25,
                },
                {
                    text: 'Accept the decision without documentation as this is a known issue to the client',
                    outcome: 'Client decisions need proper risk documentation for traceability.',
                    experience: -15
                },
                {
                    text: 'Continue to put the case forward for a resolution to the issue',
                    outcome: 'Once documented, client risk decisions need to be respected.',
                    experience: -10
                },
                {
                    text: 'Remove the issue from reports as this is already known to the client',
                    outcome: 'Risk documentation should maintain accuracy for traceability.',
                    experience: -5
                }
            ]
        }
    ]
}