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
    timezoneOffset: {
        type: Number,
        required: true,
        default: 0 // Default to UTC
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    processingStartedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for efficient querying
scheduledResetSchema.index({ resetDateTime: 1 });
scheduledResetSchema.index({ username: 1 });
scheduledResetSchema.index({ quizName: 1 });

// Virtual for getting local time
scheduledResetSchema.virtual('localResetTime').get(function() {
    return new Date(this.resetDateTime.getTime() + (this.timezoneOffset * 60000));
});

// Ensure virtuals are included in JSON
scheduledResetSchema.set('toJSON', { virtuals: true });
scheduledResetSchema.set('toObject', { virtuals: true });

const ScheduledReset = mongoose.model('ScheduledReset', scheduledResetSchema);

module.exports = ScheduledReset; 