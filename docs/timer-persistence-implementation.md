# Timer Persistence Implementation Plan

## Overview

This document outlines the implementation plan for persisting question timer state when users leave the application and restoring it when they return. We'll use localStorage as the primary storage mechanism.

## Implementation Steps

### Step 1: Identify Time Tracking Mechanism

Our application currently tracks time for questions. We need to:

1. Locate the timer initialization and update logic in our codebase
2. Understand the data structure used for time tracking (seconds, milliseconds, etc.)
3. Identify how the timer interacts with question state

### Step 2: Design Storage Strategy with localStorage

We'll use localStorage for persistence with the following data structure:

```javascript
{
  questionId: "unique-question-id",
  timeRemaining: 120, // seconds remaining
  timestamp: 1634567890123, // when the data was saved
  sessionId: "user-session-id" // to prevent conflicts
}
```

This will be stored as a JSON string under the key `questionTimer`.

### Step 3: Implement Save Functionality

```javascript
/**
 * Saves the current timer state to localStorage
 * @param {string} questionId - The ID of the current question
 * @param {number} timeRemaining - Time remaining in seconds
 */
function saveTimerState(questionId, timeRemaining) {
  const timerData = {
    questionId,
    timeRemaining,
    timestamp: Date.now(),
    sessionId: getCurrentSessionId() // Implement this function to get/create session ID
  };
  localStorage.setItem('questionTimer', JSON.stringify(timerData));
}
```

Add event listeners to trigger saving:

```javascript
// Save timer state when user leaves the page
window.addEventListener('beforeunload', () => {
  if (isQuestionActive()) {
    saveTimerState(getCurrentQuestionId(), getTimeRemaining());
  }
});

// Save timer state when tab becomes hidden
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && isQuestionActive()) {
    saveTimerState(getCurrentQuestionId(), getTimeRemaining());
  }
});

// For mobile browsers
window.addEventListener('pagehide', () => {
  if (isQuestionActive()) {
    saveTimerState(getCurrentQuestionId(), getTimeRemaining());
  }
});
```

### Step 4: Implement Restore Functionality

```javascript
/**
 * Retrieves and validates saved timer state
 * @returns {Object|null} Timer data or null if no valid data exists
 */
function getTimerState() {
  try {
    const savedData = localStorage.getItem('questionTimer');
    if (!savedData) return null;
    
    const timerData = JSON.parse(savedData);
    
    // Validate data is still relevant
    if (isTimerDataValid(timerData)) {
      return timerData;
    }
    
    // Clear invalid data
    localStorage.removeItem('questionTimer');
    return null;
  } catch (error) {
    console.error('Error retrieving timer state:', error);
    localStorage.removeItem('questionTimer');
    return null;
  }
}

/**
 * Restores timer with saved state or initializes with default time
 * @param {string} questionId - The ID of the current question
 * @returns {boolean} True if timer was restored, false if default was used
 */
function restoreTimer(questionId) {
  const timerData = getTimerState();
  
  if (timerData && timerData.questionId === questionId) {
    // Initialize timer with saved time
    initializeTimer(timerData.timeRemaining);
    return true;
  }
  
  // Initialize timer with default time
  initializeTimer(getDefaultTime(questionId));
  return false;
}
```

Call `restoreTimer` when loading a question:

```javascript
function loadQuestion(questionId) {
  // Load question content
  // ...
  
  // Restore timer or initialize with default
  const wasRestored = restoreTimer(questionId);
  
  if (wasRestored) {
    // Optionally notify user that timer was restored
    showNotification('Timer restored from your previous session');
  }
}
```

### Step 5: Handle Edge Cases

```javascript
/**
 * Validates timer data to ensure it's still relevant
 * @param {Object} timerData - The timer data to validate
 * @returns {boolean} True if data is valid, false otherwise
 */
function isTimerDataValid(timerData) {
  // Check if data has required properties
  if (!timerData || !timerData.questionId || 
      typeof timerData.timeRemaining !== 'number' || 
      !timerData.timestamp) {
    return false;
  }
  
  // Check if data is expired (24 hours)
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const isExpired = (Date.now() - timerData.timestamp) > maxAge;
  if (isExpired) return false;
  
  // Check if time remaining is valid
  if (timerData.timeRemaining <= 0) return false;
  
  return true;
}

/**
 * Clears timer data when a question is completed
 */
function clearTimerOnQuestionComplete() {
  localStorage.removeItem('questionTimer');
}

/**
 * Generates or retrieves current session ID
 * @returns {string} Session ID
 */
function getCurrentSessionId() {
  let sessionId = localStorage.getItem('sessionId');
  
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
  }
  
  return sessionId;
}
```

