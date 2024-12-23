import { APIService } from './api-service.js';
import { QuizUser } from './QuizUser.js';

class AdminDashboard {
    constructor() {
        this.apiService = new APIService();
        this.users = [];
        this.userScores = new Map();
        this.init();
        this.setupTokenRefresh();
    }

    setupTokenRefresh() {
        // Check token every 5 minutes
        setInterval(async () => {
            const token = localStorage.getItem('token');
            const isAdmin = localStorage.getItem('isAdmin');
            
            if (token && isAdmin === 'true') {
                try {
                    // Verify token locally
                    const tokenData = JSON.parse(atob(token));
                    if (!tokenData.isAdmin || tokenData.exp < Date.now()) {
                        this.handleAdminLogout();
                    }
                } catch (error) {
                    console.error('Token verification error:', error);
                    this.handleAdminLogout();
                }
            }
        }, 300000); // 5 minutes
    }

    async init() {
        console.log('Initializing AdminDashboard');
        const token = localStorage.getItem('token');
        const isAdmin = localStorage.getItem('isAdmin');
        
        // Check if we're on the login page
        if (window.location.pathname.includes('admin-login.html')) {
            if (token && isAdmin === 'true') {
                // If already logged in as admin, redirect to admin dashboard
                window.location.href = './admin.html';
                return;
            }
        } else if (window.location.pathname.includes('admin.html')) {
            if (!token || isAdmin !== 'true') {
                // If not logged in as admin, redirect to login page
                window.location.href = './admin-login.html';
                return;
            }
            await this.showAdminDashboard();
            
            // Add event listeners for dashboard
            document.getElementById('userSearch').addEventListener('input', this.debounce(this.updateDashboard.bind(this), 300));
            document.getElementById('sortBy').addEventListener('change', this.updateDashboard.bind(this));
        }
    }

