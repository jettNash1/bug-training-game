class TestSupportQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 350, message: '🏆 Outstanding! You have an excellent test support skills!' },
                { threshold: 250, message: '👏 Great job! You show strong test support instincts!' },
                { threshold: 150, message: '👍 Good work! Keep developing your test support skills.' },
                { threshold: 0, message: '📚 Review the test support guide and try again!' }
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
                title: 'Morning Communication',
                description: 'You\'re starting your first day on test support. What\'s the most professional first action?',
                options: [
                    {
                        text: 'Send a message to the client checking for specific test tasks and confirm your presence',
                        outcome: 'Perfect! This shows proactive communication and readiness to begin.',
                        experience: 15,
                        tool: 'Client Communication'
                    },
                    {
                        text: 'Start testing without checking in',
                        outcome: 'Morning check-ins are crucial for test support coordination.',
                        experience: -10
                    },
                    {
                        text: 'Wait for the client to contact you',
                        outcome: 'Proactive communication is essential in test support.',
                        experience: -5
                    },
                    {
                        text: 'Only check internal emails',
                        outcome: 'Client communication should be prioritized at start of day.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Access Verification',
                description: 'You\'re preparing for a test support session. What\'s the most thorough preparation approach?',
                options: [
                    {
                        text: 'Verify access to test URLs, designs, documentation, and tracker board',
                        outcome: 'Excellent! This ensures you\'re fully prepared for testing.',
                        experience: 15,
                        tool: 'Access Management'
                    },
                    {
                        text: 'Only check test environment access',
                        outcome: 'All resources need verification for effective testing.',
                        experience: -10
                    },
                    {
                        text: 'Wait until access is needed',
                        outcome: 'Proactive access verification prevents delays.',
                        experience: -5
                    },
                    {
                        text: 'Ask client for access during testing',
                        outcome: 'Access should be verified before starting work.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Documentation Management',
                description: 'You\'re starting on an ongoing test support project. What\'s the best documentation approach?',
                options: [
                    {
                        text: 'Create a process document noting important information and project procedures',
                        outcome: 'Perfect! This ensures knowledge retention and consistent processes.',
                        experience: 15,
                        tool: 'Process Documentation'
                    },
                    {
                        text: 'Rely on memory for processes',
                        outcome: 'Documentation is crucial for consistency and knowledge transfer.',
                        experience: -10
                    },
                    {
                        text: 'Only document major issues',
                        outcome: 'All processes and important information need documentation.',
                        experience: -5
                    },
                    {
                        text: 'Wait for someone else to document',
                        outcome: 'Proactive documentation is everyone\'s responsibility.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Client Communication Channels',
                description: 'You notice you don\'t have direct client communication access. What\'s the best approach?',
                options: [
                    {
                        text: 'Check with PM about getting added to relevant communication channels',
                        outcome: 'Excellent! This ensures proper communication setup.',
                        experience: 15,
                        tool: 'Communication Setup'
                    },
                    {
                        text: 'Work without direct communication',
                        outcome: 'Direct client communication is crucial for test support.',
                        experience: -10
                    },
                    {
                        text: 'Use personal communication methods',
                        outcome: 'Official channels should be used for client communication.',
                        experience: -5
                    },
                    {
                        text: 'Rely only on email',
                        outcome: 'Proper communication channels need to be established.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Project Board Monitoring',
                description: 'How should you approach project board management during test support?',
                options: [
                    {
                        text: 'Keep board open and regularly monitor for new tickets and progress updates',
                        outcome: 'Perfect! This ensures timely response to new testing needs.',
                        experience: 15,
                        tool: 'Project Tracking'
                    },
                    {
                        text: 'Check board once daily',
                        outcome: 'Regular monitoring throughout the day is needed.',
                        experience: -10
                    },
                    {
                        text: 'Wait for notifications',
                        outcome: 'Proactive board monitoring is essential.',
                        experience: -5
                    },
                    {
                        text: 'Only check assigned tickets',
                        outcome: 'Overall project progress needs monitoring.',
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
                title: 'Client Process Adaptation',
                description: 'You\'re working with a client who uses different terminology and processes. What\'s the best approach?',
                options: [
                    {
                        text: 'Adapt to client terminology and processes while maintaining Zoonou standards',
                        outcome: 'Excellent! This shows flexibility and professionalism.',
                        experience: 25,
                        tool: 'Process Adaptation'
                    },
                    {
                        text: 'Insist on using Zoonou terminology',
                        outcome: 'Adapting to client processes is crucial for effective collaboration.',
                        experience: -15
                    },
                    {
                        text: 'Ignore client processes',
                        outcome: 'Understanding and adapting to client processes is essential.',
                        experience: -10
                    },
                    {
                        text: 'Only use client processes when forced',
                        outcome: 'Proactive adaptation improves collaboration.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Handling Idle Time',
                description: 'You\'re booked for test support but have no tasks due to client delays. What\'s the best approach?',
                options: [
                    {
                        text: 'Inform PM and explore additional ways to add value to the project',
                        outcome: 'Excellent! This ensures productive use of time and adds value.',
                        experience: 25,
                        tool: 'Time Management'
                    },
                    {
                        text: 'Wait for tasks to be assigned',
                        outcome: 'Proactive exploration of additional tasks is beneficial.',
                        experience: -15
                    },
                    {
                        text: 'Use time for personal tasks',
                        outcome: 'Idle time should be used productively for the project.',
                        experience: -10
                    },
                    {
                        text: 'Only inform client of availability',
                        outcome: 'PM should be informed to explore additional opportunities.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Communication with Non-Responsive Clients',
                description: 'The client is slow to respond, affecting your testing. What\'s the best approach?',
                options: [
                    {
                        text: 'Maintain open communication, update PM, and suggest raising the issue in regular catch-ups',
                        outcome: 'Excellent! This ensures issues are addressed and communication remains open.',
                        experience: 25,
                        tool: 'Communication Management'
                    },
                    {
                        text: 'Stop testing until client responds',
                        outcome: 'Testing should continue with available information.',
                        experience: -15
                    },
                    {
                        text: 'Only communicate when client responds',
                        outcome: 'Proactive communication is essential.',
                        experience: -10
                    },
                    {
                        text: 'Ignore communication issues',
                        outcome: 'Communication issues need addressing for effective collaboration.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Managing Multiple Projects',
                description: 'You\'re assigned to multiple test support projects. What\'s the best approach to manage your workload?',
                options: [
                    {
                        text: 'Prioritize tasks based on deadlines and importance, communicate availability to PMs',
                        outcome: 'Excellent! This ensures effective workload management.',
                        experience: 25,
                        tool: 'Workload Management'
                    },
                    {
                        text: 'Focus on one project at a time',
                        outcome: 'Multiple projects require balanced attention.',
                        experience: -15
                    },
                    {
                        text: 'Wait for PMs to assign priorities',
                        outcome: 'Proactive prioritization is beneficial.',
                        experience: -10
                    },
                    {
                        text: 'Only work on the most interesting project',
                        outcome: 'All projects need attention based on priorities.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Building Client Relationships',
                description: 'You\'re new to a test support project. How do you build a strong relationship with the client?',
                options: [
                    {
                        text: 'Communicate regularly, provide valuable feedback, and demonstrate understanding of their needs',
                        outcome: 'Excellent! This builds trust and rapport with the client.',
                        experience: 25,
                        tool: 'Relationship Building'
                    },
                    {
                        text: 'Only communicate when necessary',
                        outcome: 'Regular communication is key to building relationships.',
                        experience: -15
                    },
                    {
                        text: 'Focus solely on testing tasks',
                        outcome: 'Building relationships requires more than task completion.',
                        experience: -10
                    },
                    {
                        text: 'Wait for client to initiate relationship building',
                        outcome: 'Proactive relationship building is beneficial.',
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
                title: 'Independent Decision Making',
                description: 'You\'ve identified a more efficient testing approach. How do you proceed?',
                options: [
                    {
                        text: 'Communicate the approach to PM and client, providing rationale and expected benefits',
                        outcome: 'Excellent! This demonstrates initiative and effective communication.',
                        experience: 20,
                        tool: 'Decision Making'
                    },
                    {
                        text: 'Implement the approach without consultation',
                        outcome: 'Consultation ensures alignment and acceptance.',
                        experience: -15
                    },
                    {
                        text: 'Ignore the new approach',
                        outcome: 'Innovative approaches should be explored.',
                        experience: -10
                    },
                    {
                        text: 'Wait for client to suggest changes',
                        outcome: 'Proactive suggestions are valuable.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Handling Client Requests',
                description: 'A client requests a change that deviates from Zoonou\'s standard processes. What\'s the best approach?',
                options: [
                    {
                        text: 'Discuss the request with your line manager for approval before responding to the client',
                        outcome: 'Excellent! This ensures proper alignment and authority.',
                        experience: 20,
                        tool: 'Request Management'
                    },
                    {
                        text: 'Agree to the request immediately',
                        outcome: 'Approval is needed for deviations from standard processes.',
                        experience: -15
                    },
                    {
                        text: 'Decline the request without discussion',
                        outcome: 'Discussion ensures understanding and potential compromise.',
                        experience: -10
                    },
                    {
                        text: 'Ignore the request',
                        outcome: 'Client requests need addressing.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Knowledge Retention',
                description: 'You\'re leaving a long-term test support project. How do you ensure knowledge retention?',
                options: [
                    {
                        text: 'Create a comprehensive handover guide documenting processes and key information',
                        outcome: 'Excellent! This ensures smooth transition and knowledge retention.',
                        experience: 20,
                        tool: 'Knowledge Management'
                    },
                    {
                        text: 'Rely on verbal handover',
                        outcome: 'Written documentation ensures thorough knowledge transfer.',
                        experience: -15
                    },
                    {
                        text: 'Only document major issues',
                        outcome: 'All relevant information needs documentation.',
                        experience: -10
                    },
                    {
                        text: 'Leave without documentation',
                        outcome: 'Documentation is crucial for continuity.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Managing Client Expectations',
                description: 'A client expects more testing than the agreed scope allows. How do you manage this?',
                options: [
                    {
                        text: 'Communicate scope limitations clearly and discuss potential adjustments with PM',
                        outcome: 'Excellent! This ensures clear expectations and potential solutions.',
                        experience: 20,
                        tool: 'Expectation Management'
                    },
                    {
                        text: 'Attempt to meet expectations regardless of scope',
                        outcome: 'Scope limitations need clear communication.',
                        experience: -15
                    },
                    {
                        text: 'Ignore the client\'s expectations',
                        outcome: 'Expectations need addressing and managing.',
                        experience: -10
                    },
                    {
                        text: 'Only inform PM without client communication',
                        outcome: 'Direct client communication is essential.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Long-Term Client Engagement',
                description: 'You\'re leading a long-term test support project. How do you ensure ongoing success?',
                options: [
                    {
                        text: 'Maintain regular communication, adapt to client needs, and continuously improve processes',
                        outcome: 'Excellent! This ensures long-term success and client satisfaction.',
                        experience: 20,
                        tool: 'Project Leadership'
                    },
                    {
                        text: 'Rely on initial processes without change',
                        outcome: 'Continuous improvement is key to long-term success.',
                        experience: -15
                    },
                    {
                        text: 'Only focus on immediate tasks',
                        outcome: 'Long-term success requires strategic focus.',
                        experience: -10
                    },
                    {
                        text: 'Wait for client feedback to make changes',
                        outcome: 'Proactive improvement is beneficial.',
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
    const quiz = new TestSupportQuiz();
    quiz.startGame();
}); 
