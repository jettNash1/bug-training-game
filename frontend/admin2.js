import { APIService } from './api-service.js';

export class Admin2Dashboard {
    constructor() {
        console.log("Initializing Admin2Dashboard as standalone class...");
        
        // Initialize APIService
        this.apiService = new APIService();
        
        // Initialize properties
        this.userScores = new Map();
        this.users = [];
        this.quizTypes = [
            'communication', 'initiative', 'time-management', 'tester-mindset',
            'risk-analysis', 'risk-management', 'non-functional', 'test-support',
            'issue-verification', 'build-verification', 'issue-tracking-tools',
            'raising-tickets', 'reports', 'cms-testing', 'email-testing', 'content-copy',
            'locale-testing', 'script-metrics-troubleshooting','standard-script-testing',
            'test-types-tricks', 'automation-interview', 'fully-scripted', 'exploratory',
            'sanity-smoke', 'functional-interview'
        ];
        
        this.timerSettings = {
            secondsPerQuestion: 60, // Default value
            quizTimers: {} // Property for custom timers
        };
        
        // Store the dashboard instance globally for easier access
        window.adminDashboard = this;
        
        // Additional initialization for Admin2Dashboard
        this.isRowView = false; // Default to grid view
        this.guideSettings = {};
        
        // Only initialize the dashboard if we're not on the login page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('admin-login.html')) {
            this.init2().catch(error => {
                console.error('Error during Admin2Dashboard initialization:', error);
            });
        } else {
            console.log('On admin-login page, skipping dashboard initialization');
        }
    }

    // Helper method to calculate percentage of total questions answered (out of 375)
    calculateQuestionsAnsweredPercent(user) {
        if (!user) return 0;

        let totalQuestionsAnswered = 0;
        const totalPossibleQuestions = 375; // 25 quizzes * 15 questions
        
        // Debug the user input
        console.log(`DEBUG calculateQuestionsAnsweredPercent for user ${user.username}:`, {
            hasQuizProgress: !!user.quizProgress,
            quizProgressKeys: user.quizProgress ? Object.keys(user.quizProgress) : [],
            hasQuizResults: Array.isArray(user.quizResults),
            quizResultsCount: Array.isArray(user.quizResults) ? user.quizResults.length : 0
        });
        
        // Sum up questions answered across all quizzes
        if (this.quizTypes && Array.isArray(this.quizTypes)) {
            this.quizTypes.forEach(quizType => {
                if (typeof quizType === 'string') {
                    const progress = user.quizProgress?.[quizType.toLowerCase()];
                    const result = user.quizResults?.find(r => r.quizName.toLowerCase() === quizType.toLowerCase());
                    
                    // Prioritize values from quiz results over progress
                    const questionsAnswered = result?.questionsAnswered || 
                                          result?.questionHistory?.length ||
                                          progress?.questionsAnswered || 
                                          progress?.questionHistory?.length || 0;
                    
                    totalQuestionsAnswered += questionsAnswered;
                    
                    // Debug individual quiz calculations if non-zero
                    if (questionsAnswered > 0) {
                        console.log(`DEBUG ${user.username} - ${quizType}: ${questionsAnswered} questions answered`);
                    }
                }
            });
        }

        // Calculate progress as percentage of total possible questions
        const percentage = (totalQuestionsAnswered / totalPossibleQuestions) * 100;
        console.log(`DEBUG ${user.username} final progress: ${totalQuestionsAnswered}/${totalPossibleQuestions} = ${percentage.toFixed(1)}%`);
        return percentage;
    }
    
    // This method overrides the one from admin.js to ensure we use our calculation
    calculateUserProgress(user) {
        return this.calculateQuestionsAnsweredPercent(user);
    }
    
    // Calculate the average score for a user based on total questions answered percentage
    calculateAverageScore(user) {
        if (!user) return 0;
        return this.calculateQuestionsAnsweredPercent(user);
    }
}

// Initialize the Admin2Dashboard when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Admin2Dashboard();
    
    // Define the missing forceUpdateAverageScores function
    const forceUpdateAverageScores = () => {
        console.log("Forcing update of user card progress values...");
        const userCards = document.querySelectorAll('.user-card');
        
        userCards.forEach(card => {
            const username = card.getAttribute('data-username');
            if (!username) return;
            
            const user = dashboard.users.find(u => u.username === username);
            if (!user) return;
            
            // Calculate progress using the calculateQuestionsAnsweredPercent method
            const progress = dashboard.calculateQuestionsAnsweredPercent(user);
            const progressDisplay = `${progress.toFixed(1)}%`;
            
            // Update all progress values in this card
            const progressElements = card.querySelectorAll('.total-progress-value');
            progressElements.forEach(element => {
                element.textContent = progressDisplay;
            });
            
            // Also update the progress bar if in grid view
            const progressBar = card.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            // Update data attribute
            card.setAttribute('data-progress', progressDisplay);
        });
    };

    // Make the function globally available 
    window.forceUpdateAverageScores = forceUpdateAverageScores;
    
    // Force update on page load
    setTimeout(forceUpdateAverageScores, 1000);
}); 