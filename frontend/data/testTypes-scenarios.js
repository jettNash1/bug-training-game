export const testTypesScenarios = {
    // Basic Scenarios (IDs 1-5)
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'API Understanding',
                description: 'What does API stand for?',
                options: [
                    {
                        text: 'Advanced Programming Interface',
                        outcome: 'Close but technically incorrect terminology',
                        experience: 0
                    },
                    {
                        text: 'Application Programming Interface',
                        outcome: 'Correct! Accurate technical definition of describing how software components communicate',
                        experience: 15
                    },
                    {
                        text: 'Automated Programming Interface',
                        outcome: 'This is a fabricated term',
                        experience: -10
                    },
                    {
                        text: 'Advanced Process Integration',
                        outcome: 'This is a fabricated term',
                        experience: -5
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Augmented Reality Testing',
                description: 'In AR (Augmented Reality) testing, what unique aspect might testers need to consider?',
                options: [
                    {
                        text: 'This should only be tested on desktop browsers',
                        outcome: 'This shows awareness of testing platforms but misses Augmented Reality specifics.',
                        experience: 0
                    },
                    {
                        text: 'Checking application performance in different lighting conditions',
                        outcome: 'Correct! This demonstrates understanding of Augmented Reality\'s unique environmental interactions.',
                        experience: 15
                    },
                    {
                        text: 'Testing for issues with colour schemes within the application only',
                        outcome: 'Focussing only on this functionality could miss issues in other areas.',
                        experience: -5
                    },
                    {
                        text: 'Verifying icons within the application under test only',
                        outcome: 'This is not a specific requirement of an Augmented Reality testing.',
                        experience: -10
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Test Email Address',
                description: 'What is the recommended email domain for test email addresses?',
                options: [
                    {
                        text: '@testing.com',
                        outcome: 'This is a generic testing domain but not the recommended one',
                        experience: 0
                    },
                    {
                        text: '@zoonou.com',
                        outcome: 'This is the company email address for employees',
                        experience: -5
                    },
                    {
                        text: '@teztr.com',
                        outcome: 'Correct! This is the address that should be used for testing purposes.',
                        experience: 15
                    },
                    {
                        text: '@example.com',
                        outcome: 'This is incorrect and unrelated',
                        experience: -10
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Application Ticket Writing',
                description: 'When testing applications, what is crucial to include in bug tickets?',
                options: [
                    {
                        text: 'The date should be included in the raised ticket',
                        outcome: 'This is partially relevant, but the information is incomplete.',
                        experience: 0
                    },
                    {
                        text: 'The application version number should be included within the ticket',
                        outcome: 'Correct! The application version number is crucial to diagnosing defects.',
                        experience: 15
                    },
                    {
                        text: 'The platform only should be included in the raised ticket',
                        outcome: 'While this is important, if it\'s the only information given, diagnosing the issue would be difficult',
                        experience: -10
                    },
                    {
                        text: 'The tester\'s name should be included in the raised ticket',
                        outcome: 'This important but not as crucial as some other information required and wouldn\'t aid the developer in debugging the issue',
                        experience: -5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Virtual Private Network Usage',
                description: 'What is a Virtual Private Network primarily used for in testing?',
                options: [
                    {
                        text: 'This is used for generating fake data',
                        outcome: 'This is related to testing, but not specific to Virtual Private Network functionality.',
                        experience: 0
                    },
                    {
                        text: 'This is used for simulating different locations',
                        outcome: 'Correct! This accurately describes Virtual Private Network usage for testing purposes.',
                        experience: 15
                    },
                    {
                        text: 'This is used for creating screenshots',
                        outcome: 'This is unrelated to Virtual Private Network usage',
                        experience: -10
                    },
                    {
                        text: 'This is used for storing test results',
                        outcome: 'This is unrelated to Virtual Private Network usage',
                        experience: -5
                    }
                ]
            }
        ],

    // Intermediate Scenarios (IDs 6-10, 100 XP total, 20 XP each)
        intermediate: [
            {
            id: 6,
            level: 'Intermediate',
            title: 'Artificial Intelligence Classifications',
            description: 'What are three classifications of Artificial Intelligence?',
            options: [
                    {
                        text: 'Basic, Advanced, Expert',
                        outcome: 'Whilst this shows an understanding of progression, the terminology is incorrect.',
                        experience: 0
                    },
                    {
                        text: 'Narrow, General, Super AI',
                        outcome: 'Correct! Classifications are described as Narrow AI (specific tasks), General AI (multiple tasks), and Super AI (unlimited capabilities)',
                        experience: 15
                    },
                    {
                        text: 'Simple, Complex, Intelligent',
                        outcome: 'These are generic categorisations',
                        experience: -5
                    },
                    {
                        text: 'Beginner, Intermediate, Advanced',
                        outcome: 'These are generic categorisations',
                        experience: -10
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Voice Skills Testing',
                description: 'When testing voice skills, what device type is most commonly used?',
                options: [
                    {
                        text: 'Laptops should be used for voice skill testing only',
                        outcome: 'This is a less suitable device for voice skill testing.',
                        experience: -10
                    },
                    {
                        text: 'Smartphones should be used for voice skill testing only',
                        outcome: 'Mobile devices can be used, but they\'re not the primary recommendation.',
                        experience: 0
                    },
                    {
                        text: 'Smart home devices should be used for voice skill testing',
                        outcome: 'Correct! Voice skill testing typically involves smart home devices like Amazon Echo, which use voice interaction',
                        experience: 15
                    },
                    {
                        text: 'Tablets should be used for voice skill testing only',
                        outcome: 'This is a less suitable device for voice skill testing',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Storage Issues',
                description: 'What should be disabled on Android devices to prevent storage issues?',
                options: [
                    {
                        text: 'Bluetooth should be disabled to prevent storage issues',
                        outcome: 'This is related to device settings, but an incorrect solution as this does not prevent frequent back ups',
                        experience: 0
                    },
                    {
                        text: 'Location services should be disabled to prevent storage issues',
                        outcome: 'This is an unrelated device management setting.',
                        experience: -5
                    },
                    {
                        text: 'Google Backup should be disabled to prevent storage issues',
                        outcome: 'Correct! Turning off Google Backup prevents frequent backups filling up the zoonoutesting Google account storage',
                        experience: 15
                    },
                    {
                        text: 'Automatic updates should be disabled to prevent storage issues',
                        outcome: 'This is an unrelated device management setting.',
                        experience: -10
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Accessibility Extensions',
                description: 'Which Chrome extension is recommended for accessibility testing?',
                options: [
                    {
                        text: 'GoFullPage is a recommended accessibility extension',
                        outcome: 'This is a screen capture tool, but not generally used for accessibility.',
                        experience: 0
                    },
                    {
                        text: 'Accessibility Insights for Web is a recommended accessibility extension',
                        outcome: 'Correct! This is useful for accessibility testing, particularly for tab stops.',
                        experience: 15
                    },
                    {
                        text: 'Viewport Dimensions is a recommended accessibility extension',
                        outcome: 'This is an unrelated browser extension.',
                        experience: -5
                    },
                    {
                        text: 'Broken Link Checker is a recommended accessibility extension',
                        outcome: 'This is an unrelated browser extension.',
                        experience: -10
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Bug Report Evidence',
                description: 'What is recommended when capturing evidence for bug tickets?',
                options: [
                    {
                        text: 'Screenshots that include the whole screen and any projects being worked on',
                        outcome: 'This could compromise confidentiality if any other client work was captured.',
                        experience: -10
                    },
                    {
                        text: 'All audio should be kept when capturing video evidence',
                        outcome: 'Only audio specific to the actual issue should be captured as this could compromise professional standards set by Zoonou.',
                        experience: -5
                    },
                    {
                        text: 'Hide bookmarks bar and avoid showing other client work',
                        outcome: 'Correct! This protects client confidentiality and practices professionalism when capturing evidence.',
                        experience: 15
                    },
                    {
                        text: 'Use maximum resolution always when capturing evidence',
                        outcome: 'Whilst important, this is not always essential.',
                        experience: 0
                    }
                ]
            }
        ],
        // Advanced Scenarios (IDs 11-15, 125 XP total, 25 XP each)
        advanced: [
            {
                id: 11,
                level: 'Advanced',
                title: 'Application Program Interface Testing Preparation',
                description: 'In Application Program Interface testing, what is most important before beginning?',
                options: [
                    {
                        text: 'Having access to complete documentation from the client',
                        outcome: 'While important, other details are also required outside of documentation like contact information for developers for testing recommendations',
                        experience: 0
                    },
                    {
                        text: 'Understanding endpoints and access methods is important',
                        outcome: 'Correct! Knowing URLs, access methods, and having a point of contact with developers before Application Program Interface testing is recommended',
                        experience: 25
                    },
                    {
                        text: 'Knowing all possible user interactions is most important',
                        outcome: 'This does not cover the most essential aspects needed for preparation like correct URL\'s and access methods.',
                        experience: -5
                    },
                    {
                        text: 'Having the latest testing tools is most important',
                        outcome: 'This is not an essential requirement and many tools can be utilised for different purposes',
                        experience: -10
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Intelligent Systems',
                description: 'What quality characteristics are considered when testing intelligent systems?',
                options: [
                    {
                        text: 'Speed and colour should be considered for intelligent system testing',
                        outcome: 'This recognises some technical considerations but not all characteristics.',
                        experience: 0
                    },
                    {
                        text: 'Flexibility, autonomy, ethics and safety should be considered for intelligent system testing',
                        outcome: 'Correct! Characteristics like Flexibility, Autonomy, Evolution, Bias, Ethics, Transparency, and Safety for AI testing are recommended practices',
                        experience: 25
                    },
                    {
                        text: 'Memory and processing power should be considered for intelligent system testing',
                        outcome: 'These are not characteristics to be considered',
                        experience: -5
                    },
                    {
                        text: 'User interface design should be considered for intelligent system testing',
                        outcome: 'This is not characteristic to be considered',
                        experience: -10
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Windows Commands',
                description: 'When testing file uploads, what Windows command can generate large files?',
                options: [
                    {
                        text: 'mkdir',
                        outcome: 'This is related to file manipulation, but incorrect',
                        experience: 0
                    },
                    {
                        text: 'fsutil file createnew',
                        outcome: 'Correct! The fsutil command is used to generate large test files of specific sizes.',
                        experience: 25
                    },
                    {
                        text: 'touch',
                        outcome: 'This is not a windows command.',
                        experience: -10
                    },
                    {
                        text: 'create file',
                        outcome: 'This is an unrelated command.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Samsung Device Testing',
                description: 'What should be checked on Samsung devices during testing?',
                options: [
                    {
                        text: 'Battery percentage should be checked during application or website testing',
                        outcome: 'This is related to device settings but would not be essential focus for testing',
                        experience: 0
                    },
                    {
                        text: 'Default font size setting should be checked during application or website testing',
                        outcome: 'Correct! Checking that font size is set to default on Samsung devices can expose rendering issues.',
                        experience: 25
                    },
                    {
                        text: 'Accounts & Back Up should be checked during application or website testing',
                        outcome: 'This would not directly affect general testing activities',
                        experience: -10
                    },
                    {
                        text: 'Safety & Emergency should be checked during application or website testing',
                        outcome: 'This would not directly affect general testing activities',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Screen Recording Size Limitations',
                description: 'What is recommended for capturing large screen recording files with size limitations?',
                options: [
                    {
                        text: 'Use higher resolution when capturing large screen recordings',
                        outcome: 'This suggests quality modification but may be ineffective in reducing a file size.',
                        experience: -5
                    },
                    {
                        text: 'Compress using tools like HandBrake or convert to GIF when capturing large screen recordings',
                        outcome: 'Correct! Using tools like HandBrake or converting to a lower-fps GIF to reduce file size for ticket uploads is recommended.',
                        experience: 25
                    },
                    {
                        text: 'Split the video manually when capturing large screen recordings',
                        outcome: 'While this may help it is time consuming and an ineffective use of time management.',
                        experience: 0
                    },
                    {
                        text: 'Use external storage when capturing large screen recordings',
                        outcome: 'This doesn\'t address the file size if limitations are in place for uploads.',
                        experience: -10
                    }
                ]
            }
        ]
}