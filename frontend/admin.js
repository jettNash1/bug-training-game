class AdminDashboard {
    constructor() {
        this.init();
    }

    async init() {
        console.log('Initializing AdminDashboard');
        console.log('Current path:', window.location.pathname);
        
        if (window.location.pathname.includes('admin-login.html')) {
            console.log('Setting up login handler');
            this.setupLoginHandler();
        } else if (window.location.pathname.includes('admin.html')) {
            if (!this.checkAdminAuth()) {
                console.log('No auth token found, redirecting to login');
                window.location.href = 'admin-login.html';
                return;
            }
            this.initializeDashboard();
        }
    }

    handleLogin(username, password) {
        // Hardcoded admin credentials
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('adminToken', 'admin_authenticated');
            window.location.href = 'admin.html';
            return true;
        }
        return false;
    }

    setupLoginHandler() {
        const form = document.getElementById('adminLoginForm');
        if (!form) {
            console.error('Login form not found!');
            return;
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;

            if (!username || !password) {
                alert('Please enter both username and password');
                return;
            }

            const success = this.handleLogin(username, password);
            if (!success) {
                alert('Invalid admin credentials');
            }
        });
    }

    checkAdminAuth() {
        const token = localStorage.getItem('adminToken');
        return token === 'admin_authenticated';
    }

    initializeDashboard() {
        console.log('Initializing dashboard');
        this.loadUserStats();
        this.loadUserList();
    }

    loadUserStats() {
        const users = this.getAllUsers();
        const totalUsers = users.length;
        const activeToday = this.getActiveUsers(users);
        const avgCompletion = this.getAverageCompletion(users);

        // Update stats in the dashboard
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('activeUsers').textContent = activeToday;
        document.getElementById('avgCompletion').textContent = `${avgCompletion}%`;
    }

    loadUserList() {
        const users = this.getAllUsers();
        const tbody = document.getElementById('userTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        users.forEach(user => {
            const progress = this.calculateUserProgress(user);
            const tr = document.createElement('tr');
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
                <td>${this.formatDate(user.lastLogin || 'Never')}</td>
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

    getAllUsers() {
        const users = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('quizUser_') || key.startsWith('user_'))) {
                try {
                    const userData = JSON.parse(localStorage.getItem(key));
                    if (userData) {
                        if (!userData.quizResults) {
                            userData.quizResults = [];
                        }
                        if (userData.lastActive && !userData.lastLogin) {
                            userData.lastLogin = userData.lastActive;
                        }
                        users.push(userData);
                    }
                } catch (error) {
                    console.error('Error parsing user data:', error, key);
                }
            }
        }
        console.log('Found users:', users);
        return users;
    }

    getActiveUsers(users) {
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        return users.filter(user => {
            const lastActive = new Date(user.lastLogin || 0).getTime();
            return lastActive > twentyFourHoursAgo;
        }).length;
    }

    getAverageCompletion(users) {
        if (!users.length) return 0;
        const totalProgress = users.reduce((sum, user) => sum + this.calculateUserProgress(user), 0);
        return Math.round(totalProgress / users.length);
    }

    calculateUserProgress(user) {
        if (!user || !user.quizResults) return 0;
        
        let completedQuizzes;
        if (Array.isArray(user.quizResults)) {
            completedQuizzes = user.quizResults.length;
        } else {
            completedQuizzes = Object.keys(user.quizResults).length;
        }
        
        const totalQuizzes = 11;
        return Math.round((completedQuizzes / totalQuizzes) * 100);
    }

    viewUserDetails(username) {
        const users = this.getAllUsers();
        const user = users.find(u => u.username === username);
        if (!user) return;

        const panel = document.getElementById('userDetailsPanel');
        const content = document.getElementById('userDetailsContent');
        if (!panel || !content) return;

        content.innerHTML = this.generateUserDetailsHTML(user);
        panel.classList.remove('hidden');
    }

    generateUserDetailsHTML(user) {
        return `
            <div class="user-details-content">
                <h4>${user.username}'s Details</h4>
                <p>Last Active: ${this.formatDate(user.lastLogin || 'Never')}</p>
                <p>Overall Progress: ${this.calculateUserProgress(user)}%</p>
                <div class="quiz-results">
                    <h5>Quiz Results</h5>
                    ${this.generateQuizResultsHTML(user)}
                </div>
            </div>
        `;
    }

    generateQuizResultsHTML(user) {
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
                            ${quizzes.map(quiz => {
                                let result;
                                if (Array.isArray(user.quizResults)) {
                                    result = user.quizResults.find(r => r.quizName === quiz.key);
                                } else {
                                    result = user.quizResults[quiz.key];
                                }
                                return `
                                    <tr>
                                        <td>${quiz.display}</td>
                                        <td>${result ? 'Completed' : 'Not Started'}</td>
                                        <td>${result ? result.score + '%' : '-'}</td>
                                        <td>${result ? this.formatDate(result.completedAt) : '-'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        return html || '<p>No quizzes completed yet.</p>';
    }

    formatDate(date) {
        if (!date || date === 'Never') return 'Never';
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
            year: 'numeric'
        });
    }

    resetUserProgress(username) {
        if (!confirm(`Are you sure you want to reset progress for ${username}?`)) return;
        
        const key = `quizUser_${username}`;
        const userData = localStorage.getItem(key);
        if (userData) {
            try {
                const user = JSON.parse(userData);
                user.quizResults = [];
                localStorage.setItem(key, JSON.stringify(user));
                this.loadUserStats();
                this.loadUserList();
                alert(`Progress reset for ${username}`);
            } catch (error) {
                console.error('Error resetting user progress:', error);
                alert('Failed to reset user progress');
            }
        }
    }

    handleLogout() {
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing AdminDashboard');
    window.dashboard = new AdminDashboard();
}); 