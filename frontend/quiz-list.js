import { APIService } from './api-service.js';

export const QUIZ_TYPES = [
    'communication', 'initiative', 'time-management', 'tester-mindset',
    'risk-analysis', 'risk-management', 'non-functional', 'test-support',
    'issue-verification', 'build-verification', 'issue-tracking-tools',
    'raising-tickets', 'reports', 'cms-testing', 'email-testing', 'content-copy',
    'locale-testing', 'script-metrics-troubleshooting', 'standard-script-testing',
    'test-types-tricks', 'automation-interview', 'fully-scripted', 'exploratory',
    'sanity-smoke', 'functional-interview'
];

export class QuizList {
    constructor() {
        this.apiService = new APIService();
        this.quizTypes = QUIZ_TYPES;
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

            const { userType, allowedQuizzes = [], hiddenQuizzes = [] } = userData.data;
            const isInterviewAccount = userType === 'interview_candidate';

            // Debug logging
            console.log('Quiz visibility debug:', {
                userType,
                isInterviewAccount,
                allowedQuizzes,
                hiddenQuizzes,
                totalQuizTypes: this.quizTypes.length
            });

            // Filter quizzes based on user type and visibility
            const visibleQuizzes = this.quizTypes.filter(quiz => {
                const quizLower = quiz.toLowerCase();
                if (isInterviewAccount) {
                    // For interview accounts, only show quizzes that are explicitly allowed
                    const isVisible = allowedQuizzes.includes(quizLower);
                    console.log(`Quiz visibility check for ${quiz}:`, {
                        isInterviewAccount: true,
                        quizLower,
                        isAllowed: isVisible,
                        allowedQuizzes
                    });
                    return isVisible;
                } else {
                    // For regular accounts, show all quizzes that aren't explicitly hidden
                    const isVisible = !hiddenQuizzes.includes(quizLower);
                    console.log(`Quiz visibility check for ${quiz}:`, {
                        isInterviewAccount: false,
                        quizLower,
                        isHidden: !isVisible,
                        hiddenQuizzes
                    });
                    return isVisible;
                }
            });

            console.log('Visible quizzes:', {
                count: visibleQuizzes.length,
                quizzes: visibleQuizzes
            });

            // Create quiz list HTML
            const quizListHTML = visibleQuizzes.map(quizName => {
                const formattedName = this.formatQuizName(quizName);
                return `
                    <div class="quiz-card" data-quiz="${quizName}">
                        <div class="quiz-icon">
                            <img src="/images/icons/${quizName}.svg" alt="${formattedName} icon" 
                                 onerror="this.src='/images/icons/default.svg'">
                        </div>
                        <h3>${formattedName}</h3>
                        <p class="quiz-description">${this.getQuizDescription(quizName)}</p>
                        <button class="start-quiz-btn" onclick="window.location.href='/pages/quiz.html?quiz=${quizName}'">
                            Start Quiz
                        </button>
                    </div>
                `;
            }).join('');

            // Update the container
            const container = document.getElementById('quizList');
            if (container) {
                if (visibleQuizzes.length > 0) {
                    container.innerHTML = quizListHTML;
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
            'reports': 'Create and analyze reports',
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