import { APIService } from './api-service.js';
import { QUIZ_CATEGORIES } from './quiz-list.js';

export class Admin3Dashboard {
    constructor() {
        // Core services
        this.apiService = new APIService();
        this.quizTypes = Object.values(QUIZ_CATEGORIES).flat();
        
        // State management
        this.users = [];
        this.currentView = 'grid';
        this.isInitialized = false;
        
        // DOM elements cache
        this.elements = {};
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    async init() {
        try {
            console.log('[Admin3] Initializing dashboard...');
            
            // Check authentication first
            await this.checkAuthentication();
            
            // Cache DOM elements
            this.cacheElements();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadInitialData();
            
            // Mark as initialized
            this.isInitialized = true;
            console.log('[Admin3] Dashboard initialized successfully');
            
        } catch (error) {
            console.error('[Admin3] Initialization failed:', error);
            this.showError('Failed to initialize dashboard. Please refresh the page.');
        }
    }
    
    async checkAuthentication() {
        try {
            const isAuthenticated = await this.apiService.verifyAdminToken();
            if (!isAuthenticated) {
                throw new Error('Admin authentication required');
            }
            
            // Show authenticated content
            document.body.classList.add('authenticated');
            this.hideLoadingOverlay();
            
        } catch (error) {
            console.error('[Admin3] Authentication failed:', error);
            window.location.href = './admin-login.html';
        }
    }
    
    cacheElements() {
        this.elements = {
            loadingOverlay: document.getElementById('loadingOverlay'),
            progressIndicator: document.getElementById('progressIndicator'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            totalUsers: document.getElementById('totalUsers'),
            activeToday: document.getElementById('activeToday'),
            overallProgress: document.getElementById('overallProgress'),
            totalQuizzes: document.getElementById('totalQuizzes'),
            userSearch: document.getElementById('userSearch'),
            sortBy: document.getElementById('sortBy'),
            usersContent: document.getElementById('usersContent'),
            userDetailsModal: document.getElementById('userDetailsModal'),
            modalTitle: document.getElementById('modalTitle'),
            modalBody: document.getElementById('modalBody')
        };
    }
    
    setupEventListeners() {
        // View toggle buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.view-btn').dataset.view;
                this.setViewMode(view);
            });
        });
        
        // Search functionality
        this.elements.userSearch.addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });
        
        // Sort functionality
        this.elements.sortBy.addEventListener('change', (e) => {
            this.sortUsers(e.target.value);
        });
        
        // Modal close functionality
        window.closeUserModal = () => this.closeUserModal();
        
        // Close modal when clicking outside
        this.elements.userDetailsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.userDetailsModal) {
                this.closeUserModal();
            }
        });
    }
    
    async loadInitialData() {
        try {
            console.log('[Admin3] Loading initial data...');
            
            // Show progress indicator
            this.showProgressIndicator('Loading users...');
            
            // Load users with basic data
            await this.loadUsers();
            
            // Display users immediately
            this.displayUsers();
            this.updateStatistics();
            
            // Start background enrichment
            this.enrichUserDataInBackground();
            
        } catch (error) {
            console.error('[Admin3] Failed to load initial data:', error);
            this.showError('Failed to load user data. Please refresh the page.');
        }
    }
    
    async loadUsers() {
        try {
            console.log('[Admin3] Fetching users from API...');
            const response = await this.apiService.getAllUsers();
            
            if (response.success && response.users) {
                this.users = response.users;
                console.log(`[Admin3] Loaded ${this.users.length} users`);
            } else {
                throw new Error('Invalid response format from API');
            }
            
        } catch (error) {
            console.error('[Admin3] Failed to fetch users:', error);
            throw error;
        }
    }
    
    async enrichUserDataInBackground() {
        try {
            console.log('[Admin3] Starting background data enrichment...');
            
            const totalUsers = this.users.length;
            let processedUsers = 0;
            
            for (const user of this.users) {
                try {
                    // Load user progress
                    await this.loadUserProgress(user.username);
                    
                    // Update progress
                    processedUsers++;
                    const progress = Math.round((processedUsers / totalUsers) * 100);
                    this.updateProgressIndicator(progress, `Enriching data for ${processedUsers}/${totalUsers} users...`);
                    
                    // Small delay to avoid overwhelming the API
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (error) {
                    console.warn(`[Admin3] Failed to enrich data for ${user.username}:`, error);
                }
            }
            
            console.log('[Admin3] Background enrichment complete');
            this.hideProgressIndicator();
            
            // Update display with enriched data
            this.displayUsers();
            this.updateStatistics();
            
        } catch (error) {
            console.error('[Admin3] Background enrichment failed:', error);
            this.hideProgressIndicator();
        }
    }
    
    async loadUserProgress(username) {
        try {
            const response = await this.apiService.getUserProgress(username);
            
            if (response.success && response.data) {
                // Find and update user data
                const userIndex = this.users.findIndex(u => u.username === username);
                if (userIndex !== -1) {
                    this.users[userIndex].quizProgress = response.data.quizProgress || {};
                    this.users[userIndex].quizResults = response.data.quizResults || [];
                }
            }
            
        } catch (error) {
            console.warn(`[Admin3] Failed to load progress for ${username}:`, error);
        }
    }
    
    displayUsers() {
        if (!this.users.length) {
            this.elements.usersContent.innerHTML = '<div class="message info">No users found</div>';
            return;
        }
        
        const filteredUsers = this.getFilteredUsers();
        const sortedUsers = this.getSortedUsers(filteredUsers);
        
        if (this.currentView === 'grid') {
            this.displayGridUsers(sortedUsers);
        } else {
            this.displayListUsers(sortedUsers);
        }
    }
    
    displayGridUsers(users) {
        this.elements.usersContent.className = 'users-grid';
        
        const usersHTML = users.map(user => this.createUserCard(user)).join('');
        this.elements.usersContent.innerHTML = usersHTML;
        
        // Add event listeners to view details buttons
        this.addUserCardEventListeners();
    }
    
    displayListUsers(users) {
        this.elements.usersContent.className = 'users-list';
        
        const usersHTML = users.map(user => this.createUserListCard(user)).join('');
        this.elements.usersContent.innerHTML = usersHTML;
        
        // Add event listeners to view details buttons
        this.addUserCardEventListeners();
    }
    
    createUserCard(user) {
        const stats = this.calculateUserStats(user);
        const progressPercent = this.calculateProgressPercent(user);
        
        return `
            <div class="user-card" data-username="${user.username}">
                <div class="user-header">
                    <span class="username">${user.username}</span>
                    <button class="view-details-btn" data-username="${user.username}">
                        View Details
                    </button>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="progress-text">${progressPercent.toFixed(1)}% Complete</div>
                
                <div class="user-stats">
                    <div class="stat">
                        <span class="stat-label">Assigned:</span>
                        <span class="stat-value">${stats.assigned}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Completed:</span>
                        <span class="stat-value">${stats.completed}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Passed:</span>
                        <span class="stat-value">${stats.passed}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Failed:</span>
                        <span class="stat-value">${stats.failed}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    createUserListCard(user) {
        const stats = this.calculateUserStats(user);
        const progressPercent = this.calculateProgressPercent(user);
        
        return `
            <div class="user-card" data-username="${user.username}">
                <div class="user-header">
                    <span class="username">${user.username}</span>
                    <button class="view-details-btn" data-username="${user.username}">
                        View Details
                    </button>
                </div>
                
                <div class="user-stats">
                    <div class="stat">
                        <span class="stat-label">Assigned:</span>
                        <span class="stat-value">${stats.assigned}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Completed:</span>
                        <span class="stat-value">${stats.completed}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Passed:</span>
                        <span class="stat-value">${stats.passed}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Failed:</span>
                        <span class="stat-value">${stats.failed}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Progress:</span>
                        <span class="stat-value">${progressPercent.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    addUserCardEventListeners() {
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const username = e.target.dataset.username;
                this.showUserDetails(username);
            });
        });
    }
    
    calculateUserStats(user) {
        const hiddenQuizzes = user.hiddenQuizzes || [];
        const visibleQuizzes = this.quizTypes.filter(quizType => 
            !hiddenQuizzes.includes(quizType.toLowerCase())
        );
        
        let assigned = visibleQuizzes.length;
        let completed = 0;
        let passed = 0;
        let failed = 0;
        
        visibleQuizzes.forEach(quizType => {
            const quizLower = quizType.toLowerCase();
            const progress = user.quizProgress?.[quizLower];
            const result = user.quizResults?.find(r => r.quizName.toLowerCase() === quizLower);
            
            if (progress && progress.questionsAnswered >= 15) {
                completed++;
                
                // Calculate score with priority order
                let score = 0;
                
                if (result && result.score !== undefined) {
                    score = result.score;
                } else if (progress.questionHistory && progress.questionHistory.length > 0) {
                    const correctAnswers = progress.questionHistory.filter(q => q.isCorrect).length;
                    score = (correctAnswers / progress.questionHistory.length) * 100;
                } else if (progress.scorePercentage !== undefined) {
                    score = progress.scorePercentage;
                } else if (progress.score !== undefined) {
                    score = progress.score;
                } else if (progress.experience !== undefined) {
                    // Experience fallback calculation
                    const normalizedExperience = Math.max(-150, Math.min(300, progress.experience));
                    score = Math.max(0, Math.min(100, Math.round(((normalizedExperience + 150) / 450) * 100)));
                }
                
                if (score >= 70) {
                    passed++;
                } else {
                    failed++;
                }
            }
        });
        
        return { assigned, completed, passed, failed };
    }
    
    calculateProgressPercent(user) {
        const stats = this.calculateUserStats(user);
        if (stats.assigned === 0) return 0;
        
        const totalQuestions = stats.assigned * 15; // Each quiz has 15 questions
        let answeredQuestions = 0;
        
        const hiddenQuizzes = user.hiddenQuizzes || [];
        const visibleQuizzes = this.quizTypes.filter(quizType => 
            !hiddenQuizzes.includes(quizType.toLowerCase())
        );
        
        visibleQuizzes.forEach(quizType => {
            const quizLower = quizType.toLowerCase();
            const progress = user.quizProgress?.[quizLower];
            
            if (progress) {
                answeredQuestions += progress.questionsAnswered || 0;
            }
        });
        
        return Math.round((answeredQuestions / totalQuestions) * 100);
    }
    
    updateStatistics() {
        if (!this.users.length) return;
        
        const totalUsers = this.users.length;
        const activeToday = this.users.filter(user => {
            const lastLogin = new Date(user.lastLogin || 0);
            const today = new Date();
            return lastLogin.toDateString() === today.toDateString();
        }).length;
        
        const overallProgress = this.users.reduce((total, user) => {
            return total + this.calculateProgressPercent(user);
        }, 0) / totalUsers;
        
        const totalQuizzes = this.quizTypes.length;
        
        // Update DOM
        this.elements.totalUsers.textContent = totalUsers;
        this.elements.activeToday.textContent = activeToday;
        this.elements.overallProgress.textContent = `${overallProgress.toFixed(1)}%`;
        this.elements.totalQuizzes.textContent = totalQuizzes;
    }
    
    getFilteredUsers() {
        const searchQuery = this.elements.userSearch.value.toLowerCase();
        
        if (!searchQuery) return this.users;
        
        return this.users.filter(user => 
            user.username.toLowerCase().includes(searchQuery)
        );
    }
    
    getSortedUsers(users) {
        const sortBy = this.elements.sortBy.value;
        
        return [...users].sort((a, b) => {
            switch (sortBy) {
                case 'username-asc':
                    return a.username.localeCompare(b.username);
                case 'username-desc':
                    return b.username.localeCompare(a.username);
                case 'progress-high':
                    return this.calculateProgressPercent(b) - this.calculateProgressPercent(a);
                case 'progress-low':
                    return this.calculateProgressPercent(a) - this.calculateProgressPercent(b);
                case 'last-active':
                    return new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0);
                default:
                    return 0;
            }
        });
    }
    
    filterUsers(searchQuery) {
        this.displayUsers();
    }
    
    sortUsers(sortBy) {
        this.displayUsers();
    }
    
    setViewMode(view) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Redisplay users with new view
        this.displayUsers();
    }
    
    async showUserDetails(username) {
        try {
            const user = this.users.find(u => u.username === username);
            if (!user) {
                throw new Error('User not found');
            }
            
            // Load detailed progress if not already loaded
            if (!user.quizProgress || Object.keys(user.quizProgress).length === 0) {
                await this.loadUserProgress(username);
            }
            
            // Create modal content
            const modalContent = this.createUserDetailsContent(user);
            
            // Show modal
            this.elements.modalTitle.textContent = `${username}'s Details`;
            this.elements.modalBody.innerHTML = modalContent;
            this.elements.userDetailsModal.style.display = 'flex';
            
        } catch (error) {
            console.error(`[Admin3] Failed to show details for ${username}:`, error);
            this.showError('Failed to load user details');
        }
    }
    
    createUserDetailsContent(user) {
        const stats = this.calculateUserStats(user);
        const progressPercent = this.calculateProgressPercent(user);
        const lastActive = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never';
        
        const hiddenQuizzes = user.hiddenQuizzes || [];
        const visibleQuizzes = this.quizTypes.filter(quizType => 
            !hiddenQuizzes.includes(quizType.toLowerCase())
        );
        
        const quizProgressHTML = visibleQuizzes.map(quizType => {
            const quizLower = quizType.toLowerCase();
            const progress = user.quizProgress?.[quizLower];
            const result = user.quizResults?.find(r => r.quizName.toLowerCase() === quizLower);
            
            let status = 'not-started';
            let score = 0;
            let questionsAnswered = 0;
            
            if (progress && progress.questionsAnswered > 0) {
                questionsAnswered = progress.questionsAnswered;
                
                if (questionsAnswered >= 15) {
                    status = 'completed';
                    
                    // Calculate score with same logic as main calculation
                    if (result && result.score !== undefined) {
                        score = result.score;
                    } else if (progress.questionHistory && progress.questionHistory.length > 0) {
                        const correctAnswers = progress.questionHistory.filter(q => q.isCorrect).length;
                        score = (correctAnswers / progress.questionHistory.length) * 100;
                    } else if (progress.scorePercentage !== undefined) {
                        score = progress.scorePercentage;
                    } else if (progress.score !== undefined) {
                        score = progress.score;
                    } else if (progress.experience !== undefined) {
                        const normalizedExperience = Math.max(-150, Math.min(300, progress.experience));
                        score = Math.max(0, Math.min(100, Math.round(((normalizedExperience + 150) / 450) * 100)));
                    }
                    
                    if (score < 70) {
                        status = 'failed';
                    }
                } else {
                    status = 'in-progress';
                }
            }
            
            const statusClass = `status-${status}`;
            const statusText = status === 'completed' ? 'Completed' : 
                             status === 'in-progress' ? 'In Progress' : 
                             status === 'failed' ? 'Failed' : 'Not Started';
            
            return `
                <div class="quiz-card ${status === 'completed' && score >= 70 ? 'completed-perfect' : 
                                      status === 'completed' && score < 70 ? 'completed-partial' : ''}">
                    <div class="quiz-header">
                        <span class="quiz-name">${this.formatQuizName(quizType)}</span>
                        <span class="quiz-status ${statusClass}">${statusText}</span>
                    </div>
                    ${questionsAnswered > 0 ? `<p>Questions: ${questionsAnswered}/15</p>` : ''}
                    ${score > 0 ? `<p>Score: ${score.toFixed(1)}%</p>` : ''}
                </div>
            `;
        }).join('');
        
        return `
            <div class="user-info">
                <h4>User Information</h4>
                <div class="stat">
                    <span class="stat-label">Username:</span>
                    <span class="stat-value">${user.username}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Overall Progress:</span>
                    <span class="stat-value">${progressPercent.toFixed(1)}%</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Last Active:</span>
                    <span class="stat-value">${lastActive}</span>
                </div>
            </div>
            
            <div class="progress-summary">
                <h4>Progress Summary</h4>
                <div class="stat">
                    <span class="stat-label">Quizzes Assigned:</span>
                    <span class="stat-value">${stats.assigned}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Quizzes Completed:</span>
                    <span class="stat-value">${stats.completed}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Quizzes Passed:</span>
                    <span class="stat-value">${stats.passed}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Quizzes Failed:</span>
                    <span class="stat-value">${stats.failed}</span>
                </div>
            </div>
            
            <div class="quiz-progress">
                <h4>Quiz Progress</h4>
                <div class="quiz-progress-list">
                    ${quizProgressHTML}
                </div>
            </div>
        `;
    }
    
    formatQuizName(quizType) {
        return quizType
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    closeUserModal() {
        this.elements.userDetailsModal.style.display = 'none';
    }
    
    showProgressIndicator(message) {
        this.elements.progressText.textContent = message;
        this.elements.progressIndicator.style.display = 'block';
    }
    
    updateProgressIndicator(percent, message) {
        this.elements.progressFill.style.width = `${percent}%`;
        this.elements.progressText.textContent = message;
    }
    
    hideProgressIndicator() {
        this.elements.progressIndicator.style.display = 'none';
    }
    
    hideLoadingOverlay() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = 'none';
        }
    }
    
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Insert at the top of the dashboard container
        const dashboardContainer = document.querySelector('.dashboard-container');
        dashboardContainer.insertBefore(messageDiv, dashboardContainer.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
    
    showSuccess(message) {
        this.showMessage(message, 'success');
    }
    
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    showInfo(message) {
        this.showMessage(message, 'info');
    }
}

// Initialize the dashboard
const adminDashboard = new Admin3Dashboard();

// Make it globally accessible for debugging
window.adminDashboard = adminDashboard;
