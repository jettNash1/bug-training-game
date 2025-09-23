/**
 * QuizProgressService.js
 * 
 * A dedicated service for managing quiz progress with a clean, robust API
 * that prevents cross-contamination between quizzes.
 */

import { APIService } from '../api-service.js';

// List of all known quiz names for strict validation
const KNOWN_QUIZ_NAMES = [
    'communication', 'initiative', 'time-management', 'tester-mindset',
    'risk-analysis', 'risk-management', 'non-functional', 'test-support',
    'issue-verification', 'build-verification', 'issue-tracking-tools',
    'raising-tickets', 'reports', 'cms-testing', 'email-testing', 'content-copy',
    'locale-testing', 'script-metrics-troubleshooting', 'standard-script-testing',
    'test-types-tricks', 'automation-interview', 'fully-scripted', 'exploratory',
    'sanity-smoke', 'functional-interview', 'ticket-template'
];

export class QuizProgressService {
    constructor() {
        this.apiService = new APIService();
        this.username = localStorage.getItem('username');
        this.initialized = false;
        
        // Initialize the service in the background
        this.initialize().catch(err => {
            console.error('[QuizProgress] Initialization error:', err);
        });
    }
    
    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('[QuizProgress] Initializing QuizProgressService');
            
            if (!this.username) {
                console.warn('[QuizProgress] No username found, service functionality will be limited');
                return;
            }
            
            // Run integrity check to detect and clean up any contaminated data
            await this.checkAndCleanContaminatedData();
            
