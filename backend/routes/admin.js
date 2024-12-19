const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const auth = require('../middleware/auth');

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