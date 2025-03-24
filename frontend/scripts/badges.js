import { APIService } from '../api-service.js';
import { BadgeService } from './badge-service.js';

class BadgesPage {
    constructor() {
        this.apiService = new APIService();
        this.badgeService = new BadgeService(this.apiService);
        this.badgesGrid = document.getElementById('badges-grid');
        this.initialize();
    }

    async initialize() {
        try {
            // Check if user is logged in
            const username = localStorage.getItem('username');
            if (!username) {
                window.location.href = '/login.html';
                return;
            }

            await this.loadBadges();
            this.hideLoadingOverlay();
        } catch (error) {
            console.error('Failed to initialize badges page:', error);
            this.hideLoadingOverlay();
            this.showError('Failed to load your badges. Please try again later.');
        }
    }

    hideLoadingOverlay() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.style.transition = 'opacity 0.3s ease-out';
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
    }

    showError(message) {
        // Create an error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        // Add it before the badges grid
        const container = document.querySelector('.container');
        container.insertBefore(errorElement, this.badgesGrid);
    }

    async loadBadges() {
        // Get the user's badges
        const badgesData = await this.badgeService.getUserBadges();
        
        // Update the progress bar
        document.getElementById('badges-earned').textContent = badgesData.earnedCount;
        document.getElementById('badges-total').textContent = badgesData.totalBadges;
        
        const progressPercentage = badgesData.totalBadges > 0 
            ? Math.round((badgesData.earnedCount / badgesData.totalBadges) * 100) 
            : 0;
        
        document.getElementById('badges-progress').style.width = `${progressPercentage}%`;
        
        // Clear the badges grid
        this.badgesGrid.innerHTML = '';
        
        // Add each badge to the grid
        badgesData.badges.forEach(badge => {
            const badgeElement = this.createBadgeElement(badge);
            this.badgesGrid.appendChild(badgeElement);
        });
        
        // If no badges, show a message
        if (badgesData.badges.length === 0) {
            const noBadgesMessage = document.createElement('div');
            noBadgesMessage.className = 'no-badges-message';
            noBadgesMessage.textContent = 'No badges available yet. Check back soon!';
            this.badgesGrid.appendChild(noBadgesMessage);
        }
    }

    createBadgeElement(badge) {
        const badgeElement = document.createElement('div');
        badgeElement.className = `badge-card ${badge.earned ? '' : 'locked'}`;
        badgeElement.id = `badge-${badge.id}`;
        
        badgeElement.innerHTML = `
            <div class="badge-icon">
                <i class="${badge.icon}"></i>
            </div>
            <h3 class="badge-name">${badge.name}</h3>
            <p class="badge-description">${badge.description}</p>
            <div class="locked-overlay">
                <i class="fa-solid fa-lock"></i>
            </div>
        `;
        
        return badgeElement;
    }
}

// Initialize the badges page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BadgesPage();
});

// Expose handleLogout to the window object (reusing from index.js)
window.handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    
    // Redirect to login page
    window.location.href = '/login.html';
}; 