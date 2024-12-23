import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

class NonFunctionalQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a non-functional testing expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong non-functional testing skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing non-functional testing best practices and try again!' }
            ]
        };
        
        super(config);
        
        this.quizName = 'non-functional';
        this.player = new QuizUser();
        this.apiService = new APIService();

        // Initialize screen elements
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');

        if (!this.gameScreen || !this.outcomeScreen || !this.endScreen) {
            throw new Error('Required screen elements not found');
        }

        this.initializeEventListeners();
    }

    showError(message) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.classList.remove('hidden');
            setTimeout(() => errorContainer.classList.add('hidden'), 5000);
        }
    }

    shouldEndGame(totalQuestionsAnswered, currentXP) {
        return totalQuestionsAnswered >= 15 || 
               (totalQuestionsAnswered >= 10 && currentXP >= this.levelThresholds.advanced.minXP);
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

    // ... existing scenarios and other methods ...
}

// Add DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new NonFunctionalQuiz();
}); 