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
        // Get all quiz types
        const quizTypes = [
            'communication', 'initiative', 'time-management', 'tester-mindset',
            'risk-analysis', 'risk-management', 'non-functional', 'test-support',
            'issue-verification', 'build-verification', 'issue-tracking',
            'raising-tickets', 'reports', 'CMS-Testing'
        ];
        
        // Initialize scores for all quiz types
        const scores = quizTypes.map(quizId => ({
            quizName: quizId,
            score: 0,
            questionsAnswered: 0,
            completedAt: null,
            lastActive: null,
            experience: 0
        }));

        try {
            // Find the user in our users array
            const user = this.users.find(u => u.username === username);
            if (!user) return scores;

            // Update scores with actual progress from user data
            if (user.quizResults && Array.isArray(user.quizResults)) {
                user.quizResults.forEach(result => {
                    const scoreIndex = scores.findIndex(s => s.quizName === result.quizName);
                    if (scoreIndex !== -1) {
                        scores[scoreIndex] = {
                            ...scores[scoreIndex],
                            score: result.score || 0,
                            completedAt: result.completedAt || null,
                            lastActive: result.lastActive || result.completedAt || null
                        };
                    }
                });
            }

            // Update with quiz progress if available
            if (user.quizProgress) {
                Object.entries(user.quizProgress).forEach(([quizName, progress]) => {
                    const scoreIndex = scores.findIndex(s => s.quizName === quizName);
                    if (scoreIndex !== -1 && progress) {
                        const questionsAnswered = progress.questionHistory ? progress.questionHistory.length : 0;
                        const experience = progress.experience || 0;
                        scores[scoreIndex] = {
                            ...scores[scoreIndex],
                            questionsAnswered,
                            experience,
                            lastActive: progress.lastUpdated || scores[scoreIndex].lastActive,
                            score: Math.max(
                                scores[scoreIndex].score,
                                experience ? Math.round((experience / 300) * 100) : Math.round((questionsAnswered / 15) * 100)
                            )
                        };
                    }
                });
            }
        } catch (error) {
            console.error(`Error loading progress for ${username}:`, error);
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
            const completedQuizzes = scores.filter(score => score.score > 0).length;
            const totalQuizzes = scores.length;

            card.innerHTML = `
                <div class="user-header">
                    <h4>${user.username}</h4>
                    <div class="user-stats">
                        <div class="total-score">Overall Progress: ${progress.toFixed(1)}%</div>
                        <div class="quiz-completion">Completed Quizzes: ${completedQuizzes}/${totalQuizzes}</div>
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
        
        // Calculate average progress across all quizzes
        const totalProgress = scores.reduce((sum, score) => sum + score.score, 0);
        return Math.round(totalProgress / scores.length);
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
                    ${sortedScores.map(score => {
                        // Calculate questions completed based on progress percentage
                        const questionsCompleted = Math.round((score.score / 100) * 15);
                        // Calculate XP earned based on progress percentage
                        const xpEarned = Math.round((score.score / 100) * 300);
                        
                        return `
                            <div class="quiz-progress-item ${score.score > 0 ? 'started' : 'not-started'}">
                                <div class="quiz-info">
                                    <h3>${this.getQuizDisplayName(score.quizName)}</h3>
                                    <div class="progress-details">
                                        <span class="score">Progress: ${Math.round(score.score)}%</span>
                                        <span class="questions">Questions Completed: ${questionsCompleted}/15</span>
                                        <span class="experience">XP Earned: ${xpEarned}/300</span>
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
                        `;
                    }).join('')}
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
            // First, update the user's quiz progress in the database
            const response = await this.apiService.fetchWithAuth(
                `${this.apiService.baseUrl}/users/${username}/quiz-progress`,
                { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        quizName: quizName,
                        progress: {
                            experience: 0,
                            questionHistory: [],
                            lastUpdated: new Date().toISOString()
                        }
                    })
                }
            );
            
            // Read the response body once
            let responseBody;
            try {
                responseBody = await response.text();
            } catch (e) {
                console.error('Failed to read response:', e);
                responseBody = '';
            }

            if (!response.ok) {
                let errorMessage = 'Failed to reset quiz progress';
                try {
                    // Try to parse the response as JSON
                    const errorData = JSON.parse(responseBody);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // If not JSON, log the raw response
                    console.error('Non-JSON error response:', responseBody);
                }
                throw new Error(errorMessage);
            }

            // Find and update the user in our users array
            const userIndex = this.users.findIndex(u => u.username === username);
            if (userIndex !== -1) {
                // Reset quiz progress
                if (!this.users[userIndex].quizProgress) {
                    this.users[userIndex].quizProgress = {};
                }
                this.users[userIndex].quizProgress[quizName] = {
                    experience: 0,
                    questionHistory: [],
                    lastUpdated: new Date().toISOString()
                };

                // Reset quiz results
                if (!this.users[userIndex].quizResults) {
                    this.users[userIndex].quizResults = [];
                }
                const resultIndex = this.users[userIndex].quizResults.findIndex(r => r.quizName === quizName);
                if (resultIndex !== -1) {
                    this.users[userIndex].quizResults.splice(resultIndex, 1);
                }

                // Also reset quiz score
                try {
                    await this.apiService.fetchWithAuth(
                        `${this.apiService.baseUrl}/users/${username}/quiz-scores`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                quizName: quizName,
                                score: 0
                            })
                        }
                    );
                } catch (error) {
                    console.error('Error resetting quiz score:', error);
                }
            }

            // Update local state
            const scores = this.userScores.get(username) || [];
            const scoreIndex = scores.findIndex(s => s.quizName === quizName);
            if (scoreIndex !== -1) {
                scores[scoreIndex] = {
                    ...scores[scoreIndex],
                    score: 0,
                    questionsAnswered: 0,
                    completedAt: null,
                    lastActive: new Date().toISOString(),
                    experience: 0
                };
                this.userScores.set(username, scores);
            }

            // Update the UI
            this.updateUserList();
            this.showError(`Successfully reset ${this.getQuizDisplayName(quizName)} for ${username}`);
            
            // Close the current details overlay and show updated details
            const existingOverlay = document.querySelector('.user-details-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
                this.showUserDetails(username);
            }

            // Refresh the user data from server
            await this.updateDashboard();
        } catch (error) {
            console.error('Error resetting progress:', error);
            this.showError(`Failed to reset progress: ${error.message}`);
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