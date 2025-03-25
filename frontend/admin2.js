import { AdminDashboard } from './admin.js';

class Admin2Dashboard extends AdminDashboard {
    constructor() {
        super();
        // Additional initialization for Admin2Dashboard
        this.isRowView = false; // Default to grid view
        this.init2();
    }

    async init2() {
        try {
            // Get the admin token from localStorage
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                window.location.replace('./admin-login.html');
                return;
            }

            // Verify admin token
            const isValid = await this.verifyAdminToken(adminToken);
            if (!isValid) {
                // Token is invalid, redirect to login
                window.location.replace('./admin-login.html');
                return;
            }
            
            // Set up event listeners after verifying token
            this.setupEventListeners();
            
            // Load users (add this line)
            try {
                await this.loadUsers();
                console.log(`Successfully loaded ${this.users.length} users`);
            } catch (error) {
                console.error('Error loading users:', error);
            }
            
            // Timer settings
            this.displayTimerSettings();
            
            // Set up create account form
            try {
                this.setupCreateAccountForm();
                console.log('Create account form set up successfully');
            } catch (error) {
                console.error('Error setting up create account form:', error);
            }
            
            // Set up scenarios list
            try {
                this.setupScenariosList();
                console.log('Scenarios list set up successfully');
            } catch (error) {
                console.error('Error setting up scenarios list:', error);
            }
            
            // Setup schedule section
            try {
                this.setupScheduleSection();
                console.log('Schedule section set up successfully');
                
                // Set up interval to check for scheduled resets
                setInterval(() => this.checkScheduledResets(), 60000); // Check every minute
            } catch (error) {
                console.error('Error setting up schedule section:', error);
            }
        } catch (error) {
            console.error('Error in init2:', error);
            // Handle initialization error - redirect to login if authentication fails
            window.location.replace('/pages/admin-login.html');
        }
    }
    
    // Add loadUsers method
    async loadUsers() {
        try {
            // Use the apiService to properly handle authentication
            const response = await this.apiService.getAllUsers();
            
            if (response.success) {
                console.log('Loaded user data:', response.data);
                
                // Store users data
                this.users = response.data;
                
                // Update dashboard with user data
                this.updateUsersList();
                
                // Load user progress for all users
                this.loadAllUserProgress();
                
                return response.data;
            } else {
                console.error('Failed to load users:', response.error);
                throw new Error(`Failed to load users: ${response.error}`);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Failed to load users. Please try refreshing the page.');
            throw error;
        }
    }
    
    async loadAllUserProgress() {
        try {
            for (const user of this.users) {
                try {
                    await this.loadUserProgress(user.username);
                } catch (error) {
                    console.error(`Error loading progress for user ${user.username}:`, error);
                }
            }
            // Update the user list display to reflect progress data
            this.updateUsersList();
        } catch (error) {
            console.error('Error loading all user progress:', error);
        }
    }
    
    async loadUserProgress(username) {
        try {
            // Use the apiService to properly handle authentication
            const response = await this.apiService.getUserProgress(username);
            
            if (response.success) {
                console.log(`Loaded progress for ${username}:`, response.data);
                
                // Find the user and update their progress data
                const userIndex = this.users.findIndex(u => u.username === username);
                if (userIndex !== -1) {
                    // Verify data format
                    if (typeof response.data === 'object') {
                        // Store quiz progress data
                        this.users[userIndex].quizProgress = response.data.quizProgress || {};
                        
                        // Store quiz results data if available
                        if (response.data.quizResults && Array.isArray(response.data.quizResults)) {
                            this.users[userIndex].quizResults = response.data.quizResults;
                        }
                        
                        return response.data;
                    } else {
                        console.error(`Invalid progress data format for ${username}:`, response.data);
                        throw new Error('Invalid progress data format');
                    }
                } else {
                    console.error(`User ${username} not found in users list`);
                    throw new Error(`User ${username} not found`);
                }
            } else {
                console.error(`Failed to load progress for ${username}:`, response.error);
                throw new Error(`Failed to load progress: ${response.error}`);
            }
        } catch (error) {
            console.error(`Error loading progress for ${username}:`, error);
            throw error;
        }
    }
    
    setupEventListeners() {
        // Set up the sidebar menu navigation
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all items and sections
                menuItems.forEach(i => i.classList.remove('active'));
                document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                
                // Show the corresponding section
                const sectionId = item.dataset.section;
                document.getElementById(`${sectionId}-section`).classList.add('active');
                
                // If entering the schedule section, refresh the data
                if (sectionId === 'schedule') {
                    this.refreshScheduleData();
                }
            });
        });
        
        // Set up logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleAdminLogout();
            });
        }
        
        // Set up view toggle
        const toggleButtons = document.querySelectorAll('.toggle-button');
        const usersList = document.getElementById('usersList');
        
        if (toggleButtons.length > 0 && usersList) {
            // Initialize with grid view by default
            usersList.className = 'users-list grid-view';
            toggleButtons.forEach(btn => {
                if (btn.dataset.view === 'grid') {
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                } else {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                }
            });
            
            toggleButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Remove active class from all toggle buttons
                    toggleButtons.forEach(btn => {
                        btn.classList.remove('active');
                        btn.setAttribute('aria-pressed', 'false');
                    });
                    
                    // Add active class to clicked button
                    button.classList.add('active');
                    button.setAttribute('aria-pressed', 'true');
                    
                    // Update the users list class based on the selected view
                    const viewType = button.dataset.view;
                    console.log(`Switching to view type: ${viewType}`);
                    usersList.className = `users-list ${viewType}-view`;
                    
                    // Force re-render user list to apply new view
                    this.updateUserList();
                });
            });
        }
        
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
        
        // Set up export buttons
        const exportDetailedCSV = document.getElementById('exportDetailedCSV');
        if (exportDetailedCSV) {
            exportDetailedCSV.addEventListener('click', () => {
                this.exportUserDataToCSV();
            });
        }
        
        const exportSimpleCSV = document.getElementById('exportSimpleCSV');
        if (exportSimpleCSV) {
            exportSimpleCSV.addEventListener('click', () => {
                this.exportSimpleCSV();
            });
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
    
    async updateUsersList() {
        const container = document.getElementById('usersList');
        if (!container) {
            console.error('Users container not found');
            return;
        }
        
        if (!this.users || this.users.length === 0) {
            container.innerHTML = '<div class="no-users">No users found</div>';
            return;
        }
        
        console.log(`Updating users list with ${this.users.length} users`);

        // Get filter values
        const searchTerm = (document.getElementById('userSearch')?.value || '').toLowerCase();
        const accountType = document.getElementById('accountType')?.value || 'all';
        const sortBy = document.getElementById('sortBy')?.value || 'username-asc';
        
        // Check if row view is active
        const isRowView = this.isRowView;
        
        // Filter users by search term and account type
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
            
            if (this.quizTypes && Array.isArray(this.quizTypes)) {
                this.quizTypes.forEach(quizType => {
                    if (typeof quizType === 'string') {
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
                    }
                });
            }

            const card = document.createElement('div');
            card.className = 'user-card';
            
            if (isRowView) {
                card.innerHTML = `
                    <div class="row-content">
                        <div class="user-info">
                            <span class="username">${user.username}</span>
                            <span class="account-type-badge">
                                ${user.userType === 'interview_candidate' ? 'Interview' : 'Regular'}
                            </span>
                        </div>
                        <div class="user-stats">
                            <div class="stat">
                                <span class="stat-label">Progress:</span>
                                <span class="stat-value">${progress.toFixed(1)}%</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Questions:</span>
                                <span class="stat-value">${totalQuestionsAnswered}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">XP:</span>
                                <span class="stat-value">${totalXP}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Last Active:</span>
                                <span class="stat-value">${this.formatDate(lastActive)}</span>
                            </div>
                        </div>
                        <button class="view-details-btn row-btn" tabindex="0" aria-label="View details for ${user.username}">View Details</button>
                    </div>
                `;
                
                const viewBtn = card.querySelector('.view-details-btn');
                if (viewBtn) {
                    viewBtn.addEventListener('click', () => {
                        this.showUserDetails(user.username);
                    });
                    viewBtn.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.showUserDetails(user.username);
                        }
                    });
                }
            } else {
                card.innerHTML = `
                    <div class="user-card-content">
                        <div class="user-header">
                            <span class="username">${user.username}</span>
                            <span class="account-type-badge">
                                ${user.userType === 'interview_candidate' ? 'Interview' : 'Regular'}
                            </span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${progress}%"></div>
                            <span class="progress-text">${progress.toFixed(1)}%</span>
                        </div>
                        <div class="user-stats">
                            <div class="stat">
                                <span class="stat-label">Questions:</span>
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
                    <button class="view-details-btn" tabindex="0" aria-label="View details for ${user.username}">
                        View Details
                    </button>
                `;
                
                // Add event listener for view details button
                card.querySelector('.view-details-btn').addEventListener('click', () => {
                    this.showUserDetails(user.username);
                });
                card.querySelector('.view-details-btn').addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.showUserDetails(user.username);
                    }
                });
            }

            container.appendChild(card);
        });

        if (filteredUsers.length === 0) {
            container.innerHTML = '<div class="no-users">No users match your search criteria</div>';
        }
        
        console.log(`Displayed ${filteredUsers.length} users out of ${this.users.length} total`);
    }
    
    // Display timer settings in the settings section
    displayTimerSettings() {
        const timerContainer = document.getElementById('timer-settings-container');
        if (!timerContainer) return;
        
        // Get the default value
        const defaultValue = this.timerSettings?.defaultSeconds ?? 60;
        const quizTimers = this.timerSettings?.quizTimers ?? {};
        
        // Create HTML for settings form
        timerContainer.innerHTML = `
            <div class="settings-form timer-settings-form">
                <h4>Default Timer Setting</h4>
                <p>This setting applies to all quizzes unless overridden by per-quiz settings.</p>
                <div class="form-group">
                    <label for="default-timer-value">
                        Default seconds per question (0-300):
                    </label>
                    <div class="input-with-button">
                    <input 
                        type="number" 
                            id="default-timer-value" 
                        min="0" 
                        max="300" 
                            value="${defaultValue}"
                        class="settings-input"
                    />
                        <button id="save-default-timer-btn" class="action-button">Save Default</button>
                    </div>
                    <small>Set to 0 to disable the timer completely.</small>
                </div>
                
                <h4 class="mt-4">Per-Quiz Timer Settings</h4>
                <p>Set different time limits for specific quizzes. These override the default setting.</p>
                
                <div class="per-quiz-timer-form">
                    <div class="form-group">
                        <label for="quiz-select">Select Quiz:</label>
                        <select id="quiz-select" class="settings-input">
                            <option value="">-- Select a Quiz --</option>
                            ${this.quizTypes && Array.isArray(this.quizTypes) 
                                ? this.quizTypes
                                    .slice()
                                    .sort((a, b) => this.formatQuizName(a).localeCompare(this.formatQuizName(b)))
                                    .map(quiz => `<option value="${quiz}">${this.formatQuizName(quiz)}</option>`)
                                    .join('')
                                : ''
                            }
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="quiz-timer-value">
                            Seconds per question for this quiz (0-300):
                        </label>
                        <div class="input-with-button">
                            <input 
                                type="number" 
                                id="quiz-timer-value" 
                                min="0" 
                                max="300" 
                                value="60"
                                class="settings-input"
                                disabled
                            />
                            <button id="save-quiz-timer-btn" class="action-button" disabled>Set Timer</button>
                            <button id="reset-quiz-timer-btn" class="action-button secondary" disabled>Reset to Default</button>
                        </div>
                    </div>
                </div>
                
                <h4 class="mt-4">Current Timer Settings</h4>
                <div class="current-timer-settings">
                    <div class="default-timer-display">
                        <strong>Default:</strong> 
                        <span id="default-timer-display">${defaultValue === 0 ? 'Timer disabled' : `${defaultValue} seconds`}</span>
                    </div>
                    
                    <div class="custom-timers-list">
                        <h5>Quiz-Specific Settings:</h5>
                        ${this.generateQuizTimersList(quizTimers)}
                    </div>
                </div>
            </div>
        `;
        
        // Apply some styles to make it look better
        const style = document.createElement('style');
        style.textContent = `
            .timer-settings-form h4 {
                margin-top: 1.5rem;
                margin-bottom: 0.5rem;
                border-bottom: 1px solid #eee;
                padding-bottom: 0.5rem;
            }
            .input-with-button {
                display: flex;
                gap: 10px;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            .action-button.secondary {
                background-color: #6c757d;
            }
            .action-button.secondary:hover {
                background-color: #5a6268;
            }
            .mt-4 {
                margin-top: 1.5rem;
            }
            .current-timer-settings {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin-top: 1rem;
            }
            .default-timer-display {
                margin-bottom: 10px;
                font-size: 16px;
            }
            .custom-timers-list {
                margin-top: 15px;
            }
            .custom-timers-list h5 {
                margin-bottom: 10px;
                font-size: 14px;
                color: #666;
            }
            .timer-table {
                width: 100%;
                border-collapse: collapse;
            }
            .timer-table th, .timer-table td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            .timer-table th {
                background-color: #eee;
                font-weight: 600;
            }
            .timer-table tr:hover {
                background-color: #f5f5f5;
            }
            .no-custom-timers {
                color: #666;
                font-style: italic;
            }
        `;
        timerContainer.appendChild(style);
        
        // Add event listener for the default timer save button
        const saveDefaultButton = document.getElementById('save-default-timer-btn');
        if (saveDefaultButton) {
            saveDefaultButton.addEventListener('click', async () => {
                const defaultTimerInput = document.getElementById('default-timer-value');
                if (!defaultTimerInput) return;
                
                try {
                    // Get value from input
                    const newDefaultValue = parseInt(defaultTimerInput.value, 10);
                    
                    // Validate
                    if (isNaN(newDefaultValue) || newDefaultValue < 0 || newDefaultValue > 300) {
                        alert('Timer value must be between 0 and 300 seconds');
                        return;
                    }
                    
                    // Update UI
                    saveDefaultButton.disabled = true;
                    saveDefaultButton.textContent = 'Saving...';
                    
                    // Call API to save (keeping existing per-quiz settings)
                    const response = await this.apiService.updateQuizTimerSettings(newDefaultValue, quizTimers);
                    
                    // Success
                    if (response.success) {
                        // Update local cache
                        this.timerSettings = response.data;
                        
                        // Show feedback
                        const message = newDefaultValue === 0 
                            ? 'Default quiz timer disabled successfully!' 
                            : `Default quiz timer set to ${newDefaultValue} seconds!`;
                            
                        this.showSuccess(message);
                        this.displayTimerSettings(); // Refresh the display
                    } else {
                        throw new Error(response.message || 'Failed to save settings');
                    }
                } catch (error) {
                    console.error('Failed to save default timer settings:', error);
                    this.showError(`Error: ${error.message || 'Failed to save settings'}`);
                } finally {
                    // Reset button
                    saveDefaultButton.disabled = false;
                    saveDefaultButton.textContent = 'Save Default';
                }
            });
        }
        
        // Add event listeners for quiz selection dropdown
        const quizSelect = document.getElementById('quiz-select');
        const quizTimerInput = document.getElementById('quiz-timer-value');
        const saveQuizTimerButton = document.getElementById('save-quiz-timer-btn');
        const resetQuizTimerButton = document.getElementById('reset-quiz-timer-btn');
        
        if (quizSelect && quizTimerInput && saveQuizTimerButton && resetQuizTimerButton) {
            quizSelect.addEventListener('change', () => {
                const selectedQuiz = quizSelect.value;
                if (selectedQuiz) {
                    // Enable the timer input and buttons
                    quizTimerInput.disabled = false;
                    saveQuizTimerButton.disabled = false;
                    resetQuizTimerButton.disabled = false;
                    
                    // Set the input value to the current setting for this quiz or the default
                    const quizSetting = quizTimers[selectedQuiz];
                    quizTimerInput.value = quizSetting !== undefined ? quizSetting : defaultValue;
                } else {
                    // Disable the timer input and buttons if no quiz is selected
                    quizTimerInput.disabled = true;
                    saveQuizTimerButton.disabled = true;
                    resetQuizTimerButton.disabled = true;
                    quizTimerInput.value = 60;
                }
            });
            
            // Add event listener for saving quiz-specific timer
            saveQuizTimerButton.addEventListener('click', async () => {
                const selectedQuiz = quizSelect.value;
                if (!selectedQuiz) return;
                
                try {
                    // Get value from input
                    const quizTimerValue = parseInt(quizTimerInput.value, 10);
                    
                    // Log for debugging
                    console.log(`Setting ${selectedQuiz} timer to ${quizTimerValue} seconds (raw input: ${quizTimerInput.value})`);
                    
                    // Validate
                    if (isNaN(quizTimerValue) || quizTimerValue < 0 || quizTimerValue > 300) {
                        alert('Timer value must be between 0 and 300 seconds');
                        return;
                    }
                    
                    // Update UI
                    saveQuizTimerButton.disabled = true;
                    saveQuizTimerButton.textContent = 'Saving...';
                    
                    // Set a timeout for debugging
                    setTimeout(async () => {
                        try {
                            // Call API to save this specific quiz timer
                            const response = await this.apiService.updateSingleQuizTimer(selectedQuiz, quizTimerValue);
                            
                            // Success
                            if (response.success) {
                                // Update local cache
                                this.timerSettings = response.data;
                                
                                // Show feedback
                                const quizName = this.formatQuizName(selectedQuiz);
                                const message = quizTimerValue === 0 
                                    ? `Timer disabled for ${quizName}!` 
                                    : `Timer for ${quizName} set to ${quizTimerValue} seconds!`;
                                    
                                this.showSuccess(message);
                                this.displayTimerSettings(); // Refresh the display
                            } else {
                                throw new Error(response.message || 'Failed to save settings');
                            }
                        } catch (innerError) {
                            console.error('Failed to save quiz timer settings:', innerError);
                            this.showError(`Error: ${innerError.message || 'Failed to save settings'}`);
                            
                            // Reset button state
                            saveQuizTimerButton.disabled = false;
                            saveQuizTimerButton.textContent = 'Set Timer';
                        }
                    }, 100); // Short delay to ensure the UI updates before the API call
                } catch (error) {
                    console.error('Failed to save quiz timer settings:', error);
                    this.showError(`Error: ${error.message || 'Failed to save settings'}`);
                    
                    // Reset button state
                    saveQuizTimerButton.disabled = false;
                    saveQuizTimerButton.textContent = 'Set Timer';
                }
            });
            
            // Add event listener for resetting quiz timer to default
            resetQuizTimerButton.addEventListener('click', async () => {
                const selectedQuiz = quizSelect.value;
                if (!selectedQuiz) return;
                
                try {
                    // Update UI
                    resetQuizTimerButton.disabled = true;
                    resetQuizTimerButton.textContent = 'Resetting...';
                    
                    // Check if this quiz actually has a custom setting
                    if (quizTimers[selectedQuiz] === undefined) {
                        this.showInfo(`${this.formatQuizName(selectedQuiz)} is already using the default timer.`);
                        resetQuizTimerButton.disabled = false;
                        resetQuizTimerButton.textContent = 'Reset to Default';
                        return;
                    }
                    
                    // Call API to reset this specific quiz timer
                    const response = await this.apiService.resetQuizTimer(selectedQuiz);
                    
                    // Success
                    if (response.success) {
                        // Update local cache
                        this.timerSettings = response.data;
                        
                        // Show feedback
                        const quizName = this.formatQuizName(selectedQuiz);
                        this.showSuccess(`${quizName} is now using the default timer setting.`);
                        
                        // Reset the input to the default value
                        quizTimerInput.value = this.timerSettings.defaultSeconds;
                        
                        // Refresh the display
                        this.displayTimerSettings();
                    } else {
                        throw new Error(response.message || 'Failed to reset timer');
                    }
                } catch (error) {
                    console.error('Failed to reset quiz timer:', error);
                    this.showError(`Error: ${error.message || 'Failed to reset timer'}`);
                } finally {
                    // Reset button
                    resetQuizTimerButton.disabled = false;
                    resetQuizTimerButton.textContent = 'Reset to Default';
                }
            });
        }
    }
    
    // Helper method to generate HTML for the list of quiz-specific timer settings
    generateQuizTimersList(quizTimers) {
        const quizTimerEntries = Object.entries(quizTimers || {});
        
        if (quizTimerEntries.length === 0) {
            return '<p class="no-custom-timers">No quiz-specific settings configured yet.</p>';
        }
        
        // Sort entries by quiz name
        quizTimerEntries.sort((a, b) => this.formatQuizName(a[0]).localeCompare(this.formatQuizName(b[0])));
        
        return `
            <table class="timer-table">
                <thead>
                    <tr>
                        <th>Quiz</th>
                        <th>Timer Setting</th>
                    </tr>
                </thead>
                <tbody>
                    ${quizTimerEntries.map(([quizName, seconds]) => `
                        <tr>
                            <td>${this.formatQuizName(quizName)}</td>
                            <td>${seconds === 0 ? 'Disabled' : `${seconds} seconds`}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    // Helper method to show info messages (neutral)
    showInfo(message) {
        const infoContainer = document.createElement('div');
        infoContainer.className = 'info-message';
        infoContainer.innerHTML = `
            <span>${message}</span>
            <button class="close-message">&times;</button>
        `;
        
        // Add to the page
        document.body.appendChild(infoContainer);
        
        // Add event listener to close the message
        infoContainer.querySelector('.close-message').addEventListener('click', () => {
            infoContainer.remove();
        });
        
        // Automatically remove after 5 seconds
        setTimeout(() => {
            if (infoContainer.parentNode) {
                infoContainer.remove();
            }
        }, 5000);
    }
    
    // Set up the create account form in the create account section
    setupCreateAccountForm() {
        const createAccountContainer = document.getElementById('create-account-container');
        if (!createAccountContainer) return;
        
        // Show loading state
        createAccountContainer.innerHTML = `
            <div class="loading-container" style="text-align: center; padding: 2rem;">
                <div class="loading-spinner"></div>
                <p>Loading quiz types...</p>
            </div>
        `;
        
        // Set a timeout to ensure the UI updates even if the quiz types fetch hangs
        let timeoutId = setTimeout(() => {
            console.warn('Quiz types fetch timeout - using fallback');
            renderForm(this.getHardcodedQuizTypes());
        }, 5000);
        
        // Fetch the latest quiz types before setting up the form
        this.fetchQuizTypes()
            .then(quizTypes => {
                clearTimeout(timeoutId); // Clear the timeout since we got a response
                renderForm(quizTypes);
            })
            .catch(error => {
                clearTimeout(timeoutId); // Clear the timeout if there's an error
                console.error('Error loading quiz types:', error);
                renderForm(this.getHardcodedQuizTypes());
            });
            
        // Function to render the form with quiz types
        const renderForm = (quizTypes) => {
            // Sort quiz types by category for better organization
            const categorizedQuizzes = this.categorizeQuizzesForForm(quizTypes);
            
            createAccountContainer.innerHTML = `
                <div class="create-account-form">
                    <form id="createInterviewForm" autocomplete="off">
                        <div class="form-group">
                            <label for="username">Username: (min. 3 characters)</label>
                            <input type="text" 
                                   id="username" 
                                   name="username" 
                                   required 
                                   minlength="3"
                                   autocomplete="off"
                                   autocorrect="off"
                                   autocapitalize="off">
                        </div>
                        <div class="form-group">
                            <label for="password">Password: (min. 6 characters)</label>
                            <div class="password-input-container">
                                <input type="password" 
                                       id="password" 
                                       name="password"
                                       required 
                                       minlength="6"
                                       autocomplete="new-password">
                                <button type="button" class="password-toggle" aria-label="Toggle password visibility">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group quiz-selection-container">
                            <label>Select Quizzes:</label>
                            <div class="quiz-selection" id="quizTypesList">
                                <div class="select-all-option">
                                    <label>
                                        <input type="checkbox" id="selectAllQuizzes">
                                        <span>Select All Quizzes</span>
                                    </label>
                                </div>
                                
                                <div class="quiz-options">
                                    ${Object.entries(categorizedQuizzes).map(([category, quizzes]) => `
                                        <div class="quiz-category">
                                            <div class="category-header">
                                                <h4>${category}</h4>
                                                <button type="button" class="select-category-btn" data-category="${category}">
                                                    Select All
                                                </button>
                                            </div>
                                            <div class="category-quizzes">
                                                ${quizzes.map(quiz => `
                                                    <div class="quiz-option">
                                                        <label>
                                                            <input type="checkbox" 
                                                                   name="quizzes" 
                                                                   value="${quiz}" 
                                                                   data-category="${category}">
                                                            <span>${this.formatQuizName(quiz)}</span>
                                                        </label>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <button type="submit" class="action-button">Create Account</button>
                    </form>
                </div>
            `;
            
            // Add event listeners
            // For the category buttons
            const selectCategoryButtons = document.querySelectorAll('.select-category-btn');
            selectCategoryButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const category = button.dataset.category;
                    const categoryCheckboxes = document.querySelectorAll(`input[data-category="${category}"]`);
                    const allChecked = Array.from(categoryCheckboxes).every(checkbox => checkbox.checked);
                    
                    categoryCheckboxes.forEach(checkbox => {
                        checkbox.checked = !allChecked;
                    });
                    
                    this.updateSelectAllCheckbox();
                });
            });
            
            // For the select all checkbox
            const selectAllCheckbox = document.getElementById('selectAllQuizzes');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', () => {
                    const allCheckboxes = document.querySelectorAll('input[name="quizzes"]');
                    allCheckboxes.forEach(checkbox => {
                        checkbox.checked = selectAllCheckbox.checked;
                    });
                });
            }
            
            // For individual checkboxes to update select all state
            const quizCheckboxes = document.querySelectorAll('input[name="quizzes"]');
            quizCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.updateSelectAllCheckbox();
                });
            });
            
            // For the form submission
            const createAccountForm = document.getElementById('createInterviewForm');
            if (createAccountForm) {
                createAccountForm.addEventListener('submit', this.handleCreateAccount.bind(this));
            }
            
            // For password toggling
            const passwordToggle = document.querySelector('.password-toggle');
            const passwordInput = document.getElementById('password');
            if (passwordToggle && passwordInput) {
                passwordToggle.addEventListener('click', () => {
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);
                    passwordToggle.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
                });
            }
        };
    }
    
    // Set up the scenarios list in the scenarios section
    setupScenariosList() {
        const scenariosList = document.getElementById('scenarios-list');
        if (!scenariosList) {
            console.error('Scenarios list container not found');
            return;
        }
        
        // Show loading state
        scenariosList.innerHTML = `
            <div class="loading-container" style="text-align: center; padding: 2rem;">
                <div class="loading-spinner"></div>
                <p>Loading quiz types...</p>
            </div>
        `;
        
        // Set a timeout to ensure the UI updates even if the quiz types fetch hangs
        let timeoutId = setTimeout(() => {
            console.warn('Quiz types fetch timeout - using fallback for scenarios');
            renderScenarios(this.getHardcodedQuizTypes());
        }, 5000);
        
        // Get quiz types using the fixed fetchQuizTypes method
        this.fetchQuizTypes()
            .then(quizTypes => {
                clearTimeout(timeoutId); // Clear the timeout since we got a response
                renderScenarios(quizTypes);
            })
            .catch(error => {
                clearTimeout(timeoutId); // Clear the timeout if there's an error
                console.error('Error loading quiz types for scenarios:', error);
                renderScenarios(this.getHardcodedQuizTypes());
            });
            
        // Function to render the scenarios list with quiz types
        const renderScenarios = (quizTypes) => {
            if (!quizTypes || quizTypes.length === 0) {
                scenariosList.innerHTML = `<div class="error-message">No quiz types available</div>`;
                return;
            }
            
            console.log(`Successfully loaded ${quizTypes.length} quiz types for scenarios list`);
            
            // Create matching structure to standard admin page
            scenariosList.innerHTML = `
                <div class="scenarios-wrapper">
                    <p class="scenarios-intro">Select a quiz type to view its scenarios:</p>
                    <div class="scenario-categories"></div>
                </div>
            `;
            
            const categoriesContainer = scenariosList.querySelector('.scenario-categories');
            
            // Define the same categories as in standard admin page
            const categories = {
                'Technical Skills': [],
                'Soft Skills': [],
                'QA Processes': [],
                'Content Testing': [],
                'Tools & Documentation': [],
                'Interview Quizzes': [],
                'Other Quizzes': []
            };
            
            // Categorize quizzes
            quizTypes.forEach(quiz => {
                const category = this.categorizeQuiz(quiz);
                if (categories[category]) {
                    categories[category].push(quiz);
                } else {
                    categories['Other Quizzes'].push(quiz);
                }
            });
            
            // Create HTML for each category
            Object.keys(categories).forEach(category => {
                // Skip empty categories
                if (!categories[category] || categories[category].length === 0) return;
                
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'scenario-category';
                categoryDiv.dataset.category = category.toLowerCase().replace(/\s+/g, '-');
                
                // Add heading
                const heading = document.createElement('h3');
                heading.className = 'category-heading';
                heading.textContent = category;
                categoryDiv.appendChild(heading);
                
                // Add quizzes container
                const quizzesGrid = document.createElement('div');
                quizzesGrid.className = 'category-quizzes';
                
                // Add quiz cards
                categories[category].forEach(quiz => {
                    const quizCard = document.createElement('div');
                    quizCard.className = 'quiz-type-card';
                    quizCard.dataset.quizType = quiz;
                    
                    // Create a container for the quiz name
                    const quizName = document.createElement('h3');
                    quizName.textContent = this.formatQuizName(quiz);
                    
                    // Create the button
                    const viewButton = document.createElement('button');
                    viewButton.className = 'view-scenarios-btn';
                    viewButton.dataset.quizId = quiz;
                    viewButton.textContent = 'View Scenarios';
                    viewButton.setAttribute('tabindex', '0');
                    viewButton.setAttribute('aria-label', `View scenarios for ${this.formatQuizName(quiz)}`);
                    
                    // Add event listener to button
                    viewButton.addEventListener('click', async (e) => {
                        e.preventDefault();
                        await this.showQuizScenarios(quiz);
                    });
                    
                    quizCard.appendChild(quizName);
                    quizCard.appendChild(viewButton);
                    
                    // Wrap the card in a container to ensure proper spacing
                    const cardWrapper = document.createElement('div');
                    cardWrapper.className = 'quiz-card-wrapper';
                    cardWrapper.appendChild(quizCard);
                    quizzesGrid.appendChild(cardWrapper);
                });
                
                categoryDiv.appendChild(quizzesGrid);
                categoriesContainer.appendChild(categoryDiv);
            });
        };
    }

    // Override categorizeQuiz to match standard admin page
    categorizeQuiz(quizName) {
        const lowerName = quizName.toLowerCase();
        
        if (['automation-interview', 'automation', 'api', 'script', 'script-metrics', 'technical', 'accessibility', 'performance', 'security', 'mobile'].includes(lowerName)) {
            return 'Technical Skills';
        }
        
        if (['communication', 'soft-skills'].includes(lowerName)) {
            return 'Soft Skills';
        }
        
        if (['general', 'process', 'uat', 'test-process'].includes(lowerName)) {
            return 'QA Processes';
        }
        
        if (['cms', 'cms-testing', 'content', 'email', 'email-testing'].includes(lowerName)) {
            return 'Content Testing';
        }
        
        if (['documentation', 'tools'].includes(lowerName)) {
            return 'Tools & Documentation';
        }
        
        if (['interview'].includes(lowerName)) {
            return 'Interview Quizzes';
        }
        
        return 'Other Quizzes';
    }

    // Implement a hardcoded fetchQuizTypes method that handles API failures gracefully
    async fetchQuizTypes() {
        try {
            const response = await this.apiService.fetchWithAdminAuth('/admin/quiz-types');
            if (!response.ok) {
                throw new Error('Failed to fetch quiz types');
            }d
            return await response.json();
        } catch (error) {
            console.error('Error fetching quiz types:', error);
            // Fallback to hardcoded quiz types if API fails
            return [
                'communication', 'initiative', 'time-management', 'tester-mindset',
                'risk-analysis', 'risk-management', 'non-functional', 'test-support',
                'issue-verification', 'build-verification', 'issue-tracking-tools',
                'raising-tickets', 'reports', 'cms-testing', 'email-testing', 'content-copy',
                'locale-testing', 'script-metrics-troubleshooting', 'standard-script-testing',
                'test-types-tricks', 'automation-interview', 'fully-scripted', 'exploratory',
                'sanity-smoke', 'functional-interview'
            ];
        }
    }

    // Helper method to provide hardcoded quiz types
    getHardcodedQuizTypes() {
        // This list should match the categories used in categorizeQuiz
        return [
            'communication', 'initiative', 'time-management', 'tester-mindset',
            'risk-analysis', 'risk-management', 'non-functional', 'test-support',
            'issue-verification', 'build-verification', 'issue-tracking-tools',
            'raising-tickets', 'reports', 'cms-testing', 'email-testing', 'content-copy',
            'locale-testing', 'script-metrics-troubleshooting','standard-script-testing',
            'test-types-tricks', 'automation-interview', 'fully-scripted', 'exploratory',
            'sanity-smoke', 'functional-interview'
        ].sort((a, b) => a.localeCompare(b));
    }

    // Add fetchQuizScenarios method to match the parent class
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

    // Override the parent showQuizScenarios method to handle file loading errors better
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
            content.style.width = '90%';
            content.style.maxWidth = '1200px';
            
            // Start building scenarios HTML
            let scenariosHTML = `
                <div class="details-header">
                    <h3 id="scenarios-title">${this.formatQuizName(quizName)} Scenarios</h3>
                    <button class="close-btn" aria-label="Close details">×</button>
                </div>
            `;
            
            // Check if we have any scenarios
            const hasScenarios = 
                (scenarios.basic && scenarios.basic.length > 0) ||
                (scenarios.intermediate && scenarios.intermediate.length > 0) ||
                (scenarios.advanced && scenarios.advanced.length > 0);
                
            if (!hasScenarios) {
                scenariosHTML += `
                    <div class="no-scenarios" style="text-align: center; padding: 2rem;">
                        <p>No scenarios found for this quiz.</p>
                    </div>
                `;
            } else {
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
            }
            
            // Set the content HTML
            content.innerHTML = scenariosHTML;
            overlay.appendChild(content);
            document.body.appendChild(overlay);
            
            // Add event listener for close button
            const closeBtn = content.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    overlay.remove();
                });
            }
            
            // Add event listener for clicking outside the modal to close it
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

    // Helper method to generate HTML for scenarios
    generateScenariosHTML(scenarios) {
        if (!scenarios || !scenarios.length) return '<p>No scenarios found.</p>';
        
        return scenarios.map(scenario => `
            <div class="scenario-card">
                <h4>${scenario.title || 'Untitled Scenario'}</h4>
                <div class="scenario-description">${scenario.description || 'No description available.'}</div>
                <div class="scenario-options">
                    <strong>Options:</strong>
                    <ul class="options-list">
                        ${scenario.options.map((option, index) => `
                            <li class="option-item ${option.experience > 0 ? 'correct-option' : ''}">
                                <div class="option-text">${option.text}</div>
                                ${option.experience > 0 ? `<div class="option-outcome"><em>Outcome: ${option.outcome}</em></div>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    // Override categorizeQuiz to ensure automation-interview is properly categorized
    categorizeQuiz(quizName) {
        if (quizName === 'automation-interview') {
            return 'Technical Skills';
        }
        return super.categorizeQuiz(quizName);
    }

    // Override the parent showUserDetails method for a tabbed interface like standard admin
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
            
            // Create header
            const header = document.createElement('div');
            header.className = 'details-header';
            
            const title = document.createElement('h3');
            title.id = 'user-details-title';
            title.textContent = `${username}'s Details`;
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.setAttribute('aria-label', 'Close details');
            closeBtn.setAttribute('tabindex', '0');
            closeBtn.innerHTML = '×';
            
            header.appendChild(title);
            header.appendChild(closeBtn);
            
            // Only create the Overview content - remove tabs since they're not needed
            const overviewContent = document.createElement('div');
            overviewContent.className = 'overview-content';
            
            // User Information Section
            overviewContent.innerHTML = `
                <div class="user-information">
                    <h4>User Information</h4>
                    <div class="info-grid">
                        <div class="info-row">
                            <div class="info-label">Username:</div>
                            <div class="info-value">${username}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Account Type:</div>
                            <div class="info-value">${isInterviewAccount ? 'Interview Candidate' : 'Regular'}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Last Active:</div>
                            <div class="info-value">${this.formatDate(this.getLastActiveDate(user))}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Overall Progress:</div>
                            <div class="info-value">${this.calculateUserProgress(user).toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
                
                <div class="progress-summary">
                    <h4>Progress Summary</h4>
                    <div class="quiz-progress-list"></div>
                </div>
            `;
            
            // Populate quiz progress list
            const quizProgressList = overviewContent.querySelector('.quiz-progress-list');
            
            // Generate quiz progress items to match standard admin
            this.quizTypes
                .slice()
                .sort((a, b) => this.formatQuizName(a).localeCompare(this.formatQuizName(b)))
                .forEach(quizType => {
                    const quizLower = quizType.toLowerCase();
                    
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
                        quizName: quizType,
                        quizLower,
                        isInterviewAccount,
                        allowedQuizzes,
                        hiddenQuizzes,
                        isInAllowedQuizzes,
                        isInHiddenQuizzes,
                        isVisible
                    });
                
                    const quizProgress = user.quizProgress?.[quizLower] || {};
                    const quizResult = user.quizResults?.find(r => r.quizName.toLowerCase() === quizLower);
                
                // Use data from either progress or results, prioritizing results
                const questionsAnswered = quizResult?.questionsAnswered || 
                                        quizResult?.questionHistory?.length ||
                                        quizProgress?.questionsAnswered || 
                                        quizProgress?.questionHistory?.length || 0;
                    const experience = quizResult?.experience || quizProgress?.experience || 0;
                    const score = quizResult?.score || 0;
                    const lastActive = quizResult?.completedAt || quizResult?.lastActive || quizProgress?.lastUpdated || 'Never';
                    
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
                    
                    // Create quiz card
                    const quizCard = document.createElement('div');
                    quizCard.className = `quiz-progress-item ${statusClass}`;
                    quizCard.style.backgroundColor = backgroundColor;
                
                quizCard.innerHTML = `
                    <h4>${this.formatQuizName(quizType)}</h4>
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
                                        data-quiz-name="${quizType}"
                                        ${isVisible ? 'checked' : ''}
                                        aria-label="Toggle visibility for ${this.formatQuizName(quizType)}"
                                        tabindex="0">
                                    <span>Make visible to user</span>
                                </label>
                        </div>
                    </div>
                    <div class="quiz-actions">
                            <button class="reset-quiz-btn"
                                data-quiz-name="${quizType}"
                                data-username="${username}"
                                aria-label="Reset progress for ${this.formatQuizName(quizType)}"
                                tabindex="0">
                            Reset Progress
                        </button>
                            <button class="view-questions-btn"
                                data-quiz-name="${quizType}"
                                data-username="${username}"
                                aria-label="View questions for ${this.formatQuizName(quizType)}"
                                tabindex="0">
                                View Questions
                        </button>
                    </div>
                `;
                
                quizProgressList.appendChild(quizCard);
            });
            
            // User actions
            const userActions = document.createElement('div');
            userActions.className = 'user-actions';
            userActions.innerHTML = `
                <button id="resetUserProgress" class="reset-all-btn" 
                    style="background-color: #dc3545; color: white;"
                    aria-label="Reset all progress for ${username}"
                    tabindex="0">
                    Reset All Progress
                </button>
                <button id="resetUserPassword" class="reset-password-btn" 
                    style="background-color: var(--secondary-color); color: white;"
                    aria-label="Reset password for ${username}"
                    tabindex="0">
                    Reset Password
                </button>
                <button id="deleteUserAccount" class="delete-user-btn" 
                    style="background-color: #dc3545; color: white; border: 2px solid #dc3545;"
                    aria-label="Delete user ${username}"
                    tabindex="0">
                    Delete User
                </button>
            `;
            
            // Assemble content
            content.appendChild(header);
            content.appendChild(overviewContent);
            content.appendChild(userActions);
            overlay.appendChild(content);
            document.body.appendChild(overlay);
            
            // Add event listener for close button
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
            
            // Add event listener for clicking outside the modal
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                }
            });
            
            // Add escape key handler
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
            
            // Add event listeners for quiz visibility toggles
            content.querySelectorAll('.quiz-visibility-toggle').forEach(toggle => {
                toggle.addEventListener('change', async (e) => {
                    const quizName = e.target.dataset.quizName;
                    const isVisible = e.target.checked;
                    
                    console.log(`Visibility toggle changed for ${quizName}: isVisible=${isVisible}`);
                    
                    try {
                        const apiService = new ApiService();
                        await apiService.updateQuizVisibility(username, quizName, isVisible);
                        this.showSuccess(`Updated visibility for ${this.formatQuizName(quizName)}`);
                    } catch (error) {
                        console.error('Failed to update quiz visibility:', error);
                        this.showError(`Failed to update visibility for ${this.formatQuizName(quizName)}`);
                        e.target.checked = !isVisible; // Revert the checkbox
                    }
                });
                
                // Add keyboard support for visibility toggle
                toggle.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle.checked = !toggle.checked;
                        toggle.dispatchEvent(new Event('change'));
                    }
                });
            });
            
            // Add event listeners for reset quiz buttons
            content.querySelectorAll('.reset-quiz-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const quizName = e.target.dataset.quizName;
                    const userName = e.target.dataset.username;
                    
                    if (confirm(`Are you sure you want to reset progress for ${this.formatQuizName(quizName)}?`)) {
                        try {
                            await this.resetQuizProgress(userName, quizName);
                            // Refresh the user list and details view
                            await this.loadUsers();
                            overlay.remove();
                            this.showSuccess(`Reset progress for ${this.formatQuizName(quizName)}`);
                            this.showUserDetails(userName);
                        } catch (error) {
                            console.error('Failed to reset quiz:', error);
                            this.showError(`Failed to reset ${this.formatQuizName(quizName)}`);
                        }
                    }
                });
                
                // Add keyboard support for reset quiz button
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        button.click();
                    }
                });
            });
            
            // Add event listeners for view questions buttons
            content.querySelectorAll('.view-questions-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const quizName = e.target.dataset.quizName;
                    const userName = e.target.dataset.username;
                    
                    await this.showQuizQuestions(quizName, userName);
                });
                
                // Add keyboard support for view questions button
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        button.click();
                    }
                });
            });
            
            // Add event listener for reset all progress button
            const resetAllBtn = overlay.querySelector('#resetUserProgress');
            if (resetAllBtn) {
                resetAllBtn.addEventListener('click', async () => {
                    if (confirm(`Are you sure you want to reset all progress for ${username}? This cannot be undone.`)) {
                        try {
                            await this.resetAllProgress(username);
                            overlay.remove();
                            this.showSuccess(`Progress reset for ${username}`);
                            this.updateUserList();
                        } catch (error) {
                            this.showError(`Failed to reset progress: ${error.message}`);
                        }
                    }
                });
                
                // Add keyboard support for reset all button
                resetAllBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        resetAllBtn.click();
                    }
                });
            }
            
            // Add event listener for reset password button
            const resetPasswordBtn = overlay.querySelector('#resetUserPassword');
            if (resetPasswordBtn) {
                resetPasswordBtn.addEventListener('click', async () => {
                    if (confirm(`Are you sure you want to reset the password for ${username}?`)) {
                        try {
                            const apiService = new ApiService();
                            const response = await apiService.resetUserPassword(username);
                            
                            this.showSuccess(`Password reset for ${username}: ${response.newPassword}`);
                            console.log('Password reset successful:', response);
                        } catch (error) {
                            console.error('Failed to reset password:', error);
                            this.showError(`Failed to reset password for ${username}`);
                        }
                    }
                });
                
                // Add keyboard support for reset password button
                resetPasswordBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        resetPasswordBtn.click();
                    }
                });
            }
            
            // Add event listener for delete user button
            const deleteUserBtn = overlay.querySelector('#deleteUserAccount');
            if (deleteUserBtn) {
                deleteUserBtn.addEventListener('click', async () => {
                    if (confirm(`Are you sure you want to delete ${username}'s account? This cannot be undone.`)) {
                        try {
                            await this.deleteUser(username);
                            overlay.remove();
                            this.showSuccess(`Account deleted for ${username}`);
                            this.updateUserList();
                        } catch (error) {
                            this.showError(`Failed to delete account: ${error.message}`);
                        }
                    }
                });
                
                // Add keyboard support for delete user button
                deleteUserBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        deleteUserBtn.click();
                    }
                });
            }
        } catch (error) {
            console.error('Error showing user details:', error);
            this.showError(`Failed to show user details: ${error.message}`);
        }
    }

    // Helper methods for user details display
    estimateTotalQuestions(quizType) {
        // Estimate total questions based on quiz type
        if (quizType.toLowerCase().includes('interview')) {
            return 15;
        }
        return 20; // Default estimate
    }

    getStatusClass(percentComplete) {
        if (percentComplete === 0) return 'text-muted';
        if (percentComplete < 50) return 'text-warning';
        if (percentComplete === 100) return 'text-success';
        return 'text-primary';
    }

    getStatusText(percentComplete) {
        if (percentComplete === 0) return 'Not Started';
        if (percentComplete < 50) return 'In Progress';
        if (percentComplete === 100) return 'Completed';
        return 'Partially Complete';
    }

    // Helper method for formatting activity type
    formatActivityType(type) {
        switch (type) {
            case 'login':
                return 'Login';
            case 'quiz_start':
                return 'Started Quiz';
            case 'quiz_complete':
                return 'Completed Quiz';
            case 'answer_question':
                return 'Answered Question';
            default:
                return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    }

    // Helper method for getting activity icon
    getActivityIcon(type) {
        switch (type) {
            case 'login':
                return 'fa-sign-in-alt';
            case 'quiz_start':
                return 'fa-play';
            case 'quiz_complete':
                return 'fa-check-circle';
            case 'answer_question':
                return 'fa-question';
            default:
                return 'fa-history';
        }
    }

    // Calculate quiz progress percent
    calculateQuizProgressPercent(quizType, questionsAnswered) {
        // Estimate total questions based on quiz type
        let totalQuestions = 20; // Default estimate
        
        // Customize based on quiz type if needed
        if (quizType.toLowerCase().includes('interview')) {
            totalQuestions = 15;
        }
        
        // Calculate percentage
        const percent = Math.min(100, (questionsAnswered / totalQuestions) * 100);
        return percent;
    }

    // Helper method to categorize quizzes for the form
    categorizeQuizzesForForm(quizTypes) {
        if (!quizTypes || !Array.isArray(quizTypes)) {
            console.error('Invalid quizTypes provided to categorizeQuizzesForForm:', quizTypes);
            quizTypes = [
                'communication', 'initiative', 'time-management', 'tester-mindset',
                'risk-analysis', 'risk-management', 'non-functional', 'test-support',
                'issue-verification', 'build-verification', 'issue-tracking-tools',
                'raising-tickets', 'reports', 'cms-testing', 'email-testing', 'content-copy',
                'locale-testing', 'script-metrics-troubleshooting', 'standard-script-testing',
                'test-types-tricks', 'automation-interview', 'fully-scripted', 'exploratory',
                'sanity-smoke', 'functional-interview'
            ];
        }
        
        const categories = {
            'Technical Skills': [],
            'QA Processes': [],
            'Content Testing': [],
            'Tools & Documentation': [],
            'Soft Skills': [],
            'Interview Quizzes': [],
            'Other': []
        };
        
        quizTypes.forEach(quiz => {
            if (!quiz) return; // Skip undefined quiz types
            
            const lowerQuiz = quiz.toLowerCase();
            
            // Map quiz types to categories based on the valid quiz types
            if (['non-functional', 'script-metrics-troubleshooting', 'standard-script-testing'].includes(lowerQuiz)) {
                categories['Technical Skills'].push(quiz);
            } 
            else if (['test-support', 'issue-verification', 'build-verification', 'fully-scripted', 'exploratory', 'sanity-smoke'].includes(lowerQuiz)) {
                categories['QA Processes'].push(quiz);
            }
            else if (['cms-testing', 'email-testing', 'content-copy', 'locale-testing'].includes(lowerQuiz)) {
                categories['Content Testing'].push(quiz);
            }
            else if (['issue-tracking-tools', 'raising-tickets', 'reports'].includes(lowerQuiz)) {
                categories['Tools & Documentation'].push(quiz);
            }
            else if (['communication', 'initiative', 'time-management', 'tester-mindset', 'risk-analysis', 'risk-management'].includes(lowerQuiz)) {
                categories['Soft Skills'].push(quiz);
            }
            else if (['automation-interview', 'functional-interview'].includes(lowerQuiz)) {
                categories['Interview Quizzes'].push(quiz);
            }
            else {
                categories['Other'].push(quiz);
            }
        });
        
        // Remove empty categories
        Object.keys(categories).forEach(key => {
            if (categories[key].length === 0) {
                delete categories[key];
            }
        });
        
        return categories;
    }

    // Implement resetAllProgress to match the method name used in the showUserDetails method
    async resetAllProgress(username) {
        try {
            const response = await fetch(`/api/admin/users/${username}/reset-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reset user progress');
            }

            return await response.json();
        } catch (error) {
            console.error('Error resetting user progress:', error);
            throw error;
        }
    }

    // Implement resetQuizProgress for individual quiz reset functionality
    async resetQuizProgress(username, quizType) {
        try {
            const response = await fetch(`/api/admin/users/${username}/quiz/${quizType}/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reset quiz progress');
            }

            return await response.json();
        } catch (error) {
            console.error('Error resetting quiz progress:', error);
            throw error;
        }
    }

    // Add implementation for showQuizQuestions matching standard admin
    async showQuizQuestions(quizType, username) {
        try {
            // Get user data
            const user = this.users.find(u => u.username === username);
            if (!user) {
                throw new Error('User not found');
            }

            console.log('Showing quiz questions for:', { username, quizType });
            
            // Get quiz results from API
            try {
                // Import ApiService from relative path
                const apiService = this.apiService; // Use the inherited apiService
                const response = await apiService.getQuizQuestions(username, quizType);
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
                            <h3 id="questions-details-title">${this.formatQuizName(quizType)} - ${username}'s Answers</h3>
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
                                                        <div>
                                                            <strong>Correct:</strong> ${question.correctAnswer || 'Correct answer not available'}
                            </div>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>` :
                                `<div class="not-attempted">
                                    <p>This user has completed ${questionsAnswered} questions, but detailed history is not available.</p>
                                </div>`
                            }
                        </div>
                    `;
                    
            overlay.appendChild(content);
            document.body.appendChild(overlay);
            
                    // Close button event listener
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
            
                    // Close on escape key
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
                    
                } else {
                    throw new Error('Quiz data not available');
                }
            } catch (apiError) {
                console.error('API error:', apiError);
                this.showError(`Failed to fetch quiz questions: ${apiError.message}`);
            }
            
        } catch (error) {
            console.error('Error showing quiz questions:', error);
            this.showError(`Failed to show quiz questions: ${error.message}`);
        }
    }

    // Helper method for getting question icon based on correctness
    getQuestionIcon(isCorrect) {
        return isCorrect ? 'fa-check-circle' : 'fa-times-circle';
    }

    // Helper method for formatting question type
    formatQuestionType(type) {
        if (!type) return 'Question';
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Helper method to update the "Select All" checkbox state based on individual checkboxes
    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAllQuizzes');
        const quizCheckboxes = document.querySelectorAll('input[name="quizzes"]');
        
        if (selectAllCheckbox && quizCheckboxes.length > 0) {
            const allChecked = Array.from(quizCheckboxes).every(checkbox => checkbox.checked);
            selectAllCheckbox.checked = allChecked;
        }
    }
    
    // Helper method to handle create account form submission
    async handleCreateAccount(event) {
        event.preventDefault();
        
        try {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Define the valid quiz types
            const validQuizTypes = [
                'automation-interview', 'build-verification', 'cms-testing',
                'communication', 'content-copy', 'email-testing',
                'exploratory', 'fully-scripted', 'functional-interview',
                'initiative', 'issue-tracking-tools', 'issue-verification',
                'locale-testing', 'non-functional', 'raising-tickets',
                'reports', 'risk-analysis', 'risk-management',
                'sanity-smoke', 'script-metrics-troubleshooting',
                'standard-script-testing', 'test-support', 'test-types-tricks',
                'tester-mindset', 'time-management'
            ];
            
            // Log all selected checkboxes
            const selectedCheckboxes = document.querySelectorAll('input[name="quizzes"]:checked');
            console.log('Selected checkboxes:', Array.from(selectedCheckboxes).map(cb => ({
                value: cb.value,
                dataset: cb.dataset
            })));

            // Get selected quizzes and log them
            const selectedQuizzes = Array.from(selectedCheckboxes)
                .map(checkbox => checkbox.value.toLowerCase());
            console.log('Selected quizzes (before validation):', selectedQuizzes);

            // Log the valid quiz types for comparison
            console.log('Valid quiz types:', validQuizTypes);

            // Validate basic requirements
            if (username.length < 3) {
                throw new Error('Username must be at least 3 characters long');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }
            
            if (selectedQuizzes.length === 0) {
                throw new Error('Please select at least one quiz');
            }

            // Log which quizzes are invalid
            const invalidQuizzes = selectedQuizzes.filter(quiz => !validQuizTypes.includes(quiz));
            if (invalidQuizzes.length > 0) {
                console.error('Invalid quiz names found:', invalidQuizzes);
                console.log('These quiz names do not match any in the valid quiz types list');
            }

            // Filter valid quizzes and log them
            const allowedQuizzes = selectedQuizzes.filter(quiz => validQuizTypes.includes(quiz));
            console.log('Allowed quizzes (after validation):', allowedQuizzes);
            
            if (allowedQuizzes.length === 0) {
                throw new Error('No valid quiz types selected');
            }

            // Create array of hidden quizzes and log them
            const hiddenQuizzes = validQuizTypes.filter(quiz => !allowedQuizzes.includes(quiz));
            console.log('Hidden quizzes:', hiddenQuizzes);

            // Log the final request body
            const requestBody = {
                username,
                password,
                userType: 'interview_candidate',
                allowedQuizzes,
                hiddenQuizzes
            };
            console.log('Request body:', requestBody);

            const response = await this.apiService.fetchWithAdminAuth('/api/admin/create-interview-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.success) {
                throw new Error(response.message || 'Failed to create account');
            }

            // Show success message
            this.showSuccess(`Account created for ${username}`);
            
            // Reset the form
            document.getElementById('createInterviewForm').reset();
            
            // Update the users list
            await this.loadUsers();
            
        } catch (error) {
            console.error('Failed to create account:', error);
            this.showError(error.message || 'Failed to create account');
            throw error;
        }
    }

    // Setup schedule section with form and event handlers
    setupScheduleSection() {
        // Get form elements
        const scheduleForm = document.getElementById('scheduleForm');
        const userSelect = document.getElementById('scheduleUser');
        const quizSelect = document.getElementById('scheduleQuiz');
        const dateInput = document.getElementById('scheduleDate');
        const timeInput = document.getElementById('scheduleTime');
        
        // Populate user dropdown
        this.populateUserDropdown();
        
        // Populate quiz dropdown
        this.populateQuizDropdown();
        
        // Set minimum date to today
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.min = `${year}-${month}-${day}`;
        
        // Add form submit handler
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createSchedule();
        });
        
        // Load and display existing scheduled resets
        this.loadScheduledResets();
    }
    
    // Populate user dropdown with available users
    populateUserDropdown() {
        const userSelect = document.getElementById('scheduleUser');
        
        // Clear existing options except the first one
        while (userSelect.options.length > 1) {
            userSelect.remove(1);
        }
        
        // Add user options
        this.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            userSelect.appendChild(option);
        });
    }
    
    // Populate quiz dropdown with available quizzes
    populateQuizDropdown() {
        const quizSelect = document.getElementById('scheduleQuiz');
        
        // Clear existing options except the first one
        while (quizSelect.options.length > 1) {
            quizSelect.remove(1);
        }
        
        // Add quiz options sorted alphabetically
        this.quizTypes
            .slice()
            .sort((a, b) => this.formatQuizName(a).localeCompare(this.formatQuizName(b)))
            .forEach(quizType => {
                const option = document.createElement('option');
                option.value = quizType;
                option.textContent = this.formatQuizName(quizType);
                quizSelect.appendChild(option);
            });
    }
    
    // Create a new schedule based on form data
    async createSchedule() {
        try {
            const username = document.getElementById('scheduleUser').value;
            const quizName = document.getElementById('scheduleQuiz').value;
            const resetDate = document.getElementById('scheduleDate').value;
            const resetTime = document.getElementById('scheduleTime').value;
            
            // Validate inputs
            if (!username || !quizName || !resetDate || !resetTime) {
                this.showError('Please fill in all fields');
                return;
            }
            
            // Create datetime string
            const resetDateTime = `${resetDate}T${resetTime}:00`;
            
            // Show loading state
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Scheduling...';
            
            // Use the API service to create the schedule
            const response = await this.apiService.createScheduledReset(username, quizName, resetDateTime);
            
            if (response.success) {
                // Reset form
                document.getElementById('scheduleForm').reset();
                
                // Show success message
                this.showSuccess(`Reset scheduled for ${this.formatQuizName(quizName)} on ${this.formatScheduleDateTime(resetDateTime)}`);
                
                // Refresh the schedules list
                this.loadScheduledResets();
            } else {
                throw new Error(response.message || 'Failed to schedule reset');
            }
        } catch (error) {
            console.error('Error creating schedule:', error);
            this.showError(`Failed to create schedule: ${error.message}`);
        } finally {
            // Reset button state
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Schedule Reset';
        }
    }
    
    // Get all scheduled resets from API with localStorage fallback
    async getScheduledResets() {
        try {
            const response = await this.apiService.getScheduledResets();
            return response.data || [];
        } catch (error) {
            console.error('Error getting scheduled resets:', error);
            this.showError(`Failed to load scheduled resets: ${error.message}`);
            return [];
        }
    }
    
    // Load and display scheduled resets
    async loadScheduledResets() {
        try {
            // Show loading state
            const scheduledItemsList = document.getElementById('scheduledItemsList');
            scheduledItemsList.innerHTML = `
                <div class="loading-container" style="text-align: center; padding: 1rem;">
                    <div class="loading-spinner"></div>
                    <p>Loading scheduled resets...</p>
                </div>
            `;
            
            // Get schedules and display them
            await this.displayScheduledResets();
        } catch (error) {
            console.error('Error loading scheduled resets:', error);
            this.showError(`Failed to load scheduled resets: ${error.message}`);
            
            // Show error state
            const scheduledItemsList = document.getElementById('scheduledItemsList');
            scheduledItemsList.innerHTML = `
                <div class="error-message">
                    <p>Failed to load scheduled resets. Please try refreshing the page.</p>
                </div>
            `;
        }
    }
    
    // Display scheduled resets in the list
    async displayScheduledResets() {
        const scheduledItemsList = document.getElementById('scheduledItemsList');
        
        try {
            // Get schedules from API or localStorage fallback
            const schedules = await this.getScheduledResets();
            
            // Clear existing content
            scheduledItemsList.innerHTML = '';
            
            if (schedules.length === 0) {
                scheduledItemsList.innerHTML = '<p class="no-items-message">No scheduled resets yet.</p>';
                return;
            }
            
            // Sort schedules by date/time (earliest first)
            schedules.sort((a, b) => new Date(a.resetDateTime) - new Date(b.resetDateTime));
            
            // Create list items for each scheduled reset
            schedules.forEach(schedule => {
                const scheduledItem = document.createElement('div');
                scheduledItem.className = 'scheduled-item';
                scheduledItem.dataset.id = schedule.id;
                
                scheduledItem.innerHTML = `
                    <div class="scheduled-info">
                        <div class="scheduled-user">${schedule.username}</div>
                        <div class="scheduled-quiz">${this.formatQuizName(schedule.quizName)}</div>
                        <div class="scheduled-time">Reset scheduled for: ${this.formatScheduleDateTime(schedule.resetDateTime)}</div>
                    </div>
                    <div class="scheduled-actions">
                        <button class="cancel-schedule-btn" data-id="${schedule.id}" aria-label="Cancel schedule">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                `;
                
                scheduledItemsList.appendChild(scheduledItem);
            });
            
            // Add event listeners to cancel buttons
            scheduledItemsList.querySelectorAll('.cancel-schedule-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const scheduleId = e.currentTarget.dataset.id;
                    this.cancelSchedule(scheduleId);
                });
            });
        } catch (error) {
            console.error('Error displaying scheduled resets:', error);
            scheduledItemsList.innerHTML = `
                <div class="error-message">
                    <p>Failed to display scheduled resets. Please try refreshing the page.</p>
                </div>
            `;
        }
    }
    
    // Cancel a scheduled reset
    async cancelSchedule(scheduleId) {
        try {
            // Find the schedule to display information in the confirmation dialog
            const schedules = await this.getScheduledResets();
            const scheduleToCancel = schedules.find(s => s.id === scheduleId);
            
            if (!scheduleToCancel) {
                this.showError('Schedule not found');
                return;
            }
            
            // Confirm cancellation
            if (!confirm(`Are you sure you want to cancel the scheduled reset for ${this.formatQuizName(scheduleToCancel.quizName)}?`)) {
                return;
            }
            
            // Show loading state on the button
            const cancelBtn = document.querySelector(`.cancel-schedule-btn[data-id="${scheduleId}"]`);
            if (cancelBtn) {
                cancelBtn.disabled = true;
                cancelBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelling...';
            }
            
            // Use the API service to cancel the schedule
            const response = await this.apiService.cancelScheduledReset(scheduleId);
            
            if (response.success) {
                // Refresh the display
                this.loadScheduledResets();
                
                // Show success message
                this.showSuccess('Schedule cancelled successfully');
            } else {
                throw new Error(response.message || 'Failed to cancel schedule');
            }
        } catch (error) {
            console.error('Error cancelling schedule:', error);
            this.showError(`Failed to cancel schedule: ${error.message}`);
            
            // Refresh the display to ensure consistency
            this.loadScheduledResets();
        }
    }
    
    // Format schedule date/time for display
    formatScheduleDateTime(dateTimeString) {
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return new Date(dateTimeString).toLocaleString(undefined, options);
    }
    
    // Refresh schedule section data
    async refreshScheduleData() {
        this.populateUserDropdown();
        this.populateQuizDropdown();
        await this.loadScheduledResets();
    }
    
    // Check for scheduled resets that need to be executed
    async checkScheduledResets() {
        try {
            // Use the API service to check and process scheduled resets
            const result = await this.apiService.checkAndProcessScheduledResets();
            
            if (result.processed > 0) {
                console.log(`Processed ${result.processed} scheduled resets out of ${result.total} total`);
                
                // Refresh the display if the schedule section is active
                const scheduleSection = document.getElementById('schedule-section');
                if (scheduleSection && scheduleSection.classList.contains('active')) {
                    this.refreshScheduleData();
                }
            }
        } catch (error) {
            console.error('Error checking scheduled resets:', error);
        }
    }
    
    // Helper method to show the schedule section
    showScheduleSection() {
        try {
            // Get all menu items and sections
            const menuItems = document.querySelectorAll('.menu-item');
            const contentSections = document.querySelectorAll('.content-section');
            
            // Hide all sections
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Remove active class from all menu items
            menuItems.forEach(item => {
                item.classList.remove('active');
            });
            
            // Find the schedule menu item and make it active
            const scheduleMenuItem = Array.from(menuItems).find(item => item.dataset.section === 'schedule');
            if (scheduleMenuItem) {
                scheduleMenuItem.classList.add('active');
            } else {
                console.error('Schedule menu item not found');
            }
            
            // Show the schedule section
            const scheduleSection = document.getElementById('schedule-section');
            if (scheduleSection) {
                scheduleSection.classList.add('active');
                
                // Refresh the schedule data
                this.refreshScheduleData();
                
                console.log('Schedule section is now visible');
                return true;
            } else {
                console.error('Schedule section not found in the DOM');
                return false;
            }
        } catch (error) {
            console.error('Error showing schedule section:', error);
            return false;
        }
    }
}

