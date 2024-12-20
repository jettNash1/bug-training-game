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

        // Create tokens
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            refreshToken,
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

        // Create tokens
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.json({ 
            message: 'Login successful',
            token,
            refreshToken,
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
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const quizData = {
            quizName,
            score: Math.round(score),
            experience: Math.round(experience || score),
            tools: tools || [],
            questionHistory: questionHistory || [],
            completedAt: new Date()
        };

        // Find and update or add new quiz result
        const existingIndex = user.quizResults.findIndex(r => r.quizName === quizName);
        if (existingIndex !== -1) {
            // Only update if new score is higher
            if (score > user.quizResults[existingIndex].score) {
                user.quizResults[existingIndex] = quizData;
            }
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

router.post('/quiz-progress', auth, async (req, res) => {
    try {
        const { quizName, progress } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Add or update quiz progress
        if (!user.quizProgress) {
            user.quizProgress = {};
        }
        user.quizProgress[quizName] = {
            ...progress,
            lastUpdated: new Date()
        };

        await user.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to save progress:', error);
        res.status(500).json({ error: 'Failed to save progress' });
    }
});

router.get('/quiz-progress/:quizName', auth, async (req, res) => {
    try {
        const { quizName } = req.params;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const progress = user.quizProgress ? user.quizProgress[quizName] : null;
        res.json({ success: true, data: progress });
    } catch (error) {
        console.error('Failed to get progress:', error);
        res.status(500).json({ success: false, error: 'Failed to get progress' });
    }
});

// Verify token endpoint
router.get('/verify-token', auth, async (req, res) => {
    try {
        // If we get here, the token is valid (auth middleware already verified it)
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        res.json({ 
            success: true, 
            valid: true,
            username: user.username
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ 
            success: false, 
            valid: false 
        });
    }
});

// Refresh token endpoint
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ 
                success: false, 
                message: 'No refresh token provided' 
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Create new access token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ 
            success: true, 
            token,
            username: user.username
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Invalid refresh token' 
        });
    }
});

// Sync endpoint for offline data
router.post('/sync', auth, async (req, res) => {
    try {
        const { username, quizResults, timestamp } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Only update if the sync data is newer than existing data
        const syncTime = new Date(timestamp);
        
        quizResults.forEach(newResult => {
            const existingIndex = user.quizResults.findIndex(r => r.quizName === newResult.quizName);
            
            if (existingIndex === -1) {
                // New quiz result
                user.quizResults.push(newResult);
            } else {
                // Compare timestamps if existing result has one
                const existingResult = user.quizResults[existingIndex];
                const existingTime = existingResult.completedAt ? new Date(existingResult.completedAt) : new Date(0);
                
                if (syncTime > existingTime) {
                    user.quizResults[existingIndex] = newResult;
                }
            }
        });

        await user.save();
        res.json({ success: true, data: user.quizResults });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ success: false, message: 'Failed to sync data' });
    }
});

module.exports = router;