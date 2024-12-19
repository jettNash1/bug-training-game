class BaseQuiz {
    constructor(config) {
        this.maxXP = config.maxXP;
        this.levelThresholds = config.levelThresholds;
        this.performanceThresholds = config.performanceThresholds;
        
        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');
        
        this.player = {
            name: '',
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: []
        };
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
        
        const optionsWithIndices = scenario.options.map((option, index) => ({
            option: { ...option },
            originalIndex: index
        }));
        
        this.shuffleArray(optionsWithIndices);
        
        scenarioCopy.options = optionsWithIndices.map((item, newIndex) => ({
            ...item.option,
            shuffledIndex: newIndex,
            originalIndex: item.originalIndex
        }));
        
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

    displayScenario() {
        const currentScenarios = this.getCurrentScenarios();
        
        if (this.player.currentScenario >= currentScenarios.length) {
            const totalQuestionsAnswered = this.player.questionHistory.length;
            
            if (this.shouldEndGame(totalQuestionsAnswered, this.player.experience)) {
                this.endGame();
                return;
            }
            
            this.player.currentScenario = 0;
            this.displayScenario();
            return;
        }

        const scenario = this.shuffleScenarioOptions(currentScenarios[this.player.currentScenario]);
        
        if (this.player.currentScenario === 0) {
            document.getElementById('level-indicator').textContent = `Level: ${scenario.level}`;
        }

        document.getElementById('scenario-title').textContent = scenario.title;
        document.getElementById('scenario-description').textContent = scenario.description;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        scenario.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <input type="radio" 
                    name="option" 
                    value="${index}" 
                    id="option${index}">
                <label for="option${index}">${option.text}</label>
            `;
            optionsContainer.appendChild(optionElement);
        });

        this.updateProgress();
    }

    updateProgress() {
        const currentScenarios = this.getCurrentScenarios();
        const progress = this.player.currentScenario === currentScenarios.length - 1 ? 
            100 : 
            (this.player.currentScenario / currentScenarios.length) * 100;
        
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('experience-display').textContent = `XP: ${Math.max(0, this.player.experience)}/${this.maxXP}`;
        document.getElementById('question-progress').textContent = 
            `Question: ${this.player.currentScenario + 1}/${currentScenarios.length}`;
    }

    startGame() {
        this.player.experience = 0;
        this.player.tools = [];
        this.player.currentScenario = 0;
        this.player.questionHistory = [];
        
        this.displayScenario();
    }

    handleAnswer() {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (!selectedOption) return;

        const currentScenarios = this.getCurrentScenarios();
        const scenario = currentScenarios[this.player.currentScenario];
        const choice = parseInt(selectedOption.value);
        const selectedAnswer = scenario.options[choice];

        const originalMaxXP = Math.max(...currentScenarios[this.player.currentScenario].options.map(o => o.experience));

        this.player.questionHistory.push({
            scenario: scenario,
            selectedAnswer: selectedAnswer,
            maxPossibleXP: originalMaxXP
        });

        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.remove('hidden');
        
        document.getElementById('outcome-text').textContent = selectedAnswer.outcome;
        
        const xpGainedText = selectedAnswer.experience > 0 
            ? `Experience gained: +${selectedAnswer.experience}`
            : `Experience: ${selectedAnswer.experience}`;
        document.getElementById('xp-gained').textContent = xpGainedText;
        
        if (selectedAnswer.tool) {
            document.getElementById('tool-gained').textContent = `Tool acquired: ${selectedAnswer.tool}`;
            if (!this.player.tools.includes(selectedAnswer.tool)) {
                this.player.tools.push(selectedAnswer.tool);
            }
        } else {
            document.getElementById('tool-gained').textContent = '';
        }

        this.player.experience = Math.max(0, this.player.experience + selectedAnswer.experience);
        this.updateProgress();
    }

    nextScenario() {
        this.outcomeScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.player.currentScenario++;
        this.displayScenario();
    }

    restartGame() {
        this.endScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.startGame();
    }

    endGame() {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        const finalScore = Math.min(this.player.experience, this.maxXP);
        const scorePercentage = Math.round((finalScore / this.maxXP) * 100);
        
        // Save the quiz result for the current user
        const currentUsername = localStorage.getItem('currentUser');
        if (currentUsername) {
            try {
                const user = new QuizUser(currentUsername);
                user.updateQuizScore(this.quizName, scorePercentage);
                console.log('Quiz score saved successfully:', scorePercentage);
            } catch (error) {
                console.error('Error saving quiz score:', error);
            }
        } else {
            console.log('No user logged in, score not saved');
        }

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;

        const performanceSummary = document.getElementById('performance-summary');
        const threshold = this.performanceThresholds.find(t => finalScore >= t.threshold);
        performanceSummary.textContent = threshold.message;

        this.displayQuestionReview();
        this.generateRecommendations();
    }

    displayQuestionReview() {
        const reviewList = document.getElementById('question-review');
        reviewList.innerHTML = '';
        
        this.player.questionHistory.forEach((record, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            const maxXP = record.maxPossibleXP;
            const earnedXP = record.selectedAnswer.experience;
            const isCorrect = earnedXP === maxXP;
            
            reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
            
            reviewItem.innerHTML = `
                <h4>Question ${index + 1}</h4>
                <p>${record.scenario.description}</p>
                <p><strong>Your Answer:</strong> ${record.selectedAnswer.text}</p>
                <p><strong>Outcome:</strong> ${record.selectedAnswer.outcome}</p>
                <p><strong>Experience Earned:</strong> ${earnedXP}/${maxXP}</p>
            `;
            
            reviewList.appendChild(reviewItem);
        });
    }

    generateRecommendations() {
        const recommendations = document.getElementById('recommendations');
        const performance = (this.player.experience / this.maxXP) * 100;
        
        let recommendationText = '';
        if (performance < 50) {
            recommendationText = 'Consider reviewing the material and trying again. Focus on understanding the core concepts.';
        } else if (performance < 80) {
            recommendationText = 'Good effort! Review the questions you missed and try to identify patterns in your incorrect answers.';
        } else {
            recommendationText = 'Excellent work! You\'ve demonstrated a strong understanding of the material.';
        }
        
        recommendations.textContent = recommendationText;
    }
} 