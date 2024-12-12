class CommunicationQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a communication expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong communication skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing communication best practices and try again!' }
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
                title: 'Daily Communication',
                description: 'You\'ve just started your workday. What\'s the first thing you should do regarding your communication status?',
                options: [
                    {
                        text: 'Mark yourself as "Online" and ensure Teams status is accurate',
                        outcome: 'Perfect! Being visible and accessible is crucial for team communication.',
                        experience: 15,
                        tool: 'Status Management'
                    },
                    {
                        text: 'Wait for someone to message you first',
                        outcome: 'Being proactive with your status helps team members know when you\'re available.',
                        experience: -5
                    },
                    {
                        text: 'Leave status as is from yesterday',
                        outcome: 'Outdated status can confuse colleagues and hinder communication.',
                        experience: -10
                    },
                    {
                        text: 'Set status as "Do Not Disturb" to focus on work',
                        outcome: 'While focus time is important, starting the day as "Do Not Disturb" may miss important communications.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Project Channel Communication',
                description: 'You need to share important information with everyone on the project. How should you do this?',
                options: [
                    {
                        text: 'Tag the project channel and write a clear message',
                        outcome: 'Excellent! Tagging ensures visibility while clear messaging prevents misunderstandings.',
                        experience: 15,
                        tool: 'Channel Communication'
                    },
                    {
                        text: 'Just post the message without tagging',
                        outcome: 'Messages without tags can be easily missed as most people don\'t have notifications on for all messages.',
                        experience: -5
                    },
                    {
                        text: 'Send individual messages to each team member',
                        outcome: 'This is inefficient and could lead to inconsistent information sharing.',
                        experience: -10
                    },
                    {
                        text: 'Wait for the daily standup to share',
                        outcome: 'Important information should be shared promptly, not held back for meetings.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Response Time',
                description: 'A colleague has messaged you about a potential issue. What\'s the best approach?',
                options: [
                    {
                        text: 'Respond promptly acknowledging the message and addressing the issue',
                        outcome: 'Great! Quick acknowledgment shows you\'re engaged and helps resolve issues faster.',
                        experience: 15,
                        tool: 'Prompt Response Protocol'
                    },
                    {
                        text: 'Wait until you have a complete solution before responding',
                        outcome: 'Even a quick acknowledgment is better than silence - let them know you\'re working on it.',
                        experience: 5
                    },
                    {
                        text: 'Ignore until it becomes urgent',
                        outcome: 'Ignoring messages can lead to bigger problems and damages team communication.',
                        experience: -10
                    },
                    {
                        text: 'Forward to someone else without responding',
                        outcome: 'It\'s better to acknowledge and then coordinate with others if needed.',
                        experience: -5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Meeting Preparation',
                description: 'You have a virtual meeting in 5 minutes. What should you check first?',
                options: [
                    {
                        text: 'Test audio/video and ensure your background is professional',
                        outcome: 'Excellent! Technical and environmental preparation is key for professional meetings.',
                        experience: 15,
                        tool: 'Meeting Checklist'
                    },
                    {
                        text: 'Join immediately without checking anything',
                        outcome: 'Taking a moment to check your setup prevents technical issues during the meeting.',
                        experience: -10
                    },
                    {
                        text: 'Wait until the meeting starts to test equipment',
                        outcome: 'Testing during the meeting can be disruptive and unprofessional.',
                        experience: -5
                    },
                    {
                        text: 'Only check your appearance',
                        outcome: 'While appearance matters, technical preparation is equally important.',
                        experience: 5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Written Communication',
                description: 'You need to send a quick message to a client. How do you approach this?',
                options: [
                    {
                        text: 'Write clearly and professionally, review before sending',
                        outcome: 'Perfect! Professional and reviewed communication maintains company standards.',
                        experience: 15,
                        tool: 'Communication Review'
                    },
                    {
                        text: 'Send a brief, informal message',
                        outcome: 'Client communication should always maintain professional standards.',
                        experience: -10
                    },
                    {
                        text: 'Use lots of emojis to seem friendly',
                        outcome: 'While being friendly is good, excessive emojis may appear unprofessional.',
                        experience: -5
                    },
                    {
                        text: 'Write formally but without reviewing',
                        outcome: 'Always review client communication to prevent errors.',
                        experience: 5
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10, 125 XP total)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Virtual Meeting Etiquette',
                description: 'During a client meeting, you need to take notes. How\'s the best approach?',
                options: [
                    {
                        text: 'Inform participants you\'ll be taking notes and may look away briefly',
                        outcome: 'Excellent! Transparency about note-taking maintains professionalism while ensuring engagement.',
                        experience: 25,
                        tool: 'Meeting Etiquette Guide'
                    },
                    {
                        text: 'Take notes without mentioning it',
                        outcome: 'This might appear as disengagement or distraction to others.',
                        experience: 5
                    },
                    {
                        text: 'Turn off your camera while taking notes',
                        outcome: 'Turning off camera without explanation can seem unprofessional.',
                        experience: -10
                    },
                    {
                        text: 'Try to maintain eye contact and remember details instead',
                        outcome: 'This risks missing important details - it\'s better to be transparent about note-taking.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Handling Miscommunication',
                description: 'You realize there\'s been a misunderstanding about project requirements. What should you do?',
                options: [
                    {
                        text: 'Address it immediately and clearly with all relevant parties',
                        outcome: 'Perfect! Quick, clear communication about misunderstandings prevents bigger issues.',
                        experience: 25,
                        tool: 'Clarification Protocol'
                    },
                    {
                        text: 'Try to fix it without mentioning it',
                        outcome: 'Hiding miscommunication can lead to bigger problems later.',
                        experience: -15
                    },
                    {
                        text: 'Wait to see if it becomes a problem',
                        outcome: 'Proactive communication about misunderstandings is always better.',
                        experience: -10
                    },
                    {
                        text: 'Only mention it in the next scheduled meeting',
                        outcome: 'Important clarifications shouldn\'t wait for scheduled meetings.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Project Risk Communication',
                description: 'You\'ve identified a potential risk to the project timeline. How do you handle this?',
                options: [
                    {
                        text: 'Communicate with the project manager immediately with specific details',
                        outcome: 'Excellent! Early, specific risk communication allows for better mitigation.',
                        experience: 25,
                        tool: 'Risk Communication Template'
                    },
                    {
                        text: 'Wait until the risk actually impacts the timeline',
                        outcome: 'Waiting until impact removes the opportunity for risk mitigation.',
                        experience: -15
                    },
                    {
                        text: 'Mention it casually in a team chat',
                        outcome: 'Risks need proper documentation and communication channels.',
                        experience: -5
                    },
                    {
                        text: 'Try to handle it yourself first',
                        outcome: 'While initiative is good, risks should be communicated to project managers.',
                        experience: 5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Client Communication Tone',
                description: 'A client sends an urgent, slightly aggressive message about an issue. How do you respond?',
                options: [
                    {
                        text: 'Respond professionally and objectively, focusing on solutions',
                        outcome: 'Perfect! Maintaining professionalism regardless of the client\'s tone is crucial.',
                        experience: 25,
                        tool: 'Professional Response Template'
                    },
                    {
                        text: 'Match their tone to show urgency',
                        outcome: 'Matching aggressive tone can escalate the situation unnecessarily.',
                        experience: -15
                    },
                    {
                        text: 'Defer to someone else to handle it',
                        outcome: 'While escalation might be needed, avoiding response entirely isn\'t professional.',
                        experience: -5
                    },
                    {
                        text: 'Wait to respond until you feel less defensive',
                        outcome: 'While composure is important, urgent messages need timely responses.',
                        experience: 5
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Team Collaboration',
                description: 'You\'re working on a shared document with multiple team members. How do you manage communications?',
                options: [
                    {
                        text: 'Use comments and track changes, notify team of significant updates',
                        outcome: 'Excellent! Clear documentation and communication of changes helps team collaboration.',
                        experience: 25,
                        tool: 'Collaboration Guidelines'
                    },
                    {
                        text: 'Make changes without documenting them',
                        outcome: 'Undocumented changes can cause confusion and version control issues.',
                        experience: -15
                    },
                    {
                        text: 'Send individual messages about each change',
                        outcome: 'This can flood communication channels - use document tools instead.',
                        experience: -5
                    },
                    {
                        text: 'Wait for others to ask about changes',
                        outcome: 'Proactive communication about changes is better than reactive.',
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
                title: 'Cross-Cultural Communication',
                description: 'You\'re working with a global team across different time zones and cultures. How do you ensure effective communication?',
                options: [
                    {
                        text: 'Use clear language, be mindful of time zones, and respect cultural differences',
                        outcome: 'Perfect! Cultural awareness and clear communication are essential for global teams.',
                        experience: 20,
                        tool: 'Global Communication Guide'
                    },
                    {
                        text: 'Expect everyone to adapt to your time zone',
                        outcome: 'This shows lack of consideration for global team dynamics.',
                        experience: -15
                    },
                    {
                        text: 'Use lots of local idioms and expressions',
                        outcome: 'Local expressions may not translate well across cultures.',
                        experience: -10
                    },
                    {
                        text: 'Schedule meetings only during your working hours',
                        outcome: 'Consider rotating meeting times to accommodate different time zones.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Confidentiality in Communication',
                description: 'You need to discuss a sensitive project issue. How do you handle this?',
                options: [
                    {
                        text: 'Use appropriate private channels and remind participants about confidentiality',
                        outcome: 'Excellent! Protecting confidential information while ensuring necessary communication.',
                        experience: 20,
                        tool: 'Confidentiality Protocol'
                    },
                    {
                        text: 'Discuss it in the general team channel',
                        outcome: 'Sensitive information requires appropriate communication channels.',
                        experience: -15
                    },
                    {
                        text: 'Share details only verbally',
                        outcome: 'While verbal communication can be private, proper channels should be used.',
                        experience: -5
                    },
                    {
                        text: 'Avoid discussing it altogether',
                        outcome: 'Important issues need discussion, just through appropriate channels.',
                        experience: -10
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Communication During Crisis',
                description: 'A critical system issue affects multiple clients. How do you manage communication?',
                options: [
                    {
                        text: 'Coordinate with management for consistent, clear updates to all stakeholders',
                        outcome: 'Perfect! Coordinated, consistent communication is crucial during crisis.',
                        experience: 20,
                        tool: 'Crisis Communication Plan'
                    },
                    {
                        text: 'Send individual updates as you get information',
                        outcome: 'Uncoordinated updates can lead to confusion and inconsistency.',
                        experience: -10
                    },
                    {
                        text: 'Wait for the issue to be resolved before communicating',
                        outcome: 'Stakeholders need regular updates during critical issues.',
                        experience: -15
                    },
                    {
                        text: 'Let each team handle their own communications',
                        outcome: 'Crisis communication needs coordination for consistency.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Feedback Communication',
                description: 'You need to provide constructive feedback about a colleague\'s work. How do you approach this?',
                options: [
                    {
                        text: 'Schedule a private meeting and prepare specific, constructive points',
                        outcome: 'Excellent! Structured, private feedback maintains professionalism and effectiveness.',
                        experience: 20,
                        tool: 'Feedback Framework'
                    },
                    {
                        text: 'Send a detailed email listing all issues',
                        outcome: 'Sensitive feedback is better delivered in person or virtually face-to-face.',
                        experience: -5
                    },
                    {
                        text: 'Mention issues in team meetings',
                        outcome: 'Public feedback can be inappropriate and demotivating.',
                        experience: -15
                    },
                    {
                        text: 'Leave hints about improvements needed',
                        outcome: 'Clear, direct communication is better than hints for feedback.',
                        experience: -10
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Communication Strategy',
                description: 'You\'re leading a new project initiative. How do you establish communication patterns?',
                options: [
                    {
                        text: 'Create a communication plan with clear channels, expectations, and schedules',
                        outcome: 'Perfect! Structured communication planning ensures project success.',
                        experience: 20,
                        tool: 'Communication Strategy Template'
                    },
                    {
                        text: 'Let communication patterns develop naturally',
                        outcome: 'Lack of structure can lead to communication gaps and confusion.',
                        experience: -10
                    },
                    {
                        text: 'Use existing channels without modification',
                        outcome: 'New initiatives might need specialized communication approaches.',
                        experience: -5
                    },
                    {
                        text: 'Rely on email for all communications',
                        outcome: 'Different types of communication need different channels.',
                        experience: -15
                    }
                ]
            }
        ];

        this.initializeUI();

        // Add keyboard navigation
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

    displayScenario() {
        const currentScenarios = this.getCurrentScenarios();
        
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

        // Update UI with scenario details
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
                    user.updateQuizScore('communication', scorePercentage);
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
    const quiz = new CommunicationQuiz();
    quiz.startGame();
}); 