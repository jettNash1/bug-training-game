/**
 * Timer Persistence Module
 * Handles saving and restoring question timer state using localStorage
 */

const TIMER_STORAGE_KEY = 'questionTimer';
const SESSION_ID_KEY = 'sessionId';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Generates or retrieves current session ID
 * @returns {string} Session ID
 */
function getCurrentSessionId() {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Validates timer data to ensure it's still relevant
 * @param {Object} timerData - The timer data to validate
 * @returns {boolean} True if data is valid, false otherwise
 */
function isTimerDataValid(timerData) {
  // Check if data has required properties
  if (!timerData || !timerData.scenarioId || 
      typeof timerData.timeRemaining !== 'number' || 
      !timerData.timestamp) {
    return false;
  }
  
  // Check if data is expired (24 hours)
  const isExpired = (Date.now() - timerData.timestamp) > MAX_AGE_MS;
  if (isExpired) return false;
  
  // Check if time remaining is valid
  if (timerData.timeRemaining <= 0) return false;
  
  return true;
}

/**
 * Saves the current timer state to localStorage
 * @param {string} scenarioId - The ID of the current scenario
 * @param {number} timeRemaining - Time remaining in milliseconds
 */
function saveTimerState(scenarioId, timeRemaining) {
  if (!scenarioId || typeof timeRemaining !== 'number' || timeRemaining <= 0) {
    return;
  }

  const timerData = {
    scenarioId,
    timeRemaining,
    timestamp: Date.now(),
    sessionId: getCurrentSessionId()
  };
  
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerData));
  } catch (error) {
    console.error('Error saving timer state:', error);
  }
}

/**
 * Retrieves and validates saved timer state
 * @returns {Object|null} Timer data or null if no valid data exists
 */
function getTimerState() {
  try {
    const savedData = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!savedData) return null;
    
    const timerData = JSON.parse(savedData);
    
    // Validate data is still relevant
    if (isTimerDataValid(timerData)) {
      return timerData;
    }
    
    // Clear invalid data
    localStorage.removeItem(TIMER_STORAGE_KEY);
    return null;
  } catch (error) {
    console.error('Error retrieving timer state:', error);
    localStorage.removeItem(TIMER_STORAGE_KEY);
    return null;
  }
}

/**
 * Clears timer data
 */
function clearTimerState() {
  localStorage.removeItem(TIMER_STORAGE_KEY);
}

/**
 * Sets up event listeners to save timer state when user leaves the page
 * @param {function} isQuestionActive - Function to check if a question is active
 * @param {function} getCurrentScenarioId - Function to get the current scenario ID
 * @param {function} getTimeRemaining - Function to get the remaining time
 */
function setupTimerPersistenceListeners(isQuestionActive, getCurrentScenarioId, getTimeRemaining) {
  // Save timer state when user leaves the page
  window.addEventListener('beforeunload', () => {
    if (isQuestionActive()) {
      saveTimerState(getCurrentScenarioId(), getTimeRemaining());
    }
  });

  // Save timer state when tab becomes hidden
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && isQuestionActive()) {
      saveTimerState(getCurrentScenarioId(), getTimeRemaining());
    }
  });

  // For mobile browsers
  window.addEventListener('pagehide', () => {
    if (isQuestionActive()) {
      saveTimerState(getCurrentScenarioId(), getTimeRemaining());
    }
  });
}

export {
  saveTimerState,
  getTimerState,
  clearTimerState,
  setupTimerPersistenceListeners
}; 