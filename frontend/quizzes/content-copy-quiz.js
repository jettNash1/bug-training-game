import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class ContentCopyQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            totalQuestions: 15,
            passPercentage: 70,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
            },
            performanceThresholds: [
                { threshold: 90, message: '🏆 Outstanding! You\'re a content copy expert!' },
                { threshold: 80, message: '👏 Great job! You\'ve shown strong content writing skills!' },
                { threshold: 70, message: '👍 Good work! You\'ve passed the quiz!' },
                { threshold: 0, message: '📚 Consider reviewing content writing best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set the quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'content-copy',
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

        // Basic Scenarios (IDs 1-5, 75 XP total, 15 XP each)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Primary objective',
                description: 'What is the primary focus of copy proofing?',
                options: [
                    {
                        text: 'Testing the functionality of the software',
                        outcome: 'Functionality testing is explicitly out of scope for copy proofing.',
                        experience: -10,
                        isCorrect: false
                    },
                    {
                        text: 'Checking grammar, spelling, and typos in content',
                        outcome: 'Correct! This is the core purpose of copy proofing.',
                        experience: 15,
                        isCorrect: true
                    },
                    {
                        text: 'Verifying user interface design matches submitted documentation',
                        outcome: 'While content proofing includes some UI elements, copy proofing specifically focuses on text content.',
                        experience: 5,
                        isCorrect: false
                    },
                    {
                        text: 'Testing cross-browser compatibility with supported environments',
                        outcome: 'This is a functional testing concern, not related to copy proofing.',
                        experience: -5,
                        isCorrect: false
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Content proofing scope',
                description: 'When conducting content proofing, what is considered out of scope?',
                options: [
                    {
                        text: 'Any spelling errors throughout the system under test',
                        outcome: 'Spelling errors are a key focus of content proofing.',
                        experience: -10
                    },
                    {
                        text: 'Grammatical mistakes throughout the system under test',
                        outcome: 'Grammar checking is a fundamental part of content proofing.',
                        experience: -5
                    },
                    {
                        text: 'Software functionality issues throughout the system under test',
                        outcome: 'Correct! functionality is out of scope for content testing.',
                        experience: 15
                    },
                    {
                        text: 'Content consistency throughout the system under test',
                        outcome: 'While consistency is important, some aspects might be out of scope depending on the project and client recommendations.',
                        experience: 5
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Main objectives',
                description: 'When conducting content proofing, what can be considered as main objectives?',
                options: [
                    {
                        text: 'Ensuring quality of the product',
                        outcome: 'Correct! This is a primary objective of content proofing.',
                        experience: 15
                    },
                    {
                        text: 'Improving website loading speed',
                        outcome: 'This is a technical performance concern, not related to content.',
                        experience: -10
                    },
                    {
                        text: 'Testing payment systems',
                        outcome: 'This is a functional testing concern.',
                        experience: -5
                    },
                    {
                        text: 'Optimizing database performance',
                        outcome: 'While quality-related, this is not a content proofing objective',
                        experience: 5
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Attention to detail',
                description: 'Why is attention to detail important in content proofing',
                options: [
                    {
                        text: 'To find security vulnerabilities that might compromise the system',
                        outcome: 'Security testing is separate to content proofing.',
                        experience: -10
                    },
                    {
                        text: 'To maintain client confidence in quality work',
                        outcome: 'Correct! This is within the main characteristics of content testing.',
                        experience: 15
                    },
                    {
                        text: 'To improve server performance and response times',
                        outcome: 'This is not related to content proofing',
                        experience: -5
                    },
                    {
                        text: 'To reduce development costs with less build releases required',
                        outcome: 'While good quality can reduce costs, it\'s not the primary reason for attention to detail',
                        experience: 5
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Changes to content requirements',
                description: 'What can happen if content changes occur after testing?',
                options: [
                    {
                        text: 'Previous testing will become completely invalid',
                        outcome: 'Not all testing will become invalid, but some changes may make prior testing redundant.',
                        experience: 5
                    },
                    {
                        text: 'The functionality of the system under test will be affected',
                        outcome: 'Introducing content changes should not cause functionality issues.',
                        experience: -10
                    },
                    {
                        text: 'Previous content copy testing may be partially voided',
                        outcome: 'Correct! This is a risk to content changes during the testing cycle',
                        experience: 15
                    },
                    {
                        text: 'The client must restart the project to introduce new content',
                        outcome: 'While content changes may affect some areas already tested, it is not considered to fully re-test all content again',
                        experience: 5
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10, 100 XP total, 20 XP each)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Operating system content consistency',
                description: 'When comparing Android and iOS versions of an application, what should testers look for?',
                options: [
                    {
                        text: 'Different operating system versions must be observed for inconsitencies',
                        outcome: 'This is a technical consideration, not a content concern.',
                        experience: -10
                    },
                    {
                        text: 'Consistent user experience across all supported platforms',
                        outcome: 'Correct! Content testing should specifically addresses platform consistency.',
                        experience: 20
                    },
                    {
                        text: 'Discrepancies between different screen sizes',
                        outcome: 'While relevant for content display, it\'s not the primary focus',
                        experience: 5
                    },
                    {
                        text: 'Battery consumption differences across the supported environments',
                        outcome: 'This is a technical performance concern and not related to content',
                        experience: -5
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Volume of raised content issues',
                description: 'What is a recommended approach when dealing with a high volume of small issues?',
                options: [
                    {
                        text: 'Leave minor issues undocumented to stay in line with specific time constraints',
                        outcome: 'All issues should be documented appropriately.',
                        experience: -10
                    },
                    {
                        text: 'Group all raised issues by content section they fall under',
                        outcome: 'Correct! This is the recommended way of reporting issues for ease of identification.',
                        experience: 20
                    },
                    {
                        text: 'Report only critical issues to stay in line with specific time constraints',
                        outcome: 'While issues may be considered minor, some would still be considered important to the client and user',
                        experience: -5
                    },
                    {
                        text: 'Create separate tickets for each typo found during testing activities',
                        outcome: 'While thorough, this could be too time-consuming and grouping under specific areas is preferred',
                        experience: 5
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Reviewing images',
                description: 'What should testers consider when reviewing images across environments?',
                options: [
                    {
                        text: 'Image file size and any issue regarding this area',
                        outcome: 'While important, this is too narrow a testing focus. Image quality and resolution should also be considered',
                        experience: 5
                    },
                    {
                        text: 'Image loading speed to check for response time issues',
                        outcome: 'This is a performance concern and not a content issue.',
                        experience: -10
                    },
                    {
                        text: 'Image quality and resolution across all environments',
                        outcome: 'Correct! These are a primary factors in reviewing image content',
                        experience: 20
                    },
                    {
                        text: 'Number of images that can be used across the system under test',
                        outcome: 'This is a design decision and not a content proofing concern',
                        experience: -5
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Provided requirements',
                description: 'How does the absence of a copy deck affect testing?',
                options: [
                    {
                        text: 'Testing will become impossible as there is no documentation to refer to',
                        outcome: 'Testing can still proceed with limited scope and tester knowledge.',
                        experience: -5
                    },
                    {
                        text: 'Testing becomes limited to grammar and punctuation',
                        outcome: 'Correct! This is a risk of documentation not being provided by the client.',
                        experience: 20
                    },
                    {
                        text: 'Testing without documentation requires more time',
                        outcome: 'While potentially true, it\'s not the main impact as grammar and spelling can still be tested',
                        experience: 5
                    },
                    {
                        text: 'Testing must then become automated to move forward',
                        outcome: 'Automation is not a method use for content testing',
                        experience: -10
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Localisation',
                description: 'What role does localisation play in content proofing?',
                options: [
                    {
                        text: 'None, as localisation is generally it\'s out of scope for content proofing',
                        outcome: 'Localisation is an important part of content testing if required by the client.',
                        experience: -10
                    },
                    {
                        text: 'This focuses on technical terms throughout the system under test',
                        outcome: 'While technical terms should be included, this is a risk of narrow scoping.',
                        experience: 5
                    },
                    {
                        text: 'Reviewing content appropriateness for a target market',
                        outcome: 'Correct! Market considerations should be considered',
                        experience: 20
                    },
                    {
                        text: 'Checking page and content load times across all environments',
                        outcome: 'This is a performance concern and not part of content testing',
                        experience: -10
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15, 125 XP total, 25 XP each)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Platform content inconsistencies',
                description: 'How should testers approach platform inconsistencies between mobile versions?',
                options: [
                    {
                        text: 'These should be treated as minor issues and only reported if time constraints allow',
                        outcome: 'All inconsistencies should be documented no matter what severity they are.',
                        experience: -10
                    },
                    {
                        text: 'Document differences only if specified in requirements',
                        outcome: 'While the client may have specified areas of scope, they may not have considered all critical areas relating to customer usage.',
                        experience: 5
                    },
                    {
                        text: 'Report all differences between environments unless variation is specified in documentation',
                        outcome: 'Correct! This is considered the correct approach',
                        experience: 25
                    },
                    {
                        text: 'Focus only on issues found on iOS supported devices',
                        outcome: 'All supported environments require equal attention',
                        experience: -10
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Functional & Content testing relationship',
                description: 'What is the relationship between content proofing and functional testing in a project?',
                options: [
                    {
                        text: 'They must always be conducted separately',
                        outcome: 'Functional & Content testing can be combined during testing activities.',
                        experience: -5
                    },
                    {
                        text: 'They can be combined or separate based on project needs',
                        outcome: 'Correct! This technique can be used on most projects dependent on client needs.',
                        experience: 25
                    },
                    {
                        text: 'They must always be combined to maximise test coverage',
                        outcome: 'Only some projects may need content proofing which would be advised by the client',
                        experience: -10
                    },
                    {
                        text: 'Content proofing must come first in the testing cycle',
                        outcome: 'While sometimes logical, it\'s not always a requirement',
                        experience: 5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Content discrepancies within documentation',
                description: 'How should testers handle content that differs from provided design documentation?',
                options: [
                    {
                        text: 'Automatically reject the content as failed',
                        outcome: 'Obvious differences can be raised, yet minor differences can be communicated to the client first before raising.',
                        experience: -10
                    },
                    {
                        text: 'disregard differences in older designs',
                        outcome: 'This could lead to missing important inconsistencies.',
                        experience: -5
                    },
                    {
                        text: 'Raise as a query to verify if designs are current',
                        outcome: 'Correct! This approach gives the client visibility and prompts confirmation for moving forward',
                        experience: 25
                    },
                    {
                        text: 'Check content updates and query any inconsistencies',
                        outcome: 'Whilst checking current updates is important, potential issues could be missed within prior documentation areas',
                        experience: 5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Tester documentation',
                description: 'What impact does the quality of tester documentation have on content proofing?',
                options: [
                    {
                        text: 'No impact as they\'re separate concerns',
                        outcome: 'If a tester can\'t maintain high standards in their own documentation, it raises doubts about their ability to identify content issues.',
                        experience: -10
                    },
                    {
                        text: 'It affects client confidence in testing quality',
                        outcome: 'Correct! It creates a professional impression that reinforces the value of the testing service.',
                        experience: 25
                    },
                    {
                        text: 'It only impacts internal processes',
                        outcome: 'This is partially correct, although it overlooks how documentation quality influences client relationships',
                        experience: 5
                    },
                    {
                        text: 'It reduces testing productivity and volume',
                        outcome: 'There\'s no direct correlation between documentation quality and testing speed',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Content Prioritisation',
                description: 'How should testers prioritise different types of content issues?',
                options: [
                    {
                        text: 'All issues are equally important and should be reported as such',
                        outcome: 'Not all issues have equal impact.',
                        experience: -10
                    },
                    {
                        text: 'Focus testing activities on spelling errors',
                        outcome: 'This is too narrow in focus and other critical content issues may be missed.',
                        experience: -5
                    },
                    {
                        text: 'Evaluate impact on user experience and brand consistency',
                        outcome: 'Correct! This is the correct approach for prioritisation of issues',
                        experience: 25
                    },
                    {
                        text: 'Prioritise issues based on page location',
                        outcome: 'This can be relevant to the project. However, other critical issues may be missed by taking this approach',
                        experience: 5
                    }
                ]
            }
        ];

        // Initialize UI and add event listeners
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
        // End game if we've answered all questions
        return this.player.questionHistory.length >= this.totalQuestions;
    }

    calculateScorePercentage() {
        // Calculate percentage based on correct answers
        const correctAnswers = this.player.questionHistory.filter(q => 
            q.selectedAnswer && (q.selectedAnswer.isCorrect || q.selectedAnswer.experience > 0)
        ).length;
        
        // Cap the questions answered at total questions
        const questionsAnswered = Math.min(this.player.questionHistory.length, this.totalQuestions);
        
        return questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
    }

    async saveProgress() {
        // Determine the status based on clear conditions
        let status = 'in-progress';
        
        // Check for completion (all questions answered)
        if (this.player.questionHistory.length >= this.totalQuestions) {
            // Calculate percentage score
            const scorePercentage = this.calculateScorePercentage();
            status = scorePercentage >= this.passPercentage ? 'passed' : 'failed';
        }

        const progress = {
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
                return;
            }
            
            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify({ data: progress }));
            
            console.log('Saving progress with status:', status, 'scorePercentage:', progress.scorePercentage);
            await this.apiService.saveQuizProgress(this.quizName, progress);
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }

    async loadProgress() {
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot load progress');
                return false;
            }

            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            const savedProgress = await this.apiService.getQuizProgress(this.quizName);
            console.log('Raw API Response:', savedProgress);
            let progress = null;
            
            if (savedProgress && savedProgress.data) {
                // Normalize the data structure
                progress = {
                    experience: savedProgress.data.experience || 0,
                    tools: savedProgress.data.tools || [],
                    questionHistory: savedProgress.data.questionHistory || [],
                    currentScenario: savedProgress.data.currentScenario || 0,
                    status: savedProgress.data.status || 'in-progress',
                    scorePercentage: savedProgress.data.scorePercentage || 0
                };
                console.log('Normalized progress data:', progress);
            } else {
                // Try loading from localStorage as fallback
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    progress = parsed.data || parsed;
                    console.log('Loaded progress from localStorage:', progress);
                }
            }

            if (progress) {
                // Set the player state from progress
                this.player.experience = progress.experience || 0;
                this.player.tools = progress.tools || [];
                this.player.questionHistory = progress.questionHistory || [];
                this.player.currentScenario = progress.currentScenario || 0;

                // Ensure we're updating the UI correctly
                this.updateProgress();
                
                // Check quiz status and show appropriate screen
                if (progress.status === 'failed' || progress.status === 'passed') {
                    this.endGame(progress.status === 'failed');
                    return true;
                }

                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to load progress:', error);
            return false;
        }
    }

    displayScenario() {
        const currentScenarios = this.getCurrentScenarios();
        
        // Check if we've answered all questions
        if (this.shouldEndGame()) {
            const scorePercentage = this.calculateScorePercentage();
            this.endGame(scorePercentage < this.passPercentage);
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
            questionProgress.textContent = `Question: ${this.currentQuestionNumber}/${this.totalQuestions}`;
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
            const scenario = currentScenarios[this.player.currentScenario];
            const originalIndex = parseInt(selectedOption.value);
            
            const selectedAnswer = scenario.options[originalIndex];

            // Keep track of experience for backward compatibility
            this.player.experience = Math.max(0, Math.min(this.maxXP, this.player.experience + selectedAnswer.experience));
            
            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add to question history with isCorrect property
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                isCorrect: selectedAnswer.isCorrect || selectedAnswer.experience > 0,
                timeSpent: timeSpent,
                timedOut: false
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();

            // Calculate the score percentage
            const scorePercentage = this.calculateScorePercentage();
            
            // Save quiz result
            const username = localStorage.getItem('username');
            if (username) {
                const quizUser = new QuizUser(username);
                await quizUser.updateQuizScore(
                    this.quizName,
                    scorePercentage,
                    this.player.experience,
                    this.player.tools,
                    this.player.questionHistory,
                    this.player.questionHistory.length
                );
            }

            // Show outcome screen
            if (this.gameScreen && this.outcomeScreen) {
                this.gameScreen.classList.add('hidden');
                this.outcomeScreen.classList.remove('hidden');
            }
            
            // Update outcome display
            let outcomeText = selectedAnswer.outcome;
            document.getElementById('outcome-text').textContent = outcomeText;
            
            // Display result instead of XP
            const resultText = selectedAnswer.isCorrect || selectedAnswer.experience > 0 ? 'Correct!' : 'Incorrect';
            document.getElementById('xp-gained').textContent = resultText;
            
            if (selectedAnswer.tool) {
                document.getElementById('tool-gained').textContent = `Tool acquired: ${selectedAnswer.tool}`;
                if (!this.player.tools.includes(selectedAnswer.tool)) {
                    this.player.tools.push(selectedAnswer.tool);
                }
            } else {
                document.getElementById('tool-gained').textContent = '';
            }

            this.updateProgress();
            
            // Check if we should end the game
            if (this.shouldEndGame()) {
                await this.endGame(scorePercentage < this.passPercentage);
            }
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
            questionInfoElement.textContent = `Question: ${questionNumber}/${this.totalQuestions}`;
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
            questionProgress.textContent = `Question: ${questionNumber}/${this.totalQuestions}`;
        }
        
        if (progressFill) {
            const progressPercentage = (totalAnswered / this.totalQuestions) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
    }

    generateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations');
        if (!recommendationsContainer) return;

        const scorePercentage = this.calculateScorePercentage();
        const weakAreas = [];
        const strongAreas = [];

        // Analyze performance in different areas
        this.player.questionHistory.forEach(record => {
            const isCorrect = record.isCorrect;
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

        if (scorePercentage >= 90 && weakAreas.length === 0) {
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of content copy testing. You clearly understand the nuances of content copy testing and are well-equipped to handle any content copy testing challenges!</p>';
        } else if (scorePercentage >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your content copy testing skills are very strong. To achieve complete mastery, consider focusing on:</p>';
            recommendationsHTML += '<ul>';
            if (weakAreas.length > 0) {
                weakAreas.forEach(area => {
                    recommendationsHTML += `<li>${this.getRecommendation(area)}</li>`;
                });
            }
            recommendationsHTML += '</ul>';
        } else if (scorePercentage >= 70) {
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

    async endGame(failed = false) {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        // Hide the progress card on the end screen
        const progressCard = document.querySelector('.quiz-header-progress');
        if (progressCard) {
            progressCard.style.display = 'none';
        }

        // Calculate score percentage
        const scorePercentage = this.calculateScorePercentage();
        const isPassed = scorePercentage >= this.passPercentage;
        
        // Determine final status
        const finalStatus = failed ? 'failed' : (isPassed ? 'passed' : 'failed');
        
        // Save the final quiz result with pass/fail status
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                console.log('Setting final quiz status:', { status: finalStatus, score: scorePercentage });
                
                // Save to QuizUser
                await user.updateQuizScore(
                    this.quizName,
                    scorePercentage,
                    this.player.experience,
                    this.player.tools,
                    this.player.questionHistory,
                    this.player.questionHistory.length,
                    finalStatus
                );

                // Clear localStorage data for this quiz
                this.clearQuizLocalStorage(username, this.quizName);

                // Save to API with proper structure
                const progress = {
                    experience: this.player.experience,
                    tools: this.player.tools,
                    currentScenario: this.player.currentScenario,
                    questionHistory: this.player.questionHistory,
                    lastUpdated: new Date().toISOString(),
                    questionsAnswered: this.player.questionHistory.length,
                    status: finalStatus,
                    scorePercentage: scorePercentage
                };

                // Save directly via API to ensure status is updated
                console.log('Saving final progress to API:', progress);
                await this.apiService.saveQuizProgress(this.quizName, progress);
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${scorePercentage}%`;

        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = failed ? 'Quiz Failed!' : 'Quiz Complete!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (failed) {
            performanceSummary.textContent = `Quiz failed. You scored ${scorePercentage}% but needed at least ${this.passPercentage}% to pass.`;
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
            // Find the appropriate threshold message
            const threshold = this.config.performanceThresholds.find(t => t.threshold <= scorePercentage);
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
                
                const isCorrect = record.isCorrect;
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

    // Utility method to clean up localStorage
    clearQuizLocalStorage(username, quizName) {
        const variations = [
            quizName,
            quizName.toLowerCase(),
            quizName.toUpperCase(),
            quizName.replace(/-/g, ''),
            quizName.replace(/([A-Z])/g, '-$1').toLowerCase(),
            quizName.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
            quizName.replace(/-/g, '_')
        ];

        variations.forEach(variant => {
            localStorage.removeItem(`quiz_progress_${username}_${variant}`);
            localStorage.removeItem(`quizResults_${username}_${variant}`);
        });
    }
}

// Initialize quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new ContentCopyQuiz();
    quiz.startGame();
}); 