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
            // Get the user's username from localStorage
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No username found in localStorage');
                return;
            }

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
                            experience: 0
                        };
                    }

                    // Get the quiz level and required experience
                    const level = progress.level?.toLowerCase() || 'basic';
                    const requiredExperience = level === 'advanced' ? 25 : level === 'intermediate' ? 20 : 15;
                    const totalRequiredExperience = requiredExperience * 15; // 15 questions

                    // Calculate if quiz is failed based on experience points
                    const hasFailed = progress.questionHistory?.length === 15 && progress.experience < totalRequiredExperience;

                    // Check if quiz is completed successfully
                    const isCompleted = progress.questionHistory?.length === 15 && progress.experience >= totalRequiredExperience;
                    
                    return {
                        quizName: quizId,
                        score: hasFailed ? 0 : Math.round((progress.questionHistory?.length || 0) / 15 * 100),
                        questionsAnswered: progress.questionHistory?.length || 0,
                        failed: hasFailed,
                        completed: isCompleted,
                        experience: progress.experience || 0
                    };
                } catch (error) {
                    console.error(`Error loading progress for quiz ${quizId}:`, error);
                    return { 
                        quizName: quizId, 
                        score: 0, 
                        questionsAnswered: 0, 
                        failed: false, 
                        completed: false,
                        experience: 0
                    };
                }
            });

            // Wait for all progress data to load
            this.quizScores = await Promise.all(progressPromises);
            console.log('Loaded quiz scores:', this.quizScores); // Debug log
            
            // Update the UI with the loaded progress
            this.updateQuizProgress();
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

            // Update the quiz item appearance based on its state
            if (quizScore.failed) {
                // Failed quiz state
                progressElement.textContent = 'Failed';
                progressElement.style.display = 'block';
                progressElement.style.background = '#e74c3c'; // Red
                progressElement.style.color = 'white';
                progressElement.classList.add('failed');
                progressElement.classList.remove('completed', 'in-progress');
                
                item.style.background = 'linear-gradient(to right, rgba(231, 76, 60, 0.1), rgba(231, 76, 60, 0.2))';
                item.style.cursor = 'pointer'; // Allow retrying
                item.classList.add('failed');
                item.classList.remove('completed', 'in-progress');
            } else if (quizScore.completed) {
                // Completed quiz state (100%)
                progressElement.textContent = '100%';
                progressElement.style.display = 'block';
                progressElement.style.background = '#2ecc71'; // Green
                progressElement.style.color = 'white';
                progressElement.classList.add('completed');
                progressElement.classList.remove('failed', 'in-progress');
                
                item.style.background = 'linear-gradient(to right, rgba(46, 204, 113, 0.1), rgba(46, 204, 113, 0.2))';
                item.style.cursor = 'pointer';
                item.classList.add('completed');
                item.classList.remove('failed', 'in-progress');
            } else if (quizScore.score > 0) {
                // In progress state
                progressElement.textContent = `${quizScore.score}%`;
                progressElement.style.display = 'block';
                progressElement.style.background = '#f1c40f'; // Yellow
                progressElement.style.color = 'black';
                progressElement.classList.add('in-progress');
                progressElement.classList.remove('failed', 'completed');
                
                item.style.background = 'linear-gradient(to right, rgba(241, 196, 15, 0.1), rgba(241, 196, 15, 0.2))';
                item.style.cursor = 'pointer';
                item.classList.add('in-progress');
                item.classList.remove('failed', 'completed');
            } else {
                // Not started state
                progressElement.textContent = '';
                progressElement.style.display = 'none';
                progressElement.classList.remove('failed', 'completed', 'in-progress');
                
                item.style.background = 'var(--card-background)';
                item.style.cursor = 'pointer';
                item.classList.remove('failed', 'completed', 'in-progress');
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