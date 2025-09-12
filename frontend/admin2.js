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

            // Note: updateUsersList() already called in loadUsers(), no need to call updateDashboard()
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
                
                // Display user cards with loading screen for API calls
                console.log('[Admin] Displaying user cards with accurate API data...');
                await this.updateUsersList();
                
                // Update statistics with basic data
                const stats = this.updateStatistics();
                this.updateStatisticsDisplay(stats);
                
                // Note: Progressive loading/enrichment is no longer needed since calculateUserQuizStats 
                // now fetches accurate data directly from the API when needed
                
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
        try {
            console.log('[Admin] Starting progressive user data loading...');
            
            // Show progress indicator
            this.updateProgressIndicator(0, 'Starting user data enrichment...');
            
            // Load user progress progressively to get accurate data
            console.log('[Admin] Loading user progress progressively to get accurate data...');
            await this.loadUserProgressProgressive();
            
            // Hide the progress indicator when complete
            this.hideProgressIndicator();
            
            // ENHANCED: Verify that we actually got data for users
            const usersWithData = this.users.filter(user => 
                (user.quizProgress && Object.keys(user.quizProgress).length > 0) ||
                (user.quizResults && user.quizResults.length > 0)
            );
            
            console.log(`[Admin] Progressive loading complete - ${usersWithData.length}/${this.users.length} users now have enriched data`);
            
            // Log sample data for debugging
            if (usersWithData.length > 0) {
                const sampleUser = usersWithData[0];
                console.log(`[Admin] Sample user data for ${sampleUser.username}:`, {
                    quizProgressKeys: Object.keys(sampleUser.quizProgress || {}),
                    quizResultsCount: sampleUser.quizResults ? sampleUser.quizResults.length : 0,
                    sampleQuizResult: sampleUser.quizResults ? sampleUser.quizResults[0] : null
                });
            }
            
        } catch (error) {
            console.error('[Admin] Error in progressive loading:', error);
            // On error, hide the progress indicator
            this.hideProgressIndicator();
        }
    }
    
    /**
     * Load user progress one by one and update cards progressively
     */
    async loadUserProgressProgressive() {
        const users = [...this.users]; // Copy array to avoid modification issues
        
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            try {
                console.log(`[Admin] Loading progress for user ${i + 1}/${users.length}: ${user.username}`);
                
                                // Load progress for this user
                await this.loadUserProgress(user.username);
                
                // Enrich with question history for completed quizzes
                await this.enrichQuizProgressWithQuestionHistory(user.username, user);
                
                // Update progress indicator
                const progress = Math.round((i + 1) / users.length * 100);
                this.updateProgressIndicator(progress, `Loading ${i + 1}/${users.length} users...`);
                
                // Small delay to avoid overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 200));
                
                        } catch (error) {
                console.warn(`[Admin] Failed to load progress for ${user.username}:`, error);
                // Continue with next user
            }
        }
    }
    

    

    
    /**
     * Calculate quiz statistics for a single user
     */
    async calculateUserQuizStats(user) {
        const hiddenQuizzes = user.hiddenQuizzes || [];
        const visibleQuizzes = this.quizTypes ? this.quizTypes.filter(quizType => {
            const quizLower = quizType.toLowerCase();
            return !hiddenQuizzes.includes(quizLower);
        }) : [];
        
        let quizzesAssigned = visibleQuizzes.length;
        let quizzesCompleted = 0;
        let quizzesPassed = 0;
        let quizzesFailed = 0;
        let quizzesInProgress = 0;
        let quizzesNotStarted = 0;
        
        // ENHANCED: Debug user data structure
        console.log(`[Admin] ${user.username} data structure:`, {
            hasQuizResults: !!user.quizResults,
            quizResultsCount: user.quizResults ? user.quizResults.length : 0,
            hasQuizProgress: !!user.quizProgress,
            quizProgressKeys: user.quizProgress ? Object.keys(user.quizProgress) : [],
            sampleQuizResult: user.quizResults && user.quizResults.length > 0 ? user.quizResults[0] : null,
            sampleQuizProgress: user.quizProgress ? Object.values(user.quizProgress)[0] : null
        });
        
        // Process each quiz in parallel to fetch accurate data faster
        const quizPromises = visibleQuizzes.map(async (quizType) => {
            if (typeof quizType === 'string') {
                const quizLower = quizType.toLowerCase();
                const progress = user.quizProgress?.[quizLower];
                const result = user.quizResults?.find(r => r.quizName.toLowerCase() === quizLower);
                
                let questionsAnswered = 0;
                let isPassed = false;
                
                // Check if we have basic completion info from progress
                const basicQuestionsAnswered = progress?.questionsAnswered || 
                                            result?.questionsAnswered || 
                                            progress?.questionHistory?.length || 
                                            result?.questionHistory?.length || 0;
                
                // Only fetch API data if we really need it (no reliable status data)
                const hasReliableStatus = result?.status || 
                                        (result?.questionHistory?.length > 0) ||
                                        (progress?.questionHistory?.length > 0);
                
                // If quiz appears to be completed (15+ questions) AND we need accurate data, fetch from API
                if (basicQuestionsAnswered >= 15 && !hasReliableStatus) {
                    try {
                        console.log(`[Admin] Fetching accurate data for ${user.username}/${quizType} (appears completed with ${basicQuestionsAnswered} questions)`);
                        
                        // Use the same API call as the detailed view
                        const response = await this.apiService.getQuizQuestions(user.username, quizType);
                        
                        if (response.success && response.data && response.data.questionHistory) {
                            const questionHistory = response.data.questionHistory;
                            questionsAnswered = questionHistory.length;
                            
                            // Use the same logic as detailed view - count 'passed' status
                            const correctAnswers = questionHistory.filter(item => item && item.status === 'passed').length;
                            const score = Math.round((correctAnswers / questionHistory.length) * 100);
                            isPassed = score >= 70;
                            
                            console.log(`[Admin] ${user.username}/${quizType}: API data - ${correctAnswers}/${questionHistory.length} = ${score}% (${isPassed ? 'PASSED' : 'FAILED'})`);
                        } else {
                            console.warn(`[Admin] Failed to fetch API data for ${user.username}/${quizType}, falling back to stored data`);
                            // Fallback to stored data
                            questionsAnswered = basicQuestionsAnswered;
                            isPassed = false; // Default to failed if we can't get accurate data
                        }
                    } catch (error) {
                        console.warn(`[Admin] Error fetching API data for ${user.username}/${quizType}:`, error);
                        // Fallback to stored data
                        questionsAnswered = basicQuestionsAnswered;
                        isPassed = false; // Default to failed if we can't get accurate data
                    }
                } else if (basicQuestionsAnswered >= 15) {
                    // Quiz completed and we have reliable status data - use it!
                    questionsAnswered = basicQuestionsAnswered;
                    
                    if (result?.status === 'passed') {
                        isPassed = true;
                        console.log(`[Admin] ${user.username}/${quizType}: Using stored status - PASSED`);
                    } else if (result?.status === 'failed') {
                        isPassed = false;
                        console.log(`[Admin] ${user.username}/${quizType}: Using stored status - FAILED`);
                    } else if (result?.questionHistory?.length > 0) {
                        const correctAnswers = result.questionHistory.filter(item => item && item.status === 'passed').length;
                        const score = Math.round((correctAnswers / result.questionHistory.length) * 100);
                        isPassed = score >= 70;
                        console.log(`[Admin] ${user.username}/${quizType}: Using stored questionHistory - ${score}% (${isPassed ? 'PASSED' : 'FAILED'})`);
                    } else if (progress?.questionHistory?.length > 0) {
                        const correctAnswers = progress.questionHistory.filter(item => item && item.status === 'passed').length;
                        const score = Math.round((correctAnswers / progress.questionHistory.length) * 100);
                        isPassed = score >= 70;
                        console.log(`[Admin] ${user.username}/${quizType}: Using progress questionHistory - ${score}% (${isPassed ? 'PASSED' : 'FAILED'})`);
                    } else {
                        isPassed = true; // Assume passed if completed but no reliable data
                        console.log(`[Admin] ${user.username}/${quizType}: Completed quiz, assuming PASSED`);
                    }
                } else {
                    // Quiz not completed, use stored data
                    questionsAnswered = basicQuestionsAnswered;
                    isPassed = false; // Not completed = not passed
                    console.log(`[Admin] ${user.username}/${quizType}: Not completed (${questionsAnswered}/15 questions)`);
                }
                
                // Return quiz stats for this quiz
                return {
                    quizType,
                    questionsAnswered,
                    isPassed,
                    isCompleted: questionsAnswered >= 15,
                    isInProgress: questionsAnswered > 0 && questionsAnswered < 15,
                    isNotStarted: questionsAnswered === 0
                };
            }
            return null; // Skip non-string quiz types
        });

        // Wait for all quiz data to be fetched in parallel
        const quizResults = await Promise.all(quizPromises);
        
        // Process the results
        quizResults.forEach(result => {
            if (result) {
                if (result.isCompleted) {
                    quizzesCompleted++;
                    if (result.isPassed) {
                        quizzesPassed++;
                        console.log(`[Admin] ${user.username}/${result.quizType}: PASSED (${result.questionsAnswered}/15 questions)`);
                    } else {
                        quizzesFailed++;
                        console.log(`[Admin] ${user.username}/${result.quizType}: FAILED (${result.questionsAnswered}/15 questions)`);
                    }
                } else if (result.isInProgress) {
                    quizzesInProgress++;
                    console.log(`[Admin] ${user.username}/${result.quizType}: IN PROGRESS (${result.questionsAnswered}/15)`);
                } else if (result.isNotStarted) {
                    quizzesNotStarted++;
                    console.log(`[Admin] ${user.username}/${result.quizType}: NOT STARTED (0/15)`);
                }
            }
        });
        
        const summary = {
            assigned: quizzesAssigned,
            completed: quizzesCompleted,
            passed: quizzesPassed,
            failed: quizzesFailed,
            inProgress: quizzesInProgress,
            notStarted: quizzesNotStarted
        };
        
        console.log(`[Admin] ${user.username} Final Stats:`, summary);
        
        // ENHANCED: Log data source summary for debugging
        const dataSourceSummary = {
            totalQuizzes: visibleQuizzes.length,
            quizzesWithResults: visibleQuizzes.filter(quizType => {
                const quizLower = quizType.toLowerCase();
                return user.quizResults?.find(r => r.quizName.toLowerCase() === quizLower);
            }).length,
            quizzesWithProgress: visibleQuizzes.filter(quizType => {
                const quizLower = quizType.toLowerCase();
                return user.quizProgress?.[quizLower];
            }).length,
            quizzesWithStatus: visibleQuizzes.filter(quizType => {
                const quizLower = quizType.toLowerCase();
                const result = user.quizResults?.find(r => r.quizName.toLowerCase() === quizLower);
                return result && result.status;
            }).length
        };
        
        console.log(`[Admin] ${user.username} Data Source Summary:`, dataSourceSummary);
        
        return summary;
    }
    
    /**
     * Update the visual display of a user card with new statistics
     */
    updateUserCardDisplay(userCard, stats) {
        try {
            // Update row view stats
            const statValues = userCard.querySelectorAll('.stat-value');
            if (statValues.length >= 6) {
                statValues[2].textContent = stats.completed; // Completed
                statValues[3].textContent = stats.passed;    // Passed
                statValues[4].textContent = stats.failed;    // Failed
                statValues[5].textContent = stats.inProgress; // In Progress
                statValues[6].textContent = stats.notStarted; // Not Started
            }
            
            // Update card view stats (if they exist)
            const cardStats = userCard.querySelectorAll('.stat-value');
            cardStats.forEach(stat => {
                const statType = stat.getAttribute('data-stat');
                if (statType === 'completed') stat.textContent = stats.completed;
                if (statType === 'passed') stat.textContent = stats.passed;
                if (statType === 'failed') stat.textContent = stats.failed;
                if (statType === 'in-progress') stat.textContent = stats.inProgress;
                if (statType === 'not-started') stat.textContent = stats.notStarted;
            });
            
        } catch (error) {
            console.warn('[Admin] Error updating user card display:', error);
        }
    }
    
    /**
     * Show loading state for the entire dashboard
     */
    showLoadingState() {
        try {
            // Create or update a loading overlay for the entire dashboard
            let loadingOverlay = document.getElementById('dashboard-loading-overlay');
            if (!loadingOverlay) {
                loadingOverlay = document.createElement('div');
                loadingOverlay.id = 'dashboard-loading-overlay';
                loadingOverlay.className = 'dashboard-loading-overlay';
                loadingOverlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    color: white;
                    font-size: 18px;
                `;
                document.body.appendChild(loadingOverlay);
            }
            
            loadingOverlay.innerHTML = `
                <div style="text-align: center;">
                    <div style="margin-bottom: 20px;">
                        <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                    </div>
                    <div style="margin-bottom: 10px;">Loading user data...</div>
                    <div style="font-size: 14px; opacity: 0.8;">Please wait while we fetch complete quiz information</div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            loadingOverlay.style.display = 'flex';
        } catch (error) {
            console.warn('[Admin] Error showing loading state:', error);
        }
    }
    
    /**
     * Hide loading state for the entire dashboard
     */
    hideLoadingState() {
        try {
            const loadingOverlay = document.getElementById('dashboard-loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        } catch (error) {
            console.warn('[Admin] Error hiding loading state:', error);
        }
    }
    
    /**
     * Update progress indicator (simpler than full loading overlay)
     */
    updateProgressIndicator(percent, text) {
        try {
            // Create or update a simple progress bar at the top of the users list
            let progressBar = document.getElementById('user-progress-indicator');
            if (!progressBar) {
                progressBar = document.createElement('div');
                progressBar.id = 'user-progress-indicator';
                progressBar.className = 'user-progress-indicator';
                progressBar.innerHTML = `
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill"></div>
                    </div>
                    <p class="progress-text" id="progress-text">${text}</p>
                `;
                
                const usersList = document.getElementById('usersList');
                if (usersList) {
                    usersList.insertBefore(progressBar, usersList.firstChild);
                }
            }
            
            const progressFill = document.getElementById('progress-fill');
            const progressText = document.getElementById('progress-text');
            
            if (progressFill) progressFill.style.width = `${percent}%`;
            if (progressText) progressText.textContent = text;
            
        } catch (error) {
            console.warn('[Admin] Error updating progress indicator:', error);
        }
    }
    
    /**
     * Hide the progress indicator
     */
    hideProgressIndicator() {
        const existingIndicator = document.getElementById('user-progress-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
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
                    

                    
                    // For completed quizzes without question history, try to fetch it
                    await this.enrichQuizProgressWithQuestionHistory(username, this.users[userIndex]);
                        
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
    
    /**
     * Enrich quiz progress data with question history for completed quizzes
     */
    async enrichQuizProgressWithQuestionHistory(username, user) {
        try {
            if (!user.quizProgress || !this.quizTypes) {
                console.log(`[Admin] Cannot enrich ${username}: missing quizProgress (${!!user.quizProgress}) or quizTypes (${!!this.quizTypes})`);
                return;
            }
            
            console.log(`[Admin] Starting enrichment for ${username} with ${Object.keys(user.quizProgress).length} quiz progress entries`);
            
            let enrichmentCount = 0;
            let successCount = 0;
            let failedCount = 0;
            
            // Check each quiz type for completed quizzes without question history
            for (const quizType of this.quizTypes) {
                const quizLower = quizType.toLowerCase();
                const progress = user.quizProgress[quizLower];
                
                if (progress) {
                    console.log(`[Admin] ${username}/${quizType}: questionsAnswered=${progress.questionsAnswered}, hasHistory=${!!progress.questionHistory}, historyLength=${progress.questionHistory?.length || 0}`);
                }
                
                // ENHANCED: Debug enrichment conditions
                const needsEnrichment = progress && 
                    progress.questionsAnswered >= 15 && 
                    (!progress.questionHistory || progress.questionHistory.length === 0);
                
                console.log(`[Admin] ${username}/${quizType} enrichment check:`, {
                    hasProgress: !!progress,
                    questionsAnswered: progress?.questionsAnswered,
                    questionsAnsweredCondition: progress?.questionsAnswered >= 15,
                    hasQuestionHistory: !!(progress?.questionHistory),
                    questionHistoryLength: progress?.questionHistory?.length || 0,
                    questionHistoryCondition: !progress?.questionHistory || progress.questionHistory.length === 0,
                    needsEnrichment
                });
                
                // Only fetch for completed quizzes that don't have question history
                if (needsEnrichment) {
                    
                    enrichmentCount++;
                    try {
                        console.log(`[Admin] Enriching ${username}/${quizType} with question history`);
                        
                        // Add timeout protection to prevent hanging
                        const timeoutPromise = new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Enrichment timeout')), 10000)
                        );
                        
                        const response = await Promise.race([
                            this.apiService.getQuizQuestions(username, quizType),
                            timeoutPromise
                        ]);
                        
                        if (response.success && response.data && response.data.questionHistory) {
                            // Update the progress with question history
                            progress.questionHistory = response.data.questionHistory;
                            successCount++;
                            console.log(`[Admin] Successfully enriched ${username}/${quizType} with question history (${response.data.questionHistory.length} questions)`);
                        } else {
                            console.warn(`[Admin] Failed to enrich ${username}/${quizType}: API response invalid`, response);
                            failedCount++;
                        }
                    } catch (error) {
                        console.warn(`[Admin] Failed to enrich ${username}/${quizType} with question history:`, error);
                        failedCount++;
                    }
                }
            }
            
            console.log(`[Admin] Enrichment complete for ${username}: ${successCount}/${enrichmentCount} quizzes enriched successfully, ${failedCount} failed`);
            
        } catch (error) {
            console.warn(`[Admin] Error enriching quiz progress for ${username}:`, error);
        }
    }
    
    /**
     * Manually refresh a specific user's quiz data and statistics
     */
    async refreshUserQuizData(username) {
        try {
            console.log(`[Admin] Manually refreshing quiz data for ${username}`);
            
            const userIndex = this.users.findIndex(u => u.username === username);
            if (userIndex === -1) {
                console.warn(`[Admin] User ${username} not found for refresh`);
                return;
            }
            
            // Re-enrich the user's data
            await this.enrichQuizProgressWithQuestionHistory(username, this.users[userIndex]);
            
            // Update the user's card
            await this.updateUsersList();
            
            // Update statistics
            const stats = this.updateStatistics();
            this.updateStatisticsDisplay(stats);
            
            console.log(`[Admin] Manual refresh complete for ${username}`);
        } catch (error) {
            console.error(`[Admin] Error refreshing quiz data for ${username}:`, error);
        }
    }
    

    
    /**
     * Update the user's data in memory with enriched quiz information
     * This ensures that future card generations use the correct data
     */
    async updateUserDataInMemory(username) {
        try {
            console.log(`[Admin] Updating user data in memory for ${username}`);
            
            const user = this.users.find(u => u.username === username);
            if (!user) {
                console.warn(`[Admin] User ${username} not found for memory update`);
                return;
            }
            
            // For each completed quiz, ensure we have the most accurate score data
            if (user.quizProgress && this.quizTypes) {
                let updatedCount = 0;
                
                for (const quizType of this.quizTypes) {
                    const quizLower = quizType.toLowerCase();
                    const progress = user.quizProgress[quizLower];
                    
                    if (progress && progress.questionsAnswered >= 15) {
                        // This is a completed quiz - ensure we have accurate score data
                        let accurateScore = null;
                        
                        // Priority 1: Use questionHistory if available (most accurate)
                        if (progress.questionHistory && progress.questionHistory.length > 0) {
                            const correctAnswers = progress.questionHistory.filter(q => q.isCorrect).length;
                            accurateScore = (correctAnswers / progress.questionHistory.length) * 100;
                            console.log(`[Admin] ${username}/${quizType}: Using questionHistory score: ${accurateScore}%`);
                        }
                        // Priority 2: Use quizResults if available
                        else if (user.quizResults) {
                            const result = user.quizResults.find(r => r.quizName.toLowerCase() === quizLower);
                            if (result && result.score !== undefined) {
                                accurateScore = result.score;
                                console.log(`[Admin] ${username}/${quizType}: Using quizResults score: ${accurateScore}%`);
                            }
                        }
                        // Priority 3: Use existing scorePercentage if available
                        else if (progress.scorePercentage !== undefined) {
                            accurateScore = progress.scorePercentage;
                            console.log(`[Admin] ${username}/${quizType}: Using existing scorePercentage: ${accurateScore}%`);
                        }
                        // Priority 4: Use existing score if available
                        else if (progress.score !== undefined) {
                            accurateScore = progress.score;
                            console.log(`[Admin] ${username}/${quizType}: Using existing score: ${accurateScore}%`);
                        }
                        
                        // Update the progress object with the accurate score
                        if (accurateScore !== null) {
                            progress.scorePercentage = accurateScore;
                            progress.score = accurateScore;
                            
                            // Mark this quiz as having accurate data
                            progress.hasAccurateScore = true;
                            progress.lastScoreUpdate = new Date().toISOString();
                            
                            updatedCount++;
                            console.log(`[Admin] ${username}/${quizType}: Updated with accurate score ${accurateScore}%`);
                        }
                    }
                }
                
                            console.log(`[Admin] Updated ${updatedCount} quiz scores in memory for ${username}`);
        }
        
        // Also update the user's quizResults if we have more accurate data
        if (user.quizProgress && user.quizResults) {
            for (const result of user.quizResults) {
                const quizLower = result.quizName.toLowerCase();
                const progress = user.quizProgress[quizLower];
                
                if (progress && progress.questionsAnswered >= 15) {
                    // Update the quiz result with the most accurate score
                    if (progress.hasAccurateScore && progress.scorePercentage !== undefined) {
                        result.score = progress.scorePercentage;
                        console.log(`[Admin] ${username}/${result.quizName}: Updated quiz result score to ${progress.scorePercentage}%`);
                    }
                }
            }
        }
        
        // Persist the updated data to localStorage so it survives page refreshes
        this.persistUserDataToStorage(username);
        
    } catch (error) {
        console.error(`[Admin] Error updating user data in memory for ${username}:`, error);
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

        // Category export functionality
        const exportCategoryBtn = document.getElementById('exportCategoryCSV');
        const exportCategorySimplifiedBtn = document.getElementById('exportCategorySimplified');
        const selectAllCategoriesBtn = document.getElementById('selectAllCategories');
        const deselectAllCategoriesBtn = document.getElementById('deselectAllCategories');
        
        // Handle category checkbox changes
        const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateCategoryExportButton();
            });
        });
        
        // Handle select all categories
        if (selectAllCategoriesBtn) {
            selectAllCategoriesBtn.addEventListener('click', () => {
                categoryCheckboxes.forEach(checkbox => {
                    checkbox.checked = true;
                });
                this.updateCategoryExportButton();
            });
        }
        
        // Handle deselect all categories
        if (deselectAllCategoriesBtn) {
            deselectAllCategoriesBtn.addEventListener('click', () => {
                categoryCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                this.updateCategoryExportButton();
            });
        }
        
        if (exportCategoryBtn) {
            exportCategoryBtn.addEventListener('click', () => {
                this.exportCategoryData();
            });
        }
        
        if (exportCategorySimplifiedBtn) {
            exportCategorySimplifiedBtn.addEventListener('click', () => {
                this.exportCategoryDataSimplified();
            });
        }

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
            case 'account-modifications-section':
                // Initialize account modifications section
                this.setupAccountModificationsSection();
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

    /**
     * Show loading overlay for user cards
     */
    showUsersLoadingOverlay() {
        // Remove existing overlay if any
        this.hideUsersLoadingOverlay();
        
        const overlay = document.createElement('div');
        overlay.id = 'users-loading-overlay';
        overlay.className = 'users-loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h3>Loading User Data</h3>
                <p>Fetching accurate quiz statistics from server...</p>
                <div class="loading-details">
                    <small>This may take a few seconds for users with many completed quizzes</small>
                </div>
            </div>
        `;
        
        // Add CSS if not already added
        if (!document.getElementById('users-loading-styles')) {
            const style = document.createElement('style');
            style.id = 'users-loading-styles';
            style.textContent = `
                .users-loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    border-radius: 0;
                }
                .loading-content {
                    text-align: center;
                    padding: 2rem;
                }
                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .loading-details {
                    margin-top: 1rem;
                    opacity: 0.7;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Attach to body for full screen overlay
        document.body.appendChild(overlay);
    }

    /**
     * Hide loading overlay for user cards
     */
    hideUsersLoadingOverlay() {
        const overlay = document.getElementById('users-loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    async updateUsersList() {
        console.log('[Admin] updateUsersList() called');
        const container = document.getElementById('usersList');
        if (!container) return;

        // Show loading overlay
        this.showUsersLoadingOverlay();

        // Handle case when users haven't been loaded yet
        if (!this.users || !Array.isArray(this.users)) {
            // console.log('Users not loaded yet, showing empty state');
            container.innerHTML = '<div class="loading-message">Loading users...</div>';
            
            // Update statistics with empty data
            const stats = this.updateStatistics([]);
            this.updateStatisticsDisplay(stats);
            this.hideUsersLoadingOverlay();
            return;
        }
        

        
        // Show loading message while processing users
        if (this.users.length > 0) {
            container.innerHTML = '<div class="loading-message">Processing user data...</div>';
        }
        
        // If we have users but no quiz types, show a message
        if (!this.quizTypes || this.quizTypes.length === 0) {
            container.innerHTML = '<div class="loading-message">Quiz types not loaded yet...</div>';
            return;
        }
        
        // Check if we have any user progress data at all
        const hasAnyProgressData = this.users.some(user => 
            (user.quizProgress && Object.keys(user.quizProgress).length > 0) ||
            (user.quizResults && user.quizResults.length > 0)
        );
        
        if (!hasAnyProgressData) {
            console.warn('[Admin] No user progress or quiz results data available - API may be down');
            container.innerHTML = `
                <div class="api-error-message">
                    <h3>⚠️ API Connection Issue</h3>
                    <p>The server appears to be down or unreachable. Showing basic user information only.</p>
                    <p><strong>Error:</strong> CORS policy blocked or server returned 502 Bad Gateway</p>
                    <button onclick="location.reload()" class="retry-btn">🔄 Retry Connection</button>
                `;
            this.hideUsersLoadingOverlay();
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
                case 'assigned-high':
                    // Calculate assigned quizzes for each user
                    const aAssigned = this.calculateAssignedQuizzes(a);
                    const bAssigned = this.calculateAssignedQuizzes(b);
                    return bAssigned - aAssigned;
                case 'assigned-low':
                    // Calculate assigned quizzes for each user
                    const aAssignedLow = this.calculateAssignedQuizzes(a);
                    const bAssignedLow = this.calculateAssignedQuizzes(b);
                    return aAssignedLow - bAssignedLow;
                case 'last-active':
                    return this.getLastActiveDate(b) - this.getLastActiveDate(a);
                default:
                    return 0;
            }
        });

        // Clear existing content
        const startTime = performance.now();
        console.log(`[Admin] Clearing container and creating ${filteredUsers.length} user cards...`);
        container.innerHTML = '';

        // Create and append user cards (process in parallel for faster loading)
        const userCardPromises = filteredUsers.map(async (user) => {
            const lastActive = this.getLastActiveDate(user);
            
            // ENHANCED: Validate user data before calculating statistics
            if (!user.quizProgress && !user.quizResults) {
                console.warn(`[Admin] User ${user.username} has no quiz data - may need to refresh`);
            }
            
            // Use the existing calculateUserQuizStats method for consistent calculations
            // This method now fetches accurate data from the same API as detailed view
            const stats = await this.calculateUserQuizStats(user);
            
            // Extract the calculated values
            const quizzesAssigned = stats.assigned;
            const quizzesCompleted = stats.completed;
            const quizzesPassed = stats.passed;
            const quizzesFailed = stats.failed;
            const quizzesInProgress = stats.inProgress;
            const quizzesNotStarted = stats.notStarted;
            
            // ENHANCED: Log the calculated statistics for debugging and verification
            console.log(`[Admin] ${user.username} Quiz Summary (from calculateUserQuizStats):`, {
                ...stats,
                hasQuizProgress: !!user.quizProgress,
                hasQuizResults: !!user.quizResults,
                quizProgressKeys: user.quizProgress ? Object.keys(user.quizProgress) : [],
                quizResultsCount: user.quizResults ? user.quizResults.length : 0
            });
            
            // ENHANCED: Validate that statistics make sense
            if (quizzesPassed + quizzesFailed !== quizzesCompleted) {
                console.warn(`[Admin] ${user.username}: Passed (${quizzesPassed}) + Failed (${quizzesFailed}) != Completed (${quizzesCompleted})`);
            }
            
            if (quizzesCompleted + quizzesInProgress + quizzesNotStarted !== quizzesAssigned) {
                console.warn(`[Admin] ${user.username}: Completed (${quizzesCompleted}) + InProgress (${quizzesInProgress}) + NotStarted (${quizzesNotStarted}) != Assigned (${quizzesAssigned})`);
            }
            
            // Use the same calculation as the details overlay for overall progress
            const overallProgress = this.calculateQuestionsAnsweredPercent(user);
            const overallProgressDisplay = `${overallProgress.toFixed(1)}%`;

            const card = document.createElement('div');
            card.className = 'user-card';
            
            // Set data attributes for all the metrics
            card.setAttribute('data-username', user.username);
            card.setAttribute('data-progress', overallProgressDisplay);
            card.setAttribute('data-assigned', quizzesAssigned.toString());
            card.setAttribute('data-completed', quizzesCompleted.toString());
            card.setAttribute('data-passed', quizzesPassed.toString());
            card.setAttribute('data-failed', quizzesFailed.toString());
            card.setAttribute('data-in-progress', quizzesInProgress.toString());
            card.setAttribute('data-not-started', quizzesNotStarted.toString());
            
            if (isRowView) {
                card.innerHTML = `
                    <div class="row-content">
                        <div class="user-info">
                            <span class="username">${user.username}</span>
                        </div>
                        <div class="user-stats expanded-stats">
                            <div class="stat">
                                <span class="stat-label">Quizzes Assigned:</span>
                                <span class="stat-value">${quizzesAssigned}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Quizzes Completed:</span>
                                <span class="stat-value">${quizzesCompleted}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Quizzes Passed:</span>
                                <span class="stat-value">${quizzesPassed}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Quizzes Failed:</span>
                                <span class="stat-value">${quizzesFailed}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Quizzes In Progress:</span>
                                <span class="stat-value">${quizzesInProgress}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Quizzes Not Started:</span>
                                <span class="stat-value">${quizzesNotStarted}</span>
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
                
                userHeader.appendChild(username);
                
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
                
                // Add expanded stats class for better layout
                userStats.className = 'user-stats expanded-stats';
                
                // Quizzes Assigned stat
                const assignedStat = document.createElement('div');
                assignedStat.className = 'stat';
                
                const assignedLabel = document.createElement('span');
                assignedLabel.className = 'stat-label';
                assignedLabel.textContent = 'Quizzes Assigned:';
                
                const assignedValue = document.createElement('span');
                assignedValue.className = 'stat-value';
                assignedValue.textContent = quizzesAssigned.toString();
                
                assignedStat.appendChild(assignedLabel);
                assignedStat.appendChild(assignedValue);
                
                // Quizzes Completed stat
                const completedStat = document.createElement('div');
                completedStat.className = 'stat';
                
                const completedLabel = document.createElement('span');
                completedLabel.className = 'stat-label';
                completedLabel.textContent = 'Quizzes Completed:';
                
                const completedValue = document.createElement('span');
                completedValue.className = 'stat-value';
                completedValue.textContent = quizzesCompleted.toString();
                
                completedStat.appendChild(completedLabel);
                completedStat.appendChild(completedValue);
                
                // Quizzes Passed stat
                const passedStat = document.createElement('div');
                passedStat.className = 'stat';
                
                const passedLabel = document.createElement('span');
                passedLabel.className = 'stat-label';
                passedLabel.textContent = 'Quizzes Passed:';
                
                const passedValue = document.createElement('span');
                passedValue.className = 'stat-value';
                passedValue.textContent = quizzesPassed.toString();
                
                passedStat.appendChild(passedLabel);
                passedStat.appendChild(passedValue);
                
                // Quizzes Failed stat
                const failedStat = document.createElement('div');
                failedStat.className = 'stat';
                
                const failedLabel = document.createElement('span');
                failedLabel.className = 'stat-label';
                failedLabel.textContent = 'Quizzes Failed:';
                
                const failedValue = document.createElement('span');
                failedValue.className = 'stat-value';
                failedValue.textContent = quizzesFailed.toString();
                
                failedStat.appendChild(failedLabel);
                failedStat.appendChild(failedValue);
                
                // Quizzes In Progress stat
                const inProgressStat = document.createElement('div');
                inProgressStat.className = 'stat';
                
                const inProgressLabel = document.createElement('span');
                inProgressLabel.className = 'stat-label';
                inProgressLabel.textContent = 'Quizzes In Progress:';
                
                const inProgressValue = document.createElement('span');
                inProgressValue.className = 'stat-value';
                inProgressValue.textContent = quizzesInProgress.toString();
                
                inProgressStat.appendChild(inProgressLabel);
                inProgressStat.appendChild(inProgressValue);
                
                // Quizzes Not Started stat
                const notStartedStat = document.createElement('div');
                notStartedStat.className = 'stat';
                
                const notStartedLabel = document.createElement('span');
                notStartedLabel.className = 'stat-label';
                notStartedLabel.textContent = 'Quizzes Not Started:';
                
                const notStartedValue = document.createElement('span');
                notStartedValue.className = 'stat-value';
                notStartedValue.textContent = quizzesNotStarted.toString();
                
                notStartedStat.appendChild(notStartedLabel);
                notStartedStat.appendChild(notStartedValue);
                
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
                
                userStats.appendChild(assignedStat);
                userStats.appendChild(completedStat);
                userStats.appendChild(passedStat);
                userStats.appendChild(failedStat);
                userStats.appendChild(inProgressStat);
                userStats.appendChild(notStartedStat);
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

            // ENHANCED: Final verification and debugging
            const scoreElements = card.querySelectorAll('.stat-value');
            scoreElements.forEach(element => {
                if (element.textContent === '0%') {
                    console.log(`Direct fix: Found a zero percent value that needs updating in ${user.username}'s card`);
                    element.textContent = overallProgressDisplay;
                }
            });
            
            return card;
        });

        // Wait for all user cards to be created in parallel, then append them
        const userCards = await Promise.all(userCardPromises);
        userCards.forEach(card => {
            container.appendChild(card);
        });

        if (filteredUsers.length === 0) {
            container.innerHTML = '<div class="no-users">No users match your search criteria</div>';
            this.hideUsersLoadingOverlay();
            return;
        }
        
        const endTime = performance.now();
        const loadTime = Math.round(endTime - startTime);
        const finalCardCount = container.children.length;
        console.log(`[Admin] Users list update complete. Processed ${filteredUsers.length} users, created ${finalCardCount} cards in ${loadTime}ms.`);
        
        // Hide loading overlay
        this.hideUsersLoadingOverlay();
        
        // Update average completion stat after users list is updated
        if (typeof updateAverageCompletionStat === 'function') {
            updateAverageCompletionStat(this);
                }
    }

    /**
     * Setup Account Modifications Section
     */
    async setupAccountModificationsSection() {
        console.log('[Admin] Setting up Account Modifications section');
        
        // Populate the user list
        await this.populateBulkUsersList();
        
        // Setup event listeners
        this.setupBulkActionEventListeners();
    }

    /**
     * Populate the bulk users list with checkboxes
     */
    async populateBulkUsersList() {
        const container = document.getElementById('bulk-users-list');
        if (!container) return;

        try {
            // Show loading
            container.innerHTML = '<div class="loading-message">Loading users...</div>';

            // Use existing users data or load fresh
            let users = this.users;
            if (!users || users.length === 0) {
                const response = await this.apiService.getAllUsers();
                if (response.success) {
                    users = response.data;
                } else {
                    throw new Error('Failed to load users');
                }
            }

            // Filter out admin users for safety
            const safeUsers = users.filter(user => 
                user.username.toLowerCase() !== 'admin' && 
                !user.isAdmin
            );

            if (safeUsers.length === 0) {
                container.innerHTML = '<div class="no-users">No users available for bulk operations</div>';
                return;
            }

            // Generate user list HTML
            const usersHTML = safeUsers.map(user => {
                const stats = this.getUserStatsDisplay(user);
                return `
                    <div class="bulk-user-item" data-username="${user.username}">
                        <div class="bulk-user-info">
                            <input type="checkbox" class="bulk-user-checkbox" value="${user.username}" 
                                   id="user-${user.username}" aria-label="Select ${user.username}">
                            <div class="bulk-user-details">
                                <div class="bulk-user-name">${user.username}</div>
                                <div class="bulk-user-stats">${stats}</div>
                            </div>
                        </div>
                        <div class="bulk-user-actions">
                            <button class="action-button view-btn" onclick="window.adminDashboard.showUserDetails('${user.username}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = usersHTML;

            // Update counter
            this.updateSelectedCounter();

        } catch (error) {
            console.error('[Admin] Error loading bulk users list:', error);
            container.innerHTML = '<div class="error-message">Failed to load users. Please try again.</div>';
        }
    }

    /**
     * Get user stats for display in bulk list
     */
    getUserStatsDisplay(user) {
        if (!user.quizProgress && !user.quizResults) {
            return 'No quiz data';
        }

        const progressCount = user.quizProgress ? Object.keys(user.quizProgress).length : 0;
        const resultsCount = user.quizResults ? user.quizResults.length : 0;
        const completedCount = user.quizResults ? 
            user.quizResults.filter(r => r.questionsAnswered >= 15).length : 0;

        return `${completedCount} completed • ${progressCount} in progress • ${resultsCount} total results`;
    }

    /**
     * Setup event listeners for bulk actions
     */
    setupBulkActionEventListeners() {
        // Remove existing listeners to prevent duplicates
        this.removeBulkActionEventListeners();

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('select-all-users');
        if (selectAllCheckbox) {
            this.selectAllHandler = (e) => this.handleSelectAll(e.target.checked);
            selectAllCheckbox.addEventListener('change', this.selectAllHandler);
        }

        // Individual user checkboxes - use a single delegated listener
        this.userCheckboxHandler = (e) => {
            if (e.target.classList.contains('bulk-user-checkbox')) {
                this.handleUserSelection(e.target);
            }
        };
        document.addEventListener('change', this.userCheckboxHandler);

        // Search functionality
        const searchInput = document.getElementById('bulk-user-search');
        if (searchInput) {
            this.searchHandler = (e) => this.filterBulkUsers(e.target.value);
            searchInput.addEventListener('input', this.searchHandler);
        }

        // Bulk action buttons
        const resetButton = document.getElementById('bulk-reset-progress');
        if (resetButton) {
            this.resetHandler = () => this.handleBulkResetProgress();
            resetButton.addEventListener('click', this.resetHandler);
        }

        const deleteButton = document.getElementById('bulk-delete-accounts');
        if (deleteButton) {
            this.deleteHandler = () => this.handleBulkDeleteAccounts();
            deleteButton.addEventListener('click', this.deleteHandler);
        }

        // Refresh button
        const refreshButton = document.getElementById('bulk-refresh-users');
        if (refreshButton) {
            this.refreshHandler = () => this.refreshBulkUsersList();
            refreshButton.addEventListener('click', this.refreshHandler);
        }
    }

    /**
     * Remove bulk action event listeners to prevent duplicates
     */
    removeBulkActionEventListeners() {
        const selectAllCheckbox = document.getElementById('select-all-users');
        if (selectAllCheckbox && this.selectAllHandler) {
            selectAllCheckbox.removeEventListener('change', this.selectAllHandler);
        }

        if (this.userCheckboxHandler) {
            document.removeEventListener('change', this.userCheckboxHandler);
        }

        const searchInput = document.getElementById('bulk-user-search');
        if (searchInput && this.searchHandler) {
            searchInput.removeEventListener('input', this.searchHandler);
        }

        const resetButton = document.getElementById('bulk-reset-progress');
        if (resetButton && this.resetHandler) {
            resetButton.removeEventListener('click', this.resetHandler);
        }

        const deleteButton = document.getElementById('bulk-delete-accounts');
        if (deleteButton && this.deleteHandler) {
            deleteButton.removeEventListener('click', this.deleteHandler);
        }

        const refreshButton = document.getElementById('bulk-refresh-users');
        if (refreshButton && this.refreshHandler) {
            refreshButton.removeEventListener('click', this.refreshHandler);
        }
    }

    /**
     * Handle select all checkbox
     */
    handleSelectAll(checked) {
        const userCheckboxes = document.querySelectorAll('.bulk-user-checkbox:not([style*="display: none"])');
        userCheckboxes.forEach(checkbox => {
            checkbox.checked = checked;
            this.updateUserItemSelection(checkbox);
        });
        this.updateSelectedCounter();
        this.updateBulkActionButtons();
    }

    /**
     * Handle individual user selection
     */
    handleUserSelection(checkbox) {
        this.updateUserItemSelection(checkbox);
        this.updateSelectedCounter();
        this.updateBulkActionButtons();
        
        // Update select all checkbox state
        const selectAllCheckbox = document.getElementById('select-all-users');
        const allCheckboxes = document.querySelectorAll('.bulk-user-checkbox:not([style*="display: none"])');
        const checkedCheckboxes = document.querySelectorAll('.bulk-user-checkbox:checked:not([style*="display: none"])');
        
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = allCheckboxes.length > 0 && checkedCheckboxes.length === allCheckboxes.length;
            selectAllCheckbox.indeterminate = checkedCheckboxes.length > 0 && checkedCheckboxes.length < allCheckboxes.length;
        }
    }

    /**
     * Update user item selection visual state
     */
    updateUserItemSelection(checkbox) {
        const userItem = checkbox.closest('.bulk-user-item');
        if (userItem) {
            userItem.classList.toggle('selected', checkbox.checked);
        }
    }

    /**
     * Update selected counter
     */
    updateSelectedCounter() {
        const selectedCount = document.querySelectorAll('.bulk-user-checkbox:checked').length;
        const counterElement = document.getElementById('selected-count');
        if (counterElement) {
            counterElement.textContent = `${selectedCount} user${selectedCount !== 1 ? 's' : ''} selected`;
        }
    }

    /**
     * Update bulk action button states
     */
    updateBulkActionButtons() {
        const selectedCount = document.querySelectorAll('.bulk-user-checkbox:checked').length;
        const hasSelection = selectedCount > 0;
        
        const resetButton = document.getElementById('bulk-reset-progress');
        const deleteButton = document.getElementById('bulk-delete-accounts');
        
        if (resetButton) {
            resetButton.disabled = !hasSelection;
        }
        if (deleteButton) {
            deleteButton.disabled = !hasSelection;
        }
    }

    /**
     * Filter bulk users based on search input
     */
    filterBulkUsers(searchTerm) {
        const userItems = document.querySelectorAll('.bulk-user-item');
        const term = searchTerm.toLowerCase();

        userItems.forEach(item => {
            const username = item.querySelector('.bulk-user-name').textContent.toLowerCase();
            const isVisible = username.includes(term);
            item.style.display = isVisible ? '' : 'none';
        });

        // Update counters after filtering
        this.updateSelectedCounter();
        this.updateBulkActionButtons();
    }

    /**
     * Refresh the bulk users list
     */
    async refreshBulkUsersList() {
        try {
            console.log('[Admin] Refreshing bulk users list...');
            
            // Show loading in the container
            const container = document.getElementById('bulk-users-list');
            if (container) {
                container.innerHTML = '<div class="loading-message">Refreshing users...</div>';
            }
            
            // Clear search input
            const searchInput = document.getElementById('bulk-user-search');
            if (searchInput) {
                searchInput.value = '';
            }
            
            // Reload users from server using the same method as initial load
            const response = await this.apiService.getAllUsers();
            if (response.success) {
                // Update both local users data and repopulate the bulk list
                this.users = response.data;
                await this.populateBulkUsersList();
                
                // Also refresh main dashboard if we're updating this.users
                console.log('[Admin] Refreshing main dashboard with updated user data...');
                await this.updateUsersList();
                
                this.showInfo('User list refreshed successfully');
            } else {
                throw new Error('Failed to refresh user list');
            }
        } catch (error) {
            console.error('[Admin] Error refreshing bulk users list:', error);
            this.showError(`Failed to refresh user list: ${error.message}`);
            
            // Show error in container if refresh fails
            const container = document.getElementById('bulk-users-list');
            if (container) {
                container.innerHTML = '<div class="error-message">Failed to refresh user list. Please try again.</div>';
            }
        }
    }

    /**
     * Handle bulk reset progress
     */
    async handleBulkResetProgress() {
        const selectedUsers = Array.from(document.querySelectorAll('.bulk-user-checkbox:checked'))
            .map(checkbox => checkbox.value);

        if (selectedUsers.length === 0) {
            this.showError('No users selected');
            return;
        }

        // Confirmation dialog
        const confirmed = confirm(
            `Are you sure you want to reset progress for ${selectedUsers.length} user(s)?\n\n` +
            `This will:\n` +
            `• Delete all quiz progress\n` +
            `• Delete all quiz results\n` +
            `• Reset all completed quizzes\n\n` +
            `This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            // Show loading overlay
            this.showBulkActionLoading(`Resetting progress for ${selectedUsers.length} users...`);

            const results = [];
            for (const username of selectedUsers) {
                try {
                    console.log(`[Admin] Resetting progress for ${username}`);
                    await this.resetAllProgress(username);
                    results.push({ username, success: true, message: 'Progress reset successfully' });
                } catch (error) {
                    console.error(`[Admin] Failed to reset progress for ${username}:`, error);
                    results.push({ username, success: false, message: error.message });
                }
            }

            this.hideBulkActionLoading();

            // Show results
            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;

            if (failCount === 0) {
                this.showInfo(`Successfully reset progress for all ${successCount} users`);
            } else {
                this.showError(`Reset complete: ${successCount} successful, ${failCount} failed`);
            }

            // Refresh both the bulk list and main dashboard
            console.log('[Admin] Refreshing user lists after reset operation...');
            await this.refreshBulkUsersList(); // This now handles both bulk list and main dashboard

        } catch (error) {
            this.hideBulkActionLoading();
            this.showError(`Bulk reset failed: ${error.message}`);
        }
    }

    /**
     * Handle bulk delete accounts
     */
    async handleBulkDeleteAccounts() {
        const selectedUsers = Array.from(document.querySelectorAll('.bulk-user-checkbox:checked'))
            .map(checkbox => checkbox.value);

        if (selectedUsers.length === 0) {
            this.showError('No users selected');
            return;
        }

        // Strong confirmation dialog
        const confirmed = confirm(
            `⚠️ DANGER: Are you sure you want to DELETE ${selectedUsers.length} user account(s)?\n\n` +
            `Users to be deleted:\n${selectedUsers.join(', ')}\n\n` +
            `This will PERMANENTLY:\n` +
            `• Delete user accounts\n` +
            `• Delete all their data\n` +
            `• Remove all their progress\n\n` +
            `THIS CANNOT BE UNDONE!\n\n` +
            `Type 'DELETE' in the next prompt to confirm.`
        );

        if (!confirmed) return;

        const deleteConfirmation = prompt(
            `To confirm deletion of ${selectedUsers.length} accounts, type 'DELETE' (all caps):`
        );

        if (deleteConfirmation !== 'DELETE') {
            this.showInfo('Account deletion cancelled');
            return;
        }

        try {
            // Show loading overlay
            this.showBulkActionLoading(`Deleting ${selectedUsers.length} user accounts...`);

            const results = [];
            for (const username of selectedUsers) {
                try {
                    console.log(`[Admin] Deleting account for ${username}`);
                    await this.deleteUserAccount(username);
                    results.push({ username, success: true, message: 'Account deleted successfully' });
                } catch (error) {
                    console.error(`[Admin] Failed to delete account for ${username}:`, error);
                    results.push({ username, success: false, message: error.message });
                }
            }

            this.hideBulkActionLoading();

            // Show results
            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;

            if (failCount === 0) {
                this.showInfo(`Successfully deleted all ${successCount} user accounts`);
            } else {
                this.showError(`Deletion complete: ${successCount} successful, ${failCount} failed`);
            }

            // Refresh both the bulk list and main dashboard
            console.log('[Admin] Refreshing user lists after delete operation...');
            await this.refreshBulkUsersList(); // This now handles both bulk list and main dashboard

        } catch (error) {
            this.hideBulkActionLoading();
            this.showError(`Bulk deletion failed: ${error.message}`);
        }
    }

    /**
     * Show loading overlay for bulk actions
     */
    showBulkActionLoading(message) {
        const overlay = document.createElement('div');
        overlay.id = 'bulk-action-loading';
        overlay.className = 'loading-modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: all;
        `;
        overlay.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 8px; text-align: center; max-width: 400px; margin: 100px auto; box-shadow: 0 4px 24px rgba(0,0,0,0.2);">
                <div class="loading-spinner" style="margin-bottom: 1rem; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <h3>${message}</h3>
                <p>Please wait while the operation completes.</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    /**
     * Hide bulk action loading overlay
     */
    hideBulkActionLoading() {
        const overlay = document.getElementById('bulk-action-loading');
        if (overlay) {
            overlay.remove();
        }
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
