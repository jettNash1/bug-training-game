const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Admin token verification
router.get('/verify-token', async (req, res) => {
    try {
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                valid: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded.isAdmin) {
            return res.status(403).json({
                success: false,
                valid: false,
                message: 'Not an admin token'
            });
        }

        return res.json({
            success: true,
            valid: true,
            isAdmin: true
        });
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            valid: false,
            message: 'Invalid token'
        });
    }
});

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Debug log to check environment variables
        console.log('Checking credentials. Expected:', {
            expectedUser: process.env.ADMIN_USERNAME,
            hasPassword: !!process.env.ADMIN_PASSWORD,
            hasSecret: !!process.env.JWT_SECRET
        });
        
        // Check against environment variables
        if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
            console.error('Missing required environment variables');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }

        // Strict comparison for admin credentials
        if (username === process.env.ADMIN_USERNAME && 
            password === process.env.ADMIN_PASSWORD) {
            
            // Generate admin-specific token with isAdmin flag
            const token = jwt.sign(
                { 
                    isAdmin: true,
                    username: process.env.ADMIN_USERNAME
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('Admin login successful');
            return res.json({ 
                success: true,
                token,
                message: 'Admin login successful',
                isAdmin: true
            });
        } else {
            console.log('Admin login failed: Invalid credentials');
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid admin credentials' 
            });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error during admin login',
            error: error.message
        });
    }
});

router.get('/users', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        console.log('Fetching users with quiz data...');

        // Get all users with their quiz data
        const users = await User.find({}, {
            username: 1,
            lastLogin: 1,
            quizResults: 1,
            quizProgress: 1,
            _id: 0
        }).lean().sort({ username: 1 });

        console.log(`Found ${users.length} users`);

        // Update quiz results with progress data
        const populatedUsers = users.map(user => {
            console.log(`\nProcessing user: ${user.username}`);
            console.log('Raw quiz results:', user.quizResults);
            console.log('Raw quiz progress:', user.quizProgress);

            const userData = { ...user };
            userData.quizResults = userData.quizResults || [];

            // Update each quiz result with its corresponding progress data
            userData.quizResults = userData.quizResults.map(result => {
                if (!result || !result.quizName) {
                    console.warn('Invalid quiz result found:', result);
                    return null;
                }
                
                const normalizedQuizName = result.quizName.toLowerCase().replace(/[^a-z0-9-]/g, '');
                console.log(`Processing quiz: ${result.quizName} (normalized: ${normalizedQuizName})`);
                
                const progress = userData.quizProgress?.[normalizedQuizName] || 
                                userData.quizProgress?.[result.quizName] ||
                                userData.quizProgress?.[result.quizName.toLowerCase()];
                
                console.log('Found progress data:', progress);
                
                // Calculate questions answered and experience
                let questionsAnswered = 0;
                let experience = 0;

                // First try to get data from progress (new format)
                if (progress) {
                    questionsAnswered = progress.questionsAnswered || 
                        (Array.isArray(progress.questionHistory) ? progress.questionHistory.length : 0);
                    experience = progress.experience || 0;
                    console.log('Using progress data:', { questionsAnswered, experience });
                }

                // If no progress data, try to get from result (old format)
                if (!questionsAnswered && result.score) {
                    // For old data, if there's a score, calculate questions based on it
                    questionsAnswered = Math.ceil((result.score / 100) * 15); // 15 is total questions
                    experience = Math.ceil((result.score / 100) * 300); // 300 is max XP
                    console.log('Using calculated data from score:', { questionsAnswered, experience });
                }

                const updatedResult = {
                    ...result,
                    questionsAnswered,
                    experience
                };
                console.log('Final result data:', updatedResult);
                return updatedResult;
            }).filter(result => result !== null); // Remove any invalid results

            // Remove quizProgress from response since it's not needed
            delete userData.quizProgress;
            return userData;
        });

        console.log('\nSending response with populated users data');
        res.json({
            success: true,
            users: populatedUsers
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch users',
            error: error.message 
        });
    }
});

router.get('/stats', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const totalUsers = await User.countDocuments();
        const quizStats = await User.aggregate([
            { $unwind: '$quizResults' },
            { 
                $group: {
                    _id: '$quizResults.quizName',
                    avgScore: { $avg: '$quizResults.score' },
                    totalAttempts: { $sum: 1 },
                    avgExperience: { $avg: '$quizResults.experience' }
                }
            }
        ]);
        
        res.json({ success: true, stats: { totalUsers, quizStats } });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch stats',
            error: error.message 
        });
    }
});

