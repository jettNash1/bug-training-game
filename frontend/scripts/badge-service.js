import { QUIZ_CATEGORIES } from '../quiz-list.js';

export class BadgeService {
    constructor(apiService) {
        this.apiService = apiService;
        this.cachedCategories = null;
        // Define badge image mapping - only for quizzes that actually exist in QUIZ_CATEGORIES
        this.badgeImageMapping = {
            // Core QA Skills
            'tester-mindset': 'tester-mindset.svg',
            'communication': 'communication.svg',
            'initiative': 'initiative.svg',
            'standard-script-testing': 'script-testing.svg',
            'fully-scripted': 'script-testing.svg',
            'exploratory': 'exploratory.svg',
            
            // Technical Testing
            'script-metrics-troubleshooting': 'metrics.svg',
            'locale-testing': 'locale.svg',
            'build-verification': 'build.svg',
            'test-types-tricks': 'test-types.svg',
            'test-support': 'test-support.svg',
            'sanity-smoke': 'sanity-smoke.svg',
            
            // Project Management
            'time-management': 'time-management.svg',
            'risk-analysis': 'risk.svg',
            'risk-management': 'risk.svg',
            'non-functional': 'non-functional.svg',
            'issue-verification': 'issue-verification.svg',
            'issue-tracking-tools': 'issue-tracking.svg',
            'raising-tickets': 'tickets.svg',
            
            // Content Testing
            'cms-testing': 'cms-testing.svg',
            'email-testing': 'email.svg',
            'content-copy': 'content-copy.svg',
            'reports': 'reports.svg',
            
            // Interview Preparation
            'automation-interview': 'automation.svg',
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

            // Extract quiz progress and hidden quizzes from user data
            const quizProgress = userData.data.quizProgress || {};
            const hiddenQuizzes = userData.data.hiddenQuizzes || [];
            console.log('Quiz Progress:', quizProgress);
            console.log('Hidden Quizzes:', hiddenQuizzes);
            
            // Get all quiz IDs from progress data and any additional quizzes we know about
            const allQuizIds = new Set(Object.keys(quizProgress));
            
            // Add real quiz IDs from the quiz categories
            const realQuizIds = Object.values(QUIZ_CATEGORIES).flat();
            realQuizIds.forEach(id => allQuizIds.add(id));
            
            console.log('Real quiz IDs from categories:', realQuizIds);
            
            // Convert to array and filter out hidden quizzes
            const visibleQuizIds = Array.from(allQuizIds).filter(quizId => 
                !hiddenQuizzes.includes(quizId)
            );
            
            console.log('All quiz IDs:', Array.from(allQuizIds));
            console.log('Visible quiz IDs after filtering:', visibleQuizIds);

            if (visibleQuizIds.length === 0) {
                console.warn('No visible quizzes found');
                return {
                    badges: [],
                    totalBadges: 0,
                    earnedCount: 0
                };
            }

            // Process quiz completion status for each visible quiz
            const badges = visibleQuizIds.map(quizId => {
                const progress = quizProgress[quizId] || {};
                
                // Check if quiz is complete AND has achieved 80% or higher score
                const hasCompletedAllQuestions = progress && (
                    (progress.questionHistory && progress.questionHistory.length === 15) ||
                    (typeof progress.questionsAnswered === 'number' && progress.questionsAnswered >= 15)
                );
                
                // Calculate score percentage - need at least 80% to earn badge
                let scorePercentage = 0;
                const TOTAL_QUIZ_QUESTIONS = 15; // Standard number of questions per quiz
                
                if (progress.score !== undefined && typeof progress.score === 'number') {
                    // If score is already a percentage (0-100)
                    scorePercentage = progress.score;
                } else if (progress.questionHistory && progress.questionHistory.length > 0) {
                    // Calculate from question history - use total expected questions, not just attempted
                    const correctAnswers = progress.questionHistory.filter(q => q.isCorrect).length;
                    // Only calculate percentage if they've completed the full quiz
                    if (progress.questionHistory.length === TOTAL_QUIZ_QUESTIONS) {
                        scorePercentage = (correctAnswers / TOTAL_QUIZ_QUESTIONS) * 100;
                    } else {
                        // If quiz is incomplete, show actual progress (questions answered / total)
                        // This gives a more realistic progress indication
                        scorePercentage = (progress.questionHistory.length / TOTAL_QUIZ_QUESTIONS) * 100;
                    }
                } else if (progress.correctAnswers !== undefined && progress.totalQuestions !== undefined) {
                    // Calculate from correct/total counts - only if completed
                    if (progress.totalQuestions === TOTAL_QUIZ_QUESTIONS) {
                    scorePercentage = (progress.correctAnswers / progress.totalQuestions) * 100;
                    } else {
                        scorePercentage = 0; // Incomplete quiz
                    }
                }
                
                // Badge is earned only if completed all questions AND achieved 80%+ score
                const isCompleted = hasCompletedAllQuestions && scorePercentage >= 80;

                // Determine the badge image path based on quiz type
                let imagePath;
                
                // Force specific image paths for problem quiz types
                if (quizId.toLowerCase().includes('sanity') || quizId.toLowerCase().includes('smoke')) {
                    imagePath = 'assets/badges/sanity-smoke.svg';
                } else if (quizId.toLowerCase().includes('cms')) {
                    imagePath = 'assets/badges/cms-testing.svg';
                } else if (quizId.toLowerCase().includes('exploratory')) {
                    imagePath = 'assets/badges/exploratory.svg';
                } else {
                    // Use the normal badge image path lookup for other quiz types
                    imagePath = this.getBadgeImage(`quiz-${quizId}`);
                }

                console.log(`Quiz ${quizId} completion status:`, {
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
                    id: `quiz-${quizId}`,
                    name: `${this.formatQuizName(quizId)} Master`,
                    description: `Complete the ${this.formatQuizName(quizId)} quiz with 80%+ score`,
                    icon: 'fa-solid fa-check-circle',
                    earned: isCompleted,
                    completionDate: isCompleted ? (progress.lastUpdated || progress.completedAt || new Date().toISOString()) : null,
                    quizId: quizId,
                    imagePath: imagePath,
                    scorePercentage: Math.round(scorePercentage),
                    isComplete: hasCompletedAllQuestions,
                    questionsAnswered: progress.questionHistory ? progress.questionHistory.length : (progress.questionsAnswered || 0)
                };
            });

            // Filter out duplicate badges using a more sophisticated approach
            const uniqueBadges = [];
            const normalizedSeenQuizzes = new Map(); // Map normalized ID to original badge
            
            console.log('Raw badges before deduplication:', badges.map(b => ({ id: b.quizId, name: b.name })));
            
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
                } else if (normalizedId.includes('communication')) {
                    normalizedId = 'communication'; // Normalize all communication variations
                }
                
                console.log(`Badge ${badge.quizId} normalized to: ${normalizedId}`);
                
                // Use the first badge we find for each normalized ID, or replace with earned one
                if (!normalizedSeenQuizzes.has(normalizedId) || 
                    (badge.earned && !normalizedSeenQuizzes.get(normalizedId).earned)) {
                    normalizedSeenQuizzes.set(normalizedId, badge);
                    console.log(`  -> Added/Updated badge for ${normalizedId}`);
                } else {
                    console.log(`  -> Skipped duplicate badge for ${normalizedId}`);
                }
            });
            
