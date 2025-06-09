import { APIService } from './api-service.js';

export const QUIZ_CATEGORIES = {
    'Core QA Skills': [
        'tester-mindset',
        'communication',
        'initiative',
        'standard-script-testing',
        'fully-scripted',
        'exploratory'
    ],
    'Technical Testing': [
        'script-metrics-troubleshooting',
        'locale-testing',
        'build-verification',
        'test-types-tricks',
        'test-support',
        'sanity-smoke'
    ],
    'Project Management': [
        'time-management',
        'risk-analysis',
        'risk-management',
        'non-functional',
        'issue-verification',
        'issue-tracking-tools',
        'raising-tickets'
    ],
    'Content Testing': [
        'cms-testing',
        'email-testing',
        'content-copy',
        'reports'
    ],
    'Interview Preparation': [
        'automation-interview',
        'functional-interview'
    ]
};

export class QuizList {
    constructor() {
        this.apiService = new APIService();
        this.quizTypes = Object.values(QUIZ_CATEGORIES).flat();
        this.init();
    }

    async init() {
        await this.displayQuizzes();
    }

    async displayQuizzes() {
        try {
            // Get user data first
            const userData = await this.apiService.getUserData();
            if (!userData.success) {
                throw new Error('Failed to get user data');
            }

            const { userType, allowedQuizzes = [], hiddenQuizzes = [], quizProgress = {} } = userData.data;
            const isInterviewAccount = userType === 'interview_candidate';

            // Debug logging
            console.log('Quiz visibility debug:', {
                userType,
                isInterviewAccount,
                allowedQuizzes,
                hiddenQuizzes,
                totalQuizTypes: this.quizTypes.length,
                quizProgress
            });

            // Create categories HTML
            const categoriesHTML = Object.entries(QUIZ_CATEGORIES).map(([category, quizzes]) => {
                // Filter visible quizzes for this category
                const visibleQuizzes = quizzes.filter(quiz => {
                    const quizLower = quiz.toLowerCase();
                    if (isInterviewAccount) {
                        return allowedQuizzes.includes(quizLower);
                    } else {
                        return !hiddenQuizzes.includes(quizLower);
                    }
                });

                if (visibleQuizzes.length === 0) {
                    return ''; // Skip empty categories
                }

                // Create quiz items HTML for this category
                const quizItemsHTML = visibleQuizzes.map(quizName => {
                    const quizLower = quizName.toLowerCase();
                    const progress = quizProgress[quizLower] || {};
                    const questionsAnswered = progress.questionsAnswered || 0;
                    const score = progress.score || 0;
                    
                    // Determine quiz status and styling
                    let statusClass = 'not-started';
                    let progressText = '';
                    
                    if (questionsAnswered === 15) {
                        if (score >= 80) {
                            statusClass = 'completed-perfect';
                            progressText = '15/15';
                        } else {
                            statusClass = 'completed-partial';
                            progressText = '15/15';
                        }
                    } else if (questionsAnswered > 0) {
                        statusClass = 'in-progress';
                        progressText = `${questionsAnswered}/15`;
                    }

                    return `
                        <a href="pages/${quizLower}-quiz.html" class="quiz-item ${statusClass}" data-quiz="${quizLower}" aria-label="Start ${this.formatQuizName(quizName)} quiz">
                            <div class="quiz-completion" role="status" id="${quizLower}-progress">${progressText}</div>
                            <div class="quiz-info">
                                <div>
                                    <div class="quiz-icon" aria-hidden="true">
                                        <img src="./assets/badges/${quizLower}.svg" alt="${this.formatQuizName(quizName)} icon" 
                                             onerror="this.src='./assets/badges/default.svg'">
                                    </div>
                                    <h3 class="quiz-title">${this.formatQuizName(quizName)}</h3>
                                </div>
                                <div class="quiz-description">${this.getQuizDescription(quizName)}</div>
                                <div class="guide-button-container">
                                    <button class="quiz-guide-button" data-quiz="${quizLower}" tabindex="0" aria-label="View guide for ${this.formatQuizName(quizName)}">
                                        View Guide
                                    </button>
                                </div>
                            </div>
                        </a>
                    `;
                }).join('');

                // Calculate category progress
                const categoryProgress = visibleQuizzes.reduce((acc, quizName) => {
                    const quizLower = quizName.toLowerCase();
                    const progress = quizProgress[quizLower] || {};
                    return acc + (progress.questionsAnswered === 15 ? 1 : 0);
                }, 0);

                return `
                    <div class="category-card" role="listitem">
                        <div class="category-header">
                            ${category}
                        </div>
                        <div class="quiz-list" role="list">
                            ${quizItemsHTML}
                        </div>
                        <div class="category-progress" role="status">
                            <div class="progress-text">Progress: ${categoryProgress}/${visibleQuizzes.length} Complete</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(categoryProgress / visibleQuizzes.length) * 100}%" aria-hidden="true"></div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Update the container
            const container = document.getElementById('quizList');
            if (container) {
                if (categoriesHTML) {
                    container.innerHTML = categoriesHTML;
                } else {
                    container.innerHTML = '<p class="no-quizzes">No quizzes available for your account.</p>';
                }
            }
        } catch (error) {
            console.error('Error displaying quizzes:', error);
            const container = document.getElementById('quizList');
            if (container) {
                container.innerHTML = '<p class="error">Failed to load quizzes. Please try again later.</p>';
            }
        }
    }

    formatQuizName(name) {
        return name.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    getQuizDescription(quizName) {
        const descriptions = {
            'communication': 'Develop effective communication skills in testing',
            'initiative': 'Learn to take initiative in testing scenarios',
            'time-management': 'Optimize your testing workflow',
            'tester-mindset': 'Develop critical thinking skills',
            'risk-analysis': 'Analyze risks in testing scenarios',
            'risk-management': 'Manage risks in testing scenarios',
            'non-functional': 'Test non-functional requirements',
            'test-support': 'Learn to support testing activities',
            'issue-verification': 'Verify issues in testing scenarios',
            'build-verification': 'Verify builds in testing scenarios',
            'issue-tracking-tools': 'Use issue tracking tools effectively',
            'reports': 'Create and analyze test reports effectively',
            'raising-tickets': 'Learn best practices for raising and managing tickets',
            'cms-testing': 'Test CMS systems',
            'email-testing': 'Test email functionality',
            'content-copy': 'Test content copying',
            'locale-testing': 'Test localization',
            'script-metrics-troubleshooting': 'Analyze script metrics and troubleshoot issues',
            'standard-script-testing': 'Test standard script',
            'test-types-tricks': 'Learn test types and tricks',
            'automation-interview': 'Prepare for automation interviews',
            'fully-scripted': 'Test fully scripted scenarios',
            'exploratory': 'Explore and test without predefined scripts',
            'sanity-smoke': 'Learn sanity and smoke testing',
            'functional-interview': 'Prepare for functional interviews'
        };
        return descriptions[quizName] || 'Master essential testing skills';
    }
} 