import { APIService } from '../api-service.js';
import { QuizUser } from '../QuizUser.js';

class IndexPage {
    constructor() {
        this.apiService = new APIService();
        this.user = new QuizUser(localStorage.getItem('username'));
        this.initialize();
    }

    async initialize() {
        // Get quiz items after DOM is loaded
        this.quizItems = document.querySelectorAll('.quiz-item:not(.locked-quiz)');
        await this.loadUserProgress();
        await this.updateQuizProgress();
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
                    // First check localStorage for immediate feedback
                    const localStorageKey = `quiz_progress_${username}_${quizId}`;
                    const localData = localStorage.getItem(localStorageKey);
                    let localProgress = null;
                    let localStatus = 'not_started';
                    
                    if (localData) {
                        try {
                            const parsed = JSON.parse(localData);
                            localProgress = parsed.progress;
                            localStatus = parsed.status || parsed.progress?.status || 'in_progress';
                        } catch (e) {} // Ignore parse errors
                    }

                    // Also check quiz results in localStorage for failed state
                    const quizResultKey = `quiz_result_${username}_${quizId}`;
                    const localResult = localStorage.getItem(quizResultKey);
                    if (localResult) {
                        try {
                            const parsed = JSON.parse(localResult);
                            if (parsed.status === 'failed') {
                                localStatus = 'failed';
                            }
                        } catch (e) {} // Ignore parse errors
                    }

                    // Then get server data
                    const serverProgress = await this.apiService.getQuizProgress(quizId);
                    const progress = serverProgress?.data || localProgress;
                    
                    // Determine final status - prefer server status if available
                    const status = serverProgress?.data?.status || localStatus;

                    if (!progress) {
                        return {
                            quizName: quizId,
                            score: 0,
                            questionsAnswered: 0,
                            status: status
                        };
                    }

                    return {
                        quizName: quizId,
                        score: Math.round(((progress.questionHistory?.length || 0) / 15) * 100),
                        questionsAnswered: progress.questionHistory?.length || 0,
                        status: status,
                        experience: progress.experience || 0
                    };
                } catch (error) {
                    console.error(`Error loading progress for quiz ${quizId}:`, error);
                    return {
                        quizName: quizId,
                        score: 0,
                        questionsAnswered: 0,
                        status: 'not_started'
                    };
                }
            });

            this.quizScores = await Promise.all(progressPromises);
            console.log('Loaded quiz scores:', this.quizScores);
        } catch (error) {
            console.error('Error loading user progress:', error);
            this.quizScores = [];
        }
    }

    async updateQuizProgress() {
        if (!this.quizScores || !this.quizItems) return;

        this.quizItems.forEach(item => {
            const quizId = item.dataset.quiz;
            
            // First ensure the quiz item has the correct structure
            item.style.position = 'relative';
            
            // Create or get the progress element
            let progressElement = document.getElementById(`${quizId}-progress`);
            if (!progressElement) {
                progressElement = document.createElement('div');
                progressElement.id = `${quizId}-progress`;
                progressElement.className = 'quiz-completion';
                // Insert at the beginning of the quiz item
                item.insertBefore(progressElement, item.firstChild);
            }

            const quizScore = this.quizScores.find(score => score.quizName === quizId);
            if (!quizScore) return;

            console.log(`Quiz ${quizId} status:`, quizScore.status); // Debug log

            const percentage = quizScore.score;
            const failed = quizScore.status === 'failed';

            // Base styles for progress element
            progressElement.style.cssText = `
                display: block;
                position: absolute;
                top: 8px;
                right: 8px;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                z-index: 1;
            `;
            
            if (failed) {
                console.log(`Marking quiz ${quizId} as failed`); // Debug log
                // Show failed state
                progressElement.textContent = 'Failed';
                progressElement.style.backgroundColor = '#e74c3c';
                progressElement.style.color = '#ffffff';
                
                // Style the quiz item
                item.style.cssText = `
                    position: relative;
                    background: linear-gradient(to right, rgba(231, 76, 60, 0.1), rgba(231, 76, 60, 0.2));
                    border: 1px solid #e74c3c;
                    opacity: 0.9;
                    pointer-events: none;
                    cursor: not-allowed;
                `;
                
                // Disable the link
                item.setAttribute('aria-disabled', 'true');
                item.onclick = (e) => e.preventDefault();
                
                // Remove href to prevent navigation
                if (item.hasAttribute('href')) {
                    item.removeAttribute('href');
                }
            } else if (percentage > 0) {
                progressElement.textContent = `${percentage}%`;
                
                if (percentage === 100) {
                    progressElement.style.backgroundColor = '#2ecc71';
                    progressElement.style.color = '#ffffff';
                    item.style.background = 'linear-gradient(to right, rgba(46, 204, 113, 0.1), rgba(46, 204, 113, 0.2))';
                } else {
                    progressElement.style.backgroundColor = '#f1c40f';
                    progressElement.style.color = '#2c3e50';
                    item.style.background = 'linear-gradient(to right, rgba(241, 196, 15, 0.1), rgba(241, 196, 15, 0.2))';
                }
            } else {
                progressElement.style.display = 'none';
                item.style.background = 'var(--card-background)';
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