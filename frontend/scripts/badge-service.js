export class BadgeService {
    constructor(apiService) {
        this.apiService = apiService;
        this.cachedCategories = null;
        // Define badge image mapping
        this.badgeImageMapping = {
            // Default mapping for common quiz types
            'automation-interview': 'automation.svg',
            'build-verification': 'build.svg',
            'cms-testing': 'cms-testing.svg',
            'integration-testing': 'integration.svg',
            'api-testing': 'api.svg',
            'security-testing': 'security.svg',
            'performance-testing': 'performance.svg',
            'usability-testing': 'usability.svg',
            'accessibility-testing': 'accessibility.svg',
            'mobile-testing': 'mobile.svg',
            'regression-testing': 'regression.svg',
            'functional-testing': 'functional.svg',
            'exploratory': 'exploratory.svg',
            'test-planning': 'planning.svg',
            'defect-management': 'defect.svg',
            'test-automation': 'automation.svg',
            'continuous-integration': 'ci.svg',
            'agile-testing': 'agile.svg',
            'qa-fundamentals': 'fundamentals.svg',
            'test-strategy': 'strategy.svg',
            'test-metrics': 'metrics.svg',
            'test-estimation': 'estimation.svg',
            'test-reporting': 'reporting.svg',
            'test-design': 'design.svg',
            'test-environment': 'environment.svg',
            'test-data': 'data.svg',
            'test-case': 'testcase.svg',
            'communication': 'communication.svg',
            'initiative': 'initiative.svg',
            'time-management': 'time-management.svg',
            'tester-mindset': 'tester-mindset.svg',
            'risk-analysis': 'risk.svg',
            'risk-management': 'risk.svg',
            'non-functional': 'non-functional.svg',
            'test-support': 'test-support.svg',
            'issue-verification': 'issue-verification.svg',
            'issue-tracking-tools': 'issue-tracking.svg',
            'raising-tickets': 'tickets.svg',
            'reports': 'reports.svg',
            'email-testing': 'email.svg',
            'content-copy': 'content-copy.svg',
            'locale-testing': 'locale.svg',
            'script-metrics-troubleshooting': 'metrics.svg',
            'standard-script-testing': 'script-testing.svg',
            'test-types-tricks': 'test-types.svg',
            'fully-scripted': 'script-testing.svg',
            'sanity-smoke': 'sanity-smoke.svg',
            'functional-interview': 'functional-interview.svg'
        };
    }

    // Get badge image for a specific quiz
    getBadgeImage(quizId) {
        // Convert quiz-id format to quizId for lookup
        const normalizedId = quizId.replace('quiz-', '');
        
        // Check if we have a specific image for this quiz
        if (this.badgeImageMapping[normalizedId]) {
            return `assets/badges/${this.badgeImageMapping[normalizedId]}`;
        }
        
        // Try to extract category from the quiz ID
        const parts = normalizedId.split('-');
        if (parts.length > 1) {
            const category = parts[0];
            if (this.badgeImageMapping[category]) {
                return `assets/badges/${this.badgeImageMapping[category]}`;
            }
        }
        
        // Fallback to a default image if no specific match
        return 'assets/badges/default.svg';
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

            // Process quiz completion status and force specific image paths
            const badges = allQuizzes.map(quiz => {
                const progress = quizProgress[quiz.id] || {};
                
                // Check if quiz is complete AND has achieved 80% or higher score
                const hasCompletedAllQuestions = progress && (
                    (progress.questionHistory && progress.questionHistory.length === 15) ||
                    (typeof progress.questionsAnswered === 'number' && progress.questionsAnswered >= 15)
                );
                
                // Calculate score percentage - need at least 80% to earn badge
                let scorePercentage = 0;
                if (progress.score !== undefined && typeof progress.score === 'number') {
                    // If score is already a percentage (0-100)
                    scorePercentage = progress.score;
                } else if (progress.questionHistory && progress.questionHistory.length > 0) {
                    // Calculate from question history
                    const correctAnswers = progress.questionHistory.filter(q => q.isCorrect).length;
                    scorePercentage = (correctAnswers / progress.questionHistory.length) * 100;
                } else if (progress.correctAnswers !== undefined && progress.totalQuestions !== undefined) {
                    // Calculate from correct/total counts
                    scorePercentage = (progress.correctAnswers / progress.totalQuestions) * 100;
                }
                
                // Badge is earned only if completed all questions AND achieved 80%+ score
                const isCompleted = hasCompletedAllQuestions && scorePercentage >= 80;

                // Determine the badge image path based on quiz type
                let imagePath;
                
                // Force specific image paths for problem quiz types
                if (quiz.id.toLowerCase().includes('sanity') || quiz.id.toLowerCase().includes('smoke')) {
                    imagePath = 'assets/badges/sanity-smoke.svg';
                } else if (quiz.id.toLowerCase().includes('cms')) {
                    imagePath = 'assets/badges/cms-testing.svg';
                } else if (quiz.id.toLowerCase().includes('exploratory')) {
                    imagePath = 'assets/badges/exploratory.svg';
                } else {
                    // Use the normal badge image path lookup for other quiz types
                    imagePath = this.getBadgeImage(`quiz-${quiz.id}`);
                }

                console.log(`Quiz ${quiz.id} completion status:`, {
                    isCompleted,
                    hasCompletedAllQuestions,
                    scorePercentage: Math.round(scorePercentage),
                    progress,
                    status: progress.status,
                    questionsAnswered: progress.questionsAnswered,
                    questionHistory: progress.questionHistory?.length,
                    imagePath: imagePath
                });

                return {
                    id: `quiz-${quiz.id}`,
                    name: `${quiz.name} Master`,
                    description: `Complete the ${quiz.name} quiz with 80%+ score`,
                    icon: 'fa-solid fa-check-circle',
                    earned: isCompleted,
                    completionDate: isCompleted ? (progress.lastUpdated || progress.completedAt || new Date().toISOString()) : null,
                    quizId: quiz.id,
                    imagePath: imagePath,
                    scorePercentage: Math.round(scorePercentage)
                };
            });

            // Filter out duplicate badges using a more sophisticated approach
            const uniqueBadges = [];
            const normalizedSeenQuizzes = new Map(); // Map normalized ID to original badge
            
            badges.forEach(badge => {
                // Normalize quiz ID for comparison (handle case differences and extra words)
                let normalizedId = badge.quizId.toLowerCase();
                
                // Special handling for problem cases - use simple categories for grouping
                if (normalizedId.includes('sanity') || normalizedId.includes('smoke')) {
                    normalizedId = 'sanity-smoke'; // Normalize all sanity/smoke variations
                } else if (normalizedId.includes('cms')) {
                    normalizedId = 'cms-testing'; // Normalize all CMS variations
                } else if (normalizedId.includes('exploratory')) {
                    normalizedId = 'exploratory'; // Normalize all exploratory variations
                }
                
                // Use the first badge we find for each normalized ID, or replace with earned one
                if (!normalizedSeenQuizzes.has(normalizedId) || 
                    (badge.earned && !normalizedSeenQuizzes.get(normalizedId).earned)) {
                    normalizedSeenQuizzes.set(normalizedId, badge);
                }
            });
            
            // Convert the Map values to our unique badges array
            const finalBadges = Array.from(normalizedSeenQuizzes.values());

            // Sort badges: completed first, then alphabetically by name
            finalBadges.sort((a, b) => {
                // First sort by completion status
                if (a.earned && !b.earned) return -1;
                if (!a.earned && b.earned) return 1;
                
                // Then sort alphabetically by name
                return a.name.localeCompare(b.name);
            });

            // Count completed badges
            const completedCount = finalBadges.filter(badge => badge.earned).length;

            console.log('Final badges data:', {
                total: finalBadges.length,
                completed: completedCount,
                badges: finalBadges
            });

            return {
                badges: finalBadges,
                totalBadges: finalBadges.length,
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
            
            // Check completion status - must complete all questions AND achieve 80%+ score
            const hasCompletedAllQuestions = quizResult && quizResult.questionsAnswered === 15;
            
            // Calculate score percentage
            let scorePercentage = 0;
            if (quizResult && quizResult.score !== undefined) {
                scorePercentage = quizResult.score;
            } else if (progress && progress.questionHistory && progress.questionHistory.length > 0) {
                const correctAnswers = progress.questionHistory.filter(q => q.isCorrect).length;
                scorePercentage = (correctAnswers / progress.questionHistory.length) * 100;
            }
            
            // Badge is earned only if completed all questions AND achieved 80%+ score
            const isCompleted = hasCompletedAllQuestions && scorePercentage >= 80;
            const completionDate = isCompleted ? (quizResult?.completedAt || progress?.completedAt || null) : null;

            quizCompletionBadges.push({
                id: `quiz-${quiz.id}`,
                name: `${quiz.name} Master`,
                description: `Complete the ${quiz.name} quiz with 80%+ score`,
                icon: 'fa-solid fa-check-circle',
                earned: isCompleted,
                completionDate: completionDate,
                quizId: quiz.id,
                // Add image path to the badge data
                imagePath: this.getBadgeImage(`quiz-${quiz.id}`),
                scorePercentage: Math.round(scorePercentage)
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