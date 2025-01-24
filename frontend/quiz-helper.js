import { QuizUser } from './QuizUser.js';

export class BaseQuiz {
    constructor(config) {
        this.config = config;
        this.maxXP = config.maxXP;
        this.levelThresholds = config.levelThresholds;
        this.performanceThresholds = config.performanceThresholds;
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.isLoading = false;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    shouldEndGame(totalQuestionsAnswered, currentXP) {
        // End game if we've answered all questions or reached max XP
        return totalQuestionsAnswered >= 15 || currentXP >= this.maxXP;
    }

    // Base quiz methods...
    initializeEventListeners() {
        // Add event listeners for quiz navigation and interaction
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', () => this.handleOptionSelect(option));
        });

        document.getElementById('next-button')?.addEventListener('click', () => this.nextQuestion());
        document.getElementById('finish-button')?.addEventListener('click', () => this.finishQuiz());
    }

    async startGame() {
        this.player.name = localStorage.getItem('username');
        if (!this.player.name) {
            window.location.href = '/login.html';
            return;
        }

        // Check if quiz is already completed
        const quizUser = new QuizUser(this.player.name);
        const quizResult = await quizUser.getQuizResult(this.quizName);
        
        if (quizResult && quizResult.score === 100) {
            // Quiz is completed with max score, show completion screen
            this.showCompletionScreen(quizResult);
            return;
        }

        // Check if quiz was failed (didn't reach XP threshold)
        if (quizResult && quizResult.experience < this.levelThresholds.basic.minXP && quizResult.questionsAnswered >= 5) {
            this.showFailureScreen();
            return;
        }

        this.showQuestion();
    }

    showQuestion() {
        if (this.isLoading) return;

        const currentScenario = this.getCurrentScenario();
        if (!currentScenario) {
            this.finishQuiz();
            return;
        }

        // Update UI with current scenario
        document.getElementById('scenario-title').textContent = currentScenario.title;
        document.getElementById('scenario-description').textContent = currentScenario.description;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        currentScenario.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'quiz-option';
            button.textContent = option.text;
            button.dataset.index = index;
            optionsContainer.appendChild(button);
        });

        // Re-attach event listeners
        this.initializeEventListeners();
    }

    handleOptionSelect(optionElement) {
        const currentScenario = this.getCurrentScenario();
        const selectedOption = currentScenario.options[optionElement.dataset.index];
        
        // Record the choice
        this.player.questionHistory.push({
            scenarioId: currentScenario.id,
            selectedOption: selectedOption.text,
            outcome: selectedOption.outcome,
            experience: selectedOption.experience
        });

        // Update experience
        this.player.experience += selectedOption.experience;
        if (selectedOption.tool && !this.player.tools.includes(selectedOption.tool)) {
            this.player.tools.push(selectedOption.tool);
        }

        // Show outcome
        this.showOutcome(selectedOption);
    }

    showOutcome(option) {
        const outcomeText = document.getElementById('outcome-text');
        outcomeText.textContent = option.outcome;
        
        const experienceChange = document.getElementById('experience-change');
        experienceChange.textContent = option.experience >= 0 
            ? `+${option.experience} XP` 
            : `${option.experience} XP`;
        
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.remove('hidden');
    }

    nextQuestion() {
        this.player.currentScenario++;
        this.gameScreen.classList.remove('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.showQuestion();
    }

    async finishQuiz() {
        this.isLoading = true;
        try {
            if (!this.player.name) {
                throw new Error('No user found, cannot save progress');
            }

            const user = new QuizUser(this.player.name);
            const score = this.calculateScore();
            
            // First save the quiz result
            const saveResult = await user.saveQuizResult(
                this.quizName,
                score,
                this.player.experience,
                this.player.tools,
                this.player.questionHistory
            );

            if (!saveResult) {
                throw new Error('Failed to save quiz results');
            }

            // Then update the quiz score
            const updateResult = await user.updateQuizScore(this.quizName, score);
            if (!updateResult) {
                throw new Error('Failed to update quiz score');
            }

            // Clear any local storage data for this quiz
            this.clearQuizLocalStorage(user.username, this.quizName);
            
            // Redirect to home page
            window.location.href = '/';
        } catch (error) {
            console.error('Failed to save quiz results:', error);
            this.showError(error.message || 'Failed to save results. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    clearQuizLocalStorage(username, quizName) {
        // Clear both hyphenated and camelCase versions
        const normalizedName = this.normalizeQuizName(quizName);
        localStorage.removeItem(`quiz_progress_${username}_${quizName}`);
        localStorage.removeItem(`quiz_progress_${username}_${normalizedName}`);
        localStorage.removeItem(`quizResults_${username}_${quizName}`);
        localStorage.removeItem(`quizResults_${username}_${normalizedName}`);
    }

    normalizeQuizName(quizName) {
        return quizName.replace(/-([a-z])/g, g => g[1].toUpperCase());
    }

    calculateScore() {
        const maxPossibleXP = this.maxXP;
        const currentXP = Math.max(0, this.player.experience);
        return Math.round((currentXP / maxPossibleXP) * 100);
    }

    getCurrentScenario() {
        const currentScenarios = this.getCurrentScenarios();
        return currentScenarios[this.player.currentScenario];
    }

    getCurrentScenarios() {
        const totalAnswered = this.player.questionHistory.length;
        const currentXP = this.player.experience;
        
        // Save progress before level transition
        if ((totalAnswered === 5 && currentXP >= this.levelThresholds.basic.minXP) ||
            (totalAnswered === 10 && currentXP >= this.levelThresholds.intermediate.minXP)) {
            this.saveProgress().catch(error => {
                console.error('Failed to save progress during level transition:', error);
                this.showError('Failed to save your progress. Please try refreshing the page.');
            });
        }
        
        // Check for level progression
        if (totalAnswered >= 10 && currentXP >= this.levelThresholds.intermediate.minXP) {
            return this.advancedScenarios;
        } else if (totalAnswered >= 5 && currentXP >= this.levelThresholds.basic.minXP) {
            return this.intermediateScenarios;
        }
        return this.basicScenarios;
    }

    getCurrentLevel() {
        const totalAnswered = this.player.questionHistory.length;
        const currentXP = this.player.experience;
        
        if (totalAnswered >= 10 && currentXP >= this.levelThresholds.intermediate.minXP) {
            return 'Advanced';
        } else if (totalAnswered >= 5 && currentXP >= this.levelThresholds.basic.minXP) {
            return 'Intermediate';
        }
        return 'Basic';
    }

    async handleAnswer() {
        if (this.isLoading) return;
        
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
        }
        
        try {
            this.isLoading = true;
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) return;

            const currentScenarios = this.getCurrentScenarios();
            const scenario = currentScenarios[this.player.currentScenario];
            const originalIndex = parseInt(selectedOption.value);
            
            const selectedAnswer = scenario.options[originalIndex];

            // Update player state
            this.player.experience = Math.max(0, Math.min(this.maxXP, this.player.experience + selectedAnswer.experience));
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience))
            });

            // Check if we're at a level transition point (question 5 or 10)
            const totalAnswered = this.player.questionHistory.length;
            const isTransitionPoint = totalAnswered === 5 || totalAnswered === 10;

            // Save progress with current scenario (before incrementing)
            try {
                await this.saveProgress();
            } catch (error) {
                console.error('Failed to save progress:', error);
                if (isTransitionPoint) {
                    // At transition points, we must ensure progress is saved
                    this.showError('Failed to save your progress. Please try again.');
                    submitButton.disabled = false;
                    this.isLoading = false;
                    return;
                }
                // For non-transition points, continue but show warning
                this.showError('Warning: Progress may not have saved correctly');
            }

            // Also save quiz result and update display
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                const score = Math.round((this.player.experience / this.maxXP) * 100);
                
                try {
                    // Save both score and question history
                    await quizUser.saveQuizResult(
                        this.quizName,
                        score,
                        this.player.experience,
                        this.player.tools,
                        this.player.questionHistory
                    );
                } catch (error) {
                    console.error('Failed to save quiz result:', error);
                    if (isTransitionPoint) {
                        this.showError('Failed to save your answer. Please try again.');
                        submitButton.disabled = false;
                        this.isLoading = false;
                        return;
                    }
                    this.showError('Warning: Your progress may not have saved correctly');
                }
                
                // Update progress display on index page
                const progressElement = document.querySelector(`#${this.quizName}-progress`);
                if (progressElement) {
                    const totalQuestions = 15;
                    const completedQuestions = this.player.questionHistory.length;
                    const percentComplete = Math.round((completedQuestions / totalQuestions) * 100);
                    
                    // Only update if we're on the index page and this is the current user
                    const onIndexPage = window.location.pathname.endsWith('index.html');
                    if (onIndexPage) {
                        progressElement.textContent = `${percentComplete}% Complete`;
                        progressElement.classList.remove('hidden');
                        
                        // Update quiz item styling
                        const quizItem = document.querySelector(`[data-quiz="${this.quizName}"]`);
                        if (quizItem) {
                            quizItem.classList.remove('completed', 'in-progress');
                            if (percentComplete === 100) {
                                quizItem.classList.add('completed');
                                progressElement.classList.add('completed');
                                progressElement.classList.remove('in-progress');
                            } else if (percentComplete > 0) {
                                quizItem.classList.add('in-progress');
                                progressElement.classList.add('in-progress');
                                progressElement.classList.remove('completed');
                            }
                        }
                    }
                }
            }

            // Show outcome screen
            if (this.gameScreen && this.outcomeScreen) {
                this.gameScreen.classList.add('hidden');
                this.outcomeScreen.classList.remove('hidden');
            }
            
            // Update outcome display
            document.getElementById('outcome-text').textContent = selectedAnswer.outcome;
            const xpText = selectedAnswer.experience >= 0 ? 
                `Experience gained: +${selectedAnswer.experience}` : 
                `Experience: ${selectedAnswer.experience}`;
            document.getElementById('xp-gained').textContent = xpText;
            
            if (selectedAnswer.tool) {
                document.getElementById('tool-gained').textContent = `Tool acquired: ${selectedAnswer.tool}`;
                if (!this.player.tools.includes(selectedAnswer.tool)) {
                    this.player.tools.push(selectedAnswer.tool);
                }
            } else {
                document.getElementById('tool-gained').textContent = '';
            }

            this.updateProgress();
        } catch (error) {
            console.error('Failed to handle answer:', error);
            this.showError('Failed to save your answer. Please try again.');
        } finally {
            this.isLoading = false;
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    }

    showCompletionScreen(quizResult) {
        // Hide game and outcome screens
        if (this.gameScreen) this.gameScreen.classList.add('hidden');
        if (this.outcomeScreen) this.outcomeScreen.classList.add('hidden');

        // Create and show completion screen
        const completionScreen = document.createElement('div');
        completionScreen.id = 'completion-screen';
        completionScreen.className = 'quiz-screen';
        completionScreen.innerHTML = `
            <h2>Quiz Completed!</h2>
            <div class="completion-stats">
                <p>Final Score: ${quizResult.score}%</p>
                <p>Experience Gained: ${quizResult.experience} XP</p>
                ${quizResult.tools?.length ? `<p>Tools Acquired: ${quizResult.tools.join(', ')}</p>` : ''}
            </div>
            <div class="completion-message">
                <p>Congratulations! You've successfully completed this quiz with a perfect score.</p>
                <p>You can review your answers below or return to the main page.</p>
            </div>
            <button onclick="window.location.href='/'">Return to Main Page</button>
        `;

        // Add answer review section if we have question history
        if (quizResult.questionHistory?.length) {
            const reviewSection = document.createElement('div');
            reviewSection.className = 'answer-review';
            reviewSection.innerHTML = '<h3>Your Answers</h3>';
            
            quizResult.questionHistory.forEach((item, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'review-item';
                questionDiv.innerHTML = `
                    <h4>Question ${index + 1}</h4>
                    <p><strong>Scenario:</strong> ${item.scenario.title}</p>
                    <p><strong>Your Answer:</strong> ${item.selectedAnswer.text}</p>
                    <p><strong>Outcome:</strong> ${item.selectedAnswer.outcome}</p>
                    <p><strong>Experience:</strong> ${item.selectedAnswer.experience} XP</p>
                `;
                reviewSection.appendChild(questionDiv);
            });
            
            completionScreen.appendChild(reviewSection);
        }

        document.body.appendChild(completionScreen);
    }

    showFailureScreen() {
        // Hide game and outcome screens
        if (this.gameScreen) this.gameScreen.classList.add('hidden');
        if (this.outcomeScreen) this.outcomeScreen.classList.add('hidden');

        // Create and show failure screen
        const failureScreen = document.createElement('div');
        failureScreen.id = 'failure-screen';
        failureScreen.className = 'quiz-screen';
        failureScreen.innerHTML = `
            <h2>Quiz Failed</h2>
            <div class="failure-message">
                <p>Unfortunately, you did not reach the required experience threshold to continue.</p>
                <p>Please review the material and try a different quiz.</p>
            </div>
            <button onclick="window.location.href='/'">Return to Main Page</button>
        `;

        document.body.appendChild(failureScreen);
    }
} 