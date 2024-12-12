class IssueTrackingQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 350, message: '🏆 Outstanding! You have an excellent understanding of issue tracking tools!' },
                { threshold: 250, message: '👏 Great job! You show strong knowledge of issue tracking tools!' },
                { threshold: 150, message: '👍 Good work! Keep developing your understanding of issue tracking tools.' },
                { threshold: 0, message: '📚 Review the issue tracking tools guide and try again!' }
            ]
        };
        
        super(config);
        
        this.player = {
            name: '',
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: []
        };

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
                        experience: 25,
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
                        experience: 25,
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
                        experience: 25,
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
                        experience: 25,
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
                        experience: 25,
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
                        experience: 20,
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
                        experience: 20,
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
                        experience: 20,
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
                        experience: 20,
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
                        experience: 20,
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

        this.initializeUI();
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.type === 'radio') {
                this.handleAnswer();
            }
        });

        this.isLoading = false;
    }

    async startGame() {
        try {
            this.isLoading = true;
            this.gameScreen.setAttribute('aria-busy', 'true');
            
            this.player.experience = 0;
            this.player.tools = [];
            this.player.currentScenario = 0;
            this.player.questionHistory = [];
            
            await this.displayScenario();
        } catch (error) {
            console.error('Failed to start game:', error);
            this.showError('Failed to start the quiz. Please try refreshing the page.');
        } finally {
            this.isLoading = false;
            this.gameScreen.setAttribute('aria-busy', 'false');
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.role = 'alert';
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.gameScreen.prepend(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }

    nextScenario() {
        this.outcomeScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.player.currentScenario++;
        this.displayScenario();
    }

    displayScenario() {
        const currentScenarios = this.getCurrentScenarios();
        
        // Check if we've completed all questions
        if (this.player.questionHistory.length >= 15) {
            this.endGame();
            return;
        }
        
        if (this.player.currentScenario >= currentScenarios.length) {
            const totalQuestionsAnswered = this.player.questionHistory.length;
            
            if (this.shouldEndGame(totalQuestionsAnswered, this.player.experience)) {
                this.endGame();
                return;
            }
            
            this.player.currentScenario = 0;
            this.displayScenario();
            return;
        }

        const scenario = this.shuffleScenarioOptions(currentScenarios[this.player.currentScenario]);

        if (this.player.currentScenario === 0) {
            const levelMessage = document.createElement('div');
            levelMessage.className = 'level-transition';
            levelMessage.textContent = `Starting ${scenario.level} Questions`;
            this.gameScreen.insertBefore(levelMessage, this.gameScreen.firstChild);
            
            setTimeout(() => levelMessage.remove(), 3000);
            
            document.getElementById('level-indicator').textContent = `Level: ${scenario.level}`;
        }

        document.getElementById('scenario-title').textContent = scenario.title;
        document.getElementById('scenario-description').textContent = scenario.description;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        scenario.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <input type="radio" 
                    name="option" 
                    value="${index}" 
                    id="option${index}"
                    tabindex="0"
                    aria-label="${option.text}"
                    role="radio">
                <label for="option${index}">${option.text}</label>
            `;
            optionsContainer.appendChild(optionElement);
        });

        // Focus on first option for keyboard navigation
        const firstOption = optionsContainer.querySelector('input[type="radio"]');
        if (firstOption) {
            firstOption.focus();
        }

        this.updateProgress();
    }

    getCurrentScenarios() {
        const totalAnswered = this.player.questionHistory.length;
        
        if (totalAnswered >= 10 && this.player.experience >= 150) {
            return this.advancedScenarios;
        } else if (totalAnswered >= 5 && this.player.experience >= 50) {
            return this.intermediateScenarios;
        }
        return this.basicScenarios;
    }

    handleAnswer() {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (!selectedOption) return;

        const currentScenarios = this.getCurrentScenarios();
        const originalScenario = currentScenarios[this.player.currentScenario];
        const choice = parseInt(selectedOption.value);
        
        // Get the selected answer text from the shuffled options
        const selectedText = document.querySelector(`label[for="option${choice}"]`).textContent;
        
        // Find the matching original option to get the correct outcome and experience
        const selectedAnswer = originalScenario.options.find(option => option.text === selectedText);

        this.player.questionHistory.push({
            scenario: originalScenario,
            selectedAnswer: selectedAnswer,
            maxPossibleXP: Math.max(...originalScenario.options.map(o => o.experience))
        }); 

        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.remove('hidden');
        
        document.getElementById('outcome-text').textContent = selectedAnswer.outcome;
        document.getElementById('xp-gained').textContent = `Experience gained: ${selectedAnswer.experience}`;
        
        if (selectedAnswer.tool) {
            document.getElementById('tool-gained').textContent = `Tool acquired: ${selectedAnswer.tool}`;
            this.player.tools.push(selectedAnswer.tool);
        } else {
            document.getElementById('tool-gained').textContent = '';
        }

        this.player.experience += selectedAnswer.experience;
        this.updateProgress();
    }

    nextScenario() {
        this.outcomeScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.player.currentScenario++;
        this.displayScenario();
    }

    restartGame() {
        this.endScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.startGame();
    }

    endGame() {
        try {
            this.gameScreen.classList.add('hidden');
            this.outcomeScreen.classList.add('hidden');
            this.endScreen.classList.remove('hidden');

            const finalScore = Math.min(this.player.experience, this.maxXP);
            const scorePercentage = Math.round((finalScore / this.maxXP) * 100);
            
            // Save the quiz result for the current user
            const currentUsername = localStorage.getItem('currentUser');
            if (currentUsername) {
                try {
                    const user = new QuizUser(currentUsername);
                    user.updateQuizScore('tester-mindset', scorePercentage);
                    console.log('Quiz score saved successfully:', scorePercentage);
                } catch (error) {
                    console.error('Error saving quiz score:', error);
                }
            } else {
                console.log('No user logged in, score not saved');
            }

            document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

            const performanceSummary = document.getElementById('performance-summary');
            const threshold = this.performanceThresholds.find(t => finalScore >= t.threshold);
            performanceSummary.textContent = threshold.message;

            this.displayQuestionReview();
            this.generateRecommendations();
        } catch (error) {
            console.error('Error in endGame:', error);
        }
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new IssueTrackingQuiz();
    quiz.startGame();
}); 
