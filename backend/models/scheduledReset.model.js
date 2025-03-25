const mongoose = require('mongoose');

const scheduledResetSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        ref: 'User'
    },
    quizName: {
        type: String,
        required: true
    },
    resetDateTime: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Index for efficient querying
scheduledResetSchema.index({ resetDateTime: 1 });
scheduledResetSchema.index({ username: 1 });
scheduledResetSchema.index({ quizName: 1 });

const ScheduledReset = mongoose.model('ScheduledReset', scheduledResetSchema);

module.exports = ScheduledReset; 