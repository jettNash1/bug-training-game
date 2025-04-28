/**
 * Quiz Timer Test Utility
 * This script helps verify the timer initialization across different quizzes
 * 
 * To use:
 * 1. Include this script in a quiz page: <script src="/frontend/timer-test.js"></script>
 * 2. Open the browser console to view logs
 */

class TimerTestUtil {
    constructor() {
        this.version = '1.0';
        console.log(`[TimerTest] Initialized v${this.version}`);
        
        // Start monitoring as soon as the page is ready
        if (document.readyState === 'complete') {
            this.startMonitoring();
        } else {
            window.addEventListener('load', () => this.startMonitoring());
        }
    }
    
    /**
     * Start monitoring the timer initialization
     */
    startMonitoring() {
        console.log('[TimerTest] Starting timer initialization monitoring');
        
        // Check if we're in a quiz page
        const quizHelper = window.quizHelper;
        if (!quizHelper) {
            console.warn('[TimerTest] No quizHelper found in window - not a quiz page or quiz not initialized yet');
            
            // Set up a MutationObserver to watch for the quiz helper to be added to window
            this.setupQuizHelperObserver();
            return;
        }
        
        // If we already have a quizHelper, monitor it
        this.monitorQuizHelper(quizHelper);
    }
    
    /**
     * Set up an observer to detect when quizHelper is added to window
     */
    setupQuizHelperObserver() {
        console.log('[TimerTest] Setting up observer for quizHelper initialization');
        
        // Check every 250ms if quizHelper has been added to window
        const checkInterval = setInterval(() => {
            if (window.quizHelper) {
                console.log('[TimerTest] quizHelper detected in window');
                clearInterval(checkInterval);
                this.monitorQuizHelper(window.quizHelper);
            }
        }, 250);
        
        // Stop checking after 30 seconds (120 attempts)
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.quizHelper) {
                console.warn('[TimerTest] quizHelper not found after 30 seconds');
            }
        }, 30000);
    }
    
    /**
     * Monitor the quizHelper instance for timer initialization
     * @param {Object} quizHelper - The quiz helper instance
     */
    monitorQuizHelper(quizHelper) {
        // Get the quiz name
        const quizName = quizHelper.quizName || 'unknown';
        console.log(`[TimerTest] Monitoring quiz: ${quizName}`);
        
        // Record initial timer value
        console.log(`[TimerTest] Initial timePerQuestion value: ${quizHelper.timePerQuestion}`);
        
        // Make a deep copy of initializeTimerSettings to monitor it
        const originalInitMethod = quizHelper.initializeTimerSettings;
        
        // Replace the method with our monitoring version
        quizHelper.initializeTimerSettings = async function() {
            console.log(`[TimerTest] initializeTimerSettings called for ${quizName}`);
            console.log(`[TimerTest] timePerQuestion before initialization: ${this.timePerQuestion}`);
            
            const startTime = performance.now();
            try {
                // Call the original method
                const result = await originalInitMethod.apply(this, arguments);
                
                const endTime = performance.now();
                console.log(`[TimerTest] initializeTimerSettings completed in ${Math.round(endTime - startTime)}ms`);
                console.log(`[TimerTest] timePerQuestion after initialization: ${this.timePerQuestion}`);
                
                return result;
            } catch (error) {
                console.error(`[TimerTest] Error in initializeTimerSettings:`, error);
                throw error;
            }
        };
        
        // Also monitor timer initialization
        this.monitorTimerInit(quizHelper);
        
        // Monitor scenario display
        this.monitorScenarioDisplay(quizHelper);
    }
    
    /**
     * Monitor timer initialization
     * @param {Object} quizHelper - The quiz helper instance
     */
    monitorTimerInit(quizHelper) {
        if (!quizHelper.initializeTimer) {
            console.warn('[TimerTest] No initializeTimer method found');
            return;
        }
        
        const originalInitTimer = quizHelper.initializeTimer;
        
        quizHelper.initializeTimer = function() {
            console.log(`[TimerTest] initializeTimer called`);
            console.log(`[TimerTest] timePerQuestion at timer initialization: ${this.timePerQuestion}`);
            console.log(`[TimerTest] remainingTime before initialization: ${this.remainingTime}`);
            
            // Call the original method
            const result = originalInitTimer.apply(this, arguments);
            
            console.log(`[TimerTest] remainingTime after initialization: ${this.remainingTime}`);
            
            return result;
        };
    }
    
    /**
     * Monitor scenario display
     * @param {Object} quizHelper - The quiz helper instance
     */
    monitorScenarioDisplay(quizHelper) {
        if (!quizHelper.displayScenario) {
            console.warn('[TimerTest] No displayScenario method found');
            return;
        }
        
        const originalDisplayScenario = quizHelper.displayScenario;
        
        quizHelper.displayScenario = function() {
            console.log(`[TimerTest] displayScenario called`);
            console.log(`[TimerTest] timePerQuestion at scenario display: ${this.timePerQuestion}`);
            
            // Call the original method
            const result = originalDisplayScenario.apply(this, arguments);
            
            return result;
        };
    }
    
    /**
     * Get a report of the current timer state
     * @returns {Object} Timer state report
     */
    getTimerReport() {
        if (!window.quizHelper) {
            return { error: 'No quizHelper found in window' };
        }
        
        const quizHelper = window.quizHelper;
        
        return {
            quizName: quizHelper.quizName,
            timePerQuestion: quizHelper.timePerQuestion,
            remainingTime: quizHelper.remainingTime,
            questionStartTime: quizHelper.questionStartTime,
            timerActive: !!quizHelper.questionTimer,
            quizTimerSettings: JSON.parse(localStorage.getItem('quizTimerSettings') || '{}'),
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Log a timer report to the console
     */
    logTimerReport() {
        const report = this.getTimerReport();
        console.group('[TimerTest] Timer Status Report');
        console.log('Quiz:', report.quizName);
        console.log('timePerQuestion:', report.timePerQuestion);
        console.log('remainingTime:', report.remainingTime);
        console.log('Timer active:', report.timerActive);
        console.log('Stored quiz timer settings:', report.quizTimerSettings);
        console.groupEnd();
        return report;
    }
    
    /**
     * Force a specific timer value for testing
     * @param {number} seconds - New timer value in seconds
     */
    forceTimerValue(seconds) {
        if (!window.quizHelper) {
            console.error('[TimerTest] No quizHelper found in window');
            return false;
        }
        
        const quizHelper = window.quizHelper;
        const oldValue = quizHelper.timePerQuestion;
        
        quizHelper.timePerQuestion = seconds;
        console.log(`[TimerTest] Forced timePerQuestion from ${oldValue} to ${seconds}`);
        
        // If timer is active, update remaining time
        if (quizHelper.questionTimer && quizHelper.remainingTime !== null) {
            quizHelper.remainingTime = seconds;
            console.log(`[TimerTest] Updated remainingTime to ${seconds}`);
            
            // Update display if possible
            try {
                quizHelper.updateTimerDisplay();
                console.log('[TimerTest] Updated timer display');
            } catch (error) {
                console.warn('[TimerTest] Could not update timer display:', error);
            }
        }
        
        return true;
    }
}

// Create the utility instance
window.timerTest = new TimerTestUtil();
console.log('[TimerTest] Available globally as window.timerTest');

// Export for module use
export const timerTest = window.timerTest; 