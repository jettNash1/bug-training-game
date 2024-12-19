class AdminDashboard {
    constructor() {
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

    handleLogin(username, password) {
        // Hardcoded admin credentials
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('adminToken', 'admin_authenticated');
            window.location.href = 'admin.html';
            return true;
        }
        return false;
    }

    setupLoginHandler() {
        const form = document.getElementById('adminLoginForm');
        if (!form) {
            console.error('Login form not found!');
            return;
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;

            if (!username || !password) {
                alert('Please enter both username and password');
                return;
            }

            const success = this.handleLogin(username, password);
            if (!success) {
                alert('Invalid admin credentials');
            }
        });
    }

    checkAdminAuth() {
        const token = localStorage.getItem('adminToken');
        return token === 'admin_authenticated';
    }

    initializeDashboard() {
        console.log('Initializing dashboard');
        // Add any dashboard initialization code here
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