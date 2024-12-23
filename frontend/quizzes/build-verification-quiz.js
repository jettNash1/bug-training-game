import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

class BuildVerificationQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a BVT expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong understanding of BVT!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing BVT best practices and try again!' }
            ]
        };
        
        super(config);
        
        this.quizName = 'build-verification';
        
        // Initialize screen elements
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');
        
        if (!this.gameScreen || !this.outcomeScreen || !this.endScreen) {
            throw new Error('Required screen elements not found');
        }
        
        this.player = new QuizUser();
        this.apiService = new APIService();
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

    getCurrentScenarios() {
        const totalAnswered = this.player.questionHistory.length;
        const currentXP = this.player.experience;
        
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

    // ... existing scenarios and game logic methods ...
}

document.addEventListener('DOMContentLoaded', () => {
    const quiz = new BuildVerificationQuiz();
    quiz.startGame();
});