const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

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
            userType: 1,
            allowedQuizzes: 1,
            hiddenQuizzes: 1,
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

                // Find the correct answer (the one with the highest experience)
                let correctAnswer = null;
                if (record.scenario.options && Array.isArray(record.scenario.options)) {
                    correctAnswer = record.scenario.options.reduce((prev, current) => 
                        (prev.experience > current.experience) ? prev : current, 
                        { experience: -Infinity }
                    );
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
                    correctAnswer: correctAnswer ? {
                        text: correctAnswer.text || '',
                        experience: Number(correctAnswer.experience) || 0
                    } : null,
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

// Toggle quiz visibility for a user
router.post('/users/:username/quiz-visibility/:quizName', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { username, quizName } = req.params;
        const { isVisible } = req.body;

        if (typeof isVisible !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isVisible must be a boolean value'
            });
        }

        console.log(`Updating visibility for ${username}'s quiz ${quizName}: isVisible=${isVisible}`);

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const normalizedQuizName = quizName.toLowerCase();
        const isInterviewAccount = user.userType === 'interview_candidate';

        if (isInterviewAccount) {
            // Initialize allowedQuizzes array if it doesn't exist
            if (!user.allowedQuizzes) {
                user.allowedQuizzes = [];
            }

            const quizIndex = user.allowedQuizzes.indexOf(normalizedQuizName);

            if (isVisible && quizIndex === -1) {
                // Add to allowed quizzes if visible and not already allowed
                user.allowedQuizzes.push(normalizedQuizName);
            } else if (!isVisible && quizIndex !== -1) {
                // Remove from allowed quizzes if not visible and currently allowed
                user.allowedQuizzes.splice(quizIndex, 1);
            }
        } else {
            // Regular account - use hiddenQuizzes
            // Initialize hiddenQuizzes array if it doesn't exist
            if (!user.hiddenQuizzes) {
                user.hiddenQuizzes = [];
            }

            const quizIndex = user.hiddenQuizzes.indexOf(normalizedQuizName);

            if (!isVisible && quizIndex === -1) {
                // Add to hidden quizzes if not visible and not already hidden
                user.hiddenQuizzes.push(normalizedQuizName);
            } else if (isVisible && quizIndex !== -1) {
                // Remove from hidden quizzes if visible and currently hidden
                user.hiddenQuizzes.splice(quizIndex, 1);
            }
        }

        await user.save();

        res.json({
            success: true,
            message: `Quiz visibility updated for ${username}`,
            allowedQuizzes: user.allowedQuizzes,
            hiddenQuizzes: user.hiddenQuizzes
        });
    } catch (error) {
        console.error('Error updating quiz visibility:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update quiz visibility',
            error: error.message
        });
    }
});

// Create interview account
router.post('/create-interview-account', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { username, password, allowedQuizzes, hiddenQuizzes } = req.body;

        if (!username || !password || !allowedQuizzes) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, and allowed quizzes are required'
            });
        }

        // Check if user already exists
        let existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Get all available quiz names
        const allQuizzes = [
            'communication', 'initiative', 'time-management', 'tester-mindset',
            'risk-analysis', 'risk-management', 'non-functional', 'test-support',
            'issue-verification', 'build-verification', 'issue-tracking-tools',
            'raising-tickets', 'reports', 'cms-testing', 'email-testing', 'content-copy',
            'locale-testing', 'script-metrics-troubleshooting','standard-script-testing',
            'test-types-tricks', 'automation-interview', 'fully-scripted', 'exploratory',
            'sanity-smoke'
        ].map(quiz => quiz.toLowerCase());

        // Normalize allowed quizzes to lowercase
        const normalizedAllowedQuizzes = allowedQuizzes.map(quiz => quiz.toLowerCase());

        // If hiddenQuizzes is not provided, create it from allowedQuizzes
        const normalizedHiddenQuizzes = hiddenQuizzes ? 
            hiddenQuizzes.map(quiz => quiz.toLowerCase()) :
            allQuizzes.filter(quiz => !normalizedAllowedQuizzes.includes(quiz));

        // Validate that all quizzes are valid
        const invalidAllowedQuizzes = normalizedAllowedQuizzes.filter(quiz => !allQuizzes.includes(quiz));
        const invalidHiddenQuizzes = normalizedHiddenQuizzes.filter(quiz => !allQuizzes.includes(quiz));

        if (invalidAllowedQuizzes.length > 0 || invalidHiddenQuizzes.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quiz names provided'
            });
        }

        // Create new interview user
        const user = new User({
            username,
            password,
            userType: 'interview_candidate',
            allowedQuizzes: normalizedAllowedQuizzes,
            hiddenQuizzes: normalizedHiddenQuizzes
        });

        await user.save();

        res.json({
            success: true,
            message: 'Interview account created successfully',
            user: {
                username: user.username,
                userType: user.userType,
                allowedQuizzes: user.allowedQuizzes,
                hiddenQuizzes: user.hiddenQuizzes
            }
        });
    } catch (error) {
        console.error('Error creating interview account:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create interview account',
            error: error.message
        });
    }
});

