import { APIService } from './api-service.js';

// Export the AdminDashboard class
export class AdminDashboard {
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
            const adminToken = localStorage.getItem('adminToken');
            
            if (adminToken) {
                try {
                    // Verify token locally
                    const tokenData = JSON.parse(atob(adminToken));
                    if (!tokenData.isAdmin || tokenData.exp < Date.now() / 1000) {
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
        const adminToken = localStorage.getItem('adminToken');
        
        // Check if we're on the login page
        if (window.location.pathname.includes('admin-login.html')) {
            if (this.verifyAdminToken(adminToken)) {
                // If already logged in as admin, redirect to admin dashboard
                window.location.href = '/pages/admin.html';
                return;
            }
        } else if (window.location.pathname.includes('admin.html')) {
            if (!this.verifyAdminToken(adminToken)) {
                // If not logged in as admin, redirect to login page
                window.location.href = '/pages/admin-login.html';
                return;
            }
            await this.showAdminDashboard();
            
            // Add event listeners for dashboard
            document.getElementById('userSearch').addEventListener('input', this.debounce(this.updateDashboard.bind(this), 300));
            document.getElementById('sortBy').addEventListener('change', this.updateDashboard.bind(this));
        }
    }

    verifyAdminToken(token) {
        if (!token) return false;
        
        try {
            const tokenData = JSON.parse(atob(token));
            return tokenData.isAdmin && tokenData.exp > Date.now() / 1000;
        } catch (error) {
            console.error('Admin token verification failed:', error);
            return false;
        }
    }

    async handleAdminLogin() {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        try {
            const response = await fetch(`${this.apiService.baseUrl}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error('Invalid admin credentials');
            }

            const data = await response.json();
            
            if (data.success && data.token && data.isAdmin) {
                // Store admin token
                localStorage.setItem('adminToken', data.token);
                window.location.href = '/pages/admin.html';
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
            localStorage.removeItem('adminToken');
            window.location.href = '/pages/admin-login.html';
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
        // Get all quiz types with correct names matching the quiz files
        const quizTypes = [
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
            'CMS-Testing'
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

            // Get user progress using admin auth
            const response = await this.apiService.fetchWithAdminAuth(
                `${this.apiService.baseUrl}/admin/users/${username}/progress`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch user progress');
            }

            const data = await response.json();
            
            // Update scores with actual progress from user data
            if (data.quizResults && Array.isArray(data.quizResults)) {
                data.quizResults.forEach(result => {
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
            if (data.quizProgress) {
                Object.entries(data.quizProgress).forEach(([quizName, progress]) => {
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

            this.userScores.set(username, scores);
            return scores;
        } catch (error) {
            console.error(`Error loading progress for ${username}:`, error);
            return scores;
        }
    }

    async showAdminDashboard() {
        // No need to hide/show forms since we're on a different page
        await this.updateDashboard();
    }

    async updateDashboard() {
        try {
            const adminToken = localStorage.getItem('adminToken');
            
            if (!adminToken) {
                this.handleAdminLogout();
                return;
            }

            try {
                // Use the admin-specific fetch method
                const response = await this.apiService.fetchWithAdminAuth(
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
        console.log('User scores for', username, ':', scores); // Debug log
        
        const overlay = document.createElement('div');
        overlay.className = 'user-details-overlay';
        
        const content = document.createElement('div');
        content.className = 'user-details-content';
        
        // Sort quizzes by completion percentage
        const sortedScores = [...scores].sort((a, b) => b.score - a.score);
        console.log('Sorted scores:', sortedScores); // Debug log
        
        content.innerHTML = `
            <div class="user-details-header">
                <h2>${username}'s Progress</h2>
                <button class="close-button" onclick="this.closest('.user-details-overlay').remove()">×</button>
            </div>
            <div class="user-details-body">
                <div class="quiz-progress-list">
                    ${sortedScores.map(score => {
                        // Debug log for each quiz
                        console.log(`Processing quiz: ${score.quizName}`, score);
                        
                        // Calculate questions completed based on progress percentage
                        const questionsCompleted = Math.round((score.score / 100) * 15);
                        // Calculate XP earned based on progress percentage
                        const xpEarned = Math.round((score.score / 100) * 300);
                        
                        return `
                            <div class="quiz-progress-item ${score.score > 0 ? 'started' : 'not-started'}" data-quiz="${score.quizName}">
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
            'issue-tracking-tools': 'Issue Tracking Tools',
            'raising-tickets': 'Raising Tickets',
            'reports': 'Reports',
            'CMS-Testing': 'CMS Testing'
        };
        
        // Debug log for quiz name mapping
        console.log(`Getting display name for quiz: ${quizId} -> ${displayNames[quizId] || quizId}`);
        
        return displayNames[quizId] || quizId;
    }

    async resetUserProgress(username, quizName) {
        try {
            // Reset only the specific quiz progress
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
                let errorMessage = 'Failed to reset quiz progress';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // If response isn't JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            // Update local state for the specific user and quiz
            const userIndex = this.users.findIndex(u => u.username === username);
            if (userIndex !== -1) {
                const user = this.users[userIndex];
                
                // Reset only the specific quiz progress
                if (!user.quizProgress) {
                    user.quizProgress = {};
                }
                user.quizProgress[quizName] = {
                    experience: 0,
                    questionHistory: [],
                    lastUpdated: new Date().toISOString()
                };

                // Remove only the specific quiz result
                if (user.quizResults) {
                    user.quizResults = user.quizResults.filter(
                        result => result.quizName !== quizName
                    );
                }
            }

            // Update userScores for the specific quiz only
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

            // Clear only the specific quiz progress from local storage
            localStorage.removeItem(`quiz_progress_${username}_${quizName}`);

            // Update UI
            this.updateUserList();
            this.showError(`Successfully reset ${this.getQuizDisplayName(quizName)} for ${username}`);
            
            // Refresh the details view
            const existingOverlay = document.querySelector('.user-details-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
                this.showUserDetails(username);
            }

            // Refresh only the affected user's data
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

// Initialize the dashboard only if we're on the admin panel page
if (window.location.pathname.includes('/pages/admin.html')) {
    window.adminDashboard = new AdminDashboard();
}

// Export these functions for direct use in HTML
export const handleAdminLogin = async () => {
    if (!window.adminDashboard) {
        window.adminDashboard = new AdminDashboard();
    }
    await window.adminDashboard.handleAdminLogin();
};

export const handleAdminLogout = () => {
    if (window.adminDashboard) {
        window.adminDashboard.handleAdminLogout();
    }
}; 