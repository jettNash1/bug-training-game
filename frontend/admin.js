import { APIService } from './api-service.js';

class AdminDashboard {
    constructor() {
        this.apiService = new APIService();
        this.users = [];
        this.userScores = new Map();
        this.quizTypes = [
            'communication',
            'initiative', 
            'time-management',
            'tester-mindset',
            'risk-analysis',
            'risk-management',
            'non-functional',
            'test-support',
            'issue-verification',
            'build-verification',
            'issue-tracking-tools',
            'raising-tickets',
            'reports',
            'cms-testing'
        ];
        console.log('AdminDashboard initialized with empty userScores map'); // Debug log
    }

    async init() {
        console.log('Initializing AdminDashboard');
        const adminToken = localStorage.getItem('adminToken');
        const currentPath = window.location.pathname;
        
        console.log('Current path:', currentPath); // Debug log
        
        // Only verify token if we're on admin pages
        if (currentPath.includes('admin')) {
            console.log('On admin page, verifying token...'); // Debug log
            const isTokenValid = await this.verifyAdminToken(adminToken);
            console.log('Token valid:', isTokenValid); // Debug log
            
            if (currentPath.includes('admin-login.html')) {
                if (isTokenValid) {
                    console.log('Valid token on login page, redirecting to admin panel'); // Debug log
                    window.location.href = '/pages/admin.html';
                    return;
                }
            } else if (currentPath.includes('admin.html')) {
                if (!isTokenValid) {
                    console.log('Invalid token on admin panel, redirecting to login'); // Debug log
                    window.location.href = '/pages/admin-login.html';
                    return;
                }
                console.log('Valid token on admin panel, loading dashboard...'); // Debug log
                try {
                await this.loadDashboard();
                    console.log('Dashboard loaded successfully'); // Debug log
                } catch (error) {
                    console.error('Error loading dashboard:', error);
                    this.showError('Failed to load dashboard');
                }
            }
        } else {
            console.log('Not on admin page, skipping initialization'); // Debug log
        }
    }

