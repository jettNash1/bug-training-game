/**
 * QuizProgressService
 * 
 * A simplified service for managing quiz progress data across the application.
 * This service prioritizes API storage with localStorage backup.
 * 
 * Features:
 * - Clean quiz data separation
 * - Simple API-first approach
 * - Concise error handling
 * - Minimal dependencies
 */

import { config } from '../config.js';

export class QuizProgressService {
    constructor() {
        this.baseUrl = this.getApiBaseUrl();
        this.currentUser = localStorage.getItem('username') || null;
        console.log('[QuizProgressService] Initialized for user:', this.currentUser);
    }

    /**
     * Get API base URL with fallback support
     */
    getApiBaseUrl() {
        try {
            if (config && config.apiUrl) {
                return config.apiUrl;
            }
        } catch (error) {
            console.warn('[QuizProgressService] Error accessing config.apiUrl:', error);
        }
        
        // Fallback logic
        if (window.location.hostname.includes('render.com') || 
            window.location.hostname === 'bug-training-game.onrender.com') {
            return 'https://bug-training-game-api.onrender.com/api';
        } 
        else if (window.location.hostname.includes('amazonaws.com') || 
                 window.location.hostname.includes('s3-website') ||
                 window.location.hostname.includes('learning-hub')) {
            return 'http://13.42.151.152/api';
        }
        
        return '/api';
    }

    /**
     * Normalize a quiz name to ensure consistency
     * @param {string} quizName - The original quiz name
     * @returns {string} Normalized quiz name
     */
    normalizeQuizName(quizName) {
        if (!quizName) return '';
        
        // Keep normalization simple but effective
        const normalized = String(quizName)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')  // spaces to hyphens
            .replace(/_/g, '-')    // underscores to hyphens
            .replace(/-{2,}/g, '-'); // remove duplicate hyphens
            
        return normalized;
    }

    /**
     * Get a storage key for the specified quiz
     * @param {string} quizName - The quiz name
     * @returns {string} The storage key
     */
    getStorageKey(quizName) {
        const normalized = this.normalizeQuizName(quizName);
        return `quiz_${normalized}_progress`;
    }

    /**
     * Save quiz progress to both API and localStorage
     * @param {string} quizName - The quiz name
     * @param {Object} progressData - The progress data to save
     * @returns {Promise<Object>} Result of the save operation
     */
    async saveProgress(quizName, progressData) {
        if (!this.currentUser) {
            console.error('[QuizProgressService] Cannot save progress: No user logged in');
            return { success: false, error: 'No user logged in' };
        }

        const normalized = this.normalizeQuizName(quizName);
        console.log(`[QuizProgressService] Saving progress for ${normalized}`);
        
        // Add metadata to progress data
        const dataToSave = {
            ...progressData,
            quizName: normalized,
            lastUpdated: new Date().toISOString()
        };
        
        try {
            // Save to localStorage as immediate backup
            this.saveToLocalStorage(normalized, dataToSave);
            
            // Primary save to API
            const result = await this.saveToAPI(normalized, dataToSave);
            
            return {
                success: true,
                source: 'api',
                data: dataToSave
            };
        } catch (error) {
            console.error(`[QuizProgressService] Error saving progress for ${normalized}:`, error);
            return {
                success: false,
                source: 'localStorage only',
                error: error.message,
                data: dataToSave
            };
        }
    }