### Step 6: Integration Points

To fully implement this feature, we need to:

1. Identify where the timer is initialized in our application
2. Add the save functionality to appropriate event handlers
3. Modify the question loading logic to check for saved timer state
4. Update the UI to reflect restored timer state
5. Clear timer data when a question is completed or a quiz ends

## Testing Strategy

Test the following scenarios:

1. **Basic functionality**:
   - Save timer state on page close
   - Restore timer state on page load

2. **Edge cases**:
   - Browser refresh
   - Tab close and reopen
   - Browser close and reopen
   - Session expiration
   - Invalid saved data

3. **User flows**:
   - Starting a new question after completing one
   - Abandoning a question and returning later
   - Completing a question and returning to the application

## Potential Challenges

### Timer Accuracy

JavaScript timers may not be perfectly accurate, especially when a tab is in the background. Consider:

- Storing the absolute end time rather than remaining time
- Using `Date.now()` to calculate the actual remaining time on restore

### Browser Storage Limitations

localStorage has size limitations (typically 5-10MB) and can be cleared by users:

- Keep stored data minimal
- Implement fallback to default behavior if data is missing

### Privacy Considerations

Some users may not want their progress persisted:

- Consider adding a user setting to enable/disable timer persistence
- Ensure timer data is cleared when a quiz is completed

## Implementation Checklist

- [ ] Identify timer initialization and update logic
- [ ] Implement timer state saving functions
- [ ] Add event listeners for page unload events
- [ ] Implement timer state restoration functions
- [ ] Add validation and edge case handling
- [ ] Update UI components to reflect restored timer
- [ ] Test across different scenarios
- [ ] Document the implementation for future reference 

---

# Tailored Implementation Plan for Current Codebase

## Step 1: Understanding Your Current Timer Implementation

First, we need to identify how your timer is currently implemented in your quiz application:

- Where is the timer initialized when a quiz/question starts?
- What data structure tracks the remaining time?
- How does the timer interact with your question state management?

## Step 2: Design localStorage Strategy for Your Quiz System

```javascript
// Data structure for localStorage
{
  quizId: "current-quiz-id",          // ID of the current quiz
  questionIndex: 2,                   // Current question index in the quiz
  timeRemaining: 45,                  // Seconds remaining for current question
  timestamp: 1634567890123,           // When the data was saved
  totalQuizTime: 300                  // Optional: track total quiz time if needed
}
```

This will be stored under the key `quizTimerState` in localStorage.

## Step 3: Implement Save Functionality for Your Quiz

```javascript
/**
 * Saves the current quiz timer state to localStorage
 * @param {string} quizId - The ID of the current quiz
 * @param {number} questionIndex - Current question index
 * @param {number} timeRemaining - Time remaining in seconds
 * @param {number} totalQuizTime - Optional total quiz time elapsed
 */
function saveQuizTimerState(quizId, questionIndex, timeRemaining, totalQuizTime = null) {
  const timerData = {
    quizId,
    questionIndex,
    timeRemaining,
    timestamp: Date.now(),
    totalQuizTime
  };
  localStorage.setItem('quizTimerState', JSON.stringify(timerData));
}
```

Add event listeners that integrate with your application flow:

```javascript
// Save timer state when user leaves the page
window.addEventListener('beforeunload', () => {
  if (isQuizActive()) {
    saveQuizTimerState(
      getCurrentQuizId(),
      getCurrentQuestionIndex(),
      getQuestionTimeRemaining(),
      getTotalQuizTime() // If you track total quiz time
    );
  }
});

// Save when tab becomes hidden
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && isQuizActive()) {
    saveQuizTimerState(
      getCurrentQuizId(),
      getCurrentQuestionIndex(),
      getQuestionTimeRemaining(),
      getTotalQuizTime()
    );
  }
});
```

## Step 4: Implement Restore Functionality for Your Quiz

