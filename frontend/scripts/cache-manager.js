/**
 * Simplified Cache Management System
 * Handles automatic cache maintenance without requiring manual version updates
 */

import { CONFIG, CacheUtils } from '../config.js';

export class CacheManager {
    constructor() {
        this.isInitialized = false;
        this.maintenanceInterval = null;
    }

    /**
     * Initialize simplified cache management
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            console.log('[CacheManager] Initializing automatic cache maintenance...');
            
            // Perform initial cache maintenance
            await CacheUtils.clearOldCache();
            
            // Set up periodic maintenance (much less frequent)
            this.startPeriodicMaintenance();
            
            // Listen for browser events that might indicate stale cache
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[CacheManager] Cache maintenance initialized successfully');
        } catch (error) {
            console.error('[CacheManager] Failed to initialize:', error);
        }
    }

    /**
     * Starts periodic cache maintenance (runs every hour)
     */
    startPeriodicMaintenance() {
        // Clear any existing interval
        if (this.maintenanceInterval) {
            clearInterval(this.maintenanceInterval);
        }
        
        // Run maintenance every hour
        this.maintenanceInterval = setInterval(async () => {
            await CacheUtils.clearOldCache();
        }, 60 * 60 * 1000); // 1 hour
    }

    /**
     * Sets up event listeners for browser events
     */
    setupEventListeners() {
        // Listen for online events (user reconnects)
        window.addEventListener('online', () => {
            console.log('[CacheManager] Browser back online - running cache maintenance...');
            setTimeout(() => CacheUtils.clearOldCache(), 1000);
        });
        
        // Listen for page visibility (user returns to tab after being away)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Only run if user has been away for a while
                setTimeout(() => {
                    if (CacheUtils.shouldClearCache()) {
                        CacheUtils.clearOldCache();
                    }
                }, 2000);
            }
        });
    }

    /**
     * Manually trigger cache maintenance (for debugging)
     */
    async forceMaintenance() {
        console.log('[CacheManager] Force running cache maintenance...');
        await CacheUtils.clearOldCache();
    }

    /**
     * Cleanup method
     */
    destroy() {
        if (this.maintenanceInterval) {
            clearInterval(this.maintenanceInterval);
        }
        this.isInitialized = false;
    }
}

// Create global instance
export const cacheManager = new CacheManager();

// Auto-initialize when imported (non-blocking)
if (typeof window !== 'undefined') {
    // Initialize after DOM is ready with longer delay to avoid timer interference
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => cacheManager.initialize(), 10000);
        });
    } else {
        setTimeout(() => cacheManager.initialize(), 10000);
    }
}

// Expose globally for debugging
window.cacheManager = cacheManager; 