// Reset a user's quiz progress
router.post('/users/:username/quiz-progress/:quizName/reset', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { username, quizName } = req.params;
        console.log('Attempting to reset quiz progress:', { username, quizName });

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Reset quiz progress
        if (!user.quizProgress) {
            user.quizProgress = {};
        }

        // Completely remove the quiz progress
        delete user.quizProgress[quizName];

        // Remove quiz result if it exists
        if (user.quizResults) {
            const initialLength = user.quizResults.length;
            user.quizResults = user.quizResults.filter(result => {
                // Handle both camelCase and hyphenated formats
                const normalizedQuizName = result.quizName
                    .replace(/([A-Z])/g, '-$1')
                    .toLowerCase()
                    .replace(/^-/, '');
                return normalizedQuizName !== quizName.toLowerCase() &&
                       result.quizName !== quizName;
            });
            console.log(`Removed ${initialLength - user.quizResults.length} quiz results for ${quizName}`);
        }

        // Save the updated user document
        await user.save();
        console.log('Successfully reset quiz progress for:', { username, quizName });
        
        res.json({ 
            success: true,
            message: `Quiz progress reset for user ${username}`,
            user: user
        });
    } catch (error) {
        console.error('Error resetting quiz progress:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to reset quiz progress',
            error: error.message
        });
    }
});

// Reset a user's quiz score
router.post('/users/:username/quiz-scores/reset', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            console.log('Non-admin user attempted to reset quiz score');
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { username } = req.params;
        const { quizName } = req.body;
        console.log('Attempting to reset quiz score:', { username, quizName, body: req.body });

        // Validate input
        if (!username || !quizName) {
            console.log('Missing required fields:', { username, quizName });
            return res.status(400).json({
                success: false,
                message: 'Username and quiz name are required'
            });
        }

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Initialize arrays if they don't exist
        if (!user.quizResults) user.quizResults = [];
        if (!user.quizProgress) user.quizProgress = {};

        // Normalize quiz name for consistency
        const normalizedQuizName = quizName.toLowerCase().replace(/[^a-z0-9-]/g, '');
        console.log('Quiz reset details:', {
            originalQuizName: quizName,
            normalizedQuizName,
            hasQuizResults: user.quizResults.length > 0,
            hasQuizProgress: Object.keys(user.quizProgress).length > 0
        });

        // Remove quiz result if it exists
        const initialResultsLength = user.quizResults.length;
        user.quizResults = user.quizResults.filter(result => {
            const resultNormalizedName = result.quizName.toLowerCase().replace(/[^a-z0-9-]/g, '');
            return resultNormalizedName !== normalizedQuizName;
        });
        console.log(`Removed ${initialResultsLength - user.quizResults.length} quiz results for ${normalizedQuizName}`);

        // Remove quiz progress
        const progressKeys = Object.keys(user.quizProgress);
        let removedProgress = false;
        for (const key of progressKeys) {
            const normalizedKey = key.toLowerCase().replace(/[^a-z0-9-]/g, '');
            if (normalizedKey === normalizedQuizName) {
                delete user.quizProgress[key];
                removedProgress = true;
                console.log(`Removed progress for key: ${key}`);
            }
        }

        // Save the updated user document
        await user.save();
        console.log('Successfully reset quiz data:', {
            username,
            quizName: normalizedQuizName,
            removedResults: initialResultsLength - user.quizResults.length,
            removedProgress
        });
        
        res.json({ 
            success: true,
            message: `Quiz score reset for user ${username}`,
            data: {
                username,
                quizName: normalizedQuizName,
                remainingQuizzes: Object.keys(user.quizProgress)
            }
        });
    } catch (error) {
        console.error('Error resetting quiz score:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to reset quiz score',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                body: req.body,
                params: req.params
            } : undefined
        });
    }
});

// Reset quiz progress for a user
router.post('/reset-quiz-progress', auth, async (req, res) => {
    try {
        const { username, quizName } = req.body;
        console.log('Attempting to reset quiz progress:', { username, quizName });

        // Verify admin status
        const admin = await User.findById(req.user.id);
        if (!admin?.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized - Admin access required' 
            });
        }

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Normalize quiz name for consistency
        const normalizedQuizName = quizName.toLowerCase().replace(/[^a-z0-9-]/g, '');
        console.log(`Normalized quiz name: ${normalizedQuizName}`);

        // Initialize quizProgress if it doesn't exist
        if (!user.quizProgress) {
            user.quizProgress = {};
        }

        // Remove the quiz progress
        if (user.quizProgress[normalizedQuizName]) {
            delete user.quizProgress[normalizedQuizName];
            console.log(`Deleted progress for quiz: ${normalizedQuizName}`);
        }

        // Remove or reset the quiz result
        const quizResultIndex = user.quizResults.findIndex(
            result => result.quizName.toLowerCase().replace(/[^a-z0-9-]/g, '') === normalizedQuizName
        );

        if (quizResultIndex !== -1) {
            user.quizResults.splice(quizResultIndex, 1);
            console.log(`Removed quiz result for: ${normalizedQuizName}`);
        }

        await user.save();
        console.log('Successfully reset quiz progress');

        res.json({ 
            success: true, 
            message: 'Quiz progress reset successfully',
            data: {
                username,
                quizName: normalizedQuizName,
                remainingQuizzes: Object.keys(user.quizProgress)
            }
        });
    } catch (error) {
        console.error('Failed to reset quiz progress:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to reset quiz progress',
            error: error.message,
            stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
        });
    }
});

module.exports = router; 