const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ username });
        
        if (user) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({
            username,
            password,
            quizResults: []
        });

        await user.save();

        // Create token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            username: user.username
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Create token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.json({ 
            message: 'Login successful',
            token,
            username: user.username
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get quiz results for a specific user
router.get('/:username/quiz-results', async (req, res) => {
    try {
        console.log('Getting quiz results for user:', req.params.username);
        const user = await User.findOne({ username: req.params.username });
        
        if (!user) {
            console.log('User not found:', req.params.username);
            return res.json({ 
                success: true, 
                data: [] 
            });
        }
        
        console.log('Returning quiz results:', user.quizResults);
        res.json({ 
            success: true, 
            data: user.quizResults 
        });
    } catch (error) {
        console.error('Error getting quiz results:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Save quiz results (protected route)
router.post('/quiz-results', auth, async (req, res) => {
    try {
        const { quizName, score, experience, tools, questionHistory } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const quizData = {
            quizName,
            score,
            experience: experience || score,
            tools: tools || [],
            questionHistory: questionHistory || [],
            completedAt: new Date()
        };

        const existingQuizIndex = user.quizResults.findIndex(
            quiz => quiz.quizName === quizName
        );

        if (existingQuizIndex > -1) {
            user.quizResults[existingQuizIndex] = quizData;
        } else {
            user.quizResults.push(quizData);
        }
        
        await user.save();
        res.json({ success: true, data: user.quizResults });
    } catch (error) {
        console.error('Error saving quiz result:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save quiz result',
            error: error.message 
        });
    }
});

// Get all quiz results for authenticated user
router.get('/quiz-results', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ success: true, data: user.quizResults });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add this route to handle saving quiz results
router.post('/:username/quiz-results', async (req, res) => {
    try {
        console.log('Saving quiz result for user:', req.params.username);
        console.log('Quiz data:', req.body);
        
        const { quizName, score, answers } = req.body;
        const user = await User.findOne({ username: req.params.username });
        
        if (!user) {
            console.log('User not found:', req.params.username);
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Add new quiz result
        const quizResult = {
            quizName,
            score,
            completedAt: new Date(),
            answers: answers || []
        };

        // Check if quiz result already exists
        const existingIndex = user.quizResults.findIndex(r => r.quizName === quizName);
        if (existingIndex !== -1) {
            // Update existing result
            user.quizResults[existingIndex] = quizResult;
        } else {
            // Add new result
            user.quizResults.push(quizResult);
        }

        await user.save();
        console.log('Quiz result saved successfully');

        res.json({ 
            success: true, 
            message: 'Quiz result saved successfully',
            quizResults: user.quizResults 
        });
    } catch (error) {
        console.error('Error saving quiz result:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save quiz result',
            error: error.message 
        });
    }
});

module.exports = router;