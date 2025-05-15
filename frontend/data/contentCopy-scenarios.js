export const contentCopyScenarios = {
        // Basic Scenarios (IDs 1-10, expanded from 1-5)
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Primary objective',
                description: 'What is the primary focus of copy proofing?',
                options: [
                    {
                        text: 'Testing the functionality of the software',
                        outcome: 'Functionality testing is explicitly out of scope for copy proofing.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Checking grammar, spelling, and typos in content',
                        outcome: 'Correct! This is the core purpose of copy proofing.',
                        experience: 15,
                        isCorrect: true
                    },
                    {
                        text: 'Verifying user interface design matches submitted documentation',
                        outcome: 'While content proofing includes some UI elements, copy proofing specifically focuses on text content.',
                        experience: 5,
                        isCorrect: false
                    },
                    {
                        text: 'Testing cross-browser compatibility with supported environments',
                        outcome: 'This is a functional testing concern, not related to copy proofing.',
                        experience: -5,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Content proofing scope',
                description: 'When conducting content proofing, what is considered out of scope?',
                options: [
                    {
                        text: 'Any spelling errors throughout the system under test',
                        outcome: 'Spelling errors are a key focus of content proofing.',
                        experience: -10
                    },
                    {
                        text: 'Grammatical mistakes throughout the system under test',
                        outcome: 'Grammar checking is a fundamental part of content proofing.',
                        experience: -5
                    },
                    {
                        text: 'Software functionality issues throughout the system under test',
                        outcome: 'Correct! functionality is out of scope for content testing.',
                        experience: 15
                    },
                    {
                        text: 'Content consistency throughout the system under test',
                        outcome: 'While consistency is important, some aspects might be out of scope depending on the project and client recommendations.',
                        experience: 5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Main objectives',
                description: 'When conducting content proofing, what can be considered as main objectives?',
                options: [
                    {
                        text: 'Ensuring quality of the product',
                        outcome: 'Correct! This is a primary objective of content proofing.',
                        experience: 15
                    },
                    {
                        text: 'Improving website loading speed',
                        outcome: 'This is a technical performance concern, not related to content.',
                        experience: -10
                    },
                    {
                        text: 'Testing payment systems',
                        outcome: 'This is a functional testing concern.',
                        experience: -5
                    },
                    {
                        text: 'Optimizing database performance',
                        outcome: 'While quality-related, this is not a content proofing objective',
                        experience: 5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Attention to detail',
                description: 'Why is attention to detail important in content proofing',
                options: [
                    {
                        text: 'To find security vulnerabilities that might compromise the system',
                        outcome: 'Security testing is separate to content proofing.',
                        experience: -10
                    },
                    {
                        text: 'To maintain client confidence in quality work',
                        outcome: 'Correct! This is within the main characteristics of content testing.',
                        experience: 15
                    },
                    {
                        text: 'To improve server performance and response times',
                        outcome: 'This is not related to content proofing',
                        experience: -5
                    },
                    {
                        text: 'To reduce development costs with less build releases required',
                        outcome: 'While good quality can reduce costs, it\'s not the primary reason for attention to detail',
                        experience: 5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Changes to content requirements',
                description: 'What can happen if content changes occur after testing?',
                options: [
                    {
                        text: 'Previous testing will become completely invalid',
                        outcome: 'Not all testing will become invalid, but some changes may make prior testing redundant.',
                        experience: 5
                    },
                    {
                        text: 'The functionality of the system under test will be affected',
                        outcome: 'Introducing content changes should not cause functionality issues.',
                        experience: -10
                    },
                    {
                        text: 'Previous content copy testing may be partially voided',
                        outcome: 'Correct! This is a risk to content changes during the testing cycle',
                        experience: 15
                    },
                    {
                        text: 'The client must restart the project to introduce new content',
                        outcome: 'While content changes may affect some areas already tested, it is not considered to fully re-test all content again',
                        experience: 5
                    }
                ]
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Content Proofing Risks',
                description: 'Which of the following is not a risk or disadvantage of content proofing?',
                options: [
                    {
                        text: 'Content proofing typically costs more than other types of testing',
                        outcome: 'Correct! content proofing doesn\'t cost any more than other types of testing general.',
                        experience: 15,
                        tool: 'Content Proofing Risks'
                    },
                    {
                        text: 'Changes to content after testing may void previous verification',
                        outcome: 'This is a risk when performing content proofing as there could be changes to content that have already been tested.',
                        experience: -5
                    },
                    {
                        text: 'High volumes of small issues can be time-consuming to report individually',
                        outcome: 'This is a risk as it can be time-consuming and grouping issues by section should be a general approach.',
                        experience: -10
                    },
                    {
                        text: 'Testing without a copy deck to compare against may be less in-depth',
                        outcome: 'This can be a test limitation if clients don\'t provide reference materials.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Placeholder Testing',
                description: 'When is it appropriate to raise blurry/placeholder images as a defect',
                options: [
                    {
                        text: 'Only when the client specifically requests image quality checks',
                        outcome: 'This type of test should be treated as standard content checking.',
                        experience: -5
                    },
                    {
                        text: 'Only when found in production environments, not in development',
                        outcome: 'The environment under test should be priority and there shouldn\'t be any restrictions unless stated by the client.',
                        experience: -10
                    },
                    {
                        text: 'It depends on the scale and focus of the project',
                        outcome: 'Correct! They can be raised either as a content or \'for reference\' ticket depending on the scale & focus of the project.',
                        experience: 15,
                        tool: 'Placeholder Testing'
                    },
                    {
                        text: 'Only when comparing against a design document',
                        outcome: 'These type of issues can be raised even without comparing against design documents.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Documentation Inconsistencies',
                description: 'What should a tester do when they notice inconsistencies with documentation in a project where content is not the main focus?',
                options: [
                    {
                        text: 'Ignore them as they\'re not relevant to the project\'s focus',
                        outcome: 'These issues should still be raised as a query.',
                        experience: -5
                    },
                    {
                        text: 'These types of issues should be raised as critical defects',
                        outcome: 'Inconsistencies should be raised as queries, especially when content isn\'t the main focus.',
                        experience: -10
                    },
                    {
                        text: 'These should be raised as queries in case the designs are not up to date',
                        outcome: 'Correct! when the content is not a main focus of the project, this can be raised as a query in case the designs are not up to date.',
                        experience: 15,
                        tool: 'Documentation Inconsistencies'
                    },
                    {
                        text: 'Implement corrections without consulting the client',
                        outcome: 'The standard process of raising tickets or queries should be followed before anything can be updated within documentation.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Content Proofing Characteristics',
                description: 'What testing characteristic is specifically important for content proofing?',
                options: [
                    {
                        text: 'Attention to detail',
                        outcome: 'Correct! Attention to detail is a key characteristic of content proofing tests.',
                        experience: 15,
                        tool: 'Contant Proofing Characteristics'
                    },
                    {
                        text: 'Technical knowledge',
                        outcome: 'Technical knowledge is not a required test characteristic unlike attention to detail.',
                        experience: -10
                    },
                    {
                        text: 'Speed of execution.',
                        outcome: 'Speed of execution is not a required testing technique for content proofing and could lead to missed defects.',
                        experience: -5
                    },
                    {
                        text: 'Programming expertise.',
                        outcome: 'Programming knowledge is not a required test characteristic unlike attention to detail',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Content Proofing Test Execution',
                description: 'When content proofing is occurring alongside functional testing on a project, what is true?',
                options: [
                    {
                        text: 'Both can occur, with content proofing focusing only on content issues',
                        outcome: 'Correct! both can occur at the same time with content proofing maintaining its specific focus.',
                        experience: 15,
                        tool: 'Content Proofing Test Execution'
                    },
                    {
                        text: 'Content proofing must be completed before functional testing begins',
                        outcome: 'Content proofing can take place at any time during the testing process as long as the client has provided the relevant documentation.',
                        experience: -10
                    },
                    {
                        text: 'Functional testing takes priority over content proofing',
                        outcome: 'There should only be a priority based on the clients needs.',
                        experience: -5
                    },
                    {
                        text: 'Content proofing cannot be performed effectively when functional testing is also being done',
                        outcome: 'Content proofing can occur alongside functional testing for some projects.',
                        experience: 0
                    }
                ]
            }
        ],

        // Intermediate Scenarios (IDs 6-10, 100 XP total, 20 XP each)
        intermediate: [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Operating system content consistency',
                description: 'When comparing Android and iOS versions of an application, what should testers look for?',
                options: [
                    {
                        text: 'Different operating system versions must be observed for inconsitencies',
                        outcome: 'This is a technical consideration, not a content concern.',
                        experience: -10
                    },
                    {
                        text: 'Consistent user experience across all supported platforms',
                        outcome: 'Correct! Content testing should specifically addresses platform consistency.',
                        experience: 20
                    },
                    {
                        text: 'Discrepancies between different screen sizes',
                        outcome: 'While relevant for content display, it\'s not the primary focus',
                        experience: 5
                    },
                    {
                        text: 'Battery consumption differences across the supported environments',
                        outcome: 'This is a technical performance concern and not related to content',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Volume of raised content issues',
                description: 'What is a recommended approach when dealing with a high volume of small issues?',
                options: [
                    {
                        text: 'Leave minor issues undocumented to stay in line with specific time constraints',
                        outcome: 'All issues should be documented appropriately.',
                        experience: -10
                    },
                    {
                        text: 'Group all raised issues by content section they fall under',
                        outcome: 'Correct! This is the recommended way of reporting issues for ease of identification.',
                        experience: 20
                    },
                    {
                        text: 'Report only critical issues to stay in line with specific time constraints',
                        outcome: 'While issues may be considered minor, some would still be considered important to the client and user',
                        experience: -5
                    },
                    {
                        text: 'Create separate tickets for each typo found during testing activities',
                        outcome: 'While thorough, this could be too time-consuming and grouping under specific areas is preferred',
                        experience: 5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Reviewing images',
                description: 'What should testers consider when reviewing images across environments?',
                options: [
                    {
                        text: 'Image file size and any issue regarding this area',
                        outcome: 'While important, this is too narrow a testing focus. Image quality and resolution should also be considered',
                        experience: 5
                    },
                    {
                        text: 'Image loading speed to check for response time issues',
                        outcome: 'This is a performance concern and not a content issue.',
                        experience: -10
                    },
                    {
                        text: 'Image quality and resolution across all environments',
                        outcome: 'Correct! These are a primary factors in reviewing image content',
                        experience: 20
                    },
                    {
                        text: 'Number of images that can be used across the system under test',
                        outcome: 'This is a design decision and not a content proofing concern',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Provided requirements',
                description: 'How does the absence of a copy deck affect testing?',
                options: [
                    {
                        text: 'Testing will become impossible as there is no documentation to refer to',
                        outcome: 'Testing can still proceed with limited scope and tester knowledge.',
                        experience: -5
                    },
                    {
                        text: 'Testing becomes limited to grammar and punctuation',
                        outcome: 'Correct! This is a risk of documentation not being provided by the client.',
                        experience: 20
                    },
                    {
                        text: 'Testing without documentation requires more time',
                        outcome: 'While potentially true, it\'s not the main impact as grammar and spelling can still be tested',
                        experience: 5
                    },
                    {
                        text: 'Testing must then become automated to move forward',
                        outcome: 'Automation is not a method use for content testing',
                        experience: -10
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Localisation',
                description: 'What role does localisation play in content proofing?',
                options: [
                    {
                        text: 'None, as localisation is generally it\'s out of scope for content proofing',
                        outcome: 'Localisation is an important part of content testing if required by the client.',
                        experience: -10
                    },
                    {
                        text: 'This focuses on technical terms throughout the system under test',
                        outcome: 'While technical terms should be included, this is a risk of narrow scoping.',
                        experience: 5
                    },
                    {
                        text: 'Reviewing content appropriateness for a target market',
                        outcome: 'Correct! Market considerations should be considered',
                        experience: 20
                    },
                    {
                        text: 'Checking page and content load times across all environments',
                        outcome: 'This is a performance concern and not part of content testing',
                        experience: -10
                    }
                ]
            }
        ],

        // Advanced Scenarios (IDs 11-15, 125 XP total, 25 XP each)
        advanced: [
            {
                id: 11,
                level: 'Advanced',
                title: 'Platform content inconsistencies',
                description: 'How should testers approach platform inconsistencies between mobile versions?',
                options: [
                    {
                        text: 'These should be treated as minor issues and only reported if time constraints allow',
                        outcome: 'All inconsistencies should be documented no matter what severity they are.',
                        experience: -10
                    },
                    {
                        text: 'Document differences only if specified in requirements',
                        outcome: 'While the client may have specified areas of scope, they may not have considered all critical areas relating to customer usage.',
                        experience: 5
                    },
                    {
                        text: 'Report all differences between environments unless variation is specified in documentation',
                        outcome: 'Correct! This is considered the correct approach',
                        experience: 25
                    },
                    {
                        text: 'Focus only on issues found on iOS supported devices',
                        outcome: 'All supported environments require equal attention',
                        experience: -10
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Functional & Content testing relationship',
                description: 'What is the relationship between content proofing and functional testing in a project?',
                options: [
                    {
                        text: 'They must always be conducted separately',
                        outcome: 'Functional & Content testing can be combined during testing activities.',
                        experience: -5
                    },
                    {
                        text: 'They can be combined or separate based on project needs',
                        outcome: 'Correct! This technique can be used on most projects dependent on client needs.',
                        experience: 25
                    },
                    {
                        text: 'They must always be combined to maximise test coverage',
                        outcome: 'Only some projects may need content proofing which would be advised by the client',
                        experience: -10
                    },
                    {
                        text: 'Content proofing must come first in the testing cycle',
                        outcome: 'While sometimes logical, it\'s not always a requirement',
                        experience: 5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Content discrepancies within documentation',
                description: 'How should testers handle content that differs from provided design documentation?',
                options: [
                    {
                        text: 'Automatically reject the content as failed',
                        outcome: 'Obvious differences can be raised, yet minor differences can be communicated to the client first before raising.',
                        experience: -10
                    },
                    {
                        text: 'disregard differences in older designs',
                        outcome: 'This could lead to missing important inconsistencies.',
                        experience: -5
                    },
                    {
                        text: 'Raise as a query to verify if designs are current',
                        outcome: 'Correct! This approach gives the client visibility and prompts confirmation for moving forward',
                        experience: 25
                    },
                    {
                        text: 'Check content updates and query any inconsistencies',
                        outcome: 'Whilst checking current updates is important, potential issues could be missed within prior documentation areas',
                        experience: 5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Tester documentation',
                description: 'What impact does the quality of tester documentation have on content proofing?',
                options: [
                    {
                        text: 'No impact as they\'re separate concerns',
                        outcome: 'If a tester can\'t maintain high standards in their own documentation, it raises doubts about their ability to identify content issues.',
                        experience: -10
                    },
                    {
                        text: 'It affects client confidence in testing quality',
                        outcome: 'Correct! It creates a professional impression that reinforces the value of the testing service.',
                        experience: 25
                    },
                    {
                        text: 'It only impacts internal processes',
                        outcome: 'This is partially correct, although it overlooks how documentation quality influences client relationships',
                        experience: 5
                    },
                    {
                        text: 'It reduces testing productivity and volume',
                        outcome: 'There\'s no direct correlation between documentation quality and testing speed',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Content Prioritisation',
                description: 'How should testers prioritise different types of content issues?',
                options: [
                    {
                        text: 'All issues are equally important and should be reported as such',
                        outcome: 'Not all issues have equal impact.',
                        experience: -10
                    },
                    {
                        text: 'Focus testing activities on spelling errors',
                        outcome: 'This is too narrow in focus and other critical content issues may be missed.',
                        experience: -5
                    },
                    {
                        text: 'Evaluate impact on user experience and brand consistency',
                        outcome: 'Correct! This is the correct approach for prioritisation of issues',
                        experience: 25
                    },
                    {
                        text: 'Prioritise issues based on page location',
                        outcome: 'This can be relevant to the project. However, other critical issues may be missed by taking this approach',
                        experience: 5
                    }
                ]
            }
        ]
    }