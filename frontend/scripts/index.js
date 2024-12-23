import { APIService } from './api-service.js';
import { QuizUser } from './quiz-user.js';

class IndexPage {
    constructor() {
        this.apiService = new APIService();
        this.user = new QuizUser(localStorage.getItem('username'));
        this.quizItems = document.querySelectorAll('.quiz-item');
        this.initialize();
    }

    async initialize() {
        await this.loadUserProgress();
        this.updateQuizProgress();
        this.updateCategoryProgress();
    }

    async loadUserProgress() {
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No username found in localStorage');
                return;
            }

            // Fetch all quiz scores from the server
            const scores = await this.apiService.getAllQuizScores(username);
            console.log('Loaded quiz scores:', scores);
            
            if (scores && scores.data) {
                this.quizScores = scores.data;
            }
        } catch (error) {
            console.error('Error loading user progress:', error);
        }
    }

    updateQuizProgress() {
        if (!this.quizScores) return;

        this.quizItems.forEach(item => {
            const quizId = item.dataset.quiz;
            const progressElement = document.getElementById(`${quizId}-progress`);
            
            if (progressElement) {
                // Find the score for this quiz
                const quizScore = this.quizScores.find(score => score.quizName === quizId);
                const percentage = quizScore ? quizScore.score : 0;

                console.log(`Quiz ${quizId} progress: ${percentage}%`);
                
                // Update the quiz item's data-progress attribute
                item.setAttribute('data-progress', percentage);
                
                // Update the progress element text and visibility
                if (percentage > 0) {
                    progressElement.textContent = `${percentage}%`;
                    progressElement.style.display = 'block';
                } else {
                    progressElement.textContent = '';
                    progressElement.style.display = 'none';
                }
            }
        });
    }

    updateCategoryProgress() {
        if (!this.quizScores) return;

        const categories = document.querySelectorAll('.category-card');
        
        categories.forEach(category => {
            const quizItems = category.querySelectorAll('.quiz-item');
            const progressBar = category.querySelector('.progress-fill');
            const progressText = category.querySelector('.progress-text');
            
            if (quizItems.length && progressBar && progressText) {
                let completedQuizzes = 0;
                let totalProgress = 0;
                
                quizItems.forEach(item => {
                    const quizId = item.dataset.quiz;
                    const quizScore = this.quizScores.find(score => score.quizName === quizId);
                    const progress = quizScore ? quizScore.score : 0;
                    
                    if (progress === 100) {
                        completedQuizzes++;
                    }
                    totalProgress += progress;
                });
                
                const totalQuizzes = quizItems.length;
                const categoryPercentage = Math.round(totalProgress / totalQuizzes);
                
                progressBar.style.width = `${categoryPercentage}%`;
                progressText.textContent = `Progress: ${completedQuizzes}/${totalQuizzes} Complete`;
            }
        });
    }
}

// Initialize the index page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IndexPage();
}); 