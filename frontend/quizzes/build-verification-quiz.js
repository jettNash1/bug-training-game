import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';
import { buildVerificationScenarios } from '../data/buildVerification-scenarios.js';
import quizSyncService from '../services/quiz-synch-service.js';

export class BuildVerificationQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a BVT expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong understanding of BVT!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing BVT best practices and try again!' }
            ],
            quizName: 'build-verification'
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'build-verification',
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
        this.basicScenarios = buildVerificationScenarios.basic;
        this.intermediateScenarios = buildVerificationScenarios.intermediate;
        this.advancedScenarios = buildVerificationScenarios.advanced;

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

        // Initialize UI and add event listeners
        this.initializeEventListeners();

        this.isLoading = false;

        // Add this debugging check to the constructor
        console.log('[BuildVerificationQuiz] Quiz name being used:', this.quizName);
        const relatedLocalStorage = Object.keys(localStorage).filter(k => 
            k.includes('quiz_progress') || k.includes('build-verification')
        );
        console.log('[BuildVerificationQuiz] Related localStorage keys:', relatedLocalStorage);
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
                console.error('[BuildVerificationQuiz] Displayed error to user:', message);
            }
        } catch (e) {
            console.error('[BuildVerificationQuiz] Failed to show error to user:', e);
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
            
            // ADDITIONAL FAILSAFE: Also save to sessionStorage which persists for the current session
            try {
                sessionStorage.setItem(storageKey, JSON.stringify({ 
                    data: progressData,
                    timestamp: Date.now()
                }));
                console.log('[BuildVerificationQuiz] Backed up progress to sessionStorage');
                
                // Create an emergency backup with a timestamp
                const emergencyKey = `${storageKey}_emergency_${Date.now()}`;
                sessionStorage.setItem(emergencyKey, JSON.stringify({ 
                    data: progressData,
                    timestamp: Date.now()
                }));
            } catch (sessionError) {
                console.warn('[BuildVerificationQuiz] Failed to save to sessionStorage:', sessionError);
            }
            
            // Try to use sync service, but have a direct API fallback
            try {
                if (typeof quizSyncService !== 'undefined') {
                    quizSyncService.addToSyncQueue(username, this.quizName, progressData);
                    console.log('[BuildVerificationQuiz] Added to sync queue');
                } else {
                    throw new Error('Sync service not available');
                }
            } catch (syncError) {
                // Direct API saving as fallback
                console.warn('[BuildVerificationQuiz] Sync service failed, trying direct API save:', syncError);
                
                try {
                    await this.apiService.saveQuizProgress(this.quizName, progressData);
                    console.log('[BuildVerificationQuiz] Saved progress directly to API');
                } catch (apiError) {
                    console.error('[BuildVerificationQuiz] Failed to save to API:', apiError);
                    // Already saved to localStorage above, so we have a backup
                }
            }
            
            return true;
        } catch (error) {
            console.error('[BuildVerificationQuiz] Failed to save progress:', error);
            
            // EMERGENCY FALLBACK: Attempt to save to sessionStorage as last resort
            try {
                const username = localStorage.getItem('username') || 'anonymous';
                const emergencyKey = `quiz_progress_${username}_${this.quizName}_emergency`;
                sessionStorage.setItem(emergencyKey, JSON.stringify({ 
                    data: progressData,
                    timestamp: Date.now()
                }));
                console.log('[BuildVerificationQuiz] Saved emergency backup to sessionStorage');
            } catch (sessionError) {
                console.error('[BuildVerificationQuiz] All storage methods failed:', sessionError);
            }
            
            return false;
        }
    }

    async loadProgress() {
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('[BuildVerificationQuiz] No user found, cannot load progress');
                return false;
            }

            // Important diagnostic: log ALL quiz progress localStorage keys for this user
            const allStorageKeys = Object.keys(localStorage).filter(key => 
                key.includes('quiz_progress') && key.includes(username)
            );
            console.log('[BuildVerificationQuiz] ALL localStorage quiz progress keys for this user:', allStorageKeys);

            // Define all possible storage keys in priority order
            const storageKeys = [
                `quiz_progress_${username}_${this.quizName}`,
                `quiz_progress_${username}_${this.quizName}_backup`,
                `quiz_progress_${username}_build-verification`,  // Fallback for standardized name
                `quiz_progress_${username}_build-verification_backup`,
                `quiz_progress_${username}_build-verification_emergency`
            ];
            
            // Log which keys we will try
            console.log('[BuildVerificationQuiz] Will try these localStorage keys in order:', storageKeys);
            
            let progressData = null;
            let dataSource = '';
            let apiProgress = null;
            
            // First collect ALL possible progress data sources before deciding which to use
            
            // Check sessionStorage first as an additional data source
            let sessionStorageData = null;
            try {
                // Get all sessionStorage keys for this user
                const sessionKeys = Object.keys(sessionStorage).filter(key => 
                    key.includes('quiz_progress') && key.includes(username)
                );
                console.log('[BuildVerificationQuiz] SessionStorage keys found:', sessionKeys);
                
                // Get the most recent session storage data
                if (sessionKeys.length > 0) {
                    let mostRecentKey = sessionKeys[0];
                    let mostRecentTime = 0;
                    
                    // Find most recent by looking at the keys with timestamps or data timestamps
                    for (const key of sessionKeys) {
                        try {
                            const sessionData = JSON.parse(sessionStorage.getItem(key));
                            // Check if key contains timestamp or data has timestamp
                            const keyTimestamp = key.includes('emergency_') ? 
                                parseInt(key.split('emergency_')[1]) : 0;
                            const dataTimestamp = sessionData.timestamp ? 
                                parseInt(sessionData.timestamp) : 0;
                            
                            const timestamp = Math.max(keyTimestamp, dataTimestamp);
                            
                            if (timestamp > mostRecentTime) {
                                mostRecentTime = timestamp;
                                mostRecentKey = key;
                            }
                        } catch (e) {}
                    }
                    
                    // Load the most recent session data
                    try {
                        const sessionData = JSON.parse(sessionStorage.getItem(mostRecentKey));
                        sessionStorageData = sessionData.data || sessionData;
                        console.log('[BuildVerificationQuiz] Loaded most recent sessionStorage data from key:', 
                            mostRecentKey, 'with question count:', 
                            sessionStorageData.questionHistory?.length || 0);
                    } catch (e) {
                        console.warn('[BuildVerificationQuiz] Failed to parse session storage data:', e);
                    }
                }
            } catch (sessionError) {
                console.warn('[BuildVerificationQuiz] Error accessing sessionStorage:', sessionError);
            }
            
            // Try to get progress from API
            try {
                console.log('[BuildVerificationQuiz] Attempting to load progress from API');
                apiProgress = await this.apiService.getQuizProgress(this.quizName);
                console.log('[BuildVerificationQuiz] API progress response:', apiProgress);
                
                if (apiProgress && apiProgress.data) {
                    // Verify API data has actual content (not just empty structures)
                    const apiHasProgress = 
                        (apiProgress.data.questionHistory && apiProgress.data.questionHistory.length > 0) &&
                        (apiProgress.data.currentScenario && apiProgress.data.currentScenario > 0);
                    
                    if (apiHasProgress) {
                        console.log('[BuildVerificationQuiz] API data contains valid progress with questions:', 
                            apiProgress.data.questionHistory.length);
                    } else {
                        console.warn('[BuildVerificationQuiz] API returned data but without valid questions or progress');
                    }
                } else {
                    console.warn('[BuildVerificationQuiz] API returned no valid data');
                }
            } catch (apiError) {
                console.warn('[BuildVerificationQuiz] Failed to load progress from API:', apiError);
            }
            
            // Collect all localStorage data
            const localStorageData = {};
            let bestLocalStorageData = null;
            let bestQuestionCount = 0;
            
            for (const key of storageKeys) {
                const localData = localStorage.getItem(key);
                
                if (localData) {
                    try {
                        const parsed = JSON.parse(localData);
                        const candidateData = parsed.data || parsed;
                        
                        // Store all parsed data for reference
                        localStorageData[key] = candidateData;
                        
                        // Check if this data has any question history
                        if (candidateData && Array.isArray(candidateData.questionHistory)) {
                            const questionCount = candidateData.questionHistory.length;
                            console.log(`[BuildVerificationQuiz] Found localStorage data in ${key} with ${questionCount} questions`);
                            
                            // Keep track of the best localStorage data (most questions)
                            if (questionCount > bestQuestionCount) {
                                bestLocalStorageData = candidateData;
                                bestQuestionCount = questionCount;
                                console.log(`[BuildVerificationQuiz] This is now the best local storage data (${questionCount} questions)`);
                            }
                        }
                    } catch (parseError) {
                        console.error(`[BuildVerificationQuiz] Failed to parse localStorage data for key ${key}:`, parseError);
                    }
                }
            }
            
            // Now choose the best data source based on which has the most questions
            
            // Track the best data and its source
            let bestData = null;
            let bestSource = '';
            let bestCount = 0;
            
            // Check API data
            if (apiProgress && apiProgress.data && 
                apiProgress.data.questionHistory && 
                apiProgress.data.questionHistory.length > 0) {
                
                bestData = apiProgress.data;
                bestSource = 'API';
                bestCount = apiProgress.data.questionHistory.length;
                console.log(`[BuildVerificationQuiz] API data has ${bestCount} questions`);
            }
            
            // Check localStorage data
            if (bestLocalStorageData && 
                bestLocalStorageData.questionHistory && 
                bestLocalStorageData.questionHistory.length > bestCount) {
                
                bestData = bestLocalStorageData;
                bestSource = 'localStorage';
                bestCount = bestLocalStorageData.questionHistory.length;
                console.log(`[BuildVerificationQuiz] localStorage data has ${bestCount} questions, better than current best`);
            }
            
            // Check sessionStorage data
            if (sessionStorageData && 
                sessionStorageData.questionHistory && 
                sessionStorageData.questionHistory.length > bestCount) {
                
                bestData = sessionStorageData;
                bestSource = 'sessionStorage';
                bestCount = sessionStorageData.questionHistory.length;
                console.log(`[BuildVerificationQuiz] sessionStorage data has ${bestCount} questions, better than current best`);
            }
            
            // Use the best data we've found
            if (bestData) {
                console.log(`[BuildVerificationQuiz] Using best progress data from ${bestSource} with ${bestCount} questions`);
                progressData = bestData;
                dataSource = bestSource;
                
                // If the best data wasn't from the API, sync it back to the API
                if (bestSource !== 'API' && bestCount > 0) {
                    try {
                        console.log('[BuildVerificationQuiz] Syncing best progress data to API and localStorage');
                        
                        // Update localStorage with the best data
                        localStorage.setItem(storageKeys[0], JSON.stringify({ 
                            data: progressData,
                            timestamp: Date.now() 
                        }));
                        
                        // Update API with the best data
                        await this.apiService.saveQuizProgress(this.quizName, progressData);
                    } catch (syncError) {
                        console.warn('[BuildVerificationQuiz] Failed to sync best progress data:', syncError);
                    }
                }
            } else {
                console.log('[BuildVerificationQuiz] No valid progress data found from any source, trying recovery...');
                
                // Try to recover from the sync service as last resort
                try {
                    // Get QuizSyncService if available
                    if (typeof window.quizSyncService !== 'undefined' || typeof quizSyncService !== 'undefined') {
                        const syncService = window.quizSyncService || quizSyncService;
                        const recoveredData = await syncService.recoverProgressData(username, this.quizName);
                        
                        if (recoveredData) {
                            console.log('[BuildVerificationQuiz] Successfully recovered data from QuizSyncService');
                            progressData = recoveredData;
                            dataSource = 'recovered';
                        } else {
                            console.warn('[BuildVerificationQuiz] No data could be recovered, returning false');
                            return false;
                        }
                    } else {
                        console.warn('[BuildVerificationQuiz] QuizSyncService not available, cannot recover');
                        return false;
                    }
                } catch (recoveryError) {
                    console.error('[BuildVerificationQuiz] Error during data recovery:', recoveryError);
                    return false;
                }
            }

            if (progressData) {
                console.log(`[BuildVerificationQuiz] Processing loaded progress data from ${dataSource}`);
                
                // Sanitize and validate data to prevent invalid values
                progressData.experience = !isNaN(parseFloat(progressData.experience)) ? parseFloat(progressData.experience) : 0;
                progressData.tools = Array.isArray(progressData.tools) ? progressData.tools : [];
                progressData.questionHistory = Array.isArray(progressData.questionHistory) ? 
                    progressData.questionHistory : [];
                
                // CRITICAL: Ensure currentScenario is consistent with question history
                // This is a key point of failure
                if (progressData.questionHistory.length > 0) {
                    console.log('[BuildVerificationQuiz] Setting currentScenario to match questionHistory.length:', 
                        progressData.questionHistory.length);
                    
                    // ALWAYS set currentScenario to match the question history length
                    // This ensures we go to the next unanswered question
                    progressData.currentScenario = progressData.questionHistory.length;
                } else {
                    console.log('[BuildVerificationQuiz] No questions in history, starting from beginning');
                    progressData.currentScenario = 0;
                }
                
                // Fix inconsistent state: if quiz is marked as completed but has no progress
                if ((progressData.status === 'completed' || 
                     progressData.status === 'passed' || 
                     progressData.status === 'failed') && 
                    (progressData.questionHistory.length === 0 || 
                     progressData.currentScenario === 0)) {
                    console.log('[BuildVerificationQuiz] Fixing inconsistent state: quiz marked as completed but has no progress');
                    progressData.status = 'in-progress';
                }

                // Update the player state with the loaded progress data
                this.player.experience = progressData.experience;
                this.player.tools = progressData.tools;
                this.player.questionHistory = progressData.questionHistory;
                this.player.currentScenario = progressData.currentScenario;
                
                console.log('[BuildVerificationQuiz] Player state updated:', {
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory.length,
                    currentScenario: this.player.currentScenario,
                    status: progressData.status,
                    source: dataSource
                });
                
                // Only show end screen if quiz is actually completed and has progress
                if ((progressData.status === 'completed' || 
                     progressData.status === 'passed' || 
                     progressData.status === 'failed') && 
                    progressData.questionHistory.length > 0 && 
                    progressData.currentScenario > 0) {
                    console.log(`[BuildVerificationQuiz] Quiz is ${progressData.status} with ${progressData.questionHistory.length} questions answered`);
                    this.endGame(progressData.status === 'failed');
                    return true;
                }

                // Additional guard: verify that progress was loaded correctly
                if (this.player.questionHistory.length === 0 && progressData.questionHistory.length > 0) {
                    console.error('[BuildVerificationQuiz] CRITICAL ERROR: Failed to load question history properly!');
                    // Forced retry with direct assignment
                    this.player.questionHistory = [...progressData.questionHistory];
                    this.player.currentScenario = this.player.questionHistory.length;
                    console.log('[BuildVerificationQuiz] Forced player state update after error:', {
                        questionHistory: this.player.questionHistory.length,
                        currentScenario: this.player.currentScenario
                    });
                }

                // Force save progress back to ensure consistency
                await this.saveProgress();
                
                // Show the current question based on progress
                this.displayScenario();
                return true;
            }
            
            console.log('[BuildVerificationQuiz] No existing progress found');
            return false;
        } catch (error) {
            console.error('[BuildVerificationQuiz] Error loading progress:', error);
            
            // As a last resort, try to recover progress data using the QuizSyncService
            try {
                console.log('[BuildVerificationQuiz] Attempting emergency progress recovery after error');
                return await this.recoverProgress();
            } catch (recoveryError) {
                console.error('[BuildVerificationQuiz] Emergency recovery also failed:', recoveryError);
                return false;
            }
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

            // Add this to the startGame method after loading progress
            console.log('[BuildVerificationQuiz] Progress status check:', {
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

        console.log('[BuildVerificationQuiz][displayScenario] Showing scenario:', {
            currentScenarioIndex,
            totalAnswered,
            totalQuestions
        });

        // Debug: verify currentScenario and questionHistory are aligned correctly
        if (currentScenarioIndex !== totalAnswered) {
            console.warn('[BuildVerificationQuiz][displayScenario] Misalignment detected! currentScenario and questionHistory.length don\'t match:',
                `currentScenario=${currentScenarioIndex}, questionHistory.length=${totalAnswered}`);
            
            // Auto-fix if there's a mismatch - this is critical for proper quiz flow
            if (totalAnswered > 0 && currentScenarioIndex === 0) {
                console.log('[BuildVerificationQuiz][displayScenario] Auto-fixing: Setting currentScenario to match questionHistory.length');
                this.player.currentScenario = totalAnswered;
            }
        }

        // Check if we've answered all questions
        if (currentScenarioIndex >= totalQuestions) {
            console.log('[BuildVerificationQuiz][displayScenario] All questions answered, ending game');
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
                console.error('[BuildVerificationQuiz][displayScenario] No scenario found for currentScenario:', currentScenarioIndex);
                console.log('[BuildVerificationQuiz][displayScenario] Scenario sets:', {
                    basic: this.basicScenarios?.length || 0,
                    intermediate: this.intermediateScenarios?.length || 0,
                    advanced: this.advancedScenarios?.length || 0
                });
                
                // Emergency fallback - try to recover by moving to next question or resetting
                if (totalAnswered > 0 && totalAnswered < totalQuestions) {
                    console.log('[BuildVerificationQuiz][displayScenario] Attempting recovery by moving to next available scenario');
                    this.player.currentScenario = totalAnswered;
                    // Try recursively one more time with the fixed index
                    this.displayScenario();
                    return;
                } else {
                    // If we still can't recover, try the emergency recovery method
                    console.log('[BuildVerificationQuiz][displayScenario] Attempting emergency data recovery');
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
                console.error('[BuildVerificationQuiz][displayScenario] Required elements not found');
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
            console.log('[BuildVerificationQuiz][displayScenario] Showing scenario', scenarioLevel, 'index', currentScenarioIndex, scenario.title);

            // Make scenario screen visible if not already
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen && gameScreen.classList.contains('hidden')) {
                console.log('[BuildVerificationQuiz][displayScenario] Making game screen visible');
                gameScreen.classList.remove('hidden');
            }

            // Add extra log after showing
            setTimeout(() => {
                console.log('[BuildVerificationQuiz][displayScenario][post-show] player state:', {
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory.length,
                    currentScenario: this.player.currentScenario
                });
            }, 0);
        } catch (error) {
            console.error('[BuildVerificationQuiz][displayScenario] Error showing scenario:', error);
            // Emergency recovery if an error occurs
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) gameScreen.classList.remove('hidden');
            
            // Try to recover progress data in case of display error
            console.log('[BuildVerificationQuiz][displayScenario] Attempting emergency recovery after display error');
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of build verification. You clearly understand the nuances of build verification and are well-equipped to handle any build verification challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your build verification skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('core') || description.includes('core')) {
            return 'Core Functionality';
        } else if (title.includes('regression') || description.includes('regression')) {
            return 'Regression Prevention';
        } else if (title.includes('integration') || description.includes('integration')) {
            return 'Integration Testing';
        } else if (title.includes('acceptance') || description.includes('accept')) {
            return 'Build Acceptance';
        } else if (title.includes('issue') || description.includes('issue')) {
            return 'Issue Management';
        } else if (title.includes('automation') || description.includes('automate')) {
            return 'Test Automation';
        } else if (title.includes('environment') || description.includes('environment')) {
            return 'Environment Setup';
        } else if (title.includes('performance') || description.includes('performance')) {
            return 'Performance Verification';
        } else {
            return 'General BVT Process';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Core Functionality': 'Focus on systematic verification of critical system functions like installation, login, and navigation.',
            'Regression Prevention': 'Strengthen early detection of regression issues through comprehensive core testing.',
            'Integration Testing': 'Improve verification of module interactions and dependencies during integration.',
            'Build Acceptance': 'Enhance criteria evaluation for determining build stability and readiness.',
            'Issue Management': 'Develop better strategies for prioritizing and escalating critical build issues.',
            'Test Automation': 'Focus on implementing reliable automated checks for core functionality.',
            'Environment Setup': 'Strengthen verification of build deployment and environment configuration.',
            'Performance Verification': 'Improve basic performance checks during build verification.',
            'General BVT Process': 'Continue developing fundamental build verification principles and methodologies.'
        };

        return recommendations[area] || 'Continue practicing core build verification principles.';
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
            console.log('[BuildVerificationQuiz] Using cached scenarios');
            const data = JSON.parse(cachedData);
            this.basicScenarios = data.basic || buildVerificationScenarios.basic;
            this.intermediateScenarios = data.intermediate || buildVerificationScenarios.intermediate;
            this.advancedScenarios = data.advanced || buildVerificationScenarios.advanced;
            return;
        }
        
        // If no valid cache, try to fetch from API
        try {
            console.log('[BuildVerificationQuiz] Fetching scenarios from API');
            const data = await this.apiService.getQuizScenarios(this.quizName);
            
            if (data && data.scenarios) {
                // Cache the result
                localStorage.setItem(`quiz_scenarios_${this.quizName}`, JSON.stringify(data.scenarios));
                localStorage.setItem(`quiz_scenarios_${this.quizName}_timestamp`, Date.now().toString());
                
                // Update scenarios
                this.basicScenarios = data.scenarios.basic || buildVerificationScenarios.basic;
                this.intermediateScenarios = data.scenarios.intermediate || buildVerificationScenarios.intermediate;
                this.advancedScenarios = data.scenarios.advanced || buildVerificationScenarios.advanced;
            }
        } catch (error) {
            console.error('[BuildVerificationQuiz] Failed to load scenarios from API:', error);
            console.log('[BuildVerificationQuiz] Falling back to default scenarios');
            // Already loaded default scenarios in constructor
        }
    }

    // New recovery method for handling emergency recovery situations
    async recoverProgress() {
        console.log('[BuildVerificationQuiz] Entering emergency recovery mode');
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('[BuildVerificationQuiz] No username found, cannot recover progress');
                return false;
            }
            
            // Make sure we have access to the QuizSyncService
            if (typeof window.quizSyncService === 'undefined' && typeof quizSyncService === 'undefined') {
                console.error('[BuildVerificationQuiz] QuizSyncService not available, cannot perform recovery');
                return false;
            }
            
            const syncService = window.quizSyncService || quizSyncService;
            console.log('[BuildVerificationQuiz] Using QuizSyncService to recover progress data');
            
            // Try to recover progress data
            const recoveredData = await syncService.recoverProgressData(username, this.quizName);
            
            if (!recoveredData) {
                console.warn('[BuildVerificationQuiz] No data could be recovered, recovery failed');
                return false;
            }
            
            console.log('[BuildVerificationQuiz] Successfully recovered data:', {
                questionCount: recoveredData.questionHistory?.length || 0,
                experience: recoveredData.experience || 0,
                status: recoveredData.status || 'unknown'
            });
            
            // Sanitize the recovered data
            const progressData = {
                experience: !isNaN(parseFloat(recoveredData.experience)) ? parseFloat(recoveredData.experience) : 0,
                tools: Array.isArray(recoveredData.tools) ? recoveredData.tools : [],
                questionHistory: Array.isArray(recoveredData.questionHistory) ? recoveredData.questionHistory : [],
                currentScenario: 0, // Will be set correctly below
                status: recoveredData.status || 'in-progress',
                questionsAnswered: Array.isArray(recoveredData.questionHistory) ? recoveredData.questionHistory.length : 0,
                scorePercentage: !isNaN(parseFloat(recoveredData.scorePercentage)) ? parseFloat(recoveredData.scorePercentage) : 0
            };
            
            // Set currentScenario based on question history
            if (progressData.questionHistory.length > 0) {
                progressData.currentScenario = progressData.questionHistory.length;
            }
            
            // Update player state
            this.player.experience = progressData.experience;
            this.player.tools = progressData.tools;
            this.player.questionHistory = progressData.questionHistory;
            this.player.currentScenario = progressData.currentScenario;
            
            console.log('[BuildVerificationQuiz] Player state updated from recovered data:', {
                experience: this.player.experience,
                questionHistory: this.player.questionHistory.length,
                currentScenario: this.player.currentScenario
            });
            
            // If quiz is completed, show end game screen
            if ((progressData.status === 'completed' || 
                 progressData.status === 'passed' || 
                 progressData.status === 'failed') && 
                progressData.questionHistory.length > 0) {
                console.log(`[BuildVerificationQuiz] Quiz is ${progressData.status}, showing end screen`);
                this.endGame(progressData.status === 'failed');
                return true;
            }
            
            // Save the recovered data to ensure it's persistently stored
            try {
                await this.saveProgress();
                console.log('[BuildVerificationQuiz] Saved recovered progress to all storage locations');
            } catch (saveError) {
                console.warn('[BuildVerificationQuiz] Failed to save recovered progress:', saveError);
            }
            
            // Show the current scenario
            this.displayScenario();
            return true;
        } catch (error) {
            console.error('[BuildVerificationQuiz] Recovery attempt failed:', error);
            return false;
        }
    }
}

// Singleton instance for BuildVerificationQuiz
let buildVerificationQuizInstance = null;

// Initialize quiz when the page loads
// Only allow one instance
document.addEventListener('DOMContentLoaded', () => {
    if (buildVerificationQuizInstance) {
        console.log('[BuildVerificationQuiz] Instance already exists, not creating a new one.');
        return;
    }
    BaseQuiz.clearQuizInstances('build-verification');
    buildVerificationQuizInstance = new BuildVerificationQuiz();
    buildVerificationQuizInstance.startGame();
}); 