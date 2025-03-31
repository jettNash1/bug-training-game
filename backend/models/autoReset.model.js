const mongoose = require('mongoose');

const autoResetSchema = new mongoose.Schema({
    quizName: {
        type: String,
        required: true,
        unique: true
    },
    resetPeriod: {
        type: Number, // in minutes
        required: true,
        min: 0
    },
    enabled: {
        type: Boolean,
        default: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying
autoResetSchema.index({ quizName: 1 });

module.exports = mongoose.model('AutoReset', autoResetSchema); 