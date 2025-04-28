// Migration script to standardize quiz timer settings
// Run this with: node migrate-timer-settings.js

require('dotenv').config();
const mongoose = require('mongoose');
const Setting = require('./models/setting.model');

async function migrateTimerSettings() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find current timer settings using the old key
        const oldSettings = await Setting.findOne({ key: 'quizTimer' });
        
        if (!oldSettings) {
            console.log('No legacy quiz timer settings found. Nothing to migrate.');
            
            // Check if new settings exist
            const newSettings = await Setting.findOne({ key: 'quizTimerSettings' });
            if (newSettings) {
                console.log('New format settings already exist:');
                console.log(JSON.stringify(newSettings.value, null, 2));
            } else {
                console.log('No timer settings found at all. Creating default settings...');
                
                // Create default settings
                const defaultSettings = new Setting({
                    key: 'quizTimerSettings',
                    value: {
                        defaultSeconds: 60,
                        quizTimers: {}
                    },
                    updatedAt: new Date()
                });
                
                await defaultSettings.save();
                console.log('Default timer settings created successfully');
            }
            
            await mongoose.disconnect();
            return;
        }
        
        console.log('Found legacy timer settings:');
        console.log(JSON.stringify(oldSettings.value, null, 2));
        
        // Convert old format to new format
        const oldValue = oldSettings.value;
        const defaultSeconds = oldValue.secondsPerQuestion || 60;
        const quizTimers = oldValue.quizTimers || {};
        
        // Check if new settings already exist
        const existingNewSettings = await Setting.findOne({ key: 'quizTimerSettings' });
        
        if (existingNewSettings) {
            console.log('New format settings already exist. Updating...');
            
            existingNewSettings.value = {
                defaultSeconds: defaultSeconds,
                quizTimers: quizTimers
            };
            existingNewSettings.updatedAt = new Date();
            
            await existingNewSettings.save();
            console.log('Updated settings saved successfully');
        } else {
            console.log('Creating new settings with migrated data...');
            
            // Create new settings
            const newSettings = new Setting({
                key: 'quizTimerSettings',
                value: {
                    defaultSeconds: defaultSeconds,
                    quizTimers: quizTimers
                },
                updatedAt: new Date()
            });
            
            await newSettings.save();
            console.log('New settings created successfully');
        }
        
        // Optionally, rename or delete the old settings
        console.log('Creating backup of old settings...');
        const backupSettings = new Setting({
            key: 'quizTimer_backup',
            value: oldSettings.value,
            updatedAt: new Date()
        });
        
        await backupSettings.save();
        console.log('Backup created successfully');
        
        // Delete the old settings
        console.log('Deleting old settings...');
        await Setting.deleteOne({ key: 'quizTimer' });
        console.log('Old settings deleted successfully');
        
        console.log('Migration completed successfully!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

// Run the migration
migrateTimerSettings()
    .then(() => {
        console.log('Migration process completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('Migration failed:', error);
        process.exit(1);
    }); 