    async verifyAdminToken(token) {
        if (!token) return false;
        
        try {
            const response = await fetch(`${this.apiService.baseUrl}/admin/verify-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) return false;

            const data = await response.json();
            return data.success && data.valid && data.isAdmin;
        } catch (error) {
            console.error('Admin token verification failed:', error);
            return false;
        }
    }

    async handleAdminLogin() {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        try {
            const response = await fetch(`${this.apiService.baseUrl}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (data.success && data.token && data.isAdmin) {
                localStorage.setItem('adminToken', data.token);
                window.location.href = '/pages/admin.html';
            } else {
                this.showError(data.message || 'Invalid admin credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please try again.');
        }
    }

    async handleAdminLogout() {
        localStorage.removeItem('adminToken');
        window.location.href = '/pages/admin-login.html';
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
            console.log('Fetching users...'); // Debug log
            const response = await fetch(`${this.apiService.baseUrl}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            console.log('User data received:', data); // Debug log

            if (!data.success) {
                throw new Error(data.message || 'Failed to load users');
            }

            this.users = data.users || [];
            console.log('Users loaded:', this.users); // Debug log

            // Process quiz results immediately
            const newScores = new Map();
            
            this.users.forEach(user => {
                const scores = this.quizTypes.map(quizName => {
                    // Find the matching quiz result, normalizing the quiz name for comparison
                    const quizData = user.quizResults?.find(result => 
                        this.normalizeQuizName(result.quizName) === this.normalizeQuizName(quizName)
                    ) || {};

                    return {
                        quizName,
                        score: quizData.score || 0,
                        experience: quizData.experience || 0,
                        questionsAnswered: quizData.questionsAnswered || 0,
                        currentScenario: quizData.questionsAnswered || 0,
                        lastActive: quizData.completedAt || null,
                        answers: quizData.answers || []
                    };
                });

                newScores.set(user.username, scores);
            });

            // Update the userScores map
            console.log('Setting initial user scores');
            this.userScores = newScores;
            console.log('User scores initialized:', Object.fromEntries(this.userScores));

        } catch (error) {
            console.error('Failed to load users:', error);
            this.users = [];
            this.userScores = new Map();
        }
    }

    async loadAllUserProgress() {
        // Since we already have all the progress data from the initial user load,
        // we just need to update the dashboard
        console.log('Using existing progress data from user load');
        this.updateDashboard();
    }

    async loadUserProgress(username) {
        try {
            console.log(`Fetching progress for ${username} from API...`);
            const response = await this.apiService.fetchWithAdminAuth(
                `${this.apiService.baseUrl}/admin/users/${username}/quiz-results`
            );

            if (!response.ok) {
                console.error(`Failed to fetch progress for ${username}: ${response.status}`);
                return this.getDefaultScores();
            }

            const text = await response.text();
            console.log(`Raw response for ${username}:`, text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error(`Failed to parse JSON for ${username}:`, e);
                return this.getDefaultScores();
            }
            
            if (!data.success || !data.data) {
                console.log(`No progress data for ${username}, returning defaults`);
                return this.getDefaultScores();
            }

            console.log(`Processing quiz results for ${username}:`, data.data);

            // Convert the quiz progress data into our expected format
            const scores = this.quizTypes.map(quizName => {
                // Find the matching quiz result
                const quizData = data.data.find(result => 
                    this.normalizeQuizName(result.quizName) === this.normalizeQuizName(quizName)
                ) || {};

                const score = {
                    quizName,
                    score: quizData.score || 0,
                    experience: quizData.experience || 0,
                    questionsAnswered: quizData.questionsAnswered || 0,
                    currentScenario: quizData.questionsAnswered || 0,
                    lastActive: quizData.completedAt || null,
                    answers: quizData.answers || []
                };

                console.log(`Processed ${quizName} for ${username}:`, score);
                return score;
            });

            console.log(`Completed processing progress for ${username}`);
            return scores;
        } catch (error) {
            console.error(`Failed to load progress for ${username}:`, error);
            return this.getDefaultScores();
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
        const searchInput = document.getElementById('userSearch');
        const sortSelect = document.getElementById('sortBy');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.updateDashboard());
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.updateDashboard());
        }
    }

    updateDashboard() {
        console.log('Updating dashboard with users:', this.users); // Debug log
        console.log('User scores:', Object.fromEntries(this.userScores)); // Debug log
        
        // Update total users count immediately
        const totalUsersElement = document.getElementById('totalUsers');
        if (totalUsersElement) {
            totalUsersElement.textContent = this.users.length;
            console.log('Updated total users:', this.users.length);
        }

        try {
            console.log('Starting statistics update...'); // Debug log
        this.updateStatistics();
            console.log('Statistics updated, updating user list...'); // Debug log
        this.updateUserList();
            console.log('Dashboard update complete'); // Debug log
        } catch (error) {
            console.error('Error during dashboard update:', error);
            this.showError('Failed to update dashboard');
        }
    }

    updateStatistics() {
        const totalUsersElement = document.getElementById('totalUsers');
        const activeUsersElement = document.getElementById('activeUsers');
        const averageCompletionElement = document.getElementById('averageCompletion');

        if (!this.users || !this.users.length) {
            console.log('No users to update statistics for');
            if (totalUsersElement) totalUsersElement.textContent = '0';
            if (activeUsersElement) activeUsersElement.textContent = '0';
            if (averageCompletionElement) averageCompletionElement.textContent = '0%';
            return;
        }

        const today = new Date().setHours(0, 0, 0, 0);
        let activeUsers = 0;
        let totalProgress = 0;
        let usersWithProgress = 0;

        console.log('Calculating statistics for', this.users.length, 'users');

        this.users.forEach(user => {
            const scores = this.userScores.get(user.username) || [];
            
            // Check if user was active today
            const wasActiveToday = scores.some(score => {
                if (!score.lastActive) return false;
                const activeDate = new Date(score.lastActive).setHours(0, 0, 0, 0);
                return activeDate === today;
            });
            if (wasActiveToday) {
                activeUsers++;
                console.log(`${user.username} was active today`);
            }

            // Calculate user's overall progress
            const userProgress = this.calculateProgress(scores);
            if (scores.some(score => score.score > 0)) {
                totalProgress += userProgress;
                usersWithProgress++;
                console.log(`${user.username} has progress:`, userProgress);
            }
        });

        console.log('Statistics calculated:', {
            totalUsers: this.users.length,
            activeUsers,
            averageProgress: usersWithProgress > 0 ? Math.round(totalProgress / usersWithProgress) : 0
        });

        if (totalUsersElement) totalUsersElement.textContent = this.users.length;
        if (activeUsersElement) activeUsersElement.textContent = activeUsers;
        if (averageCompletionElement) {
            const averageProgress = usersWithProgress > 0 ? Math.round(totalProgress / usersWithProgress) : 0;
            averageCompletionElement.textContent = `${averageProgress}%`;
        }
    }

    updateUserList() {
        const container = document.getElementById('usersList');
        if (!container) {
            console.error('User list container not found');
            return;
        }

        console.log('Starting updateUserList with container:', container);

        if (!this.users || !this.users.length) {
            console.log('No users to display');
            container.innerHTML = '<div class="no-users">No users found</div>';
            return;
        }

        console.log('Updating user list with:', this.users.length, 'users');

        const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
        const sortBy = document.getElementById('sortBy')?.value || 'username-asc';

        let filteredUsers = this.users.filter(user => 
            user.username.toLowerCase().includes(searchTerm)
        );

        console.log('Filtered users:', filteredUsers);

        // Sort users
        filteredUsers.sort((a, b) => {
            const scoresA = this.userScores.get(a.username) || [];
            const scoresB = this.userScores.get(b.username) || [];
            
            switch (sortBy) {
                case 'username-asc':
                    return a.username.localeCompare(b.username);
                case 'username-desc':
                    return b.username.localeCompare(a.username);
                case 'progress-high':
                    return this.calculateProgress(scoresB) - this.calculateProgress(scoresA);
                case 'progress-low':
                    return this.calculateProgress(scoresA) - this.calculateProgress(scoresB);
                case 'last-active':
                    const lastActiveA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
                    const lastActiveB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
                    return lastActiveB - lastActiveA;
                default:
                    return 0;
            }
        });

        console.log('Sorted users:', filteredUsers);

        try {
        // Clear existing content
            console.log('Clearing container');
        container.innerHTML = '';

        // Create and append user cards
            console.log('Creating user cards');
            filteredUsers.forEach((user, index) => {
                console.log(`Creating card ${index + 1} for user:`, user.username);
                
            const scores = this.userScores.get(user.username) || [];
            const progress = this.calculateProgress(scores);
            const lastActive = user.lastLogin ? new Date(user.lastLogin).getTime() : 0;

            // Get communication quiz data
            const communicationQuiz = scores.find(score => score.quizName === 'communication') || {
                questionsAnswered: 0,
                experience: 0
            };

            const card = document.createElement('div');
            card.className = 'user-card';
                
            const cardContent = document.createElement('div');
            cardContent.className = 'user-header';
            cardContent.innerHTML = `
                <h4>${user.username}</h4>
                <div class="user-stats">
                    <div class="total-score">Overall Progress: ${progress.toFixed(1)}%</div>
                    <div class="last-active">Last Active: ${this.formatDate(lastActive)}</div>
                </div>
            `;
                
                const viewDetailsBtn = document.createElement('button');
                viewDetailsBtn.className = 'view-details-btn';
                viewDetailsBtn.textContent = 'View Details';
                viewDetailsBtn.addEventListener('click', () => {
                    this.showUserDetails(user.username);
                });
                
                card.appendChild(cardContent);
                card.appendChild(viewDetailsBtn);
            container.appendChild(card);

                console.log(`Card ${index + 1} created and appended for ${user.username}`);
            });

            console.log('All cards created and appended');
            console.log('Container contents:', container.innerHTML);
        } catch (error) {
            console.error('Error creating user cards:', error);
            this.showError('Failed to display user list');
        }

        console.log('User list update complete');
    }

    async showUserDetails(username) {
        try {
            console.log(`Opening details for ${username}`);
            const scores = this.userScores.get(username) || [];
            const user = this.users.find(u => u.username === username);
            
            if (!user) {
                console.error(`User ${username} not found`);
                return;
            }

            const overlay = document.createElement('div');
            overlay.className = 'details-overlay';
            overlay.innerHTML = `
                <div class="details-content">
                    <button class="close-btn">&times;</button>
                    <h3>${username}'s Progress Details</h3>
                    <div class="quiz-details">
                        ${this.quizTypes.map(quizName => {
                            const quizData = scores.find(score => 
                                this.normalizeQuizName(score.quizName) === this.normalizeQuizName(quizName)
                            ) || {
                                score: 0,
                                experience: 0,
                                questionsAnswered: 0,
                                currentScenario: 0,
                                lastActive: null
                            };

                            return `
                                <div class="quiz-item">
                                    <h4>${this.formatQuizName(quizName)}</h4>
                                    <div class="quiz-stats">
                                        <div>Progress: ${quizData.score || 0}%</div>
                                        <div>Questions: ${quizData.currentScenario || 0}/15</div>
                                        <div>XP: ${quizData.experience || 0}</div>
                                        <div>Last Active: ${quizData.lastActive ? this.formatDate(new Date(quizData.lastActive).getTime()) : 'Never'}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;

            // Add close button functionality
            const closeBtn = overlay.querySelector('.close-btn');
            closeBtn.addEventListener('click', () => {
                overlay.remove();
            });

            // Add click outside to close
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                }
            });

            document.body.appendChild(overlay);
        } catch (error) {
            console.error('Failed to show user details:', error);
            this.showError('Failed to load user details');
        }
    }

    async resetQuizProgress(username, quizName) {
        try {
            const response = await fetch(
                `${this.apiService.baseUrl}/users/${username}/quiz-progress/${quizName}/reset`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to reset quiz progress');
            }

            // Reload the user's progress
            const scores = await this.loadUserProgress(username);
            this.userScores.set(username, scores);

            // Refresh the details view
            const existingOverlay = document.querySelector('.user-details-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
                await this.showUserDetails(username);
            }

            this.updateDashboard();
        } catch (error) {
            console.error('Error resetting progress:', error);
            this.showError('Failed to reset progress');
        }
    }

    calculateProgress(scores) {
        if (!scores || !scores.length) return 0;
        
        // Sum up all quiz scores (defaulting to 0 for unstarted quizzes)
        const totalScore = scores.reduce((sum, score) => sum + (score.score || 0), 0);
        // Calculate average score across all quizzes (14 total)
        return totalScore / 14;
    }

    getLastActive(scores) {
        if (!scores.length) return 0;
        return Math.max(...scores
            .map(score => score.lastActive ? new Date(score.lastActive).getTime() : 0)
            .filter(time => time > 0)) || 0;
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
        return isNaN(date.getTime()) ? 'Never' : date.toLocaleDateString();
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Export the AdminDashboard class directly
export { AdminDashboard }; 