import { APIService } from '../api-service.js';
import { BadgeService } from './badge-service.js';

class BadgesPage {
    constructor() {
        this.apiService = new APIService();
        this.badgeService = new BadgeService(this.apiService);
        this.showLoadingOverlay();
        // Make initialization async and handle errors
        this.initialize().catch(error => {
            console.error('Failed to initialize badges page:', error);
            this.hideLoadingOverlay();
            this.showError('Failed to load your badges. Please try again later.');
        });
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

            // Preload default badge image
            this.preloadImage('assets/badges/default.svg');

            // Load badges data with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Loading badges timed out')), 10000);
            });

            const loadBadgesPromise = this.loadBadges();
            await Promise.race([loadBadgesPromise, timeoutPromise]);
            
            this.hideLoadingOverlay();
        } catch (error) {
            console.error('Failed to initialize badges page:', error);
            this.hideLoadingOverlay();
            this.showError(error.message || 'Failed to load your badges. Please try again later.');
            throw error; // Re-throw to be caught by the constructor
        }
    }

    applyEnhancedStyling() {
        // We no longer need to add enhanced styling here since we're using badges.css
        // Just make sure Font Awesome is loaded
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
            console.log('Starting to load badges...');
            // Get the user's badges
            const badgesData = await this.badgeService.getUserBadges();
            console.log('Badges data received:', badgesData);
            
            if (!badgesData || !badgesData.badges) {
                throw new Error('Invalid badges data received');
            }
            
            // Preload all badge images
            badgesData.badges.forEach(badge => {
                if (badge.imagePath) {
                    this.preloadImage(badge.imagePath);
                }
            });
            
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
            if (!badgesGrid) {
                throw new Error('Badges grid container not found');
            }
            
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
            throw error; // Re-throw to be caught by initialize()
        }
    }

    createBadgeElement(badge) {
        const badgeElement = document.createElement('div');
        badgeElement.className = `badge-card ${badge.earned ? '' : 'locked'}`;
        badgeElement.id = `badge-${badge.id}`;
        
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
        
        // Normalize image path if needed
        let imagePath = badge.imagePath;
        if (imagePath && imagePath.endsWith('.svg')) {
            // Normalize paths for specific quiz types 
            if (imagePath.toLowerCase().includes('cms')) {
                imagePath = 'assets/badges/cms-testing.svg';
            } else if ((imagePath.toLowerCase().includes('sanity') || imagePath.toLowerCase().includes('smoke')) && 
                       !imagePath.includes('sanity-smoke.svg')) {
                imagePath = 'assets/badges/sanity-smoke.svg';
            } else if (imagePath.toLowerCase().includes('exploratory') && !imagePath.endsWith('exploratory.svg')) {
                imagePath = 'assets/badges/exploratory.svg';
            }
        }
        
        // Check if we have an image path
        const badgeIconHtml = imagePath ? 
            `<img src="${imagePath}" alt="${badge.name}" class="badge-image" onerror="this.onerror=null; this.src='assets/badges/default.svg';">` : 
            `<i class="${badge.icon}"></i>`;
        
        badgeElement.innerHTML = `
            <div class="badge-icon">
                ${badgeIconHtml}
            </div>
            <h3 class="badge-name">${badge.name}</h3>
            <p class="badge-description">${badge.description}</p>
            ${completionDateHtml}
            ${!badge.earned ? '<div class="lock-icon"><i class="fa-solid fa-lock"></i></div>' : ''}
        `;
        
        return badgeElement;
    }

    // Helper method to preload images
    preloadImage(src) {
        const img = new Image();
        
        // Ensure we're using the correct SVG paths
        // This helps with potential case sensitivity issues or outdated paths
        if (src.endsWith('.svg')) {
            // Normalize paths for specific quiz types
            if (src.toLowerCase().includes('cms')) {
                src = 'assets/badges/cms-testing.svg';
            } else if ((src.toLowerCase().includes('sanity') || src.toLowerCase().includes('smoke')) && 
                !src.includes('sanity-smoke.svg')) {
                src = 'assets/badges/sanity-smoke.svg';
            } else if (src.toLowerCase().includes('exploratory') && !src.endsWith('exploratory.svg')) {
                src = 'assets/badges/exploratory.svg';
            }
        }
        
        img.src = src;
        
        // For SVG files, we may need special handling
        if (src.endsWith('.svg')) {
            fetch(src)
                .then(response => response.ok ? response.text() : Promise.reject('Failed to load SVG'))
                .then(svgContent => {
                    // SVG loaded successfully
                    console.log(`SVG ${src} preloaded successfully`);
                })
                .catch(error => {
                    console.warn(`Failed to preload SVG ${src}:`, error);
                });
        }
        
        return img;
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