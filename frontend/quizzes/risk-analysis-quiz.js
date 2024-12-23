class RiskAnalysisQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a risk analysis expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong analytical skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing risk analysis best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'risk-analysis',
            writable: false,
            configurable: false,
            enumerable: true
        });

        // Initialize screens
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');

        // Initialize API service
        this.apiService = new APIService();

        // Initialize state
        this.isLoading = false;
        
        // Initialize event listeners
        this.initializeEventListeners();
    }

    showError(message) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.classList.remove('hidden');
            setTimeout(() => {
                errorContainer.classList.add('hidden');
            }, 5000);
        }
    }

    shouldEndGame(totalQuestionsAnswered, currentXP) {
        return totalQuestionsAnswered >= 15 || currentXP >= this.maxXP;
    }

    getCurrentLevel() {
        const progress = this.getProgress();
        const { questionsAnswered, currentXP } = progress;
        const { basic, intermediate, advanced } = this.levelThresholds;

        if (questionsAnswered >= advanced.questions && currentXP >= advanced.minXP) {
            return 'advanced';
        } else if (questionsAnswered >= intermediate.questions && currentXP >= intermediate.minXP) {
            return 'intermediate';
        }
        return 'basic';
    }

    getCurrentScenarios() {
        const currentLevel = this.getCurrentLevel();
        switch (currentLevel) {
            case 'advanced':
                return this.advancedScenarios;
            case 'intermediate':
                return this.intermediateScenarios;
            default:
                return this.basicScenarios;
        }
    }

    // ... existing scenario data and methods ...
}

// Initialize quiz on page load
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new RiskAnalysisQuiz();
    quiz.startGame();
});