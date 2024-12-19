const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Admin login
router.post('/login', async (req, res) => {
    try {
        console.log('Admin login attempt:', req.body);
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

        if (username === process.env.ADMIN_USERNAME && 
            password === process.env.ADMIN_PASSWORD) {
            
            const token = jwt.sign(
                { isAdmin: true }, 
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('Admin login successful');
            return res.json({ 
                success: true,
                token,
                message: 'Admin login successful'
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
        const users = await User.find({}, '-__v')
            .sort({ username: 1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/stats', auth, async (req, res) => {
    try {
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

module.exports = router; 