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
                    // Get the saved progress
                    const savedProgress = await this.apiService.getQuizProgress(quizId);
                    const progress = savedProgress?.data;

                    if (!progress) {
                        return { 
                            quizName: quizId, 
                            score: 0, 
                            questionsAnswered: 0, 
                            failed: false, 
                            completed: false,
                            experience: 0,
                            status: null
                        };
                    }

                    // Get the status directly from the progress data
                    const status = progress.status || null;
                    
                    // Calculate actual progress regardless of status
                    const questionsAnswered = progress.questionHistory?.length || 0;
                    const score = Math.round((questionsAnswered / 15) * 100);

                    // Set failed and completed based on status
                    const result = {
                        quizName: quizId,
                        score: score,
                        questionsAnswered: questionsAnswered,
                        failed: status === 'failed',
                        completed: status === 'passed',
                        experience: progress.experience || 0,
                        status: status,
                        questionHistory: progress.questionHistory || []
                    };

                    console.log(`Quiz ${quizId} status:`, { status, failed: result.failed });
                    return result;
                } catch (error) {
                    console.error(`Error loading progress for quiz ${quizId}:`, error);
                    return { 
                        quizName: quizId, 
                        score: 0, 
                        questionsAnswered: 0, 
                        failed: false, 
                        completed: false,
                        experience: 0,
                        status: null
                    };
                }
            });

            // Wait for all progress data to load
            this.quizScores = await Promise.all(progressPromises);
            console.log('Loaded quiz scores:', this.quizScores); // Debug log
        } catch (error) {
            console.error('Error loading user progress:', error);
            this.quizScores = [];
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

            console.log(`Updating quiz ${quizId}:`, quizScore); // Debug log

            // Remove any existing state classes
            item.classList.remove('failed', 'completed', 'in-progress');
            progressElement.classList.remove('failed', 'completed', 'in-progress');

            // Update the quiz item appearance based on its state
            if (quizScore.failed || quizScore.status === 'failed') {
                // Failed quiz state
                console.log(`Quiz ${quizId} marked as failed`); // Debug log
                progressElement.textContent = 'Failed';
                progressElement.classList.add('failed');
                item.classList.add('failed');
                item.setAttribute('aria-disabled', 'true');
                item.style.pointerEvents = 'none';
                item.style.opacity = '0.7';
            } else if (quizScore.completed || quizScore.status === 'passed') {
                // Completed quiz state
                progressElement.textContent = 'Passed';
                progressElement.classList.add('completed');
                item.classList.add('completed');
            } else if (quizScore.questionsAnswered > 0) {
                // In progress state
                progressElement.textContent = `${quizScore.questionsAnswered}/15`;
                progressElement.classList.add('in-progress');
                item.classList.add('in-progress');
            } else {
                // Not started state
                progressElement.textContent = '';
            }

            // Set progress data attribute
            item.setAttribute('data-progress', quizScore.completed ? '100' : quizScore.score);

            // Ensure failed quizzes stay disabled
            if (quizScore.failed || quizScore.status === 'failed') {
                item.style.pointerEvents = 'none';
                item.style.opacity = '0.7';
            }
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