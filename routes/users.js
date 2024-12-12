const express = require('express');
const router = express.Router();
const User = require('../quiz-backend/models/user.model');
const jwt = require('jsonwebtoken');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ username });
        
        if (user) {
            return res.status(409).json({ 
                message: 'User already exists',
                token: jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            });
        }

        // Create new user
        user = new User({
            username,
            quizResults: []
        });

        await user.save();

        // Create token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.status(201).json({ 
            message: 'User registered successfully',
            token 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's quiz results
router.get('/:username/quiz-results', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ quizResults: user.quizResults });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Save quiz results
router.post('/quiz-results', auth, async (req, res) => {
    try {
        const { quizName, score, experience, tools, questionHistory } = req.body;
        const user = await User.findById(req.user.id);
        
        // Update existing quiz result or add new one
        const existingQuizIndex = user.quizResults.findIndex(
            quiz => quiz.quizName === quizName
        );
        
        const quizData = {
            quizName,
            score,
            experience,
            tools,
            questionHistory,
            completedAt: new Date()
        };

        if (existingQuizIndex > -1) {
            user.quizResults[existingQuizIndex] = quizData;
        } else {
            user.quizResults.push(quizData);
        }
        
        await user.save();
        res.json({ success: true, data: user.quizResults });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user's quiz results
router.get('/quiz-results', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ success: true, data: user.quizResults });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;