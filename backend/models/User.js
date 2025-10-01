const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const quizResultSchema = new mongoose.Schema({
    quizName: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    experience: {
        type: Number,
        default: 0
    },
    questionHistory: [{
        type: mongoose.Schema.Types.Mixed
    }],
    completedAt: {
        type: Date,
        default: Date.now
    },
    previousScores: [{
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        completedAt: {
            type: Date,
            required: true
        },
        resetAt: {
            type: Date,
            default: Date.now
        }
    }]
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    quizResults: [quizResultSchema],
    refreshToken: {
        type: String
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    quizProgress: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: () => ({})
    },
    userType: {
        type: String,
        enum: ['regular', 'admin'],
        default: 'regular'
    },
    allowedQuizzes: [{
        type: String,
        lowercase: true
    }],
    hiddenQuizzes: [{
        type: String,
        lowercase: true
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to safely return user data without sensitive information
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.refreshToken;
    return user;
};

// Method to add previous score when quiz is reset
userSchema.methods.addPreviousScore = function(quizName, currentScore) {
    const quizResult = this.quizResults.find(r => r.quizName === quizName);
    if (quizResult) {
        // Add current score to previous scores before reset
        quizResult.previousScores.push({
            score: currentScore,
            completedAt: quizResult.completedAt,
            resetAt: new Date()
        });
        
        // Keep only the last 3 previous scores
        if (quizResult.previousScores.length > 3) {
            quizResult.previousScores = quizResult.previousScores.slice(-3);
        }
    }
};

// Method to get score comparison data
userSchema.methods.getScoreComparison = function(quizName) {
    const quizResult = this.quizResults.find(r => r.quizName === quizName);
    if (!quizResult) return null;
    
    const currentScore = quizResult.score;
    const previousScores = quizResult.previousScores || [];
    const latestPreviousScore = previousScores.length > 0 ? previousScores[previousScores.length - 1].score : null;
    
    return {
        currentScore,
        previousScores: previousScores.map(ps => ({
            score: ps.score,
            completedAt: ps.completedAt,
            resetAt: ps.resetAt
        })),
        latestPreviousScore,
        improvement: latestPreviousScore ? currentScore - latestPreviousScore : null,
        totalAttempts: previousScores.length + 1
    };
};

const User = mongoose.model('User', userSchema);

module.exports = User; 