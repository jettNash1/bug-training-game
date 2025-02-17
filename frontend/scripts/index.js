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

            // Get user data including hidden quizzes
            const userData = await this.apiService.getUserData();
            if (!userData.success) {
                throw new Error('Failed to load user data');
            }

            console.log('User data received:', {
                userType: userData.data.userType,
                hiddenQuizzes: userData.data.hiddenQuizzes
            });

            const hiddenQuizzes = userData.data.hiddenQuizzes || [];

            // Batch all quiz progress requests
            const progressPromises = Array.from(this.quizItems).map(async item => {
                const quizId = item.dataset.quiz;
                const quizLower = quizId.toLowerCase();

                // Handle quiz visibility based on hiddenQuizzes
                if (hiddenQuizzes.includes(quizLower)) {
                    item.style.display = 'none';
                    return null;
                }
                
                // Show the quiz if it's not hidden
                item.style.display = '';

                try {
                    // Get the saved progress
                    const savedProgress = await this.apiService.getQuizProgress(quizId);
                    const progress = savedProgress?.data;

                    if (!progress) {
                        return { 
                            quizName: quizId, 
                            score: 0, 
                            questionsAnswered: 0, 
                            status: 'in-progress',
                            experience: 0
                        };
                    }

                    // Use the status directly from the saved progress
                    return {
                        quizName: quizId,
                        score: progress.score || 0,
                        questionsAnswered: progress.questionsAnswered || 0,
                        status: progress.status || 'in-progress',
                        experience: progress.experience || 0
                    };
                } catch (error) {
                    console.error(`Error loading progress for quiz ${quizId}:`, error);
                    return { 
                        quizName: quizId, 
                        score: 0, 
                        questionsAnswered: 0, 
                        status: 'in-progress',
                        experience: 0
                    };
                }
            });

            // Wait for all progress data to load
            this.quizScores = (await Promise.all(progressPromises)).filter(Boolean);
            console.log('Loaded quiz scores:', this.quizScores); // Debug log

            // Update category progress after hiding quizzes
            this.updateCategoryProgress();
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

            // First remove all existing state classes
            item.classList.remove('failed', 'completed', 'in-progress', 'not-started');
            progressElement.classList.remove('failed', 'completed', 'in-progress', 'not-started');

            // Set the progress data attribute
            item.setAttribute('data-progress', quizScore.score);

            // Handle the four different states
            if (quizScore.questionsAnswered === 0) {
                // No questions answered - white background
                item.classList.add('not-started');
                progressElement.classList.add('not-started');
                progressElement.textContent = '0/15';
            } else if (quizScore.status === 'failed') {
                // Failed state - red background
                item.classList.add('failed');
                progressElement.classList.add('failed');
                progressElement.textContent = `${quizScore.questionsAnswered}/15`;
                item.style.pointerEvents = 'none';
                item.setAttribute('aria-disabled', 'true');
            } else if (quizScore.status === 'completed' && quizScore.questionsAnswered === 15) {
                // Completed state - green background
                item.classList.add('completed');
                progressElement.classList.add('completed');
                progressElement.textContent = '15/15';
            } else if (quizScore.questionsAnswered > 0) {
                // In progress - pale yellow background
                item.classList.add('in-progress');
                progressElement.classList.add('in-progress');
                progressElement.textContent = `${quizScore.questionsAnswered}/15`;
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
            const progressText = category.querySelector('.progress-text');
            
            if (!quizItems.length || !progressBar || !progressText) return;

            const categoryStats = Array.from(quizItems).reduce((stats, item) => {
                const quizId = item.dataset.quiz;
                const quizScore = this.quizScores.find(score => score.quizName === quizId);
                
                // Count as completed only if status is 'completed'
                const isCompleted = quizScore && quizScore.status === 'completed';
                
                return {
                    completedQuizzes: stats.completedQuizzes + (isCompleted ? 1 : 0),
                    totalProgress: stats.totalProgress + (isCompleted ? 100 : 0)
                };
            }, { completedQuizzes: 0, totalProgress: 0 });

            const totalQuizzes = quizItems.length;
            // Calculate percentage based on completed quizzes instead of total progress
            const categoryPercentage = Math.round((categoryStats.completedQuizzes / totalQuizzes) * 100);

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
                const progressTextElement = progressText.closest('.category-progress');
                if (progressTextElement) {
                    progressTextElement.innerHTML = `
                        <div class="progress-text">Progress: ${completedQuizzes}/${totalQuizzes} Complete</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${categoryPercentage}%"></div>
                        </div>
                    `;
                }
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