import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';
import { testerMindsetScenarios } from '../data/testerMindset-scenarios.js';

export class TesterMindsetQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a testing mindset expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong testing instincts!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing testing mindset best practices and try again!' }
            ],
            quizName: 'tester-mindset',
        };
        
        super(config);

        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'tester-mindset',
            writable: false,
            configurable: false,
            enumerable: true
        });

        // Initialize player state
        this.player = {
            name: '',
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: []
        };

        // Initialize API service
        this.apiService = new APIService();
        
        // Load scenarios from external data file
        this.basicScenarios = testerMindsetScenarios.basic;
        this.intermediateScenarios = testerMindsetScenarios.intermediate;
        this.advancedScenarios = testerMindsetScenarios.advanced;

        // Initialize all screen elements
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');
        
        // Verify all required elements exist
        if (!this.gameScreen) {
            console.error('Game screen element not found');
            this.showError('Quiz initialization failed. Please refresh the page.');
            return;
        }
        
        if (!this.outcomeScreen) {
            console.error('Outcome screen element not found');
            this.showError('Quiz initialization failed. Please refresh the page.');
            return;
        }
        
        if (!this.endScreen) {
            console.error('End screen element not found');
            this.showError('Quiz initialization failed. Please refresh the page.');
            return;
        }

        // Initialize UI and event listeners
        this.initializeEventListeners();

        this.isLoading = false;

        // Add this debugging check to the constructor
        console.log('[TesterMindsetQuiz] Quiz name being used:', this.quizName);
        const relatedLocalStorage = Object.keys(localStorage).filter(k => 
            k.includes('quiz_progress') || k.includes('tester-mindset')
        );
        console.log('[TesterMindsetQuiz] Related localStorage keys:', relatedLocalStorage);
    
    }

    // Helper for showing errors to the user
    showError(message) {
        try {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = message;
            errorElement.style.color = 'red';
            errorElement.style.padding = '20px';
            errorElement.style.textAlign = 'center';
            errorElement.style.fontWeight = 'bold';
            
            // Find a good place to show the error
            const container = document.getElementById('game-screen') || 
                              document.getElementById('quiz-container') || 
                              document.body;
            
            if (container) {
                // Clear container if not body
                if (container !== document.body) {
                    container.innerHTML = '';
                }
                
                container.appendChild(errorElement);
                console.error('[TesterMindsetQuiz] Displayed error to user:', message);
            }
        } catch (e) {
            console.error('[TesterMindsetQuiz] Failed to show error to user:', e);
        }
    }

    shouldEndGame() {
        // Only end the game when all 15 questions are answered
        return (this.player?.questionHistory?.length || 0) >= 15;
    }

    // Helper method to calculate the score percentage based on correct answers
    calculateScorePercentage() {
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && (q.selectedAnswer.isCorrect || 
            q.selectedAnswer.experience === Math.max(...q.scenario.options.map(o => o.experience || 0)))
        ).length;
        return Math.round((correctAnswers / Math.max(1, Math.min(this.player.questionHistory.length, 15))) * 100);
    }

    async startGame() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            // Show loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.remove('hidden');
            }

            // Set player name from localStorage
            this.player.name = localStorage.getItem('username');
            if (!this.player.name) {
                window.location.href = '/login.html';
                return;
            }

            // Try to load scenarios from API with caching
            await this.loadScenariosWithCaching();

            // Load previous progress using BaseQuiz implementation
            const hasProgress = await super.loadProgress();
            console.log('Previous progress loaded:', hasProgress);
            
            if (!hasProgress) {
                // Reset player state if no valid progress exists
                this.player.experience = 0;
                this.player.tools = [];
                this.player.currentScenario = 0;
                this.player.questionHistory = [];
                // Only show scenario if no progress
                this.displayScenario();
            }
            
            // Clear any existing transition messages
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = '';
                transitionContainer.classList.remove('active');
            }

            // Add this to the startGame method after loading progress
            console.log('[TesterMindsetQuiz] Progress status check:', {
                playerState: this.player,
                localStorageKeys: Object.keys(localStorage).filter(k => k.includes('quiz_progress'))
            });
        } catch (error) {
            console.error('Failed to start game:', error);
            this.showError('Failed to start the quiz. Please try refreshing the page.');
        } finally {
            this.isLoading = false;
            // Hide loading state
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
        }
    }

    initializeEventListeners() {
        // Add event listeners for the continue and restart buttons
        document.getElementById('continue-btn')?.addEventListener('click', () => this.nextScenario());
        document.getElementById('restart-btn')?.addEventListener('click', () => this.restartGame());

        // Add form submission handler
        document.getElementById('options-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAnswer();
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.type === 'radio') {
                this.handleAnswer();
            }
        });
    }

    displayScenario() {
        // Use currentScenario for all progress logic
        const currentScenarioIndex = this.player.currentScenario;
        const totalAnswered = this.player.questionHistory.length;
        const totalQuestions = this.totalQuestions || 15;

        console.log('[TesterMindsetQuiz][displayScenario] Showing scenario:', {
            currentScenarioIndex,
            totalAnswered,
            totalQuestions
        });

        // Debug: verify currentScenario and questionHistory are aligned correctly
        if (currentScenarioIndex !== totalAnswered) {
            console.warn('[TesterMindsetQuiz][displayScenario] Misalignment detected! currentScenario and questionHistory.length don\'t match:',
                `currentScenario=${currentScenarioIndex}, questionHistory.length=${totalAnswered}`);
            
            // Auto-fix if there's a mismatch - this is critical for proper quiz flow
            if (totalAnswered > 0 && currentScenarioIndex === 0) {
                console.log('[TesterMindsetQuiz][displayScenario] Auto-fixing: Setting currentScenario to match questionHistory.length');
                this.player.currentScenario = totalAnswered;
            }
        }

        // Check if we've answered all questions
        if (currentScenarioIndex >= totalQuestions) {
            console.log('[TesterMindsetQuiz][displayScenario] All questions answered, ending game');
                this.endGame(false);
                return;
            }
            
        // Determine level and scenario set
        let scenario;
        let scenarioSet;
        let scenarioLevel;
        
        try {
            // Calculate which level we're on and get the appropriate scenario set
            if (currentScenarioIndex < 5) {
                scenarioSet = this.basicScenarios;
                scenarioLevel = 'Basic';
                scenario = scenarioSet[currentScenarioIndex];
            } else if (currentScenarioIndex < 10) {
                scenarioSet = this.intermediateScenarios;
                scenarioLevel = 'Intermediate';
                scenario = scenarioSet[currentScenarioIndex - 5];
            } else if (currentScenarioIndex < 15) {
                scenarioSet = this.advancedScenarios;
                scenarioLevel = 'Advanced';
                scenario = scenarioSet[currentScenarioIndex - 10];
            }

            if (!scenario) {
                console.error('[TesterMindsetQuiz][displayScenario] No scenario found for currentScenario:', currentScenarioIndex);
                console.log('[TesterMindsetQuiz][displayScenario] Scenario sets:', {
                    basic: this.basicScenarios?.length || 0,
                    intermediate: this.intermediateScenarios?.length || 0,
                    advanced: this.advancedScenarios?.length || 0
                });
                
                // Emergency fallback - try to recover by moving to next question or resetting
                if (totalAnswered > 0 && totalAnswered < totalQuestions) {
                    console.log('[TesterMindsetQuiz][displayScenario] Attempting recovery by moving to next available scenario');
                    this.player.currentScenario = totalAnswered;
                    // Try recursively one more time with the fixed index
                    this.displayScenario();
                    return;
                } else {
                    // If we still can't recover, try the emergency recovery method
                    console.log('[TesterMindsetQuiz][displayScenario] Attempting emergency data recovery');
                    this.recoverProgress().then(success => {
                        if (!success) {
                            // If recovery fails, show end game as last resort
                this.endGame(true);
                        }
                    }).catch(() => this.endGame(true));
                return;
            }
        }

        // Store current question number for consistency
            this.currentQuestionNumber = currentScenarioIndex + 1;
        
        // Show level transition message at the start of each level or when level changes
            if (
                currentScenarioIndex === 0 ||
                (currentScenarioIndex === 5 && scenarioLevel === 'Intermediate') ||
                (currentScenarioIndex === 10 && scenarioLevel === 'Advanced')
            ) {
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                    transitionContainer.innerHTML = '';
                const levelMessage = document.createElement('div');
                levelMessage.className = 'level-transition';
                levelMessage.setAttribute('role', 'alert');
                    levelMessage.textContent = `Starting ${scenarioLevel} Questions`;
                transitionContainer.appendChild(levelMessage);
                transitionContainer.classList.add('active');
                const levelIndicator = document.getElementById('level-indicator');
                if (levelIndicator) {
                        levelIndicator.textContent = `Level: ${scenarioLevel}`;
                }
                setTimeout(() => {
                    transitionContainer.classList.remove('active');
                    setTimeout(() => {
                        transitionContainer.innerHTML = '';
                        }, 300);
                }, 3000);
            }
        }

        // Update scenario display
        const titleElement = document.getElementById('scenario-title');
        const descriptionElement = document.getElementById('scenario-description');
        const optionsContainer = document.getElementById('options-container');

        if (!titleElement || !descriptionElement || !optionsContainer) {
                console.error('[TesterMindsetQuiz][displayScenario] Required elements not found');
            return;
        }

            titleElement.textContent = scenario.title;
            descriptionElement.textContent = scenario.description;

            // Update question counter
        const questionProgress = document.getElementById('question-progress');
        if (questionProgress) {
                questionProgress.textContent = `Question: ${this.currentQuestionNumber}/15`;
        }

        // Create a copy of options with their original indices
            const shuffledOptions = scenario.options.map((option, index) => ({
            ...option,
            originalIndex: index
        }));
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        optionsContainer.innerHTML = '';

        shuffledOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <input type="radio" 
                    name="option" 
                    value="${option.originalIndex}" 
                    id="option${index}"
                    tabindex="0"
                    aria-label="${option.text}"
                    role="radio">
                <label for="option${index}">${option.text}</label>
            `;
            optionsContainer.appendChild(optionElement);
        });

        this.updateProgress();
        this.initializeTimer();
            console.log('[TesterMindsetQuiz][displayScenario] Showing scenario', scenarioLevel, 'index', currentScenarioIndex, scenario.title);

            // Make scenario screen visible if not already
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen && gameScreen.classList.contains('hidden')) {
                console.log('[TesterMindsetQuiz][displayScenario] Making game screen visible');
                gameScreen.classList.remove('hidden');
            }

            // Add extra log after showing
            setTimeout(() => {
                console.log('[TesterMindsetQuiz][displayScenario][post-show] player state:', {
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory.length,
                    currentScenario: this.player.currentScenario
                });
            }, 0);
        } catch (error) {
            console.error('[TesterMindsetQuiz][displayScenario] Error showing scenario:', error);
            // Emergency recovery if an error occurs
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) gameScreen.classList.remove('hidden');
            
            // Try to recover progress data in case of display error
            console.log('[TesterMindsetQuiz][displayScenario] Attempting emergency recovery after display error');
            this.recoverProgress().then(success => {
                if (!success) {
                    // If recovery fails, show error message
                    this.showError('An error occurred loading the quiz. Try refreshing the page.');
                }
            }).catch(() => {
                this.showError('An error occurred loading the quiz. Try refreshing the page.');
            });
        }
    }

    async handleAnswer() {
        if (this.isLoading) return;
        
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
        }

        // Clear the timer when an answer is submitted
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }
        
        try {
            this.isLoading = true;
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) return;

            const currentScenarios = this.getCurrentScenarios();
            const scenario = currentScenarios[this.player.currentScenario < 5 ? this.player.currentScenario : this.player.currentScenario < 10 ? this.player.currentScenario - 5 : this.player.currentScenario - 10];
            const originalIndex = parseInt(selectedOption.value);
            
            const selectedAnswer = scenario.options[originalIndex];

            // Find the correct answer (option with highest experience)
            const correctAnswer = scenario.options.reduce((prev, current) => 
                (prev.experience > current.experience) ? prev : current
            );

            // Mark selected answer as correct or incorrect
            selectedAnswer.isCorrect = selectedAnswer === correctAnswer;

            // Update player experience with bounds
            this.player.experience = Math.max(0, Math.min(this.maxXP, this.player.experience + selectedAnswer.experience));
            
            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: selectedAnswer.isCorrect,
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience)),
                timeSpent: timeSpent,
                timedOut: false
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress using BaseQuiz implementation
            await super.saveProgress();

            // Calculate the score percentage
            const scorePercentage = this.calculateScorePercentage();
            
            const score = {
                quizName: this.quizName,
                score: scorePercentage,
                experience: this.player.experience,
                questionHistory: this.player.questionHistory,
                questionsAnswered: this.player.questionHistory.length,
                lastActive: new Date().toISOString()
            };
            
            // Save quiz result
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                await quizUser.updateQuizScore(
                    this.quizName,
                    score.score,
                    score.experience,
                    this.player.tools,
                    score.questionHistory,
                    score.questionsAnswered
                );
            }

            // Show outcome screen
            if (this.gameScreen && this.outcomeScreen) {
                this.gameScreen.classList.add('hidden');
                this.outcomeScreen.classList.remove('hidden');
            }
            
            // Set content directly in the outcome screen
            const outcomeContent = this.outcomeScreen.querySelector('.outcome-content');
            if (outcomeContent) {
                outcomeContent.innerHTML = `
                    <h3>${selectedAnswer.isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                    <p>${selectedAnswer.outcome || ''}</p>
                    <p class="result">${selectedAnswer.isCorrect ? 'Correct answer!' : 'Try again next time.'}</p>
                    <button id="continue-btn" class="submit-button">Continue</button>
                `;
                
                // Add event listener to the continue button
                const continueBtn = outcomeContent.querySelector('#continue-btn');
                if (continueBtn) {
                    continueBtn.addEventListener('click', () => this.nextScenario());
                }
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

    nextScenario() {
        // Hide outcome screen and show game screen
        if (this.outcomeScreen && this.gameScreen) {
            this.outcomeScreen.classList.add('hidden');
            this.gameScreen.classList.remove('hidden');
        }
        
        // Display next scenario
        this.displayScenario();
    }

    updateProgress() {
        // Get current level and question count
        const currentLevel = this.getCurrentLevel();
        const totalAnswered = this.player.questionHistory.length;
        const questionNumber = totalAnswered + 1;
        
        // Update the existing progress card elements
        const levelInfoElement = document.querySelector('.level-info');
        const questionInfoElement = document.querySelector('.question-info');
        
        if (levelInfoElement) {
            levelInfoElement.textContent = `Level: ${currentLevel}`;
        }
        
        if (questionInfoElement) {
            questionInfoElement.textContent = `Question: ${questionNumber}/${this.totalQuestions}`;
        }
        
        // Ensure the card is visible
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'block';
        }
        
        // Update legacy progress elements if they exist
        const levelIndicator = document.getElementById('level-indicator');
        const questionProgress = document.getElementById('question-progress');
        const progressFill = document.getElementById('progress-fill');
        
        if (levelIndicator) {
            levelIndicator.textContent = `Level: ${currentLevel}`;
        }
        
        if (questionProgress) {
            questionProgress.textContent = `Question: ${questionNumber}/${this.totalQuestions}`;
        }
        
        if (progressFill) {
            const progressPercentage = (totalAnswered / this.totalQuestions) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
    }

    restartGame() {
        // Reset player state
        this.player = {
            name: localStorage.getItem('username'),
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: []
        };

        // Reset UI
        this.gameScreen.classList.remove('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');

        // Clear any existing transition messages
        const transitionContainer = document.getElementById('level-transition-container');
        if (transitionContainer) {
            transitionContainer.innerHTML = '';
            transitionContainer.classList.remove('active');
        }

        // Update progress display
        this.updateProgress();

        // Start from first scenario
        this.displayScenario();
    }

    getCurrentScenarios() {
        const totalAnswered = this.player.questionHistory.length;
        
        // Progress through levels based only on question count
        if (totalAnswered >= 10) {
            return this.advancedScenarios;
        } else if (totalAnswered >= 5) {
            return this.intermediateScenarios;
        }
        return this.basicScenarios;
    }

    getCurrentLevel() {
        const totalAnswered = this.player.questionHistory.length;
        
        // Progress through levels based only on question count
        if (totalAnswered >= 10) {
            return 'Advanced';
        } else if (totalAnswered >= 5) {
            return 'Intermediate';
        }
        return 'Basic';
    }

    generateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations');
        if (!recommendationsContainer) return;

        const score = Math.round((this.player.experience / this.maxXP) * 100);
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            const maxXP = record.maxPossibleXP;
            const earnedXP = record.selectedAnswer.experience;
            const isCorrect = earnedXP === maxXP;

            // Categorize the question based on its content
            const questionType = this.categorizeQuestion(record.scenario);
            
            if (isCorrect) {
                if (!strongAreas.includes(questionType)) {
                    strongAreas.push(questionType);
                }
            } else {
                if (!weakAreas.includes(questionType)) {
                    weakAreas.push(questionType);
                }
            }
        });

        // Generate recommendations HTML
        let recommendationsHTML = '';

        if (score >= 95 && weakAreas.length === 0) {
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of sanity and smoke testing. You clearly understand the differences between these testing approaches and are well-equipped to implement them effectively!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your sanity and smoke testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
            recommendationsHTML += '<ul>';
            if (weakAreas.length > 0) {
                weakAreas.forEach(area => {
                    recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
                });
            }
            recommendationsHTML += '</ul>';
        } else if (score >= 60) {
            recommendationsHTML = '<p>👍 Good effort! Here are some areas to focus on:</p>';
            recommendationsHTML += '<ul>';
            weakAreas.forEach(area => {
                recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
            });
            recommendationsHTML += '</ul>';
        } else {
            recommendationsHTML = '<p>📚 Here are key areas for improvement:</p>';
            recommendationsHTML += '<ul>';
            weakAreas.forEach(area => {
                recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
            });
            recommendationsHTML += '</ul>';
        }

        recommendationsContainer.innerHTML = recommendationsHTML;
    }

    categorizeQuestion(scenario) {
        // Categorize questions based on their content        
        const title = scenario.title?.toLowerCase() || '';
        const description = scenario.description?.toLowerCase() || '';

        if (title.includes('context') || description.includes('context')) {
            return 'Project Context Understanding';
        } else if (title.includes('environment') || description.includes('environment')) {
            return 'Test Environment Management';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Test Documentation';
        } else if (title.includes('planning') || description.includes('planning')) {
            return 'Test Planning';
        } else if (title.includes('risk') || description.includes('risk')) {
            return 'Risk Assessment';
        } else if (title.includes('coverage') || description.includes('coverage')) {
            return 'Test Coverage';
        } else if (title.includes('collaboration') || description.includes('collaboration')) {
            return 'Team Collaboration';
        } else {
            return 'General Testing Approach';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Project Context Understanding': 'Focus on improving requirement analysis and understanding business context before testing.',
            'Test Environment Management': 'Enhance your ability to identify and document environment differences and their impact on testing.',
            'Test Documentation': 'Practice creating clear, detailed test documentation that helps track issues and communicate effectively.',
            'Test Planning': 'Work on developing comprehensive test strategies that consider project scope and risks.',
            'Risk Assessment': 'Strengthen your ability to identify, prioritize, and communicate potential risks in testing.',
            'Test Coverage': 'Improve your approach to ensuring adequate test coverage across different testing types and scenarios.',
            'Team Collaboration': 'Enhance communication with team members and stakeholders during the testing process.',
            'General Testing Approach': 'Continue developing fundamental testing principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core testing mindset principles.';
    }

    async endGame(failed = false) {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        // Hide the progress card on the end screen
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'none';
        }

        // Calculate final score based on correct answers
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && (q.selectedAnswer.isCorrect || 
            q.selectedAnswer.experience === Math.max(...q.scenario.options.map(o => o.experience || 0)))
        ).length;
        const scorePercentage = Math.round((correctAnswers / 15) * 100);
        const hasPassed = !failed && scorePercentage >= this.passPercentage;
        
        // Save the final quiz result with pass/fail status
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                const status = hasPassed ? 'passed' : 'failed';
                console.log('Setting final quiz status:', { status, score: scorePercentage });
                
                const result = {
                    score: scorePercentage,
                    status: status,
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory,
                    questionsAnswered: this.player.questionHistory.length,
                    lastUpdated: new Date().toISOString(),
                    scorePercentage: scorePercentage
                };

                // Save to QuizUser
                await user.updateQuizScore(
                    this.quizName,
                    result.score,
                    result.experience,
                    this.player.tools,
                    result.questionHistory,
                    result.questionsAnswered,
                    status
                );

                // Save to our quiz progress service
                await super.saveProgress(status);
                
                // Clear any local storage for this quiz - now handled by BaseQuiz
                if (this.quizProgressService) {
                    this.quizProgressService.clearQuizLocalStorage(this.quizName);
                }
                
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${scorePercentage}%`;
        
        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = hasPassed ? 'Quiz Complete!' : 'Quiz Failed!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (!hasPassed) {
            performanceSummary.textContent = 'Quiz failed. You did not earn enough points to pass. You can retry this quiz later.';
            // Hide restart button if failed
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.style.display = 'none';
            }
            // Add failed class to quiz container for styling
            const quizContainer = document.getElementById('quiz-container');
            if (quizContainer) {
                quizContainer.classList.add('failed');
            }
        } else {
            // Find the appropriate performance message
            const threshold = this.config.performanceThresholds.find(t => scorePercentage >= t.threshold);
            if (threshold) {
                performanceSummary.textContent = threshold.message;
            } else {
                performanceSummary.textContent = 'Quiz completed successfully!';
            }
        }

        // Generate question review list
        const reviewList = document.getElementById('question-review');
        if (reviewList) {
            reviewList.innerHTML = ''; // Clear existing content
            this.player.questionHistory.forEach((record, index) => {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                
                const isCorrect = record.selectedAnswer && (record.selectedAnswer.isCorrect || 
                    record.selectedAnswer.experience === Math.max(...record.scenario.options.map(o => o.experience || 0)));
                reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
                
                reviewItem.innerHTML = `
                    <h4>Question ${index + 1}</h4>
                    <p class="scenario">${record.scenario.description}</p>
                    <p class="answer"><strong>Your Answer:</strong> ${record.selectedAnswer.text}</p>
                    <p class="outcome"><strong>Outcome:</strong> ${record.selectedAnswer.outcome}</p>
                    <p class="result"><strong>Result:</strong> ${isCorrect ? 'Correct' : 'Incorrect'}</p>
                `;
                
                reviewList.appendChild(reviewItem);
            });
        }

        this.generateRecommendations();
    }

    async loadScenariosWithCaching() {
        // Try to load from cache first
        const cachedData = localStorage.getItem(`quiz_scenarios_${this.quizName}`);
        const cacheTimestamp = localStorage.getItem(`quiz_scenarios_${this.quizName}_timestamp`);
        
        // Check if cache is valid (less than 1 day old)
        const cacheValid = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 86400000;
        
        if (cachedData && cacheValid) {
            console.log('[TesterMindsetQuiz] Using cached scenarios');
            const data = JSON.parse(cachedData);
            this.basicScenarios = data.basic || testerMindsetScenarios.basic;
            this.intermediateScenarios = data.intermediate || testerMindsetScenarios.intermediate;
            this.advancedScenarios = data.advanced || testerMindsetScenarios.advanced;
            return;
        }
        
        // If no valid cache, try to fetch from API
        try {
            console.log('[TesterMindsetQuiz] Fetching scenarios from API');
            const data = await this.apiService.getQuizScenarios(this.quizName);
            
            if (data && data.scenarios) {
                // Cache the result
                localStorage.setItem(`quiz_scenarios_${this.quizName}`, JSON.stringify(data.scenarios));
                localStorage.setItem(`quiz_scenarios_${this.quizName}_timestamp`, Date.now().toString());
                
                // Update scenarios
                this.basicScenarios = data.scenarios.basic || testerMindsetScenarios.basic;
                this.intermediateScenarios = data.scenarios.intermediate || testerMindsetScenarios.intermediate;
                this.advancedScenarios = data.scenarios.advanced || testerMindsetScenarios.advanced;
            }
        } catch (error) {
            console.error('[TesterMindsetQuiz] Failed to load scenarios from API:', error);
            console.log('[TesterMindsetQuiz] Falling back to default scenarios');
            // Already loaded default scenarios in constructor
        }
    }

    // Emergency recovery method now simplified
    async recoverProgress() {
        console.log('[TesterMindsetQuiz] Entering emergency recovery mode');
        try {
            // Use the QuizProgressService directly for recovery
            const progressResult = await this.quizProgressService.getQuizProgress(this.quizName);
            
            if (!progressResult.success || !progressResult.data) {
                console.warn('[TesterMindsetQuiz] No data could be recovered, recovery failed');
                return false;
            }
            
            const progressData = progressResult.data;
            
            // Update player state
            this.player.experience = progressData.experience || 0;
            this.player.tools = progressData.tools || [];
            this.player.questionHistory = progressData.questionHistory || [];
            this.player.currentScenario = progressData.currentScenario || 0;
            
            if (progressData.questionHistory && progressData.questionHistory.length > 0) {
                this.player.currentScenario = progressData.questionHistory.length;
            }
            
            console.log('[TesterMindsetQuiz] Player state updated from recovered data:', {
                experience: this.player.experience,
                questionHistory: this.player.questionHistory.length,
                currentScenario: this.player.currentScenario
            });
            
            // Save the recovered data
            await super.saveProgress();
            
            // Show the current scenario
            this.displayScenario();
            return true;
        } catch (error) {
            console.error('[TesterMindsetQuiz] Recovery attempt failed:', error);
            return false;
        }
    }
}

// Singleton instance for TesterMindsetQuiz
let testerMindsetQuizInstance = null;

// Initialize quiz when the page loads
// Only allow one instance
document.addEventListener('DOMContentLoaded', () => {
    if (testerMindsetQuizInstance) {
        console.log('[TesterMindsetQuiz] Instance already exists, not creating a new one.');
                return;
            }
    BaseQuiz.clearQuizInstances('tester-mindset');
    testerMindsetQuizInstance = new TesterMindsetQuiz();
    testerMindsetQuizInstance.startGame();
}); 