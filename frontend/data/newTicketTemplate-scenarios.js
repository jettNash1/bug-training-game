export const newTicketTemplateScenarios = {
        // Basic Scenarios (IDs 1-5, 75 XP total)
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Semantic Satiation',
                description: 'What phrases should you avoid when writing a ticket?',
                options: [
                    {
                        text: '\'It has been observed\' or \'It is expected\'',
                        outcome: 'Correct! These phrases are direct but often overused and add additional noise to the ticket.',
                        experience: 15, 
                    },
                    {
                        text: '\'As per the user manual\' or \'As per the documentation\'',
                        outcome: 'These phrases are more specific and add valuable context to the ticket.',
                        experience: -5
                    },
                    {
                        text: '\'As per the specification\' or \'As per the requirements\'',
                        outcome: 'These phrases directly reference requirements and add clarity to the ticket.',
                        experience: -10
                    },
                    {
                        text: '\'Whilst viewing the website\' or \'Whilst using the application\'',
                        outcome: 'These are common ways of identifying the environment but are not always necessary as you could be specific regarding the location of the issue.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Acronyms',
                description: 'When should you use an acronym within a ticket?',
                options: [
                    {
                        text: 'Never, tickets need to be understandable by all team members, not just those who may be familiar with jargon',
                        outcome: 'Correct! Business users may view the ticket but may not be familiar with acronyms, so we need to use language anyone can understand.',
                        experience: 15, 
                    },
                    {
                        text: 'Only when the acronym is commonly used within the industry',
                        outcome: 'While this may be true, it is not always necessary to use an acronym, as it can be confusing for business users.',
                        experience: -5
                    },
                    {
                        text: 'Always, as it saves time writing the full term',
                        outcome: 'More time may be lost having to rewrite the ticket if it cannot be understood by the intended audience',
                        experience: -10
                    },
                    {
                        text: 'For file types like \'API.txt\' or \'image.png\'',
                        outcome: 'Whilst true, file types are standardised as acronyms so we don\'t need to write the full term',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Environments',
                description: 'What should be included within the \'Environments observed on\' section?',
                options: [
                    {
                        text: 'The Primary environment that the issue was observed on',
                        outcome: 'Correct! This should include device, operating system and browser/application version details',
                        experience: 15, 
                    },
                    {
                        text: 'All environments that the issue was observed on',
                        outcome: 'Additional environments should be included in the \'Also observed on\' section',
                        experience: -5
                    },
                    {
                        text: 'Environments that the issue was not observed on',
                        outcome: 'Incorrect, there are inumerable environments that the issue was not observed on',
                        experience: -10
                    },
                    {
                        text: 'Only the browser/application version details',
                        outcome: 'Incorrect, ideally you should state the device, operating system and browser/application version details',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Additional Environments',
                description: 'When should you include devices in the \'Also observed on\' section?',
                options: [
                    {
                        text: 'When the defect affects a wide range of devices or the developers may require additional context',
                        outcome: 'Correct! This is a valid reason to include additional environments in the \'Also observed on\' section',
                        experience: 15, 
                    },
                    {
                        text: 'Only when the issue is more severe on other devices',
                        outcome: 'Incorrect. Severity is detailed elsewhere in the ticket and ideally the most severe would be the primary environment',
                        experience: -5
                    },
                    {
                        text: 'Never, one environment is enough to demonstrate the issue',
                        outcome: 'Incorrect. Additional environments can help developers understand the scope of the issue and aid in debugging',
                        experience: -10
                    },
                    {
                        text: 'Only when specifically requested by developers',
                        outcome: 'While developer requests are important, you should proactively include relevant environments to provide complete information',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Believed to be',
                description: 'Assuming an issue has only been observed on iOS Tablet environments, which of the following would best fit the \'Believed to be\' section of a ticket?',
                options: [
                    {
                        text: 'Believed to be iOS Tablet',
                        outcome: 'Correct! This is the most relevant option and would be the best fit for the \'Believed to be\' section',
                        experience: 15, 
                    },
                    {
                        text: 'Believed to be iOS Mobile',
                        outcome: 'Incorrect. The bug only occurs on tablet environments, so it cannot be iOS Mobile specific',
                        experience: -5
                    },
                    {
                        text: 'Believed to be Global Tablet',
                        outcome: 'Incorrect. The bug only occurs on iOS Tablet environments, so it cannot be global',
                        experience: -10
                    },
                    {
                        text: 'Believed to be iOS and Tablet',
                        outcome: 'Incorrect, whilst it does accurately describe the issue, it is not an option within the ticket template',
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
                title: 'Reproduction Rate',
                description: 'How should you determine the most relevant reproduction rate to add to your ticket?',
                options: [
                    {
                        text: 'Test multiple times and determine the most applicable reproduction statement from the options provided within the ticket template',
                        outcome: 'Correct! This provides an accurate understanding of the reproduction rate and follows the Zoonou approach to writing tickets.',
                        experience: 20, 
                    },
                    {
                        text: 'Test one time on one environment to ensure accurate reproduction rate',
                        outcome: 'Incorrect. To ensure accurate reproduction rates, tests should be carried out on multiple times.',
                        experience: -15
                    },
                    {
                        text: 'Pick the option that seems the best fit for the issue',
                        outcome: 'Incorrect. This is not a valid approach to determining the reproduction rate.',
                        experience: -10
                    },
                    {
                        text: 'Test once on each supported environment',
                        outcome: 'Incorrect. While testing other environments is important, multiple attempts of recreating the issue is required for accuracy.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Video Evidence',
                description: 'When recording video evidence, how many times should you ideally show the defect?',
                options: [
                    {
                        text: 'As many times as necessary to show the defect and that it can be consistently reproduced',
                        outcome: 'Correct! This is the recommended approach to recording video evidence as it provides the developer with the best chance of reproducing the defect.',
                        experience: 20, 
                    },
                    {
                        text: 'Once',
                        outcome: 'Incorrect. Whilst simple defects can be displayed one time, it is recommended to show the defect multiple times to ensure the developer has full understanding of the defect.',
                        experience: -15
                    },
                    {
                        text: 'Three times',
                        outcome: 'Incorrect. Whilst three times is a good number, it is recommended to show the defect as many times as necessary to ensure the developer has full understanding of the defect. This could be more or less depending on the complexity of the defect.',
                        experience: -10
                    },
                    {
                        text: 'Once on each supported environment',
                        outcome: 'Incorrect. If the defect is not reproducible on other environments, then it is not necessary to show the defect on other environments.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Screenshot Adjustment',
                description: 'You have taken a screenshot for evidence, how can you adjust it to be more useful to the client?',
                options: [
                    {
                        text: 'Use a tool to annotate the image to ensure the defect is clearly visible',
                        outcome: 'Correct! This ensures the defect is clearly visible and provides the client with the best chance of understanding the defect.',
                        experience: 20, 
                    },
                    {
                        text: 'Use a tool to crop the image to ensure the defect is clearly visible',
                        outcome: 'Incorrect. Cropping the image may remove important context that the client may need to understand the defect.',
                        experience: -15
                    },
                    {
                        text: 'Use a tool to adjust the brightness and contrast of the image to ensure the defect is clearly visible',
                        outcome: 'Incorrect. Adjusting the brightness and contrast may not be necessary and could be detrimental to the image.',
                        experience: -10
                    },
                    {
                        text: 'Use a tool to adjust the saturation of the image to ensure the defect is clearly visible',
                        outcome: 'Incorrect. Adjusting the saturation may not be necessary and could be detrimental to the image.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Environment Version',
                description: 'Which of the following is the correct layout for environment version for a mobile application?',
                options: [
                    {
                        text: 'iPhone 13 Pro - iOS 26.0 - Safari 26.0',
                        outcome: 'Correct! This is the correct layout for environment version for a mobile application.',
                        experience: 20, 
                    },
                    {
                        text: 'iOS 26.0 - Safari 26.0',
                        outcome: 'Incorrect. This is missing device information that may be relevant to the client.',
                        experience: -15
                    },
                    {
                        text: 'iOS 26.0',
                        outcome: 'Incorrect. This is missing browser and device information that may be relevant to the client.',
                        experience: -10
                    },
                    {
                        text: 'Safari 26.0',
                        outcome: 'Incorrect. This is missing device and operating system information that may be relevant to the client.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Severity',
                description: 'How is severity determined?',
                options: [
                    {
                        text: 'By the impact on functionality, user experience and business requirements',
                        outcome: 'Correct! If an issue has a high impact, then the severity should be adjusted accordingly.',
                        experience: 20, 
                    },
                    {
                        text: 'By how quickly the issue needs to be fixed',
                        outcome: 'Incorrect. The urgency of fixing an issue relates to priority, not severity. Severity is about impact.',
                        experience: -15
                    },
                    {
                        text: 'By how many users report the issue',
                        outcome: 'Incorrect. The number of users affected can influence priority, but severity is determined by the impact of the issue itself.',
                        experience: -10
                    },
                    {
                        text: 'By how difficult the issue is to fix',
                        outcome: 'Incorrect. The complexity of fixing an issue does not determine its severity. Severity is based on impact to users and business.',
                        experience: -5
                    }
                ]
            }
        ],

        // Advanced Scenarios (IDs 11-15, 100 XP total)
        advanced: [
            {
                id: 11,
                level: 'Advanced',
                title: 'Raising Tickets',
                description: 'After identifying an issue, how soon should you raise it?',
                options: [
                    {
                        text: 'Immediately after identifying the issue',
                        outcome: 'Correct! Immediate reporting ensures accuracy and ensures the developer has additional time to investigate and fix the issue.',
                        experience: 25, 
                    },
                    {
                        text: 'Raise it in parallel with daily reports for familiarity when writing the report',
                        outcome: 'Incorrect. While it is important to be familiar with the report, raising all tickets at the end of the day would put a large burden on both tester and developer.',
                        experience: -10
                    },
                    {
                        text: 'Batch multiple issues together to make sure testing coverage is not affected',
                        outcome: 'Incorrect. Issues should be reported as soon as they are discovered as this gives the client visibility of project status. Whilst this can be useful for cosmetic/copy defects, it\'s best to raise a ticket first, then amend the initial ticket with newly spotted instances of the defect.',
                        experience: -5
                    },
                    {
                        text: 'During stand up meetings to get the opinion of everyone involved in the project',
                        outcome: 'Incorrect. Whilst it is important to discuss major defects, these should be raised in advance and discussed during the meeting as opposed to raised during a meeting.',
                        experience: -15
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Well Written Ticket Characteristics',
                description: 'Which of the following is a characteristic of a well written ticket?',
                options: [
                    {
                        text: 'Tickets should be specific, concise, relevant, factual, understandable and timely.',
                        outcome: 'Correct! These are all characteristics of a well written ticket.',
                        experience: 25, 
                    },
                    {
                        text: 'Tickets should be detailed with extensive background information and include all possible scenarios.',
                        outcome: 'Incorrect. While details are important, tickets should be concise and focused on the specific issue. Too much information can make tickets harder to understand.',
                        experience: -15
                    },
                    {
                        text: 'Tickets should use technical jargon and acronyms to demonstrate expertise.',
                        outcome: 'Incorrect. Tickets should be written in clear, understandable language that all stakeholders can comprehend, avoiding unnecessary technical terms.',
                        experience: -10
                    },
                    {
                        text: 'Tickets can be written informally since they are internal documents.',
                        outcome: 'Incorrect. Tickets should maintain a professional and factual tone as Zoonou is independent of the client and informal writing could impact the client\'s perception of Zoonou.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Ticket Style',
                description: 'In what style should tickets be written?',
                options: [
                    {
                        text: 'Tickets should be clear, concise, jargon-free and provide factual information.',
                        outcome: 'Correct! Clear and factual writing ensures tickets can be understood by all stakeholders and helps developers efficiently address issues.',
                        experience: 25, 
                    },
                    {
                        text: 'Tickets should be written in a technical style with detailed background information.',
                        outcome: 'Incorrect. While technical details are important, overwhelming tickets with technical jargon and excessive background information can make them harder to understand and act upon.',
                        experience: -15
                    },
                    {
                        text: 'Tickets should be written in an informal style with personal opinions and subjective assessments.',
                        outcome: 'Incorrect. Tickets need to maintain professionalism and objectivity. Personal opinions and subjective assessments can lead to confusion and misinterpretation.',
                        experience: -10
                    },
                    {
                        text: 'Tickets should use creative writing to make them more engaging and memorable.',
                        outcome: 'Incorrect. Bug reports need to be straightforward and factual. Creative writing can obscure the actual issue and waste time.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Ticket Purpose',
                description: 'Within Zoonou, tickets should what?',
                options: [
                    {
                        text: 'Be consistent, with the whole team following the same approach',
                        outcome: 'Correct! A consistent approach helps maintain professional standards, improves client communication, and streamlines the bug fixing process.',
                        experience: 25, 
                    },
                    {
                        text: 'Reflect individual project manager preferences to meet specific client needs',
                        outcome: 'Incorrect. While client needs are important, inconsistent ticket formats across projects can harm our professional image and make tracking issues more difficult.',
                        experience: -15
                    },
                    {
                        text: 'Prioritize speed of ticket creation over standardization',
                        outcome: 'Incorrect. While efficiency matters, sacrificing standardization can lead to confusion, longer resolution times, and reduced client satisfaction.',
                        experience: -10
                    },
                    {
                        text: 'Adapt to match each client\'s internal ticketing style',
                        outcome: 'Incorrect. As an independent testing company, we need to maintain our own professional standards while ensuring our format works effectively for all clients. Whilst a client can request we use their format, in situations where they do not, we must adhere to our own standards.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Non-Standard Scenarios', 
                description: 'In what situation should you not use the Zoonou ticket template?',
                options: [
                    {
                        text: 'When a client requests we use their internal ticketing system',
                        outcome: 'Correct! Whilst a client can request we use their internal ticketing system, in situations where they do not, we must adhere to our own standard for tickets.',
                        experience: 25,
                    },
                    {
                        text: 'When working on a project with a tight deadline',
                        outcome: 'Incorrect. Time pressure is not a valid reason to deviate from our standard ticket template. The template helps maintain consistency and clarity regardless of project timelines.',
                        experience: -15
                    },
                    {
                        text: 'When reporting a minor or low priority issue',
                        outcome: 'Incorrect. All issues, regardless of severity or priority, should follow our standard template to ensure consistent documentation and tracking.',
                        experience: -10
                    },
                    {
                        text: 'When working with a new client for the first time',
                        outcome: 'Incorrect. Using our standard template with new clients helps establish professional expectations and demonstrates our systematic approach to issue tracking.',
                        experience: -5
                    }
                ]
            }
        ]
}