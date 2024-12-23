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

            const progress = await this.apiService.getUserProgress();
            console.log('Loaded user progress:', progress);
            
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
                // Get progress from localStorage first
                const storageKey = `quiz_progress_${this.user.username}_${quizId}`;
                let progress = null;
                
                try {
                    const storedProgress = localStorage.getItem(storageKey);
                    if (storedProgress) {
                        const parsed = JSON.parse(storedProgress);
                        if (parsed.progress) {
                            progress = parsed.progress;
                        }
                    }
                } catch (error) {
                    console.error(`Error reading progress for ${quizId}:`, error);
                }

                // Calculate percentage
                let percentage = 0;
                if (progress) {
                    const questionsAnswered = progress.questionHistory ? progress.questionHistory.length : 0;
                    percentage = Math.round((questionsAnswered / 15) * 100); // 15 is total questions per quiz
                }

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
        const categories = document.querySelectorAll('.category-card');
        
        categories.forEach(category => {
            const quizItems = category.querySelectorAll('.quiz-item');
            const progressBar = category.querySelector('.progress-fill');
            const progressText = category.querySelector('.progress-text');
            
            if (quizItems.length && progressBar && progressText) {
                let completedQuizzes = 0;
                
                quizItems.forEach(item => {
                    const progress = parseInt(item.getAttribute('data-progress')) || 0;
                    if (progress === 100) {
                        completedQuizzes++;
                    }
                });
                
                const totalQuizzes = quizItems.length;
                const categoryPercentage = (completedQuizzes / totalQuizzes) * 100;
                
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