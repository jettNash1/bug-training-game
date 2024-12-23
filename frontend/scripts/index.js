import { APIService } from '../api-service.js';
import { QuizUser } from '../QuizUser.js';

class IndexPage {
    constructor() {
        this.apiService = new APIService();
        this.user = new QuizUser(localStorage.getItem('username'));
        this.quizItems = document.querySelectorAll('.quiz-item:not(.locked-quiz)');
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

            // Get progress for each quiz
            this.quizScores = [];
            for (const item of this.quizItems) {
                const quizId = item.dataset.quiz;
                try {
                    const progress = await this.apiService.getQuizProgress(quizId);
                    if (progress && progress.data) {
                        // Calculate score based on completed questions
                        const questionsAnswered = progress.data.questionHistory ? progress.data.questionHistory.length : 0;
                        const score = Math.round((questionsAnswered / 15) * 100); // 15 questions per quiz
                        this.quizScores.push({
                            quizName: quizId,
                            score: score
                        });
                    }
                } catch (error) {
                    console.error(`Error loading progress for quiz ${quizId}:`, error);
                }
            }
            
            console.log('Loaded quiz scores:', this.quizScores);
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

                // Update background color based on progress
                if (percentage === 100) {
                    item.style.background = 'linear-gradient(to right, rgba(46, 204, 113, 0.1), rgba(46, 204, 113, 0.2))';
                    progressElement.style.background = 'var(--success-color)';
                    progressElement.style.color = 'white';
                } else if (percentage > 0) {
                    item.style.background = 'linear-gradient(to right, rgba(241, 196, 15, 0.1), rgba(241, 196, 15, 0.2))';
                    progressElement.style.background = 'var(--warning-color)';
                    progressElement.style.color = 'var(--text-primary)';
                } else {
                    item.style.background = 'var(--card-background)';
                }
            }
        });
    }

    updateCategoryProgress() {
        if (!this.quizScores) return;

        const categories = document.querySelectorAll('.category-card');
        
        categories.forEach(category => {
            const quizItems = category.querySelectorAll('.quiz-item:not(.locked-quiz)');
            const progressBar = category.querySelector('.progress-fill');
            const progressText = category.querySelector('.category-progress');
            
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
                progressText.innerHTML = `
                    <div class="progress-text">Progress: ${completedQuizzes}/${totalQuizzes} Complete</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${categoryPercentage}%"></div>
                    </div>
                `;
            }
        });
    }
}

// Initialize the index page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IndexPage();
}); 