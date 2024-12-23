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

            console.log('Loading progress for user:', username);
            
            // Get progress for each quiz
            this.quizScores = [];
            for (const item of this.quizItems) {
                const quizId = item.dataset.quiz;
                try {
                    console.log(`Fetching progress for quiz: ${quizId}`);
                    
                    // Try getting progress from server first
                    const serverProgress = await this.apiService.getQuizProgress(quizId);
                    console.log(`Server progress for ${quizId}:`, serverProgress);
                    
                    // Try getting progress from localStorage as backup
                    const storageKey = `quiz_progress_${username}_${quizId}`;
                    const localData = localStorage.getItem(storageKey);
                    let localProgress = null;
                    if (localData) {
                        try {
                            const parsed = JSON.parse(localData);
                            localProgress = parsed.progress;
                            console.log(`Local progress for ${quizId}:`, localProgress);
                        } catch (e) {
                            console.error(`Error parsing local progress for ${quizId}:`, e);
                        }
                    }
                    
                    // Use server progress if available, otherwise use local progress
                    const progress = serverProgress?.data || localProgress;
                    
                    if (progress) {
                        // Calculate score based on completed questions
                        const questionsAnswered = progress.questionHistory ? progress.questionHistory.length : 0;
                        const score = Math.round((questionsAnswered / 15) * 100); // 15 questions per quiz
                        console.log(`${quizId} questions answered: ${questionsAnswered}, calculated score: ${score}%`);
                        
                        this.quizScores.push({
                            quizName: quizId,
                            score: score,
                            questionsAnswered: questionsAnswered
                        });
                    } else {
                        console.log(`No progress data found for ${quizId}`);
                        this.quizScores.push({
                            quizName: quizId,
                            score: 0,
                            questionsAnswered: 0
                        });
                    }
                } catch (error) {
                    console.error(`Error loading progress for quiz ${quizId}:`, error);
                    // Add a zero score entry if we fail to load progress
                    this.quizScores.push({
                        quizName: quizId,
                        score: 0,
                        questionsAnswered: 0
                    });
                }
            }
            
            console.log('Final quiz scores:', this.quizScores);
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

                console.log(`Updating UI for ${quizId}:`, {
                    score: percentage,
                    element: progressElement,
                    quizScore
                });
                
                // Update the quiz item's data-progress attribute
                item.setAttribute('data-progress', percentage);
                
                // Update the progress element text and visibility
                if (percentage > 0) {
                    progressElement.textContent = `${percentage}%`;
                    progressElement.style.display = 'block';
                    
                    // Update background color based on progress
                    if (percentage === 100) {
                        item.style.background = 'linear-gradient(to right, rgba(46, 204, 113, 0.1), rgba(46, 204, 113, 0.2))';
                        progressElement.style.background = 'var(--success-color)';
                        progressElement.style.color = 'white';
                    } else {
                        item.style.background = 'linear-gradient(to right, rgba(241, 196, 15, 0.1), rgba(241, 196, 15, 0.2))';
                        progressElement.style.background = 'var(--warning-color)';
                        progressElement.style.color = 'var(--text-primary)';
                    }
                } else {
                    progressElement.textContent = '';
                    progressElement.style.display = 'none';
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
                
                console.log('Category progress:', {
                    category: category.querySelector('.category-header').textContent.trim(),
                    completedQuizzes,
                    totalQuizzes,
                    categoryPercentage
                });
                
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