    async handleAdminLogin() {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        try {
            // Check against hardcoded admin credentials
            if (username === 'admin' && password === 'admin123') {
                // Generate a simple token for admin
                const token = btoa(JSON.stringify({
                    isAdmin: true,
                    username: 'admin',
                    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
                }));

                localStorage.setItem('token', token);
                localStorage.setItem('isAdmin', 'true');
                window.location.href = './admin.html';
            } else {
                this.showError('Invalid admin credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please try again.');
        }
    }

    async handleAdminLogout() {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('refreshToken');
            window.location.href = './admin-login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    async loadUserProgress(username) {
        const scores = [];
        const quizTypes = [
            'communication', 'initiative', 'time-management', 'tester-mindset',
            'risk-analysis', 'risk-management', 'non-functional', 'test-support',
            'issue-verification', 'build-verification', 'issue-tracking',
            'raising-tickets', 'reports', 'CMS-Testing'
        ];
        
        for (const quizId of quizTypes) {
            try {
                const progress = await this.apiService.getQuizProgress(quizId, username);
                if (progress && progress.data) {
                    const questionsAnswered = progress.data.questionHistory ? progress.data.questionHistory.length : 0;
                    const score = Math.round((questionsAnswered / 15) * 100);
                    scores.push({
                        quizName: quizId,
                        score: score,
                        questionsAnswered: questionsAnswered,
                        completedAt: progress.data.lastUpdated || new Date().toISOString(),
                        lastActive: progress.data.lastUpdated
                    });
                }
            } catch (error) {
                console.error(`Error loading progress for ${quizId}:`, error);
            }
        }
        
        return scores;
    }

    async showAdminDashboard() {
        document.getElementById('adminLoginForm').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        await this.updateDashboard();
    }

    async updateDashboard() {
        try {
            const token = localStorage.getItem('token');
            const isAdmin = localStorage.getItem('isAdmin');
            
            if (!token || isAdmin !== 'true') {
                this.handleAdminLogout();
                return;
            }

            // Verify token
            try {
                const tokenData = JSON.parse(atob(token));
                if (!tokenData.isAdmin || tokenData.exp < Date.now()) {
                    this.handleAdminLogout();
                    return;
                }
            } catch (e) {
                this.handleAdminLogout();
                return;
            }

            // Get all users
            const response = await this.apiService.fetchWithAuth(`${this.apiService.baseUrl}/admin/users`);
            if (!response.ok) {
                if (response.status === 403) {
                    this.handleAdminLogout();
                    return;
                }
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            this.users = data.users || [];
            console.log('Found users:', this.users);

            // Load progress for each user
            for (const user of this.users) {
                const scores = await this.loadUserProgress(user.username);
                this.userScores.set(user.username, scores);
            }

            this.updateStatistics();
            this.updateUserList();
        } catch (error) {
            console.error('Error updating dashboard:', error);
            this.showError('Failed to update dashboard');
        }
    }

    updateStatistics() {
        const today = new Date().toISOString().split('T')[0];
        let totalCompletion = 0;
        let activeUsers = new Set();

        this.users.forEach(user => {
            const scores = this.userScores.get(user.username) || [];
            if (scores.some(score => score.lastActive?.startsWith(today))) {
                activeUsers.add(user.username);
            }

            const userCompletion = this.calculateUserProgress(user);
            totalCompletion += userCompletion;
        });

        // Update statistics display
        document.getElementById('totalUsers').textContent = this.users.length;
        document.getElementById('activeUsers').textContent = activeUsers.size;
        document.getElementById('averageCompletion').textContent = 
            `${this.users.length ? Math.round(totalCompletion / this.users.length) : 0}%`;
    }

    updateUserList() {
        const usersList = document.getElementById('usersList');
        const searchInput = document.getElementById('userSearch').value.toLowerCase();
        const sortBy = document.getElementById('sortBy').value;
        
        let filteredUsers = this.users.filter(user => 
            user.username.toLowerCase().includes(searchInput)
        );

        // Sort users
        filteredUsers.sort((a, b) => {
            switch (sortBy) {
                case 'username-asc':
                    return a.username.localeCompare(b.username);
                case 'username-desc':
                    return b.username.localeCompare(a.username);
                case 'progress-high':
                    return this.calculateUserProgress(b) - this.calculateUserProgress(a);
                case 'progress-low':
                    return this.calculateUserProgress(a) - this.calculateUserProgress(b);
                case 'last-active':
                    return this.getLastActiveDate(b) - this.getLastActiveDate(a);
                default:
                    return 0;
            }
        });

        usersList.innerHTML = '';

        filteredUsers.forEach(user => {
            const scores = this.userScores.get(user.username) || [];
            const card = document.createElement('div');
            card.className = 'user-card';

            const progress = this.calculateUserProgress(user);
            const lastActive = this.getLastActiveDate(user);

            card.innerHTML = `
                <div class="user-header">
                    <h4>${user.username}</h4>
                    <div class="user-stats">
                        <div class="total-score">Overall Progress: ${progress.toFixed(1)}%</div>
                        <div class="last-active">Last Active: ${lastActive ? new Date(lastActive).toLocaleDateString() : 'Never'}</div>
                    </div>
                </div>
                <button class="view-details-btn" onclick="window.adminDashboard.showUserDetails('${user.username}')">
                    View Details
                </button>
            `;

            usersList.appendChild(card);
        });
    }

    calculateUserProgress(user) {
        const scores = this.userScores.get(user.username) || [];
        if (!scores.length) return 0;
        const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
        return Math.round(totalScore / scores.length);
    }

    getLastActiveDate(user) {
        const scores = this.userScores.get(user.username) || [];
        if (!scores.length) return 0;
        return Math.max(...scores.map(score => 
            score.lastActive ? new Date(score.lastActive).getTime() : 0
        ));
    }

    async showUserDetails(username) {
        const scores = this.userScores.get(username) || [];
        const overlay = document.createElement('div');
        overlay.className = 'user-details-overlay';
        
        const content = document.createElement('div');
        content.className = 'user-details-content';
        
        content.innerHTML = `
            <div class="user-details-header">
                <h2>${username}'s Progress</h2>
                <button class="close-button" onclick="this.closest('.user-details-overlay').remove()">×</button>
            </div>
            <div class="user-details-body">
                <div class="quiz-progress-list">
                    ${scores.map(score => `
                        <div class="quiz-progress-item">
                            <div class="quiz-info">
                                <h3>${this.getQuizDisplayName(score.quizName)}</h3>
                                <div class="progress-details">
                                    <span class="score">${score.score}% Complete</span>
                                    <span class="questions">Questions: ${score.questionsAnswered}/15</span>
                                    <span class="last-active">Last Active: ${new Date(score.lastActive).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button class="reset-button" onclick="window.adminDashboard.resetUserProgress('${username}', '${score.quizName}')">
                                Reset Progress
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
    }

    getQuizDisplayName(quizId) {
        const displayNames = {
            'communication': 'Communication',
            'initiative': 'Initiative',
            'time-management': 'Time Management',
            'tester-mindset': 'Tester Mindset',
            'risk-analysis': 'Risk Analysis',
            'risk-management': 'Risk Management',
            'non-functional': 'Non-functional Testing',
            'test-support': 'Test Support',
            'issue-verification': 'Issue Verification',
            'build-verification': 'Build Verification',
            'issue-tracking': 'Issue Tracking Tools',
            'raising-tickets': 'Raising Tickets',
            'reports': 'Reports',
            'CMS-Testing': 'CMS Testing'
        };
        return displayNames[quizId] || quizId;
    }

    async resetUserProgress(username, quizName) {
        try {
            const response = await this.apiService.fetchWithAuth(
                `${this.apiService.baseUrl}/users/${username}/reset-quiz/${quizName}`,
                { method: 'POST' }
            );
            
            if (response.ok) {
                this.showError(`Successfully reset ${quizName} for ${username}`);
                await this.updateDashboard();
            } else {
                this.showError('Failed to reset quiz progress');
            }
        } catch (error) {
            console.error('Error resetting progress:', error);
            this.showError('Failed to reset quiz progress');
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

// Initialize the dashboard and expose it to the window
window.adminDashboard = new AdminDashboard();

// Expose functions to window for onclick handlers
window.handleAdminLogin = () => window.adminDashboard.handleAdminLogin();
window.handleAdminLogout = () => window.adminDashboard.handleAdminLogout(); 