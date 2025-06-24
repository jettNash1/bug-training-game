const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Setting = require('../models/setting.model');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');
const ScheduledReset = require('../models/scheduledReset.model');
const AutoReset = require('../models/autoReset.model');
const QuizUser = require('../models/quizUser.model');

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
            expectedUser1: process.env.ADMIN_USERNAME,
            expectedUser2: process.env.ADMIN_USERNAME_2,
            expectedUser3: process.env.ADMIN_USERNAME_3,
            hasPassword1: !!process.env.ADMIN_PASSWORD,
            hasPassword2: !!process.env.ADMIN_PASSWORD_2,
            hasPassword3: !!process.env.ADMIN_PASSWORD_3,
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

        // Check admin credentials - support multiple admin accounts
        const isAdmin1 = (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD);
        const isAdmin2 = (process.env.ADMIN_USERNAME_2 && process.env.ADMIN_PASSWORD_2 && 
                          username === process.env.ADMIN_USERNAME_2 && password === process.env.ADMIN_PASSWORD_2);
        const isAdmin3 = (process.env.ADMIN_USERNAME_3 && process.env.ADMIN_PASSWORD_3 && 
                          username === process.env.ADMIN_USERNAME_3 && password === process.env.ADMIN_PASSWORD_3);
        
        if (isAdmin1 || isAdmin2 || isAdmin3) {
            
            // Generate admin-specific token with isAdmin flag
            const token = jwt.sign(
                { 
                    isAdmin: true,
                    username: username // Use the actual username that logged in
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
            quizName.replace(/\s+/g, '-').toLowerCase(),              // spaces to hyphens
            quizName.replace(/\s+/g, '').toLowerCase(),               // no spaces
            // Special handling for communication skills
            quizName.toLowerCase().includes('communication') ? 
                [
                    'communication-skills',
                    'communicationSkills',
                    'communication_skills',
                    'communication',
                    'Communication',
                    'CommunicationSkills'
                ] : []
        ].flat();

        console.log('Checking quiz variations:', quizVariations);

        // Reset quiz progress for all variations
        if (!user.quizProgress) {
            user.quizProgress = new Map();
        }

        // Delete all variations from quiz progress
        let deletedVariations = [];
        quizVariations.forEach(variant => {
            if (user.quizProgress.has(variant)) {
                user.quizProgress.delete(variant);
                deletedVariations.push(variant);
            }
        });
        console.log('Deleted quiz progress for variations:', deletedVariations);

        // Remove quiz results for all variations
        if (user.quizResults) {
            const initialLength = user.quizResults.length;
            user.quizResults = user.quizResults.filter(result => {
                if (!result || !result.quizName) return false;
                const shouldKeep = !quizVariations.includes(result.quizName);
                if (!shouldKeep) {
                    console.log('Removing quiz result:', result.quizName);
                }
                return shouldKeep;
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
                // Handle different record formats
                // For timeout questions or otherwise incomplete records
                if (!record.scenario && record.scenarioId) {
                    console.log('Found record with scenarioId but no scenario object:', record);
                    // This is likely a timeout question in the old format
                    return {
                        id: record.scenarioId || index + 1,
                        scenario: {
                            title: 'Question ' + (index + 1),
                            description: '',
                            level: 'Basic'
                        },
                        selectedAnswer: {
                            text: record.selectedOption || "Time's up - No answer selected",
                            outcome: record.outcome || "You did not answer in time.",
                            experience: Number(record.experience) || 0,
                            tool: ''
                        },
                        correctAnswer: null,
                        status: 'failed',
                        timedOut: record.timedOut === true
                    };
                }
                
                // Regular validation for standard format
                if (!record || !record.scenario) {
                    console.warn('Invalid record structure:', record);
                    return null;
                }

                // Handle missing selectedAnswer (could happen with some formats)
                const selectedAnswer = record.selectedAnswer || {
                    text: record.selectedOption || "No answer selected",
                    outcome: record.outcome || "",
                    experience: record.experience || 0
                };

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
                        text: selectedAnswer.text || '',
                        outcome: selectedAnswer.outcome || '',
                        experience: Number(selectedAnswer.experience) || 0,
                        tool: selectedAnswer.tool || ''
                    },
                    correctAnswer: correctAnswer ? {
                        text: correctAnswer.text || '',
                        experience: Number(correctAnswer.experience) || 0
                    } : null,
                    status: record.status || (selectedAnswer.experience > 0 ? 'passed' : 'failed'),
                    timedOut: record.timedOut === true
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

        console.log(`[Visibility] Request received:`, {
            username,
            quizName,
            isVisible,
            bodyType: typeof isVisible,
            fullBody: req.body
        });

        if (typeof isVisible !== 'boolean') {
            console.error(`[Visibility] Invalid isVisible type: ${typeof isVisible}, value: ${isVisible}`);
            return res.status(400).json({
                success: false,
                message: 'isVisible must be a boolean value'
            });
        }

        console.log(`[Visibility] Updating visibility for ${username}'s quiz ${quizName}: isVisible=${isVisible}`);

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            console.error(`[Visibility] User not found: ${username}`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log(`[Visibility] User found:`, {
            username: user.username,
            userType: user.userType,
            hasHiddenQuizzes: !!user.hiddenQuizzes,
            hiddenQuizzesLength: user.hiddenQuizzes?.length || 0,
            hasAllowedQuizzes: !!user.allowedQuizzes,
            allowedQuizzesLength: user.allowedQuizzes?.length || 0
        });

        const normalizedQuizName = quizName.toLowerCase();
        
        // All accounts now use hiddenQuizzes logic
        // Initialize hiddenQuizzes array if it doesn't exist
        if (!user.hiddenQuizzes) {
            console.log(`[Visibility] Initializing hiddenQuizzes array for ${username}`);
            user.hiddenQuizzes = [];
        }

        const quizIndex = user.hiddenQuizzes.indexOf(normalizedQuizName);
        console.log(`[Visibility] Quiz "${normalizedQuizName}" index in hiddenQuizzes: ${quizIndex}`);

        if (!isVisible && quizIndex === -1) {
            // Add to hidden quizzes if not visible and not already hidden
            console.log(`[Visibility] Adding "${normalizedQuizName}" to hiddenQuizzes`);
            user.hiddenQuizzes.push(normalizedQuizName);
        } else if (isVisible && quizIndex !== -1) {
            // Remove from hidden quizzes if visible and currently hidden
            console.log(`[Visibility] Removing "${normalizedQuizName}" from hiddenQuizzes`);
            user.hiddenQuizzes.splice(quizIndex, 1);
        } else {
            console.log(`[Visibility] No change needed for "${normalizedQuizName}": isVisible=${isVisible}, quizIndex=${quizIndex}`);
        }

        console.log(`[Visibility] About to save user with hiddenQuizzes:`, user.hiddenQuizzes);

        await user.save();

        console.log(`[Visibility] User saved successfully`);

        const response = {
            success: true,
            message: `Quiz visibility updated for ${username}`,
            hiddenQuizzes: user.hiddenQuizzes
        };

        // Only include allowedQuizzes if it exists (for backward compatibility)
        if (user.allowedQuizzes) {
            response.allowedQuizzes = user.allowedQuizzes;
        }

        console.log(`[Visibility] Sending response:`, response);

        res.json(response);
    } catch (error) {
        console.error('[Visibility] Error updating quiz visibility:', {
            error: error.message,
            stack: error.stack,
            username: req.params.username,
            quizName: req.params.quizName,
            isVisible: req.body.isVisible
        });
        res.status(500).json({
            success: false,
            message: 'Failed to update quiz visibility',
            error: error.message
        });
    }
});

// Create interview account endpoint removed - all accounts are now regular accounts

// Create standard account with hiddenQuizzes support
router.post('/create-standard-account', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { username, password, hiddenQuizzes } = req.body;

        console.log('[Create Account] Request received:', {
            username,
            hasPassword: !!password,
            hiddenQuizzesCount: hiddenQuizzes?.length || 0,
            hiddenQuizzes
        });

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Get all available quiz names for validation
        const allQuizzes = [
            'communication', 'initiative', 'time-management', 'tester-mindset',
            'risk-analysis', 'risk-management', 'non-functional', 'test-support',
            'issue-verification', 'build-verification', 'issue-tracking-tools',
            'raising-tickets', 'reports', 'cms-testing', 'email-testing', 'content-copy',
            'locale-testing', 'script-metrics-troubleshooting', 'standard-script-testing',
            'test-types-tricks', 'automation-interview', 'fully-scripted', 'exploratory',
            'sanity-smoke', 'functional-interview'
        ].map(quiz => quiz.toLowerCase());

        // Validate hiddenQuizzes if provided
        const normalizedHiddenQuizzes = hiddenQuizzes ? 
            hiddenQuizzes.map(quiz => quiz.toLowerCase()) : [];

        const invalidHiddenQuizzes = normalizedHiddenQuizzes.filter(quiz => !allQuizzes.includes(quiz));
        if (invalidHiddenQuizzes.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid quiz names: ${invalidHiddenQuizzes.join(', ')}`
            });
        }

        // Create new standard user
        const user = new User({
            username,
            password,
            userType: 'standard',
            hiddenQuizzes: normalizedHiddenQuizzes
        });

        await user.save();

        console.log('[Create Account] User created successfully:', {
            username: user.username,
            userType: user.userType,
            hiddenQuizzesCount: user.hiddenQuizzes?.length || 0
        });

        res.json({
            success: true,
            message: 'Standard account created successfully',
            user: {
                username: user.username,
                userType: user.userType,
                hiddenQuizzes: user.hiddenQuizzes
            }
        });
    } catch (error) {
        console.error('[Create Account] Error creating standard account:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create standard account',
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

// Helper function for consistent quiz name normalization
function normalizeQuizName(quizName) {
    if (!quizName) return '';
    
    // Normalize to lowercase and trim
    const lowerName = typeof quizName === 'string' ? quizName.toLowerCase().trim() : '';
    
    // List of known quiz names for exact matching
    const knownQuizNames = [
        'communication', 
        'initiative', 
        'time-management', 
        'tester-mindset',
        'risk-analysis', 
        'risk-management', 
        'non-functional', 
        'test-support',
        'issue-verification', 
        'build-verification', 
        'issue-tracking-tools',
        'raising-tickets', 
        'reports', 
        'cms-testing', 
        'email-testing', 
        'content-copy',
        'locale-testing', 
        'script-metrics-troubleshooting', 
        'standard-script-testing',
        'test-types-tricks', 
        'automation-interview', 
        'fully-scripted', 
        'exploratory',
        'sanity-smoke', 
        'functional-interview'
    ];
    
    // If it's an exact match with our known list, return it directly
    if (knownQuizNames.includes(lowerName)) {
        return lowerName;
    }
    
    // Normalize to kebab-case
    const normalized = lowerName
        .replace(/([A-Z])/g, '-$1')  // Convert camelCase to kebab-case
        .replace(/_/g, '-')          // Convert snake_case to kebab-case
        .replace(/\s+/g, '-')        // Convert spaces to hyphens
        .replace(/-+/g, '-')         // Remove duplicate hyphens
        .replace(/^-|-$/g, '')       // Remove leading/trailing hyphens
        .toLowerCase();              // Ensure lowercase
    
    // Check if normalized version is in known list
    if (knownQuizNames.includes(normalized)) {
        return normalized;
    }
    
    // Return the normalized version for consistency
    return normalized;
}

// Guide settings routes
router.get('/guide-settings', auth, async (req, res) => {
    try {
        const settings = await Setting.findOne({ key: 'guideSettings' });
        
        if (!settings) {
            // If no settings exist, create default settings
            const defaultSettings = new Setting({
                key: 'guideSettings',
                value: {}
            });
            await defaultSettings.save();
            return res.json({
                success: true,
                data: defaultSettings.value
            });
        }
        
        res.json({
            success: true,
            data: settings.value
        });
    } catch (error) {
        console.error('Error fetching guide settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch guide settings'
        });
    }
});

router.post('/guide-settings/:quizName', auth, async (req, res) => {
    try {
        const { quizName } = req.params;
        const { url, enabled } = req.body;
        
        // Normalize the quiz name
        const normalizedQuizName = normalizeQuizName(quizName);
        console.log(`[Admin] Saving guide settings for quiz "${normalizedQuizName}" (from "${quizName}"):`, { url, enabled });
        
        // Validate URL if provided
        if (url && !url.match(/^https?:\/\/.+/)) {
            console.warn(`[Admin] Invalid URL format for quiz "${normalizedQuizName}": ${url}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid URL format. Must start with http:// or https://'
            });
        }
        
        // Get current settings or create new ones
        let settings = await Setting.findOne({ key: 'guideSettings' });
        console.log('[Admin] Current guide settings:', settings?.value);
        
        if (!settings) {
            settings = new Setting({
                key: 'guideSettings',
                value: {}
            });
            console.log('[Admin] Created new guide settings document');
        }
        
        // Update settings for the specific quiz
        settings.value = {
            ...settings.value,
            [normalizedQuizName]: { url, enabled }
        };
        
        console.log(`[Admin] Updated guide settings for quiz "${normalizedQuizName}":`, settings.value[normalizedQuizName]);
        
        await settings.save();
        console.log('[Admin] Guide settings saved to database');
        
        res.json({
            success: true,
            message: 'Guide settings updated successfully',
            data: settings.value
        });
    } catch (error) {
        console.error('[Admin] Error updating guide settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update guide settings'
        });
    }
});

