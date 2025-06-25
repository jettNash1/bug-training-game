// Environment detection
const isProd = window.location.hostname.includes('render.com') || 
               window.location.hostname === 'bug-training-game.onrender.com' ||
               window.location.hostname.includes('amazonaws.com') ||
               window.location.hostname.includes('cloudfront.net') ||
               window.location.hostname.includes('s3-website') ||
               window.location.hostname.includes('learning-hub');

// Get the API endpoint based on environment
const getApiEndpoint = () => {
    // Always use the Render API endpoint in production
    if (isProd) {
        return 'https://bug-training-game-api.onrender.com';
    }
    
    // Local development
    return 'http://localhost:3000';
};

// Configuration object
export const config = {
    apiUrl: `${getApiEndpoint()}/api`,
    wsUrl: `${getApiEndpoint().replace('http', 'ws')}/ws`,
    isProduction: isProd
};

// Log configuration in all environments to help with debugging
console.log('App configuration:', {
    environment: isProd ? 'production' : 'development',
    hostname: window.location.hostname,
    apiUrl: config.apiUrl,
    wsUrl: config.wsUrl
});

// Configuration settings for the application
export const CONFIG = {
    // API Configuration
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://bug-training-game.onrender.com',
    
    // Automatic Cache Control - No manual updates needed!
    APP_VERSION: 'auto', // Auto-generated from build timestamp
    CACHE_BUST_TIMESTAMP: Date.now(), // Auto-generated timestamp
    
    // Cache busting settings - Enable only automatic cache busting
    ENABLE_CACHE_BUSTING: true,
    VERSION_CHECK_INTERVAL: 60000, // Check every 60 seconds (less frequent)
    
    // Simplified feature flags - No manual version management
    ENABLE_VERSION_CHECKING: false, // Disabled - relies on timestamp-based busting
    FORCE_REFRESH_ON_VERSION_MISMATCH: false, // Disabled for simplified approach
    
    // Quiz Configuration
    DEFAULT_TIMER_SECONDS: 30,
    MAX_SCENARIOS_PER_LEVEL: 5,
    
    // Storage keys
    STORAGE_KEYS: {
        VERSION: 'app_version',
        USER_TOKEN: 'userToken',
        USERNAME: 'username',
        QUIZ_PROGRESS: 'quizProgress',
        TIMER_SETTINGS: 'quizTimerSettings',
        LAST_CACHE_CLEAR: 'last_cache_clear'
    }
};

// Simplified cache busting utilities
export const CacheUtils = {
    /**
     * Generates a cache-busted URL by appending timestamp
     * @param {string} url - The original URL
     * @returns {string} - URL with cache busting parameters
     */
    addCacheBust(url) {
        if (!CONFIG.ENABLE_CACHE_BUSTING) return url;
        
        const separator = url.includes('?') ? '&' : '?';
        const timestamp = Date.now();
        return `${url}${separator}cb=${timestamp}`;
    },
    
    /**
     * Checks if cache should be cleared (based on time since last clear)
     * @returns {boolean} - True if cache should be cleared
     */
    shouldClearCache() {
        const lastClear = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_CACHE_CLEAR);
        if (!lastClear) return false;
        
        const timeSinceLastClear = Date.now() - parseInt(lastClear);
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        
        // Clear cache if it's been more than 1 hour since last clear
        return timeSinceLastClear > oneHour;
    },

    /**
     * Checks if a timer persistence key is still active (recent)
     * @param {string} key - The localStorage key to check
     * @returns {boolean} - True if timer key is still active
     */
    isActiveTimerKey(key) {
        try {
            // Timer keys have format: quizname_timer_username_qN
            if (!key.includes('_timer_') || !key.includes('_q')) {
                return false;
            }
            
            const timerData = localStorage.getItem(key);
            if (!timerData) return false;
            
            const data = JSON.parse(timerData);
            if (!data.timestamp) return false;
            
            // Consider active if saved within last 30 minutes
            const thirtyMinutes = 30 * 60 * 1000;
            return (Date.now() - data.timestamp) < thirtyMinutes;
        } catch (error) {
            return false; // If we can't parse it, it's probably old/invalid
        }
    },
    
    /**
     * Simple cache clearing for page load issues
     */
    async clearOldCache() {
        try {
            const lastClear = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_CACHE_CLEAR);
            const now = Date.now();
            
            // Only clear if we haven't cleared recently
            if (lastClear && (now - parseInt(lastClear)) < 60000) { // 1 minute
                return;
            }
            
            console.log('[CacheUtils] Performing automatic cache maintenance...');
            
            // Clear old quiz-related cached data (but preserve user data and active timers)
            const preserveKeys = [
                CONFIG.STORAGE_KEYS.USER_TOKEN,
                CONFIG.STORAGE_KEYS.USERNAME,
                CONFIG.STORAGE_KEYS.LAST_CACHE_CLEAR
            ];
            
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && !preserveKeys.includes(key)) {
                    // Only remove specific old app data, but protect active timer sessions
                    if (key.includes('app_') || key.includes('quiz_progress_old_') || key.includes('stale_')) {
                        keysToRemove.push(key);
                    } else if (key.includes('timer_')) {
                        // For timer keys, only remove if they're old/inactive
                        if (!this.isActiveTimerKey(key)) {
                            keysToRemove.push(key);
                            console.log(`[CacheUtils] Removing old timer key: ${key}`);
                        } else {
                            console.log(`[CacheUtils] Preserving active timer key: ${key}`);
                        }
                    }
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Clear session storage
            sessionStorage.clear();
            
            // Update last clear timestamp
            localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_CACHE_CLEAR, now.toString());
            
            if (keysToRemove.length > 0) {
                console.log(`[CacheUtils] Cleared ${keysToRemove.length} old cache entries`);
            }
            
        } catch (error) {
            console.warn('[CacheUtils] Cache clearing failed:', error);
        }
    }
};

// Auto-run cache maintenance on import (non-blocking)
if (typeof window !== 'undefined') {
    // Run cache maintenance after a longer delay to avoid interfering with quiz initialization
    setTimeout(() => {
        CacheUtils.clearOldCache();
    }, 5000); // Increased from 2 seconds to 5 seconds
}

// Export for backward compatibility
export default CONFIG; 