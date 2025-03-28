// Guide settings endpoint for frontend quiz access
router.get('/guide-settings/:quizName', auth, async (req, res) => {
    try {
        const { quizName } = req.params;
        console.log(`[API] Fetching guide settings for quiz: ${quizName}, User: ${req.userId}`);
        
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
        const quizSettings = settings.value[quizName] || { url: null, enabled: false };
        console.log(`[API] Found guide settings for ${quizName}:`, quizSettings);
        
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