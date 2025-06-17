const mongoose = require('mongoose');
const User = require('./models/user.model');

// Load environment variables
require('dotenv').config({ path: '../.env' });
require('dotenv').config();

async function fixUserTypes() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Find users with userType 'regular' (should be 'standard')
        const usersToFix = await User.find({ userType: 'regular' });
        
        console.log(`📊 Found ${usersToFix.length} users with userType 'regular' to fix:`);
        usersToFix.forEach(user => {
            console.log(`  - ${user.username}`);
        });

        if (usersToFix.length === 0) {
            console.log('✅ No users to fix. All userTypes are correct.');
            return;
        }

        // Fix each user
        for (const user of usersToFix) {
            console.log(`🔄 Fixing ${user.username}...`);
            user.userType = 'standard';
            await user.save();
            console.log(`  ✅ ${user.username} fixed successfully`);
        }

        console.log(`\n🎉 Fixed ${usersToFix.length} users' userType from 'regular' to 'standard'!`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📤 Database connection closed');
        process.exit(0);
    }
}

fixUserTypes(); 