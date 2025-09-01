const mongoose = require('mongoose');

const cacheInvalidationSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true
    },
    quizName: {
        type: String,
        required: true,
        index: true
    },
    invalidationTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    // Compound index for efficient lookups
    userQuizKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    }
}, {
    timestamps: true
});

// Pre-save middleware to create the compound key
cacheInvalidationSchema.pre('save', function(next) {
    this.userQuizKey = `${this.username}_${this.quizName.toLowerCase()}`;
    next();
});

// Static method to record an invalidation
cacheInvalidationSchema.statics.recordInvalidation = async function(username, quizName) {
    try {
        const invalidationTime = new Date();
        
        // Upsert the invalidation record
        await this.findOneAndUpdate(
            { 
                username: username,
                quizName: quizName.toLowerCase()
            },
            {
                username: username,
                quizName: quizName.toLowerCase(),
                invalidationTime: invalidationTime,
                userQuizKey: `${username}_${quizName.toLowerCase()}`
            },
            { upsert: true, new: true }
        );
        
        console.log(`[Cache Invalidation] Recorded invalidation for ${username}_${quizName.toLowerCase()} at ${invalidationTime}`);
        return invalidationTime;
    } catch (error) {
        console.error('[Cache Invalidation] Error recording invalidation:', error);
        throw error;
    }
};

// Static method to check if an invalidation exists
cacheInvalidationSchema.statics.checkInvalidation = async function(username, quizName, lastCheckTime = 0) {
    try {
        const invalidation = await this.findOne({
            username: username,
            quizName: quizName.toLowerCase()
        });
        
        if (!invalidation) {
            return { shouldInvalidate: false, invalidationTime: null };
        }
        
        const lastCheck = new Date(lastCheckTime);
        const shouldInvalidate = invalidation.invalidationTime > lastCheck;
        
        console.log(`[Cache Check] ${username}'s ${quizName}: shouldInvalidate=${shouldInvalidate}, serverTime=${invalidation.invalidationTime}, lastCheck=${lastCheckTime}`);
        
        return {
            shouldInvalidate,
            invalidationTime: invalidation.invalidationTime.getTime()
        };
    } catch (error) {
        console.error('[Cache Invalidation] Error checking invalidation:', error);
        return { shouldInvalidate: false, invalidationTime: null };
    }
};

// Static method to clean up old invalidations (older than 24 hours)
cacheInvalidationSchema.statics.cleanupOldInvalidations = async function() {
    try {
        const oneDayAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));
        const result = await this.deleteMany({
            invalidationTime: { $lt: oneDayAgo }
        });
        
        if (result.deletedCount > 0) {
            console.log(`[Cache Invalidation] Cleaned up ${result.deletedCount} old invalidation records`);
        }
    } catch (error) {
        console.error('[Cache Invalidation] Error cleaning up old invalidations:', error);
    }
};

const CacheInvalidation = mongoose.model('CacheInvalidation', cacheInvalidationSchema);

module.exports = CacheInvalidation;
