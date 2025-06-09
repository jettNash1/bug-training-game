# QA Testing Quiz Platform 🎮

A comprehensive web-based quiz platform for software testing education with admin dashboard and user progress tracking.

## Overview 🎯

An interactive learning platform where users progress through various QA testing domains while administrators can track performance and manage content.

### Core Features ✨

- **User Authentication**: 
  - Secure login system with JWT
  - Local storage persistence
  - Admin and user role separation
  - Session management

- **Multiple Testing Domains**:
  - Standard Script Testing
  - Communication Skills
  - Content Copy Testing
  - Locale Testing
  - Time Management
  - Tester Mindset
  - Test Support
  - Risk Management
  - Risk Analysis
  - Reports
  - Raising Tickets
  - Non-functional Testing

- **Progressive Learning System**:
  - Basic, Intermediate, and Advanced levels
  - Experience (XP) based progression
  - Level-specific thresholds
  - Adaptive difficulty

- **Quiz Features**:
  - Interactive scenarios
  - Multiple choice questions
  - Real-time feedback
  - Progress tracking
  - Performance analytics
  - Detailed recommendations
  - Question history review

- **Admin Dashboard**:
  - User management
  - Quiz analytics
  - Performance tracking
  - Content management
  - User progress monitoring

## Technical Implementation 🛠

### Prerequisites
- Node.js (v14+)
- Modern web browser
- MongoDB database
- Render account for deployment

### Deployment Options 🚀

#### Current Implementation (Render)
- Frontend hosted on AWS S3
- Backend API hosted on Render
- MongoDB Atlas for database
- Currently addressing CORS configuration issues with user authentication

#### Planned AWS Lambda Implementation (In Progress)
- Frontend remains on AWS S3
- Backend to be migrated to AWS Lambda + API Gateway
- MongoDB Atlas connection remains unchanged
- Current blocker: Requires additional AWS IAM permissions:
  - CloudFormation permissions for SAM deployment
  - Lambda function creation/management
  - API Gateway management
  - IAM role creation
  - S3 bucket management for deployments

Required AWS permissions for Lambda deployment:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:CreateChangeSet",
                "cloudformation:CreateStack",
                "cloudformation:DeleteStack",
                "cloudformation:DescribeChangeSet",
                "cloudformation:DescribeStacks",
                "cloudformation:ExecuteChangeSet",
                "cloudformation:GetTemplateSummary",
                "cloudformation:ListStacks",
                "cloudformation:UpdateStack",
                "s3:CreateBucket",
                "s3:PutObject",
                "iam:CreateRole",
                "iam:GetRole",
                "iam:DeleteRole",
                "iam:PutRolePolicy",
                "iam:DeleteRolePolicy",
                "lambda:CreateFunction",
                "lambda:GetFunction",
                "lambda:DeleteFunction",
                "lambda:UpdateFunctionCode",
                "lambda:UpdateFunctionConfiguration",
                "lambda:AddPermission",
                "lambda:RemovePermission"
            ],
            "Resource": "*"
        }
    ]
}
```

### Adding New Quizzes

The platform is designed to be easily extensible with new quizzes. Follow these steps to add a new quiz:

1. **Create Quiz JavaScript File**
   - Copy an existing quiz file from `frontend/quizzes/`
   - Rename appropriately (e.g., `new-domain-quiz.js`)
   - Update the class name and quiz configuration:

```javascript
export class NewDomainQuiz extends BaseQuiz {
    constructor() {
        const config = {
            maxXP: 300,
            levelThresholds: {
                basic: { questions: 5, minXP: 50 },
                intermediate: { questions: 10, minXP: 150 },
                advanced: { questions: 15, minXP: 300 }
            },
            performanceThresholds: [
                { threshold: 250, message: '🏆 Outstanding!' },
                { threshold: 200, message: '👏 Great job!' },
                { threshold: 150, message: '👍 Good work!' },
                { threshold: 0, message: '📚 Keep practicing!' }
            ]
        };
        super(config);
        
        Object.defineProperty(this, 'quizName', {
            value: 'new-domain-quiz',
            writable: false,
            configurable: false,
            enumerable: true
        });
        // ... rest of constructor
    }
}
```

2. **Define Quiz Scenarios**
   - Structure scenarios in difficulty levels (Basic, Intermediate, Advanced)
   - Each scenario should follow this format:

```javascript
this.basicScenarios = [
    {
        id: 1,
        level: 'Basic',
        title: 'Scenario Title',
        description: 'Scenario Question',
        options: [
            {
                text: 'Option 1',
                outcome: 'Feedback for this choice',
                experience: 15  // XP points (positive for correct, negative for wrong)
            },
            // ... more options
        ]
    }
    // ... more scenarios
];
```

3. **Create HTML Page**
   - Copy an existing quiz HTML file from `frontend/pages/`
   - Update the title, imports, and quiz initialization:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>New Domain Quiz</title>
    <!-- ... existing head content ... -->
</head>
<body>
    <div id="game-container">
        <!-- ... game screens ... -->
    </div>
    <script type="module">
        import { NewDomainQuiz } from '../quizzes/new-domain-quiz.js';
        const quiz = new NewDomainQuiz();
        quiz.startGame();
    </script>
</body>
</html>
```

4. **Update Navigation**
   - Add the new quiz to `index.html`:

```html
<div class="quiz-card">
    <h3>New Domain Quiz</h3>
    <p>Test your knowledge of the new domain</p>
    <a href="pages/new-domain-quiz.html" class="btn">Start Quiz</a>
</div>
```

5. **Update Admin Dashboard**
   - Add the quiz to `admin.js` for analytics tracking:

```javascript
const quizTypes = [
    // ... existing quizzes ...
    {
        id: 'new-domain-quiz',
    }
];
```

### File Structure
```
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   ├── game.js
│   └── login-ui.js
├── frontend/
│   ├── pages/
│   ├── quizzes/
│   ├── components/
│   ├── scripts/
│   ├── styles/
│   ├── assets/
│   ├── index.html
│   ├── login.html
│   ├── admin.js
│   ├── api-service.js
│   ├── auth.js
│   ├── QuizUser.js
│   ├── quiz-helper.js
│   ├── login.js
│   ├── config.js
│   └── styles.css
├── docs/
├── .env
├── .env.example
└── package.json
```

### API Endpoints

#### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/admin/login` - Admin login
- POST `/api/auth/logout` - Logout user

#### Quiz Operations
- GET `/api/quiz/all` - Fetch all quizzes
- POST `/api/quiz/submit` - Submit quiz answers
- GET `/api/quiz/results/:userId` - Get user results

#### Admin Operations
- GET `/api/admin/users` - Get all users
- GET `/api/admin/analytics` - Get quiz analytics
- PUT `/api/admin/quiz/:quizId` - Update quiz content

### Security Features
- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- XSS prevention
- Environment variable protection
- Secure session management

## Development Setup

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the backend server:
```bash
cd backend
npm run dev
```

4. Start the frontend development server:
```bash
cd frontend
npm run dev
```

5. Access the application:
- Main application: http://localhost:8080
- Admin dashboard: http://localhost:8080/admin.html

## Contributing 🤝

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License 📄

[MIT License](LICENSE)

