import { AdminDashboard } from './admin.js';

class Admin2Dashboard extends AdminDashboard {
    constructor() {
        super();
        
        // Initialize immediately if we're on admin2 page
        if (window.location.pathname.includes('admin2')) {
            this.init2().catch(console.error);
        }
    }

    async init2() {
        console.log('Initializing Admin2Dashboard');
        const adminToken = localStorage.getItem('adminToken');
        const currentPath = window.location.pathname;
        
        // If token is invalid or missing, redirect to login
        let isTokenValid = false;
        if (adminToken) {
            isTokenValid = await this.verifyAdminToken(adminToken);
        }

        if (!isTokenValid) {
            console.log('Invalid or missing token, redirecting to login');
            localStorage.removeItem('adminToken');
            window.location.href = '/pages/admin-login.html';
            return;
        }

        // If we have a valid token, set up the admin2 dashboard
        if (isTokenValid && currentPath.includes('admin2.html')) {
            console.log('Valid token on admin2 panel, loading dashboard');
            
            // Set up event listeners
            this.setupEventListeners2();
            
            // Load data and update UI
            await this.loadUsers();
            await this.loadAllUserProgress();
            await this.updateDashboard();
            
            // Load timer settings
            await this.loadTimerSettings();
            
            // Update the timer settings display
            this.displayTimerSettings();
            
            // Set up create account form
            this.setupCreateAccountForm();
            
            // Set up scenarios list
            this.setupScenariosList();
        }
    }
    
    setupEventListeners2() {
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
    
    async updateUserList() {
        const container = document.getElementById('usersList');
        if (!container) {
            console.error('User list container not found');
            return;
        }

        // Get existing search and sort controls
        const searchInput = document.getElementById('userSearch');
        const sortSelect = document.getElementById('sortBy');
        const accountTypeSelect = document.getElementById('accountType');

        if (!this.users || !this.users.length) {
            console.log('No users to display');
            container.innerHTML = '<div class="no-users">No users found</div>';
            return;
        }

        // Check if we're in grid or row view
        const isRowView = container.classList.contains('row-view');
        console.log("Current view mode:", isRowView ? "row" : "grid");

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
            
            if (isRowView) {
                card.innerHTML = `
                    <div class="row-content">
                        <div class="user-info">
                            <span class="username">${user.username}</span>
                            <span class="account-type-badge">
                                ${user.userType === 'interview_candidate' ? 'Regular' : 'Regular'}
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
                        <button class="view-details-btn row-btn">View Details</button>
                    </div>
                `;
                
                const viewBtn = card.querySelector('.view-details-btn');
                if (viewBtn) {
                    viewBtn.addEventListener('click', () => {
                        this.showUserDetails(user.username);
                    });
                }
            } else {
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
            }

            container.appendChild(card);
        });

        if (filteredUsers.length === 0) {
            container.innerHTML = '<div class="no-users">No users match your search criteria</div>';
        }
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
        
        // Fetch the latest quiz types before setting up the form
        this.fetchQuizTypes().then(() => {
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
                                    ${this.quizTypes
                                        .slice()
                                        .sort((a, b) => this.formatQuizName(a).localeCompare(this.formatQuizName(b)))
                                        .map(quiz => `
                                        <div class="quiz-option">
                                            <label>
                                                <input type="checkbox" name="quizzes" value="${quiz}">
                                                <span>${this.formatQuizName(quiz)}</span>
                                            </label>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <button type="submit" class="action-button">Create Account</button>
                    </form>
                </div>
            `;
            
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
                        await this.createInterviewAccount(username, password, selectedQuizzes);
                        this.showSuccess('Account created successfully');
                        
                        // Reset form
                        form.reset();
                        
                        // Switch to users view
                        document.querySelector('.menu-item[data-section="users"]').click();
                        
                        // Update user list
                        this.updateUserList();
                    } catch (error) {
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
        if (!scenariosList) return;
        
        // Make sure we have the latest quiz types
        this.fetchQuizTypes().then(() => {
            // Get a sorted and complete list of quiz types
            const sortedQuizTypes = [...this.quizTypes]
                .sort((a, b) => this.formatQuizName(a).localeCompare(this.formatQuizName(b)));
            
            // Check if automation-interview is included
            if (!sortedQuizTypes.includes('automation-interview')) {
                console.log('automation-interview not found in quizTypes, adding it');
                sortedQuizTypes.push('automation-interview');
            }
            
            // Create categories for better organization
            const categories = {
                'Technical Skills': [],
                'QA Processes': [],
                'Content Testing': [],
                'Tools & Documentation': [],
                'Soft Skills': [],
                'Interview Quizzes': [],
                'Other Quizzes': []
            };
            
            // Categorize quizzes
            sortedQuizTypes.forEach(quiz => {
                const category = this.categorizeQuiz(quiz);
                if (categories[category]) {
                    categories[category].push(quiz);
                } else {
                    categories['Other Quizzes'].push(quiz);
                }
            });
            
            // Create HTML for the scenarios list
            let categoryHTML = '';
            
            // Generate HTML for each category
            Object.keys(categories).forEach(category => {
                if (categories[category].length === 0) return;
                
                categoryHTML += `
                    <div class="scenario-category">
                        <h3 class="category-heading">${category}</h3>
                        <div class="category-quizzes">
                            ${categories[category].map(quiz => `
                                <div class="quiz-type-card" data-quiz-type="${quiz}">
                                    <h3>${this.formatQuizName(quiz)}</h3>
                                    <button class="view-scenarios-btn" data-quiz-id="${quiz}">
                                        View Scenarios
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            });
            
            scenariosList.innerHTML = `
                <div class="scenarios-intro">
                    <p>Select a quiz type to view its scenarios:</p>
                </div>
                <div class="scenario-categories">
                    ${categoryHTML}
                </div>
            `;
            
            // Add event listeners for view scenarios buttons
            const viewButtons = scenariosList.querySelectorAll('.view-scenarios-btn');
            viewButtons.forEach(button => {
                button.addEventListener('click', async (e) => {
                    e.preventDefault(); // Prevent default action
                    const quizId = button.dataset.quizId;
                    console.log(`View Scenarios button clicked for quiz: ${quizId}`);
                    await this.showQuizScenarios(quizId);
                });
            });
        }).catch(error => {
            console.error('Error setting up scenarios list:', error);
            scenariosList.innerHTML = `
                <div class="error-message">
                    <p>Failed to load quiz types: ${error.message}</p>
                </div>
            `;
        });
    }

    // Helper method to fetch all quiz types
    async fetchQuizTypes() {
        try {
            const response = await fetch('/api/quiz-types');
            const data = await response.json();
            
            if (data.success && Array.isArray(data.quizTypes)) {
                this.quizTypes = data.quizTypes;
                console.log('Fetched quiz types:', this.quizTypes);
            } else {
                console.warn('Failed to fetch quiz types or invalid response format');
            }
        } catch (error) {
            console.error('Error fetching quiz types:', error);
            // Use default quiz types if fetch fails
            this.quizTypes = [
                'general', 'automation', 'cms', 'api', 'accessibility',
                'mobile', 'security', 'performance', 'uat', 'documentation',
                'communication', 'automation-interview', 'email', 'script',
                'script-metrics'
            ];
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
`;
document.head.appendChild(styleElement); 