// New endpoint to update all guide settings at once (for bulk operations including deletion)
router.put('/guide-settings', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        
        // Validate the request body - should be an object with quiz names as keys
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Expected an object of guide settings.'
            });
        }
        
        // Validate each URL in the settings
        for (const [quizName, setting] of Object.entries(req.body)) {
            if (setting && setting.url && !setting.url.match(/^https?:\/\/.+/)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid URL format for quiz "${quizName}". URLs must start with http:// or https://`
                });
            }
        }
        
        console.log(`[Admin] Updating all guide settings. New count: ${Object.keys(req.body).length}`);
        
        // Get or create settings document
        let settings = await Setting.findOne({ key: 'guideSettings' });
        if (!settings) {
            settings = new Setting({
                key: 'guideSettings',
                value: {}
            });
        }
        
        // Replace entire value with the new settings
        settings.value = req.body;
        settings.updatedAt = new Date();
        
        await settings.save();
        
        res.json({
            success: true,
            message: 'All guide settings updated successfully',
            data: settings.value
        });
    } catch (error) {
        console.error('Error updating all guide settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update guide settings',
            error: error.message
        });
    }
});

// Get all auto-reset settings
router.get('/auto-resets', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        // Get all auto-reset settings from the database
        const autoResets = await AutoReset.find().sort({ quizName: 1 });
        
        res.json({
            success: true,
            data: autoResets
        });
    } catch (error) {
        console.error('Error fetching auto-reset settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch auto-reset settings',
            error: error.message
        });
    }
});

