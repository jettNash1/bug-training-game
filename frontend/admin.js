import { APIService } from './api-service.js';

class AdminDashboard {
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
                        if (user.quizProgress.communication) {
                            const progress = user.quizProgress.communication;
                            console.log(`Loaded progress for ${user.username}:`, {
                                experience: progress.experience,
                                questionsAnswered: progress.questionHistory?.length || 0,
                                lastUpdated: progress.lastUpdated,
                                progress: Math.round((progress.experience / 300) * 100) + '%'
                            });
                        }
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
            console.log(`Fetching progress for ${username} from API...`);
            const response = await this.apiService.fetchWithAdminAuth(
                `${this.apiService.baseUrl}/admin/users/${username}/quiz-results`
            );

            if (!response.ok) {
                console.error(`Failed to fetch progress for ${username}: ${response.status}`);
                return this.getDefaultScores();
            }

            const text = await response.text();
            console.log(`Raw response for ${username}:`, text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error(`Failed to parse JSON for ${username}:`, e);
                return this.getDefaultScores();
            }
            
            if (!data.success || !data.data) {
                console.log(`No progress data for ${username}, returning defaults`);
                return this.getDefaultScores();
            }

            console.log(`Processing quiz results for ${username}:`, data.data);

            // Convert the quiz progress data into our expected format
            const scores = this.quizTypes.map(quizName => {
                // Find the matching quiz result
                const quizData = data.data.find(result => 
                    this.normalizeQuizName(result.quizName) === this.normalizeQuizName(quizName)
                ) || {};

                const score = {
                    quizName,
                    score: quizData.score || 0,
                    experience: quizData.experience || 0,
                    questionsAnswered: quizData.questionsAnswered || 0,
                    currentScenario: quizData.questionsAnswered || 0,
                    lastActive: quizData.completedAt || null,
                    answers: quizData.answers || []
                };

                console.log(`Processed ${quizName} for ${username}:`, score);
                return score;
            });

            console.log(`Completed processing progress for ${username}`);
            return scores;
        } catch (error) {
            console.error(`Failed to load progress for ${username}:`, error);
            return this.getDefaultScores();
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

    updateDashboard() {
        console.log('Updating dashboard with users:', this.users); // Debug log
        console.log('User scores:', Object.fromEntries(this.userScores)); // Debug log
        
        // Update total users count immediately
        const totalUsersElement = document.getElementById('totalUsers');
        if (totalUsersElement) {
            totalUsersElement.textContent = this.users.length;
            console.log('Updated total users:', this.users.length);
        }

        try {
            console.log('Starting statistics update...'); // Debug log
        this.updateStatistics();
            console.log('Statistics updated, updating user list...'); // Debug log
        this.updateUserList();
            console.log('Dashboard update complete'); // Debug log
        } catch (error) {
            console.error('Error during dashboard update:', error);
            this.showError('Failed to update dashboard');
        }
    }

    updateStatistics() {
        const totalUsersElement = document.getElementById('totalUsers');
        const activeUsersElement = document.getElementById('activeUsers');
        const averageCompletionElement = document.getElementById('averageCompletion');

        if (!this.users || !this.users.length) {
            console.log('No users to update statistics for');
            if (totalUsersElement) totalUsersElement.textContent = '0';
            if (activeUsersElement) activeUsersElement.textContent = '0';
            if (averageCompletionElement) averageCompletionElement.textContent = '0%';
            return;
        }

        const today = new Date().setHours(0, 0, 0, 0);
        let activeUsers = 0;
        let totalProgress = 0;
        let usersWithProgress = 0;

        console.log('Calculating statistics for', this.users.length, 'users');

        this.users.forEach(user => {
            // Check if user was active today
            const communicationProgress = user.quizProgress?.communication;
            if (communicationProgress?.lastUpdated) {
                const activeDate = new Date(communicationProgress.lastUpdated).setHours(0, 0, 0, 0);
                if (activeDate === today) {
                    activeUsers++;
                    console.log(`${user.username} was active today`);
                }
            }

            // Calculate user's progress
            const progress = this.calculateUserProgress(user);
            if (progress > 0) {
                totalProgress += progress;
                usersWithProgress++;
                console.log(`${user.username} has progress:`, progress);
            }
        });

        const averageProgress = usersWithProgress > 0 ? Math.round(totalProgress / usersWithProgress) : 0;

        console.log('Statistics calculated:', {
            totalUsers: this.users.length,
            activeUsers,
            averageProgress
        });

        if (totalUsersElement) totalUsersElement.textContent = this.users.length;
        if (activeUsersElement) activeUsersElement.textContent = activeUsers;
        if (averageCompletionElement) averageCompletionElement.textContent = `${averageProgress}%`;
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
        const communicationProgress = user.quizProgress?.communication;
        if (!communicationProgress) return 0;
        
        const earnedXP = communicationProgress.experience || 0;
        const maxXP = 300;
        
        console.log(`Calculating progress for ${user.username}:`, {
            experience: earnedXP,
            maxXP,
            progress: Math.round((earnedXP / maxXP) * 100)
        });
        
        return Math.round((earnedXP / maxXP) * 100);
    }

    // Helper method to get last active date
    getLastActiveDate(user) {
        const communicationProgress = user.quizProgress?.communication;
        if (!communicationProgress?.lastUpdated) return 0;
        return new Date(communicationProgress.lastUpdated).getTime();
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
                        // Get the quiz progress data
                        const quizProgress = user.quizProgress?.[quizName];
                        console.log(`Raw quiz progress for ${quizName}:`, quizProgress);

                        if (!quizProgress) {
                            return `
                                <div class="quiz-progress-item" style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                    <h4 style="margin: 0 0 10px 0">${this.formatQuizName(quizName)}</h4>
                                    <div class="quiz-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                                        <div class="stat-item">Progress: <span class="stat-value">0%</span></div>
                                        <div class="stat-item">Questions: <span class="stat-value">0/15</span></div>
                                        <div class="stat-item">XP: <span class="stat-value">0/300</span></div>
                                        <div class="stat-item">Last Active: <span class="stat-value">Never</span></div>
                                    </div>
                                </div>
                            `;
                        }

                        // Use direct values from quiz progress
                        const earnedXP = quizProgress.experience || 0;
                        const questionsAnswered = quizProgress.questionHistory?.length || 0;
                        const percentComplete = Math.round((earnedXP / 300) * 100);

                        console.log(`Processed quiz data for ${quizName}:`, {
                            experience: earnedXP,
                            questionsAnswered,
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
        
        // Get the communication quiz progress
        const communicationQuiz = scores.find(score => score.quizName === 'communication');
        if (!communicationQuiz) return 0;
        
        // Calculate progress based on questions answered (out of 15)
        const questionsAnswered = communicationQuiz.questionsAnswered || 0;
        return Math.round((questionsAnswered / 15) * 100);
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

// Export the AdminDashboard class directly
export { AdminDashboard }; 