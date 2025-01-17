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
        questionText: String,
        selectedAnswerText: String,
        experienceGained: Number,
        isCorrect: Boolean
    }],
    questionsAnswered: {
        type: Number,
        default: 0
    },
    currentScenario: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'failed'],
        default: 'not_started'
    },
    completedAt: {
        type: Date
    },
    updatedAt: {
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
    lastLogin: {
        type: Date,
        default: Date.now
    },
    quizProgress: {
        type: Map,
        of: {
            experience: {
                type: Number,
                default: 0
            },
            tools: [{
                type: String
            }],
            questionHistory: [{
                questionText: String,
                selectedAnswerText: String,
                experienceGained: Number,
                isCorrect: Boolean
            }],
            questionsAnswered: {
                type: Number,
                default: 0
            },
            currentScenario: {
                type: Number,
                default: 0
            },
            status: {
                type: String,
                enum: ['not_started', 'in_progress', 'completed', 'failed'],
                default: 'not_started'
            },
            lastUpdated: {
                type: Date,
                default: Date.now
            }
        }
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
    return user;
};

module.exports = mongoose.model('User', userSchema);