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
            'raising-tickets', 'reports', 'cms-testing', 'email-testing', 'content-copy',
            'locale-testing', 'script-metrics-troubleshooting','standard-script-testing',
            'test-types-tricks'
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
        
        // If we're on the admin login page and there's no token, just return
        if (currentPath.includes('admin-login.html') && !adminToken) {
            console.log('On admin login page without token, allowing access');
            return;
        }

        // Always verify the token if it exists
        let isTokenValid = false;
        if (adminToken) {
            isTokenValid = await this.verifyAdminToken(adminToken);
            console.log('Token validation result:', isTokenValid);
        }

        // If token is invalid or missing, redirect to login unless already there
        if (!isTokenValid) {
            console.log('Invalid or missing token, redirecting to login');
            localStorage.removeItem('adminToken'); // Clear invalid token
            if (!currentPath.includes('admin-login.html')) {
                window.location.href = '/pages/admin-login.html';
            }
            return;
        }

        // If we have a valid token and we're on the login page, redirect to admin panel
        if (isTokenValid && currentPath.includes('admin-login.html')) {
            console.log('Valid token on login page, redirecting to admin panel');
            window.location.href = '/pages/admin.html';
            return;
        }

        // If we have a valid token and we're on the admin panel, load the dashboard
        if (isTokenValid && currentPath.includes('admin.html')) {
            console.log('Valid token on admin panel, loading dashboard');
            await this.loadUsers();
            this.setupEventListeners();
            await this.updateDashboard();
            await this.loadAllUserProgress();
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
            console.log('Raw API response:', JSON.stringify(response, null, 2));

            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch users');
            }

            const userData = response.data || [];
            console.log('User data array:', JSON.stringify(userData, null, 2));

            if (!Array.isArray(userData)) {
                throw new Error('Invalid response format: expected array of users');
            }

            // Store the processed users directly
            this.users = userData;

            // Log the final processed users
            console.log('Final processed users:', JSON.stringify(this.users, null, 2));
            
            // Update the dashboard with the loaded users
            this.updateDashboard();
            
            return this.users;
        } catch (error) {
            console.error('Failed to load users:', error);
            this.showError(`Failed to load users: ${error.message}`);
            throw error;
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
        // Set up search and sort functionality
        const searchInput = document.getElementById('userSearch');
        const sortSelect = document.getElementById('sortBy');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.updateUserList());
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.updateUserList());
        }

        // Set up quiz reset event delegation
        document.addEventListener('resetQuiz', async (event) => {
            const { username, quizName } = event.detail;
            if (confirm(`Are you sure you want to reset progress for ${username}'s ${this.formatQuizName(quizName)} quiz?`)) {
                await this.resetQuizProgress(username, quizName);
                // Refresh the user details view
                await this.showUserDetails(username);
            }
        });

        // Set up view questions event delegation
        document.addEventListener('viewQuestions', async (event) => {
            const { quizName } = event.detail;
            await this.showQuizQuestions(quizName);
        });
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

        let totalQuestionsAnswered = 0;
        const totalPossibleQuestions = this.quizTypes.length * 15; // 15 questions per quiz

        // Sum up questions answered across all quizzes
        this.quizTypes.forEach(quizType => {
            const progress = user.quizProgress?.[quizType.toLowerCase()];
            const result = user.quizResults?.find(r => r.quizName.toLowerCase() === quizType.toLowerCase());
            
            // Get questions answered from progress first, then fall back to result
            const questionsAnswered = progress?.questionsAnswered || 
                                    progress?.questionHistory?.length || 
                                    result?.questionsAnswered || 
                                    result?.questionHistory?.length || 0;
            
            totalQuestionsAnswered += questionsAnswered;
        });

        // Calculate progress as percentage of total possible questions
        const progress = (totalQuestionsAnswered / totalPossibleQuestions) * 100;

        console.log(`Progress calculation for ${user.username}:`, {
            totalQuestionsAnswered,
            totalPossibleQuestions,
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
            // Get user data
            const response = await this.apiService.fetchWithAdminAuth(`${this.apiService.baseUrl}/admin/users/${username}`);
            if (!response.success) {
                throw new Error('Failed to fetch user details');
            }

            const user = response.data;
            const isInterviewAccount = user.userType === 'interview_candidate';

            // Create the overlay
            const overlay = document.createElement('div');
            overlay.className = 'user-details-overlay';
            overlay.innerHTML = `
                <div class="user-details-content">
                    <div class="details-header">
                        <h3>${username}'s Details</h3>
                        <button class="close-btn" aria-label="Close details">&times;</button>
                    </div>
                    <div class="user-actions">
                        <button class="action-button" id="resetAllProgressBtn">Reset All Progress</button>
                        <button class="action-button" id="resetPasswordBtn">Reset Password</button>
                        <button class="action-button" id="deleteUserBtn">Delete User</button>
                        ${!isInterviewAccount ? '<button class="action-button" id="registerUserBtn">Register User</button>' : ''}
                    </div>
                    <div class="quiz-progress-list">
                        ${this.quizTypes.map(quiz => {
                            const quizLower = quiz.toLowerCase();
                            const isVisible = isInterviewAccount ? 
                                user.allowedQuizzes?.includes(quizLower) : 
                                !user.hiddenQuizzes?.includes(quizLower);
                            
                            return `
                                <div class="quiz-progress-item">
                                    <h4>${this.formatQuizName(quiz)}</h4>
                                    <div class="quiz-stats">
                                        <div class="stat-item">
                                            <span>Visibility:</span>
                                            <label class="toggle-switch">
                                                <input type="checkbox" 
                                                       data-quiz="${quiz}" 
                                                       ${isVisible ? 'checked' : ''} 
                                                       ${isInterviewAccount ? 'disabled' : ''}>
                                                <span class="slider"></span>
                                                <span class="toggle-label">${isVisible ? 'Visible' : 'Hidden'}</span>
                                            </label>
                                        </div>
                                        <button class="view-questions-btn" data-quiz="${quiz}">View Questions</button>
                                        <button class="reset-progress-btn" data-quiz="${quiz}">Reset Progress</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;

            // Create a map of quiz results for easy lookup
            const quizResultsMap = new Map(
                this.users.find(u => u.username === username).quizResults.map(result => [result.quizName.toLowerCase(), result])
            );

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
                        const progress = this.users.find(u => u.username === username).quizProgress?.[quizName.toLowerCase()];
                        
                        // Get questions answered and experience from quiz progress first, then fall back to quiz result
                        const questionsAnswered = progress?.questionsAnswered || result?.questionsAnswered || 0;
                        const experience = progress?.experience || result?.experience || 0;
                        
                        // Calculate status based on questions answered
                        const status = questionsAnswered === 15 ? 'Completed' : 
                                       questionsAnswered > 0 ? 'In Progress' : 
                                       'Not Started';
                        
                        const score = result?.score || 0;
                        const lastActive = result ? this.formatDate(result.lastActive || result.completedAt) : 'Never';

                        // Get user data for visibility check
                        const user = this.users.find(u => u.username === username);
                        const isInterviewAccount = user?.userType === 'interview_candidate';
                        const isHidden = user?.hiddenQuizzes?.includes(quizName.toLowerCase());
                        const isAllowed = user?.allowedQuizzes?.includes(quizName.toLowerCase());

                        // For interview accounts, quiz is visible only if it's in allowedQuizzes
                        const isVisible = isInterviewAccount ? isAllowed : !isHidden;

                        return `
                            <div class="quiz-progress-item" style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                                <h4 style="margin: 0 0 10px 0;">${this.formatQuizName(quizName)}</h4>
                                <div class="progress-details" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                    <div>
                                        <strong>Progress:</strong> 
                                        <span class="${status === 'Completed' ? 'text-success' : 
                                                     status === 'In Progress' ? 'text-warning' : 
                                                     'text-muted'}">${status}</span>
                                    </div>
                                    <div>
                                        <strong>Score:</strong> 
                                        <span>${score}%</span>
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
                                    <div>
                                        <strong>Visibility:</strong>
                                        <label class="visibility-toggle" style="display: inline-flex; align-items: center; gap: 5px;">
                                            <input type="checkbox" 
                                                   class="quiz-visibility-toggle"
                                                   data-quiz-name="${quizName}"
                                                   ${isVisible ? 'checked' : ''}
                                                   ${isInterviewAccount ? 'disabled' : ''}
                                                   style="margin: 0;">
                                            <span>${isVisible ? 'Visible' : 'Hidden'}</span>
                                        </label>
                                    </div>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                                    <button class="reset-quiz-btn"
                                        data-quiz-name="${quizName}"
                                        style="padding: 5px 10px; background-color: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                        Reset Progress
                                    </button>
                                    <button class="view-questions-btn"
                                        data-quiz-name="${quizName}"
                                        style="padding: 5px 10px; background-color: #4444ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                        View Questions
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; 
                            display: flex; justify-content: center; gap: 20px;">
                    <button class="reset-all-btn" 
                        style="padding: 10px 20px; background-color: #dc3545; color: white; border: none; 
                               border-radius: 4px; cursor: pointer; font-weight: 500;">
                        Reset All Progress
                    </button>
                    <button class="reset-password-btn" 
                        style="padding: 10px 20px; background-color: var(--secondary-color); color: white; 
                               border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                        Reset Password
                    </button>
                    <button class="delete-user-btn" 
                        style="padding: 10px 20px; background-color: #dc3545; color: white; 
                               border: 2px solid #dc3545; border-radius: 4px; cursor: pointer; font-weight: 500;">
                        Delete User
                    </button>
                </div>
            `;
            
            overlay.appendChild(content);
            document.body.appendChild(overlay);

            // Add event listeners for buttons
            content.querySelectorAll('.reset-quiz-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const quizName = e.target.dataset.quizName;
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
            });

            // Add event listeners for quiz visibility toggles
            content.querySelectorAll('.quiz-visibility-toggle').forEach(toggle => {
                toggle.addEventListener('change', async (e) => {
                    const quizName = e.target.dataset.quizName;
                    const isVisible = e.target.checked;
                    
                    try {
                        const response = await this.apiService.fetchWithAdminAuth(
                            `${this.apiService.baseUrl}/admin/users/${username}/quiz-visibility/${quizName}`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ isVisible })
                            }
                        );

                        if (!response.success) {
                            throw new Error(response.message || 'Failed to update quiz visibility');
                        }

                        // Update the toggle label
                        const label = e.target.nextElementSibling;
                        if (label) {
                            label.textContent = isVisible ? 'Visible' : 'Hidden';
                        }

                        // Refresh user data
                        await this.loadUsers();
                    } catch (error) {
                        console.error('Failed to update quiz visibility:', error);
                        this.showError(`Failed to update visibility for ${this.formatQuizName(quizName)}`);
                        // Revert the toggle
                        e.target.checked = !isVisible;
                    }
                });
            });

            // Add event listeners for view questions buttons
            content.querySelectorAll('.view-questions-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const quizName = e.target.dataset.quizName;
                    console.log('View questions clicked for:', { quizName, username });
                    await this.showQuizQuestions(quizName, username);
                });
            });

            // Add event listener for reset all button
            content.querySelector('.reset-all-btn').addEventListener('click', async () => {
                if (confirm(`Are you sure you want to reset ALL quiz progress for ${username}? This action cannot be undone.`)) {
                    try {
                        await this.resetAllProgress(username);
                        // Close the overlay after successful reset
                        overlay.remove();
                    } catch (error) {
                        console.error('Failed to reset all progress:', error);
                    }
                }
            });

            // Add event listener for reset password button
            content.querySelector('.reset-password-btn').addEventListener('click', async () => {
                if (confirm(`Are you sure you want to change the password for ${username}?`)) {
                    try {
                        await this.resetUserPassword(username);
                    } catch (error) {
                        console.error('Failed to reset password:', error);
                    }
                }
            });

            // Add event listener for delete user button
            content.querySelector('.delete-user-btn').addEventListener('click', async () => {
                try {
                    await this.deleteUser(username);
                } catch (error) {
                    console.error('Failed to delete user:', error);
                }
            });

            // Add event listener for register user button
            const registerUserBtn = content.querySelector('.register-user-btn');
            if (registerUserBtn) {
                registerUserBtn.addEventListener('click', () => this.registerUser(username));
            }

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
            console.error('Error showing user details:', error);
            this.showError('Failed to load user details');
        }
    }

    async resetQuizProgress(username, quizName) {
        try {
            // Special handling for CMS-Testing
            let normalizedQuizName = quizName.toLowerCase();
            if (normalizedQuizName === 'cms-testing') {
                normalizedQuizName = 'cms-testing';
            } else {
                normalizedQuizName = quizName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
            }
            
            console.log('Resetting quiz progress:', { username, quizName, normalizedQuizName });

            const response = await this.apiService.fetchWithAdminAuth(
                `${this.apiService.baseUrl}/admin/users/${username}/quiz-progress/${normalizedQuizName}/reset`,
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
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
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

    async showQuizQuestions(quizName, username) {
        try {
            // Create overlay container
            const overlay = document.createElement('div');
            overlay.className = 'user-details-overlay';
            overlay.style.zIndex = '1002'; // Ensure it's above other overlays

            // Create content container
            const content = document.createElement('div');
            content.className = 'user-details-content';
            content.innerHTML = `
                <style>
                    .questions-table tr.passed {
                        background-color: rgba(75, 181, 67, 0.1);
                    }
                    .questions-table tr.failed {
                        background-color: rgba(255, 68, 68, 0.1);
                    }
                    .questions-table tr.passed td {
                        border-bottom: 1px solid rgba(75, 181, 67, 0.2);
                    }
                    .questions-table tr.failed td {
                        border-bottom: 1px solid rgba(255, 68, 68, 0.2);
                    }
                    .status-badge {
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-weight: bold;
                        font-size: 0.9em;
                    }
                    .status-badge.passed {
                        background-color: #4BB543;
                        color: white;
                    }
                    .status-badge.failed {
                        background-color: #FF4444;
                        color: white;
                    }
                </style>
                <div class="details-header">
                    <h3>Questions for ${this.formatQuizName(quizName)}</h3>
                    <button class="close-btn" aria-label="Close questions overlay">&times;</button>
                </div>
                <div class="questions-list">
                    <div class="loading">Loading questions...</div>
                </div>
            `;

            // Add content to overlay and overlay to body
            overlay.appendChild(content);
            document.body.appendChild(overlay);

            // Add close button functionality
            const closeBtn = content.querySelector('.close-btn');
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
            });

            // Fetch questions data
            console.log('Fetching questions for:', { username, quizName });
            const response = await this.apiService.getQuizQuestions(username, quizName);
            console.log('Questions response:', response);
            
            const questionsList = content.querySelector('.questions-list');

            if (!response.success || !response.data) {
                questionsList.innerHTML = '<p class="error">Failed to load questions data.</p>';
                return;
            }

            const { questionHistory = [], totalQuestions = 0, score = 0, experience = 0 } = response.data;
            console.log('Question history:', questionHistory);

            if (!Array.isArray(questionHistory) || questionHistory.length === 0) {
                questionsList.innerHTML = '<p>No questions have been answered in this quiz yet.</p>';
                return;
            }

            // Display quiz summary
            questionsList.innerHTML = `
                <div class="quiz-summary" style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <div>
                            <strong>Questions Answered:</strong> 
                            <span>${totalQuestions}/15</span>
                        </div>
                        <div>
                            <strong>Score:</strong> 
                            <span>${score}%</span>
                        </div>
                        <div>
                            <strong>Experience:</strong> 
                            <span>${experience}/300</span>
                        </div>
                    </div>
                </div>
                <div class="questions-table-container" style="overflow-x: auto;">
                    <table class="questions-table" style="width: 100%; border-collapse: collapse; border-spacing: 0;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="width: 5%; padding: 12px; border-bottom: 2px solid #dee2e6;">ID</th>
                                <th style="width: 35%; padding: 12px; border-bottom: 2px solid #dee2e6;">Description</th>
                                <th style="width: 35%; padding: 12px; border-bottom: 2px solid #dee2e6;">Selected Answer</th>
                                <th style="width: 10%; padding: 12px; border-bottom: 2px solid #dee2e6;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${questionHistory.map(record => {
                                const status = record.status || 
                                    (record.selectedAnswer.experience > 0 ? 'passed' : 'failed');

                                return `
                                    <tr class="${status}">
                                        <td style="text-align: center; padding: 12px;">${record.id}</td>
                                        <td style="padding: 12px;">${record.scenario.description}</td>
                                        <td style="padding: 12px;">${record.selectedAnswer.text}</td>
                                        <td style="padding: 12px; text-align: center;">
                                            <span class="status-badge ${status}">
                                                ${status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;

        } catch (error) {
            console.error('Error showing quiz questions:', error);
            if (content) {
                const questionsList = content.querySelector('.questions-list');
                if (questionsList) {
                    questionsList.innerHTML = '<p class="error">An error occurred while loading questions.</p>';
                }
            }
        }
    }

    async resetAllProgress(username) {
        try {
            console.log('Resetting all progress for:', username);
            
            // Get all quizzes that have any progress
            const user = this.users.find(u => u.username === username);
            if (!user) {
                throw new Error('User not found');
            }

            // Get quizzes with progress
            const quizzesWithProgress = this.quizTypes.filter(quizType => {
                const progress = user.quizProgress?.[quizType.toLowerCase()];
                const result = user.quizResults?.find(r => r.quizName.toLowerCase() === quizType.toLowerCase());
                const questionsAnswered = progress?.questionsAnswered || 
                                        progress?.questionHistory?.length || 
                                        result?.questionsAnswered || 
                                        result?.questionHistory?.length || 0;
                return questionsAnswered > 0;
            });

            if (quizzesWithProgress.length === 0) {
                this.showError('No quiz progress to reset');
                return;
            }

            // Reset each quiz
            for (const quizName of quizzesWithProgress) {
                await this.resetQuizProgress(username, quizName);
            }

            // Refresh the data
            await this.loadUsers();
            await this.updateDashboard();
            
            return true;
        } catch (error) {
            console.error('Error resetting all progress:', error);
            this.showError('Failed to reset all progress');
            throw error;
        }
    }

    async resetUserPassword(username) {
        try {
            console.log('Resetting password for:', username);
            
            // Prompt for new password
            const newPassword = prompt('Enter the new password for ' + username + ':');
            
            // If user cancels the prompt or enters empty password, abort
            if (!newPassword) {
                console.log('Password reset cancelled');
                return false;
            }

            const response = await this.apiService.resetUserPassword(username, newPassword);

            if (!response.success) {
                throw new Error(response.error || 'Failed to reset password');
            }

            // Show success message
            alert(`Password has been successfully changed for ${username}`);
            return true;
        } catch (error) {
            console.error('Error resetting password:', error);
            this.showError('Failed to reset password');
            throw error;
        }
    }

    async deleteUser(username) {
        try {
            console.log('Deleting user:', username);
            
            // Double confirmation for deleting a user
            const confirmMessage = `Are you sure you want to delete user ${username}? This action cannot be undone.`;
            if (!confirm(confirmMessage)) {
                return false;
            }

            // Second confirmation with typing username
            const confirmInput = prompt(`To confirm deletion, please type the username "${username}":`);
            if (confirmInput !== username) {
                alert('Username did not match. Deletion cancelled.');
                return false;
            }

            const response = await this.apiService.fetchWithAdminAuth(
                `${this.apiService.baseUrl}/admin/users/${username}`,
                {
                    method: 'DELETE'
                }
            );

            if (!response.success) {
                throw new Error(response.error || 'Failed to delete user');
            }

            // Remove any open overlays
            const overlays = document.querySelectorAll('.user-details-overlay');
            overlays.forEach(overlay => overlay.remove());

            // Refresh the users list
            await this.loadUsers();
            await this.updateDashboard();

            // Show success message
            alert(`User ${username} has been successfully deleted`);
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showError('Failed to delete user');
            throw error;
        }
    }

    async createInterviewAccount(username, password, selectedQuizzes) {
        try {
            const response = await this.apiService.fetchWithAdminAuth(
                `${this.apiService.baseUrl}/admin/create-interview-account`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        password,
                        allowedQuizzes: selectedQuizzes
                    })
                }
            );

            if (!response.success) {
                throw new Error(response.message || 'Failed to create interview account');
            }

            // Refresh the users list
            await this.loadUsers();
            await this.updateDashboard();

            return response;
        } catch (error) {
            console.error('Failed to create interview account:', error);
            this.showError('Failed to create interview account');
            throw error;
        }
    }

    showCreateInterviewAccountForm() {
        const overlay = document.createElement('div');
        overlay.className = 'user-details-overlay';
        
        const content = document.createElement('div');
        content.className = 'user-details-content';
        
        content.innerHTML = `
            <div class="details-header">
                <h3>Create Interview Account</h3>
                <button class="close-btn" style="position: absolute; right: 20px; top: 20px; 
                        padding: 5px 10px; cursor: pointer; background: none; border: none; font-size: 20px;">×</button>
            </div>
            <form id="interviewAccountForm" style="display: flex; flex-direction: column; gap: 15px; padding: 20px;">
                <div>
                    <label for="username">Username:</label>
                    <input type="text" id="username" required style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                <div>
                    <label for="password">Password:</label>
                    <input type="password" id="password" required style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                <div>
                    <label>Select Quizzes:</label>
                    <div class="quiz-selection" style="margin-top: 10px; max-height: 200px; overflow-y: auto;">
                        ${this.quizTypes.map(quiz => `
                            <div style="margin: 5px 0;">
                                <label style="display: flex; align-items: center; gap: 5px;">
                                    <input type="checkbox" value="${quiz}" class="quiz-checkbox">
                                    ${this.formatQuizName(quiz)}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <button type="submit" style="padding: 10px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Create Account
                </button>
            </form>
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Add form submission handler
        const form = content.querySelector('#interviewAccountForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = form.querySelector('#username').value;
            const password = form.querySelector('#password').value;
            const selectedQuizzes = Array.from(form.querySelectorAll('.quiz-checkbox:checked'))
                .map(checkbox => checkbox.value);

            try {
                await this.createInterviewAccount(username, password, selectedQuizzes);
                overlay.remove();
                this.showError('Interview account created successfully', 'success');
            } catch (error) {
                console.error('Failed to create interview account:', error);
            }
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
    }

    async registerUser(username) {
        try {
            // Create a modal for password input
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Register User: ${username}</h3>
                    <p>Please enter a password for this user:</p>
                    <form id="registerUserForm">
                        <div class="form-group">
                            <label for="password">Password:</label>
                            <input type="password" id="password" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password:</label>
                            <input type="password" id="confirmPassword" required minlength="6">
                        </div>
                        <div class="button-group">
                            <button type="submit" class="action-button">Register</button>
                            <button type="button" class="cancel-button">Cancel</button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);

            // Add event listeners
            const form = modal.querySelector('#registerUserForm');
            const cancelButton = modal.querySelector('.cancel-button');

            cancelButton.addEventListener('click', () => {
                modal.remove();
            });

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const password = form.querySelector('#password').value;
                const confirmPassword = form.querySelector('#confirmPassword').value;

                if (password !== confirmPassword) {
                    this.showError('Passwords do not match');
                    return;
                }

                try {
                    const response = await this.apiService.fetchWithAdminAuth(
                        `${this.apiService.baseUrl}/admin/register-user`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ username, password })
                        }
                    );

                    if (response.success) {
                        this.showSuccess('User registered successfully');
                        modal.remove();
                        // Refresh the user list
                        await this.loadUsers();
                    } else {
                        this.showError(response.message || 'Failed to register user');
                    }
                } catch (error) {
                    console.error('Error registering user:', error);
                    this.showError('Failed to register user');
                }
            });
        } catch (error) {
            console.error('Error showing registration modal:', error);
            this.showError('Failed to show registration form');
        }
    }
}

// Export the AdminDashboard class directly
export { AdminDashboard }; 