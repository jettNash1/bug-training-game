import { APIService } from '../api-service.js';
import { QuizUser } from '../QuizUser.js';
import { QuizProgressService } from '../services/QuizProgressService.js';
import { QuizList } from '../quiz-list.js';

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

function autoRefreshIndexOnFocus() {
    let wasInactive = false;
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            wasInactive = true;
        } else if (document.visibilityState === 'visible' && wasInactive) {
            // Page is now visible after being inactive
            console.log('[Index] Page became visible after being inactive, refreshing quiz progress');
            wasInactive = false;
            
            // Refresh the page data when coming back to the index
            if (window.indexPage) {
                window.indexPage.refreshAllQuizProgress();
            }
        }
    });
    
    // Also check for window focus events as a backup
    window.addEventListener('focus', () => {
        if (wasInactive) {
            console.log('[Index] Window regained focus after being inactive, refreshing quiz progress');
            wasInactive = false;
            
            // Refresh the page data when coming back to the index
            if (window.indexPage) {
                window.indexPage.refreshAllQuizProgress();
            }
        }
    });
    
    window.addEventListener('blur', () => {
        wasInactive = true;
    });
}

function clearAllQuizProgress() {
    const username = localStorage.getItem('username');
    if (!username) return false;
    
    console.log('[Index] Clearing all quiz progress for emergency reset');
    
    // Get all localStorage keys related to quiz progress
    const progressKeys = Object.keys(localStorage).filter(key => 
        key.includes('quiz_progress') && key.includes(username)
    );
    
    // Log the keys we're about to clear
    console.log('[Index] Found these quiz progress keys to clear:', progressKeys);
    
    // Clear all quiz progress keys
    progressKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`[Index] Cleared localStorage key: ${key}`);
    });
    
    // Also clear session storage
    try {
        const sessionKeys = Object.keys(sessionStorage).filter(key => 
            key.includes('quiz_progress') && key.includes(username)
        );
        
        sessionKeys.forEach(key => {
            sessionStorage.removeItem(key);
            console.log(`[Index] Cleared sessionStorage key: ${key}`);
        });
    } catch (e) {
        console.error('[Index] Error clearing sessionStorage:', e);
    }
    
    console.log('[Index] All quiz progress cleared. Page will reload.');
    
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
            console.log('[Index] Initializing IndexPage');
            this.user = new QuizUser(localStorage.getItem('username'));
            this.quizItems = document.querySelectorAll('.quiz-item:not(.locked-quiz)');
            
            // Show loading overlay first
            this.showLoadingOverlay();
            
            // Set a backup timeout to ensure the loading overlay is hidden after a maximum time
            // This prevents the page from getting stuck in loading state
            this.loadingTimeout = setTimeout(() => {
                console.log('[Index] Loading timeout reached - forcing loading overlay removal');
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
            console.log('[Index] Starting initialization');
            
            // Show loading overlay
            this.showLoadingOverlay();
            
            // Initialize API service
            this.apiService = new APIService();
            
            // Initialize quiz list
            this.quizList = new QuizList();
            await this.quizList.init();
            
            // Get quiz items after they are created
            this.quizItems = document.querySelectorAll('.quiz-item');
            console.log(`[Index] Found ${this.quizItems.length} quiz items`);
            
            // Load user progress and update UI
            await this.loadUserProgress();
            this.updateQuizProgress();
            this.updateCategoryProgress();
            
            // Add badges UI element (only call one method)
            this.addBadgesNavLink();
            
            // Load guide settings and add buttons after quiz items are created
            await this.loadGuideSettingsAndAddButtons();
            
            // Hide loading overlay
            this.hideLoadingOverlay();
            
            console.log('[Index] Initialization complete');
        } catch (error) {
            console.error('[Index] Error during initialization:', error);
            this.hideLoadingOverlay();
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

            console.log('[Index] Loading all quiz progress data');

            // Use the QuizProgressService to get all quiz progress in a single call
            const progressResult = await this.quizProgressService.getAllQuizProgress();
            
            if (!progressResult.success || !progressResult.data) {
                console.error('[Index] Failed to load quiz progress:', progressResult.message);
                return false;
            }
            
            const quizProgress = progressResult.data;
            console.log('[Index] Loaded progress for', Object.keys(quizProgress).length, 'quizzes');
            
            // Get quiz results separately from API
            let quizResults = [];
            try {
                const userData = await this.apiService.getUserData();
                if (userData.success && userData.data && userData.data.quizResults) {
                    quizResults = userData.data.quizResults;
                    console.log('[Index] Loaded', quizResults.length, 'quiz results');
                }
            } catch (error) {
                console.warn('[Index] Error loading quiz results:', error);
            }
            
            console.log('[Index] Final quiz progress after all checks:', quizProgress);
            
            // Process all visible quizzes using the already fetched data
            this.quizScores = Array.from(this.quizItems)
                .map(item => {
                    const quizId = item.dataset.quiz;
                    if (!quizId) return null;
                    
                    // Normalize the quizId consistently using the service
                    const lookupId = this.quizProgressService.normalizeQuizName(quizId);
                    
                    // First check for quiz progress
                    const progress = quizProgress[lookupId];
                    
                    // Then check for quiz results
                    const result = quizResults.find(r => 
                        this.quizProgressService.normalizeQuizName(r.quizName) === lookupId
                    );
                    
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
                    }
                    
                    // Apply progress data if available (overrides result data)
                    if (progress) {
                        combinedData.questionsAnswered = progress.questionsAnswered || 0;
                        combinedData.status = progress.status || 'not-started';
                        combinedData.tools = progress.tools || [];
                        combinedData.questionHistory = progress.questionHistory || [];
                        
                        if (progress.scorePercentage !== undefined) {
                            combinedData.scorePercentage = progress.scorePercentage;
                        }
                        if (progress.experience !== undefined) {
                            combinedData.experience = progress.experience;
                        }
                    }
                    
                    console.log(`[Index] Processed data for quiz ${lookupId}:`, combinedData);
                    return combinedData;
                })
                .filter(Boolean);

            console.log('[Index] All processed quiz scores:', this.quizScores);
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
        
        console.log(`[Index] Updating UI for ${this.quizItems.length} quiz items with ${this.quizScores.length} quiz scores`);
                
        this.quizItems.forEach(item => {
            const quizId = item.dataset.quiz;
            if (!quizId) {
                console.warn('[Index] Quiz item missing data-quiz attribute');
                return;
            }
            
            const progressElement = document.getElementById(`${quizId}-progress`);
            if (!progressElement) {
                console.warn(`[Index] Progress element not found for quiz: ${quizId}`);
                return;
            }
            
            // Use normalized quiz name from the service for consistent comparison
            const normalizedQuizId = this.quizProgressService.normalizeQuizName(quizId);
            console.log(`[Index] Looking for quiz score for ${normalizedQuizId}`);
            
            // Find score with accurate matching using the service
            const quizScore = this.quizScores.find(score => 
                this.quizProgressService.normalizeQuizName(score.quizName) === normalizedQuizId
            );
            
            if (!quizScore) {
                // No score data - white background
                console.log(`[Index] No score found for quiz: ${normalizedQuizId}`);
                // Preserve guide buttons by only updating background and border
                const existingStyle = item.getAttribute('style') || '';
                const newStyle = existingStyle
                    .split(';')
                    .filter(s => !s.includes('background-color') && !s.includes('border'))
                    .join(';');
                item.setAttribute('style', `${newStyle}; background-color: #FFFFFF !important; border: none !important;`);
                progressElement.setAttribute('style', 'display: none !important;');
                return;
            }
            
            // Update progress display
            const questionsAnswered = quizScore.questionsAnswered || 0;
            const score = quizScore.score || 0;
            
            // Determine quiz status and styling
            let statusClass = 'not-started';
            let progressText = '';
            
            if (questionsAnswered === 15) {
                if (score >= 80) {
                    statusClass = 'completed-perfect';
                    progressText = '15/15';
                } else {
                    statusClass = 'completed-partial';
                    progressText = '15/15';
                }
            } else if (questionsAnswered > 0) {
                statusClass = 'in-progress';
                progressText = `${questionsAnswered}/15`;
            }
            
            // Update the quiz item's status class
            item.classList.remove('not-started', 'in-progress', 'completed-partial', 'completed-perfect');
            item.classList.add(statusClass);
            
            // Update progress text
            progressElement.textContent = progressText;
            progressElement.style.display = progressText ? '' : 'none';
        });
    }

    updateCategoryProgress() {
        if (!this.quizScores || !Array.isArray(this.quizScores) || this.quizScores.length === 0) {
            console.warn('[Index] No quiz scores available for updating category progress');
            return;
        }

        console.log('[Index] Updating category progress displays');
        
        document.querySelectorAll('.category-card').forEach(category => {
            const quizItems = category.querySelectorAll('.quiz-item:not(.locked-quiz)');
            const visibleQuizItems = Array.from(quizItems).filter(item => item.classList.contains('quiz-hidden') === false);
            const progressBar = category.querySelector('.progress-fill');
            const progressText = category.querySelector('.progress-text');
            
            // Get category name for logging
            const categoryName = category.querySelector('.category-header')?.textContent?.trim() || 'Unknown Category';
            
            // Hide the category if there are no visible quizzes
            if (visibleQuizItems.length === 0) {
                console.log(`[Index] Hiding empty category: ${categoryName}`);
                category.style.display = 'none';
                return;
            } else {
                console.log(`[Index] Showing category: ${categoryName} with ${visibleQuizItems.length} visible quizzes`);
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
                
                if (isCompleted) {
                    console.log(`[Index] Quiz ${normalizedQuizId} is completed (${quizScore.questionsAnswered}/15)`);
                }
                
                return {
                    completedQuizzes: stats.completedQuizzes + (isCompleted ? 1 : 0),
                    totalProgress: stats.totalProgress + (isCompleted ? 100 : 0)
                };
            }, { completedQuizzes: 0, totalProgress: 0 });

            const totalQuizzes = visibleQuizItems.length;
            // Calculate percentage based on completed quizzes instead of total progress
            const categoryPercentage = Math.round((categoryStats.completedQuizzes / totalQuizzes) * 100);

            console.log(`[Index] Category ${categoryName}: ${categoryStats.completedQuizzes}/${totalQuizzes} completed (${categoryPercentage}%)`);

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
        
        console.log('[Index] Category progress display updated');
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
        
        // Check if badges button already exists
        if (headerRightSection.querySelector('a[href="badges.html"]')) {
            return;
        }
        
        // Create the badges button with styling to match the logout button but in blue
        const badgesButton = document.createElement('a');
        badgesButton.href = 'badges.html';
        badgesButton.className = 'badges-button';
        badgesButton.innerHTML = '<i class="fa-solid fa-award"></i> Badges';
        
        // Insert before the logout button
        headerRightSection.insertBefore(badgesButton, logoutButton);
        
        // Add Font Awesome if not already included
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
        
        // Add the CSS for the badges button to match the layout in the screenshot
        if (!document.getElementById('badges-button-style')) {
            const style = document.createElement('style');
            style.id = 'badges-button-style';
            style.textContent = `
                .badges-button {
                    background-color: var(--primary-color, #4a90e2);
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
                
                .badges-button:hover {
                    background-color: var(--primary-color-dark, #3a80d2);
                    color: white;
                }
                
                .badges-button i {
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
        // Check if badges button already exists
        if (element.querySelector('a[href="badges.html"]')) {
            return;
        }
        
        // Create the badges button
        const badgesButton = document.createElement('a');
        badgesButton.href = 'badges.html';
        badgesButton.className = 'badges-button';
        badgesButton.innerHTML = '<i class="fa-solid fa-award"></i> Badges';
        
        // Find the logout button if it exists in this element
        const logoutButton = element.querySelector('a.logout-button, button.logout-button, a[onclick*="handleLogout"]');
        
        if (logoutButton) {
            // Insert before the logout button
            element.insertBefore(badgesButton, logoutButton);
        } else {
            // Add to the beginning of the element
            element.prepend(badgesButton);
        }
        
        // Ensure styles are added
        if (!document.getElementById('badges-button-style')) {
            const style = document.createElement('style');
            style.id = 'badges-button-style';
            style.textContent = `
                .badges-button {
                    background-color: var(--primary-color, #4a90e2);
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
                
                .badges-button:hover {
                    background-color: var(--primary-color-dark, #3a80d2);
                    color: white;
                }
                
                .badges-button i {
                    margin-right: 6px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    async loadGuideSettingsAndAddButtons() {
        console.log('[Index] Loading guide settings for quiz items');
        
        try {
            // Get guide settings from API
            const response = await this.apiService.fetchGuideSettings();
            console.log('[Index] Guide settings response:', response);
            
            // Get all guide buttons
            this.quizItems.forEach(item => {
                const quizId = item.dataset.quiz;
                if (!quizId) return;
                
                const guideButton = item.querySelector('.quiz-guide-button');
                if (!guideButton) return;
                
                // Get guide settings for this quiz
                const guideSetting = response?.data?.[quizId.toLowerCase()] || {};
                const hasValidUrl = guideSetting.url && guideSetting.enabled;
                
                // Update button state
                if (hasValidUrl) {
                    guideButton.removeAttribute('disabled');
                    guideButton.title = 'Click to view guide';
                    
                    // Add click handler
                    const handleClick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(guideSetting.url, '_blank');
                    };
                    
                    // Remove old handler if exists
                    guideButton.removeEventListener('click', handleClick);
                    guideButton.addEventListener('click', handleClick);
                } else {
                    guideButton.setAttribute('disabled', 'true');
                    guideButton.title = 'Guide not available';
                }
            });
            
            console.log('[Index] Guide buttons updated');
        } catch (error) {
            console.error('[Index] Error loading guide settings:', error);
        }
    }

    // Debug helper method to check quiz name normalization
    logQuizNameNormalization() {
        console.group('Quiz Name Normalization Check');
        
        // Log all quiz items in the DOM
        this.quizItems.forEach(item => {
            const quizId = item.dataset.quiz;
            if (!quizId) return;
            
            const normalized = this.quizProgressService.normalizeQuizName(quizId);
            console.log(`Quiz ID: "${quizId}" → Normalized: "${normalized}"`);
        });
        
        if (this.quizScores) {
            console.log('----- Quiz Scores in Memory -----');
            this.quizScores.forEach(score => {
                const quizName = score.quizName;
                const normalized = this.quizProgressService.normalizeQuizName(quizName);
                console.log(`Score name: "${quizName}" → Normalized: "${normalized}" (Questions: ${score.questionsAnswered})`);
            });
        }
        
        console.groupEnd();
    }

    async refreshAllQuizProgress() {
        console.log('[Index] Refreshing all quiz progress');
        
        try {
            // Update quiz progress
            await this.loadUserProgress();
            this.updateQuizProgress();
            this.updateCategoryProgress();
            
            // Remove any existing guide buttons first
            this.quizItems.forEach(item => {
                const guideButton = item.querySelector('.quiz-guide-button');
                if (guideButton) {
                    guideButton.remove();
                }
            });
            
            // Load fresh guide settings from API and add buttons
            await this.loadGuideSettingsAndAddButtons();
            
            console.log('[Index] Quiz progress and guide buttons refresh complete');
        } catch (error) {
            console.error('[Index] Error during quiz progress refresh:', error);
        }
    }
}

// Initialize the index page when the DOM is loaded
let indexPage;
document.addEventListener('DOMContentLoaded', () => {
    // Create the QuizProgressService globally for consistency across the app
    window.quizProgressService = new QuizProgressService();
    
    indexPage = new IndexPage();
    
    // Store in window for global access and auto-refresh functionality
    window.indexPage = indexPage;
    
    // Initialize auto-refresh functionality
    autoRefreshIndexOnFocus();
    
    console.log('[Index] Initialization complete, auto-refresh for quiz progress is active');
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