import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

class RaisingTicketsQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a ticket management expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong ticket handling skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing ticket management best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'raising-tickets',
            writable: false,
            configurable: false
        });

        // Initialize required properties
        this.apiService = new APIService();
        this.initializeScreens();
        this.initializeEventListeners();
        this.initializeScenarios();
    }

    // ... existing scenario definitions and methods ...

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
        // ... existing getCurrentScenarios implementation ...
    }

    getCurrentLevel() {
        // ... existing getCurrentLevel implementation ...
    }
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.quiz = new RaisingTicketsQuiz();
        window.quiz.startGame();
            } catch (error) {
        console.error('Failed to initialize quiz:', error);
        const errorMsg = 'Failed to start the quiz. Please refresh the page.';
        if (window.quiz) {
            window.quiz.showError(errorMsg);
        } else {
            alert(errorMsg);
        }
    }
}); 