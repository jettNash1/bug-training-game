import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';
import { APIService } from '../api-service.js';
import { testScenarios } from '../data/test-scenarios.js';

class TestQuiz extends BaseQuiz {
    constructor() {
        console.log('[TestQuiz] Initializing...');
        
        // Configure the quiz with basic settings
        const config = {
            totalQuestions: 3, // Total number of questions in the quiz
            passPercentage: 70, // Percentage needed to pass
            quizName: 'test-quiz' // Unique name for the quiz
        };
        
        // Call the parent constructor with our config
        super(config);
        
        // Initialize player state
        this.player = {
            name: '',
            experience: 0,
            questionHistory: [],
            currentScenario: 0,
            tools: []
        };
        
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
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Start the quiz
        this.startGame();
    }
    
    // Override the shouldEndGame method for our simple 3-question quiz
    shouldEndGame() {
        return this.player.questionHistory.length >= 3;
    }
    
    // Initialize event listeners
    initializeEventListeners() {
        // Add event listener for the restart button
        const restartButton = document.getElementById('restart-btn');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.restartQuiz());
        }
    }
    
    // Get the scenarios for the current level
    getCurrentScenarios() {
        if (this.player.currentScenario === 0) {
            return this.basicScenarios;
        } else if (this.player.currentScenario === 1) {
            return this.intermediateScenarios;
        } else {
            return this.advancedScenarios;
        }
    }
    
    // Get the current level based on question index
    getCurrentLevel() {
        if (this.player.currentScenario === 0) {
            return 'Basic';
        } else if (this.player.currentScenario === 1) {
            return 'Intermediate';
        } else {
            return 'Advanced';
        }
    }
    
    // Start the quiz
    async startGame() {
        console.log('[TestQuiz] Starting game...');
        
        try {
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
            
            // Display first scenario (or continue from saved progress)
            this.displayScenario();
            
        } catch (error) {
            console.error('[TestQuiz] Error starting game:', error);
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
        const scenario = currentScenarios[0]; // We only have one scenario per level
        
        console.log(`[TestQuiz] Displaying scenario #${this.player.currentScenario + 1}:`, {
            title: scenario.title,
            level: this.getCurrentLevel()
        });
        
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
            questionInfo.textContent = `Question: ${this.player.currentScenario + 1}/3`;
        }
        
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            const progressPercentage = (this.player.currentScenario / 3) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        // Display options
        const optionsContainer = document.getElementById('options-container');
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            
            scenario.options.forEach((option, idx) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.innerHTML = `
                    <input type="radio" name="option" value="${idx}" id="option${idx}">
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
    }
    
    // Handle answer submission
    async handleAnswer() {
        console.log('[TestQuiz] Handling answer submission...');
        
        try {
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (!selectedOption) {
                alert('Please select an answer.');
                return;
            }
            
            // Get the selected option index
            const optionIndex = parseInt(selectedOption.value);
            
            // Get the current scenario
            const currentScenarios = this.getCurrentScenarios();
            const scenario = currentScenarios[0]; // We only have one scenario per level
            
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
            
            // Save progress
            await this.saveProgress();
            
            // Show outcome
            this.gameScreen.classList.add('hidden');
            this.outcomeScreen.classList.remove('hidden');
            
            // Display outcome content
            const outcomeContent = document.querySelector('.outcome-content');
            if (outcomeContent) {
                outcomeContent.innerHTML = `
                    <h2>${selectedAnswer.isCorrect ? '✓ Correct!' : '✗ Incorrect'}</h2>
                    <p>${selectedAnswer.outcome}</p>
                    <button id="continue-btn" class="submit-button">Continue</button>
                `;
                
                // Add event listener to continue button
                const continueBtn = outcomeContent.querySelector('#continue-btn');
                if (continueBtn) {
                    continueBtn.addEventListener('click', () => this.nextScenario());
                }
            }
            
        } catch (error) {
            console.error('[TestQuiz] Error handling answer:', error);
            this.showError('Failed to process your answer. Please try again.');
        }
    }
    
    // Move to the next scenario
    nextScenario() {
        // Increment current scenario
        this.player.currentScenario++;
        
        // Check if the quiz is complete
        if (this.shouldEndGame()) {
            this.endGame(false);
            return;
        }
        
        // Display next scenario
        this.displayScenario();
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
                    passFailMessage.textContent = 'Congratulations! You passed the quiz.';
                    passFailMessage.className = 'pass-fail-message passed';
                } else {
                    passFailMessage.textContent = 'You did not pass. Please try again.';
                    passFailMessage.className = 'pass-fail-message failed';
                }
            }
            
            // Show end screen
            this.gameScreen.classList.add('hidden');
            this.outcomeScreen.classList.add('hidden');
            this.endScreen.classList.remove('hidden');
            
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
        
        // Start again
        this.displayScenario();
    }
    
    // Helper for showing errors
    showError(message) {
        console.error('[TestQuiz] Error:', message);
        alert(message);
    }
}

// Create and initialize the quiz when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[TestQuiz] DOM loaded, initializing quiz...');
    window.testQuiz = new TestQuiz();
}); 