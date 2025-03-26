export class BadgeService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    countVisibleQuizzes(categories) {
        if (!categories) return 0;
        return Object.values(categories).reduce((count, quizzes) => {
            return count + quizzes.filter(quiz => !quiz.hidden).length;
        }, 0);
    }

    async getUserBadges() {
        try {
            // Get user data which includes quiz results and progress
            const userData = await this.apiService.getUserData();
            if (!userData.success || !userData.data) {
                throw new Error('Failed to load user data');
            }

            // Get quiz results and progress from user data
            const quizResults = userData.data.quizResults || [];
            const quizProgress = userData.data.quizProgress || {};

            // Create a set to track unique completed quizzes
            const completedQuizzes = new Set();

            // Check quiz progress for completed quizzes
            Object.entries(quizProgress).forEach(([quizName, progress]) => {
                // A quiz is completed if it exists in the progress object
                // and has a valid status/completion state
                if (progress && (
                    progress.status === 'completed' || 
                    progress.status === 'passed' ||
                    (progress.questionHistory && progress.questionHistory.length === 15)
                )) {
                    completedQuizzes.add(quizName);
                }
            });

            // Create badges for completed quizzes
            const badges = Array.from(completedQuizzes).map(quizName => {
                const progress = quizProgress[quizName];
                
                return {
                    id: `quiz-${quizName}`,
                    name: `${quizName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Master`,
                    description: `Complete the ${quizName.replace(/_/g, ' ')} quiz`,
                    icon: 'fa-solid fa-check-circle',
                    earned: true,
                    completionDate: progress?.lastUpdated || progress?.completedAt || new Date().toISOString(),
                    quizId: quizName
                };
            });

            return {
                badges,
                totalBadges: badges.length,
                earnedCount: badges.length // All badges are earned since we're only showing completed quizzes
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
        const maxRetries = 3;
        const retryDelay = 2000; // 2 seconds
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await this.apiService.fetchWithAuth('categories');
                if (!response.success) {
                    throw new Error('Failed to fetch categories');
                }
                
                // Transform into a more usable structure
                // { categoryName: [{ id: 'quizId', name: 'Quiz Name', hidden: false }] }
                const categories = {};
                
                response.data.forEach(category => {
                    categories[category.name] = category.quizzes.map(quiz => ({
                        id: quiz.id,
                        name: quiz.name,
                        hidden: quiz.hidden || false
                    }));
                });
                
                return categories;
            } catch (error) {
                console.warn(`Attempt ${attempt} failed:`, error);
                if (attempt === maxRetries) {
                    console.error('Error fetching category structure after all retries:', error);
                    return null;
                }
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
        return null;
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