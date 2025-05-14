import { APIService } from '../frontend/api-service.js';

export class QuizSyncService {
    constructor() {
        this.syncQueue = [];
        this.apiService = new APIService();
        this.isSyncing = false;
        this.failedAttempts = {};
        this.backupInterval = null;
        console.log('[QuizSyncService] Initialized');
        
        // Set up automatic backup every 30 seconds
        this.startBackupInterval();
    }
    
    startBackupInterval() {
        // Clear any existing interval
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
        }
        
        // Create a backup every 30 seconds for any pending items
        this.backupInterval = setInterval(() => {
            this.createBackups();
        }, 30000);
    }
    
    createBackups() {
        try {
            // Get all quiz progress keys from localStorage
            const username = localStorage.getItem('username');
            if (!username) return;
            
            const progressKeys = Object.keys(localStorage).filter(key => 
                key.includes('quiz_progress') && key.includes(username)
            );
            
            if (progressKeys.length === 0) return;
            
            console.log(`[QuizSyncService] Creating backups for ${progressKeys.length} quiz progress items`);
            
            // Create backup copies in both sessionStorage and localStorage
            for (const key of progressKeys) {
                try {
                    const data = localStorage.getItem(key);
                    if (!data) continue;
                    
                    // Create a backup in sessionStorage
                    sessionStorage.setItem(`${key}_backup`, data);
                    
                    // Create a timestamped backup in sessionStorage
                    const timestamp = Date.now();
                    sessionStorage.setItem(`${key}_backup_${timestamp}`, data);
                    
                    // Create a backup in localStorage with a different key
                    localStorage.setItem(`${key}_backup`, data);
                } catch (err) {
                    console.warn(`[QuizSyncService] Failed to create backup for ${key}:`, err);
                }
            }
        } catch (error) {
            console.error('[QuizSyncService] Error creating backups:', error);
        }
    }
    
    async addToSyncQueue(username, quizName, progressData) {
        console.log(`[QuizSyncService] Adding to queue: ${quizName} for ${username}`);
        
        // Create a clean copy of the progress data to avoid reference issues
        const cleanProgressData = JSON.parse(JSON.stringify(progressData));
        
        // Save to localStorage first as an immediate backup
        try {
            // Create multiple backup keys to increase redundancy
            const keys = [
                `quiz_progress_${username}_${quizName}`,
                `quiz_progress_${username}_${quizName}_backup`,
                `quiz_progress_${username}_${quizName}_sync`
            ];
            
            // Save to all backup keys
            for (const key of keys) {
                localStorage.setItem(key, JSON.stringify({
                    data: cleanProgressData,
                    timestamp: Date.now()
                }));
            }
            
            // Also save to sessionStorage for additional redundancy
            try {
                sessionStorage.setItem(keys[0], JSON.stringify({
                    data: cleanProgressData,
                    timestamp: Date.now()
                }));
                
                // Create an emergency backup with a timestamp
                const emergencyKey = `${keys[0]}_emergency_${Date.now()}`;
                sessionStorage.setItem(emergencyKey, JSON.stringify({
                    data: cleanProgressData,
                    timestamp: Date.now()
                }));
            } catch (sessionError) {
                console.warn(`[QuizSyncService] Failed to save to sessionStorage:`, sessionError);
            }
            
            console.log(`[QuizSyncService] Saved immediate backups to storage for ${quizName}`);
        } catch (storageError) {
            console.error(`[QuizSyncService] Failed to save local backups:`, storageError);
        }
        
        // Now try to save to API
        try {
            console.log(`[QuizSyncService] Attempting to save ${quizName} progress to API`);
            
            // Track that we're syncing to prevent concurrent API calls
            this.isSyncing = true;
            
            // Properly await the API call with timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('API save timeout')), 8000)
            );
            
            const savePromise = this.apiService.saveQuizProgress(quizName, cleanProgressData);
            
            // Race the promises to ensure we don't wait too long
            const result = await Promise.race([savePromise, timeoutPromise]);
            
            console.log(`[QuizSyncService] Successfully saved progress to API for ${quizName}:`, result);
            
            // Reset failed attempts if successful
            if (this.failedAttempts[quizName]) {
                delete this.failedAttempts[quizName];
            }
            
            this.isSyncing = false;
            return true;
        } catch (error) {
            this.isSyncing = false;
            console.error(`[QuizSyncService] Failed to save progress to API for ${quizName}:`, error);
            
            // Track failed attempts for this quiz
            this.failedAttempts[quizName] = (this.failedAttempts[quizName] || 0) + 1;
            
            // If we've failed multiple times, create additional emergency backups
            if (this.failedAttempts[quizName] > 1) {
                try {
                    const emergencyKey = `quiz_progress_${username}_${quizName}_emergency_${Date.now()}`;
                    localStorage.setItem(emergencyKey, JSON.stringify({
                        data: cleanProgressData,
                        timestamp: Date.now(),
                        failCount: this.failedAttempts[quizName]
                    }));
                    
                    console.log(`[QuizSyncService] Created emergency backup after ${this.failedAttempts[quizName]} failed attempts`);
                } catch (backupError) {
                    console.error(`[QuizSyncService] Failed to create emergency backup:`, backupError);
                }
            }
            
            return false;
        }
    }
    
    // New method to recover progress data from any available source
    async recoverProgressData(username, quizName) {
        console.log(`[QuizSyncService] Attempting to recover progress data for ${quizName}`);
        
        try {
            // Get all possible storage keys
            const baseKey = `quiz_progress_${username}_${quizName}`;
            const keys = [
                baseKey,
                `${baseKey}_backup`,
                `${baseKey}_sync`
            ];
            
            // Also get all emergency keys
            const emergencyKeys = Object.keys(localStorage).filter(key =>
                key.startsWith(baseKey) && key.includes('emergency')
            );
            
            // Combine all keys
            const allKeys = [...keys, ...emergencyKeys];
            console.log(`[QuizSyncService] Checking ${allKeys.length} possible backup keys`);
            
            let bestData = null;
            let bestCount = 0;
            
            // Check localStorage
            for (const key of allKeys) {
                try {
                    const data = localStorage.getItem(key);
                    if (!data) continue;
                    
                    const parsed = JSON.parse(data);
                    const progressData = parsed.data || parsed;
                    
                    if (progressData && 
                        progressData.questionHistory && 
                        progressData.questionHistory.length > bestCount) {
                        
                        bestData = progressData;
                        bestCount = progressData.questionHistory.length;
                    }
                } catch (e) {
                    console.warn(`[QuizSyncService] Error parsing localStorage key ${key}:`, e);
                }
            }
            
            // Also check sessionStorage
            const sessionKeys = Object.keys(sessionStorage).filter(key =>
                key.includes(baseKey)
            );
            
            for (const key of sessionKeys) {
                try {
                    const data = sessionStorage.getItem(key);
                    if (!data) continue;
                    
                    const parsed = JSON.parse(data);
                    const progressData = parsed.data || parsed;
                    
                    if (progressData && 
                        progressData.questionHistory && 
                        progressData.questionHistory.length > bestCount) {
                        
                        bestData = progressData;
                        bestCount = progressData.questionHistory.length;
                    }
                } catch (e) {
                    console.warn(`[QuizSyncService] Error parsing sessionStorage key ${key}:`, e);
                }
            }
            
            // If we found data, return it
            if (bestData) {
                console.log(`[QuizSyncService] Recovered progress data with ${bestCount} questions`);
                return bestData;
            }
            
            // If no data found, try API as last resort
            try {
                console.log(`[QuizSyncService] Attempting to recover from API`);
                const apiData = await this.apiService.getQuizProgress(quizName);
                
                if (apiData && apiData.data && 
                    apiData.data.questionHistory &&
                    apiData.data.questionHistory.length > 0) {
                    
                    console.log(`[QuizSyncService] Recovered ${apiData.data.questionHistory.length} questions from API`);
                    return apiData.data;
                }
            } catch (apiError) {
                console.warn(`[QuizSyncService] Failed to recover from API:`, apiError);
            }
            
            console.log(`[QuizSyncService] No progress data could be recovered`);
            return null;
        } catch (error) {
            console.error(`[QuizSyncService] Error during recovery:`, error);
            return null;
        }
    }
}

// Create a singleton instance
const quizSyncService = new QuizSyncService();
export default quizSyncService;
