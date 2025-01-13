import { APIService } from './api-service.js';

class AdminDashboard {
    constructor() {
        this.apiService = new APIService();
        
        this.userScores = new Map();
        this.users = [];
        this.quizTypes = [
            'communication', 'initiative', 'time-management', 'tester-mindset',
            'risk-analysis', 'risk-management', 'non-functional', 'test-support',
            'issue-verification', 'build-verification', 'issue-tracking-tools',
            'raising-tickets', 'reports', 'cms-testing'
        ];
        
        // Initialize immediately if we're on an admin page
        if (window.location.pathname.includes('admin')) {
            this.init().catch(console.error);
        }
    }

    async init() {
        console.log('Initializing AdminDashboard');
        const adminToken = localStorage.getItem('adminToken');
        const currentPath = window.location.pathname;
        
        if (!adminToken) {
            console.log('No admin token found, redirecting to login');
            if (!currentPath.includes('admin-login.html')) {
                window.location.href = '/pages/admin-login.html';
            }
            return;
        }

        const isTokenValid = await this.verifyAdminToken(adminToken);
        console.log('Token validation result:', isTokenValid);

        if (!isTokenValid && !currentPath.includes('admin-login.html')) {
            console.log('Invalid token, redirecting to login');
            window.location.href = '/pages/admin-login.html';
            return;
        }

        if (isTokenValid && currentPath.includes('admin-login.html')) {
            console.log('Valid token on login page, redirecting to admin panel');
            window.location.href = '/pages/admin.html';
            return;
        }

        if (isTokenValid && currentPath.includes('admin.html')) {
            console.log('Valid token on admin panel, loading dashboard');
            // Load users first
            await this.loadUsers();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Update the dashboard immediately after loading users
            await this.updateDashboard();
            
            // Load progress for all users
            await this.loadAllUserProgress();
            
            // Update the dashboard again with progress data
            this.updateDashboard();
        }
    }

    async verifyAdminToken(token) {
        if (!token) return false;
        
        try {
            const result = await this.apiService.verifyAdminToken();
            return result.valid;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }

    async handleAdminLogin(formData) {
        try {
            console.log('Attempting admin login...');
            
            const username = formData.get('username');
            const password = formData.get('password');
            
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            const data = await this.apiService.adminLogin(username, password);

            if (!data.token) {
                throw new Error('No token received from server');
            }

            // Token is already stored by adminLogin method
            window.location.replace('/pages/admin.html');
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Login failed. Please try again.');
        }
    }

    async handleAdminLogout() {
        try {
            await this.apiService.adminLogout();
        } finally {
            window.location.replace('/pages/admin-login.html');
        }
    }

    async loadDashboard() {
        try {
            console.log('Loading dashboard...'); // Debug log
            
            // Load users first
            await this.loadUsers();
            if (!this.users || !this.users.length) {
                console.log('No users loaded, stopping dashboard load');
                this.updateDashboard(); // Update to show no users
                return;
            }
            console.log('Users loaded successfully:', this.users.length, 'users');

            // Set up event listeners
            console.log('Setting up event listeners...'); // Debug log
            this.setupEventListeners();
            console.log('Event listeners set up');

            // Load progress for all users
            console.log('Loading user progress...'); // Debug log
            await this.loadAllUserProgress();
            console.log('User progress loaded');

            // Final dashboard update
            console.log('Performing final dashboard update...'); // Debug log
            this.updateDashboard();
            console.log('Dashboard load complete'); // Debug log
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            this.showError('Failed to load dashboard');
            throw error;
        }
    }

    async loadUsers() {
        try {
            console.log('Fetching users from MongoDB...'); 
            
            const response = await this.apiService.getAllUsers();
            console.log('User data received:', response);

            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch users');
            }

            const userData = response.data || [];
            if (!Array.isArray(userData)) {
                throw new Error('Invalid response format: expected array of users');
            }

            // Map MongoDB user data to our format
            this.users = userData.map(user => {
                if (!user.username) {
                    console.warn('User missing username:', user);
                    return null;
                }

                // Ensure quiz data is properly structured
                const quizProgress = user.quizProgress || {};
                const quizResults = Array.isArray(user.quizResults) ? user.quizResults : [];

                return {
                    username: user.username,
                    lastLogin: user.lastLogin || null,
                    quizProgress: quizProgress,
                    quizResults: quizResults.map(result => ({
                        quizName: result.quizName,
                        score: result.score || 0,
                        experience: result.experience || 0,
                        questionsAnswered: result.questionsAnswered || 0,
                        lastActive: result.lastActive || result.completedAt || null,
                        completedAt: result.completedAt || null
                    }))
                };
            }).filter(user => user !== null);

            console.log(`Users loaded from MongoDB: ${this.users.length} users`);
            return true;
        } catch (error) {
            console.error('Failed to load users:', error);
            this.showError(`Failed to load users: ${error.message}`);
            return false;
        }
    }

