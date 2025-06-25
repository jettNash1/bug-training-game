import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';
import { testTypesScenarios } from '../data/testTypes-scenarios.js';

export class TestTypesTricksQuiz extends BaseQuiz {
    constructor() {
        console.log('[TestTypesTricksQuiz] Initializing...');
        
        // Configure the quiz with basic settings
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a test types and tricks expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong test types and tricks instincts!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing test types and tricks best practices and try again!' }
            ],
            quizName: 'test-types-tricks'
        };
        
        // Call the parent constructor with our config
        super(config);

        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'test-types-tricks',
            writable: false,
            configurable: false,
            enumerable: true
        });

        // Initialize player state
        this.player = {
            name: '',
            experience: 0,
            questionHistory: [],
            currentScenario: 0,
            tools: []
        };

        // Load scenarios from our data file
        this.basicScenarios = testTypesScenarios.basic;
        this.intermediateScenarios = testTypesScenarios.intermediate;
        this.advancedScenarios = testTypesScenarios.advanced;

        // Initialize elements
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');
        
        // Create level transition container if it doesn't exist
        if (!document.getElementById('level-transition-container')) {
            const transitionContainer = document.createElement('div');
            transitionContainer.id = 'level-transition-container';
            transitionContainer.className = 'level-transition-container';
            document.querySelector('.quiz-container').appendChild(transitionContainer);
        }
        
        // Timer-related properties
        this.questionTimer = null;
        this.questionStartTime = null;
        // Timer value is set by BaseQuiz constructor from admin settings
        this.timerStartTime = null; // When timer was started for persistence
        this.persistedTimeRemaining = null; // Restored time from localStorage
        
        this.isLoading = false;
        
        // Initialize event listeners
        this.initializeEventListeners();

        // Start the quiz (wait for timer settings to be loaded)
        this.startGameWhenReady();
    }
    
    // Override the shouldEndGame method for our quiz
    shouldEndGame() {
        return this.player.questionHistory.length >= 15;
    }
    
    // Initialize event listeners
    initializeEventListeners() {
        // Add event listener for the restart button
        const restartButton = document.getElementById('restart-btn');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.restartQuiz());
        }
        
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
    
    // Get the scenarios for the current level
    getCurrentScenarios() {
        const questionCount = this.player.questionHistory.length;
        
        if (questionCount < 5) {
            return this.basicScenarios;
        } else if (questionCount < 10) {
            return this.intermediateScenarios;
        } else {
            return this.advancedScenarios;
        }
    }
    
    // Get the current level based on question index
    getCurrentLevel() {
        const questionCount = this.player.questionHistory.length;
        
        if (questionCount < 5) {
            return 'Basic';
        } else if (questionCount < 10) {
            return 'Intermediate';
        } else {
            return 'Advanced';
        }
    }
    
    // Calculate the score percentage
    calculateScorePercentage() {
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && q.isCorrect
        ).length;
        return Math.round((correctAnswers / Math.max(1, this.player.questionHistory.length)) * 100);
    }

    // Wait for timer settings to be loaded before starting the game
    async startGameWhenReady() {
        console.log('[TestTypesTricksQuiz] Waiting for timer settings to be loaded...');
        
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkTimerSettings = () => {
            attempts++;
            console.log(`[TestTypesTricksQuiz] Check attempt ${attempts}, timePerQuestion: ${this.timePerQuestion}`);
            
            // Check if timer settings have been loaded (either from API or default)
            if (this.timePerQuestion !== undefined && this.timePerQuestion !== null) {
                console.log(`[TestTypesTricksQuiz] Timer settings loaded: ${this.timePerQuestion}s per question`);
                
                // Add page unload handler for timer persistence
                this.addPageUnloadHandler();
                
                this.startGame();
                return;
            }
            
            if (attempts >= maxAttempts) {
                console.warn('[TestTypesTricksQuiz] Timer settings not loaded after maximum attempts, using BaseQuiz value');
                
                // Add page unload handler for timer persistence
                this.addPageUnloadHandler();
                
                this.startGame();
                return;
            }
            
            // Wait and check again
            setTimeout(checkTimerSettings, 100);
        };
        
        checkTimerSettings();
    }

    // Add handler to save timer state when user leaves the page
    addPageUnloadHandler() {
        const saveTimerOnUnload = () => {
            if (this.questionTimer && this.timerStartTime) {
                this.saveCurrentTimerState();
            }
        };

        window.addEventListener('beforeunload', saveTimerOnUnload);
        
        // Also save on visibility change (when user switches tabs)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.questionTimer && this.timerStartTime) {
                this.saveCurrentTimerState();
            }
        });
    }

    // Start the quiz
    async startGame() {
        if (this.isLoading) return;
        
        console.log('[TestTypesTricksQuiz] Starting game...');
        
        try {
            this.isLoading = true;
            
            // Show loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.remove('hidden');
            }

            // Set player name
            this.player.name = localStorage.getItem('username');
            if (!this.player.name) {
                window.location.href = '../login.html';
                return;
            }

            // Try to load previous progress
            const hasProgress = await this.loadProgress();
            console.log(`[TestTypesTricksQuiz] Progress loaded: ${hasProgress}`);
            
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
            
            if (!hasProgress) {
                // Reset player state if no valid progress exists
                this.player.experience = 0;
                this.player.tools = [];
                this.player.currentScenario = 0;
                this.player.questionHistory = [];
                console.log('[TestTypesTricksQuiz] No previous progress, starting fresh');
            } else {
                // Verify the loaded progress contains valid question history
                if (!this.player.questionHistory || !Array.isArray(this.player.questionHistory)) {
                    console.log('[TestTypesTricksQuiz] Invalid question history in loaded progress, resetting');
                    this.player.questionHistory = [];
                }
                
                // CRITICAL: Ensure currentScenario is set correctly based on question history
                this.player.currentScenario = this.player.questionHistory.length;
                console.log('[TestTypesTricksQuiz] Set currentScenario to match question history:', this.player.currentScenario);
            }
            
            // Check if the quiz is already completed
            if (this.shouldEndGame()) {
                this.endGame(false);
                // Hide loading overlay when showing completed quiz
                this.hideLoadingOverlay();
                return;
            }
            
            // Clear any existing transition messages
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = '';
                transitionContainer.classList.remove('active');
            }

            // Display the first/next scenario
            this.displayScenario();
            
            // Hide loading overlay once quiz is ready
            this.hideLoadingOverlay();
            this.isLoading = false;
        } catch (error) {
            console.error('[TestTypesTricksQuiz] Error starting game:', error);
            this.isLoading = false;
            this.showError('Failed to start the quiz. Please refresh the page.');
            // Hide loading overlay even on error
            this.hideLoadingOverlay();
        }
    }
    
    // Initialize the timer for the current question
    initializeTimer() {
        console.log(`[TestTypesTricksQuiz] Initializing timer for question ${this.player.questionHistory.length}`);
        
        // Clear any existing timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
        
        // Reset timer display
        const timerContainer = document.getElementById('timer-container');
        const timerDisplay = document.getElementById('timer-display');
        
        if (!timerContainer || !timerDisplay) {
            console.error('[TestTypesTricksQuiz] Timer elements not found');
            return;
        }
        
        // Check if timer is disabled (0 seconds) or timer functionality is disabled
        if (this.timerDisabled || this.timePerQuestion === 0) {
            console.log(`[TestTypesTricksQuiz] Timer is disabled, hiding timer display`);
            timerContainer.classList.add('hidden');
            return;
        }
        
        // Show the timer
        timerContainer.classList.remove('hidden');
        timerContainer.classList.remove('visually-hidden');
        
        // Check for restored timer state first
        const restoredTime = this.restoreTimerState();
        let timeLeft;
        
        if (restoredTime !== null) {
            timeLeft = restoredTime;
            console.log(`[TestTypesTricksQuiz] Restored timer with ${timeLeft} seconds remaining`);
        } else {
            timeLeft = this.timePerQuestion;
            console.log(`[TestTypesTricksQuiz] Starting new timer with ${timeLeft} seconds`);
        }
        
        timerDisplay.textContent = `${timeLeft}s`;
        this.timerStartTime = Date.now();
        
        // Save timer state periodically
        const saveInterval = setInterval(() => {
            if (this.questionTimer && this.timerStartTime) {
                this.saveCurrentTimerState();
            } else {
                clearInterval(saveInterval);
            }
        }, 3000); // Save every 3 seconds
        
        this.questionStartTime = Date.now();
        this.questionTimer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(this.questionTimer);
                clearInterval(saveInterval);
                this.questionTimer = null;
                this.handleTimedOut();
            }
        }, 1000);
    }
    
    // Handle when time runs out for a question
    handleTimedOut() {
        console.log('[TestTypesTricksQuiz] Question timed out');
        
        // Select a random option if none selected
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (!selectedOption) {
            const options = document.querySelectorAll('input[name="option"]');
            if (options.length > 0) {
                const randomIndex = Math.floor(Math.random() * options.length);
                options[randomIndex].checked = true;
            }
        }
        
        // Submit the answer with the timed out flag
        this.handleAnswer(true);
    }
    
    // Display the current scenario
    displayScenario() {
        // Check if the quiz is already completed
        if (this.shouldEndGame()) {
            this.endGame(false);
                    // Hide loading overlay when showing completed quiz
                this.hideLoadingOverlay();
                return;
        }
        
        // Get the current scenario based on progress
        const currentScenarios = this.getCurrentScenarios();
        const scenarioIndex = this.player.questionHistory.length % 5; // Use modulo to cycle through 5 scenarios per level
        const scenario = currentScenarios[scenarioIndex]; 
        
        console.log(`[TestTypesTricksQuiz] Displaying scenario #${this.player.currentScenario + 1}:`, {
            title: scenario.title,
            level: this.getCurrentLevel(),
            index: scenarioIndex
        });
        
        // Show level transition message when level changes
        const currentLevel = this.getCurrentLevel();
        const questionCount = this.player.questionHistory.length;
        
        if (questionCount === 0 || 
            (questionCount === 5 && currentLevel === 'Intermediate') || 
            (questionCount === 10 && currentLevel === 'Advanced')) {
            
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = ''; // Clear any existing messages
                
                const levelMessage = document.createElement('div');
                levelMessage.className = 'level-transition';
                levelMessage.setAttribute('role', 'alert');
                levelMessage.textContent = `Starting ${currentLevel} Questions`;
                
                transitionContainer.appendChild(levelMessage);
                transitionContainer.classList.add('active');
                
                // Remove the message and container height after animation
                setTimeout(() => {
                    transitionContainer.classList.remove('active');
                    setTimeout(() => {
                        transitionContainer.innerHTML = '';
                    }, 300); // Wait for height transition to complete
                }, 3000);
            }
        }

        // Update UI for scenario
        const titleElement = document.getElementById('scenario-title');
        const descriptionElement = document.getElementById('scenario-description');
        
        if (titleElement && descriptionElement) {
            titleElement.textContent = scenario.title;
            descriptionElement.textContent = scenario.description;
        }

        // Update question progress
        const questionProgress = document.getElementById('question-progress');
        if (questionProgress) {
            questionProgress.textContent = `Question: ${questionCount + 1}/15`;
        }
        
        // Update level indicator
        const levelIndicator = document.getElementById('level-indicator');
        if (levelIndicator) {
            levelIndicator.textContent = `Level: ${currentLevel}`;
        }
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progressPercentage = (questionCount / 15) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        // Display options with shuffling
        const optionsContainer = document.getElementById('options-container');
        if (optionsContainer) {
            optionsContainer.innerHTML = '';

        // Create a copy of options with their original indices
            const shuffledOptions = scenario.options.map((option, index) => ({
            ...option,
            originalIndex: index
        }));
            
            // Shuffle the options
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
            
            shuffledOptions.forEach((option, idx) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.innerHTML = `
                <input type="radio" 
                    name="option" 
                    value="${option.originalIndex}" 
                        id="option${idx}"
                    tabindex="0"
                    aria-label="${option.text}"
                    role="radio">
                    <label for="option${idx}">${option.text}</label>
                `;
                
                // Enhance option interactivity using the BaseQuiz helper method
                const radioInput = optionDiv.querySelector('input[type="radio"]');
                this.enhanceOptionInteractivity(optionDiv, radioInput, option.text);
                
                optionsContainer.appendChild(optionDiv);
            });
        }
        
        // Show game screen
        this.gameScreen.classList.remove('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');
        
        // Initialize timer for the question
        this.initializeTimer();
        
        // Save progress after displaying - ensures we're in a consistent state
        if (this.player.questionHistory.length > 0) {
            // Only save if we have actual progress to avoid recursive saves
            this.saveProgress('in-progress').catch(err => {
                console.warn('[TestTypesTricksQuiz] Save after display failed:', err);
            });
        }
    }
    
    // Handle answer submission
    async handleAnswer(timedOut = false) {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            
            // Clear the timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
                this.questionTimer = null;
            }
            
            // Clear timer persistence state since question is being completed
            this.clearCurrentTimerState();
        
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
        }

            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption && !timedOut) {
                alert('Please select an answer.');
                this.isLoading = false;
                if (submitButton) {
                    submitButton.disabled = false;
                }
                // Restart timer since we're not proceeding
                this.initializeTimer();
                return;
            }
            
            // Get the selected option index
            const optionIndex = selectedOption ? parseInt(selectedOption.value) : 0;
            
            // Get the current scenario
            const currentScenarios = this.getCurrentScenarios();
            const scenarioIndex = this.player.questionHistory.length % 5;
            const scenario = currentScenarios[scenarioIndex];
            
            // Get the selected answer
            const selectedAnswer = scenario.options[optionIndex];
            
            console.log('[TestTypesTricksQuiz] Selected answer:', {
                text: selectedAnswer.text,
                experience: selectedAnswer.experience,
                timedOut: timedOut
            });
            
            // Add to player experience (no points if timed out)
            if (!timedOut) {
                this.player.experience += selectedAnswer.experience;
            }

            // Find the correct answer (option with highest experience)
            const correctAnswer = scenario.options.reduce((prev, current) => 
                (prev.experience > current.experience) ? prev : current
            );

            // Mark selected answer as correct or incorrect
            // If timed out, always mark as incorrect regardless of the randomly selected answer
            if (timedOut) {
                selectedAnswer.isCorrect = false;
            } else {
                selectedAnswer.isCorrect = selectedAnswer === correctAnswer;
            }
            
            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: selectedAnswer.isCorrect,
                timeSpent: timeSpent,
                timedOut: timedOut
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();
            
            // Show outcome
                this.gameScreen.classList.add('hidden');
                this.outcomeScreen.classList.remove('hidden');
            
            // Display outcome content
            const outcomeContent = document.querySelector('.outcome-content');
            if (outcomeContent) {
                // Prepare the outcome message
                let outcomeHeader = selectedAnswer.isCorrect ? 'Correct!' : 'Incorrect';
                let outcomeMessage = selectedAnswer.outcome || '';
                
                // Add timed out message if applicable
                if (timedOut) {
                    outcomeHeader = 'Time\'s Up!';
                    outcomeMessage = 'You ran out of time. This question is marked as incorrect.';
                }
                
                outcomeContent.innerHTML = `
                    <h3>${outcomeHeader}</h3>
                    <p>${outcomeMessage}</p>
                    <p class="result">${selectedAnswer.isCorrect ? 'Correct answer!' : 'Try again next time.'}</p>
                    ${timedOut ? '<p class="timeout-warning">Remember to answer within the time limit!</p>' : ''}
                    ${selectedAnswer.tool && !timedOut ? `<p class="tool-gained">You've gained the <strong>${selectedAnswer.tool}</strong> tool!</p>` : ''}
                    <button id="continue-btn" class="submit-button">Continue</button>
                `;
                
                // If this answer added a tool and wasn't timed out, add it to player's tools
                if (selectedAnswer.tool && !timedOut && !this.player.tools.includes(selectedAnswer.tool)) {
                    this.player.tools.push(selectedAnswer.tool);
                }
                
                // Add event listener to continue button
                const continueBtn = outcomeContent.querySelector('#continue-btn');
                if (continueBtn) {
                    continueBtn.addEventListener('click', () => this.nextScenario());
                }
            }

            this.updateProgress();
            
        } catch (error) {
            console.error('[TestTypesTricksQuiz] Error handling answer:', error);
            this.showError('Failed to process your answer. Please try again.');
        } finally {
            this.isLoading = false;
            const submitButton = document.querySelector('.submit-button');
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    }

    // Move to the next scenario
    nextScenario() {
        // Hide outcome screen and show game screen
        if (this.outcomeScreen && this.gameScreen) {
            this.outcomeScreen.classList.add('hidden');
            this.gameScreen.classList.remove('hidden');
        }
        
        // Display next scenario
        this.displayScenario();
    }

    // Update progress display
    updateProgress() {
        // Get current level and question count
        const currentLevel = this.getCurrentLevel();
        const totalAnswered = this.player.questionHistory.length;
        const questionNumber = Math.min(totalAnswered + 1, 15);
        
        // Update level indicator
        const levelIndicator = document.getElementById('level-indicator');
        if (levelIndicator) {
            levelIndicator.textContent = `Level: ${currentLevel}`;
        }
        
        // Update question progress
        const questionProgress = document.getElementById('question-progress');
        if (questionProgress) {
            questionProgress.textContent = `Question: ${questionNumber}/15`;
        }
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progressPercentage = (totalAnswered / 15) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
    }

    // End the quiz
    async endGame(failed = false) {
        console.log('[TestTypesTricksQuiz] Ending game...');
        
        try {
            // Calculate score
            const correctAnswers = this.player.questionHistory.filter(q => q.isCorrect).length;
            const totalAnswers = this.player.questionHistory.length;
            const scorePercentage = Math.round((correctAnswers / totalAnswers) * 100);
            
            // Determine if passed or failed
            const passed = scorePercentage >= this.passPercentage;
            
            console.log('[TestTypesTricksQuiz] Quiz results:', {
                score: scorePercentage,
                experience: this.player.experience,
                passed: passed
            });
            
            // Hide screens
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

            // Hide the timer
            const timerContainer = document.getElementById('timer-container');
            if (timerContainer) {
                timerContainer.classList.add('hidden');
            }
            
            // Hide the progress counter on final screen
            const quizProgress = document.getElementById('quiz-progress');
            if (quizProgress) {
                quizProgress.style.display = 'none';
            }
        
        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
                quizCompleteHeader.textContent = passed ? 'Quiz Complete!' : 'Quiz Failed!';
            }
            
            // Update final score display
            const finalScore = document.getElementById('final-score');
            if (finalScore) {
                finalScore.textContent = `Final Score: ${scorePercentage}%`;
            }
            
            // Update performance summary
            const performanceSummary = document.getElementById('performance-summary');
            if (performanceSummary) {
                if (passed) {
            // Find the appropriate performance message
            const threshold = this.config.performanceThresholds.find(t => scorePercentage >= t.threshold);
                    performanceSummary.textContent = threshold ? threshold.message : 'Congratulations! You passed the quiz.';
            } else {
                    performanceSummary.textContent = 'Quiz failed. You did not earn enough points to pass. You can retry this quiz later.';
            }
        }

        // Generate question review list
        const reviewList = document.getElementById('question-review');
        if (reviewList) {
            reviewList.innerHTML = ''; // Clear existing content
                
            this.player.questionHistory.forEach((record, index) => {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                    reviewItem.classList.add(record.isCorrect ? 'correct' : 'incorrect');
                    
                    // Add timed out class if applicable
                    if (record.timedOut) {
                        reviewItem.classList.add('timed-out');
                    }
                
                reviewItem.innerHTML = `
                    <h4>Question ${index + 1}</h4>
                        <p class="scenario">${record.scenario.title}</p>
                    <p class="answer"><strong>Your Answer:</strong> ${record.selectedAnswer.text}</p>
                    <p class="outcome"><strong>Outcome:</strong> ${record.selectedAnswer.outcome}</p>
                        <p class="result"><strong>Result:</strong> ${record.isCorrect ? 'Correct' : 'Incorrect'} ${record.timedOut ? '(Timed Out)' : ''}</p>
                `;
                
                reviewList.appendChild(reviewItem);
            });
        }

            // Generate recommendations
            const recommendations = document.getElementById('recommendations');
            if (recommendations) {
                let recommendationsHTML = '';
                
                if (scorePercentage >= 90) {
                    recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated excellent knowledge of testing principles across Basic, Intermediate and Advanced levels!</p>';
                } else if (scorePercentage >= 70) {
                    recommendationsHTML = '<p>👍 Good job! Here are some areas to review:</p><ul>';
                    // Find areas where the user made mistakes and group by level
                    const incorrectQuestions = this.player.questionHistory.filter(q => !q.isCorrect);
                    const groupedByLevel = incorrectQuestions.reduce((acc, q) => {
                        if (!acc[q.scenario.level]) {
                            acc[q.scenario.level] = [];
                        }
                        acc[q.scenario.level].push(q);
                        return acc;
                    }, {});

                    // Display recommendations by level
                    Object.entries(groupedByLevel).forEach(([level, questions]) => {
                        recommendationsHTML += `<li><strong>${level} Level:</strong><ul>`;
                        questions.forEach(q => {
                            recommendationsHTML += `<li>${q.scenario.title}: ${q.scenario.description}</li>`;
                        });
                        recommendationsHTML += '</ul></li>';
                    });
                    recommendationsHTML += '</ul>';
                } else {
                    recommendationsHTML = '<p>📚 Here are key areas for improvement:</p><ul>';
                    // Find areas where the user made mistakes and group by level
                    const incorrectQuestions = this.player.questionHistory.filter(q => !q.isCorrect);
                    const groupedByLevel = incorrectQuestions.reduce((acc, q) => {
                        if (!acc[q.scenario.level]) {
                            acc[q.scenario.level] = [];
                        }
                        acc[q.scenario.level].push(q);
                        return acc;
                    }, {});

                    // Display recommendations by level with more detailed guidance
                    Object.entries(groupedByLevel).forEach(([level, questions]) => {
                        recommendationsHTML += `<li><strong>${level} Level Topics:</strong><ul>`;
                        questions.forEach(q => {
                            recommendationsHTML += `<li>${q.scenario.title}: ${q.scenario.description}</li>`;
                        });
                        recommendationsHTML += '</ul></li>';
                    });
                    recommendationsHTML += '</ul><p>Focus on mastering Basic level concepts before moving to more advanced topics.</p>';
                }
                
                recommendations.innerHTML = recommendationsHTML;
            }
            
            // Save final progress
            await this.saveProgress(passed ? 'passed' : 'failed');
            
        } catch (error) {
            console.error('[TestTypesTricksQuiz] Error ending game:', error);
            this.showError('Failed to complete the quiz. Please refresh the page.');
        }
    }
    
    // Restart the quiz
    async restartQuiz() {
        console.log('[TestTypesTricksQuiz] Restarting quiz...');
        
        // Clear the timer if it exists
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
        
        // Reset player state
        this.player = {
            name: localStorage.getItem('username'),
            experience: 0,
            questionHistory: [],
            currentScenario: 0,
            tools: []
        };
        
        // Save reset progress
        await this.saveProgress('in-progress');
        
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
        
        // Start again
        this.displayScenario();
    }
    
    // Helper for showing errors
    showError(message) {
        console.error('[TestTypesTricksQuiz] Error:', message);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff4444;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-weight: bold;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    // Timer persistence methods
    getTimerStorageKey() {
        const questionIndex = this.player.questionHistory.length;
        return `test-types_timer_${this.player.username}_q${questionIndex}`;
    }
    
    saveTimerState(timeRemaining) {
        try {
            const timerData = {
                timeRemaining: timeRemaining,
                questionIndex: this.player.questionHistory.length,
                timestamp: Date.now()
            };
            localStorage.setItem(this.getTimerStorageKey(), JSON.stringify(timerData));
        } catch (error) {
            console.warn('[TestTypesTricksQuiz] Failed to save timer state:', error);
        }
    }
    
    restoreTimerState() {
        try {
            const storageKey = this.getTimerStorageKey();
            const savedData = localStorage.getItem(storageKey);
            
            if (!savedData) {
                return null;
            }
            
            const timerData = JSON.parse(savedData);
            const currentQuestionIndex = this.player.questionHistory.length;
            
            // Validate that this timer data is for the current question
            if (timerData.questionIndex !== currentQuestionIndex) {
                console.log('[TestTypesTricksQuiz] Timer data is for different question, ignoring');
                localStorage.removeItem(storageKey);
                return null;
            }
            
            // Check if the data is not too old (10 minutes max)
            const maxAge = 10 * 60 * 1000; // 10 minutes
            if (Date.now() - timerData.timestamp > maxAge) {
                console.log('[TestTypesTricksQuiz] Timer data is too old, ignoring');
                localStorage.removeItem(storageKey);
                return null;
            }
            
            // Validate time remaining
            if (timerData.timeRemaining <= 0) {
                localStorage.removeItem(storageKey);
                return null;
            }
            
            console.log(`[TestTypesTricksQuiz] Restored timer state: ${timerData.timeRemaining}s remaining`);
            return timerData.timeRemaining;
            
        } catch (error) {
            console.warn('[TestTypesTricksQuiz] Failed to restore timer state:', error);
            return null;
        }
    }
    
    clearCurrentTimerState() {
        try {
            const storageKey = this.getTimerStorageKey();
            localStorage.removeItem(storageKey);
            console.log('[TestTypesTricksQuiz] Cleared current timer state');
        } catch (error) {
            console.warn('[TestTypesTricksQuiz] Failed to clear timer state:', error);
        }
    }
    
    clearAllTimerStates() {
        try {
            const keys = Object.keys(localStorage);
            const prefix = `test-types_timer_${this.player.username}_`;
            
            keys.forEach(key => {
                if (key.startsWith(prefix)) {
                    localStorage.removeItem(key);
                }
            });
            
            console.log('[TestTypesTricksQuiz] Cleared all timer states');
        } catch (error) {
            console.warn('[TestTypesTricksQuiz] Failed to clear timer states:', error);
        }
    }
    
    saveCurrentTimerState() {
        if (this.questionTimer && this.timerStartTime) {
            const elapsedTime = Math.floor((Date.now() - this.timerStartTime) / 1000);
            const timeRemaining = Math.max(0, this.timePerQuestion - elapsedTime);
            if (timeRemaining > 0) {
                this.saveTimerState(timeRemaining);
            }
        }
    }
}

// Create and initialize the quiz when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[TestTypesTricksQuiz] DOM loaded, initializing quiz...');
    window.testTypesTricksQuiz = new TestTypesTricksQuiz();
}); 