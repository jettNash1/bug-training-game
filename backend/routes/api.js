// Guide settings endpoint for frontend quiz access
router.get('/guide-settings/:quizName', auth, async (req, res) => {
    try {
        const { quizName } = req.params;
        
        // Get guide settings from database
        const settings = await Setting.findOne({ key: 'guideSettings' });
        
        if (!settings || !settings.value) {
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
        
        res.json({
            success: true,
            data: quizSettings
        });
    } catch (error) {
        console.error('Error fetching guide settings for quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch guide settings'
        });
    }
}); 