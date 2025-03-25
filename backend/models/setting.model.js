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

// Add validation for quiz timer settings
settingSchema.pre('save', function(next) {
    if (this.key === 'quizTimerSettings') {
        const value = this.value;
        
        // Ensure value is an object
        if (!value || typeof value !== 'object') {
            next(new Error('Quiz timer settings must be an object'));
            return;
        }
        
        // Validate default seconds
        if (typeof value.defaultSeconds !== 'number' || 
            value.defaultSeconds < 0 || 
            value.defaultSeconds > 300) {
            next(new Error('Default timer value must be between 0 and 300 seconds'));
            return;
        }
        
        // Initialize quizTimers if undefined
        if (!value.quizTimers) {
            value.quizTimers = {};
        }
        
        // Validate per-quiz settings if they exist
        if (value.quizTimers && typeof value.quizTimers === 'object') {
            for (const [quiz, seconds] of Object.entries(value.quizTimers)) {
                if (typeof seconds !== 'number' || seconds < 0 || seconds > 300) {
                    next(new Error(`Timer value for quiz ${quiz} must be between 0 and 300 seconds`));
                    return;
                }
            }
        } else {
            // If quizTimers is not an object, initialize it
            value.quizTimers = {};
        }
    }
    
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