# Quiz Timer Debug Utility

This guide explains how to use the Timer Debug utility for diagnosing timer-related issues in the quiz application.

## Installation

To use the Timer Debug utility in any quiz page:

1. Open the browser's developer console
2. Paste and execute the following code:

```javascript
// Load the timer debug utility
const script = document.createElement('script');
script.src = '/frontend/timer-debug.js';
script.type = 'module';
document.head.appendChild(script);

// Wait for it to load
setTimeout(() => {
  if (window.timerDebug) {
    window.timerDebug.installDebugPanel();
    console.log('✅ Timer Debug Panel installed!');
  } else {
    console.error('❌ Timer Debug failed to load.');
  }
}, 1000);
```

A debug panel will appear in the bottom-right corner of the page.

## Features

The Timer Debug utility offers several tools for diagnosing timer issues:

### Visual Debug Panel

The panel shows:
- Match status for default timer settings across sources
- Match status for quiz-specific timer settings
- Any discrepancies found between different sources
- Raw timer settings data (expandable)

### Console Commands

You can use these commands in the browser console:

```javascript
// Get all timer settings from different sources
await window.timerDebug.getAllTimerSettings();

// Compare timer settings across sources
await window.timerDebug.compareTimerSources();

// Log a detailed report to the console
await window.timerDebug.logTimerSettings();

// Refresh the debug panel data
await window.timerDebug.createVisualReport(document.querySelector('#timer-debug-panel div:nth-child(2)'));
```

## Understanding Timer Settings Sources

The utility compares timer settings from three sources:

1. **localStorage** - The cached settings stored in the browser
2. **API** - The latest settings fetched directly from the server
3. **Quiz Instance** - The actual timer values being used by the current quiz

Discrepancies between these sources may indicate:
- Stale cache in localStorage
- Failed API calls
- Bugs in the timer initialization process
- Browser storage issues

## Resolving Common Issues

If discrepancies are found:

1. **Clear localStorage and refresh**
   ```javascript
   localStorage.removeItem('quizTimerSettings');
   location.reload();
   ```

2. **Force a refresh from API**
   ```javascript
   fetch('/api/settings/quiz-timer')
     .then(r => r.json())
     .then(data => {
       localStorage.setItem('quizTimerSettings', JSON.stringify(data.data));
       console.log('Timer settings updated:', data.data);
       location.reload();
     });
   ```

3. **Test with a specific timer value**
   ```javascript
   if (window.quizHelper) {
     window.quizHelper.timePerQuestion = 60;
     console.log('Timer value forced to 60 seconds');
   }
   ```

## Reporting Issues

When reporting timer-related issues, include:

1. The full debug report (use `await window.timerDebug.logTimerSettings()` and copy the console output)
2. The name of the quiz experiencing issues
3. Steps to reproduce the problem
4. Browser and device information 