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
            'sanity-smoke', 'functional-interview'
        ];
        
        this.timerSettings = {
            secondsPerQuestion: 60 // Default value
        };
        
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

        // Load timer settings in the background regardless of page
        if (isTokenValid) {
            this.preloadTimerSettings().catch(error => {
                console.error('Failed to preload timer settings:', error);
            });
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
            
            // Add timer settings button to the admin panel
            this.addTimerSettingsButton();
        }
    }
    
    // Add timer settings button to the UI
    addTimerSettingsButton() {
        // Target the search-controls div to add our button
        const searchControls = document.querySelector('.search-controls');
        if (!searchControls) return;
        
        // Create a new control field for the timer settings
        const timerControlField = document.createElement('div');
        timerControlField.className = 'control-field';
        
        // Create the button inside
        timerControlField.innerHTML = `
            <label class="visually-hidden">Quiz Timer Settings</label>
            <button id="quizTimerSettingsBtn" class="action-button">
                Quiz Timer Settings
            </button>
        `;
        
        // Add it to the search controls
        searchControls.appendChild(timerControlField);
        
        // Add event listener
        const timerBtn = document.getElementById('quizTimerSettingsBtn');
        if (timerBtn) {
            timerBtn.addEventListener('click', () => this.showTimerSettings());
        }
    }

    async preloadTimerSettings() {
        try {
            const settings = await this.apiService.getQuizTimerSettings();
            if (settings.success && settings.data && settings.data.secondsPerQuestion) {
                this.timerSettings = settings.data;
                
                // Save to localStorage for quizzes to use
                localStorage.setItem('quizTimerValue', settings.data.secondsPerQuestion.toString());
                console.log('Preloaded timer settings:', settings.data.secondsPerQuestion);
            }
        } catch (error) {
            console.error('Failed to preload timer settings:', error);
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
            
            // Load quiz timer settings
            await this.loadTimerSettings();
            
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
        const searchControlsContainer = document.querySelector('.search-controls');
        if (searchControlsContainer) {
            // Add View Quiz Scenarios button
            const viewScenariosContainer = document.createElement('div');
            viewScenariosContainer.className = 'control-field';
            viewScenariosContainer.innerHTML = `
                <label class="visually-hidden">View Quiz Scenarios</label>
                <button id="viewQuizScenariosBtn" class="action-button">
                    View Quiz Scenarios
                </button>
            `;
            searchControlsContainer.appendChild(viewScenariosContainer);
            
            // Add event listener for the scenarios button
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
                                    'background-color: #4CAF50; color: white;' : 
                                    'background-color: #4CAF50; color: white;'}">
                                ${user.userType === 'interview_candidate' ? 'Regular' : 'Regular'}
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
                        const isTimedOut = item.timedOut === true;
                        
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
                            isCorrect: isPassed,
                            isTimedOut: isTimedOut
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
                            .questions-table tr.timed-out {
                                background-color: rgba(158, 158, 158, 0.1);
                            }
                            .questions-table tr.passed td {
                                border-bottom: 1px solid rgba(75, 181, 67, 0.2);
                            }
                            .questions-table tr.failed td {
                                border-bottom: 1px solid rgba(255, 68, 68, 0.2);
                            }
                            .questions-table tr.timed-out td {
                                border-bottom: 1px solid rgba(158, 158, 158, 0.2);
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
                            .questions-table tr.timed-out {
                                border-left: 4px solid #9e9e9e;
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
                            .status-badge.timeout {
                                background-color: rgba(158, 158, 158, 0.2);
                                color: #616161;
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
                                                <tr class="${isPassed ? 'passed' : question.isTimedOut ? 'timed-out' : 'failed'}">
                                                    <td>${index + 1}</td>
                                                    <td>
                                                        <span class="status-badge ${isPassed ? 'pass' : question.isTimedOut ? 'timeout' : 'fail'}">
                                                            ${isPassed ? 'CORRECT' : question.isTimedOut ? 'TIMED OUT' : 'INCORRECT'}
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
                    const isTimedOut = item.timedOut === true;
                    
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
                        correctAnswer: correctAnswer || 'Correct answer not available',
                        isTimedOut: isTimedOut
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
                    const isTimedOut = item.timedOut === true;
                    
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
                        correctAnswer: correctAnswer || 'Correct answer not available',
                        isTimedOut: isTimedOut
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
                    .questions-table tr.timed-out {
                        background-color: rgba(158, 158, 158, 0.1);
                    }
                    .questions-table tr.passed td {
                        border-bottom: 1px solid rgba(75, 181, 67, 0.2);
                    }
                    .questions-table tr.failed td {
                        border-bottom: 1px solid rgba(255, 68, 68, 0.2);
                    }
                    .questions-table tr.timed-out td {
                        border-bottom: 1px solid rgba(158, 158, 158, 0.2);
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
                    .questions-table tr.timed-out {
                        border-left: 4px solid #9e9e9e;
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
                    .status-badge.timeout {
                        background-color: rgba(158, 158, 158, 0.2);
                        color: #616161;
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
                                        <tr class="${isPassed ? 'passed' : question.isTimedOut ? 'timed-out' : 'failed'}">
                                            <td>${index + 1}</td>
                                            <td>
                                                <span class="status-badge ${isPassed ? 'pass' : question.isTimedOut ? 'timeout' : 'fail'}">
                                                    ${isPassed ? 'CORRECT' : question.isTimedOut ? 'TIMED OUT' : 'INCORRECT'}
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

            console.log('Creating account with:', {
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
                throw new Error(response.message || 'Failed to create account');
            }

            // Show success message
            this.showSuccess(`Account created for ${username}`);
            
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
            console.error('Failed to create account:', error);
            this.showError(error.message || 'Failed to create account');
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
                    <h2 style="margin-bottom: 1.5rem;">Create Account</h2>
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
                            <div class="password-input-container">
                                <input type="password" 
                                       id="password" 
                                       name="password_${Date.now()}" 
                                       required 
                                       minlength="6"
                                       autocomplete="new-password"
                                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                <button type="button" class="password-toggle" aria-label="Toggle password visibility">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
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

        // Add password visibility toggle functionality
        const passwordToggle = modal.querySelector('.password-toggle');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => {
                const input = passwordToggle.previousElementSibling;
                const icon = passwordToggle.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }

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

            if (username.length < 3) {
                this.showError('Username must be at least 3 characters long');
                return;
            }

            if (password.length < 6) {
                this.showError('Password must be at least 6 characters long');
                return;
            }

            if (selectedQuizzes.length === 0) {
                this.showError('Please select at least one quiz');
                return;
            }

            try {
                await this.createInterviewAccount(username, password, selectedQuizzes);
                modal.remove();
                this.showSuccess('Account created successfully');
                this.updateUserList();
            } catch (error) {
                this.showError(error.message || 'Failed to create account');
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
            console.log(`Fetching quiz scenarios for ${quizName} using API endpoint`);
            
            // Normalize the quiz name to match API expectations
            const normalizedQuizName = quizName.toLowerCase();
            
            // Get the token
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                throw new Error('No admin token found. Please log in again.');
            }
            
            // Get the API URL from config or use a fallback
            let apiUrl;
            try {
                // Try to import the config
                const { config } = await import('./config.js');
                apiUrl = config.apiUrl;
                console.log(`Using API URL from config: ${apiUrl}`);
            } catch (importError) {
                console.warn('Failed to import config.js, using fallback API URL', importError);
                
                // Fallback logic to determine API URL
                if (window.location.hostname.includes('render.com') || 
                    window.location.hostname === 'bug-training-game.onrender.com') {
                    apiUrl = 'https://bug-training-game-api.onrender.com/api';
                } 
                else if (window.location.hostname.includes('amazonaws.com') || 
                         window.location.hostname.includes('s3-website') ||
                         window.location.hostname.includes('learning-hub')) {
                    apiUrl = 'http://13.42.151.152/api';
                }
                else {
                    apiUrl = '/api'; // Local development
                }
                
                console.log(`Using fallback API URL: ${apiUrl}`);
            }
            
            const response = await fetch(`${apiUrl}/admin/quizzes/${normalizedQuizName}/scenarios`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `Failed to fetch scenarios: ${response.status}`;
                
                // Check for specific error about extracting scenarios
                if (errorMessage.includes('Could not extract scenarios from source code')) {
                    throw new Error(`The quiz file format for ${this.formatQuizName(quizName)} is not compatible with the scenario viewer. This is likely due to the quiz file using JavaScript objects that cannot be parsed as JSON.`);
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch scenarios from API');
            }
            
            console.log(`Successfully fetched scenarios for ${quizName} from API`);
            return data;
        } catch (error) {
            console.error(`Error in fetchQuizScenarios for ${quizName}:`, error);
            throw error;
        }
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
                // Set a timeout for the fetch operation
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Request timed out after 10 seconds')), 10000);
                });
                
                // Race the fetch against the timeout
                scenarios = await Promise.race([
                    this.fetchQuizScenarios(quizName),
                    timeoutPromise
                ]);
                
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
                
                // Check if we have any scenarios to display
                const hasScenarios = 
                    (scenarios.basic && scenarios.basic.length > 0) || 
                    (scenarios.intermediate && scenarios.intermediate.length > 0) || 
                    (scenarios.advanced && scenarios.advanced.length > 0);
                    
                if (!hasScenarios) {
                    throw new Error(`No scenarios found for ${this.formatQuizName(quizName)}`);
                }
                
            } catch (fetchError) {
                console.error(`Error fetching scenarios for ${quizName}:`, fetchError);
                
                // Determine if this is a parsing error
                const isParsingError = fetchError.message.includes('not compatible with the scenario viewer') || 
                                      fetchError.message.includes('Could not extract scenarios');
                
                // Show error message in the loading overlay
                loadingOverlay.innerHTML = `
                    <div style="
                        background: white;
                        padding: 2rem;
                        border-radius: 8px;
                        text-align: center;
                        max-width: 600px;">
                        <h3 style="color: #dc3545;">Error</h3>
                        <p>${fetchError.message || `Failed to load scenarios for ${this.formatQuizName(quizName)}`}</p>
                        <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #6c757d;">
                            ${isParsingError ? 
                              `The quiz file structure may be using JavaScript features that cannot be automatically extracted.
                               You can still view the quiz file directly to see the scenarios.` : 
                              `This could be due to network issues or the quiz file not being available.
                               Please try again later or contact the administrator.`}
                        </p>
                        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                            ${isParsingError ? 
                              `<button id="viewFileBtn" class="action-button" style="
                                  background: var(--primary-color);
                                  color: white;
                                  border: none;
                                  padding: 8px 16px;
                                  border-radius: 4px;
                                  cursor: pointer;">
                                  View Quiz File
                              </button>` : ''}
                            <button id="retryBtn" class="action-button" style="
                                background: ${isParsingError ? '#6c757d' : 'var(--primary-color)'};
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
                
                // Add event listener for view file button if it exists
                const viewFileBtn = document.getElementById('viewFileBtn');
                if (viewFileBtn) {
                    viewFileBtn.addEventListener('click', () => {
                        loadingOverlay.remove();
                        
                        // Open the quiz file in a new tab/window
                        const quizFileName = `${quizName.toLowerCase()}-quiz.js`;
                        const quizFileUrl = `/quizzes/${quizFileName}`;
                        
                        // Create a modal to show the file path
                        const filePathModal = document.createElement('div');
                        filePathModal.className = 'modal-overlay';
                        filePathModal.innerHTML = `
                            <div style="
                                background: white;
                                padding: 2rem;
                                border-radius: 8px;
                                text-align: center;
                                max-width: 600px;">
                                <h3>Quiz File Information</h3>
                                <p>To view the quiz file, you can navigate to:</p>
                                <code style="
                                    display: block;
                                    background: #f8f9fa;
                                    padding: 1rem;
                                    border-radius: 4px;
                                    margin: 1rem 0;
                                    text-align: left;
                                    overflow-x: auto;">
                                    frontend/quizzes/${quizName.toLowerCase()}-quiz.js
                                </code>
                                <p>This file contains the scenarios for the ${this.formatQuizName(quizName)} quiz.</p>
                                <button id="closeFilePathBtn" class="action-button" style="
                                    background: var(--primary-color);
                                    color: white;
                                    border: none;
                                    padding: 8px 16px;
                                    border-radius: 4px;
                                    cursor: pointer;">
                                    Close
                                </button>
                            </div>
                        `;
                        document.body.appendChild(filePathModal);
                        
                        // Add event listener for close button
                        const closeFilePathBtn = document.getElementById('closeFilePathBtn');
                        if (closeFilePathBtn) {
                            closeFilePathBtn.addEventListener('click', () => {
                                filePathModal.remove();
                            });
                        }
                    });
                }
                
                return; // Exit the function early
            }
            
            // Remove loading indicator
            loadingOverlay.remove();
            
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
                        margin-bottom: 0.5rem;
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
                    .option-tool {
                        margin-top: 0.5rem;
                        font-size: 0.9rem;
                        color: #6c757d;
                    }
                    .scenario-meta {
                        display: flex;
                        gap: 1rem;
                        font-size: 0.9rem;
                        color: #6c757d;
                        margin-top: 0.5rem;
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
        // Helper function to safely escape HTML
        const escapeHTML = (str) => {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };
        
        return scenarios.map(scenario => {
            // Sort options to show correct answers first
            const sortedOptions = [...scenario.options].sort((a, b) => {
                // First by correctness (correct first)
                if ((a.experience > 0) !== (b.experience > 0)) {
                    return (a.experience > 0) ? -1 : 1;
                }
                // Then by experience value (higher first)
                return b.experience - a.experience;
            });
            
            return `
                <div class="scenario-card">
                    <div class="scenario-header">
                        <h4 class="scenario-title">${escapeHTML(scenario.title)}</h4>
                        <div class="scenario-meta">
                            <span class="scenario-id">ID: ${scenario.id}</span>
                            <span class="scenario-level">Level: ${escapeHTML(scenario.level)}</span>
                        </div>
                    </div>
                    <div class="scenario-body">
                        <p class="scenario-description">${escapeHTML(scenario.description)}</p>
                        ${scenario.note ? `<p class="scenario-note" style="font-style: italic; color: #6c757d;">${escapeHTML(scenario.note)}</p>` : ''}
                        <ul class="options-list">
                            ${sortedOptions.map(option => `
                                <li class="option-item ${option.experience > 0 ? 'correct' : 'incorrect'}">
                                    <div class="option-text">${escapeHTML(option.text)}</div>
                                    <div class="option-outcome">${escapeHTML(option.outcome)}</div>
                                    <div class="option-experience ${option.experience > 0 ? 'positive' : option.experience < 0 ? 'negative' : 'neutral'}">
                                        Experience: ${option.experience > 0 ? '+' : ''}${option.experience}
                                    </div>
                                    ${option.tool ? `<div class="option-tool">Tool: ${escapeHTML(option.tool)}</div>` : ''}
                                </li>
                            `).join('')}
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
        
        // Get the list of available quizzes from the quizTypes array
        const quizzes = this.quizTypes.map(quizType => {
            return {
                id: quizType,
                name: this.formatQuizName(quizType),
                description: `View scenarios for the ${this.formatQuizName(quizType)} quiz`,
                category: this.categorizeQuiz(quizType)
            };
        });
        
        // Create the content for the quiz selector
        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.maxWidth = '800px';
        content.style.width = '90%';
        
        // Group quizzes by category
        const quizzesByCategory = {};
        quizzes.forEach(quiz => {
            if (!quizzesByCategory[quiz.category]) {
                quizzesByCategory[quiz.category] = [];
            }
            quizzesByCategory[quiz.category].push(quiz);
        });
        
        // Sort categories alphabetically
        const sortedCategories = Object.keys(quizzesByCategory).sort();
        
        // Create HTML for each category
        let quizzesHTML = '';
        sortedCategories.forEach(category => {
            // Sort quizzes within each category alphabetically by name
            const sortedQuizzes = quizzesByCategory[category].sort((a, b) => 
                a.name.localeCompare(b.name)
            );
            
            quizzesHTML += `
                <div class="quiz-category">
                    <h3 class="category-title">${category}</h3>
                    <div class="quiz-grid">
                        ${sortedQuizzes.map(quiz => `
                            <div class="quiz-card" data-quiz-id="${quiz.id}">
                                <h4>${quiz.name}</h4>
                                <p>${quiz.description}</p>
                                <button class="view-scenarios-btn" data-quiz-id="${quiz.id}">
                                    View Scenarios
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        content.innerHTML = `
            <style>
                .modal-content {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    padding: 2rem;
                    max-height: 85vh;
                    overflow-y: auto;
                    position: relative;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #eee;
                }
                .modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    line-height: 1;
                }
                .quiz-category {
                    margin-bottom: 2rem;
                }
                .category-title {
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #eee;
                    color: var(--text-primary);
                }
                .quiz-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1rem;
                }
                .quiz-card {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 1.25rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .quiz-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                .quiz-card h4 {
                    margin-top: 0;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                }
                .quiz-card p {
                    margin-bottom: 1rem;
                    flex-grow: 1;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                .view-scenarios-btn {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background-color 0.2s ease;
                    align-self: flex-start;
                    margin-top: auto;
                }
                .view-scenarios-btn:hover {
                    background: var(--primary-dark);
                }
                .search-box {
                    margin-bottom: 1.5rem;
                    width: 100%;
                }
                .search-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 1rem;
                }
                .search-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
                }
                @media (max-width: 768px) {
                    .quiz-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            <div class="modal-header">
                <h2 id="quiz-selector-title">Select a Quiz to View Scenarios</h2>
                <button class="close-btn" aria-label="Close quiz selector">×</button>
            </div>
            <div class="search-box">
                <input type="text" 
                       class="search-input" 
                       placeholder="Search quizzes..." 
                       aria-label="Search quizzes">
            </div>
            <div class="quizzes-container">
                ${quizzesHTML}
            </div>
        `;
        
        // Replace the loading content with the actual content
        overlay.innerHTML = '';
        overlay.appendChild(content);
        
        // Add event listener for close button
        const closeBtn = content.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                overlay.remove();
            });
        }
        
        // Add event listeners for view scenarios buttons
        const viewButtons = content.querySelectorAll('.view-scenarios-btn');
        viewButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const quizId = button.dataset.quizId;
                overlay.remove();
                await this.showQuizScenarios(quizId);
            });
        });
        
        // Add search functionality
        const searchInput = content.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                const quizCards = content.querySelectorAll('.quiz-card');
                
                quizCards.forEach(card => {
                    const quizName = card.querySelector('h4').textContent.toLowerCase();
                    const quizDescription = card.querySelector('p').textContent.toLowerCase();
                    
                    if (quizName.includes(searchTerm) || quizDescription.includes(searchTerm)) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // Show/hide category headers based on visible cards
                const categories = content.querySelectorAll('.quiz-category');
                categories.forEach(category => {
                    const visibleCards = category.querySelectorAll('.quiz-card[style=""]').length;
                    if (visibleCards === 0) {
                        category.style.display = 'none';
                    } else {
                        category.style.display = '';
                    }
                });
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
    }
    
    // Helper method to categorize quizzes
    categorizeQuiz(quizName) {
        const technicalQuizzes = [
            'automation-interview', 'cms-testing', 'email-testing', 
            'script-metrics-troubleshooting', 'standard-script-testing'
        ];
        
        const qaProcessQuizzes = [
            'build-verification', 'exploratory', 'fully-scripted', 
            'issue-verification', 'non-functional', 'sanity-smoke', 
            'test-types-tricks', 'test-support'
        ];
        
        const contentQuizzes = [
            'content-copy', 'locale-testing'
        ];
        
        const toolsQuizzes = [
            'issue-tracking-tools', 'raising-tickets', 'reports'
        ];
        
        const softSkillsQuizzes = [
            'communication', 'initiative', 'time-management', 
            'tester-mindset', 'risk-analysis', 'risk-management'
        ];
        
        if (technicalQuizzes.includes(quizName)) return 'Technical Skills';
        if (qaProcessQuizzes.includes(quizName)) return 'QA Processes';
        if (contentQuizzes.includes(quizName)) return 'Content Testing';
        if (toolsQuizzes.includes(quizName)) return 'Tools & Documentation';
        if (softSkillsQuizzes.includes(quizName)) return 'Soft Skills';
        
        return 'Other Quizzes';
    }

    // Load quiz timer settings
    async loadTimerSettings() {
        try {
            const response = await this.apiService.getQuizTimerSettings();
            if (response.success && response.data) {
                this.timerSettings = response.data;
                console.log('Loaded timer settings:', this.timerSettings);
            }
        } catch (error) {
            console.error('Failed to load timer settings:', error);
        }
    }

    // Show quiz timer settings dialog
    async showTimerSettings() {
        // Ensure settings are loaded
        if (!this.timerSettings) {
            await this.loadTimerSettings();
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'timerSettingsModal';
        modal.className = 'modal';
        
        // Set current value in seconds
        const currentValue = this.timerSettings.secondsPerQuestion || 60;
        const timerStatus = currentValue === 0 ? ' (currently disabled)' : ` (currently ${currentValue} seconds)`;
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Quiz Timer Settings</h2>
                    <button class="close-button" aria-label="Close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Set the time allowed for each quiz question${timerStatus}</p>
                    <div class="form-group">
                        <label for="timerSeconds">Seconds per question (0-300):</label>
                        <input type="number" id="timerSeconds" min="0" max="300" value="${currentValue}" 
                               class="form-control" required aria-label="Seconds per question">
                        <small>Set to 0 to disable the timer completely.</small>
                    </div>
                    <div class="form-actions">
                        <button id="saveTimerSettings" class="primary-button">Save Settings</button>
                        <button id="cancelTimerSettings" class="secondary-button">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.close-button');
        const saveBtn = document.getElementById('saveTimerSettings');
        const cancelBtn = document.getElementById('cancelTimerSettings');
        
        // Close modal helper function
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        };
        
        // Add escape key handler
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscapeKey);
            }
        };
        
        // Add event listeners
        document.addEventListener('keydown', handleEscapeKey);
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // Save button handler
        saveBtn.addEventListener('click', async () => {
            const timerInput = document.getElementById('timerSeconds');
            const newValue = parseInt(timerInput.value, 10);
            
            // Validate input (allow 0 to disable the timer)
            if (isNaN(newValue) || newValue < 0 || newValue > 300) {
                this.showError('Timer value must be between 0 and 300 seconds');
                return;
            }
            
            try {
                saveBtn.disabled = true;
                saveBtn.textContent = 'Saving...';
                
                // Call API to update setting
                const response = await this.apiService.updateQuizTimerSettings(newValue);
                
                if (response.success) {
                    // Update local settings
                    this.timerSettings.secondsPerQuestion = newValue;
                    
                    // Update localStorage for immediate effect on quizzes
                    localStorage.setItem('quizTimerValue', newValue.toString());
                    
                    // Success message with context about timer being enabled/disabled
                    const successMsg = newValue === 0 
                        ? 'Quiz timer disabled successfully' 
                        : `Quiz timer set to ${newValue} seconds successfully`;
                    
                    this.showSuccess(successMsg);
                    closeModal();
                } else {
                    throw new Error(response.message || 'Failed to update timer settings');
                }
            } catch (error) {
                console.error('Failed to save timer settings:', error);
                this.showError(error.message || 'Failed to save timer settings');
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Settings';
            }
        });
    }
}

// Export the AdminDashboard class directly
export { AdminDashboard }; 