export const CMSTestingScenarios = {
        // Basic Scenarios (IDs 1-5)
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Understanding content management systems',
                description: 'What is the primary purpose of a CMS (Content Management System)?',
                options: [
                    {
                        text: 'It allows users to create, manage, and modify digital content without specialised technical knowledge',
                        outcome: 'Perfect! This is the core purpose of a content management system.',
                        experience: 15,
                    },
                    {
                        text: 'To write code to display content on the front end of a website',
                        outcome: 'content management system is for content management by non-technical users.',
                        experience: -5,
                    },
                    {
                        text: 'It is used for file storage that can be accessed and downloaded for use on external websites',
                        outcome: 'content management system has broader content management capabilities including, publishing content and Search Engine Optimisation management.',
                        experience: -10,
                    },
                    {
                        text: 'For website hosting through content management system features management',
                        outcome: 'Content management system manages content across different platforms.',
                        experience: 0,
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'CRUD Testing Basics',
                description: 'What are the essential components of CRUD testing in a content management system?',
                options: [
                    {
                        text: 'Create, read, update, and delete functionality checks for content management',
                        outcome: 'Excellent! These are the fundamental CRUD operations.',
                        experience: 15,
                    },
                    {
                        text: 'Content creation and content update functionality',
                        outcome: 'All CRUD operations need testing, not just the creation function.',
                        experience: -5
                    },
                    {
                        text: 'The detail component within the content management system functionality',
                        outcome: 'There is no specific "Detail Component" to test, although detail would fall under Creation and Update testing.',
                        experience: -10
                    },
                    {
                        text: 'Review component within the content management system functionality',
                        outcome: 'There is no specific "Review Component" to test, although review would fall under Creation, Update and Read testing.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Test Planning',
                description: 'What should you do before starting content management system testing?',
                options: [
                    {
                        text: 'Review documentation, understand content management system architecture, and define testing objectives',
                        outcome: 'Perfect! Preparation ensures effective testing.',
                        experience: 15,
                    },
                    {
                        text: 'Begin testing straight away to make sure timeline management is kept on course',
                        outcome: 'Planning is crucial for effective testing as required scope could be missed.',
                        experience: -10
                    },
                    {
                        text: 'Skim read submitted documentation submitted by the client to keep in line with any time constraints',
                        outcome: 'Documentation must be carefully reviewed as this provides crucial context to the project.',
                        experience: -5
                    },
                    {
                        text: 'Test all features with an approach based on tester preference.',
                        outcome: 'A structured approach is required as some areas and functionality may yet not be in a "Development Complete" state.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Content Types',
                description: 'What content types should be tested in a content management system?',
                options: [
                    {
                        text: 'Text, images, videos, audio, and other media supported by the system',
                        outcome: 'Excellent! All supported content types need testing.',
                        experience: 15,
                    },
                    {
                        text: 'Text, images, videos must be tested and verified',
                        outcome: 'All content types need verification including audio and any other supported media.',
                        experience: -10
                    },
                    {
                        text: 'Media testing can be deemed as low priority as long as text is displayed correctly on the front end',
                        outcome: 'Media handling is a crucial component of a content management system.',
                        experience: -5
                    },
                    {
                        text: 'Testing two types of content is sufficient coverage as content management system functionality will generally perform the same across all content',
                        outcome: 'Comprehensive testing of all supported content types is required as functionality is different for different types of content.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'User Roles',
                description: 'How should you test content management system user roles and permissions?',
                options: [
                    {
                        text: 'Verify access levels, permissions, and restrictions for different user types',
                        outcome: 'Perfect! Role-based access control is crucial.',
                        experience: 15,
                    },
                    {
                        text: 'As long as admin permissions behave as intended, other access levels can be left out of testing activities',
                        outcome: 'All user roles need testing as user access level is critical.',
                        experience: -10
                    },
                    {
                        text: 'Permission checks do not need testing once user access level testing is confirmed',
                        outcome: 'While user access level is closely linked to permission levels. These still need thoroughly testing for each user as they are security critical.',
                        experience: -5
                    },
                    {
                        text: 'Use one account with one access permission',
                        outcome: 'Different roles need verification and can be achieved by granting access to one user or using multiple users with different access.',
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
                title: 'Media Management',
                description: 'How do you test media management features?',
                options: [
                    {
                        text: 'Test upload, edit, delete functions with various file types and sizes',
                        outcome: 'Excellent! Comprehensive media testing is essential.',
                        experience: 20,
                    },
                    {
                        text: 'Test media uploads as this is sufficient for general media management',
                        outcome: 'All media operations need testing.',
                        experience: -15
                    },
                    {
                        text: 'By not including file validation as this does not need to be tested as long as one file type can be uploaded to the content management system',
                        outcome: 'Validation of all supported file types is crucial as all file types have different properties.',
                        experience: -10
                    },
                    {
                        text: 'Test one media type as the content management system will perform the same functionality for all media types',
                        outcome: 'Validation of all supported media is essential as all media types have different properties.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Template Testing',
                description: 'How should you test content management system templates and themes?',
                options: [
                    {
                        text: 'Verify customisation options, layout consistency, and content rendering',
                        outcome: 'Perfect! Template functionality is key.',
                        experience: 20,
                    },
                    {
                        text: 'Check the default settings for templates within the content management system',
                        outcome: 'All templates require extensive layout and setting testing.',
                        experience: -15
                    },
                    {
                        text: "Don't check layout consistency as long as the default settings for one template is displayed correctly",
                        outcome: 'Layout consistency is crucial for all templates and settings.',
                        experience: -10
                    },
                    {
                        text: 'Leave customisation testing as this is not deemed critical if the default settings are correctly displayed',
                        outcome: 'Customisation option testing is essential for any type of template testing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'SEO Features',
                description: 'What aspects of the Search Engine Optimisation features should be tested?',
                options: [
                    {
                        text: 'Meta tags, URLs, sitemaps, and other SEO tools provided by the content management system',
                        outcome: 'Excellent! SEO functionality is crucial.',
                        experience: 20,
                    },
                    {
                        text: 'URLs and Meta tags should be tested',
                        outcome: 'All SEO features need testing not just a select few as critical issues could be missed.',
                        experience: -15
                    },
                    {
                        text: 'Do not test meta tags as long as URLs are picked up correctly',
                        outcome: 'Meta information is an essential part of gathering information for SEO.',
                        experience: -10
                    },
                    {
                        text: 'Sitemaps can be left out of test plans as long as general site navigation does not return any functional issues',
                        outcome: 'Sitemaps are an essential part of gathering information for SEO and require validation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Version Control',
                description: 'How do you test content version control?',
                options: [
                    {
                        text: 'Test save, revert, compare, and restore functionality for content changes',
                        outcome: 'Perfect! Version control ensures content safety.',
                        experience: 20,
                    },
                    {
                        text: 'Test the save functionality of content within the content management system',
                        outcome: 'All features related to a version of the system are required.',
                        experience: -15
                    },
                    {
                        text: "Don't test restore functionality as this not needed if the save functionality is correct",
                        outcome: 'Restoration is crucial between versions of the content management system as some saved content may not display on updated versions.',
                        experience: -10
                    },
                    {
                        text: 'Version comparison is not required if the save functionality is correctly updated on the current version',
                        outcome: 'Comparison is essential between versions of the content management system when manipulating content.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Plugin Integration',
                description: 'How should you test content management system plugins and extensions?',
                options: [
                    {
                        text: 'Verify installation, functionality, compatibility, and interaction with core features',
                        outcome: 'Excellent! Plugin testing ensures stability.',
                        experience: 20,
                    },
                    {
                        text: 'Test installation verification as this is sufficient for plug in testing',
                        outcome: 'Full plugin testing including all features it provides is required.',
                        experience: -15
                    },
                    {
                        text: 'Test compatibility of the plugin across different content management system versions is not essential as long as installation can be achieved',
                        outcome: 'Compatibility is crucial as users may be using different versions of the content management system.',
                        experience: -10
                    },
                    {
                        text: 'By employing minimal testing of functional interaction',
                        outcome: 'Interaction testing is important and should be thoroughly tested relating to priority and user impact.',
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
                title: 'Performance Testing',
                description: 'How do you test content management system performance?',
                options: [
                    {
                        text: 'Test load times, multiple users, heavy content, and system responsiveness',
                        outcome: 'Perfect! Performance impacts user experience.',
                        experience: 25,
                    },
                    {
                        text: 'Check response time for newly updated content',
                        outcome: 'All aspects of performance testing are essential and require testing.',
                        experience: -15
                    },
                    {
                        text: 'By not including load testing if the content management system is not to be used extensively',
                        outcome: 'Load handling is crucial regardless of initial known usage as this can fluctuate.',
                        experience: -10
                    },
                    {
                        text: 'By minimizing responsiveness testing as long as the functionality eventually updates as required',
                        outcome: 'Response time is crucial, as users can attempt to perform other functions whilst the initial request is still yet to respond, in turn causing issues.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Security Testing',
                description: 'What security aspects need testing in a content management system?',
                options: [
                    {
                        text: 'Test authentication, permissions, vulnerabilities, and data protection',
                        outcome: 'Excellent! Security is critical for content management systems.',
                        experience: 25,
                    },
                    {
                        text: 'The user credential login function as is sufficient for security testing',
                        outcome: 'Login testing is just one aspect of content management system security.',
                        experience: -15
                    },
                    {
                        text: 'Vulnerability testing requires testing, although this is of low priority and can be left out of planning',
                        outcome: 'Vulnerability testing crucial for content management system testing as this exposes weaknesses in the system.',
                        experience: -10
                    },
                    {
                        text: 'Minimal permissions testing as long as admin users have the correct access',
                        outcome: 'Access controls are important for all user permission levels.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Backup Testing',
                description: 'How do you test backup and recovery features?',
                options: [
                    {
                        text: 'Verify backup creation, storage, restoration, and data integrity',
                        outcome: 'Perfect! Data recovery is essential.',
                        experience: 25,
                    },
                    {
                        text: 'Test that backups are stored correctly and in order',
                        outcome: 'Other aspects of back up testing are required including restoration of a back up.',
                        experience: -15
                    },
                    {
                        text: 'Leave integrity checks in accordance with time constraints as these are of a low priority as long as restoration can be performed',
                        outcome: 'Data integrity is a crucial part of back up, as data needs to remain consistent throughout the process.',
                        experience: -10
                    },
                    {
                        text: "Don't test restoration as long as the back up is stored correctly",
                        outcome: 'Recovery verification is essential to the back up process.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Multi-Environment Testing',
                description: 'How do you test a content management system across different environments?',
                options: [
                    {
                        text: 'Test functionality across browsers, devices, and operating systems',
                        outcome: 'Excellent! Cross-environment testing ensures compatibility.',
                        experience: 25,
                    },
                    {
                        text: 'Test one browser across multiple devices as this is sufficient',
                        outcome: 'Multiple environments are required including different browsers and devices.',
                        experience: -15
                    },
                    {
                        text: 'Test on desktop environments only as content management systems are generally not used on mobile devices',
                        outcome: 'Mobile compatibility is supported by content management systems and is also a crucial element in environment checks.',
                        experience: -10
                    },
                    {
                        text: 'Ignore operating system differences as long as browser and device tests have been performed',
                        outcome: 'Operating system compatibility is important regardless of browser and device checks.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Integration Testing',
                description: 'How do you test a content management system integration with other systems?',
                options: [
                    {
                        text: 'Test data flow, API connections, third-party services, and system interactions',
                        outcome: 'Perfect! Integration ensures system cohesion.',
                        experience: 25,
                    },
                    {
                        text: 'Test Application Programme Interface connection features',
                        outcome: 'All supported integration functionality require thorough testing.',
                        experience: -15
                    },
                    {
                        text: 'Third-party tests are not needed as they have not directly been developed by the content management system provider',
                        outcome: 'External services are a crucial part to content management system testing and any supported integrations within scope mist be tested.',
                        experience: -10
                    },
                    {
                        text: 'Data flow testing is of low priority and can be left out of planning and execution',
                        outcome: 'Data transfer essential and must be tested as it directly affects the integrity of the content within the content management system.',
                        experience: -5
                    }
                ]
            }
        ]
}