import { APIService } from './api-service.js';
import { QuizUser } from './QuizUser.js';

class Admin2Dashboard {
    constructor() {
        this.apiService = new APIService();
        this.users = [];
        this.userScores = new Map();
        
        // Initialize quiz types
        this.quizTypes = [
            'communication',
            'initiative', 
            'time-management',
            'tester-mindset',
            'risk-analysis',
            'risk-management',
            'non-functional',
            'test-support',
            'issue-verification',
            'build-verification',
            'issue-tracking-tools',
            'raising-tickets',
            'reports',
            'cms-testing'
        ];

        // Initialize the dashboard
        this.init();
    }

    async init() {
        console.log('Initializing Admin2Dashboard');
        const adminToken = localStorage.getItem('adminToken');
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('admin2.html')) {
            if (!await this.verifyAdminToken(adminToken)) {
                window.location.href = '/pages/admin-login.html';
                return;
            }
            await this.setupDashboard();
        }
    }

    async setupDashboard() {
        // Add event listeners
        const userSearch = document.getElementById('userSearch');
        const sortBy = document.getElementById('sortBy');
        
        if (userSearch) {
            userSearch.addEventListener('input', this.debounce(this.updateDashboard.bind(this), 300));
        }
        if (sortBy) {
            sortBy.addEventListener('change', this.updateDashboard.bind(this));
        }

        // Initial data load
        await this.refreshAllData();
    }

    async verifyAdminToken(token) {
        if (!token) return false;
        
        try {
            const response = await fetch(`${this.apiService.baseUrl}/admin/verify-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            return data.success && data.valid && data.isAdmin;
        } catch (error) {
            console.error('Admin token verification failed:', error);
            return false;
        }
    }

    async handleAdminLogout() {
        localStorage.removeItem('adminToken');
        window.location.href = '/pages/admin-login.html';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    async loadUserProgress(username) {
        try {
            const response = await fetch(`${this.apiService.baseUrl}/users/${username}/quiz-results`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user progress');
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to load user progress');
            }

            // Initialize scores for all quiz types
            const scores = this.quizTypes.map(quizName => ({
                quizName,
                score: 0,
                experience: 0,
                questionsAnswered: 0,
                questionHistory: [],
                lastActive: null,
                completedAt: null,
                failedQuestions: []
            }));

            // Update scores with actual results
            if (Array.isArray(data.data)) {
                data.data.forEach(result => {
                    const scoreIndex = scores.findIndex(s => 
                        s.quizName === result.quizName || 
                        s.quizName === this.normalizeQuizName(result.quizName)
                    );
                    
                    if (scoreIndex !== -1) {
                        scores[scoreIndex] = {
                            ...scores[scoreIndex],
                            ...result,
                            quizName: scores[scoreIndex].quizName,
                            questionsAnswered: result.currentQuestion || result.questionsAnswered || 0,
                            experience: result.xp || result.experience || 0,
                            score: result.progress || result.score || 0,
                            failedQuestions: result.questionHistory ? 
                                result.questionHistory.filter(q => q.selectedAnswer.experience < 0) : []
                        };
                    }
                });
            }

            return scores;
        } catch (error) {
            console.error(`Failed to load progress for user ${username}:`, error);
            return [];
        }
    }

    async refreshAllData() {
        try {
            const adminToken = localStorage.getItem('adminToken');
            
            if (!adminToken) {
                this.handleAdminLogout();
                return;
            }

            // Show loading state
            document.getElementById('usersList').classList.add('loading');

            const response = await fetch(`${this.apiService.baseUrl}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            if (data.success && Array.isArray(data.users)) {
                this.users = data.users;
                
                // Load all user progress in parallel
                const progressPromises = this.users.map(async user => {
                    const scores = await this.loadUserProgress(user.username);
                    this.userScores.set(user.username, scores);
                });

                await Promise.all(progressPromises);
                
                // Update the display
                this.updateStatistics();
                this.updateDashboard();
            }
        } catch (error) {
            console.error('Failed to refresh data:', error);
            this.showError('Failed to load user data. Please try again.');
        } finally {
            document.getElementById('usersList').classList.remove('loading');
        }
    }

    updateStatistics() {
        const totalUsers = this.users.length;
        const activeToday = this.users.filter(user => {
            const lastActive = new Date(user.lastActive);
            const today = new Date();
            return lastActive.toDateString() === today.toDateString();
        }).length;

        let totalCompletion = 0;
        let userCount = 0;

        this.userScores.forEach((scores, username) => {
            const userCompletion = scores.reduce((acc, quiz) => acc + (quiz.score || 0), 0) / scores.length;
            if (!isNaN(userCompletion)) {
                totalCompletion += userCompletion;
                userCount++;
            }
        });

        const averageCompletion = userCount > 0 ? Math.round(totalCompletion / userCount) : 0;

        // Update the display
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('activeUsers').textContent = activeToday;
        document.getElementById('averageCompletion').textContent = `${averageCompletion}%`;
    }

    async updateDashboard() {
        const searchTerm = document.getElementById('userSearch').value.toLowerCase();
        const sortByValue = document.getElementById('sortBy').value;
        
        // Filter users based on search
        let filteredUsers = this.users.filter(user => 
            user.username.toLowerCase().includes(searchTerm)
        );

        // Sort users
        filteredUsers.sort((a, b) => {
            switch (sortByValue) {
                case 'username-asc':
                    return a.username.localeCompare(b.username);
                case 'username-desc':
                    return b.username.localeCompare(a.username);
                case 'progress-high':
                case 'progress-low': {
                    const aProgress = this.calculateAverageProgress(a.username);
                    const bProgress = this.calculateAverageProgress(b.username);
                    return sortByValue === 'progress-high' ? bProgress - aProgress : aProgress - bProgress;
                }
                case 'xp-high':
                case 'xp-low': {
                    const aXP = this.calculateTotalXP(a.username);
                    const bXP = this.calculateTotalXP(b.username);
                    return sortByValue === 'xp-high' ? bXP - aXP : aXP - bXP;
                }
                case 'last-active':
                    return new Date(b.lastActive) - new Date(a.lastActive);
                default:
                    return 0;
            }
        });

        // Update the display
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';

        filteredUsers.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            
            const averageProgress = this.calculateAverageProgress(user.username);
            const totalXP = this.calculateTotalXP(user.username);
            const lastActive = this.formatDate(user.lastActive);

            userCard.innerHTML = `
                <h3>${user.username}</h3>
                <div class="user-stats">
                    <div class="user-stat">
                        <span>Average Progress:</span>
                        <span>${averageProgress}%</span>
                    </div>
                    <div class="user-stat">
                        <span>Total XP:</span>
                        <span>${totalXP}</span>
                    </div>
                    <div class="user-stat">
                        <span>Last Active:</span>
                        <span>${lastActive}</span>
                    </div>
                </div>
                <button class="view-details-btn" 
                        onclick="window.admin2Dashboard.showUserDetails('${user.username}')"
                        aria-label="View details for ${user.username}">
                    View Details
                </button>
            `;

            usersList.appendChild(userCard);
        });
    }

    calculateAverageProgress(username) {
        const scores = this.userScores.get(username) || [];
        if (scores.length === 0) return 0;
        
        const totalProgress = scores.reduce((acc, quiz) => acc + (quiz.score || 0), 0);
        return Math.round(totalProgress / scores.length);
    }

    calculateTotalXP(username) {
        const scores = this.userScores.get(username) || [];
        return scores.reduce((acc, quiz) => acc + (quiz.experience || 0), 0);
    }

    async showUserDetails(username) {
        const modal = document.getElementById('userDetailsModal');
        const titleElement = document.getElementById('userDetailsTitle');
        const progressContainer = document.getElementById('userQuizProgress');
        
        titleElement.textContent = `User Details: ${username}`;
        progressContainer.innerHTML = '';

        const scores = this.userScores.get(username) || [];
        
        scores.forEach(quiz => {
            const quizElement = document.createElement('div');
            quizElement.className = 'quiz-progress-item';
            
            const progress = quiz.score || 0;
            const experience = quiz.experience || 0;
            const questionsAnswered = quiz.questionsAnswered || 0;
            const failedQuestions = quiz.failedQuestions?.length || 0;

            quizElement.innerHTML = `
                <div class="quiz-progress-header">
                    <h3>${this.formatQuizName(quiz.quizName)}</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="quiz-progress-details">
                    <div class="quiz-stat">
                        <span class="quiz-stat-label">Progress</span>
                        <span class="quiz-stat-value">${progress}%</span>
                    </div>
                    <div class="quiz-stat">
                        <span class="quiz-stat-label">Experience</span>
                        <span class="quiz-stat-value">${experience} XP</span>
                    </div>
                    <div class="quiz-stat">
                        <span class="quiz-stat-label">Questions Completed</span>
                        <span class="quiz-stat-value">${questionsAnswered}</span>
                    </div>
                    <div class="quiz-stat">
                        <span class="quiz-stat-label">Failed Questions</span>
                        <span class="quiz-stat-value">${failedQuestions}</span>
                    </div>
                </div>
            `;

            progressContainer.appendChild(quizElement);
        });

        modal.classList.add('active');
    }

    closeUserDetails() {
        const modal = document.getElementById('userDetailsModal');
        modal.classList.remove('active');
    }

    formatQuizName(name) {
        return name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    normalizeQuizName(quizName) {
        return quizName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    formatDate(dateString) {
        if (!dateString) return 'Never';
        
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Today at ${date.toLocaleTimeString()}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday at ${date.toLocaleTimeString()}`;
        } else {
            return date.toLocaleString();
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the dashboard when the page loads
window.admin2Dashboard = new Admin2Dashboard(); 