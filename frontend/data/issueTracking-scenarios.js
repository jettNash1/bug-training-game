export const issueTrackingScenarios = {
        // Basic Scenarios (IDs 1-5)
        basic: [
            {
                id: 1,
                level: 'Basic',
                title: 'Creating an Issue',
                description: 'You need to create a new issue in DoneDone. What\'s the correct process?',
                options: [
                    {
                        text: 'Select the "+" icon, fill in details, and submit the issue',
                        outcome: 'Perfect! This is the correct process for creating an issue.',
                        experience: 15,
                    },
                    {
                        text: 'Email the issue details to the developer so they can start debugging straight away',
                        outcome: 'Issues should be logged in a tracking tool for traceability.',
                        experience: -10
                    },
                    {
                        text: 'Write the issue in a document for bulk upload at a later date',
                        outcome: 'Issues need to be logged in the tracking tool straight away for visibility and traceability.',
                        experience: -5
                    },
                    {
                        text: 'Send the issue to a colleague for environment reproduction rates and ask them to log it to the tracker',
                        outcome: 'Whilst reproduction rates are important, proactive issue logging is essential and relates to coverage and good time management.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Searching for a Project',
                description: 'How do you search for a project in DoneDone?',
                options: [
                    {
                        text: 'Use the search bar next to "Issues" to find the project',
                        outcome: 'Excellent! This is the correct method for searching projects.',
                        experience: 15,
                    },
                    {
                        text: 'Scroll through the projects manually to locate the correct one',
                        outcome: 'Using the search bar is more efficient.',
                        experience: -10
                    },
                    {
                        text: 'Ask a colleague who is working on the project for the location',
                        outcome: 'Using the search bar is the best approach, as to not distract others from project work unless absolutely essential.',
                        experience: -5
                    },
                    {
                        text: 'Navigate to the project through notifications when they are received regarding updates',
                        outcome: 'Proactive searching is more effective as a notification may not arrive until late in the day if at all.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Editing a Single Issue',
                description: 'You need to edit an issue in DoneDone. What\'s the correct process?',
                options: [
                    {
                        text: 'Select the issue and use the pencil icon to edit details',
                        outcome: 'Perfect! This is the correct process for editing an issue.',
                        experience: 15,
                    },
                    {
                        text: 'Delete the issue and create a new one for completeness',
                        outcome: 'Editing is more efficient than recreating.',
                        experience: -10
                    },
                    {
                        text: 'Email changes to the project manager for them to update',
                        outcome: 'Changes should be made directly in the tool.',
                        experience: -5
                    },
                    {
                        text: 'Message someone in the team with findings so they can edit the issue',
                        outcome: 'Proactive issue management is essential, and ticket updates should be owned as to not take others away from project work unnecessarily.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Filtering Issues',
                description: 'How do you filter issues in DoneDone?',
                options: [
                    {
                        text: 'Use the dropdowns below the project title to filter by tags, due date, etc.',
                        outcome: 'Excellent! This is the correct method for filtering issues.',
                        experience: 15,
                    },
                    {
                        text: 'Manually search through all issues to find the required ticket',
                        outcome: 'Using filters is more efficient.',
                        experience: -10
                    },
                    {
                        text: 'Ask a colleague for assistance to find the issues',
                        outcome: 'Using filters is the best approach and a colleague should only be asked if they are familiar with the project and if all other avenues have been exhausted.',
                        experience: -5
                    },
                    {
                        text: 'Collapse all issues to make it easier to filter through to the required ticket',
                        outcome: 'Whilst this may make it easier to manually search. Using the filtering feature is more effective.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Understanding Kanban Style',
                description: 'What is a Kanban style issue tracking tool?',
                options: [
                    {
                        text: 'A tool using lanes and cards to manage workflow and issues',
                        outcome: 'Perfect! This describes the Kanban style.',
                        experience: 15,
                    },
                    {
                        text: 'A tool that uses a list format of submitted tickets',
                        outcome: 'Kanban uses lanes and cards, not just lists.',
                        experience: -10
                    },
                    {
                        text: 'A tool that tracks time spent on all issues raised against a project',
                        outcome: 'Kanban focuses on workflow management.',
                        experience: -5
                    },
                    {
                        text: 'A tool that tracks all bugs related to a project',
                        outcome: 'Kanban can manage various types of tickets, including tasks and stories.',
                        experience: 0
                    }
                ]
            },
            {
                id: 11,
                level: 'Basic',
                title: 'Issue Tracking Tools Features',
                description: 'Which of the following is not a common feature of issue tracking tools?',
                options: [
                    {
                        text: 'Automated bug fixing is not a feature of tracking tools',
                        outcome: 'Correct! during test support, testers essentially become a part of the client\'s development team.',
                        experience: 15,
                    },
                    {
                        text: 'Raising/Logging issues is not a feature of tracking tools',
                        outcome: 'A key feature of all trackers is logging or raising newly discovered bugs, issues, or tickets.',
                        experience: -5
                    },
                    {
                        text: 'Sorting and filtering issues are not features of tracking tools',
                        outcome: 'Most trackers allow the user to sort and filter issues.',
                        experience: -10
                    },
                    {
                        text: 'Tags, Epics and Child issues are not features of tracking tools',
                        outcome: 'Many tracking tools include the ability to apply custom tags, which aids in organising issues more effectively.',
                        experience: 0
                    }
                ]
            },
            {
                id: 12,
                level: 'Basic',
                title: 'Issue Tracking Styles',
                description: 'Which of the following is described as an issue tracking style in the guide?',
                options: [
                    {
                        text: 'Recursive is an issue tracking style',
                        outcome: 'This is a term not associated with an issue tracking style.',
                        experience: -5
                    },
                    {
                        text: 'Chronological is an issue tracking style',
                        outcome: 'While issues may be sorted chronologically in some tools, this is not an issue tracking style.',
                        experience: -10
                    },
                    {
                        text: 'Kanban is an issue tracking style',
                        outcome: 'Correct! Kanban is a style that uses a series of lanes and containing cards to manage workflow and issues.',
                        experience: 15,
                    },
                    {
                        text: 'Sequential is an issue tracking style',
                        outcome: 'While this might sound similar to a list-based approach, sequential is not specifically an issue tracking style.',
                        experience: 0
                    }
                ]
            },
            {
                id: 13,
                level: 'Basic',
                title: 'DoneDone Permissions',
                description: 'What action can be performed in DoneDone if you have admin permissions but not if you have regular user permissions?',
                options: [
                    {
                        text: 'Creating a new issue is an action that can be performed if you have admin rights.',
                        outcome: 'Regular permissions grant the action of creating an issue and doesn\'t require admin permissions',
                        experience: -5
                    },
                    {
                        text: 'Creating a new issue is an action that can be performed if you have admin rights',
                        outcome: 'Regular permissions grant the action of creating a new issue and doesn\'t require admin permissions', 
                        experience: -10
                    },
                    {
                        text: 'Editing multiple issues at once is an action that can be performed if you have admin rights',
                        outcome: 'Correct! If you have Admin permissions in DoneDone, you are permitted to edit tickets in bulk',
                        experience: 15,
                    },
                    {
                        text: 'Searching for a project is an action that can be performed if you have admin rights',
                        outcome: 'Regular permissions grant the action of searching for a project and doesn\'t require admin permissions.',
                        experience: 0
                    }
                ]
            },
            {
                id: 14,
                level: 'Basic',
                title: 'Tracking Tool Risk',
                description: 'Which of the following is listed as a risk or disadvantage of using issue tracking tools?',
                options: [
                    {
                        text: 'Ineffective usage is a risk of using a tracking tool',
                        outcome: 'Correct! Despite having issues organised within a tracker, if used ineffectively the issues raised can become redundant or ignored by developers and testers, with no development progress being made.',
                        experience: 15,
                    },
                    {
                        text: 'Decreased collaboration is a risk of using a tracking tool',
                        outcome: 'Communication & collaboration is as an advantage of using issue tracking tools.',
                        experience: -10
                    },
                    {
                        text: 'Limited visibility is a risk of using a tracking tool',
                        outcome: 'Improved visibility & traceability is as an advantage of using issue tracking tools.',
                        experience: -5
                    },
                    {
                        text: 'Reduced traceability is a risk of using a tracking tool',
                        outcome: 'Improved traceability is an advantage of using issue trackers.',
                        experience: 0
                    }
                ]
            },
            {
                id: 15,
                level: 'Basic',
                title: 'Issue Tracker Tags',
                description: 'What is the primary purpose of using tags in issue tracking tools?',
                options: [
                    {
                        text: 'To organize issues more effectively',
                        outcome: 'Correct! many tracking tools include the ability to apply custom tags which aids in organising and searching for issues more effectively.',
                        experience: 15,
                    },
                    {
                        text: 'To create visual distinctions between issues',
                        outcome: 'While tags might create visual distinctions, this is not their primary purpose.',
                        experience: -10
                    },
                    {
                        text: 'To automate issue resolution processes',
                        outcome: 'The primary purpose is to make organising and searching for issues more effectively not to automate a resolution process.',
                        experience: -5
                    },
                    {
                        text: 'To assign priority levels',
                        outcome: 'Priority levels are treated as a separate feature from tags.',
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
                title: 'Bulk Issue Editing',
                description: 'You need to change the fixer for multiple issues. What\'s the most efficient approach?',
                options: [
                    {
                        text: 'Use the bulk edit feature, select issues with checkboxes, and change \'fixer\' for all selected',
                        outcome: 'Perfect! This is the most efficient way to edit multiple issues.',
                        experience: 20,         
                    },
                    {
                        text: 'Edit each issue individually and add the \'fixer\' details for each one',
                        outcome: 'Bulk editing is more efficient for multiple changes.',
                        experience: -15
                    },
                    {
                        text: 'Ask the project manager to make the specified changes',
                        outcome: 'The bulk edit feature should be used if you have correct permissions as to not take focus away from other tasks that are essential to project managers.',
                        experience: -10
                    },
                    {
                        text: 'Leave a comment on each issue that states the new \'fixer\' details',
                        outcome: 'Direct bulk editing is more efficient and effective.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Report Generation',
                description: 'The client needs a status report on all issues. How do you proceed?',
                options: [
                    {
                        text: 'Use the Reports feature to generate pie charts showing Status, Priority, Fixer, and Tester',
                        outcome: 'Excellent! This provides comprehensive issue status visualization.',
                        experience: 20, 
                    },
                    {
                        text: 'Manually count all issues and report this back to the client',
                        outcome: 'Using the built-in reporting features is more efficient and more in depth details are required than just ticket number.',
                        experience: -15
                    },
                    {
                        text: 'Report back to the client on open issue count and status',
                        outcome: 'A complete status report requires all issues to be included for traceability.',
                        experience: -10
                    },
                    {
                        text: 'Send the raw issue list to the client for consideration',
                        outcome: 'Visualised reports are more informative and helpful for the client to manage.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Tag Management',
                description: 'You need to organise issues for better tracking. What\'s the best approach?',
                options: [
                    {
                        text: 'Apply relevant tags consistently and link to appropriate epics and parent tickets',
                        outcome: 'Perfect! This ensures proper issue organisation and hierarchy.',
                        experience: 20,
                    },
                    {
                        text: 'Use personal preference for tags associated with tickets',
                        outcome: 'Tags should be consistent and meaningful to the specific project.',
                        experience: -15
                    },
                    {
                        text: 'Leave tagging for larger projects as this is not necessary',
                        outcome: 'Tags for larger projects are especially essential as they can help organise and track issues effectively.',
                        experience: -10
                    },
                    {
                        text: 'Tag all major issues for traceability and visual consistency',
                        outcome: 'Consistent tagging of all tickets regardless of severity helps track all issues.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Activity Tracking',
                description: 'You need to review recent changes to issues. What\'s the best method?',
                options: [
                    {
                        text: 'Use the Activity feature to view time-stamped logs of all project changes',
                        outcome: 'Excellent! This shows complete activity history.',
                        experience: 20,
                    },
                    {
                        text: 'Ask team members what has changed within specified issues',
                        outcome: 'Activity logs provide a more reliable history as team members may have been working on other projects since the project in question.',
                        experience: -15
                    },
                    {
                        text: 'Check all recent issues that have been raised to the tracking tool',
                        outcome: 'Activity logs show all project changes and therefore this is the most efficient way of checking issue history.',
                        experience: -10
                    },
                    {
                        text: 'Rely on memory for changes made to issues within the project',
                        outcome: 'Activity tracking is more efficient as remembering changes to all issues on multiple projects is highly unlikely.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Cross-Tool Migration',
                description: 'The client wants to switch from DoneDone to Jira. How do you handle issue transfer?',
                options: [
                    {
                        text: 'Export data from DoneDone and ensure proper formatting for Jira import',
                        outcome: 'Perfect! This ensures correct data migration.',
                        experience: 20,
                    },
                    {
                        text: 'Manually recreate all the issues in Jira and reference these in the project test script',
                        outcome: 'Data export and import is more efficient in this instance.',
                        experience: -15
                    },
                    {
                        text: 'Transfer all open issues from DoneDone to Jira',
                        outcome: 'All issues and ticket history should be migrated for traceability.',
                        experience: -10
                    },
                    {
                        text: 'Keep using both tools throughout the project lifecycle',
                        outcome: 'Clean migration is more efficient and manageable than split tracking.',
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
                title: 'Multi-Tool Integration',
                description: 'You\'re working with multiple tracking tools across projects. How do you maintain consistency?',
                options: [
                    {
                        text: 'Document tool-specific processes while maintaining consistent issue format and tracking principles',
                        outcome: 'Excellent! This ensures consistency across different tools.',
                        experience: 25,
                    },
                    {
                        text: 'Use different formats for tickets within each bug tracking tool',
                        outcome: 'Consistency helps maintain quality across tools.',
                        experience: -15
                    },
                    {
                        text: 'Use one preferred tracking tool by the tester working on the project',
                        outcome: 'If multiple tracking tools are needed for a project, then correct management is essential and they cannot be allowed to move out of sync by using one tool only.',
                        experience: -10
                    },
                    {
                        text: 'Avoid using certain tools and only use a tool that you are familiar with',
                        outcome: 'All requested tracking tools require utilisation.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Complex Issue Hierarchy',
                description: 'You need to manage a complex set of related issues. What\'s the best approach?',
                options: [
                    {
                        text: 'Create parent-child relationships, use epics, and maintain clear linking between related issues',
                        outcome: 'Perfect! This creates clear issue relationships.',
                        experience: 25,
                    },
                    {
                        text: 'Keep all issues completely separate as to not confuse root cause',
                        outcome: 'Related issues need correctly linking for traceability.',
                        experience: -15
                    },
                    {
                        text: 'Create tickets with duplicated elements and dependencies within them',
                        outcome: 'The use of hierarchy features removes the need to create duplicates.',
                        experience: -10
                    },
                    {
                        text: 'Raise related major issues, as when these are addressed, any dependant issues will be resolved',
                        outcome: 'All related issues need correct organisation and any dependencies should be documented.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Workflow Optimisation',
                description: 'The current issue workflow is inefficient. How do you improve it?',
                options: [
                    {
                        text: 'Analyse the current process, propose improvements, and implement streamlined workflow with team agreement',
                        outcome: 'Excellent! This ensures systematic improvement.',
                        experience: 25,
                    },
                    {
                        text: 'Change the workflow without prior consultation',
                        outcome: 'Team agreement is required for workflow changes so everybody knows the process.',
                        experience: -15
                    },
                    {
                        text: 'Keep the current workflow in favour of situational workarounds',
                        outcome: 'Workflow optimisation is important and essential in moving forward with improvement and efficiency.',
                        experience: -10
                    },
                    {
                        text: 'Create a personal workflow and stick to this strategy for projects that you work on',
                        outcome: 'Team-wide consistency is required and promotes professionalism and workflow improvement.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Knowledge Transfer',
                description: 'New team members need to learn multiple tracking tools. How do you handle this?',
                options: [
                    {
                        text: 'Create comprehensive documentation for each tool with examples and best practices',
                        outcome: 'Perfect! This ensures effective knowledge transfer.',
                        experience: 25,
                    },
                    {
                        text: 'Let them explore the features with the tracking tools and learn by trial and error',
                        outcome: 'Documentation aids learning on a consistent and affective basis.',
                        experience: -15
                    },
                    {
                        text: 'Explain the basics of each tracking tool in a knowledge transfer session',
                        outcome: 'Complete tool knowledge is essential and important and reference material is also advised.',
                        experience: -10
                    },
                    {
                        text: 'Ask them to refer to online help and guidelines',
                        outcome: 'Bespoke documentation helps specific company needs and standards.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Tool Selection Advice',
                description: 'A client asks for advice on choosing an issue tracking tool. How do you respond?',
                options: [
                    {
                        text: 'Analyse their needs, compare tool features, and recommend based on specific requirements',
                        outcome: 'Excellent! This provides tailored recommendations.',
                        experience: 25,
                    },
                    {
                        text: 'Recommend DoneDone issue tracker for use with all their projects',
                        outcome: 'Different needs may require different tracking tools and this would need to be explored.',
                        experience: -15
                    },
                    {
                        text: 'Let them choose without guidance based on their own preference',
                        outcome: 'Guidance in this type of instance helps make informed decisions.',
                        experience: -10
                    },
                    {
                        text: 'Suggest the most expensive tool as it should cover every need',
                        outcome: 'Recommendations should match specific needs, not just the most expensive tool on the market.',
                        experience: -5
                    }
                ]
            }
        ]
}