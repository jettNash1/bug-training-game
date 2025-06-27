import { APIService } from '../api-service.js';
import { QuizUser } from '../QuizUser.js';
import { QuizProgressService } from '../services/QuizProgressService.js';
import { QuizList } from '../quiz-list.js';
import { checkAuth, refreshAuthState } from '../auth.js';
import { cacheManager } from './cache-manager.js';

function normalizeQuizName(quizName) {
    // Use the QuizProgressService's normalizeQuizName to ensure consistency
    if (window.quizProgressService) {
        return window.quizProgressService.normalizeQuizName(quizName);
    }
    
    // Fallback implementation if service is not available
    if (!quizName) return '';
    
    // Normalize to lowercase and trim
    const lowerName = typeof quizName === 'string' ? quizName.toLowerCase().trim() : '';
    
    // List of known quiz names for exact matching
    const knownQuizNames = [
        'communication', 
        'initiative', 
        'time-management', 
        'tester-mindset',
        'risk-analysis', 
        'risk-management', 
        'non-functional', 
        'test-support',
        'issue-verification', 
        'build-verification', 
        'issue-tracking-tools',
        'raising-tickets', 
        'reports', 
        'cms-testing', 
        'email-testing', 
        'content-copy',
        'locale-testing', 
        'script-metrics-troubleshooting', 
        'standard-script-testing',
        'test-types-tricks', 
        'automation-interview', 
        'fully-scripted', 
        'exploratory',
        'sanity-smoke', 
        'functional-interview'
    ];
    
    // If it's an exact match with our known list, return it directly
    if (knownQuizNames.includes(lowerName)) {
        return lowerName;
    }
    
    // Normalize to kebab-case
    const normalized = lowerName
        .replace(/([A-Z])/g, '-$1')  // Convert camelCase to kebab-case
        .replace(/_/g, '-')          // Convert snake_case to kebab-case
        .replace(/\s+/g, '-')        // Convert spaces to hyphens
        .replace(/-+/g, '-')         // Remove duplicate hyphens
        .replace(/^-|-$/g, '')       // Remove leading/trailing hyphens
        .toLowerCase();              // Ensure lowercase
    
    // Check if normalized version is in known list
    if (knownQuizNames.includes(normalized)) {
        return normalized;
    }
    
    // Return the normalized version for consistency
    return normalized;
}

function clearAllQuizProgress() {
    const username = localStorage.getItem('username');
    if (!username) return false;
    
    // console.log('[Index] Clearing all quiz progress for emergency reset');
    
    // Get all localStorage keys related to quiz progress
    const progressKeys = Object.keys(localStorage).filter(key => 
        key.includes('quiz_progress') && key.includes(username)
    );
    
    // Log the keys we're about to clear
    // console.log('[Index] Found these quiz progress keys to clear:', progressKeys);
    
    // Clear all quiz progress keys
    progressKeys.forEach(key => {
        localStorage.removeItem(key);
        // console.log(`[Index] Cleared localStorage key: ${key}`);
    });
    
    // Also clear session storage
    try {
        const sessionKeys = Object.keys(sessionStorage).filter(key => 
            key.includes('quiz_progress') && key.includes(username)
        );
        
        sessionKeys.forEach(key => {
            sessionStorage.removeItem(key);
            // console.log(`[Index] Cleared sessionStorage key: ${key}`);
        });
    } catch (e) {
        console.error('[Index] Error clearing sessionStorage:', e);
    }
    
    // console.log('[Index] All quiz progress cleared. Page will reload.');
    
    // Add a reload to refresh all data
    setTimeout(() => window.location.reload(), 500);
    return true;
}

class IndexPage {
    constructor() {
        // Initialize services
            this.apiService = new APIService();
            this.quizProgressService = new QuizProgressService();
            
        // Initialize state
        this.quizList = null;
        this.quizItems = null;
        this.userProgress = null;
        this.categoryProgress = {};
        
        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.loadUserProgress = this.loadUserProgress.bind(this);
        this.updateQuizProgress = this.updateQuizProgress.bind(this);
        this.updateCategoryProgress = this.updateCategoryProgress.bind(this);
        this.loadGuideSettingsAndAddButtons = this.loadGuideSettingsAndAddButtons.bind(this);
        
        try {
            // console.log('[Index] Initializing IndexPage');
            this.user = new QuizUser(localStorage.getItem('username'));
            this.quizItems = document.querySelectorAll('.quiz-item:not(.locked-quiz)');
            
            // Show loading overlay first
            this.showLoadingOverlay();
            
            // Set a backup timeout to ensure the loading overlay is hidden after a maximum time
            // This prevents the page from getting stuck in loading state
            this.loadingTimeout = setTimeout(() => {
                // console.log('[Index] Loading timeout reached - forcing loading overlay removal');
                this.hideLoadingOverlay();
            }, 10000); // 10 seconds maximum loading time
            
            // Initialize the page
            this.initialize();
        } catch (error) {
            console.error('[Index] Error during IndexPage construction:', error);
            // Ensure loading overlay is hidden even if initialization fails
            this.hideLoadingOverlay();
        }
    }

