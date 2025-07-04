export const localeTestingScenarios = {
        // Basic Scenarios (IDs 1-5, 16-20)
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Primary objective',
                description: 'What is the primary purpose of locale testing?',
                options: [
                    {
                        text: 'To conduct copy checks to ensure that either, no English remnants are present after translation or remnants of other languages do not appear',
                        outcome: 'Correct! This is the fundamental purpose of locale testing, encompassing language, rendering, and market-specific adaptations',
                        experience: 15,
                    },
                    {
                        text: 'To test the website\'s performance in different countries',
                        outcome: 'While location may play a role, performance testing is a separate testing discipline.',
                        experience: -5
                    },
                    {
                        text: 'To verify translations are grammatically correct',
                        outcome: 'While translation verification is part of locale testing, it\'s only one aspect of the broader scope.',
                        experience: 0
                    },
                    {
                        text: 'To ensure the website loads quickly in different regions',
                        outcome: 'Website loading speed is part of performance testing, not locale testing.',
                        experience: -10
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Documentation',
                description: 'What type of documentation might clients provide for locale testing?',
                options: [
                    {
                        text: 'The client will provide server logs to assist in this type of testing',
                        outcome: 'Server logs are not typically used for locale testing.',
                        experience: -5
                    },
                    {
                        text: 'Copy deck or translations matrix can be submitted by the client',
                        outcome: 'Correct! These are the primary reference documents provided by clients for verifying correct translations and content.',
                        experience: 15,
                    },
                    {
                        text: 'Design specifications can be provided to assist with locale testing',
                        outcome: 'While design specifications might be provided, they\'re secondary to translation documents.',
                        experience: 0
                    },
                    {
                        text: 'Network traffic data can be submitted to assist with locale testing',
                        outcome: 'Network data is not relevant for locale testing.',
                        experience: -10
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Characteristics of locale testing',
                description: 'Which of the following is a key characteristic of locale testing?',
                options: [
                    {
                        text: 'Locale testing requires programming knowledge',
                        outcome: 'Programming knowledge is not a primary requirement for locale testing.',
                        experience: -5
                    },
                    {
                        text: 'Locale testing requires a keen eye for detail to spot minuscule variances',
                        outcome: 'Correct! Attention to detail is important, especially for diacritics and subtle differences.',
                        experience: 15,
                    },
                    {
                        text: 'Locale testing requires fluency in all supported test languages',
                        outcome: 'While language knowledge is helpful, testers can work with a translation matrix.',
                        experience: 0
                    },
                    {
                        text: 'Locale testing requires network engineering expertise',
                        outcome: 'Network engineering is not related to locale testing.',
                        experience: -10
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Locale currency testing',
                description: 'When conducting locale testing, what should testers check regarding currencies?',
                options: [
                    {
                        text: 'The currency symbol placement should be checked exclusively',
                        outcome: 'While this is part of currency localisation, it\'s just one aspect of currency-related checks.',
                        experience: 0
                    },
                    {
                        text: 'Exchange rates between currencies should be tested',
                        outcome: 'Exchange rate verification is not part of locale testing.',
                        experience: -5
                    },
                    {
                        text: 'Currency updates based on selected market under test',
                        outcome: 'Correct! Verifying that currencies update appropriately for each market is part of locale testing',
                        experience: 15,
                    },
                    {
                        text: 'Currency conversion calculations need to be tested for accuracy',
                        outcome: 'Mathematical currency conversions are not part of locale testing',
                        experience: -10
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Locale test scripts',
                description: 'What is a recommended practice for organising locale test scripts?',
                options: [
                    {
                        text: 'Random sections across different locales can be tested to gain the most coverage possible',
                        outcome: 'This unstructured approach would not ensure comprehensive coverage.',
                        experience: -5
                    },
                    {
                        text: 'Create separate scripts for each feature to be tested in regards to locale',
                        outcome: 'While organisation is important, organising by locale first Is more efficient than organising the script on a feature basis.',
                        experience: 0
                    },
                    {
                        text: 'Organise all locales to be combined into one test case',
                        outcome: 'This would make testing confusing and difficult to track.',
                        experience: -10
                    },
                    {
                        text: 'Separate each page or section to be tested by locale',
                        outcome: 'Correct! This is the recommended organisation method and makes for easy tracking and traceability.',
                        experience: 15,
                    }
                ]
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Locale Testing Risks',
                description: 'What is a potential risk of locale testing mentioned in the guide?',
                options: [
                    {
                        text: 'Testing could be affected by inaccuracies in client-provided translation documentation',
                        outcome: 'Correct! Testing can be affected by the accuracy of client-provided documentation, especially translations where the tester is not a native speaker of the language under test.',
                        experience: 15,
                    },
                    {
                        text: 'Locale testing might expose security vulnerabilities',
                        outcome: 'Security vulnerabilities are not a risk associated with locale testing and this type of testing is out of scope for locale test activities.',
                        experience: -5
                    },
                    {
                        text: 'Testing multiple locales typically requires more resources than is available',
                        outcome: 'While time constraints need to be managed, staffing shortages are not identified as a specific risk.',
                        experience: -10
                    },
                    {
                        text: 'Locale testing often causes software to crash during language switches',
                        outcome: 'Locale testing should ensure that content loads properly when changing languages but crashes as a result of switching languages is generally not common risk.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Locale Documentation',
                description: 'What document should testers consult to determine which locales are in scope for testing?',
                options: [
                    {
                        text: 'The locale test script template should be referred to for scoping',
                        outcome: 'Test scripts don\'t define which locales are in scope, they\'re used to create the test scripts after scope is determined.',
                        experience: -5
                    },
                    {
                        text: 'The tester\'s previous notes from similar projects should be referred to for scope',
                        outcome: 'Previous notes might be helpful but should not be referred to as an authoritative source for determining which locales are in scope.',
                        experience: -10
                    },
                    {
                        text: 'The client\'s Statement of Work and Operational Details documentation should be referred to',
                        outcome: 'Correct! This documentation defines locales that are in scope and if there are any sub-areas within locale testing that are out of scope.',
                        experience: 15,
                    },
                    {
                        text: 'The global market trends report should be referred to for locale scope',
                        outcome: 'Market trend reports should not be referred to as resources for determining testing scope as all clients have different requirements.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'Language Switch Testing',
                description: 'What issue might occur when changing locales that testers need to specifically check for?',
                options: [
                    {
                        text: 'System crashes when switching languages',
                        outcome: 'System crashes are not generally a common defect caused by locale switching.',
                        experience: -5
                    },
                    {
                        text: 'Slow page load times need to be monitored when switching languages',
                        outcome: 'Page load speed differences are generally part of performance testing.', 
                        experience: -10
                    },
                    {
                        text: 'Text truncation or overlapping content need to be monitored when switching languages',
                        outcome: 'Correct! Identifying any rendering issues caused by word length when changing locales, such as overlapping content or lack of padding between page elements should be monitored.',
                        experience: 15,
                    },
                    {
                        text: 'Font colour changes should be monitored when switching languages',
                        outcome: 'Font colour changes should not be a specific concern, although can be raised as a query unless stated as correct by the client documentation.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Locale Test Consistency',
                description: 'What important element should testers check consistently across locale changes?',
                options: [
                    {
                        text: 'Global elements such as header, navigation and footer should be checked',
                        outcome: 'Correct! These elements should remain consistent when navigating the site on a selected locale.',
                        experience: 15,
                    },
                    {
                        text: 'Loading speed for each locale should be checked for consistency',
                        outcome: 'While checking for any major issues in this area are recommended, loading speed is more aligned with performance testing.',
                        experience: -10
                    },
                    {
                        text: 'The number of images displayed on each page',
                        outcome: 'Whilst any major issues here should be reported. The amount of images would generally come under content and copy proofing.',
                        experience: -5
                    },
                    {
                        text: 'Font size consistency across locales should be checked',
                        outcome: 'While visual presentation is important, font size consistency isn\'t a specific check for locale testing. However, any major issues should be flagged.',
                        experience: 0
                    }
                ]
            },
            {
                id: 20,
                level: 'Basic',
                title: 'Locale Testing Advantages',
                description: 'Which of the following is an advantage of locale testing?',
                options: [
                    {
                        text: 'It improves the user experience and customer satisfaction',
                        outcome: 'Correct! Locale testing can identify issues with the presented language and therefore build confidence in the product from the user.',
                        experience: 15,
                    },
                    {
                        text: 'It ensures a universal experience across all regions',
                        outcome: 'Locale testing is specifically designed to adapt software or content to different regions, not to make everything uniform.',
                        experience: -10
                    },
                    {
                        text: 'It eliminates the need for native language testers',
                        outcome: 'This would actually be considered as a limitation as not all testers will know multiple native languages.',
                        experience: -5
                    },
                    {
                        text: 'It speeds up the loading time of the website in different regions',
                        outcome: 'System performance is generally not associated with locale testing.',
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
                title: 'Locale testing risk',
                description: 'What potential risk is associated with locale testing when the tester isn\'t bilingual?',
                options: [
                    {
                        text: 'Certain incorrect translations may be missed even if in the correct language',
                        outcome: 'Correct! This is a known risk as a tester may not know all languages under test.',
                        experience: 20,     
                    },
                    {
                        text: 'The tester is unable to complete any testing due to lack of specialist knowledge',
                        outcome: 'Non-bilingual testers can still perform many aspects of locale testing.',
                        experience: -15
                    },
                    {
                        text: 'All testing needs to be outsourced to businesses providing locale specialists',
                        outcome: 'Outsourcing is not necessary for locale testing as copy can be provided by the client to cross reference.',
                        experience: -10
                    },
                    {
                        text: 'Basic language presence can be tested fully to completion',
                        outcome: 'While they can verify language presence, they may miss nuanced translation errors.',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Right to Left languages',
                description: 'How should right-to-left (RTL) language testing be approached?',
                options: [
                    {
                        text: 'Verify correct text rendering and layout adaptation',
                        outcome: 'Correct! Checking rendering and layout for RTL languages is considered part of locale testing.',
                        experience: 20,
                    },
                    {
                        text: 'Test that the text direction is correctly presented',
                        outcome: 'RTL testing involves more than just text direction like grammar and locale specific elements.',
                        experience: -15
                    },
                    {
                        text: 'Test that the text alignment is correctly presented',
                        outcome: 'While alignment is important, RTL testing requires comprehensive layout verification.',
                        experience: -10
                    },
                    {
                        text: 'Ignore formatting elements as long as the local matches the copy submitted by the client',
                        outcome: 'Formatting elements are crucial for RTL testing and include punctuation placement, number alignment and text alignment.',
                        experience: -5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Issue identification',
                description: 'What is the recommended approach for handling issue identification across multiple locales?',
                options: [
                    {
                        text: 'Preface tickets with locale identifier (e.g., [FR], [ES])',
                        outcome: 'Correct! This is the correct approach for ease of identification.',
                        experience: 20,
                    },
                    {
                        text: 'Create separate bug trackers for each locale',
                        outcome: 'This would complicate issue management unnecessarily.',
                        experience: -15
                    },
                    {
                        text: 'Report all issues as standard practice without locale references',
                        outcome: 'This would make it difficult to track locale-specific issues.',
                        experience: -10
                    },
                    {
                        text: 'Group similar issues that occur across different locales',
                        outcome: 'While grouping can be useful, clear locale identification should be a primary objective.',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Validation messages',
                description: 'What should testers verify regarding form validation messages?',
                options: [
                    {
                        text: 'That messages are translated and display correctly in each locale',
                        outcome: 'Correct! This is a critical element for locale testing.',
                        experience: 20,
                    },
                    {
                        text: 'Check if validation messages appear when moving through the form',
                        outcome: 'Merely checking presence is insufficient, actual correct message verification is also required.',
                        experience: -15
                    },
                    {
                        text: 'Verify all validation messages are positioned correctly',
                        outcome: 'While positioning is important, translation and correct display are primary objectives.',
                        experience: -10
                    },
                    {
                        text: 'Verify all validation messages display on one environment',
                        outcome: 'Validation messages and should be consistent across all environments.',
                        experience: -5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Time management',
                description: 'How should testers manage time when testing multiple locales?',
                options: [
                    {
                        text: 'Balance testing across locales while maintaining thoroughness',
                        outcome: 'Correct! The importance of time management across locales can ensure equal or priority coverage is met',
                        experience: 20,
                    },
                    {
                        text: 'Test focus should be solely worked through on a primary locale',
                        outcome: 'All scoped locales require appropriate coverage.',
                        experience: -15
                    },
                    {
                        text: 'Test one locale completely before moving to others',
                        outcome: 'While thorough, this might not be the most efficient approach relating to project timelines and deliverables.',
                        experience: -10
                    },
                    {
                        text: 'Conduct a random approach to testing of locales to gain the best coverage',
                        outcome: 'Unstructured testing would not ensure the best coverage and priority areas need to be taken into consideration',
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
                title: 'Language remnants',
                description: 'What approach should be taken when testing for language remnants?',
                options: [
                    {
                        text: 'Check all user interface elements, including hidden states and validation messages',
                        outcome: 'Correct! Comprehensive checking across all user interface elements is essential.',
                        experience: 25,
                    },
                    {
                        text: 'Check all main navigation features and headers throughout the system under test',
                        outcome: 'While important, this is not comprehensive enough and other crucial elements can be missed.',
                        experience: -15
                    },
                    {
                        text: 'Check all initial visible text on main pages',
                        outcome: 'This could miss many potential issues like validation messages and sub pages.',
                        experience: -10
                    },
                    {
                        text: 'Use automated translation detection for efficiency',
                        outcome: 'Manual verification is necessary for thorough testing as automation doesn\'t always detect every issue.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Diacritic elements',
                description: 'How should testers handle diacritic elements during testing?',
                options: [
                    {
                        text: 'Verify correct rendering and meaning preservation',
                        outcome: 'Correct! Diacritics must be checked for the importance of meaning.',
                        experience: 25,
                    },
                    {
                        text: 'Leave diacritical mark issues out of reports as they are not critical',
                        outcome: 'This would miss crucial linguistic elements.',
                        experience: -15
                    },
                    {
                        text: 'Test for presence of diacritics within all available text',
                        outcome: 'Presence alone doesn\'t ensure correct usage or rendering.',
                        experience: -10
                    },
                    {
                        text: 'De-scope diacritics when locale testing unless specifically requested',
                        outcome: 'Diacritics can fundamentally alter the language and this should always be taken into consideration when testing locale.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Locale specific formatting',
                description: 'What strategy should be employed when testing locale-specific formatting?',
                options: [
                    {
                        text: 'Verify date, time, address, and phone number formats for each locale',
                        outcome: 'Correct! These are all specific elements requiring verification',
                        experience: 25,
                    },
                    {
                        text: 'Use standard formats when testing across all locales',
                        outcome: 'This would defeat the purpose of specific localisation testing.',
                        experience: -15
                    },
                    {
                        text: 'Check date formats when performing locale testing',
                        outcome: 'While important, this is only one aspect of formatting, other might include time or phone number formatting.',
                        experience: -10
                    },
                    {
                        text: 'Check there are format variations, but leave format confirmation for different languages',
                        outcome: 'Format verification is crucial for locale testing and should be cross referenced with copy provided by the client.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Text expansions',
                description: 'How should testers handle text expansion and contraction across different languages?',
                options: [
                    {
                        text: 'Verify layout integrity and check for truncation across all elements',
                        outcome: 'Correct! Checking for truncation and layout issues is essential to locale testing',
                        experience: 25,
                    },
                    {
                        text: 'Test with maximum length text to check for truncation',
                        outcome: 'This wouldn\'t catch all potential issues including layout integrity.',
                        experience: -15
                    },
                    {
                        text: 'Ignore text length variations as long as elements can be successfully navigated',
                        outcome: 'Text length variations can cause significant issues like layout integrity.',
                        experience: -10
                    },
                    {
                        text: 'Check all visible elements across the system under test for truncation',
                        outcome: 'While important, hidden states and dynamic content also need checking',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Language selectors',
                description: 'What approach should be taken when testing language toggles and selectors?',
                options: [
                    {
                        text: 'Verify content updates, loading behaviour, and state preservation',
                        outcome: 'Correct! It is important to check all these aspects of language switching.',
                        experience: 25,
                    },
                    {
                        text: 'Check for immediate visual changes under user input',
                        outcome: 'While important, this doesn\'t cover all necessary aspects like actual content updates.',
                        experience: -15
                    },
                    {
                        text: 'Verify that switching between languages occurs with user input',
                        outcome: 'Testing this only can miss many important aspects of language switching including actual content correctness.',
                        experience: -10
                    },
                    {
                        text: 'Ensure the system under test is responsive after switching languages',
                        outcome: 'Whilst this is important, crucial contact accuracy could be missed if responsiveness is tested only.',
                        experience: -5
                    }
                ]
            }
        ]
}