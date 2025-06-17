const mongoose = require('mongoose');
const User = require('./models/User');

// Load environment variables
require('dotenv').config({ path: '../.env' });
require('dotenv').config();

async function debugVisibility() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Find JustinHewess
        const user = await User.findOne({ username: 'JustinHewess' });
        if (!user) {
            console.error('❌ JustinHewess not found');
            return;
        }

        console.log('📊 JustinHewess current state:');
        console.log('- userType:', user.userType);
        console.log('- allowedQuizzes:', user.allowedQuizzes);
        console.log('- hiddenQuizzes:', user.hiddenQuizzes);
        console.log('- hiddenQuizzes type:', typeof user.hiddenQuizzes);
        console.log('- hiddenQuizzes is array:', Array.isArray(user.hiddenQuizzes));

        // Test updating visibility for build-verification
        const quizName = 'build-verification';
        const isVisible = false; // Try to hide it

        console.log(`\n🔄 Testing visibility update for ${quizName} (isVisible: ${isVisible})`);

        if (!user.hiddenQuizzes) {
            console.log('⚠️ Initializing hiddenQuizzes array');
            user.hiddenQuizzes = [];
        }

        const quizIndex = user.hiddenQuizzes.indexOf(quizName);
        console.log('- Quiz index in hiddenQuizzes:', quizIndex);

        if (!isVisible && quizIndex === -1) {
            console.log('- Adding to hiddenQuizzes');
            user.hiddenQuizzes.push(quizName);
        } else if (isVisible && quizIndex !== -1) {
            console.log('- Removing from hiddenQuizzes');
            user.hiddenQuizzes.splice(quizIndex, 1);
        } else {
            console.log('- No change needed');
        }

        console.log('- New hiddenQuizzes:', user.hiddenQuizzes);

        // Try to save
        console.log('\n💾 Attempting to save...');
        await user.save();
        console.log('✅ Save successful!');

        // Verify the save
        const updatedUser = await User.findOne({ username: 'JustinHewess' });
        console.log('\n✅ Verification - updated hiddenQuizzes:', updatedUser.hiddenQuizzes);

    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Stack:', error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('📤 Database connection closed');
        process.exit(0);
    }
}

debugVisibility(); 