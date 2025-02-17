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
        enum: ['standard', 'interview_candidate', 'admin'],
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
            tools: [String],
            currentScenario: Number,
            questionHistory: Array,
            lastUpdated: Date
        },
        default: {}
    }
});

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