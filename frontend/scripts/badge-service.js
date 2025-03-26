export class BadgeService {
    constructor(apiService) {
        this.apiService = apiService;
        this.cachedCategories = null;
    }

    countVisibleQuizzes(categories) {
        if (!categories) return 0;
        return Object.values(categories).reduce((count, quizzes) => {
            return count + quizzes.filter(quiz => !quiz.hidden).length;
        }, 0);
    }

    async getUserBadges() {
        try {
            // 1. Grab user data
            console.log('Fetching user data...');
            const userData = await this.apiService.getUserData();
            if (!userData.success || !userData.data) {
                throw new Error('Failed to load user data');
            }
            console.log('User data received:', userData.data);

            // Extract quiz progress from user data
            const quizProgress = userData.data.quizProgress || {};
            console.log('Quiz Progress:', quizProgress);
            
            // Get all quizzes from the progress data
            const allQuizzes = Object.keys(quizProgress).map(quizId => ({
                id: quizId,
                name: this.formatQuizName(quizId)
            }));
            
            console.log('Available Quizzes:', allQuizzes);

            if (allQuizzes.length === 0) {
                console.warn('No quizzes found in user progress');
                return {
                    badges: [],
                    totalBadges: 0,
                    earnedCount: 0
                };
            }

            // Process quiz completion status
            const badges = allQuizzes.map(quiz => {
                const progress = quizProgress[quiz.id] || {};
                
                // Check if quiz is complete based on status or progress
                const isCompleted = progress && (
                    progress.status === 'completed' ||
                    progress.status === 'passed' ||
                    (progress.questionHistory && progress.questionHistory.length === 15) ||
                    (typeof progress.questionsAnswered === 'number' && progress.questionsAnswered >= 15)
                );

                console.log(`Quiz ${quiz.id} completion status:`, {
                    isCompleted,
                    progress,
                    status: progress.status,
                    questionsAnswered: progress.questionsAnswered,
                    questionHistory: progress.questionHistory?.length
                });

                return {
                    id: `quiz-${quiz.id}`,
                    name: `${quiz.name} Master`,
                    description: `Complete the ${quiz.name} quiz`,
                    icon: 'fa-solid fa-check-circle',
                    earned: isCompleted,
                    completionDate: isCompleted ? (progress.lastUpdated || progress.completedAt || new Date().toISOString()) : null,
                    quizId: quiz.id
                };
            });

            // Sort badges: completed first, then alphabetically by name
            badges.sort((a, b) => {
                // First sort by completion status
                if (a.earned && !b.earned) return -1;
                if (!a.earned && b.earned) return 1;
                
                // Then sort alphabetically by name
                return a.name.localeCompare(b.name);
            });

            // Count completed badges
            const completedCount = badges.filter(badge => badge.earned).length;

            console.log('Final badges data:', {
                total: badges.length,
                completed: completedCount,
                badges: badges
            });

            return {
                badges,
                totalBadges: badges.length,
                earnedCount: completedCount
            };
        } catch (error) {
            console.error('Error getting user badges:', error);
            throw error; // Re-throw the error to be handled by the badges page
        }
    }

    async getAllQuizScores() {
        const maxRetries = 3;
        const retryDelay = 2000; // 2 seconds
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // First get the list of available quizzes
                const quizResponse = await this.apiService.fetchWithAuth('quizzes/list');
                if (!quizResponse.success) {
                    throw new Error('Failed to fetch quiz list');
                }

                const quizIds = quizResponse.data.map(quiz => quiz.id);
                
                // Process quizzes in smaller batches to avoid timeout
                const batchSize = 5;
                const results = [];
                
                for (let i = 0; i < quizIds.length; i += batchSize) {
                    const batch = quizIds.slice(i, i + batchSize);
                    const batchPromises = batch.map(async (quizId) => {
                        try {
                            const savedProgress = await this.apiService.getQuizProgress(quizId);
                            if (!savedProgress || !savedProgress.success) {
                                return { 
                                    quizName: quizId, 
                                    score: 0, 
                                    questionsAnswered: 0, 
                                    status: 'not-started',
                                    experience: 0
                                };
                            }
                            
                            const progress = savedProgress.data;
                            return {
                                quizName: quizId,
                                score: progress.score || 0,
                                questionsAnswered: progress.questionsAnswered || 0,
                                status: progress.status || 'in-progress',
                                experience: progress.experience || 0,
                                completedAt: progress.completedAt || null
                            };
                        } catch (error) {
                            console.error(`Error loading progress for quiz ${quizId}:`, error);
                            return null;
                        }
                    });
                    
                    const batchResults = await Promise.all(batchPromises);
                    results.push(...batchResults);
                }
                
                return results.filter(Boolean);
            } catch (error) {
                console.warn(`Attempt ${attempt} failed:`, error);
                if (attempt === maxRetries) {
                    console.error('Error fetching all quiz scores after all retries:', error);
                    return [];
                }
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
        return [];
    }

    async getCategoryStructure() {
        // Return cached categories if available
        if (this.cachedCategories) {
            return this.cachedCategories;
        }

        try {
            // Create a custom fetch options object with a longer timeout
            const options = {
                signal: (new AbortController()).signal,
                timeout: 15000 // Increase timeout to 15 seconds
            };

            const response = await this.apiService.fetchWithAuth('categories', options);
            if (!response.success) {
                throw new Error('Failed to fetch categories');
            }
            
            // Transform into a more usable structure
            const categories = {};
            
            response.data.forEach(category => {
                categories[category.name] = category.quizzes.map(quiz => ({
                    id: quiz.id,
                    name: quiz.name,
                    hidden: quiz.hidden || false
                }));
            });
            
            // Cache the categories
            this.cachedCategories = categories;
            return categories;
        } catch (error) {
            console.error('Error fetching category structure:', error);
            // Don't use fallback structure, throw the error to handle it properly
            throw error;
        }
    }

    generateQuizCompletionBadges(quizResults, categories, quizProgress) {
        const quizCompletionBadges = [];
        
        // Get all visible quizzes from categories
        const allQuizzes = Object.values(categories || {}).flatMap(category => 
            category.filter(quiz => !quiz.hidden)
        );

        // Create a badge for each quiz
        for (const quiz of allQuizzes) {
            const quizResult = quizResults.find(result => result.quizName === quiz.id);
            const progress = quizProgress[quiz.id];
            
            // Check completion status
            const isCompleted = quizResult && quizResult.questionsAnswered === 15;
            const completionDate = quizResult?.completedAt || progress?.completedAt || null;

            quizCompletionBadges.push({
                id: `quiz-${quiz.id}`,
                name: `${quiz.name} Master`,
                description: `Complete the ${quiz.name} quiz`,
                icon: 'fa-solid fa-check-circle',
                earned: isCompleted,
                completionDate: completionDate,
                quizId: quiz.id
            });
        }

        return quizCompletionBadges;
    }

    // Helper function to format quiz names
    formatQuizName(quizId) {
        return quizId
            .split(/[-_]/) // Split on either hyphen or underscore
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
} 