// Create or update auto-reset setting
router.post('/auto-resets', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { quizName, resetPeriod, enabled, nextResetTime } = req.body;

        // Validate inputs
        if (!quizName || resetPeriod === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate resetPeriod is a positive number
        if (resetPeriod < 0) {
            return res.status(400).json({
                success: false,
                message: 'Reset period must be a positive number'
            });
        }

        // Build update fields, including nextResetTime if provided
        const updateFields = {
            resetPeriod,
            enabled: enabled !== undefined ? enabled : true,
            lastUpdated: new Date()
        };
        if (nextResetTime) {
            updateFields.nextResetTime = nextResetTime;
        }

        // Find existing setting or create new one
        const autoReset = await AutoReset.findOneAndUpdate(
            { quizName },
            updateFields,
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: 'Auto-reset setting saved successfully',
            data: autoReset
        });
    } catch (error) {
        console.error('Error saving auto-reset setting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save auto-reset setting',
            error: error.message
        });
    }
});

// Delete auto-reset setting
router.delete('/auto-resets/:quizName', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { quizName } = req.params;
        const deletedSetting = await AutoReset.findOneAndDelete({ quizName });
        
        if (!deletedSetting) {
            return res.status(404).json({ success: false, message: 'Auto-reset setting not found' });
        }
        
        res.json({ success: true, message: 'Auto-reset setting deleted successfully' });
    } catch (error) {
        console.error('Error deleting auto-reset setting:', error);
        res.status(500).json({ success: false, message: 'Failed to delete auto-reset setting' });
    }
});

