import { APIService } from '../api-service.js';
import { BadgeService } from './badge-service.js';

class BadgesPage {
    constructor() {
        this.apiService = new APIService();
        this.badgeService = new BadgeService(this.apiService);
        this.initialize();
        this.showLoadingOverlay();
    }

    showLoadingOverlay() {
        // Create loading overlay if it doesn't exist
        if (!document.querySelector('.loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading your achievements...</div>
            `;
            document.body.appendChild(overlay);

            // Add styles if they don't exist
            if (!document.querySelector('#loading-styles')) {
                const styles = document.createElement('style');
                styles.id = 'loading-styles';
                styles.textContent = `
                    .loading-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(255, 255, 255, 0.9);
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        z-index: 9999;
                    }
                    .loading-spinner {
                        width: 50px;
                        height: 50px;
                        border: 5px solid #f3f3f3;
                        border-top: 5px solid var(--primary-color, #4a90e2);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 20px;
                    }
                    .loading-text {
                        font-size: 1.2em;
                        color: var(--primary-color, #4a90e2);
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(styles);
            }
        }
    }

    hideLoadingOverlay() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            // Add fade-out animation
            overlay.style.transition = 'opacity 0.3s ease-out';
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
    }

    async initialize() {
        try {
            // Check if user is logged in
            const username = localStorage.getItem('username');
            if (!username) {
                window.location.href = '/login.html';
                return;
            }

            // Update username in the header if not already done
            const usernameElement = document.getElementById('headerUsername');
            if (usernameElement && !usernameElement.textContent) {
                usernameElement.textContent = username;
            }

            // Apply enhanced styling
            this.applyEnhancedStyling();

            // Load badges data
            await this.loadBadges();
            this.hideLoadingOverlay();
        } catch (error) {
            console.error('Failed to initialize badges page:', error);
            this.hideLoadingOverlay();
            this.showError('Failed to load your badges. Please try again later.');
        }
    }

    applyEnhancedStyling() {
        if (document.getElementById('enhanced-badge-styles')) return;

        const enhancedStyles = document.createElement('style');
        enhancedStyles.id = 'enhanced-badge-styles';
        enhancedStyles.textContent = `
            body {
                background-color: #f5f7fa;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
            }
            
            .container {
                max-width: 1200px;
                margin: 30px auto;
                padding: 0 20px;
            }
            
            h1 {
                color: #333;
                font-size: 28px;
                margin-bottom: 30px;
                padding-bottom: 10px;
                border-bottom: 2px solid #eaeaea;
            }
            
            .badges-summary {
                background-color: white;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                padding: 20px;
                margin-bottom: 30px;
            }
            
            .badges-container {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 25px;
                margin-top: 30px;
            }
            
            .category-header {
                color: #333;
                font-size: 22px;
                margin-bottom: 20px;
                font-weight: 600;
            }
            
            .badge-card {
                background-color: white;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                padding: 25px 20px;
                text-align: center;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
                overflow: hidden;
                border: 1px solid #eaeaea;
                height: 100%;
            }
            
            .badge-card.locked {
                background-color: #f8f8f8;
                filter: grayscale(90%);
                opacity: 0.85;
            }
            
            .badge-card:not(.locked):hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            }
            
            .badge-icon {
                width: 90px;
                height: 90px;
                background-color: var(--primary-color, #4a90e2);
                color: white;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 20px;
                font-size: 40px;
                box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
            }
            
            .badge-card.locked .badge-icon {
                background-color: #bbb;
                box-shadow: none;
            }
            
            .badge-name {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
                color: var(--primary-color, #4a90e2);
            }
            
            .badge-card.locked .badge-name {
                color: #777;
            }
            
            .badge-description {
                font-size: 14px;
                color: #666;
                margin-bottom: 15px;
                line-height: 1.5;
            }
            
            .locked-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(245, 245, 245, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .lock-icon {
                position: absolute;
                bottom: 15px;
                right: 15px;
                color: #aaa;
                font-size: 20px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .progress-container {
                width: 100%;
            }
            
            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .progress-title {
                font-size: 16px;
                font-weight: 600;
                color: #555;
            }
            
            .progress-text {
                font-size: 16px;
                font-weight: 500;
                color: var(--primary-color, #4a90e2);
            }
            
            .progress-bar {
                height: 12px;
                background-color: #eee;
                border-radius: 6px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background-color: var(--primary-color, #4a90e2);
                border-radius: 6px;
                transition: width 0.5s ease-in-out;
            }
        `;
        document.head.appendChild(enhancedStyles);
        
        // Add Font Awesome if not already included
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
    }

    showError(message) {
        // Create an error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            background-color: #fff5f5;
            color: #e53e3e;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            border: 1px solid #fed7d7;
        `;
        
        // Add it to the container
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(errorElement, container.firstChild);
        } else {
            document.body.insertBefore(errorElement, document.body.firstChild);
        }
    }

    async loadBadges() {
        try {
            // Get the user's badges
            const badgesData = await this.badgeService.getUserBadges();
            
            // Update the badge counters
            const earnedElement = document.getElementById('badges-earned');
            const totalElement = document.getElementById('badges-total');
            const progressElement = document.getElementById('badges-progress');
            
            if (earnedElement) earnedElement.textContent = badgesData.earnedCount;
            if (totalElement) totalElement.textContent = badgesData.totalBadges;
            
            // Calculate progress percentage
            const progressPercentage = badgesData.totalBadges > 0 
                ? Math.round((badgesData.earnedCount / badgesData.totalBadges) * 100) 
                : 0;
            
            // Update progress bar
            if (progressElement) {
                progressElement.style.width = `${progressPercentage}%`;
            }
            
            // Get the badges container
            const badgesGrid = document.getElementById('badges-grid');
            if (!badgesGrid) return;
            
            // Clear existing content
            badgesGrid.innerHTML = '';
            
            // Add each badge to the grid
            badgesData.badges.forEach(badge => {
                const badgeElement = this.createBadgeElement(badge);
                badgesGrid.appendChild(badgeElement);
            });
            
            // If no badges, show a message
            if (badgesData.badges.length === 0) {
                const noBadgesMessage = document.createElement('div');
                noBadgesMessage.className = 'no-badges-message';
                noBadgesMessage.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 80px; color: #ccc; margin-bottom: 20px;">
                            <i class="fa-solid fa-award"></i>
                        </div>
                        <h3 style="color: #555; margin-bottom: 10px;">No Badges Available Yet</h3>
                        <p style="color: #777;">Complete quizzes to earn achievement badges!</p>
                    </div>
                `;
                badgesGrid.appendChild(noBadgesMessage);
            }
        } catch (error) {
            console.error('Error loading badges:', error);
            this.showError('Failed to load your badges data. Please try again later.');
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
            ${!badge.earned ? '<div class="lock-icon"><i class="fa-solid fa-lock"></i></div>' : ''}
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