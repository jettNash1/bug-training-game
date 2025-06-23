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
            this.lastScheduleCheck = 0;
            const MIN_CHECK_INTERVAL = 30000; // 30 seconds minimum between checks
            
            // Setup interval to check for scheduled resets that need processing
            this.scheduleCheckInterval = setInterval(() => {
                const now = Date.now();
                // Only check if enough time has passed since the last check
                if (now - this.lastScheduleCheck >= MIN_CHECK_INTERVAL) {
                    this.lastScheduleCheck = now;
                this.checkScheduledResets().catch(error => {
                    console.error('Error during scheduled resets check:', error);
                });
                }
            }, 60000); // Check every minute
            
            // Do an initial check for scheduled resets
            this.lastScheduleCheck = Date.now();
            this.checkScheduledResets().catch(error => {
                console.error('Error during initial scheduled resets check:', error);
            });
            
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
                this.loadGuideSettings().catch(error => {
                    console.error('Failed to load guide settings, but continuing with other initializations:', error);
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
                    console.log('Menu item clicked:', {
                        sectionId: item.getAttribute('data-section'),
                        buttonText: button.textContent.trim()
                    });
                    
                    // Remove active class from all menu items
                    menuItems.forEach(mi => mi.classList.remove('active'));

                    // Add active class to clicked menu item
                    item.classList.add('active');

                    // Get the section ID from data attribute
                    const sectionId = item.getAttribute('data-section');
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
                });
            }
        });

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

        // Initialize custom export section when Export menu is accessed
        document.querySelector('[data-section="export-section"]')?.addEventListener('click', () => {
            setTimeout(() => this.initializeCustomExport(), 300);
        });

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

        const defaultSeconds = this.timerSettings?.defaultSeconds || 60;
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
                    // Re-display the timer settings to reflect the change
                    this.displayTimerSettings();
                    this.showInfo(`Default timer set to ${seconds} seconds`);
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
                    console.log(`[Timer Debug] Updated timerSettings:`, this.timerSettings);
                    console.log(`[Timer Debug] Quiz timers object:`, this.timerSettings.quizTimers);
                    
                    // Refresh the entire timer settings display
                    this.displayTimerSettings();
                    
                    this.showInfo(`Timer for ${this.formatQuizName(selectedQuiz)} set to ${seconds} seconds`);
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
            'web-testing',
            'mobile-testing',
            'api-testing',
            'accessibility-testing',
            'security-testing',
            'performance-testing',
            'automation-testing',
            'game-testing',
            'localization-testing',
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
            
            // Try different possible export names based on the file naming pattern
            const possibleExportNames = [
                `${fileName}Scenarios`,
                'scenarios', 
                'default',
                // Handle special cases for file naming
                fileName === 'cms-testing' ? 'cmsTestingScenarios' : null,
                fileName === 'test' ? 'testScenarios' : null,
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
                <div class="scenario-description">${scenario.description || 'No description available.'}</div>
                <div class="scenario-options">
                    <strong>Options:</strong>
                    <ul class="options-list">
                        ${scenario.options.map((option, index) => {
                            // Determine correctness
                            let correctness = '';
                            let icon = '';
                            if (option.experience > 0) {
                                correctness = 'correct-option';
                                icon = '<span class="option-icon" aria-label="Correct" style="color:#28a745;">✔️</span>';
                            } else if (option.experience < 0) {
                                correctness = 'incorrect-option';
                                icon = '<span class="option-icon" aria-label="Incorrect" style="color:#dc3545;">❌</span>';
                            } else {
                                icon = '<span class="option-icon" aria-label="Neutral" style="color:#adb5bd;">●</span>';
                            }
                            return `
                                <li class="option-item ${correctness}" tabindex="0" aria-label="Option: ${option.text}">
                                    ${icon}
                                    <div>
                                        <div class="option-text">${option.text}</div>
                                        ${option.outcome ? `<div class="option-outcome"><em>Outcome: ${option.outcome}</em></div>` : ''}
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

    // Override the parent showUserDetails method for a tabbed interface like standard admin
    async fetchAndUpdateQuizScore(username, quizType, quizCard) {
        try {
            console.log(`[Admin] Fetching detailed question history for ${username}/${quizType}`);
            
            // Fetch the detailed question history from the API
            const response = await this.apiService.getQuizQuestions(username, quizType);
            
            if (response.success && response.data && response.data.questionHistory) {
                const questionHistory = response.data.questionHistory;
                
                // Use the same logic as the "View Questions" section to determine correct answers
                // An answer is correct if the status is 'passed'
                const correctAnswers = questionHistory.filter(item => item && item.status === 'passed').length;
                const calculatedScore = Math.round((correctAnswers / questionHistory.length) * 100);
                
                console.log(`[Admin] Successfully calculated score from fetched question history:`, {
                    username,
                    quizType,
                    totalQuestions: questionHistory.length,
                    correctAnswers,
                    calculatedScore,
                    questionStatuses: questionHistory.map(item => ({ status: item.status, passed: item.status === 'passed' }))
                });
                
                // Update the quiz card with the correct score
                const scoreElement = quizCard.querySelector('p:nth-child(2)'); // The "Score: X%" element
                if (scoreElement) {
                    scoreElement.innerHTML = `<strong>Score:</strong> ${calculatedScore}%`;
                }
                
                // Update the card styling based on the new score
                if (calculatedScore >= 80) {
                    quizCard.className = 'quiz-card completed-perfect';
                    quizCard.style.backgroundColor = '#e8f5e9'; // Light green
                } else {
                    quizCard.className = 'quiz-card completed-partial';
                    quizCard.style.backgroundColor = '#fff3e0'; // Light orange
                }
                
                console.log(`[Admin] Updated quiz card for ${username}/${quizType} with score ${calculatedScore}%`);
            } else {
                console.warn(`[Admin] Failed to get question history from API for ${username}/${quizType}:`, response);
            }
        } catch (error) {
            console.error(`[Admin] Error fetching question history for ${username}/${quizType}:`, error);
        }
    }

    async showUserDetails(username) {
        try {
            // Get user data
            const user = this.users.find(u => u.username === username);
            if (!user) {
                throw new Error('User not found');
            }

            // All accounts are now regular accounts using hiddenQuizzes logic
            const hiddenQuizzes = (user.hiddenQuizzes || []).map(q => q.toLowerCase());

            console.log('User details:', {
                username,
                userType: user.userType,
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
                            <div class="info-value">${user.userType === 'admin' ? 'Admin Account' : 'Standard Account'}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Overall Progress:</div>
                            <div class="info-value">${this.calculateQuestionsAnsweredPercent(user).toFixed(1)}%</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Last Active:</div>
                            <div class="info-value">${this.formatDate(this.getLastActiveDate(user))}</div>
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
                    
                    // All accounts now use hiddenQuizzes logic - visible if not hidden
                    const isVisible = !hiddenQuizzes.includes(quizLower);
                    
                    console.log('Quiz visibility details:', {
                        quizName: quizType,
                        quizLower,
                        hiddenQuizzes,
                        inHiddenQuizzes: hiddenQuizzes.includes(quizLower),
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
                    
                    // Calculate score from question history if available
                    let score = 0;
                    const questionHistory = quizResult?.questionHistory || quizProgress?.questionHistory;
                    
                    console.log(`[Admin] Score calculation for ${quizType}:`, {
                        quizResult: quizResult ? 'found' : 'not found',
                        quizProgress: quizProgress ? 'found' : 'not found',
                        questionHistory: questionHistory ? `array of ${questionHistory.length}` : 'not found',
                        questionsAnswered
                    });
                    
                    if (questionHistory && Array.isArray(questionHistory) && questionHistory.length > 0) {
                        // Use the same logic as the "View Questions" section - check if status is 'passed'
                        const correctAnswers = questionHistory.filter(item => item && item.status === 'passed').length;
                        score = Math.round((correctAnswers / questionHistory.length) * 100);
                        
                        console.log(`[Admin] Calculated score from question history:`, {
                            totalQuestions: questionHistory.length,
                            correctAnswers,
                            calculatedScore: score,
                            questionStatuses: questionHistory.map(item => ({ status: item.status, passed: item.status === 'passed' }))
                        });
                    } else if (questionsAnswered === 15 && !questionHistory) {
                        // For completed quizzes without question history, we'll fetch it after card creation
                        console.log(`[Admin] Quiz completed but no question history found. Will fetch from API after card creation.`);
                        
                        // For now, show as completed but with unknown score
                        score = 0; // This will be updated when the API call completes
                        console.log(`[Admin] Using temporary score of 0 while fetching question history`);
                    } else {
                        // Fallback to stored score if no question history available
                        const rawScore = quizResult?.score || quizResult?.scorePercentage || 0;
                        score = rawScore < 1 && rawScore > 0 ? Math.round(rawScore * 100) : Math.round(rawScore);
                        
                        console.log(`[Admin] Using fallback score:`, {
                            rawScore,
                            finalScore: score
                        });
                    }
                    const lastActive = quizResult?.completedAt || quizResult?.lastActive || quizProgress?.lastUpdated || 'Never';
                    
                    const status = questionsAnswered === 15 ? 'Completed' : 
                                questionsAnswered > 0 ? 'In Progress' : 
                                'Not Started';
                    
                    // Determine background color based on status and score
                    let backgroundColor = '#f5f5f5'; // Default gray for not started
                    if (questionsAnswered > 0) {
                        if (questionsAnswered === 15) {
                            // All questions completed
                            if (score >= 80) {
                                backgroundColor = '#e8f5e9'; // Light green for 80% or higher
                            } else {
                                backgroundColor = '#fff3e0'; // Light orange for completed but less than 80%
                            }
                        } else {
                            backgroundColor = '#f5f2e8'; // Light beige for in progress
                        }
                    }
                    
                    // Determine quiz status class
                    let statusClass = 'not-started';
                    if (questionsAnswered === 15) {
                        if (score >= 80) {
                            statusClass = 'completed-perfect'; // 80% or higher score
                        } else {
                            statusClass = 'completed-partial'; // Completed but less than 80%
                        }
                    } else if (questionsAnswered > 0) {
                        statusClass = 'in-progress';
                    }
                    
                    // Create quiz card
                    const quizCard = document.createElement('div');
                    quizCard.className = `quiz-card ${statusClass}`;
                    quizCard.style.backgroundColor = backgroundColor;
                    quizCard.innerHTML = `
                        <h3>${this.formatQuizName(quizType)}</h3>
                        <div class="quiz-stats">
                            <p><strong>Status:</strong> ${status}</p>
                            <p><strong>Score:</strong> ${score}%</p>
                            <p><strong>Questions Answered:</strong> ${questionsAnswered}/15</p>
                            <p><strong>Last Active:</strong> ${this.formatDate(lastActive)}</p>
                            <div class="visibility-control">
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
                    
                    // If we need to fetch score data asynchronously, do it after adding to DOM
                    if (questionsAnswered === 15 && !questionHistory && score === 0) {
                        console.log(`[Admin] Triggering async score fetch for ${username}/${quizType}`);
                        // Now we can safely call fetchAndUpdateQuizScore with the created quizCard
                        this.fetchAndUpdateQuizScore(username, quizType, quizCard).catch(error => {
                            console.warn(`[Admin] Failed to fetch question history for ${username}/${quizType}:`, error);
                        });
                    }
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
                    console.log(`Quiz name details:`, {
                        originalQuizName: quizName,
                        lowercaseQuizName: quizName.toLowerCase(),
                        currentHiddenQuizzes: hiddenQuizzes,
                        isCurrentlyInHidden: hiddenQuizzes.includes(quizName.toLowerCase())
                    });
                    
                    try {
                        await this.apiService.updateQuizVisibility(username, quizName, isVisible);
                        
                        // Create success message overlay that doesn't interfere with current view
                        const messageOverlay = document.createElement('div');
                        messageOverlay.className = 'message-overlay success-message';
                        messageOverlay.style.cssText = `
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            background: #d4edda;
                            color: #155724;
                            border: 1px solid #c3e6cb;
                            padding: 15px 20px;
                            border-radius: 8px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                            z-index: 2000;
                            max-width: 300px;
                            opacity: 0;
                            transform: translateX(100%);
                            transition: all 0.3s ease-in-out;
                        `;
                        messageOverlay.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-check-circle" style="font-size: 18px;"></i>
                                <span>Updated visibility for ${this.formatQuizName(quizName)}</span>
                            </div>
                        `;
                        document.body.appendChild(messageOverlay);
                        
                        // Animate in
                        setTimeout(() => {
                            messageOverlay.style.opacity = '1';
                            messageOverlay.style.transform = 'translateX(0)';
                        }, 10);
                        
                        // Update local data without closing overlay
                        await this.loadUsers();
                        
                        // Remove the message after 3 seconds
                        setTimeout(() => {
                            messageOverlay.style.opacity = '0';
                            messageOverlay.style.transform = 'translateX(100%)';
                            setTimeout(() => messageOverlay.remove(), 300);
                        }, 3000);
                    } catch (error) {
                        console.error('Failed to update quiz visibility:', error);
                        
                        // Create error message overlay
                        const errorOverlay = document.createElement('div');
                        errorOverlay.className = 'error-overlay';
                        errorOverlay.style.cssText = `
                            position: fixed;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            background: white;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                            z-index: 2000;
                            text-align: center;
                        `;
                        errorOverlay.innerHTML = `
                            <div style="color: #dc3545; margin-bottom: 10px;">
                                <i class="fas fa-exclamation-circle" style="font-size: 24px;"></i>
                            </div>
                            <p style="margin: 0;">Failed to update visibility for ${this.formatQuizName(quizName)}</p>
                            <button class="close-error-btn" style="
                                margin-top: 15px;
                                padding: 8px 16px;
                                background: #6c757d;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;">
                                Close
                            </button>
                        `;
                        document.body.appendChild(errorOverlay);
                        
                        // Add event listener for close button
                        errorOverlay.querySelector('.close-error-btn').addEventListener('click', () => {
                            errorOverlay.remove();
                        });
                        
                        // Revert the checkbox
                        e.target.checked = !isVisible;
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
                            this.updateUsersList();
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
                            // Prompt the admin for a new password
                            let newPassword = '';
                            let confirmPassword = '';
                            while (true) {
                                newPassword = prompt('Enter the new password for ' + username + ' (min 6 characters):', '');
                                if (newPassword === null) return; // Cancelled
                                if (newPassword.length < 6) {
                                    alert('Password must be at least 6 characters.');
                                    continue;
                                }
                                confirmPassword = prompt('Confirm the new password:', '');
                                if (confirmPassword === null) return; // Cancelled
                                if (newPassword !== confirmPassword) {
                                    alert('Passwords do not match. Please try again.');
                                    continue;
                                }
                                break;
                            }
                            // Use this.apiService instead of creating a new instance
                            const response = await this.apiService.resetUserPassword(username, newPassword);
                            if (response.success !== false) {
                                this.showSuccess(`Password reset for ${username}.`);
                                console.log('Password reset successful:', response);
                            } else {
                                throw new Error(response.message || 'Failed to reset password');
                            }
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
                            await this.deleteUserAccount(username);
                            overlay.remove();
                            this.showSuccess(`Account deleted for ${username}`);
                            await this.loadUsers();
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
                'locale-testing', 'script-metrics-troubleshooting','standard-script-testing',
                'test-types-tricks', 'automation-interview', 'fully-scripted', 'exploratory',
                'sanity-smoke', 'functional-interview'
            ];
        }

        // Build a set for quick lookup
        const quizTypeSet = new Set(quizTypes.map(q => q.toLowerCase()));
        const categorized = {};
        // 1. Add categories and quizzes in QUIZ_CATEGORIES order
        Object.entries(QUIZ_CATEGORIES).forEach(([category, quizzes]) => {
            const filtered = quizzes.filter(q => quizTypeSet.has(q.toLowerCase()));
            if (filtered.length > 0) {
                categorized[category] = filtered;
            }
        });
        // 2. Find any quizzes not in QUIZ_CATEGORIES
        const allCategoryQuizzes = new Set(Object.values(QUIZ_CATEGORIES).flat().map(q => q.toLowerCase()));
        const otherQuizzes = quizTypes.filter(q => !allCategoryQuizzes.has(q.toLowerCase()));
        if (otherQuizzes.length > 0) {
            categorized['Other'] = otherQuizzes;
        }
        return categorized;
    }

    // Implement resetAllProgress to match the method name used in the showUserDetails method
    async resetAllProgress(username) {
        try {
            let successCount = 0;
            let failureCount = 0;

            // Show a visible loading overlay
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-modal-overlay';
            loadingOverlay.style.cssText = `
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                width: 100vw; height: 100vh;
                background: rgba(0,0,0,0.4);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: all;
            `;
            loadingOverlay.innerHTML = `
                <div style="background: white; padding: 2rem; border-radius: 8px; text-align: center; max-width: 400px; margin: 100px auto; box-shadow: 0 4px 24px rgba(0,0,0,0.2);">
                    <div class="loading-spinner" style="margin-bottom: 1rem;"></div>
                    <h3>Resetting all quiz progress for ${username}...</h3>
                    <p>Please wait while all quizzes are being reset.</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);

            // Reset each quiz individually
            for (const quizType of this.quizTypes) {
                try {
                    const response = await this.apiService.resetQuizProgress(username, quizType);
                    if (response.success) {
                        successCount++;
                    } else {
                        failureCount++;
                        console.warn(`Failed to reset ${quizType} for ${username}:`, response.message);
                    }
                } catch (quizError) {
                    failureCount++;
                    console.error(`Error resetting ${quizType} for ${username}:`, quizError);
                }
            }

            // Remove loading overlay
            loadingOverlay.remove();

            // Remove any lingering error overlays
            document.querySelectorAll('.modal-overlay').forEach(overlay => {
                if (overlay !== loadingOverlay) overlay.remove();
            });

            // Show final status
            if (successCount === 0) {
                this.showError(`Failed to reset any quiz progress for ${username}`);
                throw new Error(`Failed to reset any quiz progress for ${username}`);
            } else if (failureCount > 0) {
                this.showInfo(`Partially reset progress for ${username}. ${successCount} quizzes reset, ${failureCount} failed.`, 'warning');
            } else {
                this.showSuccess(`Successfully reset all quiz progress for ${username}`);
            }

            // Refresh the user list and UI
            await this.updateUsersList();

            return { success: true, message: 'Reset operation completed' };
        } catch (error) {
            // Remove loading overlay if present
            const overlay = document.querySelector('.loading-modal-overlay');
            if (overlay) overlay.remove();
            console.error('Error resetting user progress:', error);
            throw error;
        }
    }

    // Implement resetQuizProgress for individual quiz reset functionality
    async resetQuizProgress(username, quizType) {
        try {
            // Use apiService instead of direct fetch
            const response = await this.apiService.resetQuizProgress(username, quizType);

            if (!response.success) {
                throw new Error(response.message || 'Failed to reset quiz progress');
            }

            return response;
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
                const apiService = this.apiService;
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
                            correctAnswer = item.correctAnswer.text;
                        } else if (!isPassed && item.selectedAnswer?.outcome) {
                            const outcomeText = item.selectedAnswer.outcome;
                            const match = outcomeText.match(/The correct answer was: "([^"]+)"/);
                            if (match && match[1]) {
                                correctAnswer = match[1];
                            } else {
                                correctAnswer = item.selectedAnswer?.tool || 'Correct answer not available';
                            }
                        } else if (isPassed) {
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
                    const rawQuizScore = response.data.score || 0;
                    // Ensure score is displayed as percentage (convert if it's in decimal format)
                    const quizScore = rawQuizScore < 1 && rawQuizScore > 0 ? Math.round(rawQuizScore * 100) : Math.round(rawQuizScore);
                    const quizStatus = questionsAnswered >= 15 ? 'Completed' : (questionsAnswered > 0 ? 'In Progress' : 'Not Started');
                    
                    console.log('Mapped question history:', questionHistory);
                    console.log('Questions answered:', questionsAnswered);
                    console.log('Quiz status:', quizStatus);
                    
                    // Create overlay container
            const overlay = document.createElement('div');
            overlay.className = 'user-details-overlay';
                    overlay.style.zIndex = '1002';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
                    overlay.setAttribute('aria-labelledby', 'questions-details-title');
            
            // Create content container
            const content = document.createElement('div');
            content.className = 'user-details-content';
            
                    // Determine if we should show the questions table or the "no questions" message
                    const hasCompletedQuestions = questionHistory.length > 0;
                    
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
                            .details-header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                margin-bottom: 20px;
                            }
                            .close-btn {
                                background: none;
                                border: none;
                                font-size: 24px;
                                cursor: pointer;
                                padding: 5px;
                                color: #666;
                            }
                            .close-btn:hover {
                                color: #333;
                            }
                            .quiz-summary {
                                margin-bottom: 20px;
                                padding: 15px;
                                background-color: #f8f9fa;
                                border-radius: 4px;
                            }
                            .quiz-summary p {
                                margin: 5px 0;
                            }
                        </style>
                        <div class="details-header">
                            <h3 id="questions-details-title">Quiz Questions for ${username} - ${quizType}</h3>
                            <button class="close-btn" aria-label="Close questions view" tabindex="0">×</button>
                    </div>
                        <div class="quiz-summary">
                            <p><strong>Status:</strong> ${quizStatus}</p>
                            <p><strong>Questions Answered:</strong> ${questionsAnswered}</p>
                            <p><strong>Score:</strong> ${quizScore}%</p>
                        </div>
                        <div class="questions-content">
                            ${!hasCompletedQuestions ? 
                                `<div class="not-attempted">
                                    <p>This user has not attempted any questions in this quiz yet.</p>
                                </div>` : 
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
                                </table>`
                            }
                        </div>
                    `;
                    
            overlay.appendChild(content);
            document.body.appendChild(overlay);
            
                    // Add event listener for closing the overlay
                    const closeBtn = overlay.querySelector('.close-btn');
                    if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                overlay.remove();
            });
                    }
                    
                    // Add keyboard event listener for closing with Escape key
                    const handleEscapeKey = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                            document.removeEventListener('keydown', handleEscapeKey);
                        }
                    };
                    document.addEventListener('keydown', handleEscapeKey);
                    
                    // Focus trap for accessibility
                    const focusableElements = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    const firstFocusableElement = focusableElements[0];
                    const lastFocusableElement = focusableElements[focusableElements.length - 1];
                    
                    if (firstFocusableElement) {
                        firstFocusableElement.focus();
                    }
                    
                    overlay.addEventListener('keydown', (e) => {
                        if (e.key === 'Tab') {
                            if (e.shiftKey) {
                                if (document.activeElement === firstFocusableElement) {
                                    e.preventDefault();
                                    lastFocusableElement.focus();
                                }
                } else {
                                if (document.activeElement === lastFocusableElement) {
                                    e.preventDefault();
                                    firstFocusableElement.focus();
                                }
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching quiz questions:', error);
                this.showError('Failed to load quiz questions. Please try again.');
            }
        } catch (error) {
            console.error('Error showing quiz questions:', error);
            this.showError('Failed to show quiz questions. Please try again.');
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

            // Create array of hidden quizzes and log them
            const hiddenQuizzes = validQuizTypes.filter(quiz => !allowedQuizzes.includes(quiz));
            console.log('Hidden quizzes:', hiddenQuizzes);

            // Log the final request body
            const requestBody = {
                username,
                password,
                userType: 'standard',
                hiddenQuizzes
            };
            console.log('Request body:', requestBody);

            const response = await this.apiService.fetchWithAdminAuth('/api/admin/create-standard-account', {
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
        console.log('Setting up schedule section');
        
        const scheduleForm = document.getElementById('scheduleForm');
        const userSelect = document.getElementById('scheduleUser');
        const quizSelect = document.getElementById('scheduleQuiz');
        const dateInput = document.getElementById('scheduleDate');
        const timeInput = document.getElementById('scheduleTime');
        
        // Add a refresh button to manually refresh scheduled resets
        const scheduledItemsHeader = document.querySelector('.scheduled-items-header');
        if (scheduledItemsHeader) {
            const refreshButton = document.createElement('button');
            refreshButton.className = 'refresh-btn action-button secondary';
            refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            refreshButton.setAttribute('aria-label', 'Refresh scheduled resets');
            refreshButton.addEventListener('click', () => this.refreshScheduleData());
            
            scheduledItemsHeader.appendChild(refreshButton);
        }
        
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
        
        // Also check for any scheduled resets that need to be executed
        this.checkScheduledResets().catch(error => {
            console.error('Error checking scheduled resets during setup:', error);
        });
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
            
            // Create datetime string and preserve the local time exactly as entered
            const resetDateTime = `${resetDate}T${resetTime}:00`;
            
            console.log(`Scheduling reset - Local time entered: ${resetDate} ${resetTime}`);
            
            // Show loading state
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Scheduling...';
            
            // Use the API service to create the schedule
            const response = await this.apiService.createScheduledReset(username, quizName, resetDateTime);
            
            if (response.success) {
                // Reset form
                document.getElementById('scheduleForm').reset();
                
                // Show success message with local time
                this.showSuccess(`Reset scheduled for ${this.formatQuizName(quizName)} at ${resetTime} on ${resetDate}`);
                
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
            
            // Add a button to check for due scheduled resets
            const scheduledItemsHeader = document.querySelector('.scheduled-items-header');
            if (scheduledItemsHeader) {
                // Remove any existing check button first
                const existingCheckBtn = scheduledItemsHeader.querySelector('.check-resets-btn');
                if (existingCheckBtn) {
                    existingCheckBtn.remove();
                }
                
                // Create and add the check button
                const checkButton = document.createElement('button');
                checkButton.className = 'check-resets-btn action-button secondary';
                checkButton.innerHTML = '<i class="fas fa-clock"></i> Check Due Resets';
                checkButton.setAttribute('aria-label', 'Check for due scheduled resets');
                checkButton.addEventListener('click', async () => {
                    try {
                        checkButton.disabled = true;
                        checkButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
                        await this.checkScheduledResets();
                        checkButton.disabled = false;
                        checkButton.innerHTML = '<i class="fas fa-clock"></i> Check Due Resets';
                    } catch (error) {
                        checkButton.disabled = false;
                        checkButton.innerHTML = '<i class="fas fa-clock"></i> Check Due Resets';
                    }
                });
                
                scheduledItemsHeader.appendChild(checkButton);
            }
        } catch (error) {
            console.error('Error loading scheduled resets:', error);
            this.showInfo(`Failed to load scheduled resets: ${error.message}`, 'error');
            
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
                
                // Convert UTC time to local time using the stored offset
                const localResetTime = new Date(new Date(schedule.resetDateTime).getTime() + ((schedule.timezoneOffset || 0) * 60000));
                
                scheduledItem.innerHTML = `
                    <div class="scheduled-info">
                        <div class="scheduled-user">${schedule.username}</div>
                        <div class="scheduled-quiz">${this.formatQuizName(schedule.quizName)}</div>
                        <div class="scheduled-time">Reset scheduled for: ${this.formatScheduleDateTime(localResetTime)}</div>
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
            const cancelButtons = scheduledItemsList.querySelectorAll('.cancel-schedule-btn');
            cancelButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.cancelSchedule(button.dataset.id);
                });
            });
        } catch (error) {
            console.error('Error displaying scheduled resets:', error);
            scheduledItemsList.innerHTML = '<p class="error-message">Failed to load scheduled resets.</p>';
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
                cancelBtn.setAttribute('aria-busy', 'true');
                cancelBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                    <span class="sr-only">Cancelling schedule...</span>
                    <span aria-hidden="true">Cancelling...</span>
                `;
            }
            
            // Use the API service to cancel the schedule
            const response = await this.apiService.cancelScheduledReset(scheduleId);
            
            if (response.success) {
                // Show success message before refreshing display
                this.showSuccess(`Successfully cancelled scheduled reset for ${this.formatQuizName(scheduleToCancel.quizName)}`);
                
                // Refresh the display
                await this.loadScheduledResets();
            } else {
                throw new Error(response.message || 'Failed to cancel schedule');
            }
        } catch (error) {
            console.error('Error cancelling schedule:', error);
            this.showError(`Failed to cancel schedule: ${error.message}`);
            
            // Reset the button state if it still exists
            const cancelBtn = document.querySelector(`.cancel-schedule-btn[data-id="${scheduleId}"]`);
            if (cancelBtn) {
                cancelBtn.disabled = false;
                cancelBtn.removeAttribute('aria-busy');
                cancelBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i> Cancel';
            }
            
            // Refresh the display to ensure consistency
            await this.loadScheduledResets();
        }
    }
    
    // Format schedule date/time for display
    formatScheduleDateTime(dateTimeString) {
        try {
            // Parse the original input time
            const utcDate = new Date(dateTimeString);
            
            // Create a formatter that explicitly uses the local timezone
            const formatter = new Intl.DateTimeFormat('en-GB', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
            
            return formatter.format(utcDate);
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateTimeString;
        }
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
            // Get auto-reset settings
                const autoResetResponse = await this.apiService.getAutoResetSettings();
                
            if (!autoResetResponse.success) {
                console.error('Failed to fetch auto-reset settings:', autoResetResponse.message);
                return { success: false, message: autoResetResponse.message };
            }
            
                    const now = new Date();
                    const settings = Array.isArray(autoResetResponse.data) 
                        ? autoResetResponse.data 
                        : Object.values(autoResetResponse.data);
                    
                    console.log(`Found ${settings.length} auto-reset settings to check`);
                    let autoResetProcessed = 0;
                    
                    for (const setting of settings) {
                        // Skip if disabled or no quiz name
                        if (!setting.enabled || !setting.quizName) {
                            console.log(`Skipping auto-reset for ${setting.quizName || 'unknown'} - not enabled`);
                            continue;
                        }
                        
                        // If no nextResetTime, calculate it now
                        if (!setting.nextResetTime) {
                            console.log(`No nextResetTime for ${setting.quizName}, calculating it now`);
                            setting.nextResetTime = this.calculateNextResetTime(setting.resetPeriod);
                            
                            // Save the updated setting
                            await this.apiService.saveAutoResetSetting(
                                setting.quizName,
                                setting.resetPeriod,
                                true,
                                setting.nextResetTime
                            );
                            
                            console.log(`Updated nextResetTime for ${setting.quizName}: ${setting.nextResetTime}`);
                        }
                        
                        const nextResetTime = new Date(setting.nextResetTime);
                        console.log(`Next reset for ${setting.quizName}: ${nextResetTime}, current time: ${now}`);
                        
                        if (nextResetTime <= now) {
                    console.log(`Auto-reset due for ${setting.quizName}`);
                    autoResetProcessed++;
                    
                    try {
                        // Get completed users
                        const completedUsersResponse = await this.apiService.getCompletedUsers(setting.quizName);
                        const completedUsers = completedUsersResponse.success ? completedUsersResponse.data : [];
                        
                        console.log(`Found ${completedUsers.length} users to reset for ${setting.quizName}`);
                        
                                let successCount = 0;
                                for (const username of completedUsers) {
                                    try {
                                        // Reset the quiz progress
                                        const resetResponse = await this.apiService.resetQuizProgress(username, setting.quizName);
                                        
                                        if (resetResponse.success) {
                                            successCount++;
                                            console.log(`Reset ${username}'s ${setting.quizName} quiz`);
                                        } else {
                                            console.error(`Failed to reset ${username}'s ${setting.quizName} quiz:`, resetResponse.message);
                                        }
                                    } catch (error) {
                                        console.error(`Error resetting ${username}'s ${setting.quizName} quiz:`, error);
                                    }
                                }
                                
                        // Update lastReset time and calculate new nextResetTime
                                await this.apiService.updateAutoResetLastResetTime(setting.quizName);
                                    const newNextResetTime = this.calculateNextResetTime(setting.resetPeriod);
                        
                        // Save the new nextResetTime
                                    await this.apiService.saveAutoResetSetting(
                                        setting.quizName, 
                                        setting.resetPeriod, 
                                        true, 
                                        newNextResetTime
                                    );
                                    
                                    console.log(`Updated next reset time for ${setting.quizName} to ${newNextResetTime}`);
                        
                        // Update local settings
                        if (!this.autoResetSettings) {
                            this.autoResetSettings = {};
                                }
                        this.autoResetSettings[setting.quizName] = {
                            ...setting,
                            lastReset: new Date().toISOString(),
                            nextResetTime: newNextResetTime
                        };
                                
                        // Update the UI
                        await this.displayAutoResetSettings();
                                
                                // Show success message
                                this.showSuccess(`Successfully reset ${successCount} out of ${completedUsers.length} users for the ${this.formatQuizName(setting.quizName)} quiz`);
                                
                            } catch (error) {
                                console.error(`Error processing auto-reset for ${setting.quizName}:`, error);
                            }
                        } else {
                            console.log(`Auto-reset for ${setting.quizName} not due yet. Next reset at ${nextResetTime}`);
                        }
                    }
                    
                    if (autoResetProcessed > 0) {
                        console.log(`Processed ${autoResetProcessed} auto-reset quizzes`);
                        this.showInfo(`Processed ${autoResetProcessed} auto-reset quizzes`);
                        
                        // Force reload of auto-reset settings to get updated times
                        await this.loadAutoResetSettings();
            }
            
            return { success: true, processed: autoResetProcessed, total: settings.length };
            
        } catch (error) {
            console.error('Error checking scheduled resets:', error);
            return { success: false, message: error.message };
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

    // Helper method to show error messages
    showErrorMessage(message) {
        // Use the existing showInfo method with 'error' type
        this.showInfo(message, 'error');
    }

    // Removed duplicate updateQuizTimerSettings method - using apiService methods directly instead

    async loadGuideSettings() {
        try {
            console.log('Loading guide settings from API...');
            
            // Clear any existing guide settings to avoid stale data
            this.guideSettings = {};
            
            // Attempt to fetch from API
            const response = await this.apiService.getGuideSettings();
            console.log('Guide settings API response:', response);
            
            if (response.success) {
                this.guideSettings = response.data || {};
                console.log('Guide settings loaded successfully. Number of guides:', Object.keys(this.guideSettings).length);
                
                // Debug: log all guide settings for verification
                for (const [quizName, setting] of Object.entries(this.guideSettings)) {
                    console.log(`Guide setting for ${quizName}:`, setting);
                }
                
                // Store in localStorage as backup
                try {
                    localStorage.setItem('guideSettings', JSON.stringify(this.guideSettings));
                    console.log('Guide settings saved to localStorage');
                } catch (e) {
                    console.warn('Error saving guide settings to localStorage:', e);
                }
                
                // If we're displaying guide settings, refresh the display
                if (document.getElementById('guide-settings-container')) {
                    console.log('Refreshing guide settings display after load');
                    this.refreshGuideSettingsList();
                }
                
                return this.guideSettings;
            } else {
                console.warn('Failed to load guide settings from API:', response.message);
                throw new Error(response.message || 'Failed to load guide settings');
            }
        } catch (error) {
            console.error('Error loading guide settings:', error);
            
            // Try to load from localStorage as fallback
            try {
                const settingsJson = localStorage.getItem('guideSettings');
                if (settingsJson) {
                    this.guideSettings = JSON.parse(settingsJson);
                    console.log('Loaded guide settings from localStorage. Number of guides:', Object.keys(this.guideSettings).length);
                    return this.guideSettings;
                }
            } catch (localStorageError) {
                console.error('Error loading from localStorage:', localStorageError);
            }
            
            // Initialize empty guide settings if all else fails
            this.guideSettings = {};
            return this.guideSettings;
        }
    }

    displayGuideSettings() {
        const container = document.getElementById('guide-settings-container');
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        // Use inherited quizTypes array from parent class combined with hardcoded types
        const allQuizTypes = [...new Set([...this.quizTypes, ...this.getHardcodedQuizTypes()])].sort();
        const guideSettings = this.guideSettings || {};

        // Create the guide settings HTML
        const guideSettingsHTML = `
            <div class="guide-section">
                <h4>Quiz Guide Configuration</h4>
                <p>Set guide URLs and enable/disable guides for specific quizzes.</p>
                
                <div class="quiz-guide-form">
                    <div class="form-row">
                        <label>Select Quiz:</label>
                        <select id="guide-quiz-select" class="settings-input">
                            <option value="">-- Select a Quiz --</option>
                            ${allQuizTypes.map(quiz => 
                                `<option value="${quiz}">${this.formatQuizName(quiz)}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <label>Guide URL:</label>
                <input type="url" 
                            id="guide-url-input" 
                            placeholder="https://example.com/guide"
                            class="settings-input">
                </div>
                    
                    <div class="form-row">
                        <label class="checkbox-label">
                            <input type="checkbox" id="guide-enabled-checkbox">
                            <span>Enable Guide</span>
                        </label>
                    </div>
                    
                    <div class="form-row">
                        <button id="save-guide-btn" class="action-button">Save Guide Settings</button>
                    </div>
                </div>
            </div>

            <div class="guide-section">
                <h4>Current Guide Settings</h4>
                
                <div class="current-settings">
                    <div class="settings-header">
                        <h5>Quiz Guides:</h5>
                        <div class="settings-actions">
                            <label class="checkbox-label">
                                <input type="checkbox" id="select-all-guides">
                                <span>Select All</span>
                            </label>
                            <button id="enable-selected-guides" class="action-button">Enable Selected</button>
                            <button id="disable-selected-guides" class="action-button secondary">Disable Selected</button>
                            <button id="remove-selected-guides" class="action-button danger-btn">Remove Selected</button>
                        </div>
                    </div>
                    <div id="guide-settings-list" class="settings-list">
                        ${this.generateGuideSettingsList(guideSettings)}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = guideSettingsHTML;

        // Set up event listeners
        const quizSelect = container.querySelector('#guide-quiz-select');
        const urlInput = container.querySelector('#guide-url-input');
        const enabledCheckbox = container.querySelector('#guide-enabled-checkbox');
        const saveButton = container.querySelector('#save-guide-btn');
        const selectAllCheckbox = container.querySelector('#select-all-guides');
        const enableSelectedBtn = container.querySelector('#enable-selected-guides');
        const disableSelectedBtn = container.querySelector('#disable-selected-guides');
        const removeSelectedBtn = container.querySelector('#remove-selected-guides');

        // Set initial state when a quiz is selected
        quizSelect.addEventListener('change', () => {
            const selectedQuiz = quizSelect.value;
            if (selectedQuiz && this.guideSettings[selectedQuiz]) {
                const guideSetting = this.guideSettings[selectedQuiz];
                urlInput.value = guideSetting.url || '';
                enabledCheckbox.checked = guideSetting.enabled || false;
            } else {
                urlInput.value = '';
                enabledCheckbox.checked = false;
            }
        });

        // Save guide settings
            saveButton.addEventListener('click', async () => {
            const selectedQuiz = quizSelect.value;
            if (!selectedQuiz) {
                alert('Please select a quiz');
                return;
            }
            const url = urlInput.value.trim();
            if (!url) {
                alert('Please enter a URL');
                return;
            }
            
            try {
                // Validate URL format
                new URL(url);
            } catch (e) {
                alert('Please enter a valid URL (include http:// or https://)');
                return;
            }
            
            const enabled = enabledCheckbox.checked;
            
            try {
                await this.saveGuideSettings(selectedQuiz, url, enabled);
                this.showInfo(`Guide settings for ${selectedQuiz} saved successfully`);
                
                // Refresh the guide settings list
                this.refreshGuideSettingsList();
                } catch (error) {
                    console.error('Failed to save guide settings:', error);
                alert('Failed to save guide settings');
            }
        });
        
        // Select all guides
        selectAllCheckbox.addEventListener('change', () => {
            const checkboxes = container.querySelectorAll('#guide-settings-list input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
        
        // Enable selected guides
        enableSelectedBtn.addEventListener('click', async () => {
            const selectedGuides = this.getSelectedGuides(container);
            if (selectedGuides.length === 0) {
                alert('Please select at least one guide');
                return;
            }
            
            try {
                this.showInfo(`Enabling ${selectedGuides.length} guide settings...`);
                let updatedCount = 0;
                let skippedCount = 0;
                
                for (const quiz of selectedGuides) {
                    if (this.guideSettings[quiz]) {
                        const guideSetting = this.guideSettings[quiz];
                        const url = guideSetting.url;
                        
                        // Skip if already enabled or if there's no URL
                        if (guideSetting.enabled === true) {
                            console.log(`Guide for ${quiz} already enabled, skipping.`);
                            skippedCount++;
                            continue;
                        }
                        
                        if (!url) {
                            console.log(`Guide for ${quiz} has no URL, skipping.`);
                            skippedCount++;
                            continue;
                        }
                        
                        try {
                            // Update the setting
                            await this.saveGuideSettings(quiz, url, true);
                        updatedCount++;
                        } catch (error) {
                            console.error(`Failed to enable guide for ${quiz}:`, error);
                        }
                    }
                }
                
                if (updatedCount > 0) {
                    this.showInfo(`${updatedCount} guide(s) enabled successfully${skippedCount > 0 ? `, ${skippedCount} skipped` : ''}`);
                
                    // Refresh the guide settings list without resetting event handlers
                    this.refreshGuideSettingsList(false);
                } else if (skippedCount > 0) {
                    this.showInfo(`No guides were enabled. ${skippedCount} guide(s) were already enabled or had no URL.`, 'info');
                } else {
                    this.showInfo('No guides were enabled', 'warning');
                }
            } catch (error) {
                console.error('Failed to enable guides:', error);
                this.showInfo('Failed to enable guides', 'error');
            }
        });
        
        // Disable selected guides
        disableSelectedBtn.addEventListener('click', async () => {
            const selectedGuides = this.getSelectedGuides(container);
            if (selectedGuides.length === 0) {
                alert('Please select at least one guide');
                return;
            }
            
            try {
                this.showInfo(`Disabling ${selectedGuides.length} guide settings...`);
                let updatedCount = 0;
                let skippedCount = 0;
                
                for (const quiz of selectedGuides) {
                    if (this.guideSettings[quiz]) {
                        const guideSetting = this.guideSettings[quiz];
                        const url = guideSetting.url;
                        
                        // Skip if already disabled or if there's no URL
                        if (guideSetting.enabled === false) {
                            console.log(`Guide for ${quiz} already disabled, skipping.`);
                            skippedCount++;
                            continue;
                        }
                        
                        if (!url) {
                            console.log(`Guide for ${quiz} has no URL, skipping.`);
                            skippedCount++;
                            continue;
                        }
                        
                        try {
                            // Update the setting
                            await this.saveGuideSettings(quiz, url, false);
                        updatedCount++;
                        } catch (error) {
                            console.error(`Failed to disable guide for ${quiz}:`, error);
                        }
                    }
                }
                
                if (updatedCount > 0) {
                    this.showInfo(`${updatedCount} guide(s) disabled successfully${skippedCount > 0 ? `, ${skippedCount} skipped` : ''}`);
                
                    // Refresh the guide settings list without resetting event handlers
                    this.refreshGuideSettingsList(false);
                } else if (skippedCount > 0) {
                    this.showInfo(`No guides were disabled. ${skippedCount} guide(s) were already disabled or had no URL.`, 'info');
                } else {
                    this.showInfo('No guides were disabled', 'warning');
                }
            } catch (error) {
                console.error('Failed to disable guides:', error);
                this.showInfo('Failed to disable guides', 'error');
            }
        });
        
        // Remove selected guides
        removeSelectedBtn.addEventListener('click', async () => {
            const selectedGuides = this.getSelectedGuides(container);
            if (selectedGuides.length === 0) {
                alert('Please select at least one guide');
                return;
            }
            
            const confirmed = confirm(`Are you sure you want to remove ${selectedGuides.length} guide setting(s)?`);
            if (!confirmed) return;
            
            try {
                this.showInfo(`Removing ${selectedGuides.length} guide settings...`);
                let removedCount = 0;
                
                for (const quiz of selectedGuides) {
                    if (this.guideSettings[quiz]) {
                        try {
                            // Completely delete the guide setting
                            await this.apiService.deleteGuideSetting(quiz);
                            
                            // Also remove from in-memory state
                            delete this.guideSettings[quiz];
                            
                        removedCount++;
                        } catch (error) {
                            console.error(`Failed to delete guide setting for ${quiz}:`, error);
                        }
                    }
                }
                
                if (removedCount > 0) {
                this.showInfo(`${removedCount} guide setting(s) removed successfully`);
                
                    // Save updated settings to localStorage
                    try {
                        localStorage.setItem('guideSettings', JSON.stringify(this.guideSettings));
                        console.log(`Updated guide settings in localStorage. Remaining: ${Object.keys(this.guideSettings).length}`);
                    } catch (e) {
                        console.warn(`Failed to save updated settings to localStorage:`, e);
                    }
                    
                    // Refresh the guide settings list without resetting event handlers
                    this.refreshGuideSettingsList(false);
                } else {
                    this.showInfo('No guide settings were removed', 'warning');
                }
            } catch (error) {
                console.error('Failed to remove guides:', error);
                this.showInfo('Failed to remove guides', 'error');
            }
        });
        
        // Define the function to set up event listeners for the guide item buttons
        const setupGuideItemEventListeners = () => {
            // Handle Edit button clicks
            const editButtons = container.querySelectorAll('.edit-guide-btn');
            editButtons.forEach(button => {
                button.addEventListener('click', async () => {
                    const quizName = button.getAttribute('data-quiz');
                    if (quizName && this.guideSettings[quizName]) {
                        const currentUrl = this.guideSettings[quizName].url || '';
                        const currentEnabled = this.guideSettings[quizName].enabled || false;
                        
                        // Simple URL prompt approach - guaranteed to work
                        const newUrl = prompt(`Edit URL for ${this.formatQuizName(quizName)}:`, currentUrl);
                        if (newUrl === null) return; // User canceled
                        
                        if (!newUrl.trim()) {
                            alert('Please enter a URL');
                            return;
                        }
                        
                        try {
                            // Validate URL format
                            new URL(newUrl);
                        } catch (e) {
                            alert('Please enter a valid URL (include http:// or https://)');
                            return;
                        }
                        
                        // Simple confirm for enabled state - store result but don't show another message yet
                        const newEnabled = confirm(`Enable guide for ${this.formatQuizName(quizName)}?`);
                        
                        try {
                            // Use a separate method that doesn't show the initial loading message
                            await this.saveGuideSettingsWithoutInitialMessage(quizName, newUrl, newEnabled);
                        } catch (error) {
                            console.error('Error during guide edit:', error);
                            this.showInfo('Failed to save guide settings', 'error');
                        }
                    }
                });
            });
            
            // Handle Test button clicks (open in new tab)
            const testButtons = container.querySelectorAll('.test-guide-btn');
            testButtons.forEach(button => {
                const url = button.getAttribute('data-url');
                if (url) {
                    button.removeAttribute('disabled');
                    button.addEventListener('click', () => {
                        window.open(url, '_blank');
                    });
                } else {
                    button.setAttribute('disabled', 'true');
                }
            });
        };
        
        // Store the function on the container so it can be accessed by refreshGuideSettings
        // Important: Use a property name that won't conflict with native DOM properties
        container.setupGuideItemEventListeners = setupGuideItemEventListeners;
        
        // Setup the event listeners
        setupGuideItemEventListeners();
        
        // Add a mutation observer to handle dynamically added guide items
        const guideSettingsList = container.querySelector('#guide-settings-list');
        if (guideSettingsList) {
            const observer = new MutationObserver(setupGuideItemEventListeners);
            observer.observe(guideSettingsList, { childList: true, subtree: true });
        }
    }
    
    // Helper method to get selected guides from the UI
    getSelectedGuides(container) {
        const selectedGuides = [];
        const checkboxes = container.querySelectorAll('#guide-settings-list input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            const quiz = checkbox.getAttribute('data-quiz');
            if (quiz) {
                selectedGuides.push(quiz);
            }
        });
        return selectedGuides;
    }

    async saveGuideSettings(quiz, url, enabled) {
        try {
            // Normalize quiz name
            const normalizedQuiz = this.quizProgressService && typeof this.quizProgressService.normalizeQuizName === 'function'
                ? this.quizProgressService.normalizeQuizName(quiz)
                : quiz;
            console.log(`Saving guide setting for ${normalizedQuiz} (normalized from ${quiz}): url=${url}, enabled=${enabled}`);

            // Make the API call first
            const response = await this.apiService.saveGuideSetting(normalizedQuiz, url, enabled);

            if (response.success) {
                console.log('Guide setting saved successfully:', response);
                
                // Update in-memory state
                if (!this.guideSettings) {
                    this.guideSettings = {};
                }
                this.guideSettings[normalizedQuiz] = { url, enabled };
                
                // Update localStorage
                try {
                    localStorage.setItem('guideSettings', JSON.stringify(this.guideSettings));
                    console.log(`Updated guide settings in localStorage (${Object.keys(this.guideSettings).length} guides)`);
                } catch (e) {
                    console.warn(`Failed to save guide settings to localStorage: ${e.message}`);
                }
                
                // Refresh the UI
                this.refreshGuideSettingsList(true);
                
                // Show success message
                this.showInfo(`Guide settings for ${this.formatQuizName(quiz)} saved successfully!`);
                
                return true;
            } else {
                throw new Error(response.message || 'Failed to save guide settings');
            }
        } catch (error) {
            console.error('Error saving guide settings:', error);
            this.showInfo('Failed to save guide settings', 'error');
            throw error;
        }
    }

    async handleAdminLogout() {
        try {
            await this.apiService.adminLogout();
        } finally {
            window.location.replace('/pages/admin-login.html');
        }
    }

    async loadTimerSettings() {
        try {
            console.log('Loading timer settings via apiService');
            
            // Clear any timer-related localStorage to prevent interference
            this.clearTimerLocalStorage();
            
            const response = await this.apiService.getQuizTimerSettings();
            
            if (response.success && response.data) {
                this.timerSettings = response.data;
                console.log('Timer settings loaded successfully from API:', this.timerSettings);
            } else {
                // Initialize with clean defaults (no localStorage fallback)
                this.timerSettings = { 
                    defaultSeconds: 60, 
                    quizTimers: {},
                    updatedAt: new Date()
                };
                console.warn('Failed to load timer settings from API, using clean defaults');
            }
        } catch (error) {
            console.error('Error loading timer settings:', error);
            // Initialize with clean defaults on error
            this.timerSettings = { 
                defaultSeconds: 60, 
                quizTimers: {},
                updatedAt: new Date()
            };
        }
    }

    // Clear timer-related localStorage to prevent interference
    clearTimerLocalStorage() {
        console.log('[CLEANUP] Clearing timer-related localStorage...');
        const timerKeys = [
            'quizTimerSettings',
            'quizTimerValue', 
            'perQuizTimerSettings',
            'timerSettings',
            'defaultTimerValue'
        ];
        
        timerKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                console.log(`[CLEANUP] Removing localStorage key: ${key}`);
                localStorage.removeItem(key);
            }
        });
        
        console.log('[CLEANUP] Timer localStorage cleared');
    }

    // Helper method to generate HTML for the list of guide settings
    generateGuideSettingsList(guideSettings) {
        if (!guideSettings || Object.keys(guideSettings).length === 0) {
            return '<div class="no-settings-message">No guide settings configured yet.</div>';
        }

        console.log('Generating guide settings list for:', guideSettings);
        
        let html = '';
        
        // Sort quiz names alphabetically
        const quizNames = Object.keys(guideSettings).sort();
        
        for (const quizName of quizNames) {
            const setting = guideSettings[quizName] || {};
            
            // Skip invalid settings (no quiz name or undefined settings)
            if (!quizName || !setting) continue;
            
            // Handle potentially missing properties - provide defaults
            const guideUrl = setting.url || '';
            const isEnabled = setting.enabled === true; // Explicit check for true
            
            console.log(`Guide setting for ${quizName}:`, setting);
            
            html += `
                <div class="guide-settings-item">
                    <div class="guide-settings-info">
                        <div class="guide-settings-header">
                            <div class="guide-checkbox-name">
                                <input type="checkbox" 
                                    class="guide-selector" 
                                    data-quiz="${quizName}" 
                                    id="guide-select-${quizName}"
                                    aria-label="Select ${this.formatQuizName(quizName)} guide">
                                <label for="guide-select-${quizName}" class="guide-name">
                                    ${this.formatQuizName(quizName)}
                                </label>
                            </div>
                            <div class="guide-status-badge ${isEnabled ? 'enabled' : 'disabled'}">
                                ${isEnabled ? 'Enabled' : 'Disabled'}
                            </div>
                        </div>
                        <div class="guide-url-container">
                            <span class="guide-url-label">URL:</span>
                            <span class="guide-url-value" title="${guideUrl}">${guideUrl || 'No URL set'}</span>
                        </div>
                    </div>
                    <div class="guide-settings-actions">
                        <button class="edit-guide-btn action-button secondary" data-quiz="${quizName}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="test-guide-btn action-button" 
                            data-quiz="${quizName}" 
                            data-url="${guideUrl}" 
                            ${guideUrl ? '' : 'disabled'}>
                            <i class="fas fa-external-link-alt"></i> Test
                        </button>
                    </div>
                </div>
            `;
        }
        
        return html || '<div class="no-settings-message">No guide settings configured yet.</div>';
    }

    // Helper function to format quiz names from kebab-case to Title Case
    formatQuizName(quizName) {
        if (!quizName) return '';
        return quizName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Auto-reset settings methods
    async loadAutoResetSettings() {
        try {
            // Add debounce to prevent multiple rapid calls
            const now = Date.now();
            if (!this.lastAutoSettingsLoad || (now - this.lastAutoSettingsLoad) > 5000) { // Only reload if it's been at least 5 seconds
                this.lastAutoSettingsLoad = now;
                console.log('Loading auto-reset settings...');
                
            const response = await this.apiService.getAutoResetSettings();
                if (response.success && response.data) {
                    // Convert from array to object if needed
                    if (Array.isArray(response.data)) {
                        this.autoResetSettings = {};
                        response.data.forEach(setting => {
                            if (setting.quizName) {
                                this.autoResetSettings[setting.quizName] = setting;
                            }
                        });
                    } else if (typeof response.data === 'object') {
                this.autoResetSettings = response.data;
                    } else {
                        this.autoResetSettings = {};
                    }
                    
                    console.log('Auto reset settings loaded:', this.autoResetSettings);
                    
                    // Then call displayAutoResetSettings directly
                    this.displayAutoResetSettings();
            } else {
                throw new Error(response.message || 'Failed to load auto-reset settings');
                }
            } else {
                console.log('Auto-reset settings were loaded recently, skipping reload');
                // Just update display with current data
                this.displayAutoResetSettings();
            }
        } catch (error) {
            console.error('Error loading auto-reset settings:', error);
            this.showError('Failed to load auto-reset settings');
        }
    }

    displayAutoResetSettings() {
        const container = document.getElementById('auto-reset-settings-container');
        if (!container) {
            console.error('Auto-reset settings container not found');
            return;
        }

        // Clear existing content
        container.innerHTML = '';

        console.log('Displaying auto-reset settings:', this.autoResetSettings);

        // Check if we have any auto reset settings
        if (!this.autoResetSettings || Object.keys(this.autoResetSettings).length === 0) {
            container.innerHTML = '<p>No auto-reset settings configured yet.</p>';
            return;
        }

        // Create table to display settings
        const table = document.createElement('table');
        table.className = 'auto-reset-table';
        
        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Quiz</th>
                <th>Reset Period</th>
                <th>Next Reset</th>
                <th>Actions</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Loop through each quiz with auto reset setting
        for (const [quizName, settings] of Object.entries(this.autoResetSettings)) {
            if (!quizName) continue;
            
            console.log(`Rendering settings for ${quizName}:`, settings);
            console.log(`nextResetTime for ${quizName}:`, settings.nextResetTime);
            
            // If nextResetTime is missing but resetPeriod exists and enabled, calculate it
            if (!settings.nextResetTime && settings.resetPeriod && settings.enabled) {
                settings.nextResetTime = this.calculateNextResetTime(settings.resetPeriod);
                console.log(`Calculated nextResetTime for ${quizName}: ${settings.nextResetTime}`);
                
                // Update the global settings
                this.autoResetSettings[quizName] = settings;
            }
            
            const row = document.createElement('tr');
            
            // Format reset period text
            let resetPeriodText = 'Unknown';
            if (settings.resetPeriod) {
                // Check if resetPeriod is a string (daily, weekly, monthly) or a number (minutes)
                if (typeof settings.resetPeriod === 'string') {
                    switch(settings.resetPeriod) {
                        case 'daily':
                            resetPeriodText = 'Daily';
                            break;
                        case 'weekly':
                            resetPeriodText = 'Weekly';
                            break;
                        case 'monthly':
                            resetPeriodText = 'Monthly';
                            break;
                        default:
                            resetPeriodText = settings.resetPeriod;
                    }
                } else if (typeof settings.resetPeriod === 'number') {
                    // Convert minutes to a readable format
                    const minutes = settings.resetPeriod;
                    if (minutes < 60) {
                        resetPeriodText = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
                    } else if (minutes < 1440) {
                        const hours = minutes / 60;
                        resetPeriodText = `${hours} hour${hours !== 1 ? 's' : ''}`;
                    } else if (minutes < 10080) {
                        const days = minutes / 1440;
                        resetPeriodText = `${days} day${days !== 1 ? 's' : ''}`;
                    } else if (minutes < 43200) {
                        const weeks = minutes / 10080;
                        resetPeriodText = `${weeks} week${weeks !== 1 ? 's' : ''}`;
                    } else {
                        const months = minutes / 43200;
                        resetPeriodText = `${months} month${months !== 1 ? 's' : ''}`;
                    }
                }
            }
            
            // Create the countdown text for next reset
            let nextResetText = 'Not scheduled';
            
            // If we have nextResetTime, calculate a countdown
            if (settings.nextResetTime) {
                const nextResetTime = new Date(settings.nextResetTime);
                const now = new Date();
                const timeDiff = nextResetTime - now;
                
                if (timeDiff <= 0) {
                    nextResetText = 'Reset due now!';
                } else {
                    // Calculate time units
                    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
                    
                    // Format countdown text
                    nextResetText = '';
                    if (days > 0) {
                        nextResetText += `${days}d `;
                    }
                    if (hours > 0 || days > 0) {
                        nextResetText += `${hours}h `;
                    }
                    if (minutes > 0 || hours > 0 || days > 0) {
                        nextResetText += `${minutes}m `;
                    }
                    nextResetText += `${seconds}s`;
                }
            }
            
            // Set row content
            row.innerHTML = `
                <td>${this.formatQuizName(quizName)}</td>
                <td>${resetPeriodText}</td>
                <td class="countdown" data-quiz="${quizName}">${nextResetText}</td>
                <td>
                    <button class="edit-auto-reset" data-quiz="${quizName}">Edit</button>
                    <button class="delete-auto-reset" data-quiz="${quizName}">Delete</button>
                    <button class="reset-now" data-quiz="${quizName}">Reset Now</button>
                </td>
            `;
            
            tbody.appendChild(row);
        }
        
        table.appendChild(tbody);
        container.appendChild(table);
        
        // Set up event listeners for edit and delete buttons
        const editButtons = container.querySelectorAll('.edit-auto-reset');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const quizName = button.dataset.quiz;
                this.showAutoResetEditModal(quizName);
            });
        });
        
        const deleteButtons = container.querySelectorAll('.delete-auto-reset');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const quizName = button.dataset.quiz;
                this.deleteAutoResetSetting(quizName);
            });
        });

        // Add event listeners for Reset Now buttons
        const resetNowButtons = container.querySelectorAll('.reset-now');
        resetNowButtons.forEach(button => {
            button.addEventListener('click', () => {
                const quizName = button.dataset.quiz;
                this.manuallyTriggerReset(quizName);
            });
        });
        
        // Start countdown update interval
        this.updateCountdowns();
    }

    setupAutoResetSettings() {
        const quizSelect = document.getElementById('autoResetQuiz');
        const periodSelect = document.getElementById('resetPeriod');
        const enabledCheckbox = document.getElementById('autoResetEnabled');
        const saveButton = document.getElementById('saveAutoReset');
        
        if (!quizSelect || !periodSelect || !enabledCheckbox || !saveButton) {
            console.warn('Auto-reset settings UI elements not found');
            return;
        }

        // Populate quiz dropdown
        if (this.quizTypes && Array.isArray(this.quizTypes)) {
            // Clear existing options except first one
            while (quizSelect.options.length > 1) {
                quizSelect.remove(1);
            }
            
            // Add quiz options
            this.quizTypes.forEach(quiz => {
                const option = document.createElement('option');
                option.value = quiz;
                option.textContent = this.formatQuizName(quiz);
                quizSelect.appendChild(option);
            });
        }

        // Load existing settings if any
        if (this.autoResetSettings && this.autoResetSettings.length > 0) {
            this.updateAutoResetSettingsDisplay();
        }

        // Handle save button click
        saveButton.addEventListener('click', async () => {
            const quizName = quizSelect.value;
            const resetPeriod = parseInt(periodSelect.value);
            const enabled = enabledCheckbox.checked;

            if (!quizName || !resetPeriod) {
                this.showError('Please select both quiz and reset period');
                return;
            }

            try {
                const response = await this.apiService.saveAutoResetSetting(quizName, resetPeriod, enabled);
                if (response.success) {
                    this.showSuccess('Auto-reset setting saved successfully');
                    await this.loadAutoResetSettings(); // Reload settings
                } else {
                    throw new Error(response.message || 'Failed to save auto-reset setting');
                }
            } catch (error) {
                console.error('Error saving auto-reset setting:', error);
                this.showError(`Failed to save auto-reset setting: ${error.message}`);
            }
        });
    }

    updateAutoResetSettingsDisplay(shouldUpdateCurrentResets = true) {
        const quizSelect = document.getElementById('autoResetQuiz');
        const periodSelect = document.getElementById('resetPeriod');
        const enabledCheckbox = document.getElementById('autoResetEnabled');

        if (!quizSelect || !periodSelect || !enabledCheckbox) {
            console.warn('Cannot update auto-reset settings display: UI elements not found');
            return;
        }

        // Clear existing period options
        while (periodSelect.options.length > 1) {
            periodSelect.remove(1);
        }

        // Add period options
        const periods = [
            { value: 1, label: '1 minute' },
            { value: 10, label: '10 minutes (Testing)' },
            { value: 1440, label: '1 day' },
            { value: 10080, label: '1 week' },
            { value: 43200, label: '1 month' },
            { value: 129600, label: '3 months' },
            { value: 259200, label: '6 months' },
            { value: 525600, label: '1 year' }
        ];

        periods.forEach(period => {
            const option = document.createElement('option');
            option.value = period.value;
            option.textContent = period.label;
            periodSelect.appendChild(option);
        });

        // Set selected values if there are existing settings
        if (this.autoResetSettings && this.autoResetSettings.length > 0) {
            const selectedQuiz = quizSelect.value;
            const setting = this.autoResetSettings.find(s => s.quizName === selectedQuiz);
            
            if (setting) {
                periodSelect.value = setting.resetPeriod;
                enabledCheckbox.checked = setting.enabled;
            }
        }

        // Only update the current auto-resets display if the flag is true
        if (shouldUpdateCurrentResets) {
        this.displayCurrentAutoResets();
        }
    }

    async displayCurrentAutoResets() {
        const container = document.getElementById('currentAutoResetsList');
        if (!container) return;

        try {
            container.innerHTML = '<p>Loading auto-reset settings...</p>';
            
            // We no longer need to reload settings here since we're already called from updateAutoResetSettingsDisplay
            // which already has the latest settings
            // await this.loadAutoResetSettings(); - REMOVED TO PREVENT RECURSIVE LOOP
            
            if (!this.autoResetSettings || this.autoResetSettings.length === 0) {
                container.innerHTML = '<p>No auto-reset settings configured.</p>';
                return;
            }
            
            container.innerHTML = '';
            
            // Sort settings by quiz name
            const settings = [...this.autoResetSettings].sort((a, b) => {
                return a.quizName.localeCompare(b.quizName);
            });

            settings.forEach(setting => {
                const nextReset = this.calculateNextResetTime(setting);
                const item = document.createElement('div');
                item.className = 'auto-reset-item';
                
                // Format the countdown display
                let countdownDisplay = 'N/A';
                if (nextReset) {
                    const now = new Date();
                    const resetTime = new Date(nextReset);
                    const timeDiff = resetTime - now;
                    
                    if (timeDiff > 0) {
                        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

                        countdownDisplay = 'Next reset in: ';
                        if (days > 0) countdownDisplay += `${days}d `;
                        if (hours > 0) countdownDisplay += `${hours}h `;
                        if (minutes > 0) countdownDisplay += `${minutes}m `;
                        countdownDisplay += `${seconds}s`;
                    } else {
                        countdownDisplay = 'Next reset: Pending';
                    }
                }
                
                // Format last reset time if available
                let lastResetDisplay = 'Never reset';
                if (setting.lastReset) {
                    const lastResetDate = new Date(setting.lastReset);
                    lastResetDisplay = `Last reset: ${lastResetDate.toLocaleString()}`;
                }

                item.innerHTML = `
                    <div class="auto-reset-info">
                        <h4>${this.formatQuizName(setting.quizName)}</h4>
                        <p>Reset Period: ${this.getPeriodLabel(setting.resetPeriod)}</p>
                        <p>Status: ${setting.enabled ? 'Enabled' : 'Disabled'}</p>
                        <p class="last-reset-info">${lastResetDisplay}</p>
                        <p class="auto-reset-countdown" 
                           data-quiz="${setting.quizName}" 
                           data-next-reset="${nextReset ? nextReset.toISOString() : ''}">
                            ${countdownDisplay}
                        </p>
                    </div>
                    <div class="auto-reset-actions">
                        <button class="toggle-auto-reset" data-quiz="${setting.quizName}" data-enabled="${setting.enabled}">
                            ${setting.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button class="manual-reset" data-quiz="${setting.quizName}">Manual Reset</button>
                        <button class="delete-auto-reset" data-quiz="${setting.quizName}">Delete</button>
                    </div>
                `;

                container.appendChild(item);

                // Add event listeners
                const toggleBtn = item.querySelector('.toggle-auto-reset');
                const deleteBtn = item.querySelector('.delete-auto-reset');
                const manualResetBtn = item.querySelector('.manual-reset');

                toggleBtn.addEventListener('click', () => this.toggleAutoReset(setting.quizName, !setting.enabled));
                deleteBtn.addEventListener('click', () => this.deleteAutoReset(setting.quizName));
                manualResetBtn.addEventListener('click', () => this.manuallyTriggerReset(setting.quizName));
            });

            // Start countdown updates
            this.startCountdownUpdates();
        } catch (error) {
            console.error('Error displaying auto-reset settings:', error);
            container.innerHTML = `<p class="error">Error displaying auto-reset settings: ${error.message}</p>`;
        }
    }

    calculateNextResetTime(input) {
        const now = new Date();
        
        // Handle both parameter types (setting object or resetPeriod)
        const resetPeriod = typeof input === 'object' ? input.resetPeriod : input;
        
        // If resetPeriod is a number, it's in minutes
        if (typeof resetPeriod === 'number') {
            // Calculate next reset time from now
            const nextReset = new Date(now.getTime() + (resetPeriod * 60 * 1000));
            console.log(`Calculated next reset time: ${nextReset.toISOString()} (${resetPeriod} minutes from now)`);
            return nextReset.toISOString();
        }
        
        // For string-based periods (daily, weekly, monthly)
        let nextReset = new Date(now);
        nextReset.setHours(0, 0, 0, 0); // Reset to midnight
        
        switch (resetPeriod) {
            case 'daily':
                // Next day at midnight
                nextReset.setDate(nextReset.getDate() + 1);
                break;
            case 'weekly':
                // Next Sunday at midnight
                const daysUntilSunday = (7 - nextReset.getDay()) % 7;
                nextReset.setDate(nextReset.getDate() + (daysUntilSunday || 7));
                break;
            case 'monthly':
                // First day of next month
                nextReset.setMonth(nextReset.getMonth() + 1);
                nextReset.setDate(1);
                break;
            default:
                // Default to daily
                nextReset.setDate(nextReset.getDate() + 1);
        }
        
        console.log(`Calculated next reset time: ${nextReset.toISOString()} (${resetPeriod})`);
        return nextReset.toISOString();
    }

    startCountdownUpdates() {
        // Clear any existing interval
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        // Update countdowns every second
        this.countdownInterval = setInterval(() => {
            this.updateCountdowns();
        }, 1000);
    }

    updateCountdowns() {
        const countdownElements = document.querySelectorAll('.countdown[data-quiz]');
        if (!countdownElements.length) return;

        countdownElements.forEach(element => {
            const quizName = element.dataset.quiz;
            if (!quizName || !this.autoResetSettings || !this.autoResetSettings[quizName]) return;

            const settings = this.autoResetSettings[quizName];
            
            // If nextResetTime is missing but we have resetPeriod and the setting is enabled,
            // calculate the nextResetTime dynamically
            if (!settings.nextResetTime && settings.resetPeriod && settings.enabled) {
                // Use the second calculateNextResetTime that accepts just resetPeriod
                const calculatedNextReset = this.calculateNextResetTime(settings.resetPeriod);
                console.log(`Dynamically calculated next reset for ${quizName}: ${calculatedNextReset}`);
                
                // Store the calculated time so we don't recalculate every second
                settings.nextResetTime = calculatedNextReset;
                
                // Update the autoResetSettings object with the calculated time
                this.autoResetSettings[quizName] = settings;
            }
            
            if (!settings.nextResetTime) {
                element.textContent = 'Not scheduled';
                return;
            }

            const nextResetTime = new Date(settings.nextResetTime);
            this.updateCountdownDisplay(element, nextResetTime);
        });

        // Ensure we have an interval running to update countdowns every second
        if (!this.countdownInterval) {
            this.countdownInterval = setInterval(() => this.updateCountdowns(), 1000); // Update every second
        }
    }

    updateCountdownDisplay(countdownElement, nextResetTime) {
        try {
            // Ensure nextResetTime is a valid Date object
            let resetDate;
            
            if (typeof nextResetTime === 'string') {
                resetDate = new Date(nextResetTime);
                console.log(`Converted string date: ${nextResetTime} to Date object: ${resetDate}`);
            } else if (nextResetTime instanceof Date) {
                resetDate = nextResetTime;
            } else {
                console.error('Invalid nextResetTime format:', nextResetTime);
                countdownElement.textContent = 'Invalid date';
                return;
            }
            
            // Check if date is valid
            if (isNaN(resetDate.getTime())) {
                console.error('Invalid date object:', resetDate);
                countdownElement.textContent = 'Invalid date';
                return;
            }
            
            const now = new Date();
            const timeDiff = resetDate - now;
            
            console.log(`Countdown calculation: nextResetTime=${resetDate}, now=${now}, diff=${timeDiff}ms`);

            if (timeDiff <= 0) {
                countdownElement.textContent = 'Reset due now!';
                countdownElement.classList.add('countdown-overdue');
                
                // Get the quiz name from the element's data attribute
                const quizName = countdownElement.dataset.quiz;
                if (quizName) {
                // Trigger a check for auto-resets that need processing
                    this.checkScheduledResets()
                        .then(() => {
                            console.log(`Processed scheduled reset for ${quizName}`);
                            // Force a UI update after processing
                            this.displayAutoResetSettings();
                        })
                        .catch(err => {
                    console.error('Error checking scheduled resets:', err);
                });
                }
                
                return;
            }

            // Remove overdue class if it exists
            countdownElement.classList.remove('countdown-overdue');

            // Calculate time units
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            // Format countdown text
            let countdownText = '';
            if (days > 0) {
                countdownText += `${days}d `;
            }
            if (hours > 0 || days > 0) {
                countdownText += `${hours}h `;
            }
            if (minutes > 0 || hours > 0 || days > 0) {
                countdownText += `${minutes}m `;
            }
            countdownText += `${seconds}s`;

            countdownElement.textContent = countdownText;
        } catch (error) {
            console.error('Error updating countdown display:', error);
            countdownElement.textContent = 'Error';
        }
    }

    getPeriodLabel(minutes) {
        if (minutes === 1) return '1 Minute';
        if (minutes === 10) return '10 Minutes';
        if (minutes === 1440) return '1 Day';
        if (minutes === 10080) return '1 Week';
        if (minutes === 43200) return '1 Month';
        if (minutes === 129600) return '3 Months';
        if (minutes === 259200) return '6 Months';
        if (minutes === 525600) return '1 Year';
        return `${minutes} Minutes`;
    }

    async toggleAutoReset(quizName, enabled) {
        try {
            console.log(`Toggling auto-reset for ${quizName} to ${enabled}`);
            const setting = (await this.apiService.getAutoResetSettings()).data
                .find(s => s.quizName === quizName);
            
            if (!setting) {
                this.showErrorMessage('Auto-reset setting not found');
                return;
            }

            const response = await this.apiService.saveAutoResetSetting(
                quizName,
                setting.resetPeriod,
                enabled
            );

            if (response.success) {
                // Load settings first, then the display will be updated
                await this.loadAutoResetSettings();
                this.showInfo(`Auto-reset for ${quizName} ${enabled ? 'enabled' : 'disabled'}`);
            } else {
                this.showErrorMessage('Failed to update auto-reset setting');
            }
        } catch (error) {
            console.error('Error toggling auto-reset:', error);
            this.showErrorMessage('Failed to toggle auto-reset setting');
        }
    }

    async deleteAutoReset(quizName) {
        try {
            console.log(`Deleting auto-reset for ${quizName}`);
            
            // Call API to delete the auto-reset setting
            const response = await this.apiService.deleteAutoResetSetting(quizName);

            if (response.success) {
                // Remove from local settings
                if (this.autoResetSettings && this.autoResetSettings[quizName]) {
                    delete this.autoResetSettings[quizName];
                }
                
                // Update the UI
                await this.displayAutoResetSettings();
                
                // Show success message
                this.showSuccess(`Auto-reset for ${this.formatQuizName(quizName)} has been deleted`);
                
                return true;
            } else {
                throw new Error(response.message || 'Failed to delete auto-reset setting');
            }
        } catch (error) {
            console.error('Error deleting auto-reset:', error);
            this.showError(`Failed to delete auto-reset: ${error.message}`);
            return false;
        }
    }

    // Add this method after displayCurrentAutoResets
    async manuallyTriggerReset(quizName) {
        try {
            console.log(`Manually triggering reset for quiz: ${quizName}`);
            
            // Confirm with the user
            const confirmed = confirm(`Are you sure you want to reset all completed ${this.formatQuizName(quizName)} quizzes? This will reset progress for all users who have completed this quiz.`);
            
            if (!confirmed) {
                console.log('Reset cancelled by user');
                return;
            }
            
            // Show loading notification
            this.showInfo(`Processing reset for ${this.formatQuizName(quizName)} quiz...`);
            
            // Get all users
            const usersResponse = await this.apiService.getAllUsers();
            
            if (!usersResponse.success) {
                throw new Error(`Failed to get users: ${usersResponse.message}`);
            }
            
            const users = usersResponse.data || [];
            console.log(`Checking ${users.length} users for completed ${quizName} quizzes`);
            
            // First pass: check all users' quizResults to find completed quizzes
            // without making API calls (more efficient)
            console.log("First pass: checking quizResults for all users");
            const normalizedQuizName = quizName.toLowerCase().trim();
            let completedUsers = [];
            
            for (const user of users) {
                if (user.quizResults && Array.isArray(user.quizResults)) {
                    const quizResult = user.quizResults.find(r => 
                        r.quizName && r.quizName.toLowerCase().trim() === normalizedQuizName);
                    
                    if (quizResult && quizResult.questionsAnswered >= 15) {
                        console.log(`First pass: User ${user.username} has completed ${quizName} quiz with ${quizResult.questionsAnswered} questions`);
                        completedUsers.push(user.username);
                    }
                }
            }
            
            console.log(`First pass found ${completedUsers.length} users who completed the quiz`);
            
            // Second pass: check remaining users with API calls
            console.log("Second pass: checking quizProgress with API for remaining users");
            const skippedUsers = [];
            
            for (const user of users) {
                // Skip users already identified as having completed the quiz
                if (completedUsers.includes(user.username)) {
                    console.log(`Skipping API check for ${user.username} - already identified as completed`);
                    continue;
                }
                
                console.log(`Checking user ${user.username} for completed ${quizName} quiz`);
                
                try {
                    console.log(`Checking quizProgress for ${user.username}`);
                    
                    // Add a timeout to prevent hanging on unresponsive API calls
                    const progressResponse = await Promise.race([
                        this.apiService.getUserQuizProgress(user.username, quizName),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('API call timeout')), 5000))
                    ]);
                    
                    if (progressResponse.success && progressResponse.data) {
                        const progress = progressResponse.data;
                        console.log(`${user.username} quizProgress data:`, progress);
                        
                        // Check if user has completed the quiz - ONLY check question count
                        const isCompleted = progress.questionsAnswered >= 15 || 
                                         (progress.questionHistory && progress.questionHistory.length >= 15);
                        
                        if (isCompleted) {
                            console.log(`User ${user.username} has completed ${quizName} quiz (from quizProgress)`);
                            completedUsers.push(user.username);
                        } else {
                            console.log(`User ${user.username} has NOT completed ${quizName} quiz (from quizProgress)`);
                            skippedUsers.push(user.username);
                        }
                    } else {
                        console.log(`No progress data found for ${user.username} on ${quizName}`);
                        skippedUsers.push(user.username);
                    }
                } catch (error) {
                    console.error(`Error checking progress for user ${user.username}:`, error);
                    skippedUsers.push(user.username);
                }
            }
            
            console.log(`Found ${completedUsers.length} users who completed ${quizName} quiz: ${completedUsers.join(', ')}`);
            console.log(`Skipped ${skippedUsers.length} users who haven't completed ${quizName} quiz: ${skippedUsers.join(', ')}`);
            
            if (completedUsers.length === 0) {
                this.showInfo(`No users have completed the ${this.formatQuizName(quizName)} quiz`);
                return;
            }
            
            this.showInfo(`Processing reset for ${completedUsers.length} users...`);
            
            // Reset each user's quiz
            let successCount = 0;
            for (const username of completedUsers) {
                try {
                    // Reset the quiz progress
                    const resetResponse = await this.apiService.resetQuizProgress(username, quizName);
                    
                    if (resetResponse.success) {
                        successCount++;
                        console.log(`Reset ${username}'s ${quizName} quiz`);
                    } else {
                        console.error(`Failed to reset ${username}'s ${quizName} quiz:`, resetResponse.message);
                    }
                } catch (error) {
                    console.error(`Error resetting ${username}'s ${quizName} quiz:`, error);
                }
            }
            
            // Update lastReset time for the auto-reset setting
            await this.apiService.updateAutoResetLastResetTime(quizName);
            
            // Calculate and update next reset time
            const setting = this.autoResetSettings[quizName];
            if (setting) {
                const newNextResetTime = this.calculateNextResetTime(setting.resetPeriod);
                await this.apiService.saveAutoResetSetting(
                    quizName, 
                    setting.resetPeriod, 
                    true, 
                    newNextResetTime
                );
                
                console.log(`Updated next reset time for ${quizName} to ${newNextResetTime}`);
            }
            
            // Reload settings to update the UI
            await this.loadAutoResetSettings();
            
            // Show success message
            this.showSuccess(`Successfully reset ${successCount} out of ${completedUsers.length} users for the ${this.formatQuizName(quizName)} quiz`);
            
        } catch (error) {
            console.error(`Error manually triggering reset for ${quizName}:`, error);
            this.showInfo(`Failed to reset quiz: ${error.message}`, 'error');
        }
    }

    // Helper method to show success messages
    showSuccess(message) {
        // Use the showInfo method with 'success' type
        this.showInfo(message, 'success');
    }

    // Delete an auto reset setting
    async deleteAutoResetSetting(quizName) {
        try {
            const confirmed = confirm(`Are you sure you want to delete the auto-reset setting for ${this.formatQuizName(quizName)}?`);
            if (!confirmed) return;
            
            const response = await this.apiService.deleteAutoResetSetting(quizName);
            
            if (response.success) {
                // Remove from local settings
                if (this.autoResetSettings && this.autoResetSettings[quizName]) {
                    delete this.autoResetSettings[quizName];
                }
                
                // Update the display
                this.displayAutoResetSettings();
                
                // Show success message
                this.showInfo(`Auto-reset setting for ${quizName} deleted`);
            } else {
                throw new Error(response.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error deleting auto-reset setting:', error);
            this.showInfo(`Failed to delete auto-reset setting: ${error.message}`, 'error');
        }
    }

    // Save auto reset setting for a quiz
    async saveAutoResetSetting(quizName, resetPeriod) {
        try {
            // Calculate the next reset time before saving
            const nextResetTime = this.calculateNextResetTime(resetPeriod);
            
            // Call the API to save the setting, including the calculated nextResetTime
            const response = await this.apiService.saveAutoResetSetting(quizName, resetPeriod, true, nextResetTime);
            
            if (response.success) {
                // Update local settings
                if (!this.autoResetSettings) {
                    this.autoResetSettings = {};
                }
                
                // Store the updated settings
                this.autoResetSettings[quizName] = response.data || { 
                    resetPeriod, 
                    nextResetTime,
                    enabled: true
                };
                
                console.log(`Auto-reset set for ${quizName} with period ${resetPeriod}, next reset at ${nextResetTime}`);
                
                // Update the UI
                this.displayAutoResetSettings();
                
                // Show success message
                this.showInfo(`Auto-reset for ${quizName} ${response.data ? 'updated' : 'enabled'}`);
                
                // Force an immediate check for scheduled resets to process any already completed quizzes
                this.checkScheduledResets()
                    .then(() => console.log('Checked for scheduled resets after saving setting'))
                    .catch(err => console.error('Error checking scheduled resets:', err));
                
                return response.data;
            } else {
                throw new Error(response.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error saving auto-reset setting:', error);
            this.showInfo(`Failed to save auto-reset setting: ${error.message}`, 'error');
            throw error;
        }
    }
    
    // Calculate the next reset time based on the period
    calculateNextResetTime(resetPeriod) {
        const now = new Date();
        
        // If resetPeriod is a number, it's in minutes
        if (typeof resetPeriod === 'number') {
            // Calculate next reset time from now
            const nextReset = new Date(now.getTime() + (resetPeriod * 60 * 1000));
            console.log(`Calculated next reset time: ${nextReset.toISOString()} (${resetPeriod} minutes from now)`);
            return nextReset.toISOString();
        }
        
        // For string-based periods (daily, weekly, monthly)
        let nextReset = new Date(now);
        nextReset.setHours(0, 0, 0, 0); // Reset to midnight
        
        switch (resetPeriod) {
            case 'daily':
                // Next day at midnight
                nextReset.setDate(nextReset.getDate() + 1);
                break;
            case 'weekly':
                // Next Sunday at midnight
                const daysUntilSunday = (7 - nextReset.getDay()) % 7;
                nextReset.setDate(nextReset.getDate() + (daysUntilSunday || 7));
                break;
            case 'monthly':
                // First day of next month
                nextReset.setMonth(nextReset.getMonth() + 1);
                nextReset.setDate(1);
                break;
            default:
                // Default to daily
                nextReset.setDate(nextReset.getDate() + 1);
        }
        
        console.log(`Calculated next reset time: ${nextReset.toISOString()} (${resetPeriod})`);
        return nextReset.toISOString();
    }

    // Shows edit modal for auto reset settings
    showAutoResetEditModal(quizName) {
        // Get the current settings for this quiz
        const settings = this.autoResetSettings[quizName] || {};
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Edit Auto-Reset for ${this.formatQuizName(quizName)}</h3>
                <form id="edit-auto-reset-form">
                    <div class="form-group">
                        <label>Reset Period:</label>
                        <select id="edit-reset-period">
                            <option value="1" ${settings.resetPeriod === 1 ? 'selected' : ''}>1 Minute</option>
                            <option value="10" ${settings.resetPeriod === 10 ? 'selected' : ''}>10 Minutes</option>
                            <option value="1440" ${settings.resetPeriod === 1440 ? 'selected' : ''}>1 Day</option>
                            <option value="10080" ${settings.resetPeriod === 10080 ? 'selected' : ''}>1 Week</option>
                            <option value="43200" ${settings.resetPeriod === 43200 ? 'selected' : ''}>1 Month</option>
                            <option value="129600" ${settings.resetPeriod === 129600 ? 'selected' : ''}>3 Months</option>
                            <option value="259200" ${settings.resetPeriod === 259200 ? 'selected' : ''}>6 Months</option>
                            <option value="525600" ${settings.resetPeriod === 525600 ? 'selected' : ''}>1 Year</option>
                        </select>
                    </div>
                    <button type="submit" class="action-button">Save Changes</button>
                </form>
            </div>
        `;
        
        // Add modal styles if they don't exist
        if (!document.getElementById('auto-reset-modal-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'auto-reset-modal-styles';
            styleElement.textContent = `
                .modal {
                    display: flex;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0,0,0,0.5);
                    justify-content: center;
                    align-items: center;
                }
                
                .modal-content {
                    background-color: white;
                    padding: 25px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    width: 90%;
                    max-width: 500px;
                    position: relative;
                }
                
                .close-modal {
                    position: absolute;
                    right: 15px;
                    top: 15px;
                    font-size: 24px;
                    color: #aaa;
                    cursor: pointer;
                }
                
                .close-modal:hover {
                    color: #333;
                }
            `;
            document.head.appendChild(styleElement);
        }
        
        // Add to the page
        document.body.appendChild(modal);
        
        // Setup event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#edit-auto-reset-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const resetPeriod = parseInt(modal.querySelector('#edit-reset-period').value);
            
            try {
                // Update the auto reset settings
                await this.saveAutoResetSetting(quizName, resetPeriod);
                
                // Close the modal
                modal.remove();
            } catch (error) {
                console.error('Error saving auto-reset settings:', error);
                this.showInfo(`Failed to save auto-reset settings: ${error.message}`, 'error');
            }
        });
    }

    // New methods for badges section
    setupBadgesSection() {
        console.log('Setting up badges section');
        // Populate user dropdown
        this.populateBadgesUserDropdown();
    }
    
    populateBadgesUserDropdown() {
        const userDropdown = document.getElementById('badgesUserDropdown');
        if (!userDropdown) return;
        
        // Clear existing options
        userDropdown.innerHTML = '<option value="">-- Select User --</option>';
        
        // Sort users alphabetically by username
        const sortedUsers = [...this.users].sort((a, b) => 
            a.username.localeCompare(b.username)
        );
        
        // Add user options
        sortedUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            userDropdown.appendChild(option);
        });
    }
    
    async loadUserBadges(username) {
        try {
            // Validate username
            if (!username || typeof username !== 'string' || !username.trim()) {
                console.error('[Badges] Invalid username provided:', username);
                const badgesContainer = document.getElementById('userBadgesContainer');
                badgesContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: #dc3545;">
                        <div style="font-size: 60px; margin-bottom: 20px;"><i class="fa-solid fa-exclamation-circle"></i></div>
                        <h3 style="margin-bottom: 10px;">Invalid User</h3>
                        <p>No user selected or invalid username.</p>
                    </div>
                `;
                return;
            }
            // Ensure users are loaded
            if (!this.users || !Array.isArray(this.users) || this.users.length === 0) {
                console.error('[Badges] Users not loaded yet.');
                const badgesContainer = document.getElementById('userBadgesContainer');
                badgesContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: #dc3545;">
                        <div style="font-size: 60px; margin-bottom: 20px;"><i class="fa-solid fa-exclamation-circle"></i></div>
                        <h3 style="margin-bottom: 10px;">Users Not Loaded</h3>
                        <p>User data is not available yet. Please wait or refresh the page.</p>
                    </div>
                `;
                return;
            }
            // Check if username exists in loaded users
            const userExists = this.users.some(u => u.username === username);
            if (!userExists) {
                console.error('[Badges] Username not found in loaded users:', username);
                const badgesContainer = document.getElementById('userBadgesContainer');
                badgesContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: #dc3545;">
                        <div style="font-size: 60px; margin-bottom: 20px;"><i class="fa-solid fa-exclamation-circle"></i></div>
                        <h3 style="margin-bottom: 10px;">User Not Found</h3>
                        <p>The selected user does not exist in the loaded user list.</p>
                    </div>
                `;
                return;
            }
            // Show loading state
            const badgesContainer = document.getElementById('userBadgesContainer');
            badgesContainer.innerHTML = `
                <div class="loading-message" style="text-align: center; padding: 40px 20px;">
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <p style="margin-top: 15px;">Loading badges for ${username}...</p>
                </div>
            `;
            // Set a timeout to show an error message if it takes too long
            const timeoutId = setTimeout(() => {
                console.warn('Badge loading is taking too long, showing timeout message');
                badgesContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: #e67e22;">
                        <div style="font-size: 60px; margin-bottom: 20px;">
                            <i class="fa-solid fa-clock"></i>
                        </div>
                        <h3 style="margin-bottom: 10px;">Loading is taking longer than expected</h3>
                        <p>The server might be slow to respond. You can try again later or refresh the page.</p>
                        <button id="retry-badges-btn" class="btn btn-primary mt-3" style="margin-top: 15px; padding: 8px 16px; background-color: #4e73df; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry Loading</button>
                    </div>
                `;
                document.getElementById('retry-badges-btn')?.addEventListener('click', () => {
                    this.loadUserBadges(username);
                });
            }, 15000); // 15 seconds timeout
            // Call API to get user badges
            console.log(`[Badges] Requesting badges for user: '${username}'`);
            const response = await this.apiService.getUserBadgesByAdmin(username);
            console.log(`[Badges] Received badges response for '${username}':`, response);
            // Clear the timeout as we got a response
            clearTimeout(timeoutId);
            if (!response.success) {
                throw new Error(response.message || 'Failed to load badges');
            }
            const badgesData = response.data;
            console.log('[Badges] Badges data received:', badgesData);
            // Generate badges HTML
            let badgesHTML = '';
            if (!badgesData.badges || badgesData.badges.length === 0) {
                badgesHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 80px; color: #ccc; margin-bottom: 20px;">
                            <i class="fa-solid fa-award"></i>
                        </div>
                        <h3 style="color: #555; margin-bottom: 10px;">No Badges Available</h3>
                        <p style="color: #777;">${username} hasn't started any quizzes yet.</p>
                    </div>
                `;
            } else {
                badgesHTML = `
                    <div class="badges-summary">
                        <div class="progress-container">
                            <div class="progress-header">
                                <div class="progress-title">Achievement Progress</div>
                                <div class="progress-text">${badgesData.earnedCount}/${badgesData.totalBadges} Badges</div>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.round((badgesData.earnedCount / badgesData.totalBadges) * 100)}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="badges-container">
                `;
                // Add each badge card
                badgesData.badges.forEach(badge => {
                    // Add special 'perfect' class for 100% scores
                    const isPerfectScore = badge.earned && badge.scorePercentage === 100;
                    const cardClasses = `badge-card ${badge.earned ? '' : 'locked'} ${isPerfectScore ? 'perfect' : ''}`;
                    
                    // Format completion date if available
                    let completionDateHtml = '';
                    if (badge.completionDate) {
                        const date = new Date(badge.completionDate);
                        const formattedDate = date.toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        completionDateHtml = `<div class="badge-completion-date">Completed: ${formattedDate}</div>`;
                    }
                    
                    // Format score information
                    let scoreInfoHtml = '';
                    if (badge.earned && badge.scorePercentage !== undefined) {
                        if (badge.scorePercentage === 100) {
                            scoreInfoHtml = `<div class="badge-score perfect-score">Score: ${badge.scorePercentage}%</div>`;
                        } else {
                            scoreInfoHtml = `<div class="badge-score">Score: ${badge.scorePercentage}%</div>`;
                        }
                    } else if (!badge.earned && badge.scorePercentage !== undefined && badge.scorePercentage > 0) {
                        // Check if this is a failed quiz (has score but not earned) or in-progress
                        if (badge.isFromQuizResults || badge.hasCompletedAllQuestions) {
                            // Quiz completed but failed (< 80%)
                            scoreInfoHtml = `<div class="badge-score-failed">Failed</div>`;
                        } else {
                            // In-progress quiz
                            scoreInfoHtml = `<div class="badge-score-progress">Current: ${badge.scorePercentage}% (Need: 80%)</div>`;
                        }
                    } else if (!badge.earned) {
                        // Not started
                        scoreInfoHtml = `<div class="badge-score-requirement">Requires: 80%+ score</div>`;
                    }
                    
                    // Get badge image path
                    const imagePath = this.getBadgeImage(badge.quizId);
                    const badgeIconHtml = imagePath ? 
                        `<img src="${imagePath}" alt="${badge.name}" class="badge-image" onerror="this.onerror=null; this.src='../assets/badges/default.svg';">` : 
                        `<i class="${badge.icon}"></i>`;
                    
                    badgesHTML += `
                        <div class="${cardClasses}" id="badge-${badge.id}">
                            <div class="badge-icon">
                                ${badgeIconHtml}
                            </div>
                            <h3 class="badge-name">${badge.name}</h3>
                            <p class="badge-description">${badge.description}</p>
                            ${scoreInfoHtml}
                            ${completionDateHtml}
                            ${!badge.earned ? '<div class="lock-icon"><i class="fa-solid fa-lock"></i></div>' : ''}
                        </div>
                    `;
                });
                badgesHTML += '</div>'; // Close badges-container
            }
            // Update the container
            badgesContainer.innerHTML = badgesHTML;
        } catch (error) {
            console.error('[Badges] Error loading badges:', error);
            const badgesContainer = document.getElementById('userBadgesContainer');
            badgesContainer.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #dc3545;">
                    <div style="font-size: 60px; margin-bottom: 20px;">
                        <i class="fa-solid fa-exclamation-circle"></i>
                    </div>
                    <h3 style="margin-bottom: 10px;">Error Loading Badges</h3>
                    <p>${error.message || 'Failed to load badges. Please try again.'}</p>
                    <button id="retry-badges-btn" class="btn btn-danger mt-3" style="margin-top: 15px; padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
                </div>
            `;
            document.getElementById('retry-badges-btn')?.addEventListener('click', () => {
                this.loadUserBadges(username);
            });
        }
    }
    
    // Helper method for formatting dates in badge display
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    }

    // Get badge image for a specific quiz (matching BadgeService implementation)
    getBadgeImage(quizId) {
        // Badge image mapping - only for quizzes that actually exist in QUIZ_CATEGORIES
        const badgeImageMapping = {
            // Core QA Skills
            'tester-mindset': 'tester-mindset.svg',
            'communication': 'communication.svg',
            'initiative': 'initiative.svg',
            'standard-script-testing': 'script-testing.svg',
            'fully-scripted': 'script-testing.svg',
            'exploratory': 'exploratory.svg',
            
            // Technical Testing
            'script-metrics-troubleshooting': 'metrics.svg',
            'locale-testing': 'locale.svg',
            'build-verification': 'build.svg',
            'test-types-tricks': 'test-types.svg',
            'test-support': 'test-support.svg',
            'sanity-smoke': 'sanity-smoke.svg',
            
            // Project Management
            'time-management': 'time-management.svg',
            'risk-analysis': 'risk.svg',
            'risk-management': 'risk.svg',
            'non-functional': 'non-functional.svg',
            'issue-verification': 'issue-verification.svg',
            'issue-tracking-tools': 'issue-tracking.svg',
            'raising-tickets': 'tickets.svg',
            
            // Content Testing
            'cms-testing': 'cms-testing.svg',
            'email-testing': 'email.svg',
            'content-copy': 'content-copy.svg',
            'reports': 'reports.svg',
            
            // Interview Preparation
            'automation-interview': 'automation.svg',
            'functional-interview': 'functional-interview.svg'
        };

        // Convert quiz-id format to quizId for lookup
        const normalizedId = quizId.replace('quiz-', '');
        
        // Force specific image paths for problem quiz types
        if (normalizedId.toLowerCase().includes('sanity') || normalizedId.toLowerCase().includes('smoke')) {
            return '../assets/badges/sanity-smoke.svg';
        } else if (normalizedId.toLowerCase().includes('cms')) {
            return '../assets/badges/cms-testing.svg';
        } else if (normalizedId.toLowerCase().includes('exploratory')) {
            return '../assets/badges/exploratory.svg';
        }
        
        // Check if we have a specific image for this quiz
        if (badgeImageMapping[normalizedId]) {
            return `../assets/badges/${badgeImageMapping[normalizedId]}`;
        }
        
        // Try to extract category from the quiz ID
        const parts = normalizedId.split('-');
        if (parts.length > 1) {
            const category = parts[0];
            if (badgeImageMapping[category]) {
                return `../assets/badges/${badgeImageMapping[category]}`;
            }
        }
        
        // Fallback to a default image if no specific match
        return '../assets/badges/default.svg';
    }

    // Fix for export functions
    exportUserData(type) {
        if (type === 'simple') {
            this.exportSimpleCSV();
        } else {
            this.exportUserDataToCSV();
        }
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
                    
                    // Calculate score using the same logic as admin badges
                    let score = 0;
                    if (result && result.score !== undefined) {
                        score = result.score;
                    } else if (progress && progress.experience !== undefined && questionsAnswered >= 15) {
                        // Calculate score from experience for completed quizzes
                        score = Math.round(((progress.experience + 150) / 450) * 100);
                    } else if (progress && progress.questionHistory && progress.questionHistory.length > 0) {
                        // Calculate score from question history
                        const correctAnswers = progress.questionHistory.filter(q => q.isCorrect).length;
                        score = Math.round((correctAnswers / progress.questionHistory.length) * 100);
                    } else if (result && result.questionHistory && result.questionHistory.length > 0) {
                        // Calculate score from result question history
                        const correctAnswers = result.questionHistory.filter(q => q.isCorrect).length;
                        score = Math.round((correctAnswers / result.questionHistory.length) * 100);
                    }
                    
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
                const overallProgress = this.calculateQuestionsAnsweredPercent(user).toFixed(1);
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
                    
                    // Calculate score using the same logic as admin badges
                    let score = 0;
                    if (result && result.score !== undefined) {
                        score = result.score;
                    } else if (progress && progress.experience !== undefined && questionsAnswered >= 15) {
                        // Calculate score from experience for completed quizzes
                        score = Math.round(((progress.experience + 150) / 450) * 100);
                    } else if (progress && progress.questionHistory && progress.questionHistory.length > 0) {
                        // Calculate score from question history
                        const correctAnswers = progress.questionHistory.filter(q => q.isCorrect).length;
                        score = Math.round((correctAnswers / progress.questionHistory.length) * 100);
                    } else if (result && result.questionHistory && result.questionHistory.length > 0) {
                        // Calculate score from result question history
                        const correctAnswers = result.questionHistory.filter(q => q.isCorrect).length;
                        score = Math.round((correctAnswers / result.questionHistory.length) * 100);
                    }
                    
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

    // Initialize custom export section
    initializeCustomExport() {
        console.log('Initializing custom export section...');
        console.log('Users available:', this.users ? this.users.length : 'none');
        
        // Ensure users are loaded before populating
        if (!this.users || !Array.isArray(this.users) || this.users.length === 0) {
            console.log('Users not loaded yet, waiting...');
            setTimeout(() => this.initializeCustomExport(), 500);
            return;
        }
        
        this.populateUsersCheckboxList();
        this.populateQuizzesCheckboxList();
        this.setupCustomExportEventListeners();
    }

    // Populate users checkbox list
    populateUsersCheckboxList() {
        const container = document.getElementById('usersCheckboxList');
        if (!container || !this.users || !Array.isArray(this.users)) {
            console.log('Cannot populate users list - container or users not found');
            return;
        }

        const sortedUsers = [...this.users].sort((a, b) => a.username.localeCompare(b.username));
        
        container.innerHTML = sortedUsers.map(user => `
            <div class="checkbox-item">
                <input type="checkbox" id="user-${user.username}" value="${user.username}" class="user-checkbox">
                <label for="user-${user.username}">${user.username}</label>
            </div>
        `).join('');

        console.log(`Populated ${sortedUsers.length} users in checkbox list`);
    }

    // Populate quizzes checkbox list
    populateQuizzesCheckboxList() {
        const container = document.getElementById('quizzesCheckboxList');
        if (!container) {
            console.log('Cannot populate quizzes list - container not found');
            return;
        }

        // Use the correct QUIZ_CATEGORIES from quiz-list.js
        const QUIZ_CATEGORIES = {
            'Core QA Skills': [
                'tester-mindset',
                'communication',
                'initiative',
                'standard-script-testing',
                'fully-scripted',
                'exploratory'
            ],
            'Technical Testing': [
                'script-metrics-troubleshooting',
                'locale-testing',
                'build-verification',
                'test-types-tricks',
                'test-support',
                'sanity-smoke'
            ],
            'Project Management': [
                'time-management',
                'risk-analysis',
                'risk-management',
                'non-functional',
                'issue-verification',
                'issue-tracking-tools',
                'raising-tickets'
            ],
            'Content Testing': [
                'cms-testing',
                'email-testing',
                'content-copy',
                'reports'
            ],
            'Interview Preparation': [
                'automation-interview',
                'functional-interview'
            ]
        };

        const allQuizzes = Object.values(QUIZ_CATEGORIES).flat();
        
        // Group by category for better organization
        let html = '';
        Object.entries(QUIZ_CATEGORIES).forEach(([category, quizzes]) => {
            html += `<div class="quiz-category-group">
                <div class="category-header">
                    <strong>${category}</strong>
                    <button type="button" class="category-select-all" data-category="${category}">Select All</button>
                </div>`;
            
            quizzes.forEach(quiz => {
                const displayName = this.formatQuizName(quiz);
                html += `
                    <div class="checkbox-item">
                        <input type="checkbox" id="quiz-${quiz}" value="${quiz}" class="quiz-checkbox" data-category="${category}">
                        <label for="quiz-${quiz}">${displayName}</label>
                    </div>
                `;
            });
            
            html += '</div>';
        });

        container.innerHTML = html;
        console.log(`Populated ${allQuizzes.length} quizzes in checkbox list`);
    }

    // Setup custom export event listeners
    setupCustomExportEventListeners() {
        // Select/Deselect All Users
        document.getElementById('selectAllUsers')?.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.user-checkbox');
            checkboxes.forEach(cb => cb.checked = true);
            this.updateCustomExportCounts();
        });

        document.getElementById('deselectAllUsers')?.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.user-checkbox');
            checkboxes.forEach(cb => cb.checked = false);
            this.updateCustomExportCounts();
        });

        // Select/Deselect All Quizzes
        document.getElementById('selectAllQuizzes')?.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.quiz-checkbox');
            checkboxes.forEach(cb => cb.checked = true);
            this.updateCustomExportCounts();
        });

        document.getElementById('deselectAllQuizzes')?.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.quiz-checkbox');
            checkboxes.forEach(cb => cb.checked = false);
            this.updateCustomExportCounts();
        });

        // Category select all buttons
        document.querySelectorAll('.category-select-all').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                const checkboxes = document.querySelectorAll(`.quiz-checkbox[data-category="${category}"]`);
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                checkboxes.forEach(cb => cb.checked = !allChecked);
                this.updateCustomExportCounts();
            });
        });

        // Individual checkbox change listeners
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('user-checkbox') || e.target.classList.contains('quiz-checkbox')) {
                this.updateCustomExportCounts();
            }
        });

        // Initial count update
        this.updateCustomExportCounts();
    }

    // Update counts and enable/disable export button
    updateCustomExportCounts() {
        const selectedUsers = document.querySelectorAll('.user-checkbox:checked').length;
        const selectedQuizzes = document.querySelectorAll('.quiz-checkbox:checked').length;
        
        document.getElementById('selectedUsersCount').textContent = selectedUsers;
        document.getElementById('selectedQuizzesCount').textContent = selectedQuizzes;
        
        const exportBtn = document.getElementById('exportCustomCSV');
        if (exportBtn) {
            exportBtn.disabled = selectedUsers === 0 || selectedQuizzes === 0;
        }
    }

    // Export custom data
    async exportCustomData() {
        try {
            const selectedUsernames = Array.from(document.querySelectorAll('.user-checkbox:checked'))
                .map(cb => cb.value);
            const selectedQuizzes = Array.from(document.querySelectorAll('.quiz-checkbox:checked'))
                .map(cb => cb.value);

            if (selectedUsernames.length === 0 || selectedQuizzes.length === 0) {
                this.showError('Please select at least one user and one quiz');
                return;
            }

            console.log('Exporting custom data:', { 
                users: selectedUsernames.length, 
                quizzes: selectedQuizzes.length 
            });

            // Filter users to only selected ones
            const selectedUsers = this.users.filter(user => selectedUsernames.includes(user.username));

            // Create CSV header
            const headers = ['Username', 'Email', 'Account Type', 'Last Active', ...selectedQuizzes.map(quiz => this.formatQuizName(quiz))];
            
            // Create CSV content
            const csvRows = [headers];
            
            selectedUsers.forEach(user => {
                const row = [
                    user.username || '',
                    user.email || '',
                    user.accountType || 'user',
                    this.formatDate(this.getLastActiveDate(user))
                ];

                // Add quiz scores for selected quizzes only
                selectedQuizzes.forEach(quizId => {
                    let score = 0;
                    
                    // Try to get score from quizResults first
                    const result = user.quizResults?.find(r => r.quizName?.toLowerCase() === quizId.toLowerCase());
                    if (result?.score !== undefined) {
                        score = result.score;
                    } else {
                        // Calculate from experience if quiz is completed
                        const progress = user.quizProgress?.[quizId.toLowerCase()];
                        if (progress?.experience !== undefined) {
                            score = Math.round(((progress.experience + 150) / 450) * 100);
                        } else {
                            // Calculate from question history
                            const questionHistory = result?.questionHistory || progress?.questionHistory;
                            if (questionHistory && Array.isArray(questionHistory) && questionHistory.length > 0) {
                                const correctAnswers = questionHistory.filter(q => q.isCorrect).length;
                                score = Math.round((correctAnswers / questionHistory.length) * 100);
                            }
                        }
                    }
                    
                    row.push(`${score}%`);
                });

                csvRows.push(row);
            });

            // Convert to CSV string
            const csvContent = csvRows.map(row => 
                row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
            ).join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `custom_export_${selectedUsernames.length}users_${selectedQuizzes.length}quizzes_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showSuccess(`Custom export completed: ${selectedUsers.length} users, ${selectedQuizzes.length} quizzes`);

        } catch (error) {
            console.error('Error exporting custom data:', error);
            this.showError('Failed to export custom data');
        }
    }

    // Helper method to refresh the guide settings list
    refreshGuideSettingsList(setupEventListeners = true) {
        console.log(`Refreshing guide settings list (setupEventListeners=${setupEventListeners})...`);
        const container = document.getElementById('guide-settings-container');
        if (!container) {
            console.warn('Guide settings container not found');
            return;
        }
        
        const guideSettingsList = container.querySelector('#guide-settings-list');
        if (!guideSettingsList) {
            console.warn('Guide settings list element not found');
            return;
        }
        
        // Update the HTML content
        guideSettingsList.innerHTML = this.generateGuideSettingsList(this.guideSettings);
        console.log(`Updated guide settings list with ${Object.keys(this.guideSettings || {}).length} guides`);
        
        // Only set up event listeners if requested
        if (setupEventListeners) {
            // Re-initialize all event listeners
            // We need to get the original setupGuideItemEventListeners function from the displayGuideSettings method
            if (typeof container.setupGuideItemEventListeners === 'function') {
                console.log('Re-initializing all event listeners for guide settings');
                container.setupGuideItemEventListeners();
            } else {
                console.warn('setupGuideItemEventListeners function not found on container');
                // If we can't find the setup function on the container, we need to reattach the 
                // edit button event listeners manually
                const editButtons = container.querySelectorAll('.edit-guide-btn');
                editButtons.forEach(button => {
                    button.addEventListener('click', async () => {
                        const quizName = button.getAttribute('data-quiz');
                        if (quizName && this.guideSettings[quizName]) {
                            const currentUrl = this.guideSettings[quizName].url || '';
                            const currentEnabled = this.guideSettings[quizName].enabled || false;
                            
                            // Simple URL prompt approach - guaranteed to work
                            const newUrl = prompt(`Edit URL for ${this.formatQuizName(quizName)}:`, currentUrl);
                            if (newUrl === null) return; // User canceled
                            
                            if (!newUrl.trim()) {
                                alert('Please enter a URL');
                                return;
                            }
                            
                            try {
                                // Validate URL format
                                new URL(newUrl);
                            } catch (e) {
                                alert('Please enter a valid URL (include http:// or https://)');
                                return;
                            }
                            
                            // Simple confirm for enabled state - store result but don't show another message yet
                            const newEnabled = confirm(`Enable guide for ${this.formatQuizName(quizName)}?`);
                            
                            try {
                                // Use a separate method that doesn't show the initial loading message
                                await this.saveGuideSettingsWithoutInitialMessage(quizName, newUrl, newEnabled);
                            } catch (error) {
                                console.error('Error during guide edit:', error);
                                this.showInfo('Failed to save guide settings', 'error');
                            }
                        }
                    });
                });
            }
        }
        
        // Always reattach test button listeners regardless of setupEventListeners value
        // since these are simple and don't trigger a save operation
        const testButtons = container.querySelectorAll('.test-guide-btn');
        testButtons.forEach(button => {
            const url = button.getAttribute('data-url');
            if (url) {
                button.removeAttribute('disabled');
                button.addEventListener('click', () => {
                    window.open(url, '_blank');
                });
            } else {
                button.setAttribute('disabled', 'true');
            }
        });
    }

    async saveGuideSettingsWithoutInitialMessage(quiz, url, enabled) {
        try {
            const normalizedQuiz = this.quizProgressService && typeof this.quizProgressService.normalizeQuizName === 'function'
                ? this.quizProgressService.normalizeQuizName(quiz)
                : quiz;
            // ... existing code ...
            this.guideSettings[normalizedQuiz] = { url, enabled };
            // ... existing code ...
            const response = await this.apiService.saveGuideSetting(normalizedQuiz, url, enabled);
            // ... existing code ...
        } catch (error) {
            // ... existing code ...
        }
    }

    // Helper method to calculate percentage of total questions answered (out of 375)
    calculateQuestionsAnsweredPercent(user) {
        if (!user) return 0;

        let totalQuestionsAnswered = 0;
        const totalPossibleQuestions = 375; // 25 quizzes * 15 questions
        
        // Sum up questions answered across all quizzes
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
                }
            });
        }

        // Calculate progress as percentage of total possible questions
        return (totalQuestionsAnswered / totalPossibleQuestions) * 100;
    }

    // Calculate the average score for a user based on total questions answered percentage
    calculateAverageScore(user) {
        if (!user) return 0;
        return this.calculateQuestionsAnsweredPercent(user);
    }

    // Add methods from AdminDashboard base class
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

    async preloadTimerSettings() {
        try {
            // First check if there's already a value in localStorage
            const storedValue = localStorage.getItem('quizTimerValue');
            if (storedValue !== null) {
                // Parse the value, ensuring it's a valid number between 0-300
                let timerValue = parseInt(storedValue, 10);
                
                // Validate the value
                if (isNaN(timerValue) || timerValue < 0 || timerValue > 300) {
                    console.warn('Invalid timer value in localStorage, resetting to default');
                    timerValue = 60; // Default to 60 seconds
                    localStorage.setItem('quizTimerValue', timerValue.toString());
                }
                
                this.timerSettings.defaultSeconds = timerValue;
                console.log('Using timer settings from localStorage:', timerValue);
            }
            
            // Try to get settings from API (but don't block on failure)
            try {
                const settings = await this.apiService.getQuizTimerSettings();
                if (settings.success && settings.data) {
                    // Use defaultSeconds consistently
                    const defaultSeconds = settings.data.defaultSeconds;
                    if (defaultSeconds !== undefined) {
                        this.timerSettings.defaultSeconds = defaultSeconds;
                        
                        // Save to localStorage for quizzes to use
                        localStorage.setItem('quizTimerValue', defaultSeconds.toString());
                        console.log('Preloaded timer settings from API:', defaultSeconds);
                    }
                }
            } catch (apiError) {
                console.warn('Failed to get timer settings from API, using localStorage value', apiError);
                
                // Ensure there's always a value in localStorage
                if (localStorage.getItem('quizTimerValue') === null) {
                    localStorage.setItem('quizTimerValue', '60'); // Default to 60 seconds
                    this.timerSettings.defaultSeconds = 60;
                }
            }
        } catch (error) {
            console.error('Failed to preload timer settings:', error);
            
            // Make sure we have a default value as fallback
            if (localStorage.getItem('quizTimerValue') === null) {
                localStorage.setItem('quizTimerValue', '60');
                this.timerSettings.defaultSeconds = 60;
            }
        }
    }

    // ... Add these utility methods after verifyAdminToken and preloadTimerSettings methods

    getLastActiveDate(user) {
        console.log('getLastActiveDate called with:', user ? user.username : 'undefined');
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

    formatDate(timestamp) {
        if (!timestamp || timestamp === 'Never') return 'Never';
        
        const date = new Date(timestamp);
        const now = new Date();
        
        // Check if invalid date
        if (isNaN(date.getTime())) return 'Invalid date';
        
        // For today, show time
        if (date.toDateString() === now.toDateString()) {
            return `Today ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }
        
        // For yesterday
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
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

    // ... existing code ...
    // Add a method to delete a user account
    async deleteUserAccount(username) {
        try {
            const response = await this.apiService.deleteUserAccount(username);
            if (!response.success) {
                throw new Error(response.message || 'Failed to delete user');
            }
            return response;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
    // ... existing code ...

    // Helper function to format quiz names from kebab-case to Title Case with more descriptive names
    formatQuizName(quizName) {
        if (!quizName) return '';

        // Map of quiz names to their display names
        const displayNames = {
            'exploratory': 'Exploratory Testing',
            'standard-script-testing': 'Standard Script Testing',
            'fully-scripted': 'Fully Scripted Testing',
            'script-metrics-troubleshooting': 'Script Metrics & Troubleshooting',
            'locale-testing': 'Locale & Internationalization Testing',
            'build-verification': 'Build Verification Testing',
            'test-types-tricks': 'Test Types & Techniques',
            'test-support': 'Test Support & Maintenance',
            'sanity-smoke': 'Sanity & Smoke Testing',
            'time-management': 'Time Management & Planning',
            'risk-analysis': 'Risk Analysis & Assessment',
            'risk-management': 'Risk Management & Mitigation',
            'non-functional': 'Non-Functional Testing',
            'issue-verification': 'Issue Verification & Validation',
            'issue-tracking-tools': 'Issue Tracking & Management Tools',
            'raising-tickets': 'Raising & Managing Tickets',
            'reports': 'Test Reports & Documentation',
            'cms-testing': 'CMS & Content Management Testing',
            'email-testing': 'Email & Communication Testing',
            'content-copy': 'Content & Copy Testing',
            'tester-mindset': 'Tester Mindset & Approach',
            'communication': 'Communication & Collaboration',
            'initiative': 'Initiative & Proactivity',
            'automation-interview': 'Automation Interview Preparation',
            'functional-interview': 'Functional Testing Interview'
        };

        // Return the display name if it exists, otherwise format the original name
        return displayNames[quizName] || quizName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

// Initialize the Admin2Dashboard when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Admin2Dashboard();
    
    // --- Move this function up so it's defined before use ---
    const updateAverageCompletionStat = (dashboardInstance) => {
        const averageCompletionElement = document.getElementById('averageCompletion');
        if (!averageCompletionElement) return;
        let totalQuestions = 0;
        let totalUsers = 0;
        if (dashboardInstance.users && Array.isArray(dashboardInstance.users)) {
            dashboardInstance.users.forEach(user => {
                let userQuestions = 0;
                if (dashboardInstance.quizTypes && Array.isArray(dashboardInstance.quizTypes)) {
                    dashboardInstance.quizTypes.forEach(quizType => {
                        if (typeof quizType === 'string') {
                            const progress = user.quizProgress?.[quizType.toLowerCase()];
                            const result = user.quizResults?.find(r => r.quizName.toLowerCase() === quizType.toLowerCase());
                            const questionsAnswered = result?.questionsAnswered || 
                                result?.questionHistory?.length ||
                                progress?.questionsAnswered || 
                                progress?.questionHistory?.length || 0;
                            userQuestions += questionsAnswered;
                        }
                    });
                }
                totalQuestions += userQuestions;
                totalUsers++;
            });
        }
        if (totalUsers > 0) {
            const avgQuestions = totalQuestions / totalUsers;
            const totalPossibleQuestions = 375;
            const avgPercentage = (avgQuestions / totalPossibleQuestions) * 100;
            averageCompletionElement.textContent = `${avgPercentage.toFixed(1)}%`;
            console.log(`Updated Average Completion stat to ${avgPercentage.toFixed(1)}%`);
        }
    };

    // ... existing code ...
    // Add specific listener for updateUsersList completion
    const originalUpdateUsersList = Admin2Dashboard.prototype.updateUsersList;
    Admin2Dashboard.prototype.updateUsersList = async function() {
        console.log('updateUsersList called, users:', this.users);
        await originalUpdateUsersList.apply(this, arguments);
        console.log("updateUsersList completed, forcing average score update");
        // setTimeout(forceUpdateAverageScores, 100); // Removed undefined function call
        updateAverageCompletionStat(this); // <-- Call here after users list is updated
    };

    // Remove the periodic update for average completion stat
    // setTimeout(updateAverageCompletionStat, 2000);
    // setInterval(updateAverageCompletionStat, 5000);

    // Patch quiz types loading to also update the stat
    const originalLoadQuizTypes = Admin2Dashboard.prototype.loadQuizTypes;
    if (originalLoadQuizTypes) {
        Admin2Dashboard.prototype.loadQuizTypes = async function() {
            await originalLoadQuizTypes.apply(this, arguments);
            updateAverageCompletionStat(this);
        };
    }

    // Patch loadUsers to also update the stat after users are loaded
    const originalLoadUsers = Admin2Dashboard.prototype.loadUsers;
    if (originalLoadUsers) {
        Admin2Dashboard.prototype.loadUsers = async function() {
            const result = await originalLoadUsers.apply(this, arguments);
            updateAverageCompletionStat(this);
            return result;
        };
    }


});