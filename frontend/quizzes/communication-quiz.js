import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';
import { communicationScenarios } from '../data/communication-scenarios.js';
import quizSyncService from '../services/quiz-sync-service.js';

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
        this.basicScenarios = communicationScenarios.basic;
        this.intermediateScenarios = communicationScenarios.intermediate;
        this.advancedScenarios = communicationScenarios.advanced;

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
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
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

    async saveProgress() {
        // First determine the status based on clear conditions
        let status = 'in-progress';
        
        // Check for completion (all 15 questions answered)
        if (this.player.questionHistory.length >= 15) {
            // Calculate pass/fail based on correct answers
            const correctAnswers = this.player.questionHistory.filter(q => 
                q.selectedAnswer && (q.selectedAnswer.isCorrect || 
                q.selectedAnswer.experience === Math.max(...q.scenario.options.map(o => o.experience || 0)))
            ).length;
            const scorePercentage = Math.round((correctAnswers / 15) * 100);
            status = scorePercentage >= 70 ? 'passed' : 'failed';
        }

        const progressData = {
            experience: this.player.experience,
            tools: this.player.tools,
            currentScenario: this.player.currentScenario,
            questionHistory: this.player.questionHistory,
            lastUpdated: new Date().toISOString(),
            questionsAnswered: this.player.questionHistory.length,
            status: status,
            scorePercentage: this.calculateScorePercentage()
        };

        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot save progress');
                return false;
            }
            
            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify({ data: progressData }));
            
            // Add to sync queue for reliable API saving
            quizSyncService.addToSyncQueue(username, this.quizName, progressData);
            
            return true;
        } catch (error) {
            console.error('[CommunicationQuiz] Failed to save progress:', error);
            return false;
        }
    }

    async loadProgress() {
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('[CommunicationQuiz] No user found, cannot load progress');
                return false;
            }

            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            let progressData = null;
            
            // Try to get progress from API first
            try {
                console.log('[CommunicationQuiz] Attempting to load progress from API');
                const apiProgress = await this.apiService.getQuizProgress(this.quizName);
                
                if (apiProgress && apiProgress.data) {
                    console.log('[CommunicationQuiz] Successfully loaded progress from API');
                    progressData = apiProgress.data;
                    
                    // Also update localStorage with the latest data
                    localStorage.setItem(storageKey, JSON.stringify({ data: progressData }));
                }
            } catch (apiError) {
                console.warn('[CommunicationQuiz] Failed to load progress from API:', apiError);
            }
            
            // If API failed, try localStorage
            if (!progressData) {
                console.log('[CommunicationQuiz] Trying to load progress from localStorage');
                const localData = localStorage.getItem(storageKey);
                
                if (localData) {
                    try {
                        const parsed = JSON.parse(localData);
                        progressData = parsed.data || parsed;
                        console.log('[CommunicationQuiz] Successfully loaded progress from localStorage');
                    } catch (parseError) {
                        console.error('[CommunicationQuiz] Failed to parse localStorage data:', parseError);
                    }
                }
            }

            if (progressData) {
                console.log('[CommunicationQuiz] Processing loaded progress data');
                
                // Sanitize and validate data
                progressData.experience = progressData.experience || 0;
                progressData.tools = Array.isArray(progressData.tools) ? progressData.tools : [];
                progressData.questionHistory = Array.isArray(progressData.questionHistory) ? 
                    progressData.questionHistory : [];
                
                // Ensure currentScenario matches question history length for consistency
                if (progressData.questionHistory.length > 0) {
                    // Set currentScenario to the next unanswered question
                    progressData.currentScenario = progressData.questionHistory.length;
                } else {
                    // If no questions answered, start from the beginning
                    progressData.currentScenario = 0;
                }
                
                // Fix inconsistent state: if quiz is marked as completed but has no progress
                if ((progressData.status === 'completed' || 
                     progressData.status === 'passed' || 
                     progressData.status === 'failed') && 
                    (progressData.questionHistory.length === 0 || 
                     progressData.currentScenario === 0)) {
                    progressData.status = 'in-progress';
                }

                // Update the player state
                this.player.experience = progressData.experience;
                this.player.tools = progressData.tools;
                this.player.questionHistory = progressData.questionHistory;
                this.player.currentScenario = progressData.currentScenario;
                
                console.log('[CommunicationQuiz] Player state updated:', {
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory.length,
                    currentScenario: this.player.currentScenario,
                    status: progressData.status
                });
                
                // Only show end screen if quiz is actually completed and has progress
                if ((progressData.status === 'completed' || 
                     progressData.status === 'passed' || 
                     progressData.status === 'failed') && 
                    progressData.questionHistory.length > 0 && 
                    progressData.currentScenario > 0) {
                    console.log(`[CommunicationQuiz] Quiz is ${progressData.status} with ${progressData.questionHistory.length} questions answered`);
                    this.endGame(progressData.status === 'failed');
                    return true;
                }

                // If data was loaded from localStorage and differs from API, save it back
                // to ensure consistency with our sanitized values
                this.saveProgress();
                
                // Show the current question based on progress
                this.displayScenario();
                return true;
            }
            
            console.log('[CommunicationQuiz] No existing progress found');
            return false;
        } catch (error) {
            console.error('[CommunicationQuiz] Error loading progress:', error);
            return false;
        }
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

            // Load previous progress
            const hasProgress = await this.loadProgress();
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

        // Check if we've answered all questions
        if (currentScenarioIndex >= totalQuestions) {
            console.log('[displayScenario] All questions answered, ending game');
            this.endGame(false);
            return;
        }

        // Determine level and scenario set
        let scenario;
        let scenarioSet;
        let scenarioLevel;
        if (currentScenarioIndex < 5) {
            scenarioSet = this.basicScenarios;
            scenario = scenarioSet[currentScenarioIndex];
            scenarioLevel = 'Basic';
        } else if (currentScenarioIndex < 10) {
            scenarioSet = this.intermediateScenarios;
            scenario = scenarioSet[currentScenarioIndex - 5];
            scenarioLevel = 'Intermediate';
        } else if (currentScenarioIndex < 15) {
            scenarioSet = this.advancedScenarios;
            scenario = scenarioSet[currentScenarioIndex - 10];
            scenarioLevel = 'Advanced';
        }

        if (!scenario) {
            console.error('[displayScenario] No scenario found for currentScenario:', currentScenarioIndex);
            this.endGame(true);
            return;
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
            console.error('[displayScenario] Required elements not found');
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
        console.log('[displayScenario] Showing scenario', scenarioLevel, 'index', currentScenarioIndex, scenario.title);

        // Add extra log after showing
        setTimeout(() => {
            console.log('[displayScenario][post-show] player:', JSON.parse(JSON.stringify(this.player)));
        }, 0);
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

            // Save progress
            await this.saveProgress();

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

                // Save to API with proper structure
                const apiProgress = {
                    data: {
                        ...result,
                        tools: this.player.tools,
                        currentScenario: this.player.currentScenario
                    }
                };

                // Save directly via API to ensure status is updated
                console.log('Saving final progress to API:', apiProgress);
                await this.apiService.saveQuizProgress(this.quizName, apiProgress.data);
                
                // Clear any local storage for this quiz
                this.clearQuizLocalStorage(username, this.quizName);
                
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
            console.log('[CommunicationQuiz] Using cached scenarios');
            const data = JSON.parse(cachedData);
            this.basicScenarios = data.basic || communicationScenarios.basic;
            this.intermediateScenarios = data.intermediate || communicationScenarios.intermediate;
            this.advancedScenarios = data.advanced || communicationScenarios.advanced;
            return;
        }
        
        // If no valid cache, try to fetch from API
        try {
            console.log('[CommunicationQuiz] Fetching scenarios from API');
            const data = await this.apiService.getQuizScenarios(this.quizName);
            
            if (data && data.scenarios) {
                // Cache the result
                localStorage.setItem(`quiz_scenarios_${this.quizName}`, JSON.stringify(data.scenarios));
                localStorage.setItem(`quiz_scenarios_${this.quizName}_timestamp`, Date.now().toString());
                
                // Update scenarios
                this.basicScenarios = data.scenarios.basic || communicationScenarios.basic;
                this.intermediateScenarios = data.scenarios.intermediate || communicationScenarios.intermediate;
                this.advancedScenarios = data.scenarios.advanced || communicationScenarios.advanced;
            }
        } catch (error) {
            console.error('[CommunicationQuiz] Failed to load scenarios from API:', error);
            console.log('[CommunicationQuiz] Falling back to default scenarios');
            // Already loaded default scenarios in constructor
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
}); 