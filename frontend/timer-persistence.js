/**
 * Timer Persistence Module
 * 
 * This module ensures that quiz timers persist when users navigate away from and back to quizzes.
 * It intercepts navigation events and saves the timer state before the user leaves.
 */

// Function to save the current quiz timer state
function saveQuizTimerState() {
    // Find the active quiz instance
    if (window.activeQuiz) {
        // Pause the timer if it's running
        if (window.activeQuiz.questionTimer) {
            clearInterval(window.activeQuiz.questionTimer);
            window.activeQuiz.questionTimer = null;
        }
        
        // Save the timer state
        if (typeof window.activeQuiz.saveQuizState === 'function') {
            window.activeQuiz.saveQuizState();
            console.log('Quiz timer state saved before navigation');
        } else if (typeof window.activeQuiz.saveTimerState === 'function') {
            window.activeQuiz.saveTimerState();
            console.log('Quiz timer state saved directly before navigation');
        }
        
        // Log the current timer state for debugging
        const username = localStorage.getItem('username');
        if (username && window.activeQuiz.quizName) {
            const timerStateKey = `timer_state_${username}_${window.activeQuiz.quizName}`;
            const savedState = localStorage.getItem(timerStateKey);
            if (savedState) {
                console.log('Saved timer state before navigation:', JSON.parse(savedState));
            }
        }
    }
}

// Add event listeners to all navigation links
function setupNavigationInterception() {
    console.log('Setting up navigation interception for timer persistence');
    
    // Find all links that navigate away from the quiz
    const navigationLinks = document.querySelectorAll('a');
    
    navigationLinks.forEach(link => {
        // Skip links that are not navigation links (e.g., anchor links)
        if (link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
            // Remove any existing event listeners by cloning and replacing
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            // Add new event listener
            newLink.addEventListener('click', (e) => {
                console.log('Navigation link clicked:', newLink.getAttribute('href'));
                // Save state before navigation
                saveQuizTimerState();
            });
        }
    });
    
    // Specifically target back links which are commonly used to return to the hub
    const backLinks = document.querySelectorAll('a.back-link, a[href="../index.html"]');
    backLinks.forEach(link => {
        // Remove any existing event listeners by cloning and replacing
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        // Add new event listener with higher priority
        newLink.addEventListener('click', (e) => {
            console.log('Back link clicked:', newLink.getAttribute('href'));
            // Save state before navigation
            saveQuizTimerState();
        });
    });
    
    // Also handle browser back/forward buttons and manual URL changes
    window.addEventListener('beforeunload', () => {
        saveQuizTimerState();
    });
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            saveQuizTimerState();
        }
    });
    
    // Set up a MutationObserver to handle dynamically added links
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check for new links in the added nodes
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        const newLinks = node.querySelectorAll('a');
                        if (newLinks.length > 0) {
                            console.log('New links detected, adding event listeners');
                            setupNavigationInterception();
                        }
                    }
                });
            }
        });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('Navigation interception set up for timer persistence');
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up navigation interception with a slight delay to ensure quiz is initialized
    setTimeout(setupNavigationInterception, 1000);
    
    console.log('Timer persistence module initialized');
});

// Export for module usage
export { saveQuizTimerState, setupNavigationInterception }; 