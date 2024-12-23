import { APIService } from './api-service.js';
import { QuizUser } from './quiz-user.js';

class IndexPage {
    constructor() {
        this.apiService = new APIService();
        this.user = new QuizUser();
        this.quizItems = document.querySelectorAll('.quiz-item');
        this.initialize();
    }

    async initialize() {
        await this.loadUserProgress();
        this.updateQuizProgress();
    }

    async loadUserProgress() {
        try {
            const progress = await this.apiService.getUserProgress();
            if (progress) {
                this.user.setProgress(progress);
            }
        } catch (error) {
            console.error('Error loading user progress:', error);
        }
    }

    updateQuizProgress() {
        this.quizItems.forEach(item => {
            const quizId = item.dataset.quiz;
            const progressElement = document.getElementById(`${quizId}-progress`);
            
            if (progressElement) {
                const progress = this.user.getQuizProgress(quizId);
                const percentage = progress ? Math.round((progress.completed / progress.total) * 100) : 0;
                
                // Update the quiz item's data-progress attribute
                item.setAttribute('data-progress', percentage);
                
                // Update the progress element text
                if (percentage > 0) {
                    progressElement.textContent = `${percentage}%`;
                    progressElement.setAttribute('aria-label', `${percentage}% complete`);
                } else {
                    progressElement.textContent = '';
                    progressElement.setAttribute('aria-label', 'No progress yet');
                }
            }
        });
    }
}

// Initialize the index page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IndexPage();
}); 