    showLoadingOverlay() {
        // Create loading overlay if it doesn't exist
        if (!document.querySelector('.loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading your learning journey...</div>
            `;
            document.body.appendChild(overlay);

            // Add styles if they don't exist
            if (!document.querySelector('#loading-styles')) {
                const styles = document.createElement('style');
                styles.id = 'loading-styles';
                styles.textContent = `
                    .loading-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(255, 255, 255, 0.9);
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        z-index: 9999;
                    }
                    .loading-spinner {
                        width: 50px;
                        height: 50px;
                        border: 5px solid #f3f3f3;
                        border-top: 5px solid var(--primary-color, #4a90e2);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 20px;
                    }
                    .loading-text {
                        font-size: 1.2em;
                        color: var(--primary-color, #4a90e2);
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(styles);
            }
        }
    }

    hideLoadingOverlay() {
        // Clear the loading timeout if it exists
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
        
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            // Add fade-out animation
            overlay.style.transition = 'opacity 0.3s ease-out';
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
    }

    async initialize() {
        try {
            // console.log('[Index] Starting initialization');
            
            // Show loading overlay
            this.showLoadingOverlay();
            
            // Initialize cache management first
            await cacheManager.initialize();
            
            // Initialize API service
            this.apiService = new APIService();
            
            // Initialize quiz list with retry logic
            await this.initializeWithRetry();
            
            // console.log('[Index] Initialization complete');

            // Add visibilitychange listener to update guide buttons when returning to tab
            // Commented out to prevent auto-refresh or restoration on tab return
            // document.addEventListener('visibilitychange', () => {
            //     if (document.visibilityState === 'visible' && window.indexPage) {
            //         window.indexPage.loadGuideSettingsAndAddButtons();
            //     }
            // });
        } catch (error) {
            console.error('[Index] Error during initialization:', error);
            this.hideLoadingOverlay();
        }
    }

    async initializeWithRetry(maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // console.log(`[Index] Initialization attempt ${attempt}/${maxRetries}`);
                
                // Initialize quiz list
                this.quizList = new QuizList();
                await this.quizList.init();
                
                // Wait a bit for DOM to be ready
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Get quiz items after they are created
                this.quizItems = document.querySelectorAll('.quiz-item');
                // console.log(`[Index] Found ${this.quizItems.length} quiz items`);
                
                if (this.quizItems.length === 0) {
                    throw new Error('No quiz items found in DOM');
                }
                
                // Load user progress and update UI
                const progressLoaded = await this.loadUserProgress();
                if (!progressLoaded) {
                    throw new Error('Failed to load user progress');
                }
                
                await this.updateQuizProgress();
                this.updateCategoryProgress();
                
                // Add badges UI element (only call one method)
                this.addBadgesNavLink();
                
                // Load guide settings and add buttons after quiz items are created
                await this.loadGuideSettingsAndAddButtons();
                
                // Hide loading overlay
                this.hideLoadingOverlay();
                
                // console.log(`[Index] Initialization successful on attempt ${attempt}`);
                return; // Success, exit retry loop
                
            } catch (error) {
                console.error(`[Index] Initialization attempt ${attempt} failed:`, error);
                
                if (attempt === maxRetries) {
                    console.error('[Index] All initialization attempts failed');
                    this.hideLoadingOverlay();
                    throw error;
                } else {
                    // console.log(`[Index] Retrying in ${attempt * 500}ms...`);
                    await new Promise(resolve => setTimeout(resolve, attempt * 500));
                }
            }
        }
    }

    async checkAndCleanContaminatedData() {
        // Simply delegate to the QuizProgressService
        return this.quizProgressService.checkAndCleanContaminatedData();
    }

