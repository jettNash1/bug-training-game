import { APIService } from './api-service.js';
import { QUIZ_CATEGORIES } from './quiz-list.js';
import { QuizProgressService } from './services/QuizProgressService.js';

export class Admin2Dashboard {
    constructor() {
        // Initialize APIService directly rather than through super()
        this.apiService = new APIService();
        this.quizProgressService = new QuizProgressService();
        
        // Copy initialization properties from AdminDashboard
        this.userScores = new Map();
        this.users = [];
        this.quizTypes = Object.values(QUIZ_CATEGORIES).flat();
        
        this.timerSettings = {
            secondsPerQuestion: 60, // Default value
            quizTimers: {} // Property for custom timers
        };
        
        // Additional initialization for Admin2Dashboard
        this.isRowView = false; // Default to grid view
        this.guideSettings = {};
        
        // Store the dashboard instance globally for easier access
        window.adminDashboard = this;
        
        // Only initialize the dashboard if we're not on the login page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('admin-login.html')) {
            this.init2().catch(error => {
                console.error('Error during Admin2Dashboard initialization:', error);
            });
        } else {
            // Skip dashboard initialization on login page
        }

        this.autoResetSettings = null;
        this.isAdmin = false;
        this.currentUser = null;
        this.isInitialized = false;
        this.isPolling = false;
        this.pollingInterval = null;
        
