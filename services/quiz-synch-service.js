import { APIService } from '../frontend/api-service.js';

class QuizSyncService {
    constructor() {
        this.syncQueue = [];
        this.apiService = new APIService();
        console.log('[QuizSyncService] Initialized');
    }
    
    addToSyncQueue(username, quizName, progressData) {
        console.log(`[QuizSyncService] Adding to queue: ${quizName} for ${username}`);
        
        // Simply try to save directly
        try {
            this.apiService.saveQuizProgress(quizName, progressData);
            console.log(`[QuizSyncService] Directly saved progress for ${quizName}`);
        } catch (error) {
            console.error(`[QuizSyncService] Failed to save progress for ${quizName}:`, error);
            
            // Save to localStorage as backup in case of failure
            try {
                const storageKey = `quiz_progress_${username}_${quizName}_backup`;
                localStorage.setItem(storageKey, JSON.stringify({
                    data: progressData,
                    timestamp: Date.now()
                }));
                console.log(`[QuizSyncService] Saved backup to localStorage for ${quizName}`);
            } catch (storageError) {
                console.error(`[QuizSyncService] Failed to save backup:`, storageError);
            }
        }
    }
}

// Create a singleton instance
const quizSyncService = new QuizSyncService();
export default quizSyncService;
