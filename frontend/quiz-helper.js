export class BaseQuiz {
    constructor(config) {
        this.config = config;
        this.maxXP = config.maxXP;
        this.levelThresholds = config.levelThresholds;
        this.performanceThresholds = config.performanceThresholds;
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
            const user = new QuizUser(this.player.name);
            await user.saveQuizResult(
                this.quizName,
                this.calculateScore(),
                this.player.experience,
                this.player.tools,
                this.player.questionHistory
            );
            
            window.location.href = '/';
        } catch (error) {
            console.error('Failed to save quiz results:', error);
            // Show error message to user
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-notification';
            errorDiv.textContent = 'Failed to save results. Please try again.';
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        } finally {
            this.isLoading = false;
        }
    }

    calculateScore() {
        const maxPossibleXP = this.maxXP;
        const currentXP = Math.max(0, this.player.experience);
        return Math.round((currentXP / maxPossibleXP) * 100);
    }

    getCurrentScenario() {
        const currentLevel = this.determineLevel();
        const scenarios = this[`${currentLevel}Scenarios`];
        return scenarios[this.player.currentScenario];
    }

    determineLevel() {
        const { experience } = this.player;
        if (experience >= this.levelThresholds.advanced.minXP) return 'advanced';
        if (experience >= this.levelThresholds.intermediate.minXP) return 'intermediate';
        return 'basic';
    }
} 