import { APIService } from '../api-service.js';
import { QuizUser } from '../QuizUser.js';

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
            // Load user progress first
            await this.loadUserProgress();
            
            // Update UI with loaded progress
            this.updateQuizProgress();
            this.updateCategoryProgress();
            this.addBadgesNavLink();
            
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

            // Get user data including hidden quizzes
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

            const isInterviewAccount = userData.data.userType === 'interview_candidate';
            const allowedQuizzes = userData.data.allowedQuizzes || [];
            const hiddenQuizzes = userData.data.hiddenQuizzes || [];

            console.log('Quiz visibility check:', {
                username,
                isInterviewAccount,
                userType: userData.data.userType,
                allowedQuizzes,
                hiddenQuizzes,
                totalQuizzes: this.quizItems.length
            });

            // If allowedQuizzes has entries, only show those quizzes
            const useWhitelist = allowedQuizzes.length > 0;

            // First, hide all quizzes and categories
            document.querySelectorAll('.category-card').forEach(card => {
                card.classList.add('quiz-hidden');
            });
            this.quizItems.forEach(item => {
                item.classList.add('quiz-hidden');
            });

            // Track visible quizzes per category
            const categoryVisibility = new Map();

            // First pass: Check quiz visibility and track per category
            const progressPromises = Array.from(this.quizItems).map(async item => {
                const quizId = item.dataset.quiz;
                const quizLower = quizId.toLowerCase();
                const categoryCard = item.closest('.category-card');
                const categoryName = categoryCard ? categoryCard.querySelector('.category-header').textContent.trim() : null;

                // Debug each quiz visibility decision
                console.log(`Checking visibility for quiz ${quizId}:`, {
                    quizLower,
                    useWhitelist,
                    isAllowed: allowedQuizzes.includes(quizLower),
                    isHidden: hiddenQuizzes.includes(quizLower),
                    category: categoryName
                });

                let isVisible = false;
                // If using whitelist (allowedQuizzes has entries), only show allowed quizzes
                if (useWhitelist) {
                    isVisible = allowedQuizzes.includes(quizLower);
                } else {
                    isVisible = !hiddenQuizzes.includes(quizLower);
                }

                // Apply visibility using CSS classes
                if (isVisible) {
                    console.log(`Showing quiz ${quizId}`);
                    item.classList.remove('quiz-hidden');
                    if (categoryCard) {
                        categoryCard.classList.remove('quiz-hidden');
                    }
                } else {
                    console.log(`Hiding quiz ${quizId} - ${useWhitelist ? 'not in allowed list' : 'in hidden list'}`);
                    item.classList.add('quiz-hidden');
                }

                // Track category visibility
                if (categoryName) {
                    if (!categoryVisibility.has(categoryName)) {
                        categoryVisibility.set(categoryName, []);
                    }
                    categoryVisibility.get(categoryName).push(isVisible);
                }

                // Continue with progress checking only for visible quizzes
                if (!isVisible) return null;

                try {
                    // Get the saved progress
                    const savedProgress = await this.apiService.getQuizProgress(quizId);
                    const progress = savedProgress?.data;

                    if (!progress) {
                        return { 
                            quizName: quizId, 
                            score: 0, 
                            questionsAnswered: 0, 
                            status: 'in-progress',
                            experience: 0
                        };
                    }

                    return {
                        quizName: quizId,
                        score: progress.score || 0,
                        questionsAnswered: progress.questionsAnswered || 0,
                        status: progress.status || 'in-progress',
                        experience: progress.experience || 0
                    };
                } catch (error) {
                    console.error(`Error loading progress for quiz ${quizId}:`, error);
                    return { 
                        quizName: quizId, 
                        score: 0, 
                        questionsAnswered: 0, 
                        status: 'in-progress',
                        experience: 0
                    };
                }
            });

            // Second pass: Hide categories with no visible quizzes
            document.querySelectorAll('.category-card').forEach(categoryCard => {
                const categoryName = categoryCard.querySelector('.category-header').textContent.trim();
                const visibleQuizzes = categoryVisibility.get(categoryName) || [];
                const hasVisibleQuizzes = visibleQuizzes.some(isVisible => isVisible);
                
                console.log(`Category visibility check: ${categoryName}`, {
                    visibleQuizzes,
                    hasVisibleQuizzes
                });

                if (!hasVisibleQuizzes) {
                    console.log(`Hiding category: ${categoryName}`);
                    categoryCard.classList.add('quiz-hidden');
                }
            });

            // Wait for all progress data to load
            this.quizScores = (await Promise.all(progressPromises)).filter(Boolean);
            console.log('Loaded quiz scores:', this.quizScores);

            // Force a repaint to ensure visibility changes are applied
            document.body.style.display = 'none';
            document.body.offsetHeight; // Force reflow
            document.body.style.display = '';

            return true;
        } catch (error) {
            console.error('Error loading user progress:', error);
            this.quizScores = [];
            return false;
        }
    }

    updateQuizProgress() {
        if (!this.quizScores) return;
        
        console.log("All quiz scores:", JSON.stringify(this.quizScores, null, 2));
        
        this.quizItems.forEach(item => {
            const quizId = item.dataset.quiz;
            if (!quizId) return;
            
            const progressElement = document.getElementById(`${quizId}-progress`);
            if (!progressElement) return;
            
            const quizScore = this.quizScores.find(score => score.quizName === quizId);
            if (!quizScore) {
                // No score data - white background
                item.setAttribute('style', 'background-color: #FFFFFF !important; border: none !important;');
                progressElement.setAttribute('style', 'display: none !important;');
                return;
            }
            
            console.log(`Quiz ${quizId}: status=${quizScore.status}, questions=${quizScore.questionsAnswered}, score=${quizScore.score}, exp=${quizScore.experience}`);
            
            // Debug: Check if this should be a perfect score
            const isPerfect = quizScore.questionsAnswered === 15 && quizScore.score === 100 && quizScore.experience >= 300;
            console.log(`${quizId} isPerfect=${isPerfect}, conditions: questionsAnswered=${quizScore.questionsAnswered}===15, score=${quizScore.score}===100, experience=${quizScore.experience}>=300`);
            
            // Handle the four different states
            if (quizScore.locked) {
                // Locked state - gray background with striped pattern
                item.classList.add('locked-quiz');
                progressElement.setAttribute('style', 'display: none !important;');
            } else if (quizScore.status === 'failed' && quizScore.questionsAnswered < 15) {
                // Failed state - Light pink/salmon with thicker, darker border
                console.log(`Failed quiz: ${quizId}`);
                
                // Apply styles directly with setAttribute
                item.setAttribute('style', 'background-color: #FFCCCB !important; border: 2px solid #FFB6B6 !important; color: #000000 !important; pointer-events: none !important; border-radius: 12px !important;');
                item.setAttribute('aria-disabled', 'true');
                
                progressElement.setAttribute('style', 'background-color: #FFCCCB !important; color: #000000 !important; display: block !important;');
                progressElement.textContent = `${quizScore.questionsAnswered}/15`;
            } else if (quizScore.questionsAnswered === 15) {
                // Completed all questions
                if (quizScore.experience >= 300) {
                    // Perfect score - Light Green with thicker, darker border
                    console.log(`Perfect score in index.js: experience=${quizScore.experience} >= 300`);
                    
                    // Apply styles directly with setAttribute
                    item.setAttribute('style', 'background-color: #90EE90 !important; border: 2px solid #70CF70 !important; color: #000000 !important; border-radius: 12px !important;');
                    
                    progressElement.setAttribute('style', 'background-color: #90EE90 !important; color: #000000 !important; display: block !important;');
                } else {
                    // Not perfect - More faded Dark Yellow with thicker, darker border
                    console.log(`Not perfect score in index.js: experience=${quizScore.experience} < 300`);
                    
                    // Apply styles directly with setAttribute
                    item.setAttribute('style', 'background-color: #F0D080 !important; border: 2px solid #E0B060 !important; color: #000000 !important; border-radius: 12px !important;');
                    
                    progressElement.setAttribute('style', 'background-color: #F0D080 !important; color: #000000 !important; display: block !important;');
                }
                progressElement.textContent = '15/15';
            } else if (quizScore.questionsAnswered > 0) {
                // In progress - Light Yellow with thicker, darker border
                console.log(`In progress in index.js: questions=${quizScore.questionsAnswered}`);
                
                // Apply styles directly with setAttribute
                item.setAttribute('style', 'background-color: #FFFFCC !important; border: 2px solid #EEEEAA !important; color: #000000 !important; border-radius: 12px !important;');
                
                progressElement.setAttribute('style', 'background-color: #FFFFCC !important; color: #000000 !important; display: block !important;');
                progressElement.textContent = `${quizScore.questionsAnswered}/15`;
            } else {
                // Not started - White/cream with thicker, darker border
                console.log(`Not started in index.js: questions=${quizScore.questionsAnswered}`);
                
                // Apply styles directly with setAttribute
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
                const quizScore = this.quizScores.find(score => score.quizName === quizId);
                
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
                        padding: 6px 12px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        margin: 8px auto 5px;
                        display: block;
                        text-align: center;
                        text-decoration: none;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                        transition: all 0.2s ease;
                        width: fit-content;
                        min-width: 80px;
                        position: relative;
                        z-index: 2;
                    }
                    .quiz-guide-button:hover {
                        background-color: #3867d6;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                        text-decoration: none;
                        color: white;
                    }
                    .quiz-guide-button:focus {
                        outline: 2px solid #3867d6;
                        text-decoration: none;
                        color: white;
                    }
                    .quiz-item {
                        position: relative;
                        display: flex;
                        flex-direction: column;
                    }
                    .quiz-item .quiz-info {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                    }
                    .quiz-item .quiz-icon {
                        display: inline-flex;
                        align-items: center;
                        margin-right: 8px;
                    }
                    .quiz-item .quiz-title {
                        display: inline-flex;
                        align-items: center;
                        font-weight: 500;
                    }
                    .quiz-item .quiz-info {
                        display: flex;
                        flex-direction: column;
                    }
                    .quiz-item .quiz-info > div:first-child {
                        display: flex;
                        align-items: center;
                        margin-bottom: 4px;
                    }
                    .quiz-item .quiz-description {
                        margin-top: 4px;
                        margin-bottom: 8px;
                        margin-left: calc(1.5em + 8px); /* Icon width + margin */
                    }
                    .guide-button-container {
                        width: 100%;
                        text-align: center;
                        margin-top: auto;
                        padding-top: 10px;
                    }
                `;
                document.head.appendChild(styles);
            }
            
            // Use Promise.allSettled instead of awaiting each request to prevent one failure from blocking everything
            const guidePromises = visibleQuizItems.map(item => {
                const quizId = item.dataset.quiz;
                if (!quizId) return Promise.resolve();
                
                // Add a timeout to prevent hanging if the API call takes too long
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout fetching guide settings')), 5000)
                );
                
                // Race the API call against the timeout
                return Promise.race([
                    this.apiService.fetchGuideSettings(quizId)
                        .then(response => {
                            if (response && response.success && response.data && response.data.enabled && response.data.url) {
                                console.log(`[Index] Guide button enabled for quiz ${quizId} with URL: ${response.data.url}`);
                                this.addGuideButtonToQuizItem(item, quizId, response.data.url);
                            } else {
                                console.log(`[Index] Guide button not enabled for quiz ${quizId}`);
                                const existingButton = item.querySelector(`.quiz-guide-button[data-quiz-id="${quizId}"]`);
                                if (existingButton) {
                                    existingButton.remove();
                                }
                            }
                        }),
                    timeoutPromise
                ]).catch(error => {
                    console.error(`[Index] Error fetching guide settings for quiz ${quizId}:`, error);
                    // Continue with other quizzes even if this one fails
                });
            });
            
            // Wait for all guide settings to be processed, but don't let failures block the UI
            await Promise.allSettled(guidePromises);
            
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
        
        // Create a container for the guide button
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'guide-button-container';
        buttonContainer.appendChild(guideButton);
        
        // Find the quiz info container
        const quizInfo = quizItem.querySelector('.quiz-info');
        if (quizInfo) {
            // Add the button container after the quiz info
            quizInfo.appendChild(buttonContainer);
        } else {
            // Fallback: append to quiz item
            quizItem.appendChild(buttonContainer);
        }
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