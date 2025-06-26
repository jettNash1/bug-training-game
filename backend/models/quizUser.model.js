const mongoose = require('mongoose');

const quizUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    quizScores: {
        type: Map,
        of: {
            score: Number,
            experience: Number,
            questionHistory: [{
                scenario: Object,
                selectedAnswer: Object,
                status: String,
                timeSpent: Number,
                timedOut: Boolean
            }],
            questionsAnswered: Number,
            lastActive: Date
        }
    },
    userType: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    allowedQuizzes: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: Date
});

// Add indexes for better query performance
quizUserSchema.index({ username: 1 });
quizUserSchema.index({ 'quizScores.questionsAnswered': 1 });

const QuizUser = mongoose.model('QuizUser', quizUserSchema);

module.exports = QuizUser; 