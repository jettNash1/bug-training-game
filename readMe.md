# QA Testing Quiz Game 🎮

A comprehensive web-based quiz game teaching software testing concepts through interactive scenarios. Players progress through specialized testing domains while learning QA best practices.

## Overview 🎯

Players take on the role of a QA tester, exploring various aspects of software testing through interactive quizzes covering different domains:
- Risk Management
- Non-functional Testing
- Risk Analysis
- Time Management
- Issue Tracking Tools
- Raising Tickets
- Issue Verification
- Tester Mindset

Each quiz presents unique testing scenarios with multiple-choice answers. Players earn experience points (XP) and tools based on their decisions.

## Features ✨

- **Multiple Specialized Domains**: Each focusing on critical QA skills
- **Dynamic XP System**: Maximum 300 points per quiz
- **Real-world Scenarios**: Covers various testing concepts:
  - Risk Assessment & Management
  - Performance & Load Testing
  - Issue Tracking & Verification
  - Time Management
  - Test Strategy & Planning
  - Documentation Best Practices
- **Randomized Answers**: Options are shuffled to prevent memorization
- **Performance Tracking**: Detailed question review and recommendations
- **Tool Collection**: Earn virtual testing tools for correct answers
- **Accessibility Features**: Keyboard navigation and ARIA support
- **Progress Saving**: Results saved per user account

## Technical Details 🛠

### File Structure - There is more content but this is the main structure
├── index.html
├── pages/
│ ├── issue-tracking-tools.html
│ ├── raising-tickets.html
│ ├── issue-verification.html
│ ├── non-functional-quiz.html
│ └── reports-quiz.html
├── quizzes/
│ ├── issue-tracking-tools-quiz.js
│ ├── raising-tickets-quiz.js
│ ├── issue-verification-quiz.js
│ └── reports-quiz.js
└── readMe.md


### Technologies Used
- HTML5
- CSS3
- Vanilla JavaScript (ES6+)

### Game Progression
1. **Basic Level** (Questions 1-5)
   - Entry level concepts
   - Need 50+ XP to progress
2. **Intermediate Level** (Questions 6-10)
   - Need 150+ XP to reach Advanced
3. **Advanced Level** (Questions 11-15)
   - Expert-level challenges
   - Maximum 300 XP achievable

### XP Distribution
- Basic Level: 15 XP per correct answer
- Intermediate Level: 25 XP per correct answer
- Advanced Level: 20 XP per correct answer
- Penalties range from -5 to -15 XP for incorrect answers

## How to Play 🎲

1. Open `index.html` in a modern web browser
2. Choose a testing domain quiz
3. Read each scenario carefully
4. Select your answer from the randomized options
5. Review feedback, XP gained, and tools earned
6. Progress through levels by making good testing decisions
7. Review performance summary at completion

## Learning Outcomes 📚

Players will learn:
- Domain-specific testing best practices
- Risk assessment and management
- Non-functional testing approaches
- Time management in testing
- Issue tracking and verification
- Strategic decision-making in QA
- Testing tool awareness
- Professional testing methodologies

## Development 💻

### Running Locally
1. Clone the repository
2. Open `index.html` in a web browser
3. No build process or dependencies required

### Modifying Scenarios
Scenarios are defined in each quiz class constructor. Each scenario follows this structure:
javascript
{
   id: number,
   category: string,
   question: string,
   description: string,
   options: [
   {
   text: string,
   correct: boolean,
   explanation: string,
   points: number
   }
]
}


## Future Enhancements 🚀

- Additional testing domains
- Difficulty modes
- Multiplayer mode
- Certification system
- More interactive elements
- Enhanced progress tracking
- Detailed analytics

## Contributing 🤝

Feel free to submit issues and enhancement requests!

## License 📄

[MIT License](LICENSE)