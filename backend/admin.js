// admin.js
class AdminDashboard {
    constructor() {
        this.users = [];
        this.adminToken = localStorage.getItem('adminToken');
        
        // Wait for DOM to be fully loaded before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        // Check if we're on the login page
        if (window.location.pathname.includes('admin-login.html')) {
            this.setupLoginHandler();
        } else {
            if (!this.checkAdminAuth()) return;
            this.initializeEventListeners();
            this.loadUsers();
        }
    }

    setupLoginHandler() {
        const form = document.getElementById('adminLoginForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }
    }

    async handleLogin() {
        try {
            const usernameInput = document.getElementById('adminUsername');
            const passwordInput = document.getElementById('adminPassword');

            if (!usernameInput || !passwordInput) {
                throw new Error('Login form elements not found');
            }

            const username = usernameInput.value;
            const password = passwordInput.value;

            // For demo purposes, hardcoded admin credentials
            if (username === 'admin' && password === 'admin123') {
                this.adminToken = 'admin_token';
                localStorage.setItem('adminToken', this.adminToken);
                window.location.href = 'admin.html';
            } else {
                throw new Error('Invalid admin credentials');
            }
        } catch (error) {
            alert(error.message);
        }
    }

    handleLogout() {
        localStorage.removeItem('adminToken');
        window.location.href = window.location.pathname.includes('/pages/') ? 'admin-login.html' : 'pages/admin-login.html';
    }

    checkAdminAuth() {
        if (!this.adminToken) {
            window.location.href = window.location.pathname.includes('/pages/') ? 'admin-login.html' : 'pages/admin-login.html';
            return false;
        }
        return true;
    }

    initializeEventListeners() {
        const searchInput = document.getElementById('userSearch');
        const sortSelect = document.getElementById('sortBy');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterUsers(e.target.value);
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortUsers(e.target.value);
            });
        }
    }

    async loadUsers() {
        try {
            this.users = await this.fetchUsers();
            this.updateStats();
            this.renderUserTable();
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    updateStats() {
        const totalUsersElement = document.getElementById('totalUsers');
        const activeUsersElement = document.getElementById('activeUsers');
        const avgCompletionElement = document.getElementById('avgCompletion');

        if (!totalUsersElement || !activeUsersElement || !avgCompletionElement) {
            console.error('Stats elements not found');
            return;
        }

        const totalUsers = this.users.length;
        
        // Calculate active users in the last 24 hours
        const now = new Date();
        const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
        const activeToday = this.users.filter(user => {
            const lastActive = new Date(user.lastActive || 0);
            return lastActive >= twentyFourHoursAgo;
        }).length;

        const totalProgress = this.users.reduce((sum, user) => sum + this.calculateOverallProgress(user), 0);
        const avgProgress = totalUsers > 0 ? Math.round(totalProgress / totalUsers) : 0;

        totalUsersElement.textContent = totalUsers;
        activeUsersElement.textContent = activeToday;
        avgCompletionElement.textContent = `${avgProgress}%`;
    }

    async fetchUsers() {
        const users = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('user_')) {
                try {
                    const userData = JSON.parse(localStorage.getItem(key));
                    if (userData) {
                        // Ensure quizResults is always an array
                        userData.quizResults = Array.isArray(userData.quizResults) ? 
                            userData.quizResults : 
                            Object.entries(userData.quizResults || {}).map(([quizName, data]) => ({
                                quizName,
                                score: data.score || 0,
                                completedAt: data.completedAt || new Date().toISOString()
                            }));
                        users.push(userData);
                    }
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
        }
        return users;
    }

    renderUserTable() {
        const tbody = document.getElementById('userTableBody');
        if (!tbody) {
            console.error('User table body element not found');
            return;
        }

        tbody.innerHTML = '';

        this.users.forEach(user => {
            const tr = document.createElement('tr');
            const progress = this.calculateOverallProgress(user);
            
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>
                    <div class="user-progress">
                        <div class="progress-bar-small">
                            <div class="progress-fill-small" style="width: ${progress}%"></div>
                        </div>
                        <span>${progress}%</span>
                    </div>
                </td>
                <td>${this.formatDate(user.lastActive)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-button view-button" onclick="dashboard.viewUserDetails('${user.username}')">
                            View
                        </button>
                        <button class="action-button reset-button" onclick="dashboard.resetUserProgress('${user.username}')">
                            Reset
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
    }

    calculateOverallProgress(user) {
        if (!user || !user.quizResults || !Array.isArray(user.quizResults) || user.quizResults.length === 0) return 0;
        
        // Total number of available quizzes
        const totalQuizzes = 11; // Based on the current quiz structure in index.html
        
        // Count completed quizzes
        const completedQuizzes = user.quizResults.length;
        
        // Calculate overall progress as a percentage of completed quizzes
        return Math.round((completedQuizzes / totalQuizzes) * 100);
    }

    formatDate(date) {
        if (!date) return 'Never';
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Never';

        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;

        return d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    viewUserDetails(username) {
        const user = this.users.find(u => u.username === username);
        if (!user) return;

        const panel = document.getElementById('userDetailsPanel');
        const content = document.getElementById('userDetailsContent');
        if (!panel || !content) return;

        content.innerHTML = `
            <div class="user-details-content">
                <h4>${user.username}'s Details</h4>
                <p>Last Active: ${this.formatDate(user.lastActive)}</p>
                <p>Overall Progress: ${this.calculateOverallProgress(user)}%</p>
                <div class="quiz-results">
                    <h5>Quiz Results</h5>
                    ${this.renderQuizResults(user)}
                </div>
            </div>
        `;

        panel.classList.remove('hidden');
    }

    renderQuizResults(user) {
        if (!user.quizResults || user.quizResults.length === 0) {
            return '<p>No quizzes completed yet.</p>';
        }

        const quizCategories = {
            'Personal Organisation': [
                { display: 'Communication Skills', key: 'communication' },
                { display: 'Initiative', key: 'initiative' },
                { display: 'Tester Mindset', key: 'tester-mindset' },
                { display: 'Time Management', key: 'time-management' }
            ],
            'Risk Management': [
                { display: 'Risk Analysis', key: 'risk-analysis' },
                { display: 'Risk Management', key: 'risk-management' }
            ],
            'Test Execution': [
                { display: 'Non-functional Testing', key: 'non-functional' },
                { display: 'Test Support', key: 'test-support' },
                { display: 'Issue Verification', key: 'issue-verification' }
            ],
            'Tickets and Tracking': [
                { display: 'Issue Tracking Tools', key: 'issue-tracking' },
                { display: 'Raising Tickets', key: 'raising-tickets' },
                { display: 'Reports', key: 'reports' }
            ]
        };

        let html = '';
        for (const [category, quizzes] of Object.entries(quizCategories)) {
            const categoryResults = quizzes.map(quiz => {
                const result = user.quizResults.find(r => r.quizName === quiz.key);
                return {
                    quizName: quiz.display,
                    status: result ? 'Completed' : 'Not Started',
                    score: result ? result.score : 0,
                    completedAt: result ? result.completedAt : null
                };
            });

            html += `
                <div class="quiz-category">
                    <h6>${category}</h6>
                    <table class="quiz-results-table">
                        <thead>
                            <tr>
                                <th>Quiz</th>
                                <th>Status</th>
                                <th>Score</th>
                                <th>Completed</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${categoryResults.map(result => `
                                <tr>
                                    <td>${result.quizName}</td>
                                    <td>${result.status}</td>
                                    <td>${result.score}%</td>
                                    <td>${result.completedAt ? this.formatDate(result.completedAt) : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        return html;
    }

    closeUserDetails() {
        const panel = document.getElementById('userDetailsPanel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    resetUserProgress(username) {
        const confirmed = confirm(`Are you sure you want to reset progress for ${username}?`);
        if (!confirmed) return;

        const userKey = `user_${username}`;
        const userData = localStorage.getItem(userKey);
        
        if (userData) {
            try {
                const user = JSON.parse(userData);
                user.quizResults = [];
                localStorage.setItem(userKey, JSON.stringify(user));
                this.loadUsers(); // Refresh the display
                alert(`Progress reset for ${username}`);
            } catch (error) {
                console.error('Error resetting user progress:', error);
                alert('Failed to reset user progress');
            }
        }
    }

    filterUsers(searchTerm) {
        const tbody = document.getElementById('userTableBody');
        if (!tbody) return;

        const term = searchTerm.toLowerCase();
        const rows = tbody.getElementsByTagName('tr');

        for (const row of rows) {
            const username = row.cells[0].textContent.toLowerCase();
            row.style.display = username.includes(term) ? '' : 'none';
        }
    }

    sortUsers(sortBy) {
        const tbody = document.getElementById('userTableBody');
        if (!tbody) return;

        const sortedUsers = [...this.users].sort((a, b) => {
            switch (sortBy) {
                case 'username':
                    return a.username.localeCompare(b.username);
                case 'progress':
                    return this.calculateOverallProgress(b) - this.calculateOverallProgress(a);
                case 'lastActive':
                    return new Date(b.lastActive || 0) - new Date(a.lastActive || 0);
                default:
                    return 0;
            }
        });

        this.users = sortedUsers;
        this.renderUserTable();
    }
}

// Initialize the dashboard when the page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new AdminDashboard();
});