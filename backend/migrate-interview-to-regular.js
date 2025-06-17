const mongoose = require('mongoose');
const User = require('./models/User');

// Load environment variables from parent directory if needed
require('dotenv').config({ path: '../.env' });
require('dotenv').config(); // Also try current directory

// Database connection using same logic as main app
const connectDB = async () => {
    try {
        console.log('🔌 Attempting to connect to MongoDB...');
        
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI environment variable is not set!');
            console.log('💡 Available environment variables:');
            Object.keys(process.env).filter(key => key.includes('MONGO')).forEach(key => {
                console.log(`   ${key}: ${process.env[key]}`);
            });
            throw new Error('MONGODB_URI environment variable is required');
        }
        
        console.log(`🌐 Connecting to: ${process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected successfully for migration');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        
        // Provide helpful debugging info
        console.log('\n🔍 Debugging Information:');
        console.log('- Current working directory:', process.cwd());
        console.log('- Node environment:', process.env.NODE_ENV || 'not set');
        console.log('- Available .env files:');
        const fs = require('fs');
        const path = require('path');
        
        // Check for .env files in current and parent directories
        const envPaths = ['.env', '../.env', '../../.env'];
        envPaths.forEach(envPath => {
            const fullPath = path.resolve(envPath);
            const exists = fs.existsSync(fullPath);
            console.log(`  ${fullPath}: ${exists ? '✅ exists' : '❌ not found'}`);
        });
        
        throw error;
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
        console.error('\n❌ Migration failed:', error.message);
        console.log('\n💡 Troubleshooting tips:');
        console.log('1. Make sure your MongoDB connection string is correct');
        console.log('2. Check that your .env file exists and contains MONGODB_URI');
        console.log('3. Verify your MongoDB server is running and accessible');
        console.log('4. Try running the main application first to test the connection');
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