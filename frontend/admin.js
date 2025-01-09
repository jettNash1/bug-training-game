import { APIService } from './api-service.js';

class AdminDashboard {
    constructor() {
        this.apiService = {
            baseUrl: 'https://bug-training-game.onrender.com/api',
            fetchWithAdminAuth: async (url, options = {}) => {
                const adminToken = localStorage.getItem('adminToken');
                return fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        };
        
        this.userScores = new Map();
        this.users = [];
        this.quizTypes = [
            'communication', 'initiative', 'time-management', 'tester-mindset',
            'risk-analysis', 'risk-management', 'non-functional', 'test-support',
            'issue-verification', 'build-verification', 'issue-tracking-tools',
            'raising-tickets', 'reports', 'cms-testing'
        ];
        console.log('AdminDashboard initialized with empty userScores map'); // Debug log
    }

    async init() {
        console.log('Initializing AdminDashboard');
        const adminToken = localStorage.getItem('adminToken');
        const currentPath = window.location.pathname;
        
        console.log('Current path:', currentPath); // Debug log
        
        // Only verify token if we're on admin pages
        if (currentPath.includes('admin')) {
            console.log('On admin page, verifying token...'); // Debug log
            const isTokenValid = await this.verifyAdminToken(adminToken);
            console.log('Token valid:', isTokenValid); // Debug log
            
            if (currentPath.includes('admin-login.html')) {
                if (isTokenValid) {
                    console.log('Valid token on login page, redirecting to admin panel'); // Debug log
                    window.location.href = '/pages/admin.html';
                    return;
                }
            } else if (currentPath.includes('admin.html')) {
                if (!isTokenValid) {
                    console.log('Invalid token on admin panel, redirecting to login'); // Debug log
                    window.location.href = '/pages/admin-login.html';
                    return;
                }
                console.log('Valid token on admin panel, loading dashboard...'); // Debug log
                try {
                await this.loadDashboard();
                    console.log('Dashboard loaded successfully'); // Debug log
                } catch (error) {
                    console.error('Error loading dashboard:', error);
                    this.showError('Failed to load dashboard');
                }
            }
        } else {
            console.log('Not on admin page, skipping initialization'); // Debug log
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

    async handleAdminLogin(formData) {
        try {
            console.log('Attempting admin login...');
            
            const username = formData.get('username');
            const password = formData.get('password');
            
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            // Special handling for admin/admin123 credentials
            if (username === 'admin' && password === 'admin123') {
                // Create a mock token for admin
                const mockToken = btoa(`admin:${Date.now()}`);
                localStorage.setItem('adminToken', mockToken);
                window.location.href = '/pages/admin.html';
                return;
            }

            const response = await fetch(`${this.apiService.baseUrl}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password.trim()
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid credentials');
                }
                throw new Error(`Login failed with status: ${response.status}`);
            }

            // Only try to parse JSON if we have content
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                localStorage.setItem('adminToken', data.token);
            } else {
                console.warn('Response was not JSON, using default token');
                const defaultToken = btoa(`${username}:${Date.now()}`);
                localStorage.setItem('adminToken', defaultToken);
            }

            window.location.href = '/pages/admin.html';
        } catch (error) {
            console.error('Login error:', error);
            throw new Error('Login failed: ' + error.message);
        }
    }

    async handleAdminLogout() {
        localStorage.removeItem('adminToken');
        window.location.href = '/pages/admin-login.html';
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
            console.log('Fetching users...'); // Debug log
            const response = await fetch(`${this.apiService.baseUrl}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            console.log('User data received:', data); // Debug log

            if (!data.success) {
                throw new Error(data.message || 'Failed to load users');
            }

            this.users = data.users || [];
            console.log('Users loaded:', this.users); // Debug log

            // Process quiz results and progress for each user
            this.users.forEach(user => {
                // Ensure quizProgress exists
                if (!user.quizProgress) {
                    user.quizProgress = {};
                }

                // If we have quiz results, process them into the progress format
                if (user.quizResults && Array.isArray(user.quizResults)) {
                    user.quizResults.forEach(result => {
                        const quizName = result.quizName.toLowerCase();
                        if (!user.quizProgress[quizName]) {
                            user.quizProgress[quizName] = {
                                questionHistory: [],
                                lastUpdated: result.completedAt
                            };
                        }
                    });
                }

                // Process communication quiz specifically if it exists
                if (user.quizProgress.communication?.questionHistory) {
                    console.log(`Found communication progress for ${user.username}:`, 
                        user.quizProgress.communication);
                }
            });

            // Update the dashboard immediately after loading users
            this.updateDashboard();
            
            return true;
        } catch (error) {
            console.error('Failed to load users:', error);
            this.users = [];
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
            const response = await fetch(`${this.apiService.baseUrl}/users/${username}/progress`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load user progress');
            }

            const data = await response.json();
            console.log(`Raw progress data for ${username}:`, data);
            
            // Verify and initialize quiz progress data
            const verifiedData = this.verifyQuizProgress(data);
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
            const response = await fetch(`${this.apiService.baseUrl}/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            this.users = data.users.map(user => this.initializeQuizData(user));
            
            // Update statistics
            const stats = this.calculateStatistics();
            this.updateStatisticsDisplay(stats);
            
            // Update user list
            await this.updateUserList();
            
        } catch (error) {
            console.error('Error updating dashboard:', error);
            this.showError('Failed to update dashboard');
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
                progress: userProgress
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

    updateUserList() {
        const container = document.getElementById('usersList');
        if (!container) {
            console.error('User list container not found');
            return;
        }

        console.log('Starting updateUserList with container:', container);

        if (!this.users || !this.users.length) {
            console.log('No users to display');
            container.innerHTML = '<div class="no-users">No users found</div>';
            return;
        }

        console.log('Updating user list with:', this.users.length, 'users');

        const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
        const sortBy = document.getElementById('sortBy')?.value || 'username-asc';

        let filteredUsers = this.users.filter(user => 
            user.username.toLowerCase().includes(searchTerm)
        );

        console.log('Filtered users:', filteredUsers);

        // Sort users
        filteredUsers.sort((a, b) => {
            switch (sortBy) {
                case 'username-asc':
                    return a.username.localeCompare(b.username);
                case 'username-desc':
                    return b.username.localeCompare(a.username);
                case 'progress-high':
                    const progressA = this.calculateUserProgress(a);
                    const progressB = this.calculateUserProgress(b);
                    return progressB - progressA;
                case 'progress-low':
                    const progressLowA = this.calculateUserProgress(a);
                    const progressLowB = this.calculateUserProgress(b);
                    return progressLowA - progressLowB;
                case 'last-active':
                    const lastActiveA = this.getLastActiveDate(a);
                    const lastActiveB = this.getLastActiveDate(b);
                    return lastActiveB - lastActiveA;
                default:
                    return 0;
            }
        });

        console.log('Sorted users:', filteredUsers);

        try {
            // Clear existing content
            console.log('Clearing container');
            container.innerHTML = '';

            // Create and append user cards
            console.log('Creating user cards');
            filteredUsers.forEach((user, index) => {
                console.log(`Creating card ${index + 1} for user:`, user.username);
                
                const progress = this.calculateUserProgress(user);
                const lastActive = this.getLastActiveDate(user);

                const card = document.createElement('div');
                card.className = 'user-card';
                
                const cardContent = document.createElement('div');
                cardContent.className = 'user-header';
                cardContent.innerHTML = `
                    <h4>${user.username}</h4>
                    <div class="user-stats">
                        <div class="total-score">Overall Progress: ${progress.toFixed(1)}%</div>
                        <div class="last-active">Last Active: ${this.formatDate(lastActive)}</div>
                    </div>
                `;
                
                const viewDetailsBtn = document.createElement('button');
                viewDetailsBtn.className = 'view-details-btn';
                viewDetailsBtn.textContent = 'View Details';
                viewDetailsBtn.addEventListener('click', () => {
                    this.showUserDetails(user.username);
                });
                
                card.appendChild(cardContent);
                card.appendChild(viewDetailsBtn);
                container.appendChild(card);

                console.log(`Card ${index + 1} created and appended for ${user.username}`);
            });

            console.log('All cards created and appended');
            console.log('Container contents:', container.innerHTML);
        } catch (error) {
            console.error('Error creating user cards:', error);
            this.showError('Failed to display user list');
        }

        console.log('User list update complete');
    }

    // Helper method to calculate user progress
    calculateUserProgress(user) {
        if (!user.quizProgress) return 0;
        
        let completedQuizzes = 0;
        const totalProgress = this.quizTypes.reduce((sum, quizName) => {
            const quizProgress = user.quizProgress[quizName];
            if (!quizProgress?.questionHistory) return sum;
            
            const questionsAnswered = quizProgress.questionHistory.length;
            if (questionsAnswered > 0) completedQuizzes++;
            
            const quizPercentage = (questionsAnswered / 15) * 100;
            return sum + quizPercentage;
        }, 0);
        
        // Only average across quizzes that have been started
        const averageProgress = completedQuizzes > 0 ? totalProgress / completedQuizzes : 0;
        
        console.log(`Calculating total progress for ${user.username}:`, {
            totalProgress,
            completedQuizzes,
            averageProgress,
            quizTypes: this.quizTypes.length
        });
        
        return Math.round(averageProgress);
    }

    // Helper method to get last active date
    getLastActiveDate(user) {
        if (!user.quizProgress) return 0;
        
        const lastActiveDates = this.quizTypes
            .map(quizType => user.quizProgress[quizType]?.lastUpdated)
            .filter(date => date)
            .map(date => new Date(date).getTime());
        
        return lastActiveDates.length > 0 ? Math.max(...lastActiveDates) : 0;
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
        return isNaN(date.getTime()) ? 'Never' : date.toLocaleDateString();
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
}

// Export the AdminDashboard class directly
export { AdminDashboard }; 