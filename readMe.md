# QA Testing Quiz Platform 🎮

A comprehensive web-based quiz platform for software testing education with admin dashboard and user progress tracking.

## Overview 🎯

An interactive learning platform where users progress through various QA testing domains while administrators can track performance and manage content.

### Core Features ✨

- **User Authentication**: Secure login system for both users and administrators
- **Multiple Testing Domains**:
  - Risk Management & Analysis
  - Non-functional Testing
  - Time Management
  - Issue Tracking & Verification
  - Reports & Documentation
  - Test Support
  - Tester Mindset
- **Admin Dashboard**:
  - User progress monitoring
  - Performance analytics
  - Sorting by username, scores, and completion dates
  - Filtering by quiz types
- **Progress Tracking**: 
  - Individual quiz scores
  - Overall performance metrics
  - Completion timestamps
- **Accessibility**: ARIA labels and keyboard navigation

## Technical Implementation 🛠

### Prerequisites
- Node.js (v14+)
- MongoDB
- Modern web browser

### MongoDB Implementation

1. **Install Dependencies**:
```bash
npm install mongodb express mongoose dotenv
```

2. **Create MongoDB Schema**:
```javascript
// models/User.js
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    quizResults: [{
        quizName: String,
        score: Number,
        completedAt: Date,
        answers: [mongoose.Schema.Types.Mixed]
    }]
});

// models/Admin.js
const adminSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'admin' }
});
```

3. **Environment Setup**:
```env
MONGODB_URI=mongodb://localhost:27017/qa_quiz
JWT_SECRET=your_jwt_secret
```

4. **API Routes**:
```javascript
// routes/auth.js
router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);

// routes/quiz.js
router.get('/results', quizController.getResults);
router.post('/submit', quizController.submitQuiz);

// routes/admin.js
router.get('/users', adminController.getAllUsers);
router.get('/analytics', adminController.getAnalytics);
```

### File Structure
```
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── admin.html
│   ├── styles.css
│   ├── pages/
│   └── quizzes/
└── README.md
```

### Security Implementation
- JWT for authentication
- Password hashing using bcrypt
- Rate limiting for API endpoints
- CORS configuration
- XSS protection

## Development Setup 💻

1. **Clone Repository**:
```bash
git clone [repository-url]
cd qa-quiz-platform
```

2. **Install Dependencies**:
```bash
npm install
```

3. **Start MongoDB**:
```bash
mongod --dbpath /path/to/data/db
```

4. **Run Application**:
```bash
npm run dev
```

## Testing 🧪

```bash
npm test
```

## API Documentation 📚

### Authentication
- POST `/api/auth/login`
- POST `/api/auth/admin/login`
- POST `/api/auth/logout`

### Quiz Operations
- GET `/api/quiz/all`
- POST `/api/quiz/submit`
- GET `/api/quiz/results/:userId`

### Admin Operations
- GET `/api/admin/users`
- GET `/api/admin/analytics`
- PUT `/api/admin/quiz/:quizId`

## Future Enhancements 🚀

- Real-time analytics dashboard
- User performance graphs
- Quiz content management system
- API documentation using Swagger
- Docker containerization
- CI/CD pipeline setup
- Enhanced security features

## Contributing 🤝

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License 📄

[MIT License](LICENSE)
