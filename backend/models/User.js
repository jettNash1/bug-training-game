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
    tools: [{
        type: String
    }],
    questionHistory: [{
        type: mongoose.Schema.Types.Mixed
    }],
    completedAt: {
        type: Date,
        default: Date.now
    }
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
    previousQuizScores: [quizResultSchema],
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
    }
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

const User = mongoose.model('User', userSchema);

module.exports = User; 