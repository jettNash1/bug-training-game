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
                    // Get server data
                    const serverProgress = await this.apiService.getQuizProgress(quizId);
                    
                    if (!serverProgress?.data) {
                        return {
                            quizName: quizId,
                            score: 0,
                            questionsAnswered: 0,
                            status: 'not_started'
                        };
                    }

                    const progress = serverProgress.data;
                    
                    // Calculate score based on experience (max 300)
                    const score = Math.round((progress.experience / 300) * 100);
                    
                    // Determine status based on score and completion
                    let status = progress.status || 'not_started';
                    if (status !== 'failed') {
                        if (score >= 70 && progress.questionHistory?.length === 15) {
                            status = 'completed';
                        } else if (score > 0 || progress.questionHistory?.length > 0) {
                            status = 'in_progress';
                        }
                    }

                    return {
                        quizName: quizId,
                        score: score,
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
        try {
            this.quizItems.forEach(item => {
                const quizId = item.dataset.quiz;
                if (!quizId) return;

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
                if (!quizScore) {
                    progressElement.textContent = '';
                    progressElement.className = 'quiz-completion not-started';
                    return;
                }

                console.log(`Updating progress for ${quizId}:`, quizScore);

                const percentage = quizScore.score;
                const status = quizScore.status;

                // Remove all status classes first
                progressElement.classList.remove('not-started', 'in-progress', 'completed', 'failed');
                item.classList.remove('not-started', 'in-progress', 'completed', 'failed');

                // Set text content and styles based on status
                if (status === 'failed') {
                    progressElement.textContent = 'Failed';
                    progressElement.classList.add('failed');
                    item.classList.add('failed');
                    progressElement.style.backgroundColor = '#ff4444';
                    progressElement.style.color = '#ffffff';
                    item.style.pointerEvents = 'none';
                    item.style.opacity = '0.7';
                } else if (status === 'completed') {
                    progressElement.textContent = '100%';
                    progressElement.classList.add('completed');
                    item.classList.add('completed');
                    progressElement.style.backgroundColor = '#4CAF50';
                    progressElement.style.color = '#ffffff';
                } else if (status === 'in_progress') {
                    progressElement.textContent = `${percentage}%`;
                    progressElement.classList.add('in-progress');
                    item.classList.add('in-progress');
                    progressElement.style.backgroundColor = '#2196F3';
                    progressElement.style.color = '#ffffff';
                } else {
                    progressElement.textContent = '';
                    progressElement.classList.add('not-started');
                    item.classList.add('not-started');
                    progressElement.style.backgroundColor = '#e0e0e0';
                    progressElement.style.color = '#666666';
                }

                // Base styles for progress element
                progressElement.style.cssText += `
                    display: block;
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    z-index: 1;
                    text-align: center;
                    min-width: 40px;
                `;

                // Add hover effect
                item.style.cursor = status === 'failed' ? 'not-allowed' : 'pointer';
                item.style.transition = 'transform 0.2s ease-in-out';
            });

            // Update category progress bars
            this.updateCategoryProgress();
        } catch (error) {
            console.error('Error updating quiz progress:', error);
        }
    }

    updateCategoryProgress() {
        const categories = {
            'Personal Organisation': ['communication', 'initiative', 'tester-mindset', 'time-management'],
            'Risk Management': ['risk-analysis', 'risk-management'],
            'Test Execution': ['non-functional', 'test-support', 'issue-verification', 'build-verification'],
            'Tickets and Tracking': ['issue-tracking-tools', 'raising-tickets', 'reports', 'CMS-Testing']
        };

        // Get all category cards
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            // Get the category header text
            const headerElement = card.querySelector('.category-header');
            if (!headerElement) return;

            const categoryName = headerElement.textContent.trim();
            const quizzes = categories[categoryName];
            
            if (!quizzes) return;

            // Calculate completed quizzes
            const completedQuizzes = quizzes.filter(quizId => {
                const score = this.quizScores?.find(s => s.quizName === quizId);
                if (!score) return false;
                
                // A quiz is considered complete if:
                // 1. It has a score >= 70%
                // 2. It's not marked as failed
                // 3. All questions are answered (questionsAnswered === 15)
                return score.score >= 70 && score.status === 'completed' && score.questionsAnswered === 15;
            }).length;

            // Update progress text
            const progressText = card.querySelector('.progress-text');
            if (progressText) {
                progressText.textContent = `Progress: ${completedQuizzes}/${quizzes.length} Complete`;
            }

            // Update progress bar
            const progressBar = card.querySelector('.progress-fill');
            if (progressBar) {
                const percentage = (completedQuizzes / quizzes.length) * 100;
                progressBar.style.width = `${percentage}%`;
                progressBar.setAttribute('aria-valuenow', percentage);
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