// Endpoint to update the lastReset field for an auto-reset setting
router.post('/auto-resets/:quizName/update-last-reset', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { quizName } = req.params;
        
        // Update the lastReset field to current time
        const autoReset = await AutoReset.findOneAndUpdate(
            { quizName },
            { lastReset: new Date() },
            { new: true }
        );
        
        if (!autoReset) {
            return res.status(404).json({
                success: false,
                message: 'Auto-reset setting not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Last reset time updated successfully',
            data: autoReset
        });
    } catch (error) {
        console.error('Error updating last reset time:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update last reset time',
            error: error.message
        });
    }
});

// Get all users who have completed a quiz
router.get('/completed-users/:quizName', auth, async (req, res) => {
    try {
        const { quizName } = req.params;
        
        // Find all users who have completed exactly 15 questions in the quiz
        const completedUsers = await User.find({
            [`quizProgress.${quizName}.questionsAnswered`]: 15
        }).select('username');
        
        console.log(`Found ${completedUsers.length} users who have completed all 15 questions for quiz: ${quizName}`);
        
        res.json({ 
            success: true, 
            data: completedUsers.map(user => user.username)
        });
    } catch (error) {
        console.error('Error getting completed users:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get completed users',
            error: error.message 
        });
    }
});

// Get quiz timer settings for admin
router.get('/settings/quiz-timer', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        // Retrieve timer settings from database
        const timerSetting = await Setting.findOne({ key: 'quizTimerSettings' });
        console.log('[TIMER DEBUG] GET request - Found setting:', !!timerSetting);
        if (timerSetting) {
            console.log('[TIMER DEBUG] GET request - Current value:', timerSetting.value);
        }
        
        // Default settings if not found
        const defaultSettings = {
            defaultSeconds: 60,
            quizTimers: {},
            updatedAt: new Date()
        };
        
        // Use stored settings or defaults
        const settings = timerSetting ? timerSetting.value : defaultSettings;
        console.log('[TIMER DEBUG] GET request - Returning settings:', settings);
        
        return res.json({
            success: true,
            data: {
                defaultSeconds: settings.defaultSeconds,
                quizTimers: settings.quizTimers || {},
                updatedAt: timerSetting ? timerSetting.updatedAt : new Date()
            }
        });
    } catch (error) {
        console.error('[TIMER DEBUG] Error retrieving quiz timer settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve quiz timer settings'
        });
    }
});