    async loadAllUserProgress() {
        try {
            console.log('Loading progress for all users...');
            
            // Fetch fresh progress data for each user
            const progressPromises = this.users.map(async user => {
                try {
                    const response = await this.apiService.fetchWithAdminAuth(
                        `${this.apiService.baseUrl}/admin/users/${user.username}/quiz-progress`
                    );

                    if (!response.ok) {
                        console.error(`Failed to fetch progress for ${user.username}`);
                        return;
                    }

                    const data = await response.json();
                    if (data.success && data.data) {
                        // Update the user's progress data
                        user.quizProgress = data.data;
                        
                        // Log the complete progress data for debugging
                        this.quizTypes.forEach(quizType => {
                            if (user.quizProgress[quizType]) {
                                const progress = user.quizProgress[quizType];
                                console.log(`Loaded progress for ${user.username} - ${quizType}:`, {
                                    experience: progress.experience || 0,
                                    questionsAnswered: progress.questionHistory?.length || 0,
                                    lastUpdated: progress.lastUpdated,
                                    progress: Math.round(((progress.questionHistory?.length || 0) / 15) * 100) + '%'
                                });
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching progress for ${user.username}:`, error);
                }
            });

            // Wait for all progress updates to complete
            await Promise.all(progressPromises);

            // Now update the dashboard with fresh data
            this.updateDashboard();
            console.log('All user progress loaded and dashboard updated');
        } catch (error) {
            console.error('Failed to load all user progress:', error);
            this.showError('Failed to load user progress');
        }
    }

    async loadUserProgress(username) {
        try {
            const response = await this.apiService.getUserProgress(username);
            console.log(`Raw progress data for ${username}:`, response);
            
            if (!response.success) {
                throw new Error('Invalid response format: missing success flag');
            }

            const progressData = response.data || {};
            
            // Verify and initialize quiz progress data
            const verifiedData = this.verifyQuizProgress({
                username,
                quizProgress: progressData
            });
            
            console.log(`Verified progress data for ${username}:`, verifiedData);
            
            return verifiedData;
        } catch (error) {
            console.error(`Error loading progress for ${username}:`, error);
            return null;
        }
    }

    // Helper method to get default scores
    getDefaultScores() {
        return this.quizTypes.map(quizName => ({
            quizName,
            score: 0,
            experience: 0,
            questionsAnswered: 0,
            currentScenario: 0,
            lastActive: null,
            answers: []
        }));
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

    async updateDashboard() {
        try {
            // Update statistics
            const stats = this.updateStatistics();
            this.updateStatisticsDisplay(stats);
            
            // Update user list
            await this.updateUserList();
            
        } catch (error) {
            console.error('Error updating dashboard:', error);
            this.showError(`Failed to update dashboard: ${error.message}`);
        }
    }

    updateStatistics() {
        const today = new Date().setHours(0, 0, 0, 0);
        
        const stats = this.users.reduce((acc, user) => {
            // Check if user was active today
            const lastActive = this.getLastActiveDate(user);
            if (lastActive >= today) {
                acc.activeUsers++;
            }

            // Calculate progress for average
            const userProgress = this.calculateUserProgress(user);
            acc.totalProgress += userProgress;
            
            console.log(`User ${user.username} stats:`, {
                lastActive: new Date(lastActive),
                progress: userProgress,
                completedQuizzes: user.quizResults?.length || 0
            });

            return acc;
        }, {
            totalUsers: this.users.length,
            activeUsers: 0,
            totalProgress: 0
        });

        stats.averageProgress = Math.round(stats.totalProgress / stats.totalUsers);
        
        console.log('Final statistics:', stats);
        return stats;
    }

    async updateUserList() {
        const container = document.getElementById('usersList');
        if (!container) {
            console.error('User list container not found');
            return;
        }

        if (!this.users || !this.users.length) {
            console.log('No users to display');
            container.innerHTML = '<div class="no-users">No users found</div>';
            return;
        }

        const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
        const sortBy = document.getElementById('sortBy')?.value || 'username-asc';

        let filteredUsers = this.users.filter(user => 
            user.username.toLowerCase().includes(searchTerm)
        );

        // Sort users based on selected criteria
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

        // Clear existing content
        container.innerHTML = '';

        // Create and append user cards
        filteredUsers.forEach(user => {
            const progress = this.calculateUserProgress(user);
            const lastActive = this.getLastActiveDate(user);
            const quizzesTaken = Object.keys(user.quizProgress || {}).length;

            const card = document.createElement('div');
            card.className = 'user-card';
            
            card.innerHTML = `
                <div class="user-card-content">
                    <div class="user-header">
                        <h4>${user.username}</h4>
                        <div class="user-stats">
                            <div class="stat">
                                <span class="stat-label">Overall Progress:</span>
                                <span class="stat-value">${progress.toFixed(1)}%</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Quizzes Started:</span>
                                <span class="stat-value">${quizzesTaken}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Last Active:</span>
                                <span class="stat-value">${this.formatDate(lastActive)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="view-details-btn" onclick="this.closest('.user-card').dispatchEvent(new CustomEvent('viewDetails'))">
                    View Details
                </button>
            `;
            
            // Add event listener for view details button
            card.addEventListener('viewDetails', () => {
                this.showUserDetails(user.username);
            });

            container.appendChild(card);
        });

        if (filteredUsers.length === 0) {
            container.innerHTML = '<div class="no-users">No users match your search</div>';
        }

        // Update statistics display
        this.updateStatistics();
    }

    // Helper method to calculate user progress
    calculateUserProgress(user) {
        if (!user) return 0;

        // Count completed quizzes from quizResults
        const completedQuizzes = new Set(user.quizResults.map(result => result.quizName.toLowerCase()));
        
        // Calculate total progress
        const totalQuizzes = this.quizTypes.length;
        const progress = (completedQuizzes.size / totalQuizzes) * 100;

        console.log(`Progress calculation for ${user.username}:`, {
            completedQuizzes: Array.from(completedQuizzes),
            totalQuizzes,
            progress
        });

        return progress;
    }

    // Helper method to get last active date
    getLastActiveDate(user) {
        if (!user) return 0;

        const dates = [];

        // Add lastLogin if exists
        if (user.lastLogin) {
            dates.push(new Date(user.lastLogin).getTime());
        }

        // Add quiz completion dates
        if (user.quizResults && user.quizResults.length > 0) {
            user.quizResults.forEach(result => {
                if (result.completedAt) {
                    dates.push(new Date(result.completedAt).getTime());
                }
                if (result.lastActive) {
                    dates.push(new Date(result.lastActive).getTime());
                }
            });
        }

        // Return most recent date or 0 if no dates found
        return dates.length > 0 ? Math.max(...dates) : 0;
    }

    async showUserDetails(username) {
        try {
            console.log(`Opening details for ${username}`);
            
            // Remove any existing overlay first
            const existingOverlay = document.querySelector('.user-details-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            const user = this.users.find(u => u.username === username);
            
            if (!user) {
                console.error(`User ${username} not found`);
                return;
            }

            console.log(`Showing details for ${username}:`, {
                user,
                quizResults: user.quizResults,
                quizProgress: user.quizProgress
            });

            const overlay = document.createElement('div');
            overlay.className = 'user-details-overlay';
            
            const content = document.createElement('div');
            content.className = 'user-details-content';
            
            content.innerHTML = `
                <div class="details-header">
                    <h3>${username}'s Progress</h3>
                    <button class="close-btn" style="position: absolute; right: 20px; top: 20px; 
                            padding: 5px 10px; cursor: pointer; background: none; border: none; font-size: 20px;">×</button>
                </div>
                <div class="quiz-progress-list" style="margin-top: 20px;">
                    ${this.quizTypes.map(quizName => {
                        // Inside showUserDetails method, update the template literal for quiz progress display
                        const quizProgress = user.quizProgress?.[quizName];
                        console.log(`Processing quiz progress for ${quizName}:`, quizProgress);

                        if (!quizProgress?.questionHistory) {
                            return `
                                <div class="quiz-progress-item" style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                    <h4 style="margin: 0 0 10px 0">${this.formatQuizName(quizName)}</h4>
                                    <div class="quiz-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                                        <div class="stat-item">Progress: <span class="stat-value">Not Started</span></div>
                                        <div class="stat-item">Questions: <span class="stat-value">0/15</span></div>
                                        <div class="stat-item">XP: <span class="stat-value">0/300</span></div>
                                        <div class="stat-item">Last Active: <span class="stat-value">Never</span></div>
                                    </div>
                                </div>
                            `;
                        }

                        // Get values from quiz progress data
                        const questionsAnswered = quizProgress?.questionHistory?.length || 0;
                        const earnedXP = quizProgress?.experience || Math.round((questionsAnswered / 15) * 300);
                        const percentComplete = Math.round((questionsAnswered / 15) * 100);

                        console.log(`Processed quiz data for ${quizName}:`, {
                            questionsAnswered,
                            earnedXP,
                            lastUpdated: quizProgress.lastUpdated,
                            percentComplete
                        });

                        return `
                            <div class="quiz-progress-item" style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                <h4 style="margin: 0 0 10px 0">${this.formatQuizName(quizName)}</h4>
                                <div class="quiz-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                                    <div class="stat-item">Progress: <span class="stat-value">${percentComplete}%</span></div>
                                    <div class="stat-item">Questions: <span class="stat-value">${questionsAnswered}/15</span></div>
                                    <div class="stat-item">XP: <span class="stat-value">${earnedXP}/300</span></div>
                                    <div class="stat-item">Last Active: <span class="stat-value">${quizProgress.lastUpdated ? this.formatDate(new Date(quizProgress.lastUpdated).getTime()) : 'Never'}</span></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    </div>
                `;
            
            overlay.appendChild(content);
            document.body.appendChild(overlay);

            // Add close button functionality
            const closeBtn = content.querySelector('.close-btn');
            closeBtn.addEventListener('click', () => overlay.remove());

            // Add click outside to close
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                }
            });

            console.log('Available quiz types:', this.quizTypes);
            console.log('User progress data:', user.quizProgress);
        } catch (error) {
            console.error('Failed to show user details:', error);
            this.showError('Failed to load user details');
        }
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
        if (!scores || !scores.length) return 0;
        
        let totalProgress = 0;
        let completedQuizzes = 0;
        
        this.quizTypes.forEach(quizType => {
            const quizScore = scores.find(score => score.quizName === quizType);
            if (quizScore) {
                const questionsAnswered = quizScore.questionHistory?.length || quizScore.questionsAnswered || 0;
                if (questionsAnswered > 0) {
                    totalProgress += (questionsAnswered / 15) * 100;
                    completedQuizzes++;
                }
            }
        });
        
        return completedQuizzes > 0 ? Math.round(totalProgress / completedQuizzes) : 0;
    }

    getLastActive(scores) {
        if (!scores || !scores.length) return 0;
        
        const lastActiveDates = scores
            .map(score => score.lastActive || score.lastUpdated)
            .filter(date => date)
            .map(date => new Date(date).getTime());
        
        return lastActiveDates.length > 0 ? Math.max(...lastActiveDates) : 0;
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
        if (isNaN(date.getTime())) return 'Never';

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

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    verifyQuizProgress(user) {
        if (!user.quizProgress) {
            console.warn(`Initializing empty quiz progress for user ${user.username}`);
            user.quizProgress = {};
        }

        this.quizTypes.forEach(quizName => {
            if (!user.quizProgress[quizName]) {
                console.warn(`Initializing empty progress for quiz ${quizName} for user ${user.username}`);
                user.quizProgress[quizName] = {
                    questionHistory: [],
                    experience: 0,
                    lastUpdated: null,
                    questionsAnswered: 0
                };
            }
        });
        
        return user;
    }

    initializeQuizData(user) {
        if (!user.quizProgress) user.quizProgress = {};
        if (!user.quizResults) user.quizResults = [];
        
        this.quizTypes.forEach(quizName => {
            if (!user.quizProgress[quizName]) {
                user.quizProgress[quizName] = {
                    questionHistory: [],
                    experience: 0,
                    lastUpdated: null,
                    questionsAnswered: 0
                };
            }
        });
        
        return user;
    }

    updateStatisticsDisplay(stats) {
        // Update the statistics in the UI
        const totalUsersElement = document.getElementById('totalUsers');
        const activeUsersElement = document.getElementById('activeUsers');
        const averageCompletionElement = document.getElementById('averageCompletion');

        if (totalUsersElement) {
            totalUsersElement.textContent = stats.totalUsers || 0;
        }
        if (activeUsersElement) {
            activeUsersElement.textContent = stats.activeUsers || 0;
        }
        if (averageCompletionElement) {
            averageCompletionElement.textContent = `${stats.averageProgress || 0}%`;
        }
    }
}

// Export the AdminDashboard class directly
export { AdminDashboard }; 