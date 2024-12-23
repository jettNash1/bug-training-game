import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

class CMS_Testing_Quiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a CMS Testing expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong CMS Testing skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing CMS Testing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'CMS-Testing',
            writable: false,
            configurable: false,
            enumerable: true
        });

        // Initialize screens
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');

        // Initialize services
        this.apiService = new APIService();
        
        // Initialize state
        this.isLoading = false;
        this.initializePlayer();
        this.initializeScenarios();
        this.initializeEventListeners();
    }

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

    // ... existing scenario definitions and other methods remain the same ...
}

// Initialize quiz on page load
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new CMS_Testing_Quiz();
    quiz.startGame();
});