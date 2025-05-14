import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';
import { communicationScenarios } from '../data/communication-scenarios.js';

export class CommunicationQuiz extends BaseQuiz {
    constructor() {
        console.log('[CommunicationQuiz][constructor] New instance created');
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a communication expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong communication skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing and try again!' }
            ],
            quizName: 'communication'
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'communication',
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
        console.log('[CommunicationQuiz][constructor] Loading scenarios from communicationScenarios');
        this.basicScenarios = communicationScenarios.basic;
        this.intermediateScenarios = communicationScenarios.intermediate;
        this.advancedScenarios = communicationScenarios.advanced;
        
        console.log('[CommunicationQuiz][constructor] Scenario arrays initialized:', {
            basicScenarios: this.basicScenarios.length,
            intermediateScenarios: this.intermediateScenarios.length,
            advancedScenarios: this.advancedScenarios.length
        });

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

        // Initialize event listeners
        this.initializeEventListeners();
        
        this.isLoading = false;

        // Add this debugging check to the constructor
        console.log('[CommunicationQuiz] Quiz name being used:', this.quizName);
        const relatedLocalStorage = Object.keys(localStorage).filter(k => 
            k.includes('quiz_progress') || k.includes('communication')
        );
        console.log('[CommunicationQuiz] Related localStorage keys:', relatedLocalStorage);
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
                console.error('[CommunicationQuiz] Displayed error to user:', message);
            }
        } catch (e) {
            console.error('[CommunicationQuiz] Failed to show error to user:', e);
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
            console.log('[CommunicationQuiz] Progress status check:', {
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
        // Check if we've answered all 15 questions
        if (this.player.questionHistory.length >= 15) {
            console.log('All 15 questions answered, ending game');
            this.endGame(false);
            return;
        }
        
        // Get the next scenario based on current progress
        let scenario;
        const questionCount = this.player.questionHistory.length;
        
        // Reset currentScenario based on the current level
        if (questionCount < 5) {
            // Basic questions (0-4)
            scenario = this.basicScenarios[questionCount];
            this.player.currentScenario = questionCount;
        } else if (questionCount < 10) {
            // Intermediate questions (5-9)
            scenario = this.intermediateScenarios[questionCount - 5];
            this.player.currentScenario = questionCount - 5;
        } else if (questionCount < 15) {
            // Advanced questions (10-14)
            scenario = this.advancedScenarios[questionCount - 10];
            this.player.currentScenario = questionCount - 10;
        }

        if (!scenario) {
            console.error('No scenario found for current progress. Question count:', questionCount);
            this.endGame(true);
            return;
        }

        // Store current question number for consistency
        this.currentQuestionNumber = questionCount + 1;
        
        // Show level transition message at the start of each level or when level changes
        const currentLevel = this.getCurrentLevel();
        const previousLevel = questionCount > 0 ? 
            (questionCount <= 5 ? 'Basic' : 
             questionCount <= 10 ? 'Intermediate' : 'Advanced') : null;
            
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
                
                // Update the level indicator
                const levelIndicator = document.getElementById('level-indicator');
                if (levelIndicator) {
                    levelIndicator.textContent = `Level: ${currentLevel}`;
                }
                
                // Remove the message and container height after animation
                setTimeout(() => {
                    transitionContainer.classList.remove('active');
                    setTimeout(() => {
                        transitionContainer.innerHTML = '';
                    }, 300); // Wait for height transition to complete
                }, 3000);
            }
        }

        // Update scenario display
        const titleElement = document.getElementById('scenario-title');
        const descriptionElement = document.getElementById('scenario-description');
        const optionsContainer = document.getElementById('options-container');

        if (!titleElement || !descriptionElement || !optionsContainer) {
            console.error('Required elements not found');
            return;
        }

        titleElement.textContent = scenario.title;
        descriptionElement.textContent = scenario.description;

        // Update question counter immediately
        const questionProgress = document.getElementById('question-progress');
        if (questionProgress) {
            questionProgress.textContent = `Question: ${this.currentQuestionNumber}/15`;
        }

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

        // Ensure the options form and submit button are visible
        const optionsForm = document.getElementById('options-form');
        const submitButton = document.getElementById('submit-btn');
        if (optionsForm) optionsForm.classList.remove('hidden');
        if (submitButton) submitButton.style.display = 'block';

        // Show the game screen if it's hidden
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen && gameScreen.classList.contains('hidden')) {
            gameScreen.classList.remove('hidden');
        }

        this.updateProgress();

        // Initialize timer for the new question
        this.initializeTimer();
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
            questionInfoElement.textContent = `Question: ${questionNumber}/15`;
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
            questionProgress.textContent = `Question: ${questionNumber}/${this.totalQuestions || 15}`;
        }
        
        if (progressFill) {
            const progressPercentage = (totalAnswered / (this.totalQuestions || 15)) * 100;
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of communication. You clearly understand the nuances of professional communication and are well-equipped to handle any communication challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your communication skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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
        const title = scenario.title.toLowerCase();
        const description = scenario.description.toLowerCase();

        if (title.includes('daily') || description.includes('daily')) {
            return 'Daily Communication';
        } else if (title.includes('team') || description.includes('team')) {
            return 'Team Collaboration';
        } else if (title.includes('stakeholder') || description.includes('stakeholder')) {
            return 'Stakeholder Management';
        } else if (title.includes('conflict') || description.includes('conflict')) {
            return 'Conflict Resolution';
        } else if (title.includes('remote') || description.includes('remote')) {
            return 'Remote Communication';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Documentation';
        } else if (title.includes('presentation') || description.includes('presentation')) {
            return 'Presentation Skills';
        } else {
            return 'General Communication';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Daily Communication': 'Practice maintaining clear status updates and regular check-ins with team members.',
            'Team Collaboration': 'Focus on active listening and providing constructive feedback in team settings.',
            'Technical Documentation': 'Improve documentation skills with clear, structured, and comprehensive information.',
            'Stakeholder Communication': 'Work on adapting communication style for technical and non-technical stakeholders.',
            'Conflict Resolution': 'Develop skills for handling disagreements professionally and constructively.'
        };

        return recommendations[area] || 'Continue improving your overall communication skills through practice and feedback.';
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
        console.log('[CommunicationQuiz] Starting scenario loading');
        
        // Ensure default scenarios are loaded
        this.basicScenarios = communicationScenarios.basic;
        this.intermediateScenarios = communicationScenarios.intermediate;
        this.advancedScenarios = communicationScenarios.advanced;
        
        console.log('[CommunicationQuiz] Scenarios loaded from imported file:', {
            basic: this.basicScenarios.length,
            intermediate: this.intermediateScenarios.length,
            advanced: this.advancedScenarios.length
        });
        
        // Try to fetch from API (for future updates, but default to the imported scenarios)
        try {
            const data = await this.apiService.getQuizScenarios(this.quizName);
            if (data && data.basic && Array.isArray(data.basic) && data.basic.length > 0) {
                this.basicScenarios = data.basic;
                this.intermediateScenarios = data.intermediate;
                this.advancedScenarios = data.advanced;
                console.log('[CommunicationQuiz] Updated scenarios from API');
            }
        } catch (error) {
            console.log('[CommunicationQuiz] Using default imported scenarios');
        }
    }

    // Emergency recovery method now simplified
    async recoverProgress() {
        console.log('[CommunicationQuiz] Entering emergency recovery mode');
        try {
            // Use the QuizProgressService directly for recovery
            const progressResult = await this.quizProgressService.getQuizProgress(this.quizName);
            
            if (!progressResult.success || !progressResult.data) {
                console.warn('[CommunicationQuiz] No data could be recovered, recovery failed');
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
            
            console.log('[CommunicationQuiz] Player state updated from recovered data:', {
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
            console.error('[CommunicationQuiz] Recovery attempt failed:', error);
            return false;
        }
    }
}

// Singleton instance for CommunicationQuiz
let communicationQuizInstance = null;

// Initialize quiz when the page loads
// Only allow one instance
document.addEventListener('DOMContentLoaded', () => {
    if (communicationQuizInstance) {
        console.log('[CommunicationQuiz] Instance already exists, not creating a new one.');
        return;
    }
    BaseQuiz.clearQuizInstances('communication');
    communicationQuizInstance = new CommunicationQuiz();
    communicationQuizInstance.startGame();
    
    // FORCE EMERGENCY OVERRIDE - Direct DOM manipulation after 2 seconds
    setTimeout(() => {
        diagnoseQuizDOM();
        forceScenarioDisplay();
    }, 2000);
}); 

// DIAGNOSTIC FUNCTION
// This function analyzes the DOM to find potential issues with quiz display
function diagnoseQuizDOM() {
    console.log('[DIAGNOSTIC] Starting DOM analysis');
    
    // Check key quiz elements
    const elements = {
        'game-screen': document.getElementById('game-screen'),
        'scenario-title': document.getElementById('scenario-title'),
        'scenario-description': document.getElementById('scenario-description'),
        'options-container': document.getElementById('options-container'),
        'submit-btn': document.getElementById('submit-btn'),
        'options-form': document.getElementById('options-form'),
        'level-indicator': document.getElementById('level-indicator'),
        'question-progress': document.getElementById('question-progress'),
        'progress-fill': document.getElementById('progress-fill')
    };
    
    // Log the state of each element
    console.log('[DIAGNOSTIC] Key quiz elements:');
    Object.entries(elements).forEach(([id, element]) => {
        if (element) {
            const displayStyle = window.getComputedStyle(element).display;
            const visibility = window.getComputedStyle(element).visibility;
            const isHidden = element.classList.contains('hidden');
            
            console.log(`[DIAGNOSTIC] #${id}: Found | Display: ${displayStyle} | Visibility: ${visibility} | Hidden class: ${isHidden}`);
            
            // Look at inner content for key elements
            if (id === 'scenario-title' || id === 'scenario-description') {
                console.log(`[DIAGNOSTIC] #${id} text content: "${element.textContent}"`);
            }
            if (id === 'options-container') {
                console.log(`[DIAGNOSTIC] #${id} has ${element.children.length} options`);
            }
        } else {
            console.log(`[DIAGNOSTIC] #${id}: NOT FOUND in DOM`);
        }
    });
    
    // Check quiz layout structure
    const quizContainer = document.querySelector('.quiz-container');
    if (quizContainer) {
        console.log('[DIAGNOSTIC] Quiz container structure:');
        logElementTree(quizContainer, 0);
    } else {
        console.log('[DIAGNOSTIC] Quiz container not found!');
    }
    
    // Check imported scenario data
    try {
        const basicScenariosLength = communicationScenarios.basic.length;
        const intermediateScenariosLength = communicationScenarios.intermediate.length;
        const advancedScenariosLength = communicationScenarios.advanced.length;
        
        console.log('[DIAGNOSTIC] Scenario data:', {
            basic: basicScenariosLength,
            intermediate: intermediateScenariosLength,
            advanced: advancedScenariosLength
        });
        
        // Check first scenario
        if (basicScenariosLength > 0) {
            const firstScenario = communicationScenarios.basic[0];
            console.log('[DIAGNOSTIC] First scenario title:', firstScenario.title);
            console.log('[DIAGNOSTIC] First scenario options count:', firstScenario.options.length);
        }
    } catch (error) {
        console.error('[DIAGNOSTIC] Error accessing scenario data:', error);
    }
    
    console.log('[DIAGNOSTIC] DOM analysis complete');
}

// Helper to log DOM tree structure
function logElementTree(element, depth) {
    if (depth > 3) return; // Limit depth to prevent too much output
    
    const indent = '  '.repeat(depth);
    const classes = Array.from(element.classList).join('.');
    const id = element.id ? `#${element.id}` : '';
    const display = window.getComputedStyle(element).display;
    const hidden = element.classList.contains('hidden') ? ' (HIDDEN)' : '';
    
    console.log(`${indent}${element.tagName.toLowerCase()}${id}${classes ? `.${classes}` : ''} | display: ${display}${hidden}`);
    
    Array.from(element.children).forEach(child => {
        logElementTree(child, depth + 1);
    });
}

// EMERGENCY OVERRIDE FUNCTION
// This function directly manipulates the DOM to display the first scenario
// completely bypassing all the normal quiz flow
function forceScenarioDisplay() {
    console.log('[EMERGENCY OVERRIDE] Forcing scenario display directly');
    
    try {
        // Get the scenario data directly from the imported module
        const basicScenarios = communicationScenarios.basic;
        const firstScenario = basicScenarios[0];
        
        if (!firstScenario) {
            console.error('[EMERGENCY OVERRIDE] No scenario data found!');
            return;
        }
        
        console.log('[EMERGENCY OVERRIDE] First scenario:', firstScenario);
        
        // Direct access to HTML elements
        const titleElement = document.getElementById('scenario-title');
        const descriptionElement = document.getElementById('scenario-description');
        const optionsContainer = document.getElementById('options-container');
        
        // Force show the game screen
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.classList.remove('hidden');
            gameScreen.style.display = 'block';
        }
        
        // Force set the title
        if (titleElement) {
            titleElement.textContent = firstScenario.title;
            titleElement.style.display = 'block';
            console.log('[EMERGENCY OVERRIDE] Set title to:', firstScenario.title);
        } else {
            console.error('[EMERGENCY OVERRIDE] No title element found!');
            
            // Try to insert a title anyway
            const questionSection = document.querySelector('.question-section');
            if (questionSection) {
                const newTitle = document.createElement('h2');
                newTitle.id = 'scenario-title';
                newTitle.textContent = firstScenario.title;
                questionSection.prepend(newTitle);
                console.log('[EMERGENCY OVERRIDE] Created new title element');
            }
        }
        
        // Force set the description
        if (descriptionElement) {
            descriptionElement.textContent = firstScenario.description;
            descriptionElement.style.display = 'block';
            console.log('[EMERGENCY OVERRIDE] Set description to:', firstScenario.description);
        } else {
            console.error('[EMERGENCY OVERRIDE] No description element found!');
            
            // Try to insert a description anyway
            const questionSection = document.querySelector('.question-section');
            if (questionSection) {
                const newDesc = document.createElement('p');
                newDesc.id = 'scenario-description';
                newDesc.textContent = firstScenario.description;
                if (titleElement) {
                    titleElement.after(newDesc);
                } else {
                    questionSection.appendChild(newDesc);
                }
                console.log('[EMERGENCY OVERRIDE] Created new description element');
            }
        }
        
        // Force set the options
        if (optionsContainer) {
            optionsContainer.innerHTML = ''; // Clear existing
            
            firstScenario.options.forEach((option, idx) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.innerHTML = `
                    <input type="radio"
                        name="option"
                        value="${idx}"
                        id="option${idx}"
                        tabindex="0"
                        aria-label="${option.text}"
                        role="radio">
                    <label for="option${idx}">${option.text}</label>
                `;
                optionsContainer.appendChild(optionDiv);
            });
            
            console.log('[EMERGENCY OVERRIDE] Set options');
        } else {
            console.error('[EMERGENCY OVERRIDE] No options container found!');
            
            // Try to find the form
            const optionsForm = document.getElementById('options-form');
            if (optionsForm) {
                const newOptionsContainer = document.createElement('div');
                newOptionsContainer.id = 'options-container';
                
                firstScenario.options.forEach((option, idx) => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    optionDiv.innerHTML = `
                        <input type="radio"
                            name="option"
                            value="${idx}"
                            id="option${idx}"
                            tabindex="0"
                            aria-label="${option.text}"
                            role="radio">
                        <label for="option${idx}">${option.text}</label>
                    `;
                    newOptionsContainer.appendChild(optionDiv);
                });
                
                optionsForm.prepend(newOptionsContainer);
                console.log('[EMERGENCY OVERRIDE] Created new options container');
            }
        }
        
        // Make sure submit button is visible
        const submitButton = document.getElementById('submit-btn');
        if (submitButton) {
            submitButton.style.display = 'block';
        }
        
        // Make sure progress is showing
        document.querySelectorAll('.quiz-header-progress, #level-indicator, #question-progress').forEach(el => {
            if (el) el.style.display = 'block';
        });
        
        console.log('[EMERGENCY OVERRIDE] Force display complete!');
    } catch (error) {
        console.error('[EMERGENCY OVERRIDE] Error forcing scenario display:', error);
    }
} 