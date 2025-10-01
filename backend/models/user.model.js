const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const quizResultSchema = new mongoose.Schema({
    quizName: String,
    score: Number,
    completedAt: Date,
    answers: [{
        questionId: Number,
        selectedAnswer: String,
        correct: Boolean
    }]
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum: ['standard', 'admin'],
        default: 'standard'
    },
    allowedQuizzes: {
        type: [String],
        default: []
    },
    quizResults: [quizResultSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: Date,
    hiddenQuizzes: {
        type: [String],
        default: []
    },
    quizProgress: {
        type: Map,
        of: {
            experience: Number,
            currentScenario: Number,
            questionHistory: Array,
            lastUpdated: Date,
            status: String,
            scorePercentage: Number,
            questionsAnswered: Number
        },
        default: {}
    },
    // Persistent storage for previous scores, independent of resets
    quizPreviousScores: {
        // Plain object keyed by lowercased quiz id -> array of {score, completedAt, resetAt}
        type: Object,
        default: {}
    }
});

// Ensure quizPreviousScores is usable as a Map after load
// Helper to add a previous score safely (stores in plain object)
userSchema.methods.addPreviousScore = function(quizName, score, completedAt) {
    if (!this.quizPreviousScores || typeof this.quizPreviousScores !== 'object') {
        this.quizPreviousScores = {};
    }
    const key = String(quizName || '').toLowerCase();
    const list = Array.isArray(this.quizPreviousScores[key]) ? this.quizPreviousScores[key] : [];
    list.push({ score, completedAt: completedAt || new Date(), resetAt: new Date() });
    if (list.length > 3) list.splice(0, list.length - 3);
    this.quizPreviousScores[key] = list;
    
    // Mark the field as modified for Mongoose to save it properly
    this.markModified('quizPreviousScores');
    
    console.log(`[addPreviousScore] Added previous score for ${this.username} - ${quizName}:`, {
        key,
        score,
        completedAt,
        totalPreviousScores: list.length
    });
};

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);