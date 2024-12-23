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
                try {
                    // First, get an API token
                    const response = await fetch(`${this.apiService.baseUrl}/admin/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username, password })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to authenticate with API');
                    }

                    const data = await response.json();
                    
                    // Store both the API token and admin flag
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('refreshToken', data.refreshToken);
                    localStorage.setItem('isAdmin', 'true');
                    window.location.href = './admin.html';
                } catch (error) {
                    console.error('API authentication error:', error);
                    this.showError('Failed to authenticate with the server');
                }
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
                const response = await this.apiService.fetchWithAuth(
                    `${this.apiService.baseUrl}/admin/users/${username}/quiz-progress/${quizId}`
                );

                if (response.ok) {
                    const progress = await response.json();
                    if (progress && progress.data) {
                        // Calculate progress based on quiz results if available
                        let score = 0;
                        let questionsAnswered = 0;
                        
                        if (progress.data.questionHistory) {
                            questionsAnswered = progress.data.questionHistory.length;
                            // Calculate score based on experience points if available
                            if (progress.data.experience) {
                                score = Math.round((progress.data.experience / 300) * 100); // 300 is max XP
                            } else {
                                score = Math.round((questionsAnswered / 15) * 100); // 15 is total questions
                            }
                        }
                        
                        scores.push({
                            quizName: quizId,
                            score: score,
                            questionsAnswered: questionsAnswered,
                            completedAt: progress.data.lastUpdated || null,
                            lastActive: progress.data.lastUpdated || null,
                            experience: progress.data.experience || 0
                        });
                    }
                }
            } catch (error) {
                console.error(`Error loading progress for ${quizId}:`, error);
            }
        }
        
        return scores;
    }

    async showAdminDashboard() {
        // No need to hide/show forms since we're on a different page
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

            try {
                // Use the correct admin endpoint for fetching users
                const response = await this.apiService.fetchWithAuth(
                    `${this.apiService.baseUrl}/admin/users`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                if (data.success && Array.isArray(data.users)) {
                    this.users = data.users;
                    console.log('Found users:', this.users);

                    // Update the display first with basic user info
                    this.updateStatistics();
                    this.updateUserList();

                    // Then load progress in the background
                    console.log('Loading user progress...');
                    for (const user of this.users) {
                        try {
                            const scores = await this.loadUserProgress(user.username);
                            this.userScores.set(user.username, scores);
                            // Update the display after each user's progress is loaded
                            this.updateUserList();
                        } catch (error) {
                            console.error(`Error loading progress for ${user.username}:`, error);
                            // Continue with other users even if one fails
                        }
                    }
                } else {
                    console.error('Invalid user data format:', data);
                    this.showError('Failed to load user data');
                }
            } catch (error) {
                console.error('Error fetching users:', error);
                this.showError('Failed to fetch user data');
            }
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
        const totalUsersElement = document.getElementById('totalUsers');
        const activeUsersElement = document.getElementById('activeUsers');
        const averageCompletionElement = document.getElementById('averageCompletion');

        if (totalUsersElement) totalUsersElement.textContent = this.users.length;
        if (activeUsersElement) activeUsersElement.textContent = activeUsers.size;
        if (averageCompletionElement) {
            averageCompletionElement.textContent = 
                `${this.users.length ? Math.round(totalCompletion / this.users.length) : 0}%`;
        }
    }

    updateUserList() {
        console.log('Updating user list...');
        const usersList = document.getElementById('usersList');
        if (!usersList) {
            console.error('usersList element not found!');
            return;
        }

        const searchInput = document.getElementById('userSearch')?.value.toLowerCase() || '';
        const sortBy = document.getElementById('sortBy')?.value || 'username-asc';
        
        console.log('Filtering users with search:', searchInput);
        let filteredUsers = this.users.filter(user => 
            user.username.toLowerCase().includes(searchInput)
        );

        console.log('Sorting users by:', sortBy);
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

        console.log('Clearing existing user list');
        usersList.innerHTML = '';

        console.log('Creating user cards for', filteredUsers.length, 'users');
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
        console.log('User list update complete');
    }

    calculateUserProgress(user) {
        const scores = this.userScores.get(user.username) || [];
        if (!scores.length) return 0;
        
        // Calculate total progress across all quizzes
        const completedQuizzes = scores.filter(score => score.score > 0);
        if (completedQuizzes.length === 0) return 0;
        
        const totalProgress = completedQuizzes.reduce((sum, score) => sum + score.score, 0);
        return Math.round(totalProgress / completedQuizzes.length);
    }

    getLastActiveDate(user) {
        const scores = this.userScores.get(user.username) || [];
        if (!scores.length) return 0;
        
        // Find the most recent activity date
        const activeDates = scores
            .map(score => score.lastActive)
            .filter(date => date) // Remove null/undefined dates
            .map(date => new Date(date).getTime());
            
        return activeDates.length > 0 ? Math.max(...activeDates) : 0;
    }

    async showUserDetails(username) {
        const scores = this.userScores.get(username) || [];
        const overlay = document.createElement('div');
        overlay.className = 'user-details-overlay';
        
        const content = document.createElement('div');
        content.className = 'user-details-content';
        
        // Sort quizzes by completion percentage
        const sortedScores = [...scores].sort((a, b) => b.score - a.score);
        
        content.innerHTML = `
            <div class="user-details-header">
                <h2>${username}'s Progress</h2>
                <button class="close-button" onclick="this.closest('.user-details-overlay').remove()">×</button>
            </div>
            <div class="user-details-body">
                <div class="quiz-progress-list">
                    ${sortedScores.length > 0 ? sortedScores.map(score => `
                        <div class="quiz-progress-item">
                            <div class="quiz-info">
                                <h3>${this.getQuizDisplayName(score.quizName)}</h3>
                                <div class="progress-details">
                                    <span class="score">Progress: ${score.score}%</span>
                                    <span class="questions">Questions Completed: ${score.questionsAnswered}/15</span>
                                    <span class="experience">XP Earned: ${score.experience}/300</span>
                                    ${score.lastActive ? 
                                        `<span class="last-active">Last Active: ${new Date(score.lastActive).toLocaleDateString()}</span>` :
                                        '<span class="last-active">Not Started</span>'
                                    }
                                </div>
                            </div>
                            <button class="reset-button" onclick="window.adminDashboard.resetUserProgress('${username}', '${score.quizName}')">
                                Reset Progress
                            </button>
                        </div>
                    `).join('') : '<p>No quiz progress found</p>'}
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
                `${this.apiService.baseUrl}/admin/users/${username}/quiz-progress/${quizName}/reset`,
                { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to reset quiz progress');
            }

            this.showError(`Successfully reset ${quizName} for ${username}`);
            await this.updateDashboard(); // Refresh the dashboard
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