// Update quiz timer settings for admin
router.post('/settings/quiz-timer', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { defaultSeconds, quizTimers } = req.body;
        console.log('[TIMER DEBUG] Received update request:', { defaultSeconds, quizTimers });

        // Validate defaultSeconds
        if (defaultSeconds !== undefined && (typeof defaultSeconds !== 'number' || defaultSeconds < 0 || defaultSeconds > 300)) {
            console.log('[TIMER DEBUG] Validation failed for defaultSeconds:', defaultSeconds);
            return res.status(400).json({
                success: false,
                message: 'Default seconds must be a number between 0 and 300'
            });
        }

        // Validate quizTimers object
        if (quizTimers && typeof quizTimers !== 'object') {
            console.log('[TIMER DEBUG] Validation failed for quizTimers:', quizTimers);
            return res.status(400).json({
                success: false,
                message: 'Quiz timers must be an object'
            });
        }

        // Validate individual quiz timer values
        if (quizTimers) {
            for (const [quizName, seconds] of Object.entries(quizTimers)) {
                if (typeof seconds !== 'number' || seconds < 0 || seconds > 300) {
                    console.log('[TIMER DEBUG] Validation failed for quiz timer:', { quizName, seconds });
                    return res.status(400).json({
                        success: false,
                        message: `Timer for ${quizName} must be a number between 0 and 300`
                    });
                }
            }
        }

        // Get existing settings or create new ones
        let timerSetting = await Setting.findOne({ key: 'quizTimerSettings' });
        console.log('[TIMER DEBUG] Existing setting found:', !!timerSetting);
        if (timerSetting) {
            console.log('[TIMER DEBUG] Current value before update:', timerSetting.value);
        }
        
        if (!timerSetting) {
            // Create new settings
            console.log('[TIMER DEBUG] Creating new timer setting');
            timerSetting = new Setting({
                key: 'quizTimerSettings',
                value: {
                    defaultSeconds: defaultSeconds !== undefined ? defaultSeconds : 60,
                    quizTimers: quizTimers || {},
                    updatedAt: new Date()
                }
            });
        } else {
            // Update existing settings
            console.log('[TIMER DEBUG] Updating existing timer setting');
            if (defaultSeconds !== undefined) {
                console.log('[TIMER DEBUG] Setting defaultSeconds from', timerSetting.value.defaultSeconds, 'to', defaultSeconds);
                timerSetting.value.defaultSeconds = defaultSeconds;
            }
            if (quizTimers !== undefined) {
                console.log('[TIMER DEBUG] Setting quizTimers to:', quizTimers);
                timerSetting.value.quizTimers = quizTimers;
            }
            timerSetting.value.updatedAt = new Date();
            timerSetting.markModified('value'); // Ensure mongoose knows the nested object changed
        }

        console.log('[TIMER DEBUG] About to save:', timerSetting.value);
        const savedSetting = await timerSetting.save();
        console.log('[TIMER DEBUG] Successfully saved:', savedSetting.value);

        // Verify the save by reading it back
        const verifyRead = await Setting.findOne({ key: 'quizTimerSettings' });
        console.log('[TIMER DEBUG] Verification read after save:', verifyRead.value);

        return res.json({
            success: true,
            message: 'Quiz timer settings updated successfully',
            data: {
                defaultSeconds: savedSetting.value.defaultSeconds,
                quizTimers: savedSetting.value.quizTimers || {},
                updatedAt: savedSetting.value.updatedAt
            }
        });
    } catch (error) {
        console.error('[TIMER DEBUG] Error updating quiz timer settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update quiz timer settings',
            error: error.message
        });
    }
});