            // Convert the Map values to our unique badges array
            const finalBadges = Array.from(normalizedSeenQuizzes.values());
            
            console.log('Deduplicated badges:', finalBadges.map(b => ({ id: b.quizId, name: b.name, earned: b.earned })));

            // Sort badges: highest progress first, then alphabetically within same progress
            finalBadges.sort((a, b) => {
                // First sort by score percentage (highest first)
                if (a.scorePercentage !== b.scorePercentage) {
                    return b.scorePercentage - a.scorePercentage; // Descending order
                }
                
                // If scores are the same, sort by completion status (earned first)
                if (a.earned !== b.earned) {
                    return a.earned ? -1 : 1;
                }
                
                // Finally, sort alphabetically by name
                return a.name.localeCompare(b.name);
            });

            // Count completed badges
            const completedCount = finalBadges.filter(badge => badge.earned).length;

            console.log('Final badges data:', {
                total: finalBadges.length,
                completed: completedCount,
                badges: finalBadges.map(b => ({ id: b.quizId, name: b.name, earned: b.earned }))
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
            const TOTAL_QUIZ_QUESTIONS = 15; // Standard number of questions per quiz
            
            if (quizResult && quizResult.score !== undefined) {
                scorePercentage = quizResult.score;
            } else if (progress && progress.questionHistory && progress.questionHistory.length > 0) {
                const correctAnswers = progress.questionHistory.filter(q => q.isCorrect).length;
                  // Only calculate percentage if they've completed the full quiz
                  if (progress.questionHistory.length === TOTAL_QUIZ_QUESTIONS) {
                      scorePercentage = (correctAnswers / TOTAL_QUIZ_QUESTIONS) * 100;
                  } else {
                      // If quiz is incomplete, show actual progress (questions answered / total)
                      scorePercentage = (progress.questionHistory.length / TOTAL_QUIZ_QUESTIONS) * 100;
                  }
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
        // Special case for CMS Testing display name only
        if (quizId.toLowerCase() === 'cms-testing') {
            return 'CMS Testing (CRUD)';
        }
        
        return quizId
            .split(/[-_]/) // Split on either hyphen or underscore
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
} 