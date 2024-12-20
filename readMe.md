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

## Installation & Setup 💾

### Required Dependencies

1. **Core Dependencies**:
```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken cors
```

2. **Development Dependencies**:
```bash
npm install --save-dev nodemon jest supertest
```

### Setup Steps

1. **Initialize Project**:
```bash
mkdir qa-quiz-platform
cd qa-quiz-platform
npm init -y
```

2. **Create package.json Scripts**:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --watchAll --verbose"
  }
}
```

3. **Install All Dependencies at Once**:
```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken cors && npm install --save-dev nodemon jest supertest
```

4. **Directory Structure Setup**:
```bash
mkdir backend frontend
cd backend
mkdir models routes controllers middleware config tests
```

5. **Environment Setup**:
Create `.env` file in root directory:
```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/qa_quiz
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
```

## Technical Implementation 🛠

### Prerequisites
- Node.js (v14+)
- MongoDB
- Modern web browser

### MongoDB Implementation

1. **MongoDB Schema**:
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

### Running the Application

1. **Development Mode**:
```bash
npm run dev
```

2. **Production Mode**:
```bash
npm start
```

3. **Run Tests**:
```bash
npm test
```

### Troubleshooting Common Issues

1. **MongoDB Connection**:
If MongoDB fails to connect:
```bash
# Start MongoDB service
sudo service mongod start  # Linux
brew services start mongodb  # macOS
```

2. **Port Already in Use**:
```bash
# Find process using port 8080
lsof -i :8080
# Kill process
kill -9 <PID>
```

3. **Node Version Compatibility**:
```bash
# Check Node version
node -v  # Should be v14.0.0 or higher
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

## Security Implementation
- JWT for authentication
- Password hashing using bcrypt
- Rate limiting for API endpoints
- CORS configuration
- XSS protection

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

## Development Setup

1. Start the backend server:

```bash
cd backend
npm install
npm run dev
```

2. In a new terminal, start the frontend server:
```bash
cd frontend
npm install
npm run dev
```

3. Access the application at http://localhost:8080
