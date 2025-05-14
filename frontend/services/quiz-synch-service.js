import { APIService } from '../api-service.js';

export class QuizSyncService {
    constructor() {
        this.syncQueue = [];
        this.isSyncing = false;
        this.apiService = new APIService();
        
        // Load any previously queued items
        this.loadQueueFromStorage();
        
        // Set up periodic sync attempts
        this.syncInterval = setInterval(() => this.attemptSync(), 60000); // Try every minute
        
        // Set up network status monitoring
        window.addEventListener('online', () => this.attemptSync());
    }
    
    addToSyncQueue(username, quizName, progressData) {
        // Don't add duplicates for the same quiz
        const existingIndex = this.syncQueue.findIndex(
            item => item.username === username && item.quizName === quizName
        );
        
        if (existingIndex !== -1) {
            // Replace with newer data
            this.syncQueue[existingIndex] = { 
                username, 
                quizName, 
                progressData, 
                timestamp: Date.now(),
                retryCount: 0
            };
        } else {
            // Add new item
            this.syncQueue.push({ 
                username, 
                quizName, 
                progressData, 
                timestamp: Date.now(),
                retryCount: 0
            });
        }
        
        this.saveQueueToStorage();
        this.attemptSync();
    }
    
    async attemptSync() {
        if (this.isSyncing || this.syncQueue.length === 0 || !navigator.onLine) return;
        
        this.isSyncing = true;
        
        try {
            // Process queue in order, but don't remove items until they're successfully synced
            for (let i = 0; i < this.syncQueue.length; i++) {
                const item = this.syncQueue[i];
                
                try {
                    console.log(`[QuizSyncService] Attempting to sync ${item.quizName} for ${item.username}`);
                    await this.apiService.saveQuizProgress(item.quizName, item.progressData);
                    
                    // Success! Remove this item
                    this.syncQueue.splice(i, 1);
                    i--; // Adjust index after removal
                    
                    console.log(`[QuizSyncService] Successfully synced ${item.quizName}`);
                } catch (error) {
                    console.error(`[QuizSyncService] Failed to sync ${item.quizName}:`, error);
                    
                    // Increment retry count
                    item.retryCount = (item.retryCount || 0) + 1;
                    
                    // If we've tried too many times, remove it
                    if (item.retryCount >= 5) {
                        console.warn(`[QuizSyncService] Dropping ${item.quizName} after 5 failed attempts`);
                        this.syncQueue.splice(i, 1);
                        i--; // Adjust index
                    }
                }
            }
        } finally {
            this.saveQueueToStorage();
            this.isSyncing = false;
        }
    }
    
    saveQueueToStorage() {
        localStorage.setItem('quizSyncQueue', JSON.stringify(this.syncQueue));
    }
    
    loadQueueFromStorage() {
        const savedQueue = localStorage.getItem('quizSyncQueue');
        if (savedQueue) {
            try {
                this.syncQueue = JSON.parse(savedQueue);
                console.log(`[QuizSyncService] Loaded ${this.syncQueue.length} items from sync queue`);
            } catch (error) {
                console.error('[QuizSyncService] Failed to parse saved queue:', error);
                this.syncQueue = [];
            }
        }
    }
    
    // Call this on user logout or when app is shutting down
    shutdown() {
        clearInterval(this.syncInterval);
        this.saveQueueToStorage();
    }
}

// Create a singleton instance
const quizSyncService = new QuizSyncService();
export default quizSyncService;