        // Listen for scheduled resets processed event
        window.addEventListener('scheduledResetsProcessed', async (event) => {
            // console.log('Scheduled resets processed event received:', event.detail);
            // Refresh the schedules display
            await this.refreshScheduleData();
            // Show a success message
            this.showSuccess(`Successfully processed ${event.detail.processedIds.length} scheduled resets`);
        });
    }

    async handleAdminLogin(formData) {
        try {
            // console.log('Admin2Dashboard: Attempting admin login...');
            
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
            window.location.replace('./admin2.html');
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Login failed. Please try again.');
        }
    }

    async init2() {
        try {
            // console.log('Initializing Admin2Dashboard...');
            // Add a guard variable to prevent too frequent checks
            // DISABLED: Frontend auto-reset checking is now handled by backend
            // Removed to prevent duplicate notifications and processing
            // Backend handles all auto-reset and scheduled reset processing
            
            // Wait for DOM to be fully loaded
            if (document.readyState !== 'complete') {
                await new Promise(resolve => {
                    window.addEventListener('load', resolve);
                });
            }

            // Check if we're on admin login page - if so, skip token verification
            const currentPath = window.location.pathname;
            if (currentPath.includes('admin-login.html')) {
                return;
            }

            // Verify admin token for all pages except admin-login
            const tokenVerification = await this.apiService.verifyAdminToken();
            if (!tokenVerification.success) {
                window.location.href = '/pages/admin-login.html';
                return;
            }

            // Set up event listeners first to ensure menu functionality
            this.setupEventListeners();

            // console.log('Loading essential components...');
            // Initialize all components in parallel
            await Promise.all([
                this.loadUsers(),
                this.initializeGuideSettingsWithRetry().catch(error => {
                    console.error('Failed to load guide settings after retry attempts, but continuing with other initializations:', error);
                    return {};
                }),
                this.loadAutoResetSettings().catch(error => {
                    console.error('Failed to load auto reset settings, but continuing with other initializations:', error);
                    return {};
                })
            ]);

            // Always load timer settings before displaying the UI
            await this.loadTimerSettings();

            // Set up all UI components
            // console.log('Setting up UI components...');
            this.setupCreateAccountForm();
            this.setupScenariosList();
            this.setupScheduleSection();
            this.displayTimerSettings();
            
            // Ensure guide settings are displayed even if loading had errors
            if (!this.guideSettings) {
                console.warn('Guide settings were not properly loaded, initializing with empty object');
                this.guideSettings = {};
            }
            this.displayGuideSettings();
            
            this.setupAutoResetSettings();
            this.displayAutoResetSettings();

            // Initialize badges section
            this.setupBadgesSection();

            // Update dashboard with initial data
            await this.updateDashboard();
            // console.log('Admin2Dashboard initialization complete');
        } catch (error) {
            console.error('Error initializing Admin2Dashboard:', error);
            this.showError('Failed to initialize dashboard. Please reload the page.');
        }
    }
    
    async loadUsers() {
        try {
            // Use the apiService to properly handle authentication
            const response = await this.apiService.getAllUsers();
            
            if (response.success) {
                // console.log('Loaded user data:', response.data);
                
                // Store users data
                this.users = response.data;
                
                // Update dashboard with user data
                this.updateUsersList();
                
                // Update statistics and display
                const stats = this.updateStatistics();
                this.updateStatisticsDisplay(stats);
                
                // Load user progress for all users
                this.loadAllUserProgress();
                
                // Update badges section user dropdown
                this.populateBadgesUserDropdown();
                
                // Update schedule section user dropdown
                this.populateUserDropdown();
                
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
        // Limit concurrent requests to avoid overwhelming the server
        const MAX_CONCURRENT_REQUESTS = 3;
        
        try {
            // console.log(`Loading progress for ${this.users.length} users with max ${MAX_CONCURRENT_REQUESTS} concurrent requests`);
            
            // Process users in chunks to limit concurrent requests
            const processUserChunk = async (userChunk) => {
                return Promise.all(
                    userChunk.map(async (user) => {
                        try {
                            await this.loadUserProgress(user.username);
                            // console.log(`Successfully loaded progress for ${user.username}`);
                        } catch (error) {
                            console.warn(`Non-critical error loading progress for ${user.username}:`, error);
                        }
                    })
                );
            };
            
            // Process users in chunks
            const chunks = [];
            for (let i = 0; i < this.users.length; i += MAX_CONCURRENT_REQUESTS) {
                chunks.push(this.users.slice(i, i + MAX_CONCURRENT_REQUESTS));
            }
            
            for (const chunk of chunks) {
                await processUserChunk(chunk);
            }
            
            // Update statistics and user list after loading all progress
            const stats = this.updateStatistics();
            this.updateStatisticsDisplay(stats);
            this.updateUsersList();
            
            // console.log("Completed loading progress for all users");
            // Ensure hero stats are updated after all progress is loaded
            await this.updateDashboard();
        } catch (error) {
            console.error('Error loading user progress:', error);
            
            // Still try to update the UI with whatever data we have
            try {
                const stats = this.updateStatistics();
                this.updateStatisticsDisplay(stats);
                this.updateUsersList();
            } catch (uiError) {
                console.error('Failed to update UI after error:', uiError);
            }
        }
    }
    
    async loadUserProgress(username) {
        try {
            // Use the apiService to properly handle authentication
            const response = await this.apiService.getUserProgress(username);
            
            // If success is true (even if the request timed out but we got fallback data)
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
                        
                        // If response has a message but was still successful, it's likely using fallback data
                        if (response.message) {
                            console.warn(`Note for ${username}: ${response.message}`);
                        }
                        
                        return response.data;
                    } else {
                        console.warn(`Invalid progress data format for ${username}. Using empty data.`);
                        // Instead of throwing, set empty data
                        this.users[userIndex].quizProgress = {};
                        this.users[userIndex].quizResults = [];
                        return { quizProgress: {}, quizResults: [] };
                    }
                } else {
                    console.warn(`User ${username} not found in users list. Skipping.`);
                    return { quizProgress: {}, quizResults: [] };
                }
            } else {
                console.warn(`Could not load progress for ${username}: ${response.message || 'Unknown error'}`);
                // If user exists, set empty data instead of throwing
                const userIndex = this.users.findIndex(u => u.username === username);
                if (userIndex !== -1) {
                    this.users[userIndex].quizProgress = {};
                    this.users[userIndex].quizResults = [];
                }
                return { quizProgress: {}, quizResults: [] };
            }
        } catch (error) {
            console.warn(`Error loading progress for ${username}, using empty data:`, error);
            // If user exists, set empty data instead of throwing
            const userIndex = this.users.findIndex(u => u.username === username);
            if (userIndex !== -1) {
                this.users[userIndex].quizProgress = {};
                this.users[userIndex].quizResults = [];
            }
            return { quizProgress: {}, quizResults: [] };
        }
    }
    
    setupEventListeners() {
        // Menu navigation
        const menuItems = document.querySelectorAll('.menu-item');
        const contentSections = document.querySelectorAll('.content-section');
        
        if (!menuItems.length || !contentSections.length) {
            console.error('Menu items or content sections not found');
            return;
        }

        console.log('Setting up menu event listeners:', {
            menuItemsCount: menuItems.length,
            contentSectionsCount: contentSections.length
        });

        menuItems.forEach(item => {
            const button = item.querySelector('button');
            if (button) {
                            button.addEventListener('click', () => {
                const sectionId = item.getAttribute('data-section');
                console.log('Menu item clicked:', {
                    sectionId: sectionId,
                    buttonText: button.textContent.trim()
                });
                
                // Save the current section to localStorage for persistence
                localStorage.setItem('adminActiveSection', sectionId);
                
                // Show the selected section
                this.showSection(sectionId);
                    
                });
            }
        });
        
        // Restore the last active section on page load
        this.restoreActiveSection();

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleAdminLogout();
            });
        }

        // View toggle buttons
        const viewToggleButtons = document.querySelectorAll('.toggle-button');
        const usersList = document.getElementById('usersList');

        viewToggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all toggle buttons
                viewToggleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update view class on users list
                if (usersList) {
                    usersList.className = `users-list ${button.dataset.view}-view`;
                    // Re-render the user list to apply the new view
                    this.updateUsersList();
                }
            });
        });

        // Search input
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.updateUsersList();
            });
        }

        // Sort select
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.updateUsersList();
            });
        }

        // Account type filter
        const accountTypeSelect = document.getElementById('accountType');
        if (accountTypeSelect) {
            accountTypeSelect.addEventListener('change', () => {
                this.updateUsersList();
            });
        }

        // Export buttons
        const exportDetailedBtn = document.getElementById('exportDetailedCSV');
        const exportSimpleBtn = document.getElementById('exportSimpleCSV');

        if (exportDetailedBtn) {
            exportDetailedBtn.addEventListener('click', () => {
                this.exportUserData('detailed');
            });
        }

        if (exportSimpleBtn) {
            exportSimpleBtn.addEventListener('click', () => {
                this.exportUserData('simple');
            });
        }

        // Custom export functionality
        const exportCustomBtn = document.getElementById('exportCustomCSV');
        if (exportCustomBtn) {
            exportCustomBtn.addEventListener('click', () => {
                this.exportCustomData();
            });
        }

        // Note: Export section initialization is handled in the main switch case above

        // Badges section
        document.getElementById('badgesUserDropdown')?.addEventListener('change', (e) => {
            const username = e.target.value;
            if (username) {
                this.loadUserBadges(username);
            } else {
                // Reset the badges container to initial state
                const badgesContainer = document.getElementById('userBadgesContainer');
                badgesContainer.innerHTML = `
                    <div class="initial-message">
                        <i class="fas fa-user-circle"></i>
                        <p>Select a user to view their badges</p>
                    </div>
                `;
            }
        });
    }
    
    // Method to show a specific section and handle special section logic
    showSection(sectionId) {
        const menuItems = document.querySelectorAll('.menu-item');
        const contentSections = document.querySelectorAll('.content-section');
        
        // Remove active class from all menu items
        menuItems.forEach(mi => mi.classList.remove('active'));
        
        // Add active class to the selected menu item
        const selectedMenuItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (selectedMenuItem) {
            selectedMenuItem.classList.add('active');
        }
        
        // Get the section element
        const section = document.getElementById(sectionId);
        
        if (!section) {
            console.error(`Section not found for ID: ${sectionId}`);
            return;
        }
        
        // Hide all sections first
        contentSections.forEach(s => {
            s.classList.remove('active');
            s.style.display = 'none';
        });
        
        // Set display to block and add active class after a small delay
        section.style.display = 'block';
        setTimeout(() => {
            section.classList.add('active');
            // Try to reset scroll position of .content-area or .content-container
            const contentArea = document.querySelector('.content-area');
            if (contentArea) {
                contentArea.scrollTop = 0;
            } else {
                const contentContainer = document.querySelector('.content-container');
                if (contentContainer) contentContainer.scrollTop = 0;
            }
        }, 0);
        
        // Special handling for different sections
        switch(sectionId) {
            case 'schedule-section':
                this.refreshScheduleData();
                break;
            case 'settings-section':
                this.displayTimerSettings();
                this.displayGuideSettings();
                break;
            case 'scenarios-section':
                this.setupScenariosList();
                break;
            case 'create-account-section':
                this.setupCreateAccountForm();
                break;
            case 'badges-section':
                // Refresh badges user dropdown when badge section is activated
                this.populateBadgesUserDropdown();
                break;
            case 'export-section':
                // Initialize custom export when export section is activated
                setTimeout(() => this.initializeCustomExport(), 300);
                break;
        }
    }
    
    // Method to restore the last active section from localStorage
    restoreActiveSection() {
        const savedSection = localStorage.getItem('adminActiveSection');
        const defaultSection = 'users-section'; // Default to users section
        
        // Use saved section if it exists and is valid, otherwise use default
        const sectionToShow = savedSection && document.getElementById(savedSection) ? savedSection : defaultSection;
        
        console.log('Restoring active section:', sectionToShow);
        this.showSection(sectionToShow);
    }
    
    async updateDashboard() {
        try {
            // Update user list with current filters (this will also update statistics)
            await this.updateUsersList();
            
        } catch (error) {
            console.error('Error updating dashboard:', error);
            this.showError(`Failed to update dashboard: ${error.message}`);
        }
    }
    
    updateStatistics(usersToCount = null) {
        // Use provided users or fall back to all users
        const usersForStats = usersToCount || this.users;
        
        // Handle case when users haven't been loaded yet
        if (!usersForStats || !Array.isArray(usersForStats)) {
            // console.log('Users not loaded yet, returning zero statistics');
            return {
                totalUsers: 0,
                activeToday: 0,
                averageCompletion: 0
            };
        }

        // Calculate Active Today
            const today = new Date();
        const totalUsers = usersForStats.length;
        let activeToday = 0;
        let totalCompletion = 0;

        // Debug: log each user's overall progress
        // console.log('--- Calculating Overall Progress for Hero Stat ---');
        usersForStats.forEach(user => {
            // Active Today: Use getLastActiveDate which considers both lastLogin and quiz activity
            const lastActiveTimestamp = this.getLastActiveDate(user);
            if (lastActiveTimestamp > 0) {
                const lastActiveDate = new Date(lastActiveTimestamp);
                if (lastActiveDate.toDateString() === today.toDateString()) {
                    activeToday++;
                }
            }
            
            // Use the same per-user overall progress as on the user card
            const percent = this.calculateQuestionsAnsweredPercent(user);
            totalCompletion += percent;
            // console.log(`User: ${user.username}, Overall Progress: ${percent.toFixed(1)}%, Last Active: ${this.formatDate(this.getLastActiveDate(user))}`);
        });

        // Mean average overall progress
        const averageCompletion = totalUsers > 0 ? totalCompletion / totalUsers : 0;
        // console.log(`Computed statistics - Total users: ${totalUsers}, Active today: ${activeToday}, Average completion: ${averageCompletion.toFixed(1)}%`);

        return {
            totalUsers,
            activeToday,
            averageCompletion
        };
    }

    updateStatisticsDisplay(stats) {
        // console.log('[DEBUG] updateStatisticsDisplay called', stats);
        const totalUsersElement = document.getElementById('totalUsers');
        const activeUsersElement = document.getElementById('activeUsers');
        // Rename Average Completion to Overall Progress
        const averageCompletionElement = document.getElementById('averageCompletion');
        if (!averageCompletionElement) {
            console.warn('[DEBUG] averageCompletion element not found in DOM');
        } else {
            // console.log('[DEBUG] averageCompletion element found in DOM');
        }
        if (totalUsersElement) {
            totalUsersElement.textContent = stats.totalUsers || 0;
        }
        if (activeUsersElement) {
            activeUsersElement.textContent = stats.activeToday || 0;
        }
        if (averageCompletionElement) {
            const displayValue = `${(stats.averageCompletion || 0).toFixed(1)}%`;
            // console.log(`[UI] Setting hero Overall Progress to: ${displayValue}`);
            averageCompletionElement.textContent = displayValue;
            // Also update the label if present
            const statCard = averageCompletionElement.closest('.stat-card');
            if (statCard) {
                const h3 = statCard.querySelector('h3');
                if (h3) h3.textContent = 'Overall Progress';
            }
        }
    }
    
    async updateUsersList() {
        const container = document.getElementById('usersList');
        if (!container) return;

        // Handle case when users haven't been loaded yet
        if (!this.users || !Array.isArray(this.users)) {
            // console.log('Users not loaded yet, showing empty state');
            container.innerHTML = '<div class="loading-message">Loading users...</div>';
            
            // Update statistics with empty data
            const stats = this.updateStatistics([]);
            this.updateStatisticsDisplay(stats);
            return;
        }

        // Get current filter values
        const searchQuery = document.getElementById('userSearch')?.value.toLowerCase() || '';
        const sortBy = document.getElementById('sortBy')?.value || 'username-asc';
        const isRowView = !container.classList.contains('grid-view');

        // Filter users - remove account type filtering
        let filteredUsers = this.users.filter(user => {
            const matchesSearch = user.username.toLowerCase().includes(searchQuery);
            return matchesSearch;
        });

        // Sort users based on selected criteria
        filteredUsers.sort((a, b) => {
            switch (sortBy) {
                case 'username-asc':
                    return a.username.localeCompare(b.username);
                case 'username-desc':
                    return b.username.localeCompare(a.username);
                case 'progress-high':
                    return this.calculateQuestionsAnsweredPercent(b) - this.calculateQuestionsAnsweredPercent(a);
                case 'progress-low':
                    return this.calculateQuestionsAnsweredPercent(a) - this.calculateQuestionsAnsweredPercent(b);
                case 'last-active':
                    return this.getLastActiveDate(b) - this.getLastActiveDate(a);
                default:
                    return 0;
            }
        });

        // Clear existing content
        container.innerHTML = '';

        // console.log(`Creating ${filteredUsers.length} user cards...`);
        
        // Update statistics based on filtered users
        const stats = this.updateStatistics(filteredUsers);
        this.updateStatisticsDisplay(stats);

        // Create and append user cards
        filteredUsers.forEach(user => {
            const lastActive = this.getLastActiveDate(user);
            
            // Calculate total questions answered across all quizzes
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
            
            // Use the same calculation as the details overlay for overall progress
            const overallProgress = this.calculateQuestionsAnsweredPercent(user);
            const overallProgressDisplay = `${overallProgress.toFixed(1)}%`;
            
            // console.log(`User ${user.username}: questions=${totalQuestionsAnswered}, progress=${overallProgressDisplay}`);

            const card = document.createElement('div');
            card.className = 'user-card';
            
            // Set a data attribute on the card to store the username and progress for easy reference
            card.setAttribute('data-username', user.username);
            card.setAttribute('data-progress', overallProgressDisplay);
            card.setAttribute('data-questions', totalQuestionsAnswered.toString());
            
            if (isRowView) {
                card.innerHTML = `
                    <div class="row-content">
                        <div class="user-info">
                            <span class="username">${user.username}</span>
                            <span class="account-type-badge" style="
                                background-color: #e3f2fd;
                                color: #1976d2;
                                padding: 4px 12px;
                                border-radius: 20px;
                                font-size: 0.85rem;
                                font-weight: 500;
                                display: inline-flex;
                                align-items: center;
                                margin-left: 8px;
                            ">Regular</span>
                        </div>
                        <div class="user-stats">
                            <div class="stat">
                                <span class="stat-label">Questions Answered:</span>
                                <span class="stat-value">${totalQuestionsAnswered}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Overall Progress:</span>
                                <span class="stat-value total-progress-value">${overallProgressDisplay}</span>
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
                // Use direct DOM manipulation to avoid any issues with HTML processing
                const cardContent = document.createElement('div');
                cardContent.className = 'user-card-content';
                
                const userHeader = document.createElement('div');
                userHeader.className = 'user-header';
                
                const username = document.createElement('span');
                username.className = 'username';
                username.textContent = user.username;
                
                const accountTypeBadge = document.createElement('span');
                accountTypeBadge.className = 'account-type-badge';
                accountTypeBadge.textContent = 'Regular';
                accountTypeBadge.style.backgroundColor = '#e3f2fd';
                accountTypeBadge.style.color = '#1976d2';
                accountTypeBadge.style.padding = '4px 12px';
                accountTypeBadge.style.borderRadius = '20px';
                accountTypeBadge.style.fontSize = '0.85rem';
                accountTypeBadge.style.fontWeight = '500';
                accountTypeBadge.style.display = 'inline-flex';
                accountTypeBadge.style.alignItems = 'center';
                accountTypeBadge.style.marginLeft = '8px';
                
                userHeader.appendChild(username);
                userHeader.appendChild(accountTypeBadge);
                
                const progressContainer = document.createElement('div');
                progressContainer.className = 'progress-container';
                
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                progressBar.style.backgroundColor = '#e9ecef'; // Light gray background
                
                const progressFill = document.createElement('div');
                progressFill.className = 'progress-fill';
                progressFill.style.width = `${overallProgress}%`;
                progressFill.style.backgroundColor = '#28a745'; // Green fill color
                
                progressBar.appendChild(progressFill);
                
                const progressText = document.createElement('span');
                progressText.className = 'progress-text';
                progressText.textContent = overallProgressDisplay;
                
                progressContainer.appendChild(progressBar);
                progressContainer.appendChild(progressText);
                
                const userStats = document.createElement('div');
                userStats.className = 'user-stats';
                
                // Questions Answered stat
                const questionsStat = document.createElement('div');
                questionsStat.className = 'stat';
                
                const questionsLabel = document.createElement('span');
                questionsLabel.className = 'stat-label';
                questionsLabel.textContent = 'Questions Answered:';
                
                const questionsValue = document.createElement('span');
                questionsValue.className = 'stat-value';
                questionsValue.textContent = totalQuestionsAnswered.toString();
                
                questionsStat.appendChild(questionsLabel);
                questionsStat.appendChild(questionsValue);
                
                // Overall Progress stat
                const progressStat = document.createElement('div');
                progressStat.className = 'stat';
                
                const progressLabel = document.createElement('span');
                progressLabel.className = 'stat-label';
                progressLabel.textContent = 'Overall Progress:';
                
                const progressValue = document.createElement('span');
                progressValue.className = 'stat-value total-progress-value';
                progressValue.textContent = overallProgressDisplay;
                
                progressStat.appendChild(progressLabel);
                progressStat.appendChild(progressValue);
                
                // Last Active stat
                const lastActiveStat = document.createElement('div');
                lastActiveStat.className = 'stat';

                const lastActiveLabel = document.createElement('span');
                lastActiveLabel.className = 'stat-label';
                lastActiveLabel.textContent = 'Last Active:';
                
                const lastActiveValue = document.createElement('span');
                lastActiveValue.className = 'stat-value';
                lastActiveValue.textContent = this.formatDate(lastActive);
                
                lastActiveStat.appendChild(lastActiveLabel);
                lastActiveStat.appendChild(lastActiveValue);
                
                userStats.appendChild(questionsStat);
                userStats.appendChild(progressStat);
                userStats.appendChild(lastActiveStat);
                
                cardContent.appendChild(userHeader);
                cardContent.appendChild(progressContainer);
                cardContent.appendChild(userStats);
                
                const viewDetailsBtn = document.createElement('button');
                viewDetailsBtn.className = 'view-details-btn';
                viewDetailsBtn.setAttribute('tabindex', '0');
                viewDetailsBtn.setAttribute('aria-label', `View details for ${user.username}`);
                viewDetailsBtn.textContent = 'View Details';
                
                viewDetailsBtn.addEventListener('click', () => {
                    this.showUserDetails(user.username);
                });
                viewDetailsBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.showUserDetails(user.username);
                    }
                });
                
                card.appendChild(cardContent);
                card.appendChild(viewDetailsBtn);
            }

            container.appendChild(card);
            
            // Final verification
            const scoreElements = card.querySelectorAll('.stat-value');
            scoreElements.forEach(element => {
                if (element.textContent === '0%') {
                    console.log(`Direct fix: Found a zero percent value that needs updating in ${user.username}'s card`);
                    element.textContent = overallProgressDisplay;
                }
            });
        });

        if (filteredUsers.length === 0) {
            container.innerHTML = '<div class="no-users">No users match your search criteria</div>';
        }
        
        console.log("Users list update complete.");
    }
    
    // Display timer settings in the settings section
    displayTimerSettings() {
        const container = document.getElementById('timer-settings-container');
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        const defaultSeconds = this.timerSettings?.defaultSeconds !== undefined ? this.timerSettings.defaultSeconds : 60;
        const quizTimers = this.timerSettings?.quizTimers || {};
        
        // Use inherited quizTypes array from parent class combined with hardcoded types
        const allQuizTypes = [...new Set([...this.quizTypes, ...this.getHardcodedQuizTypes()])].sort();

        // Create the default timer settings section
        const defaultSettingsHTML = `
            <div class="timer-section">
                <h4>Default Timer Setting</h4>
                <p>This setting applies to all quizzes unless overridden by per-quiz settings.</p>
                
                <div class="form-row">
                    <label>Default seconds per question (0-300):</label>
                    <div class="input-button-group">
                        <input type="number" 
                            id="default-timer" 
                            value="${defaultSeconds}"
                            min="0" 
                            max="300"
                            class="timer-seconds-input">
                        <button class="save-default-btn action-button">Save Default</button>
                    </div>
                </div>
                <small>Set to 0 to disable the timer completely.</small>
            </div>

            <div class="timer-section">
                <h4>Per-Quiz Timer Settings</h4>
                <p>Set different time limits for specific quizzes. These override the default setting.</p>
                
                <div class="quiz-timer-form">
                    <div class="form-row">
                        <label>Select Quiz:</label>
                        <select id="quiz-select" class="settings-input">
                            <option value="">-- Select a Quiz --</option>
                            ${allQuizTypes.map(quiz => 
                                `<option value="${quiz}">${this.formatQuizName(quiz)}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <label>Seconds per question for this quiz (0-300):</label>
                        <div class="input-button-group">
                            <input type="number" 
                                id="quiz-timer" 
                                placeholder="Leave empty for default (${defaultSeconds}s)"
                                min="0" 
                                max="300"
                                class="timer-seconds-input settings-input">
                            <button id="set-timer-btn" class="action-button">Set Timer</button>
                            <button id="reset-default-btn" class="action-button secondary">Reset to Default</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="timer-section">
                <h4>Current Timer Settings</h4>
                <p>Default: ${defaultSeconds} seconds</p>
                
                <div class="current-settings">
                    <div class="settings-header">
                        <h5>Quiz-Specific Settings:</h5>
                                            <div class="settings-actions">
                        <label class="checkbox-label">
                            <input type="checkbox" id="select-all-timers">
                            <span>Select All</span>
                        </label>
                        <button id="clear-selected" class="action-button danger-btn">Clear Selected</button>
                        <button id="clear-all" class="action-button danger-btn">Clear All</button>
                    </div>
                    </div>
                    <div id="quiz-timers-list">
                        ${this.generateQuizTimersList(quizTimers)}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = defaultSettingsHTML;

        // Set up event listeners
        const defaultTimerInput = container.querySelector('#default-timer');
        const saveDefaultBtn = container.querySelector('.save-default-btn');
        const quizSelect = container.querySelector('#quiz-select');
        const quizTimerInput = container.querySelector('#quiz-timer');
        const setTimerBtn = container.querySelector('#set-timer-btn');
        const resetDefaultBtn = container.querySelector('#reset-default-btn');
        const selectAllCheckbox = container.querySelector('#select-all-timers');
        const clearSelectedBtn = container.querySelector('#clear-selected');
        const clearAllBtn = container.querySelector('#clear-all');

        // Save default timer setting
        saveDefaultBtn.addEventListener('click', async () => {
            const seconds = parseInt(defaultTimerInput.value, 10);
            if (isNaN(seconds) || seconds < 0 || seconds > 300) {
                this.showInfo('Please enter a valid number between 0 and 300', 'error');
                return;
            }
            try {
                const response = await this.apiService.updateQuizTimerSettings(seconds);
                if (response.success) {
                    // Update local timer settings with the response data
                    this.timerSettings = response.data;
                    
                    // Update localStorage to maintain synchronization with quiz pages
                    localStorage.setItem('quizTimerValue', seconds.toString());
                    localStorage.setItem('quizTimerSettings', JSON.stringify(response.data));
                    
                    // Re-display the timer settings to reflect the change
                    this.displayTimerSettings();
                    this.showInfo(`Default timer set to ${seconds} seconds${seconds === 0 ? ' (timer disabled)' : ''}`);
                } else {
                    throw new Error(response.message || 'Failed to save default timer');
                }
            } catch (error) {
                console.error('Failed to save default timer:', error);
                this.showInfo(`Failed to save default timer: ${error.message}`, 'error');
            }
        });

        // Update quiz timer input when a quiz is selected
        quizSelect.addEventListener('change', () => {
            const selectedQuiz = quizSelect.value;
            if (selectedQuiz) {
                // Only populate if this quiz has a specific timer setting
                if (quizTimers[selectedQuiz] !== undefined) {
                    quizTimerInput.value = quizTimers[selectedQuiz];
                    quizTimerInput.placeholder = `Current: ${quizTimers[selectedQuiz]}s (overriding default)`;
            } else {
                    quizTimerInput.value = '';
                    quizTimerInput.placeholder = `Leave empty for default (${defaultSeconds}s)`;
                }
            } else {
                // Clear input when no quiz is selected
                quizTimerInput.value = '';
                quizTimerInput.placeholder = `Leave empty for default (${defaultSeconds}s)`;
            }
        });

        // Set timer for specific quiz
        setTimerBtn.addEventListener('click', async () => {
            const selectedQuiz = quizSelect.value;
            if (!selectedQuiz) {
                this.showInfo('Please select a quiz', 'error');
                return;
            }
            
            const inputValue = quizTimerInput.value.trim();
            if (!inputValue) {
                this.showInfo('Please enter a timer value', 'error');
                return;
            }
            
            const seconds = parseInt(inputValue, 10);
            if (isNaN(seconds) || seconds < 0 || seconds > 300) {
                this.showInfo('Please enter a valid number between 0 and 300', 'error');
                return;
            }
            try {
                console.log(`[Timer Debug] Setting timer for quiz: "${selectedQuiz}" to ${seconds} seconds`);
                const response = await this.apiService.updateSingleQuizTimer(selectedQuiz, seconds);
                console.log(`[Timer Debug] Response from updateSingleQuizTimer:`, response);
                
                if (response.success) {
                    // Update local timer settings
                    this.timerSettings = response.data;
                    
                    // Update localStorage to maintain synchronization with quiz pages
                    localStorage.setItem('quizTimerSettings', JSON.stringify(response.data));
                    
                    console.log(`[Timer Debug] Updated timerSettings:`, this.timerSettings);
                    console.log(`[Timer Debug] Quiz timers object:`, this.timerSettings.quizTimers);
                    
                    // Refresh the entire timer settings display
                    this.displayTimerSettings();
                    
                    this.showInfo(`Timer for ${this.formatQuizName(selectedQuiz)} set to ${seconds} seconds${seconds === 0 ? ' (timer disabled)' : ''}`);
                } else {
                    throw new Error(response.message || 'Failed to set quiz timer');
                }
            } catch (error) {
                console.error('Failed to set quiz timer:', error);
                this.showInfo(`Failed to set quiz timer: ${error.message}`, 'error');
            }
        });

        // Reset quiz timer to default
        resetDefaultBtn.addEventListener('click', async () => {
            const selectedQuiz = quizSelect.value;
            if (!selectedQuiz) {
                this.showInfo('Please select a quiz', 'error');
                return;
            }
            
            try {
                // Use apiService to reset the timer
                const response = await this.apiService.resetQuizTimer(selectedQuiz);
                
                if (response.success) {
                    // Update local data
                    this.timerSettings = response.data;
                    
                    // Clear input field (since it's now using default)
                    quizTimerInput.value = '';
                    quizTimerInput.placeholder = `Leave empty for default (${this.timerSettings.defaultSeconds}s)`;
                    
                    // Show success message
                    this.showInfo(`Timer for ${selectedQuiz} reset to default (${this.timerSettings.defaultSeconds} seconds)`);
                    
                    // Refresh the current settings display
                    const timersList = container.querySelector('#quiz-timers-list');
                    if (timersList) {
                        timersList.innerHTML = this.generateQuizTimersList(this.timerSettings.quizTimers);
                    }
                } else {
                    throw new Error(response.message || 'Failed to reset quiz timer');
                }
            } catch (error) {
                console.error('Failed to reset quiz timer:', error);
                this.showInfo(`Failed to reset quiz timer: ${error.message}`, 'error');
            }
        });

        // Select all timers functionality
        selectAllCheckbox.addEventListener('change', () => {
            const checkboxes = container.querySelectorAll('.timer-checkbox');
            checkboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
        });

        // Clear selected timer settings
        clearSelectedBtn.addEventListener('click', async () => {
            const selectedQuizzes = Array.from(container.querySelectorAll('.timer-checkbox:checked'))
                .map(cb => cb.dataset.quiz);
            
            if (selectedQuizzes.length === 0) {
                this.showInfo('Please select at least one quiz', 'error');
                return;
            }

            if (confirm(`Are you sure you want to clear timer settings for ${selectedQuizzes.length} selected quizzes?`)) {
                try {
                    const successfulResets = [];
                    const failedResets = [];
                    
                    // Process one quiz at a time
                    for (const quiz of selectedQuizzes) {
                        try {
                            const response = await this.apiService.resetQuizTimer(quiz);
                            if (response.success) {
                                successfulResets.push(quiz);
                            } else {
                                failedResets.push(quiz);
                            }
                        } catch (error) {
                            console.error(`Failed to reset timer for quiz ${quiz}:`, error);
                            failedResets.push(quiz);
                        }
                    }
                    
                    // Update local timer settings from the last response if available
                    if (successfulResets.length > 0) {
                        // Get the latest timer settings
                        const settingsResponse = await this.apiService.getQuizTimerSettings();
                        if (settingsResponse.success) {
                            this.timerSettings = settingsResponse.data;
                        }
                    }
                    
                    // Show appropriate message
                    if (successfulResets.length > 0) {
                        this.showInfo(`Cleared timer settings for ${successfulResets.length} quizzes`);
                        
                        // If some failed, also show warning
                        if (failedResets.length > 0) {
                            this.showInfo(`Failed to clear settings for ${failedResets.length} quizzes`, 'warning');
                        }
                    } else {
                        this.showInfo('Failed to clear any timer settings', 'error');
                    }
                    
                    // Refresh the current settings display
                    const timersList = container.querySelector('#quiz-timers-list');
                    if (timersList) {
                        timersList.innerHTML = this.generateQuizTimersList(this.timerSettings.quizTimers);
                    }
                } catch (error) {
                    console.error('Failed to clear selected timer settings:', error);
                    this.showInfo(`Failed to clear timer settings: ${error.message}`, 'error');
                }
            }
        });

        // Clear all timer settings
        clearAllBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear ALL quiz-specific timer settings?')) {
                try {
                    // Get the current list of quizzes with custom timers
                    const quizzes = Object.keys(this.timerSettings?.quizTimers || {});
                    
                    if (quizzes.length === 0) {
                        this.showInfo('No custom timer settings to clear', 'info');
                        return;
                    }
                    
                    const successfulResets = [];
                    const failedResets = [];
                    
                    // Process each quiz
                    for (const quiz of quizzes) {
                        try {
                            const response = await this.apiService.resetQuizTimer(quiz);
                            if (response.success) {
                                successfulResets.push(quiz);
                                
                                // Update local settings after each successful reset
                                this.timerSettings = response.data;
                            } else {
                                failedResets.push(quiz);
                            }
                        } catch (error) {
                            console.error(`Failed to reset timer for quiz ${quiz}:`, error);
                            failedResets.push(quiz);
                        }
                    }
                    
                    // Show appropriate message
                    if (successfulResets.length > 0) {
                        this.showInfo(`Cleared timer settings for ${successfulResets.length} quizzes`);
                        
                        // If some failed, also show warning
                        if (failedResets.length > 0) {
                            this.showInfo(`Failed to clear settings for ${failedResets.length} quizzes`, 'warning');
                        }
                    } else if (failedResets.length > 0) {
                        this.showInfo('Failed to clear any timer settings', 'error');
                    } else {
                        this.showInfo('No timer settings to clear', 'info');
                    }
                    
                    // Refresh the current settings display
                    const timersList = container.querySelector('#quiz-timers-list');
                    if (timersList) {
                        timersList.innerHTML = this.generateQuizTimersList(this.timerSettings.quizTimers);
                    }
                } catch (error) {
                    console.error('Failed to clear all timer settings:', error);
                    this.showInfo(`Failed to clear all timer settings: ${error.message}`, 'error');
                }
            }
        });
    }
    
    // Helper method to generate HTML for the list of quiz-specific timer settings
    generateQuizTimersList(quizTimers) {
        console.log(`[Timer Debug] generateQuizTimersList called with:`, quizTimers);
        const quizTimerEntries = Object.entries(quizTimers || {});
        console.log(`[Timer Debug] Quiz timer entries:`, quizTimerEntries);
        
        if (quizTimerEntries.length === 0) {
            console.log(`[Timer Debug] No quiz timer entries found, returning no-settings message`);
            return '<p class="no-custom-timers">No quiz-specific settings configured yet.</p>';
        }
        
        // Sort entries by quiz name
        quizTimerEntries.sort((a, b) => this.formatQuizName(a[0]).localeCompare(this.formatQuizName(b[0])));
        
        console.log(`[Timer Debug] Sorted quiz timer entries:`, quizTimerEntries);
        
        return `
            <table class="timer-table">
                <thead>
                    <tr>
                        <th style="width: 40px;"></th>
                        <th>Quiz</th>
                        <th>Timer Setting</th>
                    </tr>
                </thead>
                <tbody>
                    ${quizTimerEntries.map(([quizName, seconds]) => {
                        console.log(`[Timer Debug] Generating row for quiz: "${quizName}" with ${seconds} seconds`);
                        return `
                        <tr>
                            <td>
                                <input type="checkbox" class="timer-checkbox" data-quiz="${quizName}">
                            </td>
                            <td>${this.formatQuizName(quizName)}</td>
                            <td>${seconds === 0 ? 'Disabled' : `${seconds} seconds`}</td>
                        </tr>
                    `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }
    
    // Helper method to show info messages (neutral)
    showInfo(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Set icon based on type
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';

        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${icon} toast-icon"></i>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close" aria-label="Close notification">&times;</button>
        `;

        // Add to container
        toastContainer.appendChild(toast);

        // Add event listener to close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('hiding');
                setTimeout(() => toast.remove(), 300);
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

        // Use all quizzes from QUIZ_CATEGORIES for the form
        const allQuizzes = Object.values(QUIZ_CATEGORIES).flat();
        renderForm(allQuizzes);

        // Function to render the form with quiz types
        function renderForm(quizTypes) {
            // Sort quiz types by category for better organization
            const categorizedQuizzes = window.adminDashboard.categorizeQuizzesForForm(quizTypes);

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
                                                            <span>${window.adminDashboard.formatQuizName(quiz)}</span>
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

                    window.adminDashboard.updateSelectAllCheckbox();
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
                    window.adminDashboard.updateSelectAllCheckbox();
                });
            });

            // For the form submission
            const createAccountForm = document.getElementById('createInterviewForm');
            if (createAccountForm) {
                createAccountForm.addEventListener('submit', window.adminDashboard.handleCreateAccount.bind(window.adminDashboard));
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
        }
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
            console.warn('Quiz types fetch timeout after 10 seconds - using fallback for scenarios');
            renderScenarios(this.getHardcodedQuizTypes());
        }, 10000); // Increased timeout to 10 seconds
        
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
            
            // console.log(`Successfully loaded ${quizTypes.length} quiz types for scenarios list`);
            
            // Create matching structure to standard admin page
            scenariosList.innerHTML = `
                <div class="scenarios-wrapper">
                    <p class="scenarios-intro">Select a quiz type to view its scenarios:</p>
                    <div class="scenario-categories"></div>
                </div>
            `;
            
            const categoriesContainer = scenariosList.querySelector('.scenario-categories');
            
            // Use QUIZ_CATEGORIES from quiz-list.js for consistent categorization
            const categories = { ...QUIZ_CATEGORIES };
            
            // Initialize categories with empty arrays for any missing quizzes
            const uncategorizedQuizzes = [];
            
            // Check which quizzes are not in any category
            quizTypes.forEach(quiz => {
                let found = false;
                for (const [categoryName, categoryQuizzes] of Object.entries(categories)) {
                    if (categoryQuizzes.includes(quiz)) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    uncategorizedQuizzes.push(quiz);
                }
            });
            
            // Add uncategorized quizzes to an "Other Quizzes" category if they exist
            if (uncategorizedQuizzes.length > 0) {
                categories['Other Quizzes'] = uncategorizedQuizzes;
            }
            
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
                    
                    // Add event listener to button with debouncing to prevent multiple clicks
                    viewButton.addEventListener('click', async (e) => {
                        e.preventDefault();
                        
                        // Prevent multiple rapid clicks
                        if (viewButton.disabled) return;
                        viewButton.disabled = true;
                        viewButton.textContent = 'Loading...';
                        
                        try {
                            await this.showQuizScenarios(quiz);
                        } catch (error) {
                            console.error('Error showing quiz scenarios:', error);
                        } finally {
                            // Re-enable button after a short delay
                            setTimeout(() => {
                                viewButton.disabled = false;
                                viewButton.textContent = 'View Scenarios';
                            }, 1000);
                        }
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

    // Legacy categorizeQuiz method - now uses QUIZ_CATEGORIES for consistency
    categorizeQuiz(quizName) {
        // First check if the quiz exists in QUIZ_CATEGORIES
        for (const [categoryName, categoryQuizzes] of Object.entries(QUIZ_CATEGORIES)) {
            if (categoryQuizzes.includes(quizName)) {
                return categoryName;
            }
        }
        
        // Fallback logic for quizzes not in QUIZ_CATEGORIES
        if (quizName === 'automation-interview') {
            return 'Interview Preparation';
        }
        
        const lowerName = quizName.toLowerCase();
        
        if (['automation', 'api', 'script', 'script-metrics', 'technical', 'accessibility', 'performance', 'security', 'mobile'].includes(lowerName)) {
            return 'Technical Testing';
        }
        
        if (['communication', 'soft-skills'].includes(lowerName)) {
            return 'Core QA Skills';
        }
        
        if (['general', 'process', 'uat', 'test-process'].includes(lowerName)) {
            return 'Project Management';
        }
        
        if (['cms', 'cms-testing', 'content', 'email', 'email-testing'].includes(lowerName)) {
            return 'Content Testing';
        }
        
        if (['documentation', 'tools'].includes(lowerName)) {
            return 'Technical Testing';
        }
        
        if (['interview'].includes(lowerName)) {
            return 'Interview Preparation';
        }
        
        return 'Other Quizzes';
    }

    // Implement a hardcoded fetchQuizTypes method that handles API failures gracefully
    async fetchQuizTypes() {
        try {
            console.log('Fetching quiz types from API...');
            // Use the correct API endpoint without /api prefix since it's handled by fetchWithAdminAuth
            const response = await this.apiService.fetchWithAdminAuth('admin/quiz-types');
            
            // Check if the response is successful and has data
            if (response.success && response.data) {
                console.log('Successfully fetched quiz types:', response.data);
                return response.data;
            } else {
                console.warn('Quiz types response was not successful:', response);
                throw new Error(response.message || 'Failed to fetch quiz types');
            }
        } catch (error) {
            console.error('Error fetching quiz types:', error);
            // Fallback to hardcoded quiz types if API fails
            console.log('Using hardcoded quiz types as fallback');
            return this.getHardcodedQuizTypes();
        }
    }

    // Helper method to provide hardcoded quiz types
    getHardcodedQuizTypes() {
        return [
            'cms-testing',
            'reports',
            'raising-tickets'
        ];
    }

    // Add fetchQuizScenarios method to match the parent class
    async fetchQuizScenarios(quizName) {
        const normalizedQuizName = quizName.toLowerCase();
        
        // Convert quiz name to match the file naming convention
        let fileName = normalizedQuizName;
        if (fileName === 'tester-mindset') fileName = 'testerMindset';
        if (fileName === 'time-management') fileName = 'timeManagement';
        if (fileName === 'risk-analysis') fileName = 'riskAnalysis';
        if (fileName === 'risk-management') fileName = 'riskManagement';
        if (fileName === 'non-functional') fileName = 'nonFunctional';
        if (fileName === 'issue-verification') fileName = 'issueVerification';
        if (fileName === 'issue-tracking-tools') fileName = 'issueTracking';
        if (fileName === 'raising-tickets') fileName = 'raisingTickets';
        if (fileName === 'cms-testing') fileName = 'cms-testing';
        if (fileName === 'email-testing') fileName = 'emailTesting';
        if (fileName === 'content-copy') fileName = 'contentCopy';
        if (fileName === 'reports') fileName = 'reports';
        if (fileName === 'automation-interview') fileName = 'automationInterview';
        if (fileName === 'functional-interview') fileName = 'functionalInterview';
        if (fileName === 'standard-script-testing') fileName = 'standardScript';
        if (fileName === 'fully-scripted') fileName = 'fullyScripted';
        if (fileName === 'script-metrics-troubleshooting') fileName = 'scriptMetrics';
        if (fileName === 'locale-testing') fileName = 'localeTesting';
        if (fileName === 'build-verification') fileName = 'buildVerification';
        if (fileName === 'test-types-tricks') fileName = 'testTypes';
        if (fileName === 'test-support') fileName = 'testSupport';
        if (fileName === 'sanity-smoke') fileName = 'sanitySmoke';
        
        try {
            // Try to load the scenarios from the JS file directly
            const module = await import(`./data/${fileName}-scenarios.js`);
            
            // Create a mapping of quiz names to their actual export names
            const exportNameMap = {
                'automation-interview': 'automationInterviewScenarios',
                'build-verification': 'buildVerificationScenarios',
                'cms-testing': 'CMSTestingScenarios',
                'communication': 'communicationScenarios',
                'content-copy': 'contentCopyScenarios',
                'email-testing': 'emailTestingScenarios',
                'exploratory': 'exploratoryTestingScenarios',
                'fully-scripted': 'fullyScriptedScenarios',
                'functional-interview': 'functionalInterviewScenarios',
                'initiative': 'initiativeScenarios',
                'issue-tracking-tools': 'issueTrackingScenarios',
                'issue-verification': 'issueVerificationScenarios',
                'locale-testing': 'localeTestingScenarios',
                'non-functional': 'nonFunctionalScenarios',
                'raising-tickets': 'raisingTicketsScenarios',
                'reports': 'reportsScenarios',
                'risk-analysis': 'riskAnalysisScenarios',
                'risk-management': 'riskManagementScenarios',
                'sanity-smoke': 'sanitySmokeScenarios',
                'script-metrics-troubleshooting': 'scriptMetricsScenarios',
                'standard-script-testing': 'standardScriptScenarios',
                'test-support': 'testSupportScenarios',
                'test-types-tricks': 'testTypesScenarios',
                'tester-mindset': 'testerMindsetScenarios',
                'time-management': 'timeManagementScenarios'
            };

            // Try different possible export names based on the file naming pattern
            const possibleExportNames = [
                // Try the mapped export name first
                exportNameMap[normalizedQuizName],
                exportNameMap[fileName],
                // Fallback to constructed names
                `${fileName}Scenarios`,
                'scenarios', 
                'default',
                // Try camelCase variations
                fileName.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) + 'Scenarios',
                // Try without hyphens
                fileName.replace(/-/g, '') + 'Scenarios',
            ].filter(Boolean);
            
            let scenarios = null;
            for (const exportName of possibleExportNames) {
                if (module[exportName]) {
                    scenarios = module[exportName];
                    break;
                }
            }
            
            if (scenarios && (scenarios.basic || scenarios.intermediate || scenarios.advanced)) {
                // console.log(`Successfully loaded scenarios for ${quizName} from ${fileName}-scenarios.js`);
                return scenarios;
            } else {
                console.error(`Available exports in ${fileName}-scenarios.js:`, Object.keys(module));
                throw new Error(`Invalid scenarios format in ${fileName}-scenarios.js. Found exports: ${Object.keys(module).join(', ')}`);
            }
        } catch (importError) {
            console.error(`Failed to load scenarios from JS file for ${quizName}:`, importError);
            throw new Error(`Scenario file not found or has invalid format for ${this.formatQuizName(quizName)}. Expected file: ${fileName}-scenarios.js`);
        }
    }

    // Simplified showQuizScenarios method to handle scenarios from JS files
    async showQuizScenarios(quizName) {
        // Check if there's already a modal open
        const existingOverlay = document.querySelector('.user-details-overlay, .modal-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        try {
            // Show loading indicator
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'modal-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-container">
                    <h3>Loading Scenarios for ${this.formatQuizName(quizName)}...</h3>
                    <div class="loading-spinner"></div>
                    <p>Please wait...</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);

            // Fetch quiz scenarios
            let scenarios;
            try {
                scenarios = await this.fetchQuizScenarios(quizName);
                
                // Validate scenarios structure
                if (!scenarios || (!scenarios.basic && !scenarios.intermediate && !scenarios.advanced)) {
                    throw new Error(`No valid scenarios found for ${this.formatQuizName(quizName)}`);
                }
                
            } catch (fetchError) {
                console.error(`Error fetching scenarios for ${quizName}:`, fetchError);
                
                // Show error message
                loadingOverlay.innerHTML = `
                    <div class="loading-container">
                        <h3 style="color: #dc3545;">Error Loading Scenarios</h3>
                        <p>${fetchError.message}</p>
                        <div style="margin-top: 1rem; display: flex; gap: 10px; justify-content: center;">
                            <button onclick="this.closest('.modal-overlay').remove()" 
                                    style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                                Close
                            </button>
                        </div>
                    </div>
                `;
                return;
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
                        <p>No scenarios found.</p>
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
        // Inline style block for quick visual improvement
        const style = `
        <style>
        .scenario-card {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.07);
            margin-bottom: 2rem;
            padding: 1.5rem 2rem;
            transition: box-shadow 0.2s;
            border-left: 6px solid #007bff;
        }
        .scenario-card h4 {
            margin-top: 0;
            margin-bottom: 0.5rem;
            color: #007bff;
        }
        .scenario-description {
            margin-bottom: 1rem;
            color: #444;
        }
        .scenario-options {
            margin-top: 1rem;
        }
        .options-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .option-item {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            background: #f8f9fa;
            border-radius: 5px;
            margin-bottom: 0.75rem;
            padding: 0.75rem 1rem;
            border-left: 4px solid #adb5bd;
            transition: background 0.2s, border-color 0.2s;
        }
        .option-item.correct-option {
            background: #e6f9ed;
            border-color: #28a745;
        }
        .option-item.incorrect-option {
            background: #fbeaea;
            border-color: #dc3545;
        }
        .option-icon {
            font-size: 1.2em;
            margin-right: 0.5em;
            flex-shrink: 0;
        }
        .option-item .option-text {
            font-weight: 500;
        }
        .option-outcome {
            font-size: 0.95em;
            color: #555;
            margin-top: 0.25em;
        }
        </style>
        `;
        return style + scenarios.map(scenario => {
            return `
            <div class="scenario-card" tabindex="0" aria-label="Scenario: ${scenario.title || 'Untitled Scenario'}">
                <h4>${scenario.title || 'Untitled Scenario'}</h4>
