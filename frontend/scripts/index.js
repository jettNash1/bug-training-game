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

    handleLogout() {
        try {
            // Clear all auth-related data
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            
            // Redirect to login page
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async loadUserProgress() {
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No username found in localStorage');
                return;
            }

            const response = await fetch(`/api/users/${username}/quiz-results`);
            if (!response.ok) {
                throw new Error('Failed to fetch quiz results');
            }

            const data = await response.json();
            this.quizScores = data.map(quiz => ({
                quizName: quiz.quizName,
                score: quiz.score,
                questionsAnswered: quiz.questionHistory ? quiz.questionHistory.length : 0,
                status: quiz.status || 'in_progress'
            }));

            this.updateQuizProgress();
        } catch (error) {
            console.error('Error loading user progress:', error);
        }
    }

    updateQuizProgress() {
        if (!this.quizScores) return;

        this.quizItems.forEach(item => {
            const quizId = item.dataset.quiz;
            const progressElement = document.getElementById(`${quizId}-progress`);
            if (!progressElement) return;

            const quizScore = this.quizScores.find(score => score.quizName === quizId);
            if (!quizScore) return;

            // Update the quiz item appearance based on its state
            if (quizScore.status === 'failed') {
                // Failed quiz state
                progressElement.textContent = 'Failed';
                progressElement.style.display = 'block';
                progressElement.style.background = '#e74c3c';
                progressElement.style.color = 'white';
                // Prevent retrying failed quizzes
                item.style.pointerEvents = 'none';
                item.style.opacity = '0.7';
                item.setAttribute('aria-disabled', 'true');
            } else if (quizScore.status === 'passed') {
                // Completed quiz state
                progressElement.textContent = 'Passed';
                progressElement.style.display = 'block';
                progressElement.style.background = '#2ecc71';
                progressElement.style.color = 'white';
            } else if (quizScore.questionsAnswered > 0) {
                // In progress state
                progressElement.textContent = `${quizScore.questionsAnswered}/15`;
                progressElement.style.display = 'block';
                progressElement.style.background = '#f1c40f';
                progressElement.style.color = 'black';
            } else {
                // Not started state
                progressElement.textContent = '';
                progressElement.style.display = 'none';
            }

            // Update the data attribute
            item.setAttribute('data-progress', quizScore.score);
        });
    }

    updateCategoryProgress() {
        if (!this.quizScores) return;

        // Prepare all category updates
        const updates = new Map();
        
        document.querySelectorAll('.category-card').forEach(category => {
            const quizItems = category.querySelectorAll('.quiz-item:not(.locked-quiz)');
            const progressBar = category.querySelector('.progress-fill');
            const progressText = category.querySelector('.category-progress');
            
            if (!quizItems.length || !progressBar || !progressText) return;

            const categoryStats = Array.from(quizItems).reduce((stats, item) => {
                const quizId = item.dataset.quiz;
                const quizScore = this.quizScores.find(score => score.quizName === quizId);
                const progress = quizScore ? quizScore.score : 0;
                
                return {
                    completedQuizzes: stats.completedQuizzes + (progress === 100 ? 1 : 0),
                    totalProgress: stats.totalProgress + progress
                };
            }, { completedQuizzes: 0, totalProgress: 0 });

            const totalQuizzes = quizItems.length;
            const categoryPercentage = Math.round(categoryStats.totalProgress / totalQuizzes);

            // Store updates to apply in batch
            updates.set(category, {
                completedQuizzes: categoryStats.completedQuizzes,
                totalQuizzes,
                categoryPercentage,
                progressBar,
                progressText
            });
        });

        // Apply all updates in one batch
        requestAnimationFrame(() => {
            updates.forEach(({ completedQuizzes, totalQuizzes, categoryPercentage, progressBar, progressText }) => {
                progressBar.style.width = `${categoryPercentage}%`;
                progressText.innerHTML = `
                    <div class="progress-text">Progress: ${completedQuizzes}/${totalQuizzes} Complete</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${categoryPercentage}%"></div>
                    </div>
                `;
            });
        });
    }
}

// Initialize the index page when the DOM is loaded
let indexPage;
document.addEventListener('DOMContentLoaded', () => {
    indexPage = new IndexPage();
});

// Expose handleLogout to the window object
window.handleLogout = () => {
    if (indexPage) {
        indexPage.handleLogout();
    } else {
        // Fallback if indexPage is not initialized
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        localStorage.removeItem('isAdmin');
        window.location.href = '/login.html';
    }
}; 