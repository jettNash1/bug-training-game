# Cache Busting System

## Overview

This application implements a comprehensive cache busting system to prevent issues caused by old cached files after releases. The system ensures users always get the latest version of scripts, styles, and other resources.

## Components

### 1. Version Management (`frontend/config.js`)

- **APP_VERSION**: Current application version (update this with each release)
- **CACHE_BUST_TIMESTAMP**: Auto-generated timestamp for extra cache busting
- **Version checking utilities**: Functions to compare and manage versions

### 2. Cache Manager (`frontend/scripts/cache-manager.js`)

- **Automatic version detection**: Detects when app version changes
- **Server version checking**: Periodically checks server for new versions
- **Cache clearing**: Clears localStorage, sessionStorage, and browser caches
- **User notifications**: Shows update notifications when new versions are available

### 3. HTML Cache Control Headers

All HTML files include these meta tags:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

### 4. Resource Versioning

All script and CSS imports include version parameters:
```html
<script type="module" src="config.js?v=1.0.0"></script>
<link rel="stylesheet" href="styles.css?v=1.0.0">
```

### 5. Server Version Endpoint (`backend/routes/api.js`)

Provides current version information:
- **Endpoint**: `GET /api/version`
- **Response**: `{ version, timestamp, environment }`

## Release Process

### Before Release

1. **Update Version Numbers**:
   ```bash
   # Update package.json version
   npm version patch  # or minor/major
   
   # Update frontend/config.js
   APP_VERSION: '1.0.1'  # Match package.json
   ```

2. **Test Version System**:
   ```javascript
   // In browser console
   cacheManager.forceVersionCheck();
   ```

### During Release

1. **Deploy Backend First**: Ensures version endpoint is available
2. **Deploy Frontend**: New version will be detected automatically
3. **Monitor**: Check logs for version checking activity

### After Release

1. **Verify Cache Clearing**: Check that users get new version
2. **Monitor User Reports**: Look for any cache-related issues
3. **Update Documentation**: Note any changes to the cache system

## Configuration Options

### Enable/Disable Features

```javascript
// In frontend/config.js
const CONFIG = {
    ENABLE_CACHE_BUSTING: true,           // Add version params to URLs
    ENABLE_VERSION_CHECKING: true,        // Periodic version checks
    FORCE_REFRESH_ON_VERSION_MISMATCH: true,  // Auto-refresh on version change
    VERSION_CHECK_INTERVAL: 30000,        // Check every 30 seconds
};
```

### Preserved Data

During cache clearing, these items are preserved:
- User authentication token (`userToken`)
- Username (`username`)

All other localStorage data is cleared to prevent conflicts.

## User Experience

### Automatic Updates
- System detects version changes automatically
- Clears old cached data
- Refreshes page with new code
- Preserves user login session

### Manual Updates
- Users can see update notifications
- Choice to refresh immediately or later
- Graceful handling of cache clearing failures

## Troubleshooting

### Common Issues

1. **Users Still See Old Version**:
   - Check if version was properly updated in config.js
   - Verify cache control headers are present
   - Check network tab for version parameters

2. **Version Check Failures**:
   - Verify `/api/version` endpoint is working
   - Check for network connectivity issues
   - Review console logs for error messages

3. **Endless Refresh Loops**:
   - Check for version mismatch in config vs server
   - Verify version endpoint returns correct format
   - Review error handling in cache manager

### Debug Commands

```javascript
// Check current version
console.log(CONFIG.APP_VERSION);

// Force version check
cacheManager.forceVersionCheck();

// Check stored version
localStorage.getItem(CONFIG.STORAGE_KEYS.VERSION);

// Clear cache manually
cacheManager.clearCacheAndRefresh();
```

## Maintenance

### Regular Tasks

1. **Update Versions**: With each release
2. **Monitor Logs**: Check for version checking errors
3. **Update Documentation**: Keep this guide current
4. **Test System**: Verify cache busting works correctly

### Performance Considerations

- Version checks run every 30 seconds (configurable)
- Network requests are minimal and cached appropriately
- Cache clearing preserves essential user data
- Loading indicators provide user feedback

## Security Notes

- Version endpoint doesn't expose sensitive information
- Cache clearing preserves authentication data
- No user data is transmitted during version checks
- All operations happen client-side except version retrieval 