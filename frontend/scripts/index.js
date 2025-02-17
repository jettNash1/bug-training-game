import { APIService } from '../api-service.js';
import { QuizUser } from '../QuizUser.js';

class IndexPage {
    constructor() {
        this.apiService = new APIService();
        this.user = new QuizUser(localStorage.getItem('username'));
        this.quizItems = document.querySelectorAll('.quiz-item:not(.locked-quiz)');
        this.initialize();
        this.showLoadingOverlay();
    }

    showLoadingOverlay() {
        // Create loading overlay if it doesn't exist
        if (!document.querySelector('.loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading your learning journey...</div>
            `;
            document.body.appendChild(overlay);

            // Add styles if they don't exist
            if (!document.querySelector('#loading-styles')) {
                const styles = document.createElement('style');
                styles.id = 'loading-styles';
                styles.textContent = `
                    .loading-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(255, 255, 255, 0.9);
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        z-index: 9999;
                    }
                    .loading-spinner {
                        width: 50px;
                        height: 50px;
                        border: 5px solid #f3f3f3;
                        border-top: 5px solid var(--primary-color, #4a90e2);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 20px;
                    }
                    .loading-text {
                        font-size: 1.2em;
                        color: var(--primary-color, #4a90e2);
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(styles);
            }
        }
    }

    hideLoadingOverlay() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            // Add fade-out animation
            overlay.style.transition = 'opacity 0.3s ease-out';
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
    }

    async initialize() {
        try {
            await this.loadUserProgress();
            this.updateQuizProgress();
            this.updateCategoryProgress();
        } catch (error) {
            console.error('Failed to initialize:', error);
        } finally {
            this.hideLoadingOverlay();
        }
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

            console.log('Raw user data:', userData);
            
            // Ensure we have the user data object
            if (!userData.data) {
                console.error('User data is missing');
                return;
            }

            const isInterviewAccount = userData.data.userType === 'interview_candidate';
            const allowedQuizzes = userData.data.allowedQuizzes || [];
            const hiddenQuizzes = userData.data.hiddenQuizzes || [];

            console.log('Visibility settings:', {
                isInterviewAccount,
                allowedQuizzes,
                hiddenQuizzes,
                userType: userData.data.userType
            });

            // If allowedQuizzes has entries, only show those quizzes
            const useWhitelist = allowedQuizzes.length > 0;

            // Batch all quiz progress requests
            const progressPromises = Array.from(this.quizItems).map(async item => {
                const quizId = item.dataset.quiz;
                const quizLower = quizId.toLowerCase();

                // If using whitelist (allowedQuizzes has entries), only show allowed quizzes
                if (useWhitelist) {
                    if (!allowedQuizzes.includes(quizLower)) {
                        console.log(`Hiding quiz ${quizId} - not in allowed list`);
                        item.style.display = 'none';
                        return null;
                    }
                } else if (hiddenQuizzes.includes(quizLower)) { // Otherwise use blacklist
                    console.log(`Hiding quiz ${quizId} - in hidden list`);
                    item.style.display = 'none';
                    return null;
                }
                
                console.log(`Showing quiz ${quizId}`);
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

            return true;
        } catch (error) {
            console.error('Error loading user progress:', error);
            this.quizScores = [];
            return false;
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
            const visibleQuizItems = Array.from(quizItems).filter(item => item.style.display !== 'none');
            const progressBar = category.querySelector('.progress-fill');
            const progressText = category.querySelector('.progress-text');
            
            // Hide the category if there are no visible quizzes
            if (visibleQuizItems.length === 0) {
                category.style.display = 'none';
                return;
            } else {
                category.style.display = '';
            }

            if (!progressBar || !progressText) return;

            const categoryStats = visibleQuizItems.reduce((stats, item) => {
                const quizId = item.dataset.quiz;
                const quizScore = this.quizScores.find(score => score.quizName === quizId);
                
                // Count as completed only if status is 'completed'
                const isCompleted = quizScore && quizScore.status === 'completed';
                
                return {
                    completedQuizzes: stats.completedQuizzes + (isCompleted ? 1 : 0),
                    totalProgress: stats.totalProgress + (isCompleted ? 100 : 0)
                };
            }, { completedQuizzes: 0, totalProgress: 0 });

            const totalQuizzes = visibleQuizItems.length;
            // Calculate percentage based on completed quizzes instead of total progress
            const categoryPercentage = Math.round((categoryStats.completedQuizzes / totalQuizzes) * 100);

            // Update the category progress text and bar
            const progressTextElement = progressText.closest('.category-progress');
            if (progressTextElement) {
                progressTextElement.innerHTML = `
                    <div class="progress-text">Progress: ${categoryStats.completedQuizzes}/${totalQuizzes} Complete</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${categoryPercentage}%"></div>
                    </div>
                `;
            }
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