    /**
     * Save progress data to localStorage
     * @param {string} quizName - Normalized quiz name
     * @param {Object} data - Progress data to save
     */
    saveToLocalStorage(quizName, data) {
        try {
            const storageKey = this.getStorageKey(quizName);
            localStorage.setItem(storageKey, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
            console.log(`[QuizProgressService] Saved to localStorage: ${storageKey}`);
        } catch (error) {
            console.error(`[QuizProgressService] Failed to save to localStorage:`, error);
        }
    }

    /**
     * Save progress data to API
     * @param {string} quizName - Normalized quiz name
     * @param {Object} data - Progress data to save
     * @returns {Promise<Object>} API response
     */
    async saveToAPI(quizName, data) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        const postData = {
            quizName: quizName,
            progress: data
        };
        
        const response = await fetch(`${this.baseUrl}/users/quiz-progress`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    }

    /**
     * Load quiz progress from API with localStorage fallback
     * @param {string} quizName - The quiz name
     * @returns {Promise<Object>} The quiz progress data
     */
    async loadProgress(quizName) {
        if (!this.currentUser) {
            console.error('[QuizProgressService] Cannot load progress: No user logged in');
            return { success: false, error: 'No user logged in' };
        }

        const normalized = this.normalizeQuizName(quizName);
        console.log(`[QuizProgressService] Loading progress for ${normalized}`);
        
        try {
            // Try API first
            const apiData = await this.loadFromAPI(normalized);
            
            if (apiData.success && apiData.data) {
                console.log(`[QuizProgressService] Successfully loaded from API for ${normalized}`);
                return {
                    success: true,
                    source: 'api',
                    data: apiData.data
                };
            }
            
            // Fallback to localStorage if API fails or returns empty data
            const localData = this.loadFromLocalStorage(normalized);
            
            if (localData) {
                console.log(`[QuizProgressService] Used localStorage fallback for ${normalized}`);
                return {
                    success: true,
                    source: 'localStorage',
                    data: localData
                };
            }
            
            // Return empty progress if nothing found
            console.log(`[QuizProgressService] No progress found for ${normalized}`);
            return {
                success: true,
                source: 'default',
                data: this.getEmptyProgress()
            };
        } catch (error) {
            console.error(`[QuizProgressService] Error loading progress for ${normalized}:`, error);
            
            // Last attempt from localStorage
            const localData = this.loadFromLocalStorage(normalized);
            
            if (localData) {
                return {
                    success: true,
                    source: 'localStorage-emergency',
                    data: localData
                };
            }
            
            return {
                success: false,
                error: error.message,
                data: this.getEmptyProgress()
            };
        }
    }

    /**
     * Load progress from localStorage
     * @param {string} quizName - Normalized quiz name
     * @returns {Object|null} The progress data or null if not found
     */
    loadFromLocalStorage(quizName) {
        try {
            const storageKey = this.getStorageKey(quizName);
            const stored = localStorage.getItem(storageKey);
            
            if (!stored) return null;
            
            const parsed = JSON.parse(stored);
            
            // Verify this data is for the correct quiz
            if (parsed.data && parsed.data.quizName && 
                parsed.data.quizName !== quizName) {
                console.warn(`[QuizProgressService] Found mismatched quiz data in localStorage: expected ${quizName}, got ${parsed.data.quizName}`);
                return null;
            }
            
            return parsed.data;
        } catch (error) {
            console.error(`[QuizProgressService] Failed to load from localStorage:`, error);
            return null;
        }
    }

    /**
     * Load progress from API
     * @param {string} quizName - Normalized quiz name
     * @returns {Promise<Object>} The progress data from API
     */
    async loadFromAPI(quizName) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/users/quiz-progress/${quizName}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    // Not found is normal for new quizzes
                    return { success: true, data: null };
                }
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`[QuizProgressService] API error:`, error);
            throw error;
        }
    }

    /**
     * Clear progress for a specific quiz
     * @param {string} quizName - The quiz name
     * @returns {Promise<boolean>} Success status
     */
    async clearProgress(quizName) {
        const normalized = this.normalizeQuizName(quizName);
        console.log(`[QuizProgressService] Clearing progress for ${normalized}`);
        
        // Clear from localStorage
        const storageKey = this.getStorageKey(normalized);
        localStorage.removeItem(storageKey);
        
        try {
            // Also clear from API
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await fetch(`${this.baseUrl}/users/quiz-progress/${normalized}/reset`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            return true;
        } catch (error) {
            console.error(`[QuizProgressService] Error clearing progress from API:`, error);
            // Return true anyway since we cleared localStorage successfully
            return true;
        }
    }

    /**
     * Get empty progress object for a fresh quiz start
     * @returns {Object} Empty progress object
     */
    getEmptyProgress() {
        return {
            questionsAnswered: 0,
            currentScenario: 0,
            questionHistory: [],
            status: 'not-started',
            scorePercentage: 0,
            experience: 0,
            tools: []
        };
    }
    
    /**
     * Get all quiz progress for the current user
     * @returns {Promise<Object>} Object with all quiz progress
     */
    async getAllProgress() {
        if (!this.currentUser) {
            console.error('[QuizProgressService] Cannot get all progress: No user logged in');
            return { success: false, error: 'No user logged in' };
        }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Get user data including all quiz progress
            const response = await fetch(`${this.baseUrl}/users/data?includeQuizDetails=true`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const userData = await response.json();
            
            if (!userData.data) {
                throw new Error('Invalid user data returned from API');
            }
            
            return {
                success: true,
                source: 'api',
                data: {
                    quizProgress: userData.data.quizProgress || {},
                    quizResults: userData.data.quizResults || []
                }
            };
        } catch (error) {
            console.error('[QuizProgressService] Error getting all progress:', error);
            
            // Fallback to localStorage
            const allProgress = this.getAllProgressFromLocalStorage();
            
            return {
                success: true,
                source: 'localStorage',
                data: {
                    quizProgress: allProgress,
                    quizResults: []
                }
            };
        }
    }
    
    /**
     * Get all quiz progress from localStorage
     * @returns {Object} Object mapping quiz names to progress data
     */
    getAllProgressFromLocalStorage() {
        try {
            const allProgress = {};
            const storagePrefix = 'quiz_';
            const storageSuffix = '_progress';
            
            // Find all quiz progress in localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key || !key.startsWith(storagePrefix) || !key.endsWith(storageSuffix)) {
                    continue;
                }
                
                // Extract quiz name from key
                const quizName = key.substring(
                    storagePrefix.length, 
                    key.length - storageSuffix.length
                );
                
                // Skip if empty
                if (!quizName) continue;
                
                try {
                    const data = this.loadFromLocalStorage(quizName);
                    if (data) {
                        allProgress[quizName] = data;
                    }
                } catch (err) {
                    console.warn(`[QuizProgressService] Error loading progress for ${quizName}:`, err);
                }
            }
            
            return allProgress;
        } catch (error) {
            console.error('[QuizProgressService] Error getting all progress from localStorage:', error);
            return {};
        }
    }
}

// Create a singleton instance for use throughout the app
const quizProgressService = new QuizProgressService();
export default quizProgressService; 