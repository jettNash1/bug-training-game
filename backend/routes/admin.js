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
        }).lean().sort({ username: 1 });

        // Update quiz results with progress data
        const populatedUsers = users.map(user => {
            const userData = { ...user };
            userData.quizResults = userData.quizResults || [];

            // Update each quiz result with its corresponding progress data
            userData.quizResults = userData.quizResults.map(result => {
                if (!result || !result.quizName) {
                    console.warn('Invalid quiz result:', result);
                    return null;
                }

                try {
                    const quizNameLower = String(result.quizName).toLowerCase();
                    const progress = userData.quizProgress?.[quizNameLower];
                    
                    // Calculate questions answered and experience
                    let questionsAnswered = 0;
                    let experience = 0;

                    // First try to get data from progress (new format)
                    if (progress) {
                        questionsAnswered = progress.questionsAnswered || 
                            (Array.isArray(progress.questionHistory) ? progress.questionHistory.length : 0);
                        experience = progress.experience || 0;
                    }

                    // If no progress data, try to get from result (old format)
                    if (!questionsAnswered && result.score) {
                        // For old data, if there's a score, calculate questions based on it
                        questionsAnswered = Math.ceil((result.score / 100) * 15); // 15 is total questions
                        experience = Math.ceil((result.score / 100) * 300); // 300 is max XP
                    }

                    return {
                        ...result,
                        quizName: quizNameLower,
                        questionsAnswered,
                        experience,
                        score: Number(result.score) || 0,
                        lastActive: result.lastActive || result.completedAt || null
                    };
                } catch (error) {
                    console.error('Error processing quiz result:', error);
                    return null;
                }
            }).filter(Boolean); // Remove null entries

            // Process quiz progress
            if (userData.quizProgress) {
                const processedProgress = {};
                Object.entries(userData.quizProgress).forEach(([key, value]) => {
                    try {
                        const quizNameLower = String(key).toLowerCase();
                        processedProgress[quizNameLower] = {
                            questionsAnswered: Number(value.questionsAnswered) || 0,
                            experience: Number(value.experience) || 0,
                            lastUpdated: value.lastUpdated || null
                        };
                    } catch (error) {
                        console.error('Error processing quiz progress:', error);
                    }
                });
                userData.quizProgress = processedProgress;
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
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { username, quizName } = req.params;
        if (!quizName) {
            return res.status(400).json({
                success: false,
                message: 'Quiz name is required'
            });
        }

        console.log('Attempting to reset quiz progress:', { username, quizName });

        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate all possible variations of the quiz name
        const quizVariations = [
            quizName.toLowerCase(),                                    // lowercase
            quizName.toUpperCase(),                                    // uppercase
            quizName.replace(/-/g, ''),                               // no hyphens
            quizName.replace(/([A-Z])/g, '-$1').toLowerCase(),        // kebab-case
            quizName.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), // camelCase
            quizName.replace(/-/g, '_'),                              // snake_case
            // Special handling for CMS
            quizName.toLowerCase().includes('cms') ? 
                [
                    'CMS-Testing',
                    'cms-testing',
                    'cmsTesting',
                    'CMS_Testing',
                    'cms_testing'
                ] : []
        ].flat();

        // Reset quiz progress for all variations
        if (!user.quizProgress) {
            user.quizProgress = new Map();
        }

        // Delete all variations from quiz progress
        quizVariations.forEach(variant => {
            user.quizProgress.delete(variant);
        });

        // Remove quiz results for all variations
        if (user.quizResults) {
            const initialLength = user.quizResults.length;
            user.quizResults = user.quizResults.filter(result => {
                if (!result || !result.quizName) return false;
                return !quizVariations.includes(result.quizName);
            });
            console.log(`Removed ${initialLength - user.quizResults.length} quiz results`);
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

// Get quiz questions for a user
router.get('/users/:username/quiz-questions/:quizName', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { username, quizName } = req.params;
        console.log(`Fetching quiz questions for ${username}, quiz: ${quizName}`);

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`User ${username} not found`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Normalize quiz name - handle both camelCase and hyphenated formats
        const normalizedQuizName = quizName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
        console.log('Normalized quiz name:', normalizedQuizName);

        // Get quiz progress data - try both normalized and original formats
        const progress = user.quizProgress?.get(normalizedQuizName) || user.quizProgress?.get(quizName);
        console.log('Found quiz progress:', progress);

        // Get quiz results data - try both normalized and original formats
        const quizResult = user.quizResults?.find(result => {
            if (!result?.quizName) return false;
            try {
                const resultQuizName = String(result.quizName).replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
                return resultQuizName === normalizedQuizName || result.quizName === quizName;
            } catch (error) {
                console.error('Error comparing quiz names:', error);
                return false;
            }
        });
        console.log('Found quiz result:', quizResult);

        // Combine question history from both sources
        let questionHistory = [];

        // First try to get from progress (new format)
        if (progress?.questionHistory && Array.isArray(progress.questionHistory)) {
            questionHistory = progress.questionHistory;
            console.log('Using question history from progress:', questionHistory.length);
        }
        // If no progress history, try from quiz result (old format)
        else if (quizResult?.questionHistory && Array.isArray(quizResult.questionHistory)) {
            questionHistory = quizResult.questionHistory;
            console.log('Using question history from quiz result:', questionHistory.length);
        }

        console.log(`Found ${questionHistory.length} questions for ${username}/${quizName}`);
        
        // Format the question history for display
        const formattedHistory = questionHistory.map((record, index) => {
            try {
                if (!record || !record.scenario || !record.selectedAnswer) {
                    console.warn('Invalid record structure:', record);
                    return null;
                }

                return {
                    id: record.scenario.id || index + 1,
                    scenario: {
                        title: record.scenario.title || 'Untitled',
                        description: record.scenario.description || '',
                        level: record.scenario.level || 'Basic'
                    },
                    selectedAnswer: {
                        text: record.selectedAnswer.text || '',
                        outcome: record.selectedAnswer.outcome || '',
                        experience: Number(record.selectedAnswer.experience) || 0,
                        tool: record.selectedAnswer.tool || ''
                    },
                    status: record.selectedAnswer.experience > 0 ? 'passed' : 'failed'
                };
            } catch (error) {
                console.error('Error formatting record:', error);
                return null;
            }
        }).filter(Boolean);

        // Return the formatted question history
        res.json({
            success: true,
            data: {
                questionHistory: formattedHistory,
                totalQuestions: formattedHistory.length,
                quizName: normalizedQuizName,
                score: quizResult?.score || 0,
                experience: progress?.experience || quizResult?.experience || 0,
                lastActive: progress?.lastUpdated || quizResult?.lastActive || null
            }
        });
    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch quiz questions',
            error: error.message 
        });
    }
});

// Delete a user
router.delete('/users/:username', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { username } = req.params;
        console.log(`Attempting to delete user: ${username}`);

        // Find and delete the user
        const result = await User.findOneAndDelete({ username });
        
        if (!result) {
            console.log(`User ${username} not found`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log(`Successfully deleted user: ${username}`);
        res.json({
            success: true,
            message: `User ${username} has been deleted`,
            deletedUser: result
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
});

module.exports = router; 