// Helper function for consistent quiz name normalization
function normalizeQuizName(quizName) {
    if (!quizName) return '';
    return quizName.toLowerCase().trim();
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
router.get('/guide-settings', async (req, res) => {
    try {
        console.log(`[API] Fetching all guide settings`);
        
        // Get guide settings from database
        const settings = await Setting.findOne({ key: 'guideSettings' });
        
        if (!settings || !settings.value) {
            console.log(`[API] No guide settings found in database`);
            return res.json({
                success: true,
                data: {}
            });
        }
        
        console.log(`[API] Found guide settings for ${Object.keys(settings.value).length} quizzes`);
        
        // Return all guide settings
        res.json({
            success: true,
            data: settings.value
        });
    } catch (error) {
        console.error(`[API] Error fetching all guide settings`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch guide settings'
        });
    }
}); 