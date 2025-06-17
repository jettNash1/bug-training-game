const mongoose = require('mongoose');
const User = require('./models/User');

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bug-training-game');
        console.log('MongoDB connected for migration');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

// All available quiz types
const ALL_QUIZ_TYPES = [
    'communication', 'initiative', 'time-management', 'tester-mindset',
    'risk-analysis', 'risk-management', 'non-functional', 'test-support',
    'issue-verification', 'build-verification', 'issue-tracking-tools',
    'raising-tickets', 'reports', 'cms-testing', 'email-testing', 'content-copy',
    'locale-testing', 'script-metrics-troubleshooting', 'standard-script-testing',
    'test-types-tricks', 'automation-interview', 'fully-scripted', 'exploratory',
    'sanity-smoke', 'functional-interview'
].map(quiz => quiz.toLowerCase());

async function migrateInterviewAccounts() {
    console.log('🔄 Starting migration of interview accounts to regular accounts...\n');

    try {
        // Find all interview candidate accounts
        const interviewAccounts = await User.find({ userType: 'interview_candidate' });
        
        console.log(`📊 Found ${interviewAccounts.length} interview accounts to migrate:`);
        interviewAccounts.forEach(user => {
            console.log(`  - ${user.username} (allowed: ${user.allowedQuizzes?.length || 0} quizzes)`);
        });
        console.log('');

        if (interviewAccounts.length === 0) {
            console.log('✅ No interview accounts found. Migration complete.');
            return;
        }

        // Migrate each account
        for (const user of interviewAccounts) {
            console.log(`🔄 Migrating ${user.username}...`);
            
            const allowedQuizzes = (user.allowedQuizzes || []).map(q => q.toLowerCase());
            
            // For interview accounts: allowedQuizzes becomes the visible quizzes
            // For regular accounts: hiddenQuizzes are the hidden quizzes
            // So we need to invert: hiddenQuizzes = ALL_QUIZZES - allowedQuizzes
            const hiddenQuizzes = ALL_QUIZ_TYPES.filter(quiz => !allowedQuizzes.includes(quiz));
            
            console.log(`  - Allowed quizzes (${allowedQuizzes.length}): ${allowedQuizzes.join(', ')}`);
            console.log(`  - Will hide quizzes (${hiddenQuizzes.length}): ${hiddenQuizzes.join(', ')}`);
            
            // Update the user
            user.userType = 'regular';
            user.hiddenQuizzes = hiddenQuizzes;
            // Keep allowedQuizzes for reference but it won't be used
            
            await user.save();
            console.log(`  ✅ ${user.username} migrated successfully\n`);
        }

        console.log('🎉 All interview accounts successfully migrated to regular accounts!');
        console.log('\n📋 Migration Summary:');
        console.log(`  - Converted ${interviewAccounts.length} interview accounts to regular accounts`);
        console.log('  - Each account\'s visible quizzes are now controlled by hiddenQuizzes array');
        console.log('  - allowedQuizzes arrays are preserved but no longer used');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration
async function runMigration() {
    try {
        await connectDB();
        await migrateInterviewAccounts();
        console.log('\n✅ Migration completed successfully!');
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📤 Database connection closed');
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    runMigration();
}

module.exports = { migrateInterviewAccounts }; 