            this.initialized = true;
            console.log('[QuizProgress] Service initialized successfully');
        } catch (error) {
            console.error('[QuizProgress] Failed to initialize service:', error);
            throw error;
        }
    }
    
    /**
     * Normalize quiz name to ensure consistent storage and retrieval
     * @param {string} quizName - The quiz name to normalize
     * @returns {string} - The normalized quiz name
     */
    normalizeQuizName(quizName) {
        if (!quizName) return '';
        
        // Convert to lowercase and trim
        let normalized = quizName.toLowerCase().trim();
        
        // Replace spaces and underscores with hyphens
        normalized = normalized.replace(/[\s_]+/g, '-');
        
        // Remove any non-alphanumeric characters (except hyphens)
        normalized = normalized.replace(/[^a-z0-9-]/g, '');
        
        // Remove multiple consecutive hyphens
        normalized = normalized.replace(/-+/g, '-');
        
        // Remove leading/trailing hyphens
        normalized = normalized.replace(/^-+|-+$/g, '');
        
        // Special case for known quiz names
        const knownQuizNames = [
            'tester-mindset',
            'communication',
            'initiative',
            'standard-script-testing',
            'fully-scripted',
            'exploratory',
            'script-metrics-troubleshooting',
            'locale-testing',
            'build-verification',
            'test-types-tricks',
            'test-support',
            'sanity-smoke',
            'time-management',
            'risk-analysis',
            'risk-management',
            'issue-tracking-tools',
            'raising-tickets',
            'issue-verification',
            'reports',
            'cms-testing',
            'email-testing',
            'non-functional',
            'content-copy',
            'automation-interview',
            'functional-interview',
            'ticket-template'
        ];
        
        // If the normalized name matches a known quiz name (case-insensitive), use the known name
        const knownQuiz = knownQuizNames.find(name => name === normalized);
        if (knownQuiz) {
            return knownQuiz;
        }
        
        return normalized;
    }
    
    /**
     * Generate a unique storage key for a quiz
     * @param {string} username - The username
     * @param {string} quizName - The normalized quiz name
     * @returns {string} - The unique storage key
     */
    getUniqueQuizStorageKey(username, quizName) {
        if (!username || !quizName) {
            console.warn('[QuizProgress] Missing username or quizName for storage key');
            return '';
        }
        
        const normalizedQuizName = this.normalizeQuizName(quizName);
        return `strict_quiz_progress_${username}_${normalizedQuizName}`;
    }
    
    /**
     * Check for and clean up any contaminated quiz data in localStorage
     */
    async checkAndCleanContaminatedData() {
        try {
            if (!this.username) return false;
            
            console.log('[QuizProgress] Checking for contaminated quiz data...');
            
            // Get list of all known quiz IDs to check
            const quizIds = [...KNOWN_QUIZ_NAMES];
            let contaminationFound = false;
            
            for (const quizId of quizIds) {
                // Check both old and new format keys
                const oldKey = `quiz_progress_${this.username}_${quizId}`;
                const newKey = `strict_quiz_progress_${this.username}_${quizId}`;
                
                try {
                    // Check old key format
                    const oldData = localStorage.getItem(oldKey);
                    if (oldData) {
                        const parsed = JSON.parse(oldData);
                        if (parsed && parsed.quizName && parsed.quizName !== quizId) {
                            console.warn(`[QuizProgress] Found contaminated data! Key ${oldKey} contains data for quiz ${parsed.quizName}`);
                            localStorage.removeItem(oldKey);
                            contaminationFound = true;
                        }
                    }
                    
                    // Check new key format
                    const newData = localStorage.getItem(newKey);
                    if (newData) {
                        const parsed = JSON.parse(newData);
                        if (parsed && parsed.quizName && parsed.quizName !== quizId) {
                            console.warn(`[QuizProgress] Found contaminated data! Key ${newKey} contains data for quiz ${parsed.quizName}`);
                            localStorage.removeItem(newKey);
                            contaminationFound = true;
                        }
                    }
                } catch (e) {
                    console.warn(`[QuizProgress] Error checking quiz ${quizId} data:`, e);
                }
            }
            
            if (contaminationFound) {
                console.log('[QuizProgress] Cleared contaminated quiz data');
            } else {
                console.log('[QuizProgress] No contaminated quiz data found');
            }
            
            return contaminationFound;
        } catch (error) {
            console.error('[QuizProgress] Error checking for contaminated data:', error);
            return false;
        }
    }
    
    /**
     * Get progress for a specific quiz
     * 
     * @param {string} quizName - The name of the quiz
     * @returns {Promise<Object>} - The quiz progress data
     */
    async getQuizProgress(quizName) {
        try {
            // Ensure we have a username
            if (!this.username) {
                return {
                    success: false,
                    message: 'No username found',
                    data: null
                };
            }
            
            // Normalize the quiz name
            const normalizedQuizName = this.normalizeQuizName(quizName);
            console.log(`[QuizProgress] Getting progress for quiz: ${normalizedQuizName}`);
            
            // Get progress from API first
            let apiProgressData = null;
            let apiError = null;
            
            try {
                const apiProgress = await this.apiService.getQuizProgress(normalizedQuizName);
                if (apiProgress.success && apiProgress.data) {
                    // Verify API data has actual content
                    const apiHasProgress = 
                        (apiProgress.data.questionHistory && apiProgress.data.questionHistory.length > 0) ||
                        (apiProgress.data.questionsAnswered && apiProgress.data.questionsAnswered > 0);
                    
                    if (apiHasProgress) {
                        apiProgressData = apiProgress.data;
                        console.log(`[QuizProgress] Got valid progress from API for ${normalizedQuizName}`);
                        
                        // Fix missing questionsAnswered if we have questionHistory
                        if (!apiProgressData.questionsAnswered && 
                            apiProgressData.questionHistory && 
                            apiProgressData.questionHistory.length > 0) {
                            
                            apiProgressData.questionsAnswered = apiProgressData.questionHistory.length;
                            console.log(`[QuizProgress] Fixed missing questionsAnswered with questionHistory.length=${apiProgressData.questionHistory.length}`);
                        }
                    }
                }
            } catch (error) {
                console.warn(`[QuizProgress] API error for ${normalizedQuizName}:`, error);
                apiError = error;
            }
            
            // SERVER AS MASTER: Only use API data, never localStorage fallback
            let finalProgressData = null;
            
            if (apiProgressData) {
                finalProgressData = apiProgressData;
                console.log(`[QuizProgress] Using API data for ${normalizedQuizName}`);
            }
            
            // If we have no data from either source
            if (!finalProgressData) {
                console.log(`[QuizProgress] No progress data found for ${normalizedQuizName}`);
                return {
                    success: true,
                    message: 'No progress data found',
                    data: {
                        quizName: normalizedQuizName,
                        experience: 0,
                        questionsAnswered: 0,
                        status: 'not-started',
                        scorePercentage: 0,
                        currentScenario: 0,
                        questionHistory: []
                    }
                };
            }
            
            // Ensure the progress data has the quizName field
            finalProgressData.quizName = normalizedQuizName;
            
            // Fix any missing values
            const questionHistoryLength = Array.isArray(finalProgressData.questionHistory) ? 
                finalProgressData.questionHistory.length : 0;
                
            if (finalProgressData.questionsAnswered === undefined || 
                (finalProgressData.questionsAnswered === 0 && questionHistoryLength > 0)) {
                finalProgressData.questionsAnswered = questionHistoryLength;
                console.log(`[QuizProgress] Derived questionsAnswered=${questionHistoryLength} from questionHistory.length`);
            }
            
            return {
                success: true,
                message: 'Progress data retrieved successfully',
                data: finalProgressData
            };
        } catch (error) {
            console.error(`[QuizProgress] Error getting quiz progress:`, error);
            return {
                success: false,
                message: error.message || 'Failed to get quiz progress',
                data: null
            };
        }
    }
    
    /**
     * Save progress for a specific quiz
     * 
     * @param {string} quizName - The name of the quiz
     * @param {Object} progress - The quiz progress data to save
     * @returns {Promise<Object>} - Result of the save operation
     */
    async saveQuizProgress(quizName, progress) {
        try {
            // Ensure we have a username
            if (!this.username) {
                return {
                    success: false,
                    message: 'No username found',
                    data: null
                };
            }
            
            // Normalize the quiz name
            const normalizedQuizName = this.normalizeQuizName(quizName);
            console.log(`[QuizProgress] Saving progress for quiz: ${normalizedQuizName}`, progress);
            
            // Ensure all required fields are present and fix any issues
            const progressData = {
                quizName: normalizedQuizName, // Always include the quiz name for verification
                experience: progress.experience || 0,
                questionsAnswered: progress.questionsAnswered || 0,
                status: progress.status || 'in-progress',
                scorePercentage: typeof progress.scorePercentage === 'number' ? progress.scorePercentage : 0,
                questionHistory: progress.questionHistory || [],
                currentScenario: progress.currentScenario || 0,
                randomizedScenarios: progress.randomizedScenarios || {},
                lastUpdated: new Date().toISOString()
            };
            
            // If questionHistory has items but questionsAnswered is 0, fix it
            if (progressData.questionsAnswered === 0 && 
                Array.isArray(progressData.questionHistory) && 
                progressData.questionHistory.length > 0) {
                
                progressData.questionsAnswered = progressData.questionHistory.length;
                console.log(`[QuizProgress] Fixed missing questionsAnswered with questionHistory.length=${progressData.questionHistory.length}`);
            }
            
            // SERVER AS MASTER: Only save to API, never localStorage
            const apiResult = await this.apiService.saveQuizProgress(normalizedQuizName, progressData);
            
            if (apiResult && apiResult.success) {
                console.log(`[QuizProgress] Successfully saved to API for ${normalizedQuizName}`);
                return {
                    success: true,
                    message: 'Saved to server',
                    data: progressData,
                    apiSaved: true
                };
            } else {
                console.error(`[QuizProgress] Failed to save to API for ${normalizedQuizName}:`, apiResult);
                return {
                    success: false,
                    message: 'Failed to save to server',
                    data: progressData
                };
            }
        } catch (error) {
            console.error(`[QuizProgress] Error saving quiz progress:`, error);
            return {
                success: false,
                message: error.message || 'Failed to save quiz progress',
                data: null
            };
        }
    }
    
    /**
     * Clear localStorage data for a specific quiz
     * 
     * @param {string} quizName - The name of the quiz
     * @returns {boolean} - Whether any data was cleared
     */
    clearQuizLocalStorage(quizName) {
        try {
            if (!this.username || !quizName) {
                console.warn('[QuizProgress] Cannot clear quiz localStorage: missing username or quizName');
                return false;
            }
            
            const normalizedQuizName = this.normalizeQuizName(quizName);
            console.log(`[QuizProgress] Clearing localStorage data for quiz: ${normalizedQuizName}`);
            
            // Get the unique storage keys for this quiz
            const strictStorageKey = this.getUniqueQuizStorageKey(this.username, normalizedQuizName);
            const oldStorageKey = `quiz_progress_${this.username}_${normalizedQuizName}`;
            const backupStorageKey = `quiz_progress_${this.username}_${normalizedQuizName}_backup`;
            
            let cleared = false;
            
            // Clear both new and old format keys
            if (localStorage.getItem(strictStorageKey) !== null) {
                localStorage.removeItem(strictStorageKey);
                console.log(`[QuizProgress] Cleared localStorage entry: ${strictStorageKey}`);
                cleared = true;
            }
            
            if (localStorage.getItem(oldStorageKey) !== null) {
                localStorage.removeItem(oldStorageKey);
                console.log(`[QuizProgress] Cleared localStorage entry: ${oldStorageKey}`);
                cleared = true;
            }
            
            if (localStorage.getItem(backupStorageKey) !== null) {
                localStorage.removeItem(backupStorageKey);
                console.log(`[QuizProgress] Cleared localStorage entry: ${backupStorageKey}`);
                cleared = true;
            }
            
            return cleared;
        } catch (error) {
            console.error(`[QuizProgress] Error clearing quiz localStorage:`, error);
            return false;
        }
    }
    
    /**
     * Get progress for all known quizzes in a single call
     * 
     * @returns {Promise<Object>} - Quiz progress data for all quizzes
     */
    async getAllQuizProgress() {
        try {
            // Ensure we have a username
            if (!this.username) {
                return {
                    success: false,
                    message: 'No username found',
                    data: {}
                };
            }
            
            console.log(`[QuizProgress] Getting progress for all quizzes`);
            
            // First try to get all quiz progress from API in a single call
            let quizProgress = {};
            try {
                const userData = await this.apiService.getUserData();
                if (userData.success && userData.data && userData.data.quizProgress) {
                    quizProgress = userData.data.quizProgress;
                    console.log(`[QuizProgress] Got quiz progress for ${Object.keys(quizProgress).length} quizzes from API`);
                }
            } catch (error) {
                console.warn(`[QuizProgress] Error getting user data from API:`, error);
            }
            
            // SERVER AS MASTER: Only use API data, never localStorage fallback
            
            return {
                success: true,
                message: 'Retrieved all quiz progress',
                data: quizProgress
            };
        } catch (error) {
            console.error(`[QuizProgress] Error getting all quiz progress:`, error);
            return {
                success: false,
                message: error.message || 'Failed to get all quiz progress',
                data: {}
            };
        }
    }
} 