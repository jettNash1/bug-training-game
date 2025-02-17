class QuizList {
    constructor() {
        this.apiService = new APIService();
        this.quizTypes = [
            'communication', 'initiative', 'time-management', 'tester-mindset',
            'risk-analysis', 'risk-management', 'non-functional', 'test-support',
            'issue-verification', 'build-verification', 'issue-tracking-tools',
            'raising-tickets', 'reports', 'cms-testing', 'email-testing', 'content-copy',
            'locale-testing', 'script-metrics-troubleshooting', 'standard-script-testing',
            'test-types-tricks'
        ];
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

            const { userType, allowedQuizzes, hiddenQuizzes } = userData.data;
            const isInterviewAccount = userType === 'interview_candidate';

            // Filter quizzes based on user type and visibility
            const visibleQuizzes = this.quizTypes.filter(quiz => {
                const quizLower = quiz.toLowerCase();
                if (isInterviewAccount) {
                    return allowedQuizzes?.includes(quizLower);
                } else {
                    return !hiddenQuizzes?.includes(quizLower);
                }
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
                container.innerHTML = visibleQuizzes.length > 0 ? 
                    quizListHTML : 
                    '<p class="no-quizzes">No quizzes available.</p>';
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
            // Add descriptions for other quizzes as needed
        };
        return descriptions[quizName] || 'Master essential testing skills';
    }
} 