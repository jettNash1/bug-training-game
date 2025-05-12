import { APIService } from '../api-service.js';
import { QuizUser } from '../QuizUser.js';

function normalizeQuizName(quizName) {
    if (!quizName) return '';
    
    // Special case for tester-mindset variations
    if (typeof quizName === 'string' && quizName.toLowerCase().replace(/[_\s]/g, '-').includes('tester')) {
        return 'tester-mindset';
    }
    
    // If already kebab case, return as is
    if (typeof quizName === 'string' && quizName === quizName.toLowerCase() && quizName.includes('-')) {
        return quizName;
    }
    
    // Otherwise, standardize to kebab-case consistently
    return quizName
        .toLowerCase()
        .replace(/([A-Z])/g, '-$1')
        .replace(/_{1,}/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');
}

class IndexPage {
    constructor() {
        try {
            console.log('[Index] Initializing IndexPage');
            this.apiService = new APIService();
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
            // Log debug info about quiz IDs for troubleshooting
            console.log('[Index] Initializing with quiz items:', this.quizItems.length);
            
            // Load user progress first
            await this.loadUserProgress();
            
            // Update UI with loaded progress
            this.updateQuizProgress();
            this.updateCategoryProgress();
            this.addBadgesNavLink();
            
            // Debug quiz name normalization
            this.logQuizNameNormalization();
            
            // Load guide settings in a non-blocking way
            this.loadGuideSettingsAndAddButtons().catch(err => {
                console.error('[Index] Error loading guide settings:', err);
            });
        } catch (error) {
            console.error('[Index] Failed to initialize:', error);
        }
        
        // Always hide the loading overlay after initializing core functionality
        // even if guide buttons are still loading
        this.hideLoadingOverlay();
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

            // Get user data including quiz progress and results in a single call
            const userData = await this.apiService.getUserData();
            if (!userData.success) {
                throw new Error('Failed to load user data');
            }

            console.log('Raw user data:', userData);
            
            // Ensure we have the user data object
            if (!userData.data) {
                console.error('User data is missing');
                return;
            }

            // Extract quiz progress from user data
            let quizProgress = userData.data.quizProgress || {};
            let quizResults = userData.data.quizResults || [];

            // --- MIGRATION: Move any legacy tester-mindset keys to kebab-case ---
            const legacyKeys = Object.keys(quizProgress).filter(k => k.toLowerCase().replace(/[_\s]/g, '-').includes('tester') && k !== 'tester-mindset');
            legacyKeys.forEach(legacyKey => {
                if (!quizProgress['tester-mindset']) {
                    quizProgress['tester-mindset'] = quizProgress[legacyKey];
                }
                delete quizProgress[legacyKey];
            });
            quizResults = quizResults.map(result => {
                if (typeof result.quizName === 'string' && result.quizName.toLowerCase().replace(/[_\s]/g, '-').includes('tester') && result.quizName !== 'tester-mindset') {
                    return { ...result, quizName: 'tester-mindset' };
                }
                return result;
            });
            // --- END MIGRATION ---

            // --- Robust progress sync for legacy users ---
            for (const result of quizResults) {
                const quizName = normalizeQuizName(result.quizName);
                const progress = quizProgress[quizName];
                // If no progress or not completed, reconstruct and save
                if (!progress || progress.status !== 'completed') {
                    await this.apiService.saveQuizProgress(quizName, {
                        experience: result.experience,
                        questionsAnswered: result.questionsAnswered,
                        status: 'completed',
                        scorePercentage: result.score,
                        questionHistory: result.questionHistory || [],
                        lastUpdated: result.completedAt || new Date().toISOString()
                    });
                }
            }
            // --- End robust sync ---
            
            // Process all visible quizzes using the already fetched data
            this.quizScores = Array.from(this.quizItems)
                .map(item => {
                    const quizId = item.dataset.quiz;
                    if (!quizId) return null;
                    
                    // Normalize the quizId consistently
                    const lookupId = normalizeQuizName(quizId);
                    
                    // First check for quiz progress
                    const progress = quizProgress[lookupId];
                    
                    // Then check for quiz results
                    const result = quizResults.find(r => normalizeQuizName(r.quizName) === lookupId);
                    
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
                    console.log(`Processed data for quiz ${lookupId}:`, combinedData);
                    return combinedData;
                })
                .filter(Boolean);

            console.log('Processed quiz scores:', this.quizScores);
            return true;
        } catch (error) {
            console.error('Error loading user progress:', error);
            this.quizScores = [];
            return false;
        }
    }

    async updateQuizProgress() {
        if (!this.quizScores) return;
                
        this.quizItems.forEach(item => {
            const quizId = item.dataset.quiz;
            if (!quizId) return;
            
            const progressElement = document.getElementById(`${quizId}-progress`);
            if (!progressElement) return;
            
            // Use normalized quiz name for comparison
            const normalizedQuizId = normalizeQuizName(quizId);
            const quizScore = this.quizScores.find(score => normalizeQuizName(score.quizName) === normalizedQuizId);
            
            if (!quizScore) {
                // No score data - white background
                item.setAttribute('style', 'background-color: #FFFFFF !important; border: none !important;');
                progressElement.setAttribute('style', 'display: none !important;');
                return;
            }
            
            console.log(`Quiz ${quizId}: status=${quizScore.status}, questions=${quizScore.questionsAnswered}, scorePercentage=${quizScore.scorePercentage}, experience=${quizScore.experience}`);
            
            // Get the score percentage from the API response data
            // Make sure we're using the actual scorePercentage value, not defaulting to 0
            const scorePercentage = quizScore.scorePercentage !== undefined ? quizScore.scorePercentage : 0;

            if (quizScore.locked) {
                // Locked state - gray background with striped pattern
                item.classList.add('locked-quiz');
                progressElement.setAttribute('style', 'display: none !important;');
            } else if (quizScore.status === 'failed') {
                // Failed state - Light pink/salmon with thicker, darker border
                item.setAttribute('style', 'background-color: #FFCCCB !important; border: 2px solid #FFB6B6 !important; color: #000000 !important; border-radius: 12px !important;');
                progressElement.setAttribute('style', 'background-color: #FFCCCB !important; color: #000000 !important; display: block !important;');
                progressElement.textContent = `${scorePercentage}%`;
            } else if (quizScore.questionsAnswered === 15) {
                // Completed quiz - color based on score percentage
                if (scorePercentage >= 70) {
                    // >=70% - Light Green with thicker, darker border
                    item.setAttribute('style', 'background-color: #90EE90 !important; border: 2px solid #70CF70 !important; color: #000000 !important; border-radius: 12px !important;');
                    progressElement.setAttribute('style', 'background-color: #90EE90 !important; color: #000000 !important; display: block !important;');
                } else if (scorePercentage >= 50) {
                    // 50-69% - Yellow with thicker, darker border
                    item.setAttribute('style', 'background-color: #F0D080 !important; border: 2px solid #E0B060 !important; color: #000000 !important; border-radius: 12px !important;');
                    progressElement.setAttribute('style', 'background-color: #F0D080 !important; color: #000000 !important; display: block !important;');
                } else {
                    // <50% - Red with thicker, darker border
                    item.setAttribute('style', 'background-color: #FFCCCB !important; border: 2px solid #FFB6B6 !important; color: #000000 !important; border-radius: 12px !important;');
                    progressElement.setAttribute('style', 'background-color: #FFCCCB !important; color: #000000 !important; display: block !important;');
                }
                progressElement.textContent = `${scorePercentage}%`;
            } else if (quizScore.questionsAnswered > 0) {
                // In progress - Light Yellow with thicker, darker border
                item.setAttribute('style', 'background-color: #FFFFCC !important; border: 2px solid #EEEEAA !important; color: #000000 !important; border-radius: 12px !important;');
                progressElement.setAttribute('style', 'background-color: #FFFFCC !important; color: #000000 !important; display: block !important;');
                progressElement.textContent = `${quizScore.questionsAnswered}/15`;
            } else {
                // Not started - White/cream with thicker, darker border
                item.setAttribute('style', 'background-color: #FFF8E7 !important; border: 2px solid #EEE8D7 !important; color: #000000 !important; border-radius: 12px !important;');
                progressElement.setAttribute('style', 'display: none !important;');
                progressElement.textContent = '';
            }
        });
    }

    updateCategoryProgress() {
        if (!this.quizScores) return;

        // Prepare all category updates
        const updates = new Map();
        
        document.querySelectorAll('.category-card').forEach(category => {
            const quizItems = category.querySelectorAll('.quiz-item:not(.locked-quiz)');
            const visibleQuizItems = Array.from(quizItems).filter(item => item.classList.contains('quiz-hidden') === false);
            const progressBar = category.querySelector('.progress-fill');
            const progressText = category.querySelector('.progress-text');
            
            // Hide the category if there are no visible quizzes
            if (visibleQuizItems.length === 0) {
                category.style.display = 'none';
                return;
            } else {
                category.style.display = '';
            }

            if (!progressBar || !progressText) return;

            const categoryStats = visibleQuizItems.reduce((stats, item) => {
                const quizId = item.dataset.quiz;
                // Use normalized quiz ID consistently
                const normalizedQuizId = normalizeQuizName(quizId);
                const quizScore = this.quizScores.find(score => normalizeQuizName(score.quizName) === normalizedQuizId);
                
                // Count as completed if all 15 questions are answered, regardless of status
                const isCompleted = quizScore && quizScore.questionsAnswered >= 15;
                
                return {
                    completedQuizzes: stats.completedQuizzes + (isCompleted ? 1 : 0),
                    totalProgress: stats.totalProgress + (isCompleted ? 100 : 0)
                };
            }, { completedQuizzes: 0, totalProgress: 0 });

            const totalQuizzes = visibleQuizItems.length;
            // Calculate percentage based on completed quizzes instead of total progress
            const categoryPercentage = Math.round((categoryStats.completedQuizzes / totalQuizzes) * 100);

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
            // Get all visible quiz items
            const visibleQuizItems = Array.from(this.quizItems).filter(
                item => !item.classList.contains('quiz-hidden') && !item.classList.contains('locked-quiz')
            );
            
            if (visibleQuizItems.length === 0) {
                console.log('[Index] No visible quiz items found');
                return;
            }
            
            // Add styles for guide buttons if not already present
            if (!document.getElementById('guide-button-styles')) {
                const styles = document.createElement('style');
                styles.id = 'guide-button-styles';
                styles.textContent = `
                    .quiz-guide-button {
                        background-color: #4e73df;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        padding: 8px 16px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        display: inline-block;
                        text-decoration: none;
                        transition: all 0.2s ease;
                        text-align: center;
                    }
                    .quiz-guide-button:hover {
                        background-color: #3867d6;
                        text-decoration: none;
                        color: white;
                    }
                    .quiz-guide-button:focus {
                        outline: 2px solid #4e73df;
                        outline-offset: 2px;
                    }
                    .quiz-item {
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        padding: 16px;
                        min-height: 180px; /* Increased to accommodate the button */
                        background: #fff;
                        border-radius: 8px;
                        justify-content: space-between;
                    }
                    .quiz-item .quiz-info {
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                    }
                    .quiz-item .quiz-info > div:first-child {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .quiz-item .quiz-icon {
                        font-size: 20px;
                        flex-shrink: 0;
                        display: flex;
                        align-items: center;
                    }
                    .quiz-item .quiz-title {
                        font-size: 16px;
                        font-weight: 600;
                        color: #2c3e50;
                        margin: 0;
                        line-height: 1.4;
                    }
                    .quiz-item .quiz-description {
                        color: #666;
                        font-size: 14px;
                        line-height: 1.4;
                        margin: 8px 0 12px 28px;
                    }
                    .guide-button-container {
                        display: flex;
                        justify-content: center;
                        width: 100%;
                        margin-top: 16px;
                        padding-top: 8px;
                    }
                    .quiz-completion {
                        position: absolute;
                        top: 12px;
                        right: 12px;
                        font-size: 12px;
                        font-weight: 500;
                        padding: 3px 8px;
                        border-radius: 4px;
                        background: rgba(0,0,0,0.08);
                    }
                    .category-card {
                        background: white;
                        border-radius: 8px;
                        padding: 16px;
                        margin-bottom: 24px;
                    }
                    .category-header {
                        font-size: 18px;
                        font-weight: 600;
                        color: #1a202c;
                        margin-bottom: 16px;
                        padding: 12px 16px;
                        background: #2c3e50;
                        color: white;
                        border-radius: 6px;
                    }
                    .quiz-list {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                        gap: 16px;
                        padding: 0 8px;
                    }
                    /* Media query for smaller screens */
                    @media (max-width: 768px) {
                        .quiz-item {
                            min-height: 200px;
                        }
                        .guide-button-container {
                            margin-top: 12px;
                        }
                    }
                `;
                document.head.appendChild(styles);
            }
            
            // Fetch all guide settings in a single call
            try {
                const response = await this.apiService.getGuideSettings();
                if (response && response.success && response.data) {
                    console.log('[Index] Fetched all guide settings:', response.data);
                    
                    // Process each visible quiz item
                    visibleQuizItems.forEach(item => {
                        const quizId = item.dataset.quiz;
                        if (!quizId) return;
                        
                        // Check if guide is enabled for this quiz
                        const guideSettings = response.data[quizId];
                        if (guideSettings && guideSettings.enabled && guideSettings.url) {
                            console.log(`[Index] Guide button enabled for quiz ${quizId} with URL: ${guideSettings.url}`);
                            this.addGuideButtonToQuizItem(item, quizId, guideSettings.url);
                        } else {
                            console.log(`[Index] Guide button not enabled for quiz ${quizId}`);
                            const existingButton = item.querySelector(`.quiz-guide-button[data-quiz-id="${quizId}"]`);
                            if (existingButton) {
                                existingButton.remove();
                            }
                        }
                    });
                } else {
                    console.warn('[Index] Failed to fetch guide settings:', response);
                }
            } catch (error) {
                console.error('[Index] Error fetching all guide settings:', error);
            }
            
            console.log('[Index] Finished setting up guide buttons');
        } catch (error) {
            console.error('[Index] Error in guide button setup:', error);
        }
    }
    
    addGuideButtonToQuizItem(quizItem, quizId, guideUrl) {
        // Remove any existing guide button for this quiz
        const existingButton = quizItem.querySelector(`.quiz-guide-button[data-quiz-id="${quizId}"]`);
        if (existingButton) {
            existingButton.remove();
        }
        
        console.log(`[Index] Adding guide button to quiz item: ${quizId}`);
        
        // Create button
        const guideButton = document.createElement('a');
        guideButton.className = 'quiz-guide-button';
        guideButton.textContent = 'Guide';
        guideButton.href = guideUrl;
        guideButton.target = '_blank';
        guideButton.setAttribute('data-quiz-id', quizId);
        guideButton.setAttribute('aria-label', `Open guide for ${quizId}`);
        guideButton.setAttribute('tabindex', '0');
        
        // Create a container for the guide button
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'guide-button-container';
        buttonContainer.appendChild(guideButton);
        
        // Remove any existing guide button container
        const existingContainer = quizItem.querySelector('.guide-button-container');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        // Add the button container at the end of the quiz item
        quizItem.appendChild(buttonContainer);
    }

    // Debug helper method to check quiz name normalization
    logQuizNameNormalization() {
        console.group('Quiz Name Normalization Check');
        
        // Log all quiz items in the DOM
        this.quizItems.forEach(item => {
            const quizId = item.dataset.quiz;
            if (!quizId) return;
            
            const normalized = normalizeQuizName(quizId);
            console.log(`Quiz ID: "${quizId}" → Normalized: "${normalized}"`);
        });
        
        if (this.quizScores) {
            console.log('----- Quiz Scores in Memory -----');
            this.quizScores.forEach(score => {
                const quizName = score.quizName;
                const normalized = normalizeQuizName(quizName);
                console.log(`Score name: "${quizName}" → Normalized: "${normalized}" (Questions: ${score.questionsAnswered})`);
            });
        }
        
        console.groupEnd();
    }
}

// Initialize the index page when the DOM is loaded
let indexPage;
document.addEventListener('DOMContentLoaded', () => {
    indexPage = new IndexPage();
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