class AdminDashboard {
    constructor() {
        this.apiService = new ApiService();
        this.init();
    }

    async init() {
        if (window.location.pathname.includes('admin-login.html')) {
            this.setupLoginHandler();
        } else if (window.location.pathname.includes('admin.html')) {
            if (!this.checkAdminAuth()) {
                window.location.href = 'admin-login.html';
                return;
            }
            this.initializeDashboard();
        }
    }

    async handleLogin(username, password) {
        try {
            const response = await this.apiService.post('/api/admin/login', {
                username,
                password
            });

            if (response.success) {
                localStorage.setItem('adminToken', response.token);
                window.location.href = 'admin.html';
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    setupLoginHandler() {
        const form = document.getElementById('adminLoginForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('adminUsername').value;
                const password = document.getElementById('adminPassword').value;
                const success = await this.handleLogin(username, password);
                
                if (!success) {
                    alert('Invalid admin credentials');
                }
            });
        }
    }

    checkAdminAuth() {
        const token = localStorage.getItem('adminToken');
        return !!token;
    }

    // ... rest of your existing AdminDashboard class methods
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AdminDashboard();
}); 