export class BadgeService {
    constructor(apiService) {
        this.apiService = apiService;
        this.badges = [
            // Quiz completion badges
            {
                id: 'first-quiz',
                name: 'First Steps',
                description: 'Start your first quiz',
                icon: 'fa-solid fa-shoe-prints',
                checkEligibility: (quizScores) => {
                    return quizScores.some(quiz => quiz.questionsAnswered > 0);
                }
            },
            {
                id: 'first-perfect',
                name: 'Perfect Beginning',
                description: 'Get a perfect score on your first quiz',
                icon: 'fa-solid fa-star',
                checkEligibility: (quizScores) => {
                    return quizScores.some(quiz => quiz.experience >= 300);
                }
            },
            {
                id: 'three-perfect',
                name: 'Triple Perfection',
                description: 'Get perfect scores on 3 quizzes',
                icon: 'fa-solid fa-award',
                checkEligibility: (quizScores) => {
                    return quizScores.filter(quiz => quiz.experience >= 300).length >= 3;
                }
            },
            {
                id: 'five-perfect',
                name: 'High Achiever',
                description: 'Get perfect scores on 5 quizzes',
                icon: 'fa-solid fa-crown',
                checkEligibility: (quizScores) => {
                    return quizScores.filter(quiz => quiz.experience >= 300).length >= 5;
                }
            },
            {
                id: 'all-completed',
                name: 'Quiz Master',
                description: 'Complete all quizzes',
                icon: 'fa-solid fa-graduation-cap',
                checkEligibility: (quizScores, categories) => {
                    const completedQuizzes = quizScores.filter(quiz => quiz.questionsAnswered === 15);
                    const totalVisibleQuizzes = this.countVisibleQuizzes(categories);
                    return completedQuizzes.length >= totalVisibleQuizzes && totalVisibleQuizzes > 0;
                }
            },
            // Category-specific badges
            {
                id: 'core-qa-complete',
                name: 'QA Fundamentals',
                description: 'Complete all Core QA Skills quizzes',
                icon: 'fa-solid fa-clipboard-check',
                checkEligibility: (quizScores, categories) => {
                    return this.isCategoryComplete(quizScores, categories, 'Core QA Skills');
                }
            },
            {
                id: 'tech-testing-complete',
                name: 'Technical Tester',
                description: 'Complete all Technical Testing Skills quizzes',
                icon: 'fa-solid fa-code',
                checkEligibility: (quizScores, categories) => {
                    return this.isCategoryComplete(quizScores, categories, 'Technical Testing Skills');
                }
            },
            {
                id: 'automation-complete',
                name: 'Automation Specialist',
                description: 'Complete all Automation quizzes',
                icon: 'fa-solid fa-robot',
                checkEligibility: (quizScores, categories) => {
                    return this.isCategoryComplete(quizScores, categories, 'Automation');
                }
            }
        ];
    }

    countVisibleQuizzes(categories) {
        if (!categories) return 0;
        return Object.values(categories).reduce((count, quizzes) => {
            return count + quizzes.filter(quiz => !quiz.hidden).length;
        }, 0);
    }

    isCategoryComplete(quizScores, categories, categoryName) {
        if (!categories || !categories[categoryName]) return false;
        
        const categoryQuizzes = categories[categoryName].filter(quiz => !quiz.hidden);
        if (categoryQuizzes.length === 0) return false;
        
        const quizIds = categoryQuizzes.map(quiz => quiz.id);
        const completedQuizIds = quizScores
            .filter(quiz => quiz.questionsAnswered === 15)
            .map(quiz => quiz.quizName);
        
        return quizIds.every(id => completedQuizIds.includes(id));
    }

    async getUserBadges() {
        try {
            // Get the user's quiz progress
            const userData = await this.apiService.getUserData();
            if (!userData.success || !userData.data) {
                throw new Error('Failed to load user data');
            }

            // Get all quiz scores for the user
            const quizScores = await this.getAllQuizScores();
            
            // Get quiz categories structure
            const categories = await this.getCategoryStructure();

            // Calculate which badges the user has earned
            const earnedBadges = this.badges.map(badge => {
                const isEarned = badge.checkEligibility(quizScores, categories);
                return {
                    ...badge,
                    earned: isEarned
                };
            });

            // Add individual quiz completion badges
            const quizCompletionBadges = await this.generateQuizCompletionBadges(quizScores, categories);
            earnedBadges.push(...quizCompletionBadges);

            return {
                badges: earnedBadges,
                totalBadges: earnedBadges.length,
                earnedCount: earnedBadges.filter(badge => badge.earned).length
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
        try {
            // First get the list of available quizzes
            const quizResponse = await this.apiService.get('/api/quizzes/list');
            if (!quizResponse.success) {
                throw new Error('Failed to fetch quiz list');
            }

            const quizIds = quizResponse.data.map(quiz => quiz.id);
            const progressPromises = quizIds.map(async (quizId) => {
                try {
                    const savedProgress = await this.apiService.getQuizProgress(quizId);
                    const progress = savedProgress?.data;
                    
                    if (!progress) {
                        return { 
                            quizName: quizId, 
                            score: 0, 
                            questionsAnswered: 0, 
                            status: 'not-started',
                            experience: 0
                        };
                    }
                    
                    return {
                        quizName: quizId,
                        score: progress.score || 0,
                        questionsAnswered: progress.questionsAnswered || 0,
                        status: progress.status || 'in-progress',
                        experience: progress.experience || 0
                    };
                } catch (error) {
                    console.error(`Error loading progress for quiz ${quizId}:`, error);
                    return null;
                }
            });
            
            const results = await Promise.all(progressPromises);
            return results.filter(Boolean);
        } catch (error) {
            console.error('Error fetching all quiz scores:', error);
            return [];
        }
    }

    async getCategoryStructure() {
        try {
            const response = await this.apiService.get('/api/categories');
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
            console.error('Error fetching category structure:', error);
            return null;
        }
    }

    async generateQuizCompletionBadges(quizScores, categories) {
        const quizCompletionBadges = [];
        
        // Get all quizzes from categories
        const allQuizzes = Object.values(categories || {}).flatMap(category => 
            category.filter(quiz => !quiz.hidden)
        );

        // Create a badge for each quiz
        for (const quiz of allQuizzes) {
            const quizScore = quizScores.find(score => score.quizName === quiz.id);
            const isCompleted = quizScore && quizScore.questionsAnswered === 15;
            const completionDate = quizScore?.completedAt || null;

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