const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    console.log('Register attempt:', { 
        body: req.body,
        contentType: req.headers['content-type']
    });

    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            console.log('Missing credentials:', { username: !!username, password: !!password });
            return res.status(400).json({ 
                success: false,
                message: 'Username and password are required' 
            });
        }

        // Check if user exists
        let user = await User.findOne({ username });
        
        if (user) {
            console.log('User already exists:', username);
            return res.status(409).json({ 
                success: false,
                message: 'User already exists' 
            });
        }

        // Create new user
        user = new User({
            username,
            password,
            quizResults: []
        });

        await user.save();
        console.log('User created successfully:', username);

        // Create tokens
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.status(201).json({ 
            success: true,
            message: 'User registered successfully',
            token,
            refreshToken,
            username: user.username
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'production' ? null : error.message
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    console.log('Login attempt:', { 
        body: req.body,
        contentType: req.headers['content-type'],
        origin: req.get('origin')
    });

    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            console.log('Missing credentials:', { username: !!username, password: !!password });
            return res.status(400).json({ 
                success: false,
                message: 'Username and password are required' 
            });
        }

        // Find user
        const user = await User.findOne({ username });
        
        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password for user:', username);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Create tokens
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        console.log('Login successful:', username);
        
        // Set response headers
        res.set({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://bug-training-game.onrender.com',
            'Access-Control-Allow-Credentials': 'true'
        });

        return res.json({ 
            success: true,
            message: 'Login successful',
            token,
            refreshToken,
            username: user.username
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'production' ? null : error.message
        });
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

        // Initialize quizProgress if it doesn't exist
        if (!user.quizProgress) {
            user.quizProgress = new Map();
        }

        // Parse dates if they're strings
        const lastUpdated = progress.lastUpdated ? new Date(progress.lastUpdated) : new Date();

        // Ensure all required fields are present with consistent types
        const updatedProgress = {
            experience: parseInt(progress.experience || 0, 10),
            tools: Array.isArray(progress.tools) ? progress.tools : [],
            questionHistory: Array.isArray(progress.questionHistory) ? progress.questionHistory : [],
            questionsAnswered: parseInt(progress.questionsAnswered || progress.questionHistory?.length || 0, 10),
            currentScenario: progress.currentScenario !== undefined ? 
                           parseInt(progress.currentScenario, 10) : 
                           (parseInt(progress.questionsAnswered || progress.questionHistory?.length || 0, 10) % 5),
            lastUpdated: lastUpdated.toISOString() // Store as ISO string for consistency
        };

        // Update quiz progress
        user.quizProgress.set(quizName, updatedProgress);

        // Also update corresponding quiz result if it exists
        const existingResultIndex = user.quizResults.findIndex(r => r.quizName === quizName);
        if (existingResultIndex !== -1) {
            // Create a new quiz result object with only the fields we want
            user.quizResults[existingResultIndex] = {
                quizName,
                score: Math.round((updatedProgress.experience / 300) * 100), // Calculate score based on max XP of 300
                experience: updatedProgress.experience,
                tools: updatedProgress.tools,
                questionHistory: updatedProgress.questionHistory,
                questionsAnswered: updatedProgress.questionsAnswered,
                currentScenario: updatedProgress.currentScenario,
                completedAt: lastUpdated.toISOString(),
                updatedAt: lastUpdated.toISOString()
            };
        }

        await user.save();
        res.json({ 
            success: true, 
            data: {
                progress: updatedProgress,
                quizResults: user.quizResults
            }
        });
    } catch (error) {
        console.error('Failed to save progress:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save progress',
            error: error.message 
        });
    }
});

router.get('/quiz-progress/:quizName', auth, async (req, res) => {
    try {
        const { quizName } = req.params;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const progress = user.quizProgress ? user.quizProgress.get(quizName) : null;
        
        // If no progress exists, return a default structure
        const responseData = progress ? {
            // Ensure consistent types and data structure with POST route
            experience: parseInt(progress.experience || 0, 10),
            tools: Array.isArray(progress.tools) ? progress.tools : [],
            questionHistory: Array.isArray(progress.questionHistory) ? progress.questionHistory : [],
            questionsAnswered: parseInt(progress.questionsAnswered || progress.questionHistory?.length || 0, 10),
            currentScenario: parseInt(progress.currentScenario || 0, 10),
            lastUpdated: progress.lastUpdated || new Date().toISOString()
        } : {
            experience: 0,
            tools: [],
            questionHistory: [],
            questionsAnswered: 0,
            currentScenario: 0,
            lastUpdated: new Date().toISOString()
        };

        res.json({ success: true, data: responseData });
    } catch (error) {
        console.error('Failed to get progress:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get progress',
            error: error.message 
        });
    }
});

// Verify token endpoint
router.get('/verify-token', auth, async (req, res) => {
    try {
        console.log('Token verification request received');
        // If we get here, the token is valid (auth middleware already verified it)
        const user = await User.findById(req.user.id);
        console.log('User lookup result:', { found: !!user, userId: req.user.id });
        
        if (!user) {
            console.log('User not found for token');
            return res.status(404).json({ 
                success: false, 
                valid: false,
                message: 'User not found' 
            });
        }

        console.log('Token verified successfully for user:', user.username);
        res.json({ 
            success: true, 
            valid: true,
            username: user.username
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ 
            success: false, 
            valid: false,
            message: 'Token verification failed',
            error: process.env.NODE_ENV === 'production' ? undefined : error.message
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

// Update quiz scores
router.post('/quiz-scores', auth, async (req, res) => {
    try {
        const { quizName, score } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Find and update or add new quiz result
        const existingIndex = user.quizResults.findIndex(r => r.quizName === quizName);
        if (existingIndex !== -1) {
            // Only update if new score is higher
            if (score > user.quizResults[existingIndex].score) {
                user.quizResults[existingIndex].score = score;
                user.quizResults[existingIndex].updatedAt = new Date();
            }
        } else {
            user.quizResults.push({
                quizName,
                score,
                completedAt: new Date()
            });
        }

        await user.save();
        res.json({ 
            success: true, 
            message: 'Quiz score updated successfully',
            data: user.quizResults 
        });
    } catch (error) {
        console.error('Error updating quiz score:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update quiz score',
            error: error.message 
        });
    }
});

// Get user data including hidden quizzes
router.get('/data', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Ensure quiz arrays are lowercase for consistent comparison
        const allowedQuizzes = (user.allowedQuizzes || []).map(quiz => quiz.toLowerCase());
        const hiddenQuizzes = (user.hiddenQuizzes || []).map(quiz => quiz.toLowerCase());

        console.log('Sending user data:', {
            username: user.username,
            userType: user.userType,
            allowedQuizzes,
            hiddenQuizzes
        });

        res.json({
            success: true,
            data: {
                username: user.username,
                userType: user.userType || 'regular', // Default to regular if not set
                allowedQuizzes,
                hiddenQuizzes,
                lastLogin: user.lastLogin,
                quizResults: user.quizResults || [],
                quizProgress: user.quizProgress || {}
            }
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user data',
            error: error.message
        });
    }
});

module.exports = router;