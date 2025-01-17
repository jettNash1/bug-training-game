import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';

class IssueTrackingToolsQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
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

        // Basic Scenarios (IDs 1-5, 75 XP total)
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
                        text: 'Email the issue details to the developer',
                        outcome: 'Issues should be logged in the tracking tool.',
                        experience: -10
                    },
                    {
                        text: 'Write the issue in a document',
                        outcome: 'Issues need to be logged in the tracking tool for visibility.',
                        experience: -5
                    },
                    {
                        text: 'Wait for someone else to log the issue',
                        outcome: 'Proactive issue logging is essential.',
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
                        text: 'Scroll through all projects manually',
                        outcome: 'Using the search bar is more efficient.',
                        experience: -10
                    },
                    {
                        text: 'Ask a colleague for the project location',
                        outcome: 'Using the search bar is the best approach.',
                        experience: -5
                    },
                    {
                        text: 'Wait for the project to appear in notifications',
                        outcome: 'Proactive searching is more effective.',
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
                        text: 'Delete the issue and create a new one',
                        outcome: 'Editing is more efficient than recreating.',
                        experience: -10
                    },
                    {
                        text: 'Email changes to the project manager',
                        outcome: 'Changes should be made directly in the tool.',
                        experience: -5
                    },
                    {
                        text: 'Wait for someone else to edit the issue',
                        outcome: 'Proactive issue management is essential.',
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
                        text: 'Manually search through all issues',
                        outcome: 'Using filters is more efficient.',
                        experience: -10
                    },
                    {
                        text: 'Ask a colleague to find the issues',
                        outcome: 'Using filters is the best approach.',
                        experience: -5
                    },
                    {
                        text: 'Wait for issues to be sorted automatically',
                        outcome: 'Proactive filtering is more effective.',
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
                        text: 'A tool that only uses lists',
                        outcome: 'Kanban uses lanes and cards, not just lists.',
                        experience: -10
                    },
                    {
                        text: 'A tool that tracks time spent on issues',
                        outcome: 'Kanban focuses on workflow management.',
                        experience: -5
                    },
                    {
                        text: 'A tool that only tracks bugs',
                        outcome: 'Kanban can manage various types of issues.',
                        experience: 0
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10, 125 XP total)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Bulk Issue Editing',
                description: 'You need to change the fixer for multiple issues. What\'s the most efficient approach?',
                options: [
                    {
                        text: 'Use bulk edit feature, select issues with checkboxes, and change fixer for all selected',
                        outcome: 'Perfect! This is the most efficient way to edit multiple issues.',
                        experience: 20,
                        tool: 'Bulk Editing'
                    },
                    {
                        text: 'Edit each issue individually',
                        outcome: 'Bulk editing is more efficient for multiple changes.',
                        experience: -15
                    },
                    {
                        text: 'Ask PM to make the changes',
                        outcome: 'Use available bulk edit features when you have access.',
                        experience: -10
                    },
                    {
                        text: 'Leave comment on each issue',
                        outcome: 'Direct bulk editing is more effective.',
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
                        text: 'Manually count all issues',
                        outcome: 'Using built-in reporting features is more efficient.',
                        experience: -15
                    },
                    {
                        text: 'Only report on open issues',
                        outcome: 'Complete status reporting needs all issues.',
                        experience: -10
                    },
                    {
                        text: 'Send raw issue list',
                        outcome: 'Visualized reports are more informative.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Tag Management',
                description: 'You need to organize issues for better tracking. What\'s the best approach?',
                options: [
                    {
                        text: 'Apply relevant tags consistently and link to appropriate epics/parent tickets',
                        outcome: 'Perfect! This ensures proper issue organization and hierarchy.',
                        experience: 20,
                        tool: 'Issue Organization'
                    },
                    {
                        text: 'Use random tags',
                        outcome: 'Tags should be consistent and meaningful.',
                        experience: -15
                    },
                    {
                        text: 'Skip tagging entirely',
                        outcome: 'Tags help organize and track issues effectively.',
                        experience: -10
                    },
                    {
                        text: 'Only tag major issues',
                        outcome: 'Consistent tagging helps track all issues.',
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
                        text: 'Ask team members what changed',
                        outcome: 'Activity logs provide more reliable history.',
                        experience: -15
                    },
                    {
                        text: 'Check only recent issues',
                        outcome: 'Activity logs show all project changes.',
                        experience: -10
                    },
                    {
                        text: 'Rely on memory',
                        outcome: 'Activity tracking needs systematic logging.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Cross-Tool Migration',
                description: 'Client wants to switch from DoneDone to Jira. How do you handle issue transfer?',
                options: [
                    {
                        text: 'Export data from DoneDone and ensure proper formatting for Jira import',
                        outcome: 'Perfect! This ensures proper data migration.',
                        experience: 20,
                        tool: 'Data Migration'
                    },
                    {
                        text: 'Manually recreate issues',
                        outcome: 'Data export/import is more efficient.',
                        experience: -15
                    },
                    {
                        text: 'Only transfer open issues',
                        outcome: 'All issue history should be migrated.',
                        experience: -10
                    },
                    {
                        text: 'Keep using both tools',
                        outcome: 'Clean migration is better than split tracking.',
                        experience: 0
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15, 100 XP total)
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
                        text: 'Use different formats for each tool',
                        outcome: 'Consistency helps maintain quality across tools.',
                        experience: -15
                    },
                    {
                        text: 'Only use one preferred tool',
                        outcome: 'Multiple tools need proper management.',
                        experience: -10
                    },
                    {
                        text: 'Avoid using certain tools',
                        outcome: 'All tools need proper utilization.',
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
                        text: 'Keep all issues separate',
                        outcome: 'Related issues need proper linking.',
                        experience: -15
                    },
                    {
                        text: 'Create duplicate issues',
                        outcome: 'Use hierarchy features instead of duplicates.',
                        experience: -10
                    },
                    {
                        text: 'Only track major issues',
                        outcome: 'All issues need proper organization.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Workflow Optimization',
                description: 'The current issue workflow is inefficient. How do you improve it?',
                options: [
                    {
                        text: 'Analyze current process, propose improvements, and implement streamlined workflow with team agreement',
                        outcome: 'Excellent! This ensures systematic improvement.',
                        experience: 25,
                        tool: 'Workflow Management'
                    },
                    {
                        text: 'Change workflow without consultation',
                        outcome: 'Team agreement is needed for workflow changes.',
                        experience: -15
                    },
                    {
                        text: 'Keep inefficient workflow',
                        outcome: 'Workflow optimization is important.',
                        experience: -10
                    },
                    {
                        text: 'Create personal workflow',
                        outcome: 'Team-wide consistency is needed.',
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
                        text: 'Let them learn by trial and error',
                        outcome: 'Proper documentation aids learning.',
                        experience: -15
                    },
                    {
                        text: 'Only explain basics',
                        outcome: 'Complete tool knowledge is important.',
                        experience: -10
                    },
                    {
                        text: 'Refer to online help only',
                        outcome: 'Custom documentation helps specific needs.',
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
                        text: 'Analyze their needs, compare tools\' features, and recommend based on specific requirements',
                        outcome: 'Excellent! This provides tailored recommendations.',
                        experience: 25,
                        tool: 'Tool Selection'
                    },
                    {
                        text: 'Recommend only DoneDone',
                        outcome: 'Different needs may require different tools.',
                        experience: -15
                    },
                    {
                        text: 'Let them choose without input',
                        outcome: 'Guidance helps make informed decisions.',
                        experience: -10
                    },
                    {
                        text: 'Suggest the most expensive tool',
                        outcome: 'Recommendations should match needs.',
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
        const progress = {
            experience: this.player.experience,
            tools: this.player.tools,
            currentScenario: this.player.currentScenario,
            questionHistory: this.player.questionHistory,
            lastUpdated: new Date().toISOString()
        };

        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot save progress');
                return;
            }
            
            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify({ progress }));
            
            await this.apiService.saveQuizProgress(this.quizName, progress);
            console.log('Progress saved successfully:', progress);
        } catch (error) {
            console.error('Failed to save progress:', error);
            // Continue without saving - don't interrupt the user experience
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
            let progress = null;
            
            if (savedProgress && savedProgress.data) {
                progress = savedProgress.data;
                console.log('Loaded progress from API:', progress);
            } else {
                // Try loading from localStorage
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (parsed.progress) {
                        progress = parsed.progress;
                        console.log('Loaded progress from localStorage:', progress);
                    }
                }
            }

            if (progress) {
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                
                // Set the current scenario to the actual value from progress
                this.player.currentScenario = progress.currentScenario || 0;

                // Update UI
                this.updateProgress();

                // Update the questions progress display
                const questionsProgress = document.getElementById('questions-progress');
                if (questionsProgress) {
                    questionsProgress.textContent = `${this.player.questionHistory.length}/15`;
                }

                // Update the current scenario display
                const currentScenarioDisplay = document.getElementById('current-scenario');
                if (currentScenarioDisplay) {
                    currentScenarioDisplay.textContent = `${this.player.currentScenario}`;
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

            // Check if quiz was previously failed
            const username = localStorage.getItem('username');
            if (username) {
                let failed = false;
                
                // First check localStorage for immediate feedback
                const storageKey = `quiz_progress_${username}_${this.quizName}`;
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    try {
                        const parsedData = JSON.parse(localData);
                        if (parsedData.progress?.status === 'failed') {
                            failed = true;
                            this.player.experience = parsedData.progress.experience || 0;
                            this.player.questionHistory = parsedData.progress.questionHistory || [];
                        }
                    } catch (error) {
                        console.error('Error parsing local storage data:', error);
                    }
                }

                // Then check the API
                try {
                    const quizResult = await this.apiService.getQuizProgress(this.quizName);
                    if (quizResult?.data?.status === 'failed') {
                        failed = true;
                        this.player.experience = quizResult.data.experience || this.player.experience || 0;
                        this.player.questionHistory = quizResult.data.questionHistory || this.player.questionHistory || [];
                    }
                } catch (error) {
                    console.error('Error checking quiz status from API:', error);
                }

                if (failed) {
                    // If quiz was failed, show the end screen immediately
                    this.endGame(true);
                    return;
                }
            }

            // Initialize event listeners
            this.initializeEventListeners();

            // Load previous progress only if not failed
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
        
        if (questionCount < 5) {
            // Basic questions (0-4)
            scenario = this.basicScenarios[questionCount];
        } else if (questionCount < 10) {
            // Intermediate questions (5-9)
            scenario = this.intermediateScenarios[questionCount - 5];
        } else if (questionCount < 15) {
            // Advanced questions (10-14)
            scenario = this.advancedScenarios[questionCount - 10];
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
        const previousLevel = this.player.questionHistory.length > 0 ? 
            this.getCurrentLevel() : null;
            
        if (this.player.questionHistory.length === 0 || previousLevel !== currentLevel) {
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
    }

    async handleAnswer() {
        if (this.isLoading) return;
        
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
        }
        
        try {
            this.isLoading = true;
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) return;

            // Get the correct scenario based on question count
            let scenario;
            const questionCount = this.player.questionHistory.length;
            
            if (questionCount < 5) {
                scenario = this.basicScenarios[questionCount];
            } else if (questionCount < 10) {
                scenario = this.intermediateScenarios[questionCount - 5];
            } else if (questionCount < 15) {
                scenario = this.advancedScenarios[questionCount - 10];
            }

            if (!scenario) {
                console.error('No scenario found for question count:', questionCount);
                this.endGame(true);
                return;
            }

            const originalIndex = parseInt(selectedOption.value);
            const selectedAnswer = scenario.options[originalIndex];

            // Update player state
            this.player.experience = Math.max(0, Math.min(this.maxXP, this.player.experience + selectedAnswer.experience));
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience))
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
            document.getElementById('outcome-text').textContent = selectedAnswer.outcome;
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
        // Update experience display
        const experienceDisplay = document.getElementById('experience-display');
        if (experienceDisplay) {
            experienceDisplay.textContent = `XP: ${this.player.experience}/${this.maxXP}`;
        }

        // Update question progress
        const questionProgress = document.getElementById('question-progress');
        const progressFill = document.getElementById('progress-fill');
        if (questionProgress && progressFill) {
            const totalQuestions = 15;
            const completedQuestions = Math.min(this.player.questionHistory.length, totalQuestions);
            
            // Use stored question number for consistency
            questionProgress.textContent = `Question: ${this.currentQuestionNumber || completedQuestions}/15`;
            
            // Update progress bar
            const progressPercentage = (completedQuestions / totalQuestions) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }

        // Update level indicator
        const levelIndicator = document.getElementById('level-indicator');
        if (levelIndicator) {
            const currentLevel = this.getCurrentLevel();
            levelIndicator.textContent = `Level: ${currentLevel}`;
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

    endGame(failed = false) {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        const finalScore = Math.min(this.player.experience, this.maxXP);
        const scorePercentage = Math.round((finalScore / this.maxXP) * 100);
        
        // Update the title based on pass/fail status
        const titleElement = this.endScreen.querySelector('h2');
        if (titleElement) {
            titleElement.textContent = failed ? 'Quiz Failed!' : 'Quiz Complete!';
        }

        // Save the final quiz result with pass/fail status
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                const result = {
                    score: scorePercentage,
                    status: failed ? 'failed' : 'passed',
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory,
                    questionsAnswered: this.player.questionHistory.length,
                    lastActive: new Date().toISOString()
                };
                user.updateQuizScore(this.quizName, result);
                console.log('Final quiz score saved:', result);

                // Also save to localStorage to ensure immediate persistence
                const storageKey = `quiz_progress_${username}_${this.quizName}`;
                localStorage.setItem(storageKey, JSON.stringify({ progress: result }));
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

        const performanceSummary = document.getElementById('performance-summary');
        if (failed) {
            performanceSummary.textContent = 'Quiz failed. You did not meet the minimum XP requirement to progress. Please contact your supervisor to reset your progress.';
            // Hide restart button if failed
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.style.display = 'none';
            }
        } else {
            const threshold = this.performanceThresholds.find(t => finalScore >= t.threshold);
            performanceSummary.textContent = threshold.message;
        }

        // Display question review
        const reviewList = document.getElementById('question-review');
        reviewList.innerHTML = '';
        
        this.player.questionHistory.forEach((record, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            const maxXP = record.maxPossibleXP;
            const earnedXP = record.selectedAnswer.experience;
            const isCorrect = earnedXP === maxXP;
            
            reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
            
            reviewItem.innerHTML = `
                <h4>Question ${index + 1}</h4>
                <p>${record.scenario.description}</p>
                <p><strong>Your Answer:</strong> ${record.selectedAnswer.text}</p>
                <p><strong>Outcome:</strong> ${record.selectedAnswer.outcome}</p>
                <p><strong>Experience Earned:</strong> ${earnedXP}/${maxXP}</p>
            `;
            
            reviewList.appendChild(reviewItem);
        });

        this.generateRecommendations();
    }
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new IssueTrackingToolsQuiz();
    quiz.startGame();
}); 
