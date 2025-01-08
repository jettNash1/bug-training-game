import { APIService } from './api-service.js';

export class AdminDashboard {
    constructor() {
        this.apiService = new APIService();
        this.users = [];
        this.userScores = new Map();
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
        this.init();
    }

    async init() {
        console.log('Initializing AdminDashboard');
        const adminToken = localStorage.getItem('adminToken');
        const currentPath = window.location.pathname;
        
        // Only verify token if we're on admin pages
        if (currentPath.includes('admin')) {
            const isTokenValid = await this.verifyAdminToken(adminToken);
            
            if (currentPath.includes('admin-login.html')) {
                if (isTokenValid) {
                    window.location.href = '/pages/admin.html';
                    return;
                }
            } else if (currentPath.includes('admin.html')) {
                if (!isTokenValid) {
                    window.location.href = '/pages/admin-login.html';
                    return;
                }
                await this.loadDashboard();
            }
        }
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

            if (!response.ok) return false;

            const data = await response.json();
            return data.success && data.valid && data.isAdmin;
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

            const data = await response.json();
            
            if (data.success && data.token && data.isAdmin) {
                localStorage.setItem('adminToken', data.token);
                window.location.href = '/pages/admin.html';
            } else {
                this.showError(data.message || 'Invalid admin credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please try again.');
        }
    }

    async handleAdminLogout() {
        localStorage.removeItem('adminToken');
        window.location.href = '/pages/admin-login.html';
    }

    async loadDashboard() {
        try {
            await this.loadUsers();
            this.setupEventListeners();
            this.updateDashboard();
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            this.showError('Failed to load dashboard');
        }
    }

