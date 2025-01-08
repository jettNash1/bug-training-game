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

        // Get all users with their quiz data
        const users = await User.find({}, {
            username: 1,
            lastLogin: 1,
            quizResults: 1,
            quizProgress: 1,
            _id: 0
        }).sort({ username: 1 });

        // Ensure all quiz data is properly populated
        const populatedUsers = users.map(user => {
            const userData = user.toObject();
            
            // Ensure quizResults array exists
            if (!userData.quizResults) {
                userData.quizResults = [];
            }

            // Process each quiz result to ensure question completion data
            userData.quizResults = userData.quizResults.map(result => {
                const quizProgress = userData.quizProgress?.[result.quizName];
                return {
                    ...result,
                    questionsAnswered: quizProgress?.questionHistory?.length || 0,
                    experience: quizProgress?.experience || 0,
                    lastActive: quizProgress?.lastUpdated || result.completedAt,
                };
            });

            // Add missing quiz results from quizProgress
            if (userData.quizProgress) {
                Object.entries(userData.quizProgress).forEach(([quizName, progress]) => {
                    const existingResult = userData.quizResults.find(r => r.quizName === quizName);
                    if (!existingResult && progress) {
                        userData.quizResults.push({
                            quizName,
                            score: Math.round((progress.experience / 300) * 100), // Calculate score based on max XP of 300
                            experience: progress.experience || 0,
                            questionsAnswered: progress.questionHistory?.length || 0,
                            lastActive: progress.lastUpdated,
                            completedAt: progress.lastUpdated
                        });
                    }
                });
            }

            return userData;
        });

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
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { username } = req.params;
        const { quizName } = req.body;
        console.log('Attempting to reset quiz score:', { username, quizName });

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

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

        // Also ensure quiz progress is reset
        if (user.quizProgress) {
            delete user.quizProgress[quizName];
        }

        // Save the updated user document
        await user.save();
        console.log('Successfully reset quiz score for:', { username, quizName });
        
        res.json({ 
            success: true,
            message: `Quiz score reset for user ${username}`,
            user: user
        });
    } catch (error) {
        console.error('Error resetting quiz score:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to reset quiz score',
            error: error.message
        });
    }
});

module.exports = router; 