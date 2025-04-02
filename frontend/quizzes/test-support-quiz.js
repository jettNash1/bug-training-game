import { APIService } from '../api-service.js';
import { BaseQuiz } from '../quiz-helper.js';
import { QuizUser } from '../QuizUser.js';

export class TestSupportQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 35 },
                intermediate: { questions: 10, minXP: 110 },
                advanced: { questions: 15, minXP: 235 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding! You\'re a test support expert!' },
                { threshold: 200, message: '👏 Great job! You\'ve shown strong test support skills!' },
                { threshold: 150, message: '👍 Good work! Keep practicing to improve further.' },
                { threshold: 0, message: '📚 Consider reviewing test support best practices and try again!' }
            ]
        };
        
        super(config);
        
        // Set quiz name
        Object.defineProperty(this, 'quizName', {
            value: 'test-support',
            writable: false,
            configurable: false,
            enumerable: true
        });
        
        this.player = {
            name: '',
            experience: 0,
            tools: [],
            currentScenario: 0,
            questionHistory: []
        };
        
        this.apiService = new APIService();

        this.gameScreen = document.getElementById('game-screen');
        this.outcomeScreen = document.getElementById('outcome-screen');
        this.endScreen = document.getElementById('end-screen');
       
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

        // Basic Scenarios (IDs 1-5)
        this.basicScenarios = [
            {
                id: 1,
                level: 'Basic',
                title: 'Morning Communication',
                description: 'You\'re starting your first day on test support. What\'s the most professional first action?',
                options: [
                    {
                        text: 'Send a message to the client checking for specific test tasks and confirm your presence',
                        outcome: 'Perfect! This shows proactive communication and readiness to begin.',
                        experience: 15,
                        tool: 'Client Communication'
                    },
                    {
                        text: 'Start test activities without checking in with client contacts for the project',
                        outcome: 'Morning check-ins are crucial for test support coordination.',
                        experience: -10
                    },
                    {
                        text: 'Wait for the client to contact you directly to coordinate testing activities',
                        outcome: 'Proactive communication is essential in test support. The client can make an informed decision on progress and suggested focus areas.',
                        experience: -5
                    },
                    {
                        text: 'Check internal emails for client instruction or any scheduled meetings',
                        outcome: 'External client communication should be prioritized at start of day when working on a test support project.',
                        experience: 0
                    }
                ]
            },
            {
                id: 2,
                level: 'Basic',
                title: 'Access Verification',
                description: 'You\'re preparing for a test support session. What\'s the most thorough preparation approach?',
                options: [
                    {
                        text: 'Verify access to test URLs, designs, documentation, and tracker board',
                        outcome: 'Excellent! This ensures you\'re fully prepared for testing.',
                        experience: 15,
                        tool: 'Access Management'
                    },
                    {
                        text: 'Check test environment access associated with the URL\'s provided by the client',
                        outcome: 'This is important, although all resources require verification for effective testing.',
                        experience: -10
                    },
                    {
                        text: 'Initiate contact with the client once access is required for the system under test',
                        outcome: 'Proactive access verification is the best approach as this prevents delays in testing activities.',
                        experience: -5
                    },
                    {
                        text: 'Contact the client for access to any required areas during testing',
                        outcome: 'Access to areas needed to commence testing activities should be verified before starting any test activities.',
                        experience: 0
                    }
                ]
            },
            {
                id: 3,
                level: 'Basic',
                title: 'Documentation Management',
                description: 'You\'re starting on an ongoing test support project. What\'s the best documentation approach?',
                options: [
                    {
                        text: 'Create a process document noting important information and project procedures',
                        outcome: 'Perfect! This ensures knowledge retention and consistent processes.',
                        experience: 15,
                        tool: 'Process Documentation'
                    },
                    {
                        text: 'Rely on processes from memory and experience of working with the client on an ongoing basis',
                        outcome: 'Documentation is crucial for consistency and knowledge transfer.',
                        experience: -10
                    },
                    {
                        text: 'Document any major issues that have been raised or previously highlighted by the client',
                        outcome: 'While essential, all processes and important information require documentation for clarity and traceability.',
                        experience: -5
                    },
                    {
                        text: 'Contact the client and ask if there is any documentation in place for current processes',
                        outcome: 'While some procedures the client uses within their work flow will apply. Procedures and processes relating to how Zoonou integrate those are most useful and should be noted',
                        experience: 0
                    }
                ]
            },
            {
                id: 4,
                level: 'Basic',
                title: 'Client Communication Channels',
                description: 'You notice you don\'t have direct client communication access. What\'s the best approach?',
                options: [
                    {
                        text: 'Check with the project manager about getting added to relevant communication channels',
                        outcome: 'Excellent! This ensures a proper communication setup for moving forward.',
                        experience: 15,
                        tool: 'Communication Setup'
                    },
                    {
                        text: 'Proceed without direct communication with the client as the project manager can cover this',
                        outcome: 'Direct client communication is crucial for an ongoing test support role as there will be multiple meetings and potentially multiple releases during weekly testing.',
                        experience: -10
                    },
                    {
                        text: 'Use personal communication methods as this promotes trust',
                        outcome: 'Official channels should always be used for client communication for traceability and process resolution.',
                        experience: -5
                    },
                    {
                        text: 'Use email as a full history thread can be utilised',
                        outcome: 'Established communication channels need to be agreed upon and in general acted upon quickly. Whilst email is an important tool in communication, it is not always the quickest way to resolve any queries.',
                        experience: 0
                    }
                ]
            },
            {
                id: 5,
                level: 'Basic',
                title: 'Project Board Monitoring',
                description: 'How should you approach project board management during test support?',
                options: [
                    {
                        text: 'Keep the board open and regularly monitor it for new tickets and progress updates',
                        outcome: 'Perfect! This ensures timely response to new testing needs.',
                        experience: 15,
                        tool: 'Project Tracking'
                    },
                    {
                        text: 'Check the project board once daily and continue with testing activities',
                        outcome: 'Regular monitoring throughout the day is required to ensure quick response times.',
                        experience: -10
                    },
                    {
                        text: 'Wait for notifications from client contacts to refer to the project board',
                        outcome: 'Proactive board monitoring is essential as notifications will come from different sources and may not be set up fully.',
                        experience: -5
                    },
                    {
                        text: 'Check any assigned tickets from the project board',
                        outcome: 'Overall project progress requires monitoring not only for any tickets that can potentially be resolved, but also for project roadmap assesment.',
                        experience: 0
                    }
                ]
            }
        ];

        // Intermediate Scenarios (IDs 6-10)
        this.intermediateScenarios = [
            {
                id: 6,
                level: 'Intermediate',
                title: 'Client Process Adaptation',
                description: 'You\'re working with a client who uses different terminology and processes. What\'s the best approach?',
                options: [
                    {
                        text: 'Adapt to client terminology and processes while maintaining Zoonou standards',
                        outcome: 'Excellent! This shows flexibility and professionalism.',
                        experience: 20,
                        tool: 'Process Adaptation'
                    },
                    {
                        text: 'Subtly introduce Zoonou terminology throughout the project',
                        outcome: 'Adapting to client processes is crucial for effective collaboration as Zoonou is integrating with their work flow.',
                        experience: -15
                    },
                    {
                        text: 'Continue with Zoonou terminology throughout documentation and reports',
                        outcome: 'Understanding and adapting to client processes is essential. This will also promote less confusion if more resources are required or when reports are submitted to the client',
                        experience: -10
                    },
                    {
                        text: 'Use client terminology in meetings with the client and Zoonou terminology for internal meetings',
                        outcome: 'Adaptation improves collaboration with the client, and making Zoonou colleagues aware of this terminology improves awareness should more project resources be required.',
                        experience: 0
                    }
                ]
            },
            {
                id: 7,
                level: 'Intermediate',
                title: 'Handling Idle Time',
                description: 'You\'re booked for test support but have no tasks due to client delays. What\'s the best approach?',
                options: [
                    {
                        text: 'Inform the project manager and explore additional ways to add value to the project',
                        outcome: 'Excellent! This ensures productive use of time and adds value.',
                        experience: 20,
                        tool: 'Time Management'
                    },
                    {
                        text: 'Wait for tasks to be assigned by the client project manager',
                        outcome: 'Proactive exploration of additional tasks is more beneficial to both the client and the project understanding.',
                        experience: -15
                    },
                    {
                        text: 'Use the time for self-improvement as long as it\'s of benefit to Zoonou',
                        outcome: 'Any down time should be used productively for the specific project. This should also be communicated with the client and project manager',
                        experience: -10
                    },
                    {
                        text: 'Inform the client of availability and what you intend to do with the project downtime',
                        outcome: 'Whilst this is a good approach. The Zoonou project manager should also be made aware as they may need to explore additional opportunities.',
                        experience: 0
                    }
                ]
            },
            {
                id: 8,
                level: 'Intermediate',
                title: 'Communication with Non-Responsive Clients',
                description: 'The client is slow to respond, affecting your testing. What\'s the best approach?',
                options: [
                    {
                        text: 'Maintain open communication, update the project manager, and suggest raising the issue in regular catch-ups',
                        outcome: 'Excellent! This ensures issues are addressed and communication remains open.',
                        experience: 20,
                        tool: 'Communication Management'
                    },
                    {
                        text: 'Stop testing until client responds with how to proceed',
                        outcome: 'Testing should continue with available information and on any other areas possible.',
                        experience: -15
                    },
                    {
                        text: 'Communicate when client responds and look for a resolution to any raised concerns',
                        outcome: 'Proactive communication is essential and it is good practice to follow up on any concerns that have not been addressed.',
                        experience: -10
                    },
                    {
                        text: 'Find a way around the communication issues by raising any issues with other team members',
                        outcome: 'Whilst this approach may work in some instances. It is good practice to address communication for effective collaboration moving forward.',
                        experience: 0
                    }
                ]
            },
            {
                id: 9,
                level: 'Intermediate',
                title: 'Managing Multiple Projects',
                description: 'You\'re assigned to multiple test support projects. What\'s the best approach to manage your workload?',
                options: [
                    {
                        text: 'Prioritise tasks based on deadlines and importance, communicate availability to project managers',
                        outcome: 'Excellent! This ensures effective workload management.',
                        experience: 20,
                        tool: 'Workload Management'
                    },
                    {
                        text: 'Focus on one project at a time using prior experience and preference',
                        outcome: 'Multiple projects require balanced attention as clients will base project time management around any issues raised.',
                        experience: -15
                    },
                    {
                        text: 'Rely on project managers to assign priorities as they are aligned with the client and business needs',
                        outcome: 'Proactive project prioritisation is a preferred approach. However, this should also be cross referenced with the project managers',
                        experience: -10
                    },
                    {
                        text: 'Work on the project that has the shortest time line in regards to project release dates',
                        outcome: 'All projects need attention based on priorities. However, there may be other contributing factors and shorter sprints within competing projects. In this instance the project manager should be informed of any decisions moving forward',
                        experience: 0
                    }
                ]
            },
            {
                id: 10,
                level: 'Intermediate',
                title: 'Building Client Relationships',
                description: 'You\'re new to a test support project. How do you build a strong relationship with the client?',
                options: [
                    {
                        text: 'Communicate regularly, provide valuable feedback, and demonstrate understanding of their needs',
                        outcome: 'Excellent! This builds trust and rapport with the client.',
                        experience: 20,
                        tool: 'Relationship Building'
                    },
                    {
                        text: 'Communicate if necessary and when major issues need resolving',
                        outcome: 'Regular communication is key to building a good working relationship. Process improvements, project progress and suggestions are also an important factor in test support roles',
                        experience: -15
                    },
                    {
                        text: 'Focus communication on testing tasks relating to the project',
                        outcome: 'Building relationships requires more than task completion. Process improvements, project progress and suggestions are also an important factor in test support roles',
                        experience: -10
                    },
                    {
                        text: 'Wait for client to initiate relationship building through communication channels',
                        outcome: 'Proactive relationship building is the preferred approach as this promotes professionalism towards the project and client trust.',
                        experience: 0
                    }
                ]
            }
        ];

        // Advanced Scenarios (IDs 11-15)
        this.advancedScenarios = [
            {
                id: 11,
                level: 'Advanced',
                title: 'Independent Decision Making',
                description: 'You\'ve identified a more efficient testing approach. How do you proceed?',
                options: [
                    {
                        text: 'Communicate the approach to the project manager and client, providing rationale and expected benefits',
                        outcome: 'Excellent! This demonstrates initiative and effective communication.',
                        experience: 25,
                        tool: 'Decision Making'
                    },
                    {
                        text: 'Implement the approach after consulting with the Zoonou project manager',
                        outcome: 'Consultation ensures alignment and acceptance. So this should also be communicated with the client to gain their feedback',
                        experience: -15
                    },
                    {
                        text: 'Leave any new approaches to processes as the client will have the current processes in place for a good period of time',
                        outcome: 'Innovative approaches should always be communicated and explored.',
                        experience: -10
                    },
                    {
                        text: 'Always wait for client to suggest changes as they have a better insight to business goals',
                        outcome: 'Proactive suggestions are a valuable asset in gaining a good working relationship and a collaborative approach.',
                        experience: -5
                    }
                ]
            },
            {
                id: 12,
                level: 'Advanced',
                title: 'Handling Client Requests',
                description: 'A client requests a change that deviates from Zoonou\'s standard processes. What\'s the best approach?',
                options: [
                    {
                        text: 'Discuss the request with your line manager for approval before responding to the client',
                        outcome: 'Excellent! This ensures proper alignment and authority.',
                        experience: 25,
                        tool: 'Request Management'
                    },
                    {
                        text: 'Agree to the request and carry out the process within the project testing activities',
                        outcome: 'Approval is needed for deviations from standard processes.',
                        experience: -15
                    },
                    {
                        text: 'Decline the request and continue with usual standard processes',
                        outcome: 'Discussion with the client, project manager and line manager ensures understanding and potential compromise.',
                        experience: -10
                    },
                    {
                        text: 'Don\'t respond to the request as the client should propose this directly through the business channels agreed',
                        outcome: 'Whilst this may be true in some circumstances. It essential for good communication, business collaboration and quick resolution that the client can feel the need to come directly to the person working on the project.',
                        experience: -5
                    }
                ]
            },
            {
                id: 13,
                level: 'Advanced',
                title: 'Knowledge Retention',
                description: 'You\'re leaving a long-term test support project. How do you ensure knowledge retention?',
                options: [
                    {
                        text: 'Create a comprehensive handover guide documenting processes and key information',
                        outcome: 'Excellent! This ensures smooth transition and knowledge retention.',
                        experience: 25,
                        tool: 'Knowledge Management'
                    },
                    {
                        text: 'Promote a verbal handover process that doesn\'t require documentation',
                        outcome: 'Written documentation ensures thorough knowledge transfer and can be updated in line with changes for future reference and traceability.',
                        experience: -15
                    },
                    {
                        text: 'Document all major issues that have been resolved and that are still open',
                        outcome: 'All relevant information needs documentation. Including business processes and project progress',
                        experience: -10
                    },
                    {
                        text: 'Provide updated links to client documentation',
                        outcome: 'Whilst client documentation is essential. Any documentation on all aspects of the project gathered by Zoonou should be updated and shared for continuity.',
                        experience: -5
                    }
                ]
            },
            {
                id: 14,
                level: 'Advanced',
                title: 'Managing Client Expectations',
                description: 'A client expects more testing than the agreed scope allows. How do you manage this?',
                options: [
                    {
                        text: 'Communicate scope limitations clearly and discuss potential adjustments with the project manager',
                        outcome: 'Excellent! This ensures clear expectations and potential solutions.',
                        experience: 25,
                        tool: 'Expectation Management'
                    },
                    {
                        text: 'Attempt to meet the client expectations regardless of scope',
                        outcome: 'Scope limitations need clear communication as new updates to what is expected may exceed agreed project time frames.',
                        experience: -15
                    },
                    {
                        text: 'Continue to reach the initial scope and expectations set out in planning',
                        outcome: 'Expectations need addressing and managing, especially if new targets are set mid project.',
                        experience: -10
                    },
                    {
                        text: 'Inform the project manager without client communication',
                        outcome: 'Direct client communication is essential as this will promote a good working relationship and inform them of what can be expected within the time frame set.',
                        experience: -5
                    }
                ]
            },
            {
                id: 15,
                level: 'Advanced',
                title: 'Long-Term Client Engagement',
                description: 'You\'re leading a long-term test support project. How do you ensure ongoing success?',
                options: [
                    {
                        text: 'Maintain regular communication, adapt to client needs, and continuously improve processes',
                        outcome: 'Excellent! This ensures long-term success and client satisfaction.',
                        experience: 25,
                        tool: 'Project Leadership'
                    },
                    {
                        text: 'Follow initial client processes without change',
                        outcome: 'Continuous improvement is key to long-term success and any potential improvements to processes should be communicated and explored.',
                        experience: -15
                    },
                    {
                        text: 'Focus on immediate tasks set out in planning and meetings',
                        outcome: 'Long-term success requires strategic focus and this should be continuously monitored to mitigate any project risks.',
                        experience: -10
                    },
                    {
                        text: 'Wait for client feedback to current progress to make any changes that may benefit the project',
                        outcome: 'Proactive improvement is the preferred approach and promotes good awareness of the business goals and a good collaborative relationship.',
                        experience: -5
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

    shouldEndGame(totalQuestionsAnswered, currentXP) {
        return totalQuestionsAnswered >= 15 || currentXP >= this.maxXP;
    }

    async saveProgress() {
        // First determine the status based on clear conditions
        let status = 'in-progress';
        
        // Check for completion (all 15 questions answered)
        if (this.player.questionHistory.length >= 15) {
            // Check if they met the advanced XP requirement
            if (this.player.experience >= this.levelThresholds.advanced.minXP) {
                status = 'completed';
            } else {
                status = 'failed';
            }
        } 
        // Check for early failure conditions
        else if (
            (this.player.questionHistory.length >= 10 && this.player.experience < this.levelThresholds.intermediate.minXP) ||
            (this.player.questionHistory.length >= 5 && this.player.experience < this.levelThresholds.basic.minXP)
        ) {
            status = 'failed';
        }

        const progress = {
            data: {
                experience: this.player.experience,
                tools: this.player.tools,
                currentScenario: this.player.currentScenario,
                questionHistory: this.player.questionHistory,
                lastUpdated: new Date().toISOString(),
                questionsAnswered: this.player.questionHistory.length,
                status: status
            }
        };

        try {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error('No user found, cannot save progress');
                return;
            }
            
            // Use user-specific key for localStorage
            const storageKey = `quiz_progress_${username}_${this.quizName}`;
            localStorage.setItem(storageKey, JSON.stringify(progress));
            
            console.log('Saving progress with status:', status);
            await this.apiService.saveQuizProgress(this.quizName, progress.data);
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
                    status: savedProgress.data.status || 'in-progress'
                };
                console.log('Normalized progress data:', progress);
            } else {
                // Try loading from localStorage as fallback
                const localData = localStorage.getItem(storageKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    progress = parsed;
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
                if (progress.status === 'failed') {
                    this.endGame(true);
                    return true;
                } else if (progress.status === 'completed') {
                    this.endGame(false);
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

            // Initialize event listeners
            this.initializeEventListeners();

            // Load previous progress
            const hasProgress = await this.loadProgress();
            console.log('Previous progress loaded:', hasProgress);
            
            if (!hasProgress) {
                // Reset player state if no valid progress exists
                this.player.experience = 0;
                this.player.tools = [];
                this.player.currentScenario = 0;
                this.player.questionHistory = [];
            }
            
            // Clear any existing transition messages
            const transitionContainer = document.getElementById('level-transition-container');
            if (transitionContainer) {
                transitionContainer.innerHTML = '';
                transitionContainer.classList.remove('active');
            }

            // Clear any existing timer
            if (this.questionTimer) {
                clearInterval(this.questionTimer);
            }
            
            await this.displayScenario();
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
        const currentScenarios = this.getCurrentScenarios();
        
        // Check basic level completion
        if (this.player.questionHistory.length >= 5) {
            if (this.player.experience < this.levelThresholds.basic.minXP) {
                this.endGame(true); // End with failure state
                return;
            }
        }

        // Check intermediate level completion
        if (this.player.questionHistory.length >= 10) {
            if (this.player.experience < this.levelThresholds.intermediate.minXP) {
                this.endGame(true); // End with failure state
                return;
            }
        }

        // Check Advanced level completion
        if (this.player.questionHistory.length >= 15) {
            if (this.player.experience < this.levelThresholds.advanced.minXP) {
                this.endGame(true); // End with failure state
                return;
            } else {
                this.endGame(false); // Completed successfully
                return;
            }
        }

        // Get the next scenario based on current progress
        let scenario;
        const questionCount = this.player.questionHistory.length;
        
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

            // Calculate new experience with level-based minimum thresholds
            let newExperience = this.player.experience + selectedAnswer.experience;
            
            // Apply minimum thresholds based on current level
            const questionCount = this.player.questionHistory.length;
            if (questionCount >= 5) { // Intermediate level
                newExperience = Math.max(this.levelThresholds.basic.minXP, newExperience);
            }
            if (questionCount >= 10) { // Advanced level
                newExperience = Math.max(this.levelThresholds.intermediate.minXP, newExperience);
            }

            // Update player experience with bounds
            this.player.experience = Math.max(0, Math.min(this.maxXP, newExperience));
            
            // Calculate time spent on this question
            const timeSpent = this.questionStartTime ? Date.now() - this.questionStartTime : null;

            // Add status to question history
            this.player.questionHistory.push({
                scenario: scenario,
                selectedAnswer: selectedAnswer,
                status: selectedAnswer.experience > 0 ? 'passed' : 'failed',
                maxPossibleXP: Math.max(...scenario.options.map(o => o.experience)),
                timeSpent: timeSpent,
                timedOut: false
            });

            // Increment current scenario
            this.player.currentScenario++;

            // Save progress
            await this.saveProgress();

            // Calculate the score and experience
            const totalQuestions = 15;
            const completedQuestions = this.player.questionHistory.length;
            const percentComplete = Math.round((completedQuestions / totalQuestions) * 100);
            
            const score = {
                quizName: this.quizName,
                score: percentComplete,
                experience: this.player.experience,
                questionHistory: this.player.questionHistory,
                questionsAnswered: completedQuestions,
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

            // Show outcome screen and update display with answer outcome
            BaseQuiz.prototype.displayOutcome.call(this, selectedAnswer);

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
        // Update experience display
        const experienceDisplay = document.getElementById('experience-display');
        if (experienceDisplay) {
            experienceDisplay.textContent = `XP: ${this.player.experience}/${this.maxXP}`;
        }

        // Update question progress
        const questionProgress = document.getElementById('question-progress');
        const progressFill = document.getElementById('progress-fill');
        if (questionProgress && progressFill) {
            const totalQuestions = 15;
            const completedQuestions = Math.min(this.player.questionHistory.length, totalQuestions);
            
            // Use stored question number for consistency
            questionProgress.textContent = `Question: ${this.currentQuestionNumber || completedQuestions}/15`;
            
            // Update progress bar
            const progressPercentage = (completedQuestions / totalQuestions) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }

        // Update level indicator
        const levelIndicator = document.getElementById('level-indicator');
        if (levelIndicator) {
            const currentLevel = this.getCurrentLevel();
            levelIndicator.textContent = `Level: ${currentLevel}`;
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
        const currentXP = this.player.experience;
        
        // Check for level progression
        if (totalAnswered >= 10 && currentXP >= this.levelThresholds.intermediate.minXP) {
            return this.advancedScenarios;
        } else if (totalAnswered >= 5 && currentXP >= this.levelThresholds.basic.minXP) {
            return this.intermediateScenarios;
        }
        return this.basicScenarios;
    }

    getCurrentLevel() {
        const totalAnswered = this.player.questionHistory.length;
        const currentXP = this.player.experience;
        
        if (totalAnswered >= 10 && currentXP >= this.levelThresholds.intermediate.minXP) {
            return 'Advanced';
        } else if (totalAnswered >= 5 && currentXP >= this.levelThresholds.basic.minXP) {
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
            recommendationsHTML = '<p>🌟 Outstanding! You have demonstrated mastery in all aspects of test support. You clearly understand the nuances of test support and are well-equipped to handle any test support challenges!</p>';
        } else if (score >= 80) {
            recommendationsHTML = '<p>🌟 Excellent performance! Your test support skills are very strong. To achieve complete mastery, consider focusing on:</p>';
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

        if (title.includes('access') || description.includes('access')) {
            return 'Access Management';
        } else if (title.includes('documentation') || description.includes('documentation')) {
            return 'Documentation Management';
        } else if (title.includes('board') || description.includes('board')) {
            return 'Project Tracking';
        } else if (title.includes('client') || description.includes('client')) {
            return 'Client Communication';
        } else if (title.includes('idle') || description.includes('idle')) {
            return 'Time Management';
        } else if (title.includes('process') || description.includes('process')) {
            return 'Process Adherence';
        } else if (title.includes('team') || description.includes('team')) {
            return 'Team Collaboration';
        } else {
            return 'General Support Skills';
        }
    }

    getRecommendation(area) {
        const recommendations = {
            'Access Management': 'Focus on proactively verifying and maintaining access to all necessary testing resources and systems.',
            'Documentation Management': 'Improve documentation practices for processes, issues, and project-specific information.',
            'Project Tracking': 'Enhance your approach to monitoring project boards and maintaining up-to-date ticket status.',
            'Client Communication': 'Strengthen professional communication skills and proper handling of client requests.',
            'Time Management': 'Work on effectively managing support time, including handling idle periods productively.',
            'Process Adherence': 'Focus on understanding and following standard processes while knowing when to escalate exceptions.',
            'Team Collaboration': 'Develop better coordination with team members and stakeholders during support activities.',
            'General Support Skills': 'Continue developing fundamental test support skills and best practices.'
        };

        return recommendations[area] || 'Continue practicing core test support principles.';
    }

    async endGame(failed = false) {
        this.gameScreen.classList.add('hidden');
        this.outcomeScreen.classList.add('hidden');
        this.endScreen.classList.remove('hidden');

        const finalScore = Math.min(this.player.experience, this.maxXP);
        const scorePercentage = Math.round((finalScore / this.maxXP) * 100);
        
        // Save the final quiz result with pass/fail status
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = new QuizUser(username);
                const status = failed ? 'failed' : 'completed';
                console.log('Setting final quiz status:', { status, score: scorePercentage });
                
                const result = {
                    score: scorePercentage,
                    status: status,
                    experience: this.player.experience,
                    questionHistory: this.player.questionHistory,
                    questionsAnswered: this.player.questionHistory.length,
                    lastActive: new Date().toISOString()
                };

                // Save to QuizUser
                user.updateQuizScore(
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
            } catch (error) {
                console.error('Error saving final quiz score:', error);
            }
        }

        document.getElementById('final-score').textContent = `Final Score: ${finalScore}/${this.maxXP}`;
        
        // Update the quiz complete header based on status
        const quizCompleteHeader = document.querySelector('#end-screen h2');
        if (quizCompleteHeader) {
            quizCompleteHeader.textContent = failed ? 'Quiz Failed!' : 'Quiz Complete!';
        }

        const performanceSummary = document.getElementById('performance-summary');
        if (failed) {
            performanceSummary.textContent = 'Quiz failed. You did not meet the minimum XP requirement to progress. You cannot retry this quiz.';
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
            const threshold = this.performanceThresholds.find(t => t.threshold <= finalScore);
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
                
                const maxXP = Math.max(...record.scenario.options.map(o => o.experience));
                const earnedXP = record.selectedAnswer.experience;
                const isCorrect = earnedXP === maxXP;
                
                reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');
                
                reviewItem.innerHTML = `
                    <h4>Question ${index + 1}</h4>
                    <p class="scenario">${record.scenario.description}</p>
                    <p class="answer"><strong>Your Answer:</strong> ${record.selectedAnswer.text}</p>
                    <p class="outcome"><strong>Outcome:</strong> ${record.selectedAnswer.outcome}</p>
                    <p class="xp"><strong>Experience Earned:</strong> ${earnedXP}/${maxXP}</p>
                `;
                
                reviewList.appendChild(reviewItem);
            });
        }

        this.generateRecommendations();
    }
}

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new TestSupportQuiz();
    quiz.startGame();
}); 
