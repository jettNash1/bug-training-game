    async manuallyTriggerReset(quizName) {
        try {
            console.log(`Manually triggering reset for quiz: ${quizName}`);
            
            // Confirm with the user
            const confirmed = confirm(`Are you sure you want to reset all completed ${this.formatQuizName(quizName)} quizzes? This will reset progress for all users who have completed this quiz.`);
            
            if (!confirmed) {
                console.log('Reset cancelled by user');
                return;
            }
            
            // Show loading notification
            this.showInfo(`Processing reset for ${this.formatQuizName(quizName)} quiz...`);
            
            // Get all users
            const usersResponse = await this.apiService.getAllUsers();
            
            if (!usersResponse.success) {
                throw new Error(`Failed to get users: ${usersResponse.message}`);
            }
            
            const users = usersResponse.data || [];
            console.log(`Checking ${users.length} users for completed ${quizName} quizzes`);
            
            // First pass: check all users' quizResults to find completed quizzes
            // without making API calls (more efficient)
            console.log("First pass: checking quizResults for all users");
            const normalizedQuizName = quizName.toLowerCase().trim();
            let completedUsers = [];
            
            for (const user of users) {
                if (user.quizResults && Array.isArray(user.quizResults)) {
                    const quizResult = user.quizResults.find(r => 
                        r.quizName && r.quizName.toLowerCase().trim() === normalizedQuizName);
                    
                    if (quizResult && quizResult.questionsAnswered >= 15) {
                        console.log(`First pass: User ${user.username} has completed ${quizName} quiz with ${quizResult.questionsAnswered} questions`);
                        completedUsers.push(user.username);
                    }
                }
            }
            
            console.log(`First pass found ${completedUsers.length} users who completed the quiz`);
            
            // Second pass: check remaining users with API calls
            console.log("Second pass: checking quizProgress with API for remaining users");
            const skippedUsers = [];
            
            for (const user of users) {
                // Skip users already identified as having completed the quiz
                if (completedUsers.includes(user.username)) {
                    console.log(`Skipping API check for ${user.username} - already identified as completed`);
                    continue;
                }
                
                console.log(`Checking user ${user.username} for completed ${quizName} quiz`);
                
                try {
                    console.log(`Checking quizProgress for ${user.username}`);
                    
                    // Add a timeout to prevent hanging on unresponsive API calls
                    const progressResponse = await Promise.race([
                        this.apiService.getUserQuizProgress(user.username, quizName),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('API call timeout')), 5000))
                    ]);
                    
                    if (progressResponse.success && progressResponse.data) {
                        const progress = progressResponse.data;
                        console.log(`${user.username} quizProgress data:`, progress);
                        
                        // Check if user has completed the quiz - ONLY check question count
                        const isCompleted = progress.questionsAnswered >= 15 || 
                                         (progress.questionHistory && progress.questionHistory.length >= 15);
                        
                        if (isCompleted) {
                            console.log(`User ${user.username} has completed ${quizName} quiz (from quizProgress)`);
                            completedUsers.push(user.username);
                        } else {
                            console.log(`User ${user.username} has NOT completed ${quizName} quiz (from quizProgress)`);
                            skippedUsers.push(user.username);
                        }
                    } else {
                        console.log(`No progress data found for ${user.username} on ${quizName}`);
                        skippedUsers.push(user.username);
                    }
                } catch (error) {
                    console.error(`Error checking progress for user ${user.username}:`, error);
                    skippedUsers.push(user.username);
                }
            }
            
            console.log(`Found ${completedUsers.length} users who completed ${quizName} quiz: ${completedUsers.join(', ')}`);
            console.log(`Skipped ${skippedUsers.length} users who haven't completed ${quizName} quiz: ${skippedUsers.join(', ')}`);
            
            if (completedUsers.length === 0) {
                this.showInfo(`No users have completed the ${this.formatQuizName(quizName)} quiz`);
                return;
            }
            
            this.showInfo(`Processing reset for ${completedUsers.length} users...`);
            
            // Reset each user's quiz
            let successCount = 0;
            for (const username of completedUsers) {
                try {
                    // Reset the quiz progress
                    const resetResponse = await this.apiService.resetQuizProgress(username, quizName);
                    
                    if (resetResponse.success) {
                        successCount++;
                        console.log(`Reset ${username}'s ${quizName} quiz`);
                    } else {
                        console.error(`Failed to reset ${username}'s ${quizName} quiz:`, resetResponse.message);
                    }
                } catch (error) {
                    console.error(`Error resetting ${username}'s ${quizName} quiz:`, error);
                }
            }
            
            // Update lastReset time for the auto-reset setting
            await this.apiService.updateAutoResetLastResetTime(quizName);
            
            // Calculate and update next reset time
            const setting = this.autoResetSettings[quizName];
            if (setting) {
                const newNextResetTime = this.calculateNextResetTime(setting.resetPeriod);
                await this.apiService.saveAutoResetSetting(
                    quizName, 
                    setting.resetPeriod, 
                    true, 
                    newNextResetTime
                );
                
                console.log(`Updated next reset time for ${quizName} to ${newNextResetTime}`);
            }
            
            // Reload settings to update the UI
            await this.loadAutoResetSettings();
            
            // Show success message
            this.showSuccess(`Successfully reset ${successCount} out of ${completedUsers.length} users for the ${this.formatQuizName(quizName)} quiz`);
            
        } catch (error) {
            console.error(`Error manually triggering reset for ${quizName}:`, error);
            this.showInfo(`Failed to reset quiz: ${error.message}`, 'error');
        }
    } 