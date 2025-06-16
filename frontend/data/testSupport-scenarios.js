export const testSupportScenarios = {
    // Basic Scenarios (IDs 1-5)
    basic: [
        {
            id: 1,
            level: 'Basic',
            title: 'Morning Communication',
            description: 'You\'re starting your first day on test support. What\'s the most professional first action?',
            options: [
                {
                    text: 'Send a message to the client checking for specific test tasks and confirm your presence',
                    outcome: 'Perfect! This shows proactive communication and readiness to begin.',
                    experience: 15,
                },
                {
                    text: 'Start test activities without checking in with client contacts for the project',
                    outcome: 'Morning check-ins are crucial for test support coordination.',
                    experience: -10
                },
                {
                    text: 'Wait for the client to contact you directly to coordinate testing activities',
                    outcome: 'Proactive communication is essential in test support. The client can make an informed decision on progress and suggested focus areas.',
                    experience: -5
                },
                {
                    text: 'Check internal emails for client instruction or any scheduled meetings',
                    outcome: 'External client communication should be prioritized at start of day when working on a test support project.',
                    experience: 0
                }
            ]
        },
        {
            id: 2,
            level: 'Basic',
            title: 'Access Verification',
            description: 'You\'re preparing for a test support session. What\'s the most thorough preparation approach?',
            options: [
                {
                    text: 'Verify access to test URLs, designs, documentation, and tracker board',
                    outcome: 'Excellent! This ensures you\'re fully prepared for testing.',
                    experience: 15,
                },
                {
                    text: 'Check test environment access associated with the URL\'s provided by the client',
                    outcome: 'This is important, although all resources require verification for effective testing.',
                    experience: -10
                },
                {
                    text: 'Initiate contact with the client once access is required for the system under test',
                    outcome: 'Proactive access verification is the best approach as this prevents delays in testing activities.',
                    experience: -5
                },
                {
                    text: 'Contact the client for access to any required areas during testing',
                    outcome: 'Access to areas needed to commence testing activities should be verified before starting any test activities.',
                    experience: 0
                }
            ]
        },
        {
            id: 3,
            level: 'Basic',
            title: 'Documentation Management',
            description: 'You\'re starting on an ongoing test support project. What\'s the best documentation approach?',
            options: [
                {
                    text: 'Create a process document noting important information and project procedures',
                    outcome: 'Perfect! This ensures knowledge retention and consistent processes.',
                    experience: 15,
                },
                {
                    text: 'Rely on processes from memory and experience of working with the client on an ongoing basis',
                    outcome: 'Documentation is crucial for consistency and knowledge transfer.',
                    experience: -10
                },
                {
                    text: 'Document any major issues that have been raised or previously highlighted by the client',
                    outcome: 'While essential, all processes and important information require documentation for clarity and traceability.',
                    experience: -5
                },
                {
                    text: 'Contact the client and ask if there is any documentation in place for current processes',
                    outcome: 'While some procedures the client uses within their work flow will apply. Procedures and processes relating to how Zoonou integrate those are most useful and should be noted',
                    experience: 0
                }
            ]
        },
        {
            id: 4,
            level: 'Basic',
            title: 'Client Communication Channels',
            description: 'You notice you don\'t have direct client communication access. What\'s the best approach?',
            options: [
                {
                    text: 'Check with the project manager about getting added to relevant communication channels',
                    outcome: 'Excellent! This ensures a proper communication setup for moving forward.',
                    experience: 15,
                },
                {
                    text: 'Proceed without direct communication with the client as the project manager can cover this',
                    outcome: 'Direct client communication is crucial for an ongoing test support role as there will be multiple meetings and potentially multiple releases during weekly testing.',
                    experience: -10
                },
                {
                    text: 'Use personal communication methods as this promotes trust',
                    outcome: 'Official channels should always be used for client communication for traceability and process resolution.',
                    experience: -5
                },
                {
                    text: 'Use email as a full history thread can be utilised',
                    outcome: 'Established communication channels need to be agreed upon and in general acted upon quickly. Whilst email is an important tool in communication, it is not always the quickest way to resolve any queries.',
                    experience: 0
                }
            ]
        },
        {
            id: 5,
            level: 'Basic',
            title: 'Project Board Monitoring',
            description: 'How should you approach project board management during test support?',
            options: [
                {
                    text: 'Keep the board open and regularly monitor it for new tickets and progress updates',
                    outcome: 'Perfect! This ensures timely response to new testing needs.',
                    experience: 15,
                },
                {
                    text: 'Check the project board once daily and continue with testing activities',
                    outcome: 'Regular monitoring throughout the day is required to ensure quick response times.',
                    experience: -10
                },
                {
                    text: 'Wait for notifications from client contacts to refer to the project board',
                    outcome: 'Proactive board monitoring is essential as notifications will come from different sources and may not be set up fully.',
                    experience: -5
                },
                {
                    text: 'Check any assigned tickets from the project board',
                    outcome: 'Overall project progress requires monitoring not only for any tickets that can potentially be resolved, but also for project roadmap assesment.',
                    experience: 0
                }
            ]
        },
        // Additional Basic Scenarios from Guide - Test Support Additional Questions
        {
            id: 16,
            level: 'Basic',
            title: 'Test Support Relationships',
            description: 'Which of the following best describes the relationship between Zoonou testers and the client during test support?',
            options: [
                {
                    text: 'Testers become embedded in the client\'s development team, sometimes joining sprint planning and daily standups',
                    outcome: 'Correct! during test support, testers essentially become a part of the client\'s development team.',
                    experience: 15,
                },
                {
                    text: 'Testers work completely independently with no client interaction',
                    outcome: 'This contradicts the embedded nature of test support, where direct client interaction is common.',
                    experience: -5
                },
                {
                    text: 'Testers provide only written reports with no direct communication',
                    outcome: 'Emphasis should be on good communication including written communication and voice/video calls.',
                    experience: -10
                },
                {
                    text: 'Testers only communicate through the project manager',
                    outcome: 'While project managers are involved, testers often have direct communication with clients, particularly in the independent type of test support.',
                    experience: 0
                }
            ]
        },
        {
            id: 17,
            level: 'Basic',
            title: 'Test Support Disadvantage',
            description: 'What is one key risk or disadvantage of test support?',
            options: [
                {
                    text: 'Test support always costs more than standalone testing',
                    outcome: 'Test support doesn\'t generally cost the company offering the service any more than other types of testing.',
                    experience: -5
                },
                {
                    text: 'Test support always requires more testers than other testing approaches',
                    outcome: 'Test support doesn\'t generally require more resources and that all depends on the needs of a specific project.',
                    experience: -10
                },
                {
                    text: 'The line between Zoonou\'s and the client\'s ways of working can become blurred',
                    outcome: 'Correct! This can occur with the way Zoonou operates and the way the client operates which needs to be managed on a regular basis.',
                    experience: 15,
                },
                {
                    text: 'Test support slows down the development process significantly',
                    outcome: 'Test support can actually make development more efficient by catching issues earlier.',
                    experience: 0
                }
            ]
        },
        {
            id: 18,
            level: 'Basic',
            title: 'Test Support Documentation',
            description: 'What type of document should be created and maintained for test support projects?',
            options: [
                {
                    text: 'Technical architecture diagrams should be created and maintained.',
                    outcome: 'While technical architecture might be useful to understand, process guides should take priority.',
                    experience: -5
                },
                {
                    text: 'Weekly formal testing reports only should be created and maintained',
                    outcome: 'While reporting may be part of the process, a comprehensive process guide should be kept up to date for any type of project handover required.', 
                    experience: -10
                },
                {
                    text: 'Handover and process guides should be created and maintained',
                    outcome: 'Correct! It is important that some form of process guide is present on test support projects, especially on longer running ongoing test support projects',
                    experience: 15,
                },
                {
                    text: 'Detailed coding standards document should be created and maintained',
                    outcome: 'Coding standards do not apply to a manual testing service.',
                    experience: 0
                }
            ]
        },
        {
            id: 19,
            level: 'Basic',
            title: 'Test Support Characteristics',
            description: 'Which of the following is not a characteristic of test support?',
            options: [
                {
                    text: 'Rigid adherence to standardised test processes',
                    outcome: 'Correct! Flexibility is a key characteristic of test support and the need to adapt to client practices while maintaining Zoonou\'s characteristics is essential.',
                    experience: 15,
                },
                {
                    text: 'Flexibility in testing tasks is a characteristic of test support',
                    outcome: 'This is correct as test support tasks can vary from session to session.',
                    experience: -10
                },
                {
                    text: 'Independence in decision-making is a characteristic of test support',
                    outcome: 'This is correct as test support should allow testers to make decisions related to testing based on their in-depth understanding of the software.',
                    experience: -5
                },
                {
                    text: 'Development of in-depth project expertise is a characteristic of test support',
                    outcome: 'This is correct as test support testers should build an in-depth understanding of the software and the development team\'s processes.',
                    experience: 0
                }
            ]
        },
        {
            id: 20,
            level: 'Basic',
            title: 'Documentation Updates',
            description: 'When should a tester update the handover and process guides during a test support project?',
            options: [
                {
                    text: 'As and when new information is introduced or processes change',
                    outcome: 'Correct! These guides should not be stagnant, it is important to update these documents as and when new information is introduced to the project or changes are made to the processes.',
                    experience: 15,
                },
                {
                    text: 'A handover guide should only be updated at the beginning of the project',
                    outcome: 'Updating only at the beginning would mean the guide becomes outdated as the project evolves.',
                    experience: -10
                },
                {
                    text: 'A handover guide should only be updated when a new tester joins the project',
                    outcome: 'While a handover guide is particularly useful when new testers join, the guide should be updated whenever there are changes, not just when new testers join.',
                    experience: -5
                },
                {
                    text: 'A handover guide should only be updated at the end of the project',
                    outcome: 'Updating only at the end would mean the guide is not helpful during the ongoing project and could result in lost information if not documented promptly.',
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
            title: 'Client Process Adaptation',
            description: 'You\'re working with a client who uses different terminology and processes. What\'s the best approach?',
            options: [
                {
                    text: 'Adapt to client terminology and processes while maintaining Zoonou standards',
                    outcome: 'Excellent! This shows flexibility and professionalism.',
                    experience: 20,     
                },
                {
                    text: 'Subtly introduce Zoonou terminology throughout the project',
                    outcome: 'Adapting to client processes is crucial for effective collaboration as Zoonou is integrating with their work flow.',
                    experience: -15
                },
                {
                    text: 'Continue with Zoonou terminology throughout documentation and reports',
                    outcome: 'Understanding and adapting to client processes is essential. This will also promote less confusion if more resources are required or when reports are submitted to the client',
                    experience: -10
                },
                {
                    text: 'Use client terminology in meetings with the client and Zoonou terminology for internal meetings',
                    outcome: 'Adaptation improves collaboration with the client, and making Zoonou colleagues aware of this terminology improves awareness should more project resources be required.',
                    experience: 0
                }
            ]
        },
        {
            id: 7,
            level: 'Intermediate',
            title: 'Handling Idle Time',
            description: 'You\'re booked for test support but have no tasks due to client delays. What\'s the best approach?',
            options: [
                {
                    text: 'Inform the project manager and explore additional ways to add value to the project',
                    outcome: 'Excellent! This ensures productive use of time and adds value.',
                    experience: 20,
                },
                {
                    text: 'Wait for tasks to be assigned by the client project manager',
                    outcome: 'Proactive exploration of additional tasks is more beneficial to both the client and the project understanding.',
                    experience: -15
                },
                {
                    text: 'Use the time for self-improvement as long as it\'s of benefit to Zoonou',
                    outcome: 'Any down time should be used productively for the specific project. This should also be communicated with the client and project manager',
                    experience: -10
                },
                {
                    text: 'Inform the client of availability and what you intend to do with the project downtime',
                    outcome: 'Whilst this is a good approach. The Zoonou project manager should also be made aware as they may need to explore additional opportunities.',
                    experience: 0
                }
            ]
        },
        {
            id: 8,
            level: 'Intermediate',
            title: 'Communication with Non-Responsive Clients',
            description: 'The client is slow to respond, affecting your testing. What\'s the best approach?',
            options: [
                {
                    text: 'Maintain open communication, update the project manager, and suggest raising the issue in regular catch-ups',
                    outcome: 'Excellent! This ensures issues are addressed and communication remains open.',
                    experience: 20,
                },
                {
                    text: 'Stop testing until client responds with how to proceed',
                    outcome: 'Testing should continue with available information and on any other areas possible.',
                    experience: -15
                },
                {
                    text: 'Communicate when client responds and look for a resolution to any raised concerns',
                    outcome: 'Proactive communication is essential and it is good practice to follow up on any concerns that have not been addressed.',
                    experience: -10
                },
                {
                    text: 'Find a way around the communication issues by raising any issues with other team members',
                    outcome: 'Whilst this approach may work in some instances. It is good practice to address communication for effective collaboration moving forward.',
                    experience: 0
                }
            ]
        },
        {
            id: 9,
            level: 'Intermediate',
            title: 'Managing Multiple Projects',
            description: 'You\'re assigned to multiple test support projects. What\'s the best approach to manage your workload?',
            options: [
                {
                    text: 'Prioritise tasks based on deadlines and importance, communicate availability to project managers',
                    outcome: 'Excellent! This ensures effective workload management.',
                    experience: 20,
                },
                {
                    text: 'Focus on one project at a time using prior experience and preference',
                    outcome: 'Multiple projects require balanced attention as clients will base project time management around any issues raised.',
                    experience: -15
                },
                {
                    text: 'Rely on project managers to assign priorities as they are aligned with the client and business needs',
                    outcome: 'Proactive project prioritisation is a preferred approach. However, this should also be cross referenced with the project managers',
                    experience: -10
                },
                {
                    text: 'Work on the project that has the shortest time line in regards to project release dates',
                    outcome: 'All projects need attention based on priorities. However, there may be other contributing factors and shorter sprints within competing projects. In this instance the project manager should be informed of any decisions moving forward',
                    experience: 0
                }
            ]
        },
        {
            id: 10,
            level: 'Intermediate',
            title: 'Building Client Relationships',
            description: 'You\'re new to a test support project. How do you build a strong relationship with the client?',
            options: [
                {
                    text: 'Communicate regularly, provide valuable feedback, and demonstrate understanding of their needs',
                    outcome: 'Excellent! This builds trust and rapport with the client.',
                    experience: 20,
                },
                {
                    text: 'Communicate if necessary and when major issues need resolving',
                    outcome: 'Regular communication is key to building a good working relationship. Process improvements, project progress and suggestions are also an important factor in test support roles',
                    experience: -15
                },
                {
                    text: 'Focus communication on testing tasks relating to the project',
                    outcome: 'Building relationships requires more than task completion. Process improvements, project progress and suggestions are also an important factor in test support roles',
                    experience: -10
                },
                {
                    text: 'Wait for client to initiate relationship building through communication channels',
                    outcome: 'Proactive relationship building is the preferred approach as this promotes professionalism towards the project and client trust.',
                    experience: 0
                }
            ]
        }
    ],

    // Advanced Scenarios (IDs 11-15)
    advanced: [
        {
            id: 11,
            level: 'Advanced',
            title: 'Independent Decision Making',
            description: 'You\'ve identified a more efficient testing approach. How do you proceed?',
            options: [
                {
                    text: 'Communicate the approach to the project manager and client, providing rationale and expected benefits',
                    outcome: 'Excellent! This demonstrates initiative and effective communication.',
                    experience: 25,
                },
                {
                    text: 'Implement the approach after consulting with the Zoonou project manager',
                    outcome: 'Consultation ensures alignment and acceptance. So this should also be communicated with the client to gain their feedback',
                    experience: -15
                },
                {
                    text: 'Leave any new approaches to processes as the client will have the current processes in place for a good period of time',
                    outcome: 'Innovative approaches should always be communicated and explored.',
                    experience: -10
                },
                {
                    text: 'Always wait for client to suggest changes as they have a better insight to business goals',
                    outcome: 'Proactive suggestions are a valuable asset in gaining a good working relationship and a collaborative approach.',
                    experience: -5
                }
            ]
        },
        {
            id: 12,
            level: 'Advanced',
            title: 'Handling Client Requests',
            description: 'A client requests a change that deviates from Zoonou\'s standard processes. What\'s the best approach?',
            options: [
                {
                    text: 'Discuss the request with your line manager for approval before responding to the client',
                    outcome: 'Excellent! This ensures proper alignment and authority.',
                    experience: 25,
                },
                {
                    text: 'Agree to the request and carry out the process within the project testing activities',
                    outcome: 'Approval is needed for deviations from standard processes.',
                    experience: -15
                },
                {
                    text: 'Decline the request and continue with usual standard processes',
                    outcome: 'Discussion with the client, project manager and line manager ensures understanding and potential compromise.',
                    experience: -10
                },
                {
                    text: 'Don\'t respond to the request as the client should propose this directly through the business channels agreed',
                    outcome: 'Whilst this may be true in some circumstances. It essential for good communication, business collaboration and quick resolution that the client can feel the need to come directly to the person working on the project.',
                    experience: -5
                }
            ]
        },
        {
            id: 13,
            level: 'Advanced',
            title: 'Knowledge Retention',
            description: 'You\'re leaving a long-term test support project. How do you ensure knowledge retention?',
            options: [
                {
                    text: 'Create a comprehensive handover guide documenting processes and key information',
                    outcome: 'Excellent! This ensures smooth transition and knowledge retention.',
                    experience: 25,
                },
                {
                    text: 'Promote a verbal handover process that doesn\'t require documentation',
                    outcome: 'Written documentation ensures thorough knowledge transfer and can be updated in line with changes for future reference and traceability.',
                    experience: -15
                },
                {
                    text: 'Document all major issues that have been resolved and that are still open',
                    outcome: 'All relevant information needs documentation. Including business processes and project progress',
                    experience: -10
                },
                {
                    text: 'Provide updated links to client documentation',
                    outcome: 'Whilst client documentation is essential. Any documentation on all aspects of the project gathered by Zoonou should be updated and shared for continuity.',
                    experience: -5
                }
            ]
        },
        {
            id: 14,
            level: 'Advanced',
            title: 'Managing Client Expectations',
            description: 'A client expects more testing than the agreed scope allows. How do you manage this?',
            options: [
                {
                    text: 'Communicate scope limitations clearly and discuss potential adjustments with the project manager',
                    outcome: 'Excellent! This ensures clear expectations and potential solutions.',
                    experience: 25,
                },
                {
                    text: 'Attempt to meet the client expectations regardless of scope',
                    outcome: 'Scope limitations need clear communication as new updates to what is expected may exceed agreed project time frames.',
                    experience: -15
                },
                {
                    text: 'Continue to reach the initial scope and expectations set out in planning',
                    outcome: 'Expectations need addressing and managing, especially if new targets are set mid project.',
                    experience: -10
                },
                {
                    text: 'Inform the project manager without client communication',
                    outcome: 'Direct client communication is essential as this will promote a good working relationship and inform them of what can be expected within the time frame set.',
                    experience: -5
                }
            ]
        },
        {
            id: 15,
            level: 'Advanced',
            title: 'Long-Term Client Engagement',
            description: 'You\'re leading a long-term test support project. How do you ensure ongoing success?',
            options: [
                {
                    text: 'Maintain regular communication, adapt to client needs, and continuously improve processes',
                    outcome: 'Excellent! This ensures long-term success and client satisfaction.',
                    experience: 25,
                },
                {
                    text: 'Follow initial client processes without change',
                    outcome: 'Continuous improvement is key to long-term success and any potential improvements to processes should be communicated and explored.',
                    experience: -15
                },
                {
                    text: 'Focus on immediate tasks set out in planning and meetings',
                    outcome: 'Long-term success requires strategic focus and this should be continuously monitored to mitigate any project risks.',
                    experience: -10
                },
                {
                    text: 'Wait for client feedback to current progress to make any changes that may benefit the project',
                    outcome: 'Proactive improvement is the preferred approach and promotes good awareness of the business goals and a good collaborative relationship.',
                    experience: -5
                }
            ]
        }
    ]
}