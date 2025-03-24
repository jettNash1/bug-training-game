const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
settingSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Update timestamp when value is updated
settingSchema.pre('findOneAndUpdate', function(next) {
    // Set updatedAt in the update document
    if (!this.getUpdate().$set) {
        this.getUpdate().$set = {};
    }
    this.getUpdate().$set.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Setting', settingSchema); 