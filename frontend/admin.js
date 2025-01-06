import { APIService } from './api-service.js';

// Export the AdminDashboard class
export class AdminDashboard {
    constructor() {
        this.apiService = new APIService();
        this.users = [];
        this.userScores = new Map();
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
                    // If on login page with valid token, redirect to admin panel
                    window.location.href = '/pages/admin.html';
                    return;
                }
            } else if (currentPath.includes('admin.html')) {
                if (!isTokenValid) {
                    // If on admin panel without valid token, redirect to login
                    window.location.href = '/pages/admin-login.html';
                    return;
                }
                // Setup dashboard only if we're on the admin panel with valid token
                await this.setupDashboard();
            }
        }
    }

    async setupDashboard() {
        await this.showAdminDashboard();
        
        // Add event listeners for dashboard
        const userSearch = document.getElementById('userSearch');
        const sortBy = document.getElementById('sortBy');
        
        if (userSearch) {
            userSearch.addEventListener('input', this.debounce(this.updateDashboard.bind(this), 300));
        }
        if (sortBy) {
            sortBy.addEventListener('change', this.updateDashboard.bind(this));
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
                // Store admin token
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
            'cms-testing'
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
            const user = this.users.find(u => u.username === username);
            if (!user) return scores;

            // Process quiz results from user data
            if (user.quizResults && Array.isArray(user.quizResults)) {
                user.quizResults.forEach(result => {
                    // Convert API format back to our display format
                    const displayQuizName = result.quizName
                        .replace(/([A-Z])/g, '-$1')
                        .toLowerCase()
                        .replace(/^-/, '');
                    
                    const scoreIndex = scores.findIndex(s => {
                        const normalizedScoreName = s.quizName.toLowerCase().replace(/\s+/g, '');
                        const normalizedDisplayName = displayQuizName.toLowerCase().replace(/\s+/g, '');
                        return normalizedScoreName === normalizedDisplayName ||
                               normalizedScoreName === result.quizName.toLowerCase();
                    });
                    
                    if (scoreIndex !== -1) {
                        // Get questions answered from various sources
                        let questionsAnswered = 0;
                        
                        // First try to get from answers array
                        if (result.answers && Array.isArray(result.answers)) {
                            questionsAnswered = result.answers.length;
                        } 
                        // Then try questionsAnswered property
                        else if (result.questionsAnswered) {
                            questionsAnswered = result.questionsAnswered;
                        }
                        // Finally, calculate from score if we have no other data
                        else if (result.score > 0) {
                            // If they have a score, they must have answered some questions
                            // Calculate based on score percentage (minimum 1 question if they have any score)
                            questionsAnswered = Math.max(1, Math.ceil((result.score / 100) * 15));
                        }

                        // Calculate experience if not provided
                        let experience = result.experience;
                        if (typeof experience !== 'number' && result.score) {
                            experience = Math.round((result.score / 100) * 300);
                        }

                        scores[scoreIndex] = {
                            ...scores[scoreIndex],
                            score: result.score || 0,
                            questionsAnswered,
                            completedAt: result.completedAt,
                            lastActive: result.completedAt,
                            experience: experience || 0
                        };
                    }
                });
            }

            // Update with quiz progress if available
            if (user.quizProgress) {
                Object.entries(user.quizProgress).forEach(([quizName, progress]) => {
                    // Convert API format back to our display format
                    const displayQuizName = quizName
                        .replace(/([A-Z])/g, '-$1')
                        .toLowerCase()
                        .replace(/^-/, '');
                    
                    const scoreIndex = scores.findIndex(s => {
                        const normalizedScoreName = s.quizName.toLowerCase().replace(/\s+/g, '');
                        const normalizedDisplayName = displayQuizName.toLowerCase().replace(/\s+/g, '');
                        return normalizedScoreName === normalizedDisplayName ||
                               normalizedScoreName === quizName.toLowerCase();
                    });
                    
                    if (scoreIndex !== -1 && progress) {
                        // Get questions answered from progress data
                        let questionsAnswered = scores[scoreIndex].questionsAnswered;
                        
                        // Update from question history if available
                        if (progress.questionHistory && Array.isArray(progress.questionHistory)) {
                            questionsAnswered = Math.max(questionsAnswered, progress.questionHistory.length);
                        }
                        // If we have no questions answered but have a score, calculate from score
                        else if (questionsAnswered === 0 && scores[scoreIndex].score > 0) {
                            questionsAnswered = Math.max(1, Math.ceil((scores[scoreIndex].score / 100) * 15));
                        }

                        scores[scoreIndex] = {
                            ...scores[scoreIndex],
                            questionsAnswered,
                            experience: progress.experience || scores[scoreIndex].experience,
                            lastActive: progress.lastUpdated || scores[scoreIndex].lastActive
                        };
                    }
                });
            }

            // Update last active from user's lastLogin if available
            const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
            if (lastLogin) {
                scores.forEach(score => {
                    if (!score.lastActive || new Date(score.lastActive) < lastLogin) {
                        score.lastActive = lastLogin;
                    }
                });
            }

            console.log('Loaded progress for user:', username, scores);
            return scores;
        } catch (error) {
            console.error(`Error loading progress for ${username}:`, error);
            return scores;
        }
    }

    async showAdminDashboard() {
        try {
            const adminToken = localStorage.getItem('adminToken');
            
            if (!adminToken) {
                this.handleAdminLogout();
                return;
            }

            try {
                // Use the admin-specific fetch method
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
        const today = new Date().setHours(0, 0, 0, 0); // Start of today
        let totalCompletion = 0;
        let activeUsers = new Set();

        this.users.forEach(user => {
            const scores = this.userScores.get(user.username) || [];
            // Check if user was active today
            if (scores.some(score => {
                if (!score.lastActive) return false;
                const activeDate = new Date(score.lastActive).setHours(0, 0, 0, 0);
                return activeDate === today;
            })) {
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
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        const searchInput = document.getElementById('userSearch')?.value.toLowerCase() || '';
        const sortBy = document.getElementById('sortBy')?.value || 'username-asc';
        
        let filteredUsers = this.users.filter(user => 
            user.username.toLowerCase().includes(searchInput)
        );

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
            const completedQuizzes = scores.filter(score => score.score > 0).length;
            const totalQuizzes = scores.length;

            card.innerHTML = `
                <div class="user-header">
                    <h4>${user.username}</h4>
                    <div class="user-stats">
                        <div class="total-score">Overall Progress: ${progress.toFixed(1)}%</div>
                        <div class="quiz-completion">Completed Quizzes: ${completedQuizzes}/${totalQuizzes}</div>
                        <div class="last-active">Last Active: ${this.formatDate(lastActive)}</div>
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
        
        // Only count quizzes that have been attempted
        const completedScores = scores.filter(score => score.score > 0);
        if (!completedScores.length) return 0;
        
        const totalProgress = completedScores.reduce((sum, score) => sum + score.score, 0);
        return totalProgress / scores.length; // Divide by total number of quizzes for overall progress
    }

    getLastActiveDate(user) {
        if (!user) return 0;
        
        // First check user's last login
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).getTime() : 0;
        
        // Then check quiz results and progress
        const scores = this.userScores.get(user.username) || [];
        const quizDates = scores
            .map(score => score.lastActive)
            .filter(date => date)
            .map(date => new Date(date).getTime());
            
        // Return the most recent date
        return Math.max(lastLogin, ...quizDates) || 0;
    }

    async refreshAllData() {
        try {
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                this.handleAdminLogout();
                return false;
            }

            // Fetch fresh users data
            const response = await fetch(`${this.apiService.baseUrl}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch updated users data');
            }

            const data = await response.json();
            if (data.success && Array.isArray(data.users)) {
                // Update users array
                this.users = data.users;
                
                // Clear and reload all user scores
                this.userScores.clear();
                for (const user of this.users) {
                    // Clear any local storage for this user's quizzes
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
                        'cms-testing'
                    ];
                    
                    quizTypes.forEach(quizName => {
                        localStorage.removeItem(`quiz_progress_${user.username}_${quizName}`);
                        localStorage.removeItem(`quiz_progress_${user.username}_${this.normalizeQuizName(quizName)}`);
                    });

                    const scores = await this.loadUserProgress(user.username);
                    this.userScores.set(user.username, scores);
                }

                // Update UI
                this.updateStatistics();
                this.updateUserList();
                return true;
            } else {
                throw new Error('Invalid users data format received');
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showError('Failed to refresh data');
            return false;
        }
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
                <button class="close-button" onclick="window.adminDashboard.closeUserDetails()">×</button>
            </div>
            <div class="user-details-body">
                <div class="quiz-progress-list">
                    ${sortedScores.map(score => {
                        // Calculate questions completed from either quizResults or quizProgress
                        const questionsCompleted = score.questionsAnswered || 0;
                        const totalQuestions = 15; // Total questions per quiz
                        
                        return `
                            <div class="quiz-progress-item ${score.score > 0 ? 'started' : 'not-started'}" data-quiz="${score.quizName}">
                                <div class="quiz-info">
                                    <h3>${this.getQuizDisplayName(score.quizName)}</h3>
                                    <div class="progress-details">
                                        <span class="score">Progress: ${Math.round(score.score)}%</span>
                                        <span class="questions">Questions Completed: ${questionsCompleted}/${totalQuestions}</span>
                                        <span class="experience">XP Earned: ${score.experience}/300</span>
                                        <span class="last-active">Last Active: ${this.formatDate(score.lastActive)}</span>
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

    closeUserDetails() {
        const overlay = document.querySelector('.user-details-overlay');
        if (overlay) {
            overlay.remove();
        }
        // Refresh all data when closing details view
        this.refreshAllData();
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
            'cms-testing': 'CMS Testing'
        };
        
        return displayNames[quizId] || quizId;
    }

    normalizeQuizName(quizName) {
        // First, convert the input to lowercase and remove any spaces
        const normalizedInput = quizName.toLowerCase().replace(/\s+/g, '');

        // Map of special cases where the API name differs from our standard format
        const specialCases = {
            'communication': 'communication',  // Keep as is
            'initiative': 'initiative',        // Keep as is
            'tester-mindset': 'testerMindset',
            'risk-analysis': 'riskAnalysis',
            'risk-management': 'riskManagement',
            'time-management': 'timeManagement',
            'non-functional': 'nonFunctional',
            'test-support': 'testSupport',
            'issue-verification': 'issueVerification',
            'build-verification': 'buildVerification',
            'issue-tracking-tools': 'issueTrackingTools',
            'raising-tickets': 'raisingTickets',
            'reports': 'reports',              // Keep as is
            'cms-testing': 'cmsTesting'
        };

        console.log('Normalizing quiz name:', {
            input: quizName,
            normalizedInput,
            specialCase: specialCases[normalizedInput],
            hasMapping: !!specialCases[normalizedInput]
        });

        // If we have a special case mapping, use it
        if (specialCases[normalizedInput]) {
            return specialCases[normalizedInput];
        }

        // Otherwise, convert from hyphenated to camelCase
        return normalizedInput.replace(/-([a-z])/g, g => g[1].toUpperCase());
    }

    async resetUserProgress(username, quizName) {
        try {
            const adminToken = localStorage.getItem('adminToken');
            
            // Convert quiz name to API format
            const apiQuizName = this.normalizeQuizName(quizName);
            
            console.log('Resetting progress for quiz:', { 
                original: quizName, 
                apiFormat: apiQuizName,
                username: username
            });

            // Reset the quiz progress
            const progressResponse = await fetch(
                `${this.apiService.baseUrl}/admin/users/${username}/quiz-progress/${apiQuizName}/reset`,
                { 
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const progressData = await progressResponse.json();
            console.log('Progress reset response:', progressData);

            if (!progressResponse.ok) {
                throw new Error(progressData.message || 'Failed to reset quiz progress');
            }

            // Reset the quiz score
            const scoreResponse = await fetch(
                `${this.apiService.baseUrl}/admin/users/${username}/quiz-scores/reset`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ quizName: apiQuizName })
                }
            );

            const scoreData = await scoreResponse.json();
            console.log('Score reset response:', scoreData);

            if (!scoreResponse.ok) {
                throw new Error(scoreData.message || 'Failed to reset quiz score');
            }

            // Clear local storage for this quiz
            localStorage.removeItem(`quiz_progress_${username}_${quizName}`);
            localStorage.removeItem(`quiz_progress_${username}_${apiQuizName}`);

            // Update the user in our local data
            if (progressData.user) {
                const userIndex = this.users.findIndex(u => u.username === username);
                if (userIndex !== -1) {
                    this.users[userIndex] = progressData.user;
                }
            }

            // Clear and reload the user's scores
            const scores = await this.loadUserProgress(username);
            this.userScores.set(username, scores);

            // Update UI
            this.updateStatistics();
            this.updateUserList();

            // Show success message
            this.showError(`Successfully reset ${this.getQuizDisplayName(quizName)} for ${username}`);

            // Refresh the details view if it's open
            const existingOverlay = document.querySelector('.user-details-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
                await this.showUserDetails(username);
            }

            // Do a final refresh of all data to ensure consistency
            await this.refreshAllData();

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

    formatDate(date) {
        if (!date) return 'Never';
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Never';
        return d.toLocaleDateString();
    }
}

// Initialize the dashboard
const adminDashboard = new AdminDashboard();
window.adminDashboard = adminDashboard;

// Export these functions for direct use in HTML
export const handleAdminLogin = async () => {
    await window.adminDashboard.handleAdminLogin();
};

export const handleAdminLogout = () => {
    window.adminDashboard.handleAdminLogout();
}; 