// Initialize the Admin2Dashboard when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Admin2Dashboard();
});

// Add some additional styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = `
    /* Form styles */
    .form-group {
        margin-bottom: 1.5rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
    }
    
    .form-group input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        transition: border-color 0.2s;
    }
    
    .form-group input:focus {
        border-color: #3498db;
        outline: none;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
    
    .password-input-container {
        position: relative;
        width: 100%;
    }
    
    .password-toggle {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        color: #555;
        transition: color 0.2s;
    }
    
    .password-toggle:hover {
        color: #3498db;
    }
    
    .settings-form {
        max-width: 600px;
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .settings-input {
        width: 100%;
        max-width: 300px;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }
    
    /* Action button styles */
    .action-button {
        background: #3498db;
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s, transform 0.1s;
        font-size: 1rem;
    }
    
    .action-button:hover {
        background: #2980b9;
    }
    
    .action-button:active {
        transform: translateY(1px);
    }
    
    /* Create account form styles */
    .create-account-form {
        width: 100%;
        max-width: 800px;
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin: 0 auto;
    }
    
    .quiz-selection-container {
        max-height: none;
    }
    
    .quiz-selection {
        max-height: 400px;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 1rem;
        overflow-y: auto;
        background-color: #f9f9f9;
    }
    
    .select-all-option {
        padding: 0.75rem;
        margin-bottom: 1rem;
        background-color: #f0f0f0;
        border-radius: 4px;
        position: relative;
        z-index: 1;
        font-weight: 500;
    }
    
    .quiz-options {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 0.75rem;
    }
    
    .quiz-option {
        padding: 0.75rem;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        transition: background-color 0.2s;
    }
    
    .quiz-option:hover {
        background-color: #f5f5f5;
    }
    
    /* Improve checkbox styling */
    input[type="checkbox"] {
        margin-right: 8px;
        position: relative;
        top: 2px;
        width: 16px;
        height: 16px;
    }
    
    /* Scenarios styles */
    .scenarios-intro {
        margin-bottom: 1.5rem;
        color: #555;
    }
    
    .scenario-categories {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        margin-top: 1.5rem;
        width: 100%;
    }
    
    .scenario-category {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .category-heading {
        margin-top: 0;
        margin-bottom: 1.5rem;
        color: #2c3e50;
        font-size: 1.3rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #eee;
    }
    
    .category-quizzes {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        width: 100%;
    }
    
    .quiz-type-card {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        transition: transform 0.2s, box-shadow 0.2s;
        border: 1px solid #eee;
        width: 100%;
    }
    
    .quiz-type-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .quiz-type-card h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.2rem;
        color: #2c3e50;
    }
    
    .view-scenarios-btn {
        background: #3498db;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
    }
    
    .view-scenarios-btn:hover {
        background: #2980b9;
    }
    
    /* Scenario details */
    .scenario-section {
        margin-bottom: 2.5rem;
    }
    
    .scenario-level-title {
        margin-top: 0;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #eee;
        color: #2c3e50;
        font-size: 1.3rem;
    }
    
    .scenarios-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
        width: 100%;
    }
    
    .user-details-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .user-details-content {
        background: white;
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        max-height: 90vh;
        overflow-y: auto;
        width: 90%;
        max-width: 1200px;
    }

    .details-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
    }

    .details-header h3 {
        margin: 0;
        font-size: 1.5rem;
        color: #2c3e50;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #555;
        cursor: pointer;
        transition: color 0.2s;
    }

    .close-btn:hover {
        color: #e74c3c;
    }
    
    .scenario-card {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border: 1px solid #eee;
        width: 100%;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .scenario-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 3px 6px rgba(0,0,0,0.1);
    }
    
    .scenario-card h4 {
        margin-top: 0;
        margin-bottom: 0.75rem;
        color: #2c3e50;
        font-size: 1.1rem;
    }
    
    .scenario-description {
        color: #555;
        margin-bottom: 1rem;
        line-height: 1.5;
    }
    
    .scenario-options {
        margin-top: 1rem;
    }

    .scenario-options strong {
        display: block;
        margin-bottom: 0.5rem;
        color: #333;
    }
    
    .options-list {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }
    
    .option-item {
        padding: 0.75rem;
        background: white;
        border-radius: 4px;
        margin-bottom: 0.75rem;
        border: 1px solid #eee;
    }
    
    .option-item:last-child {
        margin-bottom: 0;
    }
    
    .correct-option {
        border-left: 4px solid #2ecc71;
    }

    .option-text {
        line-height: 1.4;
    }

    .option-outcome {
        margin-top: 0.5rem;
        color: #27ae60;
        font-style: italic;
    }
    
    /* Row view styles */
    .users-list.row-view {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1.5rem;
    }
    
    .users-list.row-view .user-card {
        background: white;
        border-radius: 8px;
        margin-bottom: 0.75rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        transition: transform 0.2s, box-shadow 0.2s;
        width: 100%;
    }
    
    .users-list.row-view .user-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .users-list.row-view .row-content {
        display: flex;
        align-items: center;
        padding: 1rem 1.5rem;
        width: 100%;
    }
    
    .users-list.row-view .user-info {
        display: flex;
        align-items: center;
        min-width: 180px;
        margin-right: 1.5rem;
    }
    
    .users-list.row-view .username {
        font-weight: 600;
        font-size: 1.1rem;
        margin-right: 0.75rem;
        color: #2c3e50;
    }
    
    .users-list.row-view .account-type-badge {
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        background-color: #3498db;
        color: white;
        font-weight: 500;
    }
    
    .users-list.row-view .user-stats {
        display: flex;
        flex: 1;
        justify-content: space-between;
        gap: 1.5rem;
        margin-right: 1.5rem;
    }
    
    .users-list.row-view .stat {
        display: flex;
        align-items: baseline;
        white-space: nowrap;
    }
    
    .users-list.row-view .stat-label {
        color: #666;
        margin-right: 0.5rem;
        font-size: 0.9rem;
    }
    
    .users-list.row-view .stat-value {
        font-weight: 600;
        color: #333;
    }
    
    .users-list.row-view .row-btn {
        background: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-weight: 500;
        white-space: nowrap;
        min-width: 110px;
        transition: background 0.2s;
    }
    
    .users-list.row-view .row-btn:hover {
        background: #2980b9;
    }

    /* Grid view styles */
    .users-list.grid-view .user-card {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex;
        flex-direction: column;
    }

    .users-list.grid-view .user-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .users-list.grid-view .user-card-content {
        flex: 1;
    }

    .users-list.grid-view .user-header {
        margin-bottom: 1rem;
    }

    .users-list.grid-view .user-header h4 {
        margin-top: 0;
        margin-bottom: 0.5rem;
        color: #2c3e50;
    }

    .users-list.grid-view .user-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
    }

    .users-list.grid-view .stat {
        display: flex;
        flex-direction: column;
    }

    .users-list.grid-view .stat-label {
        color: #666;
        font-size: 0.85rem;
        margin-bottom: 0.25rem;
    }

    .users-list.grid-view .stat-value {
        font-weight: 600;
        color: #333;
    }

    .users-list.grid-view .view-details-btn {
        background: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        margin-top: 1rem;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
        width: 100%;
    }

    .users-list.grid-view .view-details-btn:hover {
        background: #2980b9;
    }
    
    /* Error and success messages */
    .error-message {
        background-color: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        border: 1px solid #f5c6cb;
    }

    .success-message {
        background-color: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        border: 1px solid #c3e6cb;
    }

    .retry-button {
        background: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        margin-top: 0.5rem;
        cursor: pointer;
        font-weight: 500;
    }

    /* Loading spinner */
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: #3498db;
        animation: spin 1s ease-in-out infinite;
        margin: 1rem auto;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    /* Responsive styles */
    @media (max-width: 1024px) {
        .users-list.row-view .user-stats {
            flex-wrap: wrap;
            gap: 0.75rem;
        }
        
        .users-list.row-view .row-content {
            flex-wrap: wrap;
        }
        
        .users-list.row-view .row-btn {
            margin-top: 0.75rem;
        }
        
        .category-quizzes {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        
        .scenarios-list {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
    }
    
    @media (max-width: 768px) {
        .quiz-options {
            grid-template-columns: 1fr;
        }
        
        .category-quizzes {
            grid-template-columns: 1fr;
        }
        
        .scenarios-list {
            grid-template-columns: 1fr;
        }
        
        .users-list.row-view .user-info,
        .users-list.row-view .user-stats {
            width: 100%;
            margin-bottom: 0.75rem;
        }
        
        .users-list.row-view .row-content {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .users-list.row-view .row-btn {
            align-self: flex-end;
        }
        
        .user-details-content {
            width: 95%;
            padding: 1rem;
        }
    }

    /* User details modal styles */
    .details-tabs {
        display: flex;
        border-bottom: 1px solid #dee2e6;
        margin-bottom: 1.5rem;
    }
    
    .tab-button {
        padding: 0.75rem 1rem;
        background: none;
        border: none;
        border-bottom: 3px solid transparent;
        font-weight: 500;
        color: #666;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .tab-button:hover {
        color: #3498db;
    }
    
    .tab-button.active {
        color: #3498db;
        border-bottom-color: #3498db;
    }
    
    .tab-content {
        display: none;
    }
    
    .tab-content.active {
        display: block;
    }
    
    .user-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        margin-bottom: 2rem;
    }
    
    .user-info-section {
        flex: 1;
        min-width: 300px;
    }
    
    .user-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .danger-button {
        background-color: #e74c3c;
    }
    
    .danger-button:hover {
        background-color: #c0392b;
    }
    
    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .info-item {
        display: flex;
        flex-direction: column;
    }
    
    .info-label {
        color: #666;
        font-size: 0.85rem;
        margin-bottom: 0.25rem;
    }
    
    .info-value {
        font-weight: 600;
        color: #333;
    }
    
    .progress-summary {
        margin-top: 1.5rem;
    }
    
    .progress-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }
    
    .quiz-progress-item {
        background-color: white;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .quiz-progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }
    
    .quiz-name {
        font-weight: 600;
        color: #2c3e50;
    }
    
    .quiz-percent {
        font-weight: 700;
        color: #3498db;
    }
    
    .progress-bar-container {
        height: 8px;
        background-color: #f1f1f1;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.75rem;
    }
    
    .progress-bar {
        height: 100%;
        background-color: #3498db;
        border-radius: 4px;
    }
    
    .quiz-stats {
        display: flex;
        justify-content: space-between;
        color: #666;
        font-size: 0.9rem;
    }
    
    .quiz-stat i {
        margin-right: 0.25rem;
        color: #7f8c8d;
    }
    
    /* Quiz Results Tab Styles */
    .quiz-results-container {
        margin-top: 1rem;
    }
    
    .quiz-details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }
    
    .quiz-detail-card {
        background-color: white;
        border-radius: 8px;
        padding: 1.25rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .quiz-detail-card h5 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: #2c3e50;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
    }
    
    .answer-stats {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-bottom: 1.5rem;
    }
    
    .stat-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
    }
    
    .stat-circle.correct {
        background-color: #2ecc71;
    }
    
    .stat-circle.incorrect {
        background-color: #e74c3c;
    }
    
    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
    }
    
    .stat-label {
        font-size: 0.8rem;
        margin-top: 0.25rem;
    }
    
    .accuracy-bar {
        margin-top: 1rem;
    }
    
    .accuracy-label {
        margin-bottom: 0.5rem;
        color: #666;
        font-size: 0.9rem;
    }
    
    .accuracy-bar-container {
        height: 8px;
        background-color: #f1f1f1;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }
    
    .accuracy-bar-fill {
        height: 100%;
        background-color: #2ecc71;
        border-radius: 4px;
    }
    
    .accuracy-value {
        text-align: right;
        font-weight: 600;
        color: #333;
        font-size: 0.9rem;
    }
    
    .no-activity {
        color: #7f8c8d;
        font-style: italic;
        text-align: center;
        margin-top: 1rem;
    }
    
    /* Activity Tab Styles */
    .activity-history {
        margin-top: 1rem;
    }
    
    .activity-timeline {
        margin-top: 1.5rem;
    }
    
    .activity-item {
        display: flex;
        margin-bottom: 1.5rem;
        position: relative;
    }
    
    .activity-item:not(:last-child)::after {
        content: '';
        position: absolute;
        left: 80px;
        top: 24px;
        bottom: -24px;
        width: 2px;
        background-color: #f1f1f1;
    }
    
    .activity-time {
        min-width: 160px;
        color: #7f8c8d;
        font-size: 0.9rem;
        padding-top: 0.25rem;
    }
    
    .activity-details {
        flex: 1;
        background-color: white;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .activity-type {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }
    
    .activity-type i {
        margin-right: 0.5rem;
        color: #3498db;
    }
    
    .activity-description {
        color: #555;
    }

    .retry-button:hover {
        background: #2980b9;
    }

    /* Loading spinner */
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: #3498db;
        animation: spin 1s ease-in-out infinite;
        margin: 1rem auto;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    /* Info message */
    .info-message {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #d1ecf1;
        color: #0c5460;
        padding: 1rem;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 400px;
        border-left: 4px solid #0c5460;
        animation: slide-in 0.3s ease-out;
    }
    
    .info-message .close-message {
        background: none;
        border: none;
        color: #0c5460;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0 0 0 10px;
        margin-left: 10px;
    }
    
    @keyframes slide-in {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(styleElement); 