// Scheduled Reset Endpoints

// Get all scheduled resets
router.get('/schedules', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        console.log('Fetching all scheduled resets');
        
        // Get all scheduled resets, sorted by reset date
        const schedules = await ScheduledReset.find({
            status: 'pending' // Only get pending schedules
        }).sort({ resetDateTime: 1 });

        console.log(`Found ${schedules.length} scheduled resets`);

        return res.json({
            success: true,
            data: schedules
        });
    } catch (error) {
        console.error('Error fetching scheduled resets:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch scheduled resets',
            error: error.message
        });
    }
});

// Create a new scheduled reset
router.post('/schedules', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { username, quizName, resetDateTime, timezoneOffset } = req.body;

        // Add detailed logging for debugging
        console.log('Received scheduled reset request:', {
            username,
            quizName,
            resetDateTime,
            timezoneOffset,
            fullBody: req.body
        });

        // Validate required fields
        if (!username || !quizName || !resetDateTime) {
            console.log('Validation failed - missing required fields:', {
                hasUsername: !!username,
                hasQuizName: !!quizName,
                hasResetDateTime: !!resetDateTime
            });
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: username, quizName, and resetDateTime are required'
            });
        }

        // Validate that the user exists
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`User validation failed - user not found: ${username}`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate reset date is in the future
        const resetDate = new Date(resetDateTime);
        const now = new Date();
        
        console.log('Date validation:', {
            resetDateTime: resetDateTime,
            resetDate: resetDate.toISOString(),
            now: now.toISOString(),
            isValid: !isNaN(resetDate.getTime()),
            isFuture: resetDate > now,
            timeDiff: resetDate.getTime() - now.getTime()
        });

        if (isNaN(resetDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format for resetDateTime'
            });
        }

        if (resetDate <= now) {
            return res.status(400).json({
                success: false,
                message: `Reset date must be in the future. Received: ${resetDate.toISOString()}, Current: ${now.toISOString()}`
            });
        }

        console.log(`Creating scheduled reset for ${username}'s ${quizName} quiz at ${resetDate.toISOString()}`);

        // Check if a similar scheduled reset already exists
        const existingSchedule = await ScheduledReset.findOne({
            username,
            quizName,
            status: 'pending',
            resetDateTime: {
                $gte: new Date(resetDate.getTime() - 60000), // 1 minute before
                $lte: new Date(resetDate.getTime() + 60000)  // 1 minute after
            }
        });

        if (existingSchedule) {
            return res.status(409).json({
                success: false,
                message: 'A similar scheduled reset already exists for this user and quiz'
            });
        }

        // Create the scheduled reset
        const scheduledReset = new ScheduledReset({
            username,
            quizName,
            resetDateTime: resetDate,
            timezoneOffset: timezoneOffset || 0,
            status: 'pending'
        });

        const savedSchedule = await scheduledReset.save();
        console.log('Successfully created scheduled reset:', savedSchedule._id);

        return res.status(201).json({
            success: true,
            message: 'Scheduled reset created successfully',
            data: savedSchedule
        });
    } catch (error) {
        console.error('Error creating scheduled reset:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create scheduled reset',
            error: error.message
        });
    }
});

