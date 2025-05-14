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
        
        // EMERGENCY FIX: Try to load progress directly in the constructor
        const username = localStorage.getItem('username');
        if (username) {
            // Try to find progress in localStorage
            const possibleKeys = [
                `quiz_progress_${username}_${this.quizName}`,
                `strict_quiz_progress_${username}_${this.quizName}`,
                `quiz_progress_${this.quizName}_${username}`,
                `${this.quizName}_quiz_progress_${username}`
            ];
            
            let loadedData = null;
            let foundKey = null;
            
            for (const key of possibleKeys) {
                const data = localStorage.getItem(key);
                if (data) {
                    try {
                        loadedData = JSON.parse(data);
                        foundKey = key;
                        console.log(`[EMERGENCY] Found quiz progress in key: ${key}`);
                        break;
                    } catch (e) {
                        console.error(`[EMERGENCY] Error parsing data from ${key}:`, e);
                    }
                }
            }
            
            if (loadedData && loadedData.questionHistory && loadedData.questionHistory.length > 0) {
                console.log(`[EMERGENCY] Directly setting progress from ${foundKey}`);
                this.player.questionHistory = loadedData.questionHistory;
                this.player.currentScenario = loadedData.questionHistory.length;
                this.player.experience = loadedData.experience || 0;
                
                // Log what we've set
                console.log('[EMERGENCY] Player state set in constructor:', {
                    currentScenario: this.player.currentScenario,
                    questionHistory: this.player.questionHistory.length,
                    experience: this.player.experience
                });
            }
        }
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

            // Check the localStorage directly to debug progress retention issues
            const username = this.player.name;
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            const rawSavedData = localStorage.getItem(storageKey);
            
            if (rawSavedData) {
                try {
                    const savedData = JSON.parse(rawSavedData);
                    console.log('[CommunicationQuiz] Found direct localStorage data:', {
                        key: storageKey,
                        currentScenario: savedData.currentScenario,
                        questionHistoryLength: savedData.questionHistory?.length,
                        status: savedData.status
                    });
                } catch (e) {
                    console.error('[CommunicationQuiz] Error parsing saved data:', e);
                }
            } else {
                console.log('[CommunicationQuiz] No direct progress found in localStorage with key:', storageKey);
                
                // Check alternative keys
                const altKeys = [
                    `strict_quiz_progress_${username}_${this.quizName}`,
                    `quiz_progress_${this.quizName}_${username}`,
                    `${this.quizName}_quiz_progress_${username}`
                ];
                
                for (const key of altKeys) {
                    const altData = localStorage.getItem(key);
                    if (altData) {
                        console.log(`[CommunicationQuiz] Found progress in alternate key: ${key}`);
                        break;
                    }
                }
            }

            // Try to load scenarios from API with caching
            const scenariosLoaded = await this.loadScenariosWithCaching();
            if (!scenariosLoaded) {
                console.error('[CommunicationQuiz] Failed to load scenarios');
                this.showError('Failed to load quiz content. Please refresh the page and try again.');
                return;
            }

            // Debug check scenarios
            console.log('[CommunicationQuiz] Scenarios loaded successfully:', {
                basic: this.basicScenarios?.length || 0,
                intermediate: this.intermediateScenarios?.length || 0,
                advanced: this.advancedScenarios?.length || 0
            });

            // Load previous progress using our own implementation
            const hasProgress = await this.loadProgress();  // Use this.loadProgress, not super.loadProgress
            console.log('[CommunicationQuiz] Previous progress loaded:', hasProgress);
            
            if (!hasProgress) {
                // Reset player state if no valid progress exists
                this.player.experience = 0;
                this.player.tools = [];
                this.player.currentScenario = 0;
                this.player.questionHistory = [];
                console.log('[CommunicationQuiz] No previous progress, starting fresh');
            } else {
                // Verify the loaded progress contains valid question history
                if (!this.player.questionHistory || !Array.isArray(this.player.questionHistory)) {
                    console.log('[CommunicationQuiz] Invalid question history in loaded progress, resetting');
                    this.player.questionHistory = [];
                }
                
                // CRITICAL: Ensure currentScenario is set correctly based on question history
                this.player.currentScenario = this.player.questionHistory.length;
                console.log('[CommunicationQuiz] Set currentScenario to match question history:', this.player.currentScenario);
                
                console.log('[CommunicationQuiz] Loaded player state:', {
                    currentScenario: this.player.currentScenario,
                    questionsAnswered: this.player.questionHistory.length,
                    experience: this.player.experience
                });
            }
            
            // Clear any existing transition messages
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = '';
                transitionContainer.classList.remove('active');
            }
            
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
            
            // EMERGENCY CHECK: Ensure we are at the correct question before displaying
            const currentUsername = localStorage.getItem('username');
            if (currentUsername) {
                const progressKey = `quiz_progress_${currentUsername}_${this.quizName}`;
                const progressData = localStorage.getItem(progressKey);
                
                if (progressData) {
                    try {
                        const parsed = JSON.parse(progressData);
                        if (parsed.questionHistory && 
                            Array.isArray(parsed.questionHistory) && 
                            parsed.questionHistory.length > 0 &&
                            this.player.questionHistory.length < parsed.questionHistory.length) {
                            
                            console.log('[CRITICAL FIX] Progress mismatch detected, fixing:', {
                                currentLength: this.player.questionHistory.length,
                                savedLength: parsed.questionHistory.length
                            });
                            
                            // Force the correct progress
                            this.player.questionHistory = parsed.questionHistory;
                            this.player.currentScenario = parsed.questionHistory.length;
                        }
                    } catch (e) {
                        console.error('[CommunicationQuiz] Error checking progress in startGame:', e);
                    }
                }
            }
            
            // CRITICAL: Always display scenario after loading, regardless of progress state
            this.displayScenario();
            
            // Setup periodic save to ensure progress is never lost
            this._setupPeriodicSave();
            
            this.isLoading = false;
            
            return true;
        } catch (error) {
            console.error('[CommunicationQuiz] Error starting game:', error);
            
            this.isLoading = false;
            this.showError('Failed to start the quiz. Please refresh the page and try again.');
            
            // Try emergency display to show something to the user
            setTimeout(() => {
                forceScenarioDisplay();
            }, 1000);
            
            return false;
        }
    }

    // Helper method to setup periodic saves
    _setupPeriodicSave() {
        // Clear any existing interval
        if (this._saveInterval) {
            clearInterval(this._saveInterval);
        }
        
        // Setup a new interval to save progress every 30 seconds
        this._saveInterval = setInterval(() => {
            if (this.player && this.player.questionHistory && this.player.questionHistory.length > 0) {
                this.saveProgress('in-progress').catch(err => {
                    console.warn('[CommunicationQuiz] Periodic save failed:', err);
                });
            }
        }, 30000); // 30 seconds
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
        // Log the player state at the start of displayScenario for debugging
        console.log('[CommunicationQuiz] displayScenario called with player state:', {
            currentScenario: this.player.currentScenario,
            questionHistoryLength: this.player.questionHistory?.length || 0,
            experience: this.player.experience
        });
        
        // Double-check the currentScenario value always matches question history
        if (this.player.currentScenario !== this.player.questionHistory.length) {
            console.log('[CommunicationQuiz] Fixing mismatch: currentScenario vs questionHistory.length', {
                before: this.player.currentScenario,
                after: this.player.questionHistory.length
            });
            this.player.currentScenario = this.player.questionHistory.length;
        }
        
        // Check if we've answered all 15 questions
        if (this.player.questionHistory.length >= 15) {
            console.log('[CommunicationQuiz] All 15 questions answered, ending game');
            this.endGame(false);
            return;
        }

        // Get the correct scenario based on current progress
        let scenario;
        const questionCount = this.player.questionHistory.length;
        let scenarioIndex;
        let scenarioLevel;
        
        console.log('[CommunicationQuiz] Selecting scenario based on question count:', questionCount);
        
        // Make sure we're using the correct set of scenarios based on progress
        if (questionCount < 5) {
            // Basic questions (0-4)
            scenarioIndex = questionCount;
            scenarioLevel = 'Basic';
            scenario = this.basicScenarios && this.basicScenarios.length > scenarioIndex ? 
                this.basicScenarios[scenarioIndex] : null;
            console.log('[CommunicationQuiz] Trying to use Basic scenario:', { 
                index: scenarioIndex, 
                totalBasicScenarios: this.basicScenarios?.length || 0,
                scenarioFound: !!scenario
            });
        } else if (questionCount < 10) {
            // Intermediate questions (5-9)
            scenarioIndex = questionCount - 5;
            scenarioLevel = 'Intermediate';
            scenario = this.intermediateScenarios && this.intermediateScenarios.length > scenarioIndex ? 
                this.intermediateScenarios[scenarioIndex] : null;
            console.log('[CommunicationQuiz] Trying to use Intermediate scenario:', { 
                index: scenarioIndex, 
                totalIntermediateScenarios: this.intermediateScenarios?.length || 0,
                scenarioFound: !!scenario
            });
        } else if (questionCount < 15) {
            // Advanced questions (10-14)
            scenarioIndex = questionCount - 10;
            scenarioLevel = 'Advanced';
            scenario = this.advancedScenarios && this.advancedScenarios.length > scenarioIndex ? 
                this.advancedScenarios[scenarioIndex] : null;
            console.log('[CommunicationQuiz] Trying to use Advanced scenario:', { 
                index: scenarioIndex, 
                totalAdvancedScenarios: this.advancedScenarios?.length || 0,
                scenarioFound: !!scenario
            });
        }

        // Verify we have a valid scenario
        if (!scenario) {
            console.error('[CommunicationQuiz] No scenario found for current progress. Question count:', questionCount);
            console.log('[CommunicationQuiz] Available scenarios:', {
                basic: this.basicScenarios?.length || 0,
                intermediate: this.intermediateScenarios?.length || 0,
                advanced: this.advancedScenarios?.length || 0
            });
                
            // Try full scan for any usable scenario
            let foundAnyScenario = false;
            
            // Try basic scenarios first
            if (this.basicScenarios && this.basicScenarios.length > 0) {
                scenario = this.basicScenarios[0];
                scenarioLevel = 'Basic';
                scenarioIndex = 0;
                foundAnyScenario = true;
                console.log('[CommunicationQuiz] Using first basic scenario as fallback');
            } 
            // Then try intermediate
            else if (this.intermediateScenarios && this.intermediateScenarios.length > 0) {
                scenario = this.intermediateScenarios[0];
                scenarioLevel = 'Intermediate';
                scenarioIndex = 0;
                foundAnyScenario = true;
                console.log('[CommunicationQuiz] Using first intermediate scenario as fallback');
            } 
            // Finally try advanced
            else if (this.advancedScenarios && this.advancedScenarios.length > 0) {
                scenario = this.advancedScenarios[0];
                scenarioLevel = 'Advanced';
                scenarioIndex = 0;
                foundAnyScenario = true;
                console.log('[CommunicationQuiz] Using first advanced scenario as fallback');
            }
                
            if (!foundAnyScenario) {
                // If no scenarios are available, create an emergency scenario
                console.error('[CommunicationQuiz] No scenarios found in any level, creating emergency scenario');
                scenario = {
                    id: 999,
                    level: 'Basic',
                    title: 'Emergency Scenario',
                    description: 'The quiz system is having difficulty loading scenarios. Please answer this question to continue.',
                    options: [
                        {
                            text: 'In a critical situation, providing clear and concise updates is most important',
                            outcome: 'Good choice! Clear communication is essential in critical situations.',
                            experience: 15,
                            isCorrect: true
                        },
                        {
                            text: 'Waiting for others to make decisions is the best approach in uncertain situations',
                            outcome: 'Taking initiative is usually better than waiting for directions.',
                            experience: 0
                        },
                        {
                            text: 'Detailed technical explanations are always the best way to communicate issues',
                            outcome: 'Communication should be adapted to the audience.',
                            experience: 0
                        },
                        {
                            text: 'It\'s better to delay communication until you have complete information',
                            outcome: 'Timely updates are often more valuable than perfect information.',
                            experience: 0
                        }
                    ]
                };
                scenarioLevel = 'Basic';
                scenarioIndex = 0;
                
                // Don't reset progress in emergency mode, just provide a way forward
                console.log('[CommunicationQuiz] Created emergency scenario to allow continuing');
            }
        }
        
        console.log('[CommunicationQuiz] Found scenario to display:', {
            title: scenario.title,
            level: scenarioLevel,
            index: scenarioIndex
        });

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
            console.error('[CommunicationQuiz] Required elements not found, using emergency DOM creation');
            // If elements don't exist, try creating them
            forceScenarioDisplay();
            return;
        }

        // Set the title and description
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

        // Clear and rebuild the options container
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

        // Update progress indicators
        this.updateProgress();

        // Re-attach submit button handler just in case
        if (submitButton && !submitButton._handlerAttached) {
            submitButton.addEventListener('click', () => this.handleAnswer());
            submitButton._handlerAttached = true;
        }
        
        // Initialize timer for the new question
        this.initializeTimer();

        // Save progress after displaying - ensures we're in a consistent state
        if (this.player.questionHistory.length > 0) {
            // Only save if we have actual progress to avoid recursive saves
            this.saveProgress('in-progress').catch(err => {
                console.warn('[CommunicationQuiz] Save after display failed:', err);
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

            // Save progress using our own implementation instead of super
            await this.saveProgress();
            console.log('[CommunicationQuiz] Progress saved after answer with history length:', this.player.questionHistory.length);

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
        
        try {
            // Check that the imported scenarios are properly structured
            if (!communicationScenarios) {
                console.error('[CommunicationQuiz] communicationScenarios not found - module may not be properly imported');
                throw new Error('Scenarios not found');
            }
            
            console.log('[CommunicationQuiz] Checking scenarios structure:', {
                basicType: typeof communicationScenarios.basic,
                isBasicArray: Array.isArray(communicationScenarios.basic),
                intermediateType: typeof communicationScenarios.intermediate,
                isIntermediateArray: Array.isArray(communicationScenarios.intermediate),
                advancedType: typeof communicationScenarios.advanced,
                isAdvancedArray: Array.isArray(communicationScenarios.advanced)
            });
            
            // Helper function to extract scenarios from different possible structures
            const extractScenarios = (data, level) => {
                if (Array.isArray(data)) {
                    return data; // Already an array
                }
                
                if (data && typeof data === 'object') {
                    // Try common patterns: 
                    // 1. { scenarios: [] }
                    // 2. { data: [] }
                    // 3. { questions: [] }
                    
                    if (Array.isArray(data.scenarios)) {
                        console.log(`[CommunicationQuiz] Found ${level} scenarios in .scenarios property`);
                        return data.scenarios;
                    }
                    
                    if (Array.isArray(data.data)) {
                        console.log(`[CommunicationQuiz] Found ${level} scenarios in .data property`);
                        return data.data;
                    }
                    
                    if (Array.isArray(data.questions)) {
                        console.log(`[CommunicationQuiz] Found ${level} scenarios in .questions property`);
                        return data.questions;
                    }
                    
                    // Look for any array property that might contain scenarios
                    for (const key in data) {
                        if (Array.isArray(data[key]) && data[key].length > 0 && 
                            data[key][0] && typeof data[key][0] === 'object' &&
                            (data[key][0].title || data[key][0].description || data[key][0].options)) {
                            console.log(`[CommunicationQuiz] Found ${level} scenarios in .${key} property`);
                            return data[key];
                        }
                    }
                }
                
                // Return empty array if nothing found
                console.error(`[CommunicationQuiz] Could not find ${level} scenarios in any expected format`);
                return [];
            };
            
            // Extract scenarios for each level
            this.basicScenarios = extractScenarios(communicationScenarios.basic, 'basic');
            this.intermediateScenarios = extractScenarios(communicationScenarios.intermediate, 'intermediate');
            this.advancedScenarios = extractScenarios(communicationScenarios.advanced, 'advanced');
            
            // Log what we've loaded
            console.log('[CommunicationQuiz] Scenarios loaded from imported file:', {
                basic: this.basicScenarios?.length || 0,
                intermediate: this.intermediateScenarios?.length || 0,
                advanced: this.advancedScenarios?.length || 0
            });
            
            // If basic scenarios are missing, try to use emergency hard-coded scenarios
            if (!this.basicScenarios || this.basicScenarios.length === 0) {
                console.error('[CommunicationQuiz] No basic scenarios found, creating emergency scenarios');
                
                // Create at least one emergency scenario
                this.basicScenarios = [{
                    id: 999,
                    level: 'Basic',
                    title: 'Emergency Communication Scenario',
                    description: 'What is the best approach when communicating critical issues to stakeholders?',
                    options: [
                        {
                            text: 'Communicate promptly with clear information about impact, cause, and resolution timeline',
                            outcome: 'Excellent! Timely and clear communication builds trust and helps manage expectations.',
                            experience: 15,
                            isCorrect: true
                        },
                        {
                            text: 'Wait until you have complete information before communicating',
                            outcome: 'Timely updates are often more valuable than perfect information.',
                            experience: 0
                        },
                        {
                            text: 'Use technical jargon to ensure precision in your explanation',
                            outcome: 'Communication should be adapted to the audience.',
                            experience: 0
                        },
                        {
                            text: 'Only communicate about critical issues in scheduled meetings',
                            outcome: 'Critical issues should be communicated promptly, not delayed for meetings.',
                            experience: 0
                        }
                    ]
                }];
            }
            
            // Try to fetch from API (for future updates, but default to the imported scenarios)
            try {
                const data = await this.apiService.getQuizScenarios(this.quizName);
                if (data && data.basic && Array.isArray(data.basic) && data.basic.length > 0) {
                    this.basicScenarios = data.basic;
                    this.intermediateScenarios = data.intermediate;
                    this.advancedScenarios = data.advanced;
                    console.log('[CommunicationQuiz] Updated scenarios from API');
                }
            } catch (apiError) {
                console.log('[CommunicationQuiz] Using default imported scenarios, API fetch failed:', apiError.message);
            }
            
            // Final logging of what we'll be using
            console.log('[CommunicationQuiz] Final scenario counts:', {
                basic: this.basicScenarios?.length || 0,
                intermediate: this.intermediateScenarios?.length || 0,
                advanced: this.advancedScenarios?.length || 0
            });
            
            // Log first scenario of each level for debugging
            if (this.basicScenarios?.length > 0) {
                console.log('[CommunicationQuiz] First basic scenario title:', this.basicScenarios[0]?.title);
            }
            if (this.intermediateScenarios?.length > 0) {
                console.log('[CommunicationQuiz] First intermediate scenario title:', this.intermediateScenarios[0]?.title);
            }
            if (this.advancedScenarios?.length > 0) {
                console.log('[CommunicationQuiz] First advanced scenario title:', this.advancedScenarios[0]?.title);
            }
            
            return true;
        } catch (error) {
            console.error('[CommunicationQuiz] Failed to load scenarios:', error);
            this.showError('Failed to load quiz content. Please refresh the page and try again.');
            return false;
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

    // Override saveProgress to ensure state is consistently saved
    async saveProgress(status = null) {
        try {
            console.log('[CommunicationQuiz] Saving progress with status:', status);
            
            // First try using parent implementation
            await super.saveProgress(status);
            
            // Then do our own direct save as backup
            const username = localStorage.getItem('username');
            if (!username) {
                console.warn('[CommunicationQuiz] Cannot save progress without username');
                return;
            }
            
            // Create progress data object
            const progressData = {
                experience: this.player.experience,
                tools: this.player.tools,
                questionHistory: this.player.questionHistory,
                currentScenario: this.player.questionHistory.length, // Always use question history length
                lastUpdated: new Date().toISOString(),
                status: status || 'in-progress'
            };
            
            // Use consistent storage key format
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            
            // Save to localStorage
            localStorage.setItem(storageKey, JSON.stringify(progressData));
            
            console.log(`[CommunicationQuiz] Saved progress to ${storageKey}:`, {
                experience: progressData.experience,
                questionHistoryLength: progressData.questionHistory.length,
                currentScenario: progressData.currentScenario
            });
            
            // Save to QuizUser API if available
            try {
                if (typeof QuizUser !== 'undefined') {
                    const user = new QuizUser(username);
                    
                    // Calculate score based on correct answers
                    const score = this.calculateScorePercentage();
                    
                    // Use updateQuizScore which is the correct method, not updateQuizProgress
                    await user.updateQuizScore(
                        this.quizName,
                        score, // score
                        this.player.experience, // experience
                        this.player.tools, // tools
                        this.player.questionHistory, // questionHistory
                        this.player.questionHistory.length, // questionsAnswered
                        progressData.status // status
                    );
                    
                    console.log('[CommunicationQuiz] Saved progress to QuizUser API');
                }
            } catch (apiError) {
                console.error('[CommunicationQuiz] Error saving to QuizUser API:', apiError);
                // Continue execution - localStorage save is our backup
            }
        } catch (error) {
            console.error('[CommunicationQuiz] Error saving progress:', error);
        }
    }

    // Override loadProgress to ensure it correctly loads saved progress
    async loadProgress() {
        console.log('[CommunicationQuiz] Loading progress...');
        
        try {
            // First try to load progress using the BaseQuiz implementation
            const hasProgress = await super.loadProgress();
            console.log('[CommunicationQuiz] Parent loadProgress result:', hasProgress);
            
            // Log what was loaded by the parent class
            console.log('[CommunicationQuiz] Player state after parent loadProgress:', {
                currentScenario: this.player.currentScenario,
                questionHistoryLength: this.player.questionHistory?.length || 0,
                experience: this.player.experience
            });
            
            // If parent class loaded valid data, ensure it's properly structured
            if (hasProgress && this.player.questionHistory && this.player.questionHistory.length > 0) {
                // Make sure currentScenario matches the question history length
                this.player.currentScenario = this.player.questionHistory.length;
                
                console.log('[CommunicationQuiz] Successfully loaded progress from BaseQuiz:', {
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory.length,
                    currentScenario: this.player.currentScenario
                });
                
                return true;
            }
            
            // If BaseQuiz loading failed, try our own localStorage fallback
            console.log('[CommunicationQuiz] No valid progress from parent method, trying direct localStorage');
            const username = localStorage.getItem('username');
            if (!username) {
                console.log('[CommunicationQuiz] No username found in localStorage');
                return false;
            }
            
            // Try multiple possible localStorage key formats
            const possibleKeys = [
                `strict_quiz_progress_${username}_${this.quizName}`,  // Try strict key first
                `quiz_progress_${username}_${this.quizName}`,
                `quiz_progress_${this.quizName}_${username}`,
                `${this.quizName}_quiz_progress_${username}`,
                `quiz_progress_${this.quizName}`
            ];
            
            let loadedData = null;
            let successKey = null;
            
            for (const key of possibleKeys) {
                const savedData = localStorage.getItem(key);
                if (savedData) {
                    try {
                        const parsed = JSON.parse(savedData);
                        console.log(`[CommunicationQuiz] Found progress in ${key}:`, parsed);
                        
                        // Check for various possible data structures
                        // First check for direct access to questionHistory
                        if (parsed && Array.isArray(parsed.questionHistory) && parsed.questionHistory.length > 0) {
                            loadedData = parsed;
                            successKey = key;
                            console.log(`[CommunicationQuiz] Found direct questionHistory in ${key}`);
                            break;
                        }
                        
                        // Then check for data.questionHistory
                        if (parsed.data && Array.isArray(parsed.data.questionHistory) && parsed.data.questionHistory.length > 0) {
                            loadedData = parsed.data;
                            successKey = key;
                            console.log(`[CommunicationQuiz] Found questionHistory in parsed.data of ${key}`);
                            break;
                        }
                        
                        // Finally check for API response data format
                        if (parsed.data && parsed.data.progress && Array.isArray(parsed.data.progress.questionHistory) && 
                            parsed.data.progress.questionHistory.length > 0) {
                            loadedData = parsed.data.progress;
                            successKey = key;
                            console.log(`[CommunicationQuiz] Found questionHistory in parsed.data.progress of ${key}`);
                            break;
                        }
                        
                        // If not a clear match but has some data, keep it as a backup
                        if (!loadedData && parsed && (
                            typeof parsed.experience === 'number' || 
                            typeof parsed.currentScenario === 'number' ||
                            (parsed.data && typeof parsed.data.experience === 'number')
                        )) {
                            loadedData = parsed.data || parsed;
                            successKey = key;
                            console.log(`[CommunicationQuiz] Found partial progress data in ${key}`);
                            // Don't break here, keep checking for better matches
                        }
                    } catch (e) {
                        console.error(`[CommunicationQuiz] Error parsing data from ${key}:`, e);
                    }
                }
            }
            
            if (loadedData) {
                // Apply the loaded data to our player state
                this.player.experience = typeof loadedData.experience === 'number' ? loadedData.experience : 0;
                this.player.tools = Array.isArray(loadedData.tools) ? loadedData.tools : [];
                
                // Set question history properly with careful handling of potential formats
                if (Array.isArray(loadedData.questionHistory)) {
                    // Validate each question history entry
                    const validatedHistory = loadedData.questionHistory.filter(item => 
                        item && (item.scenario || item.scenarioId) && (item.selectedAnswer || item.selectedOption)
                    );
                    
                    if (validatedHistory.length > 0) {
                        this.player.questionHistory = validatedHistory;
                        console.log(`[CommunicationQuiz] Loaded ${validatedHistory.length} valid question history entries`);
                    } else {
                        this.player.questionHistory = [];
                        console.log('[CommunicationQuiz] Question history was invalid, using empty array');
                    }
                } else {
                    this.player.questionHistory = [];
                    console.log('[CommunicationQuiz] No question history found, using empty array');
                }
                
                // CRITICAL: Always set currentScenario based on question history length
                this.player.currentScenario = this.player.questionHistory.length;
                
                console.log(`[CommunicationQuiz] Successfully loaded progress from ${successKey}:`, {
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory.length,
                    currentScenario: this.player.currentScenario
                });
                
                // Immediately save this properly structured data back to ensure consistency
                await this.saveProgress('in-progress');
                console.log('[CommunicationQuiz] Resaved loaded progress for consistency');
                
                return true;
            }
            
            // No progress found
            console.log('[CommunicationQuiz] No progress found in localStorage');
            return false;
        } catch (error) {
            console.error('[CommunicationQuiz] Error loading progress:', error);
            
            // Reset to default state on error
            this.player.questionHistory = [];
            this.player.currentScenario = 0;
            this.player.experience = 0;
            this.player.tools = [];
            
            return false;
        }
    }
}

// Singleton instance for CommunicationQuiz
let communicationQuizInstance = null;

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[CommunicationQuiz] DOM loaded, initializing quiz...');
    
    try {
        // Add an emergency override timer to force displaying the correct question
        // This will run regardless of other initialization code
        setTimeout(() => {
            console.log('[EMERGENCY OVERRIDE] Running emergency progress check');
            
            // Check for saved progress directly
            const username = localStorage.getItem('username');
            if (!username) return;
            
            const storageKey = `quiz_progress_${username}_communication`;
            const savedData = localStorage.getItem(storageKey);
            
            if (savedData) {
                try {
                    const progressData = JSON.parse(savedData);
                    if (progressData && progressData.questionHistory && progressData.questionHistory.length > 0) {
                        console.log('[EMERGENCY OVERRIDE] Found saved progress with question count:', progressData.questionHistory.length);
                        
                        // If we have a quiz instance, force it to the correct question
                        if (communicationQuizInstance) {
                            communicationQuizInstance.player.questionHistory = progressData.questionHistory;
                            communicationQuizInstance.player.currentScenario = progressData.questionHistory.length;
                            communicationQuizInstance.player.experience = progressData.experience || 0;
                            
                            console.log('[EMERGENCY OVERRIDE] Forcing displayScenario() with correct state');
                            communicationQuizInstance.displayScenario();
                        }
                    }
                } catch (e) {
                    console.error('[EMERGENCY OVERRIDE] Error in emergency progress override:', e);
                }
            }
        }, 2000); // Run 2 seconds after page load

        // Only allow one instance
        if (communicationQuizInstance) {
            console.log('[CommunicationQuiz] Instance already exists, not creating a new one.');
            return;
        }
        
        // Clear any existing instances from BaseQuiz registry
        if (typeof BaseQuiz !== 'undefined' && BaseQuiz.clearQuizInstances) {
            BaseQuiz.clearQuizInstances('communication');
        }
        
        // Create new instance
        communicationQuizInstance = new CommunicationQuiz();
        
        // CRITICAL: Run force correct question immediately to ensure proper progress
        setTimeout(() => {
            console.log('[CommunicationQuiz] Running force correct question immediately after creation');
            forceCorrectQuestionDisplay();
        }, 500);
        
        // Add storage event listener to detect changes from other tabs/windows
        window.addEventListener('storage', (event) => {
            // Check if the changed key relates to our quiz progress
            if (event.key && event.key.includes('quiz_progress') && event.key.includes('communication')) {
                console.log('[CommunicationQuiz] Detected localStorage change in quiz progress:', event.key);
                
                // Handle the change - reload progress or restart if needed
                if (communicationQuizInstance) {
                    // Only reload if we have an active instance
                    setTimeout(async () => {
                        try {
                            await communicationQuizInstance.loadProgress();
                            communicationQuizInstance.displayScenario();
                            console.log('[CommunicationQuiz] Reloaded progress after external change');
                        } catch (error) {
                            console.error('[CommunicationQuiz] Failed to reload progress after storage change:', error);
                        }
                    }, 500);
                }
            }
        });
        
        // Add visibility change listener to detect when user returns to the tab
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('[CommunicationQuiz] Page became visible, checking progress state');
                
                // Check if we have an active quiz instance
                if (communicationQuizInstance) {
                    // Log the current progress state
                    console.log('[CommunicationQuiz] Current progress state:', {
                        currentScenario: communicationQuizInstance.player.currentScenario,
                        questionHistoryLength: communicationQuizInstance.player.questionHistory?.length || 0,
                        experience: communicationQuizInstance.player.experience
                    });
                    
                    // Always ensure the current scenario is displayed when the page becomes visible
                    communicationQuizInstance.player.currentScenario = communicationQuizInstance.player.questionHistory.length;
                    communicationQuizInstance.displayScenario();
                    
                    // Also re-save progress to ensure consistency
                    communicationQuizInstance.saveProgress('in-progress').catch(err => {
                        console.error('[CommunicationQuiz] Error saving progress after visibility change:', err);
                    });
                }
            }
        });
        
        // Run diagnostics after a short delay to ensure DOM is fully loaded
        setTimeout(() => {
            diagnoseQuizDOM();
        }, 1000);
        
        // Start the game after diagnostics complete
        setTimeout(async () => {
            try {
                await communicationQuizInstance.startGame();
                console.log('[CommunicationQuiz] Quiz started successfully');
                
                // Ensure any debug buttons are properly initialized
                const debugButton = document.getElementById('debug-button');
                if (debugButton) {
                    debugButton.addEventListener('click', () => {
                        diagnoseQuizDOM();
                        setTimeout(() => {
                            forceScenarioDisplay();
                        }, 500);
                    });
                }
            } catch (e) {
                console.error('[CommunicationQuiz] Error starting quiz:', e);
                forceScenarioDisplay(); // Emergency fallback
            }
        }, 1500);
    } catch (error) {
        console.error('[CommunicationQuiz] Fatal error initializing quiz:', error);
        // Try to show something to the user
        setTimeout(() => {
            forceScenarioDisplay();
        }, 1000);
    }
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
        let firstScenario = null;
        
        if (communicationQuizInstance?.basicScenarios?.length > 0) {
            firstScenario = communicationQuizInstance.basicScenarios[0];
            console.log('[EMERGENCY OVERRIDE] Using quiz instance basic scenarios');
        } else if (communicationScenarios?.basic?.length > 0) {
            firstScenario = communicationScenarios.basic[0];
            console.log('[EMERGENCY OVERRIDE] Using imported module basic scenarios');
        } else if (communicationScenarios?.basic?.scenarios?.length > 0) {
            // Try alternate structure
            firstScenario = communicationScenarios.basic.scenarios[0];
            console.log('[EMERGENCY OVERRIDE] Using alternate structure for scenarios');
        }
        
        if (!firstScenario) {
            console.error('[EMERGENCY OVERRIDE] No scenario data found!');
            // Create a fallback scenario if we can't find one
            firstScenario = {
                id: 1,
                level: 'Basic',
                title: 'Emergency Scenario',
                description: 'This is an emergency fallback scenario. Please refresh the page and try again.',
                options: [
                    {
                        text: 'Restart the quiz',
                        outcome: 'The quiz will restart.',
                        experience: 0
                    },
                    {
                        text: 'Go back to the main page',
                        outcome: 'You will be redirected to the main page.',
                        experience: 0
                    },
                    {
                        text: 'Try again',
                        outcome: 'The quiz will restart.',
                        experience: 0
                    },
                    {
                        text: 'Contact support',
                        outcome: 'Please contact the support team for assistance.',
                        experience: 0
                    }
                ]
            };
            console.log('[EMERGENCY OVERRIDE] Created fallback scenario');
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
        } else {
            console.error('[EMERGENCY OVERRIDE] Game screen not found!');
            // Try to find any container we can use
            const quizContainer = document.querySelector('.quiz-container');
            if (quizContainer) {
                quizContainer.innerHTML = '<div id="game-screen" style="display:block;"></div>';
                console.log('[EMERGENCY OVERRIDE] Created new game screen');
            }
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
            } else {
                // If no question section, try to create everything from scratch
                const gameScreen = document.getElementById('game-screen') || document.querySelector('.quiz-container');
                if (gameScreen) {
                    const newQuestionSection = document.createElement('div');
                    newQuestionSection.className = 'question-section';
                    
                    const newTitle = document.createElement('h2');
                    newTitle.id = 'scenario-title';
                    newTitle.textContent = firstScenario.title;
                    
                    newQuestionSection.appendChild(newTitle);
                    gameScreen.appendChild(newQuestionSection);
                    console.log('[EMERGENCY OVERRIDE] Created new question section and title');
                }
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
                const existingTitle = questionSection.querySelector('#scenario-title');
                if (existingTitle) {
                    existingTitle.after(newDesc);
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
            } else {
                // If no options form, create one
                const questionSection = document.querySelector('.question-section');
                if (questionSection) {
                    const newForm = document.createElement('form');
                    newForm.id = 'options-form';
                    
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
                    
                    newForm.appendChild(newOptionsContainer);
                    
                    const submitBtn = document.createElement('button');
                    submitBtn.id = 'submit-btn';
                    submitBtn.className = 'submit-button';
                    submitBtn.textContent = 'Submit';
                    submitBtn.type = 'button';
                    newForm.appendChild(submitBtn);
                    
                    questionSection.appendChild(newForm);
                    console.log('[EMERGENCY OVERRIDE] Created new options form');
                }
            }
        }
        
        // Make sure submit button is visible
        const submitButton = document.getElementById('submit-btn');
        if (submitButton) {
            submitButton.style.display = 'block';
        } else {
            // Create a submit button if it doesn't exist
            const optionsForm = document.getElementById('options-form');
            if (optionsForm) {
                const newButton = document.createElement('button');
                newButton.id = 'submit-btn';
                newButton.className = 'submit-button';
                newButton.textContent = 'Submit';
                newButton.type = 'button';
                optionsForm.appendChild(newButton);
                console.log('[EMERGENCY OVERRIDE] Created new submit button');
            }
        }
        
        // Make sure progress is showing
        document.querySelectorAll('.quiz-header-progress, #level-indicator, #question-progress').forEach(el => {
            if (el) el.style.display = 'block';
        });
        
        console.log('[EMERGENCY OVERRIDE] Force display complete!');
        
        // Add an emergency click handler to the submit button
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                console.log('[EMERGENCY OVERRIDE] Submit button clicked, reloading page');
                window.location.reload();
            });
        }
    } catch (error) {
        console.error('[EMERGENCY OVERRIDE] Error forcing scenario display:', error);
        
        // Last resort - show a completely rebuilt interface
        try {
            const body = document.body;
            const errorDiv = document.createElement('div');
            errorDiv.style.padding = '20px';
            errorDiv.style.margin = '20px auto';
            errorDiv.style.maxWidth = '600px';
            errorDiv.style.border = '1px solid red';
            errorDiv.style.borderRadius = '5px';
            errorDiv.style.backgroundColor = '#fff4f4';
            errorDiv.style.textAlign = 'center';
            
            errorDiv.innerHTML = `
                <h2 style="color:red;">Quiz Error</h2>
                <p>There was a problem loading the Communication Quiz.</p>
                <p>Please try refreshing the page or return to the main menu.</p>
                <button onclick="window.location.reload()" style="padding:10px 20px; margin:10px; background:#3498db; color:white; border:none; border-radius:5px; cursor:pointer;">Refresh Page</button>
                <button onclick="window.location.href='/index.html'" style="padding:10px 20px; margin:10px; background:#2ecc71; color:white; border:none; border-radius:5px; cursor:pointer;">Return to Main Menu</button>
            `;
            
            // Clear body and add error div
            body.innerHTML = '';
            body.appendChild(errorDiv);
            console.log('[EMERGENCY OVERRIDE] Created emergency error interface');
        } catch (finalError) {
            console.error('[EMERGENCY OVERRIDE] Final fallback failed:', finalError);
        }
    }
}

