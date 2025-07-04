export const scriptMetricsScenarios = {
    // Basic Scenarios (IDs 1-5)
    basic: [
        {
            id: 1,
            level: 'Basic',
            title: 'Primary objective',
            description: 'What is the primary purpose of script metrics?',
            options: [
                    {
                        text: 'To create visual presentations on projects for clients',
                        outcome: 'While metrics may be shared with clients, this is not their primary purpose',
                        experience: -5
                    },
                    {
                        text: 'To gauge project progress and inform report writing',
                        outcome: 'Correct! - Metrics are used to track progress and help with daily reporting',
                        experience: 15,
                    },
                    {
                        text: 'To track employee performance to match individuals with specific projects',
                        outcome: 'Metrics are about project progress, not individual performance',
                        experience: -10
                    },
                    {
                        text: 'To gauge project progress and determine resources required to complete the testing activites',
                        outcome: 'This is true but incomplete as it misses the reporting aspect.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Environment Tables',
                description: 'Where should you add new rows to environment tables?',
                options: [
                    {
                        text: 'At the very bottom of the table',
                        outcome: 'Adding rows at the bottom can break formulas.',
                        experience: -5
                    },
                    {
                        text: 'Within the existing table, above the final row',
                        outcome: 'Correct! - This ensures formulas remain intact and metrics update properly.',
                        experience: 15,
                    },
                    {
                        text: 'In a new separate table',
                        outcome: 'This would not maintain connection with existing metrics.',
                        experience: -10
                    },
                    {
                        text: 'Above the table header',
                        outcome: 'While this keeps data within the table, it\'s not the optimal location.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Metrics Pie Chart Labels',
                description: 'What causes missing pie chart labels in the Metrics tab?',
                options: [
                    {
                        text: 'Software bugs raised in any of the test scripts',
                        outcome: 'Missing labels are usually due to chart size or data arrangement',
                        experience: -10
                    },
                    {
                        text: 'Corrupted data within the test script',
                        outcome: 'This is not typically the cause of missing labels.',
                        experience: -5
                    },
                    {
                        text: 'Chart size and data arrangement',
                        outcome: 'Correct! - Labels may be missing due to chart size or how data is arranged in the table.',
                        experience: 15,
                    },
                    {
                        text: 'Chart size in relation to the rest of the metrics features on the tab',
                        outcome: 'While chart size is a factor, data arrangement also matters',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Environment Rows',
                description: 'You have finished compatibility testing and have empty environment rows present within the primary compatibility environment tab, how would you best handle this?',
                options: [
                    {
                        text: 'Delete the environment rows completely, then ensure any relevant formulas are updated and metrics are correct',
                        outcome: 'Correct! - This maintains formula integrity whilst displaying only the relevant environment rows.',
                        experience: 15
                    },
                    {
                        text: 'Copy in placeholder data to the empty rows, to ensure people know they have not been used.',
                        outcome: 'This would not be a viable solution as the placeholder data would not be accurate and could affect the metrics.',
                        experience: -10
                    },
                    {
                        text: 'Hide the environment rows within the environment checks tab',
                        outcome: 'Hiding rows doesn\'t properly address the issue as metrics can still be picked up from hidden rows.',
                        experience: -5
                    },
                    {
                        text: 'Keep original formulas for different environment rows and clear content',
                        outcome: 'While maintaining formulas is good, they need to be properly copied to assign different rows.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: '#REF! Errors',
                description: 'What causes #REF! errors in the Metrics \'Overall Session Totals\' section?',
                options: [
                    {
                        text: 'Insufficient lines for all dates in the sessions totals table',
                        outcome: 'Correct! - The error appears when there aren\'t enough lines for all testing dates.',
                        experience: 15,
                    },
                    {
                        text: 'Corrupted data within the spreadsheet',
                        outcome: 'This is rarely the cause of #REF! errors in this context.',
                        experience: -5
                    },
                    {
                        text: 'Wrong date format inserted into the sessions totals table',
                        outcome: 'Date formatting is not the cause of #REF! errors.',
                        experience: -10
                    },
                    {
                        text: 'Too many dates entered within the sessions total table',
                        outcome: 'While related to dates, the issue it\'s specifically related line availability.',
                        experience: 0
                    }
                ]
            },
            {
                id: 16,
                level: 'Basic',
                title: 'Environment Metrics',
                description: 'If environment metrics do not reflect the actual number of environments, what should you check first?',
                options: [
                    {
                        text: 'Check that new rows were added within the existing table and have the correct formulas',
                        outcome: 'Correct! first ensure that new rows in the table are always added within the existing table and copy formulas from existing rows.',
                        experience: 15,
                    },
                    {
                        text: 'Verify that Microsoft Excel is updated to the latest version',
                        outcome: 'First you must ensure that new rows in the table are always added within the existing table and that formulas are copied from existing rows.',
                        experience: -5
                    },
                    {
                        text: 'Delete and recreate the entire environment checks tab',
                        outcome: 'Deleting and recreating the tab is not advised as it would be time consuming.',
                        experience: -10
                    },
                    {
                        text: 'Restart Excel to refresh all formulas automatically',
                        outcome: 'First you should double click the cell in the data table with the incorrect figure and ensure that the dotted lines displayed over the environment table encompass all rows containing environments.',
                        experience: 0
                    }
                ]
            },
            {
                id: 17,
                level: 'Basic',
                title: 'Compatibility Environments Completed',
                description: 'What influences the Compatibility Environments Complete figure in the Environment Checks tab?',
                options: [
                    {
                        text: 'The number of environments with \'Complete\' in the status column',
                        outcome: 'There is no status column within the Compatibility Environments tab.',
                        experience: -5
                    },
                    {
                        text: 'The total number of browsers tested across all environments',
                        outcome: 'The figure calculated based on browsers tested.',
                        experience: -10
                    },
                    {
                        text: 'The count of compatibility environments that have Yes in the Checked? column',
                        outcome: 'Correct! The Compatibility Environments Complete figure counts how many compatibility environments have Yes in the Checked? column.',
                        experience: 15,
                    },
                    {
                        text: 'Environments marked as Complete and verified by a second tester',
                        outcome: 'There is no column for complete and a second tester is not required to verify the tests.',
                        experience: 0
                    }
                ]
            },
            {
                id: 18,
                level: 'Basic',
                title: 'New Metrics Table Rows',
                description: 'When a formula in the metrics table doesn\'t count a newly added environment row, what troubleshooting step should you take?',
                options: [
                    {
                        text: 'Restart Excel to refresh all formulas automatically',
                        outcome: 'First you should double click the cell in the data table with the incorrect figure and ensure that the dotted lines displayed over the environment table encompass all rows containing environments.',
                        experience: -5
                    },
                    {
                        text: 'Add a new row to the metrics table to account for the additional environment',
                        outcome: 'Adding new rows wont address the issue as new rows already aren\'t being calculated.', 
                        experience: -10
                    },
                    {
                        text: 'Double click the cell with the incorrect figure to check if the formula encompasses all rows',
                        outcome: 'Correct! The first port of call should be to double click the cell in the data table with the incorrect figure and ensure that the dotted lines displayed over the environment table encompass all rows containing environments.',
                        experience: 15,
                    },
                    {
                        text: 'Contact your manager immediately to report the broken formula',
                        outcome: 'The problem should be addressed first by the tester, If the count is still incorrect a colleague can be contacted.',
                        experience: 0
                    }
                ]
            },
            {
                id: 19,
                level: 'Basic',
                title: 'Formula Editing',
                description: 'When editing formulas in a newly copied Environment Checks table, what is the key modification required?',
                options: [
                    {
                        text: 'Point the formulas to the equivalent cells in the newly created tab',
                        outcome: 'Correct! The formula in each cell of the new table that\'s pointing to the Environment Checks tab should be edited to instead point to the equivalent cell in the newly created tab.',
                        experience: 15,
                    },
                    {
                        text: 'Change the formula to use absolute cell references instead of relative references',
                        outcome: 'Changing cell references to absolute doesn\'t correct where the formula should be pointed to.',
                        experience: -10
                    },
                    {
                        text: 'Remove all existing formulas and create simplified versions.',
                        outcome: 'Removing and simplifying formulas is not recommended as this could affect formula and test result accurracy.',
                        experience: -5
                    },
                    {
                        text: 'Add error handling functions to each formula.',
                        outcome: 'Adding error handling functions doesn\'t correct where the formula should be pointed to.',
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
                title: 'Environment Check Tabs',
                description: 'How should you handle multiple Environment Checks tabs?',
                options: [
                    {
                        text: 'Create new independent metrics for each environment tab',
                        outcome: 'This would not maintain proper tracking across tabs.',
                        experience: -15
                    },
                    {
                        text: 'Copy and update existing table with new tab references',
                        outcome: 'Correct! - This maintains consistency while incorporating new data.',
                        experience: 20,     
                    },
                    {
                        text: 'Merge all environment data into one tab',
                        outcome: 'This would make tracking different sessions difficult',
                        experience: -10
                    },
                    {
                        text: 'Add new columns to existing tables within the environment check tab',
                        outcome: 'While this maintains data connection, it\'s not the optimal solution',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Compatibility Environments Completed',
                description: 'What affects the Compatibility Environments Complete figure?',
                options: [
                    {
                        text: 'The primary column and environment count within the environments table',
                        outcome: 'While primary column is important, the checked field is also required to report accurate metrics.',
                        experience: 0
                    },
                    {
                        text: 'The primary column within the environments table',
                        outcome: 'Multiple columns affect this figure and the \'Checked\' column is also taken into consideration.',
                        experience: -15
                    },
                    {
                        text: 'The \'Checked\' column within the environments table',
                        outcome: 'This alone doesn\'t determine compatibility status and the primary column is also taken into consideration.',
                        experience: -10
                    },
                    {
                        text: 'Both primary and \'Checked\' columns within the environments table',
                        outcome: 'Correct! - Both columns together determine the completion status.',
                        experience: 20,
                    }
                ]
            },
            {
                id: 8,
                level: 'Basic',
                title: 'Environment Count',
                description: 'Why might an environment not be counted in the \'Compatibility Environments Complete\' figure despite correct cell population and \'Primary No\' checked?',
                options: [
                    {
                        text: 'The formula in the cell showing the figure isn\'t encompassing all environment rows',
                        outcome: 'Correct! by double clicking the cell showing the incorrect figure, you can see if the formula is not encompassing the newly added environment row.',
                        experience: 15,
                    },
                    {
                        text: 'The environment is marked as a primary environment rather than a compatibility environment',
                        outcome: 'The question stated that the \'Primary No\' column had been checked.',
                        experience: -10
                    },
                    {
                        text: 'The environment was added after the initial script was created',
                        outcome: 'When an environment is added shouldn\'t have a bearing on environment count.',
                        experience: -5
                    },
                    {
                        text: 'The count automatically updates only at the end of each day',
                        outcome: 'This is not the case, environments should be counted when added to the table and formulas are correctly checked.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'New Row Formulas',
                description: 'What should you do when formulas don\'t encompass new rows?',
                options: [
                    {
                        text: 'Extend the formula manually for each affected metric',
                        outcome: 'While this works, double-clicking is more efficient.',
                        experience: 0
                    },
                    {
                        text: 'Copy a formula from another sheet',
                        outcome: 'This appoach not match the specific needs of your sheet.',
                        experience: -5
                    },
                    {
                        text: 'Create new formulas for the affected metrics',
                        outcome: 'Creating new formulas may lead to inconsistencies',
                        experience: -10
                    },
                    {
                        text: 'Double-click and update cell ranges for the affected rows',
                        outcome: 'Correct! - This allows proper adjustment of formula ranges.',
                        experience: 20,
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Environment Coverage',
                description: 'How should you handle environment-specific coverage?',
                options: [
                    {
                        text: 'Create separate sheets for specific environment testing',
                        outcome: 'This creates unnecessary complexity within the test script.',
                        experience: -10
                    },
                    {
                        text: 'Combine global and specific environments as needed',
                        outcome: 'Correct! - This allows flexibility while maintaining consistency.',
                        experience: 20,
                    },
                    {
                        text: 'Use only global environments within the test script',
                        outcome: 'This doesn\'t account for ticket or environment specific needs',
                        experience: -5
                    },
                    {
                        text: 'Use specific environments only',
                        outcome: 'While this works for some projects, it\'s not flexible enough and the exact environment testing may not be achievable',
                        experience: 0
                    }
                ]
            }
        ],

        // Advanced Scenarios (IDs 11-15, 150 XP total)
        advanced: [
            {
                id: 11,
                level: 'Advanced',
                title: 'Duplicated Environment Checks',
                description: 'When updating duplicated environment checks tabs, what\'s crucial?',
                options: [
                    {
                        text: 'Update all cell references within the environment checks tab',
                        outcome: 'Multiple aspects need attention rather than just this one area, including formula accuracy.',
                        experience: 0
                    },
                    {
                        text: 'Update all references and verify formula accuracy',
                        outcome: 'Correct! - This ensures complete and accurate metric tracking',
                        experience: 25,
                    },
                    {
                        text: 'Copy all formulas exactly for the duplicated environments checks tab',
                        outcome: 'Formula will need adjustment for the new context on the new tab',
                        experience: -5
                    },
                    {
                        text: 'Update table structure within duplicated environments checks tab',
                        outcome: 'While structure matters, formula updates are also crucial',
                        experience: -10
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Environment Table Metrics',
                description: 'When reviewing the Compatibility environment metrics, the values displayed are incorrect. How would you best handle this?',

                options: [
                    {
                        text: 'Simplify the formulas to return the expected outcome',
                        outcome: 'Simplifying formulas could lose important tracking details.',
                        experience: -15
                    },
                    {
                        text: 'Count the values within the metrics table manually',
                        outcome: 'This may not capture all necessary metrics, and could be inaccurate/time consuming.',
                        experience: -10
                    },
                    {
                        text: 'Confirm that the environments tab metrics are counting the environments correctly and that the metrics tab is referencing the correct value.',
                        outcome: 'Correct! - This ensures accurate tracking across all dependencies',
                        experience: 25,
                    },
                    {
                        text: 'Verify all formula chains and dependencies related to the Comaptibility Environments tab',
                        outcome: 'Whilst this would solve the issue, it would be time consuming and not the most efficient approach.',
                        experience: 0
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Cross Tab Metrics',
                description: 'What\'s the correct approach for updating cross-tab metrics?',
                options: [
                    {
                        text: 'Maintain formula relationships while updating references',
                        outcome: 'Correct! - This preserves metric integrity across tabs',
                        experience: 25,
                    },
                    {
                        text: 'Update each tab independently across the test script tabs',
                        outcome: 'This breaks cross-tab relationships.',
                        experience: -10
                    },
                    {
                        text: 'Update the primary metrics across the test script tabs',
                        outcome: 'While important, secondary metrics also need attention for full reporting details.',
                        experience: 0
                    },
                    {
                        text: 'Create new metrics to reflect the current testing references',
                        outcome: 'This approach can lose historical tracking.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Un-displayed Metrics',
                description: 'You notice that tracking metrics on the Metrics tab are innacurate, how would you best handle this?',
                options: [
                    {
                        text: 'Copy the formula from a script template and paste it into the relevant cells',
                        outcome: 'Whilst this may potentially fix the issue, scripts tend to be altered based on projects so it could make the problem worse.',
                        experience: 0
                    },
                    {
                        text: 'Determine an average from the discrepancies to enter into the metrics tables',
                        outcome: 'This doesn\'t address the root cause of the metrics issues across the tabs within the test script, and would be innacurate.',
                        experience: -5
                    },
                    {
                        text: 'Use the values obtained from the tabs within the test script',
                        outcome: 'The spreadsheet will have to be delivered to the client with the correct metrics, this would not be a viable solution. Additionally, this could impact your TDM as they would likely have to fix the problem.',
                        experience: -10
                    },
                    {
                        text: 'Identify that the metrics are incorrect and adjust formula and call references to ensure the correct values are being displayed.',
                        outcome: 'Correct! - This identifies and resolves the source of discrepancies.',
                        experience: 25,
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Metrics Updates',
                description: 'What\'s the best approach for maintaining metric integrity during major updates?',
                options: [
                    {
                        text: 'Start with fresh metrics when major updates to the test script are required',
                        outcome: 'This approach can lose valuable historical data.',
                        experience: -10
                    },
                    {
                        text: 'Copy existing metrics from across the test script',
                        outcome: 'This could potentially copy any existing issues within the metrics.',
                        experience: -5
                    },
                    {
                        text: 'Verify all dependencies and update systematically',
                        outcome: 'Correct! - This maintains accuracy while allowing updates.',
                        experience: 25,
                    },
                    {
                        text: 'Update primary metrics across the test script',
                        outcome: 'While a good start, more comprehensive attention is required to cover all metrics.',
                        experience: 0
                    }
                ]
            }
        ]
}