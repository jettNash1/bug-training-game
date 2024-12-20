import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';

class TimeManagementQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a time management expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong time management skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing time management best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'time-management',
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

        // Basic Scenarios (5 questions)
        this.basicScenarios = [
            // ... existing scenarios ...
        ];

        // Intermediate Scenarios (5 questions)
        this.intermediateScenarios = [
            // ... existing scenarios ...
        ];

        // Advanced Scenarios (5 questions)
        this.advancedScenarios = [
            // ... existing scenarios ...
        ];
    }
}

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new TimeManagementQuiz();
    quiz.startGame();
}); 