    handleLogout() {
        try {
            // Clear all auth-related data
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            
            // Redirect to login page
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async loadUserProgress() {
        try {
            const username = localStorage.getItem('username');
            if (!username) return;

            // console.log('[Index] Loading all quiz progress data');

            // Use the QuizProgressService to get all quiz progress in a single call
            const progressResult = await this.quizProgressService.getAllQuizProgress();
            
            if (!progressResult.success || !progressResult.data) {
                console.error('[Index] Failed to load quiz progress:', progressResult.message);
                return false;
            }
            
            const quizProgress = progressResult.data;
            // console.log('[Index] Loaded progress for', Object.keys(quizProgress).length, 'quizzes');
            
            // Get quiz results and hidden quizzes from API
            let quizResults = [];
            let hiddenQuizzes = [];
            try {
                const userData = await this.apiService.getUserData();
                if (userData.success && userData.data) {
                    if (userData.data.quizResults) {
                    quizResults = userData.data.quizResults;
                    // console.log('[Index] Loaded', quizResults.length, 'quiz results');
                    }
                    if (userData.data.hiddenQuizzes) {
                        hiddenQuizzes = userData.data.hiddenQuizzes;
                        // console.log('[Index] Loaded', hiddenQuizzes.length, 'hidden quizzes:', hiddenQuizzes);
                    }
                }
            } catch (error) {
                console.warn('[Index] Error loading user data:', error);
            }
            
            // console.log('[Index] Final quiz progress after all checks:', quizProgress);
            
            // Process all visible quizzes using the already fetched data
            this.quizScores = Array.from(this.quizItems)
                .map(item => {
                    const quizId = item.dataset.quiz;
                    if (!quizId) return null;
                    
                    // Normalize the quizId consistently using the service
                    const lookupId = this.quizProgressService.normalizeQuizName(quizId);
                    
                    // Check if this quiz is hidden
                    const isHidden = hiddenQuizzes.includes(lookupId) || hiddenQuizzes.includes(quizId);
                    // console.log(`[Index] Checking visibility for ${quizId} → ${lookupId}:`, {
                    //     hiddenQuizzes,
                    //     lookupId,
                    //     quizId,
                    //     isHidden
                    // });
                    
                    if (isHidden) {
                        // console.log(`[Index] Skipping hidden quiz: ${quizId} → ${lookupId}`);
                        // Hide the quiz item in the DOM
                        const wrapper = item.closest('.quiz-item-wrapper');
                        if (wrapper) {
                            wrapper.style.display = 'none';
                            wrapper.classList.add('quiz-hidden');
                        } else {
                            item.style.display = 'none';
                            item.classList.add('quiz-hidden');
                        }
                        return null;
                    }
                    
                    // console.log(`[Index] Processing visible quiz data for: ${quizId} → ${lookupId}`);
                    
                    // First check for quiz progress
                    const progress = quizProgress[lookupId];
                    // console.log(`[Index] - Progress data for ${lookupId}:`, progress);
                    
                    // Then check for quiz results
                    const result = quizResults.find(r => 
                        this.quizProgressService.normalizeQuizName(r.quizName) === lookupId
                    );
                    // console.log(`[Index] - Result data for ${lookupId}:`, result);
                    
                    // Combine data from both sources, with progress taking precedence
                    const combinedData = {
                        quizName: lookupId,
                        score: 0,
                        questionsAnswered: 0,
                        status: 'not-started',
                        scorePercentage: 0
                    };
                    
                    // Apply result data if available
                    if (result) {
                        combinedData.score = result.score || 0;
                        combinedData.scorePercentage = result.scorePercentage || result.score || 0;
                        combinedData.experience = result.experience || 0;
                        // console.log(`[Index] - Applied result data for ${lookupId}:`, {
                        //     score: combinedData.score,
                        //     scorePercentage: combinedData.scorePercentage,
                        //     experience: combinedData.experience
                        // });
                    }
                    
                    // Apply progress data if available (overrides result data)
                    if (progress) {
                        combinedData.questionsAnswered = progress.questionsAnswered || 0;
                        combinedData.status = progress.status || 'not-started';
                        combinedData.questionHistory = progress.questionHistory || [];
                        
                        if (progress.scorePercentage !== undefined) {
                            combinedData.scorePercentage = progress.scorePercentage;
                        }
                        if (progress.experience !== undefined) {
                            combinedData.experience = progress.experience;
                        }
                        // console.log(`[Index] - Applied progress data for ${lookupId}:`, {
                        //     questionsAnswered: combinedData.questionsAnswered,
                        //     status: combinedData.status,
                        //     scorePercentage: combinedData.scorePercentage,
                        //     experience: combinedData.experience
                        // });
                    }
                    
                    // Calculate score from question history if available (most accurate)
                    const questionHistory = progress?.questionHistory || result?.questionHistory;
                    if (questionHistory && Array.isArray(questionHistory) && questionHistory.length > 0) {
                        const correctAnswers = questionHistory.filter(q => q.isCorrect).length;
                        const calculatedScore = Math.round((correctAnswers / questionHistory.length) * 100);
                        
                        // Use calculated score if it's more accurate than stored values
                        combinedData.score = calculatedScore;
                        combinedData.scorePercentage = calculatedScore;
                        
                        // console.log(`[Index] - Calculated score from question history for ${lookupId}:`, {
                        //     correctAnswers,
                        //     totalQuestions: questionHistory.length,
                        //     calculatedScore: calculatedScore
                        // });
                    }
                    
                    // console.log(`[Index] - Final processed data for quiz ${lookupId}:`, combinedData);
                    return combinedData;
                })
                .filter(Boolean);

            // console.log('[Index] All processed quiz scores:', this.quizScores);
            return true;
        } catch (error) {
            console.error('[Index] Error loading user progress:', error);
            this.quizScores = [];
            return false;
        }
    }

    async updateQuizProgress() {
        if (!this.quizScores || !Array.isArray(this.quizScores) || this.quizScores.length === 0) {
            console.warn('[Index] No quiz scores available for updating progress');
            return;
        }
        
        // console.log(`[Index] Updating UI for ${this.quizItems.length} quiz items with ${this.quizScores.length} quiz scores`);
        // console.log('[Index] All quiz scores data:', this.quizScores);

        // Add a small delay to ensure DOM is fully ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Re-query quiz items to ensure we have the latest DOM state
        this.quizItems = document.querySelectorAll('.quiz-item');
        // console.log(`[Index] Re-queried and found ${this.quizItems.length} quiz items`);
                
        this.quizItems.forEach((item, index) => {
            const quizId = item.dataset.quiz;
            if (!quizId) {
                console.warn(`[Index] Quiz item ${index} has no data-quiz attribute`);
                return;
            }

            const progressElement = document.getElementById(`${quizId}-progress`);
            if (!progressElement) {
                console.warn(`[Index] No progress element found for quiz: ${quizId}`);
                return;
            }

            // Find the score object for this quiz
            const quizScore = this.quizScores.find(score =>
                this.quizProgressService.normalizeQuizName(score.quizName) === this.quizProgressService.normalizeQuizName(quizId)
            );

            // console.log(`[Index] Processing quiz: ${quizId}`);
            // console.log(`[Index] - Normalized quiz ID: ${this.quizProgressService.normalizeQuizName(quizId)}`);
            // console.log(`[Index] - Found quiz score data:`, quizScore);

            const questionsAnswered = quizScore?.questionsAnswered || 0;
            const score = quizScore?.score || 0;
            const scorePercentage = quizScore?.scorePercentage || 0;

            // console.log(`[Index] - Questions answered: ${questionsAnswered}`);
            // console.log(`[Index] - Score: ${score}`);
            // console.log(`[Index] - Score percentage: ${scorePercentage}`);

            let statusClass = 'not-started';
            let progressText = '';

            if (questionsAnswered === 15) {
                progressText = '15/15';
                const effectiveScore = (score !== undefined && score !== null) ? score : (scorePercentage !== undefined && scorePercentage !== null ? scorePercentage : 0);
                // console.log(`[Index] - Quiz completed with effective score: ${effectiveScore}`);
                if (effectiveScore >= 80) {
                    statusClass = 'completed-perfect';
                } else {
                    statusClass = 'completed-partial';
                }
            } else if (questionsAnswered > 0) {
                statusClass = 'in-progress';
                progressText = `${questionsAnswered}/15`;
            } else {
                statusClass = 'not-started';
                progressText = '';
            }

            // console.log(`[Index] - Final status class: ${statusClass}`);
            // console.log(`[Index] - Final progress text: ${progressText}`);

            // Remove all status classes from .quiz-item
            item.classList.remove('not-started', 'in-progress', 'completed-partial', 'completed-perfect');
            item.classList.add(statusClass);

            // Also apply the status class to the wrapper for robustness
            const wrapper = item.closest('.quiz-item-wrapper');
            if (wrapper) {
                // console.log(`[Index] - Applying status class to wrapper: ${statusClass}`);
                // console.log(`[Index] - Wrapper before update:`, wrapper.className);
                wrapper.classList.remove('not-started', 'in-progress', 'completed-partial', 'completed-perfect');
                wrapper.classList.add(statusClass);
                // console.log(`[Index] - Wrapper after update:`, wrapper.className);
                
                // Force a style recalculation to ensure the changes take effect
                wrapper.offsetHeight; // This forces a reflow
                
                // Double-check the class was applied
                setTimeout(() => {
                    if (!wrapper.classList.contains(statusClass)) {
                        console.warn(`[Index] - Status class ${statusClass} not found on wrapper after timeout, re-applying...`);
                        wrapper.classList.add(statusClass);
                    }
                }, 50);
            } else {
                console.warn(`[Index] - No wrapper found for quiz: ${quizId}`);
            }

            // Update progress text
            progressElement.textContent = progressText;
            progressElement.style.display = progressText ? '' : 'none';

            // Update Pass/Fail indicator for completed quizzes
            const passFail = document.getElementById(`${quizId}-pass-fail`);
            if (passFail) {
                if (questionsAnswered === 15) {
                    // Quiz is completed, show Pass/Fail based on 80% threshold
                    const effectiveScore = (score !== undefined && score !== null) ? score : (scorePercentage !== undefined && scorePercentage !== null ? scorePercentage : 0);
                    
                    if (effectiveScore >= 80) {
                        passFail.textContent = 'PASS';
                        passFail.className = 'quiz-pass-fail pass';
                        passFail.style.display = '';
                    } else {
                        passFail.textContent = 'FAIL';
                        passFail.className = 'quiz-pass-fail fail';
                        passFail.style.display = '';
                    }
                    
                    // console.log(`[Index] - Pass/Fail indicator: ${effectiveScore >= 80 ? 'PASS' : 'FAIL'} (score: ${effectiveScore}%)`);
                } else {
                    // Quiz not completed, hide Pass/Fail indicator
                    passFail.style.display = 'none';
                }
            }

            // console.log(`[Index] - Quiz ${quizId} processing complete`);
            // console.log('---');
        });

        // Add a final verification step
        setTimeout(() => {
            // console.log('[Index] Final verification of status classes:');
            this.quizItems.forEach(item => {
                const quizId = item.dataset.quiz;
                const wrapper = item.closest('.quiz-item-wrapper');
                if (wrapper) {
                    // console.log(`[Index] ${quizId}: ${wrapper.className}`);
                }
            });
        }, 200);

        // Ensure guide buttons are updated after progress update
        await this.loadGuideSettingsAndAddButtons();
    }

    updateCategoryProgress() {
        if (!this.quizScores || !Array.isArray(this.quizScores) || this.quizScores.length === 0) {
            console.warn('[Index] No quiz scores available for updating category progress');
            return;
        }

        // console.log('[Index] Updating category progress displays');
        
        document.querySelectorAll('.category-card').forEach(category => {
            const quizItems = category.querySelectorAll('.quiz-item:not(.locked-quiz)');
            const visibleQuizItems = Array.from(quizItems).filter(item => {
                const wrapper = item.closest('.quiz-item-wrapper');
                const isHidden = item.classList.contains('quiz-hidden') || 
                               wrapper?.classList.contains('quiz-hidden') ||
                               item.style.display === 'none' ||
                               wrapper?.style.display === 'none';
                return !isHidden;
            });
            const progressBar = category.querySelector('.progress-fill');
            const progressText = category.querySelector('.progress-text');
            
            // Get category name for logging
            const categoryName = category.querySelector('.category-header')?.textContent?.trim() || 'Unknown Category';
            
            // console.log(`[Index] Category ${categoryName}: ${quizItems.length} total quizzes, ${visibleQuizItems.length} visible quizzes`);
            
            // Hide the category if there are no visible quizzes
            if (visibleQuizItems.length === 0) {
                // console.log(`[Index] Hiding empty category: ${categoryName}`);
                category.style.display = 'none';
                return;
            } else {
                // console.log(`[Index] Showing category: ${categoryName} with ${visibleQuizItems.length} visible quizzes`);
                category.style.display = '';
            }

            if (!progressBar || !progressText) {
                console.warn(`[Index] Missing progress elements for category: ${categoryName}`);
                return;
            }

            const categoryStats = visibleQuizItems.reduce((stats, item) => {
                const quizId = item.dataset.quiz;
                if (!quizId) return stats;
                
                // Use normalized quiz ID consistently with the service
                const normalizedQuizId = this.quizProgressService.normalizeQuizName(quizId);
                
                // Find with consistent matching from the service
                const quizScore = this.quizScores.find(score => 
                    this.quizProgressService.normalizeQuizName(score.quizName) === normalizedQuizId
                );
                
                // Count as completed if all 15 questions are answered, regardless of status
                const isCompleted = quizScore && quizScore.questionsAnswered >= 15;
                
                // if (isCompleted) {
                //     console.log(`[Index] Quiz ${normalizedQuizId} is completed (${quizScore.questionsAnswered}/15)`);
                // }
                
                return {
                    completedQuizzes: stats.completedQuizzes + (isCompleted ? 1 : 0),
                    totalProgress: stats.totalProgress + (isCompleted ? 100 : 0)
                };
            }, { completedQuizzes: 0, totalProgress: 0 });

            const totalQuizzes = visibleQuizItems.length;
            // Calculate percentage based on completed quizzes instead of total progress
            const categoryPercentage = Math.round((categoryStats.completedQuizzes / totalQuizzes) * 100);

            // console.log(`[Index] Category ${categoryName}: ${categoryStats.completedQuizzes}/${totalQuizzes} completed (${categoryPercentage}%)`);

            // Update the category progress text and bar
            const progressTextElement = progressText.closest('.category-progress');
            if (progressTextElement) {
                progressTextElement.innerHTML = `
                    <div class="progress-text">Progress: ${categoryStats.completedQuizzes}/${totalQuizzes} Complete</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${categoryPercentage}%"></div>
                    </div>
                `;
            }
        });
        // console.log('[Index] Category progress display updated');
        // Ensure guide buttons are updated after category progress update
        this.loadGuideSettingsAndAddButtons();
    }

    addBadgesNavLink() {
        // First, check if we need to handle the header format shown in the screenshot
        const usernameDisplay = document.querySelector('.user-info, .username-display');
        const logoutButton = document.querySelector('a.logout-button, button.logout-button, a[onclick*="handleLogout"]');
        
        if (!usernameDisplay || !logoutButton) {
            console.log('Could not find standard username or logout elements, trying alternative approach');
            this.addBadgesButtonAlternative();
            return;
        }
        
        // Get the parent container that holds the username and logout button
        const headerRightSection = logoutButton.closest('div, nav');
        if (!headerRightSection) {
            console.log('Could not find header right section, trying alternative approach');
            this.addBadgesButtonAlternative();
            return;
        }
        
        // Check if buttons already exist
        if (headerRightSection.querySelector('a[href="badges.html"]')) {
            return;
        }
        
        // Create the info button
        const infoButton = document.createElement('a');
        infoButton.href = 'info.html';
        infoButton.className = 'info-button';
        infoButton.innerHTML = '<i class="fa-solid fa-info-circle"></i> Info';
        infoButton.setAttribute('aria-label', 'View system information and help');
        
        // Create the badges button with styling to match the logout button but in blue
        const badgesButton = document.createElement('a');
        badgesButton.href = 'badges.html';
        badgesButton.className = 'badges-button';
        badgesButton.innerHTML = '<i class="fa-solid fa-award"></i> Badges';
        badgesButton.setAttribute('aria-label', 'View your earned badges');
        
        // Insert buttons before the logout button (info first, then badges)
        headerRightSection.insertBefore(infoButton, logoutButton);
        headerRightSection.insertBefore(badgesButton, logoutButton);
        
        // Add Font Awesome if not already included
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
        
        // Add the CSS for both buttons to match the layout
        if (!document.getElementById('header-buttons-style')) {
            const style = document.createElement('style');
            style.id = 'header-buttons-style';
            style.textContent = `
                .info-button, .badges-button {
                    color: white;
                    border-radius: 4px;
                    padding: 8px 16px;
                    transition: background-color 0.3s ease;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 10px;
                    font-weight: 500;
                    font-size: 14px;
                }
                
                .info-button {
                    background-color: #28a745;
                }
                
                .info-button:hover {
                    background-color: #218838;
                    color: white;
                }
                
                .badges-button {
                    background-color: var(--primary-color, #4a90e2);
                }
                
                .badges-button:hover {
                    background-color: var(--primary-color-dark, #3a80d2);
                    color: white;
                }
                
                .info-button i, .badges-button i {
                    margin-right: 6px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Add a fallback method to try different approaches to add the badges button
    addBadgesButtonAlternative() {
        // Look for the header element
        const header = document.querySelector('header');
        if (!header) {
            console.error('Could not find header element');
            return;
        }
        
        // Try to identify the user area based on the screenshot layout
        const userArea = header.querySelector('.header-container > div:last-child') || 
                         header.querySelector('.user-info') || 
                         header.querySelector('.header-right');
        
        // If we can't find a designated user area, create one
        if (!userArea) {
            // Check if we have a header container
            const headerContainer = header.querySelector('.header-container');
            if (!headerContainer) {
                console.error('Could not find header container');
                return;
            }
            
            // Create a user area div
            const newUserArea = document.createElement('div');
            newUserArea.className = 'header-right';
            headerContainer.appendChild(newUserArea);
            
            // Add the badges button to this new area
            this.addBadgeToElement(newUserArea);
        } else {
            // Add the badges button to the existing user area
            this.addBadgeToElement(userArea);
        }
    }

    // Helper method to add the badge to a specific element
    addBadgeToElement(element) {
        // Check if buttons already exist
        if (element.querySelector('a[href="badges.html"]')) {
            return;
        }
        
        // Create the info button
        const infoButton = document.createElement('a');
        infoButton.href = 'info.html';
        infoButton.className = 'info-button';
        infoButton.innerHTML = '<i class="fa-solid fa-info-circle"></i> Info';
        infoButton.setAttribute('aria-label', 'View system information and help');
        
        // Create the badges button
        const badgesButton = document.createElement('a');
        badgesButton.href = 'badges.html';
        badgesButton.className = 'badges-button';
        badgesButton.innerHTML = '<i class="fa-solid fa-award"></i> Badges';
        badgesButton.setAttribute('aria-label', 'View your earned badges');
        
        // Find the logout button if it exists in this element
        const logoutButton = element.querySelector('a.logout-button, button.logout-button, a[onclick*="handleLogout"]');
        
        if (logoutButton) {
            // Insert before the logout button (info first, then badges)
            element.insertBefore(infoButton, logoutButton);
            element.insertBefore(badgesButton, logoutButton);
        } else {
            // Add to the beginning of the element (info first, then badges)
            element.prepend(badgesButton);
            element.prepend(infoButton);
        }
        
        // Ensure styles are added
        if (!document.getElementById('header-buttons-style')) {
            const style = document.createElement('style');
            style.id = 'header-buttons-style';
            style.textContent = `
                .info-button, .badges-button {
                    color: white;
                    border-radius: 4px;
                    padding: 8px 16px;
                    transition: background-color 0.3s ease;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 10px;
                    font-weight: 500;
                    font-size: 14px;
                }
                
                .info-button {
                    background-color: #28a745;
                }
                
                .info-button:hover {
                    background-color: #218838;
                    color: white;
                }
                
                .badges-button {
                    background-color: var(--primary-color, #4a90e2);
                }
                
                .badges-button:hover {
                    background-color: var(--primary-color-dark, #3a80d2);
                    color: white;
                }
                
                .info-button i, .badges-button i {
                    margin-right: 6px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    async loadGuideSettingsAndAddButtons() {
        // console.log('[Index] Loading guide settings for quiz items');
        
        // Always try to load from API first, then fall back to localStorage if API fails
        let guideSettings = null;
        let settingsSource = 'none';
        
        try {
            // 1. Try to fetch from API first
            // console.log('[Index] Attempting to fetch guide settings from API...');
            const response = await this.apiService.fetchGuideSettings();
            // console.log('[Index] API response:', response);
            
            if (response && response.success && response.data) {
                guideSettings = response.data;
                settingsSource = 'api';
                // console.log('[Index] Successfully loaded guide settings from API:', guideSettings);
                
                // Save to localStorage for future use (if not in incognito mode)
                try {
                    localStorage.setItem('guideSettings', JSON.stringify(guideSettings));
                    // console.log('[Index] Saved guide settings to localStorage');
                } catch (e) {
                    console.warn('[Index] Could not save guide settings to localStorage (possibly incognito mode):', e);
                }
            } else {
                throw new Error('API response was not successful or had no data');
            }
        } catch (apiError) {
            console.warn('[Index] Failed to load guide settings from API:', apiError);
            
            // 2. Fall back to localStorage if API fails
            try {
                const cached = localStorage.getItem('guideSettings');
                if (cached) {
                    guideSettings = JSON.parse(cached);
                    settingsSource = 'localStorage';
                    // console.log('[Index] Using cached guide settings from localStorage:', guideSettings);
                } else {
                    // console.log('[Index] No cached guide settings found in localStorage');
                }
            } catch (localStorageError) {
                console.error('[Index] Error reading from localStorage:', localStorageError);
            }
        }
        
        // 3. Apply guide settings to buttons
        const guideButtons = document.querySelectorAll('.quiz-guide-button');
        // console.log(`[Index] Found ${guideButtons.length} guide buttons to configure`);
        // console.log(`[Index] Using guide settings from: ${settingsSource}`);
        // console.log(`[Index] Guide settings data:`, guideSettings);
        
        if (!guideSettings || Object.keys(guideSettings).length === 0) {
            console.warn('[Index] No guide settings available - hiding all guide buttons');
            guideButtons.forEach(btn => {
                btn.style.display = 'none';
                btn.removeAttribute('href');
                btn.removeAttribute('data-guide-url');
                btn.removeAttribute('data-guide-enabled');
            });
            return;
        }
        
        // Apply settings to each button
        guideButtons.forEach((btn, index) => {
            const quiz = btn.getAttribute('data-quiz');
            if (!quiz) {
                console.warn(`[Index] Guide button ${index} has no data-quiz attribute`);
                return;
            }
            
            const normalizedQuiz = this.quizProgressService ? 
                this.quizProgressService.normalizeQuizName(quiz) : 
                quiz.toLowerCase();
            
            const setting = guideSettings[normalizedQuiz] || guideSettings[quiz];
            
            // console.log(`[Index] Processing guide button for quiz: ${quiz} (normalized: ${normalizedQuiz})`);
            // console.log(`[Index] - Found setting:`, setting);
            
            if (setting && setting.enabled && setting.url) {
                btn.href = setting.url;
                btn.target = '_blank';
                btn.rel = 'noopener noreferrer';
                btn.style.display = 'block';
                btn.setAttribute('data-guide-url', setting.url);
                btn.setAttribute('data-guide-enabled', 'true');
                // console.log(`[Index] - Enabled guide button: ${setting.url}`);
            } else {
                // Hide the button if no valid URL or not enabled
                btn.style.display = 'none';
                btn.removeAttribute('href');
                btn.removeAttribute('data-guide-url');
                btn.removeAttribute('data-guide-enabled');
                // console.log(`[Index] - Disabled guide button (no valid setting)`);
            }
        });
        
        // console.log(`[Index] Guide button configuration complete (source: ${settingsSource})`);
    }

    // Debug helper method to check quiz name normalization
    logQuizNameNormalization() {
        console.group('Quiz Name Normalization Check');
        
        // Log all quiz items in the DOM
        this.quizItems.forEach(item => {
            const quizId = item.dataset.quiz;
            if (!quizId) return;
            
            const normalized = this.apiService.normalizeQuizName(quizId);
            console.log(`Quiz ID: "${quizId}" → Normalized: "${normalized}"`);
        });
        
        if (this.quizScores) {
            console.log('----- Quiz Scores in Memory -----');
            this.quizScores.forEach(score => {
                const quizName = score.quizName;
                const normalized = this.apiService.normalizeQuizName(quizName);
                console.log(`Score name: "${quizName}" → Normalized: "${normalized}" (Questions: ${score.questionsAnswered})`);
            });
        }
        
        console.groupEnd();
    }

    // Debug helper to test guide button functionality
    async testGuideButtonFunctionality() {
        console.group('Guide Button Functionality Test');
        
        try {
            // Get guide settings
            const response = await this.apiService.fetchGuideSettings();
            console.log('Guide settings response:', response);
            
            if (response.success && response.data) {
                console.log('Available guide settings:');
                Object.entries(response.data).forEach(([quiz, setting]) => {
                    console.log(`  ${quiz}: enabled=${setting.enabled}, url=${setting.url}`);
                });
                
                // Test each quiz item
                this.quizItems.forEach(item => {
                    const quizId = item.dataset.quiz;
                    if (!quizId) return;
                    
                    const normalizedQuizId = this.apiService.normalizeQuizName(quizId);
                    const guideSetting = response.data[normalizedQuizId];
                    const guideButton = item.querySelector('.quiz-guide-button');
                    
                    console.log(`Quiz: ${quizId} → ${normalizedQuizId}`);
                    console.log(`  Guide setting:`, guideSetting);
                    console.log(`  Button element:`, guideButton);
                    console.log(`  Button href:`, guideButton?.href);
                    console.log(`  Button display:`, guideButton?.style.display);
                    console.log('---');
                });
            } else {
                console.error('Failed to get guide settings:', response);
            }
        } catch (error) {
            console.error('Error testing guide button functionality:', error);
        }
        
        console.groupEnd();
    }

    resetQuizVisibility() {
        // console.log('[Index] Resetting quiz visibility - showing all quizzes');
        
        // Show all quiz items and remove hidden classes
        this.quizItems.forEach(item => {
            const wrapper = item.closest('.quiz-item-wrapper');
            if (wrapper) {
                wrapper.style.display = '';
                wrapper.classList.remove('quiz-hidden');
            } else {
                item.style.display = '';
                item.classList.remove('quiz-hidden');
            }
        });
    }

    async refreshAllQuizProgress() {
        // console.log('[Index] Refreshing all quiz progress');
        
        try {
            // First, reset all quiz visibility (show all quizzes)
            this.resetQuizVisibility();
            
            // Update quiz progress (this will also handle hiding quizzes)
            await this.loadUserProgress();
            this.updateQuizProgress();
            this.updateCategoryProgress();
            
            // Store current guide button states before clearing
            const guideButtonStates = new Map();
            this.quizItems.forEach(item => {
                const parentWrapper = item.closest('.quiz-item-wrapper');
                if (parentWrapper) {
                    const guideButton = parentWrapper.querySelector('.quiz-guide-button');
                    if (guideButton) {
                        // Store current state
                        guideButtonStates.set(guideButton, {
                            href: guideButton.href,
                            dataGuideUrl: guideButton.getAttribute('data-guide-url'),
                            dataGuideEnabled: guideButton.getAttribute('data-guide-enabled'),
                            display: guideButton.style.display
                        });
                    }
                }
            });
            
            // Load fresh guide settings from API and add buttons
            await this.loadGuideSettingsAndAddButtons();
            
            // Restore guide button states if they haven't been updated
            this.quizItems.forEach(item => {
                const parentWrapper = item.closest('.quiz-item-wrapper');
                if (parentWrapper) {
                    const guideButton = parentWrapper.querySelector('.quiz-guide-button');
                    if (guideButton) {
                        const savedState = guideButtonStates.get(guideButton);
                        if (savedState && !guideButton.href) {
                            // Only restore if the button hasn't been updated with new settings
                            guideButton.href = savedState.href;
                            if (savedState.dataGuideUrl) guideButton.setAttribute('data-guide-url', savedState.dataGuideUrl);
                            if (savedState.dataGuideEnabled) guideButton.setAttribute('data-guide-enabled', savedState.dataGuideEnabled);
                            guideButton.style.display = savedState.display;
                        }
                    }
                }
            });
            
            // console.log('[Index] Quiz progress and guide buttons refresh complete');
        } catch (error) {
            console.error('[Index] Error during quiz progress refresh:', error);
        }
    }
}

// Initialize the index page when the DOM is loaded
let indexPage;
document.addEventListener('DOMContentLoaded', async () => {
    // Optimized authentication check - only verify if we don't have cached auth state
    try {
        // console.log('[Index] Checking authentication before initializing...');
        const isAuthenticated = await checkAuth();
        
        if (!isAuthenticated) {
            // console.log('[Index] User not authenticated, redirect should have occurred');
            // If checkAuth returns false, it should have already redirected
            // But as a failsafe, we'll ensure no content is shown
            document.body.style.display = 'none';
            return;
        }
        
        // console.log('[Index] User authenticated, proceeding with initialization');
        
        // Remove auth checking overlay and show authenticated content
        const authCheckElement = document.getElementById('authCheck');
        if (authCheckElement) {
            authCheckElement.remove();
        }
        document.body.classList.add('authenticated');
        
    } catch (error) {
        console.error('[Index] Authentication check failed:', error);
        // Hide content and redirect as failsafe
        document.body.style.display = 'none';
        window.location.replace('/login.html');
        return;
    }
    
            // Only proceed with initialization if authenticated
        // Create the QuizProgressService globally for consistency across the app
        window.quizProgressService = new QuizProgressService();
        
        // Display username in header
        const currentUsername = localStorage.getItem('username');
        const usernameElement = document.getElementById('headerUsername');
        if (usernameElement && currentUsername) {
            usernameElement.textContent = currentUsername;
        }
        
        indexPage = new IndexPage();
        
        // Store in window for global access
        window.indexPage = indexPage;
    
    // console.log('[Index] Initialization complete');

    // Add visibilitychange listener to update guide buttons when returning to tab
    // Commented out to prevent auto-refresh or restoration on tab return
    // document.addEventListener('visibilitychange', () => {
    //     if (document.visibilityState === 'visible' && window.indexPage) {
    //         window.indexPage.loadGuideSettingsAndAddButtons();
    //     }
    // });
});

// Expose handleLogout to the window object
window.handleLogout = () => {
    if (indexPage) {
        indexPage.handleLogout();
    } else {
        // Fallback if indexPage is not initialized
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        localStorage.removeItem('isAdmin');
        window.location.href = '/login.html';
    }
}; 

// Expose the function to the global scope for emergency use
window.clearAllQuizProgress = clearAllQuizProgress; 

// Add a global debugging function to check quiz status
window.debugQuizStatus = () => {
    console.group('Quiz Status Debug');
    
    const quizItems = document.querySelectorAll('.quiz-item');
    console.log(`Found ${quizItems.length} quiz items`);
    
    quizItems.forEach(item => {
        const quizId = item.dataset.quiz;
        const wrapper = item.closest('.quiz-item-wrapper');
        const progressElement = document.getElementById(`${quizId}-progress`);
        
        console.log(`Quiz: ${quizId}`);
        console.log(`  - Item classes: ${item.className}`);
        console.log(`  - Wrapper classes: ${wrapper ? wrapper.className : 'NO WRAPPER'}`);
        console.log(`  - Progress text: ${progressElement ? progressElement.textContent : 'NO PROGRESS ELEMENT'}`);
        console.log(`  - Computed background color: ${wrapper ? getComputedStyle(wrapper).backgroundColor : 'N/A'}`);
        console.log('---');
    });
    
    if (window.indexPage && window.indexPage.quizScores) {
        console.log('Quiz scores in memory:', window.indexPage.quizScores);
    } else {
        console.log('No quiz scores in memory');
    }
    
    console.groupEnd();
};

// Add a function to manually trigger status update
window.updateQuizStatus = () => {
    if (window.indexPage) {
        console.log('Manually triggering quiz status update...');
        window.indexPage.updateQuizProgress();
    } else {
        console.error('IndexPage not available');
    }
};

// Add a comprehensive manual refresh function
window.forceRefreshQuizStatus = async () => {
    console.log('=== FORCE REFRESH QUIZ STATUS ===');
    
    if (!window.indexPage) {
        console.error('IndexPage not available');
        return;
    }
    
    try {
        // Re-load all data
        console.log('1. Re-loading user progress...');
        await window.indexPage.loadUserProgress();
        
        // Re-query DOM elements
        console.log('2. Re-querying DOM elements...');
        window.indexPage.quizItems = document.querySelectorAll('.quiz-item');
        console.log(`Found ${window.indexPage.quizItems.length} quiz items`);
        
        // Update progress with delay
        console.log('3. Updating quiz progress...');
        await window.indexPage.updateQuizProgress();
        
        // Update category progress
        console.log('4. Updating category progress...');
        window.indexPage.updateCategoryProgress();
        
        console.log('5. Force refresh complete!');
        
        // Show final status
        setTimeout(() => {
            console.log('=== FINAL STATUS CHECK ===');
            window.debugQuizStatus();
        }, 500);
        
    } catch (error) {
        console.error('Error during force refresh:', error);
    }
};

// Add a function to debug quiz visibility
window.debugQuizVisibility = async () => {
    console.log('=== QUIZ VISIBILITY DEBUG ===');
    
    try {
        // Check user data for hidden quizzes
        if (window.indexPage && window.indexPage.apiService) {
            const userData = await window.indexPage.apiService.getUserData();
            if (userData.success && userData.data && userData.data.hiddenQuizzes) {
                console.log('Hidden quizzes from API:', userData.data.hiddenQuizzes);
            } else {
                console.log('No hidden quizzes found in user data');
            }
        }
        
        // Check DOM for hidden quiz items
        const allQuizItems = document.querySelectorAll('.quiz-item');
        const hiddenQuizItems = document.querySelectorAll('.quiz-item.quiz-hidden, .quiz-item-wrapper.quiz-hidden');
        
        console.log(`Total quiz items: ${allQuizItems.length}`);
        console.log(`Hidden quiz items: ${hiddenQuizItems.length}`);
        
        allQuizItems.forEach(item => {
            const quizId = item.dataset.quiz;
            const wrapper = item.closest('.quiz-item-wrapper');
            const isHidden = item.classList.contains('quiz-hidden') || 
                           wrapper?.classList.contains('quiz-hidden') ||
                           item.style.display === 'none' ||
                           wrapper?.style.display === 'none';
            
            console.log(`Quiz ${quizId}: ${isHidden ? 'HIDDEN' : 'VISIBLE'}`);
        });
        
        console.log('=== QUIZ VISIBILITY DEBUG COMPLETE ===');
    } catch (error) {
        console.error('Error during quiz visibility debug:', error);
    }
};

// Add a comprehensive guide button debugging function
window.debugGuideButtons = async () => {
    console.log('=== GUIDE BUTTON DEBUG ===');
    
    try {
        // Check localStorage
        console.log('1. Checking localStorage...');
        const cachedSettings = localStorage.getItem('guideSettings');
        if (cachedSettings) {
            const parsed = JSON.parse(cachedSettings);
            console.log('   - Found cached settings:', parsed);
            console.log(`   - Number of cached guides: ${Object.keys(parsed).length}`);
        } else {
            console.log('   - No cached settings found (normal in incognito mode)');
        }
        
        // Check API
        console.log('2. Checking API...');
        if (window.indexPage && window.indexPage.apiService) {
            try {
                const apiResponse = await window.indexPage.apiService.fetchGuideSettings();
                console.log('   - API response:', apiResponse);
                if (apiResponse && apiResponse.success && apiResponse.data) {
                    console.log(`   - Number of API guides: ${Object.keys(apiResponse.data).length}`);
                    Object.entries(apiResponse.data).forEach(([quiz, setting]) => {
                        console.log(`   - ${quiz}: enabled=${setting.enabled}, url=${setting.url}`);
                    });
                } else {
                    console.log('   - API response was not successful or had no data');
                }
            } catch (apiError) {
                console.error('   - API error:', apiError);
            }
        } else {
            console.error('   - IndexPage or APIService not available');
        }
        
        // Check DOM elements
        console.log('3. Checking DOM elements...');
        const guideButtons = document.querySelectorAll('.quiz-guide-button');
        console.log(`   - Found ${guideButtons.length} guide buttons`);
        
        guideButtons.forEach((btn, index) => {
            const quiz = btn.getAttribute('data-quiz');
            const url = btn.getAttribute('data-guide-url');
            const enabled = btn.getAttribute('data-guide-enabled');
            const href = btn.href;
            const display = btn.style.display;
            const visible = display !== 'none';
            
            console.log(`   - Button ${index + 1}: quiz=${quiz}, visible=${visible}, href=${href}, url=${url}, enabled=${enabled}`);
        });
        
        // Force reload guide settings
        console.log('4. Force reloading guide settings...');
        if (window.indexPage) {
            await window.indexPage.loadGuideSettingsAndAddButtons();
            console.log('   - Guide settings reloaded');
        }
        
        console.log('=== GUIDE BUTTON DEBUG COMPLETE ===');
        
    } catch (error) {
        console.error('Error during guide button debug:', error);
    }
};

window.logQuizNormalization = () => {
    if (indexPage) {
        indexPage.logQuizNameNormalization();
    } else {
        console.error('IndexPage not initialized');
    }
};

// Expose method to manually reload guide settings for testing
window.reloadGuideSettings = () => {
    if (indexPage) {
        console.log('Manually reloading guide settings...');
        return indexPage.loadGuideSettingsAndAddButtons();
    } else {
        console.error('IndexPage not initialized');
    }
}; 

// After IndexPage is initialized and window.indexPage is set
function restoreGuideButtonHrefs() {
    document.querySelectorAll('.quiz-guide-button').forEach(btn => {
        const url = btn.getAttribute('data-guide-url');
        if (url && btn.href !== url) {
            btn.href = url;
            btn.target = '_blank';
            btn.rel = 'noopener noreferrer';
        }
    });
}
