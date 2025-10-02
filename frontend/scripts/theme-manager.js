/**
 * Dark Mode Theme Manager
 * Handles theme toggling and persistence across all user pages
 */

class ThemeManager {
    constructor() {
        this.THEME_KEY = 'qa-learning-hub-theme';
        this.currentTheme = this.loadTheme();
        this.init();
    }

    /**
     * Initialize theme on page load
     */
    init() {
        // Apply theme immediately to prevent flash
        this.applyTheme(this.currentTheme);
        
        // Wait for DOM to be ready before setting up toggle
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupToggle());
        } else {
            this.setupToggle();
        }
    }

    /**
     * Load theme from localStorage
     * @returns {string} 'light' or 'dark'
     */
    loadTheme() {
        const savedTheme = localStorage.getItem(this.THEME_KEY);
        
        // If no saved preference, check system preference
        if (!savedTheme) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            return prefersDark ? 'dark' : 'light';
        }
        
        return savedTheme;
    }

    /**
     * Save theme to localStorage
     * @param {string} theme - 'light' or 'dark'
     */
    saveTheme(theme) {
        localStorage.setItem(this.THEME_KEY, theme);
    }

    /**
     * Apply theme to document
     * @param {string} theme - 'light' or 'dark'
     */
    applyTheme(theme) {
        const body = document.body;
        const html = document.documentElement;
        
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            html.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
            html.classList.remove('dark-mode');
        }
        
        this.currentTheme = theme;
        this.updateToggleButton();
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.saveTheme(newTheme);
    }

    /**
     * Setup theme toggle button
     */
    setupToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
            this.updateToggleButton();
        }
    }

    /**
     * Update toggle button appearance
     */
    updateToggleButton() {
        const toggleBtn = document.getElementById('theme-toggle');
        const icon = document.getElementById('theme-icon');
        
        if (!toggleBtn || !icon) return;
        
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
            toggleBtn.setAttribute('aria-label', 'Switch to light mode');
            toggleBtn.title = 'Switch to light mode';
        } else {
            icon.className = 'fas fa-moon';
            toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
            toggleBtn.title = 'Switch to dark mode';
        }
    }

    /**
     * Get current theme
     * @returns {string} 'light' or 'dark'
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialize theme manager immediately (before DOM loads to prevent flash)
const themeManager = new ThemeManager();

// Export for use in other scripts if needed
export default themeManager;

