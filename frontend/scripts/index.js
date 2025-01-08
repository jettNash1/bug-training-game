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
            if (!username) return;

            // Batch all quiz progress requests
            const progressPromises = Array.from(this.quizItems).map(async item => {
                const quizId = item.dataset.quiz;
                try {
                    // Parallel requests for server and local data
                    const [serverProgress, localData] = await Promise.all([
                        this.apiService.getQuizProgress(quizId),
                        localStorage.getItem(`quiz_progress_${username}_${quizId}`)
                    ]);

                    let localProgress = null;
                    if (localData) {
                        try {
                            const parsed = JSON.parse(localData);
                            localProgress = parsed.progress;
                        } catch (e) {} // Ignore parse errors
                    }

                    const progress = serverProgress?.data || localProgress;
                    
                    return {
                        quizName: quizId,
                        score: progress ? Math.round(((progress.questionHistory?.length || 0) / 15) * 100) : 0,
                        questionsAnswered: progress?.questionHistory?.length || 0
                    };
                } catch (error) {
                    return { quizName: quizId, score: 0, questionsAnswered: 0 };
                }
            });

            // Wait for all progress data to load
            this.quizScores = await Promise.all(progressPromises);
        } catch (error) {
            console.error('Error loading user progress:', error);
            this.quizScores = [];
        }
    }

    updateQuizProgress() {
        if (!this.quizScores) return;

        // Create a document fragment to batch DOM updates
        const fragment = document.createDocumentFragment();
        const updates = new Map();

        this.quizItems.forEach(item => {
            const quizId = item.dataset.quiz;
            const progressElement = document.getElementById(`${quizId}-progress`);
            if (!progressElement) return;

            const quizScore = this.quizScores.find(score => score.quizName === quizId);
            const percentage = quizScore ? quizScore.score : 0;

            // Store updates to apply in batch
            updates.set(item, {
                progress: percentage,
                element: progressElement
            });
        });

        // Apply all updates in one batch
        requestAnimationFrame(() => {
            updates.forEach(({ progress, element }, item) => {
                item.setAttribute('data-progress', progress);
                
                if (progress > 0) {
                    element.textContent = `${progress}%`;
                    element.style.display = 'block';
                    
                    if (progress === 100) {
                        item.style.background = 'linear-gradient(to right, rgba(46, 204, 113, 0.1), rgba(46, 204, 113, 0.2))';
                        element.style.background = 'var(--success-color)';
                        element.style.color = 'white';
                    } else {
                        item.style.background = 'linear-gradient(to right, rgba(241, 196, 15, 0.1), rgba(241, 196, 15, 0.2))';
                        element.style.background = 'var(--warning-color)';
                        element.style.color = 'var(--text-primary)';
                    }
                } else {
                    element.textContent = '';
                    element.style.display = 'none';
                    item.style.background = 'var(--card-background)';
                }
            });
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