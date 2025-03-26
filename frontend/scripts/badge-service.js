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
            const userData = await this.apiService.getUserData();
            if (!userData.success || !userData.data) {
                throw new Error('Failed to load user data');
            }

            // Extract quiz progress from user data
            const quizProgress = userData.data.quizProgress || {};
            console.log('Quiz Progress:', quizProgress);

            // 2. Get available quizzes from categories
            const categories = await this.getCategoryStructure();
            if (!categories) {
                throw new Error('Failed to load quiz categories');
            }

            // Get all visible quizzes
            const allQuizzes = Object.values(categories).flatMap(categoryQuizzes => 
                categoryQuizzes.filter(quiz => !quiz.hidden)
            );
            console.log('Available Quizzes:', allQuizzes);

            // 3. Process quiz completion status
            const badges = allQuizzes.map(quiz => {
                const quizName = quiz.id;
                const progress = quizProgress[quizName] || {};
                
                // Check if quiz is complete
                const isCompleted = progress && (
                    progress.status === 'completed' ||
                    progress.status === 'passed' ||
                    (progress.questionHistory && progress.questionHistory.length === 15) ||
                    (typeof progress.questionsAnswered === 'number' && progress.questionsAnswered >= 15)
                );

                console.log(`Quiz ${quizName} completion status:`, {
                    isCompleted,
                    progress,
                    status: progress.status,
                    questionsAnswered: progress.questionsAnswered,
                    questionHistory: progress.questionHistory?.length
                });

                return {
                    id: `quiz-${quizName}`,
                    name: `${quiz.name} Master`,
                    description: `Complete the ${quiz.name} quiz`,
                    icon: 'fa-solid fa-check-circle',
                    earned: isCompleted,
                    completionDate: isCompleted ? (progress.lastUpdated || progress.completedAt || new Date().toISOString()) : null,
                    quizId: quizName
                };
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
            return {
                badges: [],
                totalBadges: 0,
                earnedCount: 0
            };
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
            const response = await this.apiService.fetchWithAuth('categories');
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
            
            // Return a default structure with known quizzes if API fails
            const defaultCategories = {
                'Technical': [
                    { id: 'initiative', name: 'Initiative', hidden: false },
                    { id: 'build-verification', name: 'Build Verification', hidden: false },
                    { id: 'standard-script-testing', name: 'Standard Script Testing', hidden: false },
                    { id: 'risk-management', name: 'Risk Management', hidden: false },
                    { id: 'tester-mindset', name: 'Tester Mindset', hidden: false }
                ]
            };
            
            // Cache the default categories
            this.cachedCategories = defaultCategories;
            return defaultCategories;
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
} 