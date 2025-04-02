import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class IssueTrackingToolsQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re an issue tracking expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong tool management skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing issue tracking best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'issue-tracking-tools',
            writable: false,
            configurable: false,
            enumerable: true
        });
        
        // Initialize player state
        this.player = {
            name: '',
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: []
        };

        // Initialize API service
        this.apiService = new APIService();

        // Initialize all screen elements
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');
        
        // Verify all required elements exist
        if (!this.gameScreen) {
            console.error('Game screen element not found');
            this.showError('Quiz initialization failed. Please refresh the page.');
            return;
        }
        
        if (!this.outcomeScreen) {
            console.error('Outcome screen element not found');
            this.showError('Quiz initialization failed. Please refresh the page.');
            return;
        }
        
        if (!this.endScreen) {
            console.error('End screen element not found');
            this.showError('Quiz initialization failed. Please refresh the page.');
            return;
        }

        // Basic Scenarios (IDs 1-5)
        this.basicScenarios = [
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
                        tool: 'Issue Creation'
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
                        tool: 'Project Search'
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
                        tool: 'Issue Editing'
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
                        tool: 'Issue Filtering'
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
                        tool: 'Kanban Understanding'
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
            }
        ];

        // Intermediate Scenarios (IDs 6-10)
        this.intermediateScenarios = [
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
                        tool: 'Bulk Editing'
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
                        tool: 'Reporting'
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
                        tool: 'Issue Organization'
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
                        tool: 'Activity Monitoring'
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
                        tool: 'Data Migration'
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
        ];

        // Advanced Scenarios (IDs 11-15)
        this.advancedScenarios = [
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
                        tool: 'Tool Integration'
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
                        tool: 'Issue Hierarchy'
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
                        tool: 'Workflow Management'
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
                        tool: 'Training'
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
                        tool: 'Tool Selection'
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
        ];

        // Initialize UI and add event listeners
        this.initializeEventListeners();

        this.isLoading = false;
    }
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    shouldEndGame(totalQuestionsAnswered, currentXP) {
        return totalQuestionsAnswered >= 15 || currentXP >= this.maxXP;
    }

    async saveProgress() {
        // First determine the status based on clear conditions
        let status = 'in-progress';
        
        // Check for completion (all 15 questions answered)
        if (this.player.questionHistory.length >= 15) {
            // Check if they met the advanced XP requirement
            if (this.player.experience >= this.levelThresholds.advanced.minXP) {
                status = 'completed';
            } else {
                status = 'failed';
            }
        } 
        // Check for early failure conditions
        else if (
            (this.player.questionHistory.length >= 10 && this.player.experience < this.levelThresholds.intermediate.minXP) ||
            (this.player.questionHistory.length >= 5 && this.player.experience < this.levelThresholds.basic.minXP)
        ) {
            status = 'failed';
        }

        const progress = {
            data: {
                experience: this.player.experience,
                tools: this.player.tools,
                currentScenario: this.player.currentScenario,
                questionHistory: this.player.questionHistory,
                lastUpdated: new Date().toISOString(),
                questionsAnswered: this.player.questionHistory.length,
                status: status
            }
        };

        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot save progress');
                return;
            }
            
            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify(progress));
            
            console.log('Saving progress with status:', status);
            await this.apiService.saveQuizProgress(this.quizName, progress.data);
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }

    async loadProgress() {
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot load progress');
                return false;
            }

            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            const savedProgress = await this.apiService.getQuizProgress(this.quizName);
            console.log('Raw API Response:', savedProgress);
            let progress = null;
            
            if (savedProgress && savedProgress.data) {
                // Normalize the data structure
                progress = {
                    experience: savedProgress.data.experience || 0,
                    tools: savedProgress.data.tools || [],
                    questionHistory: savedProgress.data.questionHistory || [],
                    currentScenario: savedProgress.data.currentScenario || 0,
                    status: savedProgress.data.status || 'in-progress'
                };
                console.log('Normalized progress data:', progress);
            } else {
                // Try loading from localStorage as fallback
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    progress = parsed;
                    console.log('Loaded progress from localStorage:', progress);
                }
            }

            if (progress) {
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                this.player.currentScenario = progress.currentScenario || 0;

                // Ensure we're updating the UI correctly
                this.updateProgress();
                
                // Check quiz status and show appropriate screen
                if (progress.status === 'failed') {
                    this.endGame(true);
                    return true;
                } else if (progress.status === 'completed') {
                    this.endGame(false);
                    return true;
                }

                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to load progress:', error);
            return false;
        }
    }

    async startGame() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            // Show loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.remove('hidden');
            }

            // Set player name from localStorage
            this.player.name = localStorage.getItem('username');
            if (!this.player.name) {
                window.location.href = '/login.html';
                return;
            }

            // Initialize event listeners
            this.initializeEventListeners();

            // Load previous progress
            const hasProgress = await this.loadProgress();
            console.log('Previous progress loaded:', hasProgress);
            
            if (!hasProgress) {
                // Reset player state if no valid progress exists
                this.player.experience = 0;
                this.player.tools = [];
                this.player.currentScenario = 0;
                this.player.questionHistory = [];
            }
            
            // Clear any existing transition messages
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = '';
                transitionContainer.classList.remove('active');
            }

            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
            }
            
            await this.displayScenario();
        } catch (error) {
            console.error('Failed to start game:', error);
            this.showError('Failed to start the quiz. Please try refreshing the page.');
        } finally {
            this.isLoading = false;
            // Hide loading state
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
        }
    }

    initializeEventListeners() {
        // Add event listeners for the continue and restart buttons
        document.getElementById('continue-btn')?.addEventListener('click', () => this.nextScenario());
        document.getElementById('restart-btn')?.addEventListener('click', () => this.restartGame());

        // Add form submission handler
        document.getElementById('options-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAnswer();
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.type === 'radio') {
                this.handleAnswer();
            }
        });
    }

    displayScenario() {
        const currentScenarios = this.getCurrentScenarios();
        
        // Check basic level completion
        if (this.player.questionHistory.length >= 5) {
            if (this.player.experience < this.levelThresholds.basic.minXP) {
                this.endGame(true); // End with failure state
                return;
            }
        }

        // Check intermediate level completion
        if (this.player.questionHistory.length >= 10) {
            if (this.player.experience < this.levelThresholds.intermediate.minXP) {
                this.endGame(true); // End with failure state
                return;
            }
        }

        // Check Advanced level completion
        if (this.player.questionHistory.length >= 15) {
            if (this.player.experience < this.levelThresholds.advanced.minXP) {
                this.endGame(true); // End with failure state
                return;
            } else {
                this.endGame(false); // Completed successfully
                return;
            }
        }

        // Get the next scenario based on current progress
        let scenario;
        const questionCount = this.player.questionHistory.length;
        
        // Reset currentScenario based on the current level
        if (questionCount < 5) {
            // Basic questions (0-4)
            scenario = this.basicScenarios[questionCount];
            this.player.currentScenario = questionCount;
        } else if (questionCount < 10) {
            // Intermediate questions (5-9)
            scenario = this.intermediateScenarios[questionCount - 5];
            this.player.currentScenario = questionCount - 5;
        } else if (questionCount < 15) {
            // Advanced questions (10-14)
            scenario = this.advancedScenarios[questionCount - 10];
            this.player.currentScenario = questionCount - 10;
        }

        if (!scenario) {
            console.error('No scenario found for current progress. Question count:', questionCount);
            this.endGame(true);
            return;
        }

        // Store current question number for consistency
        this.currentQuestionNumber = questionCount + 1;
        
        // Show level transition message at the start of each level or when level changes
        const currentLevel = this.getCurrentLevel();
        const previousLevel = questionCount > 0 ? 
            (questionCount <= 5 ? 'Basic' : 
             questionCount <= 10 ? 'Intermediate' : 'Advanced') : null;
            
        if (questionCount === 0 || 
            (questionCount === 5 && currentLevel === 'Intermediate') || 
            (questionCount === 10 && currentLevel === 'Advanced')) {
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = ''; // Clear any existing messages
                
                const levelMessage = document.createElement('div');
                levelMessage.className = 'level-transition';
                levelMessage.setAttribute('role', 'alert');
                levelMessage.textContent = `Starting ${currentLevel} Questions`;
                
                transitionContainer.appendChild(levelMessage);
                transitionContainer.classList.add('active');
                
                // Update the level indicator
                const levelIndicator = document.getElementById('level-indicator');
                if (levelIndicator) {
                    levelIndicator.textContent = `Level: ${currentLevel}`;
                }
                
                // Remove the message and container height after animation
                setTimeout(() => {
                    transitionContainer.classList.remove('active');
                    setTimeout(() => {
                        transitionContainer.innerHTML = '';
                    }, 300); // Wait for height transition to complete
                }, 3000);
            }
        }

        // Update scenario display
        const titleElement = document.getElementById('scenario-title');
        const descriptionElement = document.getElementById('scenario-description');
        const optionsContainer = document.getElementById('options-container');

        if (!titleElement || !descriptionElement || !optionsContainer) {
            console.error('Required elements not found');
            return;
        }

        titleElement.textContent = scenario.title;
        descriptionElement.textContent = scenario.description;

        // Update question counter immediately
        const questionProgress = document.getElementById('question-progress');
        if (questionProgress) {
            questionProgress.textContent = `Question: ${this.currentQuestionNumber}/15`;
        }

        // Create a copy of options with their original indices
        const shuffledOptions = scenario.options.map((option, index) => ({
            ...option,
            originalIndex: index
        }));

        // Shuffle the options
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }

        optionsContainer.innerHTML = '';

        shuffledOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <input type="radio" 
                    name="option" 
                    value="${option.originalIndex}" 
                    id="option${index}"
                    tabindex="0"
                    aria-label="${option.text}"
                    role="radio">
                <label for="option${index}">${option.text}</label>
            `;
            optionsContainer.appendChild(optionElement);
        });

        this.updateProgress();

        // Initialize timer for the new question
        this.initializeTimer();
    }

    async handleAnswer() {
        if (this.isLoading) return;
        
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
        }

        // Clear the timer when an answer is submitted
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }
        
        try {
            this.isLoading = true;
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) return;

            const currentScenarios = this.getCurrentScenarios();
            const scenario = currentScenarios[this.player.currentScenario];
            const originalIndex = parseInt(selectedOption.value);
            
            const selectedAnswer = scenario.options[originalIndex];

            // Calculate new experience with level-based minimum thresholds
            let newExperience = this.player.experience + selectedAnswer.experience;
            
            // Apply minimum thresholds based on current level
            const questionCount = this.player.questionHistory.length;
            if (questionCount >= 5) { // Intermediate level
                newExperience = Math.max(this.levelThresholds.basic.minXP, newExperience);
            }
            if (questionCount >= 10) { // Advanced level
                newExperience = Math.max(this.levelThresholds.intermediate.minXP, newExperience);
            }

            // Update player experience with bounds
            this.player.experience = Math.max(0, Math.min(this.maxXP, newExperience));
            
            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add status to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                status: selectedAnswer.experience > 0 ? 'passed' : 'failed',
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience)),
                timeSpent: timeSpent,
                timedOut: false
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();

            // Calculate the score and experience
            const totalQuestions = 15;
            const completedQuestions = this.player.questionHistory.length;
            const percentComplete = Math.round((completedQuestions / totalQuestions) * 100);
            
            const score = {
                quizName: this.quizName,
                score: percentComplete,
                experience: this.player.experience,
                questionHistory: this.player.questionHistory,
                questionsAnswered: completedQuestions,
                lastActive: new Date().toISOString()
            };
            
            // Save quiz result
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                await quizUser.updateQuizScore(
                    this.quizName,
                    score.score,
                    score.experience,
                    this.player.tools,
                    score.questionHistory,
                    score.questionsAnswered
                );
            }

            // Show outcome screen
            if (this.gameScreen && this.outcomeScreen) {
                this.gameScreen.classList.add('hidden');
                this.outcomeScreen.classList.remove('hidden');
            }
            
            // Update outcome display
            const correctAnswer = scenario.options.reduce((prev, current) => 
                (prev.experience > current.experience) ? prev : current
            );

            let outcomeText = selectedAnswer.outcome;
            document.getElementById('outcome-text').textContent = outcomeText;
            
            const xpText = selectedAnswer.experience >= 0 ? 
                `Experience gained: +${selectedAnswer.experience}` : 
                `Experience: ${selectedAnswer.experience}`;
            document.getElementById('xp-gained').textContent = xpText;
            
            if (selectedAnswer.tool) {
                document.getElementById('tool-gained').textContent = `Tool acquired: ${selectedAnswer.tool}`;
                if (!this.player.tools.includes(selectedAnswer.tool)) {
                    this.player.tools.push(selectedAnswer.tool);
                }
            } else {
                document.getElementById('tool-gained').textContent = '';
            }

            this.updateProgress();
        } catch (error) {
            console.error('Failed to handle answer:', error);
            this.showError('Failed to save your answer. Please try again.');
        } finally {
            this.isLoading = false;
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    }

    nextScenario() {
        // Hide outcome screen and show game screen
        if (this.outcomeScreen && this.gameScreen) {
            this.outcomeScreen.classList.add('hidden');
            this.gameScreen.classList.remove('hidden');
        }
        
        // Display next scenario
        this.displayScenario();
    }

    updateProgress() {
        // Get current level and question count
        const currentLevel = this.getCurrentLevel();
        const totalAnswered = this.player.questionHistory.length;
        const questionNumber = totalAnswered + 1;
        
        // Update the existing progress card elements
        const levelInfoElement = document.querySelector('.level-info');
        const questionInfoElement = document.querySelector('.question-info');
        
        if (levelInfoElement) {
            levelInfoElement.textContent = `Level: ${currentLevel}`;
        }
        
        if (questionInfoElement) {
            questionInfoElement.textContent = `Question: ${questionNumber}/15`;
        }
        
        // Ensure the card is visible
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'block';
        }
        
        // Update legacy progress elements if they exist
        const levelIndicator = document.getElementById('level-indicator');
        const questionProgress = document.getElementById('question-progress');
        const progressFill = document.getElementById('progress-fill');
        
        if (levelIndicator) {
            levelIndicator.textContent = `Level: ${currentLevel}`;
        }
        
        if (questionProgress) {
            questionProgress.textContent = `Question: ${questionNumber}/${this.totalQuestions || 15}`;
        }
        
        if (progressFill) {
            const progressPercentage = (totalAnswered / (this.totalQuestions || 15)) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
    }

    restartGame() {
        // Reset player state
        this.player = {
            name: localStorage.getItem('username'),
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: []
        };

        // Reset UI
        this.gameScreen.classList.remove('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');

        // Clear any existing transition messages
        const transitionContainer = document.getElementById('level-transition-container');
        if (transitionContainer) {
            transitionContainer.innerHTML = '';
            transitionContainer.classList.remove('active');
        }

        // Update progress display
        this.updateProgress();

        // Start from first scenario
        this.displayScenario();
    }

    getCurrentScenarios() {
        const totalAnswered = this.player.questionHistory.length;
        const currentXP = this.player.experience;
        
        // Check for level progression
        if (totalAnswered >= 10 && currentXP >= this.levelThresholds.intermediate.minXP) {
            return this.advancedScenarios;
        } else if (totalAnswered >= 5 && currentXP >= this.levelThresholds.basic.minXP) {
            return this.intermediateScenarios;
        }
        return this.basicScenarios;
    }

    getCurrentLevel() {
        const totalAnswered = this.player.questionHistory.length;
        const currentXP = this.player.experience;
        
        if (totalAnswered >= 10 && currentXP >= this.levelThresholds.intermediate.minXP) {
            return 'Advanced';
        } else if (totalAnswered >= 5 && currentXP >= this.levelThresholds.basic.minXP) {
            return 'Intermediate';
        }
        return 'Basic';
    }

    generateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations');
        if (!recommendationsContainer) return;

        const score = Math.round((this.player.experience / this.maxXP) * 100);
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            const maxXP = record.maxPossibleXP;
            const earnedXP = record.selectedAnswer.experience;
            const isCorrect = earnedXP === maxXP;

            // Categorize the question based on its content
            const questionType = this.categorizeQuestion(record.scenario);
            
            if (isCorrect) {
                if (!strongAreas.includes(questionType)) {
                    strongAreas.push(questionType);
                }
            } else {
                if (!weakAreas.includes(questionType)) {
                    weakAreas.push(questionType);
                }
            }
        });

        // Generate recommendations HTML
        let recommendationsHTML = '';

        if (score >= 95 && weakAreas.length === 0) {
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of issue tracking tools. You clearly understand the nuances of issue tracking tools and are well-equipped to handle any issue tracking tools challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your issue tracking tools skills are very strong. To achieve complete mastery, consider focusing on:</p>';
            recommendationsHTML += '<ul>';
            if (weakAreas.length > 0) {
                weakAreas.forEach(area => {
                    recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
                });
            }
            recommendationsHTML += '</ul>';
        } else if (score >= 60) {
            recommendationsHTML = '<p>👍 Good effort! Here are some areas to focus on:</p>';
            recommendationsHTML += '<ul>';
            weakAreas.forEach(area => {
                recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
            });
            recommendationsHTML += '</ul>';
        } else {
            recommendationsHTML = '<p>📚 Here are key areas for improvement:</p>';
            recommendationsHTML += '<ul>';
            weakAreas.forEach(area => {
                recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
            });
            recommendationsHTML += '</ul>';
        }

        recommendationsContainer.innerHTML = recommendationsHTML;
    }

    categorizeQuestion(scenario) {
        // Categorize questions based on their content
        const title = scenario.title.toLowerCase();
        const description = scenario.description.toLowerCase();

        if (title.includes('creating') || description.includes('create')) {
            return 'Issue Creation';
        } else if (title.includes('editing') || description.includes('edit')) {
            return 'Issue Editing';
        } else if (title.includes('bulk') || description.includes('multiple')) {
            return 'Bulk Operations';
        } else if (title.includes('tag') || description.includes('tag')) {
            return 'Tag Management';
        } else if (title.includes('migration') || description.includes('switch')) {
            return 'Tool Migration';
        } else if (title.includes('integration') || description.includes('multiple tool')) {
            return 'Tool Integration';
        } else if (title.includes('workflow') || description.includes('workflow')) {
            return 'Workflow Management';
        } else {
            return 'General Tool Usage';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Issue Creation': 'Focus on efficient issue creation with complete and accurate information entry.',
            'Issue Editing': 'Improve proficiency in issue modification while maintaining data integrity.',
            'Bulk Operations': 'Develop skills in efficient bulk editing and management of multiple issues.',
            'Tag Management': 'Strengthen consistent tagging practices and hierarchical organization.',
            'Tool Migration': 'Enhance understanding of data export/import processes between different tools.',
            'Tool Integration': 'Work on maintaining consistency across multiple tracking tools.',
            'Workflow Management': 'Focus on proper workflow transitions and status management.',
            'General Tool Usage': 'Continue developing fundamental issue tracking tool skills.'
        };

        return recommendations[area] || 'Continue practicing core issue tracking principles.';
    }

    async endGame(failed = false) {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        // Hide the progress card on the end screen
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'none';
        }

        const finalScore = Math.min(this.player.experience, this.maxXP);
        const scorePercentage = Math.round((finalScore / this.maxXP) * 100);
        
        // Save the final quiz result with pass/fail status
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                const status = failed ? 'failed' : 'completed';
                console.log('Setting final quiz status:', { status, score: scorePercentage });
                
                const result = {
                    score: scorePercentage,
                    status: status,
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory,
                    questionsAnswered: this.player.questionHistory.length,
                    lastActive: new Date().toISOString()
                };

                // Save to QuizUser
                user.updateQuizScore(
                    this.quizName,
                    result.score,
                    result.experience,
                    this.player.tools,
                    result.questionHistory,
                    result.questionsAnswered,
                    status
                );

                // Save to API with proper structure
                const apiProgress = {
                    data: {
                        ...result,
                        tools: this.player.tools,
                        currentScenario: this.player.currentScenario
                    }
                };

                // Save directly via API to ensure status is updated
                console.log('Saving final progress to API:', apiProgress);
                await this.apiService.saveQuizProgress(this.quizName, apiProgress.data);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = failed ? 'Quiz Failed!' : 'Quiz Complete!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (failed) {
            performanceSummary.textContent = 'Quiz failed. You did not meet the minimum XP requirement to progress. You cannot retry this quiz.';
            // Hide restart button if failed
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.style.display = 'none';
            }
            // Add failed class to quiz container for styling
            const quizContainer = document.getElementById('quiz-container');
            if (quizContainer) {
                quizContainer.classList.add('failed');
            }
        } else {
            const threshold = this.performanceThresholds.find(t => t.threshold <= finalScore);
            if (threshold) {
                performanceSummary.textContent = threshold.message;
            } else {
                performanceSummary.textContent = 'Quiz completed successfully!';
            }
        }

        // Generate question review list
        const reviewList = document.getElementById('question-review');
        if (reviewList) {
            reviewList.innerHTML = ''; // Clear existing content
            this.player.questionHistory.forEach((record, index) => {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                
                const maxXP = Math.max(...record.scenario.options.map(o => o.experience));
                const earnedXP = record.selectedAnswer.experience;
                const isCorrect = earnedXP === maxXP;
                
                reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
                
                reviewItem.innerHTML = `
                    <h4>Question ${index + 1}</h4>
                    <p class="scenario">${record.scenario.description}</p>
                    <p class="answer"><strong>Your Answer:</strong> ${record.selectedAnswer.text}</p>
                    <p class="outcome"><strong>Outcome:</strong> ${record.selectedAnswer.outcome}</p>
                    <p class="xp"><strong>Experience Earned:</strong> ${earnedXP}/${maxXP}</p>
                `;
                
                reviewList.appendChild(reviewItem);
            });
        }

        this.generateRecommendations();
    }
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new IssueTrackingToolsQuiz();
    quiz.startGame();
}); 
