class QuizUser {
    constructor(username) {
        this.username = username;
        this.quizResults = [];
        this.baseUrl = 'http://localhost:3000/api/users';
    }

    async saveQuizResult(quizName, score, answers = []) {
        console.log(`Attempting to save quiz result for ${quizName} with score ${score}`);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${this.baseUrl}/quiz-results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    quizName,
                    score,
                    experience: score,
                    tools: [],
                    questionHistory: answers,
                    completedAt: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save quiz result');
            }

            const data = await response.json();
            if (data.success) {
                this.quizResults = data.data;
                this.saveToLocalStorage();
                return data;
            } else {
                throw new Error(data.message || 'Failed to save quiz result');
            }
        } catch (error) {
            console.error('Failed to save quiz result:', error);
            this.fallbackToLocalStorage(quizName, score, answers);
            throw error;
        }
    }

    fallbackToLocalStorage(quizName, score, answers) {
        console.log(`Falling back to localStorage for ${quizName} with score ${score}`);
        try {
            // Load existing data first
            this.loadFromLocalStorage();
            
            // Ensure quizResults is an array
            if (!Array.isArray(this.quizResults)) {
                console.log('Initializing quizResults as empty array');
                this.quizResults = [];
            }
            
            console.log('Current quiz results before update:', this.quizResults);
            
            // Remove any existing results for this quiz
            this.quizResults = this.quizResults.filter(result => {
                const keep = result.quizName !== quizName;
                if (!keep) {
                    console.log(`Removing previous result for ${quizName}`);
                }
                return keep;
            });
            
            // Add the new result
            const newResult = {
                quizName,
                score,
                completedAt: new Date().toISOString(),
                answers
            };
            this.quizResults.push(newResult);
            console.log('New quiz result added:', newResult);
            
            // Save to localStorage
            this.saveToLocalStorage();
            console.log('Updated quiz results:', this.quizResults);
        } catch (error) {
            console.error('Error in fallbackToLocalStorage:', error);
            throw error;
        }
    }

    async updateQuizScore(quizName, score) {
        try {
            await this.saveQuizResult(quizName, score, []);
            console.log(`Quiz score updated for ${quizName}: ${score}`);
        } catch (error) {
            console.error('Error updating quiz score:', error);
            // No need for additional fallback as saveQuizResult already handles it
        }
    }

    async loadUserData() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.baseUrl}/${this.username}/quiz-results`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load user data');
            }

            const data = await response.json();
            this.quizResults = data.data || [];
            return this.quizResults;
        } catch (error) {
            console.error('Failed to load user data:', error);
            this.loadFromLocalStorage();
            return this.quizResults;
        }
    }

    saveToLocalStorage() {
        try {
            const dataToSave = {
                username: this.username,
                quizResults: this.quizResults
            };
            console.log('Saving to localStorage:', dataToSave);
            localStorage.setItem(`user_${this.username}`, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            throw error;
        }
    }

    loadFromLocalStorage() {
        try {
            const userData = localStorage.getItem(`user_${this.username}`);
            console.log('Loaded from localStorage:', userData);
            if (userData) {
                const parsed = JSON.parse(userData);
                this.quizResults = Array.isArray(parsed.quizResults) ? parsed.quizResults : [];
            } else {
                this.quizResults = [];
            }
            console.log('Parsed quiz results:', this.quizResults);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.quizResults = [];
            throw error;
        }
    }
}

// Ensure only one instance is defined
if (!window.QuizUser) {
    window.QuizUser = QuizUser;
} 