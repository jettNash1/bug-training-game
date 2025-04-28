/**
 * Timer Debug Utility
 * 
 * This utility provides debugging tools for quiz timers across the application.
 * It helps diagnose timer-related issues by exposing timer settings and values.
 */

export class TimerDebug {
    constructor() {
        this.version = '1.0.0';
        console.log(`[TimerDebug] Initialized v${this.version}`);
    }

    /**
     * Get current timer settings from various sources
     * @returns {Object} Timer settings from different sources
     */
    async getAllTimerSettings() {
        try {
            // Get from localStorage
            const localSettings = this.getLocalTimerSettings();
            
            // Get from API
            const apiSettings = await this.fetchApiTimerSettings();
            
            // If BaseQuiz is available, get from there
            let quizSettings = null;
            if (window.quizHelper) {
                quizSettings = {
                    timePerQuestion: window.quizHelper.timePerQuestion,
                    remainingTime: window.quizHelper.remainingTime,
                    quizName: window.quizHelper.quizName
                };
            }
            
            return {
                localStorage: localSettings,
                api: apiSettings,
                quizInstance: quizSettings,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('[TimerDebug] Error getting all timer settings:', error);
            return { error: error.message };
        }
    }
    
    /**
     * Get timer settings from localStorage
     * @returns {Object|null} Timer settings from localStorage
     */
    getLocalTimerSettings() {
        try {
            const timerSettings = localStorage.getItem('quizTimerSettings');
            return timerSettings ? JSON.parse(timerSettings) : null;
        } catch (error) {
            console.error('[TimerDebug] Error parsing localStorage timer settings:', error);
            return { error: error.message };
        }
    }
    
    /**
     * Fetch timer settings from API
     * @returns {Promise<Object>} Timer settings from API
     */
    async fetchApiTimerSettings() {
        try {
            const response = await fetch('/api/settings/quiz-timer');
            if (response.ok) {
                const data = await response.json();
                return data.data;
            }
            return { error: `API returned ${response.status}` };
        } catch (error) {
            console.error('[TimerDebug] Error fetching API timer settings:', error);
            return { error: error.message };
        }
    }
    
    /**
     * Compare timer values across different sources
     * @returns {Promise<Object>} Comparison results
     */
    async compareTimerSources() {
        const allSettings = await this.getAllTimerSettings();
        const comparison = {
            defaultSecondsMatches: true,
            quizTimersMatch: true,
            discrepancies: []
        };
        
        // Compare default seconds
        const defaultValues = new Set();
        if (allSettings.localStorage && allSettings.localStorage.defaultSeconds !== undefined) {
            defaultValues.add(allSettings.localStorage.defaultSeconds);
        }
        if (allSettings.api && allSettings.api.defaultSeconds !== undefined) {
            defaultValues.add(allSettings.api.defaultSeconds);
        }
        
        // Check if there are multiple different values
        if (defaultValues.size > 1) {
            comparison.defaultSecondsMatches = false;
            comparison.discrepancies.push({
                type: 'defaultSeconds',
                values: Array.from(defaultValues)
            });
        }
        
        // Compare quiz-specific timers
        if (allSettings.quizInstance && allSettings.quizInstance.quizName) {
            const quizName = allSettings.quizInstance.quizName;
            const quizValues = new Set();
            
            // Get quiz-specific timer from each source
            if (allSettings.localStorage && 
                allSettings.localStorage.quizTimers && 
                allSettings.localStorage.quizTimers[quizName] !== undefined) {
                quizValues.add(allSettings.localStorage.quizTimers[quizName]);
            }
            
            if (allSettings.api && 
                allSettings.api.quizTimers && 
                allSettings.api.quizTimers[quizName] !== undefined) {
                quizValues.add(allSettings.api.quizTimers[quizName]);
            }
            
            if (allSettings.quizInstance.timePerQuestion !== undefined) {
                quizValues.add(allSettings.quizInstance.timePerQuestion);
            }
            
            // Check if there are multiple different values
            if (quizValues.size > 1) {
                comparison.quizTimersMatch = false;
                comparison.discrepancies.push({
                    type: `quizTimer_${quizName}`,
                    values: Array.from(quizValues)
                });
            }
        }
        
        return {
            ...comparison,
            allSettings,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Create a visual report in the UI
     * @param {HTMLElement} targetElement - Element to render the report in
     * @returns {Promise<void>}
     */
    async createVisualReport(targetElement) {
        const comparison = await this.compareTimerSources();
        
        // Create container
        const container = document.createElement('div');
        container.className = 'timer-debug-report';
        container.style.padding = '10px';
        container.style.backgroundColor = '#f8f9fa';
        container.style.border = '1px solid #dee2e6';
        container.style.borderRadius = '4px';
        
        // Create header
        const header = document.createElement('h4');
        header.textContent = 'Timer Debug Report';
        header.style.marginBottom = '10px';
        container.appendChild(header);
        
        // Add timestamp
        const timestamp = document.createElement('p');
        timestamp.textContent = `Generated: ${new Date(comparison.timestamp).toLocaleString()}`;
        timestamp.style.fontSize = '12px';
        timestamp.style.color = '#6c757d';
        container.appendChild(timestamp);
        
        // Add summary
        const summary = document.createElement('div');
        summary.style.marginBottom = '15px';
        
        const defaultStatus = document.createElement('p');
        defaultStatus.textContent = `Default Seconds: ${comparison.defaultSecondsMatches ? '✅ Match' : '❌ Mismatch'}`;
        defaultStatus.style.color = comparison.defaultSecondsMatches ? 'green' : 'red';
        summary.appendChild(defaultStatus);
        
        const quizStatus = document.createElement('p');
        quizStatus.textContent = `Quiz Timers: ${comparison.quizTimersMatch ? '✅ Match' : '❌ Mismatch'}`;
        quizStatus.style.color = comparison.quizTimersMatch ? 'green' : 'red';
        summary.appendChild(quizStatus);
        
        container.appendChild(summary);
        
        // Add discrepancies
        if (comparison.discrepancies.length > 0) {
            const discrepancyTitle = document.createElement('h5');
            discrepancyTitle.textContent = 'Discrepancies Found';
            discrepancyTitle.style.color = 'red';
            container.appendChild(discrepancyTitle);
            
            const discrepancyList = document.createElement('ul');
            comparison.discrepancies.forEach(d => {
                const item = document.createElement('li');
                item.textContent = `${d.type}: Values found: ${d.values.join(', ')}`;
                discrepancyList.appendChild(item);
            });
            container.appendChild(discrepancyList);
        }
        
        // Add all settings details
        const detailsButton = document.createElement('button');
        detailsButton.textContent = 'Show Raw Settings Data';
        detailsButton.style.padding = '5px 10px';
        detailsButton.style.backgroundColor = '#e9ecef';
        detailsButton.style.border = '1px solid #ced4da';
        detailsButton.style.borderRadius = '4px';
        detailsButton.style.cursor = 'pointer';
        container.appendChild(detailsButton);
        
        const details = document.createElement('pre');
        details.style.marginTop = '10px';
        details.style.padding = '10px';
        details.style.backgroundColor = '#f1f3f5';
        details.style.border = '1px solid #dee2e6';
        details.style.borderRadius = '4px';
        details.style.whiteSpace = 'pre-wrap';
        details.style.display = 'none';
        details.textContent = JSON.stringify(comparison.allSettings, null, 2);
        container.appendChild(details);
        
        detailsButton.addEventListener('click', () => {
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
            detailsButton.textContent = details.style.display === 'none' ? 
                'Show Raw Settings Data' : 'Hide Raw Settings Data';
        });
        
        // Clear target and append report
        if (targetElement) {
            targetElement.innerHTML = '';
            targetElement.appendChild(container);
        } else {
            console.log('[TimerDebug] Visual report created but no target element provided');
        }
    }
    
    /**
     * Log timer settings to console
     * @returns {Promise<void>}
     */
    async logTimerSettings() {
        const comparison = await this.compareTimerSources();
        console.group('[TimerDebug] Timer Settings Report');
        console.log('Report generated:', new Date(comparison.timestamp).toLocaleString());
        console.log('Default seconds match:', comparison.defaultSecondsMatches);
        console.log('Quiz timers match:', comparison.quizTimersMatch);
        
        if (comparison.discrepancies.length > 0) {
            console.warn('Discrepancies found:', comparison.discrepancies);
        }
        
        console.log('All settings:', comparison.allSettings);
        console.groupEnd();
    }
    
    /**
     * Install the debug panel in the DOM
     * @returns {HTMLElement} The added debug panel
     */
    installDebugPanel() {
        // Create debug panel
        const panel = document.createElement('div');
        panel.id = 'timer-debug-panel';
        panel.style.position = 'fixed';
        panel.style.right = '10px';
        panel.style.bottom = '10px';
        panel.style.zIndex = '9999';
        panel.style.width = '300px';
        panel.style.backgroundColor = '#fff';
        panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
        panel.style.borderRadius = '5px';
        panel.style.overflow = 'hidden';
        
        // Create header
        const header = document.createElement('div');
        header.style.padding = '8px 12px';
        header.style.backgroundColor = '#007bff';
        header.style.color = '#fff';
        header.style.fontWeight = 'bold';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.cursor = 'pointer';
        
        const title = document.createElement('span');
        title.textContent = 'Timer Debug';
        
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.fontSize = '20px';
        closeBtn.style.cursor = 'pointer';
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        panel.appendChild(header);
        
        // Create content area
        const content = document.createElement('div');
        content.style.padding = '10px';
        content.style.maxHeight = '300px';
        content.style.overflowY = 'auto';
        panel.appendChild(content);
        
        // Create refresh button
        const refreshBtn = document.createElement('button');
        refreshBtn.textContent = 'Refresh Data';
        refreshBtn.style.margin = '10px';
        refreshBtn.style.padding = '5px 10px';
        refreshBtn.style.backgroundColor = '#28a745';
        refreshBtn.style.color = '#fff';
        refreshBtn.style.border = 'none';
        refreshBtn.style.borderRadius = '3px';
        refreshBtn.style.cursor = 'pointer';
        panel.appendChild(refreshBtn);
        
        // Add to DOM
        document.body.appendChild(panel);
        
        // Setup event handlers
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.remove();
        });
        
        header.addEventListener('click', () => {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
        
        refreshBtn.addEventListener('click', () => {
            this.createVisualReport(content);
        });
        
        // Initial load of data
        this.createVisualReport(content);
        
        return panel;
    }
}

// Create a global instance
window.timerDebug = new TimerDebug();
console.log('[TimerDebug] Available globally as window.timerDebug');

// Export utility
export const timerDebug = window.timerDebug; 