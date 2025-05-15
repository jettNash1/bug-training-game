import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';
import { APIService } from '../api-service.js';
import { testScenarios } from '../data/test-scenarios.js';

class TestQuiz extends BaseQuiz {
    constructor() {
        console.log('[TestQuiz] Initializing...');
        
        // Configure the quiz with basic settings
        const config = {
            maxXP: 180, // Maximum experience points possible (increased for more questions)
            totalQuestions: 9, // Updated to 9 questions total (3 from each level)
            passPercentage: 70, // Percentage needed to pass
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You have excellent testing knowledge!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong testing skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing and try again!' }
            ],
            quizName: 'test-quiz' // Unique name for the quiz
        };
        
        // Call the parent constructor with our config
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'test-quiz',
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
        
        // Initialize the API service
        this.apiService = new APIService();
        
        // Load scenarios from our data file
        this.basicScenarios = testScenarios.basic;
        this.intermediateScenarios = testScenarios.intermediate;
        this.advancedScenarios = testScenarios.advanced;
        
        console.log('[TestQuiz] Scenarios loaded:', {
            basicCount: this.basicScenarios.length,
            intermediateCount: this.intermediateScenarios.length,
            advancedCount: this.advancedScenarios.length
        });
        
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
        
        this.isLoading = false;
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Start the quiz
        this.startGame();
    }
    
    // Override the shouldEndGame method for our 9-question quiz
    shouldEndGame() {
        return this.player.questionHistory.length >= 9;
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
        
        // Add visibility change event listener to check progress when returning to tab
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('[TestQuiz] Page became visible, checking progress state');
                
                // Ensure the current scenario is displayed when returning to the page
                if (this.player && this.player.questionHistory) {
                    // Ensure currentScenario matches question history length
                    if (this.player.currentScenario !== this.player.questionHistory.length) {
                        console.log('[TestQuiz] Fixing currentScenario to match question history length');
                        this.player.currentScenario = this.player.questionHistory.length;
                        
                        // If the quiz was in progress, show the correct screen
                        if (!this.shouldEndGame()) {
                            this.displayScenario();
                        }
                    }
                }
            }
        });
    }
    
    // Get the scenarios for the current level
    getCurrentScenarios() {
        const questionCount = this.player.questionHistory.length;
        
        if (questionCount < 3) {
            return this.basicScenarios;
        } else if (questionCount < 6) {
            return this.intermediateScenarios;
        } else {
            return this.advancedScenarios;
        }
    }
    
    // Get the current level based on question index
    getCurrentLevel() {
        const questionCount = this.player.questionHistory.length;
        
        if (questionCount < 3) {
            return 'Basic';
        } else if (questionCount < 6) {
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
    
    // Start the quiz
    async startGame() {
        if (this.isLoading) return;
        
        console.log('[TestQuiz] Starting game...');
        
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
            console.log(`[TestQuiz] Progress loaded: ${hasProgress}`);
            
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
                console.log('[TestQuiz] No previous progress, starting fresh');
            } else {
                // Verify the loaded progress contains valid question history
                if (!this.player.questionHistory || !Array.isArray(this.player.questionHistory)) {
                    console.log('[TestQuiz] Invalid question history in loaded progress, resetting');
                    this.player.questionHistory = [];
                }
                
                // CRITICAL: Ensure currentScenario is set correctly based on question history
                this.player.currentScenario = this.player.questionHistory.length;
                console.log('[TestQuiz] Set currentScenario to match question history:', this.player.currentScenario);
                
                // Log the loaded state
                console.log('[TestQuiz] Loaded player state:', {
                    currentScenario: this.player.currentScenario,
                    questionsAnswered: this.player.questionHistory.length,
                    experience: this.player.experience
                });
            }
            
            // Check if the quiz is already completed
            if (this.shouldEndGame()) {
                this.endGame(false);
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
            
            this.isLoading = false;
        } catch (error) {
            console.error('[TestQuiz] Error starting game:', error);
            this.isLoading = false;
            this.showError('Failed to start the quiz. Please refresh the page.');
        }
    }
    
    // Display the current scenario
    displayScenario() {
        // Check if the quiz is already completed
        if (this.shouldEndGame()) {
            this.endGame(false);
            return;
        }
        
        // Get the current scenario based on progress
        const currentScenarios = this.getCurrentScenarios();
        const scenarioIndex = this.player.questionHistory.length % 3; // Use modulo to cycle through 3 scenarios per level
        const scenario = currentScenarios[scenarioIndex]; 
        
        if (!scenario) {
            console.error(`[TestQuiz] No scenario found for index ${scenarioIndex} in level ${this.getCurrentLevel()}`);
            this.showError('Failed to load question. Please refresh the page.');
            return;
        }
        
        console.log(`[TestQuiz] Displaying scenario #${this.player.currentScenario + 1}:`, {
            title: scenario.title,
            level: this.getCurrentLevel(),
            index: scenarioIndex
        });
        
        // Show level transition message when level changes
        const currentLevel = this.getCurrentLevel();
        const questionCount = this.player.questionHistory.length;
        
        if (questionCount === 0 || 
            (questionCount === 3 && currentLevel === 'Intermediate') || 
            (questionCount === 6 && currentLevel === 'Advanced')) {
            
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
        document.getElementById('scenario-title').textContent = scenario.title;
        document.getElementById('scenario-description').textContent = scenario.description;
        
        // Update the header info
        const levelInfo = document.querySelector('.level-info');
        const questionInfo = document.querySelector('.question-info');
        
        if (levelInfo) {
            levelInfo.textContent = `Level: ${this.getCurrentLevel()}`;
        }
        
        if (questionInfo) {
            questionInfo.textContent = `Question: ${this.player.currentScenario + 1}/9`;
        }
        
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            const progressPercentage = (this.player.currentScenario / 9) * 100;
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
                optionsContainer.appendChild(optionDiv);
            });
            
            // Add submit button event listener
            const submitButton = document.getElementById('submit-btn');
            if (submitButton) {
                // Remove previous event listeners
                const newSubmitButton = submitButton.cloneNode(true);
                submitButton.parentNode.replaceChild(newSubmitButton, submitButton);
                
                // Add new event listener
                newSubmitButton.addEventListener('click', () => this.handleAnswer());
            }
        }
        
        // Show game screen
        this.gameScreen.classList.remove('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');
        
        // Save progress after displaying - ensures we're in a consistent state
        if (this.player.questionHistory.length > 0) {
            // Only save if we have actual progress to avoid recursive saves
            this.saveProgress('in-progress').catch(err => {
                console.warn('[TestQuiz] Save after display failed:', err);
            });
        }
    }
    
    // Override saveProgress to add extra logging and ensure data is properly saved
    async saveProgress(status = null) {
        try {
            console.log('[TestQuiz] Saving progress with status:', status);
            
            // Use the parent implementation
            await super.saveProgress(status);
            
            // Also save to QuizUser directly to ensure it's stored in the API
            const username = localStorage.getItem('username');
            if (username) {
                try {
                    const user = new QuizUser(username);
                    
                    // Calculate score based on correct answers
                    const score = this.calculateScorePercentage();
                    
                    // Save to QuizUser API
                    await user.updateQuizScore(
                        this.quizName,
                        score, // score
                        this.player.experience, // experience
                        this.player.tools, // tools
                        this.player.questionHistory, // questionHistory
                        this.player.questionHistory.length, // questionsAnswered
                        status || 'in-progress' // status
                    );
                    
                    console.log('[TestQuiz] Successfully saved progress to API');
                } catch (apiError) {
                    console.error('[TestQuiz] Error saving to API:', apiError);
                    // Continue execution - localStorage save from super is our backup
                }
            }
            
            return true;
        } catch (error) {
            console.error('[TestQuiz] Error saving progress:', error);
            return false;
        }
    }
    
    // Override loadProgress to add verification
    async loadProgress() {
        console.log('[TestQuiz] Loading progress...');
        
        try {
            // First try to load progress using the BaseQuiz implementation
            const hasProgress = await super.loadProgress();
            console.log('[TestQuiz] Parent loadProgress result:', hasProgress);
            
            if (hasProgress && this.player.questionHistory && this.player.questionHistory.length > 0) {
                // Make sure currentScenario matches the question history length
                this.player.currentScenario = this.player.questionHistory.length;
                
                console.log('[TestQuiz] Successfully loaded progress:', {
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory.length,
                    currentScenario: this.player.currentScenario
                });
                
                return true;
            }
            
            // If the parent class couldn't load progress, try the API directly
            try {
                const username = localStorage.getItem('username');
                if (username) {
                    const user = new QuizUser(username);
                    const quizProgress = await user.getQuizProgress(this.quizName);
                    
                    if (quizProgress && quizProgress.questionHistory && quizProgress.questionHistory.length > 0) {
                        console.log('[TestQuiz] Loaded progress from API:', quizProgress);
                        
                        // Update player state from API data
                        this.player.experience = quizProgress.experience || 0;
                        this.player.tools = quizProgress.tools || [];
                        this.player.questionHistory = quizProgress.questionHistory || [];
                        this.player.currentScenario = quizProgress.questionHistory.length;
                        
                        // Save this to localStorage so next time it loads faster
                        await super.saveProgress('in-progress');
                        
                        return true;
                    }
                }
            } catch (apiError) {
                console.error('[TestQuiz] Error loading from API:', apiError);
                // Continue with whatever we got from the parent class
            }
            
            return hasProgress;
        } catch (error) {
            console.error('[TestQuiz] Error loading progress:', error);
            return false;
        }
    }
    
    // Handle answer submission
    async handleAnswer() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            
            const submitButton = document.querySelector('.submit-button');
            if (submitButton) {
                submitButton.disabled = true;
            }
            
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) {
                alert('Please select an answer.');
                this.isLoading = false;
                if (submitButton) {
                    submitButton.disabled = false;
                }
                return;
            }
            
            // Get the selected option index
            const optionIndex = parseInt(selectedOption.value);
            
            // Get the current scenario
            const currentScenarios = this.getCurrentScenarios();
            const scenarioIndex = this.player.questionHistory.length % 3;
            const scenario = currentScenarios[scenarioIndex];
            
            // Get the selected answer
            const selectedAnswer = scenario.options[optionIndex];
            
            console.log('[TestQuiz] Selected answer:', {
                text: selectedAnswer.text,
                experience: selectedAnswer.experience
            });
            
            // Add to player experience
            this.player.experience += selectedAnswer.experience;
            
            // Find the correct answer (option with highest experience)
            const correctAnswer = scenario.options.reduce((prev, current) => 
                (prev.experience > current.experience) ? prev : current
            );
            
            // Mark selected answer as correct or incorrect
            selectedAnswer.isCorrect = selectedAnswer === correctAnswer;
            
            // Add to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: selectedAnswer.isCorrect,
                timeSpent: null
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
                outcomeContent.innerHTML = `
                    <h3>${selectedAnswer.isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                    <p>${selectedAnswer.outcome || ''}</p>
                    <p class="result">${selectedAnswer.isCorrect ? 'Correct answer!' : 'Try again next time.'}</p>
                    ${selectedAnswer.tool ? `<p class="tool-gained">You've gained the <strong>${selectedAnswer.tool}</strong> tool!</p>` : ''}
                    <button id="continue-btn" class="submit-button">Continue</button>
                `;
                
                // If this answer added a tool, add it to player's tools
                if (selectedAnswer.tool && !this.player.tools.includes(selectedAnswer.tool)) {
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
            console.error('[TestQuiz] Error handling answer:', error);
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
        const questionNumber = totalAnswered + 1;
        
        // Update the existing progress card elements
        const levelInfoElement = document.querySelector('.level-info');
        const questionInfoElement = document.querySelector('.question-info');
        
        if (levelInfoElement) {
            levelInfoElement.textContent = `Level: ${currentLevel}`;
        }
        
        if (questionInfoElement) {
            questionInfoElement.textContent = `Question: ${questionNumber}/9`;
        }
        
        // Ensure the card is visible
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'block';
        }
        
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            const progressPercentage = (totalAnswered / 9) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
    }
    
    // End the quiz
    async endGame(failed = false) {
        console.log('[TestQuiz] Ending game...');
        
        try {
            // Calculate score
            const correctAnswers = this.player.questionHistory.filter(q => q.isCorrect).length;
            const totalAnswers = this.player.questionHistory.length;
            const scorePercentage = Math.round((correctAnswers / totalAnswers) * 100);
            
            // Determine if passed or failed
            const passed = scorePercentage >= this.passPercentage;
            
            console.log('[TestQuiz] Quiz results:', {
                score: scorePercentage,
                experience: this.player.experience,
                passed: passed
            });
            
            // Hide screens
            this.gameScreen.classList.add('hidden');
            this.outcomeScreen.classList.add('hidden');
            this.endScreen.classList.remove('hidden');
            
            // Hide the progress card on the end screen
            const progressCard = document.querySelector('.quiz-header-progress');
            if (progressCard) {
                progressCard.style.display = 'none';
            }
            
            // Update the quiz complete header based on status
            const quizCompleteHeader = document.querySelector('#end-screen h2');
            if (quizCompleteHeader) {
                quizCompleteHeader.textContent = passed ? 'Quiz Complete!' : 'Quiz Failed!';
            }
            
            // Update end screen elements
            const scoreValue = document.querySelector('.score-value');
            const experienceValue = document.querySelector('.experience-value');
            const passFailMessage = document.getElementById('pass-fail-message');
            
            if (scoreValue) {
                scoreValue.textContent = `${scorePercentage}%`;
            }
            
            if (experienceValue) {
                experienceValue.textContent = this.player.experience;
            }
            
            if (passFailMessage) {
                if (passed) {
                    // Find the appropriate performance message
                    const threshold = this.config.performanceThresholds.find(t => scorePercentage >= t.threshold);
                    passFailMessage.textContent = threshold ? threshold.message : 'Congratulations! You passed the quiz.';
                    passFailMessage.className = 'pass-fail-message passed';
                } else {
                    passFailMessage.textContent = 'You did not pass. Please try again.';
                    passFailMessage.className = 'pass-fail-message failed';
                }
            }
            
            // Generate recommendations
            const recommendationsList = document.getElementById('recommendations-list');
            if (recommendationsList) {
                recommendationsList.innerHTML = '';
                
                // Add tools gained
                if (this.player.tools.length > 0) {
                    const toolsItem = document.createElement('li');
                    toolsItem.innerHTML = `<strong>Tools gained:</strong> ${this.player.tools.join(', ')}`;
                    recommendationsList.appendChild(toolsItem);
                }
                
                // Add recommendations based on incorrect answers
                const incorrectQuestions = this.player.questionHistory.filter(q => !q.isCorrect);
                if (incorrectQuestions.length > 0) {
                    incorrectQuestions.forEach(q => {
                        const recommendation = document.createElement('li');
                        recommendation.textContent = `Review ${q.scenario.title}: ${q.scenario.description}`;
                        recommendationsList.appendChild(recommendation);
                    });
                } else if (passed) {
                    const perfectItem = document.createElement('li');
                    perfectItem.textContent = 'Great job! You answered all questions correctly.';
                    recommendationsList.appendChild(perfectItem);
                }
            }
            
            // Generate question review list
            const reviewList = document.getElementById('review-list');
            if (reviewList) {
                reviewList.innerHTML = ''; // Clear existing content
                
                this.player.questionHistory.forEach((record, index) => {
                    const reviewItem = document.createElement('div');
                    reviewItem.className = 'review-item';
                    reviewItem.classList.add(record.isCorrect ? 'correct' : 'incorrect');
                    
                    reviewItem.innerHTML = `
                        <h4>Question ${index + 1}</h4>
                        <p class="scenario">${record.scenario.title}</p>
                        <p class="answer"><strong>Your Answer:</strong> ${record.selectedAnswer.text}</p>
                        <p class="outcome"><strong>Outcome:</strong> ${record.selectedAnswer.outcome}</p>
                        <p class="result"><strong>Result:</strong> ${record.isCorrect ? 'Correct' : 'Incorrect'}</p>
                    `;
                    
                    reviewList.appendChild(reviewItem);
                });
            }
            
            // Save final progress
            await this.saveProgress(passed ? 'passed' : 'failed');
            
        } catch (error) {
            console.error('[TestQuiz] Error ending game:', error);
            this.showError('Failed to complete the quiz. Please refresh the page.');
        }
    }
    
    // Restart the quiz
    async restartQuiz() {
        console.log('[TestQuiz] Restarting quiz...');
        
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
        console.error('[TestQuiz] Error:', message);
        
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
                console.error('[TestQuiz] Displayed error to user:', message);
            }
        } catch (e) {
            // Fallback to alert if error display fails
            alert(message);
        }
    }
}

// Create and initialize the quiz when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[TestQuiz] DOM loaded, initializing quiz...');
    window.testQuiz = new TestQuiz();
}); 