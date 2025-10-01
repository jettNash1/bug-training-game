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
        type: Map,
        of: [{
            score: { type: Number, min: 0, max: 100, required: true },
            completedAt: { type: Date, required: true },
            resetAt: { type: Date, default: Date.now }
        }],
        default: {}
    }
});

// Ensure quizPreviousScores is usable as a Map after load
userSchema.post('init', function() {
    if (this.quizPreviousScores && typeof this.quizPreviousScores === 'object' && !(this.quizPreviousScores instanceof Map)) {
        const map = new Map();
        for (const [key, value] of Object.entries(this.quizPreviousScores)) {
            map.set(key, value);
        }
        this.quizPreviousScores = map;
    }
});

// Helper to add a previous score safely
userSchema.methods.addPreviousScore = function(quizName, score, completedAt) {
    if (!this.quizPreviousScores || !(this.quizPreviousScores instanceof Map)) {
        this.quizPreviousScores = new Map();
    }
    const existing = this.quizPreviousScores.get(quizName) || [];
    existing.push({ score, completedAt: completedAt || new Date(), resetAt: new Date() });
    if (existing.length > 3) existing.splice(0, existing.length - 3);
    this.quizPreviousScores.set(quizName, existing);
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