```javascript
/**
 * Retrieves and validates saved quiz timer state
 * @returns {Object|null} Timer data or null if no valid data exists
 */
function getQuizTimerState() {
  try {
    const savedData = localStorage.getItem('quizTimerState');
    if (!savedData) return null;
    
    const timerData = JSON.parse(savedData);
    
    // Validate the timer data is still relevant
    if (isQuizTimerDataValid(timerData)) {
      return timerData;
    }
    
    // Clear invalid data
    localStorage.removeItem('quizTimerState');
    return null;
  } catch (error) {
    console.error('Error retrieving quiz timer state:', error);
    localStorage.removeItem('quizTimerState');
    return null;
  }
}

/**
 * Restores quiz timer with saved state or initializes with default time
 * @param {string} quizId - The ID of the current quiz
 * @param {number} questionIndex - The index of the current question
 * @returns {boolean} True if timer was restored, false if default was used
 */
function restoreQuizTimer(quizId, questionIndex) {
  const timerData = getQuizTimerState();
  
  if (timerData && 
      timerData.quizId === quizId && 
      timerData.questionIndex === questionIndex) {
    // Initialize timer with saved time
    initializeQuestionTimer(timerData.timeRemaining);
    
    // If tracking total quiz time, restore that too
    if (timerData.totalQuizTime !== null) {
      setTotalQuizTime(timerData.totalQuizTime);
    }
    
    return true;
  }
  
  // Initialize timer with default time for this question
  initializeQuestionTimer(getDefaultQuestionTime(quizId, questionIndex));
  return false;
}
```

Integrate with your quiz loading logic:

```javascript
function loadQuizQuestion(quizId, questionIndex) {
  // Load question content from your existing quiz data
  // ...
  
  // Restore timer or initialize with default
  const wasRestored = restoreQuizTimer(quizId, questionIndex);
  
  if (wasRestored) {
    // Notify user that timer was restored
    showNotification('Timer restored from your previous session');
  }
}
```

## Step 5: Handle Edge Cases for Your Quiz System

```javascript
/**
 * Validates quiz timer data to ensure it's still relevant
 * @param {Object} timerData - The timer data to validate
 * @returns {boolean} True if data is valid, false otherwise
 */
function isQuizTimerDataValid(timerData) {
  // Check if data has required properties
  if (!timerData || !timerData.quizId || 
      typeof timerData.questionIndex !== 'number' ||
      typeof timerData.timeRemaining !== 'number' || 
      !timerData.timestamp) {
    return false;
  }
  
  // Check if data is expired (2 hours is reasonable for a quiz)
  const maxAge = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  const isExpired = (Date.now() - timerData.timestamp) > maxAge;
  if (isExpired) return false;
  
  // Check if time remaining is valid
  if (timerData.timeRemaining <= 0) return false;
  
  return true;
}

/**
 * Clears timer data when a quiz is completed
 */
function clearTimerOnQuizComplete() {
  localStorage.removeItem('quizTimerState');
}
```

## Step 6: Integration Points with Your Existing Quiz Components

To fully implement this feature in your codebase:

1. Identify your quiz component that manages the timer state
2. Add the save functionality to your existing event handlers
3. Modify your quiz loading logic to check for saved timer state
4. Update your timer UI component to reflect restored timer state
5. Clear timer data when a quiz is completed

For example, if you have a Quiz component that manages state:

```javascript
// In your Quiz component initialization
useEffect(() => {
  // When quiz loads, check for saved state
  const quizId = props.quizId;
  const questionIndex = currentQuestionIndex;
  
  const wasRestored = restoreQuizTimer(quizId, questionIndex);
  
  if (wasRestored) {
    // Update UI or show notification
    setTimerRestored(true);
  }
  
  // Add event listeners for saving state
  window.addEventListener('beforeunload', handleSaveTimerState);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    // Clean up event listeners
    window.removeEventListener('beforeunload', handleSaveTimerState);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);

// Handler functions
const handleSaveTimerState = () => {
  if (isQuizActive) {
    saveQuizTimerState(
      props.quizId,
      currentQuestionIndex,
      timeRemaining,
      totalQuizTime
    );
  }
};

const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden' && isQuizActive) {
    handleSaveTimerState();
  }
};

// When quiz completes
const handleQuizComplete = () => {
  // Your existing quiz completion logic
  // ...
  
  // Clear saved timer state
  clearTimerOnQuizComplete();
};
```

## Testing Strategy for Your Quiz Application

Test the following scenarios with your quiz system:

1. **Basic functionality**:
   - Start a quiz, answer a few questions, close the browser
   - Reopen and verify the timer restores correctly

2. **Edge cases specific to your quiz flow**:
   - Test with different quiz types if you have multiple formats
   - Test with questions that have different time limits
   - Test when switching between quizzes

3. **User flows in your application**:
   - Starting a new quiz after completing one
   - Abandoning a quiz midway and returning later
   - Navigating between different sections of your application

## Implementation Checklist for Current Codebase

- [ ] Identify timer implementation in your quiz components
- [ ] Implement timer state saving functions that work with your quiz structure
- [ ] Add event listeners for page unload events
- [ ] Implement timer state restoration functions
- [ ] Add validation specific to your quiz system
- [ ] Update your quiz UI components to reflect restored timer
- [ ] Test with your actual quiz data and user flows
- [ ] Document the implementation for your team