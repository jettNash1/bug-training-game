class BaseQuiz {
    constructor(config) {
        this.maxXP = config.maxXP;
        this.levelThresholds = config.levelThresholds;
        this.performanceThresholds = config.performanceThresholds;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    shuffleScenarioOptions(scenario) {
        const scenarioCopy = JSON.parse(JSON.stringify(scenario));
        
        const indices = Array.from({ length: scenario.options.length }, (_, i) => i);
        this.shuffleArray(indices);
        
        scenarioCopy.options = indices.map(i => scenario.options[i]);
        
        return scenarioCopy;
    }

    shouldEndGame(totalQuestionsAnswered, experience) {
        if (totalQuestionsAnswered >= 15) {
            return true;
        }

        if (totalQuestionsAnswered === 5 && experience < this.levelThresholds.basic.minXP) {
            return true;
        }
        
        if (totalQuestionsAnswered === 10 && experience < this.levelThresholds.intermediate.minXP) {
            return true;
        }

        return false;
    }

    initializeUI() {
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');
        this.optionsForm = document.getElementById('options-form');
        
        this.optionsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAnswer();
        });

        document.getElementById('continue-btn').addEventListener('click', () => {
            this.nextScenario();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }

    updateProgress() {
        const currentScenarios = this.getCurrentScenarios();
        const progress = this.player.currentScenario === currentScenarios.length - 1 ? 
            100 : 
            (this.player.currentScenario / currentScenarios.length) * 100;
        
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('experience-display').textContent = `XP: ${this.player.experience}/${this.maxXP}`;
        document.getElementById('question-progress').textContent = 
            `Question: ${this.player.currentScenario + 1}/${currentScenarios.length}`;
        
        const currentLevel = currentScenarios[this.player.currentScenario].level;
        document.getElementById('level-indicator').textContent = `Level: ${currentLevel}`;
    }

    displayQuestionReview() {
        const reviewContainer = document.getElementById('question-review');
        reviewContainer.innerHTML = '';

        this.player.questionHistory.forEach((history) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = `review-item ${history.selectedAnswer.experience === history.maxPossibleXP ? 'success' : 'warning'}`;
            
            reviewItem.innerHTML = `
                <strong>${history.scenario.level}: ${history.scenario.title}</strong><br>
                Your answer: ${history.selectedAnswer.text}<br>
                Points: ${history.selectedAnswer.experience}/${history.maxPossibleXP}
            `;
            
            reviewContainer.appendChild(reviewItem);
        });
    }

    generateRecommendations() {
        const recommendationsDiv = document.getElementById('recommendations');
        const weakAreas = this.player.questionHistory
            .filter(h => h.selectedAnswer.experience < h.maxPossibleXP)
            .map(h => h.scenario.title)
            .reduce((acc, title) => {
                acc[title] = (acc[title] || 0) + 1;
                return acc;
            }, {});

        const recommendations = Object.entries(weakAreas)
            .map(([area, count]) => `Review ${area} concepts`)
            .join('<br>');

        recommendationsDiv.innerHTML = recommendations || 'Great job! No specific areas need improvement.';
    }
} 