    async loadUsers() {
        try {
            const response = await fetch(`${this.apiService.baseUrl}/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to load users');
            }

            this.users = data.data;
            
            // Load progress for each user
            for (const user of this.users) {
                const scores = await this.loadUserProgress(user.username);
                this.userScores.set(user.username, scores);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            this.users = [];
        }
    }

    async loadUserProgress(username) {
        try {
            // Fetch all quiz results for the user
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
            console.log('Raw quiz results:', data); // Debug log

            if (!data.success) {
                return [];
            }

            // Initialize scores for all quiz types
            const scores = this.quizTypes.map(quizName => ({
                quizName,
                score: 0,
                experience: 0,
                questionsAnswered: 0,
                questionHistory: [],
                lastActive: null
            }));

            // Handle both single quiz result and array of results
            if (data.data) {
                // Ensure we have an array of results
                const quizResults = Array.isArray(data.data) ? data.data : [data.data];
                console.log('Processing quiz results:', quizResults); // Debug log

                // Process each quiz result
                quizResults.forEach(quizData => {
                    // Find the matching quiz type
                    const normalizedQuizName = this.normalizeQuizName(quizData.quizName || '');
                    const scoreIndex = scores.findIndex(s => 
                        this.normalizeQuizName(s.quizName) === normalizedQuizName
                    );

                    if (scoreIndex !== -1) {
                        scores[scoreIndex] = {
                            ...scores[scoreIndex],
                            score: Math.round((quizData.experience / 300) * 100),
                            experience: quizData.experience || 0,
                            questionsAnswered: quizData.questionsAnswered || 0,
                            questionHistory: quizData.questionHistory || [],
                            lastActive: quizData.lastUpdated || null
                        };
                    }
                });
            }

            console.log('Processed scores:', scores); // Debug log
            return scores;
        } catch (error) {
            console.error(`Failed to load progress for user ${username}:`, error);
            return [];
        }
    }

    normalizeQuizName(quizName) {
        // Convert to lowercase and remove any spaces or special characters
        return quizName.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    setupEventListeners() {
        const searchInput = document.getElementById('userSearch');
        const sortSelect = document.getElementById('sortBy');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.updateDashboard());
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.updateDashboard());
        }
    }

    updateDashboard() {
        this.updateStatistics();
        this.updateUserList();
    }

    updateStatistics() {
        const totalUsersElement = document.getElementById('totalUsers');
        const activeUsersElement = document.getElementById('activeUsers');
        const averageCompletionElement = document.getElementById('averageCompletion');

        const today = new Date().setHours(0, 0, 0, 0);
        let activeUsers = 0;
        let totalCompletion = 0;

        this.users.forEach(user => {
            const scores = this.userScores.get(user.username) || [];
            
            // Check if user was active today
            const wasActiveToday = scores.some(score => {
                if (!score.lastActive) return false;
                const activeDate = new Date(score.lastActive).setHours(0, 0, 0, 0);
                return activeDate === today;
            });
            if (wasActiveToday) activeUsers++;

            // Calculate completion
            const userCompletion = scores.reduce((sum, score) => sum + score.score, 0) / this.quizTypes.length;
            totalCompletion += userCompletion;
        });

        if (totalUsersElement) totalUsersElement.textContent = this.users.length;
        if (activeUsersElement) activeUsersElement.textContent = activeUsers;
        if (averageCompletionElement) {
            const average = this.users.length ? Math.round(totalCompletion / this.users.length) : 0;
            averageCompletionElement.textContent = `${average}%`;
        }
    }

    updateUserList() {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
        const sortBy = document.getElementById('sortBy')?.value || 'username-asc';

        let filteredUsers = this.users.filter(user => 
            user.username.toLowerCase().includes(searchTerm)
        );

        filteredUsers.sort((a, b) => {
            const scoresA = this.userScores.get(a.username) || [];
            const scoresB = this.userScores.get(b.username) || [];
            
            switch (sortBy) {
                case 'username-asc':
                    return a.username.localeCompare(b.username);
                case 'username-desc':
                    return b.username.localeCompare(a.username);
                case 'progress-high':
                    return this.calculateProgress(scoresB) - this.calculateProgress(scoresA);
                case 'progress-low':
                    return this.calculateProgress(scoresA) - this.calculateProgress(scoresB);
                case 'last-active':
                    return this.getLastActive(scoresB) - this.getLastActive(scoresA);
                default:
                    return 0;
            }
        });

        usersList.innerHTML = '';
        filteredUsers.forEach(user => this.createUserCard(user, usersList));
    }

    createUserCard(user, container) {
        const scores = this.userScores.get(user.username) || [];
        const progress = this.calculateProgress(scores);
        const lastActive = this.getLastActive(scores);

        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = `
            <h3>${user.username}</h3>
            <p>Overall Progress: ${progress.toFixed(1)}%</p>
            <p>Last Active: ${this.formatDate(lastActive)}</p>
            <button class="view-details-btn" onclick="window.adminDashboard.showUserDetails('${user.username}')">
                View Details
            </button>
        `;
        container.appendChild(card);
    }

    async showUserDetails(username) {
        const user = this.users.find(u => u.username === username);
        if (!user) return;

        const scores = this.userScores.get(username) || [];
        console.log('Showing details for user scores:', scores); // Debug log

        const overlay = document.createElement('div');
        overlay.className = 'user-details-overlay';
        
        const content = document.createElement('div');
        content.className = 'user-details-content';
        
        content.innerHTML = `
            <div class="details-header">
                <h3>${username}'s Progress</h3>
                <button class="close-btn" onclick="this.closest('.user-details-overlay').remove()">×</button>
            </div>
        `;
        
        const quizList = document.createElement('div');
        quizList.className = 'quiz-progress-list';
        
        this.quizTypes.forEach(quizName => {
            // Find matching quiz score using normalized names
            const quizScore = scores.find(s => 
                this.normalizeQuizName(s.quizName) === this.normalizeQuizName(quizName)
            );
            
            console.log(`Processing quiz ${quizName}:`, quizScore); // Debug log

            const progress = quizScore?.score || 0;
            const questionsAnswered = quizScore?.questionsAnswered || 0;
            const experience = quizScore?.experience || 0;
            const lastActive = quizScore?.lastActive ? 
                this.formatDate(new Date(quizScore.lastActive)) : 'Never';
            
            const quizItem = document.createElement('div');
            quizItem.className = 'quiz-progress-item';
            quizItem.innerHTML = `
                <h4>${this.formatQuizName(quizName)}</h4>
                <div class="quiz-stats">
                    <div class="stat-item">Progress: <span class="stat-value">${progress}%</span></div>
                    <div class="stat-item">Questions Completed: <span class="stat-value">${questionsAnswered}/15</span></div>
                    <div class="stat-item">XP Earned: <span class="stat-value">${experience}/300</span></div>
                    <div class="stat-item">Last Active: <span class="stat-value">${lastActive}</span></div>
                    <button class="reset-progress-btn" 
                            onclick="window.adminDashboard.resetQuizProgress('${username}', '${quizName}')">
                        Reset Progress
                    </button>
                </div>
            `;
            quizList.appendChild(quizItem);
        });
        
        content.appendChild(quizList);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
    }

    async resetQuizProgress(username, quizName) {
        try {
            const response = await fetch(
                `${this.apiService.baseUrl}/users/${username}/quiz-progress/${quizName}/reset`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to reset quiz progress');
            }

            // Reload the user's progress
            const scores = await this.loadUserProgress(username);
            this.userScores.set(username, scores);

            // Refresh the details view
            const existingOverlay = document.querySelector('.user-details-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
                await this.showUserDetails(username);
            }

            this.updateDashboard();
        } catch (error) {
            console.error('Error resetting progress:', error);
            this.showError('Failed to reset progress');
        }
    }

    calculateProgress(scores) {
        if (!scores.length) return 0;
        return scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
    }

    getLastActive(scores) {
        if (!scores.length) return 0;
        return Math.max(...scores
            .map(score => score.lastActive ? new Date(score.lastActive).getTime() : 0)
            .filter(time => time > 0)) || 0;
    }

    formatQuizName(name) {
        return name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Never';
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? 'Never' : date.toLocaleDateString();
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Initialize the admin dashboard
window.adminDashboard = new AdminDashboard(); 