// Function to forcefully ensure quiz starts at the correct question
function forceCorrectQuestionDisplay() {
    console.log('[FORCE QUESTION] Running forced question display check');
    
    if (!communicationQuizInstance) {
        console.log('[FORCE QUESTION] No quiz instance found');
        return;
    }
    
    // Try all possible keys to find saved progress
    const username = localStorage.getItem('username');
    if (!username) {
        console.log('[FORCE QUESTION] No username found in localStorage');
        return;
    }
    
    // Try all possible storage keys
    const possibleKeys = [
        `quiz_progress_${username}_communication`,
        `strict_quiz_progress_${username}_communication`,
        `quiz_progress_communication_${username}`,
        `communication_quiz_progress_${username}`,
        `quiz_progress_communication`
    ];
    
    let highestQuestionCount = 0;
    let bestProgressData = null;
    
    // Check all keys and find the one with the most progress
    for (const key of possibleKeys) {
        const savedData = localStorage.getItem(key);
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                if (parsedData && parsedData.questionHistory && 
                    Array.isArray(parsedData.questionHistory) && 
                    parsedData.questionHistory.length > highestQuestionCount) {
                    
                    highestQuestionCount = parsedData.questionHistory.length;
                    bestProgressData = parsedData;
                    console.log(`[FORCE QUESTION] Found better progress in key ${key} with ${highestQuestionCount} questions`);
                }
            } catch (e) {
                console.error(`[FORCE QUESTION] Error parsing data from ${key}:`, e);
            }
        }
    }
    
    // If we found saved progress, apply it
    if (bestProgressData && highestQuestionCount > 0) {
        console.log(`[FORCE QUESTION] Applying progress with ${highestQuestionCount} questions answered`);
        
        // Update the quiz instance state
        communicationQuizInstance.player.questionHistory = bestProgressData.questionHistory;
        communicationQuizInstance.player.currentScenario = highestQuestionCount;
        communicationQuizInstance.player.experience = bestProgressData.experience || 0;
        
        // Force display the correct scenario
        communicationQuizInstance.displayScenario();
        
        // Also re-save to ensure consistent format
        communicationQuizInstance.saveProgress('in-progress').catch(err => {
            console.error('[FORCE QUESTION] Error saving forced progress:', err);
        });
        
        return true;
    }
    
    console.log('[FORCE QUESTION] No valid progress found in any storage key');
    return false;
}

// Call our force function right after the quiz instance is created
document.addEventListener('DOMContentLoaded', () => {
    // Add a debug button to the UI that will force the correct question to display
    setTimeout(() => {
        try {
            // Create debug button if it doesn't exist
            if (!document.getElementById('force-question-btn')) {
                const debugButton = document.createElement('button');
                debugButton.id = 'force-question-btn';
                debugButton.textContent = 'Force Correct Question';
                debugButton.style.position = 'fixed';
                debugButton.style.bottom = '10px';
                debugButton.style.right = '10px';
                debugButton.style.zIndex = '9999';
                debugButton.style.padding = '5px 10px';
                debugButton.style.background = '#ff9800';
                debugButton.style.color = 'white';
                debugButton.style.border = 'none';
                debugButton.style.borderRadius = '4px';
                debugButton.style.cursor = 'pointer';
                
                debugButton.addEventListener('click', () => {
                    forceCorrectQuestionDisplay();
                });
                
                document.body.appendChild(debugButton);
                console.log('[DEBUG] Added force question button to UI');
            }
        } catch (e) {
            console.error('[DEBUG] Error adding debug button:', e);
        }
    }, 3000);
}); 