// Cancel/delete a scheduled reset
router.delete('/schedules/:id', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Schedule ID is required'
            });
        }

        console.log(`Cancelling scheduled reset with ID: ${id}`);

        // Find and delete the scheduled reset
        const deletedSchedule = await ScheduledReset.findByIdAndDelete(id);

        if (!deletedSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Scheduled reset not found'
            });
        }

        console.log(`Successfully cancelled scheduled reset for ${deletedSchedule.username}'s ${deletedSchedule.quizName} quiz`);

        return res.json({
            success: true,
            message: 'Scheduled reset cancelled successfully',
            data: deletedSchedule
        });
    } catch (error) {
        console.error('Error cancelling scheduled reset:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to cancel scheduled reset',
            error: error.message
        });
    }
});

// Process scheduled resets (can be called manually or by cron job)
router.post('/schedules/process', auth, async (req, res) => {
    try {
        // Verify admin status
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        console.log('Processing scheduled resets');

        // Get all pending scheduled resets that are due
        const now = new Date();
        const dueSchedules = await ScheduledReset.find({
            status: 'pending',
            resetDateTime: { $lte: now }
        });

        console.log(`Found ${dueSchedules.length} due scheduled resets`);

        const processedSchedules = [];
        const failedSchedules = [];

        // Process each due schedule
        for (const schedule of dueSchedules) {
            try {
                console.log(`Processing scheduled reset for ${schedule.username}'s ${schedule.quizName} quiz`);

                // Find the user
                const user = await User.findOne({ username: schedule.username });
                if (!user) {
                    console.error(`User ${schedule.username} not found`);
                    schedule.status = 'failed';
                    await schedule.save();
                    failedSchedules.push({
                        id: schedule._id,
                        reason: 'User not found'
                    });
                    continue;
                }

                // Reset the quiz progress
                const quizKey = `quizProgress.${schedule.quizName}`;
                await User.updateOne(
                    { username: schedule.username },
                    { 
                        $unset: { [quizKey]: "" },
                        $pull: { 
                            quizResults: { quizName: schedule.quizName }
                        }
                    }
                );

                // Mark schedule as completed
                schedule.status = 'completed';
                await schedule.save();

                processedSchedules.push({
                    id: schedule._id,
                    username: schedule.username,
                    quizName: schedule.quizName,
                    resetDateTime: schedule.resetDateTime
                });

                console.log(`Successfully processed scheduled reset for ${schedule.username}'s ${schedule.quizName} quiz`);
            } catch (error) {
                console.error(`Error processing schedule ${schedule._id}:`, error);
                schedule.status = 'failed';
                await schedule.save();
                failedSchedules.push({
                    id: schedule._id,
                    reason: error.message
                });
            }
        }

        return res.json({
            success: true,
            message: `Processed ${processedSchedules.length} scheduled resets`,
            data: {
                processed: processedSchedules,
                failed: failedSchedules,
                total: dueSchedules.length
            }
        });
    } catch (error) {
        console.error('Error processing scheduled resets:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process scheduled resets',
            error: error.message
        });
    }
});

module.exports = router; 