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
            // Verify admin token
            await this.verifyAdminToken();
            
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
            
        } catch (error) {
            console.error('Error in init2:', error);
            // Handle initialization error
            this.showError('Initialization failed. Please try refreshing the page.');
        }
    }
    
    // Add loadUsers method
    async loadUsers() {
        try {
            const response = await fetch('/api/users');
            
            if (response.ok) {
                const usersData = await response.json();
                console.log('Loaded user data:', usersData);
                
                // Store users data
                this.users = usersData;
                
                // Update dashboard with user data
                this.updateUsersList();
                
                // Load user progress for all users
                this.loadAllUserProgress();
                
                return usersData;
            } else {
                const errorText = await response.text();
                console.error('Failed to load users:', errorText);
                throw new Error(`Failed to load users: ${response.status} ${response.statusText}`);
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
            const response = await fetch(`/api/users/${username}/progress`);
            
            if (response.ok) {
                const progressData = await response.json();
                console.log(`Loaded progress for ${username}:`, progressData);
                
                // Find the user and update their progress data
                const userIndex = this.users.findIndex(u => u.username === username);
                if (userIndex !== -1) {
                    // Verify data format
                    if (typeof progressData === 'object') {
                        // Store quiz progress data
                        this.users[userIndex].quizProgress = progressData.quizProgress || {};
                        
                        // Store quiz results data if available
                        if (progressData.quizResults && Array.isArray(progressData.quizResults)) {
                            this.users[userIndex].quizResults = progressData.quizResults;
                        }
                        
                        return progressData;
                    } else {
                        console.error(`Invalid progress data format for ${username}:`, progressData);
                        throw new Error('Invalid progress data format');
                    }
                } else {
                    console.error(`User ${username} not found in users list`);
                    throw new Error(`User ${username} not found`);
                }
            } else {
                const errorText = await response.text();
                console.error(`Failed to load progress for ${username}:`, errorText);
                throw new Error(`Failed to load progress: ${response.status} ${response.statusText}`);
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
        const container = document.getElementById('users-container');
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
        const searchTerm = (document.getElementById('user-search')?.value || '').toLowerCase();
        const accountType = document.getElementById('account-type-filter')?.value || 'all';
        const sortBy = document.getElementById('sort-select')?.value || 'username-asc';
        
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
        
        const currentValue = this.timerSettings.secondsPerQuestion ?? 60;
        const timerStatusText = currentValue === 0 ? 'Timer disabled' : `${currentValue} seconds`;
        
        timerContainer.innerHTML = `
            <div class="settings-form">
                <p>Current setting: <strong>${timerStatusText}</strong></p>
                <div class="form-group">
                    <label for="timer-value-input">
                        Seconds per question (0-300):
                    </label>
                    <input 
                        type="number" 
                        id="timer-value-input" 
                        min="0" 
                        max="300" 
                        value="${currentValue}"
                        class="settings-input"
                    />
                    <small>Set to 0 to disable the timer completely.</small>
                </div>
                <button id="save-timer-btn" class="action-button">Save Settings</button>
            </div>
        `;
        
        // Add event listener for save button
        const saveButton = document.getElementById('save-timer-btn');
        if (saveButton) {
            saveButton.addEventListener('click', async () => {
                const timerInput = document.getElementById('timer-value-input');
                if (!timerInput) return;
                
                try {
                    // Get value from input
                    const newValue = parseInt(timerInput.value, 10);
                    
                    // Validate
                    if (isNaN(newValue) || newValue < 0 || newValue > 300) {
                        alert('Timer value must be between 0 and 300 seconds');
                        return;
                    }
                    
                    // Update UI
                    saveButton.disabled = true;
                    saveButton.textContent = 'Saving...';
                    
                    // Call API to save
                    const response = await this.apiService.updateQuizTimerSettings(newValue);
                    
                    // Success
                    if (response.success) {
                        // Update local cache
                        this.timerSettings.secondsPerQuestion = newValue;
                        
                        // Show feedback
                        const message = newValue === 0 
                            ? 'Quiz timer disabled successfully!' 
                            : `Quiz timer set to ${newValue} seconds!`;
                            
                        this.showSuccess(message);
                        this.displayTimerSettings(); // Refresh the display
                    } else {
                        throw new Error(response.message || 'Failed to save settings');
                    }
                } catch (error) {
                    console.error('Failed to save timer settings:', error);
                    this.showError(`Error: ${error.message || 'Failed to save settings'}`);
                } finally {
                    // Reset button
                    saveButton.disabled = false;
                    saveButton.textContent = 'Save Settings';
                }
            });
        }
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
        
        // Fetch the latest quiz types before setting up the form
        this.fetchQuizTypes().then((quizTypes) => {
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
                            <div class="quiz-selection">
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
                                                            <input type="checkbox" name="quizzes" value="${quiz}" data-category="${category}">
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
            
            // Add quiz category styles
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                .quiz-category {
                    margin-bottom: 1.5rem;
                }
                .category-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #eee;
                }
                .category-header h4 {
                    margin: 0;
                    font-size: 1rem;
                    color: #2c3e50;
                }
                .select-category-btn {
                    background: none;
                    border: none;
                    color: #3498db;
                    font-size: 0.9rem;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                }
                .select-category-btn:hover {
                    background-color: #f0f7fc;
                }
                .category-quizzes {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 0.5rem;
                }
            `;
            document.head.appendChild(styleElement);
            
            // Add password visibility toggle functionality
            const passwordToggle = createAccountContainer.querySelector('.password-toggle');
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
            const selectAllCheckbox = createAccountContainer.querySelector('#selectAllQuizzes');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => {
                    const quizCheckboxes = createAccountContainer.querySelectorAll('input[name="quizzes"]');
                    quizCheckboxes.forEach(checkbox => {
                        checkbox.checked = e.target.checked;
                    });
                });
                
                // Update select all checkbox when individual checkboxes change
                const quizCheckboxes = createAccountContainer.querySelectorAll('input[name="quizzes"]');
                quizCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        const allChecked = Array.from(quizCheckboxes).every(cb => cb.checked);
                        selectAllCheckbox.checked = allChecked;
                    });
                });
            }
            
            // Add event listeners for category select buttons
            const categoryButtons = createAccountContainer.querySelectorAll('.select-category-btn');
            categoryButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const category = button.dataset.category;
                    const categoryCheckboxes = createAccountContainer.querySelectorAll(`input[name="quizzes"][data-category="${category}"]`);
                    
                    // Check if all are already checked
                    const allChecked = Array.from(categoryCheckboxes).every(cb => cb.checked);
                    
                    // Toggle all checkboxes in this category
                    categoryCheckboxes.forEach(checkbox => {
                        checkbox.checked = !allChecked;
                    });
                    
                    // Update "Select All" button text
                    button.textContent = allChecked ? 'Select All' : 'Deselect All';
                    
                    // Update main select all checkbox
                    const allQuizCheckboxes = createAccountContainer.querySelectorAll('input[name="quizzes"]');
                    const allQuizzesChecked = Array.from(allQuizCheckboxes).every(cb => cb.checked);
                    selectAllCheckbox.checked = allQuizzesChecked;
                });
            });
            
            // Add event listener for form submission
            const form = createAccountContainer.querySelector('#createInterviewForm');
            if (form) {
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
                        const submitButton = form.querySelector('button[type="submit"]');
                        submitButton.disabled = true;
                        submitButton.textContent = 'Creating Account...';
                        
                        await this.createInterviewAccount(username, password, selectedQuizzes);
                        this.showSuccess('Account created successfully');
                        
                        // Reset form
                        form.reset();
                        
                        // Reset button
                        submitButton.disabled = false;
                        submitButton.textContent = 'Create Account';
                        
                        // Switch to users view
                        document.querySelector('.menu-item[data-section="users"]').click();
                        
                        // Update user list
                        this.updateUsersList();
                    } catch (error) {
                        const submitButton = form.querySelector('button[type="submit"]');
                        submitButton.disabled = false;
                        submitButton.textContent = 'Create Account';
                        
                        this.showError(error.message || 'Failed to create account');
                    }
                });
            }
        }).catch(error => {
            console.error('Error setting up create account form:', error);
            createAccountContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to set up create account form: ${error.message}</p>
                    <button class="retry-button">Retry</button>
                </div>
            `;
            
            const retryButton = createAccountContainer.querySelector('.retry-button');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    this.setupCreateAccountForm();
                });
            }
        });
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
        
        // Get quiz types using the fixed fetchQuizTypes method
        this.fetchQuizTypes()
            .then(quizTypes => {
                if (!quizTypes || quizTypes.length === 0) {
                    throw new Error('No quiz types available');
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
                        
                        const quizName = document.createElement('h3');
                        quizName.textContent = this.formatQuizName(quiz);
                        
                        const viewButton = document.createElement('button');
                        viewButton.className = 'view-scenarios-btn';
                        viewButton.dataset.quizId = quiz;
                        viewButton.textContent = 'View Scenarios';
                        viewButton.setAttribute('tabindex', '0');
                        viewButton.setAttribute('aria-label', `View scenarios for ${this.formatQuizName(quiz)}`);
                        
                        // Add event listener to button
                        viewButton.addEventListener('click', async (e) => {
                            e.preventDefault();
                            const quizId = viewButton.dataset.quizId;
                            console.log(`View Scenarios button clicked for quiz: ${quizId}`);
                            await this.showQuizScenarios(quizId);
                        });
                        
                        quizCard.appendChild(quizName);
                        quizCard.appendChild(viewButton);
                        quizzesGrid.appendChild(quizCard);
                    });
                    
                    categoryDiv.appendChild(quizzesGrid);
                    categoriesContainer.appendChild(categoryDiv);
                });
            })
            .catch(error => {
                console.error('Error setting up scenarios list:', error);
                scenariosList.innerHTML = `
                    <div class="error-message">
                        <p>Failed to load quiz types: ${error.message}</p>
                        <button class="retry-button">Retry</button>
                    </div>
                `;
                
                const retryButton = scenariosList.querySelector('.retry-button');
                if (retryButton) {
                    retryButton.addEventListener('click', () => {
                        this.setupScenariosList();
                    });
                }
            });
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
            // Try to fetch quiz types from API first
            const response = await fetch('/api/quiz-types');
            
            let quizTypesList;
            
            if (response.ok) {
                const data = await response.json();
                console.log('Successfully fetched quiz types from API:', data);
                
                // Ensure automation-interview is included (sometimes it's missing from the API)
                if (data.indexOf('automation-interview') === -1) {
                    data.push('automation-interview');
                }
                
                // Sort alphabetically
                quizTypesList = data.sort((a, b) => a.localeCompare(b));
            } else {
                console.warn('Failed to fetch quiz types from API, using hardcoded fallback');
                // If the API fails, use the hardcoded fallback
                quizTypesList = this.getHardcodedQuizTypes();
            }
            
            // Set the class property for use elsewhere
            this.quizTypes = quizTypesList;
            
            return quizTypesList;
        } catch (error) {
            console.error('Error fetching quiz types:', error);
            // If any error occurs, use the hardcoded fallback
            const fallbackTypes = this.getHardcodedQuizTypes();
            
            // Set the class property for use elsewhere
            this.quizTypes = fallbackTypes;
            
            return fallbackTypes;
        }
    }

    // Helper method to provide hardcoded quiz types
    getHardcodedQuizTypes() {
        // This list should match the categories used in categorizeQuiz
        return [
            'automation',
            'automation-interview',
            'api',
            'script',
            'script-metrics',
            'technical',
            'accessibility',
            'performance',
            'security',
            'mobile',
            'communication',
            'soft-skills',
            'bug-reporting',
            'test-cases',
            'test-strategy',
            'test-management',
            'exploratory',
            'manual',
            'qa-methodology',
            'qa-theory',
            'content',
            'documentation',
            'content-testing',
            'reporting',
            'tools',
            'interview'
        ].sort((a, b) => a.localeCompare(b));
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

            // Prepare quiz file name (normalize for different naming conventions)
            let quizFileName = quizName.toLowerCase();
            
            // Special handling for hyphenated quiz names
            if (quizFileName === 'automation-interview') {
                quizFileName = 'automation-interview'; // Keep as is
            } else if (quizFileName.includes('-')) {
                // Convert "some-name" to "SomeName" or keep original if that doesn't work
                const parts = quizFileName.split('-');
                const camelCase = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
                quizFileName = camelCase + '-quiz';
            } else {
                // Add -quiz suffix for most quiz files
                quizFileName = quizFileName + '-quiz';
            }
            
            console.log(`Attempting to load quiz file: ${quizFileName}`);
            
            let scenarios = [];
            try {
                // Try different possible filenames
                const possibleFileNames = [
                    `${quizName.toLowerCase()}.js`,
                    `${quizName.toLowerCase()}-quiz.js`,
                    `${quizFileName}.js`
                ];
                
                // Try to dynamically import the quiz module
                let quizModule = null;
                
                // Loop through possible filenames until one works
                for (const fileName of possibleFileNames) {
                    try {
                        console.log(`Trying to load: /quizzes/${fileName}`);
                        quizModule = await import(`/quizzes/${fileName}`);
                        console.log(`Successfully loaded: /quizzes/${fileName}`);
                        break;
                    } catch (err) {
                        console.warn(`Failed to load: /quizzes/${fileName}`, err);
                        // Continue to try other filenames
                    }
                }
                
                // If no module was loaded, throw an error
                if (!quizModule) {
                    throw new Error(`Could not find quiz module for ${quizName}`);
                }
                
                // Extract scenarios from the module's class
                const quizClasses = Object.values(quizModule).filter(val => typeof val === 'function');
                if (quizClasses.length === 0) {
                    throw new Error(`No quiz class found in module for ${quizName}`);
                }
                
                // Create an instance of the quiz class to access its scenarios
                const quizInstance = new quizClasses[0]();
                scenarios = quizInstance.scenarios || quizInstance.basicScenarios || [];
                
                // Group scenarios by level
                const groupedScenarios = {
                    basic: scenarios.filter(s => s.level === 'Basic'),
                    intermediate: scenarios.filter(s => s.level === 'Intermediate'),
                    advanced: scenarios.filter(s => s.level === 'Advanced')
                };
                
                scenarios = groupedScenarios;
                
            } catch (error) {
                console.error(`Error loading quiz scenarios for ${quizName}:`, error);
                
                // Show error message with fallback options
                loadingOverlay.innerHTML = `
                    <div style="
                        background: white;
                        padding: 2rem;
                        border-radius: 8px;
                        text-align: center;
                        max-width: 500px;">
                        <h3>Error Loading Scenarios</h3>
                        <p style="color: #dc3545; margin: 1rem 0;">
                            Could not load scenarios for ${this.formatQuizName(quizName)}.
                        </p>
                        <p>
                            The quiz file might be using a different naming convention or structure.
                        </p>
                        <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: center;">
                            <button id="retryBtn" class="action-button">
                                Retry
                            </button>
                            <button id="viewFileBtn" class="action-button" style="background-color: #6c757d;">
                                View File Path
                            </button>
                        </div>
                    </div>
                `;
                
                // Add event listener for retry button
                const retryBtn = document.getElementById('retryBtn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        loadingOverlay.remove();
                        this.showQuizScenarios(quizName);
                    });
                }
                
                // Add event listener for view file button
                const viewFileBtn = document.getElementById('viewFileBtn');
                if (viewFileBtn) {
                    viewFileBtn.addEventListener('click', () => {
                        loadingOverlay.remove();
                        
                        // Show possible file paths
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
                                <p>Possible file locations for this quiz:</p>
                                <code style="
                                    display: block;
                                    background: #f8f9fa;
                                    padding: 1rem;
                                    border-radius: 4px;
                                    margin: 0.5rem 0;
                                    text-align: left;
                                    overflow-x: auto;">
                                    frontend/quizzes/${quizName.toLowerCase()}.js
                                </code>
                                <code style="
                                    display: block;
                                    background: #f8f9fa;
                                    padding: 1rem;
                                    border-radius: 4px;
                                    margin: 0.5rem 0;
                                    text-align: left;
                                    overflow-x: auto;">
                                    frontend/quizzes/${quizName.toLowerCase()}-quiz.js
                                </code>
                                <code style="
                                    display: block;
                                    background: #f8f9fa;
                                    padding: 1rem;
                                    border-radius: 4px;
                                    margin: 0.5rem 0;
                                    text-align: left;
                                    overflow-x: auto;">
                                    frontend/quizzes/${quizFileName}.js
                                </code>
                                <p>Please check if the file exists and its structure.</p>
                                <button id="closeFilePathBtn" class="action-button" style="
                                    background: var(--primary-color);
                                    color: white;
                                    border: none;
                                    padding: 8px 16px;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    margin-top: 1rem;">
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
            const user = this.users.find(u => u.username === username);
            if (!user) {
                throw new Error(`User ${username} not found`);
            }
            
            // Calculate progress metrics
            const progress = this.calculateUserProgress(user);
            const lastActive = this.getLastActiveDate(user);
            
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'user-details-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'user-details-title');
            
            // Create content container
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
            closeBtn.innerHTML = '×';
            
            header.appendChild(title);
            header.appendChild(closeBtn);
            
            // Create tab navigation
            const tabs = document.createElement('div');
            tabs.className = 'tabs';
            
            // Tab buttons structure matching the standard admin page
            tabs.innerHTML = `
                <a href="#" class="tab-button active" data-tab="overview">Overview</a>
                <a href="#" class="tab-button" data-tab="quiz-results">Quiz Results</a>
                <a href="#" class="tab-button" data-tab="activity">Activity</a>
            `;
            
            // Create tab contents container
            const tabContainer = document.createElement('div');
            tabContainer.className = 'tab-container';
            
            // Overview Tab Content
            const overviewTab = document.createElement('div');
            overviewTab.id = 'overview-tab';
            overviewTab.className = 'tab-content active';
            
            // User Information Section
            overviewTab.innerHTML = `
                <div class="user-information">
                    <h4>User Information</h4>
                    <div class="info-grid">
                        <div class="info-row">
                            <div class="info-label">Username:</div>
                            <div class="info-value">${username}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Account Type:</div>
                            <div class="info-value">${user.userType === 'interview_candidate' ? 'Regular' : 'Regular'}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Last Active:</div>
                            <div class="info-value">${this.formatDate(lastActive)}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Overall Progress:</div>
                            <div class="info-value">${progress.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
                
                <div class="progress-summary">
                    <h4>Progress Summary</h4>
                    <div class="quiz-progress-list"></div>
                </div>
            `;
            
            // Populate quiz progress list
            const quizProgressList = overviewTab.querySelector('.quiz-progress-list');
            
            // Generate quiz progress items to match standard admin
            this.quizTypes.forEach(quizType => {
                const quizProgress = user.quizProgress?.[quizType.toLowerCase()] || {};
                const quizResult = user.quizResults?.find(r => r.quizName.toLowerCase() === quizType.toLowerCase());
                
                // Use data from either progress or results, prioritizing results
                const quizExperience = quizResult?.experience || quizProgress?.experience || 0;
                const questionsAnswered = quizResult?.questionsAnswered || 
                                        quizResult?.questionHistory?.length ||
                                        quizProgress?.questionsAnswered || 
                                        quizProgress?.questionHistory?.length || 0;
                
                // Calculate percentage
                const totalQuestions = this.estimateTotalQuestions(quizType);
                const percentComplete = Math.min(100, (questionsAnswered / totalQuestions) * 100);
                
                // Create quiz card
                const quizCard = document.createElement('div');
                quizCard.className = 'quiz-progress-item';
                
                // Add class based on progress state
                if (questionsAnswered === 0) {
                    quizCard.classList.add('not-started');
                } else if (percentComplete < 100) {
                    quizCard.classList.add('in-progress');
                } else if (quizExperience === totalQuestions) {
                    quizCard.classList.add('completed-perfect');
                } else {
                    quizCard.classList.add('completed-partial');
                }
                
                quizCard.innerHTML = `
                    <h4>${this.formatQuizName(quizType)}</h4>
                    <div class="progress-details">
                        <div>
                            <strong>Progress:</strong>
                            <span>${percentComplete.toFixed(0)}%</span>
                        </div>
                        <div>
                            <strong>XP:</strong>
                            <span>${quizExperience}</span>
                        </div>
                        <div>
                            <strong>Questions:</strong>
                            <span>${questionsAnswered}/${totalQuestions}</span>
                        </div>
                        <div>
                            <strong>Status:</strong>
                            <span class="${this.getStatusClass(percentComplete)}">
                                ${this.getStatusText(percentComplete)}
                            </span>
                        </div>
                    </div>
                    <div class="quiz-actions">
                        <button class="view-questions-btn" data-quiz="${quizType}" data-username="${username}">
                            View Questions
                        </button>
                        <button class="reset-quiz-btn" data-quiz="${quizType}" data-username="${username}">
                            Reset Progress
                        </button>
                    </div>
                `;
                
                quizProgressList.appendChild(quizCard);
            });
            
            // Quiz Results Tab
            const quizResultsTab = document.createElement('div');
            quizResultsTab.id = 'quiz-results-tab';
            quizResultsTab.className = 'tab-content';
            quizResultsTab.innerHTML = `
                <h4>Quiz Results</h4>
                <p>Detailed quiz results will be displayed here.</p>
            `;
            
            // Activity Tab
            const activityTab = document.createElement('div');
            activityTab.id = 'activity-tab';
            activityTab.className = 'tab-content';
            activityTab.innerHTML = `
                <h4>Activity History</h4>
                ${user.activityLog && user.activityLog.length > 0 ? `
                    <div class="activity-timeline">
                        ${user.activityLog.slice(0, 20).map(activity => `
                            <div class="activity-item">
                                <div class="activity-time">${this.formatDate(new Date(activity.timestamp))}</div>
                                <div class="activity-details">
                                    <div class="activity-type">
                                        <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                                        ${this.formatActivityType(activity.type)}
                                    </div>
                                    <div class="activity-description">${activity.description}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-activity">No activity recorded yet</p>'}
            `;
            
            // Add tabs to container
            tabContainer.appendChild(overviewTab);
            tabContainer.appendChild(quizResultsTab);
            tabContainer.appendChild(activityTab);
            
            // User actions
            const userActions = document.createElement('div');
            userActions.className = 'user-actions';
            userActions.innerHTML = `
                <button id="resetUserProgress" class="action-button reset-progress-btn">
                    Reset Progress
                </button>
                <button id="deleteUserAccount" class="action-button delete-account-btn">
                    Delete Account
                </button>
            `;
            
            // Assemble content
            content.appendChild(header);
            content.appendChild(tabs);
            content.appendChild(tabContainer);
            content.appendChild(userActions);
            overlay.appendChild(content);
            document.body.appendChild(overlay);
            
            // Add tab switching functionality
            const tabButtons = overlay.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Remove active class from all buttons and contents
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    overlay.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
                    
                    // Add active class to clicked button and corresponding content
                    button.classList.add('active');
                    const tabId = `${button.dataset.tab}-tab`;
                    document.getElementById(tabId).classList.add('active');
                });
            });
            
            // Add event listeners for close button
            closeBtn.addEventListener('click', () => {
                overlay.remove();
            });
            
            // Add event listener for clicking outside the modal
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                }
            });
            
            // Add event listener for escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
            
            // Add event listeners for button actions
            const viewQuestionButtons = overlay.querySelectorAll('.view-questions-btn');
            viewQuestionButtons.forEach(button => {
                button.addEventListener('click', async () => {
                    const quizId = button.dataset.quiz;
                    const username = button.dataset.username;
                    await this.showQuizQuestions(quizId, username);
                });
            });
            
            const resetQuizButtons = overlay.querySelectorAll('.reset-quiz-btn');
            resetQuizButtons.forEach(button => {
                button.addEventListener('click', async () => {
                    const quizId = button.dataset.quiz;
                    const username = button.dataset.username;
                    
                    if (confirm(`Are you sure you want to reset progress for ${this.formatQuizName(quizId)}?`)) {
                        try {
                            await this.resetQuizProgress(username, quizId);
                            overlay.remove();
                            this.showSuccess(`Reset progress for ${this.formatQuizName(quizId)}`);
                            this.updateUserList();
                        } catch (error) {
                            this.showError(`Failed to reset quiz progress: ${error.message}`);
                        }
                    }
                });
            });
            
            const resetProgressBtn = overlay.querySelector('#resetUserProgress');
            if (resetProgressBtn) {
                resetProgressBtn.addEventListener('click', async () => {
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
            }
            
            const deleteAccountBtn = overlay.querySelector('#deleteUserAccount');
            if (deleteAccountBtn) {
                deleteAccountBtn.addEventListener('click', async () => {
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
                'general', 'automation', 'cms', 'api', 'accessibility',
                'mobile', 'security', 'performance', 'uat', 'documentation',
                'communication', 'automation-interview', 'email', 'script',
                'script-metrics'
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
            
            // Map quiz types to categories
            if (['automation', 'api', 'mobile', 'security', 'performance', 'script', 'script-metrics', 'technical', 'accessibility'].includes(lowerQuiz)) {
                categories['Technical Skills'].push(quiz);
            } 
            else if (['process', 'uat', 'general', 'test-process'].includes(lowerQuiz)) {
                categories['QA Processes'].push(quiz);
            }
            else if (['content', 'cms', 'cms-testing', 'email', 'email-testing'].includes(lowerQuiz)) {
                categories['Content Testing'].push(quiz);
            }
            else if (['documentation', 'tools'].includes(lowerQuiz)) {
                categories['Tools & Documentation'].push(quiz);
            }
            else if (['communication', 'soft-skills'].includes(lowerQuiz)) {
                categories['Soft Skills'].push(quiz);
            }
            else if (['interview', 'automation-interview'].includes(lowerQuiz)) {
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

    // Add new implementation for showQuizQuestions with properly closed blocks
    async showQuizQuestions(quizType, username) {
        try {
            // Get user's quiz data
            const user = this.users.find(u => u.username === username);
            if (!user) {
                throw new Error(`User ${username} not found`);
            }
            
            const quizResult = user.quizResults?.find(r => r.quizName.toLowerCase() === quizType.toLowerCase());
            const quizProgress = user.quizProgress?.[quizType.toLowerCase()] || {};
            const questionHistory = quizResult?.questionHistory || quizProgress?.questionHistory || [];
            
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'user-details-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            
            // Create content container
            const content = document.createElement('div');
            content.className = 'user-details-content';
            
            // Create header
            const header = document.createElement('div');
            header.className = 'details-header';
            
            const title = document.createElement('h3');
            title.textContent = `${this.formatQuizName(quizType)} Questions for ${username}`;
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.setAttribute('aria-label', 'Close');
            closeBtn.innerHTML = '×';
            
            header.appendChild(title);
            header.appendChild(closeBtn);
            
            // Create question list
            const questionList = document.createElement('div');
            questionList.className = 'question-list';
            
            if (questionHistory.length === 0) {
                questionList.innerHTML = `
                    <p class="no-activity">No questions attempted yet for this quiz.</p>
                `;
            } else {
                // Sort questions by timestamp if available
                const sortedQuestions = [...questionHistory].sort((a, b) => {
                    const timeA = a.timestamp ? new Date(a.timestamp) : 0;
                    const timeB = b.timestamp ? new Date(b.timestamp) : 0;
                    return timeB - timeA; // Latest first
                });
                
                questionList.innerHTML = `
                    <div class="questions-header">
                        <h4>Question History (${sortedQuestions.length} questions)</h4>
                    </div>
                    <div class="questions-container">
                        ${sortedQuestions.map((question, index) => `
                            <div class="question-item ${question.correct ? 'correct' : 'incorrect'}">
                                <div class="question-number">Q${index + 1}</div>
                                <div class="question-content">
                                    <div class="question-text">${question.questionText || 'Question text not available'}</div>
                                    <div class="question-details">
                                        <div class="question-answer">
                                            <strong>User Answer:</strong> ${question.userAnswer || 'Not answered'}
                                        </div>
                                        <div class="question-correct-answer">
                                            <strong>Correct Answer:</strong> ${question.correctAnswer || 'Not available'}
                                        </div>
                                        ${question.timestamp ? `
                                            <div class="question-timestamp">
                                                <strong>Time:</strong> ${this.formatDate(new Date(question.timestamp))}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="question-status">
                                    <span class="status-indicator ${question.correct ? 'correct' : 'incorrect'}">
                                        ${question.correct ? 'Correct' : 'Incorrect'}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            // Assemble content
            content.appendChild(header);
            content.appendChild(questionList);
            overlay.appendChild(content);
            document.body.appendChild(overlay);
            
            // Add event listeners
            closeBtn.addEventListener('click', () => {
                overlay.remove();
            });
            
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                }
            });
            
            // Add event listener for escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
            
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
`;
document.head.appendChild(styleElement); 