# QA Testing quiz 🎮

A web-based quiz game that teaches software testing concepts through interactive scenarios. Players progress through different testing levels while learning best practices in QA.

## Overview 🎯

Players take on the role of a QA tester, progressing through various levels of expertise:
- Basic I & II
- Intermediate I & II
- Advanced

Each level presents unique testing scenarios with multiple-choice answers. Players earn experience points (XP) and tools based on their decisions.

## Features ✨

- **Progressive Difficulty**: 25 unique scenarios across 5 difficulty levels
- **Dynamic XP System**: Maximum 500 points achievable
- **Real-world Scenarios**: Covers various testing concepts:
  - Test Environment Setup
  - Browser Compatibility
  - Performance Testing
  - Security Testing
  - API Testing
  - Mobile Testing
  - Accessibility Testing
  - Database Testing
  - And more!
- **Randomized Answers**: Options are shuffled to prevent memorization
- **Performance Tracking**: Detailed question review and recommendations
- **Tool Collection**: Earn virtual testing tools for correct answers

## Technical Details 🛠

### File Structure
├── index.html
├── styles.css
├── game.js
└── readMe.md


### Technologies Used
- HTML5
- CSS3
- Vanilla JavaScript (ES6+)

### Game Progression
1. **Basic I** (Questions 1-5)
   - Entry level concepts
   - Need 25+ XP to progress
2. **Basic II** (Questions 6-10)
   - Need 75+ XP to reach Intermediate
3. **Intermediate I** (Questions 11-15)
   - More complex scenarios
4. **Intermediate II** (Questions 16-20)
   - Need 250+ XP to reach Advanced
5. **Advanced** (Questions 21-25)
   - Expert-level challenges

### XP Distribution
- Basic Levels: 10 XP per correct answer
- Intermediate Levels: 25 XP per correct answer
- Advanced Level: 30 XP per correct answer
- Maximum Total: 500 XP

## How to Play 🎲

1. Open `index.html` in a modern web browser
2. Read each scenario carefully
3. Select your answer from the randomized options
4. Review feedback and earned XP
5. Progress through levels by making good testing decisions
6. Review performance summary at game completion

## Learning Outcomes 📚

Players will learn:
- Best practices in software testing
- Common testing pitfalls to avoid
- Strategic decision-making in QA
- Testing tool awareness
- Professional testing approaches

## Development 💻

### Running Locally
1. Clone the repository
2. Open `index.html` in a web browser
3. No build process or dependencies required

### Modifying Scenarios
Scenarios are defined in `game.js` within the `TestingRPG` class constructor. Each scenario follows this structure:
javascript
{
  id: number,
  level: string,
  title: string,
  description: string,
  options: [
    {
      text: string,
      outcome: string,
      experience: number,
      tool?: string
    }
  ]
}

## Future Enhancements 🚀

- Additional scenario categories
- Difficulty modes
- Save/load progress
- Multiplayer mode
- Certification system
- More interactive elements

## Contributing 🤝

Feel free to submit issues and enhancement requests!

## License 📄

[MIT License](LICENSE)