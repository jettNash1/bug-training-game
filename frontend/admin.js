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
            'raising-tickets', 'reports', 'CMS-Testing', 'email-testing', 'content-copy',
            'locale-testing', 'script-metrics-troubleshooting', 'standard-script-testing'
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
            console.log('Starting user fetch...');
            this.showLoading('Loading users...');
            
            // Verify admin token first
            const tokenValid = await this.apiService.verifyAdminToken();
            if (!tokenValid) {
                throw new Error('Admin session expired. Please login again.');
            }
            
            console.log('Admin token verified, fetching users...');
            const response = await this.apiService.getAllUsers();
            console.log('Raw API response:', response);

            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch users');
            }

            const userData = response.data || [];
            console.log('User data array:', userData);

            if (!Array.isArray(userData)) {
                throw new Error('Invalid response format: expected array of users');
            }

            // Map MongoDB user data to our format
            this.users = userData.map(user => {
                if (!user || !user.username) return null;
                
                return {
                    username: user.username,
                    lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
                    quizResults: Array.isArray(user.quizResults) ? user.quizResults.map(result => ({
                        quizName: result.quizName,
                        score: result.score || 0,
                        questionsAnswered: result.questionsAnswered || 0,
                        experience: result.experience || 0,
                        timestamp: result.timestamp ? new Date(result.timestamp).toLocaleString() : 'Unknown'
                    })) : []
                };
            }).filter(user => user !== null);

            console.log('Final processed users:', this.users);
            
            // Update the dashboard with the loaded users
            this.updateDashboard();
            this.hideLoading();
            
            return true;
        } catch (error) {
            console.error('Failed to load users:', error);
            this.hideLoading();
            
            if (error.message.includes('Admin session expired')) {
                // Redirect to login on auth errors
                window.location.replace('/pages/admin-login.html');
                return false;
            }
            
            this.showError(`Failed to load users: ${error.message}`);
            return false;
        }
    }

    async loadAllUserProgress() {
        try {
            console.log('Loading progress for all users...');
            
            // Update the dashboard with fresh data
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
            
            // Calculate total questions answered and XP across all quizzes
            let totalQuestionsAnswered = 0;
            let totalXP = 0;
            
            this.quizTypes.forEach(quizType => {
                const progress = user.quizProgress?.[quizType.toLowerCase()];
                const result = user.quizResults?.find(r => r.quizName.toLowerCase() === quizType.toLowerCase());
                
                // Get questions answered from progress first, then fall back to result
                const questionsAnswered = progress?.questionsAnswered || 
                                        progress?.questionHistory?.length || 
                                        result?.questionsAnswered || 
                                        result?.questionHistory?.length || 0;
                
                totalQuestionsAnswered += questionsAnswered;
                
                // Get experience and ensure it's a multiple of 5
                let xp = progress?.experience || result?.experience || 0;
                xp = Math.round(xp / 5) * 5;
                totalXP += xp;
            });

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
                                <span class="stat-label">Questions Answered:</span>
                                <span class="stat-value">${totalQuestionsAnswered}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Total XP:</span>
                                <span class="stat-value">${totalXP}</span>
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
            const loginDate = new Date(user.lastLogin).getTime();
            if (!isNaN(loginDate)) {
                dates.push(loginDate);
            }
        }

        // Add quiz completion dates and last active dates
        if (user.quizResults && user.quizResults.length > 0) {
            user.quizResults.forEach(result => {
                if (result.completedAt) {
                    const completedDate = new Date(result.completedAt).getTime();
                    if (!isNaN(completedDate)) {
                        dates.push(completedDate);
                    }
                }
                if (result.lastActive) {
                    const activeDate = new Date(result.lastActive).getTime();
                    if (!isNaN(activeDate)) {
                        dates.push(activeDate);
                    }
                }
                if (result.timestamp) {
                    const timestampDate = new Date(result.timestamp).getTime();
                    if (!isNaN(timestampDate)) {
                        dates.push(timestampDate);
                    }
                }
            });
        }

        // Add quiz progress dates if they exist
        if (user.quizProgress) {
            Object.values(user.quizProgress).forEach(progress => {
                if (progress.lastUpdated) {
                    const updatedDate = new Date(progress.lastUpdated).getTime();
                    if (!isNaN(updatedDate)) {
                        dates.push(updatedDate);
                    }
                }
            });
        }

        // Return most recent date or 0 if no valid dates found
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

            // Create a map of quiz results for easy lookup
            const quizResultsMap = new Map(
                user.quizResults.map(result => [result.quizName.toLowerCase(), result])
            );

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
                        // Get both quiz result and progress data
                        const result = quizResultsMap.get(quizName.toLowerCase());
                        const progress = user.quizProgress?.[quizName.toLowerCase()];
                        
                        // Get questions answered and experience from quiz progress first, then fall back to quiz result
                        const questionsAnswered = progress?.questionsAnswered || result?.questionsAnswered || 0;
                        const experience = progress?.experience || result?.experience || 0;
                        
                        // Calculate status based on quiz result and progress
                        const status = result?.score ? 'Completed' : 
                                     questionsAnswered > 0 ? 'In Progress' : 'Not Started';
                        
                        const score = result?.score || 0;
                        const lastActive = result ? this.formatDate(result.lastActive || result.completedAt) : 'Never';

                            return `
                            <div class="quiz-progress-item" style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                                <h4 style="margin: 0 0 10px 0;">${this.formatQuizName(quizName)}</h4>
                                <div class="progress-details" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                    <div>
                                        <strong>Progress:</strong> 
                                        <span class="${status.toLowerCase().replace(' ', '-')}">${status}</span>
                                    </div>
                                    <div>
                                        <strong>Questions:</strong> 
                                        <span>${questionsAnswered}/15</span>
                                    </div>
                                    <div>
                                        <strong>XP:</strong> 
                                        <span>${experience}/300</span>
                                    </div>
                                    <div>
                                        <strong>Last Active:</strong> 
                                        <span>${lastActive}</span>
                                    </div>
                                    ${score ? `
                                        <div>
                                            <strong>Score:</strong> 
                                            <span>${score}%</span>
                                        </div>
                                    ` : ''}
                                </div>
                                <div style="margin-top: 10px; text-align: right;">
                                    <button 
                                        class="reset-quiz-btn" 
                                        onclick="event.stopPropagation(); this.closest('.quiz-progress-item').dispatchEvent(new CustomEvent('resetQuiz', {detail: {quizName: '${quizName}'}}))"
                                        style="padding: 5px 10px; background-color: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                        Reset Progress
                                    </button>
                                    <button 
                                        class="view-questions-btn" 
                                        onclick="event.stopPropagation(); this.closest('.quiz-progress-item').dispatchEvent(new CustomEvent('viewQuestions', {detail: {quizName: '${quizName}'}}))"
                                        style="padding: 5px 10px; margin-left: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                        View Questions
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    </div>
                `;
            
            overlay.appendChild(content);
            document.body.appendChild(overlay);

            // Add event listeners for reset buttons and view questions
            const quizItems = content.querySelectorAll('.quiz-progress-item');
            quizItems.forEach(item => {
                item.addEventListener('resetQuiz', async (e) => {
                    const quizName = e.detail.quizName;
                    if (confirm(`Are you sure you want to reset progress for ${this.formatQuizName(quizName)}?`)) {
                        try {
                            await this.resetQuizProgress(username, quizName);
                            // Refresh the user list and details view
                            await this.loadUsers();
                            await this.updateDashboard();
                            this.showUserDetails(username);
                        } catch (error) {
                            console.error('Failed to reset quiz:', error);
                            this.showError(`Failed to reset ${this.formatQuizName(quizName)}`);
                        }
                    }
                });

                item.addEventListener('viewQuestions', (e) => {
                    const quizName = e.detail.quizName;
                    this.showQuestionDetails(username, quizName);
                });
            });

            // Add close button functionality
            const closeBtn = content.querySelector('.close-btn');
            closeBtn.addEventListener('click', () => overlay.remove());

            // Close on click outside
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                }
            });

        } catch (error) {
            console.error(`Error showing user details for ${username}:`, error);
            this.showError('Failed to load user details');
        }
    }

    async resetQuizProgress(username, quizName) {
        try {
            const response = await this.apiService.fetchWithAdminAuth(
                `${this.apiService.baseUrl}/admin/users/${username}/quiz-progress/${quizName}/reset`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.success) {
                throw new Error(response.error || 'Failed to reset quiz progress');
            }

            // Reload users to get fresh data
            await this.loadUsers();
            
            // Update the dashboard with new data
            await this.updateDashboard();

            return true;
        } catch (error) {
            console.error('Error resetting progress:', error);
            this.showError('Failed to reset progress');
            throw error;
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

    async showQuestionDetails(username, quizName) {
        try {
            const user = this.users.find(u => u.username === username);
            if (!user) {
                console.error(`User ${username} not found`);
                return;
            }

            console.log('Found user:', user);
            console.log('Looking for quiz:', quizName);

            // Find the quiz result with question history
            const quizResult = user.quizResults.find(r => 
                r.quizName.toLowerCase() === quizName.toLowerCase() ||
                r.quizName.replace(/-/g, '').toLowerCase() === quizName.replace(/-/g, '').toLowerCase()
            );
            
            console.log('Quiz result found:', quizResult);
            
            // Get quiz progress data
                const progress = user.quizProgress?.[quizName.toLowerCase()];
                console.log('Quiz progress found:', progress);
                
            // If no quiz result or progress data found
            if ((!quizResult || !quizResult.questionHistory || quizResult.questionHistory.length === 0) &&
                (!progress || !progress.questionHistory || progress.questionHistory.length === 0)) {
                console.log('Question history missing or empty:', {
                    hasQuizResult: !!quizResult,
                    hasHistory: quizResult ? !!quizResult.questionHistory : false,
                        historyLength: quizResult?.questionHistory?.length,
                        hasProgress: !!progress,
                        progressHistoryLength: progress?.questionHistory?.length
                });
                this.showError('No question history available for this quiz');
                return;
            }

            // Use progress data if available, otherwise use quiz result
            const questionHistory = progress?.questionHistory || quizResult?.questionHistory || [];

            // Create questions overlay
            const questionsOverlay = document.createElement('div');
            questionsOverlay.className = 'questions-overlay';
            questionsOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1100;
            `;

            const content = document.createElement('div');
            content.className = 'questions-content';
            content.style.cssText = `
                background: white;
                padding: 2rem;
                border-radius: 8px;
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
            `;

            content.innerHTML = `
                <div class="questions-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>${this.formatQuizName(quizName)} - Question History</h3>
                    <button class="close-btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
                </div>
                <div class="questions-list">
                    ${questionHistory.map((item, index) => `
                        <div class="question-item" style="
                            margin-bottom: 1.5rem;
                            padding: 1rem;
                            border: 1px solid #eee;
                            border-radius: 4px;
                            background: ${item.isCorrect ? '#f0fff0' : '#fff0f0'};
                        ">
                            <div style="margin-bottom: 0.5rem;">
                                <strong>Question ${index + 1}:</strong>
                                <div style="margin: 0.5rem 0;">${item.questionText || 'Question text not available'}</div>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <strong>Selected Answer:</strong>
                                <div style="margin: 0.5rem 0;">${item.selectedAnswerText || 'Answer text not available'}</div>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span>
                                    <strong>Experience:</strong> 
                                    <span style="color: ${item.experienceGained >= 0 ? 'green' : 'red'}">
                                        ${item.experienceGained >= 0 ? '+' : ''}${item.experienceGained || 0}
                                    </span>
                                </span>
                                <span>
                                    <strong>Result:</strong> 
                                    <span style="color: ${item.isCorrect ? 'green' : 'red'}">
                                        ${item.isCorrect ? 'Pass' : 'Fail'}
                                    </span>
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            questionsOverlay.appendChild(content);
            document.body.appendChild(questionsOverlay);

            // Add close button functionality
            const closeBtn = content.querySelector('.close-btn');
            closeBtn.addEventListener('click', () => questionsOverlay.remove());

            // Close on click outside
            questionsOverlay.addEventListener('click', (e) => {
                if (e.target === questionsOverlay) {
                    questionsOverlay.remove();
                }
            });

        } catch (error) {
            console.error('Error showing question details:', error);
            this.showError('Failed to load question details');
        }
    }

    showLoading(message = 'Loading...') {
        let loadingOverlay = document.querySelector('.loading-overlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;
            
            const content = document.createElement('div');
            content.style.cssText = `
                text-align: center;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            `;
            
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            spinner.style.cssText = `
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                margin: 0 auto 10px;
                animation: spin 1s linear infinite;
            `;
            
            // Add keyframe animation for spinner
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'loading-message';
            messageDiv.textContent = message;
            
            content.appendChild(spinner);
            content.appendChild(messageDiv);
            loadingOverlay.appendChild(content);
            document.body.appendChild(loadingOverlay);
        } else {
            const messageDiv = loadingOverlay.querySelector('.loading-message');
            if (messageDiv) {
                messageDiv.textContent = message;
            }
            loadingOverlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

// Export the AdminDashboard class directly
export { AdminDashboard }; 