// Register a user (admin only)
router.post('/register-user', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update the user's password
        existingUser.password = password;
        await existingUser.save();

        res.json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register user',
            error: error.message
        });
    }
});

// Reset user password
router.put('/users/:username/reset-password', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { username } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'New password is required'
            });
        }

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update password
        user.password = password;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
            error: error.message
        });
    }
});

// Get quiz scenarios
router.get('/quizzes/:quizName/scenarios', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { quizName } = req.params;
        
        if (!quizName) {
            return res.status(400).json({
                success: false,
                message: 'Quiz name is required'
            });
        }

        console.log(`Fetching scenarios for quiz: ${quizName}`);

        try {
            // Normalize the quiz name to match file naming conventions
            let normalizedQuizName = quizName.toLowerCase();
            
            // Determine the file path
            let filePath;
            
            // Special case for CMS-Testing-quiz.js which has a different filename
            if (normalizedQuizName === 'cms-testing') {
                filePath = path.resolve(__dirname, '../../frontend/quizzes/CMS-Testing-quiz.js');
            } else {
                filePath = path.resolve(__dirname, `../../frontend/quizzes/${normalizedQuizName}-quiz.js`);
            }
            
            console.log(`Attempting to read quiz file from: ${filePath}`);
            
            // Check if file exists
            try {
                await fs.access(filePath);
            } catch (error) {
                console.error(`File not found: ${filePath}`);
                return res.status(404).json({
                    success: false,
                    message: `Quiz file not found: ${normalizedQuizName}-quiz.js`
                });
            }
            
            // Read the file content
            const fileContent = await fs.readFile(filePath, 'utf8');
            
            // Extract scenarios using regex
            const extractScenarios = (prefix) => {
                try {
                    // Try different regex patterns to match the scenarios
                    const patterns = [
                        // Standard pattern with this.prefix = [...]
                        new RegExp(`${prefix}\\s*=\\s*\\[(.*?)\\];`, 's'),
                        // Alternative pattern with this.prefix = [ ... ]
                        new RegExp(`${prefix}\\s*=\\s*\\[(.*?)\\]`, 's'),
                        // Pattern for static class properties
                        new RegExp(`static\\s+${prefix.replace('this.', '')}\\s*=\\s*\\[(.*?)\\];`, 's')
                    ];
                    
                    for (const regex of patterns) {
                        const match = fileContent.match(regex);
                        if (match && match[1]) {
                            console.log(`Found match for ${prefix} using pattern: ${regex}`);
                            
                            try {
                                // Try to parse as JSON
                                return JSON.parse(`[${match[1]}]`);
                            } catch (e) {
                                console.warn(`Could not parse ${prefix} from source as JSON: ${e.message}`);
                                
                                // If JSON parsing fails, try to extract the basic structure
                                try {
                                    // Extract scenario objects using a more lenient approach
                                    const scenarioText = match[1];
                                    const scenarios = [];
                                    
                                    // Use regex to find individual scenario objects
                                    const scenarioRegex = /\{\s*id:\s*(\d+),\s*level:\s*['"]([^'"]+)['"]/g;
                                    let scenarioMatch;
                                    
                                    while ((scenarioMatch = scenarioRegex.exec(scenarioText)) !== null) {
                                        const id = parseInt(scenarioMatch[1]);
                                        const level = scenarioMatch[2];
                                        
                                        // Find the title and description
                                        const titleMatch = /title:\s*['"]([^'"]+)['"]/g.exec(scenarioText.substring(scenarioMatch.index));
                                        const descriptionMatch = /description:\s*['"]([^'"]+)['"]/g.exec(scenarioText.substring(scenarioMatch.index));
                                        
                                        const title = titleMatch ? titleMatch[1] : 'Unknown Title';
                                        const description = descriptionMatch ? descriptionMatch[1] : 'Unknown Description';
                                        
                                        // Extract options array
                                        let optionsText = '';
                                        const optionsStartIndex = scenarioText.indexOf('options:', scenarioMatch.index);
                                        if (optionsStartIndex !== -1) {
                                            // Find the opening bracket of the options array
                                            const optionsArrayStart = scenarioText.indexOf('[', optionsStartIndex);
                                            if (optionsArrayStart !== -1) {
                                                // Find the closing bracket of the options array by counting brackets
                                                let bracketCount = 1;
                                                let optionsArrayEnd = optionsArrayStart + 1;
                                                
                                                while (bracketCount > 0 && optionsArrayEnd < scenarioText.length) {
                                                    if (scenarioText[optionsArrayEnd] === '[') bracketCount++;
                                                    if (scenarioText[optionsArrayEnd] === ']') bracketCount--;
                                                    optionsArrayEnd++;
                                                }
                                                
                                                if (bracketCount === 0) {
                                                    optionsText = scenarioText.substring(optionsArrayStart + 1, optionsArrayEnd - 1);
                                                }
                                            }
                                        }
                                        
                                        // Extract individual options
                                        const options = [];
                                        const optionRegex = /\{\s*text:\s*['"]([^'"]+)['"]/g;
                                        let optionMatch;
                                        let optionIndex = 0;
                                        
                                        while ((optionMatch = optionRegex.exec(optionsText)) !== null) {
                                            const optionText = optionMatch[1];
                                            
                                            // Find outcome
                                            const outcomeMatch = /outcome:\s*['"]([^'"]+)['"]/g.exec(optionsText.substring(optionMatch.index));
                                            const outcome = outcomeMatch ? outcomeMatch[1] : '';
                                            
                                            // Find experience
                                            const experienceMatch = /experience:\s*(-?\d+)/g.exec(optionsText.substring(optionMatch.index));
                                            const experience = experienceMatch ? parseInt(experienceMatch[1]) : 0;
                                            
                                            // Find tool if available
                                            const toolMatch = /tool:\s*['"]([^'"]+)['"]/g.exec(optionsText.substring(optionMatch.index));
                                            const tool = toolMatch ? toolMatch[1] : '';
                                            
                                            options.push({
                                                text: optionText,
                                                outcome: outcome,
                                                experience: experience,
                                                tool: tool,
                                                isCorrect: experience > 0
                                            });
                                            
                                            optionIndex++;
                                        }
                                        
                                        // If we couldn't extract options, provide a placeholder
                                        if (options.length === 0) {
                                            options.push({
                                                text: 'Option details not available in simplified view',
                                                outcome: 'View the quiz file directly to see all options and outcomes',
                                                experience: 0,
                                                isCorrect: false
                                            });
                                        }
                                        
                                        // Create a scenario object with the extracted data
                                        scenarios.push({
                                            id,
                                            level,
                                            title,
                                            description,
                                            options: options,
                                            note: options.length > 0 && options[0].text !== 'Option details not available in simplified view' ? 
                                                  undefined : 
                                                  'This is a simplified view. Some JavaScript features in the quiz file prevented full parsing.'
                                        });
                                    }
                                    
                                    if (scenarios.length > 0) {
                                        console.log(`Extracted ${scenarios.length} scenarios using simplified approach for ${prefix}`);
                                        return scenarios;
                                    }
                                } catch (extractError) {
                                    console.warn(`Failed to extract scenarios using simplified approach: ${extractError.message}`);
                                }
                            }
                        }
                    }
                    
                    console.warn(`No regex match found for ${prefix}`);
                    return [];
                } catch (e) {
                    console.warn(`Error extracting ${prefix}: ${e.message}`);
                    return [];
                }
            };
            
            const scenarios = {
                basic: extractScenarios('this.basicScenarios') || [],
                intermediate: extractScenarios('this.intermediateScenarios') || [],
                advanced: extractScenarios('this.advancedScenarios') || []
            };
            
            // If we didn't find any scenarios with the standard prefixes, try alternatives
            if (!scenarios.basic.length && !scenarios.intermediate.length && !scenarios.advanced.length) {
                console.log('Trying alternative scenario prefixes...');
                scenarios.basic = extractScenarios('basicScenarios') || [];
                scenarios.intermediate = extractScenarios('intermediateScenarios') || [];
                scenarios.advanced = extractScenarios('advancedScenarios') || [];
            }
            
            if (scenarios.basic.length || scenarios.intermediate.length || scenarios.advanced.length) {
                console.log(`Successfully extracted scenarios from source code for ${quizName}`);
                return res.json({
                    success: true,
                    data: scenarios
                });
            }
            
            throw new Error(`Could not extract scenarios from source code for ${quizName}. The quiz file may contain complex JavaScript objects that cannot be parsed as JSON.`);
        } catch (error) {
            console.error(`Error loading quiz file for ${quizName}:`, error);
            return res.status(500).json({
                success: false,
                message: `Could not load scenarios for ${quizName}: ${error.message}`
            });
        }
    } catch (error) {
        console.error(`Error in quiz scenarios endpoint:`, error);
        return res.status(500).json({
            success: false,
            message: `Server error: ${error.message}`
        });
    }
});

module.exports = router; 