export const newTicketTemplateScenarios = {
        // Basic Scenarios (IDs 1-5, 75 XP total)
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Raising Tickets',
                description: 'After identifying an issue, how soon should you raise it?',
                options: [
                    {
                        text: 'Immediately after identifying and investigating the issue',
                        outcome: 'Correct - Immediate reporting ensures accuracy and ensures the developer has additional time to investigate and fix the issue.',
                        experience: 15, 
                    },
                    {
                        text: 'Raise it in parallel with daily reports for familiarity when writing the report',
                        outcome: 'While familiarisation with issues whilst writing the report is important, raising all tickets at the end of the day would put a large burden on both tester and developer.',
                        experience: -10
                    },
                    {
                        text: 'Batch multiple issues together to make sure testing coverage is not affected',
                        outcome: 'Issues should be reported as soon as they are discovered as this gives the client visibility of project status. Whilst this can be useful for cosmetic/copy defects, it\'s best to raise a ticket first, then amend the initial ticket with newly spotted instances of the defect.',
                        experience: 0
                    },
                    {
                        text: 'During stand up meetings to get the opinion of everyone involved in the project',
                        outcome: 'Whilst it is important to discuss major defects, these should be raised in advance and discussed during the meeting as opposed to raised during a meeting.',
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Well Written Ticket Characteristics',
                description: 'Which of the following is a characteristic of a well written ticket?',
                options: [
                    {
                        text: 'Tickets should be specific, concise, relevant, factual, understandable and timely.',
                        outcome: 'Correct - These are all characteristics of a well written ticket.',
                        experience: 15, 
                    },
                    {
                        text: 'Tickets should be detailed with extensive background information and include all possible scenarios.',
                        outcome: 'While details are important, tickets should be concise and focused on the specific issue. Too much information can make tickets harder to understand.',
                        experience: -5
                    },
                    {
                        text: 'Tickets should use a technical approach and acronyms to demonstrate expertise.',
                        outcome: 'Tickets should be written in clear, understandable language that all stakeholders can comprehend, avoiding unnecessary technical terms.',
                        experience: -10
                    },
                    {
                        text: 'Tickets can be written informally to promote familiarity with the client.',
                        outcome: 'Tickets should maintain a professional and factual tone as Zoonou is independent of the client and informal writing could impact the client\'s perception of Zoonou.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Ticket Purpose',
                description: 'Within Zoonou, tickets should what?',
                options: [
                    {
                        text: 'Be consistent, with the whole team following the same approach',
                        outcome: 'Correct - A consistent approach helps maintain professional standards, improves client communication, and streamlines the bug fixing process.',
                        experience: 15, 
                    },
                    {
                        text: 'Reflect individual project manager preferences to meet specific client needs',
                        outcome: 'While client needs are important, inconsistent ticket formats across projects can harm our professional image and make tracking issues more difficult.',
                        experience: -5
                    },
                    {
                        text: 'Prioritize speed of ticket creation over standardization',
                        outcome: 'While efficiency matters, sacrificing standardization can lead to confusion, longer resolution times, and reduced client satisfaction.',
                        experience: -10
                    },
                    {
                        text: 'Adapt to match each client\'s internal ticketing style',
                        outcome: 'As an independent testing company, we need to maintain our own professional standards while ensuring our format works effectively for all clients. Whilst a client can request we use their format, in situations where they do not, we must adhere to our own standards.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Non-Standard Scenarios', 
                description: 'In what situation should you not use the Zoonou ticket template?',
                options: [
                    {
                        text: 'When a client requests we use their internal ticketing system',
                        outcome: 'Correct - Whilst a client can request we use their internal ticketing system, in situations where they do not, we must adhere to our own standard for tickets.',
                        experience: 15,
                    },
                    {
                        text: 'When working on a project with a tight deadline',
                        outcome: 'Time pressure is not a valid reason to deviate from our standard ticket template. The template helps maintain consistency and clarity regardless of project timelines.',
                        experience: -5
                    },
                    {
                        text: 'When reporting a minor or low priority issue',
                        outcome: 'All issues, regardless of severity or priority, should follow our standard template to ensure consistent documentation and tracking.',
                        experience: -10
                    },
                    {
                        text: 'When working with a regular client who you have regular and good verbal communication with',
                        outcome: 'Zoonou\'s standard template should be used regardless of a common understanding with the client as new people and stakeholders can always become part of the project who are not involved in meetings.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Zoonou Approach', 
                description: 'Which one of the following issue summaries resemble the correct Zoonou approach to writing tickets?',
                options: [
                    {
                        text: 'It has been observed that the app crashes immediately after selecting a photo to upload as a profile picture \n It is expected that the app does not crash',
                        outcome: 'Using phrases like "It has been observed" and "It is expected" makes tickets unnecessarily verbose. The issue should be stated directly and clearly.',
                        experience: 0,
                    },
                    {
                        text: 'The app crashes immediately after selecting a photo to upload as a profile picture \n It is expected that the app does not crash',
                        outcome: 'While this is concise, including "It is expected" statements is redundant. The expected behavior should be clear from the issue description.',
                        experience: -5
                    },
                    {
                        text: 'When uploading a photo to set as a profile picture, the application crashes immediately after the image is selected. \n It is expected that the app does not crash',
                        outcome: 'The issue description is clear but adding "It is expected" statements is unnecessary and makes the ticket longer than needed.',
                        experience: -10
                    },
                    {
                        text: 'When uploading a photo to set as a profile picture, the application crashes immediately after the image is selected.',
                        outcome: 'This is the correct format - clear, concise, and describes the exact steps and behavior without unnecessary phrases like "It has been observed" or "It is expected".',
                        experience: 15
                    }
                ]
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Ticket Raising',
                description: 'What should you do before raising a ticket?',
                options: [
                    {
                        text: 'You should check if there are specific client requests for raising issues',
                        outcome: 'Correct - Consider if there are any specific requests from the client on how they would like issues to be raised to the tracker. You can generally find this information out by looking at the Operational Project Details document.',
                        experience: 15,
                    },
                    {
                        text: 'You should request confirmation of the issue from another tester’',
                        outcome: 'While issues are posted within the channel to increase team awareness, tickets must be raised as they are observed and shouldn\'t be delayed.',
                        experience: -10
                    },
                    {
                        text: 'You should discuss with the development team how to fix the issue',
                        outcome: 'Testers are responsible for reporting issues, not determining how they should be fixed.',
                        experience: -5
                    },
                    {
                        text: 'You should contact the client to confirm if it is a known issue',
                        outcome: 'Whilst true in some instances, this could pose a risk to test coverage with time spent on contacting the client for every issue.',
                        experience: 0
                    }
                ]
            },
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
                        text: 'Test one time on one environment to ensure accurate reproduction rate',
                        outcome: 'To ensure accurate reproduction rates, tests should be carried out on multiple times.',
                        experience: -15
                    },
                    {
                        text: 'Test multiple times and determine the most applicable reproduction statement from the options provided within the ticket template',
                        outcome: 'Correct - This provides an accurate understanding of the reproduction rate and follows the Zoonou approach to writing tickets.',
                        experience: 20, 
                    },
                    {
                        text: 'Test the primary environment only and determine the reproduction rate from multiple outcomes’',
                        outcome: 'While the primary environment the issue was found is important, it is essential that other commonly used environments are verified as well.',
                        experience: -10
                    },
                    {
                        text: 'Test once on each supported environment',
                        outcome: 'While testing other environments is important, multiple attempts of recreating the issue is required for accuracy.',
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
                        outcome: 'Correct - This is the recommended approach to recording video evidence as it provides the developer with the best chance of reproducing the defect.',
                        experience: 20, 
                    },
                    {
                        text: 'Once, as this proves the issue has occurred',
                        outcome: 'Whilst simple defects can be displayed one time, it is recommended to show the defect multiple times to ensure the developer has full understanding of the defect.',
                        experience: -15
                    },
                    {
                        text: 'Multiple times to demonstrate that the issue can be reproduced',
                        outcome: 'It is recommended to show the defect as many times as necessary to ensure the developer has full understanding of the defect. This could be achieved with one demonstration depending on the complexity of the defect.',
                        experience: -10
                    },
                    {
                        text: 'Once on each supported environment',
                        outcome: 'If the defect is exactly the same on other environments, then it is not necessary to show the defect on those environments, as long as the reproduction rate and other environments sections have been detailed in the ticket.',
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
                        text: 'Use a tool to crop the image to ensure the defect is clearly visible',
                        outcome: 'Cropping the image may remove important context that the client may need to understand the defect.',
                        experience: -15
                    },
                    {
                        text: 'Use a tool to adjust the brightness and contrast of the image to ensure the defect is clearly visible',
                        outcome: 'Adjusting the brightness and contrast may not be necessary and could be detrimental to the image.',
                        experience: -10
                    },
                    {
                        text: 'Use a tool to adjust the saturation of the image to ensure the defect is clearly visible',
                        outcome: 'Adjusting the saturation may not be necessary and could be detrimental to the image.',
                        experience: -5
                    },
                    {
                        text: 'Use a tool to annotate the image to ensure the defect is clearly visible',
                        outcome: 'Correct - This ensures the defect is clearly visible and provides the client with the best chance of understanding the defect.',
                        experience: 20, 
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
                        outcome: 'Correct - This is the correct layout for environment version for a mobile application.',
                        experience: 20, 
                    },
                    {
                        text: 'iOS 26.0 - Safari 26.0',
                        outcome: 'This is missing device information that may be relevant to the client.',
                        experience: -15
                    },
                    {
                        text: 'iPhone - iOS 26.0',
                        outcome: 'This is missing browser and device model information that may be relevant to the client.',
                        experience: -10
                    },
                    {
                        text: 'iPhone - iOS 26.0 - Safari 26.0',
                        outcome: 'This is missing device model that may be relevant to the client.',
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
                        outcome: 'Correct - If an issue has a high impact, then the severity should be adjusted accordingly.',
                        experience: 20, 
                    },
                    {
                        text: 'By how quickly the issue needs to be fixed',
                        outcome: 'The urgency of fixing an issue relates to priority, not severity. Severity is about impact and generally its is the clients responsibility to determine priority.',
                        experience: -15
                    },
                    {
                        text: 'By how many users have reported the issue in post production',
                        outcome: 'The number of users affected can influence priority, but severity is determined by the impact of the issue itself.',
                        experience: -10
                    },
                    {
                        text: 'By how difficult the issue is to fix according to feedback from the development team',
                        outcome: 'The complexity of fixing an issue does not determine its severity. Severity is based on impact to users and business.',
                        experience: -5
                    }
                ]
            },
            {
                id: 17,
                level: 'Intermediate',
                title: 'Supporting Material',
                description: 'What is the most appropriate supporting material to include for an issue with a low reproduction rate?',
                options: [
                    {
                        text: 'A brief textual description should be included for development team consideration.',
                        outcome: 'Evidence should be included for defects with low reproducibility rates as it allows the developer to clearly see what the defect is.',
                        experience: -10
                    },
                    {
                        text: 'A step-by-step guide should be included for development team consideration',
                        outcome: 'While steps to reproduce are important, for issues that are difficult to reproduce visual evidence is also crucial.', 
                        experience: -15
                    },
                    {
                        text: 'A video or annotated screenshot showing the issue occurring should be included to accompany steps to reproduce',
                        outcome: 'Correct - Adding evidence can assist with identifying the root cause of the defect. For defects with low replicability rates, it allows the developer to clearly see what the defect is.',
                        experience: 20,
                    },
                    {
                        text: 'A detailed technical analysis of the code causing the issue should be included',
                        outcome: 'Testers typically don\'t provide code analysis in tickets. Tickets should use clear and non-technical language and be focused on the observed behaviour rather than technical diagnoses.',
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
                title: 'Phrasing',
                description: 'What phrases should you avoid when writing a ticket?',
                options: [
                    {
                        text: '\'It has been observed\' or \'It is expected\'',
                        outcome: 'Correct - These phrases are direct but often overused and add additional noise to the ticket.',
                        experience: 25, 
                    },
                    {
                        text: '\'As per the user manual\' or \'As per the documentation\'',
                        outcome: 'These phrases are more specific and add valuable context to the ticket.',
                        experience: -10
                    },
                    {
                        text: '\'As per the specification\' or \'As per the requirements\'',
                        outcome: 'These phrases directly reference requirements and add clarity to the ticket.',
                        experience: -15
                    },
                    {
                        text: '\'Whilst viewing the website\' or \'Whilst using the application\'',
                        outcome: 'These are common ways of identifying the environment but are not always necessary as you could be specific regarding the location of the issue.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Acronyms',
                description: 'When should you use an acronym within a ticket?',
                options: [
                    {
                        text: 'When the acronym is commonly used within prior client communication',
                        outcome: 'While this may be true, it is not always necessary to use an acronym, as it can be confusing for business users.',
                        experience: -10
                    },
                    {
                        text: 'Never, tickets need to be understandable by all team members, not just those who may be familiar with jargon',
                        outcome: 'Correct - Business users may view the ticket but may not be familiar with acronyms, so we need to use language anyone can understand.',
                        experience: 25, 
                    },
                    {
                        text: 'Always, as client and developers will be familiar with those used within their products',
                        outcome: 'Tickets will be accessible to a number of stakeholders and not all may be familiar with acronyms. Having to rewrite a ticket if it cannot be understood by the intended audience.',
                        experience: -15
                    },
                    {
                        text: 'For file types like \'API.txt\' or \'image.png\'',
                        outcome: 'Whilst true, file types are standardised as acronyms so we don\'t need to write the full term',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Supporting Material',
                description: 'Aside from Video and Screenshots, what else can be used as supporting material?',
                options: [
                    {
                        text: 'References to documentation, log files from the browser console, relevant error codes and other related materials',
                        outcome: 'Correct - Supporting material should not simply be limited to video and screenshots, other materials can be used to help the developer understand the issue.',
                        experience: 25
                    },
                    {
                        text: 'Written descriptions of the issues should be sufficient if they are concisely written.',
                        outcome: 'Written descriptions alone are often insufficient - supporting evidence helps developers understand and reproduce issues more effectively.',
                        experience: -15
                    },
                    {
                        text: 'Personal opinions about the severity and priority of the issue',
                        outcome: 'Tickets should remain factual and objective. Personal opinions about severity and priority are not appropriate supporting materials.',
                        experience: -10,
                    },
                    {
                        text: 'Code snippets showing how to fix the issue',
                        outcome: 'Testers should focus on describing and evidencing the issue, not suggesting code fixes which is the developer\'s responsibility.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Additional Environments',
                description: 'When should you include devices in the \'Also observed on\' section?',
                options: [
                    {
                        text: 'When the issue is more severe than on the primary environment',
                        outcome: 'Severity is detailed elsewhere in the ticket and ideally the most severe would be the primary environment',
                        experience: -10
                    },
                    {
                        text: 'One primary environment is generally enough to demonstrate the issue',
                        outcome: 'Additional environments can help developers understand the scope of the issue and aid in debugging',
                        experience: -15
                    },
                    {
                        text: 'When specifically requested by developers or the client',
                        outcome: 'While developer requests are important, you should proactively include supported environments to provide complete information',
                        experience: -5
                    },
                    {
                        text: 'When the defect affects a wide range of devices or the developers may require additional context',
                        outcome: 'Correct - This is a valid reason to include additional environments in the \'Also observed on\' section',
                        experience: 25, 
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Believed to be',
                description: 'Assuming an issue has only been observed on iOS Tablet environments, which of the following would best fit the \'Believed to be\' section of a ticket?',
                options: [
                    {
                        text: 'Believed to be iOS Tablet',
                        outcome: 'Correct - This is the most relevant option and would be the best fit for the \'Believed to be\' section',
                        experience: 25, 
                    },
                    {
                        text: 'Believed to be iOS Related',
                        outcome: 'iOS related would refer to MacOS or iPhone as well and not just tablet environments',
                        experience: -10
                    },
                    {
                        text: 'Believed to be Global Tablet',
                        outcome: 'The bug only occurs on iOS Tablet environments, so it cannot be global',
                        experience: -15
                    },
                    {
                        text: 'Believed to be iOS and Tablet',
                        outcome: 'Whilst it does accurately describe the issue, it is not an option within the ticket template',
                        experience: -5
                    }
                ]
            }
        ]
}