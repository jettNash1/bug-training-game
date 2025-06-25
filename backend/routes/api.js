// Helper function for consistent quiz name normalization
function normalizeQuizName(quizName) {
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

// Guide settings endpoint for frontend quiz access
router.get('/guide-settings/:quizName', async (req, res) => {
    try {
        const { quizName } = req.params;
        console.log(`[API] Fetching guide settings for quiz: ${quizName}`);
        
        // Get guide settings from database
        const settings = await Setting.findOne({ key: 'guideSettings' });
        
        if (!settings || !settings.value) {
            console.log(`[API] No guide settings found in database for quiz: ${quizName}`);
            return res.json({
                success: true,
                data: {
                    url: null,
                    enabled: false
                }
            });
        }
        
        // Get the specific quiz settings
        const normalizedQuizName = normalizeQuizName(quizName);
        const quizSettings = settings.value[normalizedQuizName] || { url: null, enabled: false };
        console.log(`[API] Found guide settings for ${normalizedQuizName}:`, quizSettings);
        
        // Ensure URL and enabled are always present in the response
        const responseData = {
            url: quizSettings.url || null,
            enabled: quizSettings.enabled === true // Ensure boolean
        };
        
        console.log(`[API] Returning guide settings response:`, responseData);
        
        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error(`[API] Error fetching guide settings for quiz: ${req.params.quizName}`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch guide settings'
        });
    }
});

// Get all guide settings at once for frontend
router.get('/guide-settings', auth, async (req, res) => {
    try {
        console.log(`[API] Fetching all guide settings`);
        
        // Get guide settings from database
        const settings = await Setting.findOne({ key: 'guideSettings' });
        console.log('[API] Raw settings from database:', settings);
        
        if (!settings || !settings.value) {
            console.log('[API] No guide settings found in database');
            return res.json({
                success: true,
                data: {}
            });
        }
        
        // Filter out any invalid or disabled guide settings
        const validSettings = {};
        Object.entries(settings.value).forEach(([quiz, setting]) => {
            // Log each setting for debugging
            console.log(`[API] Processing guide setting for ${quiz}:`, {
                setting,
                hasUrl: !!(setting && setting.url),
                urlValid: !!(setting && setting.url && setting.url.match(/^https?:\/\/.+/)),
                enabled: !!(setting && setting.enabled)
            });
            
            // Only include settings that have a valid URL and are enabled
            if (setting && 
                setting.url && 
                setting.url.trim() && 
                setting.url.match(/^https?:\/\/.+/) && 
                setting.enabled === true) {
                validSettings[quiz] = {
                    url: setting.url.trim(),
                    enabled: true
                };
            } else {
                console.log(`[API] Excluding invalid guide setting for ${quiz}`);
            }
        });
        
        console.log(`[API] Found ${Object.keys(validSettings).length} valid guide settings:`, validSettings);
        
        // Return all valid guide settings
        res.json({
            success: true,
            data: validSettings
        });
    } catch (error) {
        console.error('Error fetching guide settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch guide settings'
        });
    }
});

// Public endpoint for guide settings (no authentication required)
router.get('/public/guide-settings', async (req, res) => {
    try {
        console.log(`[API] Fetching all guide settings (public endpoint)`);
        
        // Get guide settings from database
        const settings = await Setting.findOne({ key: 'guideSettings' });
        console.log('[API] Raw settings from database (public):', settings);
        
        if (!settings || !settings.value) {
            console.log('[API] No guide settings found in database (public)');
            return res.json({
                success: true,
                data: {}
            });
        }
        
        // Filter out any invalid or disabled guide settings
        const validSettings = {};
        Object.entries(settings.value).forEach(([quiz, setting]) => {
            // Log each setting for debugging
            console.log(`[API] Processing guide setting for ${quiz} (public):`, {
                setting,
                hasUrl: !!(setting && setting.url),
                urlValid: !!(setting && setting.url && setting.url.match(/^https?:\/\/.+/)),
                enabled: !!(setting && setting.enabled)
            });
            
            // Only include settings that have a valid URL and are enabled
            if (setting && 
                setting.url && 
                setting.url.trim() && 
                setting.url.match(/^https?:\/\/.+/) && 
                setting.enabled === true) {
                validSettings[quiz] = {
                    url: setting.url.trim(),
                    enabled: true
                };
            } else {
                console.log(`[API] Excluding invalid guide setting for ${quiz} (public)`);
            }
        });
        
        console.log(`[API] Found ${Object.keys(validSettings).length} valid guide settings (public):`, validSettings);
        
        // Return all valid guide settings
        res.json({
            success: true,
            data: validSettings
        });
    } catch (error) {
        console.error('Error fetching guide settings (public):', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch guide settings'
        });
    }
});

// Version endpoint for cache busting
router.get('/version', (req, res) => {
    try {
        // Read version from package.json or environment variable
        const packageJson = require('../../package.json');
        const version = process.env.APP_VERSION || packageJson.version || '1.0.0';
        
        res.json({
            version: version,
            timestamp: Date.now(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        console.error('Error getting version:', error);
        res.json({
            version: '1.0.0',
            timestamp: Date.now(),
            environment: 'unknown'
        });
    }
}); 