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
            'test-types-tricks', 'automation-interview', 'fully-scripted', 'exploratory',
            'sanity-smoke'
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
            // Set up event listeners first
            this.setupEventListeners();
            // Then load data and update UI
            await this.loadUsers();
            await this.loadAllUserProgress();
            await this.updateDashboard();
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
        // Set up search, sort, and filter functionality
        const searchInput = document.getElementById('userSearch');
        const sortSelect = document.getElementById('sortBy');
        const accountTypeSelect = document.getElementById('accountType');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.updateUserList());
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.updateUserList());
        }
        if (accountTypeSelect) {
            accountTypeSelect.addEventListener('change', () => this.updateUserList());
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

        // Add View Quiz Scenarios button to the admin panel
        const controlsContainer = document.querySelector('.search-controls');
        if (controlsContainer) {
            const viewScenariosContainer = document.createElement('div');
            viewScenariosContainer.className = 'control-field';
            viewScenariosContainer.innerHTML = `
                <label class="visually-hidden">View Quiz Scenarios</label>
                <button id="viewQuizScenariosBtn" class="action-button">
                    View Quiz Scenarios
                </button>
            `;
            controlsContainer.appendChild(viewScenariosContainer);
            
            // Add event listener for the new button
            const viewScenariosBtn = document.getElementById('viewQuizScenariosBtn');
            if (viewScenariosBtn) {
                viewScenariosBtn.addEventListener('click', () => this.showQuizScenariosSelector());
            }
        }
    }

    async updateDashboard() {
        try {
            // Update statistics
            const stats = this.updateStatistics();
            this.updateStatisticsDisplay(stats);
            
            // Update user list with current filters
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
            
           /*console.log(`User ${user.username} stats:`, {
                lastActive: new Date(lastActive),
                progress: userProgress,
                completedQuizzes: user.quizResults?.length || 0
            });*/

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

        // Get existing search and sort controls
        const searchInput = document.getElementById('userSearch');
        const sortSelect = document.getElementById('sortBy');
        
        // Add account type filter if it doesn't exist
        let accountTypeSelect = document.getElementById('accountType');
        if (!accountTypeSelect) {
            const sortField = sortSelect.closest('.sort-field');
            if (sortField) {
                const accountTypeContainer = document.createElement('div');
                accountTypeContainer.className = 'sort-field';
                accountTypeContainer.innerHTML = `
                    <label for="accountType">Account Type</label>
                    <select id="accountType" aria-label="Filter by account type">
                        <option value="all">All Accounts</option>
                        <option value="interview">Interview Accounts</option>
                        <option value="regular">Regular Accounts</option>
                    </select>
                `;
                sortField.parentNode.insertBefore(accountTypeContainer, sortField.nextSibling);
                accountTypeSelect = accountTypeContainer.querySelector('select');
                
                // Add event listener for the new account type filter
                accountTypeSelect.addEventListener('change', () => this.updateUserList());
            }
        }

        if (!this.users || !this.users.length) {
            console.log('No users to display');
            container.innerHTML = '<div class="no-users">No users found</div>';
            return;
        }

        const searchTerm = searchInput?.value.toLowerCase() || '';
        const sortBy = sortSelect?.value || 'username-asc';
        const accountType = accountTypeSelect?.value || 'all';

        let filteredUsers = this.users.filter(user => {
            const matchesSearch = user.username.toLowerCase().includes(searchTerm);
            const matchesType = accountType === 'all' || 
                              (accountType === 'interview' && user.userType === 'interview_candidate') ||
                              (accountType === 'regular' && user.userType !== 'interview_candidate');
            return matchesSearch && matchesType;
        });

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
                
                // Prioritize values from quiz results over progress
                const questionsAnswered = result?.questionsAnswered || 
                                        result?.questionHistory?.length ||
                                        progress?.questionsAnswered || 
                                        progress?.questionHistory?.length || 0;
                
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
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <h4>${user.username}</h4>
                            <span class="account-type-badge" style="
                                padding: 4px 8px;
                                border-radius: 12px;
                                font-size: 0.8em;
                                font-weight: 500;
                                ${user.userType === 'interview_candidate' ? 
                                    'background-color: #ff9800; color: white;' : 
                                    'background-color: #4CAF50; color: white;'}">
                                ${user.userType === 'interview_candidate' ? 'Interview' : 'Regular'}
                            </span>
                        </div>
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
            container.innerHTML = '<div class="no-users">No users match your search criteria</div>';
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
            
            // Prioritize values from quiz results over progress
            const questionsAnswered = result?.questionsAnswered || 
                                    result?.questionHistory?.length ||
                                    progress?.questionsAnswered || 
                                    progress?.questionHistory?.length || 0;
            
            totalQuestionsAnswered += questionsAnswered;
        });

        // Calculate progress as percentage of total possible questions
        const progress = (totalQuestionsAnswered / totalPossibleQuestions) * 100;

        /*console.log(`Progress calculation for ${user.username}:`, {
            totalQuestionsAnswered,
            totalPossibleQuestions,
            progress
        });*/

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
            const user = this.users.find(u => u.username === username);
            if (!user) {
                throw new Error('User not found');
            }

            const isInterviewAccount = user.userType === 'interview_candidate';
            // For interview accounts, allowedQuizzes means visible, everything else is hidden
            // For regular accounts, hiddenQuizzes means hidden, everything else is visible
            const allowedQuizzes = (user.allowedQuizzes || []).map(q => q.toLowerCase());
            const hiddenQuizzes = (user.hiddenQuizzes || []).map(q => q.toLowerCase());

            console.log('User details:', {
                username,
                isInterviewAccount,
                userType: user.userType,
                allowedQuizzes,
                hiddenQuizzes
            });

            // Create the overlay
            const overlay = document.createElement('div');
            overlay.className = 'user-details-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'user-details-title');
            
            const content = document.createElement('div');
            content.className = 'user-details-content';
            
            content.innerHTML = `
                <div class="details-header">
                    <h3 id="user-details-title">${username}'s Progress</h3>
                    <button class="close-btn" aria-label="Close details" tabindex="0">×</button>
                </div>
                <div class="quiz-progress-list">
                    ${this.quizTypes
                        .slice()
                        .sort((a, b) => this.formatQuizName(a).localeCompare(this.formatQuizName(b)))
                        .map(quizName => {
                            const quizLower = quizName.toLowerCase();
                            
                            // For interview accounts:
                            //   - Visible (checked) if in allowedQuizzes
                            //   - Hidden (unchecked) if not in allowedQuizzes
                            // For regular accounts:
                            //   - Visible (checked) if not in hiddenQuizzes
                            //   - Hidden (unchecked) if in hiddenQuizzes
                            const isInAllowedQuizzes = allowedQuizzes.includes(quizLower);
                            const isInHiddenQuizzes = hiddenQuizzes.includes(quizLower);
                            
                            // Determine visibility based on account type
                            const isVisible = isInterviewAccount ? isInAllowedQuizzes : !isInHiddenQuizzes;
                            
                            console.log('Quiz visibility details:', {
                                quizName,
                                quizLower,
                                isInterviewAccount,
                                allowedQuizzes,
                                hiddenQuizzes,
                                isInAllowedQuizzes,
                                isInHiddenQuizzes,
                                isVisible
                            });
                            
                            const progress = user.quizProgress?.[quizLower];
                            const result = user.quizResults?.find(r => r.quizName.toLowerCase() === quizLower);
                            
                            // Prioritize values from quiz results over progress
                            const questionsAnswered = result?.questionsAnswered || 
                                                    result?.questionHistory?.length ||
                                                    progress?.questionsAnswered || 
                                                    progress?.questionHistory?.length || 0;
                            const experience = result?.experience || progress?.experience || 0;
                            const score = result?.score || 0;
                            const lastActive = result?.completedAt || result?.lastActive || progress?.lastUpdated || 'Never';
                            
                            const status = questionsAnswered === 15 ? 'Completed' : 
                                         questionsAnswered > 0 ? 'In Progress' : 
                                         'Not Started';
                            
                            // Determine background color based on XP and status
                            let backgroundColor = '#f5f5f5'; // Default gray for not started
                            if (questionsAnswered > 0) {
                                if (questionsAnswered === 15) {
                                    // All questions completed
                                    if (experience >= 300 || score >= 100) {
                                        backgroundColor = '#e8f5e9'; // Light green for perfect score (300/300 or 100%)
                                    } else {
                                        backgroundColor = '#fff3e0'; // Light yellow for completed but not perfect score
                                    }
                                } else {
                                    // Not all questions completed
                                    if (experience >= 235) {
                                        backgroundColor = '#fff3e0'; // Light yellow for pass (≥235/300)
                                    } else {
                                        backgroundColor = '#ffebee'; // Light red for fail (<235/300)
                                    }
                                }
                            }
                            
                            // Determine quiz status class
                            let statusClass = 'not-started';
                            if (questionsAnswered === 15) {
                                if (experience >= 300 || score >= 100) {
                                    statusClass = 'completed-perfect'; // Perfect score
                                } else {
                                    statusClass = 'completed-partial'; // Completed but not perfect
                                }
                            } else if (questionsAnswered > 0) {
                                statusClass = 'in-progress';
                            }
                            
                            return `
                                <div class="quiz-progress-item ${statusClass}" style="background-color: ${backgroundColor}">
                                    <h4>${this.formatQuizName(quizName)}</h4>
                                    <div class="progress-details">
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
                                            <span>${this.formatDate(lastActive)}</span>
                                        </div>
                                        <div>
                                            <strong>Visibility:</strong>
                                            <label class="visibility-toggle">
                                                <input type="checkbox" 
                                                    class="quiz-visibility-toggle"
                                                    data-quiz-name="${quizName}"
                                                    ${isVisible ? 'checked' : ''}
                                                    aria-label="Toggle visibility for ${this.formatQuizName(quizName)}"
                                                    tabindex="0">
                                                <span>Make visible to user</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="quiz-actions">
                                        <button class="reset-quiz-btn"
                                            data-quiz-name="${quizName}"
                                            aria-label="Reset progress for ${this.formatQuizName(quizName)}"
                                            tabindex="0">
                                            Reset Progress
                                        </button>
                                        <button class="view-questions-btn"
                                            data-quiz-name="${quizName}"
                                            aria-label="View questions for ${this.formatQuizName(quizName)}"
                                            tabindex="0">
                                            View Questions
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                </div>
                <div class="user-actions">
                    <button class="reset-all-btn" 
                        style="background-color: #dc3545; color: white;"
                        aria-label="Reset all progress for ${username}"
                        tabindex="0">
                        Reset All Progress
                    </button>
                    <button class="reset-password-btn" 
                        style="background-color: var(--secondary-color); color: white;"
                        aria-label="Reset password for ${username}"
                        tabindex="0">
                        Reset Password
                    </button>
                    <button class="delete-user-btn" 
                        style="background-color: #dc3545; color: white; border: 2px solid #dc3545;"
                        aria-label="Delete user ${username}"
                        tabindex="0">
                        Delete User
                    </button>
                </div>
            `;
            
            overlay.appendChild(content);
            document.body.appendChild(overlay);

            // Add event listener for close button
            const closeBtn = content.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    overlay.remove();
                });
                
                // Add keyboard support for close button
                closeBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    overlay.remove();
                    }
                });
            }
            
            // Add escape key handler
            const handleEscapeKey = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', handleEscapeKey);
                }
            };
            
            document.addEventListener('keydown', handleEscapeKey);

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
                    
                    console.log(`Visibility toggle changed for ${quizName}: isVisible=${isVisible}`);
                    
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
                            label.textContent = "Make visible to user";
                        }

                        // Refresh user data without closing the overlay
                        await this.loadUsers();
                        
                        // Update the user object in memory
                        const updatedUser = this.users.find(u => u.username === username);
                        if (updatedUser) {
                            const isInterviewAccount = updatedUser.userType === 'interview_candidate';
                            const allowedQuizzes = (updatedUser.allowedQuizzes || []).map(q => q.toLowerCase());
                            const hiddenQuizzes = (updatedUser.hiddenQuizzes || []).map(q => q.toLowerCase());
                            
                            // Update other toggles that might have been affected
                            content.querySelectorAll('.quiz-visibility-toggle').forEach(otherToggle => {
                                const otherQuizName = otherToggle.dataset.quizName.toLowerCase();
                                const shouldBeVisible = isInterviewAccount ? 
                                    allowedQuizzes.includes(otherQuizName) : 
                                    !hiddenQuizzes.includes(otherQuizName);
                                
                                otherToggle.checked = shouldBeVisible;
                                const otherLabel = otherToggle.nextElementSibling;
                                if (otherLabel) {
                                    otherLabel.textContent = "Make visible to user";
                                }
                            });
                        }
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
                    
                    if (!quizName) {
                        console.error('Missing quiz name for view questions button');
                        return;
                    }
                    
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

    formatQuizName(quizName) {
        if (!quizName) return 'Unknown Quiz';
        
        // Handle special cases
        const specialCases = {
            'api-testing': 'API Testing',
            'automation-interview': 'Automation Interview',
            'communication-quiz': 'Communication Skills',
            'bug-reporting': 'Bug Reporting',
            'test-planning': 'Test Planning',
            'test-design': 'Test Design'
        };
        
        if (specialCases[quizName]) {
            return specialCases[quizName];
        }
        
        // General formatting: capitalize each word and replace hyphens with spaces
        return quizName
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
        // Create error overlay
        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'modal-overlay';
        errorOverlay.innerHTML = `
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 8px;
                text-align: center;
                max-width: 500px;">
                <h3 style="color: #dc3545;">Error</h3>
                <p>${message}</p>
                <button id="closeErrorBtn" class="action-button" style="
                    margin-top: 20px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;">
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(errorOverlay);
        
        // Add event listener for close button
        const closeErrorBtn = document.getElementById('closeErrorBtn');
        if (closeErrorBtn) {
            closeErrorBtn.addEventListener('click', () => {
                errorOverlay.remove();
            });
        }
        
        // Add escape key handler
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                errorOverlay.remove();
                document.removeEventListener('keydown', handleEscapeKey);
            }
        };
        
        document.addEventListener('keydown', handleEscapeKey);
        
        // Close on click outside
        errorOverlay.addEventListener('click', (e) => {
            if (e.target === errorOverlay) {
                errorOverlay.remove();
            }
        });
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-notification';
        successDiv.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: #28a745;
            color: white;
            padding: 1rem;
            border-radius: 4px;
            z-index: 1001;
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 5000);
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
            // Get user data
            const user = this.users.find(u => u.username === username);
            if (!user) {
                throw new Error('User not found');
            }

            console.log('Showing quiz questions for:', { username, quizName });
            
            // Get quiz results from API
            try {
                const response = await this.apiService.getQuizQuestions(username, quizName);
                console.log('Quiz questions API response:', response);
                
                if (response.success && response.data) {
                    // Map the API response to the format expected by the UI
                    const apiQuestionHistory = response.data.questionHistory || [];
                    const questionHistory = apiQuestionHistory.map(item => {
                        const isPassed = item.status === 'passed';
                        
                        // Get the correct answer
                        let correctAnswer = '';
                        if (item.correctAnswer && item.correctAnswer.text) {
                            // If the API provides the correct answer directly, use it
                            correctAnswer = item.correctAnswer.text;
                        } else if (!isPassed && item.selectedAnswer?.outcome) {
                            // Otherwise try to extract from outcome text
                            const outcomeText = item.selectedAnswer.outcome;
                            const match = outcomeText.match(/The correct answer was: "([^"]+)"/);
                            if (match && match[1]) {
                                correctAnswer = match[1];
                            } else {
                                // If we can't extract from outcome, use the tool field
                                // The tool field often contains the name of the correct answer for incorrect responses
                                correctAnswer = item.selectedAnswer?.tool || 'Correct answer not available';
                            }
                        } else if (isPassed) {
                            // For correct answers, the selected answer is the correct answer
                            correctAnswer = item.selectedAnswer?.text || '';
                        }
                        
                        return {
                            question: item.scenario?.title || 'Question text not available',
                            scenario: item.scenario?.description || '',
                            selectedAnswer: item.selectedAnswer?.text || 'No answer selected',
                            correctAnswer: correctAnswer || 'Correct answer not available',
                            isCorrect: isPassed
                        };
                    });
                    
                    const questionsAnswered = response.data.totalQuestions || 0;
                    const quizScore = response.data.score || 0;
                    const quizStatus = questionsAnswered >= 15 ? 'Completed' : (questionsAnswered > 0 ? 'In Progress' : 'Not Started');
                    
                    console.log('Mapped question history:', questionHistory);
                    console.log('Questions answered:', questionsAnswered);
                    console.log('Quiz status:', quizStatus);
                    
                    // Create overlay container
                    const overlay = document.createElement('div');
                    overlay.className = 'user-details-overlay';
                    overlay.style.zIndex = '1002'; // Ensure it's above other overlays
                    overlay.setAttribute('role', 'dialog');
                    overlay.setAttribute('aria-modal', 'true');
                    overlay.setAttribute('aria-labelledby', 'questions-details-title');

                    // Create content container
                    const content = document.createElement('div');
                    content.className = 'user-details-content';
                    
                    // Determine if we should show the questions table or the "no questions" message
                    const hasCompletedQuestions = questionHistory.length > 0 || questionsAnswered > 0;
                    
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
                            .questions-table tr {
                                border-left: 4px solid transparent;
                                height: auto;
                                min-height: 60px;
                            }
                            .questions-table tr.passed {
                                border-left: 4px solid #4bb543;
                            }
                            .questions-table tr.failed {
                                border-left: 4px solid #ff4444;
                            }
                            .questions-table tbody tr:not(:last-child) {
                                border-bottom: 1px solid #e9ecef;
                            }
                            .questions-table td {
                                padding: 12px 15px;
                                vertical-align: top;
                                line-height: 1.5;
                            }
                            .questions-table th {
                                padding: 12px 15px;
                                background-color: #f8f9fa;
                                border-bottom: 2px solid #dee2e6;
                                font-weight: 600;
                            }
                            .questions-table {
                                width: 100%;
                                border-collapse: separate;
                                border-spacing: 0;
                                margin-bottom: 1rem;
                                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                            }
                            .questions-table strong {
                                font-weight: 600;
                                display: block;
                                margin-bottom: 6px;
                            }
                            .answer-content div {
                                margin-bottom: 8px;
                            }
                            .answer-content strong {
                                display: inline-block;
                                min-width: 80px;
                            }
                            .status-badge {
                                padding: 4px 8px;
                                border-radius: 4px;
                                font-weight: bold;
                                font-size: 0.9em;
                            }
                            .status-badge.pass {
                                background-color: rgba(75, 181, 67, 0.2);
                                color: #2e7d32;
                            }
                            .status-badge.fail {
                                background-color: rgba(255, 68, 68, 0.2);
                                color: #c62828;
                            }
                        </style>
                        <div class="details-header">
                            <h3 id="questions-details-title">${this.formatQuizName(quizName)} - ${username}'s Answers</h3>
                            <button class="close-btn" aria-label="Close questions view" tabindex="0">×</button>
                        </div>
                        <div class="questions-content">
                            ${!hasCompletedQuestions ? 
                                `<div class="not-attempted">
                                    <p>This user has not attempted any questions in this quiz yet.</p>
                                </div>` : 
                                questionHistory.length > 0 ?
                                `<table class="questions-table">
                                    <thead>
                                        <tr>
                                            <th style="width: 5%;">#</th>
                                            <th style="width: 15%;">Status</th>
                                            <th style="width: 40%;">Question</th>
                                            <th style="width: 40%;">Answer</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${questionHistory.map((question, index) => {
                                            const isPassed = question.isCorrect;
                                            return `
                                                <tr class="${isPassed ? 'passed' : 'failed'}">
                                                    <td>${index + 1}</td>
                                                    <td>
                                                        <span class="status-badge ${isPassed ? 'pass' : 'fail'}">
                                                            ${isPassed ? 'CORRECT' : 'INCORRECT'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <strong>${question.question || 'Question text not available'}</strong>
                                                        ${question.scenario ? `<p>${question.scenario}</p>` : ''}
                                                    </td>
                                                    <td class="answer-content">
                                                        <div>
                                                            <strong>Selected:</strong> ${question.selectedAnswer || 'No answer selected'}
                                                        </div>
                                                        ${!question.isCorrect ? `
                                                        <div>
                                                            <strong>Correct:</strong> ${question.correctAnswer || 'Correct answer not available'}
                                                        </div>` : ''}
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>` :
                                `<div>
                                    <table class="questions-table">
                                        <thead>
                                            <tr>
                                                <th style="width: 10%;">Question ID</th>
                                                <th style="width: 30%;">Question</th>
                                                <th style="width: 20%;">Selected Answer</th>
                                                <th style="width: 15%;">Status</th>
                                                <th style="width: 25%;">Correct Answer</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${Array.from({ length: questionsAnswered }, (_, i) => {
                                                // For quizzes with progress but no detailed history, we show a basic table
                                                return `
                                                    <tr>
                                                        <td>${i + 1}</td>
                                                        <td>Question ${i + 1}</td>
                                                        <td>Answer data not available</td>
                                                        <td>Status not available</td>
                                                        <td>Correct answer not available</td>
                                                    </tr>
                                                `;
                                            }).join('')}
                                        </tbody>
                                    </table>
                                    <div class="history-note" style="margin-top: 1rem;">
                                        <p><em>Note: The detailed question history for this quiz is not available. This may happen for quizzes completed before the question history feature was implemented.</em></p>
                                        <p>Status: <strong>${quizStatus}</strong></p>
                                        <p>Score: <strong>${quizScore}%</strong></p>
                                        <p>Experience earned: <strong>${response.data.experience || 0}</strong></p>
                                        <p>Last active: <strong>${this.formatDate(response.data.lastActive || '')}</strong></p>
                                    </div>
                                </div>`
                            }
                        </div>
                    `;

                    overlay.appendChild(content);
                    document.body.appendChild(overlay);

                    // Add event listener for close button
                    const closeBtn = content.querySelector('.close-btn');
                    if (closeBtn) {
                        closeBtn.addEventListener('click', () => {
                            overlay.remove();
                        });
                        
                        // Add keyboard support for close button
                        closeBtn.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                overlay.remove();
                            }
                        });
                    }
                    
                    // Add escape key handler
                    const handleEscapeKey = (e) => {
                        if (e.key === 'Escape') {
                            overlay.remove();
                            document.removeEventListener('keydown', handleEscapeKey);
                        }
                    };
                    
                    document.addEventListener('keydown', handleEscapeKey);
                } else {
                    throw new Error('Failed to get quiz questions from API');
                }
            } catch (apiError) {
                console.error('API error when fetching quiz questions:', apiError);
                
                // Fallback to local data if API fails
                this.showQuizQuestionsFromLocalData(quizName, username, user);
            }
        } catch (error) {
            console.error('Failed to show quiz questions:', error);
            this.showError(`Failed to show quiz questions: ${error.message}`);
        }
    }
    
    // Fallback method to show quiz questions from local data
    showQuizQuestionsFromLocalData(quizName, username, user) {
        try {
            // Get quiz results
            const quizLower = quizName.toLowerCase();
            const result = user.quizResults?.find(r => r.quizName.toLowerCase() === quizLower);
            const progress = user.quizProgress?.[quizLower];
            
            console.log('Fallback - Quiz result:', result);
            console.log('Fallback - Quiz progress:', progress);
            
            // Get question history - check both result and progress objects
            let questionHistory = [];
            let questionsAnswered = 0;
            let quizScore = 0;
            let quizStatus = 'Not Started';
            
            // First check if we have question history in either result or progress
            if (result && Array.isArray(result.questionHistory) && result.questionHistory.length > 0) {
                console.log('Using question history from quiz results');
                
                // Process the question history to extract correct answers
                questionHistory = result.questionHistory.map(item => {
                    const isPassed = item.isCorrect;
                    
                    // Get the correct answer
                    let correctAnswer = '';
                    if (item.correctAnswer && typeof item.correctAnswer === 'string') {
                        // If the item already has a correctAnswer field, use it
                        correctAnswer = item.correctAnswer;
                    } else if (item.correctAnswer && item.correctAnswer.text) {
                        // If the item has a correctAnswer object with a text field, use it
                        correctAnswer = item.correctAnswer.text;
                    } else if (!isPassed && item.explanation) {
                        // Otherwise try to extract from explanation text
                        const match = item.explanation.match(/The correct answer was: "([^"]+)"/);
                        if (match && match[1]) {
                            correctAnswer = match[1];
                        } else {
                            correctAnswer = 'Correct answer not available';
                        }
                    } else if (isPassed) {
                        // For correct answers, the selected answer is the correct answer
                        correctAnswer = item.selectedAnswer || '';
                    }
                    
                    return {
                        ...item,
                        correctAnswer: correctAnswer || 'Correct answer not available'
                    };
                });
                
                questionsAnswered = result.questionsAnswered || questionHistory.length;
                quizScore = result.score || 0;
                quizStatus = 'Completed';
            } else if (progress && Array.isArray(progress.questionHistory) && progress.questionHistory.length > 0) {
                console.log('Using question history from quiz progress');
                
                // Process the question history to extract correct answers
                questionHistory = progress.questionHistory.map(item => {
                    const isPassed = item.isCorrect;
                    
                    // Get the correct answer
                    let correctAnswer = '';
                    if (item.correctAnswer && typeof item.correctAnswer === 'string') {
                        // If the item already has a correctAnswer field, use it
                        correctAnswer = item.correctAnswer;
                    } else if (item.correctAnswer && item.correctAnswer.text) {
                        // If the item has a correctAnswer object with a text field, use it
                        correctAnswer = item.correctAnswer.text;
                    } else if (!isPassed && item.explanation) {
                        // Otherwise try to extract from explanation text
                        const match = item.explanation.match(/The correct answer was: "([^"]+)"/);
                        if (match && match[1]) {
                            correctAnswer = match[1];
                        } else {
                            correctAnswer = 'Correct answer not available';
                        }
                    } else if (isPassed) {
                        // For correct answers, the selected answer is the correct answer
                        correctAnswer = item.selectedAnswer || '';
                    }
                    
                    return {
                        ...item,
                        correctAnswer: correctAnswer || 'Correct answer not available'
                    };
                });
                
                questionsAnswered = progress.questionsAnswered || questionHistory.length;
                quizStatus = questionsAnswered >= 15 ? 'Completed' : 'In Progress';
            } else {
                // If we don't have question history but we know questions were answered
                questionsAnswered = result?.questionsAnswered || progress?.questionsAnswered || 0;
                quizScore = result?.score || 0;
                
                if (questionsAnswered > 0) {
                    quizStatus = questionsAnswered >= 15 ? 'Completed' : 'In Progress';
                }
            }
            
            console.log('Fallback - Question history:', questionHistory);
            console.log('Fallback - Questions answered:', questionsAnswered);
            console.log('Fallback - Quiz status:', quizStatus);
            
            // Create overlay container
            const overlay = document.createElement('div');
            overlay.className = 'user-details-overlay';
            overlay.style.zIndex = '1002'; // Ensure it's above other overlays
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'questions-details-title');

            // Create content container
            const content = document.createElement('div');
            content.className = 'user-details-content';
            
            // Determine if we should show the questions table or the "no questions" message
            const hasCompletedQuestions = questionHistory.length > 0 || questionsAnswered > 0;
            
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
                    .questions-table tr {
                        border-left: 4px solid transparent;
                        height: auto;
                        min-height: 60px;
                    }
                    .questions-table tr.passed {
                        border-left: 4px solid #4bb543;
                    }
                    .questions-table tr.failed {
                        border-left: 4px solid #ff4444;
                    }
                    .questions-table tbody tr:not(:last-child) {
                        border-bottom: 1px solid #e9ecef;
                    }
                    .questions-table td {
                        padding: 12px 15px;
                        vertical-align: top;
                        line-height: 1.5;
                    }
                    .questions-table th {
                        padding: 12px 15px;
                        background-color: #f8f9fa;
                        border-bottom: 2px solid #dee2e6;
                        font-weight: 600;
                    }
                    .questions-table {
                        width: 100%;
                        border-collapse: separate;
                        border-spacing: 0;
                        margin-bottom: 1rem;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    }
                    .questions-table strong {
                        font-weight: 600;
                        display: block;
                        margin-bottom: 6px;
                    }
                    .answer-content div {
                        margin-bottom: 8px;
                    }
                    .answer-content strong {
                        display: inline-block;
                        min-width: 80px;
                    }
                    .status-badge {
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-weight: bold;
                        font-size: 0.9em;
                    }
                    .status-badge.pass {
                        background-color: rgba(75, 181, 67, 0.2);
                        color: #2e7d32;
                    }
                    .status-badge.fail {
                        background-color: rgba(255, 68, 68, 0.2);
                        color: #c62828;
                    }
                </style>
                <div class="details-header">
                    <h3 id="questions-details-title">${this.formatQuizName(quizName)} - ${username}'s Answers</h3>
                    <button class="close-btn" aria-label="Close questions view" tabindex="0">×</button>
                </div>
                <div class="questions-content">
                    ${!hasCompletedQuestions ? 
                        `<div class="not-attempted">
                            <p>This user has not attempted any questions in this quiz yet.</p>
                        </div>` : 
                        questionHistory.length > 0 ?
                        `<table class="questions-table">
                            <thead>
                                <tr>
                                    <th style="width: 5%;">#</th>
                                    <th style="width: 15%;">Status</th>
                                    <th style="width: 40%;">Question</th>
                                    <th style="width: 40%;">Answer</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${questionHistory.map((question, index) => {
                                    const isPassed = question.isCorrect;
                                    return `
                                        <tr class="${isPassed ? 'passed' : 'failed'}">
                                            <td>${index + 1}</td>
                                            <td>
                                                <span class="status-badge ${isPassed ? 'pass' : 'fail'}">
                                                    ${isPassed ? 'CORRECT' : 'INCORRECT'}
                                                </span>
                                            </td>
                                            <td>
                                                <strong>${question.question || 'Question text not available'}</strong>
                                                ${question.scenario ? `<p>${question.scenario}</p>` : ''}
                                            </td>
                                            <td class="answer-content">
                        <div>
                                                    <strong>Selected:</strong> ${question.selectedAnswer || 'No answer selected'}
                        </div>
                                                ${!question.isCorrect ? `
                        <div>
                                                    <strong>Correct:</strong> ${question.correctAnswer || 'Correct answer not available'}
                                                </div>` : ''}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>` :
                        `<div>
                            <table class="questions-table">
                        <thead>
                                    <tr>
                                        <th style="width: 10%;">Question ID</th>
                                        <th style="width: 30%;">Question</th>
                                        <th style="width: 20%;">Selected Answer</th>
                                        <th style="width: 15%;">Status</th>
                                        <th style="width: 25%;">Correct Answer</th>
                            </tr>
                        </thead>
                        <tbody>
                                    ${Array.from({ length: questionsAnswered }, (_, i) => {
                                        // For quizzes with progress but no detailed history, we show a basic table
                                return `
                                            <tr>
                                                <td>${i + 1}</td>
                                                <td>Question ${i + 1}</td>
                                                <td>Answer data not available</td>
                                                <td>Status not available</td>
                                                <td>Correct answer not available</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                            <div class="history-note" style="margin-top: 1rem;">
                                <p><em>Note: The detailed question history for this quiz is not available. This may happen for quizzes completed before the question history feature was implemented.</em></p>
                                <p>Status: <strong>${quizStatus}</strong></p>
                                <p>Score: <strong>${quizScore}%</strong></p>
                                <p>Experience earned: <strong>${result?.experience || progress?.experience || 0}</strong></p>
                                <p>Last active: <strong>${this.formatDate(result?.completedAt || progress?.lastUpdated || '')}</strong></p>
                            </div>
                        </div>`
                    }
                </div>
            `;

            overlay.appendChild(content);
            document.body.appendChild(overlay);

            // Add event listener for close button
            const closeBtn = content.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    overlay.remove();
                });
                
                // Add keyboard support for close button
                closeBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        overlay.remove();
                    }
                });
            }
            
            // Add escape key handler
            const handleEscapeKey = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', handleEscapeKey);
                }
            };
            
            document.addEventListener('keydown', handleEscapeKey);
        } catch (error) {
            console.error('Failed to show quiz questions from local data:', error);
            this.showError(`Failed to show quiz questions: ${error.message}`);
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
            const newPassword = prompt('Enter the new password for ' + username + ' (minimum 6 characters):');
            
            // If user cancels the prompt or enters empty password, abort
            if (!newPassword) {
                console.log('Password reset cancelled');
                return false;
            }

            // Validate password length
            if (newPassword.length < 6) {
                this.showError('Password must be at least 6 characters long');
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
            // Validate username and password length
            if (username.length < 3) {
                throw new Error('Username must be at least 3 characters long');
            }
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // Convert selected quizzes to lowercase for consistency
            const allowedQuizzes = selectedQuizzes.map(quiz => quiz.toLowerCase());
            
            // Create array of hidden quizzes (all quizzes not in allowedQuizzes)
            const hiddenQuizzes = this.quizTypes
                .map(quiz => quiz.toLowerCase())
                .filter(quiz => !allowedQuizzes.includes(quiz));

            console.log('Creating interview account with:', {
                username,
                allowedQuizzes,
                hiddenQuizzes
            });

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
                        userType: 'interview_candidate',
                        allowedQuizzes,
                        hiddenQuizzes
                    })
                }
            );

            if (!response.success) {
                throw new Error(response.message || 'Failed to create interview account');
            }

            // Show success message
            this.showSuccess(`Interview account created for ${username}`);
            
            // Wait for a moment to ensure the backend has processed the new account
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Load the latest user data
            await this.loadUsers();
            
            // Wait for the user data to be processed
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Update the dashboard with the new data
            await this.updateDashboard();
            
            // Verify the new user is in the list
            const newUser = this.users.find(user => user.username === username);
            if (!newUser) {
                console.warn('New user not found in users list after creation');
                // Try loading users one more time
                await this.loadUsers();
                await this.updateDashboard();
            }
            
            return response;
        } catch (error) {
            console.error('Failed to create interview account:', error);
            this.showError(error.message || 'Failed to create interview account');
            throw error;
        }
    }

    showCreateInterviewAccountForm() {
        const modalHTML = `
            <div class="modal-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;">
                <div class="modal-content" style="
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;">
                    <h2 style="margin-bottom: 1.5rem;">Create Interview Account</h2>
                    <form id="createInterviewForm" autocomplete="off">
                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label for="username" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Username: (min. 3 characters)</label>
                            <input type="text" 
                                   id="username" 
                                   name="username_${Date.now()}" 
                                   required 
                                   minlength="3"
                                   autocomplete="new-username"
                                   autocorrect="off"
                                   autocapitalize="off"
                                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label for="password" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Password: (min. 6 characters)</label>
                            <input type="password" 
                                   id="password" 
                                   name="password_${Date.now()}" 
                                   required 
                                   minlength="6"
                                   autocomplete="new-password"
                                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Select Quizzes:</label>
                            <div class="quiz-selection" style="
                                max-height: 300px;
                                overflow-y: auto;
                                padding: 1rem;
                                border: 1px solid #ddd;
                                border-radius: 4px;
                                background: #f8f9fa;">
                                <div style="
                                    padding: 8px;
                                    margin-bottom: 12px;
                                    border-radius: 4px;
                                    background: #e9ecef;
                                    border-bottom: 2px solid #dee2e6;">
                                    <label style="
                                        display: flex;
                                        align-items: center;
                                        gap: 12px;
                                        margin: 0;
                                        cursor: pointer;
                                        font-weight: 500;">
                                        <input type="checkbox" 
                                               id="selectAllQuizzes"
                                               style="
                                                width: 18px;
                                                height: 18px;
                                                margin: 0;
                                                cursor: pointer;">
                                        <span style="flex: 1; font-size: 0.95rem;">Select All Quizzes</span>
                                    </label>
                                </div>
                                ${this.quizTypes
                                    .slice()
                                    .sort((a, b) => this.formatQuizName(a).localeCompare(this.formatQuizName(b)))
                                    .map(quiz => `
                                    <div style="
                                        padding: 8px;
                                        margin-bottom: 8px;
                                        border-radius: 4px;
                                        background: white;
                                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                        <label style="
                                            display: flex;
                                            align-items: center;
                                            gap: 12px;
                                            margin: 0;
                                            cursor: pointer;">
                                            <input type="checkbox" 
                                                   name="quizzes" 
                                                   value="${quiz}" 
                                                   style="
                                                    width: 18px;
                                                    height: 18px;
                                                    margin: 0;
                                                    cursor: pointer;">
                                            <span style="flex: 1; font-size: 0.95rem;">${this.formatQuizName(quiz)}</span>
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="button-group" style="
                            display: flex;
                            gap: 1rem;
                            margin-top: 1.5rem;">
                            <button type="submit" 
                                    class="action-button" 
                                    style="
                                        flex: 1;
                                        padding: 10px;
                                        background: var(--primary-color);
                                        color: white;
                                        border: none;
                                        border-radius: 4px;
                                        cursor: pointer;
                                        font-weight: 500;">
                                Create Account
                            </button>
                            <button type="button" 
                                    class="cancel-button" 
                                    style="
                                        flex: 1;
                                        padding: 10px;
                                        background: #6c757d;
                                        color: white;
                                        border: none;
                                        border-radius: 4px;
                                        cursor: pointer;
                                        font-weight: 500;">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHTML;
        document.body.appendChild(modalElement.firstElementChild);

        const modal = document.querySelector('.modal-overlay');
        const form = document.getElementById('createInterviewForm');
        const cancelButton = modal.querySelector('.cancel-button');

        // Add event listener for select all checkbox
        const selectAllCheckbox = form.querySelector('#selectAllQuizzes');
        selectAllCheckbox.addEventListener('change', (e) => {
            const quizCheckboxes = form.querySelectorAll('input[name="quizzes"]');
            quizCheckboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
        });

        // Update select all checkbox when individual checkboxes change
        const quizCheckboxes = form.querySelectorAll('input[name="quizzes"]');
        quizCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const allChecked = Array.from(quizCheckboxes).every(cb => cb.checked);
                selectAllCheckbox.checked = allChecked;
            });
        });

        cancelButton.addEventListener('click', () => {
            modal.remove();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = form.querySelector('#username').value.trim();
            const password = form.querySelector('#password').value.trim();
            const selectedQuizzes = Array.from(form.querySelectorAll('input[name="quizzes"]:checked'))
                .map(checkbox => checkbox.value);

            if (!username || !password) {
                this.showError('Username and password are required');
                return;
            }

            if (selectedQuizzes.length === 0) {
                this.showError('Please select at least one quiz');
                return;
            }

            try {
                const response = await this.createInterviewAccount(username, password, selectedQuizzes);
                if (response.success) {
                    modal.remove();
                    this.showSuccess(`Interview account created for ${username}`);
                    await this.loadUsers();
                    await this.updateDashboard();
                } else {
                    this.showError(response.message || 'Failed to create interview account');
                }
            } catch (error) {
                console.error('Error creating interview account:', error);
                this.showError(error.message || 'Failed to create interview account');
            }
        });
    }

    exportUserDataToCSV() {
        try {
            // Create CSV header row
            let csvContent = "Username,";
            
            // Add quiz names to header
            this.quizTypes.forEach(quizName => {
                csvContent += `${this.formatQuizName(quizName)} Questions,${this.formatQuizName(quizName)} Score%,${this.formatQuizName(quizName)} Status,`;
            });
            
            // Add overall stats
            csvContent += "Overall Progress%,Total Questions,Last Active\n";
            
            // Add data for each user
            this.users.forEach(user => {
                // Add username
                csvContent += `${user.username},`;
                
                // Add data for each quiz
                this.quizTypes.forEach(quizType => {
                    const quizLower = quizType.toLowerCase();
                    const progress = user.quizProgress?.[quizLower];
                    const result = user.quizResults?.find(r => r.quizName.toLowerCase() === quizLower);
                    
                    // Prioritize values from quiz results over progress
                    const questionsAnswered = result?.questionsAnswered || 
                                            result?.questionHistory?.length ||
                                            progress?.questionsAnswered || 
                                            progress?.questionHistory?.length || 0;
                    const score = result?.score || 0;
                    
                    // Determine status
                    let status = "Not Started";
                    if (questionsAnswered === 15) {
                        status = score >= 70 ? "Pass" : "Fail";
                    } else if (questionsAnswered > 0) {
                        status = "Incomplete";
                    }
                    
                    // Add quiz data to CSV
                    csvContent += `${questionsAnswered}/15,${score}%,${status},`;
                });
                
                // Add overall stats
                const overallProgress = this.calculateUserProgress(user).toFixed(1);
                const totalQuestions = this.quizTypes.reduce((total, quizType) => {
                    const quizLower = quizType.toLowerCase();
                    const progress = user.quizProgress?.[quizLower];
                    const result = user.quizResults?.find(r => r.quizName.toLowerCase() === quizLower);
                    
                    const questionsAnswered = result?.questionsAnswered || 
                                            result?.questionHistory?.length ||
                                            progress?.questionsAnswered || 
                                            progress?.questionHistory?.length || 0;
                    
                    return total + questionsAnswered;
                }, 0);
                
                const lastActive = this.formatDate(this.getLastActiveDate(user));
                
                csvContent += `${overallProgress}%,${totalQuestions}/${this.quizTypes.length * 15},${lastActive}\n`;
            });
            
            // Create a download link for the CSV file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `user_quiz_data_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('CSV file downloaded successfully');
        } catch (error) {
            console.error('Error exporting CSV:', error);
            this.showError('Failed to export CSV file');
        }
    }

    exportSimpleCSV() {
        try {
            // Create CSV header row
            let csvContent = "Name,Quiz,Questions,Score%,Status\n";
            
            // Add data for each user and their quizzes
            this.users.forEach(user => {
                // For each quiz, create a row
                this.quizTypes.forEach(quizType => {
                    const quizLower = quizType.toLowerCase();
                    const progress = user.quizProgress?.[quizLower];
                    const result = user.quizResults?.find(r => r.quizName.toLowerCase() === quizLower);
                    
                    // Prioritize values from quiz results over progress
                    const questionsAnswered = result?.questionsAnswered || 
                                            result?.questionHistory?.length ||
                                            progress?.questionsAnswered || 
                                            progress?.questionHistory?.length || 0;
                    const score = result?.score || 0;
                    
                    // Determine status
                    let status = "Not Started";
                    if (questionsAnswered === 15) {
                        status = score >= 70 ? "Pass" : "Fail";
                    } else if (questionsAnswered > 0) {
                        status = "Incomplete";
                    }
                    
                    // Only add rows for quizzes that have been started
                    if (questionsAnswered > 0) {
                        csvContent += `${user.username},${this.formatQuizName(quizType)},${questionsAnswered}/15,${score}%,${status}\n`;
                    }
                });
            });
            
            // Create a download link for the CSV file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `simple_quiz_data_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('Simple CSV file downloaded successfully');
        } catch (error) {
            console.error('Error exporting simple CSV:', error);
            this.showError('Failed to export simple CSV file');
        }
    }

    async fetchQuizScenarios(quizName) {
        try {
            console.log(`Fetching scenarios for quiz: ${quizName}`);
            
            // First try to get scenarios from the API
            try {
                const apiService = new APIService();
                const scenarios = await apiService.getQuizScenarios(quizName);
                console.log(`Successfully fetched scenarios for ${quizName} from API`);
                return scenarios;
            } catch (apiError) {
                console.warn(`API error for ${quizName}: ${apiError.message}. Falling back to client-side data.`);
                
                // If API fails, try to load the quiz module directly
                try {
                    console.log(`Attempting to load quiz module for ${quizName}`);
                    
                    // Normalize the path and class name based on the quiz name
                    let modulePath, className;
                    
                    // Convert kebab-case to PascalCase for class name
                    const pascalCase = quizName.split('-')
                        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                        .join('');
                    
                    // Special case for CMS-Testing-quiz.js which has a different filename
                    if (quizName === 'cms-testing') {
                        modulePath = '../quizzes/CMS-Testing-quiz.js';
                        className = 'CMSTestingQuiz';
                    } else {
                        // Handle other quiz files
                        modulePath = `../quizzes/${quizName}.js`;
                        className = `${pascalCase}Quiz`;
                    }
                    
                    console.log(`Loading module from ${modulePath}, expecting class ${className}`);
                    
                    const quizModule = await import(modulePath);
                    
                    // Check if the module has the expected class
                    if (quizModule[className]) {
                        console.log(`Found class ${className} in module`);
                        
                        // Instantiate the quiz class
                        const quizInstance = new quizModule[className]();
                        
                        // Extract scenarios from the instance
                        const scenarios = {
                            basic: quizInstance.basicScenarios || [],
                            intermediate: quizInstance.intermediateScenarios || [],
                            advanced: quizInstance.advancedScenarios || []
                        };
                        
                        console.log(`Successfully extracted scenarios from ${className} instance`);
                        return scenarios;
                    } else {
                        console.error(`Module loaded but class ${className} not found`);
                        throw new Error(`Quiz class ${className} not found in module`);
                    }
                } catch (importError) {
                    console.error(`Failed to import quiz module for ${quizName}: ${importError}`);
                    
                    // As a last resort, try to use mock data
                    const mockScenarios = this.getMockScenariosForQuiz(quizName);
                    if (mockScenarios) {
                        console.log(`Using mock data for ${quizName}`);
                        return mockScenarios;
                    }
                    
                    throw new Error(`Quiz scenarios for "${this.formatQuizName(quizName)}" could not be loaded. Please try again later.`);
                }
            }
        } catch (error) {
            console.error(`Error in fetchQuizScenarios for ${quizName}: ${error}`);
            throw error;
        }
    }
    
    // Helper method to provide mock data for CMS Testing quiz
    getMockScenariosForCmsTesting() {
        console.log('Generating mock scenarios for CMS Testing quiz');
        
        // Create mock scenarios with proper structure
        const mockScenarios = {
            basic: [
                {
                    id: 'cms-basic-1',
                    question: 'You need to update content on the company website. What should you do first?',
                    options: [
                        {
                            id: 'cms-basic-1-a',
                            text: 'Make changes directly in the production environment',
                            outcome: 'This is risky as it could introduce errors to the live site.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: 'cms-basic-1-b',
                            text: 'Create a backup before making any changes',
                            outcome: 'Good practice! Always back up before making changes.',
                            experience: 20,
                            correct: true
                        },
                        {
                            id: 'cms-basic-1-c',
                            text: 'Ask a colleague to make the changes for you',
                            outcome: 'Delegating without proper instruction could lead to miscommunication.',
                            experience: 0,
                            correct: false
                        }
                    ]
                },
                {
                    id: 'cms-basic-2',
                    question: 'What is the best practice for managing media files in a CMS?',
                    options: [
                        {
                            id: 'cms-basic-2-a',
                            text: 'Upload all media files to a single folder',
                            outcome: 'This makes organization difficult as the library grows.',
                            experience: -5,
                            correct: false
                        },
                        {
                            id: 'cms-basic-2-b',
                            text: 'Organize media files in a structured folder system',
                            outcome: 'Good organization makes files easier to find and manage.',
                            experience: 15,
                            correct: true
                        },
                        {
                            id: 'cms-basic-2-c',
                            text: 'Store media files outside the CMS',
                            outcome: 'This disconnects media from content and makes management harder.',
                            experience: -10,
                            correct: false
                        }
                    ]
                }
            ],
            intermediate: [
                {
                    id: 'cms-int-1',
                    question: 'You need to implement a content workflow. What approach should you take?',
                    options: [
                        {
                            id: 'cms-int-1-a',
                            text: 'Allow all content editors to publish directly',
                            outcome: 'This lacks quality control and oversight.',
                            experience: -15,
                            correct: false
                        },
                        {
                            id: 'cms-int-1-b',
                            text: 'Implement a review and approval process',
                            outcome: 'This ensures content quality and consistency before publishing.',
                            experience: 25,
                            correct: true
                        },
                        {
                            id: 'cms-int-1-c',
                            text: 'Restrict publishing to administrators only',
                            outcome: 'This creates bottlenecks in the content process.',
                            experience: 5,
                            correct: false
                        }
                    ]
                },
                {
                    id: 'cms-int-2',
                    question: 'How should you handle content versioning?',
                    options: [
                        {
                            id: 'cms-int-2-a',
                            text: 'Keep only the current version to save space',
                            outcome: 'This prevents you from reverting changes if needed.',
                            experience: -20,
                            correct: false
                        },
                        {
                            id: 'cms-int-2-b',
                            text: 'Maintain a reasonable history of content versions',
                            outcome: 'This allows you to track changes and revert if necessary.',
                            experience: 20,
                            correct: true
                        },
                        {
                            id: 'cms-int-2-c',
                            text: 'Manually create backups of important content',
                            outcome: 'This is time-consuming and prone to human error.',
                            experience: 0,
                            correct: false
                        }
                    ]
                }
            ],
            advanced: [
                {
                    id: 'cms-adv-1',
                    question: 'You need to migrate content from one CMS to another. What approach should you take?',
                    options: [
                        {
                            id: 'cms-adv-1-a',
                            text: 'Manually recreate all content in the new system',
                            outcome: 'This is time-consuming and error-prone for large sites.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: 'cms-adv-1-b',
                            text: 'Use an automated migration tool without testing',
                            outcome: 'Automated tools need verification to ensure proper migration.',
                            experience: -25,
                            correct: false
                        },
                        {
                            id: 'cms-adv-1-c',
                            text: 'Create a migration plan with content mapping and testing',
                            outcome: 'A structured approach ensures successful migration with minimal issues.',
                            experience: 30,
                            correct: true
                        }
                    ]
                },
                {
                    id: 'cms-adv-2',
                    question: 'How should you handle custom content types in a CMS?',
                    options: [
                        {
                            id: 'cms-adv-2-a',
                            text: 'Avoid custom types and use generic content types for everything',
                            outcome: 'This limits content flexibility and structure.',
                            experience: -15,
                            correct: false
                        },
                        {
                            id: 'cms-adv-2-b',
                            text: 'Create custom content types with well-defined fields and relationships',
                            outcome: 'This provides structure and consistency for specialized content.',
                            experience: 25,
                            correct: true
                        },
                        {
                            id: 'cms-adv-2-c',
                            text: 'Store specialized content as unstructured data',
                            outcome: 'Unstructured data is harder to query, display, and maintain.',
                            experience: -10,
                            correct: false
                        }
                    ]
                }
            ]
        };
        
        // Return in the format expected by the showQuizScenarios method
        return mockScenarios;
    }

    async showQuizScenarios(quizName) {
        try {
            // Show loading indicator
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'modal-overlay';
            loadingOverlay.id = 'scenarios-loading-overlay';
            loadingOverlay.innerHTML = `
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    text-align: center;">
                    <h3>Loading Scenarios for ${this.formatQuizName(quizName)}...</h3>
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 1rem; color: #6c757d;">This may take a few seconds...</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);

            // Fetch quiz scenarios
            let scenarios;
            try {
                scenarios = await this.fetchQuizScenarios(quizName);
                
                // Check if scenarios data is valid
                if (!scenarios) {
                    throw new Error(`No valid scenarios data found for ${this.formatQuizName(quizName)}`);
                }
                
                // Extract the data property if it exists (API response format)
                if (scenarios.data) {
                    scenarios = scenarios.data;
                }
                
                // Ensure we have the expected structure
                if (!scenarios.basic && !scenarios.intermediate && !scenarios.advanced) {
                    console.warn(`Unexpected scenarios format for ${quizName}:`, scenarios);
                    throw new Error(`Invalid scenarios format for ${this.formatQuizName(quizName)}`);
                }
                
            } catch (fetchError) {
                console.error(`Error fetching scenarios for ${quizName}:`, fetchError);
                
                // Show error message in the loading overlay
                loadingOverlay.innerHTML = `
                    <div style="
                        background: white;
                        padding: 2rem;
                        border-radius: 8px;
                        text-align: center;
                        max-width: 500px;">
                        <h3 style="color: #dc3545;">Unable to Load Quiz Scenarios</h3>
                        <p>${fetchError.message || `Failed to load scenarios for ${this.formatQuizName(quizName)}`}</p>
                        <p style="margin-top: 1rem; color: #6c757d;">The actual quiz scenarios could not be loaded. This may be due to network issues or because the quiz file is not available.</p>
                        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                            <button id="retryBtn" class="action-button" style="
                                background: var(--primary-color);
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 4px;
                                cursor: pointer;">
                                Retry
                            </button>
                            <button id="closeErrorBtn" class="action-button" style="
                                background: #6c757d;
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 4px;
                                cursor: pointer;">
                                Close
                            </button>
                        </div>
                    </div>
                `;
                
                // Add event listener for close button
                const closeErrorBtn = document.getElementById('closeErrorBtn');
                if (closeErrorBtn) {
                    closeErrorBtn.addEventListener('click', () => {
                        loadingOverlay.remove();
                    });
                }
                
                // Add event listener for retry button
                const retryBtn = document.getElementById('retryBtn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        loadingOverlay.remove();
                        this.showQuizScenarios(quizName);
                    });
                }
                
                return; // Exit the function early
            }
            
            // Remove loading indicator
            loadingOverlay.remove();
            
            // Check if we have any scenarios to display
            const hasScenarios = 
                (scenarios.basic && scenarios.basic.length > 0) || 
                (scenarios.intermediate && scenarios.intermediate.length > 0) || 
                (scenarios.advanced && scenarios.advanced.length > 0);
                
            if (!hasScenarios) {
                this.showError(`No scenarios found for ${this.formatQuizName(quizName)}`);
                return;
            }

            // Create the overlay
            const overlay = document.createElement('div');
            overlay.className = 'user-details-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'scenarios-title');
            
            const content = document.createElement('div');
            content.className = 'user-details-content';
            content.style.maxWidth = '90%';
            content.style.width = '1200px';
            
            // Prepare the HTML for scenarios
            let scenariosHTML = '';
            
            // Add basic scenarios
            if (scenarios.basic && scenarios.basic.length > 0) {
                scenariosHTML += `
                    <div class="scenario-section">
                        <h3 class="scenario-level-title">Basic Level</h3>
                        <div class="scenarios-list">
                            ${this.generateScenariosHTML(scenarios.basic)}
                        </div>
                    </div>
                `;
            }
            
            // Add intermediate scenarios
            if (scenarios.intermediate && scenarios.intermediate.length > 0) {
                scenariosHTML += `
                    <div class="scenario-section">
                        <h3 class="scenario-level-title">Intermediate Level</h3>
                        <div class="scenarios-list">
                            ${this.generateScenariosHTML(scenarios.intermediate)}
                        </div>
                    </div>
                `;
            }
            
            // Add advanced scenarios
            if (scenarios.advanced && scenarios.advanced.length > 0) {
                scenariosHTML += `
                    <div class="scenario-section">
                        <h3 class="scenario-level-title">Advanced Level</h3>
                        <div class="scenarios-list">
                            ${this.generateScenariosHTML(scenarios.advanced)}
                        </div>
                    </div>
                `;
            }
            
            content.innerHTML = `
                <style>
                    .scenario-section {
                        margin-bottom: 2rem;
                    }
                    .scenario-level-title {
                        font-size: 1.5rem;
                        margin-bottom: 1rem;
                        padding-bottom: 0.5rem;
                        border-bottom: 2px solid var(--primary-color);
                    }
                    .scenarios-list {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
                        gap: 1.5rem;
                    }
                    @media (max-width: 768px) {
                        .scenarios-list {
                            grid-template-columns: 1fr;
                        }
                    }
                    .scenario-card {
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                    }
                    .scenario-header {
                        background: #f8f9fa;
                        padding: 1rem;
                        border-bottom: 1px solid #e9ecef;
                    }
                    .scenario-title {
                        font-size: 1.2rem;
                        font-weight: 600;
                        margin: 0;
                    }
                    .scenario-body {
                        padding: 1rem;
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                    }
                    .scenario-description {
                        margin-bottom: 1rem;
                        line-height: 1.5;
                    }
                    .options-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        flex: 1;
                    }
                    .option-item {
                        padding: 1rem;
                        margin-bottom: 0.5rem;
                        border-radius: 4px;
                        border-left: 4px solid transparent;
                        transition: background-color 0.2s ease;
                    }
                    .option-item.correct {
                        background-color: rgba(75, 181, 67, 0.1);
                        border-left-color: #4bb543;
                    }
                    .option-item.incorrect {
                        background-color: rgba(255, 68, 68, 0.05);
                        border-left-color: #ff4444;
                    }
                    .option-text {
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                    }
                    .option-outcome {
                        font-style: italic;
                        color: #6c757d;
                    }
                    .option-experience {
                        margin-top: 0.5rem;
                        font-weight: 500;
                    }
                    .option-experience.positive {
                        color: #28a745;
                    }
                    .option-experience.negative {
                        color: #dc3545;
                    }
                    .option-experience.neutral {
                        color: #6c757d;
                    }
                    .user-details-content {
                        max-height: 85vh;
                        overflow-y: auto;
                        padding: 1.5rem;
                    }
                    .details-header {
                        position: sticky;
                        top: 0;
                        background: white;
                        padding-bottom: 1rem;
                        margin-bottom: 1rem;
                        border-bottom: 1px solid #e9ecef;
                        z-index: 10;
                    }
                    .close-btn {
                        position: absolute;
                        top: 0;
                        right: 0;
                        font-size: 1.5rem;
                        background: none;
                        border: none;
                        cursor: pointer;
                        padding: 0.5rem;
                        line-height: 1;
                    }
                    .close-btn:hover {
                        color: var(--primary-color);
                    }
                </style>
                <div class="details-header">
                    <h3 id="scenarios-title">${this.formatQuizName(quizName)} Quiz Scenarios</h3>
                    <button class="close-btn" aria-label="Close scenarios view" tabindex="0">×</button>
                </div>
                <div class="scenarios-content">
                    ${scenariosHTML || '<p>No scenarios found for this quiz.</p>'}
                </div>
            `;
            
            overlay.appendChild(content);
            document.body.appendChild(overlay);

            // Add event listener for close button
            const closeBtn = content.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    overlay.remove();
                });
                
                // Add keyboard support for close button
                closeBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        overlay.remove();
                    }
                });
            }
            
            // Add escape key handler
            const handleEscapeKey = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', handleEscapeKey);
                }
            };
            
            document.addEventListener('keydown', handleEscapeKey);

            // Close on click outside
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                }
            });
        } catch (error) {
            console.error(`Error showing scenarios for ${quizName}:`, error);
            
            // Remove any existing loading overlay
            const existingOverlay = document.getElementById('scenarios-loading-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            this.showError(`Failed to load scenarios for ${this.formatQuizName(quizName)}: ${error.message}`);
        }
    }

    generateScenariosHTML(scenarios) {
        return scenarios.map(scenario => {
            // Find the correct option (the one with the highest experience)
            const correctOption = [...scenario.options].sort((a, b) => 
                (b.experience || 0) - (a.experience || 0)
            )[0];
            
            // Use question as title if title is not available
            const scenarioTitle = scenario.title || scenario.question || 'Untitled Scenario';
            
            // Use question as description if description is not available and it's different from title
            let scenarioDescription = scenario.description || '';
            if (!scenarioDescription && scenario.question && scenario.question !== scenarioTitle) {
                scenarioDescription = scenario.question;
            } else if (!scenarioDescription) {
                scenarioDescription = 'No description available';
            }
            
            return `
                <div class="scenario-card">
                    <div class="scenario-header">
                        <h4 class="scenario-title">${scenarioTitle}</h4>
                        ${scenario.id ? `<div class="scenario-id">ID: ${scenario.id}</div>` : ''}
                    </div>
                    <div class="scenario-body">
                        <div class="scenario-description">
                            ${scenarioDescription}
                        </div>
                        <h5>Answer Options:</h5>
                        <ul class="options-list">
                            ${scenario.options.map(option => {
                                const isCorrect = option.correct || option === correctOption;
                                const experienceClass = (option.experience || 0) > 0 ? 'positive' : 
                                                      (option.experience || 0) < 0 ? 'negative' : 'neutral';
                                
                                return `
                                    <li class="option-item ${isCorrect ? 'correct' : 'incorrect'}">
                                        <div class="option-text">${option.text || 'No text available'}</div>
                                        <div class="option-outcome">${option.outcome || 'No outcome description'}</div>
                                        <div class="option-experience ${experienceClass}">
                                            Experience: ${option.experience || 0} XP
                                            ${isCorrect ? ' (Correct Answer)' : ''}
                                        </div>
                                    </li>
                                `;
                            }).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }).join('');
    }

    async showQuizScenariosSelector() {
        // Create the overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'quiz-selector-title');
        
        // Show loading indicator first
        const loadingContent = document.createElement('div');
        loadingContent.className = 'modal-content';
        loadingContent.style.maxWidth = '400px';
        loadingContent.style.width = '90%';
        loadingContent.innerHTML = `
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 8px;
                text-align: center;">
                <h3>Loading Available Quizzes...</h3>
                <div class="loading-spinner"></div>
            </div>
        `;
        overlay.appendChild(loadingContent);
        document.body.appendChild(overlay);
        
        // Get the list of available quizzes
        let quizzes = [
            // Core quizzes
            {
                id: 'automation-interview',
                name: 'Automation Interview',
                description: 'Test your knowledge of automation concepts and practices',
                category: 'Technical'
            },
            {
                id: 'communication-quiz',
                name: 'Communication Skills',
                description: 'Test your communication skills in a professional environment',
                category: 'Soft Skills'
            },
            {
                id: 'cms-testing',
                name: 'CMS Testing',
                description: 'Test your knowledge of Content Management Systems',
                category: 'Technical'
            },
            // Additional quizzes from the directory
            {
                id: 'build-verification-quiz',
                name: 'Build Verification',
                description: 'Test your knowledge of build verification processes',
                category: 'QA'
            },
            {
                id: 'content-copy-quiz',
                name: 'Content & Copy',
                description: 'Test your skills in content and copy testing',
                category: 'QA'
            },
            {
                id: 'email-testing-quiz',
                name: 'Email Testing',
                description: 'Test your knowledge of email testing techniques',
                category: 'Technical'
            },
            {
                id: 'exploratory-quiz',
                name: 'Exploratory Testing',
                description: 'Test your exploratory testing skills',
                category: 'QA'
            },
            {
                id: 'fully-scripted-quiz',
                name: 'Fully Scripted Testing',
                description: 'Test your knowledge of scripted testing approaches',
                category: 'QA'
            },
            {
                id: 'initiative-quiz',
                name: 'Initiative',
                description: 'Test your ability to take initiative in testing',
                category: 'Soft Skills'
            },
            {
                id: 'issue-tracking-tools-quiz',
                name: 'Issue Tracking Tools',
                description: 'Test your knowledge of issue tracking tools',
                category: 'Technical'
            },
            {
                id: 'issue-verification-quiz',
                name: 'Issue Verification',
                description: 'Test your skills in verifying and validating issues',
                category: 'QA'
            },
            {
                id: 'locale-testing-quiz',
                name: 'Locale Testing',
                description: 'Test your knowledge of localization testing',
                category: 'Technical'
            },
            {
                id: 'non-functional-quiz',
                name: 'Non-Functional Testing',
                description: 'Test your knowledge of non-functional testing',
                category: 'QA'
            },
            {
                id: 'raising-tickets-quiz',
                name: 'Raising Tickets',
                description: 'Test your skills in creating effective bug tickets',
                category: 'QA'
            },
            {
                id: 'reports-quiz',
                name: 'Testing Reports',
                description: 'Test your knowledge of testing reports',
                category: 'QA'
            },
            {
                id: 'risk-analysis-quiz',
                name: 'Risk Analysis',
                description: 'Test your skills in risk analysis for testing',
                category: 'QA'
            },
            {
                id: 'risk-management-quiz',
                name: 'Risk Management',
                description: 'Test your knowledge of risk management in testing',
                category: 'QA'
            },
            {
                id: 'sanity-smoke-quiz',
                name: 'Sanity & Smoke Testing',
                description: 'Test your knowledge of sanity and smoke testing',
                category: 'QA'
            },
            {
                id: 'script-metrics-troubleshooting-quiz',
                name: 'Script Metrics & Troubleshooting',
                description: 'Test your skills in script metrics and troubleshooting',
                category: 'Technical'
            },
            {
                id: 'standard-script-testing',
                name: 'Standard Script Testing',
                description: 'Test your knowledge of standard script testing',
                category: 'Technical'
            },
            {
                id: 'test-support-quiz',
                name: 'Test Support',
                description: 'Test your knowledge of test support activities',
                category: 'QA'
            },
            {
                id: 'test-types-tricks-quiz',
                name: 'Test Types & Tricks',
                description: 'Test your knowledge of different test types and tricks',
                category: 'QA'
            },
            {
                id: 'tester-mindset-quiz',
                name: 'Tester Mindset',
                description: 'Test your understanding of the tester mindset',
                category: 'Soft Skills'
            },
            {
                id: 'time-management-quiz',
                name: 'Time Management',
                description: 'Test your time management skills in testing',
                category: 'Soft Skills'
            }
        ];
        
        try {
            // Create the content with quizzes
            const content = document.createElement('div');
            content.className = 'modal-content';
            content.style.maxWidth = '800px';
            content.style.width = '90%';
            
            // Sort quizzes alphabetically by name
            quizzes.sort((a, b) => a.name.localeCompare(b.name));
            
            // Generate HTML for quiz cards
            let quizCardsHTML = '';
            
            if (quizzes.length === 0) {
                quizCardsHTML = '<p>No quizzes available.</p>';
            } else {
                quizzes.forEach(quiz => {
                    quizCardsHTML += `
                        <div class="quiz-card" data-quiz="${quiz.id}">
                            <div class="quiz-name">${quiz.name}</div>
                            <div class="quiz-description">${quiz.description || ''}</div>
                            <div class="quiz-category">${quiz.category || ''}</div>
                            <button class="view-btn">View Scenarios</button>
                        </div>
                    `;
                });
            }
            
            content.innerHTML = `
                <style>
                    .modal-content {
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        padding: 2rem;
                        position: relative;
                    }
                    .selector-header {
                        margin-bottom: 1.5rem;
                        padding-bottom: 1rem;
                        border-bottom: 1px solid #e9ecef;
                        position: relative;
                    }
                    .selector-title {
                        font-size: 1.5rem;
                        margin: 0;
                    }
                    .close-btn {
                        position: absolute;
                        top: 0;
                        right: 0;
                        font-size: 1.5rem;
                        background: none;
                        border: none;
                        cursor: pointer;
                        padding: 0.5rem;
                        line-height: 1;
                    }
                    .close-btn:hover {
                        color: var(--primary-color);
                    }
                    .quiz-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                        gap: 1rem;
                        max-height: 60vh;
                        overflow-y: auto;
                        padding-right: 0.5rem;
                    }
                    @media (max-width: 640px) {
                        .quiz-grid {
                            grid-template-columns: 1fr;
                        }
                    }
                    .quiz-card {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 1.5rem;
                        text-align: center;
                        transition: transform 0.2s ease, box-shadow 0.2s ease;
                        cursor: pointer;
                        border: 2px solid transparent;
                        display: flex;
                        flex-direction: column;
                    }
                    .quiz-card:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        border-color: var(--primary-color);
                    }
                    .quiz-name {
                        font-size: 1.2rem;
                        font-weight: 600;
                        margin-bottom: 0.5rem;
                        color: var(--primary-color);
                    }
                    .quiz-description {
                        font-size: 0.9rem;
                        color: #6c757d;
                        margin-bottom: 0.5rem;
                        flex-grow: 1;
                    }
                    .quiz-category {
                        font-size: 0.8rem;
                        color: #495057;
                        background-color: #e9ecef;
                        padding: 0.2rem 0.5rem;
                        border-radius: 4px;
                        display: inline-block;
                        margin-bottom: 1rem;
                    }
                    .view-btn {
                        background: var(--primary-color);
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: background-color 0.2s ease;
                        margin-top: auto;
                    }
                    .view-btn:hover {
                        background-color: var(--primary-color-dark, #0056b3);
                    }
                    .search-container {
                        margin-bottom: 1rem;
                    }
                    .search-input {
                        width: 100%;
                        padding: 0.5rem;
                        border: 1px solid #ced4da;
                        border-radius: 4px;
                        font-size: 1rem;
                    }
                    .category-filters {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5rem;
                        margin-bottom: 1rem;
                    }
                    .category-filter {
                        background: #e9ecef;
                        border: none;
                        padding: 0.3rem 0.8rem;
                        border-radius: 20px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        transition: all 0.2s ease;
                    }
                    .category-filter.active {
                        background: var(--primary-color);
                        color: white;
                    }
                </style>
                <div class="selector-header">
                    <h3 id="quiz-selector-title" class="selector-title">Select a Quiz to View Scenarios</h3>
                    <button class="close-btn" aria-label="Close quiz selector" tabindex="0">×</button>
                </div>
                <div class="search-container">
                    <input type="text" class="search-input" placeholder="Search quizzes..." aria-label="Search quizzes">
                </div>
                <div class="category-filters">
                    <button class="category-filter active" data-category="all">All</button>
                    <button class="category-filter" data-category="QA">QA</button>
                    <button class="category-filter" data-category="Technical">Technical</button>
                    <button class="category-filter" data-category="Soft Skills">Soft Skills</button>
                </div>
                <div class="quiz-grid">
                    ${quizCardsHTML}
                </div>
            `;
            
            // Replace loading content with actual content
            overlay.removeChild(loadingContent);
            overlay.appendChild(content);
            
            // Add event listeners for quiz cards
            const quizCards = content.querySelectorAll('.quiz-card');
            quizCards.forEach(card => {
                card.addEventListener('click', () => {
                    const quizName = card.getAttribute('data-quiz');
                    overlay.remove();
                    this.showQuizScenarios(quizName);
                });
                
                // Add keyboard support
                card.setAttribute('tabindex', '0');
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const quizName = card.getAttribute('data-quiz');
                        overlay.remove();
                        this.showQuizScenarios(quizName);
                    }
                });
            });
            
            // Add search functionality
            const searchInput = content.querySelector('.search-input');
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    const searchTerm = searchInput.value.toLowerCase();
                    quizCards.forEach(card => {
                        const quizName = card.querySelector('.quiz-name').textContent.toLowerCase();
                        const quizDescription = card.querySelector('.quiz-description').textContent.toLowerCase();
                        const quizCategory = card.querySelector('.quiz-category').textContent.toLowerCase();
                        
                        const matches = quizName.includes(searchTerm) || 
                                       quizDescription.includes(searchTerm) || 
                                       quizCategory.includes(searchTerm);
                        
                        card.style.display = matches ? 'flex' : 'none';
                    });
                });
            }
            
            // Add category filter functionality
            const categoryFilters = content.querySelectorAll('.category-filter');
            if (categoryFilters.length > 0) {
                categoryFilters.forEach(filter => {
                    filter.addEventListener('click', () => {
                        // Update active state
                        categoryFilters.forEach(f => f.classList.remove('active'));
                        filter.classList.add('active');
                        
                        const category = filter.getAttribute('data-category');
                        
                        quizCards.forEach(card => {
                            const cardCategory = card.querySelector('.quiz-category').textContent;
                            
                            if (category === 'all' || cardCategory === category) {
                                card.style.display = 'flex';
                            } else {
                                card.style.display = 'none';
                            }
                        });
                    });
                });
            }
            
            // Add event listener for close button
            const closeBtn = content.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    overlay.remove();
                });
                
                // Add keyboard support for close button
                closeBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        overlay.remove();
                    }
                });
            }
            
            // Add escape key handler
            const handleEscapeKey = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', handleEscapeKey);
                }
            };
            
            document.addEventListener('keydown', handleEscapeKey);
            
            // Close on click outside
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                }
            });
        } catch (error) {
            console.error('Error showing quiz scenarios selector:', error);
            
            // Update the loading content to show error
            loadingContent.innerHTML = `
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    text-align: center;">
                    <h3 style="color: #dc3545;">Error Loading Quizzes</h3>
                    <p>${error.message || 'Failed to load available quizzes'}</p>
                    <button id="closeErrorBtn" class="action-button" style="
                        margin-top: 20px;
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;">
                        Close
                    </button>
                </div>
            `;
            
            // Add event listener for close button
            const closeErrorBtn = document.getElementById('closeErrorBtn');
            if (closeErrorBtn) {
                closeErrorBtn.addEventListener('click', () => {
                    overlay.remove();
                });
            }
        }
    }

    // Helper method to get mock scenarios for a specific quiz
    getMockScenariosForQuiz(quizName) {
        console.log(`Getting mock scenarios for ${quizName}`);
        
        // Map quiz names to their respective mock data methods
        const mockDataMap = {
            'communication-quiz': this.getMockScenariosForCommunication.bind(this),
            'automation-interview': this.getMockScenariosForAutomation.bind(this),
            'bug-reporting': this.getMockScenariosForBugReporting.bind(this),
            'api-testing': this.getMockScenariosForApiTesting.bind(this),
            'cms-testing': this.getMockScenariosForCmsTesting.bind(this),
            'security-testing': this.getMockScenariosForSecurityTesting.bind(this),
            'test-planning': this.getGenericMockScenarios.bind(this, 'Test Planning'),
            'test-design': this.getGenericMockScenarios.bind(this, 'Test Design')
        };
        
        // Get the appropriate mock data function or use the generic one
        const mockDataFunction = mockDataMap[quizName] || this.getGenericMockScenarios.bind(this, this.formatQuizName(quizName));
        
        // Call the function to get the mock data
        return mockDataFunction();
    }
    
    // Helper method to provide mock data for Communication quiz
    getMockScenariosForCommunication() {
        return {
            basic: [
                {
                    id: 'comm-basic-1',
                    question: 'A colleague sends you an urgent message late at night. What should you do?',
                    options: [
                        {
                            id: 'comm-basic-1-a',
                            text: 'Ignore it until working hours',
                            outcome: 'This could delay critical work, but maintains work-life boundaries.',
                            experience: 5,
                            correct: false
                        },
                        {
                            id: 'comm-basic-1-b',
                            text: 'Respond immediately regardless of the time',
                            outcome: 'This shows dedication but sets unhealthy expectations.',
                            experience: 0,
                            correct: false
                        },
                        {
                            id: 'comm-basic-1-c',
                            text: 'Briefly assess the urgency and respond accordingly',
                            outcome: 'This balances responsiveness with appropriate boundaries.',
                            experience: 20,
                            correct: true
                        }
                    ]
                },
                {
                    id: 'comm-basic-2',
                    question: 'What is the best way to handle disagreements in a team meeting?',
                    options: [
                        {
                            id: 'comm-basic-2-a',
                            text: 'Avoid disagreeing to maintain harmony',
                            outcome: 'This prevents healthy debate and can lead to poor decisions.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: 'comm-basic-2-b',
                            text: 'Express your perspective respectfully with supporting evidence',
                            outcome: 'This contributes to productive discussion while maintaining respect.',
                            experience: 20,
                            correct: true
                        },
                        {
                            id: 'comm-basic-2-c',
                            text: 'Strongly argue your point until others agree',
                            outcome: 'This can create tension and shut down collaborative discussion.',
                            experience: -15,
                            correct: false
                        }
                    ]
                }
            ],
            intermediate: [
                {
                    id: 'comm-int-1',
                    question: 'A client is unhappy with a deliverable. How should you respond?',
                    options: [
                        {
                            id: 'comm-int-1-a',
                            text: 'Defend your work and explain why they should be satisfied',
                            outcome: 'This dismisses the client\'s concerns and may damage the relationship.',
                            experience: -20,
                            correct: false
                        },
                        {
                            id: 'comm-int-1-b',
                            text: 'Listen to their concerns, acknowledge them, and propose solutions',
                            outcome: 'This shows respect and a commitment to client satisfaction.',
                            experience: 25,
                            correct: true
                        },
                        {
                            id: 'comm-int-1-c',
                            text: 'Immediately offer to redo the work without understanding the issues',
                            outcome: 'This may waste time and resources without addressing the real concerns.',
                            experience: 0,
                            correct: false
                        }
                    ]
                }
            ],
            advanced: [
                {
                    id: 'comm-adv-1',
                    question: 'You need to deliver negative feedback to a team member. What approach should you take?',
                    options: [
                        {
                            id: 'comm-adv-1-a',
                            text: 'Send detailed written feedback in an email',
                            outcome: 'Written feedback for sensitive issues can be misinterpreted.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: 'comm-adv-1-b',
                            text: 'Schedule a private meeting, be specific, and focus on improvement',
                            outcome: 'This approach is respectful and constructive.',
                            experience: 30,
                            correct: true
                        },
                        {
                            id: 'comm-adv-1-c',
                            text: 'Mention the issues during a team meeting for transparency',
                            outcome: 'Public criticism can be humiliating and counterproductive.',
                            experience: -25,
                            correct: false
                        }
                    ]
                }
            ]
        };
    }
    
    // Helper method to provide mock data for Automation Interview quiz
    getMockScenariosForAutomation() {
        return {
            basic: [
                {
                    id: 'auto-basic-1',
                    question: 'What is the primary benefit of test automation?',
                    options: [
                        {
                            id: 'auto-basic-1-a',
                            text: 'It eliminates the need for manual testing completely',
                            outcome: 'Automation complements but doesn\'t replace all manual testing.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: 'auto-basic-1-b',
                            text: 'It allows repetitive tests to be executed efficiently and consistently',
                            outcome: 'This is a key benefit of automation.',
                            experience: 20,
                            correct: true
                        },
                        {
                            id: 'auto-basic-1-c',
                            text: 'It guarantees bug-free software',
                            outcome: 'No testing method can guarantee completely bug-free software.',
                            experience: -15,
                            correct: false
                        }
                    ]
                }
            ],
            intermediate: [
                {
                    id: 'auto-int-1',
                    question: 'Which tests should be prioritized for automation?',
                    options: [
                        {
                            id: 'auto-int-1-a',
                            text: 'Tests that are run frequently and have stable requirements',
                            outcome: 'These tests provide the best return on investment for automation.',
                            experience: 25,
                            correct: true
                        },
                        {
                            id: 'auto-int-1-b',
                            text: 'Exploratory tests that require creative thinking',
                            outcome: 'Exploratory tests are better suited for manual testing.',
                            experience: -15,
                            correct: false
                        },
                        {
                            id: 'auto-int-1-c',
                            text: 'Tests for features that are still in development',
                            outcome: 'Automating unstable features leads to high maintenance costs.',
                            experience: -10,
                            correct: false
                        }
                    ]
                }
            ],
            advanced: [
                {
                    id: 'auto-adv-1',
                    question: 'How should you handle flaky automated tests?',
                    options: [
                        {
                            id: 'auto-adv-1-a',
                            text: 'Ignore them as they sometimes pass',
                            outcome: 'Ignoring flaky tests undermines confidence in the test suite.',
                            experience: -25,
                            correct: false
                        },
                        {
                            id: 'auto-adv-1-b',
                            text: 'Analyze root causes and fix the underlying issues',
                            outcome: 'This approach improves test reliability and application quality.',
                            experience: 30,
                            correct: true
                        },
                        {
                            id: 'auto-adv-1-c',
                            text: 'Run the tests multiple times until they pass',
                            outcome: 'This masks problems rather than solving them.',
                            experience: -15,
                            correct: false
                        }
                    ]
                }
            ]
        };
    }
    
    // Helper method to provide mock data for Bug Reporting quiz
    getMockScenariosForBugReporting() {
        return {
            basic: [
                {
                    id: 'bug-basic-1',
                    question: 'What should you include in a bug report?',
                    options: [
                        {
                            id: 'bug-basic-1-a',
                            text: 'Only a description of the problem',
                            outcome: 'This lacks critical information needed to reproduce and fix the issue.',
                            experience: -15,
                            correct: false
                        },
                        {
                            id: 'bug-basic-1-b',
                            text: 'Steps to reproduce, expected vs. actual results, and environment details',
                            outcome: 'This provides comprehensive information for debugging.',
                            experience: 20,
                            correct: true
                        },
                        {
                            id: 'bug-basic-1-c',
                            text: 'Your opinion on how to fix the bug',
                            outcome: 'While sometimes helpful, suggesting fixes isn\'t essential and may not be accurate.',
                            experience: 0,
                            correct: false
                        }
                    ]
                }
            ],
            intermediate: [
                {
                    id: 'bug-int-1',
                    question: 'How should you prioritize bug reports?',
                    options: [
                        {
                            id: 'bug-int-1-a',
                            text: 'Based on how recently they were found',
                            outcome: 'Recency isn\'t a good indicator of importance.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: 'bug-int-1-b',
                            text: 'Based on severity, impact on users, and business priorities',
                            outcome: 'This approach focuses resources on the most important issues.',
                            experience: 25,
                            correct: true
                        },
                        {
                            id: 'bug-int-1-c',
                            text: 'All bugs should have equal priority',
                            outcome: 'Not all bugs have equal impact or urgency.',
                            experience: -15,
                            correct: false
                        }
                    ]
                }
            ],
            advanced: [
                {
                    id: 'bug-adv-1',
                    question: 'A developer says they can\'t reproduce a bug you reported. What should you do?',
                    options: [
                        {
                            id: 'bug-adv-1-a',
                            text: 'Close the bug report as "not reproducible"',
                            outcome: 'This may leave a real issue unresolved.',
                            experience: -20,
                            correct: false
                        },
                        {
                            id: 'bug-adv-1-b',
                            text: 'Provide more detailed reproduction steps and offer to demonstrate the issue',
                            outcome: 'This collaborative approach helps resolve the discrepancy.',
                            experience: 30,
                            correct: true
                        },
                        {
                            id: 'bug-adv-1-c',
                            text: 'Insist that the bug exists and the developer should try harder',
                            outcome: 'This creates conflict rather than collaboration.',
                            experience: -25,
                            correct: false
                        }
                    ]
                }
            ]
        };
    }
    
    // Helper method to provide mock data for API Testing quiz
    getMockScenariosForApiTesting() {
        return {
            basic: [
                {
                    id: 'api-basic-1',
                    title: 'API Verification Fundamentals',
                    question: 'What should you verify when testing a REST API?',
                    options: [
                        {
                            id: 'api-basic-1-a',
                            text: 'Only that the API returns a 200 status code',
                            outcome: 'Status code alone is insufficient for thorough testing.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: 'api-basic-1-b',
                            text: 'Status codes, response format, data validity, and error handling',
                            outcome: 'This covers the essential aspects of API testing.',
                            experience: 20,
                            correct: true
                        },
                        {
                            id: 'api-basic-1-c',
                            text: 'The visual appearance of the API documentation',
                            outcome: 'Documentation appearance isn\'t relevant to API functionality.',
                            experience: -15,
                            correct: false
                        }
                    ]
                },
                {
                    id: 'api-basic-2',
                    title: 'API Testing Tools',
                    question: 'Which tool is most appropriate for API testing?',
                    options: [
                        {
                            id: 'api-basic-2-a',
                            text: 'Selenium WebDriver',
                            outcome: 'Selenium is primarily for UI testing, not API testing.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: 'api-basic-2-b',
                            text: 'Postman, REST Assured, or similar API testing tools',
                            outcome: 'These tools are specifically designed for API testing.',
                            experience: 20,
                            correct: true
                        },
                        {
                            id: 'api-basic-2-c',
                            text: 'Manual testing using a web browser',
                            outcome: 'Browsers are not efficient for direct API testing.',
                            experience: -15,
                            correct: false
                        }
                    ]
                },
                {
                    id: 'api-basic-3',
                    title: 'API Response Validation',
                    question: 'What should you validate in an API response?',
                    options: [
                        {
                            id: 'api-basic-3-a',
                            text: 'Only check if the response contains data',
                            outcome: 'This is insufficient for thorough validation.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: 'api-basic-3-b',
                            text: 'Status code, response time, headers, and payload structure/content',
                            outcome: 'This provides comprehensive validation of the response.',
                            experience: 20,
                            correct: true
                        },
                        {
                            id: 'api-basic-3-c',
                            text: 'Just verify the API doesn\'t return an error',
                            outcome: 'Absence of errors doesn\'t mean the response is correct.',
                            experience: -5,
                            correct: false
                        }
                    ]
                },
                {
                    id: 'api-basic-4',
                    title: 'API Documentation',
                    question: 'What is the purpose of API documentation in testing?',
                    options: [
                        {
                            id: 'api-basic-4-a',
                            text: 'It\'s not relevant for testing',
                            outcome: 'Documentation is crucial for understanding API behavior and requirements.',
                            experience: -15,
                            correct: false
                        },
                        {
                            id: 'api-basic-4-b',
                            text: 'To understand endpoints, parameters, expected responses, and authentication requirements',
                            outcome: 'Documentation provides essential information for effective testing.',
                            experience: 20,
                            correct: true
                        },
                        {
                            id: 'api-basic-4-c',
                            text: 'Only to check the API version',
                            outcome: 'Version information is just one small aspect of API documentation.',
                            experience: -5,
                            correct: false
                        }
                    ]
                },
                {
                    id: 'api-basic-5',
                    title: 'API Testing Types',
                    question: 'Which types of testing are important for APIs?',
                    options: [
                        {
                            id: 'api-basic-5-a',
                            text: 'Only functional testing',
                            outcome: 'APIs require multiple testing types beyond just functional testing.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: 'api-basic-5-b',
                            text: 'Functional, security, performance, and integration testing',
                            outcome: 'This comprehensive approach covers the key aspects of API quality.',
                            experience: 20,
                            correct: true
                        },
                        {
                            id: 'api-basic-5-c',
                            text: 'UI testing is sufficient for APIs',
                            outcome: 'UI testing doesn\'t directly test API functionality.',
                            experience: -15,
                            correct: false
                        }
                    ]
                }
            ],
            intermediate: [
                {
                    id: 'api-int-1',
                    title: 'API Security Testing',
                    question: 'How should you test API security?',
                    options: [
                        {
                            id: 'api-int-1-a',
                            text: 'Focus only on authentication mechanisms',
                            outcome: 'Authentication is important but not the only security concern.',
                            experience: 0,
                            correct: false
                        },
                        {
                            id: 'api-int-1-b',
                            text: 'Test authentication, authorization, input validation, and data protection',
                            outcome: 'This comprehensive approach addresses multiple security aspects.',
                            experience: 25,
                            correct: true
                        },
                        {
                            id: 'api-int-1-c',
                            text: 'Security testing isn\'t necessary for internal APIs',
                            outcome: 'Internal APIs also need security testing to prevent vulnerabilities.',
                            experience: -20,
                            correct: false
                        }
                    ]
                },
                {
                    id: 'api-int-2',
                    title: 'API Contract Testing',
                    question: 'What is the purpose of API contract testing?',
                    options: [
                        {
                            id: 'api-int-2-a',
                            text: 'To test the visual design of the API documentation',
                            outcome: 'Contract testing is not about documentation design.',
                            experience: -15,
                            correct: false
                        },
                        {
                            id: 'api-int-2-b',
                            text: 'To verify that the API implementation adheres to its specification',
                            outcome: 'Contract testing ensures the API meets its defined contract.',
                            experience: 25,
                            correct: true
                        },
                        {
                            id: 'api-int-2-c',
                            text: 'To test the legal terms of using the API',
                            outcome: 'Contract testing refers to technical contracts, not legal agreements.',
                            experience: -10,
                            correct: false
                        }
                    ]
                },
                {
                    id: 'api-int-3',
                    title: 'API Mocking',
                    question: 'When should you use API mocking in testing?',
                    options: [
                        {
                            id: 'api-int-3-a',
                            text: 'Never, always test against real APIs',
                            outcome: 'This approach is impractical and can slow down development.',
                            experience: -15,
                            correct: false
                        },
                        {
                            id: 'api-int-3-b',
                            text: 'When dependent APIs are unavailable, unstable, or to simulate specific scenarios',
                            outcome: 'Mocking enables testing in controlled conditions and without dependencies.',
                            experience: 25,
                            correct: true
                        },
                        {
                            id: 'api-int-3-c',
                            text: 'Only when you don\'t have access to the API documentation',
                            outcome: 'Lack of documentation is not a primary reason for mocking.',
                            experience: -5,
                            correct: false
                        }
                    ]
                },
                {
                    id: 'api-int-4',
                    title: 'API Versioning',
                    question: 'How should API versioning be handled in testing?',
                    options: [
                        {
                            id: 'api-int-4-a',
                            text: 'Only test the latest version',
                            outcome: 'This ignores backward compatibility requirements.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: 'api-int-4-b',
                            text: 'Test all supported versions and version upgrade paths',
                            outcome: 'This ensures all versions work correctly and upgrades are smooth.',
                            experience: 25,
                            correct: true
                        },
                        {
                            id: 'api-int-4-c',
                            text: 'Versioning doesn\'t need specific testing',
                            outcome: 'Ignoring version-specific testing can lead to compatibility issues.',
                            experience: -15,
                            correct: false
                        }
                    ]
                },
                {
                    id: 'api-int-5',
                    title: 'API Error Handling',
                    question: 'What should you verify when testing API error handling?',
                    options: [
                        {
                            id: 'api-int-5-a',
                            text: 'Just check that errors return a non-200 status code',
                            outcome: 'This is insufficient for thorough error handling testing.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: 'api-int-5-b',
                            text: 'Verify appropriate status codes, error messages, and consistent error response format',
                            outcome: 'This ensures errors are handled properly and provide useful information.',
                            experience: 25,
                            correct: true
                        },
                        {
                            id: 'api-int-5-c',
                            text: 'Error handling doesn\'t need specific testing',
                            outcome: 'Proper error handling is crucial for API robustness.',
                            experience: -20,
                            correct: false
                        }
                    ]
                }
            ],
            advanced: [
                {
                    id: 'api-adv-1',
                    title: 'API Performance Testing',
                    question: 'What approach should you take for API performance testing?',
                    options: [
                        {
                            id: 'api-adv-1-a',
                            text: 'Test with a single user to establish a baseline',
                            outcome: 'Single-user testing doesn\'t reveal scaling issues.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: 'api-adv-1-b',
                            text: 'Test with various load patterns, monitor response times and resource usage',
                            outcome: 'This approach identifies performance bottlenecks under different conditions.',
                            experience: 30,
                            correct: true
                        },
                        {
                            id: 'api-adv-1-c',
                            text: 'Focus only on maximum load testing',
                            outcome: 'Maximum load is important but not the only performance consideration.',
                            experience: 0,
                            correct: false
                        }
                    ]
                },
                {
                    id: 'api-adv-2',
                    title: 'API Automation Strategy',
                    question: 'What is the best approach for API test automation?',
                    options: [
                        {
                            id: 'api-adv-2-a',
                            text: 'Automate all API tests without prioritization',
                            outcome: 'This is inefficient and may waste resources on low-value tests.',
                            experience: -15,
                            correct: false
                        },
                        {
                            id: 'api-adv-2-b',
                            text: 'Prioritize critical paths, high-risk areas, and regression tests for automation',
                            outcome: 'This strategic approach maximizes the value of automation efforts.',
                            experience: 30,
                            correct: true
                        },
                        {
                            id: 'api-adv-2-c',
                            text: 'Rely primarily on manual API testing',
                            outcome: 'Manual testing alone is insufficient for thorough API testing.',
                            experience: -20,
                            correct: false
                        }
                    ]
                },
                {
                    id: 'api-adv-3',
                    title: 'API Testing in CI/CD',
                    question: 'How should API testing be integrated into CI/CD pipelines?',
                    options: [
                        {
                            id: 'api-adv-3-a',
                            text: 'Run all API tests in production after deployment',
                            outcome: 'Testing after production deployment is too late to prevent issues.',
                            experience: -25,
                            correct: false
                        },
                        {
                            id: 'api-adv-3-b',
                            text: 'Integrate different levels of API tests at appropriate pipeline stages',
                            outcome: 'This ensures issues are caught early while maintaining pipeline efficiency.',
                            experience: 30,
                            correct: true
                        },
                        {
                            id: 'api-adv-3-c',
                            text: 'API tests should be run separately from the CI/CD pipeline',
                            outcome: 'This disconnects testing from the delivery process.',
                            experience: -15,
                            correct: false
                        }
                    ]
                },
                {
                    id: 'api-adv-4',
                    title: 'API Virtualization',
                    question: 'What are the benefits of service virtualization in API testing?',
                    options: [
                        {
                            id: 'api-adv-4-a',
                            text: 'It eliminates the need for actual API testing',
                            outcome: 'Virtualization complements but doesn\'t replace actual API testing.',
                            experience: -20,
                            correct: false
                        },
                        {
                            id: 'api-adv-4-b',
                            text: 'It enables testing of unavailable dependencies and specific edge cases',
                            outcome: 'Virtualization provides controlled conditions for comprehensive testing.',
                            experience: 30,
                            correct: true
                        },
                        {
                            id: 'api-adv-4-c',
                            text: 'It\'s only useful for UI testing, not API testing',
                            outcome: 'Service virtualization is particularly valuable for API testing.',
                            experience: -15,
                            correct: false
                        }
                    ]
                },
                {
                    id: 'api-adv-5',
                    title: 'GraphQL API Testing',
                    question: 'How does testing GraphQL APIs differ from REST APIs?',
                    options: [
                        {
                            id: 'api-adv-5-a',
                            text: 'GraphQL doesn\'t require testing since it\'s self-documenting',
                            outcome: 'All APIs require testing, regardless of documentation quality.',
                            experience: -25,
                            correct: false
                        },
                        {
                            id: 'api-adv-5-b',
                            text: 'GraphQL requires testing query complexity, resolver functions, and schema validation',
                            outcome: 'This addresses the unique aspects of GraphQL architecture.',
                            experience: 30,
                            correct: true
                        },
                        {
                            id: 'api-adv-5-c',
                            text: 'GraphQL and REST APIs should be tested exactly the same way',
                            outcome: 'This ignores the fundamental differences between these API types.',
                            experience: -10,
                            correct: false
                        }
                    ]
                }
            ]
        };
    }
    
    // Helper method to provide mock data for Security Testing quiz
    getMockScenariosForSecurityTesting() {
        return {
            basic: [
                {
                    id: 'sec-basic-1',
                    question: 'What is the purpose of security testing?',
                    options: [
                        {
                            id: 'sec-basic-1-a',
                            text: 'To make the application completely secure against all attacks',
                            outcome: 'No testing can guarantee complete security against all possible attacks.',
                            experience: -15,
                            correct: false
                        },
                        {
                            id: 'sec-basic-1-b',
                            text: 'To identify vulnerabilities and assess the risk they pose',
                            outcome: 'This accurately describes the purpose of security testing.',
                            experience: 20,
                            correct: true
                        },
                        {
                            id: 'sec-basic-1-c',
                            text: 'To comply with regulations only',
                            outcome: 'Compliance is important but not the only purpose of security testing.',
                            experience: -5,
                            correct: false
                        }
                    ]
                }
            ],
            intermediate: [
                {
                    id: 'sec-int-1',
                    question: 'What is SQL injection and how should it be prevented?',
                    options: [
                        {
                            id: 'sec-int-1-a',
                            text: 'A virus that affects databases; install antivirus software',
                            outcome: 'This shows a fundamental misunderstanding of SQL injection.',
                            experience: -25,
                            correct: false
                        },
                        {
                            id: 'sec-int-1-b',
                            text: 'An attack where malicious SQL is inserted into inputs; use parameterized queries',
                            outcome: 'This correctly identifies the vulnerability and a key prevention method.',
                            experience: 25,
                            correct: true
                        },
                        {
                            id: 'sec-int-1-c',
                            text: 'A database performance issue; optimize database queries',
                            outcome: 'This confuses a security vulnerability with performance optimization.',
                            experience: -20,
                            correct: false
                        }
                    ]
                }
            ],
            advanced: [
                {
                    id: 'sec-adv-1',
                    question: 'How should you approach security testing in a CI/CD pipeline?',
                    options: [
                        {
                            id: 'sec-adv-1-a',
                            text: 'Run comprehensive security tests only before major releases',
                            outcome: 'This approach may allow vulnerabilities to persist in the codebase.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: 'sec-adv-1-b',
                            text: 'Integrate automated security testing at multiple stages with different depths',
                            outcome: 'This "shift-left" approach catches issues early while maintaining efficiency.',
                            experience: 30,
                            correct: true
                        },
                        {
                            id: 'sec-adv-1-c',
                            text: 'Security testing slows down CI/CD and should be done separately',
                            outcome: 'Separating security testing from CI/CD contradicts DevSecOps principles.',
                            experience: -20,
                            correct: false
                        }
                    ]
                }
            ]
        };
    }
    
    // Helper method to provide generic mock data for any quiz
    getGenericMockScenarios(quizName) {
        const formattedName = this.formatQuizName(quizName);
        return {
            basic: [
                {
                    id: `${quizName}-basic-1`,
                    question: `Basic ${formattedName} Scenario 1`,
                    options: [
                        {
                            id: `${quizName}-basic-1-a`,
                            text: 'Option A - Incorrect approach',
                            outcome: 'This approach is not recommended.',
                            experience: -10,
                            correct: false
                        },
                        {
                            id: `${quizName}-basic-1-b`,
                            text: 'Option B - Best practice approach',
                            outcome: 'This follows industry best practices.',
                            experience: 20,
                            correct: true
                        },
                        {
                            id: `${quizName}-basic-1-c`,
                            text: 'Option C - Neutral approach',
                            outcome: 'This approach works but is not optimal.',
                            experience: 5,
                            correct: false
                        }
                    ]
                }
            ],
            intermediate: [
                {
                    id: `${quizName}-int-1`,
                    question: `Intermediate ${formattedName} Scenario 1`,
                    options: [
                        {
                            id: `${quizName}-int-1-a`,
                            text: 'Option A - Incorrect approach',
                            outcome: 'This approach may cause problems.',
                            experience: -15,
                            correct: false
                        },
                        {
                            id: `${quizName}-int-1-b`,
                            text: 'Option B - Best practice approach',
                            outcome: 'This is the recommended approach.',
                            experience: 25,
                            correct: true
                        },
                        {
                            id: `${quizName}-int-1-c`,
                            text: 'Option C - Neutral approach',
                            outcome: 'This approach is acceptable but not ideal.',
                            experience: 5,
                            correct: false
                        }
                    ]
                }
            ],
            advanced: [
                {
                    id: `${quizName}-adv-1`,
                    question: `Advanced ${formattedName} Scenario 1`,
                    options: [
                        {
                            id: `${quizName}-adv-1-a`,
                            text: 'Option A - Incorrect approach',
                            outcome: 'This approach is problematic in complex situations.',
                            experience: -20,
                            correct: false
                        },
                        {
                            id: `${quizName}-adv-1-b`,
                            text: 'Option B - Best practice approach',
                            outcome: 'This approach handles complexity effectively.',
                            experience: 30,
                            correct: true
                        },
                        {
                            id: `${quizName}-adv-1-c`,
                            text: 'Option C - Neutral approach',
                            outcome: 'This approach works in some cases but lacks flexibility.',
                            experience: 10,
                            correct: false
                        }
                    ]
                }
            ]
        };
    }
}

// Export the AdminDashboard class directly
export { AdminDashboard }; 