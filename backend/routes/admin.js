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

        const users = await User.find({}, '-__v')
            .sort({ username: 1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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
                    totalAttempts: { $sum: 1 }
                }
            }
        ]);
        
        res.json({ success: true, stats: { totalUsers, quizStats } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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
        user.quizProgress[quizName] = {
            experience: 0,
            questionHistory: [],
            lastUpdated: new Date()
        };

        // Remove quiz result if it exists
        if (user.quizResults) {
            const initialLength = user.quizResults.length;
            user.quizResults = user.quizResults.filter(result => result.quizName !== quizName);
            console.log(`Removed ${initialLength - user.quizResults.length} quiz results for ${quizName}`);
        }

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
            user.quizResults = user.quizResults.filter(result => result.quizName !== quizName);
            console.log(`Removed ${initialLength - user.quizResults.length} quiz results for ${quizName}`);
        }

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