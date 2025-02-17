class QuizList {
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
                // ... rest of the quiz card creation code ...
            }).join('');

            // Update the container
            const container = document.getElementById('quizList');
            if (container) {
                container.innerHTML = quizListHTML;
            }
        } catch (error) {
            console.error('Error displaying quizzes:', error);
            // Handle error appropriately
        }
    }
} 