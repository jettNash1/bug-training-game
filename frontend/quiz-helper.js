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

    startGame() {
        this.player.name = localStorage.getItem('username');
        if (!this.player.name) {
            window.location.href = '/login.html';
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
            const failed = score < 70; // Quiz is failed if score is below 70%
            
            // Update the end screen title based on pass/fail status
            const titleElement = document.getElementById('end-screen-title');
            if (titleElement) {
                titleElement.textContent = failed ? 'Quiz Failed!' : 'Quiz Complete!';
            }
            
            // First save the quiz result with status
            const saveResult = await user.saveQuizResult(
                this.quizName,
                {
                    score,
                    status: failed ? 'failed' : 'completed',
                    experience: this.player.experience,
                    tools: this.player.tools,
                    questionHistory: this.player.questionHistory
                }
            );

            if (!saveResult) {
                throw new Error('Failed to save quiz results');
            }

            // Then update the quiz score with status
            const updateResult = await user.updateQuizScore(this.quizName, {
                score,
                status: failed ? 'failed' : 'completed'
            });
            
            if (!updateResult) {
                throw new Error('Failed to update quiz score');
            }

            // Save the failed status to localStorage for immediate feedback
            const localStorageKey = `quiz_result_${user.username}_${this.quizName}`;
            localStorage.setItem(localStorageKey, JSON.stringify({
                score,
                status: failed ? 'failed' : 'completed',
                lastUpdated: new Date().toISOString()
            }));

            // Clear any progress data for this quiz
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

            // Save progress with current scenario (before incrementing)
            await this.saveProgress();

            // Also save quiz result and update display
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                const score = Math.round((this.player.experience / this.maxXP) * 100);
                
                // Save both score and question history
                await quizUser.saveQuizResult(
                    this.quizName,
                    score,
                    this.player.experience,
                    this.player.tools,
                    this.player.questionHistory
                );
                
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
} 