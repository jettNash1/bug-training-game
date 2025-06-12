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
    'sanity-smoke', 'functional-interview'
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
            'functional-interview'
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
            
            // Check localStorage as a fallback
            let localStorageData = null;
            const strictStorageKey = this.getUniqueQuizStorageKey(this.username, normalizedQuizName);
            const oldStorageKey = `quiz_progress_${this.username}_${normalizedQuizName}`;
            
            try {
                // Try the strict key first
                const strictData = localStorage.getItem(strictStorageKey);
                if (strictData) {
                    const parsed = JSON.parse(strictData);
                    if (parsed && parsed.quizName === normalizedQuizName) {
                        localStorageData = parsed.data || parsed;
                        console.log(`[QuizProgress] Found valid localStorage data using strict key for ${normalizedQuizName}`);
                    }
                }
                
                // If strict key didn't have valid data, try old key
                if (!localStorageData) {
                    const oldData = localStorage.getItem(oldStorageKey);
                    if (oldData) {
                        const parsed = JSON.parse(oldData);
                        localStorageData = parsed.data || parsed;
                        console.log(`[QuizProgress] Found localStorage data using old key for ${normalizedQuizName}`);
                    }
                }
            } catch (error) {
                console.warn(`[QuizProgress] LocalStorage error for ${normalizedQuizName}:`, error);
            }
            
            // Determine which data to use
            let finalProgressData = null;
            
            if (apiProgressData && localStorageData) {
                // Both sources have data, use the one with more questions answered
                const apiQuestionsAnswered = apiProgressData.questionsAnswered || 
                    (apiProgressData.questionHistory ? apiProgressData.questionHistory.length : 0);
                    
                const localQuestionsAnswered = localStorageData.questionsAnswered || 
                    (localStorageData.questionHistory ? localStorageData.questionHistory.length : 0);
                
                if (localQuestionsAnswered > apiQuestionsAnswered) {
                    console.log(`[QuizProgress] Using localStorage data (${localQuestionsAnswered} questions) over API (${apiQuestionsAnswered} questions)`);
                    finalProgressData = localStorageData;
                } else {
                    console.log(`[QuizProgress] Using API data (${apiQuestionsAnswered} questions) over localStorage (${localQuestionsAnswered} questions)`);
                    finalProgressData = apiProgressData;
                }
            } else if (apiProgressData) {
                finalProgressData = apiProgressData;
            } else if (localStorageData) {
                finalProgressData = localStorageData;
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
                        tools: [],
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
                tools: progress.tools || [],
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
            
            // Save to both API and localStorage in parallel
            const [apiResult, localResult] = await Promise.allSettled([
                // API save
                this.apiService.saveQuizProgress(normalizedQuizName, progressData),
                
                // localStorage save (using try/catch directly)
                (async () => {
                    try {
                        const strictStorageKey = this.getUniqueQuizStorageKey(this.username, normalizedQuizName);
                        const data = {
                            quizName: normalizedQuizName, // Include quiz name for verification
                            data: progressData,
                            timestamp: new Date().toISOString()
                        };
                        
                        localStorage.setItem(strictStorageKey, JSON.stringify(data));
                        console.log(`[QuizProgress] Saved to localStorage with key: ${strictStorageKey}`);
                        return true;
                    } catch (error) {
                        console.error(`[QuizProgress] localStorage save error:`, error);
                        throw error;
                    }
                })()
            ]);
            
            // Check results
            const apiSaved = apiResult.status === 'fulfilled' && apiResult.value && apiResult.value.success;
            const localSaved = localResult.status === 'fulfilled' && localResult.value === true;
            
            console.log(`[QuizProgress] Save results - API: ${apiSaved}, localStorage: ${localSaved}`);
            
            if (apiSaved) {
                return {
                    success: true,
                    message: 'Saved to API and localStorage',
                    data: progressData,
                    apiSaved: true,
                    localSaved: localSaved
                };
            } else if (localSaved) {
                return {
                    success: true,
                    message: 'Saved to localStorage only (API failed)',
                    data: progressData,
                    apiSaved: false,
                    localSaved: true
                };
            } else {
                return {
                    success: false,
                    message: 'Failed to save quiz progress to both API and localStorage',
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
            
            // Then check localStorage for any additional/newer progress data
            try {
                // Get all localStorage keys that match our progress patterns
                const progressPatterns = [
                    `strict_quiz_progress_${this.username}_`, // New format
                    `quiz_progress_${this.username}_`        // Old format
                ];
                
                const allKeys = Object.keys(localStorage);
                const progressKeys = allKeys.filter(key => {
                    return progressPatterns.some(pattern => key.startsWith(pattern));
                });
                
                console.log(`[QuizProgress] Found ${progressKeys.length} potential quiz progress items in localStorage`);
                
                // Process each key to extract quiz progress
                for (const key of progressKeys) {
                    try {
                        // Extract the quiz name from the key
                        let quizId = null;
                        let isNewFormat = false;
                        
                        for (const pattern of progressPatterns) {
                            if (key.startsWith(pattern)) {
                                const quizNameMatch = key.match(new RegExp(`${pattern}([^_]+)`));
                                if (quizNameMatch && quizNameMatch[1]) {
                                    quizId = quizNameMatch[1];
                                    isNewFormat = pattern.includes('strict');
                                    break;
                                }
                            }
                        }
                        
                        if (!quizId) continue;
                        
                        if (key.includes('_backup') || key.includes('_emergency')) {
                            // Skip backup/emergency keys
                            continue;
                        }
                        
                        // Normalize the quiz ID
                        const normalizedQuizId = this.normalizeQuizName(quizId);
                        
                        // Process the localStorage data
                        const localStorageData = localStorage.getItem(key);
                        if (!localStorageData) continue;
                        
                        const parsedData = JSON.parse(localStorageData);
                        if (!parsedData) continue;
                        
                        // Verify this data actually belongs to the correct quiz (for new format)
                        if (isNewFormat && parsedData.quizName && parsedData.quizName !== normalizedQuizId) {
                            console.warn(`[QuizProgress] Skipping localStorage data from key ${key} because it belongs to ${parsedData.quizName}, not ${normalizedQuizId}`);
                            continue;
                        }
                        
                        const localProgress = parsedData.data || parsedData;
                        const apiProgress = quizProgress[normalizedQuizId];
                        
                        // Fix missing questionsAnswered if we have questionHistory
                        if (!localProgress.questionsAnswered && 
                            localProgress.questionHistory && 
                            localProgress.questionHistory.length > 0) {
                            
                            localProgress.questionsAnswered = localProgress.questionHistory.length;
                        }
                        
                        // Check if we should use this localStorage data
                        if (!apiProgress || 
                            (localProgress.questionsAnswered > (apiProgress.questionsAnswered || 0)) ||
                            (localProgress.lastUpdated && apiProgress.lastUpdated && 
                             new Date(localProgress.lastUpdated) > new Date(apiProgress.lastUpdated))) {
                            
                            console.log(`[QuizProgress] Using localStorage progress for ${normalizedQuizId} from key ${key}`);
                            quizProgress[normalizedQuizId] = localProgress;
                        }
                    } catch (keyError) {
                        console.warn(`[QuizProgress] Error processing localStorage key ${key}:`, keyError);
                    }
                }
            } catch (localScanError) {
                console.warn('[QuizProgress] Error scanning localStorage for quiz progress:', localScanError);
            }
            
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