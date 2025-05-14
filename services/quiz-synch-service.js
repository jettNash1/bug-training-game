import { APIService } from '../frontend/api-service.js';

export class QuizSyncService {
    constructor() {
        this.syncQueue = [];
        this.apiService = new APIService();
        console.log('[QuizSyncService] Initialized');
    }
    
    async addToSyncQueue(username, quizName, progressData) {
        console.log(`[QuizSyncService] Adding to queue: ${quizName} for ${username}`);
        
        // Save to localStorage first as an immediate backup
        try {
            const storageKey = `quiz_progress_${username}_${quizName}`;
            localStorage.setItem(storageKey, JSON.stringify({
                data: progressData,
                timestamp: Date.now()
            }));
            // Also make a backup copy
            const backupKey = `quiz_progress_${username}_${quizName}_backup`;
            localStorage.setItem(backupKey, JSON.stringify({
                data: progressData,
                timestamp: Date.now()
            }));
            console.log(`[QuizSyncService] Saved immediate backup to localStorage for ${quizName}`);
        } catch (storageError) {
            console.error(`[QuizSyncService] Failed to save local backup:`, storageError);
        }
        
        // Now try to save to API
        try {
            // Properly await the API call
            await this.apiService.saveQuizProgress(quizName, progressData);
            console.log(`[QuizSyncService] Successfully saved progress to API for ${quizName}`);
            return true;
        } catch (error) {
            console.error(`[QuizSyncService] Failed to save progress to API for ${quizName}:`, error);
            return false;
        }
    }
}

// Create a singleton instance
const quizSyncService = new QuizSyncService();
export default quizSyncService;
