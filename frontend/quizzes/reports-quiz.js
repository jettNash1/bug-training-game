// Add required imports
import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

class ReportsQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a reporting expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong reporting skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing reporting best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Core properties initialization
        Object.defineProperty(this, 'quizName', {
            value: 'reports',
            writable: false,
            configurable: false,
            enumerable: true
        });

        // Initialize screens
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');

        // Initialize player state
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
                title: 'Report Timing',
                description: 'When should you start writing a daily report?',
                options: [
                    {
                        text: 'Start at 16:45 for standard reports, 16:30 if peer review needed, deliver by 17:00',
                        outcome: 'Perfect! This ensures timely delivery with review time.',
                        experience: 15,
                        tool: 'Time Management'
                    },
                    {
                        text: 'Start at end of day',
                        outcome: 'Reports need time for review and revisions.',
                        experience: -10
                    },
                    {
                        text: 'Write throughout day',
                        outcome: 'Final report needs latest information.',
                        experience: -5
                    },
                    {
                        text: 'Start after 17:00',
                        outcome: 'Reports must be delivered by end of day.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Writing Style',
                description: 'How should you write the report summary?',
                options: [
                    {
                        text: 'Use third person, present tense, objective language without technical jargon',
                        outcome: 'Excellent! This maintains professional tone.',
                        experience: 15,
                        tool: 'Writing Standards'
                    },
                    {
                        text: 'Use first person',
                        outcome: 'Third person keeps tone objective.',
                        experience: -10
                    },
                    {
                        text: 'Use technical jargon',
                        outcome: 'Keep language accessible to all stakeholders.',
                        experience: -5
                    },
                    {
                        text: 'Use past tense',
                        outcome: 'Present tense shows current state.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Summary Structure',
                description: 'What are the four main sections of a report summary?',
                options: [
                    {
                        text: 'Introduction, What went well, What could be better, Conclusion',
                        outcome: 'Perfect! This covers all key aspects.',
                        experience: 15,
                        tool: 'Report Structure'
                    },
                    {
                        text: 'Only issues found',
                        outcome: 'Need balanced coverage of all aspects.',
                        experience: -10
                    },
                    {
                        text: 'Technical details only',
                        outcome: 'Need comprehensive summary structure.',
                        experience: -5
                    },
                    {
                        text: 'Random observations',
                        outcome: 'Structured approach needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Metrics Inclusion',
                description: 'What metrics should be included in the report?',
                options: [
                    {
                        text: 'New issues, closed issues, outstanding issues, and relevant progress tables',
                        outcome: 'Excellent! This provides comprehensive metrics.',
                        experience: 15,
                        tool: 'Metrics Documentation'
                    },
                    {
                        text: 'Only new issues',
                        outcome: 'All relevant metrics needed.',
                        experience: -10
                    },
                    {
                        text: 'Random numbers',
                        outcome: 'Specific metrics needed from script.',
                        experience: -5
                    },
                    {
                        text: 'Skip metrics',
                        outcome: 'Metrics are crucial for reports.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Graph Presentation',
                description: 'How should graphs be presented in the report?',
                options: [
                    {
                        text: 'Consistent width, visible labels, appropriate legends, and alt text',
                        outcome: 'Perfect! This ensures accessible presentation.',
                        experience: 15,
                        tool: 'Visual Documentation'
                    },
                    {
                        text: 'Any size graphs',
                        outcome: 'Consistency needed in presentation.',
                        experience: -10
                    },
                    {
                        text: 'Skip labels',
                        outcome: 'Labels needed for clarity.',
                        experience: -5
                    },
                    {
                        text: 'Random placement',
                        outcome: 'Organized presentation needed.',
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
                title: 'Peer Review Process',
                description: 'How should you handle peer review feedback?',
                options: [
                    {
                        text: 'Review all comments, address each point, resolve comments after fixing, discuss if clarification needed',
                        outcome: 'Perfect! This ensures thorough review process.',
                        experience: 25,
                        tool: 'Peer Review'
                    },
                    {
                        text: 'Ignore feedback',
                        outcome: 'All feedback needs consideration.',
                        experience: -15
                    },
                    {
                        text: 'Delete comments without fixing',
                        outcome: 'Comments need proper resolution.',
                        experience: -10
                    },
                    {
                        text: 'Fix without marking resolved',
                        outcome: 'Comment resolution needed for tracking.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Environment Documentation',
                description: 'How do you document test environments in the report?',
                options: [
                    {
                        text: 'Include matrix with accurate versions, consistent formatting, and relevant environment details',
                        outcome: 'Excellent! This provides clear environment context.',
                        experience: 25,
                        tool: 'Environment Documentation'
                    },
                    {
                        text: 'List device names only',
                        outcome: 'Version details needed.',
                        experience: -15
                    },
                    {
                        text: 'Skip environment details',
                        outcome: 'Environment documentation required.',
                        experience: -10
                    },
                    {
                        text: 'Use outdated versions',
                        outcome: 'Current versions needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Issue Summary Presentation',
                description: 'How should you present the top issues in the report?',
                options: [
                    {
                        text: 'List most functionally impactive issues, include blocking issues separately, hyperlink all references',
                        outcome: 'Perfect! This provides organized issue overview.',
                        experience: 25,
                        tool: 'Issue Documentation'
                    },
                    {
                        text: 'List random issues',
                        outcome: 'Prioritize by impact.',
                        experience: -15
                    },
                    {
                        text: 'Skip hyperlinks',
                        outcome: 'References need proper linking.',
                        experience: -10
                    },
                    {
                        text: 'Mix blocking with regular issues',
                        outcome: 'Separate blocking issues needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Weekly Report Management',
                description: 'How do you manage content for a weekly report?',
                options: [
                    {
                        text: 'Set up template first day, add draft notes daily, compile and refine at week end',
                        outcome: 'Excellent! This ensures comprehensive coverage.',
                        experience: 25,
                        tool: 'Report Management'
                    },
                    {
                        text: 'Write everything last day',
                        outcome: 'Progressive documentation needed.',
                        experience: -15
                    },
                    {
                        text: 'Copy daily reports only',
                        outcome: 'Need proper weekly summary.',
                        experience: -10
                    },
                    {
                        text: 'Skip earlier days',
                        outcome: 'Full week coverage needed.',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Stakeholder Communication',
                description: 'How do you adapt report content for different stakeholders?',
                options: [
                    {
                        text: 'Use clear language, avoid jargon, focus on business impact, maintain professional tone',
                        outcome: 'Perfect! This ensures wide accessibility.',
                        experience: 25,
                        tool: 'Stakeholder Management'
                    },
                    {
                        text: 'Use technical terms only',
                        outcome: 'Language needs to be accessible.',
                        experience: -15
                    },
                    {
                        text: 'Ignore audience needs',
                        outcome: 'Consider all stakeholders.',
                        experience: -10
                    },
                    {
                        text: 'Use casual language',
                        outcome: 'Maintain professional tone.',
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
                title: 'Report Format Adaptation',
                description: 'Client requests different report format mid-project. How do you handle it?',
                options: [
                    {
                        text: 'Discuss with PM, adapt template while maintaining key information, ensure consistent transition',
                        outcome: 'Perfect! This ensures proper format adaptation.',
                        experience: 20,
                        tool: 'Format Management'
                    },
                    {
                        text: 'Continue old format',
                        outcome: 'Client requirements need consideration.',
                        experience: -15
                    },
                    {
                        text: 'Create new format without consultation',
                        outcome: 'PM coordination needed.',
                        experience: -10
                    },
                    {
                        text: 'Mix formats',
                        outcome: 'Consistency needed in transition.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Complex Metrics Analysis',
                description: 'How do you handle conflicting metrics in the report?',
                options: [
                    {
                        text: 'Verify source data, cross-reference scripts, document discrepancies, consult PM if needed',
                        outcome: 'Excellent! This ensures accurate reporting.',
                        experience: 20,
                        tool: 'Data Analysis'
                    },
                    {
                        text: 'Use first numbers found',
                        outcome: 'Verification needed for accuracy.',
                        experience: -15
                    },
                    {
                        text: 'Skip conflicting metrics',
                        outcome: 'All metrics need resolution.',
                        experience: -10
                    },
                    {
                        text: 'Average the numbers',
                        outcome: 'Accurate data needed.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Multi-Environment Reporting',
                description: 'How do you report on testing across multiple complex environments?',
                options: [
                    {
                        text: 'Create clear environment matrix, document specific behaviors, highlight key differences',
                        outcome: 'Perfect! This provides comprehensive environment coverage.',
                        experience: 20,
                        tool: 'Environment Analysis'
                    },
                    {
                        text: 'Group all environments',
                        outcome: 'Specific details needed per environment.',
                        experience: -15
                    },
                    {
                        text: 'Report on primary only',
                        outcome: 'All environments need coverage.',
                        experience: -10
                    },
                    {
                        text: 'Skip environment details',
                        outcome: 'Environment documentation crucial.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Critical Issue Reporting',
                description: 'How do you report multiple critical issues found late in the day?',
                options: [
                    {
                        text: 'Immediately notify PM, document thoroughly in report, highlight business impact',
                        outcome: 'Excellent! This ensures proper critical issue handling.',
                        experience: 20,
                        tool: 'Critical Issue Management'
                    },
                    {
                        text: 'Wait for report',
                        outcome: 'Immediate notification needed.',
                        experience: -15
                    },
                    {
                        text: 'Minimize issue severity',
                        outcome: 'Accurate severity needed.',
                        experience: -10
                    },
                    {
                        text: 'Skip detailed documentation',
                        outcome: 'Thorough documentation required.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Report Quality Assurance',
                description: 'How do you ensure report quality before submission?',
                options: [
                    {
                        text: 'Review content, verify metrics, check formatting, validate links, run spell check, read aloud',
                        outcome: 'Perfect! This ensures comprehensive quality check.',
                        experience: 20,
                        tool: 'Quality Assurance'
                    },
                    {
                        text: 'Quick scan only',
                        outcome: 'Thorough review needed.',
                        experience: -15
                    },
                    {
                        text: 'Skip final review',
                        outcome: 'Quality check crucial.',
                        experience: -10
                    },
                    {
                        text: 'Check spelling only',
                        outcome: 'Multiple aspects need review.',
                        experience: -5
                    }
                ]
            }
        ];

        this.initializeEventListeners();
        this.apiService = new APIService();
    }

    // Required core methods
    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        }
    }

    shouldEndGame(totalQuestionsAnswered, currentXP) {
        return totalQuestionsAnswered >= 15 || currentXP >= this.maxXP;
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
            const completedQuestions = this.player.questionHistory.length;
            const currentQuestion = completedQuestions + 1;
            
            // Update question counter
            questionProgress.textContent = `Question: ${currentQuestion}/${totalQuestions}`;
            
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

    nextScenario() {
        // Increment scenario counter
        this.player.currentScenario++;
        
        // Hide outcome screen
        this.outcomeScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        
        // Display next scenario
        this.displayScenario();
    }

    endGame() {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        const finalScore = Math.min(this.player.experience, this.maxXP);
        const scorePercentage = Math.round((finalScore / this.maxXP) * 100);
        
        // Save the final quiz result
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                user.updateQuizScore(this.quizName, scorePercentage);
                console.log('Final quiz score saved:', scorePercentage);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

        const performanceSummary = document.getElementById('performance-summary');
        const threshold = this.performanceThresholds.find(t => finalScore >= t.threshold);
        performanceSummary.textContent = threshold.message;

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
// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new ReportsQuiz();
    quiz.startGame();
}); 