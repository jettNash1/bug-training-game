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

            // First load quiz results to get the overall status
            const quizUser = new QuizUser(username);
            await quizUser.loadUserData();

            // Batch all quiz progress requests
            const progressPromises = Array.from(this.quizItems).map(async item => {
                const quizId = item.dataset.quiz;
                try {
                    // Get the saved progress
                    const savedProgress = await this.apiService.getQuizProgress(quizId);
                    console.log(`Raw progress data for ${quizId}:`, savedProgress);
                    
                    const progress = savedProgress?.data;
                    if (!progress) {
                        console.log(`No progress data for ${quizId}`);
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

                    // Get the status from both progress and quiz results
                    const status = progress.status || null;
                    const quizResult = quizUser.getQuizResult(quizId);
                    console.log(`Quiz result for ${quizId}:`, quizResult);

                    // Calculate actual progress regardless of status
                    const questionsAnswered = progress.questionHistory?.length || 0;
                    const score = Math.round((questionsAnswered / 15) * 100);

                    // Check if the quiz should be marked as failed
                    const hasFailed = status === 'failed' || quizResult?.status === 'failed';
                    console.log(`Quiz ${quizId} failed status:`, { status, resultStatus: quizResult?.status, hasFailed });

                    // Set failed and completed based on both progress and quiz result status
                    const result = {
                        quizName: quizId,
                        score: score,
                        questionsAnswered: questionsAnswered,
                        failed: hasFailed,
                        completed: status === 'passed' || quizResult?.status === 'passed',
                        experience: progress.experience || 0,
                        status: status || quizResult?.status,
                        questionHistory: progress.questionHistory || []
                    };

                    console.log(`Final result for ${quizId}:`, result);
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
            console.log('All quiz scores loaded:', this.quizScores);
        } catch (error) {
            console.error('Error loading user progress:', error);
            this.quizScores = [];
        }
    }

    updateQuizProgress(quizName) {
        const quizItem = this.quizItems.find(item => item.dataset.quiz === quizName);
        if (!quizItem) return;

        const progressElement = quizItem.querySelector('.quiz-completion');
        if (!progressElement) return;

        const quizScore = this.quizScores.find(score => score.quizName === quizName);
        if (!quizScore) return;

        console.log(`Updating progress for ${quizName}:`, quizScore);

        // Remove any existing state classes
        quizItem.classList.remove('failed', 'completed', 'in-progress');
        progressElement.classList.remove('failed', 'completed', 'in-progress');

        // Check if the quiz is failed
        if (quizScore.failed || quizScore.status === 'failed') {
            console.log(`Quiz ${quizName} is failed`);
            quizItem.classList.add('failed');
            progressElement.classList.add('failed');
            progressElement.textContent = 'Failed';
            quizItem.style.pointerEvents = 'none';
            return;
        }

        // Check if the quiz is completed
        if (quizScore.completed || quizScore.status === 'passed') {
            console.log(`Quiz ${quizName} is completed`);
            quizItem.classList.add('completed');
            progressElement.classList.add('completed');
            progressElement.textContent = 'Passed';
            return;
        }

        // If the quiz has started but not completed
        if (quizScore.questionsAnswered > 0) {
            console.log(`Quiz ${quizName} is in progress`);
            quizItem.classList.add('in-progress');
            progressElement.classList.add('in-progress');
            progressElement.textContent = `${quizScore.questionsAnswered}/15 Questions`;
            return;
        }

        // Quiz hasn't started
        console.log(`Quiz ${quizName} hasn't started`);
        progressElement.textContent = '';
        progressElement.dataset.progress = '0';
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