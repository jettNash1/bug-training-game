class AdminDashboard {
    constructor() {
        this.apiService = new APIService();
        this.init();
    }

    async init() {
        console.log('Initializing AdminDashboard');
        console.log('Current path:', window.location.pathname);
        
        if (window.location.pathname.includes('admin-login.html')) {
            console.log('Setting up login handler');
            this.setupLoginHandler();
        } else if (window.location.pathname.includes('admin.html')) {
            if (!this.checkAdminAuth()) {
                console.log('No auth token found, redirecting to login');
                window.location.href = 'admin-login.html';
                return;
            }
            this.initializeDashboard();
        }
    }

    async handleLogin(username, password) {
        try {
            console.log('Attempting login with:', { username });
            const response = await this.apiService.post('/admin/login', {
                username,
                password
            });

            console.log('Login response:', response);

            if (response.success) {
                localStorage.setItem('adminToken', response.token);
                window.location.href = 'admin.html';
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                console.error('Response details:', await error.response.text());
            }
            alert('Login failed: ' + (error.message || 'Unknown error'));
            return false;
        }
    }

    setupLoginHandler() {
        const form = document.getElementById('adminLoginForm');
        if (!form) {
            console.error('Login form not found!');
            return;
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;

            if (!username || !password) {
                alert('Please enter both username and password');
                return;
            }

            const success = await this.handleLogin(username, password);
            if (!success) {
                alert('Invalid admin credentials');
            }
        });
    }

    checkAdminAuth() {
        const token = localStorage.getItem('adminToken');
        console.log('Checking admin auth token:', token ? 'Token exists' : 'No token');
        return !!token;
    }

    async initializeDashboard() {
        console.log('Initializing dashboard');
        try {
            const stats = await this.apiService.get('/admin/stats');
            this.updateDashboardStats(stats);
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            if (error.message.includes('401')) {
                alert('Session expired. Please login again.');
                this.handleLogout();
            }
        }
    }

    handleLogout() {
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing AdminDashboard');
    window.dashboard = new AdminDashboard();
}); 